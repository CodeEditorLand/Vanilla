import { Action2 } from "vs/platform/actions/common/actions";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from "vs/platform/quickinput/browser/pickerQuickAccess";
import { IQuickPickSeparator } from "vs/platform/quickinput/common/quickInput";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
import { ITerminalGroupService, ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
import { IOutputService } from "vs/workbench/services/output/common/output";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
interface IViewQuickPickItem extends IPickerQuickAccessItem {
    containerLabel: string;
}
export declare class ViewQuickAccessProvider extends PickerQuickAccessProvider<IViewQuickPickItem> {
    private readonly viewDescriptorService;
    private readonly viewsService;
    private readonly outputService;
    private readonly terminalService;
    private readonly terminalGroupService;
    private readonly debugService;
    private readonly paneCompositeService;
    private readonly contextKeyService;
    static PREFIX: string;
    constructor(viewDescriptorService: IViewDescriptorService, viewsService: IViewsService, outputService: IOutputService, terminalService: ITerminalService, terminalGroupService: ITerminalGroupService, debugService: IDebugService, paneCompositeService: IPaneCompositePartService, contextKeyService: IContextKeyService);
    protected _getPicks(filter: string): Array<IViewQuickPickItem | IQuickPickSeparator>;
    private doGetViewPickItems;
    private includeViewContainer;
}
export declare class OpenViewPickerAction extends Action2 {
    static readonly ID = "workbench.action.openView";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class QuickAccessViewPickerAction extends Action2 {
    static readonly ID = "workbench.action.quickOpenView";
    static readonly KEYBINDING: {
        primary: number;
        mac: {
            primary: number;
        };
        linux: {
            primary: number;
        };
    };
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export {};
