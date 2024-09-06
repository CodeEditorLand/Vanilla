import { CancellationToken } from "vs/base/common/cancellation";
import { FoldingMarkers } from "vs/editor/common/languages/languageConfiguration";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ITextModel } from "vs/editor/common/model";
import { FoldingRegions } from "vs/editor/contrib/folding/browser/foldingRanges";
import { FoldingLimitReporter, RangeProvider } from "./folding";
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
    toIndentRanges(model: ITextModel): any;
}
export declare function computeRanges(model: ITextModel, offSide: boolean, markers?: FoldingMarkers, foldingRangesLimit?: FoldingLimitReporter): FoldingRegions;
