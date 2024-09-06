import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IStorageService } from "vs/platform/storage/common/storage";
import { INotebookKernelSourceAction, INotebookTextModel } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { IKernelSourceActionProvider, INotebookKernel, INotebookKernelDetectionTask, INotebookKernelMatchResult, INotebookKernelService, INotebookSourceActionChangeEvent, INotebookTextModelLike, ISelectedNotebooksChangeEvent, ISourceAction } from "vs/workbench/contrib/notebook/common/notebookKernelService";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
export declare class NotebookKernelService extends Disposable implements INotebookKernelService {
    private readonly _notebookService;
    private readonly _storageService;
    private readonly _menuService;
    private readonly _contextKeyService;
    _serviceBrand: undefined;
    private readonly _kernels;
    private readonly _notebookBindings;
    private readonly _onDidChangeNotebookKernelBinding;
    private readonly _onDidAddKernel;
    private readonly _onDidRemoveKernel;
    private readonly _onDidChangeNotebookAffinity;
    private readonly _onDidChangeSourceActions;
    private readonly _onDidNotebookVariablesChange;
    private readonly _kernelSources;
    private readonly _kernelSourceActionsUpdates;
    private readonly _kernelDetectionTasks;
    private readonly _onDidChangeKernelDetectionTasks;
    private readonly _kernelSourceActionProviders;
    readonly onDidChangeSelectedNotebooks: Event<ISelectedNotebooksChangeEvent>;
    readonly onDidAddKernel: Event<INotebookKernel>;
    readonly onDidRemoveKernel: Event<INotebookKernel>;
    readonly onDidChangeNotebookAffinity: Event<void>;
    readonly onDidChangeSourceActions: Event<INotebookSourceActionChangeEvent>;
    readonly onDidChangeKernelDetectionTasks: Event<string>;
    readonly onDidNotebookVariablesUpdate: Event<URI>;
    private static _storageNotebookBinding;
    constructor(_notebookService: INotebookService, _storageService: IStorageService, _menuService: IMenuService, _contextKeyService: IContextKeyService);
    dispose(): void;
    private _persistSoonHandle?;
    private _persistMementos;
    private static _score;
    private _tryAutoBindNotebook;
    notifyVariablesChange(notebookUri: URI): void;
    registerKernel(kernel: INotebookKernel): IDisposable;
    getMatchingKernel(notebook: INotebookTextModelLike): INotebookKernelMatchResult;
    getSelectedOrSuggestedKernel(notebook: INotebookTextModel): INotebookKernel | undefined;
    selectKernelForNotebook(kernel: INotebookKernel | undefined, notebook: INotebookTextModelLike): void;
    preselectKernelForNotebook(kernel: INotebookKernel, notebook: INotebookTextModelLike): void;
    updateKernelNotebookAffinity(kernel: INotebookKernel, notebook: URI, preference: number | undefined): void;
    getRunningSourceActions(notebook: INotebookTextModelLike): ISourceAction[];
    getSourceActions(notebook: INotebookTextModelLike, contextKeyService: IContextKeyService | undefined): ISourceAction[];
    registerNotebookKernelDetectionTask(task: INotebookKernelDetectionTask): IDisposable;
    getKernelDetectionTasks(notebook: INotebookTextModelLike): INotebookKernelDetectionTask[];
    registerKernelSourceActionProvider(viewType: string, provider: IKernelSourceActionProvider): IDisposable;
    /**
     * Get kernel source actions from providers
     */
    getKernelSourceActions2(notebook: INotebookTextModelLike): Promise<INotebookKernelSourceAction[]>;
}
