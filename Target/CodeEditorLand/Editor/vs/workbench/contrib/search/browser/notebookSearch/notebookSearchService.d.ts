import { CancellationToken } from "vs/base/common/cancellation";
import { ResourceSet } from "vs/base/common/map";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { INotebookEditorService } from "vs/workbench/contrib/notebook/browser/services/notebookEditorService";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
import { INotebookSearchService } from "vs/workbench/contrib/search/common/notebookSearch";
import { IEditorResolverService } from "vs/workbench/services/editor/common/editorResolverService";
import { ISearchComplete, ISearchProgressItem, ISearchService, ITextQuery } from "vs/workbench/services/search/common/search";
export declare class NotebookSearchService implements INotebookSearchService {
    private readonly uriIdentityService;
    private readonly notebookEditorService;
    private readonly logService;
    private readonly notebookService;
    private readonly configurationService;
    private readonly editorResolverService;
    private readonly searchService;
    readonly _serviceBrand: undefined;
    private queryBuilder;
    constructor(uriIdentityService: IUriIdentityService, notebookEditorService: INotebookEditorService, logService: ILogService, notebookService: INotebookService, configurationService: IConfigurationService, editorResolverService: IEditorResolverService, searchService: ISearchService, instantiationService: IInstantiationService);
    notebookSearch(query: ITextQuery, token: CancellationToken | undefined, searchInstanceID: string, onProgress?: (result: ISearchProgressItem) => void): {
        openFilesToScan: ResourceSet;
        completeData: Promise<ISearchComplete>;
        allScannedFiles: Promise<ResourceSet>;
    };
    private doesFileExist;
    private getClosedNotebookResults;
    private getLocalNotebookResults;
    private getLocalNotebookWidgets;
}
