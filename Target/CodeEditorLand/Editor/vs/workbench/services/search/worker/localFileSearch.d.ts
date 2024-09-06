import { CancellationTokenSource } from "vs/base/common/cancellation";
import { UriComponents } from "vs/base/common/uri";
import { IRequestHandler, IWorkerServer } from "vs/base/common/worker/simpleWorker";
import { ILocalFileSearchSimpleWorker, IWorkerFileSearchComplete, IWorkerFileSystemDirectoryHandle, IWorkerTextSearchComplete } from "vs/workbench/services/search/common/localFileSearchWorkerTypes";
import { IFileQueryProps, IFolderQuery, ITextQueryProps } from "vs/workbench/services/search/common/search";
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 */
export declare function create(workerServer: IWorkerServer): IRequestHandler;
export declare class LocalFileSearchSimpleWorker implements ILocalFileSearchSimpleWorker, IRequestHandler {
    _requestHandlerBrand: any;
    private readonly host;
    cancellationTokens: Map<number, CancellationTokenSource>;
    constructor(workerServer: IWorkerServer);
    $cancelQuery(queryId: number): void;
    private registerCancellationToken;
    $listDirectory(handle: IWorkerFileSystemDirectoryHandle, query: IFileQueryProps<UriComponents>, folderQuery: IFolderQuery<UriComponents>, ignorePathCasing: boolean, queryId: number): Promise<IWorkerFileSearchComplete>;
    $searchDirectory(handle: IWorkerFileSystemDirectoryHandle, query: ITextQueryProps<UriComponents>, folderQuery: IFolderQuery<UriComponents>, ignorePathCasing: boolean, queryId: number): Promise<IWorkerTextSearchComplete>;
    private walkFolderQuery;
}
