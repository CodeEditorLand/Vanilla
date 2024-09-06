import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IFileChange, IFileSystemProvider, IWatchOptions } from "vs/platform/files/common/files";
import { AbstractNonRecursiveWatcherClient, AbstractUniversalWatcherClient, ILogMessage, IRecursiveWatcherOptions } from "vs/platform/files/common/watcher";
import { ILogService } from "vs/platform/log/common/log";
export interface IDiskFileSystemProviderOptions {
    watcher?: {
        /**
         * Extra options for the recursive file watching.
         */
        recursive?: IRecursiveWatcherOptions;
        /**
         * Forces all file watch requests to run through a
         * single universal file watcher, both recursive
         * and non-recursively.
         *
         * Enabling this option might cause some overhead,
         * specifically the universal file watcher will run
         * in a separate process given its complexity. Only
         * enable it when you understand the consequences.
         */
        forceUniversal?: boolean;
    };
}
export declare abstract class AbstractDiskFileSystemProvider extends Disposable implements Pick<IFileSystemProvider, "watch">, Pick<IFileSystemProvider, "onDidChangeFile">, Pick<IFileSystemProvider, "onDidWatchError"> {
    protected readonly logService: ILogService;
    private readonly options?;
    constructor(logService: ILogService, options?: IDiskFileSystemProviderOptions | undefined);
    protected readonly _onDidChangeFile: any;
    readonly onDidChangeFile: any;
    protected readonly _onDidWatchError: any;
    readonly onDidWatchError: any;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    private universalWatcher;
    private readonly universalWatchRequests;
    private readonly universalWatchRequestDelayer;
    private watchUniversal;
    private refreshUniversalWatchers;
    private doRefreshUniversalWatchers;
    protected abstract createUniversalWatcher(onChange: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean): AbstractUniversalWatcherClient;
    private nonRecursiveWatcher;
    private readonly nonRecursiveWatchRequests;
    private readonly nonRecursiveWatchRequestDelayer;
    private watchNonRecursive;
    private refreshNonRecursiveWatchers;
    private doRefreshNonRecursiveWatchers;
    protected abstract createNonRecursiveWatcher(onChange: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean): AbstractNonRecursiveWatcherClient;
    private onWatcherLogMessage;
    protected logWatcherMessage(msg: ILogMessage): void;
    protected toFilePath(resource: URI): string;
    private toWatchPath;
}
