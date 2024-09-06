import { Event } from "vs/base/common/event";
import { Disposable, IReference } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { IEditorCommentsOptions } from "vs/editor/common/config/editorOptions";
import { IPosition } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { Selection } from "vs/editor/common/core/selection";
import * as editorCommon from "vs/editor/common/editorCommon";
import * as model from "vs/editor/common/model";
import { IResolvedTextEditorModel, ITextModelService } from "vs/editor/common/services/resolverService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IUndoRedoService } from "vs/platform/undoRedo/common/undoRedo";
import { CellEditState, CellFocusMode, CellLayoutChangeEvent, CursorAtBoundary, CursorAtLineBoundary, IEditableCellViewModel, INotebookCellDecorationOptions } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookOptionsChangeEvent } from "vs/workbench/contrib/notebook/browser/notebookOptions";
import { CellViewModelStateChangeEvent } from "vs/workbench/contrib/notebook/browser/notebookViewEvents";
import { ViewContext } from "vs/workbench/contrib/notebook/browser/viewModel/viewContext";
import { NotebookCellTextModel } from "vs/workbench/contrib/notebook/common/model/notebookCellTextModel";
import { CellKind, INotebookCellStatusBarItem, INotebookFindOptions } from "vs/workbench/contrib/notebook/common/notebookCommon";
export declare abstract class BaseCellViewModel extends Disposable {
    readonly viewType: string;
    readonly model: NotebookCellTextModel;
    id: string;
    private readonly _viewContext;
    private readonly _configurationService;
    private readonly _modelService;
    private readonly _undoRedoService;
    private readonly _codeEditorService;
    protected readonly _onDidChangeEditorAttachState: any;
    readonly onDidChangeEditorAttachState: any;
    protected readonly _onDidChangeState: any;
    readonly onDidChangeState: Event<CellViewModelStateChangeEvent>;
    get handle(): any;
    get uri(): any;
    get lineCount(): any;
    get metadata(): any;
    get internalMetadata(): any;
    get language(): any;
    get mime(): string;
    abstract cellKind: CellKind;
    private _editState;
    private _lineNumbers;
    get lineNumbers(): "on" | "off" | "inherit";
    set lineNumbers(lineNumbers: "on" | "off" | "inherit");
    private _commentOptions;
    get commentOptions(): IEditorCommentsOptions;
    set commentOptions(newOptions: IEditorCommentsOptions);
    private _focusMode;
    get focusMode(): CellFocusMode;
    set focusMode(newMode: CellFocusMode);
    protected _textEditor?: ICodeEditor;
    get editorAttached(): boolean;
    private _editorListeners;
    private _editorViewStates;
    private _editorTransientState;
    private _resolvedCellDecorations;
    private readonly _textModelRefChangeDisposable;
    private readonly _cellDecorationsChanged;
    onCellDecorationsChanged: Event<{
        added: INotebookCellDecorationOptions[];
        removed: INotebookCellDecorationOptions[];
    }>;
    private _resolvedDecorations;
    private _lastDecorationId;
    private _cellStatusBarItems;
    private readonly _onDidChangeCellStatusBarItems;
    readonly onDidChangeCellStatusBarItems: Event<void>;
    private _lastStatusBarId;
    get textModel(): model.ITextModel | undefined;
    hasModel(): this is IEditableCellViewModel;
    private _dragging;
    get dragging(): boolean;
    set dragging(v: boolean);
    protected _textModelRef: IReference<IResolvedTextEditorModel> | undefined;
    private _inputCollapsed;
    get isInputCollapsed(): boolean;
    set isInputCollapsed(v: boolean);
    private _outputCollapsed;
    get isOutputCollapsed(): boolean;
    set isOutputCollapsed(v: boolean);
    protected _commentHeight: number;
    set commentHeight(height: number);
    private _isDisposed;
    constructor(viewType: string, model: NotebookCellTextModel, id: string, _viewContext: ViewContext, _configurationService: IConfigurationService, _modelService: ITextModelService, _undoRedoService: IUndoRedoService, _codeEditorService: ICodeEditorService);
    abstract updateOptions(e: NotebookOptionsChangeEvent): void;
    abstract getHeight(lineHeight: number): number;
    abstract onDeselect(): void;
    abstract layoutChange(change: CellLayoutChangeEvent, source?: string): void;
    assertTextModelAttached(): boolean;
    attachTextEditor(editor: ICodeEditor, estimatedHasHorizontalScrolling?: boolean): void;
    detachTextEditor(): void;
    getText(): string;
    getAlternativeId(): number;
    getTextLength(): number;
    enableAutoLanguageDetection(): void;
    private saveViewState;
    private saveTransientState;
    saveEditorViewState(): any;
    restoreEditorViewState(editorViewStates: editorCommon.ICodeEditorViewState | null, totalHeight?: number): void;
    private _restoreViewState;
    addModelDecoration(decoration: model.IModelDeltaDecoration): string;
    removeModelDecoration(decorationId: string): void;
    deltaModelDecorations(oldDecorations: readonly string[], newDecorations: readonly model.IModelDeltaDecoration[]): string[];
    private _removeCellDecoration;
    private _addCellDecoration;
    getCellDecorations(): INotebookCellDecorationOptions[];
    getCellDecorationRange(decorationId: string): Range | null;
    deltaCellDecorations(oldDecorations: string[], newDecorations: INotebookCellDecorationOptions[]): string[];
    deltaCellStatusBarItems(oldItems: readonly string[], newItems: readonly INotebookCellStatusBarItem[]): string[];
    getCellStatusBarItems(): INotebookCellStatusBarItem[];
    revealRangeInCenter(range: Range): void;
    setSelection(range: Range): void;
    setSelections(selections: Selection[]): void;
    getSelections(): any;
    getSelectionsStartPosition(): IPosition[] | undefined;
    getLineScrollTopOffset(line: number): number;
    getPositionScrollTopOffset(range: Selection | Range): number;
    cursorAtLineBoundary(): CursorAtLineBoundary;
    cursorAtBoundary(): CursorAtBoundary;
    private _editStateSource;
    get editStateSource(): string;
    updateEditState(newState: CellEditState, source: string): void;
    getEditState(): CellEditState;
    get textBuffer(): any;
    /**
     * Text model is used for editing.
     */
    resolveTextModel(): Promise<model.ITextModel>;
    protected abstract onDidChangeTextModelContent(): void;
    protected cellStartFind(value: string, options: INotebookFindOptions): model.FindMatch[] | null;
    dispose(): void;
    toJSON(): object;
}
