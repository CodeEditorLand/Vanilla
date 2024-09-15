var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { TextFileEditorModel } from "../../../textfile/common/textFileEditorModel.js";
import { TextFileEditorModelManager } from "../../../textfile/common/textFileEditorModelManager.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ensureNoDisposablesAreLeakedInTestSuite, toResource } from "../../../../../base/test/common/utils.js";
import { workbenchInstantiationService, TestServiceAccessor, ITestTextFileEditorModelManager } from "../../../../test/browser/workbenchTestServices.js";
import { URI } from "../../../../../base/common/uri.js";
import { FileOperation } from "../../../../../platform/files/common/files.js";
import { TestWorkingCopy } from "../../../../test/common/workbenchTestServices.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { ICopyOperation } from "../../common/workingCopyFileService.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { timeout } from "../../../../../base/common/async.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
suite("WorkingCopyFileService", () => {
  const disposables = new DisposableStore();
  let instantiationService;
  let accessor;
  setup(() => {
    instantiationService = workbenchInstantiationService(void 0, disposables);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    disposables.add(accessor.textFileService.files);
  });
  teardown(() => {
    disposables.clear();
  });
  test("create - dirty file", async function() {
    await testCreate(toResource.call(this, "/path/file.txt"), VSBuffer.fromString("Hello World"));
  });
  test("delete - dirty file", async function() {
    await testDelete([toResource.call(this, "/path/file.txt")]);
  });
  test("delete multiple - dirty files", async function() {
    await testDelete([
      toResource.call(this, "/path/file1.txt"),
      toResource.call(this, "/path/file2.txt"),
      toResource.call(this, "/path/file3.txt"),
      toResource.call(this, "/path/file4.txt")
    ]);
  });
  test("move - dirty file", async function() {
    await testMoveOrCopy([{ source: toResource.call(this, "/path/file.txt"), target: toResource.call(this, "/path/file_target.txt") }], true);
  });
  test("move - source identical to target", async function() {
    const sourceModel = instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file.txt"), "utf8", void 0);
    accessor.textFileService.files.add(sourceModel.resource, sourceModel);
    const eventCounter = await testEventsMoveOrCopy([{ file: { source: sourceModel.resource, target: sourceModel.resource }, overwrite: true }], true);
    sourceModel.dispose();
    assert.strictEqual(eventCounter, 3);
  });
  test("move - one source == target and another source != target", async function() {
    const sourceModel1 = instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file1.txt"), "utf8", void 0);
    const sourceModel2 = instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file2.txt"), "utf8", void 0);
    const targetModel2 = instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file_target2.txt"), "utf8", void 0);
    accessor.textFileService.files.add(sourceModel1.resource, sourceModel1);
    accessor.textFileService.files.add(sourceModel2.resource, sourceModel2);
    accessor.textFileService.files.add(targetModel2.resource, targetModel2);
    const eventCounter = await testEventsMoveOrCopy([
      { file: { source: sourceModel1.resource, target: sourceModel1.resource }, overwrite: true },
      { file: { source: sourceModel2.resource, target: targetModel2.resource }, overwrite: true }
    ], true);
    sourceModel1.dispose();
    sourceModel2.dispose();
    targetModel2.dispose();
    assert.strictEqual(eventCounter, 3);
  });
  test("move multiple - dirty file", async function() {
    await testMoveOrCopy(
      [
        { source: toResource.call(this, "/path/file1.txt"), target: toResource.call(this, "/path/file1_target.txt") },
        { source: toResource.call(this, "/path/file2.txt"), target: toResource.call(this, "/path/file2_target.txt") }
      ],
      true
    );
  });
  test("move - dirty file (target exists and is dirty)", async function() {
    await testMoveOrCopy([{ source: toResource.call(this, "/path/file.txt"), target: toResource.call(this, "/path/file_target.txt") }], true, true);
  });
  test("copy - dirty file", async function() {
    await testMoveOrCopy([{ source: toResource.call(this, "/path/file.txt"), target: toResource.call(this, "/path/file_target.txt") }], false);
  });
  test("copy - source identical to target", async function() {
    const sourceModel = instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file.txt"), "utf8", void 0);
    accessor.textFileService.files.add(sourceModel.resource, sourceModel);
    const eventCounter = await testEventsMoveOrCopy([{ file: { source: sourceModel.resource, target: sourceModel.resource }, overwrite: true }]);
    sourceModel.dispose();
    assert.strictEqual(eventCounter, 3);
  });
  test("copy - one source == target and another source != target", async function() {
    const sourceModel1 = instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file1.txt"), "utf8", void 0);
    const sourceModel2 = instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file2.txt"), "utf8", void 0);
    const targetModel2 = instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file_target2.txt"), "utf8", void 0);
    accessor.textFileService.files.add(sourceModel1.resource, sourceModel1);
    accessor.textFileService.files.add(sourceModel2.resource, sourceModel2);
    accessor.textFileService.files.add(targetModel2.resource, targetModel2);
    const eventCounter = await testEventsMoveOrCopy([
      { file: { source: sourceModel1.resource, target: sourceModel1.resource }, overwrite: true },
      { file: { source: sourceModel2.resource, target: targetModel2.resource }, overwrite: true }
    ]);
    sourceModel1.dispose();
    sourceModel2.dispose();
    targetModel2.dispose();
    assert.strictEqual(eventCounter, 3);
  });
  test("copy multiple - dirty file", async function() {
    await testMoveOrCopy(
      [
        { source: toResource.call(this, "/path/file1.txt"), target: toResource.call(this, "/path/file_target1.txt") },
        { source: toResource.call(this, "/path/file2.txt"), target: toResource.call(this, "/path/file_target2.txt") },
        { source: toResource.call(this, "/path/file3.txt"), target: toResource.call(this, "/path/file_target3.txt") }
      ],
      false
    );
  });
  test("copy - dirty file (target exists and is dirty)", async function() {
    await testMoveOrCopy([{ source: toResource.call(this, "/path/file.txt"), target: toResource.call(this, "/path/file_target.txt") }], false, true);
  });
  test("getDirty", async function() {
    const model1 = instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file-1.txt"), "utf8", void 0);
    accessor.textFileService.files.add(model1.resource, model1);
    const model2 = instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file-2.txt"), "utf8", void 0);
    accessor.textFileService.files.add(model2.resource, model2);
    let dirty = accessor.workingCopyFileService.getDirty(model1.resource);
    assert.strictEqual(dirty.length, 0);
    await model1.resolve();
    model1.textEditorModel.setValue("foo");
    dirty = accessor.workingCopyFileService.getDirty(model1.resource);
    assert.strictEqual(dirty.length, 1);
    assert.strictEqual(dirty[0], model1);
    dirty = accessor.workingCopyFileService.getDirty(toResource.call(this, "/path"));
    assert.strictEqual(dirty.length, 1);
    assert.strictEqual(dirty[0], model1);
    await model2.resolve();
    model2.textEditorModel.setValue("bar");
    dirty = accessor.workingCopyFileService.getDirty(toResource.call(this, "/path"));
    assert.strictEqual(dirty.length, 2);
    model1.dispose();
    model2.dispose();
  });
  test("registerWorkingCopyProvider", async function() {
    const model1 = disposables.add(instantiationService.createInstance(TextFileEditorModel, toResource.call(this, "/path/file-1.txt"), "utf8", void 0));
    accessor.textFileService.files.add(model1.resource, model1);
    await model1.resolve();
    model1.textEditorModel.setValue("foo");
    const testWorkingCopy = disposables.add(new TestWorkingCopy(toResource.call(this, "/path/file-2.txt"), true));
    const registration = accessor.workingCopyFileService.registerWorkingCopyProvider(() => {
      return [model1, testWorkingCopy];
    });
    let dirty = accessor.workingCopyFileService.getDirty(model1.resource);
    assert.strictEqual(dirty.length, 2, "Should return default working copy + working copy from provider");
    assert.strictEqual(dirty[0], model1);
    assert.strictEqual(dirty[1], testWorkingCopy);
    registration.dispose();
    dirty = accessor.workingCopyFileService.getDirty(model1.resource);
    assert.strictEqual(dirty.length, 1, "Should have unregistered our provider");
    assert.strictEqual(dirty[0], model1);
  });
  test("createFolder", async function() {
    let eventCounter = 0;
    let correlationId = void 0;
    const resource = toResource.call(this, "/path/folder");
    disposables.add(accessor.workingCopyFileService.addFileOperationParticipant({
      participate: /* @__PURE__ */ __name(async (files, operation) => {
        assert.strictEqual(files.length, 1);
        const file = files[0];
        assert.strictEqual(file.target.toString(), resource.toString());
        assert.strictEqual(operation, FileOperation.CREATE);
        eventCounter++;
      }, "participate")
    }));
    disposables.add(accessor.workingCopyFileService.onWillRunWorkingCopyFileOperation((e) => {
      assert.strictEqual(e.files.length, 1);
      const file = e.files[0];
      assert.strictEqual(file.target.toString(), resource.toString());
      assert.strictEqual(e.operation, FileOperation.CREATE);
      correlationId = e.correlationId;
      eventCounter++;
    }));
    disposables.add(accessor.workingCopyFileService.onDidRunWorkingCopyFileOperation((e) => {
      assert.strictEqual(e.files.length, 1);
      const file = e.files[0];
      assert.strictEqual(file.target.toString(), resource.toString());
      assert.strictEqual(e.operation, FileOperation.CREATE);
      assert.strictEqual(e.correlationId, correlationId);
      eventCounter++;
    }));
    await accessor.workingCopyFileService.createFolder([{ resource }], CancellationToken.None);
    assert.strictEqual(eventCounter, 3);
  });
  test("cancellation of participants", async function() {
    const resource = toResource.call(this, "/path/folder");
    let canceled = false;
    disposables.add(accessor.workingCopyFileService.addFileOperationParticipant({
      participate: /* @__PURE__ */ __name(async (files, operation, info, t, token) => {
        await timeout(0);
        canceled = token.isCancellationRequested;
      }, "participate")
    }));
    let cts = new CancellationTokenSource();
    let promise = accessor.workingCopyFileService.create([{ resource }], cts.token);
    cts.cancel();
    await promise;
    assert.strictEqual(canceled, true);
    canceled = false;
    cts = new CancellationTokenSource();
    promise = accessor.workingCopyFileService.createFolder([{ resource }], cts.token);
    cts.cancel();
    await promise;
    assert.strictEqual(canceled, true);
    canceled = false;
    cts = new CancellationTokenSource();
    promise = accessor.workingCopyFileService.move([{ file: { source: resource, target: resource } }], cts.token);
    cts.cancel();
    await promise;
    assert.strictEqual(canceled, true);
    canceled = false;
    cts = new CancellationTokenSource();
    promise = accessor.workingCopyFileService.copy([{ file: { source: resource, target: resource } }], cts.token);
    cts.cancel();
    await promise;
    assert.strictEqual(canceled, true);
    canceled = false;
    cts = new CancellationTokenSource();
    promise = accessor.workingCopyFileService.delete([{ resource }], cts.token);
    cts.cancel();
    await promise;
    assert.strictEqual(canceled, true);
    canceled = false;
  });
  async function testEventsMoveOrCopy(files, move) {
    let eventCounter = 0;
    const participant = accessor.workingCopyFileService.addFileOperationParticipant({
      participate: /* @__PURE__ */ __name(async (files2) => {
        eventCounter++;
      }, "participate")
    });
    const listener1 = accessor.workingCopyFileService.onWillRunWorkingCopyFileOperation((e) => {
      eventCounter++;
    });
    const listener2 = accessor.workingCopyFileService.onDidRunWorkingCopyFileOperation((e) => {
      eventCounter++;
    });
    if (move) {
      await accessor.workingCopyFileService.move(files, CancellationToken.None);
    } else {
      await accessor.workingCopyFileService.copy(files, CancellationToken.None);
    }
    participant.dispose();
    listener1.dispose();
    listener2.dispose();
    return eventCounter;
  }
  __name(testEventsMoveOrCopy, "testEventsMoveOrCopy");
  async function testMoveOrCopy(files, move, targetDirty) {
    let eventCounter = 0;
    const models = await Promise.all(files.map(async ({ source, target }, i) => {
      const sourceModel = instantiationService.createInstance(TextFileEditorModel, source, "utf8", void 0);
      const targetModel = instantiationService.createInstance(TextFileEditorModel, target, "utf8", void 0);
      accessor.textFileService.files.add(sourceModel.resource, sourceModel);
      accessor.textFileService.files.add(targetModel.resource, targetModel);
      await sourceModel.resolve();
      sourceModel.textEditorModel.setValue("foo" + i);
      assert.ok(accessor.textFileService.isDirty(sourceModel.resource));
      if (targetDirty) {
        await targetModel.resolve();
        targetModel.textEditorModel.setValue("bar" + i);
        assert.ok(accessor.textFileService.isDirty(targetModel.resource));
      }
      return { sourceModel, targetModel };
    }));
    const participant = accessor.workingCopyFileService.addFileOperationParticipant({
      participate: /* @__PURE__ */ __name(async (files2, operation) => {
        for (let i = 0; i < files2.length; i++) {
          const { target, source } = files2[i];
          const { targetModel, sourceModel } = models[i];
          assert.strictEqual(target.toString(), targetModel.resource.toString());
          assert.strictEqual(source?.toString(), sourceModel.resource.toString());
        }
        eventCounter++;
        assert.strictEqual(operation, move ? FileOperation.MOVE : FileOperation.COPY);
      }, "participate")
    });
    let correlationId;
    const listener1 = accessor.workingCopyFileService.onWillRunWorkingCopyFileOperation((e) => {
      for (let i = 0; i < e.files.length; i++) {
        const { target, source } = files[i];
        const { targetModel, sourceModel } = models[i];
        assert.strictEqual(target.toString(), targetModel.resource.toString());
        assert.strictEqual(source?.toString(), sourceModel.resource.toString());
      }
      eventCounter++;
      correlationId = e.correlationId;
      assert.strictEqual(e.operation, move ? FileOperation.MOVE : FileOperation.COPY);
    });
    const listener2 = accessor.workingCopyFileService.onDidRunWorkingCopyFileOperation((e) => {
      for (let i = 0; i < e.files.length; i++) {
        const { target, source } = files[i];
        const { targetModel, sourceModel } = models[i];
        assert.strictEqual(target.toString(), targetModel.resource.toString());
        assert.strictEqual(source?.toString(), sourceModel.resource.toString());
      }
      eventCounter++;
      assert.strictEqual(e.operation, move ? FileOperation.MOVE : FileOperation.COPY);
      assert.strictEqual(e.correlationId, correlationId);
    });
    if (move) {
      await accessor.workingCopyFileService.move(models.map((model) => ({ file: { source: model.sourceModel.resource, target: model.targetModel.resource }, options: { overwrite: true } })), CancellationToken.None);
    } else {
      await accessor.workingCopyFileService.copy(models.map((model) => ({ file: { source: model.sourceModel.resource, target: model.targetModel.resource }, options: { overwrite: true } })), CancellationToken.None);
    }
    for (let i = 0; i < models.length; i++) {
      const { sourceModel, targetModel } = models[i];
      assert.strictEqual(targetModel.textEditorModel.getValue(), "foo" + i);
      if (move) {
        assert.ok(!accessor.textFileService.isDirty(sourceModel.resource));
      } else {
        assert.ok(accessor.textFileService.isDirty(sourceModel.resource));
      }
      assert.ok(accessor.textFileService.isDirty(targetModel.resource));
      sourceModel.dispose();
      targetModel.dispose();
    }
    assert.strictEqual(eventCounter, 3);
    participant.dispose();
    listener1.dispose();
    listener2.dispose();
  }
  __name(testMoveOrCopy, "testMoveOrCopy");
  async function testDelete(resources) {
    const models = await Promise.all(resources.map(async (resource) => {
      const model = instantiationService.createInstance(TextFileEditorModel, resource, "utf8", void 0);
      accessor.textFileService.files.add(model.resource, model);
      await model.resolve();
      model.textEditorModel.setValue("foo");
      assert.ok(accessor.workingCopyService.isDirty(model.resource));
      return model;
    }));
    let eventCounter = 0;
    let correlationId = void 0;
    const participant = accessor.workingCopyFileService.addFileOperationParticipant({
      participate: /* @__PURE__ */ __name(async (files, operation) => {
        for (let i = 0; i < models.length; i++) {
          const model = models[i];
          const file = files[i];
          assert.strictEqual(file.target.toString(), model.resource.toString());
        }
        assert.strictEqual(operation, FileOperation.DELETE);
        eventCounter++;
      }, "participate")
    });
    const listener1 = accessor.workingCopyFileService.onWillRunWorkingCopyFileOperation((e) => {
      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const file = e.files[i];
        assert.strictEqual(file.target.toString(), model.resource.toString());
      }
      assert.strictEqual(e.operation, FileOperation.DELETE);
      correlationId = e.correlationId;
      eventCounter++;
    });
    const listener2 = accessor.workingCopyFileService.onDidRunWorkingCopyFileOperation((e) => {
      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const file = e.files[i];
        assert.strictEqual(file.target.toString(), model.resource.toString());
      }
      assert.strictEqual(e.operation, FileOperation.DELETE);
      assert.strictEqual(e.correlationId, correlationId);
      eventCounter++;
    });
    await accessor.workingCopyFileService.delete(models.map((model) => ({ resource: model.resource })), CancellationToken.None);
    for (const model of models) {
      assert.ok(!accessor.workingCopyService.isDirty(model.resource));
      model.dispose();
    }
    assert.strictEqual(eventCounter, 3);
    participant.dispose();
    listener1.dispose();
    listener2.dispose();
  }
  __name(testDelete, "testDelete");
  async function testCreate(resource, contents) {
    const model = instantiationService.createInstance(TextFileEditorModel, resource, "utf8", void 0);
    accessor.textFileService.files.add(model.resource, model);
    await model.resolve();
    model.textEditorModel.setValue("foo");
    assert.ok(accessor.workingCopyService.isDirty(model.resource));
    let eventCounter = 0;
    let correlationId = void 0;
    disposables.add(accessor.workingCopyFileService.addFileOperationParticipant({
      participate: /* @__PURE__ */ __name(async (files, operation) => {
        assert.strictEqual(files.length, 1);
        const file = files[0];
        assert.strictEqual(file.target.toString(), model.resource.toString());
        assert.strictEqual(operation, FileOperation.CREATE);
        eventCounter++;
      }, "participate")
    }));
    disposables.add(accessor.workingCopyFileService.onWillRunWorkingCopyFileOperation((e) => {
      assert.strictEqual(e.files.length, 1);
      const file = e.files[0];
      assert.strictEqual(file.target.toString(), model.resource.toString());
      assert.strictEqual(e.operation, FileOperation.CREATE);
      correlationId = e.correlationId;
      eventCounter++;
    }));
    disposables.add(accessor.workingCopyFileService.onDidRunWorkingCopyFileOperation((e) => {
      assert.strictEqual(e.files.length, 1);
      const file = e.files[0];
      assert.strictEqual(file.target.toString(), model.resource.toString());
      assert.strictEqual(e.operation, FileOperation.CREATE);
      assert.strictEqual(e.correlationId, correlationId);
      eventCounter++;
    }));
    await accessor.workingCopyFileService.create([{ resource, contents }], CancellationToken.None);
    assert.ok(!accessor.workingCopyService.isDirty(model.resource));
    model.dispose();
    assert.strictEqual(eventCounter, 3);
  }
  __name(testCreate, "testCreate");
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=workingCopyFileService.test.js.map
