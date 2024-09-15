var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { IRegisteredCodeWindow } from "../../../base/browser/dom.js";
import { CodeWindow, mainWindow } from "../../../base/browser/window.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { runWithFakedTimers } from "../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../base/test/common/utils.js";
import { BaseWindow } from "../../browser/window.js";
import { TestEnvironmentService, TestHostService } from "./workbenchTestServices.js";
suite("Window", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  class TestWindow extends BaseWindow {
    static {
      __name(this, "TestWindow");
    }
    constructor(window, dom) {
      super(window, dom, new TestHostService(), TestEnvironmentService);
    }
    enableWindowFocusOnElementFocus() {
    }
  }
  test("multi window aware setTimeout()", async function() {
    return runWithFakedTimers({ useFakeTimers: true }, async () => {
      const disposables = new DisposableStore();
      let windows = [];
      const dom = {
        getWindowsCount: /* @__PURE__ */ __name(() => windows.length, "getWindowsCount"),
        getWindows: /* @__PURE__ */ __name(() => windows, "getWindows")
      };
      const setTimeoutCalls = [];
      const clearTimeoutCalls = [];
      function createWindow(id, slow) {
        const res = {
          setTimeout: /* @__PURE__ */ __name(function(callback, delay, ...args) {
            setTimeoutCalls.push(id);
            return mainWindow.setTimeout(() => callback(id), slow ? delay * 2 : delay, ...args);
          }, "setTimeout"),
          clearTimeout: /* @__PURE__ */ __name(function(timeoutId) {
            clearTimeoutCalls.push(id);
            return mainWindow.clearTimeout(timeoutId);
          }, "clearTimeout")
        };
        disposables.add(new TestWindow(res, dom));
        return res;
      }
      __name(createWindow, "createWindow");
      const window1 = createWindow(1);
      windows = [{ window: window1, disposables }];
      let called = false;
      await new Promise((resolve, reject) => {
        window1.setTimeout(() => {
          if (!called) {
            called = true;
            resolve();
          } else {
            reject(new Error("timeout called twice"));
          }
        }, 1);
      });
      assert.strictEqual(called, true);
      assert.deepStrictEqual(setTimeoutCalls, [1]);
      assert.deepStrictEqual(clearTimeoutCalls, []);
      called = false;
      setTimeoutCalls.length = 0;
      clearTimeoutCalls.length = 0;
      await new Promise((resolve, reject) => {
        window1.setTimeout(() => {
          if (!called) {
            called = true;
            resolve();
          } else {
            reject(new Error("timeout called twice"));
          }
        }, 0);
      });
      assert.strictEqual(called, true);
      assert.deepStrictEqual(setTimeoutCalls, [1]);
      assert.deepStrictEqual(clearTimeoutCalls, []);
      called = false;
      setTimeoutCalls.length = 0;
      clearTimeoutCalls.length = 0;
      let window2 = createWindow(2);
      const window3 = createWindow(3);
      windows = [
        { window: window2, disposables },
        { window: window1, disposables },
        { window: window3, disposables }
      ];
      await new Promise((resolve, reject) => {
        window1.setTimeout(() => {
          if (!called) {
            called = true;
            resolve();
          } else {
            reject(new Error("timeout called twice"));
          }
        }, 1);
      });
      assert.strictEqual(called, true);
      assert.deepStrictEqual(setTimeoutCalls, [2, 1, 3]);
      assert.deepStrictEqual(clearTimeoutCalls, [2, 1, 3]);
      called = false;
      setTimeoutCalls.length = 0;
      clearTimeoutCalls.length = 0;
      window2 = createWindow(2, true);
      windows = [
        { window: window2, disposables },
        { window: window1, disposables }
      ];
      await new Promise((resolve, reject) => {
        window1.setTimeout((windowId) => {
          if (!called && windowId === 1) {
            called = true;
            resolve();
          } else if (called) {
            reject(new Error("timeout called twice"));
          } else {
            reject(new Error("timeout called for wrong window"));
          }
        }, 1);
      });
      assert.strictEqual(called, true);
      assert.deepStrictEqual(setTimeoutCalls, [2, 1]);
      assert.deepStrictEqual(clearTimeoutCalls, [2, 1]);
      called = false;
      setTimeoutCalls.length = 0;
      clearTimeoutCalls.length = 0;
      disposables.dispose();
    });
  });
});
//# sourceMappingURL=window.test.js.map
