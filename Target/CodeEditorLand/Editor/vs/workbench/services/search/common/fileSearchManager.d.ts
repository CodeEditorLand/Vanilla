import { CancellationToken } from "vs/base/common/cancellation";
import { IFileMatch, IFileQuery, ISearchCompleteStats } from "vs/workbench/services/search/common/search";
import { FileSearchProviderNew } from "vs/workbench/services/search/common/searchExtTypes";
export declare class FileSearchManager {
    private static readonly BATCH_SIZE;
    private readonly sessions;
    fileSearch(config: IFileQuery, provider: FileSearchProviderNew, onBatch: (matches: IFileMatch[]) => void, token: CancellationToken): Promise<ISearchCompleteStats>;
    clearCache(cacheKey: string): void;
    private getSessionTokenSource;
    private rawMatchToSearchItem;
    private doSearch;
}
