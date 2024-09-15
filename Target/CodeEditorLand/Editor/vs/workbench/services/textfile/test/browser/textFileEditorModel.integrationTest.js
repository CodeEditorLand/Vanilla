var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { TextFileEditorModel } from "../../common/textFileEditorModel.js";
import { workbenchInstantiationService, TestServiceAccessor } from "../../../../test/browser/workbenchTestServices.js";
import { ensureNoDisposablesAreLeakedInTestSuite, toResource } from "../../../../../base/test/common/utils.js";
import { TextFileEditorModelManager } from "../../common/textFileEditorModelManager.js";
import { createTextBufferFactoryFromStream } from "../../../../../editor/common/model/textModel.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { URI } from "../../../../../base/common/uri.js";
import { bufferToStream, VSBuffer } from "../../../../../base/common/buffer.js";
import { DisposableStore, toDisposable } from "../../../../../base/common/lifecycle.js";
suite("Files - TextFileEditorModel (integration)", () => {
  const disposables = new DisposableStore();
  let instantiationService;
  let accessor;
  let content;
  setup(() => {
    instantiationService = workbenchInstantiationService(void 0, disposables);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    content = accessor.fileService.getContent();
    disposables.add(toDisposable(() => accessor.fileService.setContent(content)));
    disposables.add(accessor.textFileService.files);
  });
  teardown(() => {
    disposables.clear();
  });
  test("backup and restore (simple)", async function() {
    return testBackupAndRestore(toResource.call(this, "/path/index_async.txt"), toResource.call(this, "/path/index_async2.txt"), "Some very small file text content.");
  });
  test("backup and restore (large, #121347)", async function() {
    const largeContent = "\uAD6D\uC5B4\uD55C\n".repeat(1e5);
    return testBackupAndRestore(toResource.call(this, "/path/index_async.txt"), toResource.call(this, "/path/index_async2.txt"), largeContent);
  });
  async function testBackupAndRestore(resourceA, resourceB, contents) {
    const originalModel = disposables.add(instantiationService.createInstance(TextFileEditorModel, resourceA, "utf8", void 0));
    await originalModel.resolve({
      contents: await createTextBufferFactoryFromStream(await accessor.textFileService.getDecodedStream(resourceA, bufferToStream(VSBuffer.fromString(contents))))
    });
    assert.strictEqual(originalModel.textEditorModel?.getValue(), contents);
    const backup = await originalModel.backup(CancellationToken.None);
    const modelRestoredIdentifier = { typeId: originalModel.typeId, resource: resourceB };
    await accessor.workingCopyBackupService.backup(modelRestoredIdentifier, backup.content);
    const modelRestored = disposables.add(instantiationService.createInstance(TextFileEditorModel, modelRestoredIdentifier.resource, "utf8", void 0));
    await modelRestored.resolve();
    assert.strictEqual(modelRestored.textEditorModel?.getValue(), contents);
    assert.strictEqual(modelRestored.isDirty(), true);
  }
  __name(testBackupAndRestore, "testBackupAndRestore");
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=textFileEditorModel.integrationTest.js.map
