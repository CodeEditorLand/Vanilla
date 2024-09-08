import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IFileChange } from '../../../common/files.js';
import { ILogMessage, INonRecursiveWatchRequest, IRecursiveWatcherWithSubscribe } from '../../../common/watcher.js';
export declare class NodeJSFileWatcherLibrary extends Disposable {
    private readonly request;
    private readonly recursiveWatcher;
    private readonly onDidFilesChange;
    private readonly onDidWatchFail?;
    private readonly onLogMessage?;
    private verboseLogging?;
    private static readonly FILE_DELETE_HANDLER_DELAY;
    private static readonly FILE_CHANGES_HANDLER_DELAY;
    private readonly throttledFileChangesEmitter;
    private readonly fileChangesAggregator;
    private readonly excludes;
    private readonly includes;
    private readonly filter;
    private readonly cts;
    readonly ready: Promise<void>;
    private _isReusingRecursiveWatcher;
    get isReusingRecursiveWatcher(): boolean;
    private didFail;
    get failed(): boolean;
    constructor(request: INonRecursiveWatchRequest, recursiveWatcher: IRecursiveWatcherWithSubscribe | undefined, onDidFilesChange: (changes: IFileChange[]) => void, onDidWatchFail?: (() => void) | undefined, onLogMessage?: ((msg: ILogMessage) => void) | undefined, verboseLogging?: boolean | undefined);
    private watch;
    private notifyWatchFailed;
    private normalizePath;
    private doWatch;
    private doWatchWithExistingWatcher;
    private doWatchWithNodeJS;
    private onWatchedPathDeleted;
    private onFileChange;
    private handleFileChanges;
    private existsChildStrictCase;
    setVerboseLogging(verboseLogging: boolean): void;
    private error;
    private warn;
    private trace;
    private traceWithCorrelation;
    dispose(): void;
}
/**
 * Watch the provided `path` for changes and return
 * the data in chunks of `Uint8Array` for further use.
 */
export declare function watchFileContents(path: string, onData: (chunk: Uint8Array) => void, onReady: () => void, token: CancellationToken, bufferSize?: number): Promise<void>;
