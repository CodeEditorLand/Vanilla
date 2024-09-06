import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { ExtensionKind } from "vs/platform/environment/common/environment";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProductService } from "vs/platform/product/common/productService";
import { IRemoteAuthorityResolverService, ResolverResult } from "vs/platform/remote/common/remoteAuthorityResolver";
import { IRemoteExtensionsScannerService } from "vs/platform/remote/common/remoteExtensionsScanner";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkspaceTrustManagementService } from "vs/platform/workspace/common/workspaceTrust";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { IWebExtensionsScannerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { AbstractExtensionService, ResolvedExtensions } from "vs/workbench/services/extensions/common/abstractExtensionService";
import { ExtensionHostKind, ExtensionRunningPreference, IExtensionHostKindPicker } from "vs/workbench/services/extensions/common/extensionHostKind";
import { IExtensionManifestPropertiesService } from "vs/workbench/services/extensions/common/extensionManifestPropertiesService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
import { IRemoteExplorerService } from "vs/workbench/services/remote/common/remoteExplorerService";
import { IUserDataInitializationService } from "vs/workbench/services/userData/browser/userDataInit";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class ExtensionService extends AbstractExtensionService implements IExtensionService {
    private readonly _browserEnvironmentService;
    private readonly _webExtensionsScannerService;
    private readonly _userDataInitializationService;
    private readonly _userDataProfileService;
    private readonly _workspaceTrustManagementService;
    private readonly _remoteExplorerService;
    constructor(instantiationService: IInstantiationService, notificationService: INotificationService, _browserEnvironmentService: IBrowserWorkbenchEnvironmentService, telemetryService: ITelemetryService, extensionEnablementService: IWorkbenchExtensionEnablementService, fileService: IFileService, productService: IProductService, extensionManagementService: IWorkbenchExtensionManagementService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, _webExtensionsScannerService: IWebExtensionsScannerService, logService: ILogService, remoteAgentService: IRemoteAgentService, remoteExtensionsScannerService: IRemoteExtensionsScannerService, lifecycleService: ILifecycleService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, _userDataInitializationService: IUserDataInitializationService, _userDataProfileService: IUserDataProfileService, _workspaceTrustManagementService: IWorkspaceTrustManagementService, _remoteExplorerService: IRemoteExplorerService, dialogService: IDialogService);
    private _initFetchFileSystem;
    private _scanWebExtensions;
    protected _resolveExtensionsDefault(): Promise<any>;
    protected _resolveExtensions(): Promise<ResolvedExtensions>;
    protected _onExtensionHostExit(code: number): Promise<void>;
    protected _resolveAuthority(remoteAuthority: string): Promise<ResolverResult>;
}
export declare class BrowserExtensionHostKindPicker implements IExtensionHostKindPicker {
    private readonly _logService;
    constructor(_logService: ILogService);
    pickExtensionHostKind(extensionId: ExtensionIdentifier, extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference): ExtensionHostKind | null;
    static pickRunningLocation(extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference): ExtensionHostKind | null;
}
