import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { ILogService } from "../../log/common/log.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { AbstractExtensionsProfileScannerService } from "../common/extensionsProfileScannerService.js";
export declare class ExtensionsProfileScannerService extends AbstractExtensionsProfileScannerService {
    constructor(environmentService: INativeEnvironmentService, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, uriIdentityService: IUriIdentityService, telemetryService: ITelemetryService, logService: ILogService);
}
