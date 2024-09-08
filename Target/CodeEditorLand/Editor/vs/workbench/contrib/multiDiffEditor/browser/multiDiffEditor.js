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
import { MultiDiffEditorWidget } from "../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorWidget.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ResourceLabel } from "../../../browser/labels.js";
import { AbstractEditorWithViewState } from "../../../browser/parts/editor/editorWithViewState.js";
import {
  IEditorGroupsService
} from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
  MultiDiffEditorInput
} from "./multiDiffEditorInput.js";
let MultiDiffEditor = class extends AbstractEditorWithViewState {
  static ID = "multiDiffEditor";
  _multiDiffEditorWidget = void 0;
  _viewModel;
  get viewModel() {
    return this._viewModel;
  }
  constructor(group, instantiationService, telemetryService, themeService, storageService, editorService, editorGroupService, textResourceConfigurationService) {
    super(
      MultiDiffEditor.ID,
      group,
      "multiDiffEditor",
      telemetryService,
      instantiationService,
      storageService,
      textResourceConfigurationService,
      themeService,
      editorService,
      editorGroupService
    );
  }
  createEditor(parent) {
    this._multiDiffEditorWidget = this._register(
      this.instantiationService.createInstance(
        MultiDiffEditorWidget,
        parent,
        this.instantiationService.createInstance(
          WorkbenchUIElementFactory
        )
      )
    );
    this._register(
      this._multiDiffEditorWidget.onDidChangeActiveControl(() => {
        this._onDidChangeControl.fire();
      })
    );
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    this._viewModel = await input.getViewModel();
    this._multiDiffEditorWidget.setViewModel(this._viewModel);
    const viewState = this.loadEditorViewState(input, context);
    if (viewState) {
      this._multiDiffEditorWidget.setViewState(viewState);
    }
    this._applyOptions(options);
  }
  setOptions(options) {
    this._applyOptions(options);
  }
  _applyOptions(options) {
    const viewState = options?.viewState;
    if (!viewState || !viewState.revealData) {
      return;
    }
    this._multiDiffEditorWidget?.reveal(viewState.revealData.resource, {
      range: viewState.revealData.range ? Range.lift(viewState.revealData.range) : void 0,
      highlight: true
    });
  }
  async clearInput() {
    await super.clearInput();
    this._multiDiffEditorWidget.setViewModel(void 0);
  }
  layout(dimension) {
    this._multiDiffEditorWidget.layout(dimension);
  }
  getControl() {
    return this._multiDiffEditorWidget.getActiveControl();
  }
  focus() {
    super.focus();
    this._multiDiffEditorWidget?.getActiveControl()?.focus();
  }
  hasFocus() {
    return this._multiDiffEditorWidget?.getActiveControl()?.hasTextFocus() || super.hasFocus();
  }
  computeEditorViewState(resource) {
    return this._multiDiffEditorWidget.getViewState();
  }
  tracksEditorViewState(input) {
    return input instanceof MultiDiffEditorInput;
  }
  toEditorViewStateResource(input) {
    return input.resource;
  }
  tryGetCodeEditor(resource) {
    return this._multiDiffEditorWidget.tryGetCodeEditor(resource);
  }
  findDocumentDiffItem(resource) {
    const i = this._multiDiffEditorWidget.findDocumentDiffItem(resource);
    if (!i) {
      return void 0;
    }
    const i2 = i;
    return i2.multiDiffEditorItem;
  }
};
MultiDiffEditor = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, ITextResourceConfigurationService)
], MultiDiffEditor);
let WorkbenchUIElementFactory = class {
  constructor(_instantiationService) {
    this._instantiationService = _instantiationService;
  }
  createResourceLabel(element) {
    const label = this._instantiationService.createInstance(
      ResourceLabel,
      element,
      {}
    );
    return {
      setUri(uri, options = {}) {
        if (uri) {
          label.element.setFile(uri, {
            strikethrough: options.strikethrough
          });
        } else {
          label.element.clear();
        }
      },
      dispose() {
        label.dispose();
      }
    };
  }
};
WorkbenchUIElementFactory = __decorateClass([
  __decorateParam(0, IInstantiationService)
], WorkbenchUIElementFactory);
export {
  MultiDiffEditor
};
