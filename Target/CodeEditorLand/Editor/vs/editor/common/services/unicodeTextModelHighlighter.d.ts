import { type IRange } from "../core/range.js";
import type { IUnicodeHighlightsResult } from "./editorWorker.js";
export declare class UnicodeTextModelHighlighter {
    static computeUnicodeHighlights(model: IUnicodeCharacterSearcherTarget, options: UnicodeHighlighterOptions, range?: IRange): IUnicodeHighlightsResult;
    static computeUnicodeHighlightReason(char: string, options: UnicodeHighlighterOptions): UnicodeHighlighterReason | null;
}
export declare enum UnicodeHighlighterReasonKind {
    Ambiguous = 0,
    Invisible = 1,
    NonBasicAscii = 2
}
export type UnicodeHighlighterReason = {
    kind: UnicodeHighlighterReasonKind.Ambiguous;
    confusableWith: string;
    notAmbiguousInLocales: string[];
} | {
    kind: UnicodeHighlighterReasonKind.Invisible;
} | {
    kind: UnicodeHighlighterReasonKind.NonBasicAscii;
};
export interface IUnicodeCharacterSearcherTarget {
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
}
export interface UnicodeHighlighterOptions {
    nonBasicASCII: boolean;
    ambiguousCharacters: boolean;
    invisibleCharacters: boolean;
    includeComments: boolean;
    includeStrings: boolean;
    allowedCodePoints: number[];
    allowedLocales: string[];
}
