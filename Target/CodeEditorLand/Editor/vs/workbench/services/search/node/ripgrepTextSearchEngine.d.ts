import { EventEmitter } from "events";
import { CancellationToken } from "vs/base/common/cancellation";
import { URI } from "vs/base/common/uri";
import { Progress } from "vs/platform/progress/common/progress";
import { ITextSearchPreviewOptions } from "vs/workbench/services/search/common/search";
import { TextSearchCompleteNew, TextSearchProviderOptions, TextSearchQueryNew, TextSearchResultNew } from "vs/workbench/services/search/common/searchExtTypes";
import type { RipgrepTextSearchOptions } from "vs/workbench/services/search/common/searchExtTypesInternal";
import { IOutputChannel } from "./ripgrepSearchUtils";
export declare class RipgrepTextSearchEngine {
    private outputChannel;
    private readonly _numThreads?;
    constructor(outputChannel: IOutputChannel, _numThreads?: number | undefined);
    provideTextSearchResults(query: TextSearchQueryNew, options: TextSearchProviderOptions, progress: Progress<TextSearchResultNew>, token: CancellationToken): Promise<TextSearchCompleteNew>;
    provideTextSearchResultsWithRgOptions(query: TextSearchQueryNew, options: RipgrepTextSearchOptions, progress: Progress<TextSearchResultNew>, token: CancellationToken): Promise<TextSearchCompleteNew>;
}
export declare class RipgrepParser extends EventEmitter {
    private maxResults;
    private root;
    private previewOptions;
    private remainder;
    private isDone;
    private hitLimit;
    private stringDecoder;
    private numResults;
    constructor(maxResults: number, root: URI, previewOptions: ITextSearchPreviewOptions);
    cancel(): void;
    flush(): void;
    on(event: "result", listener: (result: TextSearchResultNew) => void): this;
    on(event: "hitLimit", listener: () => void): this;
    handleData(data: Buffer | string): void;
    private handleDecodedData;
    private handleLine;
    private createTextSearchMatch;
    private createTextSearchContexts;
    private onResult;
}
export declare function getRgArgs(query: TextSearchQueryNew, options: RipgrepTextSearchOptions): string[];
export declare function unicodeEscapesToPCRE2(pattern: string): string;
export interface IRgMessage {
    type: "match" | "context" | string;
    data: IRgMatch;
}
export interface IRgMatch {
    path: IRgBytesOrText;
    lines: IRgBytesOrText;
    line_number: number;
    absolute_offset: number;
    submatches: IRgSubmatch[];
}
export interface IRgSubmatch {
    match: IRgBytesOrText;
    start: number;
    end: number;
}
export type IRgBytesOrText = {
    bytes: string;
} | {
    text: string;
};
export declare function fixRegexNewline(pattern: string): string;
export declare function fixNewline(pattern: string): string;
/**
 * Parses out curly braces and returns equivalent globs. Only supports one level of nesting.
 * Exported for testing.
 */
export declare function performBraceExpansionForRipgrep(pattern: string): string[];
