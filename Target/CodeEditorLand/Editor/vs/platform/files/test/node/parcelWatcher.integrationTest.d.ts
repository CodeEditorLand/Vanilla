import { Event } from "../../../../base/common/event.js";
import type { IRecursiveWatchRequest } from "../../common/watcher.js";
import { ParcelWatcher } from "../../node/watcher/parcel/parcelWatcher.js";
export declare class TestParcelWatcher extends ParcelWatcher {
    protected readonly suspendedWatchRequestPollingInterval = 100;
    private readonly _onDidWatch;
    readonly onDidWatch: Event<void>;
    readonly onWatchFail: Event<import("../../common/watcher.js").IUniversalWatchRequest>;
    testRemoveDuplicateRequests(paths: string[], excludes?: string[]): string[];
    protected getUpdateWatchersDelay(): number;
    protected doWatch(requests: IRecursiveWatchRequest[]): Promise<void>;
    whenReady(): Promise<void>;
}
