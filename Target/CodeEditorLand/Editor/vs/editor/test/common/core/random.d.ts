import { OffsetRange } from '../../../common/core/offsetRange.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { AbstractText, TextEdit } from '../../../common/core/textEdit.js';
export declare abstract class Random {
    static basicAlphabet: string;
    static basicAlphabetMultiline: string;
    static create(seed: number): Random;
    abstract nextIntRange(start: number, endExclusive: number): number;
    nextString(length: number, alphabet?: string): string;
    nextMultiLineString(lineCount: number, lineLengthRange: OffsetRange, alphabet?: string): string;
    nextConsecutivePositions(source: AbstractText, count: number): Position[];
    nextRange(source: AbstractText): Range;
    nextTextEdit(target: AbstractText, singleTextEditCount: number): TextEdit;
}
