import type { IDisposable } from "../../../../../../base/common/lifecycle.js";
import type { ICellViewModel, INotebookEditor } from "../../notebookBrowser.js";
export declare function registerCellToolbarStickyScroll(notebookEditor: INotebookEditor, cell: ICellViewModel, element: HTMLElement, opts?: {
    extraOffset?: number;
    min?: number;
}): IDisposable;
