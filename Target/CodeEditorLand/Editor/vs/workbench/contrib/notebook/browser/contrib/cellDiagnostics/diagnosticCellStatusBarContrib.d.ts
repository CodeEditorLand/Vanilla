import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotebookEditor, INotebookEditorContribution } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
export declare class DiagnosticCellStatusBarContrib extends Disposable implements INotebookEditorContribution {
    static id: string;
    constructor(notebookEditor: INotebookEditor, instantiationService: IInstantiationService);
}
