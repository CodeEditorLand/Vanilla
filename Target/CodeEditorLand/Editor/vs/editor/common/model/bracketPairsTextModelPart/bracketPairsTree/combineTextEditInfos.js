var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ArrayQueue } from "../../../../../base/common/arrays.js";
import { TextEditInfo } from "./beforeEditPositionMapper.js";
import {
  lengthAdd,
  lengthDiffNonNegative,
  lengthEquals,
  lengthIsZero,
  lengthToObj,
  lengthZero,
  sumLengths
} from "./length.js";
function combineTextEditInfos(textEditInfoFirst, textEditInfoSecond) {
  if (textEditInfoFirst.length === 0) {
    return textEditInfoSecond;
  }
  if (textEditInfoSecond.length === 0) {
    return textEditInfoFirst;
  }
  const s0ToS1Map = new ArrayQueue(toLengthMapping(textEditInfoFirst));
  const s1ToS2Map = toLengthMapping(textEditInfoSecond);
  s1ToS2Map.push({
    modified: false,
    lengthBefore: void 0,
    lengthAfter: void 0
  });
  let curItem = s0ToS1Map.dequeue();
  function nextS0ToS1MapWithS1LengthOf(s1Length) {
    if (s1Length === void 0) {
      const arr = s0ToS1Map.takeWhile((v) => true) || [];
      if (curItem) {
        arr.unshift(curItem);
      }
      return arr;
    }
    const result2 = [];
    while (curItem && !lengthIsZero(s1Length)) {
      const [item, remainingItem] = curItem.splitAt(s1Length);
      result2.push(item);
      s1Length = lengthDiffNonNegative(item.lengthAfter, s1Length);
      curItem = remainingItem ?? s0ToS1Map.dequeue();
    }
    if (!lengthIsZero(s1Length)) {
      result2.push(new LengthMapping(false, s1Length, s1Length));
    }
    return result2;
  }
  __name(nextS0ToS1MapWithS1LengthOf, "nextS0ToS1MapWithS1LengthOf");
  const result = [];
  function pushEdit(startOffset, endOffset, newLength) {
    if (result.length > 0 && lengthEquals(result[result.length - 1].endOffset, startOffset)) {
      const lastResult = result[result.length - 1];
      result[result.length - 1] = new TextEditInfo(
        lastResult.startOffset,
        endOffset,
        lengthAdd(lastResult.newLength, newLength)
      );
    } else {
      result.push({ startOffset, endOffset, newLength });
    }
  }
  __name(pushEdit, "pushEdit");
  let s0offset = lengthZero;
  for (const s1ToS2 of s1ToS2Map) {
    const s0ToS1Map2 = nextS0ToS1MapWithS1LengthOf(s1ToS2.lengthBefore);
    if (s1ToS2.modified) {
      const s0Length = sumLengths(s0ToS1Map2, (s) => s.lengthBefore);
      const s0EndOffset = lengthAdd(s0offset, s0Length);
      pushEdit(s0offset, s0EndOffset, s1ToS2.lengthAfter);
      s0offset = s0EndOffset;
    } else {
      for (const s1 of s0ToS1Map2) {
        const s0startOffset = s0offset;
        s0offset = lengthAdd(s0offset, s1.lengthBefore);
        if (s1.modified) {
          pushEdit(s0startOffset, s0offset, s1.lengthAfter);
        }
      }
    }
  }
  return result;
}
__name(combineTextEditInfos, "combineTextEditInfos");
class LengthMapping {
  constructor(modified, lengthBefore, lengthAfter) {
    this.modified = modified;
    this.lengthBefore = lengthBefore;
    this.lengthAfter = lengthAfter;
  }
  static {
    __name(this, "LengthMapping");
  }
  splitAt(lengthAfter) {
    const remainingLengthAfter = lengthDiffNonNegative(
      lengthAfter,
      this.lengthAfter
    );
    if (lengthEquals(remainingLengthAfter, lengthZero)) {
      return [this, void 0];
    } else if (this.modified) {
      return [
        new LengthMapping(
          this.modified,
          this.lengthBefore,
          lengthAfter
        ),
        new LengthMapping(
          this.modified,
          lengthZero,
          remainingLengthAfter
        )
      ];
    } else {
      return [
        new LengthMapping(this.modified, lengthAfter, lengthAfter),
        new LengthMapping(
          this.modified,
          remainingLengthAfter,
          remainingLengthAfter
        )
      ];
    }
  }
  toString() {
    return `${this.modified ? "M" : "U"}:${lengthToObj(this.lengthBefore)} -> ${lengthToObj(this.lengthAfter)}`;
  }
}
function toLengthMapping(textEditInfos) {
  const result = [];
  let lastOffset = lengthZero;
  for (const textEditInfo of textEditInfos) {
    const spaceLength = lengthDiffNonNegative(
      lastOffset,
      textEditInfo.startOffset
    );
    if (!lengthIsZero(spaceLength)) {
      result.push(new LengthMapping(false, spaceLength, spaceLength));
    }
    const lengthBefore = lengthDiffNonNegative(
      textEditInfo.startOffset,
      textEditInfo.endOffset
    );
    result.push(
      new LengthMapping(true, lengthBefore, textEditInfo.newLength)
    );
    lastOffset = textEditInfo.endOffset;
  }
  return result;
}
__name(toLengthMapping, "toLengthMapping");
export {
  combineTextEditInfos
};
//# sourceMappingURL=combineTextEditInfos.js.map
