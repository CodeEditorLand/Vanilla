import { UriComponents } from "vs/base/common/uri";
import * as extHostProtocol from "vs/workbench/api/common/extHost.protocol";
import { ExtHostNotebookController } from "vs/workbench/api/common/extHostNotebook";
import { NotebookDocumentMetadata } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { SerializableObjectWithBuffers } from "vs/workbench/services/extensions/common/proxyIdentifier";
export declare class ExtHostNotebookDocuments implements extHostProtocol.ExtHostNotebookDocumentsShape {
    private readonly _notebooksAndEditors;
    private readonly _onDidSaveNotebookDocument;
    readonly onDidSaveNotebookDocument: any;
    private readonly _onDidChangeNotebookDocument;
    readonly onDidChangeNotebookDocument: any;
    constructor(_notebooksAndEditors: ExtHostNotebookController);
    $acceptModelChanged(uri: UriComponents, event: SerializableObjectWithBuffers<extHostProtocol.NotebookCellsChangedEventDto>, isDirty: boolean, newMetadata?: NotebookDocumentMetadata): void;
    $acceptDirtyStateChanged(uri: UriComponents, isDirty: boolean): void;
    $acceptModelSaved(uri: UriComponents): void;
}
