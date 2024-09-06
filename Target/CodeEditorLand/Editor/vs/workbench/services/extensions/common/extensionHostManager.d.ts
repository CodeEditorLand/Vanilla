import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ExtensionIdentifier, IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { ExtensionHostKind } from "vs/workbench/services/extensions/common/extensionHostKind";
import { IExtensionHostManager } from "vs/workbench/services/extensions/common/extensionHostManagers";
import { IExtensionDescriptionDelta } from "vs/workbench/services/extensions/common/extensionHostProtocol";
import { IResolveAuthorityResult } from "vs/workbench/services/extensions/common/extensionHostProxy";
import { ExtensionRunningLocation } from "vs/workbench/services/extensions/common/extensionRunningLocation";
import { ActivationKind, ExtensionActivationReason, ExtensionHostStartup, IExtensionHost, IInternalExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { ResponsiveState } from "vs/workbench/services/extensions/common/rpcProtocol";
export declare class ExtensionHostManager extends Disposable implements IExtensionHostManager {
    private readonly _internalExtensionService;
    private readonly _instantiationService;
    private readonly _environmentService;
    private readonly _telemetryService;
    private readonly _logService;
    readonly onDidExit: Event<[number, string | null]>;
    private readonly _onDidChangeResponsiveState;
    readonly onDidChangeResponsiveState: Event<ResponsiveState>;
    /**
     * A map of already requested activation events to speed things up if the same activation event is triggered multiple times.
     */
    private readonly _cachedActivationEvents;
    private readonly _resolvedActivationEvents;
    private _rpcProtocol;
    private readonly _customers;
    private readonly _extensionHost;
    private _proxy;
    private _hasStarted;
    get pid(): number | null;
    get kind(): ExtensionHostKind;
    get startup(): ExtensionHostStartup;
    get friendyName(): string;
    constructor(extensionHost: IExtensionHost, initialActivationEvents: string[], _internalExtensionService: IInternalExtensionService, _instantiationService: IInstantiationService, _environmentService: IWorkbenchEnvironmentService, _telemetryService: ITelemetryService, _logService: ILogService);
    disconnect(): Promise<void>;
    dispose(): void;
    private measure;
    ready(): Promise<void>;
    private _measureLatency;
    private static _convert;
    private _measureUp;
    private _measureDown;
    private _createExtensionHostCustomers;
    activate(extension: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
    activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
    activationEventIsDone(activationEvent: string): boolean;
    private _activateByEvent;
    getInspectPort(tryEnableInspector: boolean): Promise<{
        port: number;
        host: string;
    } | undefined>;
    resolveAuthority(remoteAuthority: string, resolveAttempt: number): Promise<IResolveAuthorityResult>;
    getCanonicalURI(remoteAuthority: string, uri: URI): Promise<URI | null>;
    start(extensionRegistryVersionId: number, allExtensions: IExtensionDescription[], myExtensions: ExtensionIdentifier[]): Promise<void>;
    extensionTestsExecute(): Promise<number>;
    representsRunningLocation(runningLocation: ExtensionRunningLocation): boolean;
    deltaExtensions(incomingExtensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
export declare function friendlyExtHostName(kind: ExtensionHostKind, pid: number | null): string;
