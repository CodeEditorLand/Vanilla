import { URI } from "vs/base/common/uri";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { IExtensionGalleryService, IExtensionManagementService } from "vs/platform/extensionManagement/common/extensionManagement";
import { ILanguagePackItem, LanguagePackBaseService } from "vs/platform/languagePacks/common/languagePacks";
import { ILogService } from "vs/platform/log/common/log";
export declare class NativeLanguagePackService extends LanguagePackBaseService {
    private readonly extensionManagementService;
    private readonly logService;
    private readonly cache;
    constructor(extensionManagementService: IExtensionManagementService, environmentService: INativeEnvironmentService, extensionGalleryService: IExtensionGalleryService, logService: ILogService);
    getBuiltInExtensionTranslationsUri(id: string, language: string): Promise<URI | undefined>;
    getInstalledLanguages(): Promise<Array<ILanguagePackItem>>;
    private postInstallExtension;
    private postUninstallExtension;
    update(): Promise<boolean>;
}
