var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findLastIdxMonotonous } from "../../../base/common/arraysFind.js";
import { OffsetRange } from "./offsetRange.js";
import { Position } from "./position.js";
import { Range } from "./range.js";
import { TextLength } from "./textLength.js";
class PositionOffsetTransformer {
  constructor(text) {
    this.text = text;
    this.lineStartOffsetByLineIdx = [];
    this.lineStartOffsetByLineIdx.push(0);
    for (let i = 0; i < text.length; i++) {
      if (text.charAt(i) === "\n") {
        this.lineStartOffsetByLineIdx.push(i + 1);
      }
    }
  }
  static {
    __name(this, "PositionOffsetTransformer");
  }
  lineStartOffsetByLineIdx;
  getOffset(position) {
    return this.lineStartOffsetByLineIdx[position.lineNumber - 1] + position.column - 1;
  }
  getOffsetRange(range) {
    return new OffsetRange(
      this.getOffset(range.getStartPosition()),
      this.getOffset(range.getEndPosition())
    );
  }
  getPosition(offset) {
    const idx = findLastIdxMonotonous(
      this.lineStartOffsetByLineIdx,
      (i) => i <= offset
    );
    const lineNumber = idx + 1;
    const column = offset - this.lineStartOffsetByLineIdx[idx] + 1;
    return new Position(lineNumber, column);
  }
  getRange(offsetRange) {
    return Range.fromPositions(
      this.getPosition(offsetRange.start),
      this.getPosition(offsetRange.endExclusive)
    );
  }
  getTextLength(offsetRange) {
    return TextLength.ofRange(this.getRange(offsetRange));
  }
  get textLength() {
    const lineIdx = this.lineStartOffsetByLineIdx.length - 1;
    return new TextLength(
      lineIdx,
      this.text.length - this.lineStartOffsetByLineIdx[lineIdx]
    );
  }
}
export {
  PositionOffsetTransformer
};
//# sourceMappingURL=positionToOffset.js.map
