import { IDisposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { IModelDeltaDecoration } from "vs/editor/common/model";
export declare function getReadonlyEmptyArray<T>(): readonly T[];
export declare class ColumnRange {
    readonly startColumn: number;
    readonly endColumnExclusive: number;
    constructor(startColumn: number, endColumnExclusive: number);
    toRange(lineNumber: number): Range;
    equals(other: ColumnRange): boolean;
}
export declare function applyObservableDecorations(editor: ICodeEditor, decorations: IObservable<IModelDeltaDecoration[]>): IDisposable;
export declare function addPositions(pos1: Position, pos2: Position): Position;
export declare function subtractPositions(pos1: Position, pos2: Position): Position;
