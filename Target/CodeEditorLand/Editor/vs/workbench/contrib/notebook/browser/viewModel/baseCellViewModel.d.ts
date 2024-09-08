import { Emitter, type Event } from "../../../../../base/common/event.js";
import { Disposable, type IReference } from "../../../../../base/common/lifecycle.js";
import type { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import type { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import type { IEditorCommentsOptions } from "../../../../../editor/common/config/editorOptions.js";
import type { IPosition } from "../../../../../editor/common/core/position.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { Selection } from "../../../../../editor/common/core/selection.js";
import * as editorCommon from "../../../../../editor/common/editorCommon.js";
import type * as model from "../../../../../editor/common/model.js";
import type { IResolvedTextEditorModel, ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import type { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import type { IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import type { NotebookCellTextModel } from "../../common/model/notebookCellTextModel.js";
import type { CellKind, INotebookCellStatusBarItem, INotebookFindOptions } from "../../common/notebookCommon.js";
import { CellEditState, CellFocusMode, CursorAtBoundary, CursorAtLineBoundary, type CellLayoutChangeEvent, type IEditableCellViewModel, type INotebookCellDecorationOptions } from "../notebookBrowser.js";
import type { NotebookOptionsChangeEvent } from "../notebookOptions.js";
import type { CellViewModelStateChangeEvent } from "../notebookViewEvents.js";
import type { ViewContext } from "./viewContext.js";
export declare abstract class BaseCellViewModel extends Disposable {
    readonly viewType: string;
    readonly model: NotebookCellTextModel;
    id: string;
    private readonly _viewContext;
    private readonly _configurationService;
    private readonly _modelService;
    private readonly _undoRedoService;
    private readonly _codeEditorService;
    protected readonly _onDidChangeEditorAttachState: Emitter<void>;
    readonly onDidChangeEditorAttachState: Event<void>;
    protected readonly _onDidChangeState: Emitter<CellViewModelStateChangeEvent>;
    readonly onDidChangeState: Event<CellViewModelStateChangeEvent>;
    get handle(): number;
    get uri(): import("../../../../workbench.web.main.internal.js").URI;
    get lineCount(): number;
    get metadata(): import("../../common/notebookCommon.js").NotebookCellMetadata;
    get internalMetadata(): import("../../common/notebookCommon.js").NotebookCellInternalMetadata;
    get language(): string;
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
    saveEditorViewState(): editorCommon.ICodeEditorViewState | null;
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
    getSelections(): Selection[];
    getSelectionsStartPosition(): IPosition[] | undefined;
    getLineScrollTopOffset(line: number): number;
    getPositionScrollTopOffset(range: Selection | Range): number;
    cursorAtLineBoundary(): CursorAtLineBoundary;
    cursorAtBoundary(): CursorAtBoundary;
    private _editStateSource;
    get editStateSource(): string;
    updateEditState(newState: CellEditState, source: string): void;
    getEditState(): CellEditState;
    get textBuffer(): model.IReadonlyTextBuffer;
    /**
     * Text model is used for editing.
     */
    resolveTextModel(): Promise<model.ITextModel>;
    protected abstract onDidChangeTextModelContent(): void;
    protected cellStartFind(value: string, options: INotebookFindOptions): model.FindMatch[] | null;
    dispose(): void;
    toJSON(): object;
}