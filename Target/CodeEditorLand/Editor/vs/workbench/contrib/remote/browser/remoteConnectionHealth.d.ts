import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IBannerService } from "vs/workbench/services/banner/browser/bannerService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare class InitialRemoteConnectionHealthContribution implements IWorkbenchContribution {
    private readonly _remoteAgentService;
    private readonly _environmentService;
    private readonly _telemetryService;
    private readonly bannerService;
    private readonly dialogService;
    private readonly openerService;
    private readonly hostService;
    private readonly storageService;
    private readonly productService;
    constructor(_remoteAgentService: IRemoteAgentService, _environmentService: IWorkbenchEnvironmentService, _telemetryService: ITelemetryService, bannerService: IBannerService, dialogService: IDialogService, openerService: IOpenerService, hostService: IHostService, storageService: IStorageService, productService: IProductService);
    private _confirmConnection;
    private _checkInitialRemoteConnectionHealth;
    private _measureExtHostLatency;
}
