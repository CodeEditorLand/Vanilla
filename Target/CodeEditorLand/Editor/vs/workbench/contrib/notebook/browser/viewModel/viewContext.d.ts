import { IBaseCellEditorOptions } from "../notebookBrowser.js";
import { NotebookOptions } from "../notebookOptions.js";
import { NotebookEventDispatcher } from "./eventDispatcher.js";
export declare class ViewContext {
    readonly notebookOptions: NotebookOptions;
    readonly eventDispatcher: NotebookEventDispatcher;
    readonly getBaseCellEditorOptions: (language: string) => IBaseCellEditorOptions;
    constructor(notebookOptions: NotebookOptions, eventDispatcher: NotebookEventDispatcher, getBaseCellEditorOptions: (language: string) => IBaseCellEditorOptions);
}
