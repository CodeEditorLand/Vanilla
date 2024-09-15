var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import "./inspectEditorTokens.css";
import * as nls from "../../../../../nls.js";
import * as dom from "../../../../../base/browser/dom.js";
import { CharCode } from "../../../../../base/common/charCode.js";
import { Color } from "../../../../../base/common/color.js";
import { KeyCode } from "../../../../../base/common/keyCodes.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ContentWidgetPositionPreference, IActiveCodeEditor, ICodeEditor, IContentWidget, IContentWidgetPosition } from "../../../../../editor/browser/editorBrowser.js";
import { EditorAction, ServicesAccessor, registerEditorAction, registerEditorContribution, EditorContributionInstantiation } from "../../../../../editor/browser/editorExtensions.js";
import { Position } from "../../../../../editor/common/core/position.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { IEditorContribution } from "../../../../../editor/common/editorCommon.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { SemanticTokensLegend, SemanticTokens, TreeSitterTokenizationRegistry } from "../../../../../editor/common/languages.js";
import { FontStyle, ColorId, StandardTokenType, TokenMetadata } from "../../../../../editor/common/encodedTokenAttributes.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { findMatchingThemeRule } from "../../../../services/textMate/common/TMHelper.js";
import { ITextMateTokenizationService } from "../../../../services/textMate/browser/textMateTokenizationFeature.js";
import { IWorkbenchThemeService } from "../../../../services/themes/common/workbenchThemeService.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { ColorThemeData, TokenStyleDefinitions, TokenStyleDefinition, TextMateThemingRuleDefinitions } from "../../../../services/themes/common/colorThemeData.js";
import { SemanticTokenRule, TokenStyleData, TokenStyle } from "../../../../../platform/theme/common/tokenClassificationRegistry.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { SEMANTIC_HIGHLIGHTING_SETTING_ID, IEditorSemanticHighlightingOptions } from "../../../../../editor/contrib/semanticTokens/common/semanticTokensConfig.js";
import { Schemas } from "../../../../../base/common/network.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { ITreeSitterParserService } from "../../../../../editor/common/services/treeSitterParserService.js";
const $ = dom.$;
let InspectEditorTokensController = class extends Disposable {
  static {
    __name(this, "InspectEditorTokensController");
  }
  static ID = "editor.contrib.inspectEditorTokens";
  static get(editor) {
    return editor.getContribution(InspectEditorTokensController.ID);
  }
  _editor;
  _textMateService;
  _treeSitterService;
  _themeService;
  _languageService;
  _notificationService;
  _configurationService;
  _languageFeaturesService;
  _widget;
  constructor(editor, textMateService, treeSitterService, languageService, themeService, notificationService, configurationService, languageFeaturesService) {
    super();
    this._editor = editor;
    this._textMateService = textMateService;
    this._treeSitterService = treeSitterService;
    this._themeService = themeService;
    this._languageService = languageService;
    this._notificationService = notificationService;
    this._configurationService = configurationService;
    this._languageFeaturesService = languageFeaturesService;
    this._widget = null;
    this._register(this._editor.onDidChangeModel((e) => this.stop()));
    this._register(this._editor.onDidChangeModelLanguage((e) => this.stop()));
    this._register(this._editor.onKeyUp((e) => e.keyCode === KeyCode.Escape && this.stop()));
  }
  dispose() {
    this.stop();
    super.dispose();
  }
  launch() {
    if (this._widget) {
      return;
    }
    if (!this._editor.hasModel()) {
      return;
    }
    if (this._editor.getModel().uri.scheme === Schemas.vscodeNotebookCell) {
      return;
    }
    this._widget = new InspectEditorTokensWidget(this._editor, this._textMateService, this._treeSitterService, this._languageService, this._themeService, this._notificationService, this._configurationService, this._languageFeaturesService);
  }
  stop() {
    if (this._widget) {
      this._widget.dispose();
      this._widget = null;
    }
  }
  toggle() {
    if (!this._widget) {
      this.launch();
    } else {
      this.stop();
    }
  }
};
InspectEditorTokensController = __decorateClass([
  __decorateParam(1, ITextMateTokenizationService),
  __decorateParam(2, ITreeSitterParserService),
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IWorkbenchThemeService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ILanguageFeaturesService)
], InspectEditorTokensController);
class InspectEditorTokens extends EditorAction {
  static {
    __name(this, "InspectEditorTokens");
  }
  constructor() {
    super({
      id: "editor.action.inspectTMScopes",
      label: nls.localize("inspectEditorTokens", "Developer: Inspect Editor Tokens and Scopes"),
      alias: "Developer: Inspect Editor Tokens and Scopes",
      precondition: void 0
    });
  }
  run(accessor, editor) {
    const controller = InspectEditorTokensController.get(editor);
    controller?.toggle();
  }
}
function renderTokenText(tokenText) {
  if (tokenText.length > 40) {
    tokenText = tokenText.substr(0, 20) + "\u2026" + tokenText.substr(tokenText.length - 20);
  }
  let result = "";
  for (let charIndex = 0, len = tokenText.length; charIndex < len; charIndex++) {
    const charCode = tokenText.charCodeAt(charIndex);
    switch (charCode) {
      case CharCode.Tab:
        result += "\u2192";
        break;
      case CharCode.Space:
        result += "\xB7";
        break;
      default:
        result += String.fromCharCode(charCode);
    }
  }
  return result;
}
__name(renderTokenText, "renderTokenText");
class InspectEditorTokensWidget extends Disposable {
  static {
    __name(this, "InspectEditorTokensWidget");
  }
  static _ID = "editor.contrib.inspectEditorTokensWidget";
  // Editor.IContentWidget.allowEditorOverflow
  allowEditorOverflow = true;
  _isDisposed;
  _editor;
  _languageService;
  _themeService;
  _textMateService;
  _treeSitterService;
  _notificationService;
  _configurationService;
  _languageFeaturesService;
  _model;
  _domNode;
  _currentRequestCancellationTokenSource;
  constructor(editor, textMateService, treeSitterService, languageService, themeService, notificationService, configurationService, languageFeaturesService) {
    super();
    this._isDisposed = false;
    this._editor = editor;
    this._languageService = languageService;
    this._themeService = themeService;
    this._textMateService = textMateService;
    this._treeSitterService = treeSitterService;
    this._notificationService = notificationService;
    this._configurationService = configurationService;
    this._languageFeaturesService = languageFeaturesService;
    this._model = this._editor.getModel();
    this._domNode = document.createElement("div");
    this._domNode.className = "token-inspect-widget";
    this._currentRequestCancellationTokenSource = new CancellationTokenSource();
    this._beginCompute(this._editor.getPosition());
    this._register(this._editor.onDidChangeCursorPosition((e) => this._beginCompute(this._editor.getPosition())));
    this._register(themeService.onDidColorThemeChange((_) => this._beginCompute(this._editor.getPosition())));
    this._register(configurationService.onDidChangeConfiguration((e) => e.affectsConfiguration("editor.semanticHighlighting.enabled") && this._beginCompute(this._editor.getPosition())));
    this._editor.addContentWidget(this);
  }
  dispose() {
    this._isDisposed = true;
    this._editor.removeContentWidget(this);
    this._currentRequestCancellationTokenSource.cancel();
    super.dispose();
  }
  getId() {
    return InspectEditorTokensWidget._ID;
  }
  _beginCompute(position) {
    const grammar = this._textMateService.createTokenizer(this._model.getLanguageId());
    const semanticTokens = this._computeSemanticTokens(position);
    const tree = this._treeSitterService.getParseResult(this._model);
    dom.clearNode(this._domNode);
    this._domNode.appendChild(document.createTextNode(nls.localize("inspectTMScopesWidget.loading", "Loading...")));
    Promise.all([grammar, semanticTokens]).then(([grammar2, semanticTokens2]) => {
      if (this._isDisposed) {
        return;
      }
      this._compute(grammar2, semanticTokens2, tree?.tree, position);
      this._domNode.style.maxWidth = `${Math.max(this._editor.getLayoutInfo().width * 0.66, 500)}px`;
      this._editor.layoutContentWidget(this);
    }, (err) => {
      this._notificationService.warn(err);
      setTimeout(() => {
        InspectEditorTokensController.get(this._editor)?.stop();
      });
    });
  }
  _isSemanticColoringEnabled() {
    const setting = this._configurationService.getValue(SEMANTIC_HIGHLIGHTING_SETTING_ID, { overrideIdentifier: this._model.getLanguageId(), resource: this._model.uri })?.enabled;
    if (typeof setting === "boolean") {
      return setting;
    }
    return this._themeService.getColorTheme().semanticHighlighting;
  }
  _compute(grammar, semanticTokens, tree, position) {
    const textMateTokenInfo = grammar && this._getTokensAtPosition(grammar, position);
    const semanticTokenInfo = semanticTokens && this._getSemanticTokenAtPosition(semanticTokens, position);
    const treeSitterTokenInfo = tree && this._getTreeSitterTokenAtPosition(tree, position);
    if (!textMateTokenInfo && !semanticTokenInfo && !treeSitterTokenInfo) {
      dom.reset(this._domNode, "No grammar or semantic tokens available.");
      return;
    }
    const tmMetadata = textMateTokenInfo?.metadata;
    const semMetadata = semanticTokenInfo?.metadata;
    const semTokenText = semanticTokenInfo && renderTokenText(this._model.getValueInRange(semanticTokenInfo.range));
    const tmTokenText = textMateTokenInfo && renderTokenText(this._model.getLineContent(position.lineNumber).substring(textMateTokenInfo.token.startIndex, textMateTokenInfo.token.endIndex));
    const tokenText = semTokenText || tmTokenText || "";
    dom.reset(
      this._domNode,
      $(
        "h2.tiw-token",
        void 0,
        tokenText,
        $("span.tiw-token-length", void 0, `${tokenText.length} ${tokenText.length === 1 ? "char" : "chars"}`)
      )
    );
    dom.append(this._domNode, $("hr.tiw-metadata-separator", { "style": "clear:both" }));
    dom.append(this._domNode, $(
      "table.tiw-metadata-table",
      void 0,
      $(
        "tbody",
        void 0,
        $(
          "tr",
          void 0,
          $("td.tiw-metadata-key", void 0, "language"),
          $("td.tiw-metadata-value", void 0, tmMetadata?.languageId || "")
        ),
        $(
          "tr",
          void 0,
          $("td.tiw-metadata-key", void 0, "standard token type"),
          $("td.tiw-metadata-value", void 0, this._tokenTypeToString(tmMetadata?.tokenType || StandardTokenType.Other))
        ),
        ...this._formatMetadata(semMetadata, tmMetadata)
      )
    ));
    if (semanticTokenInfo) {
      dom.append(this._domNode, $("hr.tiw-metadata-separator"));
      const table = dom.append(this._domNode, $("table.tiw-metadata-table", void 0));
      const tbody = dom.append(table, $(
        "tbody",
        void 0,
        $(
          "tr",
          void 0,
          $("td.tiw-metadata-key", void 0, "semantic token type"),
          $("td.tiw-metadata-value", void 0, semanticTokenInfo.type)
        )
      ));
      if (semanticTokenInfo.modifiers.length) {
        dom.append(tbody, $(
          "tr",
          void 0,
          $("td.tiw-metadata-key", void 0, "modifiers"),
          $("td.tiw-metadata-value", void 0, semanticTokenInfo.modifiers.join(" "))
        ));
      }
      if (semanticTokenInfo.metadata) {
        const properties = ["foreground", "bold", "italic", "underline", "strikethrough"];
        const propertiesByDefValue = {};
        const allDefValues = new Array();
        for (const property of properties) {
          if (semanticTokenInfo.metadata[property] !== void 0) {
            const definition = semanticTokenInfo.definitions[property];
            const defValue = this._renderTokenStyleDefinition(definition, property);
            const defValueStr = defValue.map((el) => dom.isHTMLElement(el) ? el.outerHTML : el).join();
            let properties2 = propertiesByDefValue[defValueStr];
            if (!properties2) {
              propertiesByDefValue[defValueStr] = properties2 = [];
              allDefValues.push([defValue, defValueStr]);
            }
            properties2.push(property);
          }
        }
        for (const [defValue, defValueStr] of allDefValues) {
          dom.append(tbody, $(
            "tr",
            void 0,
            $("td.tiw-metadata-key", void 0, propertiesByDefValue[defValueStr].join(", ")),
            $("td.tiw-metadata-value", void 0, ...defValue)
          ));
        }
      }
    }
    if (textMateTokenInfo) {
      const theme = this._themeService.getColorTheme();
      dom.append(this._domNode, $("hr.tiw-metadata-separator"));
      const table = dom.append(this._domNode, $("table.tiw-metadata-table"));
      const tbody = dom.append(table, $("tbody"));
      if (tmTokenText && tmTokenText !== tokenText) {
        dom.append(tbody, $(
          "tr",
          void 0,
          $("td.tiw-metadata-key", void 0, "textmate token"),
          $("td.tiw-metadata-value", void 0, `${tmTokenText} (${tmTokenText.length})`)
        ));
      }
      const scopes = new Array();
      for (let i = textMateTokenInfo.token.scopes.length - 1; i >= 0; i--) {
        scopes.push(textMateTokenInfo.token.scopes[i]);
        if (i > 0) {
          scopes.push($("br"));
        }
      }
      dom.append(tbody, $(
        "tr",
        void 0,
        $("td.tiw-metadata-key", void 0, "textmate scopes"),
        $("td.tiw-metadata-value.tiw-metadata-scopes", void 0, ...scopes)
      ));
      const matchingRule = findMatchingThemeRule(theme, textMateTokenInfo.token.scopes, false);
      const semForeground = semanticTokenInfo?.metadata?.foreground;
      if (matchingRule) {
        if (semForeground !== textMateTokenInfo.metadata.foreground) {
          let defValue = $(
            "code.tiw-theme-selector",
            void 0,
            matchingRule.rawSelector,
            $("br"),
            JSON.stringify(matchingRule.settings, null, "	")
          );
          if (semForeground) {
            defValue = $("s", void 0, defValue);
          }
          dom.append(tbody, $(
            "tr",
            void 0,
            $("td.tiw-metadata-key", void 0, "foreground"),
            $("td.tiw-metadata-value", void 0, defValue)
          ));
        }
      } else if (!semForeground) {
        dom.append(tbody, $(
          "tr",
          void 0,
          $("td.tiw-metadata-key", void 0, "foreground"),
          $("td.tiw-metadata-value", void 0, "No theme selector")
        ));
      }
    }
    if (treeSitterTokenInfo) {
      dom.append(this._domNode, $("hr.tiw-metadata-separator"));
      const table = dom.append(this._domNode, $("table.tiw-metadata-table"));
      const tbody = dom.append(table, $("tbody"));
      dom.append(tbody, $(
        "tr",
        void 0,
        $("td.tiw-metadata-key", void 0, "tree-sitter token"),
        $("td.tiw-metadata-value", void 0, `${treeSitterTokenInfo.text}`)
      ));
      const scopes = new Array();
      let node = treeSitterTokenInfo;
      while (node.parent) {
        scopes.push(node.type);
        node = node.parent;
        if (node) {
          scopes.push($("br"));
        }
      }
      dom.append(tbody, $(
        "tr",
        void 0,
        $("td.tiw-metadata-key", void 0, "tree-sitter scopes"),
        $("td.tiw-metadata-value.tiw-metadata-scopes", void 0, ...scopes)
      ));
      const tokenizationSupport = TreeSitterTokenizationRegistry.get(this._model.getLanguageId());
      const captures = tokenizationSupport?.captureAtPosition(position.lineNumber, position.column, this._model);
      if (captures && captures.length > 0) {
        dom.append(tbody, $(
          "tr",
          void 0,
          $("td.tiw-metadata-key", void 0, "foreground"),
          $("td.tiw-metadata-value", void 0, captures[captures.length - 1].name)
        ));
      }
    }
  }
  _formatMetadata(semantic, tm) {
    const elements = new Array();
    function render(property) {
      const value = semantic?.[property] || tm?.[property];
      if (value !== void 0) {
        const semanticStyle = semantic?.[property] ? "tiw-metadata-semantic" : "";
        elements.push($(
          "tr",
          void 0,
          $("td.tiw-metadata-key", void 0, property),
          $(`td.tiw-metadata-value.${semanticStyle}`, void 0, value)
        ));
      }
      return value;
    }
    __name(render, "render");
    const foreground = render("foreground");
    const background = render("background");
    if (foreground && background) {
      const backgroundColor = Color.fromHex(background), foregroundColor = Color.fromHex(foreground);
      if (backgroundColor.isOpaque()) {
        elements.push($(
          "tr",
          void 0,
          $("td.tiw-metadata-key", void 0, "contrast ratio"),
          $("td.tiw-metadata-value", void 0, backgroundColor.getContrastRatio(foregroundColor.makeOpaque(backgroundColor)).toFixed(2))
        ));
      } else {
        elements.push($(
          "tr",
          void 0,
          $("td.tiw-metadata-key", void 0, "Contrast ratio cannot be precise for background colors that use transparency"),
          $("td.tiw-metadata-value")
        ));
      }
    }
    const fontStyleLabels = new Array();
    function addStyle(key) {
      let label;
      if (semantic && semantic[key]) {
        label = $("span.tiw-metadata-semantic", void 0, key);
      } else if (tm && tm[key]) {
        label = key;
      }
      if (label) {
        if (fontStyleLabels.length) {
          fontStyleLabels.push(" ");
        }
        fontStyleLabels.push(label);
      }
    }
    __name(addStyle, "addStyle");
    addStyle("bold");
    addStyle("italic");
    addStyle("underline");
    addStyle("strikethrough");
    if (fontStyleLabels.length) {
      elements.push($(
        "tr",
        void 0,
        $("td.tiw-metadata-key", void 0, "font style"),
        $("td.tiw-metadata-value", void 0, ...fontStyleLabels)
      ));
    }
    return elements;
  }
  _decodeMetadata(metadata) {
    const colorMap = this._themeService.getColorTheme().tokenColorMap;
    const languageId = TokenMetadata.getLanguageId(metadata);
    const tokenType = TokenMetadata.getTokenType(metadata);
    const fontStyle = TokenMetadata.getFontStyle(metadata);
    const foreground = TokenMetadata.getForeground(metadata);
    const background = TokenMetadata.getBackground(metadata);
    return {
      languageId: this._languageService.languageIdCodec.decodeLanguageId(languageId),
      tokenType,
      bold: fontStyle & FontStyle.Bold ? true : void 0,
      italic: fontStyle & FontStyle.Italic ? true : void 0,
      underline: fontStyle & FontStyle.Underline ? true : void 0,
      strikethrough: fontStyle & FontStyle.Strikethrough ? true : void 0,
      foreground: colorMap[foreground],
      background: colorMap[background]
    };
  }
  _tokenTypeToString(tokenType) {
    switch (tokenType) {
      case StandardTokenType.Other:
        return "Other";
      case StandardTokenType.Comment:
        return "Comment";
      case StandardTokenType.String:
        return "String";
      case StandardTokenType.RegEx:
        return "RegEx";
      default:
        return "??";
    }
  }
  _getTokensAtPosition(grammar, position) {
    const lineNumber = position.lineNumber;
    const stateBeforeLine = this._getStateBeforeLine(grammar, lineNumber);
    const tokenizationResult1 = grammar.tokenizeLine(this._model.getLineContent(lineNumber), stateBeforeLine);
    const tokenizationResult2 = grammar.tokenizeLine2(this._model.getLineContent(lineNumber), stateBeforeLine);
    let token1Index = 0;
    for (let i = tokenizationResult1.tokens.length - 1; i >= 0; i--) {
      const t = tokenizationResult1.tokens[i];
      if (position.column - 1 >= t.startIndex) {
        token1Index = i;
        break;
      }
    }
    let token2Index = 0;
    for (let i = tokenizationResult2.tokens.length >>> 1; i >= 0; i--) {
      if (position.column - 1 >= tokenizationResult2.tokens[i << 1]) {
        token2Index = i;
        break;
      }
    }
    return {
      token: tokenizationResult1.tokens[token1Index],
      metadata: this._decodeMetadata(tokenizationResult2.tokens[(token2Index << 1) + 1])
    };
  }
  _getStateBeforeLine(grammar, lineNumber) {
    let state = null;
    for (let i = 1; i < lineNumber; i++) {
      const tokenizationResult = grammar.tokenizeLine(this._model.getLineContent(i), state);
      state = tokenizationResult.ruleStack;
    }
    return state;
  }
  isSemanticTokens(token) {
    return token && token.data;
  }
  async _computeSemanticTokens(position) {
    if (!this._isSemanticColoringEnabled()) {
      return null;
    }
    const tokenProviders = this._languageFeaturesService.documentSemanticTokensProvider.ordered(this._model);
    if (tokenProviders.length) {
      const provider = tokenProviders[0];
      const tokens = await Promise.resolve(provider.provideDocumentSemanticTokens(this._model, null, this._currentRequestCancellationTokenSource.token));
      if (this.isSemanticTokens(tokens)) {
        return { tokens, legend: provider.getLegend() };
      }
    }
    const rangeTokenProviders = this._languageFeaturesService.documentRangeSemanticTokensProvider.ordered(this._model);
    if (rangeTokenProviders.length) {
      const provider = rangeTokenProviders[0];
      const lineNumber = position.lineNumber;
      const range = new Range(lineNumber, 1, lineNumber, this._model.getLineMaxColumn(lineNumber));
      const tokens = await Promise.resolve(provider.provideDocumentRangeSemanticTokens(this._model, range, this._currentRequestCancellationTokenSource.token));
      if (this.isSemanticTokens(tokens)) {
        return { tokens, legend: provider.getLegend() };
      }
    }
    return null;
  }
  _getSemanticTokenAtPosition(semanticTokens, pos) {
    const tokenData = semanticTokens.tokens.data;
    const defaultLanguage = this._model.getLanguageId();
    let lastLine = 0;
    let lastCharacter = 0;
    const posLine = pos.lineNumber - 1, posCharacter = pos.column - 1;
    for (let i = 0; i < tokenData.length; i += 5) {
      const lineDelta = tokenData[i], charDelta = tokenData[i + 1], len = tokenData[i + 2], typeIdx = tokenData[i + 3], modSet = tokenData[i + 4];
      const line = lastLine + lineDelta;
      const character = lineDelta === 0 ? lastCharacter + charDelta : charDelta;
      if (posLine === line && character <= posCharacter && posCharacter < character + len) {
        const type = semanticTokens.legend.tokenTypes[typeIdx] || "not in legend (ignored)";
        const modifiers = [];
        let modifierSet = modSet;
        for (let modifierIndex = 0; modifierSet > 0 && modifierIndex < semanticTokens.legend.tokenModifiers.length; modifierIndex++) {
          if (modifierSet & 1) {
            modifiers.push(semanticTokens.legend.tokenModifiers[modifierIndex]);
          }
          modifierSet = modifierSet >> 1;
        }
        if (modifierSet > 0) {
          modifiers.push("not in legend (ignored)");
        }
        const range = new Range(line + 1, character + 1, line + 1, character + 1 + len);
        const definitions = {};
        const colorMap = this._themeService.getColorTheme().tokenColorMap;
        const theme = this._themeService.getColorTheme();
        const tokenStyle = theme.getTokenStyleMetadata(type, modifiers, defaultLanguage, true, definitions);
        let metadata = void 0;
        if (tokenStyle) {
          metadata = {
            languageId: void 0,
            tokenType: StandardTokenType.Other,
            bold: tokenStyle?.bold,
            italic: tokenStyle?.italic,
            underline: tokenStyle?.underline,
            strikethrough: tokenStyle?.strikethrough,
            foreground: colorMap[tokenStyle?.foreground || ColorId.None],
            background: void 0
          };
        }
        return { type, modifiers, range, metadata, definitions };
      }
      lastLine = line;
      lastCharacter = character;
    }
    return null;
  }
  _walkTreeforPosition(cursor, pos) {
    const offset = this._model.getOffsetAt(pos);
    cursor.gotoFirstChild();
    let goChild = false;
    let lastGoodNode = null;
    do {
      if (cursor.currentNode.startIndex <= offset && offset < cursor.currentNode.endIndex) {
        goChild = true;
        lastGoodNode = cursor.currentNode;
      } else {
        goChild = false;
      }
    } while (goChild ? cursor.gotoFirstChild() : cursor.gotoNextSibling());
    return lastGoodNode;
  }
  _getTreeSitterTokenAtPosition(tree, pos) {
    const cursor = tree.walk();
    return this._walkTreeforPosition(cursor, pos);
  }
  _renderTokenStyleDefinition(definition, property) {
    const elements = new Array();
    if (definition === void 0) {
      return elements;
    }
    const theme = this._themeService.getColorTheme();
    if (Array.isArray(definition)) {
      const scopesDefinition = {};
      theme.resolveScopes(definition, scopesDefinition);
      const matchingRule = scopesDefinition[property];
      if (matchingRule && scopesDefinition.scope) {
        const scopes = $("ul.tiw-metadata-values");
        const strScopes = Array.isArray(matchingRule.scope) ? matchingRule.scope : [String(matchingRule.scope)];
        for (const strScope of strScopes) {
          scopes.appendChild($("li.tiw-metadata-value.tiw-metadata-scopes", void 0, strScope));
        }
        elements.push(
          scopesDefinition.scope.join(" "),
          scopes,
          $("code.tiw-theme-selector", void 0, JSON.stringify(matchingRule.settings, null, "	"))
        );
        return elements;
      }
      return elements;
    } else if (SemanticTokenRule.is(definition)) {
      const scope = theme.getTokenStylingRuleScope(definition);
      if (scope === "setting") {
        elements.push(`User settings: ${definition.selector.id} - ${this._renderStyleProperty(definition.style, property)}`);
        return elements;
      } else if (scope === "theme") {
        elements.push(`Color theme: ${definition.selector.id} - ${this._renderStyleProperty(definition.style, property)}`);
        return elements;
      }
      return elements;
    } else {
      const style = theme.resolveTokenStyleValue(definition);
      elements.push(`Default: ${style ? this._renderStyleProperty(style, property) : ""}`);
      return elements;
    }
  }
  _renderStyleProperty(style, property) {
    switch (property) {
      case "foreground":
        return style.foreground ? Color.Format.CSS.formatHexA(style.foreground, true) : "";
      default:
        return style[property] !== void 0 ? String(style[property]) : "";
    }
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return {
      position: this._editor.getPosition(),
      preference: [ContentWidgetPositionPreference.BELOW, ContentWidgetPositionPreference.ABOVE]
    };
  }
}
registerEditorContribution(InspectEditorTokensController.ID, InspectEditorTokensController, EditorContributionInstantiation.Lazy);
registerEditorAction(InspectEditorTokens);
export {
  InspectEditorTokensController
};
//# sourceMappingURL=inspectEditorTokens.js.map
