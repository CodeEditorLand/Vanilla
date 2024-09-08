import type * as vscode from "vscode";
import type { MainThreadNotebookEditorsShape } from "./extHost.protocol.js";
import type { ExtHostNotebookDocument } from "./extHostNotebookDocument.js";
export declare class ExtHostNotebookEditor {
    readonly id: string;
    private readonly _proxy;
    readonly notebookData: ExtHostNotebookDocument;
    static readonly apiEditorsToExtHost: WeakMap<vscode.NotebookEditor, ExtHostNotebookEditor>;
    private _selections;
    private _visibleRanges;
    private _viewColumn?;
    private _visible;
    private _editor?;
    constructor(id: string, _proxy: MainThreadNotebookEditorsShape, notebookData: ExtHostNotebookDocument, visibleRanges: vscode.NotebookRange[], selections: vscode.NotebookRange[], viewColumn: vscode.ViewColumn | undefined);
    get apiEditor(): vscode.NotebookEditor;
    get visible(): boolean;
    _acceptVisibility(value: boolean): void;
    _acceptVisibleRanges(value: vscode.NotebookRange[]): void;
    _acceptSelections(selections: vscode.NotebookRange[]): void;
    private _trySetSelections;
    _acceptViewColumn(value: vscode.ViewColumn | undefined): void;
}
