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
import { getWindow, h } from "../../../../base/browser/dom.js";
import { findLast } from "../../../../base/common/arraysFind.js";
import {
  BugIndicatingError,
  onUnexpectedError
} from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import { readHotReloadableExport } from "../../../../base/common/hotReloadHelpers.js";
import { toDisposable } from "../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunWithStore,
  derived,
  derivedDisposable,
  disposableObservableValue,
  observableFromEvent,
  observableValue,
  recomputeInitiallyAndOnChange,
  subtransaction,
  transaction
} from "../../../../base/common/observable.js";
import {
  AccessibilitySignal,
  IAccessibilitySignalService
} from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { bindContextKey } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import {
  CursorChangeReason
} from "../../../common/cursorEvents.js";
import {
  EditorType
} from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import {
  EditorExtensionsRegistry
} from "../../editorExtensions.js";
import { ICodeEditorService } from "../../services/codeEditorService.js";
import { StableEditorScrollState } from "../../stableEditorScroll.js";
import {
  CodeEditorWidget
} from "../codeEditor/codeEditorWidget.js";
import {
  AccessibleDiffViewer,
  AccessibleDiffViewerModelFromEditors
} from "./components/accessibleDiffViewer.js";
import { DiffEditorDecorations } from "./components/diffEditorDecorations.js";
import { DiffEditorEditors } from "./components/diffEditorEditors.js";
import { DiffEditorSash, SashLayout } from "./components/diffEditorSash.js";
import { DiffEditorViewZones } from "./components/diffEditorViewZones/diffEditorViewZones.js";
import { DelegatingEditor } from "./delegatingEditorImpl.js";
import { DiffEditorOptions } from "./diffEditorOptions.js";
import {
  DiffEditorViewModel
} from "./diffEditorViewModel.js";
import { DiffEditorGutter } from "./features/gutterFeature.js";
import { HideUnchangedRegionsFeature } from "./features/hideUnchangedRegionsFeature.js";
import { MovedBlocksLinesFeature } from "./features/movedBlocksLinesFeature.js";
import { OverviewRulerFeature } from "./features/overviewRulerFeature.js";
import { RevertButtonsFeature } from "./features/revertButtonsFeature.js";
import "./style.css";
import {
  ObservableElementSizeObserver,
  RefCounted,
  applyStyle,
  applyViewZones,
  translatePosition
} from "./utils.js";
let DiffEditorWidget = class extends DelegatingEditor {
  constructor(_domElement, options, codeEditorWidgetOptions, _parentContextKeyService, _parentInstantiationService, codeEditorService, _accessibilitySignalService, _editorProgressService) {
    super();
    this._domElement = _domElement;
    this._parentContextKeyService = _parentContextKeyService;
    this._parentInstantiationService = _parentInstantiationService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._editorProgressService = _editorProgressService;
    codeEditorService.willCreateDiffEditor();
    this._contextKeyService.createKey("isInDiffEditor", true);
    this._domElement.appendChild(this.elements.root);
    this._register(toDisposable(() => this.elements.root.remove()));
    this._rootSizeObserver = this._register(new ObservableElementSizeObserver(this.elements.root, options.dimension));
    this._rootSizeObserver.setAutomaticLayout(options.automaticLayout ?? false);
    this._options = this._instantiationService.createInstance(DiffEditorOptions, options);
    this._register(autorun((reader) => {
      this._options.setWidth(this._rootSizeObserver.width.read(reader));
    }));
    this._contextKeyService.createKey(EditorContextKeys.isEmbeddedDiffEditor.key, false);
    this._register(bindContextKey(
      EditorContextKeys.isEmbeddedDiffEditor,
      this._contextKeyService,
      (reader) => this._options.isInEmbeddedEditor.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.comparingMovedCode,
      this._contextKeyService,
      (reader) => !!this._diffModel.read(reader)?.movedTextToCompare.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorRenderSideBySideInlineBreakpointReached,
      this._contextKeyService,
      (reader) => this._options.couldShowInlineViewBecauseOfSize.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorInlineMode,
      this._contextKeyService,
      (reader) => !this._options.renderSideBySide.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.hasChanges,
      this._contextKeyService,
      (reader) => (this._diffModel.read(reader)?.diff.read(reader)?.mappings.length ?? 0) > 0
    ));
    this._editors = this._register(this._instantiationService.createInstance(
      DiffEditorEditors,
      this.elements.original,
      this.elements.modified,
      this._options,
      codeEditorWidgetOptions,
      (i, c, o, o2) => this._createInnerEditor(i, c, o, o2)
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorOriginalWritable,
      this._contextKeyService,
      (reader) => this._options.originalEditable.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorModifiedWritable,
      this._contextKeyService,
      (reader) => !this._options.readOnly.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorOriginalUri,
      this._contextKeyService,
      (reader) => this._diffModel.read(reader)?.model.original.uri.toString() ?? ""
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorModifiedUri,
      this._contextKeyService,
      (reader) => this._diffModel.read(reader)?.model.modified.uri.toString() ?? ""
    ));
    this._overviewRulerPart = derivedDisposable(
      this,
      (reader) => this._options.renderOverviewRuler.read(reader) ? this._instantiationService.createInstance(
        readHotReloadableExport(OverviewRulerFeature, reader),
        this._editors,
        this.elements.root,
        this._diffModel,
        this._rootSizeObserver.width,
        this._rootSizeObserver.height,
        this._layoutInfo.map((i) => i.modifiedEditor)
      ) : void 0
    ).recomputeInitiallyAndOnChange(this._store);
    const dimensions = {
      height: this._rootSizeObserver.height,
      width: this._rootSizeObserver.width.map((w, reader) => w - (this._overviewRulerPart.read(reader)?.width ?? 0))
    };
    this._sashLayout = new SashLayout(this._options, dimensions);
    this._sash = derivedDisposable(this, (reader) => {
      const showSash = this._options.renderSideBySide.read(reader);
      this.elements.root.classList.toggle("side-by-side", showSash);
      return showSash ? new DiffEditorSash(
        this.elements.root,
        dimensions,
        this._options.enableSplitViewResizing,
        this._boundarySashes,
        this._sashLayout.sashLeft,
        () => this._sashLayout.resetSash()
      ) : void 0;
    }).recomputeInitiallyAndOnChange(this._store);
    const unchangedRangesFeature = derivedDisposable(
      this,
      (reader) => (
        /** @description UnchangedRangesFeature */
        this._instantiationService.createInstance(
          readHotReloadableExport(HideUnchangedRegionsFeature, reader),
          this._editors,
          this._diffModel,
          this._options
        )
      )
    ).recomputeInitiallyAndOnChange(this._store);
    derivedDisposable(
      this,
      (reader) => (
        /** @description DiffEditorDecorations */
        this._instantiationService.createInstance(
          readHotReloadableExport(DiffEditorDecorations, reader),
          this._editors,
          this._diffModel,
          this._options,
          this
        )
      )
    ).recomputeInitiallyAndOnChange(this._store);
    const origViewZoneIdsToIgnore = /* @__PURE__ */ new Set();
    const modViewZoneIdsToIgnore = /* @__PURE__ */ new Set();
    let isUpdatingViewZones = false;
    const viewZoneManager = derivedDisposable(
      this,
      (reader) => (
        /** @description ViewZoneManager */
        this._instantiationService.createInstance(
          readHotReloadableExport(DiffEditorViewZones, reader),
          getWindow(this._domElement),
          this._editors,
          this._diffModel,
          this._options,
          this,
          () => isUpdatingViewZones || unchangedRangesFeature.get().isUpdatingHiddenAreas,
          origViewZoneIdsToIgnore,
          modViewZoneIdsToIgnore
        )
      )
    ).recomputeInitiallyAndOnChange(this._store);
    const originalViewZones = derived(this, (reader) => {
      const orig = viewZoneManager.read(reader).viewZones.read(reader).orig;
      const orig2 = unchangedRangesFeature.read(reader).viewZones.read(reader).origViewZones;
      return orig.concat(orig2);
    });
    const modifiedViewZones = derived(this, (reader) => {
      const mod = viewZoneManager.read(reader).viewZones.read(reader).mod;
      const mod2 = unchangedRangesFeature.read(reader).viewZones.read(reader).modViewZones;
      return mod.concat(mod2);
    });
    this._register(applyViewZones(this._editors.original, originalViewZones, (isUpdatingOrigViewZones) => {
      isUpdatingViewZones = isUpdatingOrigViewZones;
    }, origViewZoneIdsToIgnore));
    let scrollState;
    this._register(applyViewZones(this._editors.modified, modifiedViewZones, (isUpdatingModViewZones) => {
      isUpdatingViewZones = isUpdatingModViewZones;
      if (isUpdatingViewZones) {
        scrollState = StableEditorScrollState.capture(this._editors.modified);
      } else {
        scrollState?.restore(this._editors.modified);
        scrollState = void 0;
      }
    }, modViewZoneIdsToIgnore));
    this._accessibleDiffViewer = derivedDisposable(
      this,
      (reader) => this._instantiationService.createInstance(
        readHotReloadableExport(AccessibleDiffViewer, reader),
        this.elements.accessibleDiffViewer,
        this._accessibleDiffViewerVisible,
        (visible, tx) => this._accessibleDiffViewerShouldBeVisible.set(visible, tx),
        this._options.onlyShowAccessibleDiffViewer.map((v) => !v),
        this._rootSizeObserver.width,
        this._rootSizeObserver.height,
        this._diffModel.map((m, r) => m?.diff.read(r)?.mappings.map((m2) => m2.lineRangeMapping)),
        new AccessibleDiffViewerModelFromEditors(this._editors)
      )
    ).recomputeInitiallyAndOnChange(this._store);
    const visibility = this._accessibleDiffViewerVisible.map((v) => v ? "hidden" : "visible");
    this._register(applyStyle(this.elements.modified, { visibility }));
    this._register(applyStyle(this.elements.original, { visibility }));
    this._createDiffEditorContributions();
    codeEditorService.addDiffEditor(this);
    this._gutter = derivedDisposable(this, (reader) => {
      return this._options.shouldRenderGutterMenu.read(reader) ? this._instantiationService.createInstance(
        readHotReloadableExport(DiffEditorGutter, reader),
        this.elements.root,
        this._diffModel,
        this._editors,
        this._options,
        this._sashLayout,
        this._boundarySashes
      ) : void 0;
    });
    this._register(recomputeInitiallyAndOnChange(this._layoutInfo));
    derivedDisposable(
      this,
      (reader) => (
        /** @description MovedBlocksLinesPart */
        new (readHotReloadableExport(MovedBlocksLinesFeature, reader))(
          this.elements.root,
          this._diffModel,
          this._layoutInfo.map((i) => i.originalEditor),
          this._layoutInfo.map((i) => i.modifiedEditor),
          this._editors
        )
      )
    ).recomputeInitiallyAndOnChange(this._store, (value) => {
      this._movedBlocksLinesPart.set(value, void 0);
    });
    this._register(Event.runAndSubscribe(this._editors.modified.onDidChangeCursorPosition, (e) => this._handleCursorPositionChange(e, true)));
    this._register(Event.runAndSubscribe(this._editors.original.onDidChangeCursorPosition, (e) => this._handleCursorPositionChange(e, false)));
    const isInitializingDiff = this._diffModel.map(this, (m, reader) => {
      if (!m) {
        return void 0;
      }
      return m.diff.read(reader) === void 0 && !m.isDiffUpToDate.read(reader);
    });
    this._register(autorunWithStore((reader, store) => {
      if (isInitializingDiff.read(reader) === true) {
        const r = this._editorProgressService.show(true, 1e3);
        store.add(toDisposable(() => r.done()));
      }
    }));
    this._register(autorunWithStore((reader, store) => {
      store.add(new (readHotReloadableExport(RevertButtonsFeature, reader))(this._editors, this._diffModel, this._options, this));
    }));
    this._register(autorunWithStore((reader, store) => {
      const model = this._diffModel.read(reader);
      if (!model) {
        return;
      }
      for (const m of [model.model.original, model.model.modified]) {
        store.add(m.onWillDispose((e) => {
          onUnexpectedError(new BugIndicatingError("TextModel got disposed before DiffEditorWidget model got reset"));
          this.setModel(null);
        }));
      }
    }));
    this._register(autorun((reader) => {
      this._options.setModel(this._diffModel.read(reader));
    }));
  }
  static {
    __name(this, "DiffEditorWidget");
  }
  static ENTIRE_DIFF_OVERVIEW_WIDTH = OverviewRulerFeature.ENTIRE_DIFF_OVERVIEW_WIDTH;
  elements = h(
    "div.monaco-diff-editor.side-by-side",
    { style: { position: "relative", height: "100%" } },
    [
      h("div.editor.original@original", {
        style: { position: "absolute", height: "100%" }
      }),
      h("div.editor.modified@modified", {
        style: { position: "absolute", height: "100%" }
      }),
      h("div.accessibleDiffViewer@accessibleDiffViewer", {
        style: { position: "absolute", height: "100%" }
      })
    ]
  );
  _diffModelSrc = this._register(
    disposableObservableValue(
      this,
      void 0
    )
  );
  _diffModel = derived(
    this,
    (reader) => this._diffModelSrc.read(reader)?.object
  );
  onDidChangeModel = Event.fromObservableLight(
    this._diffModel
  );
  get onDidContentSizeChange() {
    return this._editors.onDidContentSizeChange;
  }
  _contextKeyService = this._register(
    this._parentContextKeyService.createScoped(this._domElement)
  );
  _instantiationService = this._register(
    this._parentInstantiationService.createChild(
      new ServiceCollection([
        IContextKeyService,
        this._contextKeyService
      ])
    )
  );
  _rootSizeObserver;
  _sashLayout;
  _sash;
  _boundarySashes = observableValue(this, void 0);
  _accessibleDiffViewerShouldBeVisible = observableValue(this, false);
  _accessibleDiffViewerVisible = derived(
    this,
    (reader) => this._options.onlyShowAccessibleDiffViewer.read(reader) ? true : this._accessibleDiffViewerShouldBeVisible.read(reader)
  );
  _accessibleDiffViewer;
  _options;
  _editors;
  _overviewRulerPart;
  _movedBlocksLinesPart = observableValue(this, void 0);
  _gutter;
  get collapseUnchangedRegions() {
    return this._options.hideUnchangedRegions.get();
  }
  getViewWidth() {
    return this._rootSizeObserver.width.get();
  }
  getContentHeight() {
    return this._editors.modified.getContentHeight();
  }
  _createInnerEditor(instantiationService, container, options, editorWidgetOptions) {
    const editor = instantiationService.createInstance(
      CodeEditorWidget,
      container,
      options,
      editorWidgetOptions
    );
    return editor;
  }
  _layoutInfo = derived(this, (reader) => {
    const fullWidth = this._rootSizeObserver.width.read(reader);
    const fullHeight = this._rootSizeObserver.height.read(reader);
    if (this._rootSizeObserver.automaticLayout) {
      this.elements.root.style.height = "100%";
    } else {
      this.elements.root.style.height = fullHeight + "px";
    }
    const sash = this._sash.read(reader);
    const gutter = this._gutter.read(reader);
    const gutterWidth = gutter?.width.read(reader) ?? 0;
    const overviewRulerPartWidth = this._overviewRulerPart.read(reader)?.width ?? 0;
    let originalLeft, originalWidth, modifiedLeft, modifiedWidth, gutterLeft;
    const sideBySide = !!sash;
    if (sideBySide) {
      const sashLeft = sash.sashLeft.read(reader);
      const movedBlocksLinesWidth = this._movedBlocksLinesPart.read(reader)?.width.read(reader) ?? 0;
      originalLeft = 0;
      originalWidth = sashLeft - gutterWidth - movedBlocksLinesWidth;
      gutterLeft = sashLeft - gutterWidth;
      modifiedLeft = sashLeft;
      modifiedWidth = fullWidth - modifiedLeft - overviewRulerPartWidth;
    } else {
      gutterLeft = 0;
      const shouldHideOriginalLineNumbers = this._options.inlineViewHideOriginalLineNumbers.read(reader);
      originalLeft = gutterWidth;
      if (shouldHideOriginalLineNumbers) {
        originalWidth = 0;
      } else {
        originalWidth = Math.max(
          5,
          this._editors.originalObs.layoutInfoDecorationsLeft.read(
            reader
          )
        );
      }
      modifiedLeft = gutterWidth + originalWidth;
      modifiedWidth = fullWidth - modifiedLeft - overviewRulerPartWidth;
    }
    this.elements.original.style.left = originalLeft + "px";
    this.elements.original.style.width = originalWidth + "px";
    this._editors.original.layout(
      { width: originalWidth, height: fullHeight },
      true
    );
    gutter?.layout(gutterLeft);
    this.elements.modified.style.left = modifiedLeft + "px";
    this.elements.modified.style.width = modifiedWidth + "px";
    this._editors.modified.layout(
      { width: modifiedWidth, height: fullHeight },
      true
    );
    return {
      modifiedEditor: this._editors.modified.getLayoutInfo(),
      originalEditor: this._editors.original.getLayoutInfo()
    };
  });
  _createDiffEditorContributions() {
    const contributions = EditorExtensionsRegistry.getDiffEditorContributions();
    for (const desc of contributions) {
      try {
        this._register(
          this._instantiationService.createInstance(desc.ctor, this)
        );
      } catch (err) {
        onUnexpectedError(err);
      }
    }
  }
  get _targetEditor() {
    return this._editors.modified;
  }
  getEditorType() {
    return EditorType.IDiffEditor;
  }
  onVisible() {
    this._editors.original.onVisible();
    this._editors.modified.onVisible();
  }
  onHide() {
    this._editors.original.onHide();
    this._editors.modified.onHide();
  }
  layout(dimension) {
    this._rootSizeObserver.observe(dimension);
  }
  hasTextFocus() {
    return this._editors.original.hasTextFocus() || this._editors.modified.hasTextFocus();
  }
  saveViewState() {
    const originalViewState = this._editors.original.saveViewState();
    const modifiedViewState = this._editors.modified.saveViewState();
    return {
      original: originalViewState,
      modified: modifiedViewState,
      modelState: this._diffModel.get()?.serializeState()
    };
  }
  restoreViewState(s) {
    if (s && s.original && s.modified) {
      const diffEditorState = s;
      this._editors.original.restoreViewState(diffEditorState.original);
      this._editors.modified.restoreViewState(diffEditorState.modified);
      if (diffEditorState.modelState) {
        this._diffModel.get()?.restoreSerializedState(diffEditorState.modelState);
      }
    }
  }
  handleInitialized() {
    this._editors.original.handleInitialized();
    this._editors.modified.handleInitialized();
  }
  createViewModel(model) {
    return this._instantiationService.createInstance(
      DiffEditorViewModel,
      model,
      this._options
    );
  }
  getModel() {
    return this._diffModel.get()?.model ?? null;
  }
  setModel(model) {
    const vm = model ? "model" in model ? RefCounted.create(model).createNewRef(this) : RefCounted.create(this.createViewModel(model), this) : null;
    this.setDiffModel(vm);
  }
  setDiffModel(viewModel, tx) {
    const currentModel = this._diffModel.get();
    if (!viewModel && currentModel) {
      this._accessibleDiffViewer.get().close();
    }
    if (this._diffModel.get() !== viewModel?.object) {
      subtransaction(tx, (tx2) => {
        const vm = viewModel?.object;
        observableFromEvent.batchEventsGlobally(tx2, () => {
          this._editors.original.setModel(
            vm ? vm.model.original : null
          );
          this._editors.modified.setModel(
            vm ? vm.model.modified : null
          );
        });
        const prevValueRef = this._diffModelSrc.get()?.createNewRef(this);
        this._diffModelSrc.set(
          viewModel?.createNewRef(this),
          tx2
        );
        setTimeout(() => {
          prevValueRef?.dispose();
        }, 0);
      });
    }
  }
  /**
   * @param changedOptions Only has values for top-level options that have actually changed.
   */
  updateOptions(changedOptions) {
    this._options.updateOptions(changedOptions);
  }
  getContainerDomNode() {
    return this._domElement;
  }
  getOriginalEditor() {
    return this._editors.original;
  }
  getModifiedEditor() {
    return this._editors.modified;
  }
  setBoundarySashes(sashes) {
    this._boundarySashes.set(sashes, void 0);
  }
  _diffValue = this._diffModel.map(
    (m, r) => m?.diff.read(r)
  );
  onDidUpdateDiff = Event.fromObservableLight(
    this._diffValue
  );
  get ignoreTrimWhitespace() {
    return this._options.ignoreTrimWhitespace.get();
  }
  get maxComputationTime() {
    return this._options.maxComputationTimeMs.get();
  }
  get renderSideBySide() {
    return this._options.renderSideBySide.get();
  }
  /**
   * @deprecated Use `this.getDiffComputationResult().changes2` instead.
   */
  getLineChanges() {
    const diffState = this._diffModel.get()?.diff.get();
    if (!diffState) {
      return null;
    }
    return toLineChanges(diffState);
  }
  getDiffComputationResult() {
    const diffState = this._diffModel.get()?.diff.get();
    if (!diffState) {
      return null;
    }
    return {
      changes: this.getLineChanges(),
      changes2: diffState.mappings.map((m) => m.lineRangeMapping),
      identical: diffState.identical,
      quitEarly: diffState.quitEarly
    };
  }
  revert(diff) {
    const model = this._diffModel.get();
    if (!model || !model.isDiffUpToDate.get()) {
      return;
    }
    this._editors.modified.executeEdits("diffEditor", [
      {
        range: diff.modified.toExclusiveRange(),
        text: model.model.original.getValueInRange(
          diff.original.toExclusiveRange()
        )
      }
    ]);
  }
  revertRangeMappings(diffs) {
    const model = this._diffModel.get();
    if (!model || !model.isDiffUpToDate.get()) {
      return;
    }
    const changes = diffs.map((c) => ({
      range: c.modifiedRange,
      text: model.model.original.getValueInRange(c.originalRange)
    }));
    this._editors.modified.executeEdits("diffEditor", changes);
  }
  _goTo(diff) {
    this._editors.modified.setPosition(
      new Position(diff.lineRangeMapping.modified.startLineNumber, 1)
    );
    this._editors.modified.revealRangeInCenter(
      diff.lineRangeMapping.modified.toExclusiveRange()
    );
  }
  goToDiff(target) {
    const diffs = this._diffModel.get()?.diff.get()?.mappings;
    if (!diffs || diffs.length === 0) {
      return;
    }
    const curLineNumber = this._editors.modified.getPosition().lineNumber;
    let diff;
    if (target === "next") {
      diff = diffs.find(
        (d) => d.lineRangeMapping.modified.startLineNumber > curLineNumber
      ) ?? diffs[0];
    } else {
      diff = findLast(
        diffs,
        (d) => d.lineRangeMapping.modified.startLineNumber < curLineNumber
      ) ?? diffs[diffs.length - 1];
    }
    this._goTo(diff);
    if (diff.lineRangeMapping.modified.isEmpty) {
      this._accessibilitySignalService.playSignal(
        AccessibilitySignal.diffLineDeleted,
        { source: "diffEditor.goToDiff" }
      );
    } else if (diff.lineRangeMapping.original.isEmpty) {
      this._accessibilitySignalService.playSignal(
        AccessibilitySignal.diffLineInserted,
        { source: "diffEditor.goToDiff" }
      );
    } else if (diff) {
      this._accessibilitySignalService.playSignal(
        AccessibilitySignal.diffLineModified,
        { source: "diffEditor.goToDiff" }
      );
    }
  }
  revealFirstDiff() {
    const diffModel = this._diffModel.get();
    if (!diffModel) {
      return;
    }
    this.waitForDiff().then(() => {
      const diffs = diffModel.diff.get()?.mappings;
      if (!diffs || diffs.length === 0) {
        return;
      }
      this._goTo(diffs[0]);
    });
  }
  accessibleDiffViewerNext() {
    this._accessibleDiffViewer.get().next();
  }
  accessibleDiffViewerPrev() {
    this._accessibleDiffViewer.get().prev();
  }
  async waitForDiff() {
    const diffModel = this._diffModel.get();
    if (!diffModel) {
      return;
    }
    await diffModel.waitForDiff();
  }
  mapToOtherSide() {
    const isModifiedFocus = this._editors.modified.hasWidgetFocus();
    const source = isModifiedFocus ? this._editors.modified : this._editors.original;
    const destination = isModifiedFocus ? this._editors.original : this._editors.modified;
    let destinationSelection;
    const sourceSelection = source.getSelection();
    if (sourceSelection) {
      const mappings = this._diffModel.get()?.diff.get()?.mappings.map(
        (m) => isModifiedFocus ? m.lineRangeMapping.flip() : m.lineRangeMapping
      );
      if (mappings) {
        const newRange1 = translatePosition(
          sourceSelection.getStartPosition(),
          mappings
        );
        const newRange2 = translatePosition(
          sourceSelection.getEndPosition(),
          mappings
        );
        destinationSelection = Range.plusRange(newRange1, newRange2);
      }
    }
    return { destination, destinationSelection };
  }
  switchSide() {
    const { destination, destinationSelection } = this.mapToOtherSide();
    destination.focus();
    if (destinationSelection) {
      destination.setSelection(destinationSelection);
    }
  }
  exitCompareMove() {
    const model = this._diffModel.get();
    if (!model) {
      return;
    }
    model.movedTextToCompare.set(void 0, void 0);
  }
  collapseAllUnchangedRegions() {
    const unchangedRegions = this._diffModel.get()?.unchangedRegions.get();
    if (!unchangedRegions) {
      return;
    }
    transaction((tx) => {
      for (const region of unchangedRegions) {
        region.collapseAll(tx);
      }
    });
  }
  showAllUnchangedRegions() {
    const unchangedRegions = this._diffModel.get()?.unchangedRegions.get();
    if (!unchangedRegions) {
      return;
    }
    transaction((tx) => {
      for (const region of unchangedRegions) {
        region.showAll(tx);
      }
    });
  }
  _handleCursorPositionChange(e, isModifiedEditor) {
    if (e?.reason === CursorChangeReason.Explicit) {
      const diff = this._diffModel.get()?.diff.get()?.mappings.find(
        (m) => isModifiedEditor ? m.lineRangeMapping.modified.contains(
          e.position.lineNumber
        ) : m.lineRangeMapping.original.contains(
          e.position.lineNumber
        )
      );
      if (diff?.lineRangeMapping.modified.isEmpty) {
        this._accessibilitySignalService.playSignal(
          AccessibilitySignal.diffLineDeleted,
          { source: "diffEditor.cursorPositionChanged" }
        );
      } else if (diff?.lineRangeMapping.original.isEmpty) {
        this._accessibilitySignalService.playSignal(
          AccessibilitySignal.diffLineInserted,
          { source: "diffEditor.cursorPositionChanged" }
        );
      } else if (diff) {
        this._accessibilitySignalService.playSignal(
          AccessibilitySignal.diffLineModified,
          { source: "diffEditor.cursorPositionChanged" }
        );
      }
    }
  }
};
DiffEditorWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ICodeEditorService),
  __decorateParam(6, IAccessibilitySignalService),
  __decorateParam(7, IEditorProgressService)
], DiffEditorWidget);
function toLineChanges(state) {
  return state.mappings.map((x) => {
    const m = x.lineRangeMapping;
    let originalStartLineNumber;
    let originalEndLineNumber;
    let modifiedStartLineNumber;
    let modifiedEndLineNumber;
    let innerChanges = m.innerChanges;
    if (m.original.isEmpty) {
      originalStartLineNumber = m.original.startLineNumber - 1;
      originalEndLineNumber = 0;
      innerChanges = void 0;
    } else {
      originalStartLineNumber = m.original.startLineNumber;
      originalEndLineNumber = m.original.endLineNumberExclusive - 1;
    }
    if (m.modified.isEmpty) {
      modifiedStartLineNumber = m.modified.startLineNumber - 1;
      modifiedEndLineNumber = 0;
      innerChanges = void 0;
    } else {
      modifiedStartLineNumber = m.modified.startLineNumber;
      modifiedEndLineNumber = m.modified.endLineNumberExclusive - 1;
    }
    return {
      originalStartLineNumber,
      originalEndLineNumber,
      modifiedStartLineNumber,
      modifiedEndLineNumber,
      charChanges: innerChanges?.map((m2) => ({
        originalStartLineNumber: m2.originalRange.startLineNumber,
        originalStartColumn: m2.originalRange.startColumn,
        originalEndLineNumber: m2.originalRange.endLineNumber,
        originalEndColumn: m2.originalRange.endColumn,
        modifiedStartLineNumber: m2.modifiedRange.startLineNumber,
        modifiedStartColumn: m2.modifiedRange.startColumn,
        modifiedEndLineNumber: m2.modifiedRange.endLineNumber,
        modifiedEndColumn: m2.modifiedRange.endColumn
      }))
    };
  });
}
__name(toLineChanges, "toLineChanges");
export {
  DiffEditorWidget
};
//# sourceMappingURL=diffEditorWidget.js.map
