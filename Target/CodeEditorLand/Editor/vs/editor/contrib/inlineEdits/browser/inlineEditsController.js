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
import { readHotReloadableExport } from "../../../../base/common/hotReloadHelpers.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import {
  derived,
  derivedDisposable,
  derivedObservableWithCache,
  derivedWithSetter,
  observableValue
} from "../../../../base/common/observable.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  bindContextKey,
  observableConfigValue
} from "../../../../platform/observable/common/platformObservableUtils.js";
import { observableCodeEditor } from "../../../browser/observableCodeEditor.js";
import { Selection } from "../../../common/core/selection.js";
import { ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { inlineEditVisible, isPinnedContextKey } from "./consts.js";
import { InlineEditsModel } from "./inlineEditsModel.js";
import { InlineEditsWidget } from "./inlineEditsWidget.js";
let InlineEditsController = class extends Disposable {
  constructor(editor, _instantiationService, _contextKeyService, _debounceService, _languageFeaturesService, _configurationService) {
    super();
    this.editor = editor;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._debounceService = _debounceService;
    this._languageFeaturesService = _languageFeaturesService;
    this._configurationService = _configurationService;
    this._register(bindContextKey(inlineEditVisible, this._contextKeyService, (r) => !!this.model.read(r)?.inlineEdit.read(r)));
    this._register(bindContextKey(isPinnedContextKey, this._contextKeyService, (r) => !!this.model.read(r)?.isPinned.read(r)));
    this.model.recomputeInitiallyAndOnChange(this._store);
    this._widget.recomputeInitiallyAndOnChange(this._store);
  }
  static {
    __name(this, "InlineEditsController");
  }
  static ID = "editor.contrib.inlineEditsController";
  static get(editor) {
    return editor.getContribution(
      InlineEditsController.ID
    );
  }
  _enabled = observableConfigValue(
    "editor.inlineEdits.enabled",
    false,
    this._configurationService
  );
  _editorObs = observableCodeEditor(this.editor);
  _selection = derived(
    this,
    (reader) => this._editorObs.cursorSelection.read(reader) ?? new Selection(1, 1, 1, 1)
  );
  _debounceValue = this._debounceService.for(
    this._languageFeaturesService.inlineCompletionsProvider,
    "InlineEditsDebounce",
    { min: 50, max: 50 }
  );
  model = derivedDisposable(
    this,
    (reader) => {
      if (!this._enabled.read(reader)) {
        return void 0;
      }
      if (this._editorObs.isReadonly.read(reader)) {
        return void 0;
      }
      const textModel = this._editorObs.model.read(reader);
      if (!textModel) {
        return void 0;
      }
      const model = this._instantiationService.createInstance(
        readHotReloadableExport(InlineEditsModel, reader),
        textModel,
        this._editorObs.versionId,
        this._selection,
        this._debounceValue
      );
      return model;
    }
  );
  _hadInlineEdit = derivedObservableWithCache(
    this,
    (reader, lastValue) => lastValue || this.model.read(reader)?.inlineEdit.read(reader) !== void 0
  );
  _widget = derivedDisposable(this, (reader) => {
    if (!this._hadInlineEdit.read(reader)) {
      return void 0;
    }
    return this._instantiationService.createInstance(
      readHotReloadableExport(InlineEditsWidget, reader),
      this.editor,
      this.model.map((m, reader2) => m?.inlineEdit.read(reader2)),
      flattenSettableObservable(
        (reader2) => this.model.read(reader2)?.userPrompt ?? observableValue("empty", "")
      )
    );
  });
};
InlineEditsController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ILanguageFeatureDebounceService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IConfigurationService)
], InlineEditsController);
function flattenSettableObservable(fn) {
  return derivedWithSetter(
    void 0,
    (reader) => {
      const obs = fn(reader);
      return obs.read(reader);
    },
    (value, tx) => {
      fn(void 0).set(value, tx);
    }
  );
}
__name(flattenSettableObservable, "flattenSettableObservable");
export {
  InlineEditsController
};
//# sourceMappingURL=inlineEditsController.js.map
