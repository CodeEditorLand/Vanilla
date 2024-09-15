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
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IReader, autorunHandleChanges, derived, derivedOpts, observableFromEvent } from "../../../../../base/common/observable.js";
import { IEditorConstructionOptions } from "../../../config/editorConfiguration.js";
import { IDiffEditorConstructionOptions } from "../../../editorBrowser.js";
import { observableCodeEditor } from "../../../observableCodeEditor.js";
import { CodeEditorWidget, ICodeEditorWidgetOptions } from "../../codeEditor/codeEditorWidget.js";
import { IDiffCodeEditorWidgetOptions } from "../diffEditorWidget.js";
import { OverviewRulerFeature } from "../features/overviewRulerFeature.js";
import { EditorOptions, IEditorOptions } from "../../../../common/config/editorOptions.js";
import { Position } from "../../../../common/core/position.js";
import { IContentSizeChangedEvent } from "../../../../common/editorCommon.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { DiffEditorOptions } from "../diffEditorOptions.js";
let DiffEditorEditors = class extends Disposable {
  constructor(originalEditorElement, modifiedEditorElement, _options, _argCodeEditorWidgetOptions, _createInnerEditor, _instantiationService, _keybindingService) {
    super();
    this.originalEditorElement = originalEditorElement;
    this.modifiedEditorElement = modifiedEditorElement;
    this._options = _options;
    this._argCodeEditorWidgetOptions = _argCodeEditorWidgetOptions;
    this._createInnerEditor = _createInnerEditor;
    this._instantiationService = _instantiationService;
    this._keybindingService = _keybindingService;
    this._argCodeEditorWidgetOptions = null;
    this._register(autorunHandleChanges({
      createEmptyChangeSummary: /* @__PURE__ */ __name(() => ({}), "createEmptyChangeSummary"),
      handleChange: /* @__PURE__ */ __name((ctx, changeSummary) => {
        if (ctx.didChange(_options.editorOptions)) {
          Object.assign(changeSummary, ctx.change.changedOptions);
        }
        return true;
      }, "handleChange")
    }, (reader, changeSummary) => {
      _options.editorOptions.read(reader);
      this._options.renderSideBySide.read(reader);
      this.modified.updateOptions(this._adjustOptionsForRightHandSide(reader, changeSummary));
      this.original.updateOptions(this._adjustOptionsForLeftHandSide(reader, changeSummary));
    }));
  }
  static {
    __name(this, "DiffEditorEditors");
  }
  original = this._register(this._createLeftHandSideEditor(this._options.editorOptions.get(), this._argCodeEditorWidgetOptions.originalEditor || {}));
  modified = this._register(this._createRightHandSideEditor(this._options.editorOptions.get(), this._argCodeEditorWidgetOptions.modifiedEditor || {}));
  _onDidContentSizeChange = this._register(new Emitter());
  get onDidContentSizeChange() {
    return this._onDidContentSizeChange.event;
  }
  modifiedScrollTop = observableFromEvent(this, this.modified.onDidScrollChange, () => (
    /** @description modified.getScrollTop */
    this.modified.getScrollTop()
  ));
  modifiedScrollHeight = observableFromEvent(this, this.modified.onDidScrollChange, () => (
    /** @description modified.getScrollHeight */
    this.modified.getScrollHeight()
  ));
  modifiedObs = observableCodeEditor(this.modified);
  originalObs = observableCodeEditor(this.original);
  modifiedModel = this.modifiedObs.model;
  modifiedSelections = observableFromEvent(this, this.modified.onDidChangeCursorSelection, () => this.modified.getSelections() ?? []);
  modifiedCursor = derivedOpts({ owner: this, equalsFn: Position.equals }, (reader) => this.modifiedSelections.read(reader)[0]?.getPosition() ?? new Position(1, 1));
  originalCursor = observableFromEvent(this, this.original.onDidChangeCursorPosition, () => this.original.getPosition() ?? new Position(1, 1));
  isOriginalFocused = observableCodeEditor(this.original).isFocused;
  isModifiedFocused = observableCodeEditor(this.modified).isFocused;
  isFocused = derived(this, (reader) => this.isOriginalFocused.read(reader) || this.isModifiedFocused.read(reader));
  _createLeftHandSideEditor(options, codeEditorWidgetOptions) {
    const leftHandSideOptions = this._adjustOptionsForLeftHandSide(void 0, options);
    const editor = this._constructInnerEditor(this._instantiationService, this.originalEditorElement, leftHandSideOptions, codeEditorWidgetOptions);
    editor.setContextValue("isInDiffLeftEditor", true);
    return editor;
  }
  _createRightHandSideEditor(options, codeEditorWidgetOptions) {
    const rightHandSideOptions = this._adjustOptionsForRightHandSide(void 0, options);
    const editor = this._constructInnerEditor(this._instantiationService, this.modifiedEditorElement, rightHandSideOptions, codeEditorWidgetOptions);
    editor.setContextValue("isInDiffRightEditor", true);
    return editor;
  }
  _constructInnerEditor(instantiationService, container, options, editorWidgetOptions) {
    const editor = this._createInnerEditor(instantiationService, container, options, editorWidgetOptions);
    this._register(editor.onDidContentSizeChange((e) => {
      const width = this.original.getContentWidth() + this.modified.getContentWidth() + OverviewRulerFeature.ENTIRE_DIFF_OVERVIEW_WIDTH;
      const height = Math.max(this.modified.getContentHeight(), this.original.getContentHeight());
      this._onDidContentSizeChange.fire({
        contentHeight: height,
        contentWidth: width,
        contentHeightChanged: e.contentHeightChanged,
        contentWidthChanged: e.contentWidthChanged
      });
    }));
    return editor;
  }
  _adjustOptionsForLeftHandSide(_reader, changedOptions) {
    const result = this._adjustOptionsForSubEditor(changedOptions);
    if (!this._options.renderSideBySide.get()) {
      result.wordWrapOverride1 = "off";
      result.wordWrapOverride2 = "off";
      result.stickyScroll = { enabled: false };
      result.unicodeHighlight = { nonBasicASCII: false, ambiguousCharacters: false, invisibleCharacters: false };
    } else {
      result.unicodeHighlight = this._options.editorOptions.get().unicodeHighlight || {};
      result.wordWrapOverride1 = this._options.diffWordWrap.get();
    }
    result.glyphMargin = this._options.renderSideBySide.get();
    if (changedOptions.originalAriaLabel) {
      result.ariaLabel = changedOptions.originalAriaLabel;
    }
    result.ariaLabel = this._updateAriaLabel(result.ariaLabel);
    result.readOnly = !this._options.originalEditable.get();
    result.dropIntoEditor = { enabled: !result.readOnly };
    result.extraEditorClassName = "original-in-monaco-diff-editor";
    return result;
  }
  _adjustOptionsForRightHandSide(reader, changedOptions) {
    const result = this._adjustOptionsForSubEditor(changedOptions);
    if (changedOptions.modifiedAriaLabel) {
      result.ariaLabel = changedOptions.modifiedAriaLabel;
    }
    result.ariaLabel = this._updateAriaLabel(result.ariaLabel);
    result.wordWrapOverride1 = this._options.diffWordWrap.get();
    result.revealHorizontalRightPadding = EditorOptions.revealHorizontalRightPadding.defaultValue + OverviewRulerFeature.ENTIRE_DIFF_OVERVIEW_WIDTH;
    result.scrollbar.verticalHasArrows = false;
    result.extraEditorClassName = "modified-in-monaco-diff-editor";
    return result;
  }
  _adjustOptionsForSubEditor(options) {
    const clonedOptions = {
      ...options,
      dimension: {
        height: 0,
        width: 0
      }
    };
    clonedOptions.inDiffEditor = true;
    clonedOptions.automaticLayout = false;
    clonedOptions.scrollbar = { ...clonedOptions.scrollbar || {} };
    clonedOptions.folding = false;
    clonedOptions.codeLens = this._options.diffCodeLens.get();
    clonedOptions.fixedOverflowWidgets = true;
    clonedOptions.minimap = { ...clonedOptions.minimap || {} };
    clonedOptions.minimap.enabled = false;
    if (this._options.hideUnchangedRegions.get()) {
      clonedOptions.stickyScroll = { enabled: false };
    } else {
      clonedOptions.stickyScroll = this._options.editorOptions.get().stickyScroll;
    }
    return clonedOptions;
  }
  _updateAriaLabel(ariaLabel) {
    if (!ariaLabel) {
      ariaLabel = "";
    }
    const ariaNavigationTip = localize("diff-aria-navigation-tip", " use {0} to open the accessibility help.", this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp")?.getAriaLabel());
    if (this._options.accessibilityVerbose.get()) {
      return ariaLabel + ariaNavigationTip;
    } else if (ariaLabel) {
      return ariaLabel.replaceAll(ariaNavigationTip, "");
    }
    return "";
  }
};
DiffEditorEditors = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IKeybindingService)
], DiffEditorEditors);
export {
  DiffEditorEditors
};
//# sourceMappingURL=diffEditorEditors.js.map
