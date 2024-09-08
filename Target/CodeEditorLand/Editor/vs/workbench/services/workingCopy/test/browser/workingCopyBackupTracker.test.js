var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import assert from "assert";
import { timeout } from "../../../../../base/common/async.js";
import {
  VSBuffer,
  bufferToReadable
} from "../../../../../base/common/buffer.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import {
  ensureNoDisposablesAreLeakedInTestSuite,
  toResource
} from "../../../../../base/test/common/utils.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import {
  InMemoryTestWorkingCopyBackupService,
  TestServiceAccessor,
  createEditorPart,
  registerTestResourceEditor,
  toTypedWorkingCopyId,
  toUntypedWorkingCopyId,
  workbenchInstantiationService,
  workbenchTeardown
} from "../../../../test/browser/workbenchTestServices.js";
import { TestWorkingCopy } from "../../../../test/common/workbenchTestServices.js";
import { EditorService } from "../../../editor/browser/editorService.js";
import { IEditorGroupsService } from "../../../editor/common/editorGroupsService.js";
import { IEditorService } from "../../../editor/common/editorService.js";
import { IFilesConfigurationService } from "../../../filesConfiguration/common/filesConfigurationService.js";
import {
  ILifecycleService,
  LifecyclePhase
} from "../../../lifecycle/common/lifecycle.js";
import { UntitledTextEditorInput } from "../../../untitled/common/untitledTextEditorInput.js";
import { BrowserWorkingCopyBackupTracker } from "../../browser/workingCopyBackupTracker.js";
import { IWorkingCopyBackupService } from "../../common/workingCopyBackup.js";
import {
  IWorkingCopyEditorService
} from "../../common/workingCopyEditorService.js";
import { IWorkingCopyService } from "../../common/workingCopyService.js";
suite("WorkingCopyBackupTracker (browser)", () => {
  let accessor;
  const disposables = new DisposableStore();
  setup(() => {
    disposables.add(registerTestResourceEditor());
  });
  teardown(async () => {
    await workbenchTeardown(accessor.instantiationService);
    disposables.clear();
  });
  let TestWorkingCopyBackupTracker = class extends BrowserWorkingCopyBackupTracker {
    constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, logService, workingCopyEditorService, editorService, editorGroupService) {
      super(
        workingCopyBackupService,
        filesConfigurationService,
        workingCopyService,
        lifecycleService,
        logService,
        workingCopyEditorService,
        editorService,
        editorGroupService
      );
    }
    getBackupScheduleDelay() {
      return 10;
    }
    get pendingBackupOperationCount() {
      return this.pendingBackupOperations.size;
    }
    getUnrestoredBackups() {
      return this.unrestoredBackups;
    }
    async testRestoreBackups(handler) {
      return super.restoreBackups(handler);
    }
  };
  TestWorkingCopyBackupTracker = __decorateClass([
    __decorateParam(0, IWorkingCopyBackupService),
    __decorateParam(1, IFilesConfigurationService),
    __decorateParam(2, IWorkingCopyService),
    __decorateParam(3, ILifecycleService),
    __decorateParam(4, ILogService),
    __decorateParam(5, IWorkingCopyEditorService),
    __decorateParam(6, IEditorService),
    __decorateParam(7, IEditorGroupsService)
  ], TestWorkingCopyBackupTracker);
  class TestUntitledTextEditorInput extends UntitledTextEditorInput {
    resolved = false;
    resolve() {
      this.resolved = true;
      return super.resolve();
    }
  }
  async function createTracker() {
    const workingCopyBackupService = disposables.add(
      new InMemoryTestWorkingCopyBackupService()
    );
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    instantiationService.stub(
      IWorkingCopyBackupService,
      workingCopyBackupService
    );
    const part = await createEditorPart(instantiationService, disposables);
    instantiationService.stub(IEditorGroupsService, part);
    disposables.add(registerTestResourceEditor());
    const editorService = disposables.add(
      instantiationService.createInstance(EditorService, void 0)
    );
    instantiationService.stub(IEditorService, editorService);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    const tracker = disposables.add(
      instantiationService.createInstance(TestWorkingCopyBackupTracker)
    );
    return {
      accessor,
      part,
      tracker,
      workingCopyBackupService,
      instantiationService
    };
  }
  async function untitledBackupTest(untitled = { resource: void 0 }) {
    const { accessor: accessor2, workingCopyBackupService } = await createTracker();
    const untitledTextEditor = disposables.add(
      (await accessor2.editorService.openEditor(untitled))?.input
    );
    const untitledTextModel = disposables.add(
      await untitledTextEditor.resolve()
    );
    if (!untitled?.contents) {
      untitledTextModel.textEditorModel?.setValue("Super Good");
    }
    await workingCopyBackupService.joinBackupResource();
    assert.strictEqual(
      workingCopyBackupService.hasBackupSync(untitledTextModel),
      true
    );
    untitledTextModel.dispose();
    await workingCopyBackupService.joinDiscardBackup();
    assert.strictEqual(
      workingCopyBackupService.hasBackupSync(untitledTextModel),
      false
    );
  }
  test("Track backups (untitled)", () => untitledBackupTest());
  test("Track backups (untitled with initial contents)", () => untitledBackupTest({ resource: void 0, contents: "Foo Bar" }));
  test("Track backups (custom)", async function() {
    const { accessor: accessor2, tracker, workingCopyBackupService } = await createTracker();
    class TestBackupWorkingCopy extends TestWorkingCopy {
      constructor(resource2) {
        super(resource2);
        disposables.add(
          accessor2.workingCopyService.registerWorkingCopy(this)
        );
      }
      backupDelay = 10;
      async backup(token) {
        await timeout(0);
        return {};
      }
    }
    const resource = toResource.call(this, "/path/custom.txt");
    const customWorkingCopy = disposables.add(
      new TestBackupWorkingCopy(resource)
    );
    customWorkingCopy.setDirty(true);
    assert.strictEqual(tracker.pendingBackupOperationCount, 1);
    await workingCopyBackupService.joinBackupResource();
    assert.strictEqual(
      workingCopyBackupService.hasBackupSync(customWorkingCopy),
      true
    );
    customWorkingCopy.setDirty(false);
    customWorkingCopy.setDirty(true);
    assert.strictEqual(tracker.pendingBackupOperationCount, 1);
    await workingCopyBackupService.joinBackupResource();
    assert.strictEqual(
      workingCopyBackupService.hasBackupSync(customWorkingCopy),
      true
    );
    customWorkingCopy.setDirty(false);
    assert.strictEqual(tracker.pendingBackupOperationCount, 1);
    await workingCopyBackupService.joinDiscardBackup();
    assert.strictEqual(
      workingCopyBackupService.hasBackupSync(customWorkingCopy),
      false
    );
    customWorkingCopy.setDirty(true);
    await timeout(0);
    customWorkingCopy.setDirty(false);
    assert.strictEqual(tracker.pendingBackupOperationCount, 1);
    await workingCopyBackupService.joinDiscardBackup();
    assert.strictEqual(
      workingCopyBackupService.hasBackupSync(customWorkingCopy),
      false
    );
  });
  async function restoreBackupsInit() {
    const fooFile = URI.file(isWindows ? "c:\\Foo" : "/Foo");
    const barFile = URI.file(isWindows ? "c:\\Bar" : "/Bar");
    const untitledFile1 = URI.from({
      scheme: Schemas.untitled,
      path: "Untitled-1"
    });
    const untitledFile2 = URI.from({
      scheme: Schemas.untitled,
      path: "Untitled-2"
    });
    const workingCopyBackupService = disposables.add(
      new InMemoryTestWorkingCopyBackupService()
    );
    const instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    instantiationService.stub(
      IWorkingCopyBackupService,
      workingCopyBackupService
    );
    const part = await createEditorPart(instantiationService, disposables);
    instantiationService.stub(IEditorGroupsService, part);
    const editorService = disposables.add(
      instantiationService.createInstance(EditorService, void 0)
    );
    instantiationService.stub(IEditorService, editorService);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    const untitledFile1WorkingCopyId = toUntypedWorkingCopyId(untitledFile1);
    const untitledFile2WorkingCopyId = toTypedWorkingCopyId(untitledFile2);
    await workingCopyBackupService.backup(
      untitledFile1WorkingCopyId,
      bufferToReadable(VSBuffer.fromString("untitled-1"))
    );
    await workingCopyBackupService.backup(
      untitledFile2WorkingCopyId,
      bufferToReadable(VSBuffer.fromString("untitled-2"))
    );
    const fooFileWorkingCopyId = toUntypedWorkingCopyId(fooFile);
    const barFileWorkingCopyId = toTypedWorkingCopyId(barFile);
    await workingCopyBackupService.backup(
      fooFileWorkingCopyId,
      bufferToReadable(VSBuffer.fromString("fooFile"))
    );
    await workingCopyBackupService.backup(
      barFileWorkingCopyId,
      bufferToReadable(VSBuffer.fromString("barFile"))
    );
    const tracker = disposables.add(
      instantiationService.createInstance(TestWorkingCopyBackupTracker)
    );
    accessor.lifecycleService.phase = LifecyclePhase.Restored;
    return [tracker, accessor];
  }
  test("Restore backups (basics, some handled)", async () => {
    const [tracker, accessor2] = await restoreBackupsInit();
    assert.strictEqual(tracker.getUnrestoredBackups().size, 0);
    let handlesCounter = 0;
    let isOpenCounter = 0;
    let createEditorCounter = 0;
    await tracker.testRestoreBackups({
      handles: (workingCopy) => {
        handlesCounter++;
        return workingCopy.typeId === "testBackupTypeId";
      },
      isOpen: (workingCopy, editor) => {
        isOpenCounter++;
        return false;
      },
      createEditor: (workingCopy) => {
        createEditorCounter++;
        return disposables.add(
          accessor2.instantiationService.createInstance(
            TestUntitledTextEditorInput,
            accessor2.untitledTextEditorService.create({
              initialValue: "foo"
            })
          )
        );
      }
    });
    assert.strictEqual(handlesCounter, 4);
    assert.strictEqual(isOpenCounter, 0);
    assert.strictEqual(createEditorCounter, 2);
    assert.strictEqual(accessor2.editorService.count, 2);
    assert.ok(
      accessor2.editorService.editors.every((editor) => editor.isDirty())
    );
    assert.strictEqual(tracker.getUnrestoredBackups().size, 2);
    for (const editor of accessor2.editorService.editors) {
      assert.ok(editor instanceof TestUntitledTextEditorInput);
      assert.strictEqual(editor.resolved, true);
    }
  });
  test("Restore backups (basics, none handled)", async () => {
    const [tracker, accessor2] = await restoreBackupsInit();
    await tracker.testRestoreBackups({
      handles: (workingCopy) => false,
      isOpen: (workingCopy, editor) => {
        throw new Error("unexpected");
      },
      createEditor: (workingCopy) => {
        throw new Error("unexpected");
      }
    });
    assert.strictEqual(accessor2.editorService.count, 0);
    assert.strictEqual(tracker.getUnrestoredBackups().size, 4);
  });
  test("Restore backups (basics, error case)", async () => {
    const [tracker] = await restoreBackupsInit();
    try {
      await tracker.testRestoreBackups({
        handles: (workingCopy) => true,
        isOpen: (workingCopy, editor) => {
          throw new Error("unexpected");
        },
        createEditor: (workingCopy) => {
          throw new Error("unexpected");
        }
      });
    } catch (error) {
    }
    assert.strictEqual(tracker.getUnrestoredBackups().size, 4);
  });
  test("Restore backups (multiple handlers)", async () => {
    const [tracker, accessor2] = await restoreBackupsInit();
    const firstHandler = tracker.testRestoreBackups({
      handles: (workingCopy) => {
        return workingCopy.typeId === "testBackupTypeId";
      },
      isOpen: (workingCopy, editor) => {
        return false;
      },
      createEditor: (workingCopy) => {
        return disposables.add(
          accessor2.instantiationService.createInstance(
            TestUntitledTextEditorInput,
            accessor2.untitledTextEditorService.create({
              initialValue: "foo"
            })
          )
        );
      }
    });
    const secondHandler = tracker.testRestoreBackups({
      handles: (workingCopy) => {
        return workingCopy.typeId.length === 0;
      },
      isOpen: (workingCopy, editor) => {
        return false;
      },
      createEditor: (workingCopy) => {
        return disposables.add(
          accessor2.instantiationService.createInstance(
            TestUntitledTextEditorInput,
            accessor2.untitledTextEditorService.create({
              initialValue: "foo"
            })
          )
        );
      }
    });
    await Promise.all([firstHandler, secondHandler]);
    assert.strictEqual(accessor2.editorService.count, 4);
    assert.ok(
      accessor2.editorService.editors.every((editor) => editor.isDirty())
    );
    assert.strictEqual(tracker.getUnrestoredBackups().size, 0);
    for (const editor of accessor2.editorService.editors) {
      assert.ok(editor instanceof TestUntitledTextEditorInput);
      assert.strictEqual(editor.resolved, true);
    }
  });
  test("Restore backups (editors already opened)", async () => {
    const [tracker, accessor2] = await restoreBackupsInit();
    assert.strictEqual(tracker.getUnrestoredBackups().size, 0);
    let handlesCounter = 0;
    let isOpenCounter = 0;
    const editor1 = disposables.add(
      accessor2.instantiationService.createInstance(
        TestUntitledTextEditorInput,
        accessor2.untitledTextEditorService.create({
          initialValue: "foo"
        })
      )
    );
    const editor2 = disposables.add(
      accessor2.instantiationService.createInstance(
        TestUntitledTextEditorInput,
        accessor2.untitledTextEditorService.create({
          initialValue: "foo"
        })
      )
    );
    await accessor2.editorService.openEditors([
      { editor: editor1 },
      { editor: editor2 }
    ]);
    editor1.resolved = false;
    editor2.resolved = false;
    await tracker.testRestoreBackups({
      handles: (workingCopy) => {
        handlesCounter++;
        return workingCopy.typeId === "testBackupTypeId";
      },
      isOpen: (workingCopy, editor) => {
        isOpenCounter++;
        return true;
      },
      createEditor: (workingCopy) => {
        throw new Error("unexpected");
      }
    });
    assert.strictEqual(handlesCounter, 4);
    assert.strictEqual(isOpenCounter, 4);
    assert.strictEqual(accessor2.editorService.count, 2);
    assert.strictEqual(tracker.getUnrestoredBackups().size, 2);
    for (const editor of accessor2.editorService.editors) {
      assert.ok(editor instanceof TestUntitledTextEditorInput);
      if (accessor2.editorService.isVisible(editor)) {
        assert.strictEqual(editor.resolved, false);
      } else {
        assert.strictEqual(editor.resolved, true);
      }
    }
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
