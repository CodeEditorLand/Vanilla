import assert from "assert";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { isLinux, isWindows } from "../../../../base/common/platform.js";
import { isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  FileChangeFilter,
  FileChangeType,
  FileChangesEvent
} from "../../common/files.js";
import {
  coalesceEvents,
  isFiltered,
  parseWatcherPatterns,
  reviveFileChanges
} from "../../common/watcher.js";
class TestFileWatcher extends Disposable {
  _onDidFilesChange;
  constructor() {
    super();
    this._onDidFilesChange = this._register(
      new Emitter()
    );
  }
  get onDidFilesChange() {
    return this._onDidFilesChange.event;
  }
  report(changes) {
    this.onRawFileEvents(changes);
  }
  onRawFileEvents(events) {
    const coalescedEvents = coalesceEvents(events);
    if (coalescedEvents.length > 0) {
      this._onDidFilesChange.fire({
        raw: reviveFileChanges(coalescedEvents),
        event: this.toFileChangesEvent(coalescedEvents)
      });
    }
  }
  toFileChangesEvent(changes) {
    return new FileChangesEvent(reviveFileChanges(changes), !isLinux);
  }
}
var Path = /* @__PURE__ */ ((Path2) => {
  Path2[Path2["UNIX"] = 0] = "UNIX";
  Path2[Path2["WINDOWS"] = 1] = "WINDOWS";
  Path2[Path2["UNC"] = 2] = "UNC";
  return Path2;
})(Path || {});
suite("Watcher", () => {
  (isWindows ? test.skip : test)("parseWatcherPatterns - posix", () => {
    const path = "/users/data/src";
    let parsedPattern = parseWatcherPatterns(path, ["*.js"])[0];
    assert.strictEqual(parsedPattern("/users/data/src/foo.js"), true);
    assert.strictEqual(parsedPattern("/users/data/src/foo.ts"), false);
    assert.strictEqual(parsedPattern("/users/data/src/bar/foo.js"), false);
    parsedPattern = parseWatcherPatterns(path, ["/users/data/src/*.js"])[0];
    assert.strictEqual(parsedPattern("/users/data/src/foo.js"), true);
    assert.strictEqual(parsedPattern("/users/data/src/foo.ts"), false);
    assert.strictEqual(parsedPattern("/users/data/src/bar/foo.js"), false);
    parsedPattern = parseWatcherPatterns(path, [
      "/users/data/src/bar/*.js"
    ])[0];
    assert.strictEqual(parsedPattern("/users/data/src/foo.js"), false);
    assert.strictEqual(parsedPattern("/users/data/src/foo.ts"), false);
    assert.strictEqual(parsedPattern("/users/data/src/bar/foo.js"), true);
    parsedPattern = parseWatcherPatterns(path, ["**/*.js"])[0];
    assert.strictEqual(parsedPattern("/users/data/src/foo.js"), true);
    assert.strictEqual(parsedPattern("/users/data/src/foo.ts"), false);
    assert.strictEqual(parsedPattern("/users/data/src/bar/foo.js"), true);
  });
  (isWindows ? test : test.skip)("parseWatcherPatterns - windows", () => {
    const path = "c:\\users\\data\\src";
    let parsedPattern = parseWatcherPatterns(path, ["*.js"])[0];
    assert.strictEqual(parsedPattern("c:\\users\\data\\src\\foo.js"), true);
    assert.strictEqual(
      parsedPattern("c:\\users\\data\\src\\foo.ts"),
      false
    );
    assert.strictEqual(
      parsedPattern("c:\\users\\data\\src\\bar/foo.js"),
      false
    );
    parsedPattern = parseWatcherPatterns(path, [
      "c:\\users\\data\\src\\*.js"
    ])[0];
    assert.strictEqual(parsedPattern("c:\\users\\data\\src\\foo.js"), true);
    assert.strictEqual(
      parsedPattern("c:\\users\\data\\src\\foo.ts"),
      false
    );
    assert.strictEqual(
      parsedPattern("c:\\users\\data\\src\\bar\\foo.js"),
      false
    );
    parsedPattern = parseWatcherPatterns(path, [
      "c:\\users\\data\\src\\bar/*.js"
    ])[0];
    assert.strictEqual(
      parsedPattern("c:\\users\\data\\src\\foo.js"),
      false
    );
    assert.strictEqual(
      parsedPattern("c:\\users\\data\\src\\foo.ts"),
      false
    );
    assert.strictEqual(
      parsedPattern("c:\\users\\data\\src\\bar\\foo.js"),
      true
    );
    parsedPattern = parseWatcherPatterns(path, ["**/*.js"])[0];
    assert.strictEqual(parsedPattern("c:\\users\\data\\src\\foo.js"), true);
    assert.strictEqual(
      parsedPattern("c:\\users\\data\\src\\foo.ts"),
      false
    );
    assert.strictEqual(
      parsedPattern("c:\\users\\data\\src\\bar\\foo.js"),
      true
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
suite("Watcher Events Normalizer", () => {
  const disposables = new DisposableStore();
  teardown(() => {
    disposables.clear();
  });
  test("simple add/update/delete", (done) => {
    const watch = disposables.add(new TestFileWatcher());
    const added = URI.file("/users/data/src/added.txt");
    const updated = URI.file("/users/data/src/updated.txt");
    const deleted = URI.file("/users/data/src/deleted.txt");
    const raw = [
      { resource: added, type: FileChangeType.ADDED },
      { resource: updated, type: FileChangeType.UPDATED },
      { resource: deleted, type: FileChangeType.DELETED }
    ];
    disposables.add(
      watch.onDidFilesChange(({ event, raw: raw2 }) => {
        assert.ok(event);
        assert.strictEqual(raw2.length, 3);
        assert.ok(event.contains(added, FileChangeType.ADDED));
        assert.ok(event.contains(updated, FileChangeType.UPDATED));
        assert.ok(event.contains(deleted, FileChangeType.DELETED));
        done();
      })
    );
    watch.report(raw);
  });
  (isWindows ? [1 /* WINDOWS */, 2 /* UNC */] : [0 /* UNIX */]).forEach((path) => {
    test(`delete only reported for top level folder (${path})`, (done) => {
      const watch = disposables.add(new TestFileWatcher());
      const deletedFolderA = URI.file(
        path === 0 /* UNIX */ ? "/users/data/src/todelete1" : path === 1 /* WINDOWS */ ? "C:\\users\\data\\src\\todelete1" : "\\\\localhost\\users\\data\\src\\todelete1"
      );
      const deletedFolderB = URI.file(
        path === 0 /* UNIX */ ? "/users/data/src/todelete2" : path === 1 /* WINDOWS */ ? "C:\\users\\data\\src\\todelete2" : "\\\\localhost\\users\\data\\src\\todelete2"
      );
      const deletedFolderBF1 = URI.file(
        path === 0 /* UNIX */ ? "/users/data/src/todelete2/file.txt" : path === 1 /* WINDOWS */ ? "C:\\users\\data\\src\\todelete2\\file.txt" : "\\\\localhost\\users\\data\\src\\todelete2\\file.txt"
      );
      const deletedFolderBF2 = URI.file(
        path === 0 /* UNIX */ ? "/users/data/src/todelete2/more/test.txt" : path === 1 /* WINDOWS */ ? "C:\\users\\data\\src\\todelete2\\more\\test.txt" : "\\\\localhost\\users\\data\\src\\todelete2\\more\\test.txt"
      );
      const deletedFolderBF3 = URI.file(
        path === 0 /* UNIX */ ? "/users/data/src/todelete2/super/bar/foo.txt" : path === 1 /* WINDOWS */ ? "C:\\users\\data\\src\\todelete2\\super\\bar\\foo.txt" : "\\\\localhost\\users\\data\\src\\todelete2\\super\\bar\\foo.txt"
      );
      const deletedFileA = URI.file(
        path === 0 /* UNIX */ ? "/users/data/src/deleteme.txt" : path === 1 /* WINDOWS */ ? "C:\\users\\data\\src\\deleteme.txt" : "\\\\localhost\\users\\data\\src\\deleteme.txt"
      );
      const addedFile = URI.file(
        path === 0 /* UNIX */ ? "/users/data/src/added.txt" : path === 1 /* WINDOWS */ ? "C:\\users\\data\\src\\added.txt" : "\\\\localhost\\users\\data\\src\\added.txt"
      );
      const updatedFile = URI.file(
        path === 0 /* UNIX */ ? "/users/data/src/updated.txt" : path === 1 /* WINDOWS */ ? "C:\\users\\data\\src\\updated.txt" : "\\\\localhost\\users\\data\\src\\updated.txt"
      );
      const raw = [
        { resource: deletedFolderA, type: FileChangeType.DELETED },
        { resource: deletedFolderB, type: FileChangeType.DELETED },
        { resource: deletedFolderBF1, type: FileChangeType.DELETED },
        { resource: deletedFolderBF2, type: FileChangeType.DELETED },
        { resource: deletedFolderBF3, type: FileChangeType.DELETED },
        { resource: deletedFileA, type: FileChangeType.DELETED },
        { resource: addedFile, type: FileChangeType.ADDED },
        { resource: updatedFile, type: FileChangeType.UPDATED }
      ];
      disposables.add(
        watch.onDidFilesChange(({ event, raw: raw2 }) => {
          assert.ok(event);
          assert.strictEqual(raw2.length, 5);
          assert.ok(
            event.contains(deletedFolderA, FileChangeType.DELETED)
          );
          assert.ok(
            event.contains(deletedFolderB, FileChangeType.DELETED)
          );
          assert.ok(
            event.contains(deletedFileA, FileChangeType.DELETED)
          );
          assert.ok(event.contains(addedFile, FileChangeType.ADDED));
          assert.ok(
            event.contains(updatedFile, FileChangeType.UPDATED)
          );
          done();
        })
      );
      watch.report(raw);
    });
  });
  test("event coalescer: ignore CREATE followed by DELETE", (done) => {
    const watch = disposables.add(new TestFileWatcher());
    const created = URI.file("/users/data/src/related");
    const deleted = URI.file("/users/data/src/related");
    const unrelated = URI.file("/users/data/src/unrelated");
    const raw = [
      { resource: created, type: FileChangeType.ADDED },
      { resource: deleted, type: FileChangeType.DELETED },
      { resource: unrelated, type: FileChangeType.UPDATED }
    ];
    disposables.add(
      watch.onDidFilesChange(({ event, raw: raw2 }) => {
        assert.ok(event);
        assert.strictEqual(raw2.length, 1);
        assert.ok(event.contains(unrelated, FileChangeType.UPDATED));
        done();
      })
    );
    watch.report(raw);
  });
  test("event coalescer: flatten DELETE followed by CREATE into CHANGE", (done) => {
    const watch = disposables.add(new TestFileWatcher());
    const deleted = URI.file("/users/data/src/related");
    const created = URI.file("/users/data/src/related");
    const unrelated = URI.file("/users/data/src/unrelated");
    const raw = [
      { resource: deleted, type: FileChangeType.DELETED },
      { resource: created, type: FileChangeType.ADDED },
      { resource: unrelated, type: FileChangeType.UPDATED }
    ];
    disposables.add(
      watch.onDidFilesChange(({ event, raw: raw2 }) => {
        assert.ok(event);
        assert.strictEqual(raw2.length, 2);
        assert.ok(event.contains(deleted, FileChangeType.UPDATED));
        assert.ok(event.contains(unrelated, FileChangeType.UPDATED));
        done();
      })
    );
    watch.report(raw);
  });
  test("event coalescer: ignore UPDATE when CREATE received", (done) => {
    const watch = disposables.add(new TestFileWatcher());
    const created = URI.file("/users/data/src/related");
    const updated = URI.file("/users/data/src/related");
    const unrelated = URI.file("/users/data/src/unrelated");
    const raw = [
      { resource: created, type: FileChangeType.ADDED },
      { resource: updated, type: FileChangeType.UPDATED },
      { resource: unrelated, type: FileChangeType.UPDATED }
    ];
    disposables.add(
      watch.onDidFilesChange(({ event, raw: raw2 }) => {
        assert.ok(event);
        assert.strictEqual(raw2.length, 2);
        assert.ok(event.contains(created, FileChangeType.ADDED));
        assert.ok(!event.contains(created, FileChangeType.UPDATED));
        assert.ok(event.contains(unrelated, FileChangeType.UPDATED));
        done();
      })
    );
    watch.report(raw);
  });
  test("event coalescer: apply DELETE", (done) => {
    const watch = disposables.add(new TestFileWatcher());
    const updated = URI.file("/users/data/src/related");
    const updated2 = URI.file("/users/data/src/related");
    const deleted = URI.file("/users/data/src/related");
    const unrelated = URI.file("/users/data/src/unrelated");
    const raw = [
      { resource: updated, type: FileChangeType.UPDATED },
      { resource: updated2, type: FileChangeType.UPDATED },
      { resource: unrelated, type: FileChangeType.UPDATED },
      { resource: updated, type: FileChangeType.DELETED }
    ];
    disposables.add(
      watch.onDidFilesChange(({ event, raw: raw2 }) => {
        assert.ok(event);
        assert.strictEqual(raw2.length, 2);
        assert.ok(event.contains(deleted, FileChangeType.DELETED));
        assert.ok(!event.contains(updated, FileChangeType.UPDATED));
        assert.ok(event.contains(unrelated, FileChangeType.UPDATED));
        done();
      })
    );
    watch.report(raw);
  });
  test("event coalescer: track case renames", (done) => {
    const watch = disposables.add(new TestFileWatcher());
    const oldPath = URI.file("/users/data/src/added");
    const newPath = URI.file("/users/data/src/ADDED");
    const raw = [
      { resource: newPath, type: FileChangeType.ADDED },
      { resource: oldPath, type: FileChangeType.DELETED }
    ];
    disposables.add(
      watch.onDidFilesChange(({ event, raw: raw2 }) => {
        assert.ok(event);
        assert.strictEqual(raw2.length, 2);
        for (const r of raw2) {
          if (isEqual(r.resource, oldPath)) {
            assert.strictEqual(r.type, FileChangeType.DELETED);
          } else if (isEqual(r.resource, newPath)) {
            assert.strictEqual(r.type, FileChangeType.ADDED);
          } else {
            assert.fail();
          }
        }
        done();
      })
    );
    watch.report(raw);
  });
  test("event type filter", () => {
    const resource = URI.file("/users/data/src/related");
    assert.strictEqual(
      isFiltered({ resource, type: FileChangeType.ADDED }, void 0),
      false
    );
    assert.strictEqual(
      isFiltered({ resource, type: FileChangeType.UPDATED }, void 0),
      false
    );
    assert.strictEqual(
      isFiltered({ resource, type: FileChangeType.DELETED }, void 0),
      false
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.ADDED },
        FileChangeFilter.UPDATED
      ),
      true
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.ADDED },
        FileChangeFilter.UPDATED | FileChangeFilter.DELETED
      ),
      true
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.ADDED },
        FileChangeFilter.ADDED
      ),
      false
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.ADDED },
        FileChangeFilter.ADDED | FileChangeFilter.UPDATED
      ),
      false
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.ADDED },
        FileChangeFilter.ADDED | FileChangeFilter.UPDATED | FileChangeFilter.DELETED
      ),
      false
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.DELETED },
        FileChangeFilter.UPDATED
      ),
      true
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.DELETED },
        FileChangeFilter.UPDATED | FileChangeFilter.ADDED
      ),
      true
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.DELETED },
        FileChangeFilter.DELETED
      ),
      false
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.DELETED },
        FileChangeFilter.DELETED | FileChangeFilter.UPDATED
      ),
      false
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.DELETED },
        FileChangeFilter.ADDED | FileChangeFilter.DELETED | FileChangeFilter.UPDATED
      ),
      false
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.UPDATED },
        FileChangeFilter.ADDED
      ),
      true
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.UPDATED },
        FileChangeFilter.DELETED | FileChangeFilter.ADDED
      ),
      true
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.UPDATED },
        FileChangeFilter.UPDATED
      ),
      false
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.UPDATED },
        FileChangeFilter.DELETED | FileChangeFilter.UPDATED
      ),
      false
    );
    assert.strictEqual(
      isFiltered(
        { resource, type: FileChangeType.UPDATED },
        FileChangeFilter.ADDED | FileChangeFilter.DELETED | FileChangeFilter.UPDATED
      ),
      false
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
