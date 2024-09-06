import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { AbstractExtensionsProfileScannerService } from "vs/platform/extensionManagement/common/extensionsProfileScannerService";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
export declare class ExtensionsProfileScannerService extends AbstractExtensionsProfileScannerService {
    constructor(environmentService: INativeEnvironmentService, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, uriIdentityService: IUriIdentityService, telemetryService: ITelemetryService, logService: ILogService);
}
