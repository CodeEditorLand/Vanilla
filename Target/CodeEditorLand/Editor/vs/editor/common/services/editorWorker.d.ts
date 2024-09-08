import type { URI } from "../../../base/common/uri.js";
import type { IRange } from "../core/range.js";
import type { IDocumentDiff, IDocumentDiffProviderOptions } from "../diff/documentDiffProvider.js";
import type { IChange } from "../diff/legacyLinesDiffComputer.js";
import type { IColorInformation, IInplaceReplaceSupportResult, TextEdit } from "../languages.js";
import type { FindSectionHeaderOptions, SectionHeader } from "./findSectionHeaders.js";
import type { UnicodeHighlighterOptions } from "./unicodeTextModelHighlighter.js";
export declare const IEditorWorkerService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditorWorkerService>;
export type DiffAlgorithmName = "legacy" | "advanced";
export interface IEditorWorkerService {
    readonly _serviceBrand: undefined;
    canComputeUnicodeHighlights(uri: URI): boolean;
    computedUnicodeHighlights(uri: URI, options: UnicodeHighlighterOptions, range?: IRange): Promise<IUnicodeHighlightsResult>;
    /** Implementation in {@link BaseEditorSimpleWorker.computeDiff} */
    computeDiff(original: URI, modified: URI, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDocumentDiff | null>;
    canComputeDirtyDiff(original: URI, modified: URI): boolean;
    computeDirtyDiff(original: URI, modified: URI, ignoreTrimWhitespace: boolean): Promise<IChange[] | null>;
    computeMoreMinimalEdits(resource: URI, edits: TextEdit[] | null | undefined, pretty?: boolean): Promise<TextEdit[] | undefined>;
    computeHumanReadableDiff(resource: URI, edits: TextEdit[] | null | undefined): Promise<TextEdit[] | undefined>;
    canComputeWordRanges(resource: URI): boolean;
    computeWordRanges(resource: URI, range: IRange): Promise<{
        [word: string]: IRange[];
    } | null>;
    canNavigateValueSet(resource: URI): boolean;
    navigateValueSet(resource: URI, range: IRange, up: boolean): Promise<IInplaceReplaceSupportResult | null>;
    findSectionHeaders(uri: URI, options: FindSectionHeaderOptions): Promise<SectionHeader[]>;
    computeDefaultDocumentColors(uri: URI): Promise<IColorInformation[] | null>;
}
export interface IDiffComputationResult {
    quitEarly: boolean;
    changes: ILineChange[];
    identical: boolean;
    moves: ITextMove[];
}
export type ILineChange = [
    originalStartLine: number,
    originalEndLine: number,
    modifiedStartLine: number,
    modifiedEndLine: number,
    charChanges: ICharChange[] | undefined
];
export type ICharChange = [
    originalStartLine: number,
    originalStartColumn: number,
    originalEndLine: number,
    originalEndColumn: number,
    modifiedStartLine: number,
    modifiedStartColumn: number,
    modifiedEndLine: number,
    modifiedEndColumn: number
];
export type ITextMove = [
    originalStartLine: number,
    originalEndLine: number,
    modifiedStartLine: number,
    modifiedEndLine: number,
    changes: ILineChange[]
];
export interface IUnicodeHighlightsResult {
    ranges: IRange[];
    hasMore: boolean;
    nonBasicAsciiCharacterCount: number;
    invisibleCharacterCount: number;
    ambiguousCharacterCount: number;
}
