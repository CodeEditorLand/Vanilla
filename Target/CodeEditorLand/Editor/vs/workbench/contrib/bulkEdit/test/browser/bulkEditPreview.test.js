import assert from "assert";
import { Event } from "../../../../../base/common/event.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  ResourceFileEdit,
  ResourceTextEdit
} from "../../../../../editor/browser/services/bulkEditService.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { InstantiationService } from "../../../../../platform/instantiation/common/instantiationService.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { mock } from "../../../../test/common/workbenchTestServices.js";
import { BulkFileOperations } from "../../browser/preview/bulkEditPreview.js";
suite("BulkEditPreview", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instaService;
  setup(() => {
    const fileService = new class extends mock() {
      onDidFilesChange = Event.None;
      async exists() {
        return true;
      }
    }();
    const modelService = new class extends mock() {
      getModel() {
        return null;
      }
      getModels() {
        return [];
      }
    }();
    instaService = new InstantiationService(
      new ServiceCollection(
        [IFileService, fileService],
        [IModelService, modelService]
      )
    );
  });
  test("one needsConfirmation unchecks all of file", async () => {
    const edits = [
      new ResourceFileEdit(
        void 0,
        URI.parse("some:///uri1"),
        void 0,
        { label: "cat1", needsConfirmation: true }
      ),
      new ResourceFileEdit(
        URI.parse("some:///uri1"),
        URI.parse("some:///uri2"),
        void 0,
        { label: "cat2", needsConfirmation: false }
      )
    ];
    const ops = await instaService.invokeFunction(
      BulkFileOperations.create,
      edits
    );
    store.add(ops);
    assert.strictEqual(ops.fileOperations.length, 1);
    assert.strictEqual(ops.checked.isChecked(edits[0]), false);
  });
  test("has categories", async () => {
    const edits = [
      new ResourceFileEdit(
        void 0,
        URI.parse("some:///uri1"),
        void 0,
        { label: "uri1", needsConfirmation: true }
      ),
      new ResourceFileEdit(
        void 0,
        URI.parse("some:///uri2"),
        void 0,
        { label: "uri2", needsConfirmation: false }
      )
    ];
    const ops = await instaService.invokeFunction(
      BulkFileOperations.create,
      edits
    );
    store.add(ops);
    assert.strictEqual(ops.categories.length, 2);
    assert.strictEqual(ops.categories[0].metadata.label, "uri1");
    assert.strictEqual(ops.categories[1].metadata.label, "uri2");
  });
  test("has not categories", async () => {
    const edits = [
      new ResourceFileEdit(
        void 0,
        URI.parse("some:///uri1"),
        void 0,
        { label: "uri1", needsConfirmation: true }
      ),
      new ResourceFileEdit(
        void 0,
        URI.parse("some:///uri2"),
        void 0,
        { label: "uri1", needsConfirmation: false }
      )
    ];
    const ops = await instaService.invokeFunction(
      BulkFileOperations.create,
      edits
    );
    store.add(ops);
    assert.strictEqual(ops.categories.length, 1);
    assert.strictEqual(ops.categories[0].metadata.label, "uri1");
    assert.strictEqual(ops.categories[0].metadata.label, "uri1");
  });
  test("category selection", async () => {
    const edits = [
      new ResourceFileEdit(
        void 0,
        URI.parse("some:///uri1"),
        void 0,
        { label: "C1", needsConfirmation: false }
      ),
      new ResourceTextEdit(
        URI.parse("some:///uri2"),
        { text: "foo", range: new Range(1, 1, 1, 1) },
        void 0,
        { label: "C2", needsConfirmation: false }
      )
    ];
    const ops = await instaService.invokeFunction(
      BulkFileOperations.create,
      edits
    );
    store.add(ops);
    assert.strictEqual(ops.checked.isChecked(edits[0]), true);
    assert.strictEqual(ops.checked.isChecked(edits[1]), true);
    assert.ok(edits === ops.getWorkspaceEdit());
    ops.checked.updateChecked(edits[0], false);
    const newEdits = ops.getWorkspaceEdit();
    assert.ok(edits !== newEdits);
    assert.strictEqual(edits.length, 2);
    assert.strictEqual(newEdits.length, 1);
  });
  test("fix bad metadata", async () => {
    const edits = [
      new ResourceFileEdit(
        void 0,
        URI.parse("some:///uri1"),
        void 0,
        { label: "C1", needsConfirmation: true }
      ),
      new ResourceTextEdit(
        URI.parse("some:///uri1"),
        { text: "foo", range: new Range(1, 1, 1, 1) },
        void 0,
        { label: "C2", needsConfirmation: false }
      )
    ];
    const ops = await instaService.invokeFunction(
      BulkFileOperations.create,
      edits
    );
    store.add(ops);
    assert.strictEqual(ops.checked.isChecked(edits[0]), false);
    assert.strictEqual(ops.checked.isChecked(edits[1]), false);
  });
});
