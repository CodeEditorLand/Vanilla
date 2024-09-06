import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { IExtensionManagementService } from "vs/platform/extensionManagement/common/extensionManagement";
import { AbstractNativeExtensionTipsService } from "vs/platform/extensionManagement/common/extensionTipsService";
import { IExtensionRecommendationNotificationService } from "vs/platform/extensionRecommendations/common/extensionRecommendations";
import { IFileService } from "vs/platform/files/common/files";
import { INativeHostService } from "vs/platform/native/common/native";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare class ExtensionTipsService extends AbstractNativeExtensionTipsService {
    constructor(environmentService: INativeEnvironmentService, telemetryService: ITelemetryService, extensionManagementService: IExtensionManagementService, storageService: IStorageService, nativeHostService: INativeHostService, extensionRecommendationNotificationService: IExtensionRecommendationNotificationService, fileService: IFileService, productService: IProductService);
}
