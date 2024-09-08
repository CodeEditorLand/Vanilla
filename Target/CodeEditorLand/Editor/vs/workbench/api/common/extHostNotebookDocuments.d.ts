import type * as vscode from "vscode";
import { type UriComponents } from "../../../base/common/uri.js";
import type { NotebookDocumentMetadata } from "../../contrib/notebook/common/notebookCommon.js";
import type { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import type * as extHostProtocol from "./extHost.protocol.js";
import type { ExtHostNotebookController } from "./extHostNotebook.js";
export declare class ExtHostNotebookDocuments implements extHostProtocol.ExtHostNotebookDocumentsShape {
    private readonly _notebooksAndEditors;
    private readonly _onDidSaveNotebookDocument;
    readonly onDidSaveNotebookDocument: import("../../../base/common/event.js").Event<vscode.NotebookDocument>;
    private readonly _onDidChangeNotebookDocument;
    readonly onDidChangeNotebookDocument: import("../../../base/common/event.js").Event<vscode.NotebookDocumentChangeEvent>;
    constructor(_notebooksAndEditors: ExtHostNotebookController);
    $acceptModelChanged(uri: UriComponents, event: SerializableObjectWithBuffers<extHostProtocol.NotebookCellsChangedEventDto>, isDirty: boolean, newMetadata?: NotebookDocumentMetadata): void;
    $acceptDirtyStateChanged(uri: UriComponents, isDirty: boolean): void;
    $acceptModelSaved(uri: UriComponents): void;
}
