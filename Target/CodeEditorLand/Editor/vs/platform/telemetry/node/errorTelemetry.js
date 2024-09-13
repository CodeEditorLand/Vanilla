var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  isCancellationError,
  isSigPipeError,
  onUnexpectedError,
  setUnexpectedErrorHandler
} from "../../../base/common/errors.js";
import BaseErrorTelemetry from "../common/errorTelemetry.js";
class ErrorTelemetry extends BaseErrorTelemetry {
  static {
    __name(this, "ErrorTelemetry");
  }
  installErrorListeners() {
    setUnexpectedErrorHandler((err) => console.error(err));
    const unhandledPromises = [];
    process.on(
      "unhandledRejection",
      (reason, promise) => {
        unhandledPromises.push(promise);
        setTimeout(() => {
          const idx = unhandledPromises.indexOf(promise);
          if (idx >= 0) {
            promise.catch((e) => {
              unhandledPromises.splice(idx, 1);
              if (!isCancellationError(e)) {
                console.warn(
                  `rejected promise not handled within 1 second: ${e}`
                );
                if (e.stack) {
                  console.warn(`stack trace: ${e.stack}`);
                }
                if (reason) {
                  onUnexpectedError(reason);
                }
              }
            });
          }
        }, 1e3);
      }
    );
    process.on("rejectionHandled", (promise) => {
      const idx = unhandledPromises.indexOf(promise);
      if (idx >= 0) {
        unhandledPromises.splice(idx, 1);
      }
    });
    process.on(
      "uncaughtException",
      (err) => {
        if (isSigPipeError(err)) {
          return;
        }
        onUnexpectedError(err);
      }
    );
  }
}
export {
  ErrorTelemetry as default
};
//# sourceMappingURL=errorTelemetry.js.map
