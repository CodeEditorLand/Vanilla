import { IRange } from "vs/editor/common/core/range";
import { ILanguageIdCodec } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { ContiguousMultilineTokens } from "vs/editor/common/tokens/contiguousMultilineTokens";
import { LineTokens } from "vs/editor/common/tokens/lineTokens";
/**
 * Represents contiguous tokens in a text model.
 */
export declare class ContiguousTokensStore {
    private _lineTokens;
    private _len;
    private readonly _languageIdCodec;
    constructor(languageIdCodec: ILanguageIdCodec);
    flush(): void;
    get hasTokens(): boolean;
    getTokens(topLevelLanguageId: string, lineIndex: number, lineText: string): LineTokens;
    private static _massageTokens;
    private _ensureLine;
    private _deleteLines;
    private _insertLines;
    setTokens(topLevelLanguageId: string, lineIndex: number, lineTextLength: number, _tokens: Uint32Array | ArrayBuffer | null, checkEquality: boolean): boolean;
    private static _equals;
    acceptEdit(range: IRange, eolCount: number, firstLineLength: number): void;
    private _acceptDeleteRange;
    private _acceptInsertText;
    setMultilineTokens(tokens: ContiguousMultilineTokens[], textModel: ITextModel): {
        changes: {
            fromLineNumber: number;
            toLineNumber: number;
        }[];
    };
}
