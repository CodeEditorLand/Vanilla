import { IBaseCellEditorOptions } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookOptions } from "vs/workbench/contrib/notebook/browser/notebookOptions";
import { NotebookEventDispatcher } from "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher";
export declare class ViewContext {
    readonly notebookOptions: NotebookOptions;
    readonly eventDispatcher: NotebookEventDispatcher;
    readonly getBaseCellEditorOptions: (language: string) => IBaseCellEditorOptions;
    constructor(notebookOptions: NotebookOptions, eventDispatcher: NotebookEventDispatcher, getBaseCellEditorOptions: (language: string) => IBaseCellEditorOptions);
}
