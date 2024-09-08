import assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { URI } from "../../../../../base/common/uri.js";
import { mockObject } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  UndoRedoGroup,
  UndoRedoSource
} from "../../../../../platform/undoRedo/common/undoRedo.js";
import { TestEditorService } from "../../../../test/browser/workbenchTestServices.js";
import {
  CellEditType,
  CellUri
} from "../../../notebook/common/notebookCommon.js";
import {
  BulkCellEdits,
  ResourceNotebookCellEdit
} from "../../browser/bulkCellEdits.js";
suite("BulkCellEdits", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  async function runTest(inputUri, resolveUri) {
    const progress = { report: (_) => {
    } };
    const editorService = store.add(new TestEditorService());
    const notebook = mockObject()();
    notebook.uri.returns(URI.file("/project/notebook.ipynb"));
    const notebookEditorModel = mockObject()({
      notebook
    });
    notebookEditorModel.isReadonly.returns(false);
    const notebookService = mockObject()();
    notebookService.resolve.returns({
      object: notebookEditorModel,
      dispose: () => {
      }
    });
    const edits = [
      new ResourceNotebookCellEdit(inputUri, {
        index: 0,
        count: 1,
        editType: CellEditType.Replace,
        cells: []
      })
    ];
    const bce = new BulkCellEdits(
      new UndoRedoGroup(),
      new UndoRedoSource(),
      progress,
      CancellationToken.None,
      edits,
      editorService,
      notebookService
    );
    await bce.apply();
    const resolveArgs = notebookService.resolve.args[0];
    assert.strictEqual(resolveArgs[0].toString(), resolveUri.toString());
  }
  const notebookUri = URI.file("/foo/bar.ipynb");
  test("works with notebook URI", async () => {
    await runTest(notebookUri, notebookUri);
  });
  test("maps cell URI to notebook URI", async () => {
    await runTest(CellUri.generate(notebookUri, 5), notebookUri);
  });
  test("throws for invalid cell URI", async () => {
    const badCellUri = CellUri.generate(notebookUri, 5).with({
      fragment: ""
    });
    await assert.rejects(
      async () => await runTest(badCellUri, notebookUri)
    );
  });
});
