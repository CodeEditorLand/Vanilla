var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ILanguageIdCodec, ITreeSitterTokenizationSupport, TreeSitterTokenizationRegistry } from "../languages.js";
import { LineTokens } from "../tokens/lineTokens.js";
import { StandardTokenType } from "../encodedTokenAttributes.js";
import { TextModel } from "./textModel.js";
import { ITreeSitterParserService } from "../services/treeSitterParserService.js";
import { IModelContentChangedEvent } from "../textModelEvents.js";
import { AbstractTokens } from "./tokens.js";
import { ITokenizeLineWithEditResult, LineEditWithAdditionalLines } from "../tokenizationTextModelPart.js";
class TreeSitterTokens extends AbstractTokens {
  constructor(_treeSitterService, languageIdCodec, textModel, languageId) {
    super(languageIdCodec, textModel, languageId);
    this._treeSitterService = _treeSitterService;
    this._initialize();
  }
  static {
    __name(this, "TreeSitterTokens");
  }
  _tokenizationSupport = null;
  _lastLanguageId;
  _initialize() {
    const newLanguage = this.getLanguageId();
    if (!this._tokenizationSupport || this._lastLanguageId !== newLanguage) {
      this._lastLanguageId = newLanguage;
      this._tokenizationSupport = TreeSitterTokenizationRegistry.get(newLanguage);
    }
  }
  getLineTokens(lineNumber) {
    const content = this._textModel.getLineContent(lineNumber);
    if (this._tokenizationSupport) {
      const rawTokens = this._tokenizationSupport.tokenizeEncoded(lineNumber, this._textModel);
      if (rawTokens) {
        return new LineTokens(rawTokens, content, this._languageIdCodec);
      }
    }
    return LineTokens.createEmpty(content, this._languageIdCodec);
  }
  resetTokenization(fireTokenChangeEvent = true) {
    if (fireTokenChangeEvent) {
      this._onDidChangeTokens.fire({
        semanticTokensApplied: false,
        ranges: [
          {
            fromLineNumber: 1,
            toLineNumber: this._textModel.getLineCount()
          }
        ]
      });
    }
    this._initialize();
  }
  handleDidChangeAttached() {
  }
  handleDidChangeContent(e) {
    if (e.isFlush) {
      this.resetTokenization(false);
    }
  }
  forceTokenization(lineNumber) {
  }
  hasAccurateTokensForLine(lineNumber) {
    return true;
  }
  isCheapToTokenize(lineNumber) {
    return true;
  }
  getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
    return StandardTokenType.Other;
  }
  tokenizeLineWithEdit(lineNumber, edit) {
    return { mainLineTokens: null, additionalLines: null };
  }
  get hasTokens() {
    const hasTree = this._treeSitterService.getParseResult(this._textModel) !== void 0;
    return hasTree;
  }
}
export {
  TreeSitterTokens
};
//# sourceMappingURL=treeSitterTokens.js.map
