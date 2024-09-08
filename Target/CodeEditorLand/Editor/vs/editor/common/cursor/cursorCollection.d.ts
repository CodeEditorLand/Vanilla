import { Position } from "../core/position.js";
import { type ISelection, Selection } from "../core/selection.js";
import { CursorState, type PartialCursorState } from "../cursorCommon.js";
import type { CursorContext } from "./cursorContext.js";
export declare class CursorCollection {
    private context;
    /**
     * `cursors[0]` is the primary cursor, thus `cursors.length >= 1` is always true.
     * `cursors.slice(1)` are secondary cursors.
     */
    private cursors;
    private lastAddedCursorIndex;
    constructor(context: CursorContext);
    dispose(): void;
    startTrackingSelections(): void;
    stopTrackingSelections(): void;
    updateContext(context: CursorContext): void;
    ensureValidState(): void;
    readSelectionFromMarkers(): Selection[];
    getAll(): CursorState[];
    getViewPositions(): Position[];
    getTopMostViewPosition(): Position;
    getBottomMostViewPosition(): Position;
    getSelections(): Selection[];
    getViewSelections(): Selection[];
    setSelections(selections: ISelection[]): void;
    getPrimaryCursor(): CursorState;
    setStates(states: PartialCursorState[] | null): void;
    /**
     * Creates or disposes secondary cursors as necessary to match the number of `secondarySelections`.
     */
    private _setSecondaryStates;
    killSecondaryCursors(): void;
    private _addSecondaryCursor;
    getLastAddedCursorIndex(): number;
    private _removeSecondaryCursor;
    normalize(): void;
}
