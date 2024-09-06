import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ExtensionIdentifier, IExtension, IExtensionContributions, IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRemoteAuthorityResolverService, ResolverResult } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IRemoteExtensionsScannerService } from '../../../../platform/remote/common/remoteExtensionsScanner.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from '../../extensionManagement/common/extensionManagement.js';
import { ExtensionDescriptionRegistrySnapshot, IActivationEventsReader } from './extensionDescriptionRegistry.js';
import { ExtensionHostKind, IExtensionHostKindPicker } from './extensionHostKind.js';
import { IExtensionHostManager } from './extensionHostManagers.js';
import { IExtensionManifestPropertiesService } from './extensionManifestPropertiesService.js';
import { ExtensionRunningLocation } from './extensionRunningLocation.js';
import { ExtensionRunningLocationTracker } from './extensionRunningLocationTracker.js';
import { ActivationKind, ActivationTimes, ExtensionActivationReason, ExtensionPointContribution, IExtensionHost, IExtensionService, IExtensionsStatus, IMessage, IResponsiveStateChangeEvent, IWillActivateEvent, WillStopExtensionHostsEvent } from './extensions.js';
import { ExtensionsProposedApi } from './extensionsProposedApi.js';
import { IExtensionPoint } from './extensionsRegistry.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
export declare abstract class AbstractExtensionService extends Disposable implements IExtensionService {
    private readonly _extensionsProposedApi;
    private readonly _extensionHostFactory;
    private readonly _extensionHostKindPicker;
    protected readonly _instantiationService: IInstantiationService;
    protected readonly _notificationService: INotificationService;
    protected readonly _environmentService: IWorkbenchEnvironmentService;
    protected readonly _telemetryService: ITelemetryService;
    protected readonly _extensionEnablementService: IWorkbenchExtensionEnablementService;
    protected readonly _fileService: IFileService;
    protected readonly _productService: IProductService;
    protected readonly _extensionManagementService: IWorkbenchExtensionManagementService;
    private readonly _contextService;
    private readonly _configurationService;
    private readonly _extensionManifestPropertiesService;
    protected readonly _logService: ILogService;
    protected readonly _remoteAgentService: IRemoteAgentService;
    protected readonly _remoteExtensionsScannerService: IRemoteExtensionsScannerService;
    private readonly _lifecycleService;
    protected readonly _remoteAuthorityResolverService: IRemoteAuthorityResolverService;
    private readonly _dialogService;
    _serviceBrand: undefined;
    private readonly _onDidRegisterExtensions;
    readonly onDidRegisterExtensions: import("../../../../base/common/event.js").Event<void>;
    private readonly _onDidChangeExtensionsStatus;
    readonly onDidChangeExtensionsStatus: import("../../../../base/common/event.js").Event<ExtensionIdentifier[]>;
    private readonly _onDidChangeExtensions;
    readonly onDidChangeExtensions: import("../../../../base/common/event.js").Event<{
        readonly added: ReadonlyArray<IExtensionDescription>;
        readonly removed: ReadonlyArray<IExtensionDescription>;
    }>;
    private readonly _onWillActivateByEvent;
    readonly onWillActivateByEvent: import("../../../../base/common/event.js").Event<IWillActivateEvent>;
    private readonly _onDidChangeResponsiveChange;
    readonly onDidChangeResponsiveChange: import("../../../../base/common/event.js").Event<IResponsiveStateChangeEvent>;
    private readonly _onWillStop;
    readonly onWillStop: import("../../../../base/common/event.js").Event<WillStopExtensionHostsEvent>;
    private readonly _activationEventReader;
    private readonly _registry;
    private readonly _installedExtensionsReady;
    private readonly _extensionStatus;
    private readonly _allRequestedActivateEvents;
    private readonly _runningLocations;
    private readonly _remoteCrashTracker;
    private _deltaExtensionsQueue;
    private _inHandleDeltaExtensions;
    private readonly _extensionHostManagers;
    private _resolveAuthorityAttempt;
    constructor(_extensionsProposedApi: ExtensionsProposedApi, _extensionHostFactory: IExtensionHostFactory, _extensionHostKindPicker: IExtensionHostKindPicker, _instantiationService: IInstantiationService, _notificationService: INotificationService, _environmentService: IWorkbenchEnvironmentService, _telemetryService: ITelemetryService, _extensionEnablementService: IWorkbenchExtensionEnablementService, _fileService: IFileService, _productService: IProductService, _extensionManagementService: IWorkbenchExtensionManagementService, _contextService: IWorkspaceContextService, _configurationService: IConfigurationService, _extensionManifestPropertiesService: IExtensionManifestPropertiesService, _logService: ILogService, _remoteAgentService: IRemoteAgentService, _remoteExtensionsScannerService: IRemoteExtensionsScannerService, _lifecycleService: ILifecycleService, _remoteAuthorityResolverService: IRemoteAuthorityResolverService, _dialogService: IDialogService);
    protected _getExtensionHostManagers(kind: ExtensionHostKind): IExtensionHostManager[];
    private _handleDeltaExtensions;
    private _deltaExtensions;
    private _updateExtensionsOnExtHosts;
    private _updateExtensionsOnExtHost;
    canAddExtension(extension: IExtensionDescription): boolean;
    private _canAddExtension;
    canRemoveExtension(extension: IExtensionDescription): boolean;
    private _activateAddedExtensionIfNeeded;
    protected _initialize(): Promise<void>;
    private _processExtensions;
    private _handleExtensionTests;
    private findTestExtensionHost;
    private _releaseBarrier;
    protected _resolveAuthorityInitial(remoteAuthority: string): Promise<ResolverResult>;
    protected _resolveAuthorityAgain(): Promise<void>;
    private _resolveAuthorityWithLogging;
    protected _resolveAuthorityOnExtensionHosts(kind: ExtensionHostKind, remoteAuthority: string): Promise<ResolverResult>;
    stopExtensionHosts(reason: string, auto?: boolean): Promise<boolean>;
    protected _doStopExtensionHosts(): Promise<void>;
    private _doStopExtensionHostsWithVeto;
    private _startExtensionHostsIfNecessary;
    private _createExtensionHostManager;
    protected _doCreateExtensionHostManager(extensionHost: IExtensionHost, initialActivationEvents: string[]): IExtensionHostManager;
    private _onExtensionHostCrashOrExit;
    protected _onExtensionHostCrashed(extensionHost: IExtensionHostManager, code: number, signal: string | null): void;
    private _getExtensionHostExitInfoWithTimeout;
    private _onRemoteExtensionHostCrashed;
    protected _logExtensionHostCrash(extensionHost: IExtensionHostManager): void;
    startExtensionHosts(updates?: {
        toAdd: IExtension[];
        toRemove: string[];
    }): Promise<void>;
    activateByEvent(activationEvent: string, activationKind?: ActivationKind): Promise<void>;
    private _activateByEvent;
    activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    activationEventIsDone(activationEvent: string): boolean;
    whenInstalledExtensionsRegistered(): Promise<boolean>;
    get extensions(): IExtensionDescription[];
    protected _getExtensionRegistrySnapshotWhenReady(): Promise<ExtensionDescriptionRegistrySnapshot>;
    getExtension(id: string): Promise<IExtensionDescription | undefined>;
    readExtensionPointContributions<T extends IExtensionContributions[keyof IExtensionContributions]>(extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]>;
    getExtensionsStatus(): {
        [id: string]: IExtensionsStatus;
    };
    getInspectPorts(extensionHostKind: ExtensionHostKind, tryEnableInspector: boolean): Promise<{
        port: number;
        host: string;
    }[]>;
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
    private _safeInvokeIsEnabled;
    private _doHandleExtensionPoints;
    private _getOrCreateExtensionStatus;
    private _handleExtensionPointMessage;
    private static _handleExtensionPoint;
    private _acquireInternalAPI;
    _activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    private _onWillActivateExtension;
    private _onDidActivateExtension;
    private _onDidActivateExtensionError;
    private _onExtensionRuntimeError;
    protected abstract _resolveExtensions(): Promise<ResolvedExtensions>;
    protected abstract _onExtensionHostExit(code: number): Promise<void>;
    protected abstract _resolveAuthority(remoteAuthority: string): Promise<ResolverResult>;
}
export declare class ResolvedExtensions {
    readonly local: IExtensionDescription[];
    readonly remote: IExtensionDescription[];
    readonly hasLocalProcess: boolean;
    readonly allowRemoteExtensionsInLocalWebWorker: boolean;
    constructor(local: IExtensionDescription[], remote: IExtensionDescription[], hasLocalProcess: boolean, allowRemoteExtensionsInLocalWebWorker: boolean);
}
export interface IExtensionHostFactory {
    createExtensionHost(runningLocations: ExtensionRunningLocationTracker, runningLocation: ExtensionRunningLocation, isInitialStart: boolean): IExtensionHost | null;
}
/**
 * @argument extensions The extensions to be checked.
 * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
 */
