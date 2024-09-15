var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../nls.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { hash } from "../../../base/common/hash.js";
import { Disposable, IDisposable } from "../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../base/common/map.js";
import { isWindows } from "../../../base/common/platform.js";
import { joinPath } from "../../../base/common/resources.js";
import { Mutable, isNumber, isString } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { ILocalizedString } from "../../action/common/action.js";
import { RawContextKey } from "../../contextkey/common/contextkey.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const ILogService = createDecorator("logService");
const ILoggerService = createDecorator("loggerService");
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(now, "now");
function isLogLevel(thing) {
  return isNumber(thing);
}
__name(isLogLevel, "isLogLevel");
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["Off"] = 0] = "Off";
  LogLevel2[LogLevel2["Trace"] = 1] = "Trace";
  LogLevel2[LogLevel2["Debug"] = 2] = "Debug";
  LogLevel2[LogLevel2["Info"] = 3] = "Info";
  LogLevel2[LogLevel2["Warning"] = 4] = "Warning";
  LogLevel2[LogLevel2["Error"] = 5] = "Error";
  return LogLevel2;
})(LogLevel || {});
const DEFAULT_LOG_LEVEL = 3 /* Info */;
function log(logger, level, message) {
  switch (level) {
    case 1 /* Trace */:
      logger.trace(message);
      break;
    case 2 /* Debug */:
      logger.debug(message);
      break;
    case 3 /* Info */:
      logger.info(message);
      break;
    case 4 /* Warning */:
      logger.warn(message);
      break;
    case 5 /* Error */:
      logger.error(message);
      break;
    case 0 /* Off */:
      break;
    default:
      throw new Error(`Invalid log level ${level}`);
  }
}
__name(log, "log");
function format(args, verbose = false) {
  let result = "";
  for (let i = 0; i < args.length; i++) {
    let a = args[i];
    if (a instanceof Error) {
      a = toErrorMessage(a, verbose);
    }
    if (typeof a === "object") {
      try {
        a = JSON.stringify(a);
      } catch (e) {
      }
    }
    result += (i > 0 ? " " : "") + a;
  }
  return result;
}
__name(format, "format");
class AbstractLogger extends Disposable {
  static {
    __name(this, "AbstractLogger");
  }
  level = DEFAULT_LOG_LEVEL;
  _onDidChangeLogLevel = this._register(new Emitter());
  onDidChangeLogLevel = this._onDidChangeLogLevel.event;
  setLevel(level) {
    if (this.level !== level) {
      this.level = level;
      this._onDidChangeLogLevel.fire(this.level);
    }
  }
  getLevel() {
    return this.level;
  }
  checkLogLevel(level) {
    return this.level !== 0 /* Off */ && this.level <= level;
  }
}
class AbstractMessageLogger extends AbstractLogger {
  constructor(logAlways) {
    super();
    this.logAlways = logAlways;
  }
  static {
    __name(this, "AbstractMessageLogger");
  }
  checkLogLevel(level) {
    return this.logAlways || super.checkLogLevel(level);
  }
  trace(message, ...args) {
    if (this.checkLogLevel(1 /* Trace */)) {
      this.log(1 /* Trace */, format([message, ...args], true));
    }
  }
  debug(message, ...args) {
    if (this.checkLogLevel(2 /* Debug */)) {
      this.log(2 /* Debug */, format([message, ...args]));
    }
  }
  info(message, ...args) {
    if (this.checkLogLevel(3 /* Info */)) {
      this.log(3 /* Info */, format([message, ...args]));
    }
  }
  warn(message, ...args) {
    if (this.checkLogLevel(4 /* Warning */)) {
      this.log(4 /* Warning */, format([message, ...args]));
    }
  }
  error(message, ...args) {
    if (this.checkLogLevel(5 /* Error */)) {
      if (message instanceof Error) {
        const array = Array.prototype.slice.call(arguments);
        array[0] = message.stack;
        this.log(5 /* Error */, format(array));
      } else {
        this.log(5 /* Error */, format([message, ...args]));
      }
    }
  }
  flush() {
  }
}
class ConsoleMainLogger extends AbstractLogger {
  static {
    __name(this, "ConsoleMainLogger");
  }
  useColors;
  constructor(logLevel = DEFAULT_LOG_LEVEL) {
    super();
    this.setLevel(logLevel);
    this.useColors = !isWindows;
  }
  trace(message, ...args) {
    if (this.checkLogLevel(1 /* Trace */)) {
      if (this.useColors) {
        console.log(`\x1B[90m[main ${now()}]\x1B[0m`, message, ...args);
      } else {
        console.log(`[main ${now()}]`, message, ...args);
      }
    }
  }
  debug(message, ...args) {
    if (this.checkLogLevel(2 /* Debug */)) {
      if (this.useColors) {
        console.log(`\x1B[90m[main ${now()}]\x1B[0m`, message, ...args);
      } else {
        console.log(`[main ${now()}]`, message, ...args);
      }
    }
  }
  info(message, ...args) {
    if (this.checkLogLevel(3 /* Info */)) {
      if (this.useColors) {
        console.log(`\x1B[90m[main ${now()}]\x1B[0m`, message, ...args);
      } else {
        console.log(`[main ${now()}]`, message, ...args);
      }
    }
  }
  warn(message, ...args) {
    if (this.checkLogLevel(4 /* Warning */)) {
      if (this.useColors) {
        console.warn(`\x1B[93m[main ${now()}]\x1B[0m`, message, ...args);
      } else {
        console.warn(`[main ${now()}]`, message, ...args);
      }
    }
  }
  error(message, ...args) {
    if (this.checkLogLevel(5 /* Error */)) {
      if (this.useColors) {
        console.error(`\x1B[91m[main ${now()}]\x1B[0m`, message, ...args);
      } else {
        console.error(`[main ${now()}]`, message, ...args);
      }
    }
  }
  flush() {
  }
}
class ConsoleLogger extends AbstractLogger {
  constructor(logLevel = DEFAULT_LOG_LEVEL, useColors = true) {
    super();
    this.useColors = useColors;
    this.setLevel(logLevel);
  }
  static {
    __name(this, "ConsoleLogger");
  }
  trace(message, ...args) {
    if (this.checkLogLevel(1 /* Trace */)) {
      if (this.useColors) {
        console.log("%cTRACE", "color: #888", message, ...args);
      } else {
        console.log(message, ...args);
      }
    }
  }
  debug(message, ...args) {
    if (this.checkLogLevel(2 /* Debug */)) {
      if (this.useColors) {
        console.log("%cDEBUG", "background: #eee; color: #888", message, ...args);
      } else {
        console.log(message, ...args);
      }
    }
  }
  info(message, ...args) {
    if (this.checkLogLevel(3 /* Info */)) {
      if (this.useColors) {
        console.log("%c INFO", "color: #33f", message, ...args);
      } else {
        console.log(message, ...args);
      }
    }
  }
  warn(message, ...args) {
    if (this.checkLogLevel(4 /* Warning */)) {
      if (this.useColors) {
        console.log("%c WARN", "color: #993", message, ...args);
      } else {
        console.log(message, ...args);
      }
    }
  }
  error(message, ...args) {
    if (this.checkLogLevel(5 /* Error */)) {
      if (this.useColors) {
        console.log("%c  ERR", "color: #f33", message, ...args);
      } else {
        console.error(message, ...args);
      }
    }
  }
  flush() {
  }
}
class AdapterLogger extends AbstractLogger {
  constructor(adapter, logLevel = DEFAULT_LOG_LEVEL) {
    super();
    this.adapter = adapter;
    this.setLevel(logLevel);
  }
  static {
    __name(this, "AdapterLogger");
  }
  trace(message, ...args) {
    if (this.checkLogLevel(1 /* Trace */)) {
      this.adapter.log(1 /* Trace */, [this.extractMessage(message), ...args]);
    }
  }
  debug(message, ...args) {
    if (this.checkLogLevel(2 /* Debug */)) {
      this.adapter.log(2 /* Debug */, [this.extractMessage(message), ...args]);
    }
  }
  info(message, ...args) {
    if (this.checkLogLevel(3 /* Info */)) {
      this.adapter.log(3 /* Info */, [this.extractMessage(message), ...args]);
    }
  }
  warn(message, ...args) {
    if (this.checkLogLevel(4 /* Warning */)) {
      this.adapter.log(4 /* Warning */, [this.extractMessage(message), ...args]);
    }
  }
  error(message, ...args) {
    if (this.checkLogLevel(5 /* Error */)) {
      this.adapter.log(5 /* Error */, [this.extractMessage(message), ...args]);
    }
  }
  extractMessage(msg) {
    if (typeof msg === "string") {
      return msg;
    }
    return toErrorMessage(msg, this.checkLogLevel(1 /* Trace */));
  }
  flush() {
  }
}
class MultiplexLogger extends AbstractLogger {
  constructor(loggers) {
    super();
    this.loggers = loggers;
    if (loggers.length) {
      this.setLevel(loggers[0].getLevel());
    }
  }
  static {
    __name(this, "MultiplexLogger");
  }
  setLevel(level) {
    for (const logger of this.loggers) {
      logger.setLevel(level);
    }
    super.setLevel(level);
  }
  trace(message, ...args) {
    for (const logger of this.loggers) {
      logger.trace(message, ...args);
    }
  }
  debug(message, ...args) {
    for (const logger of this.loggers) {
      logger.debug(message, ...args);
    }
  }
  info(message, ...args) {
    for (const logger of this.loggers) {
      logger.info(message, ...args);
    }
  }
  warn(message, ...args) {
    for (const logger of this.loggers) {
      logger.warn(message, ...args);
    }
  }
  error(message, ...args) {
    for (const logger of this.loggers) {
      logger.error(message, ...args);
    }
  }
  flush() {
    for (const logger of this.loggers) {
      logger.flush();
    }
  }
  dispose() {
    for (const logger of this.loggers) {
      logger.dispose();
    }
    super.dispose();
  }
}
class AbstractLoggerService extends Disposable {
  constructor(logLevel, logsHome, loggerResources) {
    super();
    this.logLevel = logLevel;
    this.logsHome = logsHome;
    if (loggerResources) {
      for (const loggerResource of loggerResources) {
        this._loggers.set(loggerResource.resource, { logger: void 0, info: loggerResource });
      }
    }
  }
  static {
    __name(this, "AbstractLoggerService");
  }
  _loggers = new ResourceMap();
  _onDidChangeLoggers = this._register(new Emitter());
  onDidChangeLoggers = this._onDidChangeLoggers.event;
  _onDidChangeLogLevel = this._register(new Emitter());
  onDidChangeLogLevel = this._onDidChangeLogLevel.event;
  _onDidChangeVisibility = this._register(new Emitter());
  onDidChangeVisibility = this._onDidChangeVisibility.event;
  getLoggerEntry(resourceOrId) {
    if (isString(resourceOrId)) {
      return [...this._loggers.values()].find((logger) => logger.info.id === resourceOrId);
    }
    return this._loggers.get(resourceOrId);
  }
  getLogger(resourceOrId) {
    return this.getLoggerEntry(resourceOrId)?.logger;
  }
  createLogger(idOrResource, options) {
    const resource = this.toResource(idOrResource);
    const id = isString(idOrResource) ? idOrResource : options?.id ?? hash(resource.toString()).toString(16);
    let logger = this._loggers.get(resource)?.logger;
    const logLevel = options?.logLevel === "always" ? 1 /* Trace */ : options?.logLevel;
    if (!logger) {
      logger = this.doCreateLogger(resource, logLevel ?? this.getLogLevel(resource) ?? this.logLevel, { ...options, id });
    }
    const loggerEntry = {
      logger,
      info: { resource, id, logLevel, name: options?.name, hidden: options?.hidden, extensionId: options?.extensionId, when: options?.when }
    };
    this.registerLogger(loggerEntry.info);
    this._loggers.set(resource, loggerEntry);
    return logger;
  }
  toResource(idOrResource) {
    return isString(idOrResource) ? joinPath(this.logsHome, `${idOrResource}.log`) : idOrResource;
  }
  setLogLevel(arg1, arg2) {
    if (URI.isUri(arg1)) {
      const resource = arg1;
      const logLevel = arg2;
      const logger = this._loggers.get(resource);
      if (logger && logLevel !== logger.info.logLevel) {
        logger.info.logLevel = logLevel === this.logLevel ? void 0 : logLevel;
        logger.logger?.setLevel(logLevel);
        this._loggers.set(logger.info.resource, logger);
        this._onDidChangeLogLevel.fire([resource, logLevel]);
      }
    } else {
      this.logLevel = arg1;
      for (const [resource, logger] of this._loggers.entries()) {
        if (this._loggers.get(resource)?.info.logLevel === void 0) {
          logger.logger?.setLevel(this.logLevel);
        }
      }
      this._onDidChangeLogLevel.fire(this.logLevel);
    }
  }
  setVisibility(resourceOrId, visibility) {
    const logger = this.getLoggerEntry(resourceOrId);
    if (logger && visibility !== !logger.info.hidden) {
      logger.info.hidden = !visibility;
      this._loggers.set(logger.info.resource, logger);
      this._onDidChangeVisibility.fire([logger.info.resource, visibility]);
    }
  }
  getLogLevel(resource) {
    let logLevel;
    if (resource) {
      logLevel = this._loggers.get(resource)?.info.logLevel;
    }
    return logLevel ?? this.logLevel;
  }
  registerLogger(resource) {
    const existing = this._loggers.get(resource.resource);
    if (existing) {
      if (existing.info.hidden !== resource.hidden) {
        this.setVisibility(resource.resource, !resource.hidden);
      }
    } else {
      this._loggers.set(resource.resource, { info: resource, logger: void 0 });
      this._onDidChangeLoggers.fire({ added: [resource], removed: [] });
    }
  }
  deregisterLogger(resource) {
    const existing = this._loggers.get(resource);
    if (existing) {
      if (existing.logger) {
        existing.logger.dispose();
      }
      this._loggers.delete(resource);
      this._onDidChangeLoggers.fire({ added: [], removed: [existing.info] });
    }
  }
  *getRegisteredLoggers() {
    for (const entry of this._loggers.values()) {
      yield entry.info;
    }
  }
  getRegisteredLogger(resource) {
    return this._loggers.get(resource)?.info;
  }
  dispose() {
    this._loggers.forEach((logger) => logger.logger?.dispose());
    this._loggers.clear();
    super.dispose();
  }
}
class NullLogger {
  static {
    __name(this, "NullLogger");
  }
  onDidChangeLogLevel = new Emitter().event;
  setLevel(level) {
  }
  getLevel() {
    return 3 /* Info */;
  }
  trace(message, ...args) {
  }
  debug(message, ...args) {
  }
  info(message, ...args) {
  }
  warn(message, ...args) {
  }
  error(message, ...args) {
  }
  critical(message, ...args) {
  }
  dispose() {
  }
  flush() {
  }
}
class NullLogService extends NullLogger {
  static {
    __name(this, "NullLogService");
  }
}
function getLogLevel(environmentService) {
  if (environmentService.verbose) {
    return 1 /* Trace */;
  }
  if (typeof environmentService.logLevel === "string") {
    const logLevel = parseLogLevel(environmentService.logLevel.toLowerCase());
    if (logLevel !== void 0) {
      return logLevel;
    }
  }
  return DEFAULT_LOG_LEVEL;
}
__name(getLogLevel, "getLogLevel");
function LogLevelToString(logLevel) {
  switch (logLevel) {
    case 1 /* Trace */:
      return "trace";
    case 2 /* Debug */:
      return "debug";
    case 3 /* Info */:
      return "info";
    case 4 /* Warning */:
      return "warn";
    case 5 /* Error */:
      return "error";
    case 0 /* Off */:
      return "off";
  }
}
__name(LogLevelToString, "LogLevelToString");
function LogLevelToLocalizedString(logLevel) {
  switch (logLevel) {
    case 1 /* Trace */:
      return { original: "Trace", value: nls.localize("trace", "Trace") };
    case 2 /* Debug */:
      return { original: "Debug", value: nls.localize("debug", "Debug") };
    case 3 /* Info */:
      return { original: "Info", value: nls.localize("info", "Info") };
    case 4 /* Warning */:
      return { original: "Warning", value: nls.localize("warn", "Warning") };
    case 5 /* Error */:
      return { original: "Error", value: nls.localize("error", "Error") };
    case 0 /* Off */:
      return { original: "Off", value: nls.localize("off", "Off") };
  }
}
__name(LogLevelToLocalizedString, "LogLevelToLocalizedString");
function parseLogLevel(logLevel) {
  switch (logLevel) {
    case "trace":
      return 1 /* Trace */;
    case "debug":
      return 2 /* Debug */;
    case "info":
      return 3 /* Info */;
    case "warn":
      return 4 /* Warning */;
    case "error":
      return 5 /* Error */;
    case "critical":
      return 5 /* Error */;
    case "off":
      return 0 /* Off */;
  }
  return void 0;
}
__name(parseLogLevel, "parseLogLevel");
const CONTEXT_LOG_LEVEL = new RawContextKey("logLevel", LogLevelToString(3 /* Info */));
export {
  AbstractLogger,
  AbstractLoggerService,
  AbstractMessageLogger,
  AdapterLogger,
  CONTEXT_LOG_LEVEL,
  ConsoleLogger,
  ConsoleMainLogger,
  DEFAULT_LOG_LEVEL,
  ILogService,
  ILoggerService,
  LogLevel,
  LogLevelToLocalizedString,
  LogLevelToString,
  MultiplexLogger,
  NullLogService,
  NullLogger,
  getLogLevel,
  isLogLevel,
  log,
  parseLogLevel
};
//# sourceMappingURL=log.js.map
