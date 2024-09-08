class ErrorHandler {
  unexpectedErrorHandler;
  listeners;
  constructor() {
    this.listeners = [];
    this.unexpectedErrorHandler = (e) => {
      setTimeout(() => {
        if (e.stack) {
          if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
            throw new ErrorNoTelemetry(
              e.message + "\n\n" + e.stack
            );
          }
          throw new Error(e.message + "\n\n" + e.stack);
        }
        throw e;
      }, 0);
    };
  }
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this._removeListener(listener);
    };
  }
  emit(e) {
    this.listeners.forEach((listener) => {
      listener(e);
    });
  }
  _removeListener(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }
  setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
    this.unexpectedErrorHandler = newUnexpectedErrorHandler;
  }
  getUnexpectedErrorHandler() {
    return this.unexpectedErrorHandler;
  }
  onUnexpectedError(e) {
    this.unexpectedErrorHandler(e);
    this.emit(e);
  }
  // For external errors, we don't want the listeners to be called
  onUnexpectedExternalError(e) {
    this.unexpectedErrorHandler(e);
  }
}
const errorHandler = new ErrorHandler();
function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
  errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
}
function isSigPipeError(e) {
  if (!e || typeof e !== "object") {
    return false;
  }
  const cast = e;
  return cast.code === "EPIPE" && cast.syscall?.toUpperCase() === "WRITE";
}
function onBugIndicatingError(e) {
  errorHandler.onUnexpectedError(e);
  return void 0;
}
function onUnexpectedError(e) {
  if (!isCancellationError(e)) {
    errorHandler.onUnexpectedError(e);
  }
  return void 0;
}
function onUnexpectedExternalError(e) {
  if (!isCancellationError(e)) {
    errorHandler.onUnexpectedExternalError(e);
  }
  return void 0;
}
function transformErrorForSerialization(error) {
  if (error instanceof Error) {
    const { name, message } = error;
    const stack = error.stacktrace || error.stack;
    return {
      $isError: true,
      name,
      message,
      stack,
      noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error)
    };
  }
  return error;
}
function transformErrorFromSerialization(data) {
  let error;
  if (data.noTelemetry) {
    error = new ErrorNoTelemetry();
  } else {
    error = new Error();
    error.name = data.name;
  }
  error.message = data.message;
  error.stack = data.stack;
  return error;
}
const canceledName = "Canceled";
function isCancellationError(error) {
  if (error instanceof CancellationError) {
    return true;
  }
  return error instanceof Error && error.name === canceledName && error.message === canceledName;
}
class CancellationError extends Error {
  constructor() {
    super(canceledName);
    this.name = this.message;
  }
}
function canceled() {
  const error = new Error(canceledName);
  error.name = error.message;
  return error;
}
function illegalArgument(name) {
  if (name) {
    return new Error(`Illegal argument: ${name}`);
  } else {
    return new Error("Illegal argument");
  }
}
function illegalState(name) {
  if (name) {
    return new Error(`Illegal state: ${name}`);
  } else {
    return new Error("Illegal state");
  }
}
class ReadonlyError extends TypeError {
  constructor(name) {
    super(
      name ? `${name} is read-only and cannot be changed` : "Cannot change read-only property"
    );
  }
}
function getErrorMessage(err) {
  if (!err) {
    return "Error";
  }
  if (err.message) {
    return err.message;
  }
  if (err.stack) {
    return err.stack.split("\n")[0];
  }
  return String(err);
}
class NotImplementedError extends Error {
  constructor(message) {
    super("NotImplemented");
    if (message) {
      this.message = message;
    }
  }
}
class NotSupportedError extends Error {
  constructor(message) {
    super("NotSupported");
    if (message) {
      this.message = message;
    }
  }
}
class ExpectedError extends Error {
  isExpected = true;
}
class ErrorNoTelemetry extends Error {
  name;
  constructor(msg) {
    super(msg);
    this.name = "CodeExpectedError";
  }
  static fromError(err) {
    if (err instanceof ErrorNoTelemetry) {
      return err;
    }
    const result = new ErrorNoTelemetry();
    result.message = err.message;
    result.stack = err.stack;
    return result;
  }
  static isErrorNoTelemetry(err) {
    return err.name === "CodeExpectedError";
  }
}
class BugIndicatingError extends Error {
  constructor(message) {
    super(message || "An unexpected bug occurred.");
    Object.setPrototypeOf(this, BugIndicatingError.prototype);
  }
}
export {
  BugIndicatingError,
  CancellationError,
  ErrorHandler,
  ErrorNoTelemetry,
  ExpectedError,
  NotImplementedError,
  NotSupportedError,
  ReadonlyError,
  canceled,
  errorHandler,
  getErrorMessage,
  illegalArgument,
  illegalState,
  isCancellationError,
  isSigPipeError,
  onBugIndicatingError,
  onUnexpectedError,
  onUnexpectedExternalError,
  setUnexpectedErrorHandler,
  transformErrorForSerialization,
  transformErrorFromSerialization
};
