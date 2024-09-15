var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { isMacintosh, isWindows } from "../../../../../base/common/platform.js";
import { join } from "../../../../../base/common/path.js";
import { URI } from "../../../../../base/common/uri.js";
import { hash } from "../../../../../base/common/hash.js";
import { NativeWorkingCopyBackupTracker } from "../../electron-sandbox/workingCopyBackupTracker.js";
import { TextFileEditorModelManager } from "../../../textfile/common/textFileEditorModelManager.js";
import { IEditorService } from "../../../editor/common/editorService.js";
import { EditorPart } from "../../../../browser/parts/editor/editorPart.js";
import { IEditorGroupsService } from "../../../editor/common/editorGroupsService.js";
import { EditorService } from "../../../editor/browser/editorService.js";
import { IWorkingCopyBackupService } from "../../common/workingCopyBackup.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite, toResource } from "../../../../../base/test/common/utils.js";
import { IFilesConfigurationService } from "../../../filesConfiguration/common/filesConfigurationService.js";
import { IWorkingCopyService } from "../../common/workingCopyService.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { HotExitConfiguration } from "../../../../../platform/files/common/files.js";
import { ShutdownReason, ILifecycleService } from "../../../lifecycle/common/lifecycle.js";
import { IFileDialogService, ConfirmResult, IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { INativeHostService } from "../../../../../platform/native/common/native.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { createEditorPart, registerTestFileEditor, TestBeforeShutdownEvent, TestEnvironmentService, TestFilesConfigurationService, TestFileService, TestTextResourceConfigurationService, workbenchTeardown } from "../../../../test/browser/workbenchTestServices.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { TestWorkspace, Workspace } from "../../../../../platform/workspace/test/common/testWorkspace.js";
import { IProgressService } from "../../../../../platform/progress/common/progress.js";
import { IWorkingCopyEditorService } from "../../common/workingCopyEditorService.js";
import { TestContextService, TestMarkerService, TestWorkingCopy } from "../../../../test/common/workbenchTestServices.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { IWorkingCopyBackup, WorkingCopyCapabilities } from "../../common/workingCopy.js";
import { Event, Emitter } from "../../../../../base/common/event.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { Schemas } from "../../../../../base/common/network.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { TestServiceAccessor, workbenchInstantiationService } from "../../../../test/electron-sandbox/workbenchTestServices.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
suite("WorkingCopyBackupTracker (native)", function() {
  let TestWorkingCopyBackupTracker = class extends NativeWorkingCopyBackupTracker {
    static {
      __name(this, "TestWorkingCopyBackupTracker");
    }
    constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, editorService, environmentService, progressService, workingCopyEditorService, editorGroupService) {
      super(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, environmentService, progressService, workingCopyEditorService, editorService, editorGroupService);
    }
    getBackupScheduleDelay() {
      return 10;
    }
    waitForReady() {
      return this.whenReady;
    }
    get pendingBackupOperationCount() {
      return this.pendingBackupOperations.size;
    }
    dispose() {
      super.dispose();
      for (const [_, pending] of this.pendingBackupOperations) {
        pending.cancel();
        pending.disposable.dispose();
      }
    }
    _onDidResume = this._register(new Emitter());
    onDidResume = this._onDidResume.event;
    _onDidSuspend = this._register(new Emitter());
    onDidSuspend = this._onDidSuspend.event;
    suspendBackupOperations() {
      const { resume } = super.suspendBackupOperations();
      this._onDidSuspend.fire();
      return {
        resume: /* @__PURE__ */ __name(() => {
          resume();
          this._onDidResume.fire();
        }, "resume")
      };
    }
  };
  TestWorkingCopyBackupTracker = __decorateClass([
    __decorateParam(0, IWorkingCopyBackupService),
    __decorateParam(1, IFilesConfigurationService),
    __decorateParam(2, IWorkingCopyService),
    __decorateParam(3, ILifecycleService),
    __decorateParam(4, IFileDialogService),
    __decorateParam(5, IDialogService),
    __decorateParam(6, IWorkspaceContextService),
    __decorateParam(7, INativeHostService),
    __decorateParam(8, ILogService),
    __decorateParam(9, IEditorService),
    __decorateParam(10, IEnvironmentService),
    __decorateParam(11, IProgressService),
    __decorateParam(12, IWorkingCopyEditorService),
    __decorateParam(13, IEditorGroupsService)
  ], TestWorkingCopyBackupTracker);
  let testDir;
  let backupHome;
  let workspaceBackupPath;
  let accessor;
  const disposables = new DisposableStore();
  setup(async () => {
    testDir = URI.file(join(generateUuid(), "vsctests", "workingcopybackuptracker")).with({ scheme: Schemas.inMemory });
    backupHome = joinPath(testDir, "Backups");
    const workspacesJsonPath = joinPath(backupHome, "workspaces.json");
    const workspaceResource = URI.file(isWindows ? "c:\\workspace" : "/workspace").with({ scheme: Schemas.inMemory });
    workspaceBackupPath = joinPath(backupHome, hash(workspaceResource.toString()).toString(16));
    const instantiationService = workbenchInstantiationService(void 0, disposables);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    disposables.add(accessor.textFileService.files);
    disposables.add(registerTestFileEditor());
    await accessor.fileService.createFolder(backupHome);
    await accessor.fileService.createFolder(workspaceBackupPath);
    return accessor.fileService.writeFile(workspacesJsonPath, VSBuffer.fromString(""));
  });
  teardown(() => {
    disposables.clear();
  });
  async function createTracker(autoSaveEnabled = false) {
    const instantiationService = workbenchInstantiationService(void 0, disposables);
    const configurationService = new TestConfigurationService();
    if (autoSaveEnabled) {
      configurationService.setUserConfiguration("files", { autoSave: "afterDelay", autoSaveDelay: 1 });
    } else {
      configurationService.setUserConfiguration("files", { autoSave: "off", autoSaveDelay: 1 });
    }
    instantiationService.stub(IConfigurationService, configurationService);
    instantiationService.stub(IFilesConfigurationService, disposables.add(new TestFilesConfigurationService(
      instantiationService.createInstance(MockContextKeyService),
      configurationService,
      new TestContextService(TestWorkspace),
      TestEnvironmentService,
      disposables.add(new UriIdentityService(disposables.add(new TestFileService()))),
      disposables.add(new TestFileService()),
      new TestMarkerService(),
      new TestTextResourceConfigurationService(configurationService)
    )));
    const part = await createEditorPart(instantiationService, disposables);
    instantiationService.stub(IEditorGroupsService, part);
    const editorService = disposables.add(instantiationService.createInstance(EditorService, void 0));
    instantiationService.stub(IEditorService, editorService);
    accessor = instantiationService.createInstance(TestServiceAccessor);
    const tracker = instantiationService.createInstance(TestWorkingCopyBackupTracker);
    const cleanup = /* @__PURE__ */ __name(async () => {
      await accessor.workingCopyBackupService.waitForAllBackups();
      await workbenchTeardown(instantiationService);
      part.dispose();
      tracker.dispose();
    }, "cleanup");
    return { accessor, part, tracker, instantiationService, cleanup };
  }
  __name(createTracker, "createTracker");
  test("Track backups (file, auto save off)", function() {
    return trackBackupsTest(toResource.call(this, "/path/index.txt"), false);
  });
  test("Track backups (file, auto save on)", function() {
    return trackBackupsTest(toResource.call(this, "/path/index.txt"), true);
  });
  async function trackBackupsTest(resource, autoSave) {
    const { accessor: accessor2, cleanup } = await createTracker(autoSave);
    await accessor2.editorService.openEditor({ resource, options: { pinned: true } });
    const fileModel = accessor2.textFileService.files.get(resource);
    assert.ok(fileModel);
    fileModel.textEditorModel?.setValue("Super Good");
    await accessor2.workingCopyBackupService.joinBackupResource();
    assert.strictEqual(accessor2.workingCopyBackupService.hasBackupSync(fileModel), true);
    fileModel.dispose();
    await accessor2.workingCopyBackupService.joinDiscardBackup();
    assert.strictEqual(accessor2.workingCopyBackupService.hasBackupSync(fileModel), false);
    await cleanup();
  }
  __name(trackBackupsTest, "trackBackupsTest");
  test("onWillShutdown - no veto if no dirty files", async function() {
    const { accessor: accessor2, cleanup } = await createTracker();
    const resource = toResource.call(this, "/path/index.txt");
    await accessor2.editorService.openEditor({ resource, options: { pinned: true } });
    const event = new TestBeforeShutdownEvent();
    accessor2.lifecycleService.fireBeforeShutdown(event);
    const veto = await event.value;
    assert.ok(!veto);
    await cleanup();
  });
  test("onWillShutdown - veto if user cancels (hot.exit: off)", async function() {
    const { accessor: accessor2, cleanup } = await createTracker();
    const resource = toResource.call(this, "/path/index.txt");
    await accessor2.editorService.openEditor({ resource, options: { pinned: true } });
    const model = accessor2.textFileService.files.get(resource);
    accessor2.fileDialogService.setConfirmResult(ConfirmResult.CANCEL);
    accessor2.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: "off" } });
    await model?.resolve();
    model?.textEditorModel?.setValue("foo");
    assert.strictEqual(accessor2.workingCopyService.dirtyCount, 1);
    const event = new TestBeforeShutdownEvent();
    accessor2.lifecycleService.fireBeforeShutdown(event);
    const veto = await event.value;
    assert.ok(veto);
    await cleanup();
  });
  test("onWillShutdown - no veto if auto save is on", async function() {
    const { accessor: accessor2, cleanup } = await createTracker(
      true
      /* auto save enabled */
    );
    const resource = toResource.call(this, "/path/index.txt");
    await accessor2.editorService.openEditor({ resource, options: { pinned: true } });
    const model = accessor2.textFileService.files.get(resource);
    await model?.resolve();
    model?.textEditorModel?.setValue("foo");
    assert.strictEqual(accessor2.workingCopyService.dirtyCount, 1);
    const event = new TestBeforeShutdownEvent();
    accessor2.lifecycleService.fireBeforeShutdown(event);
    const veto = await event.value;
    assert.ok(!veto);
    assert.strictEqual(accessor2.workingCopyService.dirtyCount, 0);
    await cleanup();
  });
  test("onWillShutdown - no veto and backups cleaned up if user does not want to save (hot.exit: off)", async function() {
    const { accessor: accessor2, cleanup } = await createTracker();
    const resource = toResource.call(this, "/path/index.txt");
    await accessor2.editorService.openEditor({ resource, options: { pinned: true } });
    const model = accessor2.textFileService.files.get(resource);
    accessor2.fileDialogService.setConfirmResult(ConfirmResult.DONT_SAVE);
    accessor2.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: "off" } });
    await model?.resolve();
    model?.textEditorModel?.setValue("foo");
    assert.strictEqual(accessor2.workingCopyService.dirtyCount, 1);
    const event = new TestBeforeShutdownEvent();
    accessor2.lifecycleService.fireBeforeShutdown(event);
    const veto = await event.value;
    assert.ok(!veto);
    assert.ok(accessor2.workingCopyBackupService.discardedBackups.length > 0);
    await cleanup();
  });
  test("onWillShutdown - no backups discarded when shutdown without dirty but tracker not ready", async function() {
    const { accessor: accessor2, cleanup } = await createTracker();
    const event = new TestBeforeShutdownEvent();
    accessor2.lifecycleService.fireBeforeShutdown(event);
    const veto = await event.value;
    assert.ok(!veto);
    assert.ok(!accessor2.workingCopyBackupService.discardedAllBackups);
    await cleanup();
  });
  test("onWillShutdown - backups discarded when shutdown without dirty", async function() {
    const { accessor: accessor2, tracker, cleanup } = await createTracker();
    await tracker.waitForReady();
    const event = new TestBeforeShutdownEvent();
    accessor2.lifecycleService.fireBeforeShutdown(event);
    const veto = await event.value;
    assert.ok(!veto);
    assert.ok(accessor2.workingCopyBackupService.discardedAllBackups);
    await cleanup();
  });
  test("onWillShutdown - save (hot.exit: off)", async function() {
    const { accessor: accessor2, cleanup } = await createTracker();
    const resource = toResource.call(this, "/path/index.txt");
    await accessor2.editorService.openEditor({ resource, options: { pinned: true } });
    const model = accessor2.textFileService.files.get(resource);
    accessor2.fileDialogService.setConfirmResult(ConfirmResult.SAVE);
    accessor2.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: "off" } });
    await model?.resolve();
    model?.textEditorModel?.setValue("foo");
    assert.strictEqual(accessor2.workingCopyService.dirtyCount, 1);
    const event = new TestBeforeShutdownEvent();
    accessor2.lifecycleService.fireBeforeShutdown(event);
    const veto = await event.value;
    assert.ok(!veto);
    assert.ok(!model?.isDirty());
    await cleanup();
  });
  test("onWillShutdown - veto if backup fails", async function() {
    const { accessor: accessor2, cleanup } = await createTracker();
    class TestBackupWorkingCopy extends TestWorkingCopy {
      static {
        __name(this, "TestBackupWorkingCopy");
      }
      constructor(resource2) {
        super(resource2);
        this._register(accessor2.workingCopyService.registerWorkingCopy(this));
      }
      async backup(token) {
        throw new Error("unable to backup");
      }
    }
    const resource = toResource.call(this, "/path/custom.txt");
    const customWorkingCopy = disposables.add(new TestBackupWorkingCopy(resource));
    customWorkingCopy.setDirty(true);
    const event = new TestBeforeShutdownEvent();
    event.reason = ShutdownReason.QUIT;
    accessor2.lifecycleService.fireBeforeShutdown(event);
    const veto = await event.value;
    assert.ok(veto);
    const finalVeto = await event.finalValue?.();
    assert.ok(finalVeto);
    await cleanup();
  });
  test("onWillShutdown - scratchpads - veto if backup fails", async function() {
    const { accessor: accessor2, cleanup } = await createTracker();
    class TestBackupWorkingCopy extends TestWorkingCopy {
      static {
        __name(this, "TestBackupWorkingCopy");
      }
      constructor(resource2) {
        super(resource2);
        this._register(accessor2.workingCopyService.registerWorkingCopy(this));
      }
      capabilities = WorkingCopyCapabilities.Untitled | WorkingCopyCapabilities.Scratchpad;
      async backup(token) {
        throw new Error("unable to backup");
      }
      isDirty() {
        return false;
      }
      isModified() {
        return true;
      }
    }
    const resource = toResource.call(this, "/path/custom.txt");
    disposables.add(new TestBackupWorkingCopy(resource));
    const event = new TestBeforeShutdownEvent();
    event.reason = ShutdownReason.QUIT;
    accessor2.lifecycleService.fireBeforeShutdown(event);
    const veto = await event.value;
    assert.ok(veto);
    const finalVeto = await event.finalValue?.();
    assert.ok(finalVeto);
    await cleanup();
  });
  test("onWillShutdown - pending backup operations canceled and tracker suspended/resumsed", async function() {
    const { accessor: accessor2, tracker, cleanup } = await createTracker();
    const resource = toResource.call(this, "/path/index.txt");
    await accessor2.editorService.openEditor({ resource, options: { pinned: true } });
    const model = accessor2.textFileService.files.get(resource);
    await model?.resolve();
    model?.textEditorModel?.setValue("foo");
    assert.strictEqual(accessor2.workingCopyService.dirtyCount, 1);
    assert.strictEqual(tracker.pendingBackupOperationCount, 1);
    const onSuspend = Event.toPromise(tracker.onDidSuspend);
    const event = new TestBeforeShutdownEvent();
    event.reason = ShutdownReason.QUIT;
    accessor2.lifecycleService.fireBeforeShutdown(event);
    await onSuspend;
    assert.strictEqual(tracker.pendingBackupOperationCount, 0);
    model?.textEditorModel?.setValue("bar");
    assert.strictEqual(accessor2.workingCopyService.dirtyCount, 1);
    assert.strictEqual(tracker.pendingBackupOperationCount, 0);
    const onResume = Event.toPromise(tracker.onDidResume);
    await event.value;
    model?.textEditorModel?.setValue("foo");
    await onResume;
    assert.strictEqual(tracker.pendingBackupOperationCount, 1);
    await cleanup();
  });
  suite("Hot Exit", () => {
    suite('"onExit" setting', () => {
      test("should hot exit on non-Mac (reason: CLOSE, windows: single, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.CLOSE, false, true, !!isMacintosh);
      });
      test("should hot exit on non-Mac (reason: CLOSE, windows: single, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.CLOSE, false, false, !!isMacintosh);
      });
      test("should NOT hot exit (reason: CLOSE, windows: multiple, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.CLOSE, true, true, true);
      });
      test("should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.CLOSE, true, false, true);
      });
      test("should hot exit (reason: QUIT, windows: single, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.QUIT, false, true, false);
      });
      test("should hot exit (reason: QUIT, windows: single, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.QUIT, false, false, false);
      });
      test("should hot exit (reason: QUIT, windows: multiple, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.QUIT, true, true, false);
      });
      test("should hot exit (reason: QUIT, windows: multiple, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.QUIT, true, false, false);
      });
      test("should hot exit (reason: RELOAD, windows: single, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.RELOAD, false, true, false);
      });
      test("should hot exit (reason: RELOAD, windows: single, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.RELOAD, false, false, false);
      });
      test("should hot exit (reason: RELOAD, windows: multiple, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.RELOAD, true, true, false);
      });
      test("should hot exit (reason: RELOAD, windows: multiple, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.RELOAD, true, false, false);
      });
      test("should NOT hot exit (reason: LOAD, windows: single, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.LOAD, false, true, true);
      });
      test("should NOT hot exit (reason: LOAD, windows: single, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.LOAD, false, false, true);
      });
      test("should NOT hot exit (reason: LOAD, windows: multiple, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.LOAD, true, true, true);
      });
      test("should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.LOAD, true, false, true);
      });
    });
    suite('"onExitAndWindowClose" setting', () => {
      test("should hot exit (reason: CLOSE, windows: single, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.CLOSE, false, true, false);
      });
      test("should hot exit (reason: CLOSE, windows: single, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.CLOSE, false, false, !!isMacintosh);
      });
      test("should hot exit (reason: CLOSE, windows: multiple, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.CLOSE, true, true, false);
      });
      test("should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.CLOSE, true, false, true);
      });
      test("should hot exit (reason: QUIT, windows: single, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.QUIT, false, true, false);
      });
      test("should hot exit (reason: QUIT, windows: single, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.QUIT, false, false, false);
      });
      test("should hot exit (reason: QUIT, windows: multiple, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.QUIT, true, true, false);
      });
      test("should hot exit (reason: QUIT, windows: multiple, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.QUIT, true, false, false);
      });
      test("should hot exit (reason: RELOAD, windows: single, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.RELOAD, false, true, false);
      });
      test("should hot exit (reason: RELOAD, windows: single, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.RELOAD, false, false, false);
      });
      test("should hot exit (reason: RELOAD, windows: multiple, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.RELOAD, true, true, false);
      });
      test("should hot exit (reason: RELOAD, windows: multiple, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.RELOAD, true, false, false);
      });
      test("should hot exit (reason: LOAD, windows: single, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.LOAD, false, true, false);
      });
      test("should NOT hot exit (reason: LOAD, windows: single, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.LOAD, false, false, true);
      });
      test("should hot exit (reason: LOAD, windows: multiple, workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.LOAD, true, true, false);
      });
      test("should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)", function() {
        return hotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.LOAD, true, false, true);
      });
    });
    suite('"onExit" setting - scratchpad', () => {
      test("should hot exit (reason: CLOSE, windows: single, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.CLOSE, false, true, false);
      });
      test("should hot exit (reason: CLOSE, windows: single, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.CLOSE, false, false, !!isMacintosh);
      });
      test("should hot exit (reason: CLOSE, windows: multiple, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.CLOSE, true, true, false);
      });
      test("should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.CLOSE, true, false, true);
      });
      test("should hot exit (reason: QUIT, windows: single, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.QUIT, false, true, false);
      });
      test("should hot exit (reason: QUIT, windows: single, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.QUIT, false, false, false);
      });
      test("should hot exit (reason: QUIT, windows: multiple, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.QUIT, true, true, false);
      });
      test("should hot exit (reason: QUIT, windows: multiple, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.QUIT, true, false, false);
      });
      test("should hot exit (reason: RELOAD, windows: single, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.RELOAD, false, true, false);
      });
      test("should hot exit (reason: RELOAD, windows: single, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.RELOAD, false, false, false);
      });
      test("should hot exit (reason: RELOAD, windows: multiple, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.RELOAD, true, true, false);
      });
      test("should hot exit (reason: RELOAD, windows: multiple, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.RELOAD, true, false, false);
      });
      test("should hot exit (reason: LOAD, windows: single, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.LOAD, false, true, false);
      });
      test("should NOT hot exit (reason: LOAD, windows: single, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.LOAD, false, false, true);
      });
      test("should hot exit (reason: LOAD, windows: multiple, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.LOAD, true, true, false);
      });
      test("should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT, ShutdownReason.LOAD, true, false, true);
      });
    });
    suite('"onExitAndWindowClose" setting - scratchpad', () => {
      test("should hot exit (reason: CLOSE, windows: single, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.CLOSE, false, true, false);
      });
      test("should hot exit (reason: CLOSE, windows: single, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.CLOSE, false, false, !!isMacintosh);
      });
      test("should hot exit (reason: CLOSE, windows: multiple, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.CLOSE, true, true, false);
      });
      test("should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.CLOSE, true, false, true);
      });
      test("should hot exit (reason: QUIT, windows: single, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.QUIT, false, true, false);
      });
      test("should hot exit (reason: QUIT, windows: single, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.QUIT, false, false, false);
      });
      test("should hot exit (reason: QUIT, windows: multiple, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.QUIT, true, true, false);
      });
      test("should hot exit (reason: QUIT, windows: multiple, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.QUIT, true, false, false);
      });
      test("should hot exit (reason: RELOAD, windows: single, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.RELOAD, false, true, false);
      });
      test("should hot exit (reason: RELOAD, windows: single, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.RELOAD, false, false, false);
      });
      test("should hot exit (reason: RELOAD, windows: multiple, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.RELOAD, true, true, false);
      });
      test("should hot exit (reason: RELOAD, windows: multiple, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.RELOAD, true, false, false);
      });
      test("should hot exit (reason: LOAD, windows: single, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.LOAD, false, true, false);
      });
      test("should NOT hot exit (reason: LOAD, windows: single, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.LOAD, false, false, true);
      });
      test("should hot exit (reason: LOAD, windows: multiple, workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.LOAD, true, true, false);
      });
      test("should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)", function() {
        return scratchpadHotExitTest.call(this, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, ShutdownReason.LOAD, true, false, true);
      });
    });
    async function hotExitTest(setting, shutdownReason, multipleWindows, workspace, shouldVeto) {
      const { accessor: accessor2, cleanup } = await createTracker();
      const resource = toResource.call(this, "/path/index.txt");
      await accessor2.editorService.openEditor({ resource, options: { pinned: true } });
      const model = accessor2.textFileService.files.get(resource);
      accessor2.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: setting } });
      if (!workspace) {
        accessor2.contextService.setWorkspace(new Workspace("empty:1508317022751"));
      }
      if (multipleWindows) {
        accessor2.nativeHostService.windowCount = Promise.resolve(2);
      }
      accessor2.fileDialogService.setConfirmResult(ConfirmResult.CANCEL);
      await model?.resolve();
      model?.textEditorModel?.setValue("foo");
      assert.strictEqual(accessor2.workingCopyService.dirtyCount, 1);
      const event = new TestBeforeShutdownEvent();
      event.reason = shutdownReason;
      accessor2.lifecycleService.fireBeforeShutdown(event);
      const veto = await event.value;
      assert.ok(typeof event.finalValue === "function");
      assert.strictEqual(accessor2.workingCopyBackupService.discardedBackups.length, 0);
      assert.strictEqual(veto, shouldVeto);
      await cleanup();
    }
    __name(hotExitTest, "hotExitTest");
    async function scratchpadHotExitTest(setting, shutdownReason, multipleWindows, workspace, shouldVeto) {
      const { accessor: accessor2, cleanup } = await createTracker();
      class TestBackupWorkingCopy extends TestWorkingCopy {
        static {
          __name(this, "TestBackupWorkingCopy");
        }
        constructor(resource2) {
          super(resource2);
          this._register(accessor2.workingCopyService.registerWorkingCopy(this));
        }
        capabilities = WorkingCopyCapabilities.Untitled | WorkingCopyCapabilities.Scratchpad;
        isDirty() {
          return false;
        }
        isModified() {
          return true;
        }
      }
      accessor2.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: setting } });
      if (!workspace) {
        accessor2.contextService.setWorkspace(new Workspace("empty:1508317022751"));
      }
      if (multipleWindows) {
        accessor2.nativeHostService.windowCount = Promise.resolve(2);
      }
      accessor2.fileDialogService.setConfirmResult(ConfirmResult.CANCEL);
      const resource = toResource.call(this, "/path/custom.txt");
      disposables.add(new TestBackupWorkingCopy(resource));
      const event = new TestBeforeShutdownEvent();
      event.reason = shutdownReason;
      accessor2.lifecycleService.fireBeforeShutdown(event);
      const veto = await event.value;
      assert.ok(typeof event.finalValue === "function");
      assert.strictEqual(accessor2.workingCopyBackupService.discardedBackups.length, 0);
      assert.strictEqual(veto, shouldVeto);
      await cleanup();
    }
    __name(scratchpadHotExitTest, "scratchpadHotExitTest");
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=workingCopyBackupTracker.test.js.map
