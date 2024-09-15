var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as DOM from "../../../../../base/browser/dom.js";
import { IListRenderer, IListVirtualDelegate } from "../../../../../base/browser/ui/list/list.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { NotImplementedError } from "../../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { Mimes } from "../../../../../base/common/mime.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { ILanguageConfigurationService } from "../../../../../editor/common/languages/languageConfigurationRegistry.js";
import { LanguageService } from "../../../../../editor/common/services/languageService.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ModelService } from "../../../../../editor/common/services/modelService.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { TestLanguageConfigurationService } from "../../../../../editor/test/common/modes/testLanguageConfigurationService.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { TestClipboardService } from "../../../../../platform/clipboard/test/common/testClipboardService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { ContextKeyService } from "../../../../../platform/contextkey/browser/contextKeyService.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { MockKeybindingService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { ILayoutService } from "../../../../../platform/layout/browser/layoutService.js";
import { IListService, ListService } from "../../../../../platform/list/browser/listService.js";
import { ILogService, NullLogService } from "../../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../../../platform/theme/test/common/testThemeService.js";
import { IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { UndoRedoService } from "../../../../../platform/undoRedo/common/undoRedoService.js";
import { IWorkspaceTrustRequestService } from "../../../../../platform/workspace/common/workspaceTrust.js";
import { EditorInput } from "../../../../common/editor/editorInput.js";
import { EditorModel } from "../../../../common/editor/editorModel.js";
import { CellFindMatchWithIndex, CellFocusMode, IActiveNotebookEditorDelegate, IBaseCellEditorOptions, ICellViewModel, INotebookEditorDelegate } from "../../browser/notebookBrowser.js";
import { NotebookCellStateChangedEvent, NotebookLayoutInfo } from "../../browser/notebookViewEvents.js";
import { NotebookCellStatusBarService } from "../../browser/services/notebookCellStatusBarServiceImpl.js";
import { ListViewInfoAccessor, NotebookCellList } from "../../browser/view/notebookCellList.js";
import { BaseCellRenderTemplate } from "../../browser/view/notebookRenderingCommon.js";
import { NotebookEventDispatcher } from "../../browser/viewModel/eventDispatcher.js";
import { CellViewModel, NotebookViewModel } from "../../browser/viewModel/notebookViewModelImpl.js";
import { ViewContext } from "../../browser/viewModel/viewContext.js";
import { NotebookCellTextModel } from "../../common/model/notebookCellTextModel.js";
import { NotebookTextModel } from "../../common/model/notebookTextModel.js";
import { INotebookCellStatusBarService } from "../../common/notebookCellStatusBarService.js";
import { CellKind, CellUri, ICellDto2, INotebookDiffEditorModel, INotebookEditorModel, INotebookFindOptions, IOutputDto, IResolvedNotebookEditorModel, NotebookCellExecutionState, NotebookCellMetadata, SelectionStateType } from "../../common/notebookCommon.js";
import { ICellExecuteUpdate, ICellExecutionComplete, ICellExecutionStateChangedEvent, IExecutionStateChangedEvent, INotebookCellExecution, INotebookExecution, INotebookExecutionStateService, INotebookFailStateChangedEvent } from "../../common/notebookExecutionStateService.js";
import { NotebookOptions } from "../../browser/notebookOptions.js";
import { ICellRange } from "../../common/notebookRange.js";
import { TextModelResolverService } from "../../../../services/textmodelResolver/common/textModelResolverService.js";
import { IWorkingCopySaveEvent } from "../../../../services/workingCopy/common/workingCopy.js";
import { TestLayoutService } from "../../../../test/browser/workbenchTestServices.js";
import { TestStorageService, TestWorkspaceTrustRequestService } from "../../../../test/common/workbenchTestServices.js";
import { FontInfo } from "../../../../../editor/common/config/fontInfo.js";
import { EditorFontLigatures, EditorFontVariations } from "../../../../../editor/common/config/editorOptions.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { mainWindow } from "../../../../../base/browser/window.js";
import { TestCodeEditorService } from "../../../../../editor/test/browser/editorTestServices.js";
import { INotebookCellOutlineDataSourceFactory, NotebookCellOutlineDataSourceFactory } from "../../browser/viewModel/notebookOutlineDataSourceFactory.js";
import { ILanguageDetectionService } from "../../../../services/languageDetection/common/languageDetectionWorkerService.js";
import { INotebookOutlineEntryFactory, NotebookOutlineEntryFactory } from "../../browser/viewModel/notebookOutlineEntryFactory.js";
import { IOutlineService } from "../../../../services/outline/browser/outline.js";
class TestCell extends NotebookCellTextModel {
  constructor(viewType, handle, source, language, cellKind, outputs, languageService) {
    super(CellUri.generate(URI.parse("test:///fake/notebook"), handle), handle, source, language, Mimes.text, cellKind, outputs, void 0, void 0, void 0, { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} }, languageService);
    this.viewType = viewType;
    this.source = source;
  }
  static {
    __name(this, "TestCell");
  }
}
class NotebookEditorTestModel extends EditorModel {
  constructor(_notebook) {
    super();
    this._notebook = _notebook;
    if (_notebook && _notebook.onDidChangeContent) {
      this._register(_notebook.onDidChangeContent(() => {
        this._dirty = true;
        this._onDidChangeDirty.fire();
        this._onDidChangeContent.fire();
      }));
    }
  }
  static {
    __name(this, "NotebookEditorTestModel");
  }
  _dirty = false;
  _onDidSave = this._register(new Emitter());
  onDidSave = this._onDidSave.event;
  _onDidChangeDirty = this._register(new Emitter());
  onDidChangeDirty = this._onDidChangeDirty.event;
  onDidChangeOrphaned = Event.None;
  onDidChangeReadonly = Event.None;
  onDidRevertUntitled = Event.None;
  _onDidChangeContent = this._register(new Emitter());
  onDidChangeContent = this._onDidChangeContent.event;
  get viewType() {
    return this._notebook.viewType;
  }
  get resource() {
    return this._notebook.uri;
  }
  get notebook() {
    return this._notebook;
  }
  isReadonly() {
    return false;
  }
  isOrphaned() {
    return false;
  }
  hasAssociatedFilePath() {
    return false;
  }
  isDirty() {
    return this._dirty;
  }
  get hasErrorState() {
    return false;
  }
  isModified() {
    return this._dirty;
  }
  getNotebook() {
    return this._notebook;
  }
  async load() {
    return this;
  }
  async save() {
    if (this._notebook) {
      this._dirty = false;
      this._onDidChangeDirty.fire();
      this._onDidSave.fire({});
      return true;
    }
    return false;
  }
  saveAs() {
    throw new NotImplementedError();
  }
  revert() {
    throw new NotImplementedError();
  }
}
function setupInstantiationService(disposables) {
  const instantiationService = disposables.add(new TestInstantiationService());
  const testThemeService = new TestThemeService();
  instantiationService.stub(ILanguageService, disposables.add(new LanguageService()));
  instantiationService.stub(IUndoRedoService, instantiationService.createInstance(UndoRedoService));
  instantiationService.stub(IConfigurationService, new TestConfigurationService());
  instantiationService.stub(IThemeService, testThemeService);
  instantiationService.stub(ILanguageConfigurationService, disposables.add(new TestLanguageConfigurationService()));
  instantiationService.stub(IModelService, disposables.add(instantiationService.createInstance(ModelService)));
  instantiationService.stub(ITextModelService, disposables.add(instantiationService.createInstance(TextModelResolverService)));
  instantiationService.stub(IContextKeyService, disposables.add(instantiationService.createInstance(ContextKeyService)));
  instantiationService.stub(IListService, disposables.add(instantiationService.createInstance(ListService)));
  instantiationService.stub(ILayoutService, new TestLayoutService());
  instantiationService.stub(ILogService, new NullLogService());
  instantiationService.stub(IClipboardService, TestClipboardService);
  instantiationService.stub(IStorageService, disposables.add(new TestStorageService()));
  instantiationService.stub(IWorkspaceTrustRequestService, disposables.add(new TestWorkspaceTrustRequestService(true)));
  instantiationService.stub(INotebookExecutionStateService, new TestNotebookExecutionStateService());
  instantiationService.stub(IKeybindingService, new MockKeybindingService());
  instantiationService.stub(INotebookCellStatusBarService, disposables.add(new NotebookCellStatusBarService()));
  instantiationService.stub(ICodeEditorService, disposables.add(new TestCodeEditorService(testThemeService)));
  instantiationService.stub(IOutlineService, new class extends mock() {
    registerOutlineCreator() {
      return { dispose() {
      } };
    }
  }());
  instantiationService.stub(INotebookCellOutlineDataSourceFactory, instantiationService.createInstance(NotebookCellOutlineDataSourceFactory));
  instantiationService.stub(INotebookOutlineEntryFactory, instantiationService.createInstance(NotebookOutlineEntryFactory));
  instantiationService.stub(ILanguageDetectionService, new class MockLanguageDetectionService {
    static {
      __name(this, "MockLanguageDetectionService");
    }
    _serviceBrand;
    isEnabledForLanguage(languageId) {
      return false;
    }
    async detectLanguage(resource, supportedLangs) {
      return void 0;
    }
  }());
  return instantiationService;
}
__name(setupInstantiationService, "setupInstantiationService");
function _createTestNotebookEditor(instantiationService, disposables, cells) {
  const viewType = "notebook";
  const notebook = disposables.add(instantiationService.createInstance(NotebookTextModel, viewType, URI.parse("test://test"), cells.map((cell) => {
    return {
      source: cell[0],
      mime: void 0,
      language: cell[1],
      cellKind: cell[2],
      outputs: cell[3] ?? [],
      metadata: cell[4]
    };
  }), {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false }));
  const model = disposables.add(new NotebookEditorTestModel(notebook));
  const notebookOptions = disposables.add(new NotebookOptions(mainWindow, false, void 0, instantiationService.get(IConfigurationService), instantiationService.get(INotebookExecutionStateService), instantiationService.get(ICodeEditorService)));
  const baseCellEditorOptions = new class extends mock() {
  }();
  const viewContext = new ViewContext(notebookOptions, disposables.add(new NotebookEventDispatcher()), () => baseCellEditorOptions);
  const viewModel = disposables.add(instantiationService.createInstance(NotebookViewModel, viewType, model.notebook, viewContext, null, { isReadOnly: false }));
  const cellList = disposables.add(createNotebookCellList(instantiationService, disposables, viewContext));
  cellList.attachViewModel(viewModel);
  const listViewInfoAccessor = disposables.add(new ListViewInfoAccessor(cellList));
  let visibleRanges = [{ start: 0, end: 100 }];
  const id = Date.now().toString();
  const notebookEditor = new class extends mock() {
    // eslint-disable-next-line local/code-must-use-super-dispose
    dispose() {
      viewModel.dispose();
    }
    notebookOptions = notebookOptions;
    onDidChangeModel = new Emitter().event;
    onDidChangeCellState = new Emitter().event;
    getViewModel() {
      return viewModel;
    }
    textModel = viewModel.notebookDocument;
    hasModel() {
      return !!viewModel;
    }
    getLength() {
      return viewModel.length;
    }
    getFocus() {
      return viewModel.getFocus();
    }
    getSelections() {
      return viewModel.getSelections();
    }
    setFocus(focus) {
      viewModel.updateSelectionsState({
        kind: SelectionStateType.Index,
        focus,
        selections: viewModel.getSelections()
      });
    }
    setSelections(selections) {
      viewModel.updateSelectionsState({
        kind: SelectionStateType.Index,
        focus: viewModel.getFocus(),
        selections
      });
    }
    getViewIndexByModelIndex(index) {
      return listViewInfoAccessor.getViewIndex(viewModel.viewCells[index]);
    }
    getCellRangeFromViewRange(startIndex, endIndex) {
      return listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex);
    }
    revealCellRangeInView() {
    }
    setHiddenAreas(_ranges) {
      return cellList.setHiddenAreas(_ranges, true);
    }
    getActiveCell() {
      const elements = cellList.getFocusedElements();
      if (elements && elements.length) {
        return elements[0];
      }
      return void 0;
    }
    hasOutputTextSelection() {
      return false;
    }
    changeModelDecorations() {
      return null;
    }
    focusElement() {
    }
    setCellEditorSelection() {
    }
    async revealRangeInCenterIfOutsideViewportAsync() {
    }
    async layoutNotebookCell() {
    }
    async createOutput() {
    }
    async removeInset() {
    }
    async focusNotebookCell(cell, focusItem) {
      cell.focusMode = focusItem === "editor" ? CellFocusMode.Editor : focusItem === "output" ? CellFocusMode.Output : CellFocusMode.Container;
    }
    cellAt(index) {
      return viewModel.cellAt(index);
    }
    getCellIndex(cell) {
      return viewModel.getCellIndex(cell);
    }
    getCellsInRange(range) {
      return viewModel.getCellsInRange(range);
    }
    getCellByHandle(handle) {
      return viewModel.getCellByHandle(handle);
    }
    getNextVisibleCellIndex(index) {
      return viewModel.getNextVisibleCellIndex(index);
    }
    getControl() {
      return this;
    }
    get onDidChangeSelection() {
      return viewModel.onDidChangeSelection;
    }
    get onDidChangeOptions() {
      return viewModel.onDidChangeOptions;
    }
    get onDidChangeViewCells() {
      return viewModel.onDidChangeViewCells;
    }
    async find(query, options) {
      const findMatches = viewModel.find(query, options).filter((match) => match.length > 0);
      return findMatches;
    }
    deltaCellDecorations() {
      return [];
    }
    onDidChangeVisibleRanges = Event.None;
    get visibleRanges() {
      return visibleRanges;
    }
    set visibleRanges(_ranges) {
      visibleRanges = _ranges;
    }
    getId() {
      return id;
    }
    setScrollTop(scrollTop) {
      cellList.scrollTop = scrollTop;
    }
    get scrollTop() {
      return cellList.scrollTop;
    }
    getLayoutInfo() {
      return {
        width: 0,
        height: 0,
        scrollHeight: cellList.getScrollHeight(),
        fontInfo: new FontInfo({
          pixelRatio: 1,
          fontFamily: "mockFont",
          fontWeight: "normal",
          fontSize: 14,
          fontFeatureSettings: EditorFontLigatures.OFF,
          fontVariationSettings: EditorFontVariations.OFF,
          lineHeight: 19,
          letterSpacing: 1.5,
          isMonospace: true,
          typicalHalfwidthCharacterWidth: 10,
          typicalFullwidthCharacterWidth: 20,
          canUseHalfwidthRightwardsArrow: true,
          spaceWidth: 10,
          middotWidth: 10,
          wsmiddotWidth: 10,
          maxDigitWidth: 10
        }, true),
        stickyHeight: 0
      };
    }
  }();
  return { editor: notebookEditor, viewModel };
}
__name(_createTestNotebookEditor, "_createTestNotebookEditor");
function createTestNotebookEditor(instantiationService, disposables, cells) {
  return _createTestNotebookEditor(instantiationService, disposables, cells);
}
__name(createTestNotebookEditor, "createTestNotebookEditor");
async function withTestNotebookDiffModel(originalCells, modifiedCells, callback) {
  const disposables = new DisposableStore();
  const instantiationService = setupInstantiationService(disposables);
  const originalNotebook = createTestNotebookEditor(instantiationService, disposables, originalCells);
  const modifiedNotebook = createTestNotebookEditor(instantiationService, disposables, modifiedCells);
  const originalResource = new class extends mock() {
    get notebook() {
      return originalNotebook.viewModel.notebookDocument;
    }
    get resource() {
      return originalNotebook.viewModel.notebookDocument.uri;
    }
  }();
  const modifiedResource = new class extends mock() {
    get notebook() {
      return modifiedNotebook.viewModel.notebookDocument;
    }
    get resource() {
      return modifiedNotebook.viewModel.notebookDocument.uri;
    }
  }();
  const model = new class extends mock() {
    get original() {
      return originalResource;
    }
    get modified() {
      return modifiedResource;
    }
  }();
  const res = await callback(model, disposables, instantiationService);
  if (res instanceof Promise) {
    res.finally(() => {
      originalNotebook.editor.dispose();
      originalNotebook.viewModel.notebookDocument.dispose();
      originalNotebook.viewModel.dispose();
      modifiedNotebook.editor.dispose();
      modifiedNotebook.viewModel.notebookDocument.dispose();
      modifiedNotebook.viewModel.dispose();
      disposables.dispose();
    });
  } else {
    originalNotebook.editor.dispose();
    originalNotebook.viewModel.notebookDocument.dispose();
    originalNotebook.viewModel.dispose();
    modifiedNotebook.editor.dispose();
    modifiedNotebook.viewModel.notebookDocument.dispose();
    modifiedNotebook.viewModel.dispose();
    disposables.dispose();
  }
  return res;
}
__name(withTestNotebookDiffModel, "withTestNotebookDiffModel");
async function withTestNotebook(cells, callback, accessor) {
  const disposables = new DisposableStore();
  const instantiationService = accessor ?? setupInstantiationService(disposables);
  const notebookEditor = _createTestNotebookEditor(instantiationService, disposables, cells);
  return runWithFakedTimers({ useFakeTimers: true }, async () => {
    const res = await callback(notebookEditor.editor, notebookEditor.viewModel, disposables, instantiationService);
    if (res instanceof Promise) {
      res.finally(() => {
        notebookEditor.editor.dispose();
        notebookEditor.viewModel.dispose();
        notebookEditor.editor.textModel.dispose();
        disposables.dispose();
      });
    } else {
      notebookEditor.editor.dispose();
      notebookEditor.viewModel.dispose();
      notebookEditor.editor.textModel.dispose();
      disposables.dispose();
    }
    return res;
  });
}
__name(withTestNotebook, "withTestNotebook");
function createNotebookCellList(instantiationService, disposables, viewContext) {
  const delegate = {
    getHeight(element) {
      return element.getHeight(17);
    },
    getTemplateId() {
      return "template";
    }
  };
  const baseCellRenderTemplate = new class extends mock() {
  }();
  const renderer = {
    templateId: "template",
    renderTemplate() {
      return baseCellRenderTemplate;
    },
    renderElement() {
    },
    disposeTemplate() {
    }
  };
  const notebookOptions = !!viewContext ? viewContext.notebookOptions : disposables.add(new NotebookOptions(mainWindow, false, void 0, instantiationService.get(IConfigurationService), instantiationService.get(INotebookExecutionStateService), instantiationService.get(ICodeEditorService)));
  const cellList = disposables.add(instantiationService.createInstance(
    NotebookCellList,
    "NotebookCellList",
    DOM.$("container"),
    notebookOptions,
    delegate,
    [renderer],
    instantiationService.get(IContextKeyService),
    {
      supportDynamicHeights: true,
      multipleSelectionSupport: true
    }
  ));
  return cellList;
}
__name(createNotebookCellList, "createNotebookCellList");
function valueBytesFromString(value) {
  return VSBuffer.fromString(value);
}
__name(valueBytesFromString, "valueBytesFromString");
class TestCellExecution {
  constructor(notebook, cellHandle, onComplete) {
    this.notebook = notebook;
    this.cellHandle = cellHandle;
    this.onComplete = onComplete;
  }
  static {
    __name(this, "TestCellExecution");
  }
  state = NotebookCellExecutionState.Unconfirmed;
  didPause = false;
  isPaused = false;
  confirm() {
  }
  update(updates) {
  }
  complete(complete) {
    this.onComplete();
  }
}
class TestNotebookExecutionStateService {
  static {
    __name(this, "TestNotebookExecutionStateService");
  }
  _serviceBrand;
  _executions = new ResourceMap();
  onDidChangeExecution = new Emitter().event;
  onDidChangeLastRunFailState = new Emitter().event;
  forceCancelNotebookExecutions(notebookUri) {
  }
  getCellExecutionsForNotebook(notebook) {
    return [];
  }
  getCellExecution(cellUri) {
    return this._executions.get(cellUri);
  }
  createCellExecution(notebook, cellHandle) {
    const onComplete = /* @__PURE__ */ __name(() => this._executions.delete(CellUri.generate(notebook, cellHandle)), "onComplete");
    const exe = new TestCellExecution(notebook, cellHandle, onComplete);
    this._executions.set(CellUri.generate(notebook, cellHandle), exe);
    return exe;
  }
  getCellExecutionsByHandleForNotebook(notebook) {
    return;
  }
  getLastFailedCellForNotebook(notebook) {
    return;
  }
  getExecution(notebook) {
    return;
  }
  createExecution(notebook) {
    throw new Error("Method not implemented.");
  }
}
export {
  NotebookEditorTestModel,
  TestCell,
  TestNotebookExecutionStateService,
  createNotebookCellList,
  createTestNotebookEditor,
  setupInstantiationService,
  valueBytesFromString,
  withTestNotebook,
  withTestNotebookDiffModel
};
//# sourceMappingURL=testNotebookEditor.js.map
