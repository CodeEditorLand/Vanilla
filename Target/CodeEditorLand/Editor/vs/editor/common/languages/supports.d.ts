import { StandardTokenType } from "../encodedTokenAttributes.js";
import type { ILanguageIdCodec } from "../languages.js";
import type { IViewLineTokens, LineTokens } from "../tokens/lineTokens.js";
export declare function createScopedLineTokens(context: LineTokens, offset: number): ScopedLineTokens;
export declare class ScopedLineTokens {
    _scopedLineTokensBrand: void;
    readonly languageIdCodec: ILanguageIdCodec;
    readonly languageId: string;
    private readonly _actual;
    private readonly _firstTokenIndex;
    private readonly _lastTokenIndex;
    readonly firstCharOffset: number;
    private readonly _lastCharOffset;
    constructor(actual: LineTokens, languageId: string, firstTokenIndex: number, lastTokenIndex: number, firstCharOffset: number, lastCharOffset: number);
    getLineContent(): string;
    getLineLength(): number;
    getActualLineContentBefore(offset: number): string;
    getTokenCount(): number;
    findTokenIndexAtOffset(offset: number): number;
    getStandardTokenType(tokenIndex: number): StandardTokenType;
    toIViewLineTokens(): IViewLineTokens;
}
export declare function ignoreBracketsInToken(standardTokenType: StandardTokenType): boolean;
