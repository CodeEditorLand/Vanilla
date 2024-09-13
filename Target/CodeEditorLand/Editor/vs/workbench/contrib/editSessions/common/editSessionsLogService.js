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
import { joinPath } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import {
  AbstractLogger,
  ILoggerService
} from "../../../../platform/log/common/log.js";
import {
  editSessionsLogId
} from "./editSessions.js";
let EditSessionsLogService = class extends AbstractLogger {
  static {
    __name(this, "EditSessionsLogService");
  }
  logger;
  constructor(loggerService, environmentService) {
    super();
    this.logger = this._register(
      loggerService.createLogger(
        joinPath(
          environmentService.logsHome,
          `${editSessionsLogId}.log`
        ),
        {
          id: editSessionsLogId,
          name: localize("cloudChangesLog", "Cloud Changes")
        }
      )
    );
  }
  trace(message, ...args) {
    this.logger.trace(message, ...args);
  }
  debug(message, ...args) {
    this.logger.debug(message, ...args);
  }
  info(message, ...args) {
    this.logger.info(message, ...args);
  }
  warn(message, ...args) {
    this.logger.warn(message, ...args);
  }
  error(message, ...args) {
    this.logger.error(message, ...args);
  }
  flush() {
    this.logger.flush();
  }
};
EditSessionsLogService = __decorateClass([
  __decorateParam(0, ILoggerService),
  __decorateParam(1, IEnvironmentService)
], EditSessionsLogService);
export {
  EditSessionsLogService
};
//# sourceMappingURL=editSessionsLogService.js.map
