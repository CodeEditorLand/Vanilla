import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { ExtensionEnablementService } from "../../browser/extensionEnablementService.js";
import { type IExtensionManagementServer, IExtensionManagementServerService } from "../../common/extensionManagement.js";
export declare class TestExtensionEnablementService extends ExtensionEnablementService {
    constructor(instantiationService: TestInstantiationService);
    waitUntilInitialized(): Promise<void>;
    reset(): void;
}
export declare function anExtensionManagementServerService(localExtensionManagementServer: IExtensionManagementServer | null, remoteExtensionManagementServer: IExtensionManagementServer | null, webExtensionManagementServer: IExtensionManagementServer | null): IExtensionManagementServerService;
