import { ITextSearchPreviewOptions, ITextSearchResult } from "vs/workbench/services/search/common/search";
export declare const getFileResults: (bytes: Uint8Array, pattern: RegExp, options: {
    surroundingContext: number;
    previewOptions: ITextSearchPreviewOptions | undefined;
    remainingResultQuota: number;
}) => ITextSearchResult[];
