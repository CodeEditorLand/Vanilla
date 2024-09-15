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
import * as dom from "../../../../../base/browser/dom.js";
import { IMouseEvent } from "../../../../../base/browser/mouseEvent.js";
import { Orientation } from "../../../../../base/browser/ui/sash/sash.js";
import { Sizing, SplitView } from "../../../../../base/browser/ui/splitview/splitview.js";
import { Color } from "../../../../../base/common/color.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { FuzzyScore } from "../../../../../base/common/filters.js";
import { KeyCode } from "../../../../../base/common/keyCodes.js";
import { DisposableStore, dispose, IDisposable, IReference } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { basenameOrAuthority, dirname } from "../../../../../base/common/resources.js";
import "./referencesWidget.css";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { EmbeddedCodeEditorWidget } from "../../../../browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { IEditorOptions } from "../../../../common/config/editorOptions.js";
import { IRange, Range } from "../../../../common/core/range.js";
import { ScrollType } from "../../../../common/editorCommon.js";
import { IModelDeltaDecoration, TrackedRangeStickiness } from "../../../../common/model.js";
import { ModelDecorationOptions, TextModel } from "../../../../common/model/textModel.js";
import { Location } from "../../../../common/languages.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../common/languages/modesRegistry.js";
import { ITextEditorModel, ITextModelService } from "../../../../common/services/resolverService.js";
import { AccessibilityProvider, DataSource, Delegate, FileReferencesRenderer, IdentityProvider, OneReferenceRenderer, StringRepresentationProvider, TreeElement } from "./referencesTree.js";
import * as peekView from "../../../peekView/browser/peekView.js";
import * as nls from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IWorkbenchAsyncDataTreeOptions, WorkbenchAsyncDataTree } from "../../../../../platform/list/browser/listService.js";
import { IColorTheme, IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { FileReferences, OneReference, ReferencesModel } from "../referencesModel.js";
class DecorationsManager {
  constructor(_editor, _model) {
    this._editor = _editor;
    this._model = _model;
    this._callOnDispose.add(this._editor.onDidChangeModel(() => this._onModelChanged()));
    this._onModelChanged();
  }
  static {
    __name(this, "DecorationsManager");
  }
  static DecorationOptions = ModelDecorationOptions.register({
    description: "reference-decoration",
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    className: "reference-decoration"
  });
  _decorations = /* @__PURE__ */ new Map();
  _decorationIgnoreSet = /* @__PURE__ */ new Set();
  _callOnDispose = new DisposableStore();
  _callOnModelChange = new DisposableStore();
  dispose() {
    this._callOnModelChange.dispose();
    this._callOnDispose.dispose();
    this.removeDecorations();
  }
  _onModelChanged() {
    this._callOnModelChange.clear();
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    for (const ref of this._model.references) {
      if (ref.uri.toString() === model.uri.toString()) {
        this._addDecorations(ref.parent);
        return;
      }
    }
  }
  _addDecorations(reference) {
    if (!this._editor.hasModel()) {
      return;
    }
    this._callOnModelChange.add(this._editor.getModel().onDidChangeDecorations(() => this._onDecorationChanged()));
    const newDecorations = [];
    const newDecorationsActualIndex = [];
    for (let i = 0, len = reference.children.length; i < len; i++) {
      const oneReference = reference.children[i];
      if (this._decorationIgnoreSet.has(oneReference.id)) {
        continue;
      }
      if (oneReference.uri.toString() !== this._editor.getModel().uri.toString()) {
        continue;
      }
      newDecorations.push({
        range: oneReference.range,
        options: DecorationsManager.DecorationOptions
      });
      newDecorationsActualIndex.push(i);
    }
    this._editor.changeDecorations((changeAccessor) => {
      const decorations = changeAccessor.deltaDecorations([], newDecorations);
      for (let i = 0; i < decorations.length; i++) {
        this._decorations.set(decorations[i], reference.children[newDecorationsActualIndex[i]]);
      }
    });
  }
  _onDecorationChanged() {
    const toRemove = [];
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    for (const [decorationId, reference] of this._decorations) {
      const newRange = model.getDecorationRange(decorationId);
      if (!newRange) {
        continue;
      }
      let ignore = false;
      if (Range.equalsRange(newRange, reference.range)) {
        continue;
      }
      if (Range.spansMultipleLines(newRange)) {
        ignore = true;
      } else {
        const lineLength = reference.range.endColumn - reference.range.startColumn;
        const newLineLength = newRange.endColumn - newRange.startColumn;
        if (lineLength !== newLineLength) {
          ignore = true;
        }
      }
      if (ignore) {
        this._decorationIgnoreSet.add(reference.id);
        toRemove.push(decorationId);
      } else {
        reference.range = newRange;
      }
    }
    for (let i = 0, len = toRemove.length; i < len; i++) {
      this._decorations.delete(toRemove[i]);
    }
    this._editor.removeDecorations(toRemove);
  }
  removeDecorations() {
    this._editor.removeDecorations([...this._decorations.keys()]);
    this._decorations.clear();
  }
}
class LayoutData {
  static {
    __name(this, "LayoutData");
  }
  ratio = 0.7;
  heightInLines = 18;
  static fromJSON(raw) {
    let ratio;
    let heightInLines;
    try {
      const data = JSON.parse(raw);
      ratio = data.ratio;
      heightInLines = data.heightInLines;
    } catch {
    }
    return {
      ratio: ratio || 0.7,
      heightInLines: heightInLines || 18
    };
  }
}
class ReferencesTree extends WorkbenchAsyncDataTree {
  static {
    __name(this, "ReferencesTree");
  }
}
let ReferenceWidget = class extends peekView.PeekViewWidget {
  // whether or not a dispose is already in progress
  constructor(editor, _defaultTreeKeyboardSupport, layoutData, themeService, _textModelResolverService, _instantiationService, _peekViewService, _uriLabel, _keybindingService) {
    super(editor, { showFrame: false, showArrow: true, isResizeable: true, isAccessible: true, supportOnTitleClick: true }, _instantiationService);
    this._defaultTreeKeyboardSupport = _defaultTreeKeyboardSupport;
    this.layoutData = layoutData;
    this._textModelResolverService = _textModelResolverService;
    this._instantiationService = _instantiationService;
    this._peekViewService = _peekViewService;
    this._uriLabel = _uriLabel;
    this._keybindingService = _keybindingService;
    this._applyTheme(themeService.getColorTheme());
    this._callOnDispose.add(themeService.onDidColorThemeChange(this._applyTheme.bind(this)));
    this._peekViewService.addExclusiveWidget(editor, this);
    this.create();
  }
  static {
    __name(this, "ReferenceWidget");
  }
  _model;
  _decorationsManager;
  _disposeOnNewModel = new DisposableStore();
  _callOnDispose = new DisposableStore();
  _onDidSelectReference = new Emitter();
  onDidSelectReference = this._onDidSelectReference.event;
  _tree;
  _treeContainer;
  _splitView;
  _preview;
  _previewModelReference;
  _previewNotAvailableMessage;
  _previewContainer;
  _messageContainer;
  _dim = new dom.Dimension(0, 0);
  _isClosing = false;
  get isClosing() {
    return this._isClosing;
  }
  dispose() {
    this._isClosing = true;
    this.setModel(void 0);
    this._callOnDispose.dispose();
    this._disposeOnNewModel.dispose();
    dispose(this._preview);
    dispose(this._previewNotAvailableMessage);
    dispose(this._tree);
    dispose(this._previewModelReference);
    this._splitView.dispose();
    super.dispose();
  }
  _applyTheme(theme) {
    const borderColor = theme.getColor(peekView.peekViewBorder) || Color.transparent;
    this.style({
      arrowColor: borderColor,
      frameColor: borderColor,
      headerBackgroundColor: theme.getColor(peekView.peekViewTitleBackground) || Color.transparent,
      primaryHeadingColor: theme.getColor(peekView.peekViewTitleForeground),
      secondaryHeadingColor: theme.getColor(peekView.peekViewTitleInfoForeground)
    });
  }
  show(where) {
    super.show(where, this.layoutData.heightInLines || 18);
  }
  focusOnReferenceTree() {
    this._tree.domFocus();
  }
  focusOnPreviewEditor() {
    this._preview.focus();
  }
  isPreviewEditorFocused() {
    return this._preview.hasTextFocus();
  }
  _onTitleClick(e) {
    if (this._preview && this._preview.getModel()) {
      this._onDidSelectReference.fire({
        element: this._getFocusedReference(),
        kind: e.ctrlKey || e.metaKey || e.altKey ? "side" : "open",
        source: "title"
      });
    }
  }
  _fillBody(containerElement) {
    this.setCssClass("reference-zone-widget");
    this._messageContainer = dom.append(containerElement, dom.$("div.messages"));
    dom.hide(this._messageContainer);
    this._splitView = new SplitView(containerElement, { orientation: Orientation.HORIZONTAL });
    this._previewContainer = dom.append(containerElement, dom.$("div.preview.inline"));
    const options = {
      scrollBeyondLastLine: false,
      scrollbar: {
        verticalScrollbarSize: 14,
        horizontal: "auto",
        useShadows: true,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        alwaysConsumeMouseWheel: true
      },
      overviewRulerLanes: 2,
      fixedOverflowWidgets: true,
      minimap: {
        enabled: false
      }
    };
    this._preview = this._instantiationService.createInstance(EmbeddedCodeEditorWidget, this._previewContainer, options, {}, this.editor);
    dom.hide(this._previewContainer);
    this._previewNotAvailableMessage = this._instantiationService.createInstance(TextModel, nls.localize("missingPreviewMessage", "no preview available"), PLAINTEXT_LANGUAGE_ID, TextModel.DEFAULT_CREATION_OPTIONS, null);
    this._treeContainer = dom.append(containerElement, dom.$("div.ref-tree.inline"));
    const treeOptions = {
      keyboardSupport: this._defaultTreeKeyboardSupport,
      accessibilityProvider: new AccessibilityProvider(),
      keyboardNavigationLabelProvider: this._instantiationService.createInstance(StringRepresentationProvider),
      identityProvider: new IdentityProvider(),
      openOnSingleClick: true,
      selectionNavigation: true,
      overrideStyles: {
        listBackground: peekView.peekViewResultsBackground
      }
    };
    if (this._defaultTreeKeyboardSupport) {
      this._callOnDispose.add(dom.addStandardDisposableListener(this._treeContainer, "keydown", (e) => {
        if (e.equals(KeyCode.Escape)) {
          this._keybindingService.dispatchEvent(e, e.target);
          e.stopPropagation();
        }
      }, true));
    }
    this._tree = this._instantiationService.createInstance(
      ReferencesTree,
      "ReferencesWidget",
      this._treeContainer,
      new Delegate(),
      [
        this._instantiationService.createInstance(FileReferencesRenderer),
        this._instantiationService.createInstance(OneReferenceRenderer)
      ],
      this._instantiationService.createInstance(DataSource),
      treeOptions
    );
    this._splitView.addView({
      onDidChange: Event.None,
      element: this._previewContainer,
      minimumSize: 200,
      maximumSize: Number.MAX_VALUE,
      layout: /* @__PURE__ */ __name((width) => {
        this._preview.layout({ height: this._dim.height, width });
      }, "layout")
    }, Sizing.Distribute);
    this._splitView.addView({
      onDidChange: Event.None,
      element: this._treeContainer,
      minimumSize: 100,
      maximumSize: Number.MAX_VALUE,
      layout: /* @__PURE__ */ __name((width) => {
        this._treeContainer.style.height = `${this._dim.height}px`;
        this._treeContainer.style.width = `${width}px`;
        this._tree.layout(this._dim.height, width);
      }, "layout")
    }, Sizing.Distribute);
    this._disposables.add(this._splitView.onDidSashChange(() => {
      if (this._dim.width) {
        this.layoutData.ratio = this._splitView.getViewSize(0) / this._dim.width;
      }
    }, void 0));
    const onEvent = /* @__PURE__ */ __name((element, kind) => {
      if (element instanceof OneReference) {
        if (kind === "show") {
          this._revealReference(element, false);
        }
        this._onDidSelectReference.fire({ element, kind, source: "tree" });
      }
    }, "onEvent");
    this._disposables.add(this._tree.onDidOpen((e) => {
      if (e.sideBySide) {
        onEvent(e.element, "side");
      } else if (e.editorOptions.pinned) {
        onEvent(e.element, "goto");
      } else {
        onEvent(e.element, "show");
      }
    }));
    dom.hide(this._treeContainer);
  }
  _onWidth(width) {
    if (this._dim) {
      this._doLayoutBody(this._dim.height, width);
    }
  }
  _doLayoutBody(heightInPixel, widthInPixel) {
    super._doLayoutBody(heightInPixel, widthInPixel);
    this._dim = new dom.Dimension(widthInPixel, heightInPixel);
    this.layoutData.heightInLines = this._viewZone ? this._viewZone.heightInLines : this.layoutData.heightInLines;
    this._splitView.layout(widthInPixel);
    this._splitView.resizeView(0, widthInPixel * this.layoutData.ratio);
  }
  setSelection(selection) {
    return this._revealReference(selection, true).then(() => {
      if (!this._model) {
        return;
      }
      this._tree.setSelection([selection]);
      this._tree.setFocus([selection]);
    });
  }
  setModel(newModel) {
    this._disposeOnNewModel.clear();
    this._model = newModel;
    if (this._model) {
      return this._onNewModel();
    }
    return Promise.resolve();
  }
  _onNewModel() {
    if (!this._model) {
      return Promise.resolve(void 0);
    }
    if (this._model.isEmpty) {
      this.setTitle("");
      this._messageContainer.innerText = nls.localize("noResults", "No results");
      dom.show(this._messageContainer);
      return Promise.resolve(void 0);
    }
    dom.hide(this._messageContainer);
    this._decorationsManager = new DecorationsManager(this._preview, this._model);
    this._disposeOnNewModel.add(this._decorationsManager);
    this._disposeOnNewModel.add(this._model.onDidChangeReferenceRange((reference) => this._tree.rerender(reference)));
    this._disposeOnNewModel.add(this._preview.onMouseDown((e) => {
      const { event, target } = e;
      if (event.detail !== 2) {
        return;
      }
      const element = this._getFocusedReference();
      if (!element) {
        return;
      }
      this._onDidSelectReference.fire({
        element: { uri: element.uri, range: target.range },
        kind: event.ctrlKey || event.metaKey || event.altKey ? "side" : "open",
        source: "editor"
      });
    }));
    this.container.classList.add("results-loaded");
    dom.show(this._treeContainer);
    dom.show(this._previewContainer);
    this._splitView.layout(this._dim.width);
    this.focusOnReferenceTree();
    return this._tree.setInput(this._model.groups.length === 1 ? this._model.groups[0] : this._model);
  }
  _getFocusedReference() {
    const [element] = this._tree.getFocus();
    if (element instanceof OneReference) {
      return element;
    } else if (element instanceof FileReferences) {
      if (element.children.length > 0) {
        return element.children[0];
      }
    }
    return void 0;
  }
  async revealReference(reference) {
    await this._revealReference(reference, false);
    this._onDidSelectReference.fire({ element: reference, kind: "goto", source: "tree" });
  }
  _revealedReference;
  async _revealReference(reference, revealParent) {
    if (this._revealedReference === reference) {
      return;
    }
    this._revealedReference = reference;
    if (reference.uri.scheme !== Schemas.inMemory) {
      this.setTitle(basenameOrAuthority(reference.uri), this._uriLabel.getUriLabel(dirname(reference.uri)));
    } else {
      this.setTitle(nls.localize("peekView.alternateTitle", "References"));
    }
    const promise = this._textModelResolverService.createModelReference(reference.uri);
    if (this._tree.getInput() === reference.parent) {
      this._tree.reveal(reference);
    } else {
      if (revealParent) {
        this._tree.reveal(reference.parent);
      }
      await this._tree.expand(reference.parent);
      this._tree.reveal(reference);
    }
    const ref = await promise;
    if (!this._model) {
      ref.dispose();
      return;
    }
    dispose(this._previewModelReference);
    const model = ref.object;
    if (model) {
      const scrollType = this._preview.getModel() === model.textEditorModel ? ScrollType.Smooth : ScrollType.Immediate;
      const sel = Range.lift(reference.range).collapseToStart();
      this._previewModelReference = ref;
      this._preview.setModel(model.textEditorModel);
      this._preview.setSelection(sel);
      this._preview.revealRangeInCenter(sel, scrollType);
    } else {
      this._preview.setModel(this._previewNotAvailableMessage);
      ref.dispose();
    }
  }
};
ReferenceWidget = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, ITextModelService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, peekView.IPeekViewService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, IKeybindingService)
], ReferenceWidget);
export {
  LayoutData,
  ReferenceWidget
};
//# sourceMappingURL=referencesWidget.js.map
