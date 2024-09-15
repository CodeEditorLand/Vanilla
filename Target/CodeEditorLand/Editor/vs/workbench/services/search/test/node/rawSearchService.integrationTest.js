var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { CancelablePromise, createCancelablePromise } from "../../../../../base/common/async.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { FileAccess } from "../../../../../base/common/network.js";
import * as path from "../../../../../base/common/path.js";
import { URI } from "../../../../../base/common/uri.js";
import { flakySuite } from "../../../../../base/test/node/testUtils.js";
import { IFileQuery, IFileSearchStats, IFolderQuery, IProgressMessage, IRawFileMatch, ISearchEngine, ISearchEngineStats, ISearchEngineSuccess, ISerializedFileMatch, ISerializedSearchComplete, ISerializedSearchProgressItem, ISerializedSearchSuccess, isSerializedSearchComplete, isSerializedSearchSuccess, QueryType } from "../../common/search.js";
import { IProgressCallback, SearchService as RawSearchService } from "../../node/rawSearchService.js";
const TEST_FOLDER_QUERIES = [
  { folder: URI.file(path.normalize("/some/where")) }
];
const TEST_FIXTURES = path.normalize(FileAccess.asFileUri("vs/workbench/services/search/test/node/fixtures").fsPath);
const MULTIROOT_QUERIES = [
  { folder: URI.file(path.join(TEST_FIXTURES, "examples")) },
  { folder: URI.file(path.join(TEST_FIXTURES, "more")) }
];
const stats = {
  fileWalkTime: 0,
  cmdTime: 1,
  directoriesWalked: 2,
  filesWalked: 3
};
class TestSearchEngine {
  constructor(result, config) {
    this.result = result;
    this.config = config;
    TestSearchEngine.last = this;
  }
  static {
    __name(this, "TestSearchEngine");
  }
  static last;
  isCanceled = false;
  search(onResult, onProgress, done) {
    const self = this;
    (/* @__PURE__ */ __name(function next() {
      process.nextTick(() => {
        if (self.isCanceled) {
          done(null, {
            limitHit: false,
            stats,
            messages: []
          });
          return;
        }
        const result = self.result();
        if (!result) {
          done(null, {
            limitHit: false,
            stats,
            messages: []
          });
        } else {
          onResult(result);
          next();
        }
      });
    }, "next"))();
  }
  cancel() {
    this.isCanceled = true;
  }
}
flakySuite("RawSearchService", () => {
  const rawSearch = {
    type: QueryType.File,
    folderQueries: TEST_FOLDER_QUERIES,
    filePattern: "a"
  };
  const rawMatch = {
    base: path.normalize("/some"),
    relativePath: "where",
    searchPath: void 0
  };
  const match = {
    path: path.normalize("/some/where")
  };
  test("Individual results", async function() {
    let i = 5;
    const Engine = TestSearchEngine.bind(null, () => i-- ? rawMatch : null);
    const service = new RawSearchService();
    let results = 0;
    const cb = /* @__PURE__ */ __name((value) => {
      if (!!value.message) {
        return;
      }
      if (!Array.isArray(value)) {
        assert.deepStrictEqual(value, match);
        results++;
      } else {
        assert.fail(JSON.stringify(value));
      }
    }, "cb");
    await service.doFileSearchWithEngine(Engine, rawSearch, cb, null, 0);
    return assert.strictEqual(results, 5);
  });
  test("Batch results", async function() {
    let i = 25;
    const Engine = TestSearchEngine.bind(null, () => i-- ? rawMatch : null);
    const service = new RawSearchService();
    const results = [];
    const cb = /* @__PURE__ */ __name((value) => {
      if (!!value.message) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((m) => {
          assert.deepStrictEqual(m, match);
        });
        results.push(value.length);
      } else {
        assert.fail(JSON.stringify(value));
      }
    }, "cb");
    await service.doFileSearchWithEngine(Engine, rawSearch, cb, void 0, 10);
    assert.deepStrictEqual(results, [10, 10, 5]);
  });
  test("Collect batched results", async function() {
    const uriPath = "/some/where";
    let i = 25;
    const Engine = TestSearchEngine.bind(null, () => i-- ? rawMatch : null);
    const service = new RawSearchService();
    function fileSearch(config, batchSize) {
      let promise;
      const emitter = new Emitter({
        onWillAddFirstListener: /* @__PURE__ */ __name(() => {
          promise = createCancelablePromise((token) => service.doFileSearchWithEngine(Engine, config, (p) => emitter.fire(p), token, batchSize).then((c) => emitter.fire(c), (err) => emitter.fire({ type: "error", error: err })));
        }, "onWillAddFirstListener"),
        onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
          promise.cancel();
        }, "onDidRemoveLastListener")
      });
      return emitter.event;
    }
    __name(fileSearch, "fileSearch");
    const result = await collectResultsFromEvent(fileSearch(rawSearch, 10));
    result.files.forEach((f) => {
      assert.strictEqual(f.path.replace(/\\/g, "/"), uriPath);
    });
    assert.strictEqual(result.files.length, 25, "Result");
  });
  test("Multi-root with include pattern and maxResults", async function() {
    const service = new RawSearchService();
    const query = {
      type: QueryType.File,
      folderQueries: MULTIROOT_QUERIES,
      maxResults: 1,
      includePattern: {
        "*.txt": true,
        "*.js": true
      }
    };
    const result = await collectResultsFromEvent(service.fileSearch(query));
    assert.strictEqual(result.files.length, 1, "Result");
  });
  test("Handles maxResults=0 correctly", async function() {
    const service = new RawSearchService();
    const query = {
      type: QueryType.File,
      folderQueries: MULTIROOT_QUERIES,
      maxResults: 0,
      sortByScore: true,
      includePattern: {
        "*.txt": true,
        "*.js": true
      }
    };
    const result = await collectResultsFromEvent(service.fileSearch(query));
    assert.strictEqual(result.files.length, 0, "Result");
  });
  test("Multi-root with include pattern and exists", async function() {
    const service = new RawSearchService();
    const query = {
      type: QueryType.File,
      folderQueries: MULTIROOT_QUERIES,
      exists: true,
      includePattern: {
        "*.txt": true,
        "*.js": true
      }
    };
    const result = await collectResultsFromEvent(service.fileSearch(query));
    assert.strictEqual(result.files.length, 0, "Result");
    assert.ok(result.limitHit);
  });
  test("Sorted results", async function() {
    const paths = ["bab", "bbc", "abb"];
    const matches = paths.map((relativePath) => ({
      base: path.normalize("/some/where"),
      relativePath,
      basename: relativePath,
      size: 3,
      searchPath: void 0
    }));
    const Engine = TestSearchEngine.bind(null, () => matches.shift());
    const service = new RawSearchService();
    const results = [];
    const cb = /* @__PURE__ */ __name((value) => {
      if (!!value.message) {
        return;
      }
      if (Array.isArray(value)) {
        results.push(...value.map((v) => v.path));
      } else {
        assert.fail(JSON.stringify(value));
      }
    }, "cb");
    await service.doFileSearchWithEngine(Engine, {
      type: QueryType.File,
      folderQueries: TEST_FOLDER_QUERIES,
      filePattern: "bb",
      sortByScore: true,
      maxResults: 2
    }, cb, void 0, 1);
    assert.notStrictEqual(typeof TestSearchEngine.last.config.maxResults, "number");
    assert.deepStrictEqual(results, [path.normalize("/some/where/bbc"), path.normalize("/some/where/bab")]);
  });
  test("Sorted result batches", async function() {
    let i = 25;
    const Engine = TestSearchEngine.bind(null, () => i-- ? rawMatch : null);
    const service = new RawSearchService();
    const results = [];
    const cb = /* @__PURE__ */ __name((value) => {
      if (!!value.message) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((m) => {
          assert.deepStrictEqual(m, match);
        });
        results.push(value.length);
      } else {
        assert.fail(JSON.stringify(value));
      }
    }, "cb");
    await service.doFileSearchWithEngine(Engine, {
      type: QueryType.File,
      folderQueries: TEST_FOLDER_QUERIES,
      filePattern: "a",
      sortByScore: true,
      maxResults: 23
    }, cb, void 0, 10);
    assert.deepStrictEqual(results, [10, 10, 3]);
  });
  test("Cached results", function() {
    const paths = ["bcb", "bbc", "aab"];
    const matches = paths.map((relativePath) => ({
      base: path.normalize("/some/where"),
      relativePath,
      basename: relativePath,
      size: 3,
      searchPath: void 0
    }));
    const Engine = TestSearchEngine.bind(null, () => matches.shift());
    const service = new RawSearchService();
    const results = [];
    const cb = /* @__PURE__ */ __name((value) => {
      if (!!value.message) {
        return;
      }
      if (Array.isArray(value)) {
        results.push(...value.map((v) => v.path));
      } else {
        assert.fail(JSON.stringify(value));
      }
    }, "cb");
    return service.doFileSearchWithEngine(Engine, {
      type: QueryType.File,
      folderQueries: TEST_FOLDER_QUERIES,
      filePattern: "b",
      sortByScore: true,
      cacheKey: "x"
    }, cb, void 0, -1).then((complete) => {
      assert.strictEqual(complete.stats.fromCache, false);
      assert.deepStrictEqual(results, [path.normalize("/some/where/bcb"), path.normalize("/some/where/bbc"), path.normalize("/some/where/aab")]);
    }).then(async () => {
      const results2 = [];
      const cb2 = /* @__PURE__ */ __name((value) => {
        if (Array.isArray(value)) {
          results2.push(...value.map((v) => v.path));
        } else {
          assert.fail(JSON.stringify(value));
        }
      }, "cb");
      try {
        const complete = await service.doFileSearchWithEngine(Engine, {
          type: QueryType.File,
          folderQueries: TEST_FOLDER_QUERIES,
          filePattern: "bc",
          sortByScore: true,
          cacheKey: "x"
        }, cb2, void 0, -1);
        assert.ok(complete.stats.fromCache);
        assert.deepStrictEqual(results2, [path.normalize("/some/where/bcb"), path.normalize("/some/where/bbc")]);
      } catch (e) {
      }
    }).then(() => {
      return service.clearCache("x");
    }).then(async () => {
      matches.push({
        base: path.normalize("/some/where"),
        relativePath: "bc",
        searchPath: void 0
      });
      const results2 = [];
      const cb2 = /* @__PURE__ */ __name((value) => {
        if (!!value.message) {
          return;
        }
        if (Array.isArray(value)) {
          results2.push(...value.map((v) => v.path));
        } else {
          assert.fail(JSON.stringify(value));
        }
      }, "cb");
      const complete = await service.doFileSearchWithEngine(Engine, {
        type: QueryType.File,
        folderQueries: TEST_FOLDER_QUERIES,
        filePattern: "bc",
        sortByScore: true,
        cacheKey: "x"
      }, cb2, void 0, -1);
      assert.strictEqual(complete.stats.fromCache, false);
      assert.deepStrictEqual(results2, [path.normalize("/some/where/bc")]);
    });
  });
});
function collectResultsFromEvent(event) {
  const files = [];
  let listener;
  return new Promise((c, e) => {
    listener = event((ev) => {
      if (isSerializedSearchComplete(ev)) {
        if (isSerializedSearchSuccess(ev)) {
          c({ files, limitHit: ev.limitHit });
        } else {
          e(ev.error);
        }
        listener.dispose();
      } else if (Array.isArray(ev)) {
        files.push(...ev);
      } else if (ev.path) {
        files.push(ev);
      }
    });
  });
}
__name(collectResultsFromEvent, "collectResultsFromEvent");
//# sourceMappingURL=rawSearchService.integrationTest.js.map
