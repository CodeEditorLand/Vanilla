import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { ExtensionVerificationStatus } from "vs/platform/extensionManagement/common/abstractExtensionManagementService";
import { IExtensionGalleryService, IGalleryExtension, InstallOperation } from "vs/platform/extensionManagement/common/extensionManagement";
import { IExtensionSignatureVerificationService } from "vs/platform/extensionManagement/node/extensionSignatureVerificationService";
import { TargetPlatform } from "vs/platform/extensions/common/extensions";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare class ExtensionsDownloader extends Disposable {
    private readonly fileService;
    private readonly extensionGalleryService;
    private readonly configurationService;
    private readonly extensionSignatureVerificationService;
    private readonly telemetryService;
    private readonly logService;
    private static readonly SignatureArchiveExtension;
    readonly extensionsDownloadDir: URI;
    private readonly cache;
    private readonly cleanUpPromise;
    constructor(environmentService: INativeEnvironmentService, fileService: IFileService, extensionGalleryService: IExtensionGalleryService, configurationService: IConfigurationService, extensionSignatureVerificationService: IExtensionSignatureVerificationService, telemetryService: ITelemetryService, logService: ILogService);
    download(extension: IGalleryExtension, operation: InstallOperation, verifySignature: boolean, clientTargetPlatform?: TargetPlatform): Promise<{
        readonly location: URI;
        readonly verificationStatus: ExtensionVerificationStatus;
    }>;
    private shouldVerifySignature;
    private downloadVSIX;
    private downloadSignatureArchive;
    private downloadFile;
    private doDownload;
    protected validate(zipPath: string, filePath: string): Promise<void>;
    delete(location: URI): Promise<void>;
    private cleanUp;
    private getName;
}
