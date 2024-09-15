var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Event } from "../../../../../base/common/event.js";
import { TextFileEditorTracker } from "../../browser/editors/textFileEditorTracker.js";
import { ensureNoDisposablesAreLeakedInTestSuite, toResource } from "../../../../../base/test/common/utils.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { workbenchInstantiationService, TestServiceAccessor, TestFilesConfigurationService, registerTestFileEditor, registerTestResourceEditor, createEditorPart, TestEnvironmentService, TestFileService, workbenchTeardown, TestTextResourceConfigurationService } from "../../../../test/browser/workbenchTestServices.js";
import { IResolvedTextFileEditorModel, snapshotToString, ITextFileService } from "../../../../services/textfile/common/textfiles.js";
import { FileChangesEvent, FileChangeType, FileOperationError, FileOperationResult } from "../../../../../platform/files/common/files.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { timeout } from "../../../../../base/common/async.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { TextFileEditorModelManager } from "../../../../services/textfile/common/textFileEditorModelManager.js";
import { EditorService } from "../../../../services/editor/browser/editorService.js";
import { UntitledTextEditorInput } from "../../../../services/untitled/common/untitledTextEditorInput.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFilesConfigurationService } from "../../../../services/filesConfiguration/common/filesConfigurationService.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { FILE_EDITOR_INPUT_ID } from "../../common/files.js";
import { DEFAULT_EDITOR_ASSOCIATION } from "../../../../common/editor.js";
import { TestWorkspace } from "../../../../../platform/workspace/test/common/testWorkspace.js";
import { TestContextService, TestMarkerService } from "../../../../test/common/workbenchTestServices.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
suite("Files - TextFileEditorTracker", () => {
  const disposables = new DisposableStore();
  class TestTextFileEditorTracker extends TextFileEditorTracker {
    static {
      __name(this, "TestTextFileEditorTracker");
    }
    getDirtyTextFileTrackerDelay() {
      return 5;
    }
  }
  setup(() => {
    disposables.add(registerTestFileEditor());
    disposables.add(registerTestResourceEditor());
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
    const fileService = disposables.add(new TestFileService());
    instantiationService.stub(IFilesConfigurationService, disposables.add(new TestFilesConfigurationService(
      instantiationService.createInstance(MockContextKeyService),
      configurationService,
      new TestContextService(TestWorkspace),
      TestEnvironmentService,
      disposables.add(new UriIdentityService(fileService)),
      fileService,
      new TestMarkerService(),
      new TestTextResourceConfigurationService(configurationService)
    )));
    const part = await createEditorPart(instantiationService, disposables);
    instantiationService.stub(IEditorGroupsService, part);
    const editorService = disposables.add(instantiationService.createInstance(EditorService, void 0));
    disposables.add(editorService);
    instantiationService.stub(IEditorService, editorService);
    const accessor = instantiationService.createInstance(TestServiceAccessor);
    disposables.add(accessor.textFileService.files);
    disposables.add(instantiationService.createInstance(TestTextFileEditorTracker));
    const cleanup = /* @__PURE__ */ __name(async () => {
      await workbenchTeardown(instantiationService);
      part.dispose();
    }, "cleanup");
    return { accessor, cleanup };
  }
  __name(createTracker, "createTracker");
  test("file change event updates model", async function() {
    const { accessor, cleanup } = await createTracker();
    const resource = toResource.call(this, "/path/index.txt");
    const model = await accessor.textFileService.files.resolve(resource);
    disposables.add(model);
    model.textEditorModel.setValue("Super Good");
    assert.strictEqual(snapshotToString(model.createSnapshot()), "Super Good");
    await model.save();
    accessor.fileService.fireFileChanges(new FileChangesEvent([{ resource, type: FileChangeType.UPDATED }], false));
    await timeout(0);
    assert.strictEqual(snapshotToString(model.createSnapshot()), "Hello Html");
    await cleanup();
  });
  test("dirty text file model opens as editor", async function() {
    const resource = toResource.call(this, "/path/index.txt");
    await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, false, false);
  });
  test("dirty text file model does not open as editor if autosave is ON", async function() {
    const resource = toResource.call(this, "/path/index.txt");
    await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, true, false);
  });
  test("dirty text file model opens as editor when save fails", async function() {
    const resource = toResource.call(this, "/path/index.txt");
    await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, false, true);
  });
  test("dirty text file model opens as editor when save fails if autosave is ON", async function() {
    const resource = toResource.call(this, "/path/index.txt");
    await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, true, true);
  });
  async function testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, autoSave, error) {
    const { accessor, cleanup } = await createTracker(autoSave);
    assert.ok(!accessor.editorService.isOpened({ resource, typeId: FILE_EDITOR_INPUT_ID, editorId: DEFAULT_EDITOR_ASSOCIATION.id }));
    if (error) {
      accessor.textFileService.setWriteErrorOnce(new FileOperationError("fail to write", FileOperationResult.FILE_OTHER_ERROR));
    }
    const model = await accessor.textFileService.files.resolve(resource);
    disposables.add(model);
    model.textEditorModel.setValue("Super Good");
    if (autoSave) {
      await model.save();
      await timeout(10);
      if (error) {
        assert.ok(accessor.editorService.isOpened({ resource, typeId: FILE_EDITOR_INPUT_ID, editorId: DEFAULT_EDITOR_ASSOCIATION.id }));
      } else {
        assert.ok(!accessor.editorService.isOpened({ resource, typeId: FILE_EDITOR_INPUT_ID, editorId: DEFAULT_EDITOR_ASSOCIATION.id }));
      }
    } else {
      await awaitEditorOpening(accessor.editorService);
      assert.ok(accessor.editorService.isOpened({ resource, typeId: FILE_EDITOR_INPUT_ID, editorId: DEFAULT_EDITOR_ASSOCIATION.id }));
    }
    await cleanup();
  }
  __name(testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting, "testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting");
  test("dirty untitled text file model opens as editor", function() {
    return testUntitledEditor(false);
  });
  test("dirty untitled text file model opens as editor - autosave ON", function() {
    return testUntitledEditor(true);
  });
  async function testUntitledEditor(autoSaveEnabled) {
    const { accessor, cleanup } = await createTracker(autoSaveEnabled);
    const untitledTextEditor = await accessor.textEditorService.resolveTextEditor({ resource: void 0, forceUntitled: true });
    const model = disposables.add(await untitledTextEditor.resolve());
    assert.ok(!accessor.editorService.isOpened(untitledTextEditor));
    model.textEditorModel?.setValue("Super Good");
    await awaitEditorOpening(accessor.editorService);
    assert.ok(accessor.editorService.isOpened(untitledTextEditor));
    await cleanup();
  }
  __name(testUntitledEditor, "testUntitledEditor");
  function awaitEditorOpening(editorService) {
    return Event.toPromise(Event.once(editorService.onDidActiveEditorChange));
  }
  __name(awaitEditorOpening, "awaitEditorOpening");
  test("non-dirty files reload on window focus", async function() {
    const { accessor, cleanup } = await createTracker();
    const resource = toResource.call(this, "/path/index.txt");
    await accessor.editorService.openEditor(await accessor.textEditorService.resolveTextEditor({ resource, options: { override: DEFAULT_EDITOR_ASSOCIATION.id } }));
    accessor.hostService.setFocus(false);
    accessor.hostService.setFocus(true);
    await awaitModelResolveEvent(accessor.textFileService, resource);
    await cleanup();
  });
  function awaitModelResolveEvent(textFileService, resource) {
    return new Promise((resolve) => {
      const listener = textFileService.files.onDidResolve((e) => {
        if (isEqual(e.model.resource, resource)) {
          listener.dispose();
          resolve();
        }
      });
    });
  }
  __name(awaitModelResolveEvent, "awaitModelResolveEvent");
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=textFileEditorTracker.test.js.map
