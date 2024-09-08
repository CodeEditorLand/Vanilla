import { type Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import type { ExtensionIdentifier, IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import type { ExtensionHostKind } from "./extensionHostKind.js";
import type { IExtensionHostManager } from "./extensionHostManagers.js";
import type { IExtensionDescriptionDelta } from "./extensionHostProtocol.js";
import type { IResolveAuthorityResult } from "./extensionHostProxy.js";
import type { ExtensionRunningLocation } from "./extensionRunningLocation.js";
import { ActivationKind, type ExtensionActivationReason, type ExtensionHostStartup, type IExtensionHost, type IInternalExtensionService } from "./extensions.js";
import type { ResponsiveState } from "./rpcProtocol.js";
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
