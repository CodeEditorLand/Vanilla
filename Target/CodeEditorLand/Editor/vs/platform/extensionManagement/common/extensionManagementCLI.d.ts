import { URI } from "vs/base/common/uri";
import { IExtensionGalleryService, IExtensionManagementService, InstallOptions } from "vs/platform/extensionManagement/common/extensionManagement";
import { IExtensionManifest } from "vs/platform/extensions/common/extensions";
import { ILogger } from "vs/platform/log/common/log";
export declare class ExtensionManagementCLI {
    protected readonly logger: ILogger;
    private readonly extensionManagementService;
    private readonly extensionGalleryService;
    constructor(logger: ILogger, extensionManagementService: IExtensionManagementService, extensionGalleryService: IExtensionGalleryService);
    protected get location(): string | undefined;
    listExtensions(showVersions: boolean, category?: string, profileLocation?: URI): Promise<void>;
    installExtensions(extensions: (string | URI)[], builtinExtensions: (string | URI)[], installOptions: InstallOptions, force: boolean): Promise<void>;
    updateExtensions(profileLocation?: URI): Promise<void>;
    private installGalleryExtensions;
    private installVSIX;
    private getGalleryExtensions;
    protected validateExtensionKind(_manifest: IExtensionManifest): boolean;
    private validateVSIX;
    uninstallExtensions(extensions: (string | URI)[], force: boolean, profileLocation?: URI): Promise<void>;
    locateExtension(extensions: string[]): Promise<void>;
    private notInstalled;
}
