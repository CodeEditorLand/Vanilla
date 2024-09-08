import { Event } from "../../../../../base/common/event.js";
import type { INonRecursiveWatchRequest, INonRecursiveWatcher, IRecursiveWatcherWithSubscribe } from "../../../common/watcher.js";
import { BaseWatcher } from "../baseWatcher.js";
import { NodeJSFileWatcherLibrary } from "./nodejsWatcherLib.js";
export interface INodeJSWatcherInstance {
    /**
     * The watcher instance.
     */
    readonly instance: NodeJSFileWatcherLibrary;
    /**
     * The watch request associated to the watcher.
     */
    readonly request: INonRecursiveWatchRequest;
}
export declare class NodeJSWatcher extends BaseWatcher implements INonRecursiveWatcher {
    protected readonly recursiveWatcher: IRecursiveWatcherWithSubscribe | undefined;
    readonly onDidError: Event<any>;
    readonly watchers: Set<INodeJSWatcherInstance>;
    constructor(recursiveWatcher: IRecursiveWatcherWithSubscribe | undefined);
    protected doWatch(requests: INonRecursiveWatchRequest[]): Promise<void>;
    private findWatcher;
    private startWatching;
    stop(): Promise<void>;
    private stopWatching;
    private removeDuplicateRequests;
    setVerboseLogging(enabled: boolean): Promise<void>;
    protected trace(message: string, watcher?: INodeJSWatcherInstance): void;
    protected warn(message: string): void;
    private toMessage;
}
