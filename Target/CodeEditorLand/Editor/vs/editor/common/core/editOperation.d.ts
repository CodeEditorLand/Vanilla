import { Position } from "./position.js";
import { IRange, Range } from "./range.js";
/**
 * A single edit operation, that acts as a simple replace.
 * i.e. Replace text at `range` with `text` in model.
 */
export interface ISingleEditOperation {
    /**
     * The range to replace. This can be empty to emulate a simple insert.
     */
    range: IRange;
    /**
     * The text to replace with. This can be null to emulate a simple delete.
     */
    text: string | null;
    /**
     * This indicates that this operation has "insert" semantics.
     * i.e. forceMoveMarkers = true => if `range` is collapsed, all markers at the position will be moved.
     */
    forceMoveMarkers?: boolean;
}
export declare class EditOperation {
    static insert(position: Position, text: string): ISingleEditOperation;
    static delete(range: Range): ISingleEditOperation;
    static replace(range: Range, text: string | null): ISingleEditOperation;
    static replaceMove(range: Range, text: string | null): ISingleEditOperation;
}
