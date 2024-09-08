import { CallbackIterable } from "../../../../base/common/arrays.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import type { IPosition } from "../../core/position.js";
import { Range } from "../../core/range.js";
import type { ILanguageConfigurationService, LanguageConfigurationServiceChangeEvent } from "../../languages/languageConfigurationRegistry.js";
import type { BracketInfo, BracketPairInfo, BracketPairWithMinIndentationInfo, IBracketPairsTextModelPart, IFoundBracket } from "../../textModelBracketPairs.js";
import type { IModelContentChangedEvent, IModelLanguageChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent } from "../../textModelEvents.js";
import type { TextModel } from "../textModel.js";
export declare class BracketPairsTextModelPart extends Disposable implements IBracketPairsTextModelPart {
    private readonly textModel;
    private readonly languageConfigurationService;
    private readonly bracketPairsTree;
    private readonly onDidChangeEmitter;
    readonly onDidChange: import("../../../../base/common/event.js").Event<void>;
    private get canBuildAST();
    private bracketsRequested;
    constructor(textModel: TextModel, languageConfigurationService: ILanguageConfigurationService);
    handleLanguageConfigurationServiceChange(e: LanguageConfigurationServiceChangeEvent): void;
    handleDidChangeOptions(e: IModelOptionsChangedEvent): void;
    handleDidChangeLanguage(e: IModelLanguageChangedEvent): void;
    handleDidChangeContent(change: IModelContentChangedEvent): void;
    handleDidChangeBackgroundTokenizationState(): void;
    handleDidChangeTokens(e: IModelTokensChangedEvent): void;
    private updateBracketPairsTree;
    /**
     * Returns all bracket pairs that intersect the given range.
     * The result is sorted by the start position.
     */
    getBracketPairsInRange(range: Range): CallbackIterable<BracketPairInfo>;
    getBracketPairsInRangeWithMinIndentation(range: Range): CallbackIterable<BracketPairWithMinIndentationInfo>;
    getBracketsInRange(range: Range, onlyColorizedBrackets?: boolean): CallbackIterable<BracketInfo>;
    findMatchingBracketUp(_bracket: string, _position: IPosition, maxDuration?: number): Range | null;
    matchBracket(position: IPosition, maxDuration?: number): [Range, Range] | null;
    private _establishBracketSearchOffsets;
    private _matchBracket;
    private _matchFoundBracket;
    private _findMatchingBracketUp;
    private _findMatchingBracketDown;
    findPrevBracket(_position: IPosition): IFoundBracket | null;
    findNextBracket(_position: IPosition): IFoundBracket | null;
    findEnclosingBrackets(_position: IPosition, maxDuration?: number): [Range, Range] | null;
    private _toFoundBracket;
}
