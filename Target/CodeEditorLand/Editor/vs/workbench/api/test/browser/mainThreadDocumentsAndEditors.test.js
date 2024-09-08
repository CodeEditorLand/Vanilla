import assert from "assert";
import { Event } from "../../../../base/common/event.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { ILanguageConfigurationService } from "../../../../editor/common/languages/languageConfigurationRegistry.js";
import { TextModel } from "../../../../editor/common/model/textModel.js";
import { LanguageService } from "../../../../editor/common/services/languageService.js";
import { ModelService } from "../../../../editor/common/services/modelService.js";
import { TestCodeEditorService } from "../../../../editor/test/browser/editorTestServices.js";
import {
  createTestCodeEditor
} from "../../../../editor/test/browser/testCodeEditor.js";
import { TestLanguageConfigurationService } from "../../../../editor/test/common/modes/testLanguageConfigurationService.js";
import { TestConfigurationService } from "../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestDialogService } from "../../../../platform/dialogs/test/common/testDialogService.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { TestInstantiationService } from "../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { TestNotificationService } from "../../../../platform/notification/test/common/testNotificationService.js";
import { TestThemeService } from "../../../../platform/theme/test/common/testThemeService.js";
import { IUndoRedoService } from "../../../../platform/undoRedo/common/undoRedo.js";
import { UndoRedoService } from "../../../../platform/undoRedo/common/undoRedoService.js";
import { UriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentityService.js";
import {
  TestEditorGroupsService,
  TestEditorService,
  TestEnvironmentService,
  TestPathService
} from "../../../test/browser/workbenchTestServices.js";
import {
  TestTextResourcePropertiesService,
  TestWorkingCopyFileService
} from "../../../test/common/workbenchTestServices.js";
import { MainThreadDocumentsAndEditors } from "../../browser/mainThreadDocumentsAndEditors.js";
import { SingleProxyRPCProtocol } from "../common/testRPCProtocol.js";
suite("MainThreadDocumentsAndEditors", () => {
  let disposables;
  let modelService;
  let codeEditorService;
  let textFileService;
  const deltas = [];
  function myCreateTestCodeEditor(model) {
    return createTestCodeEditor(model, {
      hasTextFocus: false,
      serviceCollection: new ServiceCollection([
        ICodeEditorService,
        codeEditorService
      ])
    });
  }
  setup(() => {
    disposables = new DisposableStore();
    deltas.length = 0;
    const configService = new TestConfigurationService();
    configService.setUserConfiguration("editor", {
      detectIndentation: false
    });
    const dialogService = new TestDialogService();
    const notificationService = new TestNotificationService();
    const undoRedoService = new UndoRedoService(
      dialogService,
      notificationService
    );
    const themeService = new TestThemeService();
    const instantiationService = new TestInstantiationService();
    instantiationService.set(
      ILanguageService,
      disposables.add(new LanguageService())
    );
    instantiationService.set(
      ILanguageConfigurationService,
      new TestLanguageConfigurationService()
    );
    instantiationService.set(IUndoRedoService, undoRedoService);
    modelService = new ModelService(
      configService,
      new TestTextResourcePropertiesService(configService),
      undoRedoService,
      instantiationService
    );
    codeEditorService = new TestCodeEditorService(themeService);
    textFileService = new class extends mock() {
      isDirty() {
        return false;
      }
      files = {
        onDidSave: Event.None,
        onDidRevert: Event.None,
        onDidChangeDirty: Event.None
      };
    }();
    const workbenchEditorService = disposables.add(new TestEditorService());
    const editorGroupService = new TestEditorGroupsService();
    const fileService = new class extends mock() {
      onDidRunOperation = Event.None;
      onDidChangeFileSystemProviderCapabilities = Event.None;
      onDidChangeFileSystemProviderRegistrations = Event.None;
    }();
    new MainThreadDocumentsAndEditors(
      SingleProxyRPCProtocol(
        new class extends mock() {
          $acceptDocumentsAndEditorsDelta(delta) {
            deltas.push(delta);
          }
        }()
      ),
      modelService,
      textFileService,
      workbenchEditorService,
      codeEditorService,
      fileService,
      null,
      editorGroupService,
      new class extends mock() {
        onDidPaneCompositeOpen = Event.None;
        onDidPaneCompositeClose = Event.None;
        getActivePaneComposite() {
          return void 0;
        }
      }(),
      TestEnvironmentService,
      new TestWorkingCopyFileService(),
      new UriIdentityService(fileService),
      new class extends mock() {
        readText() {
          return Promise.resolve("clipboard_contents");
        }
      }(),
      new TestPathService(),
      new TestConfigurationService()
    );
  });
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Model#add", () => {
    deltas.length = 0;
    disposables.add(modelService.createModel("farboo", null));
    assert.strictEqual(deltas.length, 1);
    const [delta] = deltas;
    assert.strictEqual(delta.addedDocuments.length, 1);
    assert.strictEqual(delta.removedDocuments, void 0);
    assert.strictEqual(delta.addedEditors, void 0);
    assert.strictEqual(delta.removedEditors, void 0);
    assert.strictEqual(delta.newActiveEditor, void 0);
  });
  test("ignore huge model", () => {
    const oldLimit = TextModel._MODEL_SYNC_LIMIT;
    try {
      const largeModelString = "abc".repeat(1024);
      TextModel._MODEL_SYNC_LIMIT = largeModelString.length / 2;
      const model = modelService.createModel(largeModelString, null);
      disposables.add(model);
      assert.ok(model.isTooLargeForSyncing());
      assert.strictEqual(deltas.length, 1);
      const [delta] = deltas;
      assert.strictEqual(delta.newActiveEditor, null);
      assert.strictEqual(delta.addedDocuments, void 0);
      assert.strictEqual(delta.removedDocuments, void 0);
      assert.strictEqual(delta.addedEditors, void 0);
      assert.strictEqual(delta.removedEditors, void 0);
    } finally {
      TextModel._MODEL_SYNC_LIMIT = oldLimit;
    }
  });
  test("ignore huge model from editor", () => {
    const oldLimit = TextModel._MODEL_SYNC_LIMIT;
    try {
      const largeModelString = "abc".repeat(1024);
      TextModel._MODEL_SYNC_LIMIT = largeModelString.length / 2;
      const model = modelService.createModel(largeModelString, null);
      const editor = myCreateTestCodeEditor(model);
      assert.strictEqual(deltas.length, 1);
      deltas.length = 0;
      assert.strictEqual(deltas.length, 0);
      editor.dispose();
      model.dispose();
    } finally {
      TextModel._MODEL_SYNC_LIMIT = oldLimit;
    }
  });
  test("ignore simple widget model", function() {
    this.timeout(1e3 * 60);
    const model = modelService.createModel("test", null, void 0, true);
    disposables.add(model);
    assert.ok(model.isForSimpleWidget);
    assert.strictEqual(deltas.length, 1);
    const [delta] = deltas;
    assert.strictEqual(delta.newActiveEditor, null);
    assert.strictEqual(delta.addedDocuments, void 0);
    assert.strictEqual(delta.removedDocuments, void 0);
    assert.strictEqual(delta.addedEditors, void 0);
    assert.strictEqual(delta.removedEditors, void 0);
  });
  test("ignore editor w/o model", () => {
    const editor = myCreateTestCodeEditor(void 0);
    assert.strictEqual(deltas.length, 1);
    const [delta] = deltas;
    assert.strictEqual(delta.newActiveEditor, null);
    assert.strictEqual(delta.addedDocuments, void 0);
    assert.strictEqual(delta.removedDocuments, void 0);
    assert.strictEqual(delta.addedEditors, void 0);
    assert.strictEqual(delta.removedEditors, void 0);
    editor.dispose();
  });
  test("editor with model", () => {
    deltas.length = 0;
    const model = modelService.createModel("farboo", null);
    const editor = myCreateTestCodeEditor(model);
    assert.strictEqual(deltas.length, 2);
    const [first, second] = deltas;
    assert.strictEqual(first.addedDocuments.length, 1);
    assert.strictEqual(first.newActiveEditor, void 0);
    assert.strictEqual(first.removedDocuments, void 0);
    assert.strictEqual(first.addedEditors, void 0);
    assert.strictEqual(first.removedEditors, void 0);
    assert.strictEqual(second.addedEditors.length, 1);
    assert.strictEqual(second.addedDocuments, void 0);
    assert.strictEqual(second.removedDocuments, void 0);
    assert.strictEqual(second.removedEditors, void 0);
    assert.strictEqual(second.newActiveEditor, void 0);
    editor.dispose();
    model.dispose();
  });
  test("editor with dispos-ed/-ing model", () => {
    const model = modelService.createModel("farboo", null);
    const editor = myCreateTestCodeEditor(model);
    deltas.length = 0;
    modelService.destroyModel(model.uri);
    assert.strictEqual(deltas.length, 1);
    const [first] = deltas;
    assert.strictEqual(first.newActiveEditor, void 0);
    assert.strictEqual(first.removedEditors.length, 1);
    assert.strictEqual(first.removedDocuments.length, 1);
    assert.strictEqual(first.addedDocuments, void 0);
    assert.strictEqual(first.addedEditors, void 0);
    editor.dispose();
    model.dispose();
  });
});
