import { Event } from "vs/base/common/event";
import { IReference } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IResolvedNotebookEditorModel, NotebookEditorModelCreationOptions } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { INotebookEditorModelResolverService, IUntitledNotebookResource } from "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare class NotebookModelResolverServiceImpl implements INotebookEditorModelResolverService {
    private readonly _notebookService;
    private readonly _extensionService;
    private readonly _uriIdentService;
    readonly _serviceBrand: undefined;
    private readonly _data;
    readonly onDidSaveNotebook: Event<URI>;
    readonly onDidChangeDirty: Event<IResolvedNotebookEditorModel>;
    private readonly _onWillFailWithConflict;
    readonly onWillFailWithConflict: any;
    constructor(instantiationService: IInstantiationService, _notebookService: INotebookService, _extensionService: IExtensionService, _uriIdentService: IUriIdentityService);
    dispose(): void;
    isDirty(resource: URI): boolean;
    private createUntitledUri;
    private validateResourceViewType;
    createUntitledNotebookTextModel(viewType: string): Promise<any>;
    resolve(resource: URI, viewType?: string, options?: NotebookEditorModelCreationOptions): Promise<IReference<IResolvedNotebookEditorModel>>;
    resolve(resource: IUntitledNotebookResource, viewType: string, options: NotebookEditorModelCreationOptions): Promise<IReference<IResolvedNotebookEditorModel>>;
}
