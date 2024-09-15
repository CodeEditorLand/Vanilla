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
import { Disposable } from "../../../base/common/lifecycle.js";
import { localize } from "../../../nls.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import {
  ILogService,
  ILoggerService,
  LogLevel
} from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import {
  isLoggingOnly,
  supportsTelemetry,
  telemetryLogId,
  validateTelemetryData
} from "./telemetryUtils.js";
let TelemetryLogAppender = class extends Disposable {
  constructor(logService, loggerService, environmentService, productService, prefix = "") {
    super();
    this.prefix = prefix;
    const logger = loggerService.getLogger(telemetryLogId);
    if (logger) {
      this.logger = this._register(logger);
    } else {
      const justLoggingAndNotSending = isLoggingOnly(
        productService,
        environmentService
      );
      const logSuffix = justLoggingAndNotSending ? " (Not Sent)" : "";
      const isVisible = /* @__PURE__ */ __name(() => supportsTelemetry(productService, environmentService) && logService.getLevel() === LogLevel.Trace, "isVisible");
      this.logger = this._register(
        loggerService.createLogger(telemetryLogId, {
          name: localize("telemetryLog", "Telemetry{0}", logSuffix),
          hidden: !isVisible()
        })
      );
      this._register(
        logService.onDidChangeLogLevel(
          () => loggerService.setVisibility(telemetryLogId, isVisible())
        )
      );
      this.logger.info(
        "Below are logs for every telemetry event sent from VS Code once the log level is set to trace."
      );
      this.logger.info(
        "==========================================================="
      );
    }
  }
  static {
    __name(this, "TelemetryLogAppender");
  }
  logger;
  flush() {
    return Promise.resolve(void 0);
  }
  log(eventName, data) {
    this.logger.trace(
      `${this.prefix}telemetry/${eventName}`,
      validateTelemetryData(data)
    );
  }
};
TelemetryLogAppender = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ILoggerService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IProductService)
], TelemetryLogAppender);
export {
  TelemetryLogAppender
};
//# sourceMappingURL=telemetryLogAppender.js.map
