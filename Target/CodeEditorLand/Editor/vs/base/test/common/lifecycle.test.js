import assert from "assert";
import { Emitter } from "../../common/event.js";
import {
  DisposableStore,
  ReferenceCollection,
  SafeDisposable,
  dispose,
  markAsSingleton,
  toDisposable
} from "../../common/lifecycle.js";
import {
  ensureNoDisposablesAreLeakedInTestSuite,
  throwIfDisposablesAreLeaked
} from "./utils.js";
class Disposable {
  isDisposed = false;
  dispose() {
    this.isDisposed = true;
  }
}
suite("Lifecycle", () => {
  test("dispose single disposable", () => {
    const disposable = new Disposable();
    assert(!disposable.isDisposed);
    dispose(disposable);
    assert(disposable.isDisposed);
  });
  test("dispose disposable array", () => {
    const disposable = new Disposable();
    const disposable2 = new Disposable();
    assert(!disposable.isDisposed);
    assert(!disposable2.isDisposed);
    dispose([disposable, disposable2]);
    assert(disposable.isDisposed);
    assert(disposable2.isDisposed);
  });
  test("dispose disposables", () => {
    const disposable = new Disposable();
    const disposable2 = new Disposable();
    assert(!disposable.isDisposed);
    assert(!disposable2.isDisposed);
    dispose(disposable);
    dispose(disposable2);
    assert(disposable.isDisposed);
    assert(disposable2.isDisposed);
  });
  test("dispose array should dispose all if a child throws on dispose", () => {
    const disposedValues = /* @__PURE__ */ new Set();
    let thrownError;
    try {
      dispose([
        toDisposable(() => {
          disposedValues.add(1);
        }),
        toDisposable(() => {
          throw new Error("I am error");
        }),
        toDisposable(() => {
          disposedValues.add(3);
        })
      ]);
    } catch (e) {
      thrownError = e;
    }
    assert.ok(disposedValues.has(1));
    assert.ok(disposedValues.has(3));
    assert.strictEqual(thrownError.message, "I am error");
  });
  test("dispose array should rethrow composite error if multiple entries throw on dispose", () => {
    const disposedValues = /* @__PURE__ */ new Set();
    let thrownError;
    try {
      dispose([
        toDisposable(() => {
          disposedValues.add(1);
        }),
        toDisposable(() => {
          throw new Error("I am error 1");
        }),
        toDisposable(() => {
          throw new Error("I am error 2");
        }),
        toDisposable(() => {
          disposedValues.add(4);
        })
      ]);
    } catch (e) {
      thrownError = e;
    }
    assert.ok(disposedValues.has(1));
    assert.ok(disposedValues.has(4));
    assert.ok(thrownError instanceof AggregateError);
    assert.strictEqual(thrownError.errors.length, 2);
    assert.strictEqual(
      thrownError.errors[0].message,
      "I am error 1"
    );
    assert.strictEqual(
      thrownError.errors[1].message,
      "I am error 2"
    );
  });
  test("Action bar has broken accessibility #100273", () => {
    const array = [{ dispose() {
    } }, { dispose() {
    } }];
    const array2 = dispose(array);
    assert.strictEqual(array.length, 2);
    assert.strictEqual(array2.length, 0);
    assert.ok(array !== array2);
    const set = /* @__PURE__ */ new Set([{ dispose() {
    } }, { dispose() {
    } }]);
    const setValues = set.values();
    const setValues2 = dispose(setValues);
    assert.ok(setValues === setValues2);
  });
  test("SafeDisposable, dispose", () => {
    let disposed = 0;
    const actual = () => disposed += 1;
    const d = new SafeDisposable();
    d.set(actual);
    d.dispose();
    assert.strictEqual(disposed, 1);
  });
  test("SafeDisposable, unset", () => {
    let disposed = 0;
    const actual = () => disposed += 1;
    const d = new SafeDisposable();
    d.set(actual);
    d.unset();
    d.dispose();
    assert.strictEqual(disposed, 0);
  });
});
suite("DisposableStore", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("dispose should call all child disposes even if a child throws on dispose", () => {
    const disposedValues = /* @__PURE__ */ new Set();
    const store = new DisposableStore();
    store.add(
      toDisposable(() => {
        disposedValues.add(1);
      })
    );
    store.add(
      toDisposable(() => {
        throw new Error("I am error");
      })
    );
    store.add(
      toDisposable(() => {
        disposedValues.add(3);
      })
    );
    let thrownError;
    try {
      store.dispose();
    } catch (e) {
      thrownError = e;
    }
    assert.ok(disposedValues.has(1));
    assert.ok(disposedValues.has(3));
    assert.strictEqual(thrownError.message, "I am error");
  });
  test("dispose should throw composite error if multiple children throw on dispose", () => {
    const disposedValues = /* @__PURE__ */ new Set();
    const store = new DisposableStore();
    store.add(
      toDisposable(() => {
        disposedValues.add(1);
      })
    );
    store.add(
      toDisposable(() => {
        throw new Error("I am error 1");
      })
    );
    store.add(
      toDisposable(() => {
        throw new Error("I am error 2");
      })
    );
    store.add(
      toDisposable(() => {
        disposedValues.add(4);
      })
    );
    let thrownError;
    try {
      store.dispose();
    } catch (e) {
      thrownError = e;
    }
    assert.ok(disposedValues.has(1));
    assert.ok(disposedValues.has(4));
    assert.ok(thrownError instanceof AggregateError);
    assert.strictEqual(thrownError.errors.length, 2);
    assert.strictEqual(
      thrownError.errors[0].message,
      "I am error 1"
    );
    assert.strictEqual(
      thrownError.errors[1].message,
      "I am error 2"
    );
  });
  test("delete should evict and dispose of the disposables", () => {
    const disposedValues = /* @__PURE__ */ new Set();
    const disposables = [
      toDisposable(() => {
        disposedValues.add(1);
      }),
      toDisposable(() => {
        disposedValues.add(2);
      })
    ];
    const store = new DisposableStore();
    store.add(disposables[0]);
    store.add(disposables[1]);
    store.delete(disposables[0]);
    assert.ok(disposedValues.has(1));
    assert.ok(!disposedValues.has(2));
    store.dispose();
    assert.ok(disposedValues.has(1));
    assert.ok(disposedValues.has(2));
  });
  test("deleteAndLeak should evict and not dispose of the disposables", () => {
    const disposedValues = /* @__PURE__ */ new Set();
    const disposables = [
      toDisposable(() => {
        disposedValues.add(1);
      }),
      toDisposable(() => {
        disposedValues.add(2);
      })
    ];
    const store = new DisposableStore();
    store.add(disposables[0]);
    store.add(disposables[1]);
    store.deleteAndLeak(disposables[0]);
    assert.ok(!disposedValues.has(1));
    assert.ok(!disposedValues.has(2));
    store.dispose();
    assert.ok(!disposedValues.has(1));
    assert.ok(disposedValues.has(2));
    disposables[0].dispose();
  });
});
suite("Reference Collection", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  class Collection extends ReferenceCollection {
    _count = 0;
    get count() {
      return this._count;
    }
    createReferencedObject(key) {
      this._count++;
      return key.length;
    }
    destroyReferencedObject(key, object) {
      this._count--;
    }
  }
  test("simple", () => {
    const collection = new Collection();
    const ref1 = collection.acquire("test");
    assert(ref1);
    assert.strictEqual(ref1.object, 4);
    assert.strictEqual(collection.count, 1);
    ref1.dispose();
    assert.strictEqual(collection.count, 0);
    const ref2 = collection.acquire("test");
    const ref3 = collection.acquire("test");
    assert.strictEqual(ref2.object, ref3.object);
    assert.strictEqual(collection.count, 1);
    const ref4 = collection.acquire("monkey");
    assert.strictEqual(ref4.object, 6);
    assert.strictEqual(collection.count, 2);
    ref2.dispose();
    assert.strictEqual(collection.count, 2);
    ref3.dispose();
    assert.strictEqual(collection.count, 1);
    ref4.dispose();
    assert.strictEqual(collection.count, 0);
  });
});
function assertThrows(fn, test2) {
  try {
    fn();
    assert.fail("Expected function to throw, but it did not.");
  } catch (e) {
    assert.ok(test2(e));
  }
}
suite("No Leakage Utilities", () => {
  suite("throwIfDisposablesAreLeaked", () => {
    test("throws if an event subscription is not cleaned up", () => {
      const eventEmitter = new Emitter();
      assertThrows(
        () => {
          throwIfDisposablesAreLeaked(() => {
            eventEmitter.event(() => {
            });
          }, false);
        },
        (e) => e.message.indexOf("undisposed disposables") !== -1
      );
    });
    test("throws if a disposable is not disposed", () => {
      assertThrows(
        () => {
          throwIfDisposablesAreLeaked(() => {
            new DisposableStore();
          }, false);
        },
        (e) => e.message.indexOf("undisposed disposables") !== -1
      );
    });
    test("does not throw if all event subscriptions are cleaned up", () => {
      const eventEmitter = new Emitter();
      throwIfDisposablesAreLeaked(() => {
        eventEmitter.event(() => {
        }).dispose();
      });
    });
    test("does not throw if all disposables are disposed", () => {
      toDisposable(() => {
      });
      throwIfDisposablesAreLeaked(() => {
        markAsSingleton(toDisposable(() => {
        }));
        const disposableStore = new DisposableStore();
        disposableStore.add(toDisposable(() => {
        }));
        markAsSingleton(disposableStore);
        toDisposable(() => {
        }).dispose();
      });
    });
  });
  suite("ensureNoDisposablesAreLeakedInTest", () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    test("Basic Test", () => {
      toDisposable(() => {
      }).dispose();
    });
  });
});
