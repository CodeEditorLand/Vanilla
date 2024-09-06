import { IDisposable } from "vs/base/common/lifecycle";
import { ICellViewModel, INotebookEditor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
export declare function registerCellToolbarStickyScroll(notebookEditor: INotebookEditor, cell: ICellViewModel, element: HTMLElement, opts?: {
    extraOffset?: number;
    min?: number;
}): IDisposable;
