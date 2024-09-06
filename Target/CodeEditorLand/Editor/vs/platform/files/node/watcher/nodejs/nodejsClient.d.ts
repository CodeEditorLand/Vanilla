import { DisposableStore } from "vs/base/common/lifecycle";
import { IFileChange } from "vs/platform/files/common/files";
import { AbstractNonRecursiveWatcherClient, ILogMessage, INonRecursiveWatcher } from "vs/platform/files/common/watcher";
export declare class NodeJSWatcherClient extends AbstractNonRecursiveWatcherClient {
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected createWatcher(disposables: DisposableStore): INonRecursiveWatcher;
}
