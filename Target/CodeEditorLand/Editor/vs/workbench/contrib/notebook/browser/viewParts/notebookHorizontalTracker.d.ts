import { Disposable } from "vs/base/common/lifecycle";
import { INotebookEditorDelegate } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
export declare class NotebookHorizontalTracker extends Disposable {
    private readonly _notebookEditor;
    private readonly _listViewScrollablement;
    constructor(_notebookEditor: INotebookEditorDelegate, _listViewScrollablement: HTMLElement);
}
