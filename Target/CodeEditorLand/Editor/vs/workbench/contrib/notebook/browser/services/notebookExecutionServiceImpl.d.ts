import { IDisposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IWorkspaceTrustRequestService } from "vs/platform/workspace/common/workspaceTrust";
import { NotebookCellTextModel } from "vs/workbench/contrib/notebook/common/model/notebookCellTextModel";
import { INotebookTextModel } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { ICellExecutionParticipant, INotebookExecutionService } from "vs/workbench/contrib/notebook/common/notebookExecutionService";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
import { INotebookKernelHistoryService, INotebookKernelService } from "vs/workbench/contrib/notebook/common/notebookKernelService";
import { INotebookLoggingService } from "vs/workbench/contrib/notebook/common/notebookLoggingService";
export declare class NotebookExecutionService implements INotebookExecutionService, IDisposable {
    private readonly _commandService;
    private readonly _notebookKernelService;
    private readonly _notebookKernelHistoryService;
    private readonly _workspaceTrustRequestService;
    private readonly _logService;
    private readonly _notebookExecutionStateService;
    _serviceBrand: undefined;
    private _activeProxyKernelExecutionToken;
    constructor(_commandService: ICommandService, _notebookKernelService: INotebookKernelService, _notebookKernelHistoryService: INotebookKernelHistoryService, _workspaceTrustRequestService: IWorkspaceTrustRequestService, _logService: INotebookLoggingService, _notebookExecutionStateService: INotebookExecutionStateService);
    executeNotebookCells(notebook: INotebookTextModel, cells: Iterable<NotebookCellTextModel>, contextKeyService: IContextKeyService): Promise<void>;
    cancelNotebookCellHandles(notebook: INotebookTextModel, cells: Iterable<number>): Promise<void>;
    cancelNotebookCells(notebook: INotebookTextModel, cells: Iterable<NotebookCellTextModel>): Promise<void>;
    private readonly cellExecutionParticipants;
    registerExecutionParticipant(participant: ICellExecutionParticipant): any;
    private runExecutionParticipants;
    dispose(): void;
}
