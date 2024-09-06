import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ExtensionIdentifier, IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { ExtensionHostKind } from './extensionHostKind.js';
import { IExtensionHostManager } from './extensionHostManagers.js';
import { IExtensionDescriptionDelta } from './extensionHostProtocol.js';
import { IResolveAuthorityResult } from './extensionHostProxy.js';
import { ExtensionRunningLocation } from './extensionRunningLocation.js';
import { ActivationKind, ExtensionActivationReason, ExtensionHostStartup, IExtensionHost, IInternalExtensionService } from './extensions.js';
import { ResponsiveState } from './rpcProtocol.js';
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
