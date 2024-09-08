import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { type UriComponents } from "../../../../base/common/uri.js";
import type { IRequestHandler, IWorkerServer } from "../../../../base/common/worker/simpleWorker.js";
import { type ILocalFileSearchSimpleWorker, type IWorkerFileSearchComplete, type IWorkerFileSystemDirectoryHandle, type IWorkerTextSearchComplete } from "../common/localFileSearchWorkerTypes.js";
import type { IFileQueryProps, IFolderQuery, ITextQueryProps } from "../common/search.js";
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
