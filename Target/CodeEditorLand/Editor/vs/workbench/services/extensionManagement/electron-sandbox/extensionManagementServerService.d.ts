import { Disposable } from "vs/base/common/lifecycle";
import { IExtension } from "vs/platform/extensions/common/extensions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ISharedProcessService } from "vs/platform/ipc/electron-sandbox/services";
import { ILabelService } from "vs/platform/label/common/label";
import { ExtensionInstallLocation, IExtensionManagementServer, IExtensionManagementServerService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare class ExtensionManagementServerService extends Disposable implements IExtensionManagementServerService {
    readonly _serviceBrand: undefined;
    readonly localExtensionManagementServer: IExtensionManagementServer;
    readonly remoteExtensionManagementServer: IExtensionManagementServer | null;
    readonly webExtensionManagementServer: IExtensionManagementServer | null;
    constructor(sharedProcessService: ISharedProcessService, remoteAgentService: IRemoteAgentService, labelService: ILabelService, instantiationService: IInstantiationService);
    getExtensionManagementServer(extension: IExtension): IExtensionManagementServer;
    getExtensionInstallLocation(extension: IExtension): ExtensionInstallLocation | null;
}
