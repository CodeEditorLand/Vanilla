import { CodeWindow } from "vs/base/browser/window";
import { Disposable } from "vs/base/common/lifecycle";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IProductService } from "vs/platform/product/common/productService";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
import { BrowserLifecycleService } from "vs/workbench/services/lifecycle/browser/lifecycleService";
import { ShutdownReason } from "vs/workbench/services/lifecycle/common/lifecycle";
export declare abstract class BaseWindow extends Disposable {
    protected readonly hostService: IHostService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    private static TIMEOUT_HANDLES;
    private static readonly TIMEOUT_DISPOSABLES;
    constructor(targetWindow: CodeWindow, dom: {
        getWindowsCount: any;
        getWindows: any;
    } | undefined, hostService: IHostService, environmentService: IWorkbenchEnvironmentService);
    protected enableWindowFocusOnElementFocus(targetWindow: CodeWindow): void;
    private onElementFocus;
    protected enableMultiWindowAwareTimeout(targetWindow: Window, dom?: {
        getWindowsCount: any;
        getWindows: any;
    }): void;
    private registerFullScreenListeners;
    static confirmOnShutdown(accessor: ServicesAccessor, reason: ShutdownReason): Promise<boolean>;
}
export declare class BrowserWindow extends BaseWindow {
    private readonly openerService;
    private readonly lifecycleService;
    private readonly dialogService;
    private readonly labelService;
    private readonly productService;
    private readonly browserEnvironmentService;
    private readonly layoutService;
    private readonly instantiationService;
    constructor(openerService: IOpenerService, lifecycleService: BrowserLifecycleService, dialogService: IDialogService, labelService: ILabelService, productService: IProductService, browserEnvironmentService: IBrowserWorkbenchEnvironmentService, layoutService: IWorkbenchLayoutService, instantiationService: IInstantiationService, hostService: IHostService);
    private registerListeners;
    private onWillShutdown;
    private create;
    private setupDriver;
    private setupOpenHandlers;
    private registerLabelFormatters;
    private registerCommands;
}
