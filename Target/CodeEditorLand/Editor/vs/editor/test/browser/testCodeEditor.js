var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore, IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { mock } from "../../../base/test/common/mock.js";
import { EditorConfiguration } from "../../browser/config/editorConfiguration.js";
import { IActiveCodeEditor, ICodeEditor } from "../../browser/editorBrowser.js";
import { ICodeEditorService } from "../../browser/services/codeEditorService.js";
import { View } from "../../browser/view.js";
import { CodeEditorWidget, ICodeEditorWidgetOptions } from "../../browser/widget/codeEditor/codeEditorWidget.js";
import * as editorOptions from "../../common/config/editorOptions.js";
import { IEditorContribution } from "../../common/editorCommon.js";
import { ILanguageService } from "../../common/languages/language.js";
import { ILanguageConfigurationService } from "../../common/languages/languageConfigurationRegistry.js";
import { ITextBufferFactory, ITextModel } from "../../common/model.js";
import { IEditorWorkerService } from "../../common/services/editorWorker.js";
import { ILanguageFeatureDebounceService, LanguageFeatureDebounceService } from "../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../common/services/languageFeatures.js";
import { LanguageFeaturesService } from "../../common/services/languageFeaturesService.js";
import { LanguageService } from "../../common/services/languageService.js";
import { IModelService } from "../../common/services/model.js";
import { ModelService } from "../../common/services/modelService.js";
import { ITextResourcePropertiesService } from "../../common/services/textResourceConfiguration.js";
import { ITreeSitterParserService } from "../../common/services/treeSitterParserService.js";
import { ViewModel } from "../../common/viewModel/viewModelImpl.js";
import { TestConfiguration } from "./config/testConfiguration.js";
import { TestCodeEditorService, TestCommandService } from "./editorTestServices.js";
import { TestTreeSitterParserService } from "../common/services/testTreeSitterService.js";
import { TestLanguageConfigurationService } from "../common/modes/testLanguageConfigurationService.js";
import { TestEditorWorkerService } from "../common/services/testEditorWorkerService.js";
import { TestTextResourcePropertiesService } from "../common/services/testTextResourcePropertiesService.js";
import { instantiateTextModel } from "../common/testTextModel.js";
import { AccessibilitySupport, IAccessibilityService } from "../../../platform/accessibility/common/accessibility.js";
import { TestAccessibilityService } from "../../../platform/accessibility/test/common/testAccessibilityService.js";
import { MenuId } from "../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
import { TestClipboardService } from "../../../platform/clipboard/test/common/testClipboardService.js";
import { ICommandService } from "../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../platform/configuration/test/common/testConfigurationService.js";
import { IContextKeyService, IContextKeyServiceTarget } from "../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../platform/dialogs/common/dialogs.js";
import { TestDialogService } from "../../../platform/dialogs/test/common/testDialogService.js";
import { IEnvironmentService } from "../../../platform/environment/common/environment.js";
import { SyncDescriptor } from "../../../platform/instantiation/common/descriptors.js";
import { BrandedService, IInstantiationService, ServiceIdentifier } from "../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../platform/instantiation/common/serviceCollection.js";
import { TestInstantiationService } from "../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import { MockContextKeyService, MockKeybindingService } from "../../../platform/keybinding/test/common/mockKeybindingService.js";
import { ILogService, NullLogService } from "../../../platform/log/common/log.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { TestNotificationService } from "../../../platform/notification/test/common/testNotificationService.js";
import { IOpenerService } from "../../../platform/opener/common/opener.js";
import { NullOpenerService } from "../../../platform/opener/test/common/nullOpenerService.js";
import { ITelemetryService } from "../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryServiceShape } from "../../../platform/telemetry/common/telemetryUtils.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../platform/theme/test/common/testThemeService.js";
import { IUndoRedoService } from "../../../platform/undoRedo/common/undoRedo.js";
import { UndoRedoService } from "../../../platform/undoRedo/common/undoRedoService.js";
class TestCodeEditor extends CodeEditorWidget {
  static {
    __name(this, "TestCodeEditor");
  }
  //#region testing overrides
  _createConfiguration(isSimpleWidget, contextMenuId, options) {
    return new TestConfiguration(options);
  }
  _createView(viewModel) {
    return [null, false];
  }
  _hasTextFocus = false;
  setHasTextFocus(hasTextFocus) {
    this._hasTextFocus = hasTextFocus;
  }
  hasTextFocus() {
    return this._hasTextFocus;
  }
  //#endregion
  //#region Testing utils
  getViewModel() {
    return this._modelData ? this._modelData.viewModel : void 0;
  }
  registerAndInstantiateContribution(id, ctor) {
    const r = this._instantiationService.createInstance(ctor, this);
    this._contributions.set(id, r);
    return r;
  }
  registerDisposable(disposable) {
    this._register(disposable);
  }
}
class TestEditorDomElement {
  static {
    __name(this, "TestEditorDomElement");
  }
  parentElement = null;
  ownerDocument = document;
  document = document;
  setAttribute(attr, value) {
  }
  removeAttribute(attr) {
  }
  hasAttribute(attr) {
    return false;
  }
  getAttribute(attr) {
    return void 0;
  }
  addEventListener(event) {
  }
  removeEventListener(event) {
  }
}
function withTestCodeEditor(text, options, callback) {
  return _withTestCodeEditor(text, options, callback);
}
__name(withTestCodeEditor, "withTestCodeEditor");
async function withAsyncTestCodeEditor(text, options, callback) {
  return _withTestCodeEditor(text, options, callback);
}
__name(withAsyncTestCodeEditor, "withAsyncTestCodeEditor");
function isTextModel(arg) {
  return Boolean(arg && arg.uri);
}
__name(isTextModel, "isTextModel");
function _withTestCodeEditor(arg, options, callback) {
  const disposables = new DisposableStore();
  const instantiationService = createCodeEditorServices(disposables, options.serviceCollection);
  delete options.serviceCollection;
  let model;
  if (isTextModel(arg)) {
    model = arg;
  } else {
    model = disposables.add(instantiateTextModel(instantiationService, Array.isArray(arg) ? arg.join("\n") : arg));
  }
  const editor = disposables.add(instantiateTestCodeEditor(instantiationService, model, options));
  const viewModel = editor.getViewModel();
  viewModel.setHasFocus(true);
  const result = callback(editor, editor.getViewModel(), instantiationService);
  if (result) {
    return result.then(() => disposables.dispose());
  }
  disposables.dispose();
}
__name(_withTestCodeEditor, "_withTestCodeEditor");
function createCodeEditorServices(disposables, services = new ServiceCollection()) {
  const serviceIdentifiers = [];
  const define = /* @__PURE__ */ __name((id, ctor) => {
    if (!services.has(id)) {
      services.set(id, new SyncDescriptor(ctor));
    }
    serviceIdentifiers.push(id);
  }, "define");
  const defineInstance = /* @__PURE__ */ __name((id, instance) => {
    if (!services.has(id)) {
      services.set(id, instance);
    }
    serviceIdentifiers.push(id);
  }, "defineInstance");
  define(IAccessibilityService, TestAccessibilityService);
  define(IKeybindingService, MockKeybindingService);
  define(IClipboardService, TestClipboardService);
  define(IEditorWorkerService, TestEditorWorkerService);
  defineInstance(IOpenerService, NullOpenerService);
  define(INotificationService, TestNotificationService);
  define(IDialogService, TestDialogService);
  define(IUndoRedoService, UndoRedoService);
  define(ILanguageService, LanguageService);
  define(ILanguageConfigurationService, TestLanguageConfigurationService);
  define(IConfigurationService, TestConfigurationService);
  define(ITextResourcePropertiesService, TestTextResourcePropertiesService);
  define(IThemeService, TestThemeService);
  define(ILogService, NullLogService);
  define(IModelService, ModelService);
  define(ICodeEditorService, TestCodeEditorService);
  define(IContextKeyService, MockContextKeyService);
  define(ICommandService, TestCommandService);
  define(ITelemetryService, NullTelemetryServiceShape);
  define(IEnvironmentService, class extends mock() {
    isBuilt = true;
    isExtensionDevelopment = false;
  });
  define(ILanguageFeatureDebounceService, LanguageFeatureDebounceService);
  define(ILanguageFeaturesService, LanguageFeaturesService);
  define(ITreeSitterParserService, TestTreeSitterParserService);
  const instantiationService = disposables.add(new TestInstantiationService(services, true));
  disposables.add(toDisposable(() => {
    for (const id of serviceIdentifiers) {
      const instanceOrDescriptor = services.get(id);
      if (typeof instanceOrDescriptor.dispose === "function") {
        instanceOrDescriptor.dispose();
      }
    }
  }));
  return instantiationService;
}
__name(createCodeEditorServices, "createCodeEditorServices");
function createTestCodeEditor(model, options = {}) {
  const disposables = new DisposableStore();
  const instantiationService = createCodeEditorServices(disposables, options.serviceCollection);
  delete options.serviceCollection;
  const editor = instantiateTestCodeEditor(instantiationService, model || null, options);
  editor.registerDisposable(disposables);
  return editor;
}
__name(createTestCodeEditor, "createTestCodeEditor");
function instantiateTestCodeEditor(instantiationService, model, options = {}) {
  const codeEditorWidgetOptions = {
    contributions: []
  };
  const editor = instantiationService.createInstance(
    TestCodeEditor,
    new TestEditorDomElement(),
    options,
    codeEditorWidgetOptions
  );
  if (typeof options.hasTextFocus === "undefined") {
    options.hasTextFocus = true;
  }
  editor.setHasTextFocus(options.hasTextFocus);
  editor.setModel(model);
  const viewModel = editor.getViewModel();
  viewModel?.setHasFocus(options.hasTextFocus);
  return editor;
}
__name(instantiateTestCodeEditor, "instantiateTestCodeEditor");
export {
  TestCodeEditor,
  createCodeEditorServices,
  createTestCodeEditor,
  instantiateTestCodeEditor,
  withAsyncTestCodeEditor,
  withTestCodeEditor
};
//# sourceMappingURL=testCodeEditor.js.map
