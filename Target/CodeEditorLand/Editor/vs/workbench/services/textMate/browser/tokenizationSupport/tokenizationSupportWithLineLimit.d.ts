import { Disposable, type IDisposable } from "../../../../../base/common/lifecycle.js";
import { type IObservable } from "../../../../../base/common/observable.js";
import type { LanguageId } from "../../../../../editor/common/encodedTokenAttributes.js";
import type { EncodedTokenizationResult, IBackgroundTokenizationStore, IBackgroundTokenizer, IState, ITokenizationSupport, TokenizationResult } from "../../../../../editor/common/languages.js";
import type { ITextModel } from "../../../../../editor/common/model.js";
export declare class TokenizationSupportWithLineLimit extends Disposable implements ITokenizationSupport {
    private readonly _encodedLanguageId;
    private readonly _actual;
    private readonly _maxTokenizationLineLength;
    get backgroundTokenizerShouldOnlyVerifyTokens(): boolean | undefined;
    constructor(_encodedLanguageId: LanguageId, _actual: ITokenizationSupport, disposable: IDisposable, _maxTokenizationLineLength: IObservable<number>);
    getInitialState(): IState;
    tokenize(line: string, hasEOL: boolean, state: IState): TokenizationResult;
    tokenizeEncoded(line: string, hasEOL: boolean, state: IState): EncodedTokenizationResult;
    createBackgroundTokenizer(textModel: ITextModel, store: IBackgroundTokenizationStore): IBackgroundTokenizer | undefined;
}