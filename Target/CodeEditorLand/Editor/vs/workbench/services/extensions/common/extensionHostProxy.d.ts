import type { VSBuffer } from "../../../../base/common/buffer.js";
import type { URI } from "../../../../base/common/uri.js";
import type { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import type { IRemoteConnectionData, RemoteAuthorityResolverErrorCode, ResolverResult } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import type { IExtensionDescriptionDelta } from "./extensionHostProtocol.js";
import type { ActivationKind, ExtensionActivationReason } from "./extensions.js";
export interface IResolveAuthorityErrorResult {
    type: "error";
    error: {
        message: string | undefined;
        code: RemoteAuthorityResolverErrorCode;
        detail: any;
    };
}
export interface IResolveAuthorityOKResult {
    type: "ok";
    value: ResolverResult;
}
export type IResolveAuthorityResult = IResolveAuthorityErrorResult | IResolveAuthorityOKResult;
export interface IExtensionHostProxy {
    resolveAuthority(remoteAuthority: string, resolveAttempt: number): Promise<IResolveAuthorityResult>;
    /**
     * Returns `null` if no resolver for `remoteAuthority` is found.
     */
    getCanonicalURI(remoteAuthority: string, uri: URI): Promise<URI | null>;
    startExtensionHost(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    extensionTestsExecute(): Promise<number>;
    activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
    activate(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
    updateRemoteConnectionData(connectionData: IRemoteConnectionData): Promise<void>;
    deltaExtensions(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    test_latency(n: number): Promise<number>;
    test_up(b: VSBuffer): Promise<number>;
    test_down(size: number): Promise<VSBuffer>;
}