import { IExtension } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { ExtensionInstallLocation, IExtensionManagementServer, IExtensionManagementServerService } from "./extensionManagement.js";
export declare class ExtensionManagementServerService implements IExtensionManagementServerService {
    readonly _serviceBrand: undefined;
    readonly localExtensionManagementServer: IExtensionManagementServer | null;
    readonly remoteExtensionManagementServer: IExtensionManagementServer | null;
    readonly webExtensionManagementServer: IExtensionManagementServer | null;
    constructor(remoteAgentService: IRemoteAgentService, labelService: ILabelService, instantiationService: IInstantiationService);
    getExtensionManagementServer(extension: IExtension): IExtensionManagementServer;
    getExtensionInstallLocation(extension: IExtension): ExtensionInstallLocation | null;
}
