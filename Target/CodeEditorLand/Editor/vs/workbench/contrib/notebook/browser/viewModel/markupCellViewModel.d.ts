import { Emitter, Event } from "../../../../../base/common/event.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import * as editorCommon from "../../../../../editor/common/editorCommon.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { NotebookCellTextModel } from "../../common/model/notebookCellTextModel.js";
import { CellKind, INotebookFindOptions } from "../../common/notebookCommon.js";
import { CellFindMatch, CellFoldingState, EditorFoldingStateDelegate, ICellOutputViewModel, ICellViewModel, MarkupCellLayoutChangeEvent, MarkupCellLayoutInfo } from "../notebookBrowser.js";
import { NotebookOptionsChangeEvent } from "../notebookOptions.js";
import { NotebookLayoutInfo } from "../notebookViewEvents.js";
import { BaseCellViewModel } from "./baseCellViewModel.js";
import { ViewContext } from "./viewContext.js";
export declare class MarkupCellViewModel extends BaseCellViewModel implements ICellViewModel {
    readonly foldingDelegate: EditorFoldingStateDelegate;
    readonly viewContext: ViewContext;
    readonly cellKind = CellKind.Markup;
    private _layoutInfo;
    private _renderedHtml?;
    get renderedHtml(): string | undefined;
    set renderedHtml(value: string | undefined);
    get layoutInfo(): MarkupCellLayoutInfo;
    private _previewHeight;
    set renderedMarkdownHeight(newHeight: number);
    private _chatHeight;
    set chatHeight(newHeight: number);
    get chatHeight(): number;
    private _editorHeight;
    private _statusBarHeight;
    set editorHeight(newHeight: number);
    get editorHeight(): number;
    protected readonly _onDidChangeLayout: Emitter<MarkupCellLayoutChangeEvent>;
    readonly onDidChangeLayout: Event<MarkupCellLayoutChangeEvent>;
    get foldingState(): CellFoldingState;
    private _hoveringOutput;
    get outputIsHovered(): boolean;
    set outputIsHovered(v: boolean);
    private _focusOnOutput;
    get outputIsFocused(): boolean;
    set outputIsFocused(v: boolean);
    get inputInOutputIsFocused(): boolean;
    set inputInOutputIsFocused(_: boolean);
    private _hoveringCell;
    get cellIsHovered(): boolean;
    set cellIsHovered(v: boolean);
    constructor(viewType: string, model: NotebookCellTextModel, initialNotebookLayoutInfo: NotebookLayoutInfo | null, foldingDelegate: EditorFoldingStateDelegate, viewContext: ViewContext, configurationService: IConfigurationService, textModelService: ITextModelService, undoRedoService: IUndoRedoService, codeEditorService: ICodeEditorService);
    private _computeTotalHeight;
    private _computeFoldHintHeight;
    updateOptions(e: NotebookOptionsChangeEvent): void;
    /**
     * we put outputs stuff here to make compiler happy
     */
    outputsViewModels: ICellOutputViewModel[];
    getOutputOffset(index: number): number;
    updateOutputHeight(index: number, height: number): void;
    triggerFoldingStateChange(): void;
    private _updateTotalHeight;
    layoutChange(state: MarkupCellLayoutChangeEvent): void;
    restoreEditorViewState(editorViewStates: editorCommon.ICodeEditorViewState | null, totalHeight?: number): void;
    getDynamicHeight(): null;
    getHeight(lineHeight: number): number;
    protected onDidChangeTextModelContent(): void;
    onDeselect(): void;
    private readonly _hasFindResult;
    readonly hasFindResult: Event<boolean>;
    startFind(value: string, options: INotebookFindOptions): CellFindMatch | null;
    dispose(): void;
}
