import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ICellRange } from "../../common/notebookRange.js";
import { CellFoldingState, INotebookEditor, INotebookEditorContribution, INotebookEditorMouseEvent } from "../notebookBrowser.js";
export declare class FoldingController extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    static id: string;
    private _foldingModel;
    private readonly _localStore;
    constructor(_notebookEditor: INotebookEditor);
    saveViewState(): ICellRange[];
    restoreViewState(state: ICellRange[] | undefined): void;
    setFoldingStateDown(index: number, state: CellFoldingState, levels: number): void;
    setFoldingStateUp(index: number, state: CellFoldingState, levels: number): void;
    private _updateEditorFoldingRanges;
    onMouseUp(e: INotebookEditorMouseEvent): void;
}
