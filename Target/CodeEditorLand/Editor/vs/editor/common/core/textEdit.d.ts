import { ISingleEditOperation } from "vs/editor/common/core/editOperation";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { TextLength } from "vs/editor/common/core/textLength";
export declare class TextEdit {
    readonly edits: readonly SingleTextEdit[];
    static single(originalRange: Range, newText: string): TextEdit;
    constructor(edits: readonly SingleTextEdit[]);
    /**
     * Joins touching edits and removes empty edits.
     */
    normalize(): TextEdit;
    mapPosition(position: Position): Position | Range;
    mapRange(range: Range): Range;
    inverseMapPosition(positionAfterEdit: Position, doc: AbstractText): Position | Range;
    inverseMapRange(range: Range, doc: AbstractText): Range;
    apply(text: AbstractText): string;
    applyToString(str: string): string;
    inverse(doc: AbstractText): TextEdit;
    getNewRanges(): Range[];
}
export declare class SingleTextEdit {
    readonly range: Range;
    readonly text: string;
    constructor(range: Range, text: string);
    get isEmpty(): boolean;
    static equals(first: SingleTextEdit, second: SingleTextEdit): any;
    toSingleEditOperation(): ISingleEditOperation;
}
export declare abstract class AbstractText {
    abstract getValueOfRange(range: Range): string;
    abstract readonly length: TextLength;
    get endPositionExclusive(): Position;
    getValue(): string;
}
export declare class LineBasedText extends AbstractText {
    private readonly _getLineContent;
    private readonly _lineCount;
    constructor(_getLineContent: (lineNumber: number) => string, _lineCount: number);
    getValueOfRange(range: Range): string;
    get length(): TextLength;
}
export declare class ArrayText extends LineBasedText {
    constructor(lines: string[]);
}
export declare class StringText extends AbstractText {
    readonly value: string;
    private readonly _t;
    constructor(value: string);
    getValueOfRange(range: Range): string;
    get length(): TextLength;
}
