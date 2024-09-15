var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { numberComparator } from "../../../../base/common/arrays.js";
import { OffsetRange } from "../../../common/core/offsetRange.js";
import { Position } from "../../../common/core/position.js";
import { PositionOffsetTransformer } from "../../../common/core/positionToOffset.js";
import { Range } from "../../../common/core/range.js";
import { AbstractText, SingleTextEdit, TextEdit } from "../../../common/core/textEdit.js";
class Random {
  static {
    __name(this, "Random");
  }
  static basicAlphabet = "      abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  static basicAlphabetMultiline = "      \n\n\nabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  static create(seed) {
    return new MersenneTwister(seed);
  }
  nextString(length, alphabet = Random.basicAlphabet) {
    let randomText = "";
    for (let i = 0; i < length; i++) {
      const characterIndex = this.nextIntRange(0, alphabet.length);
      randomText += alphabet.charAt(characterIndex);
    }
    return randomText;
  }
  nextMultiLineString(lineCount, lineLengthRange, alphabet = Random.basicAlphabet) {
    const lines = [];
    for (let i = 0; i < lineCount; i++) {
      const lineLength = this.nextIntRange(lineLengthRange.start, lineLengthRange.endExclusive);
      lines.push(this.nextString(lineLength, alphabet));
    }
    return lines.join("\n");
  }
  nextConsecutivePositions(source, count) {
    const t = new PositionOffsetTransformer(source.getValue());
    const offsets = OffsetRange.ofLength(count).map(() => this.nextIntRange(0, t.text.length));
    offsets.sort(numberComparator);
    return offsets.map((offset) => t.getPosition(offset));
  }
  nextRange(source) {
    const [start, end] = this.nextConsecutivePositions(source, 2);
    return Range.fromPositions(start, end);
  }
  nextTextEdit(target, singleTextEditCount) {
    const singleTextEdits = [];
    const positions = this.nextConsecutivePositions(target, singleTextEditCount * 2);
    for (let i = 0; i < singleTextEditCount; i++) {
      const start = positions[i * 2];
      const end = positions[i * 2 + 1];
      const newText = this.nextString(end.column - start.column, Random.basicAlphabetMultiline);
      singleTextEdits.push(new SingleTextEdit(Range.fromPositions(start, end), newText));
    }
    return new TextEdit(singleTextEdits).normalize();
  }
}
class MersenneTwister extends Random {
  static {
    __name(this, "MersenneTwister");
  }
  mt = new Array(624);
  index = 0;
  constructor(seed) {
    super();
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      const s = this.mt[i - 1] ^ this.mt[i - 1] >>> 30;
      this.mt[i] = (((s & 4294901760) >>> 16) * 1812433253 << 16) + (s & 65535) * 1812433253 + i >>> 0;
    }
  }
  _nextInt() {
    if (this.index === 0) {
      this.generateNumbers();
    }
    let y = this.mt[this.index];
    y = y ^ y >>> 11;
    y = y ^ y << 7 & 2636928640;
    y = y ^ y << 15 & 4022730752;
    y = y ^ y >>> 18;
    this.index = (this.index + 1) % 624;
    return y >>> 0;
  }
  nextIntRange(start, endExclusive) {
    const range = endExclusive - start;
    return Math.floor(this._nextInt() / (4294967296 / range)) + start;
  }
  generateNumbers() {
    for (let i = 0; i < 624; i++) {
      const y = (this.mt[i] & 2147483648) + (this.mt[(i + 1) % 624] & 2147483647);
      this.mt[i] = this.mt[(i + 397) % 624] ^ y >>> 1;
      if (y % 2 !== 0) {
        this.mt[i] = this.mt[i] ^ 2567483615;
      }
    }
  }
}
export {
  Random
};
//# sourceMappingURL=random.js.map
