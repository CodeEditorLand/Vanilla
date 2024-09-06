import type { IMarker, Terminal } from "@xterm/headless";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IBufferMarkCapability, IMarkProperties, TerminalCapability } from "./capabilities.js";
/**
 * Manages "marks" in the buffer which are lines that are tracked when lines are added to or removed
 * from the buffer.
 */
export declare class BufferMarkCapability extends Disposable implements IBufferMarkCapability {
    private readonly _terminal;
    readonly type = TerminalCapability.BufferMarkDetection;
    private _idToMarkerMap;
    private _anonymousMarkers;
    private readonly _onMarkAdded;
    readonly onMarkAdded: import("../../../../base/common/event.js").Event<IMarkProperties>;
    constructor(_terminal: Terminal);
    markers(): IterableIterator<IMarker>;
    addMark(properties?: IMarkProperties): void;
    getMark(id: string): IMarker | undefined;
}
