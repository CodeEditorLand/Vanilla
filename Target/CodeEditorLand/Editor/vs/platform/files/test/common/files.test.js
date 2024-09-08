import assert from "assert";
import { isEqual, isEqualOrParent } from "../../../../base/common/extpath.js";
import {
  isLinux,
  isMacintosh,
  isWindows
} from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import {
  ensureNoDisposablesAreLeakedInTestSuite,
  toResource
} from "../../../../base/test/common/utils.js";
import {
  FileChangeType,
  FileChangesEvent,
  isParent
} from "../../common/files.js";
suite("Files", () => {
  test("FileChangesEvent - basics", function() {
    const changes = [
      {
        resource: toResource.call(this, "/foo/updated.txt"),
        type: FileChangeType.UPDATED
      },
      {
        resource: toResource.call(this, "/foo/otherupdated.txt"),
        type: FileChangeType.UPDATED
      },
      {
        resource: toResource.call(this, "/added.txt"),
        type: FileChangeType.ADDED
      },
      {
        resource: toResource.call(this, "/bar/deleted.txt"),
        type: FileChangeType.DELETED
      },
      {
        resource: toResource.call(this, "/bar/folder"),
        type: FileChangeType.DELETED
      },
      {
        resource: toResource.call(this, "/BAR/FOLDER"),
        type: FileChangeType.DELETED
      }
    ];
    for (const ignorePathCasing of [false, true]) {
      const event = new FileChangesEvent(changes, ignorePathCasing);
      assert(
        !event.contains(
          toResource.call(this, "/foo"),
          FileChangeType.UPDATED
        )
      );
      assert(
        event.affects(
          toResource.call(this, "/foo"),
          FileChangeType.UPDATED
        )
      );
      assert(
        event.contains(
          toResource.call(this, "/foo/updated.txt"),
          FileChangeType.UPDATED
        )
      );
      assert(
        event.affects(
          toResource.call(this, "/foo/updated.txt"),
          FileChangeType.UPDATED
        )
      );
      assert(
        event.contains(
          toResource.call(this, "/foo/updated.txt"),
          FileChangeType.UPDATED,
          FileChangeType.ADDED
        )
      );
      assert(
        event.affects(
          toResource.call(this, "/foo/updated.txt"),
          FileChangeType.UPDATED,
          FileChangeType.ADDED
        )
      );
      assert(
        event.contains(
          toResource.call(this, "/foo/updated.txt"),
          FileChangeType.UPDATED,
          FileChangeType.ADDED,
          FileChangeType.DELETED
        )
      );
      assert(
        !event.contains(
          toResource.call(this, "/foo/updated.txt"),
          FileChangeType.ADDED,
          FileChangeType.DELETED
        )
      );
      assert(
        !event.contains(
          toResource.call(this, "/foo/updated.txt"),
          FileChangeType.ADDED
        )
      );
      assert(
        !event.contains(
          toResource.call(this, "/foo/updated.txt"),
          FileChangeType.DELETED
        )
      );
      assert(
        !event.affects(
          toResource.call(this, "/foo/updated.txt"),
          FileChangeType.DELETED
        )
      );
      assert(
        event.contains(
          toResource.call(this, "/bar/folder"),
          FileChangeType.DELETED
        )
      );
      assert(
        event.contains(
          toResource.call(this, "/BAR/FOLDER"),
          FileChangeType.DELETED
        )
      );
      assert(
        event.affects(
          toResource.call(this, "/BAR"),
          FileChangeType.DELETED
        )
      );
      if (ignorePathCasing) {
        assert(
          event.contains(
            toResource.call(this, "/BAR/folder"),
            FileChangeType.DELETED
          )
        );
        assert(
          event.affects(
            toResource.call(this, "/bar"),
            FileChangeType.DELETED
          )
        );
      } else {
        assert(
          !event.contains(
            toResource.call(this, "/BAR/folder"),
            FileChangeType.DELETED
          )
        );
        assert(
          event.affects(
            toResource.call(this, "/bar"),
            FileChangeType.DELETED
          )
        );
      }
      assert(
        event.contains(
          toResource.call(this, "/bar/folder/somefile"),
          FileChangeType.DELETED
        )
      );
      assert(
        event.contains(
          toResource.call(this, "/bar/folder/somefile/test.txt"),
          FileChangeType.DELETED
        )
      );
      assert(
        event.contains(
          toResource.call(this, "/BAR/FOLDER/somefile/test.txt"),
          FileChangeType.DELETED
        )
      );
      if (ignorePathCasing) {
        assert(
          event.contains(
            toResource.call(this, "/BAR/folder/somefile/test.txt"),
            FileChangeType.DELETED
          )
        );
      } else {
        assert(
          !event.contains(
            toResource.call(this, "/BAR/folder/somefile/test.txt"),
            FileChangeType.DELETED
          )
        );
      }
      assert(
        !event.contains(
          toResource.call(this, "/bar/folder2/somefile"),
          FileChangeType.DELETED
        )
      );
      assert.strictEqual(1, event.rawAdded.length);
      assert.strictEqual(2, event.rawUpdated.length);
      assert.strictEqual(3, event.rawDeleted.length);
      assert.strictEqual(true, event.gotAdded());
      assert.strictEqual(true, event.gotUpdated());
      assert.strictEqual(true, event.gotDeleted());
    }
  });
  test("FileChangesEvent - supports multiple changes on file tree", function() {
    for (const type of [
      FileChangeType.ADDED,
      FileChangeType.UPDATED,
      FileChangeType.DELETED
    ]) {
      const changes = [
        {
          resource: toResource.call(this, "/foo/bar/updated.txt"),
          type
        },
        {
          resource: toResource.call(
            this,
            "/foo/bar/otherupdated.txt"
          ),
          type
        },
        { resource: toResource.call(this, "/foo/bar"), type },
        { resource: toResource.call(this, "/foo"), type },
        { resource: toResource.call(this, "/bar"), type },
        { resource: toResource.call(this, "/bar/foo"), type },
        {
          resource: toResource.call(this, "/bar/foo/updated.txt"),
          type
        },
        {
          resource: toResource.call(
            this,
            "/bar/foo/otherupdated.txt"
          ),
          type
        }
      ];
      for (const ignorePathCasing of [false, true]) {
        const event = new FileChangesEvent(changes, ignorePathCasing);
        for (const change of changes) {
          assert(event.contains(change.resource, type));
          assert(event.affects(change.resource, type));
        }
        assert(event.affects(toResource.call(this, "/foo"), type));
        assert(event.affects(toResource.call(this, "/bar"), type));
        assert(event.affects(toResource.call(this, "/"), type));
        assert(!event.affects(toResource.call(this, "/foobar"), type));
        assert(
          !event.contains(
            toResource.call(this, "/some/foo/bar"),
            type
          )
        );
        assert(
          !event.affects(
            toResource.call(this, "/some/foo/bar"),
            type
          )
        );
        assert(
          !event.contains(toResource.call(this, "/some/bar"), type)
        );
        assert(
          !event.affects(toResource.call(this, "/some/bar"), type)
        );
        switch (type) {
          case FileChangeType.ADDED:
            assert.strictEqual(8, event.rawAdded.length);
            break;
          case FileChangeType.DELETED:
            assert.strictEqual(8, event.rawDeleted.length);
            break;
        }
      }
    }
  });
  test("FileChangesEvent - correlation", function() {
    let changes = [
      {
        resource: toResource.call(this, "/foo/updated.txt"),
        type: FileChangeType.UPDATED
      },
      {
        resource: toResource.call(this, "/foo/otherupdated.txt"),
        type: FileChangeType.UPDATED
      },
      {
        resource: toResource.call(this, "/added.txt"),
        type: FileChangeType.ADDED
      }
    ];
    let event = new FileChangesEvent(changes, true);
    assert.strictEqual(event.hasCorrelation(), false);
    assert.strictEqual(event.correlates(100), false);
    changes = [
      {
        resource: toResource.call(this, "/foo/updated.txt"),
        type: FileChangeType.UPDATED,
        cId: 100
      },
      {
        resource: toResource.call(this, "/foo/otherupdated.txt"),
        type: FileChangeType.UPDATED,
        cId: 100
      },
      {
        resource: toResource.call(this, "/added.txt"),
        type: FileChangeType.ADDED,
        cId: 100
      }
    ];
    event = new FileChangesEvent(changes, true);
    assert.strictEqual(event.hasCorrelation(), true);
    assert.strictEqual(event.correlates(100), true);
    assert.strictEqual(event.correlates(120), false);
    changes = [
      {
        resource: toResource.call(this, "/foo/updated.txt"),
        type: FileChangeType.UPDATED,
        cId: 100
      },
      {
        resource: toResource.call(this, "/foo/otherupdated.txt"),
        type: FileChangeType.UPDATED
      },
      {
        resource: toResource.call(this, "/added.txt"),
        type: FileChangeType.ADDED,
        cId: 100
      }
    ];
    event = new FileChangesEvent(changes, true);
    assert.strictEqual(event.hasCorrelation(), false);
    assert.strictEqual(event.correlates(100), false);
    assert.strictEqual(event.correlates(120), false);
    changes = [
      {
        resource: toResource.call(this, "/foo/updated.txt"),
        type: FileChangeType.UPDATED,
        cId: 100
      },
      {
        resource: toResource.call(this, "/foo/otherupdated.txt"),
        type: FileChangeType.UPDATED,
        cId: 120
      },
      {
        resource: toResource.call(this, "/added.txt"),
        type: FileChangeType.ADDED,
        cId: 100
      }
    ];
    event = new FileChangesEvent(changes, true);
    assert.strictEqual(event.hasCorrelation(), false);
    assert.strictEqual(event.correlates(100), false);
    assert.strictEqual(event.correlates(120), false);
  });
  function testIsEqual(testMethod) {
    assert(testMethod("", "", true));
    assert(!testMethod(null, "", true));
    assert(!testMethod(void 0, "", true));
    assert(testMethod("/", "/", true));
    assert(testMethod("/some", "/some", true));
    assert(testMethod("/some/path", "/some/path", true));
    assert(testMethod("c:\\", "c:\\", true));
    assert(testMethod("c:\\some", "c:\\some", true));
    assert(testMethod("c:\\some\\path", "c:\\some\\path", true));
    assert(testMethod("/some\xF6\xE4\xFC/path", "/some\xF6\xE4\xFC/path", true));
    assert(testMethod("c:\\some\xF6\xE4\xFC\\path", "c:\\some\xF6\xE4\xFC\\path", true));
    assert(!testMethod("/some/path", "/some/other/path", true));
    assert(!testMethod("c:\\some\\path", "c:\\some\\other\\path", true));
    assert(!testMethod("c:\\some\\path", "d:\\some\\path", true));
    assert(testMethod("/some/path", "/some/PATH", true));
    assert(testMethod("/some\xF6\xE4\xFC/path", "/some\xD6\xC4\xDC/PATH", true));
    assert(testMethod("c:\\some\\path", "c:\\some\\PATH", true));
    assert(testMethod("c:\\some\xF6\xE4\xFC\\path", "c:\\some\xD6\xC4\xDC\\PATH", true));
    assert(testMethod("c:\\some\\path", "C:\\some\\PATH", true));
  }
  test("isEqual (ignoreCase)", () => {
    testIsEqual(isEqual);
    assert(
      isEqual(
        URI.file("/some/path").fsPath,
        URI.file("/some/path").fsPath,
        true
      )
    );
    assert(
      isEqual(
        URI.file("c:\\some\\path").fsPath,
        URI.file("c:\\some\\path").fsPath,
        true
      )
    );
    assert(
      isEqual(
        URI.file("/some\xF6\xE4\xFC/path").fsPath,
        URI.file("/some\xF6\xE4\xFC/path").fsPath,
        true
      )
    );
    assert(
      isEqual(
        URI.file("c:\\some\xF6\xE4\xFC\\path").fsPath,
        URI.file("c:\\some\xF6\xE4\xFC\\path").fsPath,
        true
      )
    );
    assert(
      !isEqual(
        URI.file("/some/path").fsPath,
        URI.file("/some/other/path").fsPath,
        true
      )
    );
    assert(
      !isEqual(
        URI.file("c:\\some\\path").fsPath,
        URI.file("c:\\some\\other\\path").fsPath,
        true
      )
    );
    assert(
      isEqual(
        URI.file("/some/path").fsPath,
        URI.file("/some/PATH").fsPath,
        true
      )
    );
    assert(
      isEqual(
        URI.file("/some\xF6\xE4\xFC/path").fsPath,
        URI.file("/some\xD6\xC4\xDC/PATH").fsPath,
        true
      )
    );
    assert(
      isEqual(
        URI.file("c:\\some\\path").fsPath,
        URI.file("c:\\some\\PATH").fsPath,
        true
      )
    );
    assert(
      isEqual(
        URI.file("c:\\some\xF6\xE4\xFC\\path").fsPath,
        URI.file("c:\\some\xD6\xC4\xDC\\PATH").fsPath,
        true
      )
    );
    assert(
      isEqual(
        URI.file("c:\\some\\path").fsPath,
        URI.file("C:\\some\\PATH").fsPath,
        true
      )
    );
  });
  test("isParent (ignorecase)", () => {
    if (isWindows) {
      assert(isParent("c:\\some\\path", "c:\\", true));
      assert(isParent("c:\\some\\path", "c:\\some", true));
      assert(isParent("c:\\some\\path", "c:\\some\\", true));
      assert(isParent("c:\\some\xF6\xE4\xFC\\path", "c:\\some\xF6\xE4\xFC", true));
      assert(isParent("c:\\some\xF6\xE4\xFC\\path", "c:\\some\xF6\xE4\xFC\\", true));
      assert(isParent("c:\\foo\\bar\\test.ts", "c:\\foo\\bar", true));
      assert(isParent("c:\\foo\\bar\\test.ts", "c:\\foo\\bar\\", true));
      assert(isParent("c:\\some\\path", "C:\\", true));
      assert(isParent("c:\\some\\path", "c:\\SOME", true));
      assert(isParent("c:\\some\\path", "c:\\SOME\\", true));
      assert(!isParent("c:\\some\\path", "d:\\", true));
      assert(!isParent("c:\\some\\path", "c:\\some\\path", true));
      assert(!isParent("c:\\some\\path", "d:\\some\\path", true));
      assert(!isParent("c:\\foo\\bar\\test.ts", "c:\\foo\\barr", true));
      assert(
        !isParent("c:\\foo\\bar\\test.ts", "c:\\foo\\bar\\test", true)
      );
    }
    if (isMacintosh || isLinux) {
      assert(isParent("/some/path", "/", true));
      assert(isParent("/some/path", "/some", true));
      assert(isParent("/some/path", "/some/", true));
      assert(isParent("/some\xF6\xE4\xFC/path", "/some\xF6\xE4\xFC", true));
      assert(isParent("/some\xF6\xE4\xFC/path", "/some\xF6\xE4\xFC/", true));
      assert(isParent("/foo/bar/test.ts", "/foo/bar", true));
      assert(isParent("/foo/bar/test.ts", "/foo/bar/", true));
      assert(isParent("/some/path", "/SOME", true));
      assert(isParent("/some/path", "/SOME/", true));
      assert(isParent("/some\xF6\xE4\xFC/path", "/SOME\xD6\xC4\xDC", true));
      assert(isParent("/some\xF6\xE4\xFC/path", "/SOME\xD6\xC4\xDC/", true));
      assert(!isParent("/some/path", "/some/path", true));
      assert(!isParent("/foo/bar/test.ts", "/foo/barr", true));
      assert(!isParent("/foo/bar/test.ts", "/foo/bar/test", true));
    }
  });
  test("isEqualOrParent (ignorecase)", () => {
    testIsEqual(isEqualOrParent);
    if (isWindows) {
      assert(isEqualOrParent("c:\\some\\path", "c:\\", true));
      assert(isEqualOrParent("c:\\some\\path", "c:\\some", true));
      assert(isEqualOrParent("c:\\some\\path", "c:\\some\\", true));
      assert(isEqualOrParent("c:\\some\xF6\xE4\xFC\\path", "c:\\some\xF6\xE4\xFC", true));
      assert(isEqualOrParent("c:\\some\xF6\xE4\xFC\\path", "c:\\some\xF6\xE4\xFC\\", true));
      assert(
        isEqualOrParent("c:\\foo\\bar\\test.ts", "c:\\foo\\bar", true)
      );
      assert(
        isEqualOrParent(
          "c:\\foo\\bar\\test.ts",
          "c:\\foo\\bar\\",
          true
        )
      );
      assert(isEqualOrParent("c:\\some\\path", "c:\\some\\path", true));
      assert(
        isEqualOrParent(
          "c:\\foo\\bar\\test.ts",
          "c:\\foo\\bar\\test.ts",
          true
        )
      );
      assert(isEqualOrParent("c:\\some\\path", "C:\\", true));
      assert(isEqualOrParent("c:\\some\\path", "c:\\SOME", true));
      assert(isEqualOrParent("c:\\some\\path", "c:\\SOME\\", true));
      assert(!isEqualOrParent("c:\\some\\path", "d:\\", true));
      assert(!isEqualOrParent("c:\\some\\path", "d:\\some\\path", true));
      assert(
        !isEqualOrParent(
          "c:\\foo\\bar\\test.ts",
          "c:\\foo\\barr",
          true
        )
      );
      assert(
        !isEqualOrParent(
          "c:\\foo\\bar\\test.ts",
          "c:\\foo\\bar\\test",
          true
        )
      );
      assert(
        !isEqualOrParent(
          "c:\\foo\\bar\\test.ts",
          "c:\\foo\\bar\\test.",
          true
        )
      );
      assert(
        !isEqualOrParent(
          "c:\\foo\\bar\\test.ts",
          "c:\\foo\\BAR\\test.",
          true
        )
      );
    }
    if (isMacintosh || isLinux) {
      assert(isEqualOrParent("/some/path", "/", true));
      assert(isEqualOrParent("/some/path", "/some", true));
      assert(isEqualOrParent("/some/path", "/some/", true));
      assert(isEqualOrParent("/some\xF6\xE4\xFC/path", "/some\xF6\xE4\xFC", true));
      assert(isEqualOrParent("/some\xF6\xE4\xFC/path", "/some\xF6\xE4\xFC/", true));
      assert(isEqualOrParent("/foo/bar/test.ts", "/foo/bar", true));
      assert(isEqualOrParent("/foo/bar/test.ts", "/foo/bar/", true));
      assert(isEqualOrParent("/some/path", "/some/path", true));
      assert(isEqualOrParent("/some/path", "/SOME", true));
      assert(isEqualOrParent("/some/path", "/SOME/", true));
      assert(isEqualOrParent("/some\xF6\xE4\xFC/path", "/SOME\xD6\xC4\xDC", true));
      assert(isEqualOrParent("/some\xF6\xE4\xFC/path", "/SOME\xD6\xC4\xDC/", true));
      assert(!isEqualOrParent("/foo/bar/test.ts", "/foo/barr", true));
      assert(!isEqualOrParent("/foo/bar/test.ts", "/foo/bar/test", true));
      assert(!isEqualOrParent("foo/bar/test.ts", "foo/bar/test.", true));
      assert(!isEqualOrParent("foo/bar/test.ts", "foo/BAR/test.", true));
    }
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
