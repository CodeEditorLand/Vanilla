import { Disposable } from "vs/base/common/lifecycle";
import { IStorageService } from "vs/platform/storage/common/storage";
import { INotebookKernel, INotebookKernelHistoryService, INotebookKernelService, INotebookTextModelLike } from "vs/workbench/contrib/notebook/common/notebookKernelService";
import { INotebookLoggingService } from "vs/workbench/contrib/notebook/common/notebookLoggingService";
export declare class NotebookKernelHistoryService extends Disposable implements INotebookKernelHistoryService {
    private readonly _storageService;
    private readonly _notebookKernelService;
    private readonly _notebookLoggingService;
    _serviceBrand: undefined;
    private static STORAGE_KEY;
    private _mostRecentKernelsMap;
    constructor(_storageService: IStorageService, _notebookKernelService: INotebookKernelService, _notebookLoggingService: INotebookLoggingService);
    getKernels(notebook: INotebookTextModelLike): {
        selected: INotebookKernel | undefined;
        all: INotebookKernel[];
    };
    addMostRecentKernel(kernel: INotebookKernel): void;
    private _saveState;
    private _loadState;
    private _serialize;
    private _deserialize;
    _clear(): void;
}
