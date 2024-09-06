import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUpdateService } from "vs/platform/update/common/update";
import { IWorkspaceTrustManagementService } from "vs/platform/workspace/common/workspaceTrust";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
import { ITimerService } from "vs/workbench/services/timer/browser/timerService";
export declare abstract class StartupTimings {
    private readonly _editorService;
    private readonly _paneCompositeService;
    private readonly _lifecycleService;
    private readonly _updateService;
    private readonly _workspaceTrustService;
    constructor(_editorService: IEditorService, _paneCompositeService: IPaneCompositePartService, _lifecycleService: ILifecycleService, _updateService: IUpdateService, _workspaceTrustService: IWorkspaceTrustManagementService);
    protected _isStandardStartup(): Promise<string | undefined>;
}
export declare class BrowserStartupTimings extends StartupTimings implements IWorkbenchContribution {
    private readonly timerService;
    private readonly logService;
    private readonly environmentService;
    private readonly telemetryService;
    private readonly productService;
    constructor(editorService: IEditorService, paneCompositeService: IPaneCompositePartService, lifecycleService: ILifecycleService, updateService: IUpdateService, workspaceTrustService: IWorkspaceTrustManagementService, timerService: ITimerService, logService: ILogService, environmentService: IBrowserWorkbenchEnvironmentService, telemetryService: ITelemetryService, productService: IProductService);
    private logPerfMarks;
}
export declare class BrowserResourcePerformanceMarks {
    constructor(telemetryService: ITelemetryService);
}
