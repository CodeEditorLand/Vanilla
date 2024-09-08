import { type IDisposable } from "../../../../base/common/lifecycle.js";
import { type IObservable } from "../../../../base/common/observable.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import type { IModelDeltaDecoration } from "../../../common/model.js";
export declare function getReadonlyEmptyArray<T>(): readonly T[];
export declare class ColumnRange {
    readonly startColumn: number;
    readonly endColumnExclusive: number;
    constructor(startColumn: number, endColumnExclusive: number);
    toRange(lineNumber: number): Range;
    equals(other: ColumnRange): boolean;
}
/**
 * Use observableCodeEditor(editor).applyDecorations(decorations) instead.
 * @deprecated
 */
export declare function applyObservableDecorations(editor: ICodeEditor, decorations: IObservable<IModelDeltaDecoration[]>): IDisposable;
export declare function addPositions(pos1: Position, pos2: Position): Position;
export declare function subtractPositions(pos1: Position, pos2: Position): Position;
