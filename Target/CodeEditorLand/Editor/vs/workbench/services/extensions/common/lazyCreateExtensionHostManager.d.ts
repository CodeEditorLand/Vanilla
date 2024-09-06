import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ExtensionIdentifier, IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { ExtensionHostKind } from "vs/workbench/services/extensions/common/extensionHostKind";
import { IExtensionHostManager } from "vs/workbench/services/extensions/common/extensionHostManagers";
import { IExtensionDescriptionDelta } from "vs/workbench/services/extensions/common/extensionHostProtocol";
import { IResolveAuthorityResult } from "vs/workbench/services/extensions/common/extensionHostProxy";
import { ExtensionRunningLocation } from "vs/workbench/services/extensions/common/extensionRunningLocation";
import { ActivationKind, ExtensionActivationReason, ExtensionHostStartup, IExtensionHost, IInternalExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { ResponsiveState } from "vs/workbench/services/extensions/common/rpcProtocol";
/**
 * Waits until `start()` and only if it has extensions proceeds to really start.
 */
export declare class LazyCreateExtensionHostManager extends Disposable implements IExtensionHostManager {
    private readonly _internalExtensionService;
    private readonly _instantiationService;
    private readonly _logService;
    readonly onDidExit: Event<[number, string | null]>;
    private readonly _onDidChangeResponsiveState;
    readonly onDidChangeResponsiveState: Event<ResponsiveState>;
    private readonly _extensionHost;
    private _startCalled;
    private _actual;
    private _lazyStartExtensions;
    get pid(): number | null;
    get kind(): ExtensionHostKind;
    get startup(): ExtensionHostStartup;
    get friendyName(): string;
    constructor(extensionHost: IExtensionHost, _internalExtensionService: IInternalExtensionService, _instantiationService: IInstantiationService, _logService: ILogService);
    private _createActual;
    private _getOrCreateActualAndStart;
    ready(): Promise<void>;
    disconnect(): Promise<void>;
    representsRunningLocation(runningLocation: ExtensionRunningLocation): boolean;
    deltaExtensions(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    activate(extension: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
    activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
    activationEventIsDone(activationEvent: string): boolean;
    getInspectPort(tryEnableInspector: boolean): Promise<{
        port: number;
        host: string;
    } | undefined>;
    resolveAuthority(remoteAuthority: string, resolveAttempt: number): Promise<IResolveAuthorityResult>;
    getCanonicalURI(remoteAuthority: string, uri: URI): Promise<URI | null>;
    start(extensionRegistryVersionId: number, allExtensions: IExtensionDescription[], myExtensions: ExtensionIdentifier[]): Promise<void>;
    extensionTestsExecute(): Promise<number>;
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
