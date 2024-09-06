import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { INotebookEditorDelegate } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
import { INotebookKernelService } from "vs/workbench/contrib/notebook/common/notebookKernelService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare class NotebookEditorContextKeys {
    private readonly _editor;
    private readonly _notebookKernelService;
    private readonly _extensionService;
    private readonly _notebookExecutionStateService;
    private readonly _notebookKernel;
    private readonly _notebookKernelCount;
    private readonly _notebookKernelSourceCount;
    private readonly _notebookKernelSelected;
    private readonly _interruptibleKernel;
    private readonly _someCellRunning;
    private readonly _kernelRunning;
    private readonly _hasOutputs;
    private readonly _useConsolidatedOutputButton;
    private readonly _viewType;
    private readonly _missingKernelExtension;
    private readonly _cellToolbarLocation;
    private readonly _lastCellFailed;
    private readonly _disposables;
    private readonly _viewModelDisposables;
    private readonly _cellOutputsListeners;
    private readonly _selectedKernelDisposables;
    constructor(_editor: INotebookEditorDelegate, _notebookKernelService: INotebookKernelService, contextKeyService: IContextKeyService, _extensionService: IExtensionService, _notebookExecutionStateService: INotebookExecutionStateService);
    dispose(): void;
    private _handleDidChangeModel;
    private _updateForExecution;
    private _updateForLastRunFailState;
    private _updateForInstalledExtension;
    private _updateKernelContext;
    private _updateForNotebookOptions;
}