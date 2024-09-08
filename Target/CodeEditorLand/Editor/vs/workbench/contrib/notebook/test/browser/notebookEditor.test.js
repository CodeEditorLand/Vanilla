import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  expandCellRangesWithHiddenCells
} from "../../browser/notebookBrowser.js";
import { ListViewInfoAccessor } from "../../browser/view/notebookCellList.js";
import {
  FoldingModel,
  updateFoldingStateAtIndex
} from "../../browser/viewModel/foldingModel.js";
import { CellKind } from "../../common/notebookCommon.js";
import {
  createNotebookCellList,
  setupInstantiationService,
  withTestNotebook
} from "./testNotebookEditor.js";
suite("ListViewInfoAccessor", () => {
  let disposables;
  let instantiationService;
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = setupInstantiationService(disposables);
  });
  test("basics", async () => {
    await withTestNotebook(
      [
        ["# header a", "markdown", CellKind.Markup, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["# header b", "markdown", CellKind.Markup, [], {}],
        ["var b = 2;", "javascript", CellKind.Code, [], {}],
        ["var c = 3;", "javascript", CellKind.Code, [], {}]
      ],
      (editor, viewModel, ds) => {
        const foldingModel = ds.add(new FoldingModel());
        foldingModel.attachViewModel(viewModel);
        const cellList = ds.add(
          createNotebookCellList(instantiationService, ds)
        );
        cellList.attachViewModel(viewModel);
        const listViewInfoAccessor = ds.add(
          new ListViewInfoAccessor(cellList)
        );
        assert.strictEqual(
          listViewInfoAccessor.getViewIndex(viewModel.cellAt(0)),
          0
        );
        assert.strictEqual(
          listViewInfoAccessor.getViewIndex(viewModel.cellAt(1)),
          1
        );
        assert.strictEqual(
          listViewInfoAccessor.getViewIndex(viewModel.cellAt(2)),
          2
        );
        assert.strictEqual(
          listViewInfoAccessor.getViewIndex(viewModel.cellAt(3)),
          3
        );
        assert.strictEqual(
          listViewInfoAccessor.getViewIndex(viewModel.cellAt(4)),
          4
        );
        assert.deepStrictEqual(
          listViewInfoAccessor.getCellRangeFromViewRange(0, 1),
          { start: 0, end: 1 }
        );
        assert.deepStrictEqual(
          listViewInfoAccessor.getCellRangeFromViewRange(1, 2),
          { start: 1, end: 2 }
        );
        updateFoldingStateAtIndex(foldingModel, 0, true);
        updateFoldingStateAtIndex(foldingModel, 2, true);
        viewModel.updateFoldingRanges(foldingModel.regions);
        cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
        assert.strictEqual(
          listViewInfoAccessor.getViewIndex(viewModel.cellAt(0)),
          0
        );
        assert.strictEqual(
          listViewInfoAccessor.getViewIndex(viewModel.cellAt(1)),
          -1
        );
        assert.strictEqual(
          listViewInfoAccessor.getViewIndex(viewModel.cellAt(2)),
          1
        );
        assert.strictEqual(
          listViewInfoAccessor.getViewIndex(viewModel.cellAt(3)),
          -1
        );
        assert.strictEqual(
          listViewInfoAccessor.getViewIndex(viewModel.cellAt(4)),
          -1
        );
        assert.deepStrictEqual(
          listViewInfoAccessor.getCellRangeFromViewRange(0, 1),
          { start: 0, end: 2 }
        );
        assert.deepStrictEqual(
          listViewInfoAccessor.getCellRangeFromViewRange(1, 2),
          { start: 2, end: 5 }
        );
        assert.deepStrictEqual(
          listViewInfoAccessor.getCellsFromViewRange(0, 1),
          viewModel.getCellsInRange({ start: 0, end: 2 })
        );
        assert.deepStrictEqual(
          listViewInfoAccessor.getCellsFromViewRange(1, 2),
          viewModel.getCellsInRange({ start: 2, end: 5 })
        );
        const notebookEditor = new class extends mock() {
          getViewIndexByModelIndex(index) {
            return listViewInfoAccessor.getViewIndex(
              viewModel.viewCells[index]
            );
          }
          getCellRangeFromViewRange(startIndex, endIndex) {
            return listViewInfoAccessor.getCellRangeFromViewRange(
              startIndex,
              endIndex
            );
          }
          cellAt(index) {
            return viewModel.cellAt(index);
          }
        }();
        assert.deepStrictEqual(
          expandCellRangesWithHiddenCells(notebookEditor, [
            { start: 0, end: 1 }
          ]),
          [{ start: 0, end: 2 }]
        );
        assert.deepStrictEqual(
          expandCellRangesWithHiddenCells(notebookEditor, [
            { start: 2, end: 3 }
          ]),
          [{ start: 2, end: 5 }]
        );
        assert.deepStrictEqual(
          expandCellRangesWithHiddenCells(notebookEditor, [
            { start: 0, end: 1 },
            { start: 2, end: 3 }
          ]),
          [{ start: 0, end: 5 }]
        );
      }
    );
  });
});
