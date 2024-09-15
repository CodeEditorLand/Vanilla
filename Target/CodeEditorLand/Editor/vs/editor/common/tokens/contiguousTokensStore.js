var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as arrays from "../../../base/common/arrays.js";
import { Position } from "../core/position.js";
import {
  ColorId,
  FontStyle,
  MetadataConsts,
  StandardTokenType,
  TokenMetadata
} from "../encodedTokenAttributes.js";
import {
  ContiguousTokensEditing,
  EMPTY_LINE_TOKENS,
  toUint32Array
} from "./contiguousTokensEditing.js";
import { LineTokens } from "./lineTokens.js";
class ContiguousTokensStore {
  static {
    __name(this, "ContiguousTokensStore");
  }
  _lineTokens;
  _len;
  _languageIdCodec;
  constructor(languageIdCodec) {
    this._lineTokens = [];
    this._len = 0;
    this._languageIdCodec = languageIdCodec;
  }
  flush() {
    this._lineTokens = [];
    this._len = 0;
  }
  get hasTokens() {
    return this._lineTokens.length > 0;
  }
  getTokens(topLevelLanguageId, lineIndex, lineText) {
    let rawLineTokens = null;
    if (lineIndex < this._len) {
      rawLineTokens = this._lineTokens[lineIndex];
    }
    if (rawLineTokens !== null && rawLineTokens !== EMPTY_LINE_TOKENS) {
      return new LineTokens(
        toUint32Array(rawLineTokens),
        lineText,
        this._languageIdCodec
      );
    }
    const lineTokens = new Uint32Array(2);
    lineTokens[0] = lineText.length;
    lineTokens[1] = getDefaultMetadata(
      this._languageIdCodec.encodeLanguageId(topLevelLanguageId)
    );
    return new LineTokens(lineTokens, lineText, this._languageIdCodec);
  }
  static _massageTokens(topLevelLanguageId, lineTextLength, _tokens) {
    const tokens = _tokens ? toUint32Array(_tokens) : null;
    if (lineTextLength === 0) {
      let hasDifferentLanguageId = false;
      if (tokens && tokens.length > 1) {
        hasDifferentLanguageId = TokenMetadata.getLanguageId(tokens[1]) !== topLevelLanguageId;
      }
      if (!hasDifferentLanguageId) {
        return EMPTY_LINE_TOKENS;
      }
    }
    if (!tokens || tokens.length === 0) {
      const tokens2 = new Uint32Array(2);
      tokens2[0] = lineTextLength;
      tokens2[1] = getDefaultMetadata(topLevelLanguageId);
      return tokens2.buffer;
    }
    tokens[tokens.length - 2] = lineTextLength;
    if (tokens.byteOffset === 0 && tokens.byteLength === tokens.buffer.byteLength) {
      return tokens.buffer;
    }
    return tokens;
  }
  _ensureLine(lineIndex) {
    while (lineIndex >= this._len) {
      this._lineTokens[this._len] = null;
      this._len++;
    }
  }
  _deleteLines(start, deleteCount) {
    if (deleteCount === 0) {
      return;
    }
    if (start + deleteCount > this._len) {
      deleteCount = this._len - start;
    }
    this._lineTokens.splice(start, deleteCount);
    this._len -= deleteCount;
  }
  _insertLines(insertIndex, insertCount) {
    if (insertCount === 0) {
      return;
    }
    const lineTokens = [];
    for (let i = 0; i < insertCount; i++) {
      lineTokens[i] = null;
    }
    this._lineTokens = arrays.arrayInsert(
      this._lineTokens,
      insertIndex,
      lineTokens
    );
    this._len += insertCount;
  }
  setTokens(topLevelLanguageId, lineIndex, lineTextLength, _tokens, checkEquality) {
    const tokens = ContiguousTokensStore._massageTokens(
      this._languageIdCodec.encodeLanguageId(topLevelLanguageId),
      lineTextLength,
      _tokens
    );
    this._ensureLine(lineIndex);
    const oldTokens = this._lineTokens[lineIndex];
    this._lineTokens[lineIndex] = tokens;
    if (checkEquality) {
      return !ContiguousTokensStore._equals(oldTokens, tokens);
    }
    return false;
  }
  static _equals(_a, _b) {
    if (!_a || !_b) {
      return !_a && !_b;
    }
    const a = toUint32Array(_a);
    const b = toUint32Array(_b);
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0, len = a.length; i < len; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  //#region Editing
  acceptEdit(range, eolCount, firstLineLength) {
    this._acceptDeleteRange(range);
    this._acceptInsertText(
      new Position(range.startLineNumber, range.startColumn),
      eolCount,
      firstLineLength
    );
  }
  _acceptDeleteRange(range) {
    const firstLineIndex = range.startLineNumber - 1;
    if (firstLineIndex >= this._len) {
      return;
    }
    if (range.startLineNumber === range.endLineNumber) {
      if (range.startColumn === range.endColumn) {
        return;
      }
      this._lineTokens[firstLineIndex] = ContiguousTokensEditing.delete(
        this._lineTokens[firstLineIndex],
        range.startColumn - 1,
        range.endColumn - 1
      );
      return;
    }
    this._lineTokens[firstLineIndex] = ContiguousTokensEditing.deleteEnding(
      this._lineTokens[firstLineIndex],
      range.startColumn - 1
    );
    const lastLineIndex = range.endLineNumber - 1;
    let lastLineTokens = null;
    if (lastLineIndex < this._len) {
      lastLineTokens = ContiguousTokensEditing.deleteBeginning(
        this._lineTokens[lastLineIndex],
        range.endColumn - 1
      );
    }
    this._lineTokens[firstLineIndex] = ContiguousTokensEditing.append(
      this._lineTokens[firstLineIndex],
      lastLineTokens
    );
    this._deleteLines(
      range.startLineNumber,
      range.endLineNumber - range.startLineNumber
    );
  }
  _acceptInsertText(position, eolCount, firstLineLength) {
    if (eolCount === 0 && firstLineLength === 0) {
      return;
    }
    const lineIndex = position.lineNumber - 1;
    if (lineIndex >= this._len) {
      return;
    }
    if (eolCount === 0) {
      this._lineTokens[lineIndex] = ContiguousTokensEditing.insert(
        this._lineTokens[lineIndex],
        position.column - 1,
        firstLineLength
      );
      return;
    }
    this._lineTokens[lineIndex] = ContiguousTokensEditing.deleteEnding(
      this._lineTokens[lineIndex],
      position.column - 1
    );
    this._lineTokens[lineIndex] = ContiguousTokensEditing.insert(
      this._lineTokens[lineIndex],
      position.column - 1,
      firstLineLength
    );
    this._insertLines(position.lineNumber, eolCount);
  }
  //#endregion
  setMultilineTokens(tokens, textModel) {
    if (tokens.length === 0) {
      return { changes: [] };
    }
    const ranges = [];
    for (let i = 0, len = tokens.length; i < len; i++) {
      const element = tokens[i];
      let minChangedLineNumber = 0;
      let maxChangedLineNumber = 0;
      let hasChange = false;
      for (let lineNumber = element.startLineNumber; lineNumber <= element.endLineNumber; lineNumber++) {
        if (hasChange) {
          this.setTokens(
            textModel.getLanguageId(),
            lineNumber - 1,
            textModel.getLineLength(lineNumber),
            element.getLineTokens(lineNumber),
            false
          );
          maxChangedLineNumber = lineNumber;
        } else {
          const lineHasChange = this.setTokens(
            textModel.getLanguageId(),
            lineNumber - 1,
            textModel.getLineLength(lineNumber),
            element.getLineTokens(lineNumber),
            true
          );
          if (lineHasChange) {
            hasChange = true;
            minChangedLineNumber = lineNumber;
            maxChangedLineNumber = lineNumber;
          }
        }
      }
      if (hasChange) {
        ranges.push({
          fromLineNumber: minChangedLineNumber,
          toLineNumber: maxChangedLineNumber
        });
      }
    }
    return { changes: ranges };
  }
}
function getDefaultMetadata(topLevelLanguageId) {
  return (topLevelLanguageId << MetadataConsts.LANGUAGEID_OFFSET | StandardTokenType.Other << MetadataConsts.TOKEN_TYPE_OFFSET | FontStyle.None << MetadataConsts.FONT_STYLE_OFFSET | ColorId.DefaultForeground << MetadataConsts.FOREGROUND_OFFSET | ColorId.DefaultBackground << MetadataConsts.BACKGROUND_OFFSET | // If there is no grammar, we just take a guess and try to match brackets.
  MetadataConsts.BALANCED_BRACKETS_MASK) >>> 0;
}
__name(getDefaultMetadata, "getDefaultMetadata");
export {
  ContiguousTokensStore
};
//# sourceMappingURL=contiguousTokensStore.js.map
