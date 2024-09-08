import {
  DisposableStore,
  DisposableTracker,
  setDisposableTracker
} from "../../common/lifecycle.js";
import { join } from "../../common/path.js";
import { isWindows } from "../../common/platform.js";
import { URI } from "../../common/uri.js";
function toResource(path) {
  if (isWindows) {
    return URI.file(join("C:\\", btoa(this.test.fullTitle()), path));
  }
  return URI.file(join("/", btoa(this.test.fullTitle()), path));
}
function suiteRepeat(n, description, callback) {
  for (let i = 0; i < n; i++) {
    suite(`${description} (iteration ${i})`, callback);
  }
}
function testRepeat(n, description, callback) {
  for (let i = 0; i < n; i++) {
    test(`${description} (iteration ${i})`, callback);
  }
}
async function assertThrowsAsync(block, message = "Missing expected exception") {
  try {
    await block();
  } catch {
    return;
  }
  const err = message instanceof Error ? message : new Error(message);
  throw err;
}
function ensureNoDisposablesAreLeakedInTestSuite() {
  let tracker;
  let store;
  setup(() => {
    store = new DisposableStore();
    tracker = new DisposableTracker();
    setDisposableTracker(tracker);
  });
  teardown(function() {
    store.dispose();
    setDisposableTracker(null);
    if (this.currentTest?.state !== "failed") {
      const result = tracker.computeLeakingDisposables();
      if (result) {
        console.error(result.details);
        throw new Error(
          `There are ${result.leaks.length} undisposed disposables!${result.details}`
        );
      }
    }
  });
  const testContext = {
    add(o) {
      return store.add(o);
    }
  };
  return testContext;
}
function throwIfDisposablesAreLeaked(body, logToConsole = true) {
  const tracker = new DisposableTracker();
  setDisposableTracker(tracker);
  body();
  setDisposableTracker(null);
  computeLeakingDisposables(tracker, logToConsole);
}
async function throwIfDisposablesAreLeakedAsync(body) {
  const tracker = new DisposableTracker();
  setDisposableTracker(tracker);
  await body();
  setDisposableTracker(null);
  computeLeakingDisposables(tracker);
}
function computeLeakingDisposables(tracker, logToConsole = true) {
  const result = tracker.computeLeakingDisposables();
  if (result) {
    if (logToConsole) {
      console.error(result.details);
    }
    throw new Error(
      `There are ${result.leaks.length} undisposed disposables!${result.details}`
    );
  }
}
export {
  assertThrowsAsync,
  ensureNoDisposablesAreLeakedInTestSuite,
  suiteRepeat,
  testRepeat,
  throwIfDisposablesAreLeaked,
  throwIfDisposablesAreLeakedAsync,
  toResource
};
