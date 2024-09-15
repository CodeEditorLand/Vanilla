var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { ILogService } from "../../log/common/log.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { AbstractExtensionsProfileScannerService } from "../common/extensionsProfileScannerService.js";
import { IFileService } from "../../files/common/files.js";
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { URI } from "../../../base/common/uri.js";
let ExtensionsProfileScannerService = class extends AbstractExtensionsProfileScannerService {
  static {
    __name(this, "ExtensionsProfileScannerService");
  }
  constructor(environmentService, fileService, userDataProfilesService, uriIdentityService, telemetryService, logService) {
    super(URI.file(environmentService.extensionsPath), fileService, userDataProfilesService, uriIdentityService, telemetryService, logService);
  }
};
ExtensionsProfileScannerService = __decorateClass([
  __decorateParam(0, INativeEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUserDataProfilesService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, ILogService)
], ExtensionsProfileScannerService);
export {
  ExtensionsProfileScannerService
};
//# sourceMappingURL=extensionsProfileScannerService.js.map