export declare function checkEnabledAndProposedAPI(logService: ILogService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensionsProposedApi: ExtensionsProposedApi, extensions: IExtensionDescription[], ignoreWorkspaceTrust: boolean): IExtensionDescription[];
/**
 * Return the subset of extensions that are enabled.
 * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
 */
export declare function filterEnabledExtensions(logService: ILogService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensions: IExtensionDescription[], ignoreWorkspaceTrust: boolean): IExtensionDescription[];
/**
 * @argument extension The extension to be checked.
 * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
 */
export declare function extensionIsEnabled(logService: ILogService, extensionEnablementService: IWorkbenchExtensionEnablementService, extension: IExtensionDescription, ignoreWorkspaceTrust: boolean): boolean;
export declare class ExtensionStatus {
    readonly id: ExtensionIdentifier;
    private readonly _messages;
    get messages(): IMessage[];
    private _activationTimes;
    get activationTimes(): ActivationTimes | null;
    private _runtimeErrors;
    get runtimeErrors(): Error[];
    private _activationStarted;
    get activationStarted(): boolean;
    constructor(id: ExtensionIdentifier);
    clearRuntimeStatus(): void;
    addMessage(msg: IMessage): void;
    setActivationTimes(activationTimes: ActivationTimes): void;
    addRuntimeError(err: Error): void;
    onWillActivate(): void;
}
export declare class ExtensionHostCrashTracker {
    private static _TIME_LIMIT;
    private static _CRASH_LIMIT;
    private readonly _recentCrashes;
    private _removeOldCrashes;
    registerCrash(): void;
    shouldAutomaticallyRestart(): boolean;
}
/**
 * This can run correctly only on the renderer process because that is the only place
 * where all extension points and all implicit activation events generators are known.
 */
export declare class ImplicitActivationAwareReader implements IActivationEventsReader {
    readActivationEvents(extensionDescription: IExtensionDescription): string[];
}
