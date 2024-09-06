import { CancellationToken } from "vs/base/common/cancellation";
import { IProgressMessage, ISerializedFileMatch, ISerializedSearchSuccess, ITextQuery } from "vs/workbench/services/search/common/search";
export declare class TextSearchEngineAdapter {
    private query;
    private numThreads?;
    constructor(query: ITextQuery, numThreads?: number | undefined);
    search(token: CancellationToken, onResult: (matches: ISerializedFileMatch[]) => void, onMessage: (message: IProgressMessage) => void): Promise<ISerializedSearchSuccess>;
}
