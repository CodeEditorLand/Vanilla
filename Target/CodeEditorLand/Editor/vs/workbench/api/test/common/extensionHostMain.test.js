var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { SerializedError, errorHandler, onUnexpectedError } from "../../../../base/common/errors.js";
import { isFirefox, isSafari } from "../../../../base/common/platform.js";
import { TernarySearchTree } from "../../../../base/common/ternarySearchTree.js";
import { URI } from "../../../../base/common/uri.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { InstantiationService } from "../../../../platform/instantiation/common/instantiationService.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { ILogService, NullLogService } from "../../../../platform/log/common/log.js";
import { MainThreadExtensionServiceShape } from "../../common/extHost.protocol.js";
import { ExtensionPaths, IExtHostExtensionService } from "../../common/extHostExtensionService.js";
import { IExtHostRpcService } from "../../common/extHostRpcService.js";
import { IExtHostTelemetry } from "../../common/extHostTelemetry.js";
import { ErrorHandler } from "../../common/extensionHostMain.js";
import { nullExtensionDescription } from "../../../services/extensions/common/extensions.js";
import { ProxyIdentifier, Proxied } from "../../../services/extensions/common/proxyIdentifier.js";
suite("ExtensionHostMain#ErrorHandler - Wrapping prepareStackTrace can cause slowdown and eventual stack overflow #184926 ", function() {
  if (isFirefox || isSafari) {
    return;
  }
  const extensionsIndex = TernarySearchTree.forUris();
  const mainThreadExtensionsService = new class extends mock() {
    $onExtensionRuntimeError(extensionId, data) {
    }
  }();
  const collection = new ServiceCollection(
    [ILogService, new NullLogService()],
    [IExtHostTelemetry, new class extends mock() {
      onExtensionError(extension, error) {
        return true;
      }
    }()],
    [IExtHostExtensionService, new class extends mock() {
      getExtensionPathIndex() {
        return new class extends ExtensionPaths {
          findSubstr(key) {
            findSubstrCount++;
            return nullExtensionDescription;
          }
        }(extensionsIndex);
      }
    }()],
    [IExtHostRpcService, new class extends mock() {
      getProxy(identifier) {
        return mainThreadExtensionsService;
      }
    }()]
  );
  const originalPrepareStackTrace = Error.prepareStackTrace;
  const insta = new InstantiationService(collection, false);
  let existingErrorHandler;
  let findSubstrCount = 0;
  ensureNoDisposablesAreLeakedInTestSuite();
  suiteSetup(async function() {
    existingErrorHandler = errorHandler.getUnexpectedErrorHandler();
    await insta.invokeFunction(ErrorHandler.installFullHandler);
  });
  suiteTeardown(function() {
    errorHandler.setUnexpectedErrorHandler(existingErrorHandler);
  });
  setup(async function() {
    findSubstrCount = 0;
  });
  teardown(() => {
    Error.prepareStackTrace = originalPrepareStackTrace;
  });
  test("basics", function() {
    const err = new Error("test1");
    onUnexpectedError(err);
    assert.strictEqual(findSubstrCount, 1);
  });
  test("set/reset prepareStackTrace-callback", function() {
    const original = Error.prepareStackTrace;
    Error.prepareStackTrace = (_error, _stack) => "stack";
    const probeErr = new Error();
    const stack = probeErr.stack;
    assert.ok(stack);
    Error.prepareStackTrace = original;
    assert.strictEqual(findSubstrCount, 1);
    onUnexpectedError(probeErr);
    assert.strictEqual(findSubstrCount, 1);
    const err = new Error("test2");
    onUnexpectedError(err);
    assert.strictEqual(findSubstrCount, 2);
  });
  test("wrap prepareStackTrace-callback", function() {
    function do_something_else(params) {
      return params;
    }
    __name(do_something_else, "do_something_else");
    const original = Error.prepareStackTrace;
    Error.prepareStackTrace = (...args) => {
      return do_something_else(original?.(...args));
    };
    const probeErr = new Error();
    const stack = probeErr.stack;
    assert.ok(stack);
    onUnexpectedError(probeErr);
    assert.strictEqual(findSubstrCount, 1);
  });
  test("prevent rewrapping", function() {
    let do_something_count = 0;
    function do_something(params) {
      do_something_count++;
    }
    __name(do_something, "do_something");
    Error.prepareStackTrace = (result, stack2) => {
      do_something(stack2);
      return "fakestack";
    };
    for (let i = 0; i < 2500; ++i) {
      Error.prepareStackTrace = Error.prepareStackTrace;
    }
    const probeErr = new Error();
    const stack = probeErr.stack;
    assert.strictEqual(stack, "fakestack");
    onUnexpectedError(probeErr);
    assert.strictEqual(findSubstrCount, 1);
    const probeErr2 = new Error();
    onUnexpectedError(probeErr2);
    assert.strictEqual(findSubstrCount, 2);
    assert.strictEqual(do_something_count, 2);
  });
  suite("https://gist.github.com/thecrypticace/f0f2e182082072efdaf0f8e1537d2cce", function() {
    test("Restored, separate operations", () => {
      let original;
      original = Error.prepareStackTrace;
      for (let i = 0; i < 12500; ++i) {
        Error.prepareStackTrace = Error.prepareStackTrace;
      }
      const err1 = new Error();
      assert.ok(err1.stack);
      assert.strictEqual(findSubstrCount, 1);
      Error.prepareStackTrace = original;
      original = Error.prepareStackTrace;
      for (let i = 0; i < 12500; ++i) {
        Error.prepareStackTrace = Error.prepareStackTrace;
      }
      assert.ok(new Error().stack);
      assert.strictEqual(findSubstrCount, 2);
      Error.prepareStackTrace = original;
      original = Error.prepareStackTrace;
      for (let i = 0; i < 12500; ++i) {
        Error.prepareStackTrace = Error.prepareStackTrace;
      }
      assert.ok(new Error().stack);
      assert.strictEqual(findSubstrCount, 3);
      Error.prepareStackTrace = original;
      original = Error.prepareStackTrace;
      for (let i = 0; i < 12500; ++i) {
        Error.prepareStackTrace = Error.prepareStackTrace;
      }
      assert.ok(new Error().stack);
      assert.strictEqual(findSubstrCount, 4);
      Error.prepareStackTrace = original;
      assert.ok(err1.stack);
      assert.strictEqual(findSubstrCount, 4);
    });
    test("Never restored, separate operations", () => {
      for (let i = 0; i < 12500; ++i) {
        Error.prepareStackTrace = Error.prepareStackTrace;
      }
      assert.ok(new Error().stack);
      for (let i = 0; i < 12500; ++i) {
        Error.prepareStackTrace = Error.prepareStackTrace;
      }
      assert.ok(new Error().stack);
      for (let i = 0; i < 12500; ++i) {
        Error.prepareStackTrace = Error.prepareStackTrace;
      }
      assert.ok(new Error().stack);
      for (let i = 0; i < 12500; ++i) {
        Error.prepareStackTrace = Error.prepareStackTrace;
      }
      assert.ok(new Error().stack);
    });
    test("Restored, too many uses before restoration", async () => {
      const original = Error.prepareStackTrace;
      Error.prepareStackTrace = (_, stack) => stack;
      for (let i = 0; i < 1e4; ++i) {
        Error.prepareStackTrace = Error.prepareStackTrace;
      }
      assert.ok(new Error().stack);
      Error.prepareStackTrace = original;
    });
  });
});
//# sourceMappingURL=extensionHostMain.test.js.map
