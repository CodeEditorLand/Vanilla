import { IExtension } from "vs/platform/extensions/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { ExtensionInstallLocation, IExtensionManagementServer, IExtensionManagementServerService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare class ExtensionManagementServerService implements IExtensionManagementServerService {
    readonly _serviceBrand: undefined;
    readonly localExtensionManagementServer: IExtensionManagementServer | null;
    readonly remoteExtensionManagementServer: IExtensionManagementServer | null;
    readonly webExtensionManagementServer: IExtensionManagementServer | null;
    constructor(remoteAgentService: IRemoteAgentService, labelService: ILabelService, instantiationService: IInstantiationService);
    getExtensionManagementServer(extension: IExtension): IExtensionManagementServer;
    getExtensionInstallLocation(extension: IExtension): ExtensionInstallLocation | null;
}
