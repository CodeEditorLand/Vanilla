import { Emitter, type Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { LineRange } from "../core/lineRange.js";
import type { StandardTokenType } from "../encodedTokenAttributes.js";
import type { ILanguageIdCodec } from "../languages.js";
import type { IAttachedView } from "../model.js";
import type { IModelContentChangedEvent, IModelTokensChangedEvent } from "../textModelEvents.js";
import { BackgroundTokenizationState, type ITokenizeLineWithEditResult, type LineEditWithAdditionalLines } from "../tokenizationTextModelPart.js";
import type { LineTokens } from "../tokens/lineTokens.js";
import type { TextModel } from "./textModel.js";
/**
 * @internal
 */
export declare class AttachedViews {
    private readonly _onDidChangeVisibleRanges;
    readonly onDidChangeVisibleRanges: Event<{
        view: IAttachedView;
        state: IAttachedViewState | undefined;
    }>;
    private readonly _views;
    attachView(): IAttachedView;
    detachView(view: IAttachedView): void;
}
/**
 * @internal
 */
export interface IAttachedViewState {
    readonly visibleLineRanges: readonly LineRange[];
    readonly stabilized: boolean;
}
export declare class AttachedViewHandler extends Disposable {
    private readonly _refreshTokens;
    private readonly runner;
    private _computedLineRanges;
    private _lineRanges;
    get lineRanges(): readonly LineRange[];
    constructor(_refreshTokens: () => void);
    private update;
    handleStateChange(state: IAttachedViewState): void;
}
export declare abstract class AbstractTokens extends Disposable {
    protected readonly _languageIdCodec: ILanguageIdCodec;
    protected readonly _textModel: TextModel;
    protected getLanguageId: () => string;
    protected _backgroundTokenizationState: BackgroundTokenizationState;
    get backgroundTokenizationState(): BackgroundTokenizationState;
    protected readonly _onDidChangeBackgroundTokenizationState: Emitter<void>;
    /** @internal, should not be exposed by the text model! */
    readonly onDidChangeBackgroundTokenizationState: Event<void>;
    protected readonly _onDidChangeTokens: Emitter<IModelTokensChangedEvent>;
    /** @internal, should not be exposed by the text model! */
    readonly onDidChangeTokens: Event<IModelTokensChangedEvent>;
    constructor(_languageIdCodec: ILanguageIdCodec, _textModel: TextModel, getLanguageId: () => string);
    abstract resetTokenization(fireTokenChangeEvent?: boolean): void;
    abstract handleDidChangeAttached(): void;
    abstract handleDidChangeContent(e: IModelContentChangedEvent): void;
    abstract forceTokenization(lineNumber: number): void;
    abstract hasAccurateTokensForLine(lineNumber: number): boolean;
    abstract isCheapToTokenize(lineNumber: number): boolean;
    tokenizeIfCheap(lineNumber: number): void;
    abstract getLineTokens(lineNumber: number): LineTokens;
    abstract getTokenTypeIfInsertingCharacter(lineNumber: number, column: number, character: string): StandardTokenType;
    abstract tokenizeLineWithEdit(lineNumber: number, edit: LineEditWithAdditionalLines): ITokenizeLineWithEditResult;
    abstract get hasTokens(): boolean;
}
