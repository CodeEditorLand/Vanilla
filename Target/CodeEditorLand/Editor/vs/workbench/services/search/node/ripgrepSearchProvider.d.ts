import { CancellationToken } from "vs/base/common/cancellation";
import { Progress } from "vs/platform/progress/common/progress";
import { TextSearchCompleteNew, TextSearchProviderNew, TextSearchProviderOptions, TextSearchQueryNew, TextSearchResultNew } from "vs/workbench/services/search/common/searchExtTypes";
import { OutputChannel } from "vs/workbench/services/search/node/ripgrepSearchUtils";
export declare class RipgrepSearchProvider implements TextSearchProviderNew {
    private outputChannel;
    private getNumThreads;
    private inProgress;
    constructor(outputChannel: OutputChannel, getNumThreads: () => Promise<number | undefined>);
    provideTextSearchResults(query: TextSearchQueryNew, options: TextSearchProviderOptions, progress: Progress<TextSearchResultNew>, token: CancellationToken): Promise<TextSearchCompleteNew>;
    private withToken;
    private dispose;
}
