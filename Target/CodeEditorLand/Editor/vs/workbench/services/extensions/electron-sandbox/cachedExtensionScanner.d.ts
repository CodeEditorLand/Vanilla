import { IExtensionsScannerService } from "vs/platform/extensionManagement/common/extensionsScannerService";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IWorkbenchExtensionManagementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class CachedExtensionScanner {
    private readonly _notificationService;
    private readonly _hostService;
    private readonly _extensionsScannerService;
    private readonly _userDataProfileService;
    private readonly _extensionManagementService;
    private readonly _environmentService;
    private readonly _logService;
    readonly scannedExtensions: Promise<IExtensionDescription[]>;
    private _scannedExtensionsResolve;
    private _scannedExtensionsReject;
    constructor(_notificationService: INotificationService, _hostService: IHostService, _extensionsScannerService: IExtensionsScannerService, _userDataProfileService: IUserDataProfileService, _extensionManagementService: IWorkbenchExtensionManagementService, _environmentService: IWorkbenchEnvironmentService, _logService: ILogService);
    startScanningExtensions(): Promise<void>;
    private _scanInstalledExtensions;
}
