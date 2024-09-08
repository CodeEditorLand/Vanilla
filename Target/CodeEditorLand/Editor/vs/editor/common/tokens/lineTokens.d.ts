import { OffsetRange } from "../core/offsetRange.js";
import type { IPosition } from "../core/position.js";
import { ColorId, type ITokenPresentation, type StandardTokenType } from "../encodedTokenAttributes.js";
import type { ILanguageIdCodec } from "../languages.js";
import type { ITextModel } from "../model.js";
import { type TokenArray } from "./tokenArray.js";
export interface IViewLineTokens {
    languageIdCodec: ILanguageIdCodec;
    equals(other: IViewLineTokens): boolean;
    getCount(): number;
    getStandardTokenType(tokenIndex: number): StandardTokenType;
    getForeground(tokenIndex: number): ColorId;
    getEndOffset(tokenIndex: number): number;
    getClassName(tokenIndex: number): string;
    getInlineStyle(tokenIndex: number, colorMap: string[]): string;
    getPresentation(tokenIndex: number): ITokenPresentation;
    findTokenIndexAtOffset(offset: number): number;
    getLineContent(): string;
    getMetadata(tokenIndex: number): number;
    getLanguageId(tokenIndex: number): string;
    getTokenText(tokenIndex: number): string;
    forEach(callback: (tokenIndex: number) => void): void;
}
export declare class LineTokens implements IViewLineTokens {
    static createEmpty(lineContent: string, decoder: ILanguageIdCodec): LineTokens;
    static createFromTextAndMetadata(data: {
        text: string;
        metadata: number;
    }[], decoder: ILanguageIdCodec): LineTokens;
    static convertToEndOffset(tokens: Uint32Array, lineTextLength: number): void;
    static findIndexInTokensArray(tokens: Uint32Array, desiredIndex: number): number;
    _lineTokensBrand: void;
    private readonly _tokens;
    private readonly _tokensCount;
    private readonly _text;
    readonly languageIdCodec: ILanguageIdCodec;
    static defaultTokenMetadata: number;
    constructor(tokens: Uint32Array, text: string, decoder: ILanguageIdCodec);
    equals(other: IViewLineTokens): boolean;
    slicedEquals(other: LineTokens, sliceFromTokenIndex: number, sliceTokenCount: number): boolean;
    getLineContent(): string;
    getCount(): number;
    getStartOffset(tokenIndex: number): number;
    getMetadata(tokenIndex: number): number;
    getLanguageId(tokenIndex: number): string;
    getStandardTokenType(tokenIndex: number): StandardTokenType;
    getForeground(tokenIndex: number): ColorId;
    getClassName(tokenIndex: number): string;
    getInlineStyle(tokenIndex: number, colorMap: string[]): string;
    getPresentation(tokenIndex: number): ITokenPresentation;
    getEndOffset(tokenIndex: number): number;
    /**
     * Find the token containing offset `offset`.
     * @param offset The search offset
     * @return The index of the token containing the offset.
     */
    findTokenIndexAtOffset(offset: number): number;
    inflate(): IViewLineTokens;
    sliceAndInflate(startOffset: number, endOffset: number, deltaOffset: number): IViewLineTokens;
    /**
     * @pure
     * @param insertTokens Must be sorted by offset.
     */
    withInserted(insertTokens: {
        offset: number;
        text: string;
        tokenMetadata: number;
    }[]): LineTokens;
    getTokensInRange(range: OffsetRange): TokenArray;
    getTokenText(tokenIndex: number): string;
    forEach(callback: (tokenIndex: number) => void): void;
}
export declare function getStandardTokenTypeAtPosition(model: ITextModel, position: IPosition): StandardTokenType | undefined;
