import type { DisposableStore } from "../../../../../base/common/lifecycle.js";
import type { IFileChange } from "../../../common/files.js";
import { AbstractNonRecursiveWatcherClient, type ILogMessage, type INonRecursiveWatcher } from "../../../common/watcher.js";
export declare class NodeJSWatcherClient extends AbstractNonRecursiveWatcherClient {
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected createWatcher(disposables: DisposableStore): INonRecursiveWatcher;
}
