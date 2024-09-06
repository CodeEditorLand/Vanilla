import { DisposableStore } from "vs/base/common/lifecycle";
import { IFileChange } from "vs/platform/files/common/files";
import { AbstractUniversalWatcherClient, ILogMessage, IUniversalWatcher } from "vs/platform/files/common/watcher";
export declare class UniversalWatcherClient extends AbstractUniversalWatcherClient {
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected createWatcher(disposables: DisposableStore): IUniversalWatcher;
}
