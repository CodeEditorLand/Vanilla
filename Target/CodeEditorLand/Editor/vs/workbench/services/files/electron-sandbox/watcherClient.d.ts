import { DisposableStore } from "vs/base/common/lifecycle";
import { IFileChange } from "vs/platform/files/common/files";
import { AbstractUniversalWatcherClient, ILogMessage, IRecursiveWatcher } from "vs/platform/files/common/watcher";
import { IUtilityProcessWorkerWorkbenchService } from "vs/workbench/services/utilityProcess/electron-sandbox/utilityProcessWorkerWorkbenchService";
export declare class UniversalWatcherClient extends AbstractUniversalWatcherClient {
    private readonly utilityProcessWorkerWorkbenchService;
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean, utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService);
    protected createWatcher(disposables: DisposableStore): IRecursiveWatcher;
}
