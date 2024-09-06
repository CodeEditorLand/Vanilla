import { Disposable } from "vs/base/common/lifecycle";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
export declare class SyncScroll extends Disposable implements IWorkbenchContribution {
    private readonly editorService;
    private readonly statusbarService;
    static readonly ID = "workbench.contrib.syncScrolling";
    private readonly paneInitialScrollTop;
    private readonly syncScrollDispoasbles;
    private readonly paneDisposables;
    private readonly statusBarEntry;
    private isActive;
    constructor(editorService: IEditorService, statusbarService: IStatusbarService);
    private registerActiveListeners;
    private activate;
    toggle(): void;
    private _reentrancyBarrier;
    private trackVisiblePanes;
    private onDidEditorPaneScroll;
    private getAllVisiblePanes;
    private deactivate;
    private toggleStatusbarItem;
    private registerActions;
    dispose(): void;
}
