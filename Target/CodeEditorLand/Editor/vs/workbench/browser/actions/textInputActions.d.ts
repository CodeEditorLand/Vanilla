import { Disposable } from "../../../base/common/lifecycle.js";
import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { IWorkbenchContribution } from "../../common/contributions.js";
import { IWorkbenchLayoutService } from "../../services/layout/browser/layoutService.js";
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
