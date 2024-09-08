import type { DisposableStore } from "../../../../base/common/lifecycle.js";
import type { IFileChange } from "../../common/files.js";
import { AbstractUniversalWatcherClient, type ILogMessage, type IUniversalWatcher } from "../../common/watcher.js";
export declare class UniversalWatcherClient extends AbstractUniversalWatcherClient {
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected createWatcher(disposables: DisposableStore): IUniversalWatcher;
}
