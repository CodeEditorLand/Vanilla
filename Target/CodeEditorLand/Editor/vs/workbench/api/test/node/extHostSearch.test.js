var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { mapArrayOrNot } from "../../../../base/common/arrays.js";
import { timeout } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { revive } from "../../../../base/common/marshalling.js";
import { joinPath } from "../../../../base/common/resources.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import * as pfs from "../../../../base/node/pfs.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import { MainContext, MainThreadSearchShape } from "../../common/extHost.protocol.js";
import { ExtHostConfigProvider, IExtHostConfiguration } from "../../common/extHostConfiguration.js";
import { IExtHostInitDataService } from "../../common/extHostInitDataService.js";
import { Range } from "../../common/extHostTypes.js";
import { URITransformerService } from "../../common/extHostUriTransformerService.js";
import { NativeExtHostSearch } from "../../node/extHostSearch.js";
import { TestRPCProtocol } from "../common/testRPCProtocol.js";
import { IFileMatch, IFileQuery, IPatternInfo, IRawFileMatch2, ISearchCompleteStats, ISearchQuery, ITextQuery, QueryType, resultIsMatch } from "../../../services/search/common/search.js";
import { TextSearchManager } from "../../../services/search/common/textSearchManager.js";
import { NativeTextSearchManager } from "../../../services/search/node/textSearchManager.js";
let rpcProtocol;
let extHostSearch;
let mockMainThreadSearch;
class MockMainThreadSearch {
  static {
    __name(this, "MockMainThreadSearch");
  }
  lastHandle;
  results = [];
  $registerFileSearchProvider(handle, scheme) {
    this.lastHandle = handle;
  }
  $registerTextSearchProvider(handle, scheme) {
    this.lastHandle = handle;
  }
  $registerAITextSearchProvider(handle, scheme) {
    this.lastHandle = handle;
  }
  $unregisterProvider(handle) {
  }
  $handleFileMatch(handle, session, data) {
    this.results.push(...data);
  }
  $handleTextMatch(handle, session, data) {
    this.results.push(...data);
  }
  $handleTelemetry(eventName, data) {
  }
  dispose() {
  }
}
let mockPFS;
function extensionResultIsMatch(data) {
  return !!data.preview;
}
__name(extensionResultIsMatch, "extensionResultIsMatch");
suite("ExtHostSearch", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  async function registerTestTextSearchProvider(provider, scheme = "file") {
    disposables.add(extHostSearch.registerTextSearchProviderOld(scheme, provider));
    await rpcProtocol.sync();
  }
  __name(registerTestTextSearchProvider, "registerTestTextSearchProvider");
  async function registerTestFileSearchProvider(provider, scheme = "file") {
    disposables.add(extHostSearch.registerFileSearchProviderOld(scheme, provider));
    await rpcProtocol.sync();
  }
  __name(registerTestFileSearchProvider, "registerTestFileSearchProvider");
  async function runFileSearch(query, cancel = false) {
    let stats;
    try {
      const cancellation = new CancellationTokenSource();
      const p = extHostSearch.$provideFileSearchResults(mockMainThreadSearch.lastHandle, 0, query, cancellation.token);
      if (cancel) {
        await timeout(0);
        cancellation.cancel();
      }
      stats = await p;
    } catch (err) {
      if (!isCancellationError(err)) {
        await rpcProtocol.sync();
        throw err;
      }
    }
    await rpcProtocol.sync();
    return {
      results: mockMainThreadSearch.results.map((r) => URI.revive(r)),
      stats
    };
  }
  __name(runFileSearch, "runFileSearch");
  async function runTextSearch(query) {
    let stats;
    try {
      const cancellation = new CancellationTokenSource();
      const p = extHostSearch.$provideTextSearchResults(mockMainThreadSearch.lastHandle, 0, query, cancellation.token);
      stats = await p;
    } catch (err) {
      if (!isCancellationError(err)) {
        await rpcProtocol.sync();
        throw err;
      }
    }
    await rpcProtocol.sync();
    const results = revive(mockMainThreadSearch.results);
    return { results, stats };
  }
  __name(runTextSearch, "runTextSearch");
  setup(() => {
    rpcProtocol = new TestRPCProtocol();
    mockMainThreadSearch = new MockMainThreadSearch();
    const logService = new NullLogService();
    rpcProtocol.set(MainContext.MainThreadSearch, mockMainThreadSearch);
    mockPFS = {};
    extHostSearch = disposables.add(new class extends NativeExtHostSearch {
      constructor() {
        super(
          rpcProtocol,
          new class extends mock() {
            remote = { isRemote: false, authority: void 0, connectionData: null };
          }(),
          new URITransformerService(null),
          new class extends mock() {
            async getConfigProvider() {
              return {
                onDidChangeConfiguration(_listener) {
                },
                getConfiguration() {
                  return {
                    get() {
                    },
                    has() {
                      return false;
                    },
                    inspect() {
                      return void 0;
                    },
                    async update() {
                    }
                  };
                }
              };
            }
          }(),
          logService
        );
        this._pfs = mockPFS;
      }
      createTextSearchManager(query, provider) {
        return new NativeTextSearchManager(query, provider, this._pfs);
      }
    }());
  });
  teardown(() => {
    return rpcProtocol.sync();
  });
  const rootFolderA = URI.file("/foo/bar1");
  const rootFolderB = URI.file("/foo/bar2");
  const fancyScheme = "fancy";
  const fancySchemeFolderA = URI.from({ scheme: fancyScheme, path: "/project/folder1" });
  suite("File:", () => {
    function getSimpleQuery(filePattern = "") {
      return {
        type: QueryType.File,
        filePattern,
        folderQueries: [
          { folder: rootFolderA }
        ]
      };
    }
    __name(getSimpleQuery, "getSimpleQuery");
    function compareURIs(actual, expected) {
      const sortAndStringify = /* @__PURE__ */ __name((arr) => arr.sort().map((u) => u.toString()), "sortAndStringify");
      assert.deepStrictEqual(
        sortAndStringify(actual),
        sortAndStringify(expected)
      );
    }
    __name(compareURIs, "compareURIs");
    test("no results", async () => {
      await registerTestFileSearchProvider({
        provideFileSearchResults(query, options, token) {
          return Promise.resolve(null);
        }
      });
      const { results, stats } = await runFileSearch(getSimpleQuery());
      assert(!stats.limitHit);
      assert(!results.length);
    });
    test("simple results", async () => {
      const reportedResults = [
        joinPath(rootFolderA, "file1.ts"),
        joinPath(rootFolderA, "file2.ts"),
        joinPath(rootFolderA, "subfolder/file3.ts")
      ];
      await registerTestFileSearchProvider({
        provideFileSearchResults(query, options, token) {
          return Promise.resolve(reportedResults);
        }
      });
      const { results, stats } = await runFileSearch(getSimpleQuery());
      assert(!stats.limitHit);
      assert.strictEqual(results.length, 3);
      compareURIs(results, reportedResults);
    });
    test("Search canceled", async () => {
      let cancelRequested = false;
      await registerTestFileSearchProvider({
        provideFileSearchResults(query, options, token) {
          return new Promise((resolve, reject) => {
            function onCancel() {
              cancelRequested = true;
              resolve([joinPath(options.folder, "file1.ts")]);
            }
            __name(onCancel, "onCancel");
            if (token.isCancellationRequested) {
              onCancel();
            } else {
              disposables.add(token.onCancellationRequested(() => onCancel()));
            }
          });
        }
      });
      const { results } = await runFileSearch(getSimpleQuery(), true);
      assert(cancelRequested);
      assert(!results.length);
    });
    test("session cancellation should work", async () => {
      let numSessionCancelled = 0;
      const disposables2 = [];
      await registerTestFileSearchProvider({
        provideFileSearchResults(query, options, token) {
          disposables2.push(options.session?.onCancellationRequested(() => {
            numSessionCancelled++;
          }));
          return Promise.resolve([]);
        }
      });
      await runFileSearch({ ...getSimpleQuery(), cacheKey: "1" }, true);
      await runFileSearch({ ...getSimpleQuery(), cacheKey: "2" }, true);
      extHostSearch.$clearCache("1");
      assert.strictEqual(numSessionCancelled, 1);
      disposables2.forEach((d) => d?.dispose());
    });
    test("provider returns null", async () => {
      await registerTestFileSearchProvider({
        provideFileSearchResults(query, options, token) {
          return null;
        }
      });
      try {
        await runFileSearch(getSimpleQuery());
        assert(false, "Expected to fail");
      } catch {
      }
    });
    test("all provider calls get global include/excludes", async () => {
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          assert(options.excludes.length === 2 && options.includes.length === 2, "Missing global include/excludes");
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.File,
        filePattern: "",
        includePattern: {
          "foo": true,
          "bar": true
        },
        excludePattern: {
          "something": true,
          "else": true
        },
        folderQueries: [
          { folder: rootFolderA },
          { folder: rootFolderB }
        ]
      };
      await runFileSearch(query);
    });
    test("global/local include/excludes combined", async () => {
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          if (options.folder.toString() === rootFolderA.toString()) {
            assert.deepStrictEqual(options.includes.sort(), ["*.ts", "foo"]);
            assert.deepStrictEqual(options.excludes.sort(), ["*.js", "bar"]);
          } else {
            assert.deepStrictEqual(options.includes.sort(), ["*.ts"]);
            assert.deepStrictEqual(options.excludes.sort(), ["*.js"]);
          }
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.File,
        filePattern: "",
        includePattern: {
          "*.ts": true
        },
        excludePattern: {
          "*.js": true
        },
        folderQueries: [
          {
            folder: rootFolderA,
            includePattern: {
              "foo": true
            },
            excludePattern: [{
              pattern: {
                "bar": true
              }
            }]
          },
          { folder: rootFolderB }
        ]
      };
      await runFileSearch(query);
    });
    test("include/excludes resolved correctly", async () => {
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          assert.deepStrictEqual(options.includes.sort(), ["*.jsx", "*.ts"]);
          assert.deepStrictEqual(options.excludes.sort(), []);
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.File,
        filePattern: "",
        includePattern: {
          "*.ts": true,
          "*.jsx": false
        },
        excludePattern: {
          "*.js": true,
          "*.tsx": false
        },
        folderQueries: [
          {
            folder: rootFolderA,
            includePattern: {
              "*.jsx": true
            },
            excludePattern: [{
              pattern: {
                "*.js": false
              }
            }]
          }
        ]
      };
      await runFileSearch(query);
    });
    test("basic sibling exclude clause", async () => {
      const reportedResults = [
        "file1.ts",
        "file1.js"
      ];
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          return Promise.resolve(reportedResults.map((relativePath) => joinPath(options.folder, relativePath)));
        }
      });
      const query = {
        type: QueryType.File,
        filePattern: "",
        excludePattern: {
          "*.js": {
            when: "$(basename).ts"
          }
        },
        folderQueries: [
          { folder: rootFolderA }
        ]
      };
      const { results } = await runFileSearch(query);
      compareURIs(
        results,
        [
          joinPath(rootFolderA, "file1.ts")
        ]
      );
    });
    test("include, sibling exclude, and subfolder", async () => {
      const reportedResults = [
        "foo/file1.ts",
        "foo/file1.js"
      ];
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          return Promise.resolve(reportedResults.map((relativePath) => joinPath(options.folder, relativePath)));
        }
      });
      const query = {
        type: QueryType.File,
        filePattern: "",
        includePattern: { "**/*.ts": true },
        excludePattern: {
          "*.js": {
            when: "$(basename).ts"
          }
        },
        folderQueries: [
          { folder: rootFolderA }
        ]
      };
      const { results } = await runFileSearch(query);
      compareURIs(
        results,
        [
          joinPath(rootFolderA, "foo/file1.ts")
        ]
      );
    });
    test("multiroot sibling exclude clause", async () => {
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          let reportedResults;
          if (options.folder.fsPath === rootFolderA.fsPath) {
            reportedResults = [
              "folder/fileA.scss",
              "folder/fileA.css",
              "folder/file2.css"
            ].map((relativePath) => joinPath(rootFolderA, relativePath));
          } else {
            reportedResults = [
              "fileB.ts",
              "fileB.js",
              "file3.js"
            ].map((relativePath) => joinPath(rootFolderB, relativePath));
          }
          return Promise.resolve(reportedResults);
        }
      });
      const query = {
        type: QueryType.File,
        filePattern: "",
        excludePattern: {
          "*.js": {
            when: "$(basename).ts"
          },
          "*.css": true
        },
        folderQueries: [
          {
            folder: rootFolderA,
            excludePattern: [{
              pattern: {
                "folder/*.css": {
                  when: "$(basename).scss"
                }
              }
            }]
          },
          {
            folder: rootFolderB,
            excludePattern: [{
              pattern: {
                "*.js": false
              }
            }]
          }
        ]
      };
      const { results } = await runFileSearch(query);
      compareURIs(
        results,
        [
          joinPath(rootFolderA, "folder/fileA.scss"),
          joinPath(rootFolderA, "folder/file2.css"),
          joinPath(rootFolderB, "fileB.ts"),
          joinPath(rootFolderB, "fileB.js"),
          joinPath(rootFolderB, "file3.js")
        ]
      );
    });
    test("max results = 1", async () => {
      const reportedResults = [
        joinPath(rootFolderA, "file1.ts"),
        joinPath(rootFolderA, "file2.ts"),
        joinPath(rootFolderA, "file3.ts")
      ];
      let wasCanceled = false;
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          disposables.add(token.onCancellationRequested(() => wasCanceled = true));
          return Promise.resolve(reportedResults);
        }
      });
      const query = {
        type: QueryType.File,
        filePattern: "",
        maxResults: 1,
        folderQueries: [
          {
            folder: rootFolderA
          }
        ]
      };
      const { results, stats } = await runFileSearch(query);
      assert(stats.limitHit, "Expected to return limitHit");
      assert.strictEqual(results.length, 1);
      compareURIs(results, reportedResults.slice(0, 1));
      assert(wasCanceled, "Expected to be canceled when hitting limit");
    });
    test("max results = 2", async () => {
      const reportedResults = [
        joinPath(rootFolderA, "file1.ts"),
        joinPath(rootFolderA, "file2.ts"),
        joinPath(rootFolderA, "file3.ts")
      ];
      let wasCanceled = false;
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          disposables.add(token.onCancellationRequested(() => wasCanceled = true));
          return Promise.resolve(reportedResults);
        }
      });
      const query = {
        type: QueryType.File,
        filePattern: "",
        maxResults: 2,
        folderQueries: [
          {
            folder: rootFolderA
          }
        ]
      };
      const { results, stats } = await runFileSearch(query);
      assert(stats.limitHit, "Expected to return limitHit");
      assert.strictEqual(results.length, 2);
      compareURIs(results, reportedResults.slice(0, 2));
      assert(wasCanceled, "Expected to be canceled when hitting limit");
    });
    test("provider returns maxResults exactly", async () => {
      const reportedResults = [
        joinPath(rootFolderA, "file1.ts"),
        joinPath(rootFolderA, "file2.ts")
      ];
      let wasCanceled = false;
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          disposables.add(token.onCancellationRequested(() => wasCanceled = true));
          return Promise.resolve(reportedResults);
        }
      });
      const query = {
        type: QueryType.File,
        filePattern: "",
        maxResults: 2,
        folderQueries: [
          {
            folder: rootFolderA
          }
        ]
      };
      const { results, stats } = await runFileSearch(query);
      assert(!stats.limitHit, "Expected not to return limitHit");
      assert.strictEqual(results.length, 2);
      compareURIs(results, reportedResults);
      assert(!wasCanceled, "Expected not to be canceled when just reaching limit");
    });
    test("multiroot max results", async () => {
      let cancels = 0;
      await registerTestFileSearchProvider({
        async provideFileSearchResults(query2, options, token) {
          disposables.add(token.onCancellationRequested(() => cancels++));
          await new Promise((r) => process.nextTick(r));
          return [
            "file1.ts",
            "file2.ts",
            "file3.ts"
          ].map((relativePath) => joinPath(options.folder, relativePath));
        }
      });
      const query = {
        type: QueryType.File,
        filePattern: "",
        maxResults: 2,
        folderQueries: [
          {
            folder: rootFolderA
          },
          {
            folder: rootFolderB
          }
        ]
      };
      const { results } = await runFileSearch(query);
      assert.strictEqual(results.length, 2);
      assert.strictEqual(cancels, 2, "Expected all invocations to be canceled when hitting limit");
    });
    test("works with non-file schemes", async () => {
      const reportedResults = [
        joinPath(fancySchemeFolderA, "file1.ts"),
        joinPath(fancySchemeFolderA, "file2.ts"),
        joinPath(fancySchemeFolderA, "subfolder/file3.ts")
      ];
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          return Promise.resolve(reportedResults);
        }
      }, fancyScheme);
      const query = {
        type: QueryType.File,
        filePattern: "",
        folderQueries: [
          {
            folder: fancySchemeFolderA
          }
        ]
      };
      const { results } = await runFileSearch(query);
      compareURIs(results, reportedResults);
    });
    test("if onlyFileScheme is set, do not call custom schemes", async () => {
      let fancySchemeCalled = false;
      await registerTestFileSearchProvider({
        provideFileSearchResults(query2, options, token) {
          fancySchemeCalled = true;
          return Promise.resolve([]);
        }
      }, fancyScheme);
      const query = {
        type: QueryType.File,
        filePattern: "",
        folderQueries: []
      };
      await runFileSearch(query);
      assert(!fancySchemeCalled);
    });
  });
  suite("Text:", () => {
    function makePreview(text) {
      return {
        matches: [new Range(0, 0, 0, text.length)],
        text
      };
    }
    __name(makePreview, "makePreview");
    function makeTextResult(baseFolder, relativePath) {
      return {
        preview: makePreview("foo"),
        ranges: [new Range(0, 0, 0, 3)],
        uri: joinPath(baseFolder, relativePath)
      };
    }
    __name(makeTextResult, "makeTextResult");
    function getSimpleQuery(queryText) {
      return {
        type: QueryType.Text,
        contentPattern: getPattern(queryText),
        folderQueries: [
          { folder: rootFolderA }
        ]
      };
    }
    __name(getSimpleQuery, "getSimpleQuery");
    function getPattern(queryText) {
      return {
        pattern: queryText
      };
    }
    __name(getPattern, "getPattern");
    function assertResults(actual, expected) {
      const actualTextSearchResults = [];
      for (const fileMatch of actual) {
        for (const lineResult of fileMatch.results) {
          if (resultIsMatch(lineResult)) {
            actualTextSearchResults.push({
              preview: {
                text: lineResult.previewText,
                matches: mapArrayOrNot(
                  lineResult.rangeLocations.map((r) => r.preview),
                  (m) => new Range(m.startLineNumber, m.startColumn, m.endLineNumber, m.endColumn)
                )
              },
              ranges: mapArrayOrNot(
                lineResult.rangeLocations.map((r) => r.source),
                (r) => new Range(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn)
              ),
              uri: fileMatch.resource
            });
          } else {
            actualTextSearchResults.push({
              text: lineResult.text,
              lineNumber: lineResult.lineNumber,
              uri: fileMatch.resource
            });
          }
        }
      }
      const rangeToString = /* @__PURE__ */ __name((r) => `(${r.start.line}, ${r.start.character}), (${r.end.line}, ${r.end.character})`, "rangeToString");
      const makeComparable = /* @__PURE__ */ __name((results) => results.sort((a, b) => {
        const compareKeyA = a.uri.toString() + ": " + (extensionResultIsMatch(a) ? a.preview.text : a.text);
        const compareKeyB = b.uri.toString() + ": " + (extensionResultIsMatch(b) ? b.preview.text : b.text);
        return compareKeyB.localeCompare(compareKeyA);
      }).map((r) => extensionResultIsMatch(r) ? {
        uri: r.uri.toString(),
        range: mapArrayOrNot(r.ranges, rangeToString),
        preview: {
          text: r.preview.text,
          match: null
          // Don't care about this right now
        }
      } : {
        uri: r.uri.toString(),
        text: r.text,
        lineNumber: r.lineNumber
      }), "makeComparable");
      return assert.deepStrictEqual(
        makeComparable(actualTextSearchResults),
        makeComparable(expected)
      );
    }
    __name(assertResults, "assertResults");
    test("no results", async () => {
      await registerTestTextSearchProvider({
        provideTextSearchResults(query, options, progress, token) {
          return Promise.resolve(null);
        }
      });
      const { results, stats } = await runTextSearch(getSimpleQuery("foo"));
      assert(!stats.limitHit);
      assert(!results.length);
    });
    test("basic results", async () => {
      const providedResults = [
        makeTextResult(rootFolderA, "file1.ts"),
        makeTextResult(rootFolderA, "file2.ts")
      ];
      await registerTestTextSearchProvider({
        provideTextSearchResults(query, options, progress, token) {
          providedResults.forEach((r) => progress.report(r));
          return Promise.resolve(null);
        }
      });
      const { results, stats } = await runTextSearch(getSimpleQuery("foo"));
      assert(!stats.limitHit);
      assertResults(results, providedResults);
    });
    test("all provider calls get global include/excludes", async () => {
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          assert.strictEqual(options.includes.length, 1);
          assert.strictEqual(options.excludes.length, 1);
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        includePattern: {
          "*.ts": true
        },
        excludePattern: {
          "*.js": true
        },
        folderQueries: [
          { folder: rootFolderA },
          { folder: rootFolderB }
        ]
      };
      await runTextSearch(query);
    });
    test("global/local include/excludes combined", async () => {
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          if (options.folder.toString() === rootFolderA.toString()) {
            assert.deepStrictEqual(options.includes.sort(), ["*.ts", "foo"]);
            assert.deepStrictEqual(options.excludes.sort(), ["*.js", "bar"]);
          } else {
            assert.deepStrictEqual(options.includes.sort(), ["*.ts"]);
            assert.deepStrictEqual(options.excludes.sort(), ["*.js"]);
          }
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        includePattern: {
          "*.ts": true
        },
        excludePattern: {
          "*.js": true
        },
        folderQueries: [
          {
            folder: rootFolderA,
            includePattern: {
              "foo": true
            },
            excludePattern: [{
              pattern: {
                "bar": true
              }
            }]
          },
          { folder: rootFolderB }
        ]
      };
      await runTextSearch(query);
    });
    test("include/excludes resolved correctly", async () => {
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          assert.deepStrictEqual(options.includes.sort(), ["*.jsx", "*.ts"]);
          assert.deepStrictEqual(options.excludes.sort(), []);
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        includePattern: {
          "*.ts": true,
          "*.jsx": false
        },
        excludePattern: {
          "*.js": true,
          "*.tsx": false
        },
        folderQueries: [
          {
            folder: rootFolderA,
            includePattern: {
              "*.jsx": true
            },
            excludePattern: [{
              pattern: {
                "*.js": false
              }
            }]
          }
        ]
      };
      await runTextSearch(query);
    });
    test("provider fail", async () => {
      await registerTestTextSearchProvider({
        provideTextSearchResults(query, options, progress, token) {
          throw new Error("Provider fail");
        }
      });
      try {
        await runTextSearch(getSimpleQuery("foo"));
        assert(false, "Expected to fail");
      } catch {
      }
    });
    test("basic sibling clause", async () => {
      mockPFS.Promises = {
        readdir: /* @__PURE__ */ __name((_path) => {
          if (_path === rootFolderA.fsPath) {
            return Promise.resolve([
              "file1.js",
              "file1.ts"
            ]);
          } else {
            return Promise.reject(new Error("Wrong path"));
          }
        }, "readdir")
      };
      const providedResults = [
        makeTextResult(rootFolderA, "file1.js"),
        makeTextResult(rootFolderA, "file1.ts")
      ];
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          providedResults.forEach((r) => progress.report(r));
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        excludePattern: {
          "*.js": {
            when: "$(basename).ts"
          }
        },
        folderQueries: [
          { folder: rootFolderA }
        ]
      };
      const { results } = await runTextSearch(query);
      assertResults(results, providedResults.slice(1));
    });
    test("multiroot sibling clause", async () => {
      mockPFS.Promises = {
        readdir: /* @__PURE__ */ __name((_path) => {
          if (_path === joinPath(rootFolderA, "folder").fsPath) {
            return Promise.resolve([
              "fileA.scss",
              "fileA.css",
              "file2.css"
            ]);
          } else if (_path === rootFolderB.fsPath) {
            return Promise.resolve([
              "fileB.ts",
              "fileB.js",
              "file3.js"
            ]);
          } else {
            return Promise.reject(new Error("Wrong path"));
          }
        }, "readdir")
      };
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          let reportedResults;
          if (options.folder.fsPath === rootFolderA.fsPath) {
            reportedResults = [
              makeTextResult(rootFolderA, "folder/fileA.scss"),
              makeTextResult(rootFolderA, "folder/fileA.css"),
              makeTextResult(rootFolderA, "folder/file2.css")
            ];
          } else {
            reportedResults = [
              makeTextResult(rootFolderB, "fileB.ts"),
              makeTextResult(rootFolderB, "fileB.js"),
              makeTextResult(rootFolderB, "file3.js")
            ];
          }
          reportedResults.forEach((r) => progress.report(r));
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        excludePattern: {
          "*.js": {
            when: "$(basename).ts"
          },
          "*.css": true
        },
        folderQueries: [
          {
            folder: rootFolderA,
            excludePattern: [{
              pattern: {
                "folder/*.css": {
                  when: "$(basename).scss"
                }
              }
            }]
          },
          {
            folder: rootFolderB,
            excludePattern: [{
              pattern: {
                "*.js": false
              }
            }]
          }
        ]
      };
      const { results } = await runTextSearch(query);
      assertResults(results, [
        makeTextResult(rootFolderA, "folder/fileA.scss"),
        makeTextResult(rootFolderA, "folder/file2.css"),
        makeTextResult(rootFolderB, "fileB.ts"),
        makeTextResult(rootFolderB, "fileB.js"),
        makeTextResult(rootFolderB, "file3.js")
      ]);
    });
    test("include pattern applied", async () => {
      const providedResults = [
        makeTextResult(rootFolderA, "file1.js"),
        makeTextResult(rootFolderA, "file1.ts")
      ];
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          providedResults.forEach((r) => progress.report(r));
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        includePattern: {
          "*.ts": true
        },
        folderQueries: [
          { folder: rootFolderA }
        ]
      };
      const { results } = await runTextSearch(query);
      assertResults(results, providedResults.slice(1));
    });
    test("max results = 1", async () => {
      const providedResults = [
        makeTextResult(rootFolderA, "file1.ts"),
        makeTextResult(rootFolderA, "file2.ts")
      ];
      let wasCanceled = false;
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          disposables.add(token.onCancellationRequested(() => wasCanceled = true));
          providedResults.forEach((r) => progress.report(r));
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        maxResults: 1,
        folderQueries: [
          { folder: rootFolderA }
        ]
      };
      const { results, stats } = await runTextSearch(query);
      assert(stats.limitHit, "Expected to return limitHit");
      assertResults(results, providedResults.slice(0, 1));
      assert(wasCanceled, "Expected to be canceled");
    });
    test("max results = 2", async () => {
      const providedResults = [
        makeTextResult(rootFolderA, "file1.ts"),
        makeTextResult(rootFolderA, "file2.ts"),
        makeTextResult(rootFolderA, "file3.ts")
      ];
      let wasCanceled = false;
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          disposables.add(token.onCancellationRequested(() => wasCanceled = true));
          providedResults.forEach((r) => progress.report(r));
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        maxResults: 2,
        folderQueries: [
          { folder: rootFolderA }
        ]
      };
      const { results, stats } = await runTextSearch(query);
      assert(stats.limitHit, "Expected to return limitHit");
      assertResults(results, providedResults.slice(0, 2));
      assert(wasCanceled, "Expected to be canceled");
    });
    test("provider returns maxResults exactly", async () => {
      const providedResults = [
        makeTextResult(rootFolderA, "file1.ts"),
        makeTextResult(rootFolderA, "file2.ts")
      ];
      let wasCanceled = false;
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          disposables.add(token.onCancellationRequested(() => wasCanceled = true));
          providedResults.forEach((r) => progress.report(r));
          return Promise.resolve(null);
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        maxResults: 2,
        folderQueries: [
          { folder: rootFolderA }
        ]
      };
      const { results, stats } = await runTextSearch(query);
      assert(!stats.limitHit, "Expected not to return limitHit");
      assertResults(results, providedResults);
      assert(!wasCanceled, "Expected not to be canceled");
    });
    test("provider returns early with limitHit", async () => {
      const providedResults = [
        makeTextResult(rootFolderA, "file1.ts"),
        makeTextResult(rootFolderA, "file2.ts"),
        makeTextResult(rootFolderA, "file3.ts")
      ];
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          providedResults.forEach((r) => progress.report(r));
          return Promise.resolve({ limitHit: true });
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        maxResults: 1e3,
        folderQueries: [
          { folder: rootFolderA }
        ]
      };
      const { results, stats } = await runTextSearch(query);
      assert(stats.limitHit, "Expected to return limitHit");
      assertResults(results, providedResults);
    });
    test("multiroot max results", async () => {
      let cancels = 0;
      await registerTestTextSearchProvider({
        async provideTextSearchResults(query2, options, progress, token) {
          disposables.add(token.onCancellationRequested(() => cancels++));
          await new Promise((r) => process.nextTick(r));
          [
            "file1.ts",
            "file2.ts",
            "file3.ts"
          ].forEach((f) => progress.report(makeTextResult(options.folder, f)));
          return null;
        }
      });
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        maxResults: 2,
        folderQueries: [
          { folder: rootFolderA },
          { folder: rootFolderB }
        ]
      };
      const { results } = await runTextSearch(query);
      assert.strictEqual(results.length, 2);
      assert.strictEqual(cancels, 2);
    });
    test("works with non-file schemes", async () => {
      const providedResults = [
        makeTextResult(fancySchemeFolderA, "file1.ts"),
        makeTextResult(fancySchemeFolderA, "file2.ts"),
        makeTextResult(fancySchemeFolderA, "file3.ts")
      ];
      await registerTestTextSearchProvider({
        provideTextSearchResults(query2, options, progress, token) {
          providedResults.forEach((r) => progress.report(r));
          return Promise.resolve(null);
        }
      }, fancyScheme);
      const query = {
        type: QueryType.Text,
        contentPattern: getPattern("foo"),
        folderQueries: [
          { folder: fancySchemeFolderA }
        ]
      };
      const { results } = await runTextSearch(query);
      assertResults(results, providedResults);
    });
  });
});
//# sourceMappingURL=extHostSearch.test.js.map
