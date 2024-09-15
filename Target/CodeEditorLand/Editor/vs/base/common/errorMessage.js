var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../nls.js";
import * as arrays from "./arrays.js";
import * as types from "./types.js";
function exceptionToErrorMessage(exception, verbose) {
  if (verbose && (exception.stack || exception.stacktrace)) {
    return nls.localize(
      "stackTrace.format",
      "{0}: {1}",
      detectSystemErrorMessage(exception),
      stackToString(exception.stack) || stackToString(exception.stacktrace)
    );
  }
  return detectSystemErrorMessage(exception);
}
__name(exceptionToErrorMessage, "exceptionToErrorMessage");
function stackToString(stack) {
  if (Array.isArray(stack)) {
    return stack.join("\n");
  }
  return stack;
}
__name(stackToString, "stackToString");
function detectSystemErrorMessage(exception) {
  if (exception.code === "ERR_UNC_HOST_NOT_ALLOWED") {
    return `${exception.message}. Please update the 'security.allowedUNCHosts' setting if you want to allow this host.`;
  }
  if (typeof exception.code === "string" && typeof exception.errno === "number" && typeof exception.syscall === "string") {
    return nls.localize(
      "nodeExceptionMessage",
      "A system error occurred ({0})",
      exception.message
    );
  }
  return exception.message || nls.localize(
    "error.defaultMessage",
    "An unknown error occurred. Please consult the log for more details."
  );
}
__name(detectSystemErrorMessage, "detectSystemErrorMessage");
function toErrorMessage(error = null, verbose = false) {
  if (!error) {
    return nls.localize(
      "error.defaultMessage",
      "An unknown error occurred. Please consult the log for more details."
    );
  }
  if (Array.isArray(error)) {
    const errors = arrays.coalesce(error);
    const msg = toErrorMessage(errors[0], verbose);
    if (errors.length > 1) {
      return nls.localize(
        "error.moreErrors",
        "{0} ({1} errors in total)",
        msg,
        errors.length
      );
    }
    return msg;
  }
  if (types.isString(error)) {
    return error;
  }
  if (error.detail) {
    const detail = error.detail;
    if (detail.error) {
      return exceptionToErrorMessage(detail.error, verbose);
    }
    if (detail.exception) {
      return exceptionToErrorMessage(detail.exception, verbose);
    }
  }
  if (error.stack) {
    return exceptionToErrorMessage(error, verbose);
  }
  if (error.message) {
    return error.message;
  }
  return nls.localize(
    "error.defaultMessage",
    "An unknown error occurred. Please consult the log for more details."
  );
}
__name(toErrorMessage, "toErrorMessage");
function isErrorWithActions(obj) {
  const candidate = obj;
  return candidate instanceof Error && Array.isArray(candidate.actions);
}
__name(isErrorWithActions, "isErrorWithActions");
function createErrorWithActions(messageOrError, actions) {
  let error;
  if (typeof messageOrError === "string") {
    error = new Error(messageOrError);
  } else {
    error = messageOrError;
  }
  error.actions = actions;
  return error;
}
__name(createErrorWithActions, "createErrorWithActions");
export {
  createErrorWithActions,
  isErrorWithActions,
  toErrorMessage
};
//# sourceMappingURL=errorMessage.js.map
