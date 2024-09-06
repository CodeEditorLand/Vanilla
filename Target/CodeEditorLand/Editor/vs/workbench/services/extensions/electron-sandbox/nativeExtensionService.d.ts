import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { ExtensionKind } from "vs/platform/environment/common/environment";
import { IExtensionGalleryService } from "vs/platform/extensionManagement/common/extensionManagement";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { INativeHostService } from "vs/platform/native/common/native";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProductService } from "vs/platform/product/common/productService";
import { IRemoteAuthorityResolverService, ResolverResult } from "vs/platform/remote/common/remoteAuthorityResolver";
import { IRemoteExtensionsScannerService } from "vs/platform/remote/common/remoteExtensionsScanner";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkspaceTrustManagementService } from "vs/platform/workspace/common/workspaceTrust";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { AbstractExtensionService, ResolvedExtensions } from "vs/workbench/services/extensions/common/abstractExtensionService";
import { ExtensionHostKind, ExtensionRunningPreference, IExtensionHostKindPicker } from "vs/workbench/services/extensions/common/extensionHostKind";
import { IExtensionHostManager } from "vs/workbench/services/extensions/common/extensionHostManagers";
import { IExtensionManifestPropertiesService } from "vs/workbench/services/extensions/common/extensionManifestPropertiesService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
import { IRemoteExplorerService } from "vs/workbench/services/remote/common/remoteExplorerService";
export declare class NativeExtensionService extends AbstractExtensionService implements IExtensionService {
    private readonly _nativeHostService;
    private readonly _hostService;
    private readonly _remoteExplorerService;
    private readonly _extensionGalleryService;
    private readonly _workspaceTrustManagementService;
    private readonly _extensionScanner;
    private readonly _localCrashTracker;
    constructor(instantiationService: IInstantiationService, notificationService: INotificationService, environmentService: IWorkbenchEnvironmentService, telemetryService: ITelemetryService, extensionEnablementService: IWorkbenchExtensionEnablementService, fileService: IFileService, productService: IProductService, extensionManagementService: IWorkbenchExtensionManagementService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, logService: ILogService, remoteAgentService: IRemoteAgentService, remoteExtensionsScannerService: IRemoteExtensionsScannerService, lifecycleService: ILifecycleService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, _nativeHostService: INativeHostService, _hostService: IHostService, _remoteExplorerService: IRemoteExplorerService, _extensionGalleryService: IExtensionGalleryService, _workspaceTrustManagementService: IWorkspaceTrustManagementService, dialogService: IDialogService);
    private _scanAllLocalExtensions;
    protected _onExtensionHostCrashed(extensionHost: IExtensionHostManager, code: number, signal: string | null): void;
    private _sendExtensionHostCrashTelemetry;
    protected _resolveAuthority(remoteAuthority: string): Promise<ResolverResult>;
    private _getCanonicalURI;
    protected _resolveExtensions(): Promise<ResolvedExtensions>;
    private _startLocalExtensionHost;
    protected _onExtensionHostExit(code: number): Promise<void>;
    private _handleNoResolverFound;
}
export declare class NativeExtensionHostKindPicker implements IExtensionHostKindPicker {
    private readonly _logService;
    private readonly _hasRemoteExtHost;
    private readonly _hasWebWorkerExtHost;
    constructor(environmentService: IWorkbenchEnvironmentService, configurationService: IConfigurationService, _logService: ILogService);
    pickExtensionHostKind(extensionId: ExtensionIdentifier, extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference): ExtensionHostKind | null;
    static pickExtensionHostKind(extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference, hasRemoteExtHost: boolean, hasWebWorkerExtHost: boolean): ExtensionHostKind | null;
}
