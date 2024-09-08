import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { CellKind } from "../../common/notebookCommon.js";
function getRanges(cells, included) {
  const ranges = [];
  let currentRange;
  cells.forEach((cell, idx) => {
    if (included(cell)) {
      if (currentRange) {
        currentRange.end = idx + 1;
      } else {
        currentRange = { start: idx, end: idx + 1 };
        ranges.push(currentRange);
      }
    } else {
      currentRange = void 0;
    }
  });
  return ranges;
}
suite("notebookBrowser", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("getRanges", () => {
    const predicate = (cell) => cell.cellKind === CellKind.Code;
    test("all code", () => {
      const cells = [
        { cellKind: CellKind.Code },
        { cellKind: CellKind.Code }
      ];
      assert.deepStrictEqual(
        getRanges(cells, predicate),
        [{ start: 0, end: 2 }]
      );
    });
    test("none code", () => {
      const cells = [
        { cellKind: CellKind.Markup },
        { cellKind: CellKind.Markup }
      ];
      assert.deepStrictEqual(
        getRanges(cells, predicate),
        []
      );
    });
    test("start code", () => {
      const cells = [
        { cellKind: CellKind.Code },
        { cellKind: CellKind.Markup }
      ];
      assert.deepStrictEqual(
        getRanges(cells, predicate),
        [{ start: 0, end: 1 }]
      );
    });
    test("random", () => {
      const cells = [
        { cellKind: CellKind.Code },
        { cellKind: CellKind.Code },
        { cellKind: CellKind.Markup },
        { cellKind: CellKind.Code },
        { cellKind: CellKind.Markup },
        { cellKind: CellKind.Markup },
        { cellKind: CellKind.Code }
      ];
      assert.deepStrictEqual(
        getRanges(cells, predicate),
        [
          { start: 0, end: 2 },
          { start: 3, end: 4 },
          { start: 6, end: 7 }
        ]
      );
    });
  });
});
