import { IProcessEnvironment } from "vs/base/common/platform";
import { ICSSDevelopmentService } from "vs/platform/cssDev/node/cssDevService";
import { IDiagnosticsService, PerformanceInfo, SystemInfo } from "vs/platform/diagnostics/common/diagnostics";
import { IDiagnosticsMainService } from "vs/platform/diagnostics/electron-main/diagnosticsMainService";
import { IDialogMainService } from "vs/platform/dialogs/electron-main/dialogMainService";
import { IEnvironmentMainService } from "vs/platform/environment/electron-main/environmentMainService";
import { IProcessMainService, ProcessExplorerData } from "vs/platform/issue/common/issue";
import { ILogService } from "vs/platform/log/common/log";
import { INativeHostMainService } from "vs/platform/native/electron-main/nativeHostMainService";
import { IProductService } from "vs/platform/product/common/productService";
import { IProtocolMainService } from "vs/platform/protocol/electron-main/protocol";
import { IStateService } from "vs/platform/state/node/state";
export declare class ProcessMainService implements IProcessMainService {
    private userEnv;
    private readonly environmentMainService;
    private readonly logService;
    private readonly diagnosticsService;
    private readonly diagnosticsMainService;
    private readonly dialogMainService;
    private readonly nativeHostMainService;
    private readonly protocolMainService;
    private readonly productService;
    private readonly stateService;
    private readonly cssDevelopmentService;
    readonly _serviceBrand: undefined;
    private static readonly DEFAULT_BACKGROUND_COLOR;
    private processExplorerWindow;
    private processExplorerParentWindow;
    constructor(userEnv: IProcessEnvironment, environmentMainService: IEnvironmentMainService, logService: ILogService, diagnosticsService: IDiagnosticsService, diagnosticsMainService: IDiagnosticsMainService, dialogMainService: IDialogMainService, nativeHostMainService: INativeHostMainService, protocolMainService: IProtocolMainService, productService: IProductService, stateService: IStateService, cssDevelopmentService: ICSSDevelopmentService);
    private registerListeners;
    openProcessExplorer(data: ProcessExplorerData): Promise<void>;
    private focusWindow;
    private getWindowPosition;
    stopTracing(): Promise<void>;
    getSystemStatus(): Promise<string>;
    $getSystemInfo(): Promise<SystemInfo>;
    $getPerformanceInfo(): Promise<PerformanceInfo>;
    private createBrowserWindow;
    private safeSend;
    closeProcessExplorer(): Promise<void>;
}