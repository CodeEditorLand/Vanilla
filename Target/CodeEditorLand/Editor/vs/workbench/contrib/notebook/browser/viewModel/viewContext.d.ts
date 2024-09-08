import type { IBaseCellEditorOptions } from "../notebookBrowser.js";
import type { NotebookOptions } from "../notebookOptions.js";
import type { NotebookEventDispatcher } from "./eventDispatcher.js";
export declare class ViewContext {
    readonly notebookOptions: NotebookOptions;
    readonly eventDispatcher: NotebookEventDispatcher;
    readonly getBaseCellEditorOptions: (language: string) => IBaseCellEditorOptions;
    constructor(notebookOptions: NotebookOptions, eventDispatcher: NotebookEventDispatcher, getBaseCellEditorOptions: (language: string) => IBaseCellEditorOptions);
}
