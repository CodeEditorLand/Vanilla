var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Event } from "../../../../../base/common/event.js";
import { ensureNoDisposablesAreLeakedInTestSuite, toResource } from "../../../../../base/test/common/utils.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { TestFilesConfigurationService, workbenchInstantiationService, TestServiceAccessor, registerTestFileEditor, createEditorPart, TestEnvironmentService, TestFileService, TestTextResourceConfigurationService } from "../../../../test/browser/workbenchTestServices.js";
import { ITextFileEditorModel } from "../../../../services/textfile/common/textfiles.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { TextFileEditorModelManager } from "../../../../services/textfile/common/textFileEditorModelManager.js";
import { EditorService } from "../../../../services/editor/browser/editorService.js";
import { EditorAutoSave } from "../../../../browser/parts/editor/editorAutoSave.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IFilesConfigurationService } from "../../../../services/filesConfiguration/common/filesConfigurationService.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { DEFAULT_EDITOR_ASSOCIATION } from "../../../../common/editor.js";
import { TestWorkspace } from "../../../../../platform/workspace/test/common/testWorkspace.js";
import { TestContextService, TestMarkerService } from "../../../../test/common/workbenchTestServices.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import { IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
suite("EditorAutoSave", () => {
  const disposables = new DisposableStore();
  setup(() => {
    disposables.add(registerTestFileEditor());
  });
  teardown(() => {
    disposables.clear();
  });
  async function createEditorAutoSave(autoSaveConfig) {
    const instantiationService = workbenchInstantiationService(void 0, disposables);
    const configurationService = new TestConfigurationService();
    configurationService.setUserConfiguration("files", autoSaveConfig);
    instantiationService.stub(IConfigurationService, configurationService);
    instantiationService.stub(IAccessibilitySignalService, {
      playSignal: /* @__PURE__ */ __name(async () => {
      }, "playSignal"),
      isSoundEnabled(signal) {
        return false;
      }
    });
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
    const accessor = instantiationService.createInstance(TestServiceAccessor);
    disposables.add(accessor.textFileService.files);
    disposables.add(instantiationService.createInstance(EditorAutoSave));
    return accessor;
  }
  __name(createEditorAutoSave, "createEditorAutoSave");
  test("editor auto saves after short delay if configured", async function() {
    const accessor = await createEditorAutoSave({ autoSave: "afterDelay", autoSaveDelay: 1 });
    const resource = toResource.call(this, "/path/index.txt");
    const model = disposables.add(await accessor.textFileService.files.resolve(resource));
    model.textEditorModel?.setValue("Super Good");
    assert.ok(model.isDirty());
    await awaitModelSaved(model);
    assert.strictEqual(model.isDirty(), false);
  });
  test("editor auto saves on focus change if configured", async function() {
    const accessor = await createEditorAutoSave({ autoSave: "onFocusChange" });
    const resource = toResource.call(this, "/path/index.txt");
    await accessor.editorService.openEditor({ resource, options: { override: DEFAULT_EDITOR_ASSOCIATION.id } });
    const model = disposables.add(await accessor.textFileService.files.resolve(resource));
    model.textEditorModel?.setValue("Super Good");
    assert.ok(model.isDirty());
    const editorPane = await accessor.editorService.openEditor({ resource: toResource.call(this, "/path/index_other.txt") });
    await awaitModelSaved(model);
    assert.strictEqual(model.isDirty(), false);
    await editorPane?.group.closeAllEditors();
  });
  function awaitModelSaved(model) {
    return Event.toPromise(Event.once(model.onDidChangeDirty));
  }
  __name(awaitModelSaved, "awaitModelSaved");
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=editorAutoSave.test.js.map
