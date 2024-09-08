import { type CancellationToken } from "../../../../base/common/cancellation.js";
import { URI, type UriComponents } from "../../../../base/common/uri.js";
import type { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { type ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import type { ILogService } from "../../../../platform/log/common/log.js";
export interface IExtensionActivationHost {
    readonly logService: ILogService;
    readonly folders: readonly UriComponents[];
    readonly forceUsingSearch: boolean;
    exists(uri: URI): Promise<boolean>;
    checkExists(folders: readonly UriComponents[], includes: string[], token: CancellationToken): Promise<boolean>;
}
export interface IExtensionActivationResult {
    activationEvent: string;
}
export declare function checkActivateWorkspaceContainsExtension(host: IExtensionActivationHost, desc: IExtensionDescription): Promise<IExtensionActivationResult | undefined>;
export declare function checkGlobFileExists(accessor: ServicesAccessor, folders: readonly UriComponents[], includes: string[], token: CancellationToken): Promise<boolean>;
