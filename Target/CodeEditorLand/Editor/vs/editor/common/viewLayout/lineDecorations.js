var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as strings from "../../../base/common/strings.js";
import { Constants } from "../../../base/common/uint.js";
import { InlineDecorationType } from "../viewModel.js";
import { LinePartMetadata } from "./linePart.js";
class LineDecoration {
  constructor(startColumn, endColumn, className, type) {
    this.startColumn = startColumn;
    this.endColumn = endColumn;
    this.className = className;
    this.type = type;
  }
  static {
    __name(this, "LineDecoration");
  }
  _lineDecorationBrand = void 0;
  static _equals(a, b) {
    return a.startColumn === b.startColumn && a.endColumn === b.endColumn && a.className === b.className && a.type === b.type;
  }
  static equalsArr(a, b) {
    const aLen = a.length;
    const bLen = b.length;
    if (aLen !== bLen) {
      return false;
    }
    for (let i = 0; i < aLen; i++) {
      if (!LineDecoration._equals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  static extractWrapped(arr, startOffset, endOffset) {
    if (arr.length === 0) {
      return arr;
    }
    const startColumn = startOffset + 1;
    const endColumn = endOffset + 1;
    const lineLength = endOffset - startOffset;
    const r = [];
    let rLength = 0;
    for (const dec of arr) {
      if (dec.endColumn <= startColumn || dec.startColumn >= endColumn) {
        continue;
      }
      r[rLength++] = new LineDecoration(
        Math.max(1, dec.startColumn - startColumn + 1),
        Math.min(lineLength + 1, dec.endColumn - startColumn + 1),
        dec.className,
        dec.type
      );
    }
    return r;
  }
  static filter(lineDecorations, lineNumber, minLineColumn, maxLineColumn) {
    if (lineDecorations.length === 0) {
      return [];
    }
    const result = [];
    let resultLen = 0;
    for (let i = 0, len = lineDecorations.length; i < len; i++) {
      const d = lineDecorations[i];
      const range = d.range;
      if (range.endLineNumber < lineNumber || range.startLineNumber > lineNumber) {
        continue;
      }
      if (range.isEmpty() && (d.type === InlineDecorationType.Regular || d.type === InlineDecorationType.RegularAffectingLetterSpacing)) {
        continue;
      }
      const startColumn = range.startLineNumber === lineNumber ? range.startColumn : minLineColumn;
      const endColumn = range.endLineNumber === lineNumber ? range.endColumn : maxLineColumn;
      result[resultLen++] = new LineDecoration(
        startColumn,
        endColumn,
        d.inlineClassName,
        d.type
      );
    }
    return result;
  }
  static _typeCompare(a, b) {
    const ORDER = [2, 0, 1, 3];
    return ORDER[a] - ORDER[b];
  }
  static compare(a, b) {
    if (a.startColumn !== b.startColumn) {
      return a.startColumn - b.startColumn;
    }
    if (a.endColumn !== b.endColumn) {
      return a.endColumn - b.endColumn;
    }
    const typeCmp = LineDecoration._typeCompare(a.type, b.type);
    if (typeCmp !== 0) {
      return typeCmp;
    }
    if (a.className !== b.className) {
      return a.className < b.className ? -1 : 1;
    }
    return 0;
  }
}
class DecorationSegment {
  static {
    __name(this, "DecorationSegment");
  }
  startOffset;
  endOffset;
  className;
  metadata;
  constructor(startOffset, endOffset, className, metadata) {
    this.startOffset = startOffset;
    this.endOffset = endOffset;
    this.className = className;
    this.metadata = metadata;
  }
}
class Stack {
  static {
    __name(this, "Stack");
  }
  count;
  stopOffsets;
  classNames;
  metadata;
  constructor() {
    this.stopOffsets = [];
    this.classNames = [];
    this.metadata = [];
    this.count = 0;
  }
  static _metadata(metadata) {
    let result = 0;
    for (let i = 0, len = metadata.length; i < len; i++) {
      result |= metadata[i];
    }
    return result;
  }
  consumeLowerThan(maxStopOffset, nextStartOffset, result) {
    while (this.count > 0 && this.stopOffsets[0] < maxStopOffset) {
      let i = 0;
      while (i + 1 < this.count && this.stopOffsets[i] === this.stopOffsets[i + 1]) {
        i++;
      }
      result.push(
        new DecorationSegment(
          nextStartOffset,
          this.stopOffsets[i],
          this.classNames.join(" "),
          Stack._metadata(this.metadata)
        )
      );
      nextStartOffset = this.stopOffsets[i] + 1;
      this.stopOffsets.splice(0, i + 1);
      this.classNames.splice(0, i + 1);
      this.metadata.splice(0, i + 1);
      this.count -= i + 1;
    }
    if (this.count > 0 && nextStartOffset < maxStopOffset) {
      result.push(
        new DecorationSegment(
          nextStartOffset,
          maxStopOffset - 1,
          this.classNames.join(" "),
          Stack._metadata(this.metadata)
        )
      );
      nextStartOffset = maxStopOffset;
    }
    return nextStartOffset;
  }
  insert(stopOffset, className, metadata) {
    if (this.count === 0 || this.stopOffsets[this.count - 1] <= stopOffset) {
      this.stopOffsets.push(stopOffset);
      this.classNames.push(className);
      this.metadata.push(metadata);
    } else {
      for (let i = 0; i < this.count; i++) {
        if (this.stopOffsets[i] >= stopOffset) {
          this.stopOffsets.splice(i, 0, stopOffset);
          this.classNames.splice(i, 0, className);
          this.metadata.splice(i, 0, metadata);
          break;
        }
      }
    }
    this.count++;
    return;
  }
}
class LineDecorationsNormalizer {
  static {
    __name(this, "LineDecorationsNormalizer");
  }
  /**
   * Normalize line decorations. Overlapping decorations will generate multiple segments
   */
  static normalize(lineContent, lineDecorations) {
    if (lineDecorations.length === 0) {
      return [];
    }
    const result = [];
    const stack = new Stack();
    let nextStartOffset = 0;
    for (let i = 0, len = lineDecorations.length; i < len; i++) {
      const d = lineDecorations[i];
      let startColumn = d.startColumn;
      let endColumn = d.endColumn;
      const className = d.className;
      const metadata = d.type === InlineDecorationType.Before ? LinePartMetadata.PSEUDO_BEFORE : d.type === InlineDecorationType.After ? LinePartMetadata.PSEUDO_AFTER : 0;
      if (startColumn > 1) {
        const charCodeBefore = lineContent.charCodeAt(startColumn - 2);
        if (strings.isHighSurrogate(charCodeBefore)) {
          startColumn--;
        }
      }
      if (endColumn > 1) {
        const charCodeBefore = lineContent.charCodeAt(endColumn - 2);
        if (strings.isHighSurrogate(charCodeBefore)) {
          endColumn--;
        }
      }
      const currentStartOffset = startColumn - 1;
      const currentEndOffset = endColumn - 2;
      nextStartOffset = stack.consumeLowerThan(
        currentStartOffset,
        nextStartOffset,
        result
      );
      if (stack.count === 0) {
        nextStartOffset = currentStartOffset;
      }
      stack.insert(currentEndOffset, className, metadata);
    }
    stack.consumeLowerThan(
      Constants.MAX_SAFE_SMALL_INTEGER,
      nextStartOffset,
      result
    );
    return result;
  }
}
export {
  DecorationSegment,
  LineDecoration,
  LineDecorationsNormalizer
};
//# sourceMappingURL=lineDecorations.js.map
