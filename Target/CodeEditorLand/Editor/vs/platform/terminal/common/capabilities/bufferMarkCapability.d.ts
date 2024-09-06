import type { IMarker, Terminal } from "@xterm/headless";
import { Disposable } from "vs/base/common/lifecycle";
import { IBufferMarkCapability, IMarkProperties } from "vs/platform/terminal/common/capabilities/capabilities";
/**
 * Manages "marks" in the buffer which are lines that are tracked when lines are added to or removed
 * from the buffer.
 */
export declare class BufferMarkCapability extends Disposable implements IBufferMarkCapability {
    private readonly _terminal;
    readonly type: any;
    private _idToMarkerMap;
    private _anonymousMarkers;
    private readonly _onMarkAdded;
    readonly onMarkAdded: any;
    constructor(_terminal: Terminal);
    markers(): IterableIterator<IMarker>;
    addMark(properties?: IMarkProperties): void;
    getMark(id: string): IMarker | undefined;
}
