var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { VSBufferReadableStream, newWriteableBufferStream, VSBuffer, streamToBuffer, bufferToStream, readableToBuffer, VSBufferReadable } from "../../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { basename } from "../../../../../base/common/resources.js";
import { consumeReadable, consumeStream, isReadable, isReadableStream } from "../../../../../base/common/stream.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { SnapshotContext } from "../../common/fileWorkingCopy.js";
import { IUntitledFileWorkingCopyModel, IUntitledFileWorkingCopyModelContentChangedEvent, IUntitledFileWorkingCopyModelFactory, UntitledFileWorkingCopy } from "../../common/untitledFileWorkingCopy.js";
import { TestServiceAccessor, workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
class TestUntitledFileWorkingCopyModel extends Disposable {
  constructor(resource, contents) {
    super();
    this.resource = resource;
    this.contents = contents;
  }
  static {
    __name(this, "TestUntitledFileWorkingCopyModel");
  }
  _onDidChangeContent = this._register(new Emitter());
  onDidChangeContent = this._onDidChangeContent.event;
  _onWillDispose = this._register(new Emitter());
  onWillDispose = this._onWillDispose.event;
  fireContentChangeEvent(event) {
    this._onDidChangeContent.fire(event);
  }
  updateContents(newContents) {
    this.doUpdate(newContents);
  }
  throwOnSnapshot = false;
  setThrowOnSnapshot() {
    this.throwOnSnapshot = true;
  }
  async snapshot(context, token) {
    if (this.throwOnSnapshot) {
      throw new Error("Fail");
    }
    const stream = newWriteableBufferStream();
    stream.end(VSBuffer.fromString(this.contents));
    return stream;
  }
  async update(contents, token) {
    this.doUpdate((await streamToBuffer(contents)).toString());
  }
  doUpdate(newContents) {
    this.contents = newContents;
    this.versionId++;
    this._onDidChangeContent.fire({ isInitial: newContents.length === 0 });
  }
  versionId = 0;
  pushedStackElement = false;
  pushStackElement() {
    this.pushedStackElement = true;
  }
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
}
class TestUntitledFileWorkingCopyModelFactory {
  static {
    __name(this, "TestUntitledFileWorkingCopyModelFactory");
  }
  async createModel(resource, contents, token) {
    return new TestUntitledFileWorkingCopyModel(resource, (await streamToBuffer(contents)).toString());
  }
}
suite("UntitledFileWorkingCopy", () => {
  const factory = new TestUntitledFileWorkingCopyModelFactory();
  const disposables = new DisposableStore();
  const resource = URI.from({ scheme: Schemas.untitled, path: "Untitled-1" });
  let instantiationService;
  let accessor;
  let workingCopy;
  function createWorkingCopy(uri = resource, hasAssociatedFilePath = false, initialValue = "") {
    return disposables.add(new UntitledFileWorkingCopy(
      "testUntitledWorkingCopyType",
      uri,
      basename(uri),
      hasAssociatedFilePath,
      false,
      initialValue.length > 0 ? { value: bufferToStream(VSBuffer.fromString(initialValue)) } : void 0,
      factory,
      async (workingCopy2) => {
        await workingCopy2.revert();
        return true;
      },
      accessor.workingCopyService,
      accessor.workingCopyBackupService,
      accessor.logService
    ));
  }
  __name(createWorkingCopy, "createWorkingCopy");
  setup(() => {
    instantiationService = workbenchInstantiationService(void 0, disposables);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    workingCopy = disposables.add(createWorkingCopy());
  });
  teardown(() => {
    disposables.clear();
  });
  test("registers with working copy service", async () => {
    assert.strictEqual(accessor.workingCopyService.workingCopies.length, 1);
    workingCopy.dispose();
    assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
  });
  test("dirty", async () => {
    assert.strictEqual(workingCopy.isDirty(), false);
    let changeDirtyCounter = 0;
    disposables.add(workingCopy.onDidChangeDirty(() => {
      changeDirtyCounter++;
    }));
    let contentChangeCounter = 0;
    disposables.add(workingCopy.onDidChangeContent(() => {
      contentChangeCounter++;
    }));
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isResolved(), true);
    workingCopy.model?.updateContents("hello dirty");
    assert.strictEqual(contentChangeCounter, 1);
    assert.strictEqual(workingCopy.isDirty(), true);
    assert.strictEqual(changeDirtyCounter, 1);
    await workingCopy.save();
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(changeDirtyCounter, 2);
  });
  test("dirty - cleared when content event signals isEmpty", async () => {
    assert.strictEqual(workingCopy.isDirty(), false);
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello dirty");
    assert.strictEqual(workingCopy.isDirty(), true);
    workingCopy.model?.fireContentChangeEvent({ isInitial: true });
    assert.strictEqual(workingCopy.isDirty(), false);
  });
  test("dirty - not cleared when content event signals isEmpty when associated resource", async () => {
    workingCopy.dispose();
    workingCopy = createWorkingCopy(resource, true);
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello dirty");
    assert.strictEqual(workingCopy.isDirty(), true);
    workingCopy.model?.fireContentChangeEvent({ isInitial: true });
    assert.strictEqual(workingCopy.isDirty(), true);
  });
  test("revert", async () => {
    let revertCounter = 0;
    disposables.add(workingCopy.onDidRevert(() => {
      revertCounter++;
    }));
    let disposeCounter = 0;
    disposables.add(workingCopy.onWillDispose(() => {
      disposeCounter++;
    }));
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello dirty");
    assert.strictEqual(workingCopy.isDirty(), true);
    await workingCopy.revert();
    assert.strictEqual(revertCounter, 1);
    assert.strictEqual(disposeCounter, 1);
    assert.strictEqual(workingCopy.isDirty(), false);
  });
  test("dispose", async () => {
    let disposeCounter = 0;
    disposables.add(workingCopy.onWillDispose(() => {
      disposeCounter++;
    }));
    await workingCopy.resolve();
    workingCopy.dispose();
    assert.strictEqual(disposeCounter, 1);
  });
  test("backup", async () => {
    assert.strictEqual((await workingCopy.backup(CancellationToken.None)).content, void 0);
    await workingCopy.resolve();
    workingCopy.model?.updateContents("Hello Backup");
    const backup = await workingCopy.backup(CancellationToken.None);
    let backupContents = void 0;
    if (isReadableStream(backup.content)) {
      backupContents = (await consumeStream(backup.content, (chunks) => VSBuffer.concat(chunks))).toString();
    } else if (backup.content) {
      backupContents = consumeReadable(backup.content, (chunks) => VSBuffer.concat(chunks)).toString();
    }
    assert.strictEqual(backupContents, "Hello Backup");
  });
  test("resolve - without contents", async () => {
    assert.strictEqual(workingCopy.isResolved(), false);
    assert.strictEqual(workingCopy.hasAssociatedFilePath, false);
    assert.strictEqual(workingCopy.model, void 0);
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isResolved(), true);
    assert.ok(workingCopy.model);
  });
  test("resolve - with initial contents", async () => {
    workingCopy.dispose();
    workingCopy = createWorkingCopy(resource, false, "Hello Initial");
    let contentChangeCounter = 0;
    disposables.add(workingCopy.onDidChangeContent(() => {
      contentChangeCounter++;
    }));
    assert.strictEqual(workingCopy.isDirty(), true);
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isDirty(), true);
    assert.strictEqual(workingCopy.model?.contents, "Hello Initial");
    assert.strictEqual(contentChangeCounter, 1);
    workingCopy.model.updateContents("Changed contents");
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.model?.contents, "Changed contents");
  });
  test("backup - with initial contents uses those even if unresolved", async () => {
    workingCopy.dispose();
    workingCopy = createWorkingCopy(resource, false, "Hello Initial");
    assert.strictEqual(workingCopy.isDirty(), true);
    const backup = (await workingCopy.backup(CancellationToken.None)).content;
    if (isReadableStream(backup)) {
      const value = await streamToBuffer(backup);
      assert.strictEqual(value.toString(), "Hello Initial");
    } else if (isReadable(backup)) {
      const value = readableToBuffer(backup);
      assert.strictEqual(value.toString(), "Hello Initial");
    } else {
      assert.fail("Missing untitled backup");
    }
  });
  test("resolve - with associated resource", async () => {
    workingCopy.dispose();
    workingCopy = createWorkingCopy(resource, true);
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isDirty(), true);
    assert.strictEqual(workingCopy.hasAssociatedFilePath, true);
  });
  test("resolve - with backup", async () => {
    await workingCopy.resolve();
    workingCopy.model?.updateContents("Hello Backup");
    const backup = await workingCopy.backup(CancellationToken.None);
    await accessor.workingCopyBackupService.backup(workingCopy, backup.content, void 0, backup.meta);
    assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(workingCopy), true);
    workingCopy.dispose();
    workingCopy = createWorkingCopy();
    let contentChangeCounter = 0;
    disposables.add(workingCopy.onDidChangeContent(() => {
      contentChangeCounter++;
    }));
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isDirty(), true);
    assert.strictEqual(workingCopy.model?.contents, "Hello Backup");
    assert.strictEqual(contentChangeCounter, 1);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
export {
  TestUntitledFileWorkingCopyModel,
  TestUntitledFileWorkingCopyModelFactory
};
//# sourceMappingURL=untitledFileWorkingCopy.test.js.map
