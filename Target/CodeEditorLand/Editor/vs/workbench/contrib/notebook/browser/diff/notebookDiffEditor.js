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
import * as DOM from "../../../../../base/browser/dom.js";
import { PixelRatio } from "../../../../../base/browser/pixelRatio.js";
import { findLastIdx } from "../../../../../base/common/arraysFind.js";
import { SequencerByKey } from "../../../../../base/common/async.js";
import {
  CancellationTokenSource
} from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import {
  DisposableStore,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { FontMeasurements } from "../../../../../editor/browser/config/fontMeasurements.js";
import {
  BareFontInfo
} from "../../../../../editor/common/config/fontInfo.js";
import * as nls from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import {
  ZIndex,
  registerZIndex
} from "../../../../../platform/layout/browser/zIndexRegistry.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import {
  diffDiagonalFill,
  editorBackground,
  focusBorder,
  foreground
} from "../../../../../platform/theme/common/colorRegistry.js";
import {
  IThemeService,
  registerThemingParticipant
} from "../../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../../browser/parts/editor/editorPane.js";
import {
  EditorPaneSelectionChangeReason,
  EditorPaneSelectionCompareResult
} from "../../../../common/editor.js";
import {
  CellUri,
  NOTEBOOK_DIFF_EDITOR_ID,
  NotebookSetting
} from "../../common/notebookCommon.js";
import {
  cellIndexesToRanges,
  cellRangesToIndexes
} from "../../common/notebookRange.js";
import { INotebookService } from "../../common/notebookService.js";
import { INotebookEditorWorkerService } from "../../common/services/notebookWorkerService.js";
import { getDefaultNotebookCreationOptions } from "../notebookEditorWidget.js";
import { NotebookOptions } from "../notebookOptions.js";
import {
  BackLayerWebView
} from "../view/renderers/backLayerWebView.js";
import {
  SideBySideDiffElementViewModel
} from "./diffElementViewModel.js";
import {
  DiffEditorHeightCalculatorService
} from "./editorHeightCalculator.js";
import {
  NotebookDiffEditorEventDispatcher,
  NotebookDiffLayoutChangedEvent
} from "./eventDispatcher.js";
import {
  DIFF_CELL_MARGIN,
  DiffSide
} from "./notebookDiffEditorBrowser.js";
import {
  CellDiffPlaceholderRenderer,
  CellDiffSideBySideRenderer,
  CellDiffSingleSideRenderer,
  NotebookCellTextDiffListDelegate,
  NotebookDocumentMetadataDiffRenderer,
  NotebookTextDiffList
} from "./notebookDiffList.js";
import { NotebookDiffOverviewRuler } from "./notebookDiffOverviewRuler.js";
import { NotebookDiffViewModel } from "./notebookDiffViewModel.js";
const $ = DOM.$;
class NotebookDiffEditorSelection {
  constructor(selections) {
    this.selections = selections;
  }
  static {
    __name(this, "NotebookDiffEditorSelection");
  }
  compare(other) {
    if (!(other instanceof NotebookDiffEditorSelection)) {
      return EditorPaneSelectionCompareResult.DIFFERENT;
    }
    if (this.selections.length !== other.selections.length) {
      return EditorPaneSelectionCompareResult.DIFFERENT;
    }
    for (let i = 0; i < this.selections.length; i++) {
      if (this.selections[i] !== other.selections[i]) {
        return EditorPaneSelectionCompareResult.DIFFERENT;
      }
    }
    return EditorPaneSelectionCompareResult.IDENTICAL;
  }
  restore(options) {
    const notebookOptions = {
      cellSelections: cellIndexesToRanges(this.selections)
    };
    Object.assign(notebookOptions, options);
    return notebookOptions;
  }
}
let NotebookTextDiffEditor = class extends EditorPane {
  constructor(group, instantiationService, themeService, contextKeyService, notebookEditorWorkerService, configurationService, telemetryService, storageService, notebookService) {
    super(NotebookTextDiffEditor.ID, group, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.notebookEditorWorkerService = notebookEditorWorkerService;
    this.configurationService = configurationService;
    this.notebookService = notebookService;
    this.diffEditorCalcuator = this.instantiationService.createInstance(DiffEditorHeightCalculatorService, this.fontInfo.lineHeight);
    this._notebookOptions = instantiationService.createInstance(NotebookOptions, this.window, false, void 0);
    this._register(this._notebookOptions);
    this._revealFirst = true;
  }
  static {
    __name(this, "NotebookTextDiffEditor");
  }
  static ENTIRE_DIFF_OVERVIEW_WIDTH = 30;
  creationOptions = getDefaultNotebookCreationOptions();
  static ID = NOTEBOOK_DIFF_EDITOR_ID;
  _rootElement;
  _listViewContainer;
  _overflowContainer;
  _overviewRulerContainer;
  _overviewRuler;
  _dimension = null;
  notebookDiffViewModel;
  _list;
  _modifiedWebview = null;
  _originalWebview = null;
  _webviewTransparentCover = null;
  _fontInfo;
  _onMouseUp = this._register(
    new Emitter()
  );
  onMouseUp = this._onMouseUp.event;
  _onDidScroll = this._register(new Emitter());
  onDidScroll = this._onDidScroll.event;
  onDidChangeScroll = this._onDidScroll.event;
  _eventDispatcher;
  _scopeContextKeyService;
  _model = null;
  diffEditorCalcuator;
  _modifiedResourceDisposableStore = this._register(
    new DisposableStore()
  );
  get textModel() {
    return this._model?.modified.notebook;
  }
  _revealFirst;
  _insetModifyQueueByOutputId = new SequencerByKey();
  _onDidDynamicOutputRendered = this._register(
    new Emitter()
  );
  onDidDynamicOutputRendered = this._onDidDynamicOutputRendered.event;
  _notebookOptions;
  get notebookOptions() {
    return this._notebookOptions;
  }
  _localStore = this._register(new DisposableStore());
  _layoutCancellationTokenSource;
  _onDidChangeSelection = this._register(
    new Emitter()
  );
  onDidChangeSelection = this._onDidChangeSelection.event;
  _isDisposed = false;
  get isDisposed() {
    return this._isDisposed;
  }
  get fontInfo() {
    if (!this._fontInfo) {
      this._fontInfo = this.createFontInfo();
    }
    return this._fontInfo;
  }
  createFontInfo() {
    const editorOptions = this.configurationService.getValue("editor");
    return FontMeasurements.readFontInfo(
      this.window,
      BareFontInfo.createFromRawSettings(
        editorOptions,
        PixelRatio.getInstance(this.window).value
      )
    );
  }
  isOverviewRulerEnabled() {
    return this.configurationService.getValue(
      NotebookSetting.diffOverviewRuler
    ) ?? false;
  }
  getSelection() {
    const selections = this._list.getFocus();
    return new NotebookDiffEditorSelection(selections);
  }
  toggleNotebookCellSelection(cell) {
  }
  updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
  }
  async focusNotebookCell(cell, focus) {
  }
  async focusNextNotebookCell(cell, focus) {
  }
  didFocusOutputInputChange(inputFocused) {
  }
  getScrollTop() {
    return this._list?.scrollTop ?? 0;
  }
  getScrollHeight() {
    return this._list?.scrollHeight ?? 0;
  }
  getScrollPosition() {
    return {
      scrollTop: this.getScrollTop(),
      scrollLeft: this._list?.scrollLeft ?? 0
    };
  }
  setScrollPosition(scrollPosition) {
    if (!this._list) {
      return;
    }
    this._list.scrollTop = scrollPosition.scrollTop;
    if (scrollPosition.scrollLeft !== void 0) {
      this._list.scrollLeft = scrollPosition.scrollLeft;
    }
  }
  delegateVerticalScrollbarPointerDown(browserEvent) {
    this._list?.delegateVerticalScrollbarPointerDown(browserEvent);
  }
  updateOutputHeight(cellInfo, output, outputHeight, isInit) {
    const diffElement = cellInfo.diffElement;
    const cell = this.getCellByInfo(cellInfo);
    const outputIndex = cell.outputsViewModels.indexOf(output);
    if (diffElement instanceof SideBySideDiffElementViewModel) {
      const info = CellUri.parse(cellInfo.cellUri);
      if (!info) {
        return;
      }
      diffElement.updateOutputHeight(
        info.notebook.toString() === this._model?.original.resource.toString() ? DiffSide.Original : DiffSide.Modified,
        outputIndex,
        outputHeight
      );
    } else {
      diffElement.updateOutputHeight(
        diffElement.type === "insert" ? DiffSide.Modified : DiffSide.Original,
        outputIndex,
        outputHeight
      );
    }
    if (isInit) {
      this._onDidDynamicOutputRendered.fire({ cell, output });
    }
  }
  setMarkupCellEditState(cellId, editState) {
  }
  didStartDragMarkupCell(cellId, event) {
  }
  didDragMarkupCell(cellId, event) {
  }
  didEndDragMarkupCell(cellId) {
  }
  didDropMarkupCell(cellId) {
  }
  didResizeOutput(cellId) {
  }
  createEditor(parent) {
    this._rootElement = DOM.append(
      parent,
      DOM.$(".notebook-text-diff-editor")
    );
    this._overflowContainer = document.createElement("div");
    this._overflowContainer.classList.add(
      "notebook-overflow-widget-container",
      "monaco-editor"
    );
    DOM.append(parent, this._overflowContainer);
    const renderers = [
      this.instantiationService.createInstance(
        CellDiffSingleSideRenderer,
        this
      ),
      this.instantiationService.createInstance(
        CellDiffSideBySideRenderer,
        this
      ),
      this.instantiationService.createInstance(
        CellDiffPlaceholderRenderer,
        this
      ),
      this.instantiationService.createInstance(
        NotebookDocumentMetadataDiffRenderer,
        this
      )
    ];
    this._listViewContainer = DOM.append(
      this._rootElement,
      DOM.$(".notebook-diff-list-view")
    );
    this._list = this.instantiationService.createInstance(
      NotebookTextDiffList,
      "NotebookTextDiff",
      this._listViewContainer,
      this.instantiationService.createInstance(
        NotebookCellTextDiffListDelegate,
        this.window
      ),
      renderers,
      this.contextKeyService,
      {
        setRowLineHeight: false,
        setRowHeight: false,
        supportDynamicHeights: true,
        horizontalScrolling: false,
        keyboardSupport: false,
        mouseSupport: true,
        multipleSelectionSupport: false,
        typeNavigationEnabled: true,
        paddingBottom: 0,
        // transformOptimization: (isMacintosh && isNative) || getTitleBarStyle(this.configurationService, this.environmentService) === 'native',
        styleController: /* @__PURE__ */ __name((_suffix) => {
          return this._list;
        }, "styleController"),
        overrideStyles: {
          listBackground: editorBackground,
          listActiveSelectionBackground: editorBackground,
          listActiveSelectionForeground: foreground,
          listFocusAndSelectionBackground: editorBackground,
          listFocusAndSelectionForeground: foreground,
          listFocusBackground: editorBackground,
          listFocusForeground: foreground,
          listHoverForeground: foreground,
          listHoverBackground: editorBackground,
          listHoverOutline: focusBorder,
          listFocusOutline: focusBorder,
          listInactiveSelectionBackground: editorBackground,
          listInactiveSelectionForeground: foreground,
          listInactiveFocusBackground: editorBackground,
          listInactiveFocusOutline: editorBackground
        },
        accessibilityProvider: {
          getAriaLabel() {
            return null;
          },
          getWidgetAriaLabel() {
            return nls.localize(
              "notebookTreeAriaLabel",
              "Notebook Text Diff"
            );
          }
        }
        // focusNextPreviousDelegate: {
        // 	onFocusNext: (applyFocusNext: () => void) => this._updateForCursorNavigationMode(applyFocusNext),
        // 	onFocusPrevious: (applyFocusPrevious: () => void) => this._updateForCursorNavigationMode(applyFocusPrevious),
        // }
      }
    );
    this._register(this._list);
    this._register(
      this._list.onMouseUp((e) => {
        if (e.element) {
          if (typeof e.index === "number") {
            this._list.setFocus([e.index]);
          }
          this._onMouseUp.fire({
            event: e.browserEvent,
            target: e.element
          });
        }
      })
    );
    this._register(
      this._list.onDidScroll(() => {
        this._onDidScroll.fire();
      })
    );
    this._register(
      this._list.onDidChangeFocus(
        () => this._onDidChangeSelection.fire({
          reason: EditorPaneSelectionChangeReason.USER
        })
      )
    );
    this._overviewRulerContainer = document.createElement("div");
    this._overviewRulerContainer.classList.add(
      "notebook-overview-ruler-container"
    );
    this._rootElement.appendChild(this._overviewRulerContainer);
    this._registerOverviewRuler();
    this._webviewTransparentCover = DOM.append(
      this._list.rowsContainer,
      $(".webview-cover")
    );
    this._webviewTransparentCover.style.display = "none";
    this._register(
      DOM.addStandardDisposableGenericMouseDownListener(
        this._overflowContainer,
        (e) => {
          if (e.target.classList.contains("slider") && this._webviewTransparentCover) {
            this._webviewTransparentCover.style.display = "block";
          }
        }
      )
    );
    this._register(
      DOM.addStandardDisposableGenericMouseUpListener(
        this._overflowContainer,
        () => {
          if (this._webviewTransparentCover) {
            this._webviewTransparentCover.style.display = "none";
          }
        }
      )
    );
    this._register(
      this._list.onDidScroll((e) => {
        this._webviewTransparentCover.style.top = `${e.scrollTop}px`;
      })
    );
  }
  _registerOverviewRuler() {
    this._overviewRuler = this._register(
      this.instantiationService.createInstance(
        NotebookDiffOverviewRuler,
        this,
        NotebookTextDiffEditor.ENTIRE_DIFF_OVERVIEW_WIDTH,
        this._overviewRulerContainer
      )
    );
  }
  _updateOutputsOffsetsInWebview(scrollTop, scrollHeight, activeWebview, getActiveNestedCell, diffSide) {
    activeWebview.element.style.height = `${scrollHeight}px`;
    if (activeWebview.insetMapping) {
      const updateItems = [];
      const removedItems = [];
      activeWebview.insetMapping.forEach((value, key) => {
        const cell = getActiveNestedCell(value.cellInfo.diffElement);
        if (!cell) {
          return;
        }
        const viewIndex = this._list.indexOf(
          value.cellInfo.diffElement
        );
        if (viewIndex === void 0) {
          return;
        }
        if (cell.outputsViewModels.indexOf(key) < 0) {
          removedItems.push(key);
        } else {
          const cellTop = this._list.getCellViewScrollTop(
            value.cellInfo.diffElement
          );
          const outputIndex = cell.outputsViewModels.indexOf(key);
          const outputOffset = value.cellInfo.diffElement.getOutputOffsetInCell(
            diffSide,
            outputIndex
          );
          updateItems.push({
            cell,
            output: key,
            cellTop,
            outputOffset,
            forceDisplay: false
          });
        }
      });
      activeWebview.removeInsets(removedItems);
      if (updateItems.length) {
        activeWebview.updateScrollTops(updateItems, []);
      }
    }
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    const model = await input.resolve();
    if (this._model !== model) {
      this._detachModel();
      this._model = model;
      this._attachModel();
    }
    this._model = model;
    if (this._model === null) {
      return;
    }
    this._revealFirst = true;
    this._modifiedResourceDisposableStore.clear();
    this._layoutCancellationTokenSource = new CancellationTokenSource();
    this._modifiedResourceDisposableStore.add(
      Event.any(
        this._model.original.notebook.onDidChangeContent,
        this._model.modified.notebook.onDidChangeContent
      )((e) => {
        if (this._model !== null) {
          this._layoutCancellationTokenSource?.dispose();
          this._layoutCancellationTokenSource = new CancellationTokenSource();
          this.updateLayout(
            this._layoutCancellationTokenSource.token
          );
        }
      })
    );
    await this._createOriginalWebview(
      generateUuid(),
      this._model.original.viewType,
      this._model.original.resource
    );
    if (this._originalWebview) {
      this._modifiedResourceDisposableStore.add(this._originalWebview);
    }
    await this._createModifiedWebview(
      generateUuid(),
      this._model.modified.viewType,
      this._model.modified.resource
    );
    if (this._modifiedWebview) {
      this._modifiedResourceDisposableStore.add(this._modifiedWebview);
    }
    await this.updateLayout(
      this._layoutCancellationTokenSource.token,
      options?.cellSelections ? cellRangesToIndexes(options.cellSelections) : void 0
    );
  }
  _detachModel() {
    this._localStore.clear();
    this._originalWebview?.dispose();
    this._originalWebview?.element.remove();
    this._originalWebview = null;
    this._modifiedWebview?.dispose();
    this._modifiedWebview?.element.remove();
    this._modifiedWebview = null;
    this.notebookDiffViewModel?.dispose();
    this.notebookDiffViewModel = void 0;
    this._modifiedResourceDisposableStore.clear();
    this._list.clear();
  }
  _attachModel() {
    this._eventDispatcher = new NotebookDiffEditorEventDispatcher();
    const updateInsets = /* @__PURE__ */ __name(() => {
      DOM.scheduleAtNextAnimationFrame(this.window, () => {
        if (this._isDisposed) {
          return;
        }
        if (this._modifiedWebview) {
          this._updateOutputsOffsetsInWebview(
            this._list.scrollTop,
            this._list.scrollHeight,
            this._modifiedWebview,
            (diffElement) => {
              return diffElement.modified;
            },
            DiffSide.Modified
          );
        }
        if (this._originalWebview) {
          this._updateOutputsOffsetsInWebview(
            this._list.scrollTop,
            this._list.scrollHeight,
            this._originalWebview,
            (diffElement) => {
              return diffElement.original;
            },
            DiffSide.Original
          );
        }
      });
    }, "updateInsets");
    this._localStore.add(
      this._list.onDidChangeContentHeight(() => {
        updateInsets();
      })
    );
    this._localStore.add(
      this._eventDispatcher.onDidChangeCellLayout(() => {
        updateInsets();
      })
    );
    if (this._model) {
      const vm = this.notebookDiffViewModel = this._register(
        new NotebookDiffViewModel(
          this._model,
          this.notebookEditorWorkerService,
          this.configurationService,
          this._eventDispatcher,
          this.notebookService,
          this.diffEditorCalcuator,
          this.fontInfo,
          void 0
        )
      );
      this._localStore.add(
        this.notebookDiffViewModel.onDidChangeItems((e) => {
          this._list.splice(e.start, e.deleteCount, e.elements);
          if (this.isOverviewRulerEnabled()) {
            this._overviewRuler.updateViewModels(
              vm.items,
              this._eventDispatcher
            );
          }
        })
      );
    }
  }
  async _createModifiedWebview(id, viewType, resource) {
    this._modifiedWebview?.dispose();
    this._modifiedWebview = this.instantiationService.createInstance(
      BackLayerWebView,
      this,
      id,
      viewType,
      resource,
      {
        ...this._notebookOptions.computeDiffWebviewOptions(),
        fontFamily: this._generateFontFamily()
      },
      void 0
    );
    this._list.rowsContainer.insertAdjacentElement(
      "afterbegin",
      this._modifiedWebview.element
    );
    this._modifiedWebview.createWebview(this.window);
    this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
    this._modifiedWebview.element.style.left = `calc(50%)`;
  }
  _generateFontFamily() {
    return this.fontInfo.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
  }
  async _createOriginalWebview(id, viewType, resource) {
    this._originalWebview?.dispose();
    this._originalWebview = this.instantiationService.createInstance(
      BackLayerWebView,
      this,
      id,
      viewType,
      resource,
      {
        ...this._notebookOptions.computeDiffWebviewOptions(),
        fontFamily: this._generateFontFamily()
      },
      void 0
    );
    this._list.rowsContainer.insertAdjacentElement(
      "afterbegin",
      this._originalWebview.element
    );
    this._originalWebview.createWebview(this.window);
    this._originalWebview.element.style.width = `calc(50% - 16px)`;
    this._originalWebview.element.style.left = `16px`;
  }
  setOptions(options) {
    const selections = options?.cellSelections ? cellRangesToIndexes(options.cellSelections) : void 0;
    if (selections) {
      this._list.setFocus(selections);
    }
  }
  async updateLayout(token, selections) {
    if (!this._model || !this.notebookDiffViewModel) {
      return;
    }
    const diffResult = await this.notebookDiffViewModel.computeDiff(token);
    if (token.isCancellationRequested) {
      return;
    }
    if (diffResult) {
      this._originalWebview?.removeInsets([
        ...this._originalWebview?.insetMapping.keys()
      ]);
      this._modifiedWebview?.removeInsets([
        ...this._modifiedWebview?.insetMapping.keys()
      ]);
      if (this._revealFirst && diffResult.firstChangeIndex !== -1 && diffResult.firstChangeIndex < this._list.length) {
        this._revealFirst = false;
        this._list.setFocus([diffResult.firstChangeIndex]);
        this._list.reveal(diffResult.firstChangeIndex, 0.3);
      }
    }
    if (selections) {
      this._list.setFocus(selections);
    }
  }
  scheduleOutputHeightAck(cellInfo, outputId, height) {
    const diffElement = cellInfo.diffElement;
    let diffSide = DiffSide.Original;
    if (diffElement instanceof SideBySideDiffElementViewModel) {
      const info = CellUri.parse(cellInfo.cellUri);
      if (!info) {
        return;
      }
      diffSide = info.notebook.toString() === this._model?.original.resource.toString() ? DiffSide.Original : DiffSide.Modified;
    } else {
      diffSide = diffElement.type === "insert" ? DiffSide.Modified : DiffSide.Original;
    }
    const webview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
    DOM.scheduleAtNextAnimationFrame(
      this.window,
      () => {
        webview?.ackHeight([
          { cellId: cellInfo.cellId, outputId, height }
        ]);
      },
      10
    );
  }
  pendingLayouts = /* @__PURE__ */ new WeakMap();
  layoutNotebookCell(cell, height) {
    const relayout = /* @__PURE__ */ __name((cell2, height2) => {
      this._list.updateElementHeight2(cell2, height2);
    }, "relayout");
    if (this.pendingLayouts.has(cell)) {
      this.pendingLayouts.get(cell).dispose();
    }
    let r;
    const layoutDisposable = DOM.scheduleAtNextAnimationFrame(
      this.window,
      () => {
        this.pendingLayouts.delete(cell);
        relayout(cell, height);
        r();
      }
    );
    this.pendingLayouts.set(
      cell,
      toDisposable(() => {
        layoutDisposable.dispose();
        r();
      })
    );
    return new Promise((resolve) => {
      r = resolve;
    });
  }
  setScrollTop(scrollTop) {
    this._list.scrollTop = scrollTop;
  }
  triggerScroll(event) {
    this._list.triggerScrollFromMouseWheelEvent(event);
  }
  previousChange() {
    if (!this.notebookDiffViewModel) {
      return;
    }
    let currFocus = this._list.getFocus()[0];
    if (isNaN(currFocus) || currFocus < 0) {
      currFocus = 0;
    }
    let prevChangeIndex = currFocus - 1;
    const currentViewModels = this.notebookDiffViewModel.items;
    while (prevChangeIndex >= 0) {
      const vm = currentViewModels[prevChangeIndex];
      if (vm.type !== "unchanged" && vm.type !== "placeholder") {
        break;
      }
      prevChangeIndex--;
    }
    if (prevChangeIndex >= 0) {
      this._list.setFocus([prevChangeIndex]);
      this._list.reveal(prevChangeIndex);
    } else {
      const index = findLastIdx(
        currentViewModels,
        (vm) => vm.type !== "unchanged" && vm.type !== "placeholder"
      );
      if (index >= 0) {
        this._list.setFocus([index]);
        this._list.reveal(index);
      }
    }
  }
  nextChange() {
    if (!this.notebookDiffViewModel) {
      return;
    }
    let currFocus = this._list.getFocus()[0];
    if (isNaN(currFocus) || currFocus < 0) {
      currFocus = 0;
    }
    let nextChangeIndex = currFocus + 1;
    const currentViewModels = this.notebookDiffViewModel.items;
    while (nextChangeIndex < currentViewModels.length) {
      const vm = currentViewModels[nextChangeIndex];
      if (vm.type !== "unchanged" && vm.type !== "placeholder") {
        break;
      }
      nextChangeIndex++;
    }
    if (nextChangeIndex < currentViewModels.length) {
      this._list.setFocus([nextChangeIndex]);
      this._list.reveal(nextChangeIndex);
    } else {
      const index = currentViewModels.findIndex(
        (vm) => vm.type !== "unchanged" && vm.type !== "placeholder"
      );
      if (index >= 0) {
        this._list.setFocus([index]);
        this._list.reveal(index);
      }
    }
  }
  createOutput(cellDiffViewModel, cellViewModel, output, getOffset, diffSide) {
    this._insetModifyQueueByOutputId.queue(
      output.source.model.outputId + (diffSide === DiffSide.Modified ? "-right" : "left"),
      async () => {
        const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
        if (!activeWebview) {
          return;
        }
        if (activeWebview.insetMapping.has(output.source)) {
          const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
          const outputIndex = cellViewModel.outputsViewModels.indexOf(
            output.source
          );
          const outputOffset = cellDiffViewModel.getOutputOffsetInCell(
            diffSide,
            outputIndex
          );
          activeWebview.updateScrollTops(
            [
              {
                cell: cellViewModel,
                output: output.source,
                cellTop,
                outputOffset,
                forceDisplay: true
              }
            ],
            []
          );
        } else {
          const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
          await activeWebview.createOutput(
            {
              diffElement: cellDiffViewModel,
              cellHandle: cellViewModel.handle,
              cellId: cellViewModel.id,
              cellUri: cellViewModel.uri
            },
            output,
            cellTop,
            getOffset()
          );
        }
      }
    );
  }
  updateMarkupCellHeight() {
  }
  getCellByInfo(cellInfo) {
    return cellInfo.diffElement.getCellByUri(cellInfo.cellUri);
  }
  getCellById(cellId) {
    throw new Error("Not implemented");
  }
  removeInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
    this._insetModifyQueueByOutputId.queue(
      displayOutput.model.outputId + (diffSide === DiffSide.Modified ? "-right" : "left"),
      async () => {
        const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
        if (!activeWebview) {
          return;
        }
        if (!activeWebview.insetMapping.has(displayOutput)) {
          return;
        }
        activeWebview.removeInsets([displayOutput]);
      }
    );
  }
  showInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
    this._insetModifyQueueByOutputId.queue(
      displayOutput.model.outputId + (diffSide === DiffSide.Modified ? "-right" : "left"),
      async () => {
        const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
        if (!activeWebview) {
          return;
        }
        if (!activeWebview.insetMapping.has(displayOutput)) {
          return;
        }
        const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
        const outputIndex = cellViewModel.outputsViewModels.indexOf(displayOutput);
        const outputOffset = cellDiffViewModel.getOutputOffsetInCell(
          diffSide,
          outputIndex
        );
        activeWebview.updateScrollTops(
          [
            {
              cell: cellViewModel,
              output: displayOutput,
              cellTop,
              outputOffset,
              forceDisplay: true
            }
          ],
          []
        );
      }
    );
  }
  hideInset(cellDiffViewModel, cellViewModel, output) {
    this._modifiedWebview?.hideInset(output);
    this._originalWebview?.hideInset(output);
  }
  // private async _resolveWebview(rightEditor: boolean): Promise<BackLayerWebView | null> {
  // 	if (rightEditor) {
  // 	}
  // }
  getDomNode() {
    return this._rootElement;
  }
  getOverflowContainerDomNode() {
    return this._overflowContainer;
  }
  getControl() {
    return this;
  }
  clearInput() {
    super.clearInput();
    this._modifiedResourceDisposableStore.clear();
    this._list?.splice(0, this._list?.length || 0);
    this._model = null;
    this.notebookDiffViewModel?.dispose();
    this.notebookDiffViewModel = void 0;
  }
  deltaCellOutputContainerClassNames(diffSide, cellId, added, removed) {
    if (diffSide === DiffSide.Original) {
      this._originalWebview?.deltaCellContainerClassNames(
        cellId,
        added,
        removed
      );
    } else {
      this._modifiedWebview?.deltaCellContainerClassNames(
        cellId,
        added,
        removed
      );
    }
  }
  getLayoutInfo() {
    if (!this._list) {
      throw new Error("Editor is not initalized successfully");
    }
    return {
      width: this._dimension.width,
      height: this._dimension.height,
      fontInfo: this.fontInfo,
      scrollHeight: this._list?.getScrollHeight() ?? 0,
      stickyHeight: 0
    };
  }
  layout(dimension, _position) {
    this._rootElement.classList.toggle(
      "mid-width",
      dimension.width < 1e3 && dimension.width >= 600
    );
    this._rootElement.classList.toggle(
      "narrow-width",
      dimension.width < 600
    );
    const overviewRulerEnabled = this.isOverviewRulerEnabled();
    this._dimension = dimension.with(
      dimension.width - (overviewRulerEnabled ? NotebookTextDiffEditor.ENTIRE_DIFF_OVERVIEW_WIDTH : 0)
    );
    this._listViewContainer.style.height = `${dimension.height}px`;
    this._listViewContainer.style.width = `${this._dimension.width}px`;
    this._list?.layout(this._dimension.height, this._dimension.width);
    if (this._modifiedWebview) {
      this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
      this._modifiedWebview.element.style.left = `calc(50%)`;
    }
    if (this._originalWebview) {
      this._originalWebview.element.style.width = `calc(50% - 16px)`;
      this._originalWebview.element.style.left = `16px`;
    }
    if (this._webviewTransparentCover) {
      this._webviewTransparentCover.style.height = `${this._dimension.height}px`;
      this._webviewTransparentCover.style.width = `${this._dimension.width}px`;
    }
    if (overviewRulerEnabled) {
      this._overviewRuler.layout();
    }
    this._eventDispatcher?.emit([
      new NotebookDiffLayoutChangedEvent(
        { width: true, fontInfo: true },
        this.getLayoutInfo()
      )
    ]);
  }
  dispose() {
    this._isDisposed = true;
    this._layoutCancellationTokenSource?.dispose();
    this._detachModel();
    super.dispose();
  }
};
NotebookTextDiffEditor = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, INotebookEditorWorkerService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, INotebookService)
], NotebookTextDiffEditor);
registerZIndex(ZIndex.Base, 10, "notebook-diff-view-viewport-slider");
registerThemingParticipant((theme, collector) => {
  const diffDiagonalFillColor = theme.getColor(diffDiagonalFill);
  collector.addRule(`
	.notebook-text-diff-editor .diagonal-fill {
		background-image: linear-gradient(
			-45deg,
			${diffDiagonalFillColor} 12.5%,
			#0000 12.5%, #0000 50%,
			${diffDiagonalFillColor} 50%, ${diffDiagonalFillColor} 62.5%,
			#0000 62.5%, #0000 100%
		);
		background-size: 8px 8px;
	}
	`);
  collector.addRule(
    `.notebook-text-diff-editor .cell-body { margin: ${DIFF_CELL_MARGIN}px; }`
  );
  collector.addRule(
    `.notebook-text-diff-editor .cell-placeholder-body { margin: ${DIFF_CELL_MARGIN}px 0; }`
  );
});
export {
  NotebookTextDiffEditor
};
//# sourceMappingURL=notebookDiffEditor.js.map
