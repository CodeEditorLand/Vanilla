var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ExtHostFileSystemEventService } from "../../common/extHostFileSystemEventService.js";
import { IMainContext } from "../../common/extHost.protocol.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
suite("ExtHostFileSystemEventService", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("FileSystemWatcher ignore events properties are reversed #26851", function() {
    const protocol = {
      getProxy: /* @__PURE__ */ __name(() => {
        return void 0;
      }, "getProxy"),
      set: void 0,
      dispose: void 0,
      assertRegistered: void 0,
      drain: void 0
    };
    const watcher1 = new ExtHostFileSystemEventService(protocol, new NullLogService(), void 0).createFileSystemWatcher(void 0, void 0, "**/somethingInteresting", { correlate: false });
    assert.strictEqual(watcher1.ignoreChangeEvents, false);
    assert.strictEqual(watcher1.ignoreCreateEvents, false);
    assert.strictEqual(watcher1.ignoreDeleteEvents, false);
    watcher1.dispose();
    const watcher2 = new ExtHostFileSystemEventService(protocol, new NullLogService(), void 0).createFileSystemWatcher(void 0, void 0, "**/somethingBoring", { ignoreCreateEvents: true, ignoreChangeEvents: true, ignoreDeleteEvents: true, correlate: false });
    assert.strictEqual(watcher2.ignoreChangeEvents, true);
    assert.strictEqual(watcher2.ignoreCreateEvents, true);
    assert.strictEqual(watcher2.ignoreDeleteEvents, true);
    watcher2.dispose();
  });
});
//# sourceMappingURL=extHostFileSystemEventService.test.js.map
