import { Emitter } from "../../../../../base/common/event.js";
import {
  Disposable,
  MutableDisposable,
  dispose
} from "../../../../../base/common/lifecycle.js";
import { Mimes } from "../../../../../base/common/mime.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { Selection } from "../../../../../editor/common/core/selection.js";
import * as editorCommon from "../../../../../editor/common/editorCommon.js";
import { SearchParams } from "../../../../../editor/common/model/textModelSearch.js";
import {
  readTransientState,
  writeTransientState
} from "../../../codeEditor/browser/toggleWordWrap.js";
import { InlineChatController } from "../../../inlineChat/browser/inlineChatController.js";
import {
  CellEditState,
  CellFocusMode,
  CursorAtBoundary,
  CursorAtLineBoundary
} from "../notebookBrowser.js";
class BaseCellViewModel extends Disposable {
  constructor(viewType, model, id, _viewContext, _configurationService, _modelService, _undoRedoService, _codeEditorService) {
    super();
    this.viewType = viewType;
    this.model = model;
    this.id = id;
    this._viewContext = _viewContext;
    this._configurationService = _configurationService;
    this._modelService = _modelService;
    this._undoRedoService = _undoRedoService;
    this._codeEditorService = _codeEditorService;
    this._register(
      model.onDidChangeMetadata(() => {
        this._onDidChangeState.fire({ metadataChanged: true });
      })
    );
    this._register(
      model.onDidChangeInternalMetadata((e) => {
        this._onDidChangeState.fire({ internalMetadataChanged: true });
        if (e.lastRunSuccessChanged) {
          this.layoutChange({});
        }
      })
    );
    this._register(
      this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("notebook.lineNumbers")) {
          this.lineNumbers = "inherit";
        }
      })
    );
    if (this.model.collapseState?.inputCollapsed) {
      this._inputCollapsed = true;
    }
    if (this.model.collapseState?.outputCollapsed) {
      this._outputCollapsed = true;
    }
    this._commentOptions = this._configurationService.getValue(
      "editor.comments",
      { overrideIdentifier: this.language }
    );
    this._register(
      this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("editor.comments")) {
          this._commentOptions = this._configurationService.getValue(
            "editor.comments",
            { overrideIdentifier: this.language }
          );
        }
      })
    );
  }
  _onDidChangeEditorAttachState = this._register(
    new Emitter()
  );
  // Do not merge this event with `onDidChangeState` as we are using `Event.once(onDidChangeEditorAttachState)` elsewhere.
  onDidChangeEditorAttachState = this._onDidChangeEditorAttachState.event;
  _onDidChangeState = this._register(
    new Emitter()
  );
  onDidChangeState = this._onDidChangeState.event;
  get handle() {
    return this.model.handle;
  }
  get uri() {
    return this.model.uri;
  }
  get lineCount() {
    return this.model.textBuffer.getLineCount();
  }
  get metadata() {
    return this.model.metadata;
  }
  get internalMetadata() {
    return this.model.internalMetadata;
  }
  get language() {
    return this.model.language;
  }
  get mime() {
    if (typeof this.model.mime === "string") {
      return this.model.mime;
    }
    switch (this.language) {
      case "markdown":
        return Mimes.markdown;
      default:
        return Mimes.text;
    }
  }
  _editState = CellEditState.Preview;
  _lineNumbers = "inherit";
  get lineNumbers() {
    return this._lineNumbers;
  }
  set lineNumbers(lineNumbers) {
    if (lineNumbers === this._lineNumbers) {
      return;
    }
    this._lineNumbers = lineNumbers;
    this._onDidChangeState.fire({ cellLineNumberChanged: true });
  }
  _commentOptions;
  get commentOptions() {
    return this._commentOptions;
  }
  set commentOptions(newOptions) {
    this._commentOptions = newOptions;
  }
  _focusMode = CellFocusMode.Container;
  get focusMode() {
    return this._focusMode;
  }
  set focusMode(newMode) {
    if (this._focusMode !== newMode) {
      this._focusMode = newMode;
      this._onDidChangeState.fire({ focusModeChanged: true });
    }
  }
  _textEditor;
  get editorAttached() {
    return !!this._textEditor;
  }
  _editorListeners = [];
  _editorViewStates = null;
  _editorTransientState = null;
  _resolvedCellDecorations = /* @__PURE__ */ new Map();
  _textModelRefChangeDisposable = this._register(
    new MutableDisposable()
  );
  _cellDecorationsChanged = this._register(
    new Emitter()
  );
  onCellDecorationsChanged = this._cellDecorationsChanged.event;
  _resolvedDecorations = /* @__PURE__ */ new Map();
  _lastDecorationId = 0;
  _cellStatusBarItems = /* @__PURE__ */ new Map();
  _onDidChangeCellStatusBarItems = this._register(
    new Emitter()
  );
  onDidChangeCellStatusBarItems = this._onDidChangeCellStatusBarItems.event;
  _lastStatusBarId = 0;
  get textModel() {
    return this.model.textModel;
  }
  hasModel() {
    return !!this.textModel;
  }
  _dragging = false;
  get dragging() {
    return this._dragging;
  }
  set dragging(v) {
    this._dragging = v;
    this._onDidChangeState.fire({ dragStateChanged: true });
  }
  _textModelRef;
  _inputCollapsed = false;
  get isInputCollapsed() {
    return this._inputCollapsed;
  }
  set isInputCollapsed(v) {
    this._inputCollapsed = v;
    this._onDidChangeState.fire({ inputCollapsedChanged: true });
  }
  _outputCollapsed = false;
  get isOutputCollapsed() {
    return this._outputCollapsed;
  }
  set isOutputCollapsed(v) {
    this._outputCollapsed = v;
    this._onDidChangeState.fire({ outputCollapsedChanged: true });
  }
  _commentHeight = 0;
  set commentHeight(height) {
    if (this._commentHeight === height) {
      return;
    }
    this._commentHeight = height;
    this.layoutChange(
      { commentHeight: true },
      "BaseCellViewModel#commentHeight"
    );
  }
  _isDisposed = false;
  assertTextModelAttached() {
    if (this.textModel && this._textEditor && this._textEditor.getModel() === this.textModel) {
      return true;
    }
    return false;
  }
  // private handleKeyDown(e: IKeyboardEvent) {
  // 	if (this.viewType === IPYNB_VIEW_TYPE && isWindows && e.ctrlKey && e.keyCode === KeyCode.Enter) {
  // 		this._keymapService.promptKeymapRecommendation();
  // 	}
  // }
  attachTextEditor(editor, estimatedHasHorizontalScrolling) {
    if (!editor.hasModel()) {
      throw new Error("Invalid editor: model is missing");
    }
    if (this._textEditor === editor) {
      if (this._editorListeners.length === 0) {
        this._editorListeners.push(
          this._textEditor.onDidChangeCursorSelection(() => {
            this._onDidChangeState.fire({ selectionChanged: true });
          })
        );
        this._onDidChangeState.fire({ selectionChanged: true });
      }
      return;
    }
    this._textEditor = editor;
    if (this._editorViewStates) {
      this._restoreViewState(this._editorViewStates);
    } else {
      if (estimatedHasHorizontalScrolling) {
        this._restoreViewState({
          contributionsState: {},
          cursorState: [],
          viewState: {
            scrollLeft: 0,
            firstPosition: { lineNumber: 1, column: 1 },
            firstPositionDeltaTop: this._viewContext.notebookOptions.getLayoutConfiguration().editorTopPadding
          }
        });
      }
    }
    if (this._editorTransientState) {
      writeTransientState(
        editor.getModel(),
        this._editorTransientState,
        this._codeEditorService
      );
    }
    if (this._isDisposed) {
      return;
    }
    editor.changeDecorations((accessor) => {
      this._resolvedDecorations.forEach((value, key) => {
        if (key.startsWith("_lazy_")) {
          const ret = accessor.addDecoration(
            value.options.range,
            value.options.options
          );
          this._resolvedDecorations.get(key).id = ret;
        } else {
          const ret = accessor.addDecoration(
            value.options.range,
            value.options.options
          );
          this._resolvedDecorations.get(key).id = ret;
        }
      });
    });
    this._editorListeners.push(
      editor.onDidChangeCursorSelection(() => {
        this._onDidChangeState.fire({ selectionChanged: true });
      })
    );
    const inlineChatController = InlineChatController.get(this._textEditor);
    if (inlineChatController) {
      this._editorListeners.push(
        inlineChatController.onWillStartSession(() => {
          if (this.textBuffer.getLength() === 0) {
            this.enableAutoLanguageDetection();
          }
        })
      );
    }
    this._onDidChangeState.fire({ selectionChanged: true });
    this._onDidChangeEditorAttachState.fire();
  }
  detachTextEditor() {
    this.saveViewState();
    this.saveTransientState();
    this._textEditor?.changeDecorations((accessor) => {
      this._resolvedDecorations.forEach((value) => {
        const resolvedid = value.id;
        if (resolvedid) {
          accessor.removeDecoration(resolvedid);
        }
      });
    });
    this._textEditor = void 0;
    dispose(this._editorListeners);
    this._editorListeners = [];
    this._onDidChangeEditorAttachState.fire();
    if (this._textModelRef) {
      this._textModelRef.dispose();
      this._textModelRef = void 0;
    }
    this._textModelRefChangeDisposable.clear();
  }
  getText() {
    return this.model.getValue();
  }
  getAlternativeId() {
    return this.model.alternativeId;
  }
  getTextLength() {
    return this.model.getTextLength();
  }
  enableAutoLanguageDetection() {
    this.model.enableAutoLanguageDetection();
  }
  saveViewState() {
    if (!this._textEditor) {
      return;
    }
    this._editorViewStates = this._textEditor.saveViewState();
  }
  saveTransientState() {
    if (!this._textEditor || !this._textEditor.hasModel()) {
      return;
    }
    this._editorTransientState = readTransientState(
      this._textEditor.getModel(),
      this._codeEditorService
    );
  }
  saveEditorViewState() {
    if (this._textEditor) {
      this._editorViewStates = this._textEditor.saveViewState();
    }
    return this._editorViewStates;
  }
  restoreEditorViewState(editorViewStates, totalHeight) {
    this._editorViewStates = editorViewStates;
  }
  _restoreViewState(state) {
    if (state) {
      this._textEditor?.restoreViewState(state);
    }
  }
  addModelDecoration(decoration) {
    if (!this._textEditor) {
      const id2 = ++this._lastDecorationId;
      const decorationId = `_lazy_${this.id};${id2}`;
      this._resolvedDecorations.set(decorationId, {
        options: decoration
      });
      return decorationId;
    }
    let id;
    this._textEditor.changeDecorations((accessor) => {
      id = accessor.addDecoration(decoration.range, decoration.options);
      this._resolvedDecorations.set(id, { id, options: decoration });
    });
    return id;
  }
  removeModelDecoration(decorationId) {
    const realDecorationId = this._resolvedDecorations.get(decorationId);
    if (this._textEditor && realDecorationId && realDecorationId.id !== void 0) {
      this._textEditor.changeDecorations((accessor) => {
        accessor.removeDecoration(realDecorationId.id);
      });
    }
    this._resolvedDecorations.delete(decorationId);
  }
  deltaModelDecorations(oldDecorations, newDecorations) {
    oldDecorations.forEach((id) => {
      this.removeModelDecoration(id);
    });
    const ret = newDecorations.map((option) => {
      return this.addModelDecoration(option);
    });
    return ret;
  }
  _removeCellDecoration(decorationId) {
    const options = this._resolvedCellDecorations.get(decorationId);
    this._resolvedCellDecorations.delete(decorationId);
    if (options) {
      for (const existingOptions of this._resolvedCellDecorations.values()) {
        if (options.className === existingOptions.className) {
          options.className = void 0;
        }
        if (options.outputClassName === existingOptions.outputClassName) {
          options.outputClassName = void 0;
        }
        if (options.gutterClassName === existingOptions.gutterClassName) {
          options.gutterClassName = void 0;
        }
        if (options.topClassName === existingOptions.topClassName) {
          options.topClassName = void 0;
        }
      }
      this._cellDecorationsChanged.fire({
        added: [],
        removed: [options]
      });
    }
  }
  _addCellDecoration(options) {
    const id = ++this._lastDecorationId;
    const decorationId = `_cell_${this.id};${id}`;
    this._resolvedCellDecorations.set(decorationId, options);
    this._cellDecorationsChanged.fire({ added: [options], removed: [] });
    return decorationId;
  }
  getCellDecorations() {
    return [...this._resolvedCellDecorations.values()];
  }
  getCellDecorationRange(decorationId) {
    if (this._textEditor) {
      return this._textEditor.getModel()?.getDecorationRange(decorationId) ?? null;
    }
    return null;
  }
  deltaCellDecorations(oldDecorations, newDecorations) {
    oldDecorations.forEach((id) => {
      this._removeCellDecoration(id);
    });
    const ret = newDecorations.map((option) => {
      return this._addCellDecoration(option);
    });
    return ret;
  }
  deltaCellStatusBarItems(oldItems, newItems) {
    oldItems.forEach((id) => {
      const item = this._cellStatusBarItems.get(id);
      if (item) {
        this._cellStatusBarItems.delete(id);
      }
    });
    const newIds = newItems.map((item) => {
      const id = ++this._lastStatusBarId;
      const itemId = `_cell_${this.id};${id}`;
      this._cellStatusBarItems.set(itemId, item);
      return itemId;
    });
    this._onDidChangeCellStatusBarItems.fire();
    return newIds;
  }
  getCellStatusBarItems() {
    return Array.from(this._cellStatusBarItems.values());
  }
  revealRangeInCenter(range) {
    this._textEditor?.revealRangeInCenter(
      range,
      editorCommon.ScrollType.Immediate
    );
  }
  setSelection(range) {
    this._textEditor?.setSelection(range);
  }
  setSelections(selections) {
    if (selections.length) {
      if (this._textEditor) {
        this._textEditor?.setSelections(selections);
      } else if (this._editorViewStates) {
        this._editorViewStates.cursorState = selections.map(
          (selection) => {
            return {
              inSelectionMode: !selection.isEmpty(),
              selectionStart: selection.getStartPosition(),
              position: selection.getEndPosition()
            };
          }
        );
      }
    }
  }
  getSelections() {
    return this._textEditor?.getSelections() ?? this._editorViewStates?.cursorState.map(
      (state) => new Selection(
        state.selectionStart.lineNumber,
        state.selectionStart.column,
        state.position.lineNumber,
        state.position.column
      )
    ) ?? [];
  }
  getSelectionsStartPosition() {
    if (this._textEditor) {
      const selections = this._textEditor.getSelections();
      return selections?.map((s) => s.getStartPosition());
    } else {
      const selections = this._editorViewStates?.cursorState;
      return selections?.map((s) => s.selectionStart);
    }
  }
  getLineScrollTopOffset(line) {
    if (!this._textEditor) {
      return 0;
    }
    const editorPadding = this._viewContext.notebookOptions.computeEditorPadding(
      this.internalMetadata,
      this.uri
    );
    return this._textEditor.getTopForLineNumber(line) + editorPadding.top;
  }
  getPositionScrollTopOffset(range) {
    if (!this._textEditor) {
      return 0;
    }
    const position = range instanceof Selection ? range.getPosition() : range.getStartPosition();
    const editorPadding = this._viewContext.notebookOptions.computeEditorPadding(
      this.internalMetadata,
      this.uri
    );
    return this._textEditor.getTopForPosition(
      position.lineNumber,
      position.column
    ) + editorPadding.top;
  }
  cursorAtLineBoundary() {
    if (!this._textEditor || !this.textModel || !this._textEditor.hasTextFocus()) {
      return CursorAtLineBoundary.None;
    }
    const selection = this._textEditor.getSelection();
    if (!selection || !selection.isEmpty()) {
      return CursorAtLineBoundary.None;
    }
    const currentLineLength = this.textModel.getLineLength(
      selection.startLineNumber
    );
    if (currentLineLength === 0) {
      return CursorAtLineBoundary.Both;
    }
    switch (selection.startColumn) {
      case 1:
        return CursorAtLineBoundary.Start;
      case currentLineLength + 1:
        return CursorAtLineBoundary.End;
      default:
        return CursorAtLineBoundary.None;
    }
  }
  cursorAtBoundary() {
    if (!this._textEditor) {
      return CursorAtBoundary.None;
    }
    if (!this.textModel) {
      return CursorAtBoundary.None;
    }
    const selection = this._textEditor.getSelection();
    if (!selection || !selection.isEmpty()) {
      return CursorAtBoundary.None;
    }
    const firstViewLineTop = this._textEditor.getTopForPosition(1, 1);
    const lastViewLineTop = this._textEditor.getTopForPosition(
      this.textModel.getLineCount(),
      this.textModel.getLineLength(this.textModel.getLineCount())
    );
    const selectionTop = this._textEditor.getTopForPosition(
      selection.startLineNumber,
      selection.startColumn
    );
    if (selectionTop === lastViewLineTop) {
      if (selectionTop === firstViewLineTop) {
        return CursorAtBoundary.Both;
      } else {
        return CursorAtBoundary.Bottom;
      }
    } else if (selectionTop === firstViewLineTop) {
      return CursorAtBoundary.Top;
    } else {
      return CursorAtBoundary.None;
    }
  }
  _editStateSource = "";
  get editStateSource() {
    return this._editStateSource;
  }
  updateEditState(newState, source) {
    this._editStateSource = source;
    if (newState === this._editState) {
      return;
    }
    this._editState = newState;
    this._onDidChangeState.fire({ editStateChanged: true });
    if (this._editState === CellEditState.Preview) {
      this.focusMode = CellFocusMode.Container;
    }
  }
  getEditState() {
    return this._editState;
  }
  get textBuffer() {
    return this.model.textBuffer;
  }
  /**
   * Text model is used for editing.
   */
  async resolveTextModel() {
    if (!this._textModelRef || !this.textModel) {
      this._textModelRef = await this._modelService.createModelReference(
        this.uri
      );
      if (this._isDisposed) {
        return this.textModel;
      }
      if (!this._textModelRef) {
        throw new Error(`Cannot resolve text model for ${this.uri}`);
      }
      this._textModelRefChangeDisposable.value = this.textModel.onDidChangeContent(
        () => this.onDidChangeTextModelContent()
      );
    }
    return this.textModel;
  }
  cellStartFind(value, options) {
    let cellMatches = [];
    const lineCount = this.textBuffer.getLineCount();
    const findRange = options.findScope?.selectedTextRanges ?? [
      new Range(
        1,
        1,
        lineCount,
        this.textBuffer.getLineLength(lineCount) + 1
      )
    ];
    if (this.assertTextModelAttached()) {
      cellMatches = this.textModel.findMatches(
        value,
        findRange,
        options.regex || false,
        options.caseSensitive || false,
        options.wholeWord ? options.wordSeparators || null : null,
        options.regex || false
      );
    } else {
      const searchParams = new SearchParams(
        value,
        options.regex || false,
        options.caseSensitive || false,
        options.wholeWord ? options.wordSeparators || null : null
      );
      const searchData = searchParams.parseSearchRequest();
      if (!searchData) {
        return null;
      }
      findRange.forEach((range) => {
        cellMatches.push(
          ...this.textBuffer.findMatchesLineByLine(
            new Range(
              range.startLineNumber,
              range.startColumn,
              range.endLineNumber,
              range.endColumn
            ),
            searchData,
            options.regex || false,
            1e3
          )
        );
      });
    }
    return cellMatches;
  }
  dispose() {
    this._isDisposed = true;
    super.dispose();
    dispose(this._editorListeners);
    if (this._undoRedoService.getUriComparisonKey(this.uri) === this.uri.toString()) {
      this._undoRedoService.removeElements(this.uri);
    }
    this._textModelRef?.dispose();
  }
  toJSON() {
    return {
      handle: this.handle
    };
  }
}
export {
  BaseCellViewModel
};
