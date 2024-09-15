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
import { localize } from "../../../../../../nls.js";
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { KeyCode, KeyMod } from "../../../../../../base/common/keyCodes.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../../base/common/map.js";
import { URI } from "../../../../../../base/common/uri.js";
import { EditorConfiguration } from "../../../../../../editor/browser/config/editorConfiguration.js";
import { PastePayload, ICodeEditor } from "../../../../../../editor/browser/editorBrowser.js";
import { RedoCommand, UndoCommand } from "../../../../../../editor/browser/editorExtensions.js";
import { CodeEditorWidget } from "../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { IEditorConfiguration } from "../../../../../../editor/common/config/editorConfiguration.js";
import { Position } from "../../../../../../editor/common/core/position.js";
import { Range } from "../../../../../../editor/common/core/range.js";
import { Selection, SelectionDirection } from "../../../../../../editor/common/core/selection.js";
import { IWordAtPosition, USUAL_WORD_SEPARATORS } from "../../../../../../editor/common/core/wordHelper.js";
import { CommandExecutor, CursorsController } from "../../../../../../editor/common/cursor/cursor.js";
import { DeleteOperations } from "../../../../../../editor/common/cursor/cursorDeleteOperations.js";
import { CursorConfiguration, ICursorSimpleModel } from "../../../../../../editor/common/cursorCommon.js";
import { CursorChangeReason } from "../../../../../../editor/common/cursorEvents.js";
import { Handler, ReplacePreviousCharPayload, CompositionTypePayload } from "../../../../../../editor/common/editorCommon.js";
import { ILanguageConfigurationService } from "../../../../../../editor/common/languages/languageConfigurationRegistry.js";
import { IModelDeltaDecoration, ITextModel, PositionAffinity } from "../../../../../../editor/common/model.js";
import { indentOfLine } from "../../../../../../editor/common/model/textModel.js";
import { ITextModelService } from "../../../../../../editor/common/services/resolverService.js";
import { ICoordinatesConverter } from "../../../../../../editor/common/viewModel.js";
import { ViewModelEventsCollector } from "../../../../../../editor/common/viewModelEventDispatcher.js";
import { IAccessibilityService } from "../../../../../../platform/accessibility/common/accessibility.js";
import { MenuId, registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../../../platform/contextkey/common/contextkey.js";
import { ServicesAccessor } from "../../../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IPastFutureElements, IUndoRedoElement, IUndoRedoService, UndoRedoElementType } from "../../../../../../platform/undoRedo/common/undoRedo.js";
import { registerWorkbenchContribution2, WorkbenchPhase } from "../../../../../common/contributions.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { NOTEBOOK_CELL_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR } from "../../../common/notebookContextKeys.js";
import { INotebookActionContext, NotebookAction } from "../../controller/coreActions.js";
import { getNotebookEditorFromEditorPane, ICellViewModel, INotebookEditor, INotebookEditorContribution } from "../../notebookBrowser.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { CellEditorOptions } from "../../view/cellParts/cellEditorOptions.js";
const NOTEBOOK_ADD_FIND_MATCH_TO_SELECTION_ID = "notebook.addFindMatchToSelection";
var NotebookMultiCursorState = /* @__PURE__ */ ((NotebookMultiCursorState2) => {
  NotebookMultiCursorState2[NotebookMultiCursorState2["Idle"] = 0] = "Idle";
  NotebookMultiCursorState2[NotebookMultiCursorState2["Selecting"] = 1] = "Selecting";
  NotebookMultiCursorState2[NotebookMultiCursorState2["Editing"] = 2] = "Editing";
  return NotebookMultiCursorState2;
})(NotebookMultiCursorState || {});
const NOTEBOOK_MULTI_SELECTION_CONTEXT = {
  IsNotebookMultiSelect: new RawContextKey("isNotebookMultiSelect", false),
  NotebookMultiSelectState: new RawContextKey("notebookMultiSelectState", 0 /* Idle */)
};
let NotebookMultiCursorController = class extends Disposable {
  constructor(notebookEditor, contextKeyService, textModelService, languageConfigurationService, accessibilityService, configurationService, undoRedoService) {
    super();
    this.notebookEditor = notebookEditor;
    this.contextKeyService = contextKeyService;
    this.textModelService = textModelService;
    this.languageConfigurationService = languageConfigurationService;
    this.accessibilityService = accessibilityService;
    this.configurationService = configurationService;
    this.undoRedoService = undoRedoService;
    if (!this.configurationService.getValue("notebook.multiSelect.enabled")) {
      return;
    }
    this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
    this._register(this.onDidChangeAnchorCell(() => {
      this.updateCursorsControllers();
      this.updateAnchorListeners();
    }));
  }
  static {
    __name(this, "NotebookMultiCursorController");
  }
  static id = "notebook.multiCursorController";
  state = 0 /* Idle */;
  word = "";
  trackedMatches = [];
  _onDidChangeAnchorCell = this._register(new Emitter());
  onDidChangeAnchorCell = this._onDidChangeAnchorCell.event;
  anchorCell;
  anchorDisposables = this._register(new DisposableStore());
  cursorsDisposables = this._register(new DisposableStore());
  cursorsControllers = new ResourceMap();
  _nbIsMultiSelectSession = NOTEBOOK_MULTI_SELECTION_CONTEXT.IsNotebookMultiSelect.bindTo(this.contextKeyService);
  _nbMultiSelectState = NOTEBOOK_MULTI_SELECTION_CONTEXT.NotebookMultiSelectState.bindTo(this.contextKeyService);
  updateCursorsControllers() {
    this.cursorsDisposables.clear();
    this.trackedMatches.forEach(async (match) => {
      const textModelRef = await this.textModelService.createModelReference(match.cellViewModel.uri);
      const textModel = textModelRef.object.textEditorModel;
      if (!textModel) {
        return;
      }
      const cursorSimpleModel = this.constructCursorSimpleModel(match.cellViewModel);
      const converter = this.constructCoordinatesConverter();
      const editorConfig = match.config;
      const controller = this.cursorsDisposables.add(new CursorsController(
        textModel,
        cursorSimpleModel,
        converter,
        new CursorConfiguration(textModel.getLanguageId(), textModel.getOptions(), editorConfig, this.languageConfigurationService)
      ));
      controller.setSelections(new ViewModelEventsCollector(), void 0, match.wordSelections, CursorChangeReason.Explicit);
      this.cursorsControllers.set(match.cellViewModel.uri, controller);
    });
  }
  constructCoordinatesConverter() {
    return {
      convertViewPositionToModelPosition(viewPosition) {
        return viewPosition;
      },
      convertViewRangeToModelRange(viewRange) {
        return viewRange;
      },
      validateViewPosition(viewPosition, expectedModelPosition) {
        return viewPosition;
      },
      validateViewRange(viewRange, expectedModelRange) {
        return viewRange;
      },
      convertModelPositionToViewPosition(modelPosition, affinity, allowZeroLineNumber, belowHiddenRanges) {
        return modelPosition;
      },
      convertModelRangeToViewRange(modelRange, affinity) {
        return modelRange;
      },
      modelPositionIsVisible(modelPosition) {
        return true;
      },
      getModelLineViewLineCount(modelLineNumber) {
        return 1;
      },
      getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
        return modelLineNumber;
      }
    };
  }
  constructCursorSimpleModel(cell) {
    return {
      getLineCount() {
        return cell.textBuffer.getLineCount();
      },
      getLineContent(lineNumber) {
        return cell.textBuffer.getLineContent(lineNumber);
      },
      getLineMinColumn(lineNumber) {
        return cell.textBuffer.getLineMinColumn(lineNumber);
      },
      getLineMaxColumn(lineNumber) {
        return cell.textBuffer.getLineMaxColumn(lineNumber);
      },
      getLineFirstNonWhitespaceColumn(lineNumber) {
        return cell.textBuffer.getLineFirstNonWhitespaceColumn(lineNumber);
      },
      getLineLastNonWhitespaceColumn(lineNumber) {
        return cell.textBuffer.getLineLastNonWhitespaceColumn(lineNumber);
      },
      normalizePosition(position, affinity) {
        return position;
      },
      getLineIndentColumn(lineNumber) {
        return indentOfLine(cell.textBuffer.getLineContent(lineNumber)) + 1;
      }
    };
  }
  updateAnchorListeners() {
    this.anchorDisposables.clear();
    if (!this.anchorCell) {
      throw new Error("Anchor cell is undefined");
    }
    this.anchorDisposables.add(this.anchorCell[1].onWillType((input) => {
      const collector = new ViewModelEventsCollector();
      this.trackedMatches.forEach((match) => {
        const controller = this.cursorsControllers.get(match.cellViewModel.uri);
        if (!controller) {
          return;
        }
        if (match.cellViewModel.handle !== this.anchorCell?.[0].handle) {
          controller.type(collector, input, "keyboard");
        }
      });
    }));
    this.anchorDisposables.add(this.anchorCell[1].onDidType(() => {
      this.state = 2 /* Editing */;
      this._nbMultiSelectState.set(2 /* Editing */);
      const anchorController = this.cursorsControllers.get(this.anchorCell[0].uri);
      if (!anchorController) {
        return;
      }
      const activeSelections = this.notebookEditor.activeCodeEditor?.getSelections();
      if (!activeSelections) {
        return;
      }
      anchorController.setSelections(new ViewModelEventsCollector(), "keyboard", activeSelections, CursorChangeReason.Explicit);
      this.trackedMatches.forEach((match) => {
        const controller = this.cursorsControllers.get(match.cellViewModel.uri);
        if (!controller) {
          return;
        }
        match.initialSelection = controller.getSelection();
        match.wordSelections = [];
      });
      this.updateLazyDecorations();
    }));
    this.anchorDisposables.add(this.anchorCell[1].onDidChangeCursorSelection((e) => {
      if (e.source !== "keyboard") {
        return;
      }
      this.trackedMatches.forEach((match) => {
        const controller = this.cursorsControllers.get(match.cellViewModel.uri);
        if (!controller) {
          return;
        }
        controller.setSelections(new ViewModelEventsCollector(), e.source, [e.selection], CursorChangeReason.Explicit);
        this.updateLazyDecorations();
      });
    }));
    this.anchorDisposables.add(this.anchorCell[1].onWillTriggerEditorOperationEvent((e) => {
      this.trackedMatches.forEach((match) => {
        if (match.cellViewModel.handle === this.anchorCell?.[0].handle) {
          return;
        }
        const eventsCollector = new ViewModelEventsCollector();
        const controller = this.cursorsControllers.get(match.cellViewModel.uri);
        if (!controller) {
          return;
        }
        switch (e.handlerId) {
          case Handler.CompositionStart:
            controller.startComposition(eventsCollector);
            return;
          case Handler.CompositionEnd:
            controller.endComposition(eventsCollector, e.source);
            return;
          case Handler.ReplacePreviousChar: {
            const args = e.payload;
            controller.compositionType(eventsCollector, args.text || "", args.replaceCharCnt || 0, 0, 0, e.source);
            return;
          }
          case Handler.CompositionType: {
            const args = e.payload;
            controller.compositionType(eventsCollector, args.text || "", args.replacePrevCharCnt || 0, args.replaceNextCharCnt || 0, args.positionDelta || 0, e.source);
            return;
          }
          case Handler.Paste: {
            const args = e.payload;
            controller.paste(eventsCollector, args.text || "", args.pasteOnNewLine || false, args.multicursorText || null, e.source);
            return;
          }
          case Handler.Cut:
            controller.cut(eventsCollector, e.source);
            return;
        }
      });
    }));
    this.anchorDisposables.add(this.anchorCell[1].onDidChangeCursorSelection((e) => {
      if (e.source === "mouse" || e.source === "deleteRight") {
        this.resetToIdleState();
      }
    }));
    this.anchorDisposables.add(this.anchorCell[1].onDidBlurEditorWidget(() => {
      if (this.state === 1 /* Selecting */ || this.state === 2 /* Editing */) {
        this.resetToIdleState();
      }
    }));
  }
  updateFinalUndoRedo() {
    const anchorCellModel = this.anchorCell?.[1].getModel();
    if (!anchorCellModel) {
      return;
    }
    const newElementsMap = new ResourceMap();
    const resources = [];
    this.trackedMatches.forEach((trackedMatch) => {
      const undoRedoState = trackedMatch.undoRedoHistory;
      if (!undoRedoState) {
        return;
      }
      resources.push(trackedMatch.cellViewModel.uri);
      const currentPastElements = this.undoRedoService.getElements(trackedMatch.cellViewModel.uri).past.slice();
      const oldPastElements = trackedMatch.undoRedoHistory.past.slice();
      const newElements = currentPastElements.slice(oldPastElements.length);
      if (newElements.length === 0) {
        return;
      }
      newElementsMap.set(trackedMatch.cellViewModel.uri, newElements);
      this.undoRedoService.removeElements(trackedMatch.cellViewModel.uri);
      oldPastElements.forEach((element) => {
        this.undoRedoService.pushElement(element);
      });
    });
    this.undoRedoService.pushElement({
      type: UndoRedoElementType.Workspace,
      resources,
      label: "Multi Cursor Edit",
      code: "multiCursorEdit",
      confirmBeforeUndo: false,
      undo: /* @__PURE__ */ __name(async () => {
        newElementsMap.forEach(async (value) => {
          value.reverse().forEach(async (element) => {
            await element.undo();
          });
        });
      }, "undo"),
      redo: /* @__PURE__ */ __name(async () => {
        newElementsMap.forEach(async (value) => {
          value.forEach(async (element) => {
            await element.redo();
          });
        });
      }, "redo")
    });
  }
  resetToIdleState() {
    this.state = 0 /* Idle */;
    this._nbMultiSelectState.set(0 /* Idle */);
    this._nbIsMultiSelectSession.set(false);
    this.updateFinalUndoRedo();
    this.trackedMatches.forEach((match) => {
      this.clearDecorations(match);
      match.cellViewModel.setSelections([match.initialSelection]);
    });
    this.anchorDisposables.clear();
    this.cursorsDisposables.clear();
    this.cursorsControllers.clear();
    this.trackedMatches = [];
  }
  async findAndTrackNextSelection(cell) {
    if (this.state === 0 /* Idle */) {
      const textModel = cell.textModel;
      if (!textModel) {
        return;
      }
      const inputSelection = cell.getSelections()[0];
      const word = this.getWord(inputSelection, textModel);
      if (!word) {
        return;
      }
      this.word = word.word;
      const newSelection = new Selection(
        inputSelection.startLineNumber,
        word.startColumn,
        inputSelection.startLineNumber,
        word.endColumn
      );
      cell.setSelections([newSelection]);
      this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
      if (!this.anchorCell || this.anchorCell[0].handle !== cell.handle) {
        throw new Error("Active cell is not the same as the cell passed as context");
      }
      if (!(this.anchorCell[1] instanceof CodeEditorWidget)) {
        throw new Error("Active cell is not an instance of CodeEditorWidget");
      }
      textModel.pushStackElement();
      this.trackedMatches = [];
      const editorConfig = this.constructCellEditorOptions(this.anchorCell[0]);
      const newMatch = {
        cellViewModel: cell,
        initialSelection: inputSelection,
        wordSelections: [newSelection],
        config: editorConfig,
        // cache this in the match so we can create new cursors controllers with the correct language config
        decorationIds: [],
        undoRedoHistory: this.undoRedoService.getElements(cell.uri)
      };
      this.trackedMatches.push(newMatch);
      this.initializeMultiSelectDecorations(newMatch);
      this._nbIsMultiSelectSession.set(true);
      this.state = 1 /* Selecting */;
      this._nbMultiSelectState.set(1 /* Selecting */);
      this._onDidChangeAnchorCell.fire();
    } else if (this.state === 1 /* Selecting */) {
      const notebookTextModel = this.notebookEditor.textModel;
      if (!notebookTextModel) {
        return;
      }
      const index = this.notebookEditor.getCellIndex(cell);
      if (index === void 0) {
        return;
      }
      const findResult = notebookTextModel.findNextMatch(
        this.word,
        { cellIndex: index, position: cell.getSelections()[cell.getSelections().length - 1].getEndPosition() },
        false,
        true,
        USUAL_WORD_SEPARATORS
        //! might want to get these from the editor config
      );
      if (!findResult) {
        return;
      }
      const resultCellViewModel = this.notebookEditor.getCellByHandle(findResult.cell.handle);
      if (!resultCellViewModel) {
        return;
      }
      let newMatch;
      if (findResult.cell.handle !== cell.handle) {
        await this.notebookEditor.revealRangeInViewAsync(resultCellViewModel, findResult.match.range);
        this.notebookEditor.focusNotebookCell(resultCellViewModel, "editor");
        const initialSelection = resultCellViewModel.getSelections()[0];
        const newSelection = Selection.fromRange(findResult.match.range, SelectionDirection.LTR);
        resultCellViewModel.setSelections([newSelection]);
        this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
        if (!this.anchorCell || !(this.anchorCell[1] instanceof CodeEditorWidget)) {
          throw new Error("Active cell is not an instance of CodeEditorWidget");
        }
        const textModel = await resultCellViewModel.resolveTextModel();
        textModel.pushStackElement();
        newMatch = {
          cellViewModel: resultCellViewModel,
          initialSelection,
          wordSelections: [newSelection],
          config: this.constructCellEditorOptions(this.anchorCell[0]),
          decorationIds: [],
          undoRedoHistory: this.undoRedoService.getElements(resultCellViewModel.uri)
        };
        this.trackedMatches.push(newMatch);
        this._onDidChangeAnchorCell.fire();
      } else {
        newMatch = this.trackedMatches.find((match) => match.cellViewModel.handle === findResult.cell.handle);
        newMatch.wordSelections.push(Selection.fromRange(findResult.match.range, SelectionDirection.LTR));
        resultCellViewModel.setSelections(newMatch.wordSelections);
      }
      this.initializeMultiSelectDecorations(newMatch);
    }
  }
  async deleteLeft() {
    this.trackedMatches.forEach((match) => {
      const controller = this.cursorsControllers.get(match.cellViewModel.uri);
      if (!controller) {
        return;
      }
      const [, commands] = DeleteOperations.deleteLeft(
        controller.getPrevEditOperationType(),
        controller.context.cursorConfig,
        controller.context.model,
        controller.getSelections(),
        controller.getAutoClosedCharacters()
      );
      const delSelections = CommandExecutor.executeCommands(controller.context.model, controller.getSelections(), commands);
      if (!delSelections) {
        return;
      }
      controller.setSelections(new ViewModelEventsCollector(), void 0, delSelections, CursorChangeReason.Explicit);
    });
  }
  async undo() {
    const models = [];
    for (const match of this.trackedMatches) {
      const model = await match.cellViewModel.resolveTextModel();
      if (model) {
        models.push(model);
      }
    }
    await Promise.all(models.map((model) => model.undo()));
  }
  async redo() {
    const models = [];
    for (const match of this.trackedMatches) {
      const model = await match.cellViewModel.resolveTextModel();
      if (model) {
        models.push(model);
      }
    }
    await Promise.all(models.map((model) => model.redo()));
  }
  constructCellEditorOptions(cell) {
    const cellEditorOptions = new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(cell.language), this.notebookEditor.notebookOptions, this.configurationService);
    const options = cellEditorOptions.getUpdatedValue(cell.internalMetadata, cell.uri);
    return new EditorConfiguration(false, MenuId.EditorContent, options, null, this.accessibilityService);
  }
  /**
   * Updates the multicursor selection decorations for a specific matched cell
   *
   * @param match -- match object containing the viewmodel + selections
   */
  initializeMultiSelectDecorations(match) {
    const decorations = [];
    match.wordSelections.forEach((selection) => {
      decorations.push({
        range: selection,
        options: {
          description: "",
          className: "nb-multicursor-selection"
        }
      });
    });
    match.decorationIds = match.cellViewModel.deltaModelDecorations(
      match.decorationIds,
      decorations
    );
  }
  //TODO: make sure nothing happens for the anchor cell ONCE THE DECORATIONS ARE PRETTY-IFIED
  updateLazyDecorations() {
    this.trackedMatches.forEach((match) => {
      const cellIndex = this.notebookEditor.getCellIndex(match.cellViewModel);
      if (cellIndex === void 0) {
        return;
      }
      const controller = this.cursorsControllers.get(match.cellViewModel.uri);
      if (!controller) {
        return;
      }
      const selections = controller.getSelections();
      const newDecorations = selections?.map((selection) => {
        return {
          range: selection,
          options: {
            description: "",
            className: "nb-multicursor-selection"
          }
        };
      });
      match.decorationIds = match.cellViewModel.deltaModelDecorations(
        match.decorationIds,
        newDecorations ?? []
      );
    });
  }
  clearDecorations(match) {
    match.decorationIds = match.cellViewModel.deltaModelDecorations(
      match.decorationIds,
      []
    );
  }
  getWord(selection, model) {
    const lineNumber = selection.startLineNumber;
    const startColumn = selection.startColumn;
    if (model.isDisposed()) {
      return null;
    }
    return model.getWordAtPosition({
      lineNumber,
      column: startColumn
    });
  }
  dispose() {
    super.dispose();
    this.anchorDisposables.dispose();
    this.cursorsDisposables.dispose();
    this.trackedMatches.forEach((match) => {
      this.clearDecorations(match);
    });
    this.trackedMatches = [];
  }
};
NotebookMultiCursorController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, ILanguageConfigurationService),
  __decorateParam(4, IAccessibilityService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IUndoRedoService)
], NotebookMultiCursorController);
class NotebookAddMatchToMultiSelectionAction extends NotebookAction {
  static {
    __name(this, "NotebookAddMatchToMultiSelectionAction");
  }
  constructor() {
    super({
      id: NOTEBOOK_ADD_FIND_MATCH_TO_SELECTION_ID,
      title: localize("addFindMatchToSelection", "Add Find Match to Selection"),
      keybinding: {
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("config.notebook.multiSelect.enabled", true),
          NOTEBOOK_IS_ACTIVE_EDITOR,
          NOTEBOOK_CELL_EDITOR_FOCUSED
        ),
        primary: KeyMod.CtrlCmd | KeyCode.KeyD,
        weight: KeybindingWeight.WorkbenchContrib
      }
    });
  }
  async runWithContext(accessor, context) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    if (!context.cell) {
      return;
    }
    const controller = editor.getContribution(NotebookMultiCursorController.id);
    controller.findAndTrackNextSelection(context.cell);
  }
}
class NotebookExitMultiSelectionAction extends NotebookAction {
  static {
    __name(this, "NotebookExitMultiSelectionAction");
  }
  constructor() {
    super({
      id: "noteMultiCursor.exit",
      title: localize("exitMultiSelection", "Exit Multi Cursor Mode"),
      keybinding: {
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("config.notebook.multiSelect.enabled", true),
          NOTEBOOK_IS_ACTIVE_EDITOR,
          NOTEBOOK_MULTI_SELECTION_CONTEXT.IsNotebookMultiSelect
        ),
        primary: KeyCode.Escape,
        weight: KeybindingWeight.WorkbenchContrib
      }
    });
  }
  async runWithContext(accessor, context) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const controller = editor.getContribution(NotebookMultiCursorController.id);
    controller.resetToIdleState();
  }
}
class NotebookDeleteLeftMultiSelectionAction extends NotebookAction {
  static {
    __name(this, "NotebookDeleteLeftMultiSelectionAction");
  }
  constructor() {
    super({
      id: "noteMultiCursor.deleteLeft",
      title: localize("deleteLeftMultiSelection", "Delete Left"),
      keybinding: {
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("config.notebook.multiSelect.enabled", true),
          NOTEBOOK_IS_ACTIVE_EDITOR,
          NOTEBOOK_MULTI_SELECTION_CONTEXT.IsNotebookMultiSelect,
          ContextKeyExpr.or(
            NOTEBOOK_MULTI_SELECTION_CONTEXT.NotebookMultiSelectState.isEqualTo(1 /* Selecting */),
            NOTEBOOK_MULTI_SELECTION_CONTEXT.NotebookMultiSelectState.isEqualTo(2 /* Editing */)
          )
        ),
        primary: KeyCode.Backspace,
        weight: KeybindingWeight.WorkbenchContrib
      }
    });
  }
  async runWithContext(accessor, context) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const controller = editor.getContribution(NotebookMultiCursorController.id);
    controller.deleteLeft();
  }
}
let NotebookMultiCursorUndoRedoContribution = class extends Disposable {
  constructor(_editorService, configurationService) {
    super();
    this._editorService = _editorService;
    this.configurationService = configurationService;
    if (!this.configurationService.getValue("notebook.multiSelect.enabled")) {
      return;
    }
    const PRIORITY = 10005;
    this._register(UndoCommand.addImplementation(PRIORITY, "notebook-multicursor-undo-redo", () => {
      const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
      if (!editor) {
        return false;
      }
      if (!editor.hasModel()) {
        return false;
      }
      const controller = editor.getContribution(NotebookMultiCursorController.id);
      return controller.undo();
    }, ContextKeyExpr.and(
      ContextKeyExpr.equals("config.notebook.multiSelect.enabled", true),
      NOTEBOOK_IS_ACTIVE_EDITOR,
      NOTEBOOK_MULTI_SELECTION_CONTEXT.IsNotebookMultiSelect
    )));
    this._register(RedoCommand.addImplementation(PRIORITY, "notebook-multicursor-undo-redo", () => {
      const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
      if (!editor) {
        return false;
      }
      if (!editor.hasModel()) {
        return false;
      }
      const controller = editor.getContribution(NotebookMultiCursorController.id);
      return controller.redo();
    }, ContextKeyExpr.and(
      ContextKeyExpr.equals("config.notebook.multiSelect.enabled", true),
      NOTEBOOK_IS_ACTIVE_EDITOR,
      NOTEBOOK_MULTI_SELECTION_CONTEXT.IsNotebookMultiSelect
    )));
  }
  static {
    __name(this, "NotebookMultiCursorUndoRedoContribution");
  }
  static ID = "workbench.contrib.notebook.multiCursorUndoRedo";
};
NotebookMultiCursorUndoRedoContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IConfigurationService)
], NotebookMultiCursorUndoRedoContribution);
registerNotebookContribution(NotebookMultiCursorController.id, NotebookMultiCursorController);
registerAction2(NotebookAddMatchToMultiSelectionAction);
registerAction2(NotebookExitMultiSelectionAction);
registerAction2(NotebookDeleteLeftMultiSelectionAction);
registerWorkbenchContribution2(NotebookMultiCursorUndoRedoContribution.ID, NotebookMultiCursorUndoRedoContribution, WorkbenchPhase.BlockRestore);
export {
  NOTEBOOK_MULTI_SELECTION_CONTEXT,
  NotebookMultiCursorController
};
//# sourceMappingURL=notebookMulticursor.js.map
