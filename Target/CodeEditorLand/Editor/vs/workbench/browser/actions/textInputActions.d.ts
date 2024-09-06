import { Disposable } from "vs/base/common/lifecycle";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare class TextInputActionsProvider extends Disposable implements IWorkbenchContribution {
    private readonly layoutService;
    private readonly contextMenuService;
    private readonly clipboardService;
    static readonly ID = "workbench.contrib.textInputActionsProvider";
    private readonly textInputActions;
    constructor(layoutService: IWorkbenchLayoutService, contextMenuService: IContextMenuService, clipboardService: IClipboardService);
    private createActions;
    private registerListeners;
    private onContextMenu;
}
