import { INotebookExecutionStateService, type ICellExecutionStateChangedEvent } from "../../../common/notebookExecutionStateService.js";
import type { ICellViewModel } from "../../notebookBrowser.js";
import type { CellViewModelStateChangeEvent } from "../../notebookViewEvents.js";
import { CellContentPart } from "../cellPart.js";
export declare class CellProgressBar extends CellContentPart {
    private readonly _notebookExecutionStateService;
    private readonly _progressBar;
    private readonly _collapsedProgressBar;
    constructor(editorContainer: HTMLElement, collapsedInputContainer: HTMLElement, _notebookExecutionStateService: INotebookExecutionStateService);
    didRenderCell(element: ICellViewModel): void;
    updateForExecutionState(element: ICellViewModel, e: ICellExecutionStateChangedEvent): void;
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    private _updateForExecutionState;
}
