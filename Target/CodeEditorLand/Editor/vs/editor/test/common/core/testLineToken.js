var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IViewLineTokens } from "../../../common/tokens/lineTokens.js";
import { ColorId, TokenMetadata, ITokenPresentation, StandardTokenType } from "../../../common/encodedTokenAttributes.js";
import { ILanguageIdCodec } from "../../../common/languages.js";
class TestLineToken {
  static {
    __name(this, "TestLineToken");
  }
  /**
   * last char index of this token (not inclusive).
   */
  endIndex;
  _metadata;
  constructor(endIndex, metadata) {
    this.endIndex = endIndex;
    this._metadata = metadata;
  }
  getStandardTokenType() {
    return TokenMetadata.getTokenType(this._metadata);
  }
  getForeground() {
    return TokenMetadata.getForeground(this._metadata);
  }
  getType() {
    return TokenMetadata.getClassNameFromMetadata(this._metadata);
  }
  getInlineStyle(colorMap) {
    return TokenMetadata.getInlineStyleFromMetadata(this._metadata, colorMap);
  }
  getPresentation() {
    return TokenMetadata.getPresentationFromMetadata(this._metadata);
  }
  static _equals(a, b) {
    return a.endIndex === b.endIndex && a._metadata === b._metadata;
  }
  static equalsArr(a, b) {
    const aLen = a.length;
    const bLen = b.length;
    if (aLen !== bLen) {
      return false;
    }
    for (let i = 0; i < aLen; i++) {
      if (!this._equals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
}
class TestLineTokens {
  static {
    __name(this, "TestLineTokens");
  }
  _actual;
  constructor(actual) {
    this._actual = actual;
  }
  equals(other) {
    if (other instanceof TestLineTokens) {
      return TestLineToken.equalsArr(this._actual, other._actual);
    }
    return false;
  }
  getCount() {
    return this._actual.length;
  }
  getStandardTokenType(tokenIndex) {
    return this._actual[tokenIndex].getStandardTokenType();
  }
  getForeground(tokenIndex) {
    return this._actual[tokenIndex].getForeground();
  }
  getEndOffset(tokenIndex) {
    return this._actual[tokenIndex].endIndex;
  }
  getClassName(tokenIndex) {
    return this._actual[tokenIndex].getType();
  }
  getInlineStyle(tokenIndex, colorMap) {
    return this._actual[tokenIndex].getInlineStyle(colorMap);
  }
  getPresentation(tokenIndex) {
    return this._actual[tokenIndex].getPresentation();
  }
  findTokenIndexAtOffset(offset) {
    throw new Error("Not implemented");
  }
  getLineContent() {
    throw new Error("Not implemented");
  }
  getMetadata(tokenIndex) {
    throw new Error("Method not implemented.");
  }
  getLanguageId(tokenIndex) {
    throw new Error("Method not implemented.");
  }
  getTokenText(tokenIndex) {
    throw new Error("Method not implemented.");
  }
  forEach(callback) {
    throw new Error("Not implemented");
  }
  get languageIdCodec() {
    throw new Error("Not implemented");
  }
}
class TestLineTokenFactory {
  static {
    __name(this, "TestLineTokenFactory");
  }
  static inflateArr(tokens) {
    const tokensCount = tokens.length >>> 1;
    const result = new Array(tokensCount);
    for (let i = 0; i < tokensCount; i++) {
      const endOffset = tokens[i << 1];
      const metadata = tokens[(i << 1) + 1];
      result[i] = new TestLineToken(endOffset, metadata);
    }
    return result;
  }
}
export {
  TestLineToken,
  TestLineTokenFactory,
  TestLineTokens
};
//# sourceMappingURL=testLineToken.js.map
