import { LanguageId } from "vs/editor/common/encodedTokenAttributes";
import { EncodedTokenizationResult, IState, TokenizationResult } from "vs/editor/common/languages";
export declare const NullState: IState;
export declare function nullTokenize(languageId: string, state: IState): TokenizationResult;
export declare function nullTokenizeEncoded(languageId: LanguageId, state: IState | null): EncodedTokenizationResult;
