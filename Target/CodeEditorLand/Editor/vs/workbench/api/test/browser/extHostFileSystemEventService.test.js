import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import { ExtHostFileSystemEventService } from "../../common/extHostFileSystemEventService.js";
suite("ExtHostFileSystemEventService", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("FileSystemWatcher ignore events properties are reversed #26851", () => {
    const protocol = {
      getProxy: () => {
        return void 0;
      },
      set: void 0,
      dispose: void 0,
      assertRegistered: void 0,
      drain: void 0
    };
    const watcher1 = new ExtHostFileSystemEventService(
      protocol,
      new NullLogService(),
      void 0
    ).createFileSystemWatcher(
      void 0,
      void 0,
      "**/somethingInteresting",
      { correlate: false }
    );
    assert.strictEqual(watcher1.ignoreChangeEvents, false);
    assert.strictEqual(watcher1.ignoreCreateEvents, false);
    assert.strictEqual(watcher1.ignoreDeleteEvents, false);
    watcher1.dispose();
    const watcher2 = new ExtHostFileSystemEventService(
      protocol,
      new NullLogService(),
      void 0
    ).createFileSystemWatcher(
      void 0,
      void 0,
      "**/somethingBoring",
      {
        ignoreCreateEvents: true,
        ignoreChangeEvents: true,
        ignoreDeleteEvents: true,
        correlate: false
      }
    );
    assert.strictEqual(watcher2.ignoreChangeEvents, true);
    assert.strictEqual(watcher2.ignoreCreateEvents, true);
    assert.strictEqual(watcher2.ignoreDeleteEvents, true);
    watcher2.dispose();
  });
});
