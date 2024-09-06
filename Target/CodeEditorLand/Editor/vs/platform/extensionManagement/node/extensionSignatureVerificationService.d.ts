import { IGalleryExtension } from "vs/platform/extensionManagement/common/extensionManagement";
import { TargetPlatform } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare const IExtensionSignatureVerificationService: any;
/**
 * A service for verifying signed extensions.
 */
export interface IExtensionSignatureVerificationService {
    readonly _serviceBrand: undefined;
    /**
     * Verifies an extension file (.vsix) against a signature archive file.
     * @param { string } extensionId The extension identifier.
     * @param { string } vsixFilePath The extension file path.
     * @param { string } signatureArchiveFilePath The signature archive file path.
     * @returns { Promise<boolean> } A promise with `true` if the extension is validly signed and trusted;
     * otherwise, `false` because verification is not enabled (e.g.:  in the OSS version of VS Code).
     * @throws { ExtensionSignatureVerificationError } An error with a code indicating the validity, integrity, or trust issue
     * found during verification or a more fundamental issue (e.g.:  a required dependency was not found).
     */
    verify(extension: IGalleryExtension, vsixFilePath: string, signatureArchiveFilePath: string, clientTargetPlatform?: TargetPlatform): Promise<boolean>;
}
export declare enum ExtensionSignatureVerificationCode {
    "Success" = "Success",
    "RequiredArgumentMissing" = "RequiredArgumentMissing",
    "InvalidArgument" = "InvalidArgument",
    "PackageIsUnreadable" = "PackageIsUnreadable",
    "UnhandledException" = "UnhandledException",
    "SignatureManifestIsMissing" = "SignatureManifestIsMissing",
    "SignatureManifestIsUnreadable" = "SignatureManifestIsUnreadable",
    "SignatureIsMissing" = "SignatureIsMissing",
    "SignatureIsUnreadable" = "SignatureIsUnreadable",
    "CertificateIsUnreadable" = "CertificateIsUnreadable",
    "SignatureArchiveIsUnreadable" = "SignatureArchiveIsUnreadable",
    "FileAlreadyExists" = "FileAlreadyExists",
    "SignatureArchiveIsInvalidZip" = "SignatureArchiveIsInvalidZip",
    "SignatureArchiveHasSameSignatureFile" = "SignatureArchiveHasSameSignatureFile",
    "PackageIntegrityCheckFailed" = "PackageIntegrityCheckFailed",
    "SignatureIsInvalid" = "SignatureIsInvalid",
    "SignatureManifestIsInvalid" = "SignatureManifestIsInvalid",
    "SignatureIntegrityCheckFailed" = "SignatureIntegrityCheckFailed",
    "EntryIsMissing" = "EntryIsMissing",
    "EntryIsTampered" = "EntryIsTampered",
    "Untrusted" = "Untrusted",
    "CertificateRevoked" = "CertificateRevoked",
    "SignatureIsNotValid" = "SignatureIsNotValid",
    "UnknownError" = "UnknownError",
    "PackageIsInvalidZip" = "PackageIsInvalidZip",
    "SignatureArchiveHasTooManyEntries" = "SignatureArchiveHasTooManyEntries"
}
/**
 * Extension signature verification result
 */
export interface ExtensionSignatureVerificationResult {
    readonly code: ExtensionSignatureVerificationCode;
    readonly didExecute: boolean;
    readonly internalCode?: number;
    readonly output?: string;
}
export declare class ExtensionSignatureVerificationError extends Error {
    readonly code: ExtensionSignatureVerificationCode;
    constructor(code: ExtensionSignatureVerificationCode);
}
export declare class ExtensionSignatureVerificationService implements IExtensionSignatureVerificationService {
    private readonly logService;
    private readonly telemetryService;
    readonly _serviceBrand: undefined;
    private moduleLoadingPromise;
    constructor(logService: ILogService, telemetryService: ITelemetryService);
    private vsceSign;
    private resolveVsceSign;
    verify(extension: IGalleryExtension, vsixFilePath: string, signatureArchiveFilePath: string, clientTargetPlatform?: TargetPlatform): Promise<boolean>;
}
