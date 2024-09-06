import { Event } from "../../../../base/common/event.js";
import { IReference } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IResolvedNotebookEditorModel, NotebookEditorModelCreationOptions } from "./notebookCommon.js";
import { INotebookConflictEvent, INotebookEditorModelResolverService, IUntitledNotebookResource } from "./notebookEditorModelResolverService.js";
import { INotebookService } from "./notebookService.js";
export declare class NotebookModelResolverServiceImpl implements INotebookEditorModelResolverService {
    private readonly _notebookService;
    private readonly _extensionService;
    private readonly _uriIdentService;
    readonly _serviceBrand: undefined;
    private readonly _data;
    readonly onDidSaveNotebook: Event<URI>;
    readonly onDidChangeDirty: Event<IResolvedNotebookEditorModel>;
    private readonly _onWillFailWithConflict;
    readonly onWillFailWithConflict: Event<INotebookConflictEvent>;
    constructor(instantiationService: IInstantiationService, _notebookService: INotebookService, _extensionService: IExtensionService, _uriIdentService: IUriIdentityService);
    dispose(): void;
    isDirty(resource: URI): boolean;
    private createUntitledUri;
    private validateResourceViewType;
    createUntitledNotebookTextModel(viewType: string): Promise<import("./model/notebookTextModel.js").NotebookTextModel>;
    resolve(resource: URI, viewType?: string, options?: NotebookEditorModelCreationOptions): Promise<IReference<IResolvedNotebookEditorModel>>;
    resolve(resource: IUntitledNotebookResource, viewType: string, options: NotebookEditorModelCreationOptions): Promise<IReference<IResolvedNotebookEditorModel>>;
}
