import type { IRange, Range } from "../core/range.js";
import type { ILanguageIdCodec } from "../languages.js";
import { LineTokens } from "./lineTokens.js";
import type { SparseMultilineTokens } from "./sparseMultilineTokens.js";
/**
 * Represents sparse tokens in a text model.
 */
export declare class SparseTokensStore {
    private _pieces;
    private _isComplete;
    private readonly _languageIdCodec;
    constructor(languageIdCodec: ILanguageIdCodec);
    flush(): void;
    isEmpty(): boolean;
    set(pieces: SparseMultilineTokens[] | null, isComplete: boolean): void;
    setPartial(_range: Range, pieces: SparseMultilineTokens[]): Range;
    isComplete(): boolean;
    addSparseTokens(lineNumber: number, aTokens: LineTokens): LineTokens;
    private static _findFirstPieceWithLine;
    acceptEdit(range: IRange, eolCount: number, firstLineLength: number, lastLineLength: number, firstCharCode: number): void;
}
