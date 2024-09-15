var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ICellViewModel } from "../../browser/notebookBrowser.js";
import { CellKind } from "../../common/notebookCommon.js";
import { ICellRange } from "../../common/notebookRange.js";
function getRanges(cells, included) {
  const ranges = [];
  let currentRange;
  cells.forEach((cell, idx) => {
    if (included(cell)) {
      if (!currentRange) {
        currentRange = { start: idx, end: idx + 1 };
        ranges.push(currentRange);
      } else {
        currentRange.end = idx + 1;
      }
    } else {
      currentRange = void 0;
    }
  });
  return ranges;
}
__name(getRanges, "getRanges");
suite("notebookBrowser", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("getRanges", function() {
    const predicate = /* @__PURE__ */ __name((cell) => cell.cellKind === CellKind.Code, "predicate");
    test("all code", function() {
      const cells = [
        { cellKind: CellKind.Code },
        { cellKind: CellKind.Code }
      ];
      assert.deepStrictEqual(getRanges(cells, predicate), [{ start: 0, end: 2 }]);
    });
    test("none code", function() {
      const cells = [
        { cellKind: CellKind.Markup },
        { cellKind: CellKind.Markup }
      ];
      assert.deepStrictEqual(getRanges(cells, predicate), []);
    });
    test("start code", function() {
      const cells = [
        { cellKind: CellKind.Code },
        { cellKind: CellKind.Markup }
      ];
      assert.deepStrictEqual(getRanges(cells, predicate), [{ start: 0, end: 1 }]);
    });
    test("random", function() {
      const cells = [
        { cellKind: CellKind.Code },
        { cellKind: CellKind.Code },
        { cellKind: CellKind.Markup },
        { cellKind: CellKind.Code },
        { cellKind: CellKind.Markup },
        { cellKind: CellKind.Markup },
        { cellKind: CellKind.Code }
      ];
      assert.deepStrictEqual(getRanges(cells, predicate), [{ start: 0, end: 2 }, { start: 3, end: 4 }, { start: 6, end: 7 }]);
    });
  });
});
//# sourceMappingURL=notebookBrowser.test.js.map
