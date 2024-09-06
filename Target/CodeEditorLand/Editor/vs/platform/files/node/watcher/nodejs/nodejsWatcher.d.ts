import { INonRecursiveWatcher, INonRecursiveWatchRequest, IRecursiveWatcherWithSubscribe } from "vs/platform/files/common/watcher";
import { BaseWatcher } from "vs/platform/files/node/watcher/baseWatcher";
import { NodeJSFileWatcherLibrary } from "vs/platform/files/node/watcher/nodejs/nodejsWatcherLib";
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
    readonly onDidError: any;
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
