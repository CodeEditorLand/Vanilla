import { AbstractExtensionsProfileScannerService } from "../../../../platform/extensionManagement/common/extensionsProfileScannerService.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
export declare class ExtensionsProfileScannerService extends AbstractExtensionsProfileScannerService {
    constructor(environmentService: IWorkbenchEnvironmentService, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, uriIdentityService: IUriIdentityService, telemetryService: ITelemetryService, logService: ILogService);
}
