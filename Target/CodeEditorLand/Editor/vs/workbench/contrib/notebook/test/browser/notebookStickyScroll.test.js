import assert from "assert";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { assertSnapshot } from "../../../../../base/test/common/snapshot.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { LanguageFeaturesService } from "../../../../../editor/common/services/languageFeaturesService.js";
import { OutlineTarget } from "../../../../services/outline/browser/outline.js";
import { NotebookCellOutline } from "../../browser/contrib/outline/notebookOutline.js";
import {
  computeContent
} from "../../browser/viewParts/notebookEditorStickyScroll.js";
import { CellKind } from "../../common/notebookCommon.js";
import {
  createNotebookCellList,
  setupInstantiationService,
  withTestNotebook
} from "./testNotebookEditor.js";
suite("NotebookEditorStickyScroll", () => {
  let disposables;
  let instantiationService;
  const domNode = document.createElement("div");
  teardown(() => {
    disposables.dispose();
  });
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = setupInstantiationService(disposables);
    instantiationService.set(
      ILanguageFeaturesService,
      new LanguageFeaturesService()
    );
  });
  function getOutline(editor) {
    if (!editor.hasModel()) {
      assert.ok(false, "MUST have active text editor");
    }
    const outline = store.add(
      instantiationService.createInstance(
        NotebookCellOutline,
        new class extends mock() {
          getControl() {
            return editor;
          }
          onDidChangeModel = Event.None;
          onDidChangeSelection = Event.None;
        }(),
        OutlineTarget.QuickPick
      )
    );
    return outline;
  }
  function nbStickyTestHelper(domNode2, notebookEditor, notebookCellList, notebookOutlineEntries, disposables2) {
    const output = computeContent(
      notebookEditor,
      notebookCellList,
      notebookOutlineEntries,
      0
    );
    for (const stickyLine of output.values()) {
      disposables2.add(stickyLine.line);
    }
    return createStickyTestElement(output.values());
  }
  function createStickyTestElement(stickyLines) {
    const outputElements = [];
    for (const stickyLine of stickyLines) {
      if (stickyLine.rendered) {
        outputElements.unshift(stickyLine.line.element.innerText);
      }
    }
    return outputElements;
  }
  test("test0: should render empty, 	scrollTop at 0", async () => {
    await withTestNotebook(
      [
        ["# header a", "markdown", CellKind.Markup, [], {}],
        ["## header aa", "markdown", CellKind.Markup, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["# header b", "markdown", CellKind.Markup, [], {}],
        ["var c = 2;", "javascript", CellKind.Code, [], {}]
      ],
      async (editor, viewModel) => {
        viewModel.restoreEditorViewState({
          editingCells: Array.from({ length: 8 }, () => false),
          editorViewStates: Array.from({ length: 8 }, () => null),
          cellTotalHeights: Array.from({ length: 8 }, () => 50),
          cellLineNumberStates: {},
          collapsedInputCells: {},
          collapsedOutputCells: {}
        });
        const cellList = disposables.add(
          createNotebookCellList(instantiationService, disposables)
        );
        cellList.attachViewModel(viewModel);
        cellList.layout(400, 100);
        editor.setScrollTop(0);
        editor.visibleRanges = [{ start: 0, end: 8 }];
        const outline = getOutline(editor);
        const notebookOutlineEntries = outline.entries;
        const resultingMap = nbStickyTestHelper(
          domNode,
          editor,
          cellList,
          notebookOutlineEntries,
          disposables
        );
        await assertSnapshot(resultingMap);
        outline.dispose();
      }
    );
  });
  test("test1: should render 0->1, 	visible range 3->8", async () => {
    await withTestNotebook(
      [
        ["# header a", "markdown", CellKind.Markup, [], {}],
        // 0
        ["## header aa", "markdown", CellKind.Markup, [], {}],
        // 50
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 100
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 150
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 200
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 250
        ["# header b", "markdown", CellKind.Markup, [], {}],
        // 300
        ["var c = 2;", "javascript", CellKind.Code, [], {}]
        // 350
      ],
      async (editor, viewModel, ds) => {
        viewModel.restoreEditorViewState({
          editingCells: Array.from({ length: 8 }, () => false),
          editorViewStates: Array.from({ length: 8 }, () => null),
          cellTotalHeights: Array.from({ length: 8 }, () => 50),
          cellLineNumberStates: {},
          collapsedInputCells: {},
          collapsedOutputCells: {}
        });
        const cellList = ds.add(
          createNotebookCellList(instantiationService, ds)
        );
        cellList.attachViewModel(viewModel);
        cellList.layout(400, 100);
        editor.setScrollTop(175);
        editor.visibleRanges = [{ start: 3, end: 8 }];
        const outline = getOutline(editor);
        const notebookOutlineEntries = outline.entries;
        const resultingMap = nbStickyTestHelper(
          domNode,
          editor,
          cellList,
          notebookOutlineEntries,
          ds
        );
        await assertSnapshot(resultingMap);
        outline.dispose();
      }
    );
  });
  test("test2: should render 0, 		visible range 6->9 so collapsing next 2 against following section", async () => {
    await withTestNotebook(
      [
        ["# header a", "markdown", CellKind.Markup, [], {}],
        // 0
        ["## header aa", "markdown", CellKind.Markup, [], {}],
        // 50
        ["### header aaa", "markdown", CellKind.Markup, [], {}],
        // 100
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 150
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 200
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 250
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 300
        ["# header b", "markdown", CellKind.Markup, [], {}],
        // 350
        ["var c = 2;", "javascript", CellKind.Code, [], {}]
        // 400
      ],
      async (editor, viewModel, ds) => {
        viewModel.restoreEditorViewState({
          editingCells: Array.from({ length: 9 }, () => false),
          editorViewStates: Array.from({ length: 9 }, () => null),
          cellTotalHeights: Array.from({ length: 9 }, () => 50),
          cellLineNumberStates: {},
          collapsedInputCells: {},
          collapsedOutputCells: {}
        });
        const cellList = ds.add(
          createNotebookCellList(instantiationService, ds)
        );
        cellList.attachViewModel(viewModel);
        cellList.layout(400, 100);
        editor.setScrollTop(325);
        editor.visibleRanges = [{ start: 6, end: 9 }];
        const outline = getOutline(editor);
        const notebookOutlineEntries = outline.entries;
        const resultingMap = nbStickyTestHelper(
          domNode,
          editor,
          cellList,
          notebookOutlineEntries,
          ds
        );
        await assertSnapshot(resultingMap);
        outline.dispose();
      }
    );
  });
  test("test3: should render 0->2, 	collapsing against equivalent level header", async () => {
    await withTestNotebook(
      [
        ["# header a", "markdown", CellKind.Markup, [], {}],
        // 0
        ["## header aa", "markdown", CellKind.Markup, [], {}],
        // 50
        ["### header aaa", "markdown", CellKind.Markup, [], {}],
        // 100
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 150
        ["### header aab", "markdown", CellKind.Markup, [], {}],
        // 200
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 250
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 300
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        // 350
        ["# header b", "markdown", CellKind.Markup, [], {}],
        // 400
        ["var c = 2;", "javascript", CellKind.Code, [], {}]
        // 450
      ],
      async (editor, viewModel, ds) => {
        viewModel.restoreEditorViewState({
          editingCells: Array.from({ length: 10 }, () => false),
          editorViewStates: Array.from({ length: 10 }, () => null),
          cellTotalHeights: Array.from({ length: 10 }, () => 50),
          cellLineNumberStates: {},
          collapsedInputCells: {},
          collapsedOutputCells: {}
        });
        const cellList = ds.add(
          createNotebookCellList(instantiationService, ds)
        );
        cellList.attachViewModel(viewModel);
        cellList.layout(400, 100);
        editor.setScrollTop(175);
        editor.visibleRanges = [{ start: 3, end: 10 }];
        const outline = getOutline(editor);
        const notebookOutlineEntries = outline.entries;
        const resultingMap = nbStickyTestHelper(
          domNode,
          editor,
          cellList,
          notebookOutlineEntries,
          ds
        );
        await assertSnapshot(resultingMap);
        outline.dispose();
      }
    );
  });
  test("test4: should render 0, 		scrolltop halfway through cell 0", async () => {
    await withTestNotebook(
      [
        ["# header a", "markdown", CellKind.Markup, [], {}],
        ["## header aa", "markdown", CellKind.Markup, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["# header b", "markdown", CellKind.Markup, [], {}],
        ["var c = 2;", "javascript", CellKind.Code, [], {}]
      ],
      async (editor, viewModel, ds) => {
        viewModel.restoreEditorViewState({
          editingCells: Array.from({ length: 8 }, () => false),
          editorViewStates: Array.from({ length: 8 }, () => null),
          cellTotalHeights: Array.from({ length: 8 }, () => 50),
          cellLineNumberStates: {},
          collapsedInputCells: {},
          collapsedOutputCells: {}
        });
        const cellList = ds.add(
          createNotebookCellList(instantiationService, ds)
        );
        cellList.attachViewModel(viewModel);
        cellList.layout(400, 100);
        editor.setScrollTop(50);
        editor.visibleRanges = [{ start: 0, end: 8 }];
        const outline = getOutline(editor);
        const notebookOutlineEntries = outline.entries;
        const resultingMap = nbStickyTestHelper(
          domNode,
          editor,
          cellList,
          notebookOutlineEntries,
          ds
        );
        await assertSnapshot(resultingMap);
        outline.dispose();
      }
    );
  });
  test("test5: should render 0->2, 	scrolltop halfway through cell 2", async () => {
    await withTestNotebook(
      [
        ["# header a", "markdown", CellKind.Markup, [], {}],
        ["## header aa", "markdown", CellKind.Markup, [], {}],
        ["### header aaa", "markdown", CellKind.Markup, [], {}],
        ["#### header aaaa", "markdown", CellKind.Markup, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["# header b", "markdown", CellKind.Markup, [], {}],
        ["var c = 2;", "javascript", CellKind.Code, [], {}]
      ],
      async (editor, viewModel, ds) => {
        viewModel.restoreEditorViewState({
          editingCells: Array.from({ length: 10 }, () => false),
          editorViewStates: Array.from({ length: 10 }, () => null),
          cellTotalHeights: Array.from({ length: 10 }, () => 50),
          cellLineNumberStates: {},
          collapsedInputCells: {},
          collapsedOutputCells: {}
        });
        const cellList = ds.add(
          createNotebookCellList(instantiationService, ds)
        );
        cellList.attachViewModel(viewModel);
        cellList.layout(400, 100);
        editor.setScrollTop(125);
        editor.visibleRanges = [{ start: 2, end: 10 }];
        const outline = getOutline(editor);
        const notebookOutlineEntries = outline.entries;
        const resultingMap = nbStickyTestHelper(
          domNode,
          editor,
          cellList,
          notebookOutlineEntries,
          ds
        );
        await assertSnapshot(resultingMap);
        outline.dispose();
      }
    );
  });
  test("test6: should render 6->7, 	scrolltop halfway through cell 7", async () => {
    await withTestNotebook(
      [
        ["# header a", "markdown", CellKind.Markup, [], {}],
        ["## header aa", "markdown", CellKind.Markup, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        ["# header b", "markdown", CellKind.Markup, [], {}],
        ["## header bb", "markdown", CellKind.Markup, [], {}],
        ["### header bbb", "markdown", CellKind.Markup, [], {}],
        ["var c = 2;", "javascript", CellKind.Code, [], {}]
      ],
      async (editor, viewModel, ds) => {
        viewModel.restoreEditorViewState({
          editingCells: Array.from({ length: 10 }, () => false),
          editorViewStates: Array.from({ length: 10 }, () => null),
          cellTotalHeights: Array.from({ length: 10 }, () => 50),
          cellLineNumberStates: {},
          collapsedInputCells: {},
          collapsedOutputCells: {}
        });
        const cellList = ds.add(
          createNotebookCellList(instantiationService, ds)
        );
        cellList.attachViewModel(viewModel);
        cellList.layout(400, 100);
        editor.setScrollTop(375);
        editor.visibleRanges = [{ start: 7, end: 10 }];
        const outline = getOutline(editor);
        const notebookOutlineEntries = outline.entries;
        const resultingMap = nbStickyTestHelper(
          domNode,
          editor,
          cellList,
          notebookOutlineEntries,
          ds
        );
        await assertSnapshot(resultingMap);
        outline.dispose();
      }
    );
  });
  test("test7: should render 0->1, 	collapsing against next section", async () => {
    await withTestNotebook(
      [
        ["# header a", "markdown", CellKind.Markup, [], {}],
        //0
        ["## header aa", "markdown", CellKind.Markup, [], {}],
        //50
        ["### header aaa", "markdown", CellKind.Markup, [], {}],
        //100
        ["#### header aaaa", "markdown", CellKind.Markup, [], {}],
        //150
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        //200
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        //250
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        //300
        ["var b = 1;", "javascript", CellKind.Code, [], {}],
        //350
        ["# header b", "markdown", CellKind.Markup, [], {}],
        //400
        ["## header bb", "markdown", CellKind.Markup, [], {}],
        //450
        ["### header bbb", "markdown", CellKind.Markup, [], {}],
        ["var c = 2;", "javascript", CellKind.Code, [], {}]
      ],
      async (editor, viewModel, ds) => {
        viewModel.restoreEditorViewState({
          editingCells: Array.from({ length: 12 }, () => false),
          editorViewStates: Array.from({ length: 12 }, () => null),
          cellTotalHeights: Array.from({ length: 12 }, () => 50),
          cellLineNumberStates: {},
          collapsedInputCells: {},
          collapsedOutputCells: {}
        });
        const cellList = ds.add(
          createNotebookCellList(instantiationService, ds)
        );
        cellList.attachViewModel(viewModel);
        cellList.layout(400, 100);
        editor.setScrollTop(350);
        editor.visibleRanges = [{ start: 7, end: 12 }];
        const outline = getOutline(editor);
        const notebookOutlineEntries = outline.entries;
        const resultingMap = nbStickyTestHelper(
          domNode,
          editor,
          cellList,
          notebookOutlineEntries,
          ds
        );
        await assertSnapshot(resultingMap);
        outline.dispose();
      }
    );
  });
});
