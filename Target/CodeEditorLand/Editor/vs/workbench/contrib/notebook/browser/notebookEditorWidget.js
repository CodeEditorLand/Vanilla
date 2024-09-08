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
import "./media/notebook.css";
import "./media/notebookCellChat.css";
import "./media/notebookCellEditorHint.css";
import "./media/notebookCellInsertToolbar.css";
import "./media/notebookCellStatusBar.css";
import "./media/notebookCellTitleToolbar.css";
import "./media/notebookFocusIndicator.css";
import "./media/notebookToolbar.css";
import "./media/notebookDnd.css";
import "./media/notebookFolding.css";
import "./media/notebookCellOutput.css";
import "./media/notebookEditorStickyScroll.css";
import "./media/notebookKernelActionViewItem.css";
import "./media/notebookOutline.css";
import * as DOM from "../../../../base/browser/dom.js";
import { PixelRatio } from "../../../../base/browser/pixelRatio.js";
import { mainWindow } from "../../../../base/browser/window.js";
import {
  DeferredPromise,
  SequencerByKey
} from "../../../../base/common/async.js";
import { Color, RGBA } from "../../../../base/common/color.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  combinedDisposable,
  dispose,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { setTimeout0 } from "../../../../base/common/platform.js";
import { extname, isEqual } from "../../../../base/common/resources.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { FontMeasurements } from "../../../../editor/browser/config/fontMeasurements.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import {
  BareFontInfo
} from "../../../../editor/common/config/fontInfo.js";
import { Range } from "../../../../editor/common/core/range.js";
import { CopyPasteController } from "../../../../editor/contrib/dropOrPasteInto/browser/copyPasteController.js";
import { DropIntoEditorController } from "../../../../editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import * as nls from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import {
  ZIndex,
  registerZIndex
} from "../../../../platform/layout/browser/zIndexRegistry.js";
import {
  IEditorProgressService
} from "../../../../platform/progress/common/progress.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  contrastBorder,
  errorForeground,
  focusBorder,
  foreground,
  listInactiveSelectionBackground,
  registerColor,
  scrollbarSliderActiveBackground,
  scrollbarSliderBackground,
  scrollbarSliderHoverBackground,
  transparent
} from "../../../../platform/theme/common/colorRegistry.js";
import { FloatingEditorClickMenu } from "../../../browser/codeeditor.js";
import {
  EDITOR_PANE_BACKGROUND,
  PANEL_BORDER,
  SIDE_BAR_BACKGROUND
} from "../../../common/theme.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { debugIconStartForeground } from "../../debug/browser/debugColors.js";
import { PreventDefaultContextMenuItemsContextKeyName } from "../../webview/browser/webview.contribution.js";
import {
  CellEditType,
  CellKind,
  NotebookFindScopeType,
  RENDERER_NOT_AVAILABLE,
  SelectionStateType
} from "../common/notebookCommon.js";
import {
  NOTEBOOK_CURSOR_NAVIGATION_MODE,
  NOTEBOOK_EDITOR_EDITABLE,
  NOTEBOOK_EDITOR_FOCUSED,
  NOTEBOOK_OUTPUT_FOCUSED,
  NOTEBOOK_OUTPUT_INPUT_FOCUSED
} from "../common/notebookContextKeys.js";
import { INotebookExecutionService } from "../common/notebookExecutionService.js";
import { INotebookExecutionStateService } from "../common/notebookExecutionStateService.js";
import { INotebookKernelService } from "../common/notebookKernelService.js";
import { INotebookLoggingService } from "../common/notebookLoggingService.js";
import {
  cellRangesToIndexes
} from "../common/notebookRange.js";
import { INotebookRendererMessagingService } from "../common/notebookRendererMessagingService.js";
import { INotebookService } from "../common/notebookService.js";
import { CellFindMatchModel } from "./contrib/find/findModel.js";
import { NotebookAccessibilityProvider } from "./notebookAccessibilityProvider.js";
import {
  CellEditState,
  CellFocusMode,
  CellRevealRangeType,
  CellRevealType,
  RenderOutputType,
  ScrollToRevealBehavior
} from "./notebookBrowser.js";
import { NotebookEditorExtensionsRegistry } from "./notebookEditorExtensions.js";
import { notebookDebug } from "./notebookLogger.js";
import {
  NotebookOptions,
  OutputInnerContainerTopPadding
} from "./notebookOptions.js";
import {
  NotebookLayoutChangedEvent
} from "./notebookViewEvents.js";
import { INotebookEditorService } from "./services/notebookEditorService.js";
import { CellContextKeyManager } from "./view/cellParts/cellContextKeys.js";
import { CellDragAndDropController } from "./view/cellParts/cellDnd.js";
import { NotebookCellEditorPool } from "./view/notebookCellEditorPool.js";
import {
  ListViewInfoAccessor,
  NOTEBOOK_WEBVIEW_BOUNDARY,
  NotebookCellList
} from "./view/notebookCellList.js";
import { BackLayerWebView } from "./view/renderers/backLayerWebView.js";
import {
  CodeCellRenderer,
  MarkupCellRenderer,
  NotebookCellListDelegate
} from "./view/renderers/cellRenderer.js";
import { BaseCellEditorOptions } from "./viewModel/cellEditorOptions.js";
import {
  CodeCellViewModel,
  outputDisplayLimit
} from "./viewModel/codeCellViewModel.js";
import { NotebookEventDispatcher } from "./viewModel/eventDispatcher.js";
import { MarkupCellViewModel } from "./viewModel/markupCellViewModel.js";
import {
  NotebookViewModel
} from "./viewModel/notebookViewModelImpl.js";
import { ViewContext } from "./viewModel/viewContext.js";
import { NotebookStickyScroll } from "./viewParts/notebookEditorStickyScroll.js";
import { NotebookEditorWorkbenchToolbar } from "./viewParts/notebookEditorToolbar.js";
import { NotebookEditorContextKeys } from "./viewParts/notebookEditorWidgetContextKeys.js";
import { NotebookHorizontalTracker } from "./viewParts/notebookHorizontalTracker.js";
import { NotebookOverviewRuler } from "./viewParts/notebookOverviewRuler.js";
import { ListTopCellToolbar } from "./viewParts/notebookTopCellToolbar.js";
const $ = DOM.$;
function getDefaultNotebookCreationOptions() {
  const skipContributions = [
    "editor.contrib.review",
    FloatingEditorClickMenu.ID,
    "editor.contrib.dirtydiff",
    "editor.contrib.testingOutputPeek",
    "editor.contrib.testingDecorations",
    "store.contrib.stickyScrollController",
    "editor.contrib.findController",
    "editor.contrib.emptyTextEditorHint"
  ];
  const contributions = EditorExtensionsRegistry.getEditorContributions().filter(
    (c) => skipContributions.indexOf(c.id) === -1
  );
  return {
    menuIds: {
      notebookToolbar: MenuId.NotebookToolbar,
      cellTitleToolbar: MenuId.NotebookCellTitle,
      cellDeleteToolbar: MenuId.NotebookCellDelete,
      cellInsertToolbar: MenuId.NotebookCellBetween,
      cellTopInsertToolbar: MenuId.NotebookCellListTop,
      cellExecuteToolbar: MenuId.NotebookCellExecute,
      cellExecutePrimary: MenuId.NotebookCellExecutePrimary
    },
    cellEditorContributions: contributions
  };
}
let NotebookEditorWidget = class extends Disposable {
  constructor(creationOptions, dimension, instantiationService, editorGroupsService, notebookRendererMessaging, notebookEditorService, notebookKernelService, _notebookService, configurationService, contextKeyService, layoutService, contextMenuService, telemetryService, notebookExecutionService, notebookExecutionStateService, editorProgressService, logService, keybindingService) {
    super();
    this.creationOptions = creationOptions;
    this.notebookRendererMessaging = notebookRendererMessaging;
    this.notebookEditorService = notebookEditorService;
    this.notebookKernelService = notebookKernelService;
    this._notebookService = _notebookService;
    this.configurationService = configurationService;
    this.layoutService = layoutService;
    this.contextMenuService = contextMenuService;
    this.telemetryService = telemetryService;
    this.notebookExecutionService = notebookExecutionService;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.editorProgressService = editorProgressService;
    this.logService = logService;
    this.keybindingService = keybindingService;
    this._dimension = dimension;
    this.isEmbedded = creationOptions.isEmbedded ?? false;
    this._readOnly = creationOptions.isReadOnly ?? false;
    this._inRepl = creationOptions.forRepl ?? false;
    this._overlayContainer = document.createElement("div");
    this.scopedContextKeyService = this._register(contextKeyService.createScoped(this._overlayContainer));
    this.instantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    this._notebookOptions = creationOptions.options ?? this.instantiationService.createInstance(NotebookOptions, this.creationOptions?.codeWindow ?? mainWindow, this._readOnly, void 0);
    this._register(this._notebookOptions);
    const eventDispatcher = this._register(new NotebookEventDispatcher());
    this._viewContext = new ViewContext(
      this._notebookOptions,
      eventDispatcher,
      (language) => this.getBaseCellEditorOptions(language)
    );
    this._register(this._viewContext.eventDispatcher.onDidChangeLayout(() => {
      this._onDidChangeLayout.fire();
    }));
    this._register(this._viewContext.eventDispatcher.onDidChangeCellState((e) => {
      this._onDidChangeCellState.fire(e);
    }));
    this._register(_notebookService.onDidChangeOutputRenderers(() => {
      this._updateOutputRenderers();
    }));
    this._register(this.instantiationService.createInstance(NotebookEditorContextKeys, this));
    this._register(notebookKernelService.onDidChangeSelectedNotebooks((e) => {
      if (isEqual(e.notebook, this.viewModel?.uri)) {
        this._loadKernelPreloads();
        this._onDidChangeActiveKernel.fire();
      }
    }));
    this._scrollBeyondLastLine = this.configurationService.getValue("editor.scrollBeyondLastLine");
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("editor.scrollBeyondLastLine")) {
        this._scrollBeyondLastLine = this.configurationService.getValue("editor.scrollBeyondLastLine");
        if (this._dimension && this._isVisible) {
          this.layout(this._dimension);
        }
      }
    }));
    this._register(this._notebookOptions.onDidChangeOptions((e) => {
      if (e.cellStatusBarVisibility || e.cellToolbarLocation || e.cellToolbarInteraction) {
        this._updateForNotebookConfiguration();
      }
      if (e.fontFamily) {
        this._generateFontInfo();
      }
      if (e.compactView || e.focusIndicator || e.insertToolbarPosition || e.cellToolbarLocation || e.dragAndDropEnabled || e.fontSize || e.markupFontSize || e.markdownLineHeight || e.fontFamily || e.insertToolbarAlignment || e.outputFontSize || e.outputLineHeight || e.outputFontFamily || e.outputWordWrap || e.outputScrolling || e.outputLinkifyFilePaths || e.minimalError) {
        this._styleElement?.remove();
        this._createLayoutStyles();
        this._webview?.updateOptions({
          ...this.notebookOptions.computeWebviewOptions(),
          fontFamily: this._generateFontFamily()
        });
      }
      if (this._dimension && this._isVisible) {
        this.layout(this._dimension);
      }
    }));
    const container = creationOptions.codeWindow ? this.layoutService.getContainer(creationOptions.codeWindow) : this.layoutService.mainContainer;
    this._register(editorGroupsService.getPart(container).onDidScroll((e) => {
      if (!this._shadowElement || !this._isVisible) {
        return;
      }
      this.updateShadowElement(this._shadowElement, this._dimension);
      this.layoutContainerOverShadowElement(this._dimension, this._position);
    }));
    this.notebookEditorService.addNotebookEditor(this);
    const id = generateUuid();
    this._overlayContainer.id = `notebook-${id}`;
    this._overlayContainer.className = "notebookOverlay";
    this._overlayContainer.classList.add("notebook-editor");
    this._overlayContainer.inert = true;
    this._overlayContainer.style.visibility = "hidden";
    container.appendChild(this._overlayContainer);
    this._createBody(this._overlayContainer);
    this._generateFontInfo();
    this._isVisible = true;
    this._editorFocus = NOTEBOOK_EDITOR_FOCUSED.bindTo(this.scopedContextKeyService);
    this._outputFocus = NOTEBOOK_OUTPUT_FOCUSED.bindTo(this.scopedContextKeyService);
    this._outputInputFocus = NOTEBOOK_OUTPUT_INPUT_FOCUSED.bindTo(this.scopedContextKeyService);
    this._editorEditable = NOTEBOOK_EDITOR_EDITABLE.bindTo(this.scopedContextKeyService);
    this._cursorNavMode = NOTEBOOK_CURSOR_NAVIGATION_MODE.bindTo(this.scopedContextKeyService);
    new RawContextKey(PreventDefaultContextMenuItemsContextKeyName, false).bindTo(this.scopedContextKeyService).set(true);
    this._editorEditable.set(!creationOptions.isReadOnly);
    let contributions;
    if (Array.isArray(this.creationOptions.contributions)) {
      contributions = this.creationOptions.contributions;
    } else {
      contributions = NotebookEditorExtensionsRegistry.getEditorContributions();
    }
    for (const desc of contributions) {
      let contribution;
      try {
        contribution = this.instantiationService.createInstance(desc.ctor, this);
      } catch (err) {
        onUnexpectedError(err);
      }
      if (contribution) {
        if (this._contributions.has(desc.id)) {
          contribution.dispose();
          throw new Error(`DUPLICATE notebook editor contribution: '${desc.id}'`);
        } else {
          this._contributions.set(desc.id, contribution);
        }
      }
    }
    this._updateForNotebookConfiguration();
  }
  //#region Eventing
  _onDidChangeCellState = this._register(
    new Emitter()
  );
  onDidChangeCellState = this._onDidChangeCellState.event;
  _onDidChangeViewCells = this._register(
    new Emitter()
  );
  onDidChangeViewCells = this._onDidChangeViewCells.event;
  _onWillChangeModel = this._register(
    new Emitter()
  );
  onWillChangeModel = this._onWillChangeModel.event;
  _onDidChangeModel = this._register(
    new Emitter()
  );
  onDidChangeModel = this._onDidChangeModel.event;
  _onDidAttachViewModel = this._register(
    new Emitter()
  );
  onDidAttachViewModel = this._onDidAttachViewModel.event;
  _onDidChangeOptions = this._register(new Emitter());
  onDidChangeOptions = this._onDidChangeOptions.event;
  _onDidChangeDecorations = this._register(
    new Emitter()
  );
  onDidChangeDecorations = this._onDidChangeDecorations.event;
  _onDidScroll = this._register(new Emitter());
  onDidScroll = this._onDidScroll.event;
  _onDidChangeLayout = this._register(new Emitter());
  onDidChangeLayout = this._onDidChangeLayout.event;
  _onDidChangeActiveCell = this._register(
    new Emitter()
  );
  onDidChangeActiveCell = this._onDidChangeActiveCell.event;
  _onDidChangeFocus = this._register(new Emitter());
  onDidChangeFocus = this._onDidChangeFocus.event;
  _onDidChangeSelection = this._register(
    new Emitter()
  );
  onDidChangeSelection = this._onDidChangeSelection.event;
  _onDidChangeVisibleRanges = this._register(
    new Emitter()
  );
  onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
  _onDidFocusEmitter = this._register(new Emitter());
  onDidFocusWidget = this._onDidFocusEmitter.event;
  _onDidBlurEmitter = this._register(new Emitter());
  onDidBlurWidget = this._onDidBlurEmitter.event;
  _onDidChangeActiveEditor = this._register(
    new Emitter()
  );
  onDidChangeActiveEditor = this._onDidChangeActiveEditor.event;
  _onDidChangeActiveKernel = this._register(
    new Emitter()
  );
  onDidChangeActiveKernel = this._onDidChangeActiveKernel.event;
  _onMouseUp = this._register(new Emitter());
  onMouseUp = this._onMouseUp.event;
  _onMouseDown = this._register(new Emitter());
  onMouseDown = this._onMouseDown.event;
  _onDidReceiveMessage = this._register(
    new Emitter()
  );
  onDidReceiveMessage = this._onDidReceiveMessage.event;
  _onDidRenderOutput = this._register(
    new Emitter()
  );
  onDidRenderOutput = this._onDidRenderOutput.event;
  _onDidRemoveOutput = this._register(
    new Emitter()
  );
  onDidRemoveOutput = this._onDidRemoveOutput.event;
  _onDidResizeOutputEmitter = this._register(
    new Emitter()
  );
  onDidResizeOutput = this._onDidResizeOutputEmitter.event;
  //#endregion
  _overlayContainer;
  _notebookTopToolbarContainer;
  _notebookTopToolbar;
  _notebookStickyScrollContainer;
  _notebookStickyScroll;
  _notebookOverviewRulerContainer;
  _notebookOverviewRuler;
  _body;
  _styleElement;
  _overflowContainer;
  _webview = null;
  _webviewResolvePromise = null;
  _webviewTransparentCover = null;
  _listDelegate = null;
  _list;
  _listViewInfoAccessor;
  _dndController = null;
  _listTopCellToolbar = null;
  _renderedEditors = /* @__PURE__ */ new Map();
  _editorPool;
  _viewContext;
  _notebookViewModel;
  _localStore = this._register(
    new DisposableStore()
  );
  _localCellStateListeners = [];
  _fontInfo;
  _dimension;
  _position;
  _shadowElement;
  _shadowElementViewInfo = null;
  _editorFocus;
  _outputFocus;
  _editorEditable;
  _cursorNavMode;
  _outputInputFocus;
  _contributions = /* @__PURE__ */ new Map();
  _scrollBeyondLastLine;
  _insetModifyQueueByOutputId = new SequencerByKey();
  _cellContextKeyManager = null;
  _uuid = generateUuid();
  _focusTracker;
  _webviewFocused = false;
  _isVisible = false;
  get isVisible() {
    return this._isVisible;
  }
  _isDisposed = false;
  get isDisposed() {
    return this._isDisposed;
  }
  set viewModel(newModel) {
    this._onWillChangeModel.fire(this._notebookViewModel?.notebookDocument);
    this._notebookViewModel = newModel;
    this._onDidChangeModel.fire(newModel?.notebookDocument);
  }
  get viewModel() {
    return this._notebookViewModel;
  }
  get textModel() {
    return this._notebookViewModel?.notebookDocument;
  }
  get isReadOnly() {
    return this._notebookViewModel?.options.isReadOnly ?? false;
  }
  get activeCodeEditor() {
    if (this._isDisposed) {
      return;
    }
    const [focused] = this._list.getFocusedElements();
    return this._renderedEditors.get(focused);
  }
  get activeCellAndCodeEditor() {
    if (this._isDisposed) {
      return;
    }
    const [focused] = this._list.getFocusedElements();
    const editor = this._renderedEditors.get(focused);
    if (!editor) {
      return;
    }
    return [focused, editor];
  }
  get codeEditors() {
    return [...this._renderedEditors];
  }
  get visibleRanges() {
    return this._list.visibleRanges || [];
  }
  _baseCellEditorOptions = /* @__PURE__ */ new Map();
  isEmbedded;
  _readOnly;
  _inRepl;
  scopedContextKeyService;
  instantiationService;
  _notebookOptions;
  _currentProgress;
  get notebookOptions() {
    return this._notebookOptions;
  }
  _debugFlag = false;
  _debug(...args) {
    if (!this._debugFlag) {
      return;
    }
    notebookDebug(...args);
  }
  /**
   * EditorId
   */
  getId() {
    return this._uuid;
  }
  getViewModel() {
    return this.viewModel;
  }
  getLength() {
    return this.viewModel?.length ?? 0;
  }
  getSelections() {
    return this.viewModel?.getSelections() ?? [];
  }
  setSelections(selections) {
    if (!this.viewModel) {
      return;
    }
    const focus = this.viewModel.getFocus();
    this.viewModel.updateSelectionsState({
      kind: SelectionStateType.Index,
      focus,
      selections
    });
  }
  getFocus() {
    return this.viewModel?.getFocus() ?? { start: 0, end: 0 };
  }
  setFocus(focus) {
    if (!this.viewModel) {
      return;
    }
    const selections = this.viewModel.getSelections();
    this.viewModel.updateSelectionsState({
      kind: SelectionStateType.Index,
      focus,
      selections
    });
  }
  getSelectionViewModels() {
    if (!this.viewModel) {
      return [];
    }
    const cellsSet = /* @__PURE__ */ new Set();
    return this.viewModel.getSelections().map(
      (range) => this.viewModel.viewCells.slice(range.start, range.end)
    ).reduce((a, b) => {
      b.forEach((cell) => {
        if (!cellsSet.has(cell.handle)) {
          cellsSet.add(cell.handle);
          a.push(cell);
        }
      });
      return a;
    }, []);
  }
  hasModel() {
    return !!this._notebookViewModel;
  }
  showProgress() {
    this._currentProgress = this.editorProgressService.show(true);
  }
  hideProgress() {
    if (this._currentProgress) {
      this._currentProgress.done();
      this._currentProgress = void 0;
    }
  }
  //#region Editor Core
  getBaseCellEditorOptions(language) {
    const existingOptions = this._baseCellEditorOptions.get(language);
    if (existingOptions) {
      return existingOptions;
    } else {
      const options = new BaseCellEditorOptions(
        this,
        this.notebookOptions,
        this.configurationService,
        language
      );
      this._baseCellEditorOptions.set(language, options);
      return options;
    }
  }
  _updateForNotebookConfiguration() {
    if (!this._overlayContainer) {
      return;
    }
    this._overlayContainer.classList.remove("cell-title-toolbar-left");
    this._overlayContainer.classList.remove("cell-title-toolbar-right");
    this._overlayContainer.classList.remove("cell-title-toolbar-hidden");
    const cellToolbarLocation = this._notebookOptions.computeCellToolbarLocation(
      this.viewModel?.viewType
    );
    this._overlayContainer.classList.add(
      `cell-title-toolbar-${cellToolbarLocation}`
    );
    const cellToolbarInteraction = this._notebookOptions.getDisplayOptions().cellToolbarInteraction;
    let cellToolbarInteractionState = "hover";
    this._overlayContainer.classList.remove("cell-toolbar-hover");
    this._overlayContainer.classList.remove("cell-toolbar-click");
    if (cellToolbarInteraction === "hover" || cellToolbarInteraction === "click") {
      cellToolbarInteractionState = cellToolbarInteraction;
    }
    this._overlayContainer.classList.add(
      `cell-toolbar-${cellToolbarInteractionState}`
    );
  }
  _generateFontInfo() {
    const editorOptions = this.configurationService.getValue("editor");
    const targetWindow = DOM.getWindow(this.getDomNode());
    this._fontInfo = FontMeasurements.readFontInfo(
      targetWindow,
      BareFontInfo.createFromRawSettings(
        editorOptions,
        PixelRatio.getInstance(targetWindow).value
      )
    );
  }
  _createBody(parent) {
    this._notebookTopToolbarContainer = document.createElement("div");
    this._notebookTopToolbarContainer.classList.add(
      "notebook-toolbar-container"
    );
    this._notebookTopToolbarContainer.style.display = "none";
    DOM.append(parent, this._notebookTopToolbarContainer);
    this._notebookStickyScrollContainer = document.createElement("div");
    this._notebookStickyScrollContainer.classList.add(
      "notebook-sticky-scroll-container"
    );
    DOM.append(parent, this._notebookStickyScrollContainer);
    this._body = document.createElement("div");
    DOM.append(parent, this._body);
    this._body.classList.add("cell-list-container");
    this._createLayoutStyles();
    this._createCellList();
    this._notebookOverviewRulerContainer = document.createElement("div");
    this._notebookOverviewRulerContainer.classList.add(
      "notebook-overview-ruler-container"
    );
    this._list.scrollableElement.appendChild(
      this._notebookOverviewRulerContainer
    );
    this._registerNotebookOverviewRuler();
    this._register(
      this.instantiationService.createInstance(
        NotebookHorizontalTracker,
        this,
        this._list.scrollableElement
      )
    );
    this._overflowContainer = document.createElement("div");
    this._overflowContainer.classList.add(
      "notebook-overflow-widget-container",
      "monaco-editor"
    );
    DOM.append(parent, this._overflowContainer);
  }
  _generateFontFamily() {
    return this._fontInfo?.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
  }
  _createLayoutStyles() {
    this._styleElement = DOM.createStyleSheet(this._body);
    const {
      cellRightMargin,
      cellTopMargin,
      cellRunGutter,
      cellBottomMargin,
      codeCellLeftMargin,
      markdownCellGutter,
      markdownCellLeftMargin,
      markdownCellBottomMargin,
      markdownCellTopMargin,
      collapsedIndicatorHeight,
      focusIndicator,
      insertToolbarPosition,
      outputFontSize,
      focusIndicatorLeftMargin,
      focusIndicatorGap
    } = this._notebookOptions.getLayoutConfiguration();
    const { insertToolbarAlignment, compactView, fontSize } = this._notebookOptions.getDisplayOptions();
    const getCellEditorContainerLeftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
    const { bottomToolbarGap, bottomToolbarHeight } = this._notebookOptions.computeBottomToolbarDimensions(
      this.viewModel?.viewType
    );
    const styleSheets = [];
    if (!this._fontInfo) {
      this._generateFontInfo();
    }
    const fontFamily = this._generateFontFamily();
    styleSheets.push(`
		.notebook-editor {
			--notebook-cell-output-font-size: ${outputFontSize}px;
			--notebook-cell-input-preview-font-size: ${fontSize}px;
			--notebook-cell-input-preview-font-family: ${fontFamily};
		}
		`);
    if (compactView) {
      styleSheets.push(
        `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${getCellEditorContainerLeftMargin}px; }`
      );
    } else {
      styleSheets.push(
        `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${codeCellLeftMargin}px; }`
      );
    }
    if (focusIndicator === "border") {
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-top:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom:before,
			.monaco-workbench .notebookOverlay .monaco-list .markdown-cell-row .cell-inner-container:before,
			.monaco-workbench .notebookOverlay .monaco-list .markdown-cell-row .cell-inner-container:after {
				content: "";
				position: absolute;
				width: 100%;
				height: 1px;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-right:before {
				content: "";
				position: absolute;
				width: 1px;
				height: 100%;
				z-index: 10;
			}

			/* top border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-top:before {
				border-top: 1px solid transparent;
			}

			/* left border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left:before {
				border-left: 1px solid transparent;
			}

			/* bottom border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom:before {
				border-bottom: 1px solid transparent;
			}

			/* right border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-right:before {
				border-right: 1px solid transparent;
			}
			`);
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-right:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-right:before {
				top: -${cellTopMargin}px; height: calc(100% + ${cellTopMargin + cellBottomMargin}px)
			}`);
    } else {
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left .codeOutput-focus-indicator {
				border-left: 3px solid transparent;
				border-radius: 4px;
				width: 0px;
				margin-left: ${focusIndicatorLeftMargin}px;
				border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-output-hover .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .markdown-cell-hover .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row:hover .cell-focus-indicator-left .codeOutput-focus-indicator-container {
				display: block;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left .codeOutput-focus-indicator-container:hover .codeOutput-focus-indicator {
				border-left: 5px solid transparent;
				margin-left: ${focusIndicatorLeftMargin - 1}px;
			}
			`);
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-inner-container.cell-output-focus .cell-focus-indicator-left .codeOutput-focus-indicator,
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-inner-container .cell-focus-indicator-left .codeOutput-focus-indicator {
				border-color: var(--vscode-notebook-focusedCellBorder) !important;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-inner-container .cell-focus-indicator-left .output-focus-indicator {
				margin-top: ${focusIndicatorGap}px;
			}
			`);
    }
    if (insertToolbarPosition === "betweenCells" || insertToolbarPosition === "both") {
      styleSheets.push(
        `.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { display: flex; }`
      );
      styleSheets.push(
        `.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .view-zones .cell-list-top-cell-toolbar-container { display: flex; }`
      );
    } else {
      styleSheets.push(
        `.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { display: none; }`
      );
      styleSheets.push(
        `.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .view-zones .cell-list-top-cell-toolbar-container { display: none; }`
      );
    }
    if (insertToolbarAlignment === "left") {
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .action-item:first-child,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .action-item:first-child, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .action-item:first-child {
				margin-right: 0px !important;
			}`);
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .monaco-toolbar .action-label,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .monaco-toolbar .action-label, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .monaco-toolbar .action-label {
				padding: 0px !important;
				justify-content: center;
				border-radius: 4px;
			}`);
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container {
				align-items: flex-start;
				justify-content: left;
				margin: 0 16px 0 ${8 + codeCellLeftMargin}px;
			}`);
      styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container,
			.notebookOverlay .cell-bottom-toolbar-container .action-item {
				border: 0px;
			}`);
    }
    styleSheets.push(
      `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .code-cell-row div.cell.code { margin-left: ${getCellEditorContainerLeftMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell { margin-right: ${cellRightMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row > .cell-inner-container { padding-top: ${cellTopMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container { padding-bottom: ${markdownCellBottomMargin}px; padding-top: ${markdownCellTopMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container.webview-backed-markdown-cell { padding: 0; }`
    );
    styleSheets.push(
      `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .webview-backed-markdown-cell.markdown-cell-edit-mode .cell.code { padding-bottom: ${markdownCellBottomMargin}px; padding-top: ${markdownCellTopMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .output { margin: 0px ${cellRightMargin}px 0px ${getCellEditorContainerLeftMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .output { width: calc(100% - ${getCellEditorContainerLeftMargin + cellRightMargin}px); }`
    );
    styleSheets.push(
      `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-comment-container { left: ${getCellEditorContainerLeftMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-comment-container { width: calc(100% - ${getCellEditorContainerLeftMargin + cellRightMargin}px); }`
    );
    styleSheets.push(
      `.monaco-workbench .notebookOverlay .output .output-collapse-container .expandButton { left: -${cellRunGutter}px; }`
    );
    styleSheets.push(`.monaco-workbench .notebookOverlay .output .output-collapse-container .expandButton {
			position: absolute;
			width: ${cellRunGutter}px;
			padding: 6px 0px;
		}`);
    styleSheets.push(
      `.notebookOverlay .output-show-more-container { margin: 0px ${cellRightMargin}px 0px ${getCellEditorContainerLeftMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .output-show-more-container { width: calc(100% - ${getCellEditorContainerLeftMargin + cellRightMargin}px); }`
    );
    styleSheets.push(
      `.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell.markdown { padding-left: ${cellRunGutter}px; }`
    );
    styleSheets.push(
      `.monaco-workbench .notebookOverlay > .cell-list-container .notebook-folding-indicator { left: ${(markdownCellGutter - 20) / 2 + markdownCellLeftMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay > .cell-list-container .notebook-folded-hint { left: ${markdownCellGutter + markdownCellLeftMargin + 8}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .monaco-list .monaco-list-row :not(.webview-backed-markdown-cell) .cell-focus-indicator-top { height: ${cellTopMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-side { bottom: ${bottomToolbarGap}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .monaco-list .monaco-list-row.code-cell-row .cell-focus-indicator-left { width: ${getCellEditorContainerLeftMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row .cell-focus-indicator-left { width: ${codeCellLeftMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator.cell-focus-indicator-right { width: ${cellRightMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom { height: ${cellBottomMargin}px; }`
    );
    styleSheets.push(
      `.notebookOverlay .monaco-list .monaco-list-row .cell-shadow-container-bottom { top: ${cellBottomMargin}px; }`
    );
    styleSheets.push(`
			.notebookOverlay .monaco-list .monaco-list-row:has(+ .monaco-list-row.selected) .cell-focus-indicator-bottom {
				height: ${bottomToolbarGap + cellBottomMargin}px;
			}
		`);
    styleSheets.push(`
			.notebookOverlay .monaco-list .monaco-list-row.code-cell-row.nb-multiCellHighlight:has(+ .monaco-list-row.nb-multiCellHighlight) .cell-focus-indicator-bottom {
				height: ${bottomToolbarGap + cellBottomMargin}px;
				background-color: var(--vscode-notebook-symbolHighlightBackground) !important;
			}

			.notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row.nb-multiCellHighlight:has(+ .monaco-list-row.nb-multiCellHighlight) .cell-focus-indicator-bottom {
				height: ${bottomToolbarGap + cellBottomMargin - 6}px;
				background-color: var(--vscode-notebook-symbolHighlightBackground) !important;
			}
		`);
    styleSheets.push(`
			.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .input-collapse-container .cell-collapse-preview {
				line-height: ${collapsedIndicatorHeight}px;
			}

			.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .input-collapse-container .cell-collapse-preview .monaco-tokenized-source {
				max-height: ${collapsedIndicatorHeight}px;
			}
		`);
    styleSheets.push(
      `.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .monaco-toolbar { height: ${bottomToolbarHeight}px }`
    );
    styleSheets.push(
      `.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .view-zones .cell-list-top-cell-toolbar-container .monaco-toolbar { height: ${bottomToolbarHeight}px }`
    );
    styleSheets.push(`.monaco-workbench .notebookOverlay.cell-title-toolbar-right > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			right: ${cellRightMargin + 26}px;
		}
		.monaco-workbench .notebookOverlay.cell-title-toolbar-left > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			left: ${getCellEditorContainerLeftMargin + 16}px;
		}
		.monaco-workbench .notebookOverlay.cell-title-toolbar-hidden > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			display: none;
		}`);
    styleSheets.push(`
		.monaco-workbench .notebookOverlay .output > div.foreground.output-inner-container {
			padding: ${OutputInnerContainerTopPadding}px 8px;
		}
		.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .output-collapse-container {
			padding: ${OutputInnerContainerTopPadding}px 8px;
		}
		`);
    styleSheets.push(`
		.monaco-workbench .notebookOverlay .cell-chat-part {
			margin: 0 ${cellRightMargin}px 6px 4px;
		}
		`);
    this._styleElement.textContent = styleSheets.join("\n");
  }
  _createCellList() {
    this._body.classList.add("cell-list-container");
    this._dndController = this._register(
      new CellDragAndDropController(this, this._body)
    );
    const getScopedContextKeyService = (container) => this._list.contextKeyService.createScoped(container);
    this._editorPool = this._register(
      this.instantiationService.createInstance(
        NotebookCellEditorPool,
        this,
        getScopedContextKeyService
      )
    );
    const renderers = [
      this.instantiationService.createInstance(
        CodeCellRenderer,
        this,
        this._renderedEditors,
        this._editorPool,
        this._dndController,
        getScopedContextKeyService
      ),
      this.instantiationService.createInstance(
        MarkupCellRenderer,
        this,
        this._dndController,
        this._renderedEditors,
        getScopedContextKeyService
      )
    ];
    renderers.forEach((renderer) => {
      this._register(renderer);
    });
    this._listDelegate = this.instantiationService.createInstance(
      NotebookCellListDelegate,
      DOM.getWindow(this.getDomNode())
    );
    this._register(this._listDelegate);
    const accessibilityProvider = new NotebookAccessibilityProvider(
      this.notebookExecutionStateService,
      () => this.viewModel,
      this.keybindingService,
      this.configurationService
    );
    this._register(accessibilityProvider);
    this._list = this.instantiationService.createInstance(
      NotebookCellList,
      "NotebookCellList",
      this._body,
      this._viewContext.notebookOptions,
      this._listDelegate,
      renderers,
      this.scopedContextKeyService,
      {
        setRowLineHeight: false,
        setRowHeight: false,
        supportDynamicHeights: true,
        horizontalScrolling: false,
        keyboardSupport: false,
        mouseSupport: true,
        multipleSelectionSupport: true,
        selectionNavigation: true,
        typeNavigationEnabled: true,
        paddingTop: 0,
        paddingBottom: 0,
        transformOptimization: false,
        //(isMacintosh && isNative) || getTitleBarStyle(this.configurationService, this.environmentService) === 'native',
        initialSize: this._dimension,
        styleController: (_suffix) => {
          return this._list;
        },
        overrideStyles: {
          listBackground: notebookEditorBackground,
          listActiveSelectionBackground: notebookEditorBackground,
          listActiveSelectionForeground: foreground,
          listFocusAndSelectionBackground: notebookEditorBackground,
          listFocusAndSelectionForeground: foreground,
          listFocusBackground: notebookEditorBackground,
          listFocusForeground: foreground,
          listHoverForeground: foreground,
          listHoverBackground: notebookEditorBackground,
          listHoverOutline: focusBorder,
          listFocusOutline: focusBorder,
          listInactiveSelectionBackground: notebookEditorBackground,
          listInactiveSelectionForeground: foreground,
          listInactiveFocusBackground: notebookEditorBackground,
          listInactiveFocusOutline: notebookEditorBackground
        },
        accessibilityProvider
      }
    );
    this._dndController.setList(this._list);
    this._register(this._list);
    this._listViewInfoAccessor = new ListViewInfoAccessor(this._list);
    this._register(this._listViewInfoAccessor);
    this._register(combinedDisposable(...renderers));
    this._listTopCellToolbar = this._register(
      this.instantiationService.createInstance(
        ListTopCellToolbar,
        this,
        this.notebookOptions
      )
    );
    this._webviewTransparentCover = DOM.append(
      this._list.rowsContainer,
      $(".webview-cover")
    );
    this._webviewTransparentCover.style.display = "none";
    this._register(
      DOM.addStandardDisposableGenericMouseDownListener(
        this._overlayContainer,
        (e) => {
          if (e.target.classList.contains("slider") && this._webviewTransparentCover) {
            this._webviewTransparentCover.style.display = "block";
          }
        }
      )
    );
    this._register(
      DOM.addStandardDisposableGenericMouseUpListener(
        this._overlayContainer,
        () => {
          if (this._webviewTransparentCover) {
            this._webviewTransparentCover.style.display = "none";
          }
        }
      )
    );
    this._register(
      this._list.onMouseDown((e) => {
        if (e.element) {
          this._onMouseDown.fire({
            event: e.browserEvent,
            target: e.element
          });
        }
      })
    );
    this._register(
      this._list.onMouseUp((e) => {
        if (e.element) {
          this._onMouseUp.fire({
            event: e.browserEvent,
            target: e.element
          });
        }
      })
    );
    this._register(
      this._list.onDidChangeFocus((_e) => {
        this._onDidChangeActiveEditor.fire(this);
        this._onDidChangeActiveCell.fire();
        this._onDidChangeFocus.fire();
        this._cursorNavMode.set(false);
      })
    );
    this._register(
      this._list.onContextMenu((e) => {
        this.showListContextMenu(e);
      })
    );
    this._register(
      this._list.onDidChangeVisibleRanges(() => {
        this._onDidChangeVisibleRanges.fire();
      })
    );
    this._register(
      this._list.onDidScroll((e) => {
        if (e.scrollTop !== e.oldScrollTop) {
          this._onDidScroll.fire();
          this.clearActiveCellWidgets();
        }
      })
    );
    this._focusTracker = this._register(DOM.trackFocus(this.getDomNode()));
    this._register(
      this._focusTracker.onDidBlur(() => {
        this._editorFocus.set(false);
        this.viewModel?.setEditorFocus(false);
        this._onDidBlurEmitter.fire();
      })
    );
    this._register(
      this._focusTracker.onDidFocus(() => {
        this._editorFocus.set(true);
        this.viewModel?.setEditorFocus(true);
        this._onDidFocusEmitter.fire();
      })
    );
    this._registerNotebookActionsToolbar();
    this._registerNotebookStickyScroll();
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(
          AccessibilityVerbositySettingId.Notebook
        )) {
          this._list.ariaLabel = accessibilityProvider?.getWidgetAriaLabel();
        }
      })
    );
  }
  showListContextMenu(e) {
    this.contextMenuService.showContextMenu({
      menuId: MenuId.NotebookCellTitle,
      contextKeyService: this.scopedContextKeyService,
      getAnchor: () => e.anchor
    });
  }
  _registerNotebookOverviewRuler() {
    this._notebookOverviewRuler = this._register(
      this.instantiationService.createInstance(
        NotebookOverviewRuler,
        this,
        this._notebookOverviewRulerContainer
      )
    );
  }
  _registerNotebookActionsToolbar() {
    this._notebookTopToolbar = this._register(
      this.instantiationService.createInstance(
        NotebookEditorWorkbenchToolbar,
        this,
        this.scopedContextKeyService,
        this._notebookOptions,
        this._notebookTopToolbarContainer
      )
    );
    this._register(
      this._notebookTopToolbar.onDidChangeVisibility(() => {
        if (this._dimension && this._isVisible) {
          this.layout(this._dimension);
        }
      })
    );
  }
  _registerNotebookStickyScroll() {
    this._notebookStickyScroll = this._register(
      this.instantiationService.createInstance(
        NotebookStickyScroll,
        this._notebookStickyScrollContainer,
        this,
        this._list,
        (sizeDelta) => {
          if (this.isDisposed) {
            return;
          }
          if (this._dimension && this._isVisible) {
            if (sizeDelta > 0) {
              this.layout(this._dimension);
              this.setScrollTop(this.scrollTop + sizeDelta);
            } else if (sizeDelta < 0) {
              this.setScrollTop(this.scrollTop + sizeDelta);
              this.layout(this._dimension);
            }
          }
          this._onDidScroll.fire();
        }
      )
    );
  }
  _updateOutputRenderers() {
    if (!this.viewModel || !this._webview) {
      return;
    }
    this._webview.updateOutputRenderers();
    this.viewModel.viewCells.forEach((cell) => {
      cell.outputsViewModels.forEach((output) => {
        if (output.pickedMimeType?.rendererId === RENDERER_NOT_AVAILABLE) {
          output.resetRenderer();
        }
      });
    });
  }
  getDomNode() {
    return this._overlayContainer;
  }
  getOverflowContainerDomNode() {
    return this._overflowContainer;
  }
  getInnerWebview() {
    return this._webview?.webview;
  }
  setEditorProgressService(editorProgressService) {
    this.editorProgressService = editorProgressService;
  }
  setParentContextKeyService(parentContextKeyService) {
    this.scopedContextKeyService.updateParent(parentContextKeyService);
  }
  async setModel(textModel, viewState, perf) {
    if (this.viewModel === void 0 || !this.viewModel.equal(textModel)) {
      const oldBottomToolbarDimensions = this._notebookOptions.computeBottomToolbarDimensions(
        this.viewModel?.viewType
      );
      this._detachModel();
      await this._attachModel(textModel, viewState, perf);
      const newBottomToolbarDimensions = this._notebookOptions.computeBottomToolbarDimensions(
        this.viewModel?.viewType
      );
      if (oldBottomToolbarDimensions.bottomToolbarGap !== newBottomToolbarDimensions.bottomToolbarGap || oldBottomToolbarDimensions.bottomToolbarHeight !== newBottomToolbarDimensions.bottomToolbarHeight) {
        this._styleElement?.remove();
        this._createLayoutStyles();
        this._webview?.updateOptions({
          ...this.notebookOptions.computeWebviewOptions(),
          fontFamily: this._generateFontFamily()
        });
      }
      this.telemetryService.publicLog2("notebook/editorOpened", {
        scheme: textModel.uri.scheme,
        ext: extname(textModel.uri),
        viewType: textModel.viewType
      });
    } else {
      this.restoreListViewState(viewState);
    }
    this._restoreSelectedKernel(viewState);
    this._loadKernelPreloads();
    this._dndController?.clearGlobalDragState();
    this._localStore.add(
      this._list.onDidChangeFocus(() => {
        this.updateContextKeysOnFocusChange();
      })
    );
    this.updateContextKeysOnFocusChange();
    this._backgroundMarkdownRendering();
  }
  _backgroundMarkdownRenderRunning = false;
  _backgroundMarkdownRendering() {
    if (this._backgroundMarkdownRenderRunning) {
      return;
    }
    this._backgroundMarkdownRenderRunning = true;
    DOM.runWhenWindowIdle(DOM.getWindow(this.getDomNode()), (deadline) => {
      this._backgroundMarkdownRenderingWithDeadline(deadline);
    });
  }
  _backgroundMarkdownRenderingWithDeadline(deadline) {
    const endTime = Date.now() + deadline.timeRemaining();
    const execute = () => {
      try {
        this._backgroundMarkdownRenderRunning = true;
        if (this._isDisposed) {
          return;
        }
        if (!this.viewModel) {
          return;
        }
        const firstMarkupCell = this.viewModel.viewCells.find(
          (cell) => cell.cellKind === CellKind.Markup && !this._webview?.markupPreviewMapping.has(cell.id) && !this.cellIsHidden(cell)
        );
        if (!firstMarkupCell) {
          return;
        }
        this.createMarkupPreview(firstMarkupCell);
      } finally {
        this._backgroundMarkdownRenderRunning = false;
      }
      if (Date.now() < endTime) {
        setTimeout0(execute);
      } else {
        this._backgroundMarkdownRendering();
      }
    };
    execute();
  }
  updateContextKeysOnFocusChange() {
    if (!this.viewModel) {
      return;
    }
    const focused = this._list.getFocusedElements()[0];
    if (focused) {
      if (!this._cellContextKeyManager) {
        this._cellContextKeyManager = this._localStore.add(
          this.instantiationService.createInstance(
            CellContextKeyManager,
            this,
            focused
          )
        );
      }
      this._cellContextKeyManager.updateForElement(
        focused
      );
    }
  }
  async setOptions(options) {
    if (options?.isReadOnly !== void 0) {
      this._readOnly = options?.isReadOnly;
    }
    if (!this.viewModel) {
      return;
    }
    this.viewModel.updateOptions({ isReadOnly: this._readOnly });
    this.notebookOptions.updateOptions(this._readOnly);
    const cellOptions = options?.cellOptions ?? this._parseIndexedCellOptions(options);
    if (cellOptions) {
      const cell = this.viewModel.viewCells.find(
        (cell2) => cell2.uri.toString() === cellOptions.resource.toString()
      );
      if (cell) {
        this.focusElement(cell);
        const selection = cellOptions.options?.selection;
        if (selection) {
          cell.updateEditState(CellEditState.Editing, "setOptions");
          cell.focusMode = CellFocusMode.Editor;
          await this.revealRangeInCenterIfOutsideViewportAsync(
            cell,
            new Range(
              selection.startLineNumber,
              selection.startColumn,
              selection.endLineNumber || selection.startLineNumber,
              selection.endColumn || selection.startColumn
            )
          );
        } else {
          this._list.revealCell(
            cell,
            options?.cellRevealType ?? CellRevealType.CenterIfOutsideViewport
          );
        }
        const editor = this._renderedEditors.get(cell);
        if (editor) {
          if (cellOptions.options?.selection) {
            const { selection: selection2 } = cellOptions.options;
            const editorSelection = new Range(
              selection2.startLineNumber,
              selection2.startColumn,
              selection2.endLineNumber || selection2.startLineNumber,
              selection2.endColumn || selection2.startColumn
            );
            editor.setSelection(editorSelection);
            editor.revealPositionInCenterIfOutsideViewport({
              lineNumber: selection2.startLineNumber,
              column: selection2.startColumn
            });
            await this.revealRangeInCenterIfOutsideViewportAsync(
              cell,
              editorSelection
            );
          }
          if (!cellOptions.options?.preserveFocus) {
            editor.focus();
          }
        }
      }
    }
    if (options?.cellSelections) {
      const focusCellIndex = options.cellSelections[0].start;
      const focusedCell = this.viewModel.cellAt(focusCellIndex);
      if (focusedCell) {
        this.viewModel.updateSelectionsState({
          kind: SelectionStateType.Index,
          focus: { start: focusCellIndex, end: focusCellIndex + 1 },
          selections: options.cellSelections
        });
        this.revealInCenterIfOutsideViewport(focusedCell);
      }
    }
    this._updateForOptions();
    this._onDidChangeOptions.fire();
  }
  _parseIndexedCellOptions(options) {
    if (options?.indexedCellOptions) {
      const cell = this.cellAt(options.indexedCellOptions.index);
      if (cell) {
        return {
          resource: cell.uri,
          options: {
            selection: options.indexedCellOptions.selection,
            preserveFocus: false
          }
        };
      }
    }
    return void 0;
  }
  _detachModel() {
    this._localStore.clear();
    dispose(this._localCellStateListeners);
    this._list.detachViewModel();
    this.viewModel?.dispose();
    this.viewModel = void 0;
    this._webview?.dispose();
    this._webview?.element.remove();
    this._webview = null;
    this._list.clear();
  }
  _updateForOptions() {
    if (!this.viewModel) {
      return;
    }
    this._editorEditable.set(!this.viewModel.options.isReadOnly);
    this._overflowContainer.classList.toggle(
      "notebook-editor-editable",
      !this.viewModel.options.isReadOnly
    );
    this.getDomNode().classList.toggle(
      "notebook-editor-editable",
      !this.viewModel.options.isReadOnly
    );
  }
  async _resolveWebview() {
    if (!this.textModel) {
      return null;
    }
    if (this._webviewResolvePromise) {
      return this._webviewResolvePromise;
    }
    if (!this._webview) {
      this._ensureWebview(
        this.getId(),
        this.textModel.viewType,
        this.textModel.uri
      );
    }
    this._webviewResolvePromise = (async () => {
      if (!this._webview) {
        throw new Error(
          "Notebook output webview object is not created successfully."
        );
      }
      await this._webview.createWebview(
        this.creationOptions.codeWindow ?? mainWindow
      );
      if (!this._webview.webview) {
        throw new Error(
          "Notebook output webview element was not created successfully."
        );
      }
      this._localStore.add(
        this._webview.webview.onDidBlur(() => {
          this._outputFocus.set(false);
          this._webviewFocused = false;
          this.updateEditorFocus();
          this.updateCellFocusMode();
        })
      );
      this._localStore.add(
        this._webview.webview.onDidFocus(() => {
          this._outputFocus.set(true);
          this.updateEditorFocus();
          this._webviewFocused = true;
        })
      );
      this._localStore.add(
        this._webview.onMessage((e) => {
          this._onDidReceiveMessage.fire(e);
        })
      );
      return this._webview;
    })();
    return this._webviewResolvePromise;
  }
  _ensureWebview(id, viewType, resource) {
    if (this._webview) {
      return;
    }
    const that = this;
    this._webview = this.instantiationService.createInstance(
      BackLayerWebView,
      {
        get creationOptions() {
          return that.creationOptions;
        },
        setScrollTop(scrollTop) {
          that._list.scrollTop = scrollTop;
        },
        triggerScroll(event) {
          that._list.triggerScrollFromMouseWheelEvent(event);
        },
        getCellByInfo: that.getCellByInfo.bind(that),
        getCellById: that._getCellById.bind(that),
        toggleNotebookCellSelection: that._toggleNotebookCellSelection.bind(that),
        focusNotebookCell: that.focusNotebookCell.bind(that),
        focusNextNotebookCell: that.focusNextNotebookCell.bind(that),
        updateOutputHeight: that._updateOutputHeight.bind(that),
        scheduleOutputHeightAck: that._scheduleOutputHeightAck.bind(that),
        updateMarkupCellHeight: that._updateMarkupCellHeight.bind(that),
        setMarkupCellEditState: that._setMarkupCellEditState.bind(that),
        didStartDragMarkupCell: that._didStartDragMarkupCell.bind(that),
        didDragMarkupCell: that._didDragMarkupCell.bind(that),
        didDropMarkupCell: that._didDropMarkupCell.bind(that),
        didEndDragMarkupCell: that._didEndDragMarkupCell.bind(that),
        didResizeOutput: that._didResizeOutput.bind(that),
        updatePerformanceMetadata: that._updatePerformanceMetadata.bind(that),
        didFocusOutputInputChange: that._didFocusOutputInputChange.bind(that)
      },
      id,
      viewType,
      resource,
      {
        ...this._notebookOptions.computeWebviewOptions(),
        fontFamily: this._generateFontFamily()
      },
      this.notebookRendererMessaging.getScoped(this._uuid)
    );
    this._webview.element.style.width = "100%";
    this._list.attachWebview(this._webview.element);
  }
  async _attachModel(textModel, viewState, perf) {
    this._ensureWebview(this.getId(), textModel.viewType, textModel.uri);
    this.viewModel = this.instantiationService.createInstance(
      NotebookViewModel,
      textModel.viewType,
      textModel,
      this._viewContext,
      this.getLayoutInfo(),
      { isReadOnly: this._readOnly, inRepl: this._inRepl }
    );
    this._viewContext.eventDispatcher.emit([
      new NotebookLayoutChangedEvent(
        { width: true, fontInfo: true },
        this.getLayoutInfo()
      )
    ]);
    this.notebookOptions.updateOptions(this._readOnly);
    this._updateForOptions();
    this._updateForNotebookConfiguration();
    {
      this.viewModel.restoreEditorViewState(viewState);
      const contributionsState = viewState?.contributionsState || {};
      for (const [id, contribution] of this._contributions) {
        if (typeof contribution.restoreViewState === "function") {
          contribution.restoreViewState(contributionsState[id]);
        }
      }
    }
    this._localStore.add(
      this.viewModel.onDidChangeViewCells((e) => {
        this._onDidChangeViewCells.fire(e);
      })
    );
    this._localStore.add(
      this.viewModel.onDidChangeSelection(() => {
        this._onDidChangeSelection.fire();
        this.updateSelectedMarkdownPreviews();
      })
    );
    this._localStore.add(
      this._list.onWillScroll((e) => {
        if (this._webview?.isResolved()) {
          this._webviewTransparentCover.style.transform = `translateY(${e.scrollTop})`;
        }
      })
    );
    let hasPendingChangeContentHeight = false;
    this._localStore.add(
      this._list.onDidChangeContentHeight(() => {
        if (hasPendingChangeContentHeight) {
          return;
        }
        hasPendingChangeContentHeight = true;
        this._localStore.add(
          DOM.scheduleAtNextAnimationFrame(
            DOM.getWindow(this.getDomNode()),
            () => {
              hasPendingChangeContentHeight = false;
              this._updateScrollHeight();
            },
            100
          )
        );
      })
    );
    this._localStore.add(
      this._list.onDidRemoveOutputs((outputs) => {
        outputs.forEach((output) => this.removeInset(output));
      })
    );
    this._localStore.add(
      this._list.onDidHideOutputs((outputs) => {
        outputs.forEach((output) => this.hideInset(output));
      })
    );
    this._localStore.add(
      this._list.onDidRemoveCellsFromView((cells) => {
        const hiddenCells = [];
        const deletedCells = [];
        for (const cell of cells) {
          if (cell.cellKind === CellKind.Markup) {
            const mdCell = cell;
            if (this.viewModel?.viewCells.find(
              (cell2) => cell2.handle === mdCell.handle
            )) {
              hiddenCells.push(mdCell);
            } else {
              deletedCells.push(mdCell);
            }
          }
        }
        this.hideMarkupPreviews(hiddenCells);
        this.deleteMarkupPreviews(deletedCells);
      })
    );
    await this._warmupWithMarkdownRenderer(this.viewModel, viewState, perf);
    perf?.mark("customMarkdownLoaded");
    this._localCellStateListeners = this.viewModel.viewCells.map(
      (cell) => this._bindCellListener(cell)
    );
    this._lastCellWithEditorFocus = this.viewModel.viewCells.find(
      (viewCell) => this.getActiveCell() === viewCell && viewCell.focusMode === CellFocusMode.Editor
    ) ?? null;
    this._localStore.add(
      this.viewModel.onDidChangeViewCells((e) => {
        if (this._isDisposed) {
          return;
        }
        [...e.splices].reverse().forEach((splice) => {
          const [start, deleted, newCells] = splice;
          const deletedCells = this._localCellStateListeners.splice(
            start,
            deleted,
            ...newCells.map((cell) => this._bindCellListener(cell))
          );
          dispose(deletedCells);
        });
        if (e.splices.some(
          (s) => s[2].some((cell) => cell.cellKind === CellKind.Markup)
        )) {
          this._backgroundMarkdownRendering();
        }
      })
    );
    if (this._dimension) {
      this._list.layout(
        this.getBodyHeight(this._dimension.height),
        this._dimension.width
      );
    } else {
      this._list.layout();
    }
    this._dndController?.clearGlobalDragState();
    this.restoreListViewState(viewState);
  }
  _bindCellListener(cell) {
    const store = new DisposableStore();
    store.add(
      cell.onDidChangeLayout((e) => {
        if (e.totalHeight || e.outerWidth) {
          this.layoutNotebookCell(
            cell,
            cell.layoutInfo.totalHeight,
            e.context
          );
        }
      })
    );
    if (cell.cellKind === CellKind.Code) {
      store.add(
        cell.onDidRemoveOutputs((outputs) => {
          outputs.forEach((output) => this.removeInset(output));
        })
      );
    }
    store.add(
      cell.onDidChangeState((e) => {
        if (e.inputCollapsedChanged && cell.isInputCollapsed && cell.cellKind === CellKind.Markup) {
          this.hideMarkupPreviews([cell]);
        }
        if (e.outputCollapsedChanged && cell.isOutputCollapsed && cell.cellKind === CellKind.Code) {
          cell.outputsViewModels.forEach(
            (output) => this.hideInset(output)
          );
        }
        if (e.focusModeChanged) {
          this._validateCellFocusMode(cell);
        }
      })
    );
    return store;
  }
  _lastCellWithEditorFocus = null;
  _validateCellFocusMode(cell) {
    if (cell.focusMode !== CellFocusMode.Editor) {
      return;
    }
    if (this._lastCellWithEditorFocus && this._lastCellWithEditorFocus !== cell) {
      this._lastCellWithEditorFocus.focusMode = CellFocusMode.Container;
    }
    this._lastCellWithEditorFocus = cell;
  }
  async _warmupWithMarkdownRenderer(viewModel, viewState, perf) {
    this.logService.debug(
      "NotebookEditorWidget",
      "warmup " + this.viewModel?.uri.toString()
    );
    await this._resolveWebview();
    perf?.mark("webviewCommLoaded");
    this.logService.debug(
      "NotebookEditorWidget",
      "warmup - webview resolved"
    );
    this._webview.element.style.visibility = "hidden";
    await this._warmupViewportMarkdownCells(viewModel, viewState);
    this.logService.debug(
      "NotebookEditorWidget",
      "warmup - viewport warmed up"
    );
    this._list.layout(0, 0);
    this._list.attachViewModel(viewModel);
    this._list.scrollTop = viewState?.scrollPosition?.top ?? 0;
    this._debug("finish initial viewport warmup and view state restore.");
    this._webview.element.style.visibility = "visible";
    this.logService.debug(
      "NotebookEditorWidget",
      "warmup - list view model attached, set to visible"
    );
    this._onDidAttachViewModel.fire();
  }
  async _warmupViewportMarkdownCells(viewModel, viewState) {
    if (viewState && viewState.cellTotalHeights) {
      const totalHeightCache = viewState.cellTotalHeights;
      const scrollTop = viewState.scrollPosition?.top ?? 0;
      const scrollBottom = scrollTop + Math.max(this._dimension?.height ?? 0, 1080);
      let offset = 0;
      const requests = [];
      for (let i = 0; i < viewModel.length; i++) {
        const cell = viewModel.cellAt(i);
        const cellHeight = totalHeightCache[i] ?? 0;
        if (offset + cellHeight < scrollTop) {
          offset += cellHeight;
          continue;
        }
        if (cell.cellKind === CellKind.Markup) {
          requests.push([cell, offset]);
        }
        offset += cellHeight;
        if (offset > scrollBottom) {
          break;
        }
      }
      await this._webview.initializeMarkup(
        requests.map(
          ([model, offset2]) => this.createMarkupCellInitialization(model, offset2)
        )
      );
    } else {
      const initRequests = viewModel.viewCells.filter((cell) => cell.cellKind === CellKind.Markup).slice(0, 5).map(
        (cell) => this.createMarkupCellInitialization(cell, -1e4)
      );
      await this._webview.initializeMarkup(initRequests);
      let offset = 0;
      const offsetUpdateRequests = [];
      const scrollBottom = Math.max(this._dimension?.height ?? 0, 1080);
      for (const cell of viewModel.viewCells) {
        if (cell.cellKind === CellKind.Markup) {
          offsetUpdateRequests.push({ id: cell.id, top: offset });
        }
        offset += cell.getHeight(
          this.getLayoutInfo().fontInfo.lineHeight
        );
        if (offset > scrollBottom) {
          break;
        }
      }
      this._webview?.updateScrollTops([], offsetUpdateRequests);
    }
  }
  createMarkupCellInitialization(model, offset) {
    return {
      mime: model.mime,
      cellId: model.id,
      cellHandle: model.handle,
      content: model.getText(),
      offset,
      visible: false,
      metadata: model.metadata
    };
  }
  restoreListViewState(viewState) {
    if (!this.viewModel) {
      return;
    }
    if (viewState?.scrollPosition !== void 0) {
      this._list.scrollTop = viewState.scrollPosition.top;
      this._list.scrollLeft = viewState.scrollPosition.left;
    } else {
      this._list.scrollTop = 0;
      this._list.scrollLeft = 0;
    }
    const focusIdx = typeof viewState?.focus === "number" ? viewState.focus : 0;
    if (focusIdx < this.viewModel.length) {
      const element = this.viewModel.cellAt(focusIdx);
      if (element) {
        this.viewModel?.updateSelectionsState({
          kind: SelectionStateType.Handle,
          primary: element.handle,
          selections: [element.handle]
        });
      }
    } else if (this._list.length > 0) {
      this.viewModel.updateSelectionsState({
        kind: SelectionStateType.Index,
        focus: { start: 0, end: 1 },
        selections: [{ start: 0, end: 1 }]
      });
    }
    if (viewState?.editorFocused) {
      const cell = this.viewModel.cellAt(focusIdx);
      if (cell) {
        cell.focusMode = CellFocusMode.Editor;
      }
    }
  }
  _restoreSelectedKernel(viewState) {
    if (viewState?.selectedKernelId && this.textModel) {
      const matching = this.notebookKernelService.getMatchingKernel(
        this.textModel
      );
      const kernel = matching.all.find(
        (k) => k.id === viewState.selectedKernelId
      );
      if (kernel && !matching.selected) {
        this.notebookKernelService.selectKernelForNotebook(
          kernel,
          this.textModel
        );
      }
    }
  }
  getEditorViewState() {
    const state = this.viewModel?.getEditorViewState();
    if (!state) {
      return {
        editingCells: {},
        cellLineNumberStates: {},
        editorViewStates: {},
        collapsedInputCells: {},
        collapsedOutputCells: {}
      };
    }
    if (this._list) {
      state.scrollPosition = {
        left: this._list.scrollLeft,
        top: this._list.scrollTop
      };
      const cellHeights = {};
      for (let i = 0; i < this.viewModel.length; i++) {
        const elm = this.viewModel.cellAt(i);
        cellHeights[i] = elm.layoutInfo.totalHeight;
      }
      state.cellTotalHeights = cellHeights;
      if (this.viewModel) {
        const focusRange = this.viewModel.getFocus();
        const element = this.viewModel.cellAt(focusRange.start);
        if (element) {
          const itemDOM = this._list.domElementOfElement(element);
          const editorFocused = element.getEditState() === CellEditState.Editing && !!(itemDOM && itemDOM.ownerDocument.activeElement && itemDOM.contains(
            itemDOM.ownerDocument.activeElement
          ));
          state.editorFocused = editorFocused;
          state.focus = focusRange.start;
        }
      }
    }
    const contributionsState = {};
    for (const [id, contribution] of this._contributions) {
      if (typeof contribution.saveViewState === "function") {
        contributionsState[id] = contribution.saveViewState();
      }
    }
    state.contributionsState = contributionsState;
    if (this.textModel?.uri.scheme === Schemas.untitled) {
      state.selectedKernelId = this.activeKernel?.id;
    }
    return state;
  }
  _allowScrollBeyondLastLine() {
    return this._scrollBeyondLastLine && !this.isEmbedded;
  }
  getBodyHeight(dimensionHeight) {
    return Math.max(
      dimensionHeight - (this._notebookTopToolbar?.useGlobalToolbar ? (
        /** Toolbar height */
        26
      ) : 0),
      0
    );
  }
  layout(dimension, shadowElement, position) {
    if (!shadowElement && this._shadowElementViewInfo === null) {
      this._dimension = dimension;
      this._position = position;
      return;
    }
    if (dimension.width <= 0 || dimension.height <= 0) {
      this.onWillHide();
      return;
    }
    const whenContainerStylesLoaded = this.layoutService.whenContainerStylesLoaded(
      DOM.getWindow(this.getDomNode())
    );
    if (whenContainerStylesLoaded) {
      whenContainerStylesLoaded.then(
        () => this.layoutNotebook(dimension, shadowElement, position)
      );
    } else {
      this.layoutNotebook(dimension, shadowElement, position);
    }
  }
  layoutNotebook(dimension, shadowElement, position) {
    if (shadowElement) {
      this.updateShadowElement(shadowElement, dimension, position);
    }
    if (this._shadowElementViewInfo && this._shadowElementViewInfo.width <= 0 && this._shadowElementViewInfo.height <= 0) {
      this.onWillHide();
      return;
    }
    this._dimension = dimension;
    this._position = position;
    const newBodyHeight = this.getBodyHeight(dimension.height) - this.getLayoutInfo().stickyHeight;
    DOM.size(this._body, dimension.width, newBodyHeight);
    const newCellListHeight = newBodyHeight;
    if (this._list.getRenderHeight() < newCellListHeight) {
      this._list.updateOptions({
        paddingBottom: this._allowScrollBeyondLastLine() ? Math.max(0, newCellListHeight - 50) : 0,
        paddingTop: 0
      });
      this._list.layout(newCellListHeight, dimension.width);
    } else {
      this._list.layout(newCellListHeight, dimension.width);
      this._list.updateOptions({
        paddingBottom: this._allowScrollBeyondLastLine() ? Math.max(0, newCellListHeight - 50) : 0,
        paddingTop: 0
      });
    }
    this._overlayContainer.inert = false;
    this._overlayContainer.style.visibility = "visible";
    this._overlayContainer.style.display = "block";
    this._overlayContainer.style.position = "absolute";
    this._overlayContainer.style.overflow = "hidden";
    this.layoutContainerOverShadowElement(dimension, position);
    if (this._webviewTransparentCover) {
      this._webviewTransparentCover.style.height = `${dimension.height}px`;
      this._webviewTransparentCover.style.width = `${dimension.width}px`;
    }
    this._notebookTopToolbar.layout(this._dimension);
    this._notebookOverviewRuler.layout();
    this._viewContext?.eventDispatcher.emit([
      new NotebookLayoutChangedEvent(
        { width: true, fontInfo: true },
        this.getLayoutInfo()
      )
    ]);
  }
  updateShadowElement(shadowElement, dimension, position) {
    this._shadowElement = shadowElement;
    if (dimension && position) {
      this._shadowElementViewInfo = {
        height: dimension.height,
        width: dimension.width,
        top: position.top,
        left: position.left
      };
    } else {
      const containerRect = shadowElement.getBoundingClientRect();
      this._shadowElementViewInfo = {
        height: containerRect.height,
        width: containerRect.width,
        top: containerRect.top,
        left: containerRect.left
      };
    }
  }
  layoutContainerOverShadowElement(dimension, position) {
    if (dimension && position) {
      this._overlayContainer.style.top = `${position.top}px`;
      this._overlayContainer.style.left = `${position.left}px`;
      this._overlayContainer.style.width = `${dimension.width}px`;
      this._overlayContainer.style.height = `${dimension.height}px`;
      return;
    }
    if (!this._shadowElementViewInfo) {
      return;
    }
    const elementContainerRect = this._overlayContainer.parentElement?.getBoundingClientRect();
    this._overlayContainer.style.top = `${this._shadowElementViewInfo.top - (elementContainerRect?.top || 0)}px`;
    this._overlayContainer.style.left = `${this._shadowElementViewInfo.left - (elementContainerRect?.left || 0)}px`;
    this._overlayContainer.style.width = `${dimension ? dimension.width : this._shadowElementViewInfo.width}px`;
    this._overlayContainer.style.height = `${dimension ? dimension.height : this._shadowElementViewInfo.height}px`;
  }
  //#endregion
  //#region Focus tracker
  focus() {
    this._isVisible = true;
    this._editorFocus.set(true);
    if (this._webviewFocused) {
      this._webview?.focusWebview();
    } else {
      if (this.viewModel) {
        const focusRange = this.viewModel.getFocus();
        const element = this.viewModel.cellAt(focusRange.start);
        if (!this.hasEditorFocus()) {
          this.focusContainer();
          this.updateEditorFocus();
        }
        if (element && element.focusMode === CellFocusMode.Editor) {
          element.updateEditState(
            CellEditState.Editing,
            "editorWidget.focus"
          );
          element.focusMode = CellFocusMode.Editor;
          this.focusEditor(element);
          return;
        }
      }
      this._list.domFocus();
    }
    if (this._currentProgress) {
      this.showProgress();
    }
  }
  onShow() {
    this._isVisible = true;
  }
  focusEditor(activeElement) {
    for (const [element, editor] of this._renderedEditors.entries()) {
      if (element === activeElement) {
        editor.focus();
        return;
      }
    }
  }
  focusContainer(clearSelection = false) {
    if (this._webviewFocused) {
      this._webview?.focusWebview();
    } else {
      this._list.focusContainer(clearSelection);
    }
  }
  selectOutputContent(cell) {
    this._webview?.selectOutputContents(cell);
  }
  selectInputContents(cell) {
    this._webview?.selectInputContents(cell);
  }
  onWillHide() {
    this._isVisible = false;
    this._editorFocus.set(false);
    this._overlayContainer.inert = true;
    this._overlayContainer.style.visibility = "hidden";
    this._overlayContainer.style.left = "-50000px";
    this._notebookTopToolbarContainer.style.display = "none";
    this.clearActiveCellWidgets();
  }
  clearActiveCellWidgets() {
    this._renderedEditors.forEach((editor, cell) => {
      if (this.getActiveCell() === cell && editor) {
        SuggestController.get(editor)?.cancelSuggestWidget();
        DropIntoEditorController.get(editor)?.clearWidgets();
        CopyPasteController.get(editor)?.clearWidgets();
      }
    });
  }
  editorHasDomFocus() {
    return DOM.isAncestorOfActiveElement(this.getDomNode());
  }
  updateEditorFocus() {
    this._focusTracker.refreshState();
    const focused = this.editorHasDomFocus();
    this._editorFocus.set(focused);
    this.viewModel?.setEditorFocus(focused);
  }
  updateCellFocusMode() {
    const activeCell = this.getActiveCell();
    if (activeCell?.focusMode === CellFocusMode.Output && !this._webviewFocused) {
      activeCell.focusMode = CellFocusMode.Container;
    }
  }
  hasEditorFocus() {
    this.updateEditorFocus();
    return this.editorHasDomFocus();
  }
  hasWebviewFocus() {
    return this._webviewFocused;
  }
  hasOutputTextSelection() {
    if (!this.hasEditorFocus()) {
      return false;
    }
    const windowSelection = DOM.getWindow(this.getDomNode()).getSelection();
    if (windowSelection?.rangeCount !== 1) {
      return false;
    }
    const activeSelection = windowSelection.getRangeAt(0);
    if (activeSelection.startContainer === activeSelection.endContainer && activeSelection.endOffset - activeSelection.startOffset === 0) {
      return false;
    }
    let container = activeSelection.commonAncestorContainer;
    if (!this._body.contains(container)) {
      return false;
    }
    while (container && container !== this._body) {
      if (container.classList && container.classList.contains("output")) {
        return true;
      }
      container = container.parentNode;
    }
    return false;
  }
  _didFocusOutputInputChange(hasFocus) {
    this._outputInputFocus.set(hasFocus);
  }
  //#endregion
  //#region Editor Features
  focusElement(cell) {
    this.viewModel?.updateSelectionsState({
      kind: SelectionStateType.Handle,
      primary: cell.handle,
      selections: [cell.handle]
    });
  }
  get scrollTop() {
    return this._list.scrollTop;
  }
  get scrollBottom() {
    return this._list.scrollTop + this._list.getRenderHeight();
  }
  getAbsoluteTopOfElement(cell) {
    return this._list.getCellViewScrollTop(cell);
  }
  getHeightOfElement(cell) {
    return this._list.elementHeight(cell);
  }
  scrollToBottom() {
    this._list.scrollToBottom();
  }
  setScrollTop(scrollTop) {
    this._list.scrollTop = scrollTop;
  }
  revealCellRangeInView(range) {
    return this._list.revealCells(range);
  }
  revealInView(cell) {
    return this._list.revealCell(cell, CellRevealType.Default);
  }
  revealInViewAtTop(cell) {
    this._list.revealCell(cell, CellRevealType.Top);
  }
  revealInCenter(cell) {
    this._list.revealCell(cell, CellRevealType.Center);
  }
  async revealInCenterIfOutsideViewport(cell) {
    await this._list.revealCell(
      cell,
      CellRevealType.CenterIfOutsideViewport
    );
  }
  async revealFirstLineIfOutsideViewport(cell) {
    await this._list.revealCell(
      cell,
      CellRevealType.FirstLineIfOutsideViewport
    );
  }
  async revealLineInViewAsync(cell, line) {
    return this._list.revealRangeInCell(
      cell,
      new Range(line, 1, line, 1),
      CellRevealRangeType.Default
    );
  }
  async revealLineInCenterAsync(cell, line) {
    return this._list.revealRangeInCell(
      cell,
      new Range(line, 1, line, 1),
      CellRevealRangeType.Center
    );
  }
  async revealLineInCenterIfOutsideViewportAsync(cell, line) {
    return this._list.revealRangeInCell(
      cell,
      new Range(line, 1, line, 1),
      CellRevealRangeType.CenterIfOutsideViewport
    );
  }
  async revealRangeInViewAsync(cell, range) {
    return this._list.revealRangeInCell(
      cell,
      range,
      CellRevealRangeType.Default
    );
  }
  async revealRangeInCenterAsync(cell, range) {
    return this._list.revealRangeInCell(
      cell,
      range,
      CellRevealRangeType.Center
    );
  }
  async revealRangeInCenterIfOutsideViewportAsync(cell, range) {
    return this._list.revealRangeInCell(
      cell,
      range,
      CellRevealRangeType.CenterIfOutsideViewport
    );
  }
  revealCellOffsetInCenter(cell, offset) {
    return this._list.revealCellOffsetInCenter(cell, offset);
  }
  revealOffsetInCenterIfOutsideViewport(offset) {
    return this._list.revealOffsetInCenterIfOutsideViewport(offset);
  }
  getViewIndexByModelIndex(index) {
    if (!this._listViewInfoAccessor) {
      return -1;
    }
    const cell = this.viewModel?.viewCells[index];
    if (!cell) {
      return -1;
    }
    return this._listViewInfoAccessor.getViewIndex(cell);
  }
  getViewHeight(cell) {
    if (!this._listViewInfoAccessor) {
      return -1;
    }
    return this._listViewInfoAccessor.getViewHeight(cell);
  }
  getCellRangeFromViewRange(startIndex, endIndex) {
    return this._listViewInfoAccessor.getCellRangeFromViewRange(
      startIndex,
      endIndex
    );
  }
  getCellsInRange(range) {
    return this._listViewInfoAccessor.getCellsInRange(range);
  }
  setCellEditorSelection(cell, range) {
    this._list.setCellEditorSelection(cell, range);
  }
  setHiddenAreas(_ranges) {
    return this._list.setHiddenAreas(_ranges, true);
  }
  getVisibleRangesPlusViewportAboveAndBelow() {
    return this._listViewInfoAccessor.getVisibleRangesPlusViewportAboveAndBelow();
  }
  //#endregion
  //#region Decorations
  deltaCellDecorations(oldDecorations, newDecorations) {
    const ret = this.viewModel?.deltaCellDecorations(
      oldDecorations,
      newDecorations
    ) || [];
    this._onDidChangeDecorations.fire();
    return ret;
  }
  deltaCellContainerClassNames(cellId, added, removed) {
    this._webview?.deltaCellContainerClassNames(cellId, added, removed);
  }
  changeModelDecorations(callback) {
    return this.viewModel?.changeModelDecorations(callback) || null;
  }
  //#endregion
  //#region View Zones
  changeViewZones(callback) {
    this._list.changeViewZones(callback);
  }
  //#endregion
  //#region Kernel/Execution
  async _loadKernelPreloads() {
    if (!this.hasModel()) {
      return;
    }
    const { selected } = this.notebookKernelService.getMatchingKernel(
      this.textModel
    );
    if (!this._webview?.isResolved()) {
      await this._resolveWebview();
    }
    this._webview?.updateKernelPreloads(selected);
  }
  get activeKernel() {
    return this.textModel && this.notebookKernelService.getSelectedOrSuggestedKernel(
      this.textModel
    );
  }
  async cancelNotebookCells(cells) {
    if (!this.viewModel || !this.hasModel()) {
      return;
    }
    if (!cells) {
      cells = this.viewModel.viewCells;
    }
    return this.notebookExecutionService.cancelNotebookCellHandles(
      this.textModel,
      Array.from(cells).map((cell) => cell.handle)
    );
  }
  async executeNotebookCells(cells) {
    if (!this.viewModel || !this.hasModel()) {
      this.logService.info(
        "notebookEditorWidget",
        "No NotebookViewModel, cannot execute cells"
      );
      return;
    }
    if (!cells) {
      cells = this.viewModel.viewCells;
    }
    return this.notebookExecutionService.executeNotebookCells(
      this.textModel,
      Array.from(cells).map((c) => c.model),
      this.scopedContextKeyService
    );
  }
  //#endregion
  //#region Cell operations/layout API
  _pendingLayouts = /* @__PURE__ */ new WeakMap();
  async layoutNotebookCell(cell, height, context) {
    this._debug("layout cell", cell.handle, height);
    const viewIndex = this._list.getViewIndex(cell);
    if (viewIndex === void 0) {
      return;
    }
    if (this._pendingLayouts?.has(cell)) {
      this._pendingLayouts?.get(cell).dispose();
    }
    const deferred = new DeferredPromise();
    const doLayout = () => {
      if (this._isDisposed) {
        return;
      }
      if (!this.viewModel?.hasCell(cell)) {
        return;
      }
      if (this._list.getViewIndex(cell) === void 0) {
        return;
      }
      if (this._list.elementHeight(cell) === height) {
        return;
      }
      this._pendingLayouts?.delete(cell);
      if (!this.hasEditorFocus()) {
        const cellIndex = this.viewModel?.getCellIndex(cell);
        const visibleRanges = this.visibleRanges;
        if (cellIndex !== void 0 && visibleRanges && visibleRanges.length && visibleRanges[0].start === cellIndex && // cell is partially visible
        this._list.scrollTop > this.getAbsoluteTopOfElement(cell)) {
          return this._list.updateElementHeight2(
            cell,
            height,
            Math.min(cellIndex + 1, this.getLength() - 1)
          );
        }
      }
      this._list.updateElementHeight2(cell, height);
      deferred.complete(void 0);
    };
    if (this._list.inRenderingTransaction) {
      const layoutDisposable = DOM.scheduleAtNextAnimationFrame(
        DOM.getWindow(this.getDomNode()),
        doLayout
      );
      this._pendingLayouts?.set(
        cell,
        toDisposable(() => {
          layoutDisposable.dispose();
          deferred.complete(void 0);
        })
      );
    } else {
      doLayout();
    }
    return deferred.p;
  }
  getActiveCell() {
    const elements = this._list.getFocusedElements();
    if (elements && elements.length) {
      return elements[0];
    }
    return void 0;
  }
  _toggleNotebookCellSelection(selectedCell, selectFromPrevious) {
    const currentSelections = this._list.getSelectedElements();
    const isSelected = currentSelections.includes(selectedCell);
    const previousSelection = selectFromPrevious ? currentSelections[currentSelections.length - 1] ?? selectedCell : selectedCell;
    const selectedIndex = this._list.getViewIndex(selectedCell);
    const previousIndex = this._list.getViewIndex(previousSelection);
    const cellsInSelectionRange = this.getCellsInViewRange(
      selectedIndex,
      previousIndex
    );
    if (isSelected) {
      this._list.selectElements(
        currentSelections.filter(
          (current) => !cellsInSelectionRange.includes(current)
        )
      );
    } else {
      this.focusElement(selectedCell);
      this._list.selectElements([
        ...currentSelections.filter(
          (current) => !cellsInSelectionRange.includes(current)
        ),
        ...cellsInSelectionRange
      ]);
    }
  }
  getCellsInViewRange(fromInclusive, toInclusive) {
    const selectedCellsInRange = [];
    for (let index = 0; index < this._list.length; ++index) {
      const cell = this._list.element(index);
      if (cell) {
        if (index >= fromInclusive && index <= toInclusive || index >= toInclusive && index <= fromInclusive) {
          selectedCellsInRange.push(cell);
        }
      }
    }
    return selectedCellsInRange;
  }
  async focusNotebookCell(cell, focusItem, options) {
    if (this._isDisposed) {
      return;
    }
    cell.focusedOutputId = void 0;
    if (focusItem === "editor") {
      this.focusElement(cell);
      this._list.focusView();
      cell.updateEditState(CellEditState.Editing, "focusNotebookCell");
      cell.focusMode = CellFocusMode.Editor;
      if (!options?.skipReveal) {
        if (typeof options?.focusEditorLine === "number") {
          this._cursorNavMode.set(true);
          await this.revealLineInViewAsync(
            cell,
            options.focusEditorLine
          );
          const editor = this._renderedEditors.get(cell);
          const focusEditorLine = options.focusEditorLine;
          editor?.setSelection({
            startLineNumber: focusEditorLine,
            startColumn: 1,
            endLineNumber: focusEditorLine,
            endColumn: 1
          });
        } else {
          const selectionsStartPosition = cell.getSelectionsStartPosition();
          if (selectionsStartPosition?.length) {
            const firstSelectionPosition = selectionsStartPosition[0];
            await this.revealRangeInViewAsync(
              cell,
              Range.fromPositions(
                firstSelectionPosition,
                firstSelectionPosition
              )
            );
          } else {
            await this.revealInView(cell);
          }
        }
      }
    } else if (focusItem === "output") {
      this.focusElement(cell);
      if (!this.hasEditorFocus()) {
        this._list.focusView();
      }
      if (!this._webview) {
        return;
      }
      const firstOutputId = cell.outputsViewModels.find(
        (o) => o.model.alternativeOutputId
      )?.model.alternativeOutputId;
      const focusElementId = options?.outputId ?? firstOutputId ?? cell.id;
      this._webview.focusOutput(
        focusElementId,
        options?.altOutputId,
        options?.outputWebviewFocused || this._webviewFocused
      );
      cell.updateEditState(CellEditState.Preview, "focusNotebookCell");
      cell.focusMode = CellFocusMode.Output;
      cell.focusedOutputId = options?.outputId;
      this._outputFocus.set(true);
      if (!options?.skipReveal) {
        this.revealInCenterIfOutsideViewport(cell);
      }
    } else {
      const itemDOM = this._list.domElementOfElement(cell);
      if (itemDOM && itemDOM.ownerDocument.activeElement && itemDOM.contains(itemDOM.ownerDocument.activeElement)) {
        itemDOM.ownerDocument.activeElement.blur();
      }
      this._webview?.blurOutput();
      cell.updateEditState(CellEditState.Preview, "focusNotebookCell");
      cell.focusMode = CellFocusMode.Container;
      this.focusElement(cell);
      if (!options?.skipReveal) {
        if (typeof options?.focusEditorLine === "number") {
          this._cursorNavMode.set(true);
          await this.revealInView(cell);
        } else if (options?.revealBehavior === ScrollToRevealBehavior.firstLine) {
          await this.revealFirstLineIfOutsideViewport(cell);
        } else if (options?.revealBehavior === ScrollToRevealBehavior.fullCell) {
          await this.revealInView(cell);
        } else {
          await this.revealInCenterIfOutsideViewport(cell);
        }
      }
      this._list.focusView();
      this.updateEditorFocus();
    }
  }
  async focusNextNotebookCell(cell, focusItem) {
    const idx = this.viewModel?.getCellIndex(cell);
    if (typeof idx !== "number") {
      return;
    }
    const newCell = this.viewModel?.cellAt(idx + 1);
    if (!newCell) {
      return;
    }
    await this.focusNotebookCell(newCell, focusItem);
  }
  //#endregion
  //#region Find
  async _warmupCell(viewCell) {
    if (viewCell.isOutputCollapsed) {
      return;
    }
    const outputs = viewCell.outputsViewModels;
    for (const output of outputs.slice(0, outputDisplayLimit)) {
      const [mimeTypes, pick] = output.resolveMimeTypes(
        this.textModel,
        void 0
      );
      if (!mimeTypes.find((mimeType) => mimeType.isTrusted) || mimeTypes.length === 0) {
        continue;
      }
      const pickedMimeTypeRenderer = mimeTypes[pick];
      if (!pickedMimeTypeRenderer) {
        return;
      }
      const renderer = this._notebookService.getRendererInfo(
        pickedMimeTypeRenderer.rendererId
      );
      if (!renderer) {
        return;
      }
      const result = {
        type: RenderOutputType.Extension,
        renderer,
        source: output,
        mimeType: pickedMimeTypeRenderer.mimeType
      };
      const inset = this._webview?.insetMapping.get(result.source);
      if (!inset || !inset.initialized) {
        const p = new Promise((resolve) => {
          this._register(
            Event.any(
              this.onDidRenderOutput,
              this.onDidRemoveOutput
            )((e) => {
              if (e.model === result.source.model) {
                resolve();
              }
            })
          );
        });
        this.createOutput(viewCell, result, 0, false);
        await p;
      } else {
        this.createOutput(viewCell, result, 0, false);
      }
      return;
    }
  }
  async _warmupAll(includeOutput) {
    if (!this.hasModel() || !this.viewModel) {
      return;
    }
    const cells = this.viewModel.viewCells;
    const requests = [];
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].cellKind === CellKind.Markup && !this._webview.markupPreviewMapping.has(cells[i].id)) {
        requests.push(this.createMarkupPreview(cells[i]));
      }
    }
    if (includeOutput && this._list) {
      for (let i = 0; i < this._list.length; i++) {
        const cell = this._list.element(i);
        if (cell?.cellKind === CellKind.Code) {
          requests.push(this._warmupCell(cell));
        }
      }
    }
    return Promise.all(requests);
  }
  async find(query, options, token, skipWarmup = false, shouldGetSearchPreviewInfo = false, ownerID) {
    if (!this._notebookViewModel) {
      return [];
    }
    if (!ownerID) {
      ownerID = this.getId();
    }
    const findMatches = this._notebookViewModel.find(query, options).filter((match) => match.length > 0);
    if (!options.includeMarkupPreview && !options.includeOutput || options.findScope?.findScopeType === NotebookFindScopeType.Text) {
      this._webview?.findStop(ownerID);
      return findMatches;
    }
    const matchMap = {};
    findMatches.forEach((match) => {
      matchMap[match.cell.id] = match;
    });
    if (this._webview) {
      const start = Date.now();
      await this._warmupAll(!!options.includeOutput);
      const end = Date.now();
      this.logService.debug("Find", `Warmup time: ${end - start}ms`);
      if (token.isCancellationRequested) {
        return [];
      }
      let findIds = [];
      if (options.findScope && options.findScope.findScopeType === NotebookFindScopeType.Cells && options.findScope.selectedCellRanges) {
        const selectedIndexes = cellRangesToIndexes(
          options.findScope.selectedCellRanges
        );
        findIds = selectedIndexes.map(
          (index) => this._notebookViewModel?.viewCells[index].id ?? ""
        );
      }
      const webviewMatches = await this._webview.find(query, {
        caseSensitive: options.caseSensitive,
        wholeWord: options.wholeWord,
        includeMarkup: !!options.includeMarkupPreview,
        includeOutput: !!options.includeOutput,
        shouldGetSearchPreviewInfo,
        ownerID,
        findIds
      });
      if (token.isCancellationRequested) {
        return [];
      }
      webviewMatches.forEach((match) => {
        const cell = this._notebookViewModel.viewCells.find(
          (cell2) => cell2.id === match.cellId
        );
        if (!cell) {
          return;
        }
        if (match.type === "preview") {
          if (cell.getEditState() === CellEditState.Preview && !options.includeMarkupPreview) {
            return;
          }
          if (cell.getEditState() === CellEditState.Editing && options.includeMarkupInput) {
            return;
          }
        } else if (!options.includeOutput) {
          return;
        }
        const exisitingMatch = matchMap[match.cellId];
        if (exisitingMatch) {
          exisitingMatch.webviewMatches.push(match);
        } else {
          matchMap[match.cellId] = new CellFindMatchModel(
            this._notebookViewModel.viewCells.find(
              (cell2) => cell2.id === match.cellId
            ),
            this._notebookViewModel.viewCells.findIndex(
              (cell2) => cell2.id === match.cellId
            ),
            [],
            [match]
          );
        }
      });
    }
    const ret = [];
    this._notebookViewModel.viewCells.forEach((cell, index) => {
      if (matchMap[cell.id]) {
        ret.push(
          new CellFindMatchModel(
            cell,
            index,
            matchMap[cell.id].contentMatches,
            matchMap[cell.id].webviewMatches
          )
        );
      }
    });
    return ret;
  }
  async findHighlightCurrent(matchIndex, ownerID) {
    if (!this._webview) {
      return 0;
    }
    return this._webview?.findHighlightCurrent(
      matchIndex,
      ownerID ?? this.getId()
    );
  }
  async findUnHighlightCurrent(matchIndex, ownerID) {
    if (!this._webview) {
      return;
    }
    return this._webview?.findUnHighlightCurrent(
      matchIndex,
      ownerID ?? this.getId()
    );
  }
  findStop(ownerID) {
    this._webview?.findStop(ownerID ?? this.getId());
  }
  //#endregion
  //#region MISC
  getLayoutInfo() {
    if (!this._list) {
      throw new Error("Editor is not initalized successfully");
    }
    if (!this._fontInfo) {
      this._generateFontInfo();
    }
    return {
      width: this._dimension?.width ?? 0,
      height: this._dimension?.height ?? 0,
      scrollHeight: this._list?.getScrollHeight() ?? 0,
      fontInfo: this._fontInfo,
      stickyHeight: this._notebookStickyScroll?.getCurrentStickyHeight() ?? 0
    };
  }
  async createMarkupPreview(cell) {
    if (!this._webview) {
      return;
    }
    if (!this._webview.isResolved()) {
      await this._resolveWebview();
    }
    if (!this._webview || !this._list.webviewElement) {
      return;
    }
    if (!this.viewModel || !this._list.viewModel) {
      return;
    }
    if (this.viewModel.getCellIndex(cell) === -1) {
      return;
    }
    if (this.cellIsHidden(cell)) {
      return;
    }
    const webviewTop = Number.parseInt(
      this._list.webviewElement.domNode.style.top,
      10
    );
    const top = !!webviewTop ? 0 - webviewTop : 0;
    const cellTop = this._list.getCellViewScrollTop(cell);
    await this._webview.showMarkupPreview({
      mime: cell.mime,
      cellHandle: cell.handle,
      cellId: cell.id,
      content: cell.getText(),
      offset: cellTop + top,
      visible: true,
      metadata: cell.metadata
    });
  }
  cellIsHidden(cell) {
    const modelIndex = this.viewModel.getCellIndex(cell);
    const foldedRanges = this.viewModel.getHiddenRanges();
    return foldedRanges.some(
      (range) => modelIndex >= range.start && modelIndex <= range.end
    );
  }
  async unhideMarkupPreviews(cells) {
    if (!this._webview) {
      return;
    }
    if (!this._webview.isResolved()) {
      await this._resolveWebview();
    }
    await this._webview?.unhideMarkupPreviews(cells.map((cell) => cell.id));
  }
  async hideMarkupPreviews(cells) {
    if (!this._webview || !cells.length) {
      return;
    }
    if (!this._webview.isResolved()) {
      await this._resolveWebview();
    }
    await this._webview?.hideMarkupPreviews(cells.map((cell) => cell.id));
  }
  async deleteMarkupPreviews(cells) {
    if (!this._webview) {
      return;
    }
    if (!this._webview.isResolved()) {
      await this._resolveWebview();
    }
    await this._webview?.deleteMarkupPreviews(cells.map((cell) => cell.id));
  }
  async updateSelectedMarkdownPreviews() {
    if (!this._webview) {
      return;
    }
    if (!this._webview.isResolved()) {
      await this._resolveWebview();
    }
    const selectedCells = this.getSelectionViewModels().map(
      (cell) => cell.id
    );
    await this._webview?.updateMarkupPreviewSelections(
      selectedCells.length > 1 ? selectedCells : []
    );
  }
  async createOutput(cell, output, offset, createWhenIdle) {
    this._insetModifyQueueByOutputId.queue(
      output.source.model.outputId,
      async () => {
        if (this._isDisposed || !this._webview) {
          return;
        }
        if (!this._webview.isResolved()) {
          await this._resolveWebview();
        }
        if (!this._webview) {
          return;
        }
        if (!this._list.webviewElement) {
          return;
        }
        if (output.type === RenderOutputType.Extension) {
          this.notebookRendererMessaging.prepare(output.renderer.id);
        }
        const webviewTop = Number.parseInt(
          this._list.webviewElement.domNode.style.top,
          10
        );
        const top = !!webviewTop ? 0 - webviewTop : 0;
        const cellTop = this._list.getCellViewScrollTop(cell) + top;
        const existingOutput = this._webview.insetMapping.get(
          output.source
        );
        if (!existingOutput || !existingOutput.renderer && output.type === RenderOutputType.Extension) {
          if (createWhenIdle) {
            this._webview.requestCreateOutputWhenWebviewIdle(
              {
                cellId: cell.id,
                cellHandle: cell.handle,
                cellUri: cell.uri,
                executionId: cell.internalMetadata.executionId
              },
              output,
              cellTop,
              offset
            );
          } else {
            this._webview.createOutput(
              {
                cellId: cell.id,
                cellHandle: cell.handle,
                cellUri: cell.uri,
                executionId: cell.internalMetadata.executionId
              },
              output,
              cellTop,
              offset
            );
          }
        } else if (existingOutput.renderer && output.type === RenderOutputType.Extension && existingOutput.renderer.id !== output.renderer.id) {
          this._webview.removeInsets([output.source]);
          this._webview.createOutput(
            {
              cellId: cell.id,
              cellHandle: cell.handle,
              cellUri: cell.uri
            },
            output,
            cellTop,
            offset
          );
        } else if (existingOutput.versionId !== output.source.model.versionId) {
          this._webview.updateOutput(
            {
              cellId: cell.id,
              cellHandle: cell.handle,
              cellUri: cell.uri,
              executionId: cell.internalMetadata.executionId
            },
            output,
            cellTop,
            offset
          );
        } else {
          const outputIndex = cell.outputsViewModels.indexOf(
            output.source
          );
          const outputOffset = cell.getOutputOffset(outputIndex);
          this._webview.updateScrollTops(
            [
              {
                cell,
                output: output.source,
                cellTop,
                outputOffset,
                forceDisplay: !cell.isOutputCollapsed
              }
            ],
            []
          );
        }
      }
    );
  }
  async updateOutput(cell, output, offset) {
    this._insetModifyQueueByOutputId.queue(
      output.source.model.outputId,
      async () => {
        if (this._isDisposed || !this._webview || cell.isOutputCollapsed) {
          return;
        }
        if (!this._webview.isResolved()) {
          await this._resolveWebview();
        }
        if (!this._webview || !this._list.webviewElement) {
          return;
        }
        if (!this._webview.insetMapping.has(output.source)) {
          return this.createOutput(cell, output, offset, false);
        }
        if (output.type === RenderOutputType.Extension) {
          this.notebookRendererMessaging.prepare(output.renderer.id);
        }
        const webviewTop = Number.parseInt(
          this._list.webviewElement.domNode.style.top,
          10
        );
        const top = !!webviewTop ? 0 - webviewTop : 0;
        const cellTop = this._list.getCellViewScrollTop(cell) + top;
        this._webview.updateOutput(
          {
            cellId: cell.id,
            cellHandle: cell.handle,
            cellUri: cell.uri
          },
          output,
          cellTop,
          offset
        );
      }
    );
  }
  async copyOutputImage(cellOutput) {
    this._webview?.copyImage(cellOutput);
  }
  removeInset(output) {
    this._insetModifyQueueByOutputId.queue(
      output.model.outputId,
      async () => {
        if (this._isDisposed || !this._webview) {
          return;
        }
        if (this._webview?.isResolved()) {
          this._webview.removeInsets([output]);
        }
        this._onDidRemoveOutput.fire(output);
      }
    );
  }
  hideInset(output) {
    this._insetModifyQueueByOutputId.queue(
      output.model.outputId,
      async () => {
        if (this._isDisposed || !this._webview) {
          return;
        }
        if (this._webview?.isResolved()) {
          this._webview.hideInset(output);
        }
      }
    );
  }
  //#region --- webview IPC ----
  postMessage(message) {
    if (this._webview?.isResolved()) {
      this._webview.postKernelMessage(message);
    }
  }
  //#endregion
  addClassName(className) {
    this._overlayContainer.classList.add(className);
  }
  removeClassName(className) {
    this._overlayContainer.classList.remove(className);
  }
  cellAt(index) {
    return this.viewModel?.cellAt(index);
  }
  getCellByInfo(cellInfo) {
    const { cellHandle } = cellInfo;
    return this.viewModel?.viewCells.find(
      (vc) => vc.handle === cellHandle
    );
  }
  getCellByHandle(handle) {
    return this.viewModel?.getCellByHandle(handle);
  }
  getCellIndex(cell) {
    return this.viewModel?.getCellIndexByHandle(cell.handle);
  }
  getNextVisibleCellIndex(index) {
    return this.viewModel?.getNextVisibleCellIndex(index);
  }
  getPreviousVisibleCellIndex(index) {
    return this.viewModel?.getPreviousVisibleCellIndex(index);
  }
  _updateScrollHeight() {
    if (this._isDisposed || !this._webview?.isResolved()) {
      return;
    }
    if (!this._list.webviewElement) {
      return;
    }
    const scrollHeight = this._list.scrollHeight;
    this._webview.element.style.height = `${scrollHeight + NOTEBOOK_WEBVIEW_BOUNDARY * 2}px`;
    const webviewTop = Number.parseInt(
      this._list.webviewElement.domNode.style.top,
      10
    );
    const top = !!webviewTop ? 0 - webviewTop : 0;
    const updateItems = [];
    const removedItems = [];
    this._webview?.insetMapping.forEach((value, key) => {
      const cell = this.viewModel?.getCellByHandle(
        value.cellInfo.cellHandle
      );
      if (!cell || !(cell instanceof CodeCellViewModel)) {
        return;
      }
      this.viewModel?.viewCells.find(
        (cell2) => cell2.handle === value.cellInfo.cellHandle
      );
      const viewIndex = this._list.getViewIndex(cell);
      if (viewIndex === void 0) {
        return;
      }
      if (cell.outputsViewModels.indexOf(key) < 0) {
        removedItems.push(key);
      }
      const cellTop = this._list.getCellViewScrollTop(cell);
      const outputIndex = cell.outputsViewModels.indexOf(key);
      const outputOffset = cell.getOutputOffset(outputIndex);
      updateItems.push({
        cell,
        output: key,
        cellTop: cellTop + top,
        outputOffset,
        forceDisplay: false
      });
    });
    this._webview.removeInsets(removedItems);
    const markdownUpdateItems = [];
    for (const cellId of this._webview.markupPreviewMapping.keys()) {
      const cell = this.viewModel?.viewCells.find(
        (cell2) => cell2.id === cellId
      );
      if (cell) {
        const cellTop = this._list.getCellViewScrollTop(cell);
        markdownUpdateItems.push({ id: cellId, top: cellTop + top });
      }
    }
    if (markdownUpdateItems.length || updateItems.length) {
      this._debug(
        "_list.onDidChangeContentHeight/markdown",
        markdownUpdateItems
      );
      this._webview?.updateScrollTops(updateItems, markdownUpdateItems);
    }
  }
  //#endregion
  //#region BacklayerWebview delegate
  _updateOutputHeight(cellInfo, output, outputHeight, isInit, source) {
    const cell = this.viewModel?.viewCells.find(
      (vc) => vc.handle === cellInfo.cellHandle
    );
    if (cell && cell instanceof CodeCellViewModel) {
      const outputIndex = cell.outputsViewModels.indexOf(output);
      this._debug("update cell output", cell.handle, outputHeight);
      cell.updateOutputHeight(outputIndex, outputHeight, source);
      this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight);
      if (isInit) {
        this._onDidRenderOutput.fire(output);
      }
    }
  }
  _pendingOutputHeightAcks = /* @__PURE__ */ new Map();
  _scheduleOutputHeightAck(cellInfo, outputId, height) {
    const wasEmpty = this._pendingOutputHeightAcks.size === 0;
    this._pendingOutputHeightAcks.set(outputId, {
      cellId: cellInfo.cellId,
      outputId,
      height
    });
    if (wasEmpty) {
      DOM.scheduleAtNextAnimationFrame(
        DOM.getWindow(this.getDomNode()),
        () => {
          this._debug("ack height");
          this._updateScrollHeight();
          this._webview?.ackHeight([
            ...this._pendingOutputHeightAcks.values()
          ]);
          this._pendingOutputHeightAcks.clear();
        },
        -1
      );
    }
  }
  _getCellById(cellId) {
    return this.viewModel?.viewCells.find((vc) => vc.id === cellId);
  }
  _updateMarkupCellHeight(cellId, height, isInit) {
    const cell = this._getCellById(cellId);
    if (cell && cell instanceof MarkupCellViewModel) {
      const { bottomToolbarGap } = this._notebookOptions.computeBottomToolbarDimensions(
        this.viewModel?.viewType
      );
      this._debug(
        "updateMarkdownCellHeight",
        cell.handle,
        height + bottomToolbarGap,
        isInit
      );
      cell.renderedMarkdownHeight = height;
    }
  }
  _setMarkupCellEditState(cellId, editState) {
    const cell = this._getCellById(cellId);
    if (cell instanceof MarkupCellViewModel) {
      this.revealInView(cell);
      cell.updateEditState(editState, "setMarkdownCellEditState");
    }
  }
  _didStartDragMarkupCell(cellId, event) {
    const cell = this._getCellById(cellId);
    if (cell instanceof MarkupCellViewModel) {
      const webviewOffset = this._list.webviewElement ? -Number.parseInt(
        this._list.webviewElement.domNode.style.top,
        10
      ) : 0;
      this._dndController?.startExplicitDrag(
        cell,
        event.dragOffsetY - webviewOffset
      );
    }
  }
  _didDragMarkupCell(cellId, event) {
    const cell = this._getCellById(cellId);
    if (cell instanceof MarkupCellViewModel) {
      const webviewOffset = this._list.webviewElement ? -Number.parseInt(
        this._list.webviewElement.domNode.style.top,
        10
      ) : 0;
      this._dndController?.explicitDrag(
        cell,
        event.dragOffsetY - webviewOffset
      );
    }
  }
  _didDropMarkupCell(cellId, event) {
    const cell = this._getCellById(cellId);
    if (cell instanceof MarkupCellViewModel) {
      const webviewOffset = this._list.webviewElement ? -Number.parseInt(
        this._list.webviewElement.domNode.style.top,
        10
      ) : 0;
      event.dragOffsetY -= webviewOffset;
      this._dndController?.explicitDrop(cell, event);
    }
  }
  _didEndDragMarkupCell(cellId) {
    const cell = this._getCellById(cellId);
    if (cell instanceof MarkupCellViewModel) {
      this._dndController?.endExplicitDrag(cell);
    }
  }
  _didResizeOutput(cellId) {
    const cell = this._getCellById(cellId);
    if (cell) {
      this._onDidResizeOutputEmitter.fire(cell);
    }
  }
  _updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
    if (!this.hasModel()) {
      return;
    }
    const cell = this._getCellById(cellId);
    const cellIndex = cell ? this.getCellIndex(cell) : void 0;
    if (cell?.internalMetadata.executionId === executionId && cellIndex !== void 0) {
      const renderDurationMap = cell.internalMetadata.renderDuration || {};
      renderDurationMap[rendererId] = (renderDurationMap[rendererId] ?? 0) + duration;
      this.textModel.applyEdits(
        [
          {
            editType: CellEditType.PartialInternalMetadata,
            index: cellIndex,
            internalMetadata: {
              executionId,
              renderDuration: renderDurationMap
            }
          }
        ],
        true,
        void 0,
        () => void 0,
        void 0,
        false
      );
    }
  }
  //#endregion
  //#region Editor Contributions
  getContribution(id) {
    return this._contributions.get(id) || null;
  }
  //#endregion
  dispose() {
    this._isDisposed = true;
    this._webview?.dispose();
    this._webview = null;
    this.notebookEditorService.removeNotebookEditor(this);
    dispose(this._contributions.values());
    this._contributions.clear();
    this._localStore.clear();
    dispose(this._localCellStateListeners);
    this._list.dispose();
    this._listTopCellToolbar?.dispose();
    this._overlayContainer.remove();
    this.viewModel?.dispose();
    this._renderedEditors.clear();
    this._baseCellEditorOptions.forEach((v) => v.dispose());
    this._baseCellEditorOptions.clear();
    this._notebookOverviewRulerContainer.remove();
    super.dispose();
    this._webview = null;
    this._webviewResolvePromise = null;
    this._webviewTransparentCover = null;
    this._dndController = null;
    this._listTopCellToolbar = null;
    this._notebookViewModel = void 0;
    this._cellContextKeyManager = null;
    this._notebookTopToolbar = null;
    this._list = null;
    this._listViewInfoAccessor = null;
    this._pendingLayouts = null;
    this._listDelegate = null;
  }
  toJSON() {
    return {
      notebookUri: this.viewModel?.uri
    };
  }
};
NotebookEditorWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IEditorGroupsService),
  __decorateParam(4, INotebookRendererMessagingService),
  __decorateParam(5, INotebookEditorService),
  __decorateParam(6, INotebookKernelService),
  __decorateParam(7, INotebookService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, ILayoutService),
  __decorateParam(11, IContextMenuService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, INotebookExecutionService),
  __decorateParam(14, INotebookExecutionStateService),
  __decorateParam(15, IEditorProgressService),
  __decorateParam(16, INotebookLoggingService),
  __decorateParam(17, IKeybindingService)
], NotebookEditorWidget);
registerZIndex(ZIndex.Base, 5, "notebook-progress-bar");
registerZIndex(ZIndex.Base, 10, "notebook-list-insertion-indicator");
registerZIndex(ZIndex.Base, 20, "notebook-cell-editor-outline");
registerZIndex(ZIndex.Base, 25, "notebook-scrollbar");
registerZIndex(ZIndex.Base, 26, "notebook-cell-status");
registerZIndex(ZIndex.Base, 26, "notebook-folding-indicator");
registerZIndex(ZIndex.Base, 27, "notebook-output");
registerZIndex(ZIndex.Base, 28, "notebook-cell-bottom-toolbar-container");
registerZIndex(ZIndex.Base, 29, "notebook-run-button-container");
registerZIndex(ZIndex.Base, 29, "notebook-input-collapse-condicon");
registerZIndex(ZIndex.Base, 30, "notebook-cell-output-toolbar");
registerZIndex(ZIndex.Sash, 1, "notebook-cell-expand-part-button");
registerZIndex(ZIndex.Sash, 2, "notebook-cell-toolbar");
registerZIndex(ZIndex.Sash, 3, "notebook-cell-toolbar-dropdown-active");
const notebookCellBorder = registerColor(
  "notebook.cellBorderColor",
  {
    dark: transparent(listInactiveSelectionBackground, 1),
    light: transparent(listInactiveSelectionBackground, 1),
    hcDark: PANEL_BORDER,
    hcLight: PANEL_BORDER
  },
  nls.localize(
    "notebook.cellBorderColor",
    "The border color for notebook cells."
  )
);
const focusedEditorBorderColor = registerColor(
  "notebook.focusedEditorBorder",
  focusBorder,
  nls.localize(
    "notebook.focusedEditorBorder",
    "The color of the notebook cell editor border."
  )
);
const cellStatusIconSuccess = registerColor(
  "notebookStatusSuccessIcon.foreground",
  debugIconStartForeground,
  nls.localize(
    "notebookStatusSuccessIcon.foreground",
    "The error icon color of notebook cells in the cell status bar."
  )
);
const runningCellRulerDecorationColor = registerColor(
  "notebookEditorOverviewRuler.runningCellForeground",
  debugIconStartForeground,
  nls.localize(
    "notebookEditorOverviewRuler.runningCellForeground",
    "The color of the running cell decoration in the notebook editor overview ruler."
  )
);
const cellStatusIconError = registerColor(
  "notebookStatusErrorIcon.foreground",
  errorForeground,
  nls.localize(
    "notebookStatusErrorIcon.foreground",
    "The error icon color of notebook cells in the cell status bar."
  )
);
const cellStatusIconRunning = registerColor(
  "notebookStatusRunningIcon.foreground",
  foreground,
  nls.localize(
    "notebookStatusRunningIcon.foreground",
    "The running icon color of notebook cells in the cell status bar."
  )
);
const notebookOutputContainerBorderColor = registerColor(
  "notebook.outputContainerBorderColor",
  null,
  nls.localize(
    "notebook.outputContainerBorderColor",
    "The border color of the notebook output container."
  )
);
const notebookOutputContainerColor = registerColor(
  "notebook.outputContainerBackgroundColor",
  null,
  nls.localize(
    "notebook.outputContainerBackgroundColor",
    "The color of the notebook output container background."
  )
);
const CELL_TOOLBAR_SEPERATOR = registerColor(
  "notebook.cellToolbarSeparator",
  {
    dark: Color.fromHex("#808080").transparent(0.35),
    light: Color.fromHex("#808080").transparent(0.35),
    hcDark: contrastBorder,
    hcLight: contrastBorder
  },
  nls.localize(
    "notebook.cellToolbarSeparator",
    "The color of the separator in the cell bottom toolbar"
  )
);
const focusedCellBackground = registerColor(
  "notebook.focusedCellBackground",
  null,
  nls.localize(
    "focusedCellBackground",
    "The background color of a cell when the cell is focused."
  )
);
const selectedCellBackground = registerColor(
  "notebook.selectedCellBackground",
  {
    dark: listInactiveSelectionBackground,
    light: listInactiveSelectionBackground,
    hcDark: null,
    hcLight: null
  },
  nls.localize(
    "selectedCellBackground",
    "The background color of a cell when the cell is selected."
  )
);
const cellHoverBackground = registerColor(
  "notebook.cellHoverBackground",
  {
    dark: transparent(focusedCellBackground, 0.5),
    light: transparent(focusedCellBackground, 0.7),
    hcDark: null,
    hcLight: null
  },
  nls.localize(
    "notebook.cellHoverBackground",
    "The background color of a cell when the cell is hovered."
  )
);
const selectedCellBorder = registerColor(
  "notebook.selectedCellBorder",
  {
    dark: notebookCellBorder,
    light: notebookCellBorder,
    hcDark: contrastBorder,
    hcLight: contrastBorder
  },
  nls.localize(
    "notebook.selectedCellBorder",
    "The color of the cell's top and bottom border when the cell is selected but not focused."
  )
);
const inactiveSelectedCellBorder = registerColor(
  "notebook.inactiveSelectedCellBorder",
  {
    dark: null,
    light: null,
    hcDark: focusBorder,
    hcLight: focusBorder
  },
  nls.localize(
    "notebook.inactiveSelectedCellBorder",
    "The color of the cell's borders when multiple cells are selected."
  )
);
const focusedCellBorder = registerColor(
  "notebook.focusedCellBorder",
  focusBorder,
  nls.localize(
    "notebook.focusedCellBorder",
    "The color of the cell's focus indicator borders when the cell is focused."
  )
);
const inactiveFocusedCellBorder = registerColor(
  "notebook.inactiveFocusedCellBorder",
  notebookCellBorder,
  nls.localize(
    "notebook.inactiveFocusedCellBorder",
    "The color of the cell's top and bottom border when a cell is focused while the primary focus is outside of the editor."
  )
);
const cellStatusBarItemHover = registerColor(
  "notebook.cellStatusBarItemHoverBackground",
  {
    light: new Color(new RGBA(0, 0, 0, 0.08)),
    dark: new Color(new RGBA(255, 255, 255, 0.15)),
    hcDark: new Color(new RGBA(255, 255, 255, 0.15)),
    hcLight: new Color(new RGBA(0, 0, 0, 0.08))
  },
  nls.localize(
    "notebook.cellStatusBarItemHoverBackground",
    "The background color of notebook cell status bar items."
  )
);
const cellInsertionIndicator = registerColor(
  "notebook.cellInsertionIndicator",
  focusBorder,
  nls.localize(
    "notebook.cellInsertionIndicator",
    "The color of the notebook cell insertion indicator."
  )
);
const listScrollbarSliderBackground = registerColor(
  "notebookScrollbarSlider.background",
  scrollbarSliderBackground,
  nls.localize(
    "notebookScrollbarSliderBackground",
    "Notebook scrollbar slider background color."
  )
);
const listScrollbarSliderHoverBackground = registerColor(
  "notebookScrollbarSlider.hoverBackground",
  scrollbarSliderHoverBackground,
  nls.localize(
    "notebookScrollbarSliderHoverBackground",
    "Notebook scrollbar slider background color when hovering."
  )
);
const listScrollbarSliderActiveBackground = registerColor(
  "notebookScrollbarSlider.activeBackground",
  scrollbarSliderActiveBackground,
  nls.localize(
    "notebookScrollbarSliderActiveBackground",
    "Notebook scrollbar slider background color when clicked on."
  )
);
const cellSymbolHighlight = registerColor(
  "notebook.symbolHighlightBackground",
  {
    dark: Color.fromHex("#ffffff0b"),
    light: Color.fromHex("#fdff0033"),
    hcDark: null,
    hcLight: null
  },
  nls.localize(
    "notebook.symbolHighlightBackground",
    "Background color of highlighted cell"
  )
);
const cellEditorBackground = registerColor(
  "notebook.cellEditorBackground",
  {
    light: SIDE_BAR_BACKGROUND,
    dark: SIDE_BAR_BACKGROUND,
    hcDark: null,
    hcLight: null
  },
  nls.localize(
    "notebook.cellEditorBackground",
    "Cell editor background color."
  )
);
const notebookEditorBackground = registerColor(
  "notebook.editorBackground",
  {
    light: EDITOR_PANE_BACKGROUND,
    dark: EDITOR_PANE_BACKGROUND,
    hcDark: null,
    hcLight: null
  },
  nls.localize("notebook.editorBackground", "Notebook background color.")
);
export {
  CELL_TOOLBAR_SEPERATOR,
  NotebookEditorWidget,
  cellEditorBackground,
  cellHoverBackground,
  cellInsertionIndicator,
  cellStatusBarItemHover,
  cellStatusIconError,
  cellStatusIconRunning,
  cellStatusIconSuccess,
  cellSymbolHighlight,
  focusedCellBackground,
  focusedCellBorder,
  focusedEditorBorderColor,
  getDefaultNotebookCreationOptions,
  inactiveFocusedCellBorder,
  inactiveSelectedCellBorder,
  listScrollbarSliderActiveBackground,
  listScrollbarSliderBackground,
  listScrollbarSliderHoverBackground,
  notebookCellBorder,
  notebookOutputContainerBorderColor,
  notebookOutputContainerColor,
  runningCellRulerDecorationColor,
  selectedCellBackground,
  selectedCellBorder
};
