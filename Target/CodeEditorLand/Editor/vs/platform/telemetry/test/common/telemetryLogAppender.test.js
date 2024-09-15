var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Event } from "../../../../base/common/event.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { IEnvironmentService } from "../../../environment/common/environment.js";
import { TestInstantiationService } from "../../../instantiation/test/common/instantiationServiceMock.js";
import { AbstractLogger, DEFAULT_LOG_LEVEL, ILogger, ILoggerService, LogLevel, NullLogService } from "../../../log/common/log.js";
import { IProductService } from "../../../product/common/productService.js";
import { TelemetryLogAppender } from "../../common/telemetryLogAppender.js";
class TestTelemetryLogger extends AbstractLogger {
  static {
    __name(this, "TestTelemetryLogger");
  }
  logs = [];
  constructor(logLevel = DEFAULT_LOG_LEVEL) {
    super();
    this.setLevel(logLevel);
  }
  trace(message, ...args) {
    if (this.checkLogLevel(LogLevel.Trace)) {
      this.logs.push(message + JSON.stringify(args));
    }
  }
  debug(message, ...args) {
    if (this.checkLogLevel(LogLevel.Debug)) {
      this.logs.push(message);
    }
  }
  info(message, ...args) {
    if (this.checkLogLevel(LogLevel.Info)) {
      this.logs.push(message);
    }
  }
  warn(message, ...args) {
    if (this.checkLogLevel(LogLevel.Warning)) {
      this.logs.push(message.toString());
    }
  }
  error(message, ...args) {
    if (this.checkLogLevel(LogLevel.Error)) {
      this.logs.push(message);
    }
  }
  flush() {
  }
}
class TestTelemetryLoggerService {
  constructor(logLevel) {
    this.logLevel = logLevel;
  }
  static {
    __name(this, "TestTelemetryLoggerService");
  }
  _serviceBrand;
  logger;
  getLogger() {
    return this.logger;
  }
  createLogger() {
    if (!this.logger) {
      this.logger = new TestTelemetryLogger(this.logLevel);
    }
    return this.logger;
  }
  onDidChangeVisibility = Event.None;
  onDidChangeLogLevel = Event.None;
  onDidChangeLoggers = Event.None;
  setLogLevel() {
  }
  getLogLevel() {
    return LogLevel.Info;
  }
  setVisibility() {
  }
  getDefaultLogLevel() {
    return this.logLevel;
  }
  registerLogger() {
  }
  deregisterLogger() {
  }
  getRegisteredLoggers() {
    return [];
  }
  getRegisteredLogger() {
    return void 0;
  }
}
suite("TelemetryLogAdapter", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Do not Log Telemetry if log level is not trace", async () => {
    const testLoggerService = new TestTelemetryLoggerService(DEFAULT_LOG_LEVEL);
    const testInstantiationService = new TestInstantiationService();
    const testObject = new TelemetryLogAppender(new NullLogService(), testLoggerService, testInstantiationService.stub(IEnvironmentService, {}), testInstantiationService.stub(IProductService, {}));
    testObject.log("testEvent", { hello: "world", isTrue: true, numberBetween1And3: 2 });
    assert.strictEqual(testLoggerService.createLogger().logs.length, 2);
    testObject.dispose();
    testInstantiationService.dispose();
  });
  test("Log Telemetry if log level is trace", async () => {
    const testLoggerService = new TestTelemetryLoggerService(LogLevel.Trace);
    const testInstantiationService = new TestInstantiationService();
    const testObject = new TelemetryLogAppender(new NullLogService(), testLoggerService, testInstantiationService.stub(IEnvironmentService, {}), testInstantiationService.stub(IProductService, {}));
    testObject.log("testEvent", { hello: "world", isTrue: true, numberBetween1And3: 2 });
    assert.strictEqual(testLoggerService.createLogger().logs[2], "telemetry/testEvent" + JSON.stringify([{
      properties: {
        hello: "world"
      },
      measurements: {
        isTrue: 1,
        numberBetween1And3: 2
      }
    }]));
    testObject.dispose();
    testInstantiationService.dispose();
  });
});
export {
  TestTelemetryLoggerService
};
//# sourceMappingURL=telemetryLogAppender.test.js.map
