import type { IRange } from "../../core/range.js";
import type { IInplaceReplaceSupportResult } from "../../languages.js";
export declare class BasicInplaceReplace {
    static readonly INSTANCE: BasicInplaceReplace;
    navigateValueSet(range1: IRange, text1: string, range2: IRange, text2: string | null, up: boolean): IInplaceReplaceSupportResult | null;
    private doNavigateValueSet;
    private numberReplace;
    private readonly _defaultValueSet;
    private textReplace;
    private valueSetsReplace;
    private valueSetReplace;
}
