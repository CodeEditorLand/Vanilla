import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../test/common/utils.js";
import {
  ipcRenderer,
  process,
  webFrame,
  webUtils
} from "../../electron-sandbox/globals.js";
suite("Sandbox", () => {
  test("globals", async () => {
    assert.ok(typeof ipcRenderer.send === "function");
    assert.ok(typeof webFrame.setZoomLevel === "function");
    assert.ok(typeof process.platform === "string");
    assert.ok(typeof webUtils.getPathForFile === "function");
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
