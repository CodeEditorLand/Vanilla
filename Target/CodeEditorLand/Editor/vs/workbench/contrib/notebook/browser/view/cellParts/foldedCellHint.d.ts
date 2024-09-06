import { INotebookEditor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { CellContentPart } from "vs/workbench/contrib/notebook/browser/view/cellPart";
import { MarkupCellViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
export declare class FoldedCellHint extends CellContentPart {
    private readonly _notebookEditor;
    private readonly _container;
    private readonly _notebookExecutionStateService;
    private readonly _runButtonListener;
    private readonly _cellExecutionListener;
    constructor(_notebookEditor: INotebookEditor, _container: HTMLElement, _notebookExecutionStateService: INotebookExecutionStateService);
    didRenderCell(element: MarkupCellViewModel): void;
    private update;
    private getHiddenCellsLabel;
    private getHiddenCellHintButton;
    private getRunFoldedSectionButton;
    updateInternalLayoutNow(element: MarkupCellViewModel): void;
}
