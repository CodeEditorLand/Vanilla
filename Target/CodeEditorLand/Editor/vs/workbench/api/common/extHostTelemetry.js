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
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { mixin } from "../../../base/common/objects.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import {
  ILoggerService,
  LogLevel,
  isLogLevel
} from "../../../platform/log/common/log.js";
import { getRemoteName } from "../../../platform/remote/common/remoteHosts.js";
import {
  TelemetryLevel
} from "../../../platform/telemetry/common/telemetry.js";
import {
  cleanData,
  cleanRemoteAuthority,
  extensionTelemetryLogChannelId
} from "../../../platform/telemetry/common/telemetryUtils.js";
import { UIKind } from "../../services/extensions/common/extensionHostProtocol.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
let ExtHostTelemetry = class extends Disposable {
  constructor(initData, loggerService) {
    super();
    this.initData = initData;
    this.loggerService = loggerService;
    this.extHostTelemetryLogFile = URI.revive(this.initData.environment.extensionTelemetryLogResource);
    this._inLoggingOnlyMode = this.initData.environment.isExtensionTelemetryLoggingOnly;
    this._outputLogger = loggerService.createLogger(this.extHostTelemetryLogFile, { id: extensionTelemetryLogChannelId, name: localize("extensionTelemetryLog", "Extension Telemetry{0}", this._inLoggingOnlyMode ? " (Not Sent)" : ""), hidden: true });
    this._register(this._outputLogger);
    this._register(loggerService.onDidChangeLogLevel((arg) => {
      if (isLogLevel(arg)) {
        this.updateLoggerVisibility();
      }
    }));
    this._outputLogger.info("Below are logs for extension telemetry events sent to the telemetry output channel API once the log level is set to trace.");
    this._outputLogger.info("===========================================================");
  }
  static {
    __name(this, "ExtHostTelemetry");
  }
  _serviceBrand;
  _onDidChangeTelemetryEnabled = this._register(
    new Emitter()
  );
  onDidChangeTelemetryEnabled = this._onDidChangeTelemetryEnabled.event;
  _onDidChangeTelemetryConfiguration = this._register(
    new Emitter()
  );
  onDidChangeTelemetryConfiguration = this._onDidChangeTelemetryConfiguration.event;
  _productConfig = {
    usage: true,
    error: true
  };
  _level = TelemetryLevel.NONE;
  // This holds whether or not we're running with --disable-telemetry, etc. Usings supportsTelemtry() from the main thread
  _telemetryIsSupported = false;
  _oldTelemetryEnablement;
  _inLoggingOnlyMode = false;
  extHostTelemetryLogFile;
  _outputLogger;
  _telemetryLoggers = /* @__PURE__ */ new Map();
  updateLoggerVisibility() {
    this.loggerService.setVisibility(
      this.extHostTelemetryLogFile,
      this._telemetryIsSupported && this.loggerService.getLogLevel() === LogLevel.Trace
    );
  }
  getTelemetryConfiguration() {
    return this._level === TelemetryLevel.USAGE;
  }
  getTelemetryDetails() {
    return {
      isCrashEnabled: this._level >= TelemetryLevel.CRASH,
      isErrorsEnabled: this._productConfig.error ? this._level >= TelemetryLevel.ERROR : false,
      isUsageEnabled: this._productConfig.usage ? this._level >= TelemetryLevel.USAGE : false
    };
  }
  instantiateLogger(extension, sender, options) {
    const telemetryDetails = this.getTelemetryDetails();
    const logger = new ExtHostTelemetryLogger(
      sender,
      options,
      extension,
      this._outputLogger,
      this._inLoggingOnlyMode,
      this.getBuiltInCommonProperties(extension),
      {
        isUsageEnabled: telemetryDetails.isUsageEnabled,
        isErrorsEnabled: telemetryDetails.isErrorsEnabled
      }
    );
    const loggers = this._telemetryLoggers.get(extension.identifier.value) ?? [];
    this._telemetryLoggers.set(extension.identifier.value, [
      ...loggers,
      logger
    ]);
    return logger.apiTelemetryLogger;
  }
  $initializeTelemetryLevel(level, supportsTelemetry, productConfig) {
    this._level = level;
    this._telemetryIsSupported = supportsTelemetry;
    this._productConfig = productConfig ?? { usage: true, error: true };
    this.updateLoggerVisibility();
  }
  getBuiltInCommonProperties(extension) {
    const commonProperties = /* @__PURE__ */ Object.create(null);
    commonProperties["common.extname"] = `${extension.publisher}.${extension.name}`;
    commonProperties["common.extversion"] = extension.version;
    commonProperties["common.vscodemachineid"] = this.initData.telemetryInfo.machineId;
    commonProperties["common.vscodesessionid"] = this.initData.telemetryInfo.sessionId;
    commonProperties["common.sqmid"] = this.initData.telemetryInfo.sqmId;
    commonProperties["common.devDeviceId"] = this.initData.telemetryInfo.devDeviceId;
    commonProperties["common.vscodeversion"] = this.initData.version;
    commonProperties["common.isnewappinstall"] = isNewAppInstall(
      this.initData.telemetryInfo.firstSessionDate
    );
    commonProperties["common.product"] = this.initData.environment.appHost;
    switch (this.initData.uiKind) {
      case UIKind.Web:
        commonProperties["common.uikind"] = "web";
        break;
      case UIKind.Desktop:
        commonProperties["common.uikind"] = "desktop";
        break;
      default:
        commonProperties["common.uikind"] = "unknown";
    }
    commonProperties["common.remotename"] = getRemoteName(
      cleanRemoteAuthority(this.initData.remote.authority)
    );
    return commonProperties;
  }
  $onDidChangeTelemetryLevel(level) {
    this._oldTelemetryEnablement = this.getTelemetryConfiguration();
    this._level = level;
    const telemetryDetails = this.getTelemetryDetails();
    this._telemetryLoggers.forEach((loggers, key) => {
      const newLoggers = loggers.filter((l) => !l.isDisposed);
      if (newLoggers.length === 0) {
        this._telemetryLoggers.delete(key);
      } else {
        this._telemetryLoggers.set(key, newLoggers);
      }
    });
    this._telemetryLoggers.forEach((loggers) => {
      for (const logger of loggers) {
        logger.updateTelemetryEnablements(
          telemetryDetails.isUsageEnabled,
          telemetryDetails.isErrorsEnabled
        );
      }
    });
    if (this._oldTelemetryEnablement !== this.getTelemetryConfiguration()) {
      this._onDidChangeTelemetryEnabled.fire(
        this.getTelemetryConfiguration()
      );
    }
    this._onDidChangeTelemetryConfiguration.fire(
      this.getTelemetryDetails()
    );
    this.updateLoggerVisibility();
  }
  onExtensionError(extension, error) {
    const loggers = this._telemetryLoggers.get(extension.value);
    const nonDisposedLoggers = loggers?.filter((l) => !l.isDisposed);
    if (!nonDisposedLoggers) {
      this._telemetryLoggers.delete(extension.value);
      return false;
    }
    let errorEmitted = false;
    for (const logger of nonDisposedLoggers) {
      if (logger.ignoreUnhandledExtHostErrors) {
        continue;
      }
      logger.logError(error);
      errorEmitted = true;
    }
    return errorEmitted;
  }
};
ExtHostTelemetry = __decorateClass([
  __decorateParam(0, IExtHostInitDataService),
  __decorateParam(1, ILoggerService)
], ExtHostTelemetry);
class ExtHostTelemetryLogger {
  constructor(sender, options, _extension, _logger, _inLoggingOnlyMode, _commonProperties, telemetryEnablements) {
    this._extension = _extension;
    this._logger = _logger;
    this._inLoggingOnlyMode = _inLoggingOnlyMode;
    this._commonProperties = _commonProperties;
    this.ignoreUnhandledExtHostErrors = options?.ignoreUnhandledErrors ?? false;
    this._ignoreBuiltinCommonProperties = options?.ignoreBuiltInCommonProperties ?? false;
    this._additionalCommonProperties = options?.additionalCommonProperties;
    this._sender = sender;
    this._telemetryEnablements = {
      isUsageEnabled: telemetryEnablements.isUsageEnabled,
      isErrorsEnabled: telemetryEnablements.isErrorsEnabled
    };
  }
  static {
    __name(this, "ExtHostTelemetryLogger");
  }
  static validateSender(sender) {
    if (typeof sender !== "object") {
      throw new TypeError("TelemetrySender argument is invalid");
    }
    if (typeof sender.sendEventData !== "function") {
      throw new TypeError(
        "TelemetrySender.sendEventData must be a function"
      );
    }
    if (typeof sender.sendErrorData !== "function") {
      throw new TypeError(
        "TelemetrySender.sendErrorData must be a function"
      );
    }
    if (typeof sender.flush !== "undefined" && typeof sender.flush !== "function") {
      throw new TypeError(
        "TelemetrySender.flush must be a function or undefined"
      );
    }
  }
  _onDidChangeEnableStates = new Emitter();
  _ignoreBuiltinCommonProperties;
  _additionalCommonProperties;
  ignoreUnhandledExtHostErrors;
  _telemetryEnablements;
  _apiObject;
  _sender;
  updateTelemetryEnablements(isUsageEnabled, isErrorsEnabled) {
    if (this._apiObject) {
      this._telemetryEnablements = { isUsageEnabled, isErrorsEnabled };
      this._onDidChangeEnableStates.fire(this._apiObject);
    }
  }
  mixInCommonPropsAndCleanData(data) {
    let updatedData = "properties" in data ? data.properties ?? {} : data;
    updatedData = cleanData(updatedData, []);
    if (this._additionalCommonProperties) {
      updatedData = mixin(updatedData, this._additionalCommonProperties);
    }
    if (!this._ignoreBuiltinCommonProperties) {
      updatedData = mixin(updatedData, this._commonProperties);
    }
    if ("properties" in data) {
      data.properties = updatedData;
    } else {
      data = updatedData;
    }
    return data;
  }
  logEvent(eventName, data) {
    if (!this._sender) {
      return;
    }
    if (this._extension.publisher === "vscode") {
      eventName = this._extension.name + "/" + eventName;
    } else {
      eventName = this._extension.identifier.value + "/" + eventName;
    }
    data = this.mixInCommonPropsAndCleanData(data || {});
    if (!this._inLoggingOnlyMode) {
      this._sender?.sendEventData(eventName, data);
    }
    this._logger.trace(eventName, data);
  }
  logUsage(eventName, data) {
    if (!this._telemetryEnablements.isUsageEnabled) {
      return;
    }
    this.logEvent(eventName, data);
  }
  logError(eventNameOrException, data) {
    if (!this._telemetryEnablements.isErrorsEnabled || !this._sender) {
      return;
    }
    if (typeof eventNameOrException === "string") {
      this.logEvent(eventNameOrException, data);
    } else {
      const errorData = {
        name: eventNameOrException.name,
        message: eventNameOrException.message,
        stack: eventNameOrException.stack,
        cause: eventNameOrException.cause
      };
      const cleanedErrorData = cleanData(errorData, []);
      const cleanedError = new Error(cleanedErrorData.message, {
        cause: cleanedErrorData.cause
      });
      cleanedError.stack = cleanedErrorData.stack;
      cleanedError.name = cleanedErrorData.name;
      data = this.mixInCommonPropsAndCleanData(data || {});
      if (!this._inLoggingOnlyMode) {
        this._sender.sendErrorData(cleanedError, data);
      }
      this._logger.trace("exception", data);
    }
  }
  get apiTelemetryLogger() {
    if (!this._apiObject) {
      const that = this;
      const obj = {
        logUsage: that.logUsage.bind(that),
        get isUsageEnabled() {
          return that._telemetryEnablements.isUsageEnabled;
        },
        get isErrorsEnabled() {
          return that._telemetryEnablements.isErrorsEnabled;
        },
        logError: that.logError.bind(that),
        dispose: that.dispose.bind(that),
        onDidChangeEnableStates: that._onDidChangeEnableStates.event.bind(that)
      };
      this._apiObject = Object.freeze(obj);
    }
    return this._apiObject;
  }
  get isDisposed() {
    return !this._sender;
  }
  dispose() {
    if (this._sender?.flush) {
      let tempSender = this._sender;
      this._sender = void 0;
      Promise.resolve(tempSender.flush()).then(tempSender = void 0);
      this._apiObject = void 0;
    } else {
      this._sender = void 0;
    }
  }
}
function isNewAppInstall(firstSessionDate) {
  const installAge = Date.now() - new Date(firstSessionDate).getTime();
  return isNaN(installAge) ? false : installAge < 1e3 * 60 * 60 * 24;
}
__name(isNewAppInstall, "isNewAppInstall");
const IExtHostTelemetry = createDecorator("IExtHostTelemetry");
export {
  ExtHostTelemetry,
  ExtHostTelemetryLogger,
  IExtHostTelemetry,
  isNewAppInstall
};
//# sourceMappingURL=extHostTelemetry.js.map
