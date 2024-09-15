var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { performCellDropEdits } from "../../browser/view/cellParts/cellDnd.js";
import { CellKind } from "../../common/notebookCommon.js";
import { withTestNotebook } from "./testNotebookEditor.js";
import assert from "assert";
import { ICellRange } from "../../common/notebookRange.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
async function testCellDnd(beginning, dragAction, end) {
  await withTestNotebook(
    beginning.startOrder.map((text) => [text, "plaintext", CellKind.Code, []]),
    (editor, viewModel) => {
      editor.setSelections(beginning.selections);
      editor.setFocus({ start: beginning.focus, end: beginning.focus + 1 });
      performCellDropEdits(editor, viewModel.cellAt(dragAction.dragIdx), dragAction.direction, viewModel.cellAt(dragAction.dragOverIdx));
      for (const i in end.endOrder) {
        assert.equal(viewModel.viewCells[i].getText(), end.endOrder[i]);
      }
      assert.equal(editor.getSelections().length, 1);
      assert.deepStrictEqual(editor.getSelections()[0], end.selection);
      assert.deepStrictEqual(editor.getFocus(), { start: end.focus, end: end.focus + 1 });
    }
  );
}
__name(testCellDnd, "testCellDnd");
suite("cellDND", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("drag 1 cell", async () => {
    await testCellDnd(
      {
        startOrder: ["0", "1", "2", "3"],
        selections: [{ start: 0, end: 1 }],
        focus: 0
      },
      {
        dragIdx: 0,
        dragOverIdx: 1,
        direction: "below"
      },
      {
        endOrder: ["1", "0", "2", "3"],
        selection: { start: 1, end: 2 },
        focus: 1
      }
    );
  });
  test("drag multiple contiguous cells down", async () => {
    await testCellDnd(
      {
        startOrder: ["0", "1", "2", "3"],
        selections: [{ start: 1, end: 3 }],
        focus: 1
      },
      {
        dragIdx: 1,
        dragOverIdx: 3,
        direction: "below"
      },
      {
        endOrder: ["0", "3", "1", "2"],
        selection: { start: 2, end: 4 },
        focus: 2
      }
    );
  });
  test("drag multiple contiguous cells up", async () => {
    await testCellDnd(
      {
        startOrder: ["0", "1", "2", "3"],
        selections: [{ start: 2, end: 4 }],
        focus: 2
      },
      {
        dragIdx: 3,
        dragOverIdx: 0,
        direction: "above"
      },
      {
        endOrder: ["2", "3", "0", "1"],
        selection: { start: 0, end: 2 },
        focus: 0
      }
    );
  });
  test("drag ranges down", async () => {
    await testCellDnd(
      {
        startOrder: ["0", "1", "2", "3"],
        selections: [{ start: 0, end: 1 }, { start: 2, end: 3 }],
        focus: 0
      },
      {
        dragIdx: 0,
        dragOverIdx: 3,
        direction: "below"
      },
      {
        endOrder: ["1", "3", "0", "2"],
        selection: { start: 2, end: 4 },
        focus: 2
      }
    );
  });
  test("drag ranges up", async () => {
    await testCellDnd(
      {
        startOrder: ["0", "1", "2", "3"],
        selections: [{ start: 1, end: 2 }, { start: 3, end: 4 }],
        focus: 1
      },
      {
        dragIdx: 1,
        dragOverIdx: 0,
        direction: "above"
      },
      {
        endOrder: ["1", "3", "0", "2"],
        selection: { start: 0, end: 2 },
        focus: 0
      }
    );
  });
  test("drag ranges between ranges", async () => {
    await testCellDnd(
      {
        startOrder: ["0", "1", "2", "3"],
        selections: [{ start: 0, end: 1 }, { start: 3, end: 4 }],
        focus: 0
      },
      {
        dragIdx: 0,
        dragOverIdx: 1,
        direction: "below"
      },
      {
        endOrder: ["1", "0", "3", "2"],
        selection: { start: 1, end: 3 },
        focus: 1
      }
    );
  });
  test("drag ranges just above a range", async () => {
    await testCellDnd(
      {
        startOrder: ["0", "1", "2", "3"],
        selections: [{ start: 1, end: 2 }, { start: 3, end: 4 }],
        focus: 1
      },
      {
        dragIdx: 1,
        dragOverIdx: 1,
        direction: "above"
      },
      {
        endOrder: ["0", "1", "3", "2"],
        selection: { start: 1, end: 3 },
        focus: 1
      }
    );
  });
  test("drag ranges inside a range", async () => {
    await testCellDnd(
      {
        startOrder: ["0", "1", "2", "3"],
        selections: [{ start: 0, end: 2 }, { start: 3, end: 4 }],
        focus: 0
      },
      {
        dragIdx: 0,
        dragOverIdx: 0,
        direction: "below"
      },
      {
        endOrder: ["0", "1", "3", "2"],
        selection: { start: 0, end: 3 },
        focus: 0
      }
    );
  });
  test("dragged cell is not focused or selected", async () => {
    await testCellDnd(
      {
        startOrder: ["0", "1", "2", "3"],
        selections: [{ start: 1, end: 2 }],
        focus: 1
      },
      {
        dragIdx: 2,
        dragOverIdx: 3,
        direction: "below"
      },
      {
        endOrder: ["0", "1", "3", "2"],
        selection: { start: 3, end: 4 },
        focus: 3
      }
    );
  });
});
//# sourceMappingURL=cellDnd.test.js.map
