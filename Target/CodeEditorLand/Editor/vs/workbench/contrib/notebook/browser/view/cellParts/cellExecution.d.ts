import { INotebookExecutionStateService } from "../../../common/notebookExecutionStateService.js";
import type { ICellViewModel, INotebookEditorDelegate } from "../../notebookBrowser.js";
import type { CellViewModelStateChangeEvent } from "../../notebookViewEvents.js";
import { CellContentPart } from "../cellPart.js";
export declare class CellExecutionPart extends CellContentPart {
    private readonly _notebookEditor;
    private readonly _executionOrderLabel;
    private readonly _notebookExecutionStateService;
    private readonly kernelDisposables;
    constructor(_notebookEditor: INotebookEditorDelegate, _executionOrderLabel: HTMLElement, _notebookExecutionStateService: INotebookExecutionStateService);
    didRenderCell(element: ICellViewModel): void;
    private updateExecutionOrder;
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    updateInternalLayoutNow(element: ICellViewModel): void;
    private _updatePosition;
}
