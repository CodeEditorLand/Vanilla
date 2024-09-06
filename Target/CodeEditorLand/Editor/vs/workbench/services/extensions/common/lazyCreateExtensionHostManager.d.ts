import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ExtensionHostKind } from "./extensionHostKind.js";
import { IExtensionHostManager } from "./extensionHostManagers.js";
import { IExtensionDescriptionDelta } from "./extensionHostProtocol.js";
import { IResolveAuthorityResult } from "./extensionHostProxy.js";
import { ExtensionRunningLocation } from "./extensionRunningLocation.js";
import { ActivationKind, ExtensionActivationReason, ExtensionHostStartup, IExtensionHost, IInternalExtensionService } from "./extensions.js";
import { ResponsiveState } from "./rpcProtocol.js";
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
