import { CancellationToken } from "vs/base/common/cancellation";
import { ResourceSet } from "vs/base/common/map";
import { ISearchComplete, ISearchProgressItem, ITextQuery } from "vs/workbench/services/search/common/search";
export declare const INotebookSearchService: any;
export interface INotebookSearchService {
    readonly _serviceBrand: undefined;
    notebookSearch(query: ITextQuery, token: CancellationToken | undefined, searchInstanceID: string, onProgress?: (result: ISearchProgressItem) => void): {
        openFilesToScan: ResourceSet;
        completeData: Promise<ISearchComplete>;
        allScannedFiles: Promise<ResourceSet>;
    };
}
