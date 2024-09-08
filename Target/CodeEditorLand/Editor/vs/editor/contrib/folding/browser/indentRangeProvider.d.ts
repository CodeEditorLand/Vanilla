import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { FoldingMarkers } from "../../../common/languages/languageConfiguration.js";
import type { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import type { ITextModel } from "../../../common/model.js";
import type { FoldingLimitReporter, RangeProvider } from "./folding.js";
import { FoldingRegions } from "./foldingRanges.js";
export declare class IndentRangeProvider implements RangeProvider {
    private readonly editorModel;
    private readonly languageConfigurationService;
    private readonly foldingRangesLimit;
    readonly id = "indent";
    constructor(editorModel: ITextModel, languageConfigurationService: ILanguageConfigurationService, foldingRangesLimit: FoldingLimitReporter);
    dispose(): void;
    compute(cancelationToken: CancellationToken): Promise<FoldingRegions>;
}
export declare class RangesCollector {
    private readonly _startIndexes;
    private readonly _endIndexes;
    private readonly _indentOccurrences;
    private _length;
    private readonly _foldingRangesLimit;
    constructor(foldingRangesLimit: FoldingLimitReporter);
    insertFirst(startLineNumber: number, endLineNumber: number, indent: number): void;
    toIndentRanges(model: ITextModel): FoldingRegions;
}
export declare function computeRanges(model: ITextModel, offSide: boolean, markers?: FoldingMarkers, foldingRangesLimit?: FoldingLimitReporter): FoldingRegions;
