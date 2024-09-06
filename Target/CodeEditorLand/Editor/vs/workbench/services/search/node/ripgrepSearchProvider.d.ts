import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Progress } from "../../../../platform/progress/common/progress.js";
import { TextSearchCompleteNew, TextSearchProviderNew, TextSearchProviderOptions, TextSearchQueryNew, TextSearchResultNew } from "../common/searchExtTypes.js";
import { OutputChannel } from "./ripgrepSearchUtils.js";
export declare class RipgrepSearchProvider implements TextSearchProviderNew {
    private outputChannel;
    private getNumThreads;
    private inProgress;
    constructor(outputChannel: OutputChannel, getNumThreads: () => Promise<number | undefined>);
    provideTextSearchResults(query: TextSearchQueryNew, options: TextSearchProviderOptions, progress: Progress<TextSearchResultNew>, token: CancellationToken): Promise<TextSearchCompleteNew>;
    private withToken;
    private dispose;
}
