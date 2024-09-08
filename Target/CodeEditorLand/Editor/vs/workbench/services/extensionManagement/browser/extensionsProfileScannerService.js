var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import {
  AbstractExtensionsProfileScannerService,
  IExtensionsProfileScannerService
} from "../../../../platform/extensionManagement/common/extensionsProfileScannerService.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
let ExtensionsProfileScannerService = class extends AbstractExtensionsProfileScannerService {
  constructor(environmentService, fileService, userDataProfilesService, uriIdentityService, telemetryService, logService) {
    super(
      environmentService.userRoamingDataHome,
      fileService,
      userDataProfilesService,
      uriIdentityService,
      telemetryService,
      logService
    );
  }
};
ExtensionsProfileScannerService = __decorateClass([
  __decorateParam(0, IWorkbenchEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUserDataProfilesService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, ILogService)
], ExtensionsProfileScannerService);
registerSingleton(
  IExtensionsProfileScannerService,
  ExtensionsProfileScannerService,
  InstantiationType.Delayed
);
export {
  ExtensionsProfileScannerService
};
