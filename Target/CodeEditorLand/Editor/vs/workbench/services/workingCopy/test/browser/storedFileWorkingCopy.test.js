var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Event, Emitter } from "../../../../../base/common/event.js";
import { URI } from "../../../../../base/common/uri.js";
import { StoredFileWorkingCopy, StoredFileWorkingCopyState, IStoredFileWorkingCopyModel, IStoredFileWorkingCopyModelContentChangedEvent, IStoredFileWorkingCopyModelFactory, isStoredFileWorkingCopySaveEvent, IStoredFileWorkingCopySaveEvent } from "../../common/storedFileWorkingCopy.js";
import { bufferToStream, newWriteableBufferStream, streamToBuffer, VSBuffer, VSBufferReadableStream } from "../../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { getLastResolvedFileStat, TestServiceAccessor, workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { basename } from "../../../../../base/common/resources.js";
import { FileChangesEvent, FileChangeType, FileOperationError, FileOperationResult, IFileStatWithMetadata, IWriteFileOptions, NotModifiedSinceFileOperationError } from "../../../../../platform/files/common/files.js";
import { SaveReason, SaveSourceRegistry } from "../../../../common/editor.js";
import { Promises, timeout } from "../../../../../base/common/async.js";
import { consumeReadable, consumeStream, isReadableStream } from "../../../../../base/common/stream.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { SnapshotContext } from "../../common/fileWorkingCopy.js";
import { assertIsDefined } from "../../../../../base/common/types.js";
class TestStoredFileWorkingCopyModel extends Disposable {
  constructor(resource, contents) {
    super();
    this.resource = resource;
    this.contents = contents;
  }
  static {
    __name(this, "TestStoredFileWorkingCopyModel");
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
    this._onDidChangeContent.fire({ isRedoing: false, isUndoing: false });
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
class TestStoredFileWorkingCopyModelWithCustomSave extends TestStoredFileWorkingCopyModel {
  static {
    __name(this, "TestStoredFileWorkingCopyModelWithCustomSave");
  }
  saveCounter = 0;
  throwOnSave = false;
  saveOperation = void 0;
  async save(options, token) {
    if (this.throwOnSave) {
      throw new Error("Fail");
    }
    if (this.saveOperation) {
      await this.saveOperation;
    }
    if (token.isCancellationRequested) {
      throw new Error("Canceled");
    }
    this.saveCounter++;
    return {
      resource: this.resource,
      ctime: 0,
      etag: "",
      isDirectory: false,
      isFile: true,
      mtime: 0,
      name: "resource2",
      size: 0,
      isSymbolicLink: false,
      readonly: false,
      locked: false,
      children: void 0
    };
  }
}
class TestStoredFileWorkingCopyModelFactory {
  static {
    __name(this, "TestStoredFileWorkingCopyModelFactory");
  }
  async createModel(resource, contents, token) {
    return new TestStoredFileWorkingCopyModel(resource, (await streamToBuffer(contents)).toString());
  }
}
class TestStoredFileWorkingCopyModelWithCustomSaveFactory {
  static {
    __name(this, "TestStoredFileWorkingCopyModelWithCustomSaveFactory");
  }
  async createModel(resource, contents, token) {
    return new TestStoredFileWorkingCopyModelWithCustomSave(resource, (await streamToBuffer(contents)).toString());
  }
}
suite("StoredFileWorkingCopy (with custom save)", function() {
  const factory = new TestStoredFileWorkingCopyModelWithCustomSaveFactory();
  const disposables = new DisposableStore();
  let instantiationService;
  let accessor;
  let workingCopy;
  setup(() => {
    instantiationService = workbenchInstantiationService(void 0, disposables);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    const resource = URI.file("test/resource");
    workingCopy = disposables.add(new StoredFileWorkingCopy("testStoredFileWorkingCopyType", resource, basename(resource), factory, (options) => workingCopy.resolve(options), accessor.fileService, accessor.logService, accessor.workingCopyFileService, accessor.filesConfigurationService, accessor.workingCopyBackupService, accessor.workingCopyService, accessor.notificationService, accessor.workingCopyEditorService, accessor.editorService, accessor.elevatedFileService, accessor.progressService));
  });
  teardown(() => {
    disposables.clear();
  });
  test("save (custom implemented)", async () => {
    let savedCounter = 0;
    let lastSaveEvent = void 0;
    disposables.add(workingCopy.onDidSave((e) => {
      savedCounter++;
      lastSaveEvent = e;
    }));
    let saveErrorCounter = 0;
    disposables.add(workingCopy.onDidSaveError(() => {
      saveErrorCounter++;
    }));
    await workingCopy.save();
    assert.strictEqual(savedCounter, 0);
    assert.strictEqual(saveErrorCounter, 0);
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello save");
    await workingCopy.save();
    assert.strictEqual(savedCounter, 1);
    assert.strictEqual(saveErrorCounter, 0);
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(lastSaveEvent.reason, SaveReason.EXPLICIT);
    assert.ok(lastSaveEvent.stat);
    assert.ok(isStoredFileWorkingCopySaveEvent(lastSaveEvent));
    assert.strictEqual(workingCopy.model?.pushedStackElement, true);
    assert.strictEqual(workingCopy.model.saveCounter, 1);
    workingCopy.model?.updateContents("hello save error");
    workingCopy.model.throwOnSave = true;
    await workingCopy.save();
    assert.strictEqual(saveErrorCounter, 1);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ERROR), true);
  });
  test("save cancelled (custom implemented)", async () => {
    let savedCounter = 0;
    let lastSaveEvent = void 0;
    disposables.add(workingCopy.onDidSave((e) => {
      savedCounter++;
      lastSaveEvent = e;
    }));
    let saveErrorCounter = 0;
    disposables.add(workingCopy.onDidSaveError(() => {
      saveErrorCounter++;
    }));
    await workingCopy.resolve();
    let resolve;
    workingCopy.model.saveOperation = new Promise((r) => resolve = r);
    workingCopy.model?.updateContents("first");
    const firstSave = workingCopy.save();
    workingCopy.model?.updateContents("second");
    const secondSave = workingCopy.save();
    resolve();
    await firstSave;
    await secondSave;
    assert.strictEqual(savedCounter, 1);
    assert.strictEqual(saveErrorCounter, 0);
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(lastSaveEvent.reason, SaveReason.EXPLICIT);
    assert.ok(lastSaveEvent.stat);
    assert.ok(isStoredFileWorkingCopySaveEvent(lastSaveEvent));
    assert.strictEqual(workingCopy.model?.pushedStackElement, true);
    assert.strictEqual(workingCopy.model.saveCounter, 1);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
suite("StoredFileWorkingCopy", function() {
  const factory = new TestStoredFileWorkingCopyModelFactory();
  const disposables = new DisposableStore();
  const resource = URI.file("test/resource");
  let instantiationService;
  let accessor;
  let workingCopy;
  function createWorkingCopy(uri = resource) {
    const workingCopy2 = new StoredFileWorkingCopy("testStoredFileWorkingCopyType", uri, basename(uri), factory, (options) => workingCopy2.resolve(options), accessor.fileService, accessor.logService, accessor.workingCopyFileService, accessor.filesConfigurationService, accessor.workingCopyBackupService, accessor.workingCopyService, accessor.notificationService, accessor.workingCopyEditorService, accessor.editorService, accessor.elevatedFileService, accessor.progressService);
    return workingCopy2;
  }
  __name(createWorkingCopy, "createWorkingCopy");
  setup(() => {
    instantiationService = workbenchInstantiationService(void 0, disposables);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    workingCopy = disposables.add(createWorkingCopy());
  });
  teardown(() => {
    workingCopy.dispose();
    for (const workingCopy2 of accessor.workingCopyService.workingCopies) {
      workingCopy2.dispose();
    }
    disposables.clear();
  });
  test("registers with working copy service", async () => {
    assert.strictEqual(accessor.workingCopyService.workingCopies.length, 1);
    workingCopy.dispose();
    assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
  });
  test("orphaned tracking", async () => {
    return runWithFakedTimers({}, async () => {
      assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN), false);
      let onDidChangeOrphanedPromise = Event.toPromise(workingCopy.onDidChangeOrphaned);
      accessor.fileService.notExistsSet.set(resource, true);
      accessor.fileService.fireFileChanges(new FileChangesEvent([{ resource, type: FileChangeType.DELETED }], false));
      await onDidChangeOrphanedPromise;
      assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN), true);
      onDidChangeOrphanedPromise = Event.toPromise(workingCopy.onDidChangeOrphaned);
      accessor.fileService.notExistsSet.delete(resource);
      accessor.fileService.fireFileChanges(new FileChangesEvent([{ resource, type: FileChangeType.ADDED }], false));
      await onDidChangeOrphanedPromise;
      assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN), false);
    });
  });
  test("dirty / modified", async () => {
    assert.strictEqual(workingCopy.isModified(), false);
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), false);
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isResolved(), true);
    let changeDirtyCounter = 0;
    disposables.add(workingCopy.onDidChangeDirty(() => {
      changeDirtyCounter++;
    }));
    let contentChangeCounter = 0;
    disposables.add(workingCopy.onDidChangeContent(() => {
      contentChangeCounter++;
    }));
    let savedCounter = 0;
    disposables.add(workingCopy.onDidSave(() => {
      savedCounter++;
    }));
    workingCopy.model?.updateContents("hello dirty");
    assert.strictEqual(contentChangeCounter, 1);
    assert.strictEqual(workingCopy.isModified(), true);
    assert.strictEqual(workingCopy.isDirty(), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), true);
    assert.strictEqual(changeDirtyCounter, 1);
    await workingCopy.save();
    assert.strictEqual(workingCopy.isModified(), false);
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), false);
    assert.strictEqual(changeDirtyCounter, 2);
    assert.strictEqual(savedCounter, 1);
    await workingCopy.resolve({ contents: bufferToStream(VSBuffer.fromString("hello dirty stream")) });
    assert.strictEqual(contentChangeCounter, 2);
    assert.strictEqual(workingCopy.isModified(), true);
    assert.strictEqual(workingCopy.isDirty(), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), true);
    assert.strictEqual(changeDirtyCounter, 3);
    await workingCopy.revert({ soft: true });
    assert.strictEqual(workingCopy.isModified(), false);
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), false);
    assert.strictEqual(changeDirtyCounter, 4);
    workingCopy.markModified();
    assert.strictEqual(workingCopy.isModified(), true);
    assert.strictEqual(workingCopy.isDirty(), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), true);
    assert.strictEqual(changeDirtyCounter, 5);
    await workingCopy.revert();
    assert.strictEqual(workingCopy.isModified(), false);
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), false);
    assert.strictEqual(changeDirtyCounter, 6);
  });
  test("dirty - working copy marks non-dirty when undo reaches saved version ID", async () => {
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello saved state");
    await workingCopy.save();
    assert.strictEqual(workingCopy.isDirty(), false);
    workingCopy.model?.updateContents("changing content once");
    assert.strictEqual(workingCopy.isDirty(), true);
    workingCopy.model.versionId--;
    workingCopy.model?.fireContentChangeEvent({ isRedoing: false, isUndoing: true });
    assert.strictEqual(workingCopy.isDirty(), false);
  });
  test("resolve (without backup)", async () => {
    let onDidResolveCounter = 0;
    disposables.add(workingCopy.onDidResolve(() => {
      onDidResolveCounter++;
    }));
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isResolved(), true);
    assert.strictEqual(onDidResolveCounter, 1);
    assert.strictEqual(workingCopy.model?.contents, "Hello Html");
    workingCopy.model?.updateContents("hello resolve");
    assert.strictEqual(workingCopy.isDirty(), true);
    await workingCopy.resolve();
    assert.strictEqual(onDidResolveCounter, 1);
    assert.strictEqual(workingCopy.model?.contents, "hello resolve");
    await workingCopy.resolve({ contents: bufferToStream(VSBuffer.fromString("hello initial contents")) });
    assert.strictEqual(workingCopy.isDirty(), true);
    assert.strictEqual(workingCopy.model?.contents, "hello initial contents");
    assert.strictEqual(onDidResolveCounter, 2);
    const pendingSave = workingCopy.save();
    await workingCopy.resolve();
    await pendingSave;
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(workingCopy.model?.contents, "hello initial contents");
    assert.strictEqual(onDidResolveCounter, 2);
    workingCopy.dispose();
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isDisposed(), true);
    assert.strictEqual(onDidResolveCounter, 2);
  });
  test("resolve (with backup)", async () => {
    await workingCopy.resolve({ contents: bufferToStream(VSBuffer.fromString("hello backup")) });
    const backup = await workingCopy.backup(CancellationToken.None);
    await accessor.workingCopyBackupService.backup(workingCopy, backup.content, void 0, backup.meta);
    assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(workingCopy), true);
    workingCopy.dispose();
    workingCopy = createWorkingCopy();
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isDirty(), true);
    assert.strictEqual(workingCopy.isReadonly(), false);
    assert.strictEqual(workingCopy.model?.contents, "hello backup");
    workingCopy.model.updateContents("hello updated");
    await workingCopy.save();
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(workingCopy.model?.contents, "Hello Html");
  });
  test("resolve (with backup, preserves metadata and orphaned state)", async () => {
    return runWithFakedTimers({}, async () => {
      await workingCopy.resolve({ contents: bufferToStream(VSBuffer.fromString("hello backup")) });
      const orphanedPromise = Event.toPromise(workingCopy.onDidChangeOrphaned);
      accessor.fileService.notExistsSet.set(resource, true);
      accessor.fileService.fireFileChanges(new FileChangesEvent([{ resource, type: FileChangeType.DELETED }], false));
      await orphanedPromise;
      assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN), true);
      const backup = await workingCopy.backup(CancellationToken.None);
      await accessor.workingCopyBackupService.backup(workingCopy, backup.content, void 0, backup.meta);
      assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(workingCopy), true);
      workingCopy.dispose();
      workingCopy = createWorkingCopy();
      await workingCopy.resolve();
      assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN), true);
      const backup2 = await workingCopy.backup(CancellationToken.None);
      assert.deepStrictEqual(backup.meta, backup2.meta);
    });
  });
  test("resolve (updates orphaned state accordingly)", async () => {
    return runWithFakedTimers({}, async () => {
      await workingCopy.resolve();
      const orphanedPromise = Event.toPromise(workingCopy.onDidChangeOrphaned);
      accessor.fileService.notExistsSet.set(resource, true);
      accessor.fileService.fireFileChanges(new FileChangesEvent([{ resource, type: FileChangeType.DELETED }], false));
      await orphanedPromise;
      assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN), true);
      accessor.fileService.notExistsSet.delete(resource);
      await workingCopy.resolve({ forceReadFromFile: true });
      assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN), false);
      try {
        accessor.fileService.readShouldThrowError = new FileOperationError("file not found", FileOperationResult.FILE_NOT_FOUND);
        await workingCopy.resolve();
        assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN), true);
      } finally {
        accessor.fileService.readShouldThrowError = void 0;
      }
    });
  });
  test("stat.readonly and stat.locked can change when decreased mtime is ignored", async function() {
    await workingCopy.resolve();
    const stat = assertIsDefined(getLastResolvedFileStat(workingCopy));
    try {
      accessor.fileService.readShouldThrowError = new NotModifiedSinceFileOperationError("error", { ...stat, mtime: stat.mtime - 1, readonly: !stat.readonly, locked: !stat.locked });
      await workingCopy.resolve();
    } finally {
      accessor.fileService.readShouldThrowError = void 0;
    }
    assert.strictEqual(getLastResolvedFileStat(workingCopy)?.mtime, stat.mtime, "mtime should not decrease");
    assert.notStrictEqual(getLastResolvedFileStat(workingCopy)?.readonly, stat.readonly, "readonly should have changed despite simultaneous attempt to decrease mtime");
    assert.notStrictEqual(getLastResolvedFileStat(workingCopy)?.locked, stat.locked, "locked should have changed despite simultaneous attempt to decrease mtime");
  });
  test("resolve (FILE_NOT_MODIFIED_SINCE can be handled for resolved working copies)", async () => {
    await workingCopy.resolve();
    try {
      accessor.fileService.readShouldThrowError = new FileOperationError("file not modified since", FileOperationResult.FILE_NOT_MODIFIED_SINCE);
      await workingCopy.resolve();
    } finally {
      accessor.fileService.readShouldThrowError = void 0;
    }
    assert.strictEqual(workingCopy.model?.contents, "Hello Html");
  });
  test("resolve (FILE_NOT_MODIFIED_SINCE still updates readonly state)", async () => {
    let readonlyChangeCounter = 0;
    disposables.add(workingCopy.onDidChangeReadonly(() => readonlyChangeCounter++));
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isReadonly(), false);
    const stat = await accessor.fileService.resolve(workingCopy.resource, { resolveMetadata: true });
    try {
      accessor.fileService.readShouldThrowError = new NotModifiedSinceFileOperationError("file not modified since", { ...stat, readonly: true });
      await workingCopy.resolve();
    } finally {
      accessor.fileService.readShouldThrowError = void 0;
    }
    assert.strictEqual(!!workingCopy.isReadonly(), true);
    assert.strictEqual(readonlyChangeCounter, 1);
    try {
      accessor.fileService.readShouldThrowError = new NotModifiedSinceFileOperationError("file not modified since", { ...stat, readonly: false });
      await workingCopy.resolve();
    } finally {
      accessor.fileService.readShouldThrowError = void 0;
    }
    assert.strictEqual(workingCopy.isReadonly(), false);
    assert.strictEqual(readonlyChangeCounter, 2);
  });
  test("resolve does not alter content when model content changed in parallel", async () => {
    await workingCopy.resolve();
    const resolvePromise = workingCopy.resolve();
    workingCopy.model?.updateContents("changed content");
    await resolvePromise;
    assert.strictEqual(workingCopy.isDirty(), true);
    assert.strictEqual(workingCopy.model?.contents, "changed content");
  });
  test("backup", async () => {
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello backup");
    const backup = await workingCopy.backup(CancellationToken.None);
    assert.ok(backup.meta);
    let backupContents = void 0;
    if (backup.content instanceof VSBuffer) {
      backupContents = backup.content.toString();
    } else if (isReadableStream(backup.content)) {
      backupContents = (await consumeStream(backup.content, (chunks) => VSBuffer.concat(chunks))).toString();
    } else if (backup.content) {
      backupContents = consumeReadable(backup.content, (chunks) => VSBuffer.concat(chunks)).toString();
    }
    assert.strictEqual(backupContents, "hello backup");
  });
  test("save (no errors) - simple", async () => {
    let savedCounter = 0;
    let lastSaveEvent = void 0;
    disposables.add(workingCopy.onDidSave((e) => {
      savedCounter++;
      lastSaveEvent = e;
    }));
    let saveErrorCounter = 0;
    disposables.add(workingCopy.onDidSaveError(() => {
      saveErrorCounter++;
    }));
    await workingCopy.save();
    assert.strictEqual(savedCounter, 0);
    assert.strictEqual(saveErrorCounter, 0);
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello save");
    await workingCopy.save();
    assert.strictEqual(savedCounter, 1);
    assert.strictEqual(saveErrorCounter, 0);
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(lastSaveEvent.reason, SaveReason.EXPLICIT);
    assert.ok(lastSaveEvent.stat);
    assert.ok(isStoredFileWorkingCopySaveEvent(lastSaveEvent));
    assert.strictEqual(workingCopy.model?.pushedStackElement, true);
  });
  test("save (no errors) - save reason", async () => {
    let savedCounter = 0;
    let lastSaveEvent = void 0;
    disposables.add(workingCopy.onDidSave((e) => {
      savedCounter++;
      lastSaveEvent = e;
    }));
    let saveErrorCounter = 0;
    disposables.add(workingCopy.onDidSaveError(() => {
      saveErrorCounter++;
    }));
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello save");
    const source = SaveSourceRegistry.registerSource("testSource", "Hello Save");
    await workingCopy.save({ reason: SaveReason.AUTO, source });
    assert.strictEqual(savedCounter, 1);
    assert.strictEqual(saveErrorCounter, 0);
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(lastSaveEvent.reason, SaveReason.AUTO);
    assert.strictEqual(lastSaveEvent.source, source);
  });
  test("save (no errors) - multiple", async () => {
    let savedCounter = 0;
    disposables.add(workingCopy.onDidSave((e) => {
      savedCounter++;
    }));
    let saveErrorCounter = 0;
    disposables.add(workingCopy.onDidSaveError(() => {
      saveErrorCounter++;
    }));
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello save");
    await Promises.settled([
      workingCopy.save({ reason: SaveReason.AUTO }),
      workingCopy.save({ reason: SaveReason.EXPLICIT }),
      workingCopy.save({ reason: SaveReason.WINDOW_CHANGE })
    ]);
    assert.strictEqual(savedCounter, 1);
    assert.strictEqual(saveErrorCounter, 0);
    assert.strictEqual(workingCopy.isDirty(), false);
  });
  test("save (no errors) - multiple, cancellation", async () => {
    let savedCounter = 0;
    disposables.add(workingCopy.onDidSave((e) => {
      savedCounter++;
    }));
    let saveErrorCounter = 0;
    disposables.add(workingCopy.onDidSaveError(() => {
      saveErrorCounter++;
    }));
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello save");
    const firstSave = workingCopy.save();
    workingCopy.model?.updateContents("hello save more");
    const secondSave = workingCopy.save();
    await Promises.settled([firstSave, secondSave]);
    assert.strictEqual(savedCounter, 1);
    assert.strictEqual(saveErrorCounter, 0);
    assert.strictEqual(workingCopy.isDirty(), false);
  });
  test("save (no errors) - not forced but not dirty", async () => {
    let savedCounter = 0;
    disposables.add(workingCopy.onDidSave((e) => {
      savedCounter++;
    }));
    let saveErrorCounter = 0;
    disposables.add(workingCopy.onDidSaveError(() => {
      saveErrorCounter++;
    }));
    await workingCopy.resolve();
    await workingCopy.save();
    assert.strictEqual(savedCounter, 0);
    assert.strictEqual(saveErrorCounter, 0);
    assert.strictEqual(workingCopy.isDirty(), false);
  });
  test("save (no errors) - forced but not dirty", async () => {
    let savedCounter = 0;
    disposables.add(workingCopy.onDidSave((e) => {
      savedCounter++;
    }));
    let saveErrorCounter = 0;
    disposables.add(workingCopy.onDidSaveError(() => {
      saveErrorCounter++;
    }));
    await workingCopy.resolve();
    await workingCopy.save({ force: true });
    assert.strictEqual(savedCounter, 1);
    assert.strictEqual(saveErrorCounter, 0);
    assert.strictEqual(workingCopy.isDirty(), false);
  });
  test("save (no errors) - save clears orphaned", async () => {
    return runWithFakedTimers({}, async () => {
      let savedCounter = 0;
      disposables.add(workingCopy.onDidSave((e) => {
        savedCounter++;
      }));
      let saveErrorCounter = 0;
      disposables.add(workingCopy.onDidSaveError(() => {
        saveErrorCounter++;
      }));
      await workingCopy.resolve();
      const orphanedPromise = Event.toPromise(workingCopy.onDidChangeOrphaned);
      accessor.fileService.notExistsSet.set(resource, true);
      accessor.fileService.fireFileChanges(new FileChangesEvent([{ resource, type: FileChangeType.DELETED }], false));
      await orphanedPromise;
      assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN), true);
      await workingCopy.save({ force: true });
      assert.strictEqual(savedCounter, 1);
      assert.strictEqual(saveErrorCounter, 0);
      assert.strictEqual(workingCopy.isDirty(), false);
      assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN), false);
    });
  });
  test("save (errors)", async () => {
    let savedCounter = 0;
    disposables.add(workingCopy.onDidSave((reason) => {
      savedCounter++;
    }));
    let saveErrorCounter = 0;
    disposables.add(workingCopy.onDidSaveError(() => {
      saveErrorCounter++;
    }));
    await workingCopy.resolve();
    try {
      accessor.fileService.writeShouldThrowError = new FileOperationError("write error", FileOperationResult.FILE_PERMISSION_DENIED);
      await workingCopy.save({ force: true });
    } finally {
      accessor.fileService.writeShouldThrowError = void 0;
    }
    assert.strictEqual(savedCounter, 0);
    assert.strictEqual(saveErrorCounter, 1);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ERROR), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.SAVED), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.PENDING_SAVE), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.CONFLICT), false);
    assert.strictEqual(workingCopy.isDirty(), true);
    await workingCopy.save({ reason: SaveReason.AUTO });
    assert.strictEqual(savedCounter, 0);
    assert.strictEqual(saveErrorCounter, 1);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ERROR), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.SAVED), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.PENDING_SAVE), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.CONFLICT), false);
    assert.strictEqual(workingCopy.isDirty(), true);
    await workingCopy.save({ reason: SaveReason.EXPLICIT });
    assert.strictEqual(savedCounter, 1);
    assert.strictEqual(saveErrorCounter, 1);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ERROR), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.SAVED), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.PENDING_SAVE), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.CONFLICT), false);
    assert.strictEqual(workingCopy.isDirty(), false);
    try {
      accessor.fileService.writeShouldThrowError = new FileOperationError("write error conflict", FileOperationResult.FILE_MODIFIED_SINCE);
      await workingCopy.save({ force: true });
    } catch (error) {
    } finally {
      accessor.fileService.writeShouldThrowError = void 0;
    }
    assert.strictEqual(savedCounter, 1);
    assert.strictEqual(saveErrorCounter, 2);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ERROR), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.SAVED), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.PENDING_SAVE), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.CONFLICT), true);
    assert.strictEqual(workingCopy.isDirty(), true);
    await workingCopy.save({ reason: SaveReason.EXPLICIT });
    assert.strictEqual(savedCounter, 2);
    assert.strictEqual(saveErrorCounter, 2);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.ERROR), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.SAVED), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.PENDING_SAVE), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.CONFLICT), false);
    assert.strictEqual(workingCopy.isDirty(), false);
  });
  test("save (errors, bubbles up with `ignoreErrorHandler`)", async () => {
    await workingCopy.resolve();
    let error = void 0;
    try {
      accessor.fileService.writeShouldThrowError = new FileOperationError("write error", FileOperationResult.FILE_PERMISSION_DENIED);
      await workingCopy.save({ force: true, ignoreErrorHandler: true });
    } catch (e) {
      error = e;
    } finally {
      accessor.fileService.writeShouldThrowError = void 0;
    }
    assert.ok(error);
  });
  test("save - returns false when save fails", async function() {
    await workingCopy.resolve();
    try {
      accessor.fileService.writeShouldThrowError = new FileOperationError("write error", FileOperationResult.FILE_PERMISSION_DENIED);
      const res2 = await workingCopy.save({ force: true });
      assert.strictEqual(res2, false);
    } finally {
      accessor.fileService.writeShouldThrowError = void 0;
    }
    const res = await workingCopy.save({ force: true });
    assert.strictEqual(res, true);
  });
  test("save participant", async () => {
    await workingCopy.resolve();
    assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, false);
    let participationCounter = 0;
    const disposable = accessor.workingCopyFileService.addSaveParticipant({
      participate: /* @__PURE__ */ __name(async (wc) => {
        if (workingCopy === wc) {
          participationCounter++;
        }
      }, "participate")
    });
    assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, true);
    await workingCopy.save({ force: true });
    assert.strictEqual(participationCounter, 1);
    await workingCopy.save({ force: true, skipSaveParticipants: true });
    assert.strictEqual(participationCounter, 1);
    disposable.dispose();
    assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, false);
    await workingCopy.save({ force: true });
    assert.strictEqual(participationCounter, 1);
  });
  test("Save Participant, calling save from within is unsupported but does not explode (sync save)", async function() {
    await workingCopy.resolve();
    await testSaveFromSaveParticipant(workingCopy, false);
  });
  test("Save Participant, calling save from within is unsupported but does not explode (async save)", async function() {
    await workingCopy.resolve();
    await testSaveFromSaveParticipant(workingCopy, true);
  });
  async function testSaveFromSaveParticipant(workingCopy2, async) {
    const from = URI.file("testFrom");
    assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, false);
    const disposable = accessor.workingCopyFileService.addSaveParticipant({
      participate: /* @__PURE__ */ __name(async (wc, context) => {
        if (async) {
          await timeout(10);
        }
        await workingCopy2.save({ force: true });
      }, "participate")
    });
    assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, true);
    await workingCopy2.save({ force: true, from });
    disposable.dispose();
  }
  __name(testSaveFromSaveParticipant, "testSaveFromSaveParticipant");
  test("Save Participant carries context", async function() {
    await workingCopy.resolve();
    const from = URI.file("testFrom");
    assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, false);
    let e = void 0;
    const disposable = accessor.workingCopyFileService.addSaveParticipant({
      participate: /* @__PURE__ */ __name(async (wc, context) => {
        try {
          assert.strictEqual(context.reason, SaveReason.EXPLICIT);
          assert.strictEqual(context.savedFrom?.toString(), from.toString());
        } catch (error) {
          e = error;
        }
      }, "participate")
    });
    assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, true);
    await workingCopy.save({ force: true, from });
    if (e) {
      throw e;
    }
    disposable.dispose();
  });
  test("revert", async () => {
    await workingCopy.resolve();
    workingCopy.model?.updateContents("hello revert");
    let revertedCounter = 0;
    disposables.add(workingCopy.onDidRevert(() => {
      revertedCounter++;
    }));
    await workingCopy.revert({ soft: true });
    assert.strictEqual(revertedCounter, 1);
    assert.strictEqual(workingCopy.isDirty(), false);
    assert.strictEqual(workingCopy.model?.contents, "hello revert");
    await workingCopy.revert();
    assert.strictEqual(revertedCounter, 1);
    assert.strictEqual(workingCopy.model?.contents, "hello revert");
    await workingCopy.revert({ force: true });
    assert.strictEqual(revertedCounter, 2);
    assert.strictEqual(workingCopy.model?.contents, "Hello Html");
    try {
      workingCopy.model?.updateContents("hello revert");
      accessor.fileService.readShouldThrowError = new FileOperationError("error", FileOperationResult.FILE_PERMISSION_DENIED);
      await workingCopy.revert({ force: true });
    } catch (error) {
    } finally {
      accessor.fileService.readShouldThrowError = void 0;
    }
    assert.strictEqual(revertedCounter, 2);
    assert.strictEqual(workingCopy.isDirty(), true);
    try {
      workingCopy.model?.updateContents("hello revert");
      accessor.fileService.readShouldThrowError = new FileOperationError("error", FileOperationResult.FILE_NOT_FOUND);
      await workingCopy.revert({ force: true });
    } catch (error) {
    } finally {
      accessor.fileService.readShouldThrowError = void 0;
    }
    assert.strictEqual(revertedCounter, 3);
    assert.strictEqual(workingCopy.isDirty(), false);
  });
  test("state", async () => {
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.SAVED), true);
    await workingCopy.resolve({ contents: bufferToStream(VSBuffer.fromString("hello state")) });
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), true);
    const savePromise = workingCopy.save();
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.SAVED), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.PENDING_SAVE), true);
    await savePromise;
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.SAVED), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.PENDING_SAVE), false);
  });
  test("joinState", async () => {
    await workingCopy.resolve({ contents: bufferToStream(VSBuffer.fromString("hello state")) });
    workingCopy.save();
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.PENDING_SAVE), true);
    await workingCopy.joinState(StoredFileWorkingCopyState.PENDING_SAVE);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.DIRTY), false);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.SAVED), true);
    assert.strictEqual(workingCopy.hasState(StoredFileWorkingCopyState.PENDING_SAVE), false);
  });
  test("isReadonly, isResolved, dispose, isDisposed", async () => {
    assert.strictEqual(workingCopy.isResolved(), false);
    assert.strictEqual(workingCopy.isReadonly(), false);
    assert.strictEqual(workingCopy.isDisposed(), false);
    await workingCopy.resolve();
    assert.ok(workingCopy.model);
    assert.strictEqual(workingCopy.isResolved(), true);
    assert.strictEqual(workingCopy.isReadonly(), false);
    assert.strictEqual(workingCopy.isDisposed(), false);
    let disposedEvent = false;
    disposables.add(workingCopy.onWillDispose(() => {
      disposedEvent = true;
    }));
    let disposedModelEvent = false;
    disposables.add(workingCopy.model.onWillDispose(() => {
      disposedModelEvent = true;
    }));
    workingCopy.dispose();
    assert.strictEqual(workingCopy.isDisposed(), true);
    assert.strictEqual(disposedEvent, true);
    assert.strictEqual(disposedModelEvent, true);
  });
  test("readonly change event", async () => {
    accessor.fileService.readonly = true;
    await workingCopy.resolve();
    assert.strictEqual(!!workingCopy.isReadonly(), true);
    accessor.fileService.readonly = false;
    let readonlyEvent = false;
    disposables.add(workingCopy.onDidChangeReadonly(() => {
      readonlyEvent = true;
    }));
    await workingCopy.resolve();
    assert.strictEqual(workingCopy.isReadonly(), false);
    assert.strictEqual(readonlyEvent, true);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
export {
  TestStoredFileWorkingCopyModel,
  TestStoredFileWorkingCopyModelFactory,
  TestStoredFileWorkingCopyModelWithCustomSave,
  TestStoredFileWorkingCopyModelWithCustomSaveFactory
};
//# sourceMappingURL=storedFileWorkingCopy.test.js.map
