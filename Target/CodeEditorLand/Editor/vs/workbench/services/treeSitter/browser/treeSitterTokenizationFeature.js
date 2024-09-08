var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableMap,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import {
  FileAccess
} from "../../../../base/common/network.js";
import {
  FontStyle,
  MetadataConsts
} from "../../../../editor/common/encodedTokenAttributes.js";
import {
  LazyTokenizationSupport,
  TreeSitterTokenizationRegistry
} from "../../../../editor/common/languages.js";
import {
  EDITOR_EXPERIMENTAL_PREFER_TREESITTER,
  ITreeSitterParserService
} from "../../../../editor/common/services/treeSitterParserService.js";
import { ColumnRange } from "../../../../editor/contrib/inlineCompletions/browser/utils.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  IInstantiationService,
  createDecorator
} from "../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
const ALLOWED_SUPPORT = ["typescript"];
const ITreeSitterTokenizationFeature = createDecorator(
  "treeSitterTokenizationFeature"
);
let TreeSitterTokenizationFeature = class extends Disposable {
  constructor(_configurationService, _instantiationService, _fileService) {
    super();
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._fileService = _fileService;
    this._handleGrammarsExtPoint();
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(EDITOR_EXPERIMENTAL_PREFER_TREESITTER)) {
        this._handleGrammarsExtPoint();
      }
    }));
  }
  _serviceBrand;
  _tokenizersRegistrations = new DisposableMap();
  _getSetting() {
    return this._configurationService.getValue(
      EDITOR_EXPERIMENTAL_PREFER_TREESITTER
    ) || [];
  }
  _handleGrammarsExtPoint() {
    const setting = this._getSetting();
    for (const languageId of setting) {
      if (ALLOWED_SUPPORT.includes(languageId) && !this._tokenizersRegistrations.has(languageId)) {
        const lazyTokenizationSupport = new LazyTokenizationSupport(
          () => this._createTokenizationSupport(languageId)
        );
        const disposableStore = new DisposableStore();
        disposableStore.add(lazyTokenizationSupport);
        disposableStore.add(
          TreeSitterTokenizationRegistry.registerFactory(
            languageId,
            lazyTokenizationSupport
          )
        );
        this._tokenizersRegistrations.set(languageId, disposableStore);
        TreeSitterTokenizationRegistry.getOrCreate(languageId);
      }
    }
    const languagesToUnregister = [
      ...this._tokenizersRegistrations.keys()
    ].filter((languageId) => !setting.includes(languageId));
    for (const languageId of languagesToUnregister) {
      this._tokenizersRegistrations.deleteAndDispose(languageId);
    }
  }
  async _fetchQueries(newLanguage) {
    const languageLocation = `vs/editor/common/languages/highlights/${newLanguage}.scm`;
    const query = await this._fileService.readFile(
      FileAccess.asFileUri(languageLocation)
    );
    return query.value.toString();
  }
  async _createTokenizationSupport(languageId) {
    const queries = await this._fetchQueries(languageId);
    return this._instantiationService.createInstance(
      TreeSitterTokenizationSupport,
      queries,
      languageId
    );
  }
};
TreeSitterTokenizationFeature = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IFileService)
], TreeSitterTokenizationFeature);
let TreeSitterTokenizationSupport = class extends Disposable {
  constructor(_queries, _languageId, _treeSitterService, _themeService) {
    super();
    this._queries = _queries;
    this._languageId = _languageId;
    this._treeSitterService = _treeSitterService;
    this._themeService = _themeService;
    this._register(Event.runAndSubscribe(this._themeService.onDidColorThemeChange, () => this.reset()));
  }
  _query;
  _onDidChangeTokens = new Emitter();
  onDidChangeTokens = this._onDidChangeTokens.event;
  _colorThemeData;
  _languageAddedListener;
  _getTree(textModel) {
    return this._treeSitterService.getParseResult(textModel);
  }
  _ensureQuery() {
    if (!this._query) {
      const language = this._treeSitterService.getOrInitLanguage(
        this._languageId
      );
      if (!language) {
        if (!this._languageAddedListener) {
          this._languageAddedListener = this._register(
            Event.onceIf(
              this._treeSitterService.onDidAddLanguage,
              (e) => e.id === this._languageId
            )((e) => {
              this._query = e.language.query(this._queries);
            })
          );
        }
        return;
      }
      this._query = language.query(this._queries);
    }
    return this._query;
  }
  reset() {
    this._colorThemeData = this._themeService.getColorTheme();
  }
  captureAtPosition(lineNumber, column, textModel) {
    const captures = this._captureAtRange(
      lineNumber,
      new ColumnRange(column, column),
      textModel
    );
    return captures;
  }
  _captureAtRange(lineNumber, columnRange, textModel) {
    const tree = this._getTree(textModel);
    const query = this._ensureQuery();
    if (!tree?.tree || !query) {
      return [];
    }
    return query.captures(tree.tree.rootNode, {
      startPosition: {
        row: lineNumber - 1,
        column: columnRange.startColumn - 1
      },
      endPosition: {
        row: lineNumber - 1,
        column: columnRange.endColumnExclusive
      }
    });
  }
  /**
   * Gets the tokens for a given line.
   * Each token takes 2 elements in the array. The first element is the offset of the end of the token *in the line, not in the document*, and the second element is the metadata.
   *
   * @param lineNumber
   * @returns
   */
  tokenizeEncoded(lineNumber, textModel) {
    const lineLength = textModel.getLineMaxColumn(lineNumber);
    const captures = this._captureAtRange(
      lineNumber,
      new ColumnRange(1, lineLength),
      textModel
    );
    if (captures.length === 0) {
      return void 0;
    }
    let tokens = new Uint32Array(captures.length * 2);
    let tokenIndex = 0;
    const lineStartOffset = textModel.getOffsetAt({
      lineNumber,
      column: 1
    });
    for (let captureIndex = 0; captureIndex < captures.length; captureIndex++) {
      const capture = captures[captureIndex];
      const metadata = this.findMetadata(capture.name);
      const tokenEndIndex = capture.node.endIndex < lineStartOffset + lineLength ? capture.node.endIndex : lineStartOffset + lineLength;
      const tokenStartIndex = capture.node.startIndex < lineStartOffset ? lineStartOffset : capture.node.startIndex;
      const lineRelativeOffset = tokenEndIndex - lineStartOffset;
      let previousTokenEnd;
      const currentTokenLength = tokenEndIndex - tokenStartIndex;
      if (captureIndex > 0) {
        previousTokenEnd = tokens[(tokenIndex - 1) * 2];
      } else {
        previousTokenEnd = tokenStartIndex - lineStartOffset - 1;
      }
      const intermediateTokenOffset = lineRelativeOffset - currentTokenLength;
      if (previousTokenEnd < intermediateTokenOffset) {
        tokens[tokenIndex * 2] = intermediateTokenOffset;
        tokens[tokenIndex * 2 + 1] = 0;
        tokenIndex++;
        const newTokens = new Uint32Array(tokens.length + 2);
        newTokens.set(tokens);
        tokens = newTokens;
      }
      tokens[tokenIndex * 2] = lineRelativeOffset;
      tokens[tokenIndex * 2 + 1] = metadata;
      tokenIndex++;
    }
    if (captures[captures.length - 1].node.endPosition.column + 1 < lineLength) {
      const newTokens = new Uint32Array(tokens.length + 2);
      newTokens.set(tokens);
      tokens = newTokens;
      tokens[tokenIndex * 2] = lineLength;
      tokens[tokenIndex * 2 + 1] = 0;
    }
    return tokens;
  }
  findMetadata(captureName) {
    const tokenStyle = this._colorThemeData.resolveScopes([[captureName]]);
    if (!tokenStyle) {
      return 0;
    }
    let metadata = 0;
    if (typeof tokenStyle.italic !== "undefined") {
      const italicBit = tokenStyle.italic ? FontStyle.Italic : 0;
      metadata |= italicBit | MetadataConsts.ITALIC_MASK;
    }
    if (typeof tokenStyle.bold !== "undefined") {
      const boldBit = tokenStyle.bold ? FontStyle.Bold : 0;
      metadata |= boldBit | MetadataConsts.BOLD_MASK;
    }
    if (typeof tokenStyle.underline !== "undefined") {
      const underlineBit = tokenStyle.underline ? FontStyle.Underline : 0;
      metadata |= underlineBit | MetadataConsts.UNDERLINE_MASK;
    }
    if (typeof tokenStyle.strikethrough !== "undefined") {
      const strikethroughBit = tokenStyle.strikethrough ? FontStyle.Strikethrough : 0;
      metadata |= strikethroughBit | MetadataConsts.STRIKETHROUGH_MASK;
    }
    if (tokenStyle.foreground) {
      const tokenStyleForeground = this._colorThemeData.getTokenColorIndex().get(tokenStyle?.foreground);
      const foregroundBits = tokenStyleForeground << MetadataConsts.FOREGROUND_OFFSET;
      metadata |= foregroundBits;
    }
    return metadata;
  }
  dispose() {
    super.dispose();
    this._query?.delete();
    this._query = void 0;
  }
};
TreeSitterTokenizationSupport = __decorateClass([
  __decorateParam(2, ITreeSitterParserService),
  __decorateParam(3, IThemeService)
], TreeSitterTokenizationSupport);
registerSingleton(
  ITreeSitterTokenizationFeature,
  TreeSitterTokenizationFeature,
  InstantiationType.Eager
);
export {
  ITreeSitterTokenizationFeature
};
