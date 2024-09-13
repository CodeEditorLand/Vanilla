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
import { localize } from "../../../../nls.js";
import { URI } from "../../../../base/common/uri.js";
import { distinct, deepClone } from "../../../../base/common/objects.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { isObject, assertIsDefined } from "../../../../base/common/types.js";
import { MutableDisposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { IEditorOpenContext, IEditorPaneSelection, EditorPaneSelectionCompareResult, EditorPaneSelectionChangeReason, IEditorPaneWithSelection, IEditorPaneSelectionChangeEvent, IEditorPaneScrollPosition, IEditorPaneWithScrolling } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { computeEditorAriaLabel } from "../../editor.js";
import { AbstractEditorWithViewState } from "./editorWithViewState.js";
import { IEditorViewState } from "../../../../editor/common/editorCommon.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ITextResourceConfigurationChangeEvent, ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IEditorOptions as ICodeEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { IEditorGroup, IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IEditorOptions, ITextEditorOptions, TextEditorSelectionRevealType, TextEditorSelectionSource } from "../../../../platform/editor/common/editor.js";
import { ICursorPositionChangedEvent } from "../../../../editor/common/cursorEvents.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
let AbstractTextEditor = class extends AbstractEditorWithViewState {
  constructor(id, group, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService) {
    super(id, group, AbstractTextEditor.VIEW_STATE_PREFERENCE_KEY, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
    this.fileService = fileService;
    this._register(this.textResourceConfigurationService.onDidChangeConfiguration((e) => this.handleConfigurationChangeEvent(e)));
    this._register(Event.any(this.editorGroupService.onDidAddGroup, this.editorGroupService.onDidRemoveGroup)(() => {
      const ariaLabel = this.computeAriaLabel();
      this.editorContainer?.setAttribute("aria-label", ariaLabel);
      this.updateEditorControlOptions({ ariaLabel });
    }));
    this._register(this.fileService.onDidChangeFileSystemProviderCapabilities((e) => this.onDidChangeFileSystemProvider(e.scheme)));
    this._register(this.fileService.onDidChangeFileSystemProviderRegistrations((e) => this.onDidChangeFileSystemProvider(e.scheme)));
  }
  static {
    __name(this, "AbstractTextEditor");
  }
  static VIEW_STATE_PREFERENCE_KEY = "textEditorViewState";
  _onDidChangeSelection = this._register(new Emitter());
  onDidChangeSelection = this._onDidChangeSelection.event;
  _onDidChangeScroll = this._register(new Emitter());
  onDidChangeScroll = this._onDidChangeScroll.event;
  editorContainer;
  hasPendingConfigurationChange;
  lastAppliedEditorOptions;
  inputListener = this._register(new MutableDisposable());
  handleConfigurationChangeEvent(e) {
    const resource = this.getActiveResource();
    if (!this.shouldHandleConfigurationChangeEvent(e, resource)) {
      return;
    }
    if (this.isVisible()) {
      this.updateEditorConfiguration(resource);
    } else {
      this.hasPendingConfigurationChange = true;
    }
  }
  shouldHandleConfigurationChangeEvent(e, resource) {
    return e.affectsConfiguration(resource, "editor") || e.affectsConfiguration(resource, "problems.visibility");
  }
  consumePendingConfigurationChangeEvent() {
    if (this.hasPendingConfigurationChange) {
      this.updateEditorConfiguration();
      this.hasPendingConfigurationChange = false;
    }
  }
  computeConfiguration(configuration) {
    const editorConfiguration = isObject(configuration.editor) ? deepClone(configuration.editor) : /* @__PURE__ */ Object.create(null);
    Object.assign(editorConfiguration, this.getConfigurationOverrides(configuration));
    editorConfiguration.ariaLabel = this.computeAriaLabel();
    return editorConfiguration;
  }
  computeAriaLabel() {
    return this.input ? computeEditorAriaLabel(this.input, void 0, this.group, this.editorGroupService.count) : localize("editor", "Editor");
  }
  onDidChangeFileSystemProvider(scheme) {
    if (!this.input) {
      return;
    }
    if (this.getActiveResource()?.scheme === scheme) {
      this.updateReadonly(this.input);
    }
  }
  onDidChangeInputCapabilities(input) {
    if (this.input === input) {
      this.updateReadonly(input);
    }
  }
  updateReadonly(input) {
    this.updateEditorControlOptions({ ...this.getReadonlyConfiguration(input.isReadonly()) });
  }
  getReadonlyConfiguration(isReadonly) {
    return {
      readOnly: !!isReadonly,
      readOnlyMessage: typeof isReadonly !== "boolean" ? isReadonly : void 0
    };
  }
  getConfigurationOverrides(configuration) {
    return {
      overviewRulerLanes: 3,
      lineNumbersMinChars: 3,
      fixedOverflowWidgets: true,
      ...this.getReadonlyConfiguration(this.input?.isReadonly()),
      renderValidationDecorations: configuration.problems?.visibility !== false ? "on" : "off"
    };
  }
  createEditor(parent) {
    this.editorContainer = parent;
    this.createEditorControl(parent, this.computeConfiguration(this.textResourceConfigurationService.getValue(this.getActiveResource())));
    this.registerCodeEditorListeners();
  }
  registerCodeEditorListeners() {
    const mainControl = this.getMainControl();
    if (mainControl) {
      this._register(mainControl.onDidChangeModelLanguage(() => this.updateEditorConfiguration()));
      this._register(mainControl.onDidChangeModel(() => this.updateEditorConfiguration()));
      this._register(mainControl.onDidChangeCursorPosition((e) => this._onDidChangeSelection.fire({ reason: this.toEditorPaneSelectionChangeReason(e) })));
      this._register(mainControl.onDidChangeModelContent(() => this._onDidChangeSelection.fire({ reason: EditorPaneSelectionChangeReason.EDIT })));
      this._register(mainControl.onDidScrollChange(() => this._onDidChangeScroll.fire()));
    }
  }
  toEditorPaneSelectionChangeReason(e) {
    switch (e.source) {
      case TextEditorSelectionSource.PROGRAMMATIC:
        return EditorPaneSelectionChangeReason.PROGRAMMATIC;
      case TextEditorSelectionSource.NAVIGATION:
        return EditorPaneSelectionChangeReason.NAVIGATION;
      case TextEditorSelectionSource.JUMP:
        return EditorPaneSelectionChangeReason.JUMP;
      default:
        return EditorPaneSelectionChangeReason.USER;
    }
  }
  getSelection() {
    const mainControl = this.getMainControl();
    if (mainControl) {
      const selection = mainControl.getSelection();
      if (selection) {
        return new TextEditorPaneSelection(selection);
      }
    }
    return void 0;
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    this.inputListener.value = input.onDidChangeCapabilities(() => this.onDidChangeInputCapabilities(input));
    this.updateEditorConfiguration();
    const editorContainer = assertIsDefined(this.editorContainer);
    editorContainer.setAttribute("aria-label", this.computeAriaLabel());
  }
  clearInput() {
    this.inputListener.clear();
    super.clearInput();
  }
  getScrollPosition() {
    const editor = this.getMainControl();
    if (!editor) {
      throw new Error("Control has not yet been initialized");
    }
    return {
      // The top position can vary depending on the view zones (find widget for example)
      scrollTop: editor.getScrollTop() - editor.getTopForLineNumber(1),
      scrollLeft: editor.getScrollLeft()
    };
  }
  setScrollPosition(scrollPosition) {
    const editor = this.getMainControl();
    if (!editor) {
      throw new Error("Control has not yet been initialized");
    }
    editor.setScrollTop(scrollPosition.scrollTop);
    if (scrollPosition.scrollLeft) {
      editor.setScrollLeft(scrollPosition.scrollLeft);
    }
  }
  setEditorVisible(visible) {
    if (visible) {
      this.consumePendingConfigurationChangeEvent();
    }
    super.setEditorVisible(visible);
  }
  toEditorViewStateResource(input) {
    return input.resource;
  }
  updateEditorConfiguration(resource = this.getActiveResource()) {
    let configuration = void 0;
    if (resource) {
      configuration = this.textResourceConfigurationService.getValue(resource);
    }
    if (!configuration) {
      return;
    }
    const editorConfiguration = this.computeConfiguration(configuration);
    let editorSettingsToApply = editorConfiguration;
    if (this.lastAppliedEditorOptions) {
      editorSettingsToApply = distinct(this.lastAppliedEditorOptions, editorSettingsToApply);
    }
    if (Object.keys(editorSettingsToApply).length > 0) {
      this.lastAppliedEditorOptions = editorConfiguration;
      this.updateEditorControlOptions(editorSettingsToApply);
    }
  }
  getActiveResource() {
    const mainControl = this.getMainControl();
    if (mainControl) {
      const model = mainControl.getModel();
      if (model) {
        return model.uri;
      }
    }
    if (this.input) {
      return this.input.resource;
    }
    return void 0;
  }
  dispose() {
    this.lastAppliedEditorOptions = void 0;
    super.dispose();
  }
};
AbstractTextEditor = __decorateClass([
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, ITextResourceConfigurationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IEditorGroupsService),
  __decorateParam(9, IFileService)
], AbstractTextEditor);
class TextEditorPaneSelection {
  // number of lines to move in editor to justify for significant change
  constructor(textSelection) {
    this.textSelection = textSelection;
  }
  static {
    __name(this, "TextEditorPaneSelection");
  }
  static TEXT_EDITOR_SELECTION_THRESHOLD = 10;
  compare(other) {
    if (!(other instanceof TextEditorPaneSelection)) {
      return EditorPaneSelectionCompareResult.DIFFERENT;
    }
    const thisLineNumber = Math.min(this.textSelection.selectionStartLineNumber, this.textSelection.positionLineNumber);
    const otherLineNumber = Math.min(other.textSelection.selectionStartLineNumber, other.textSelection.positionLineNumber);
    if (thisLineNumber === otherLineNumber) {
      return EditorPaneSelectionCompareResult.IDENTICAL;
    }
    if (Math.abs(thisLineNumber - otherLineNumber) < TextEditorPaneSelection.TEXT_EDITOR_SELECTION_THRESHOLD) {
      return EditorPaneSelectionCompareResult.SIMILAR;
    }
    return EditorPaneSelectionCompareResult.DIFFERENT;
  }
  restore(options) {
    const textEditorOptions = {
      ...options,
      selection: this.textSelection,
      selectionRevealType: TextEditorSelectionRevealType.CenterIfOutsideViewport
    };
    return textEditorOptions;
  }
  log() {
    return `line: ${this.textSelection.startLineNumber}-${this.textSelection.endLineNumber}, col:  ${this.textSelection.startColumn}-${this.textSelection.endColumn}`;
  }
}
export {
  AbstractTextEditor,
  TextEditorPaneSelection
};
//# sourceMappingURL=textEditor.js.map
