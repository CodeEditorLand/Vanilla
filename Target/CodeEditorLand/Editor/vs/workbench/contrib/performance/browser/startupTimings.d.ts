import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IUpdateService } from "../../../../platform/update/common/update.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { ITimerService } from "../../../services/timer/browser/timerService.js";
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
