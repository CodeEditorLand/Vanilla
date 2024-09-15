var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { NotSupportedError } from "../../../../../base/common/errors.js";
import {
  StandardTokenType,
  TokenMetadata
} from "../../../encodedTokenAttributes.js";
import { TextAstNode } from "./ast.js";
import {
  lengthAdd,
  lengthDiff,
  lengthGetColumnCountIfZeroLineCount,
  lengthToObj,
  lengthZero,
  toLength
} from "./length.js";
import { SmallImmutableSet } from "./smallImmutableSet.js";
var TokenKind = /* @__PURE__ */ ((TokenKind2) => {
  TokenKind2[TokenKind2["Text"] = 0] = "Text";
  TokenKind2[TokenKind2["OpeningBracket"] = 1] = "OpeningBracket";
  TokenKind2[TokenKind2["ClosingBracket"] = 2] = "ClosingBracket";
  return TokenKind2;
})(TokenKind || {});
class Token {
  constructor(length, kind, bracketId, bracketIds, astNode) {
    this.length = length;
    this.kind = kind;
    this.bracketId = bracketId;
    this.bracketIds = bracketIds;
    this.astNode = astNode;
  }
  static {
    __name(this, "Token");
  }
}
class TextBufferTokenizer {
  constructor(textModel, bracketTokens) {
    this.textModel = textModel;
    this.bracketTokens = bracketTokens;
    this.textBufferLineCount = textModel.getLineCount();
    this.textBufferLastLineLength = textModel.getLineLength(
      this.textBufferLineCount
    );
  }
  static {
    __name(this, "TextBufferTokenizer");
  }
  textBufferLineCount;
  textBufferLastLineLength;
  reader = new NonPeekableTextBufferTokenizer(
    this.textModel,
    this.bracketTokens
  );
  _offset = lengthZero;
  get offset() {
    return this._offset;
  }
  get length() {
    return toLength(
      this.textBufferLineCount - 1,
      this.textBufferLastLineLength
    );
  }
  getText() {
    return this.textModel.getValue();
  }
  skip(length) {
    this.didPeek = false;
    this._offset = lengthAdd(this._offset, length);
    const obj = lengthToObj(this._offset);
    this.reader.setPosition(obj.lineCount, obj.columnCount);
  }
  didPeek = false;
  peeked = null;
  read() {
    let token;
    if (this.peeked) {
      this.didPeek = false;
      token = this.peeked;
    } else {
      token = this.reader.read();
    }
    if (token) {
      this._offset = lengthAdd(this._offset, token.length);
    }
    return token;
  }
  peek() {
    if (!this.didPeek) {
      this.peeked = this.reader.read();
      this.didPeek = true;
    }
    return this.peeked;
  }
}
class NonPeekableTextBufferTokenizer {
  constructor(textModel, bracketTokens) {
    this.textModel = textModel;
    this.bracketTokens = bracketTokens;
    this.textBufferLineCount = textModel.getLineCount();
    this.textBufferLastLineLength = textModel.getLineLength(
      this.textBufferLineCount
    );
  }
  static {
    __name(this, "NonPeekableTextBufferTokenizer");
  }
  textBufferLineCount;
  textBufferLastLineLength;
  lineIdx = 0;
  line = null;
  lineCharOffset = 0;
  lineTokens = null;
  lineTokenOffset = 0;
  setPosition(lineIdx, column) {
    if (lineIdx === this.lineIdx) {
      this.lineCharOffset = column;
      if (this.line !== null) {
        this.lineTokenOffset = this.lineCharOffset === 0 ? 0 : this.lineTokens.findTokenIndexAtOffset(
          this.lineCharOffset
        );
      }
    } else {
      this.lineIdx = lineIdx;
      this.lineCharOffset = column;
      this.line = null;
    }
    this.peekedToken = null;
  }
  /** Must be a zero line token. The end of the document cannot be peeked. */
  peekedToken = null;
  read() {
    if (this.peekedToken) {
      const token = this.peekedToken;
      this.peekedToken = null;
      this.lineCharOffset += lengthGetColumnCountIfZeroLineCount(
        token.length
      );
      return token;
    }
    if (this.lineIdx > this.textBufferLineCount - 1 || this.lineIdx === this.textBufferLineCount - 1 && this.lineCharOffset >= this.textBufferLastLineLength) {
      return null;
    }
    if (this.line === null) {
      this.lineTokens = this.textModel.tokenization.getLineTokens(
        this.lineIdx + 1
      );
      this.line = this.lineTokens.getLineContent();
      this.lineTokenOffset = this.lineCharOffset === 0 ? 0 : this.lineTokens.findTokenIndexAtOffset(
        this.lineCharOffset
      );
    }
    const startLineIdx = this.lineIdx;
    const startLineCharOffset = this.lineCharOffset;
    let lengthHeuristic = 0;
    while (true) {
      const lineTokens = this.lineTokens;
      const tokenCount = lineTokens.getCount();
      let peekedBracketToken = null;
      if (this.lineTokenOffset < tokenCount) {
        const tokenMetadata = lineTokens.getMetadata(
          this.lineTokenOffset
        );
        while (this.lineTokenOffset + 1 < tokenCount && tokenMetadata === lineTokens.getMetadata(this.lineTokenOffset + 1)) {
          this.lineTokenOffset++;
        }
        const isOther = TokenMetadata.getTokenType(tokenMetadata) === StandardTokenType.Other;
        const containsBracketType = TokenMetadata.containsBalancedBrackets(tokenMetadata);
        const endOffset = lineTokens.getEndOffset(this.lineTokenOffset);
        if (containsBracketType && isOther && this.lineCharOffset < endOffset) {
          const languageId = lineTokens.getLanguageId(
            this.lineTokenOffset
          );
          const text = this.line.substring(
            this.lineCharOffset,
            endOffset
          );
          const brackets = this.bracketTokens.getSingleLanguageBracketTokens(
            languageId
          );
          const regexp = brackets.regExpGlobal;
          if (regexp) {
            regexp.lastIndex = 0;
            const match = regexp.exec(text);
            if (match) {
              peekedBracketToken = brackets.getToken(match[0]);
              if (peekedBracketToken) {
                this.lineCharOffset += match.index;
              }
            }
          }
        }
        lengthHeuristic += endOffset - this.lineCharOffset;
        if (peekedBracketToken) {
          if (startLineIdx !== this.lineIdx || startLineCharOffset !== this.lineCharOffset) {
            this.peekedToken = peekedBracketToken;
            break;
          } else {
            this.lineCharOffset += lengthGetColumnCountIfZeroLineCount(
              peekedBracketToken.length
            );
            return peekedBracketToken;
          }
        } else {
          this.lineTokenOffset++;
          this.lineCharOffset = endOffset;
        }
      } else {
        if (this.lineIdx === this.textBufferLineCount - 1) {
          break;
        }
        this.lineIdx++;
        this.lineTokens = this.textModel.tokenization.getLineTokens(
          this.lineIdx + 1
        );
        this.lineTokenOffset = 0;
        this.line = this.lineTokens.getLineContent();
        this.lineCharOffset = 0;
        lengthHeuristic += 33;
        if (lengthHeuristic > 1e3) {
          break;
        }
      }
      if (lengthHeuristic > 1500) {
        break;
      }
    }
    const length = lengthDiff(
      startLineIdx,
      startLineCharOffset,
      this.lineIdx,
      this.lineCharOffset
    );
    return new Token(
      length,
      0 /* Text */,
      -1,
      SmallImmutableSet.getEmpty(),
      new TextAstNode(length)
    );
  }
}
class FastTokenizer {
  constructor(text, brackets) {
    this.text = text;
    const regExpStr = brackets.getRegExpStr();
    const regexp = regExpStr ? new RegExp(regExpStr + "|\n", "gi") : null;
    const tokens = [];
    let match;
    let curLineCount = 0;
    let lastLineBreakOffset = 0;
    let lastTokenEndOffset = 0;
    let lastTokenEndLine = 0;
    const smallTextTokens0Line = [];
    for (let i = 0; i < 60; i++) {
      smallTextTokens0Line.push(
        new Token(
          toLength(0, i),
          0 /* Text */,
          -1,
          SmallImmutableSet.getEmpty(),
          new TextAstNode(toLength(0, i))
        )
      );
    }
    const smallTextTokens1Line = [];
    for (let i = 0; i < 60; i++) {
      smallTextTokens1Line.push(
        new Token(
          toLength(1, i),
          0 /* Text */,
          -1,
          SmallImmutableSet.getEmpty(),
          new TextAstNode(toLength(1, i))
        )
      );
    }
    if (regexp) {
      regexp.lastIndex = 0;
      while ((match = regexp.exec(text)) !== null) {
        const curOffset = match.index;
        const value = match[0];
        if (value === "\n") {
          curLineCount++;
          lastLineBreakOffset = curOffset + 1;
        } else {
          if (lastTokenEndOffset !== curOffset) {
            let token;
            if (lastTokenEndLine === curLineCount) {
              const colCount = curOffset - lastTokenEndOffset;
              if (colCount < smallTextTokens0Line.length) {
                token = smallTextTokens0Line[colCount];
              } else {
                const length = toLength(0, colCount);
                token = new Token(
                  length,
                  0 /* Text */,
                  -1,
                  SmallImmutableSet.getEmpty(),
                  new TextAstNode(length)
                );
              }
            } else {
              const lineCount = curLineCount - lastTokenEndLine;
              const colCount = curOffset - lastLineBreakOffset;
              if (lineCount === 1 && colCount < smallTextTokens1Line.length) {
                token = smallTextTokens1Line[colCount];
              } else {
                const length = toLength(lineCount, colCount);
                token = new Token(
                  length,
                  0 /* Text */,
                  -1,
                  SmallImmutableSet.getEmpty(),
                  new TextAstNode(length)
                );
              }
            }
            tokens.push(token);
          }
          tokens.push(brackets.getToken(value));
          lastTokenEndOffset = curOffset + value.length;
          lastTokenEndLine = curLineCount;
        }
      }
    }
    const offset = text.length;
    if (lastTokenEndOffset !== offset) {
      const length = lastTokenEndLine === curLineCount ? toLength(0, offset - lastTokenEndOffset) : toLength(
        curLineCount - lastTokenEndLine,
        offset - lastLineBreakOffset
      );
      tokens.push(
        new Token(
          length,
          0 /* Text */,
          -1,
          SmallImmutableSet.getEmpty(),
          new TextAstNode(length)
        )
      );
    }
    this.length = toLength(curLineCount, offset - lastLineBreakOffset);
    this.tokens = tokens;
  }
  static {
    __name(this, "FastTokenizer");
  }
  _offset = lengthZero;
  tokens;
  idx = 0;
  get offset() {
    return this._offset;
  }
  length;
  read() {
    return this.tokens[this.idx++] || null;
  }
  peek() {
    return this.tokens[this.idx] || null;
  }
  skip(length) {
    throw new NotSupportedError();
  }
  getText() {
    return this.text;
  }
}
export {
  FastTokenizer,
  TextBufferTokenizer,
  Token,
  TokenKind
};
//# sourceMappingURL=tokenizer.js.map
