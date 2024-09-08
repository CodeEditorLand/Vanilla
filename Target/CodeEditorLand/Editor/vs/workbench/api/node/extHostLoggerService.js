import { Schemas } from "../../../base/common/network.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { SpdLogLogger } from "../../../platform/log/node/spdlogLog.js";
import { ExtHostLoggerService as BaseExtHostLoggerService } from "../common/extHostLoggerService.js";
class ExtHostLoggerService extends BaseExtHostLoggerService {
  doCreateLogger(resource, logLevel, options) {
    if (resource.scheme === Schemas.file) {
      return new SpdLogLogger(
        options?.name || generateUuid(),
        resource.fsPath,
        !options?.donotRotate,
        !!options?.donotUseFormatters,
        logLevel
      );
    }
    return super.doCreateLogger(resource, logLevel, options);
  }
  registerLogger(resource) {
    super.registerLogger(resource);
    this._proxy.$registerLogger(resource);
  }
  deregisterLogger(resource) {
    super.deregisterLogger(resource);
    this._proxy.$deregisterLogger(resource);
  }
}
export {
  ExtHostLoggerService
};
