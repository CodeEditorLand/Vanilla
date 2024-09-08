import type { DisposableStore } from "../../../../base/common/lifecycle.js";
import type { IFileChange } from "../../../../platform/files/common/files.js";
import { AbstractUniversalWatcherClient, type ILogMessage, type IRecursiveWatcher } from "../../../../platform/files/common/watcher.js";
import type { IUtilityProcessWorkerWorkbenchService } from "../../utilityProcess/electron-sandbox/utilityProcessWorkerWorkbenchService.js";
export declare class UniversalWatcherClient extends AbstractUniversalWatcherClient {
    private readonly utilityProcessWorkerWorkbenchService;
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean, utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService);
    protected createWatcher(disposables: DisposableStore): IRecursiveWatcher;
}
