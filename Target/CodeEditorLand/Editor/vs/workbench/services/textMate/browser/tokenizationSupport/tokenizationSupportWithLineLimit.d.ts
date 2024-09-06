import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { LanguageId } from "vs/editor/common/encodedTokenAttributes";
import { EncodedTokenizationResult, IBackgroundTokenizationStore, IBackgroundTokenizer, IState, ITokenizationSupport, TokenizationResult } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
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
