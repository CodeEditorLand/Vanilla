import { CancellationToken } from "vs/base/common/cancellation";
import { DisposableStore } from "vs/base/common/lifecycle";
import { FoldingRange, FoldingRangeProvider } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { FoldingLimitReporter, RangeProvider } from "./folding";
import { FoldingRegions } from "./foldingRanges";
export interface IFoldingRangeData extends FoldingRange {
    rank: number;
}
export declare class SyntaxRangeProvider implements RangeProvider {
    private readonly editorModel;
    private readonly providers;
    readonly handleFoldingRangesChange: () => void;
    private readonly foldingRangesLimit;
    private readonly fallbackRangeProvider;
    readonly id = "syntax";
    readonly disposables: DisposableStore;
    constructor(editorModel: ITextModel, providers: FoldingRangeProvider[], handleFoldingRangesChange: () => void, foldingRangesLimit: FoldingLimitReporter, fallbackRangeProvider: RangeProvider | undefined);
    compute(cancellationToken: CancellationToken): Promise<FoldingRegions | null>;
    dispose(): void;
}
export declare function sanitizeRanges(rangeData: IFoldingRangeData[], foldingRangesLimit: FoldingLimitReporter): FoldingRegions;
