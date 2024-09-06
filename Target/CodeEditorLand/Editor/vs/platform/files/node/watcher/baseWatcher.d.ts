import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IFileChange } from "vs/platform/files/common/files";
import { IRecursiveWatcherWithSubscribe, IUniversalWatchRequest, IWatcher, IWatcherErrorEvent, IWatchRequestWithCorrelation } from "vs/platform/files/common/watcher";
export declare abstract class BaseWatcher extends Disposable implements IWatcher {
    protected readonly _onDidChangeFile: any;
    readonly onDidChangeFile: any;
    protected readonly _onDidLogMessage: any;
    readonly onDidLogMessage: any;
    protected readonly _onDidWatchFail: any;
    private readonly onDidWatchFail;
    private readonly allNonCorrelatedWatchRequests;
    private readonly allCorrelatedWatchRequests;
    private readonly suspendedWatchRequests;
    private readonly suspendedWatchRequestsWithPolling;
    private readonly updateWatchersDelayer;
    protected readonly suspendedWatchRequestPollingInterval: number;
    private joinWatch;
    constructor();
    private handleDidWatchFail;
    protected isCorrelated(request: IUniversalWatchRequest): request is IWatchRequestWithCorrelation;
    watch(requests: IUniversalWatchRequest[]): Promise<void>;
    private updateWatchers;
    protected getUpdateWatchersDelay(): number;
    isSuspended(request: IUniversalWatchRequest): "polling" | boolean;
    private suspendWatchRequest;
    private resumeWatchRequest;
    private monitorSuspendedWatchRequest;
    private doMonitorWithExistingWatcher;
    private doMonitorWithNodeJS;
    private onMonitoredPathAdded;
    private isPathNotFound;
    stop(): Promise<void>;
    protected traceEvent(event: IFileChange, request: IUniversalWatchRequest): void;
    protected traceWithCorrelation(message: string, request: IUniversalWatchRequest): void;
    protected requestToString(request: IUniversalWatchRequest): string;
    protected abstract doWatch(requests: IUniversalWatchRequest[]): Promise<void>;
    protected abstract readonly recursiveWatcher: IRecursiveWatcherWithSubscribe | undefined;
    protected abstract trace(message: string): void;
    protected abstract warn(message: string): void;
    abstract onDidError: Event<IWatcherErrorEvent>;
    protected verboseLogging: boolean;
    setVerboseLogging(enabled: boolean): Promise<void>;
}
