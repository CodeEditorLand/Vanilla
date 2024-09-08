import { Disposable } from "../../../base/common/lifecycle.js";
import type { URI } from "../../../base/common/uri.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import type { TargetPlatform } from "../../extensions/common/extensions.js";
import { IFileService } from "../../files/common/files.js";
import { ILogService } from "../../log/common/log.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { type ExtensionVerificationStatus } from "../common/abstractExtensionManagementService.js";
import { IExtensionGalleryService, type IGalleryExtension, type InstallOperation } from "../common/extensionManagement.js";
import { IExtensionSignatureVerificationService } from "./extensionSignatureVerificationService.js";
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
