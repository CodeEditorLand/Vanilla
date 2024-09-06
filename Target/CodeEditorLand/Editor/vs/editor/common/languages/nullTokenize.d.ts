import { LanguageId } from "../encodedTokenAttributes.js";
import { EncodedTokenizationResult, IState, TokenizationResult } from "../languages.js";
export declare const NullState: IState;
export declare function nullTokenize(languageId: string, state: IState): TokenizationResult;
export declare function nullTokenizeEncoded(languageId: LanguageId, state: IState | null): EncodedTokenizationResult;
