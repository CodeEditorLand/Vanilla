import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { LineRange } from "vs/editor/common/core/lineRange";
import { IPosition } from "vs/editor/common/core/position";
import { StandardTokenType } from "vs/editor/common/encodedTokenAttributes";
import { ILanguageIdCodec } from "vs/editor/common/languages";
import { IAttachedView } from "vs/editor/common/model";
import { TextModel } from "vs/editor/common/model/textModel";
import { IModelContentChangedEvent, IModelTokensChangedEvent } from "vs/editor/common/textModelEvents";
import { BackgroundTokenizationState } from "vs/editor/common/tokenizationTextModelPart";
import { LineTokens } from "vs/editor/common/tokens/lineTokens";
/**
 * @internal
 */
export declare class AttachedViews {
    private readonly _onDidChangeVisibleRanges;
    readonly onDidChangeVisibleRanges: any;
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
    protected _backgroundTokenizationState: any;
    get backgroundTokenizationState(): BackgroundTokenizationState;
    protected readonly _onDidChangeBackgroundTokenizationState: any;
    /** @internal, should not be exposed by the text model! */
    readonly onDidChangeBackgroundTokenizationState: Event<void>;
    protected readonly _onDidChangeTokens: any;
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
    abstract tokenizeLineWithEdit(position: IPosition, length: number, newText: string): LineTokens | null;
    abstract get hasTokens(): boolean;
}
