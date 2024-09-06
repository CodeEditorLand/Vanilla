import { URI, UriComponents } from "vs/base/common/uri";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { NotebookTextModel } from "vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { INotebookEditorModelResolverService } from "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { MainThreadNotebookDocumentsShape, NotebookDataDto } from "../common/extHost.protocol";
export declare class MainThreadNotebookDocuments implements MainThreadNotebookDocumentsShape {
    private readonly _notebookEditorModelResolverService;
    private readonly _uriIdentityService;
    private readonly _disposables;
    private readonly _proxy;
    private readonly _documentEventListenersMapping;
    private readonly _modelReferenceCollection;
    constructor(extHostContext: IExtHostContext, _notebookEditorModelResolverService: INotebookEditorModelResolverService, _uriIdentityService: IUriIdentityService);
    dispose(): void;
    handleNotebooksAdded(notebooks: readonly NotebookTextModel[]): void;
    handleNotebooksRemoved(uris: URI[]): void;
    $tryCreateNotebook(options: {
        viewType: string;
        content?: NotebookDataDto;
    }): Promise<UriComponents>;
    $tryOpenNotebook(uriComponents: UriComponents): Promise<URI>;
    $trySaveNotebook(uriComponents: UriComponents): Promise<any>;
}
