import { IFileService } from "vs/platform/files/common/files";
import { INativeHostService } from "vs/platform/native/common/native";
import { IProductService } from "vs/platform/product/common/productService";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUpdateService } from "vs/platform/update/common/update";
import { IWorkspaceTrustManagementService } from "vs/platform/workspace/common/workspaceTrust";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { StartupTimings } from "vs/workbench/contrib/performance/browser/startupTimings";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
import { ITimerService } from "vs/workbench/services/timer/browser/timerService";
export declare class NativeStartupTimings extends StartupTimings implements IWorkbenchContribution {
    private readonly _fileService;
    private readonly _timerService;
    private readonly _nativeHostService;
    private readonly _telemetryService;
    private readonly _environmentService;
    private readonly _productService;
    constructor(_fileService: IFileService, _timerService: ITimerService, _nativeHostService: INativeHostService, editorService: IEditorService, paneCompositeService: IPaneCompositePartService, _telemetryService: ITelemetryService, lifecycleService: ILifecycleService, updateService: IUpdateService, _environmentService: INativeWorkbenchEnvironmentService, _productService: IProductService, workspaceTrustService: IWorkspaceTrustManagementService);
    private _report;
    private _appendStartupTimes;
    protected _isStandardStartup(): Promise<string | undefined>;
    private _appendContent;
    private _resolveStartupHeapStatistics;
    private _telemetryLogHeapStatistics;
    private _printStartupHeapStatistics;
}
