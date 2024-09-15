var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { BaseTextEditorModel } from "../../../../common/editor/textEditorModel.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { LanguageService } from "../../../../../editor/common/services/languageService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { ModelService } from "../../../../../editor/common/services/modelService.js";
import { ITextBufferFactory } from "../../../../../editor/common/model.js";
import { URI } from "../../../../../base/common/uri.js";
import { createTextBufferFactory } from "../../../../../editor/common/model/textModel.js";
import { ITextResourcePropertiesService } from "../../../../../editor/common/services/textResourceConfiguration.js";
import { IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { UndoRedoService } from "../../../../../platform/undoRedo/common/undoRedoService.js";
import { TestDialogService } from "../../../../../platform/dialogs/test/common/testDialogService.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { TestNotificationService } from "../../../../../platform/notification/test/common/testNotificationService.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { TestStorageService, TestTextResourcePropertiesService } from "../../../common/workbenchTestServices.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../../../platform/theme/test/common/testThemeService.js";
import { EditorModel } from "../../../../common/editor/editorModel.js";
import { Mimes } from "../../../../../base/common/mime.js";
import { LanguageDetectionService } from "../../../../services/languageDetection/browser/languageDetectionWorkerServiceImpl.js";
import { IWorkbenchEnvironmentService } from "../../../../services/environment/common/environmentService.js";
import { TestEditorService, TestEnvironmentService } from "../../workbenchTestServices.js";
import { TestLanguageConfigurationService } from "../../../../../editor/test/common/modes/testLanguageConfigurationService.js";
import { ILanguageConfigurationService } from "../../../../../editor/common/languages/languageConfigurationRegistry.js";
import { TestAccessibilityService } from "../../../../../platform/accessibility/test/common/testAccessibilityService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
suite("EditorModel", () => {
  class MyEditorModel extends EditorModel {
    static {
      __name(this, "MyEditorModel");
    }
  }
  class MyTextEditorModel extends BaseTextEditorModel {
    static {
      __name(this, "MyTextEditorModel");
    }
    testCreateTextEditorModel(value, resource, preferredLanguageId) {
      return super.createTextEditorModel(value, resource, preferredLanguageId);
    }
    isReadonly() {
      return false;
    }
  }
  function stubModelService(instantiationService2) {
    const dialogService = new TestDialogService();
    const notificationService = new TestNotificationService();
    const undoRedoService = new UndoRedoService(dialogService, notificationService);
    instantiationService2.stub(IWorkbenchEnvironmentService, TestEnvironmentService);
    instantiationService2.stub(IConfigurationService, new TestConfigurationService());
    instantiationService2.stub(ITextResourcePropertiesService, new TestTextResourcePropertiesService(instantiationService2.get(IConfigurationService)));
    instantiationService2.stub(IDialogService, dialogService);
    instantiationService2.stub(INotificationService, notificationService);
    instantiationService2.stub(IUndoRedoService, undoRedoService);
    instantiationService2.stub(IEditorService, disposables.add(new TestEditorService()));
    instantiationService2.stub(IThemeService, new TestThemeService());
    instantiationService2.stub(ILanguageConfigurationService, disposables.add(new TestLanguageConfigurationService()));
    instantiationService2.stub(IStorageService, disposables.add(new TestStorageService()));
    return disposables.add(instantiationService2.createInstance(ModelService));
  }
  __name(stubModelService, "stubModelService");
  let instantiationService;
  let languageService;
  const disposables = new DisposableStore();
  setup(() => {
    instantiationService = disposables.add(new TestInstantiationService());
    languageService = instantiationService.stub(ILanguageService, LanguageService);
  });
  teardown(() => {
    disposables.clear();
  });
  test("basics", async () => {
    let counter = 0;
    const model = disposables.add(new MyEditorModel());
    disposables.add(model.onWillDispose(() => {
      assert(true);
      counter++;
    }));
    await model.resolve();
    assert.strictEqual(model.isDisposed(), false);
    assert.strictEqual(model.isResolved(), true);
    model.dispose();
    assert.strictEqual(counter, 1);
    assert.strictEqual(model.isDisposed(), true);
  });
  test("BaseTextEditorModel", async () => {
    const modelService = stubModelService(instantiationService);
    const model = disposables.add(new MyTextEditorModel(modelService, languageService, disposables.add(instantiationService.createInstance(LanguageDetectionService)), instantiationService.createInstance(TestAccessibilityService)));
    await model.resolve();
    disposables.add(model.testCreateTextEditorModel(createTextBufferFactory("foo"), null, Mimes.text));
    assert.strictEqual(model.isResolved(), true);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=editorModel.test.js.map
