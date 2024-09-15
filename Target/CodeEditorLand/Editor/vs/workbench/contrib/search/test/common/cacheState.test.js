var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as errors from "../../../../../base/common/errors.js";
import { QueryType, IFileQuery } from "../../../../services/search/common/search.js";
import { FileQueryCacheState } from "../../common/cacheState.js";
import { DeferredPromise } from "../../../../../base/common/async.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
suite("FileQueryCacheState", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("reuse old cacheKey until new cache is loaded", async function() {
    const cache = new MockCache();
    const first = createCacheState(cache);
    const firstKey = first.cacheKey;
    assert.strictEqual(first.isLoaded, false);
    assert.strictEqual(first.isUpdating, false);
    first.load();
    assert.strictEqual(first.isLoaded, false);
    assert.strictEqual(first.isUpdating, true);
    await cache.loading[firstKey].complete(null);
    assert.strictEqual(first.isLoaded, true);
    assert.strictEqual(first.isUpdating, false);
    const second = createCacheState(cache, first);
    second.load();
    assert.strictEqual(second.isLoaded, true);
    assert.strictEqual(second.isUpdating, true);
    await cache.awaitDisposal(0);
    assert.strictEqual(second.cacheKey, firstKey);
    const secondKey = cache.cacheKeys[1];
    await cache.loading[secondKey].complete(null);
    assert.strictEqual(second.isLoaded, true);
    assert.strictEqual(second.isUpdating, false);
    await cache.awaitDisposal(1);
    assert.strictEqual(second.cacheKey, secondKey);
  });
  test("do not spawn additional load if previous is still loading", async function() {
    const cache = new MockCache();
    const first = createCacheState(cache);
    const firstKey = first.cacheKey;
    first.load();
    assert.strictEqual(first.isLoaded, false);
    assert.strictEqual(first.isUpdating, true);
    assert.strictEqual(Object.keys(cache.loading).length, 1);
    const second = createCacheState(cache, first);
    second.load();
    assert.strictEqual(second.isLoaded, false);
    assert.strictEqual(second.isUpdating, true);
    assert.strictEqual(cache.cacheKeys.length, 2);
    assert.strictEqual(Object.keys(cache.loading).length, 1);
    assert.strictEqual(second.cacheKey, firstKey);
    await cache.loading[firstKey].complete(null);
    assert.strictEqual(second.isLoaded, true);
    assert.strictEqual(second.isUpdating, false);
    await cache.awaitDisposal(0);
  });
  test("do not use previous cacheKey if query changed", async function() {
    const cache = new MockCache();
    const first = createCacheState(cache);
    const firstKey = first.cacheKey;
    first.load();
    await cache.loading[firstKey].complete(null);
    assert.strictEqual(first.isLoaded, true);
    assert.strictEqual(first.isUpdating, false);
    await cache.awaitDisposal(0);
    cache.baseQuery.excludePattern = { "**/node_modules": true };
    const second = createCacheState(cache, first);
    assert.strictEqual(second.isLoaded, false);
    assert.strictEqual(second.isUpdating, false);
    await cache.awaitDisposal(1);
    second.load();
    assert.strictEqual(second.isLoaded, false);
    assert.strictEqual(second.isUpdating, true);
    assert.notStrictEqual(second.cacheKey, firstKey);
    const secondKey = cache.cacheKeys[1];
    assert.strictEqual(second.cacheKey, secondKey);
    await cache.loading[secondKey].complete(null);
    assert.strictEqual(second.isLoaded, true);
    assert.strictEqual(second.isUpdating, false);
    await cache.awaitDisposal(1);
  });
  test("dispose propagates", async function() {
    const cache = new MockCache();
    const first = createCacheState(cache);
    const firstKey = first.cacheKey;
    first.load();
    await cache.loading[firstKey].complete(null);
    const second = createCacheState(cache, first);
    assert.strictEqual(second.isLoaded, true);
    assert.strictEqual(second.isUpdating, false);
    await cache.awaitDisposal(0);
    second.dispose();
    assert.strictEqual(second.isLoaded, false);
    assert.strictEqual(second.isUpdating, false);
    await cache.awaitDisposal(1);
    assert.ok(cache.disposing[firstKey]);
  });
  test("keep using old cacheKey when loading fails", async function() {
    const cache = new MockCache();
    const first = createCacheState(cache);
    const firstKey = first.cacheKey;
    first.load();
    await cache.loading[firstKey].complete(null);
    const second = createCacheState(cache, first);
    second.load();
    const secondKey = cache.cacheKeys[1];
    const origErrorHandler = errors.errorHandler.getUnexpectedErrorHandler();
    try {
      errors.setUnexpectedErrorHandler(() => null);
      await cache.loading[secondKey].error("loading failed");
    } finally {
      errors.setUnexpectedErrorHandler(origErrorHandler);
    }
    assert.strictEqual(second.isLoaded, true);
    assert.strictEqual(second.isUpdating, false);
    assert.strictEqual(Object.keys(cache.loading).length, 2);
    await cache.awaitDisposal(0);
    assert.strictEqual(second.cacheKey, firstKey);
    const third = createCacheState(cache, second);
    third.load();
    assert.strictEqual(third.isLoaded, true);
    assert.strictEqual(third.isUpdating, true);
    assert.strictEqual(Object.keys(cache.loading).length, 3);
    await cache.awaitDisposal(0);
    assert.strictEqual(third.cacheKey, firstKey);
    const thirdKey = cache.cacheKeys[2];
    await cache.loading[thirdKey].complete(null);
    assert.strictEqual(third.isLoaded, true);
    assert.strictEqual(third.isUpdating, false);
    assert.strictEqual(Object.keys(cache.loading).length, 3);
    await cache.awaitDisposal(2);
    assert.strictEqual(third.cacheKey, thirdKey);
  });
  function createCacheState(cache, previous) {
    return new FileQueryCacheState(
      (cacheKey) => cache.query(cacheKey),
      (query) => cache.load(query),
      (cacheKey) => cache.dispose(cacheKey),
      previous
    );
  }
  __name(createCacheState, "createCacheState");
  class MockCache {
    static {
      __name(this, "MockCache");
    }
    cacheKeys = [];
    loading = {};
    disposing = {};
    _awaitDisposal = [];
    baseQuery = {
      type: QueryType.File,
      folderQueries: []
    };
    query(cacheKey) {
      this.cacheKeys.push(cacheKey);
      return Object.assign({ cacheKey }, this.baseQuery);
    }
    load(query) {
      const promise = new DeferredPromise();
      this.loading[query.cacheKey] = promise;
      return promise.p;
    }
    dispose(cacheKey) {
      const promise = new DeferredPromise();
      this.disposing[cacheKey] = promise;
      const n = Object.keys(this.disposing).length;
      for (const done of this._awaitDisposal[n] || []) {
        done();
      }
      delete this._awaitDisposal[n];
      return promise.p;
    }
    awaitDisposal(n) {
      return new Promise((resolve) => {
        if (n === Object.keys(this.disposing).length) {
          resolve();
        } else {
          (this._awaitDisposal[n] || (this._awaitDisposal[n] = [])).push(resolve);
        }
      });
    }
  }
});
//# sourceMappingURL=cacheState.test.js.map
