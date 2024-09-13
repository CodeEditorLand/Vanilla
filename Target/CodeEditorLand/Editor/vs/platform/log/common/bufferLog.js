var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AbstractMessageLogger, DEFAULT_LOG_LEVEL, ILogger, log, LogLevel } from "./log.js";
class BufferLogger extends AbstractMessageLogger {
  static {
    __name(this, "BufferLogger");
  }
  buffer = [];
  _logger = void 0;
  constructor(logLevel = DEFAULT_LOG_LEVEL) {
    super();
    this.setLevel(logLevel);
    this._register(this.onDidChangeLogLevel((level) => {
      this._logger?.setLevel(level);
    }));
  }
  set logger(logger) {
    this._logger = logger;
    for (const { level, message } of this.buffer) {
      log(logger, level, message);
    }
    this.buffer = [];
  }
  log(level, message) {
    if (this._logger) {
      log(this._logger, level, message);
    } else if (this.getLevel() <= level) {
      this.buffer.push({ level, message });
    }
  }
  dispose() {
    this._logger?.dispose();
    super.dispose();
  }
  flush() {
    this._logger?.flush();
  }
}
export {
  BufferLogger
};
//# sourceMappingURL=bufferLog.js.map
