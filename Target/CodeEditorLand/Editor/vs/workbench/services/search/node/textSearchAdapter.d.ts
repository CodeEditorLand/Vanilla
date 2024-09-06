import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IProgressMessage, ISerializedFileMatch, ISerializedSearchSuccess, ITextQuery } from "../common/search.js";
export declare class TextSearchEngineAdapter {
    private query;
    private numThreads?;
    constructor(query: ITextQuery, numThreads?: number | undefined);
    search(token: CancellationToken, onResult: (matches: ISerializedFileMatch[]) => void, onMessage: (message: IProgressMessage) => void): Promise<ISerializedSearchSuccess>;
}
