import { BugIndicatingError, onUnexpectedError } from "./errors.js";
function ok(value, message) {
  if (!value) {
    throw new Error(
      message ? `Assertion failed (${message})` : "Assertion Failed"
    );
  }
}
function assertNever(value, message = "Unreachable") {
  throw new Error(message);
}
function assert(condition, message = "unexpected state") {
  if (!condition) {
    throw new BugIndicatingError(`Assertion Failed: ${message}`);
  }
}
function softAssert(condition) {
  if (!condition) {
    onUnexpectedError(new BugIndicatingError("Soft Assertion Failed"));
  }
}
function assertFn(condition) {
  if (!condition()) {
    debugger;
    condition();
    onUnexpectedError(new BugIndicatingError("Assertion Failed"));
  }
}
function checkAdjacentItems(items, predicate) {
  let i = 0;
  while (i < items.length - 1) {
    const a = items[i];
    const b = items[i + 1];
    if (!predicate(a, b)) {
      return false;
    }
    i++;
  }
  return true;
}
export {
  assert,
  assertFn,
  assertNever,
  checkAdjacentItems,
  ok,
  softAssert
};
