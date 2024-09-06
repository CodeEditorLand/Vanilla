import { Event } from "vs/base/common/event";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import * as editorCommon from "vs/editor/common/editorCommon";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IUndoRedoService } from "vs/platform/undoRedo/common/undoRedo";
import { CellFindMatch, EditorFoldingStateDelegate, ICellOutputViewModel, ICellViewModel, MarkupCellLayoutChangeEvent } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookOptionsChangeEvent } from "vs/workbench/contrib/notebook/browser/notebookOptions";
import { NotebookLayoutInfo } from "vs/workbench/contrib/notebook/browser/notebookViewEvents";
import { BaseCellViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/baseCellViewModel";
import { ViewContext } from "vs/workbench/contrib/notebook/browser/viewModel/viewContext";
import { NotebookCellTextModel } from "vs/workbench/contrib/notebook/common/model/notebookCellTextModel";
import { INotebookFindOptions } from "vs/workbench/contrib/notebook/common/notebookCommon";
export declare class MarkupCellViewModel extends BaseCellViewModel implements ICellViewModel {
    readonly foldingDelegate: EditorFoldingStateDelegate;
    readonly viewContext: ViewContext;
    readonly cellKind: any;
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
    protected readonly _onDidChangeLayout: any;
    readonly onDidChangeLayout: any;
    get foldingState(): any;
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
    getHeight(lineHeight: number): any;
    protected onDidChangeTextModelContent(): void;
    onDeselect(): void;
    private readonly _hasFindResult;
    readonly hasFindResult: Event<boolean>;
    startFind(value: string, options: INotebookFindOptions): CellFindMatch | null;
    dispose(): void;
}