import { Disposable } from "../../../../../../base/common/lifecycle.js";
import type { ICellViewModel, INotebookEditor } from "../../notebookBrowser.js";
export interface ICellVisibilityChangeEvent {
    added: ICellViewModel[];
    removed: ICellViewModel[];
}
export declare class NotebookVisibleCellObserver extends Disposable {
    private readonly _notebookEditor;
    private readonly _onDidChangeVisibleCells;
    readonly onDidChangeVisibleCells: import("../../../../../../base/common/event.js").Event<ICellVisibilityChangeEvent>;
    private readonly _viewModelDisposables;
    private _visibleCells;
    get visibleCells(): ICellViewModel[];
    constructor(_notebookEditor: INotebookEditor);
    private _onModelChange;
    protected updateEverything(): void;
    private _updateVisibleCells;
}
