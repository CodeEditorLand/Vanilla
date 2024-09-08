import assert from "assert";
import { timeout } from "../../../../base/common/async.js";
import { extUri } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { BoundModelReferenceCollection } from "../../browser/mainThreadDocuments.js";
suite("BoundModelReferenceCollection", () => {
  let col;
  setup(() => {
    col = new BoundModelReferenceCollection(extUri, 15, 75);
  });
  teardown(() => {
    col.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("max age", async () => {
    let didDispose = false;
    col.add(URI.parse("test://farboo"), {
      object: {},
      dispose() {
        didDispose = true;
      }
    });
    await timeout(30);
    assert.strictEqual(didDispose, true);
  });
  test("max size", () => {
    const disposed = [];
    col.add(
      URI.parse("test://farboo"),
      {
        object: {},
        dispose() {
          disposed.push(0);
        }
      },
      6
    );
    col.add(
      URI.parse("test://boofar"),
      {
        object: {},
        dispose() {
          disposed.push(1);
        }
      },
      6
    );
    col.add(
      URI.parse("test://xxxxxxx"),
      {
        object: {},
        dispose() {
          disposed.push(2);
        }
      },
      70
    );
    assert.deepStrictEqual(disposed, [0, 1]);
  });
  test("max count", () => {
    col.dispose();
    col = new BoundModelReferenceCollection(extUri, 1e4, 1e4, 2);
    const disposed = [];
    col.add(URI.parse("test://xxxxxxx"), {
      object: {},
      dispose() {
        disposed.push(0);
      }
    });
    col.add(URI.parse("test://xxxxxxx"), {
      object: {},
      dispose() {
        disposed.push(1);
      }
    });
    col.add(URI.parse("test://xxxxxxx"), {
      object: {},
      dispose() {
        disposed.push(2);
      }
    });
    assert.deepStrictEqual(disposed, [0]);
  });
  test("dispose uri", () => {
    let disposed = [];
    col.add(URI.parse("test:///farboo"), {
      object: {},
      dispose() {
        disposed.push(0);
      }
    });
    col.add(URI.parse("test:///boofar"), {
      object: {},
      dispose() {
        disposed.push(1);
      }
    });
    col.add(URI.parse("test:///boo/far1"), {
      object: {},
      dispose() {
        disposed.push(2);
      }
    });
    col.add(URI.parse("test:///boo/far2"), {
      object: {},
      dispose() {
        disposed.push(3);
      }
    });
    col.add(URI.parse("test:///boo1/far"), {
      object: {},
      dispose() {
        disposed.push(4);
      }
    });
    col.remove(URI.parse("test:///unknown"));
    assert.strictEqual(disposed.length, 0);
    col.remove(URI.parse("test:///farboo"));
    assert.deepStrictEqual(disposed, [0]);
    disposed = [];
    col.remove(URI.parse("test:///boo"));
    assert.deepStrictEqual(disposed, [2, 3]);
  });
});
