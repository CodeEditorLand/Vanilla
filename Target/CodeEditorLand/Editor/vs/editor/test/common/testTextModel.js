import {
  DisposableStore
} from "../../../base/common/lifecycle.js";
import { mock } from "../../../base/test/common/mock.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../platform/configuration/test/common/testConfigurationService.js";
import { IDialogService } from "../../../platform/dialogs/common/dialogs.js";
import { TestDialogService } from "../../../platform/dialogs/test/common/testDialogService.js";
import { IEnvironmentService } from "../../../platform/environment/common/environment.js";
import {
  createServices
} from "../../../platform/instantiation/test/common/instantiationServiceMock.js";
import {
  ILogService,
  NullLogService
} from "../../../platform/log/common/log.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { TestNotificationService } from "../../../platform/notification/test/common/testNotificationService.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../platform/theme/test/common/testThemeService.js";
import { IUndoRedoService } from "../../../platform/undoRedo/common/undoRedo.js";
import { UndoRedoService } from "../../../platform/undoRedo/common/undoRedoService.js";
import { ILanguageService } from "../../common/languages/language.js";
import { ILanguageConfigurationService } from "../../common/languages/languageConfigurationRegistry.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../common/languages/modesRegistry.js";
import { TextModel } from "../../common/model/textModel.js";
import {
  ILanguageFeatureDebounceService,
  LanguageFeatureDebounceService
} from "../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../common/services/languageFeatures.js";
import { LanguageFeaturesService } from "../../common/services/languageFeaturesService.js";
import { LanguageService } from "../../common/services/languageService.js";
import { IModelService } from "../../common/services/model.js";
import { ModelService } from "../../common/services/modelService.js";
import { ITextResourcePropertiesService } from "../../common/services/textResourceConfiguration.js";
import { ITreeSitterParserService } from "../../common/services/treeSitterParserService.js";
import { TestLanguageConfigurationService } from "./modes/testLanguageConfigurationService.js";
import { TestTextResourcePropertiesService } from "./services/testTextResourcePropertiesService.js";
import { TestTreeSitterParserService } from "./services/testTreeSitterService.js";
class TestTextModel extends TextModel {
  registerDisposable(disposable) {
    this._register(disposable);
  }
}
function withEditorModel(text, callback) {
  const model = createTextModel(text.join("\n"));
  callback(model);
  model.dispose();
}
function resolveOptions(_options) {
  const defaultOptions = TextModel.DEFAULT_CREATION_OPTIONS;
  return {
    tabSize: typeof _options.tabSize === "undefined" ? defaultOptions.tabSize : _options.tabSize,
    indentSize: typeof _options.indentSize === "undefined" ? defaultOptions.indentSize : _options.indentSize,
    insertSpaces: typeof _options.insertSpaces === "undefined" ? defaultOptions.insertSpaces : _options.insertSpaces,
    detectIndentation: typeof _options.detectIndentation === "undefined" ? defaultOptions.detectIndentation : _options.detectIndentation,
    trimAutoWhitespace: typeof _options.trimAutoWhitespace === "undefined" ? defaultOptions.trimAutoWhitespace : _options.trimAutoWhitespace,
    defaultEOL: typeof _options.defaultEOL === "undefined" ? defaultOptions.defaultEOL : _options.defaultEOL,
    isForSimpleWidget: typeof _options.isForSimpleWidget === "undefined" ? defaultOptions.isForSimpleWidget : _options.isForSimpleWidget,
    largeFileOptimizations: typeof _options.largeFileOptimizations === "undefined" ? defaultOptions.largeFileOptimizations : _options.largeFileOptimizations,
    bracketPairColorizationOptions: typeof _options.bracketColorizationOptions === "undefined" ? defaultOptions.bracketPairColorizationOptions : _options.bracketColorizationOptions
  };
}
function createTextModel(text, languageId = null, options = TextModel.DEFAULT_CREATION_OPTIONS, uri = null) {
  const disposables = new DisposableStore();
  const instantiationService = createModelServices(disposables);
  const model = instantiateTextModel(
    instantiationService,
    text,
    languageId,
    options,
    uri
  );
  model.registerDisposable(disposables);
  return model;
}
function instantiateTextModel(instantiationService, text, languageId = null, _options = TextModel.DEFAULT_CREATION_OPTIONS, uri = null) {
  const options = resolveOptions(_options);
  return instantiationService.createInstance(
    TestTextModel,
    text,
    languageId || PLAINTEXT_LANGUAGE_ID,
    options,
    uri
  );
}
function createModelServices(disposables, services = []) {
  return createServices(
    disposables,
    services.concat([
      [INotificationService, TestNotificationService],
      [IDialogService, TestDialogService],
      [IUndoRedoService, UndoRedoService],
      [ILanguageService, LanguageService],
      [ILanguageConfigurationService, TestLanguageConfigurationService],
      [IConfigurationService, TestConfigurationService],
      [ITextResourcePropertiesService, TestTextResourcePropertiesService],
      [IThemeService, TestThemeService],
      [ILogService, NullLogService],
      [
        IEnvironmentService,
        new class extends mock() {
          isBuilt = true;
          isExtensionDevelopment = false;
        }()
      ],
      [ILanguageFeatureDebounceService, LanguageFeatureDebounceService],
      [ILanguageFeaturesService, LanguageFeaturesService],
      [IModelService, ModelService],
      [ITreeSitterParserService, TestTreeSitterParserService]
    ])
  );
}
export {
  createModelServices,
  createTextModel,
  instantiateTextModel,
  withEditorModel
};
