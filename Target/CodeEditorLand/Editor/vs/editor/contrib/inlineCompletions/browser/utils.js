var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BugIndicatingError } from "../../../../base/common/errors.js";
import {
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import {
  autorunOpts
} from "../../../../base/common/observable.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
const array = [];
function getReadonlyEmptyArray() {
  return array;
}
__name(getReadonlyEmptyArray, "getReadonlyEmptyArray");
class ColumnRange {
  constructor(startColumn, endColumnExclusive) {
    this.startColumn = startColumn;
    this.endColumnExclusive = endColumnExclusive;
    if (startColumn > endColumnExclusive) {
      throw new BugIndicatingError(
        `startColumn ${startColumn} cannot be after endColumnExclusive ${endColumnExclusive}`
      );
    }
  }
  static {
    __name(this, "ColumnRange");
  }
  toRange(lineNumber) {
    return new Range(
      lineNumber,
      this.startColumn,
      lineNumber,
      this.endColumnExclusive
    );
  }
  equals(other) {
    return this.startColumn === other.startColumn && this.endColumnExclusive === other.endColumnExclusive;
  }
}
function applyObservableDecorations(editor, decorations) {
  const d = new DisposableStore();
  const decorationsCollection = editor.createDecorationsCollection();
  d.add(
    autorunOpts(
      {
        debugName: /* @__PURE__ */ __name(() => `Apply decorations from ${decorations.debugName}`, "debugName")
      },
      (reader) => {
        const d2 = decorations.read(reader);
        decorationsCollection.set(d2);
      }
    )
  );
  d.add({
    dispose: /* @__PURE__ */ __name(() => {
      decorationsCollection.clear();
    }, "dispose")
  });
  return d;
}
__name(applyObservableDecorations, "applyObservableDecorations");
function addPositions(pos1, pos2) {
  return new Position(
    pos1.lineNumber + pos2.lineNumber - 1,
    pos2.lineNumber === 1 ? pos1.column + pos2.column - 1 : pos2.column
  );
}
__name(addPositions, "addPositions");
function subtractPositions(pos1, pos2) {
  return new Position(
    pos1.lineNumber - pos2.lineNumber + 1,
    pos1.lineNumber - pos2.lineNumber === 0 ? pos1.column - pos2.column + 1 : pos1.column
  );
}
__name(subtractPositions, "subtractPositions");
export {
  ColumnRange,
  addPositions,
  applyObservableDecorations,
  getReadonlyEmptyArray,
  subtractPositions
};
//# sourceMappingURL=utils.js.map
