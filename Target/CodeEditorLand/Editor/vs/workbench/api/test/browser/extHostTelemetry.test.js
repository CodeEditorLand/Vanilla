import assert from "assert";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  ExtensionIdentifier,
  TargetPlatform
} from "../../../../platform/extensions/common/extensions.js";
import {
  DEFAULT_LOG_LEVEL,
  LogLevel
} from "../../../../platform/log/common/log.js";
import { TelemetryLevel } from "../../../../platform/telemetry/common/telemetry.js";
import { TestTelemetryLoggerService } from "../../../../platform/telemetry/test/common/telemetryLogAppender.test.js";
import { mock } from "../../../test/common/workbenchTestServices.js";
import {
  ExtHostTelemetry,
  ExtHostTelemetryLogger
} from "../../common/extHostTelemetry.js";
suite("ExtHostTelemetry", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  const mockEnvironment = {
    isExtensionDevelopmentDebug: false,
    extensionDevelopmentLocationURI: void 0,
    extensionTestsLocationURI: void 0,
    appRoot: void 0,
    appName: "test",
    extensionTelemetryLogResource: URI.parse("fake"),
    isExtensionTelemetryLoggingOnly: false,
    appHost: "test",
    appLanguage: "en",
    globalStorageHome: URI.parse("fake"),
    workspaceStorageHome: URI.parse("fake"),
    appUriScheme: "test"
  };
  const mockTelemetryInfo = {
    firstSessionDate: "2020-01-01T00:00:00.000Z",
    sessionId: "test",
    machineId: "test",
    sqmId: "test",
    devDeviceId: "test"
  };
  const mockRemote = {
    authority: "test",
    isRemote: false,
    connectionData: null
  };
  const mockExtensionIdentifier = {
    identifier: new ExtensionIdentifier("test-extension"),
    targetPlatform: TargetPlatform.UNIVERSAL,
    isBuiltin: true,
    isUserBuiltin: true,
    isUnderDevelopment: true,
    name: "test-extension",
    publisher: "vscode",
    version: "1.0.0",
    engines: { vscode: "*" },
    extensionLocation: URI.parse("fake"),
    enabledApiProposals: void 0
  };
  const createExtHostTelemetry = () => {
    const extensionTelemetry = new ExtHostTelemetry(
      new class extends mock() {
        environment = mockEnvironment;
        telemetryInfo = mockTelemetryInfo;
        remote = mockRemote;
      }(),
      new TestTelemetryLoggerService(DEFAULT_LOG_LEVEL)
    );
    store.add(extensionTelemetry);
    extensionTelemetry.$initializeTelemetryLevel(
      TelemetryLevel.USAGE,
      true,
      { usage: true, error: true }
    );
    return extensionTelemetry;
  };
  const createLogger = (functionSpy, extHostTelemetry, options) => {
    const extensionTelemetry = extHostTelemetry ?? createExtHostTelemetry();
    const appender = {
      sendEventData: (eventName, data) => {
        functionSpy.dataArr.push({ eventName, data });
      },
      sendErrorData: (exception, data) => {
        functionSpy.exceptionArr.push({ exception, data });
      },
      flush: () => {
        functionSpy.flushCalled = true;
      }
    };
    if (extHostTelemetry) {
      store.add(extHostTelemetry);
    }
    const logger = extensionTelemetry.instantiateLogger(
      mockExtensionIdentifier,
      appender,
      options
    );
    store.add(logger);
    return logger;
  };
  test("Validate sender instances", () => {
    assert.throws(() => ExtHostTelemetryLogger.validateSender(null));
    assert.throws(() => ExtHostTelemetryLogger.validateSender(1));
    assert.throws(() => ExtHostTelemetryLogger.validateSender({}));
    assert.throws(() => {
      ExtHostTelemetryLogger.validateSender({
        sendErrorData: () => {
        },
        sendEventData: true
      });
    });
    assert.throws(() => {
      ExtHostTelemetryLogger.validateSender({
        sendErrorData: 123,
        sendEventData: () => {
        }
      });
    });
    assert.throws(() => {
      ExtHostTelemetryLogger.validateSender({
        sendErrorData: () => {
        },
        sendEventData: () => {
        },
        flush: true
      });
    });
  });
  test("Ensure logger gets proper telemetry level during initialization", () => {
    const extensionTelemetry = createExtHostTelemetry();
    let config = extensionTelemetry.getTelemetryDetails();
    assert.strictEqual(config.isCrashEnabled, true);
    assert.strictEqual(config.isUsageEnabled, true);
    assert.strictEqual(config.isErrorsEnabled, true);
    extensionTelemetry.$initializeTelemetryLevel(
      TelemetryLevel.ERROR,
      true,
      { usage: true, error: true }
    );
    config = extensionTelemetry.getTelemetryDetails();
    assert.strictEqual(config.isCrashEnabled, true);
    assert.strictEqual(config.isUsageEnabled, false);
    assert.strictEqual(config.isErrorsEnabled, true);
    extensionTelemetry.$initializeTelemetryLevel(
      TelemetryLevel.CRASH,
      true,
      { usage: true, error: true }
    );
    config = extensionTelemetry.getTelemetryDetails();
    assert.strictEqual(config.isCrashEnabled, true);
    assert.strictEqual(config.isUsageEnabled, false);
    assert.strictEqual(config.isErrorsEnabled, false);
    extensionTelemetry.$initializeTelemetryLevel(
      TelemetryLevel.USAGE,
      true,
      { usage: false, error: true }
    );
    config = extensionTelemetry.getTelemetryDetails();
    assert.strictEqual(config.isCrashEnabled, true);
    assert.strictEqual(config.isUsageEnabled, false);
    assert.strictEqual(config.isErrorsEnabled, true);
    extensionTelemetry.dispose();
  });
  test("Simple log event to TelemetryLogger", () => {
    const functionSpy = {
      dataArr: [],
      exceptionArr: [],
      flushCalled: false
    };
    const logger = createLogger(functionSpy);
    logger.logUsage("test-event", { "test-data": "test-data" });
    assert.strictEqual(functionSpy.dataArr.length, 1);
    assert.strictEqual(
      functionSpy.dataArr[0].eventName,
      `${mockExtensionIdentifier.name}/test-event`
    );
    assert.strictEqual(
      functionSpy.dataArr[0].data["test-data"],
      "test-data"
    );
    logger.logUsage("test-event", { "test-data": "test-data" });
    assert.strictEqual(functionSpy.dataArr.length, 2);
    logger.logError("test-event", { "test-data": "test-data" });
    assert.strictEqual(functionSpy.dataArr.length, 3);
    logger.logError(new Error("test-error"), { "test-data": "test-data" });
    assert.strictEqual(functionSpy.dataArr.length, 3);
    assert.strictEqual(functionSpy.exceptionArr.length, 1);
    assert.strictEqual(functionSpy.flushCalled, false);
    logger.dispose();
    assert.strictEqual(functionSpy.flushCalled, true);
  });
  test("Simple log event to TelemetryLogger with options", () => {
    const functionSpy = {
      dataArr: [],
      exceptionArr: [],
      flushCalled: false
    };
    const logger = createLogger(functionSpy, void 0, {
      additionalCommonProperties: { "common.foo": "bar" }
    });
    logger.logUsage("test-event", { "test-data": "test-data" });
    assert.strictEqual(functionSpy.dataArr.length, 1);
    assert.strictEqual(
      functionSpy.dataArr[0].eventName,
      `${mockExtensionIdentifier.name}/test-event`
    );
    assert.strictEqual(
      functionSpy.dataArr[0].data["test-data"],
      "test-data"
    );
    assert.strictEqual(functionSpy.dataArr[0].data["common.foo"], "bar");
    logger.logUsage("test-event", { "test-data": "test-data" });
    assert.strictEqual(functionSpy.dataArr.length, 2);
    logger.logError("test-event", { "test-data": "test-data" });
    assert.strictEqual(functionSpy.dataArr.length, 3);
    logger.logError(new Error("test-error"), { "test-data": "test-data" });
    assert.strictEqual(functionSpy.dataArr.length, 3);
    assert.strictEqual(functionSpy.exceptionArr.length, 1);
    assert.strictEqual(functionSpy.flushCalled, false);
    logger.dispose();
    assert.strictEqual(functionSpy.flushCalled, true);
  });
  test("Log error should get common properties #193205", () => {
    const functionSpy = {
      dataArr: [],
      exceptionArr: [],
      flushCalled: false
    };
    const logger = createLogger(functionSpy, void 0, {
      additionalCommonProperties: { "common.foo": "bar" }
    });
    logger.logError(new Error("Test error"));
    assert.strictEqual(functionSpy.exceptionArr.length, 1);
    assert.strictEqual(
      functionSpy.exceptionArr[0].data["common.foo"],
      "bar"
    );
    assert.strictEqual(
      functionSpy.exceptionArr[0].data["common.product"],
      "test"
    );
    logger.logError("test-error-event");
    assert.strictEqual(functionSpy.dataArr.length, 1);
    assert.strictEqual(functionSpy.dataArr[0].data["common.foo"], "bar");
    assert.strictEqual(
      functionSpy.dataArr[0].data["common.product"],
      "test"
    );
    logger.logError("test-error-event", { "test-data": "test-data" });
    assert.strictEqual(functionSpy.dataArr.length, 2);
    assert.strictEqual(functionSpy.dataArr[1].data["common.foo"], "bar");
    assert.strictEqual(
      functionSpy.dataArr[1].data["common.product"],
      "test"
    );
    logger.logError("test-error-event", {
      properties: { "test-data": "test-data" }
    });
    assert.strictEqual(functionSpy.dataArr.length, 3);
    assert.strictEqual(
      functionSpy.dataArr[2].data.properties["common.foo"],
      "bar"
    );
    assert.strictEqual(
      functionSpy.dataArr[2].data.properties["common.product"],
      "test"
    );
    logger.dispose();
    assert.strictEqual(functionSpy.flushCalled, true);
  });
  test("Ensure logger properly cleans PII", () => {
    const functionSpy = {
      dataArr: [],
      exceptionArr: [],
      flushCalled: false
    };
    const logger = createLogger(functionSpy);
    logger.logUsage("test-event", {
      "fake-password": "pwd=123",
      "fake-email": "no-reply@example.com",
      "fake-token": "token=123",
      "fake-slack-token": "xoxp-123",
      "fake-path": "/Users/username/.vscode/extensions"
    });
    assert.strictEqual(functionSpy.dataArr.length, 1);
    assert.strictEqual(
      functionSpy.dataArr[0].eventName,
      `${mockExtensionIdentifier.name}/test-event`
    );
    assert.strictEqual(
      functionSpy.dataArr[0].data["fake-password"],
      "<REDACTED: Generic Secret>"
    );
    assert.strictEqual(
      functionSpy.dataArr[0].data["fake-email"],
      "<REDACTED: Email>"
    );
    assert.strictEqual(
      functionSpy.dataArr[0].data["fake-token"],
      "<REDACTED: Generic Secret>"
    );
    assert.strictEqual(
      functionSpy.dataArr[0].data["fake-slack-token"],
      "<REDACTED: Slack Token>"
    );
    assert.strictEqual(
      functionSpy.dataArr[0].data["fake-path"],
      "<REDACTED: user-file-path>"
    );
  });
  test("Ensure output channel is logged to", () => {
    const loggerService = new TestTelemetryLoggerService(LogLevel.Trace);
    const extensionTelemetry = new ExtHostTelemetry(
      new class extends mock() {
        environment = mockEnvironment;
        telemetryInfo = mockTelemetryInfo;
        remote = mockRemote;
      }(),
      loggerService
    );
    extensionTelemetry.$initializeTelemetryLevel(
      TelemetryLevel.USAGE,
      true,
      { usage: true, error: true }
    );
    const functionSpy = {
      dataArr: [],
      exceptionArr: [],
      flushCalled: false
    };
    const logger = createLogger(functionSpy, extensionTelemetry);
    assert.strictEqual(loggerService.createLogger().logs.length, 2);
    logger.logUsage("test-event", { "test-data": "test-data" });
    assert.strictEqual(loggerService.createLogger().logs.length, 3);
    assert.ok(
      loggerService.createLogger().logs[2].startsWith("test-extension/test-event")
    );
  });
});
