import { ICellViewModel, INotebookEditorDelegate } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { CellContentPart } from "vs/workbench/contrib/notebook/browser/view/cellPart";
export declare class CellChatPart extends CellContentPart {
    get activeCell(): any;
    constructor(_notebookEditor: INotebookEditorDelegate, _partContainer: HTMLElement);
    didRenderCell(element: ICellViewModel): void;
    unrenderCell(element: ICellViewModel): void;
    updateInternalLayoutNow(element: ICellViewModel): void;
    dispose(): void;
}
