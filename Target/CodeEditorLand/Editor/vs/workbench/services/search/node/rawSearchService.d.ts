import type { CancellationToken } from "../../../../base/common/cancellation.js";
import { type Event } from "../../../../base/common/event.js";
import { type IFileQuery, type IFileSearchStats, type IRawFileMatch, type IRawFileQuery, type IRawSearchService, type IRawTextQuery, type ISearchEngine, type ISerializedSearchComplete, type ISerializedSearchProgressItem, type ISerializedSearchSuccess } from "../common/search.js";
export type IProgressCallback = (p: ISerializedSearchProgressItem) => void;
export declare class SearchService implements IRawSearchService {
    private readonly processType;
    private readonly getNumThreads?;
    private static readonly BATCH_SIZE;
    private caches;
    constructor(processType?: IFileSearchStats["type"], getNumThreads?: (() => Promise<number | undefined>) | undefined);
    fileSearch(config: IRawFileQuery): Event<ISerializedSearchProgressItem | ISerializedSearchComplete>;
    textSearch(rawQuery: IRawTextQuery): Event<ISerializedSearchProgressItem | ISerializedSearchComplete>;
    private ripgrepTextSearch;
    private getPlatformFileLimits;
    doFileSearch(config: IFileQuery, numThreads: number | undefined, progressCallback: IProgressCallback, token?: CancellationToken): Promise<ISerializedSearchSuccess>;
    doFileSearchWithEngine(EngineClass: {
        new (config: IFileQuery, numThreads?: number | undefined): ISearchEngine<IRawFileMatch>;
    }, config: IFileQuery, progressCallback: IProgressCallback, token?: CancellationToken, batchSize?: number, threads?: number): Promise<ISerializedSearchSuccess>;
    private rawMatchToSearchItem;
    private doSortedSearch;
    private getOrCreateCache;
    private trySortedSearchFromCache;
    private sortResults;
    private sendProgress;
    private getResultsFromCache;
    private doSearch;
    clearCache(cacheKey: string): Promise<void>;
    /**
     * Return a CancelablePromise which is not actually cancelable
     * TODO@rob - Is this really needed?
     */
    private preventCancellation;
}
