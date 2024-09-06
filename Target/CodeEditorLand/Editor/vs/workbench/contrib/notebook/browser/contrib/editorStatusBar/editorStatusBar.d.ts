import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { INotebookKernelService } from "vs/workbench/contrib/notebook/common/notebookKernelService";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
export declare class KernelStatus extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _statusbarService;
    private readonly _notebookKernelService;
    private readonly _instantiationService;
    private readonly _editorDisposables;
    private readonly _kernelInfoElement;
    constructor(_editorService: IEditorService, _statusbarService: IStatusbarService, _notebookKernelService: INotebookKernelService, _instantiationService: IInstantiationService);
    private _updateStatusbar;
    private _showKernelStatus;
}
export declare class ActiveCellStatus extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _statusbarService;
    private readonly _itemDisposables;
    private readonly _accessor;
    constructor(_editorService: IEditorService, _statusbarService: IStatusbarService);
    private _update;
    private _show;
    private _getSelectionsText;
}
export declare class NotebookIndentationStatus extends Disposable {
    private readonly _editorService;
    private readonly _statusbarService;
    private readonly _configurationService;
    private readonly _itemDisposables;
    private readonly _accessor;
    static readonly ID = "selectNotebookIndentation";
    constructor(_editorService: IEditorService, _statusbarService: IStatusbarService, _configurationService: IConfigurationService);
    private _update;
    private _show;
}
export declare class NotebookEditorStatusContribution extends Disposable implements IWorkbenchContribution {
    private readonly editorGroupService;
    static readonly ID = "notebook.contrib.editorStatus";
    constructor(editorGroupService: IEditorGroupsService);
    private createNotebookStatus;
}
