var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as sinon from "sinon";
import * as arrays from "../../../../../base/common/arrays.js";
import { DeferredPromise, timeout } from "../../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ModelService } from "../../../../../editor/common/services/modelService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IAITextQuery, IFileMatch, IFileQuery, IFileSearchStats, IFolderQuery, ISearchComplete, ISearchProgressItem, ISearchQuery, ISearchService, ITextQuery, ITextSearchMatch, OneLineRange, QueryType, TextSearchMatch } from "../../../../services/search/common/search.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../../../platform/telemetry/common/telemetryUtils.js";
import { CellMatch, MatchInNotebook, SearchModel } from "../../browser/searchModel.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../../../platform/theme/test/common/testThemeService.js";
import { FileService } from "../../../../../platform/files/common/fileService.js";
import { ILogService, NullLogService } from "../../../../../platform/log/common/log.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { INotebookEditorService } from "../../../notebook/browser/services/notebookEditorService.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { TestEditorGroupsService, TestEditorService } from "../../../../test/browser/workbenchTestServices.js";
import { NotebookEditorWidgetService } from "../../../notebook/browser/services/notebookEditorServiceImpl.js";
import { createFileUriFromPathFromRoot, getRootName } from "./searchTestCommon.js";
import { INotebookCellMatchWithModel, INotebookFileMatchWithModel, contentMatchesToTextSearchMatches, webviewMatchesToTextSearchMatches } from "../../browser/notebookSearch/searchNotebookHelpers.js";
import { CellKind } from "../../../notebook/common/notebookCommon.js";
import { ICellViewModel } from "../../../notebook/browser/notebookBrowser.js";
import { FindMatch, IReadonlyTextBuffer } from "../../../../../editor/common/model.js";
import { ResourceMap, ResourceSet } from "../../../../../base/common/map.js";
import { INotebookService } from "../../../notebook/common/notebookService.js";
import { INotebookSearchService } from "../../common/notebookSearch.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
const nullEvent = new class {
  id = -1;
  topic;
  name;
  description;
  data;
  startTime;
  stopTime;
  stop() {
    return;
  }
  timeTaken() {
    return -1;
  }
}();
const lineOneRange = new OneLineRange(1, 0, 1);
suite("SearchModel", () => {
  let instantiationService;
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  const testSearchStats = {
    fromCache: false,
    resultCount: 1,
    type: "searchProcess",
    detailStats: {
      fileWalkTime: 0,
      cmdTime: 0,
      cmdResultCount: 0,
      directoriesWalked: 2,
      filesWalked: 3
    }
  };
  const folderQueries = [
    { folder: createFileUriFromPathFromRoot() }
  ];
  setup(() => {
    instantiationService = new TestInstantiationService();
    instantiationService.stub(ITelemetryService, NullTelemetryService);
    instantiationService.stub(ILabelService, { getUriBasenameLabel: /* @__PURE__ */ __name((uri) => "", "getUriBasenameLabel") });
    instantiationService.stub(INotebookService, { getNotebookTextModels: /* @__PURE__ */ __name(() => [], "getNotebookTextModels") });
    instantiationService.stub(IModelService, stubModelService(instantiationService));
    instantiationService.stub(INotebookEditorService, stubNotebookEditorService(instantiationService));
    instantiationService.stub(ISearchService, {});
    instantiationService.stub(ISearchService, "textSearch", Promise.resolve({ results: [] }));
    const fileService = new FileService(new NullLogService());
    store.add(fileService);
    const uriIdentityService = new UriIdentityService(fileService);
    store.add(uriIdentityService);
    instantiationService.stub(IUriIdentityService, uriIdentityService);
    instantiationService.stub(ILogService, new NullLogService());
  });
  teardown(() => sinon.restore());
  function searchServiceWithResults(results, complete = null) {
    return {
      textSearch(query, token, onProgress, notebookURIs) {
        return new Promise((resolve) => {
          queueMicrotask(() => {
            results.forEach(onProgress);
            resolve(complete);
          });
        });
      },
      fileSearch(query, token) {
        return new Promise((resolve) => {
          queueMicrotask(() => {
            resolve({ results, messages: [] });
          });
        });
      },
      aiTextSearch(query, token, onProgress, notebookURIs) {
        return new Promise((resolve) => {
          queueMicrotask(() => {
            results.forEach(onProgress);
            resolve(complete);
          });
        });
      },
      textSearchSplitSyncAsync(query, token, onProgress) {
        return {
          syncResults: {
            results: [],
            messages: []
          },
          asyncResults: new Promise((resolve) => {
            queueMicrotask(() => {
              results.forEach(onProgress);
              resolve(complete);
            });
          })
        };
      }
    };
  }
  __name(searchServiceWithResults, "searchServiceWithResults");
  function searchServiceWithError(error) {
    return {
      textSearch(query, token, onProgress) {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      },
      fileSearch(query, token) {
        return new Promise((resolve, reject) => {
          queueMicrotask(() => {
            reject(error);
          });
        });
      },
      aiTextSearch(query, token, onProgress, notebookURIs) {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      },
      textSearchSplitSyncAsync(query, token, onProgress) {
        return {
          syncResults: {
            results: [],
            messages: []
          },
          asyncResults: new Promise((resolve, reject) => {
            reject(error);
          })
        };
      }
    };
  }
  __name(searchServiceWithError, "searchServiceWithError");
  function canceleableSearchService(tokenSource) {
    return {
      textSearch(query, token, onProgress) {
        const disposable = token?.onCancellationRequested(() => tokenSource.cancel());
        if (disposable) {
          store.add(disposable);
        }
        return this.textSearchSplitSyncAsync(query, token, onProgress).asyncResults;
      },
      fileSearch(query, token) {
        const disposable = token?.onCancellationRequested(() => tokenSource.cancel());
        if (disposable) {
          store.add(disposable);
        }
        return new Promise((resolve) => {
          queueMicrotask(() => {
            resolve({});
          });
        });
      },
      aiTextSearch(query, token, onProgress, notebookURIs) {
        const disposable = token?.onCancellationRequested(() => tokenSource.cancel());
        if (disposable) {
          store.add(disposable);
        }
        return Promise.resolve({
          results: [],
          messages: []
        });
      },
      textSearchSplitSyncAsync(query, token, onProgress) {
        const disposable = token?.onCancellationRequested(() => tokenSource.cancel());
        if (disposable) {
          store.add(disposable);
        }
        return {
          syncResults: {
            results: [],
            messages: []
          },
          asyncResults: new Promise((resolve) => {
            queueMicrotask(() => {
              resolve({
                results: [],
                messages: []
              });
            });
          })
        };
      }
    };
  }
  __name(canceleableSearchService, "canceleableSearchService");
  function searchServiceWithDeferredPromise(p) {
    return {
      textSearchSplitSyncAsync(query, token, onProgress) {
        return {
          syncResults: {
            results: [],
            messages: []
          },
          asyncResults: p
        };
      }
    };
  }
  __name(searchServiceWithDeferredPromise, "searchServiceWithDeferredPromise");
  function notebookSearchServiceWithInfo(results, tokenSource) {
    return {
      _serviceBrand: void 0,
      notebookSearch(query, token, searchInstanceID, onProgress) {
        const disposable = token?.onCancellationRequested(() => tokenSource?.cancel());
        if (disposable) {
          store.add(disposable);
        }
        const localResults = new ResourceMap((uri) => uri.path);
        results.forEach((r) => {
          localResults.set(r.resource, r);
        });
        if (onProgress) {
          arrays.coalesce([...localResults.values()]).forEach(onProgress);
        }
        return {
          openFilesToScan: new ResourceSet([...localResults.keys()]),
          completeData: Promise.resolve({
            messages: [],
            results: arrays.coalesce([...localResults.values()]),
            limitHit: false
          }),
          allScannedFiles: Promise.resolve(new ResourceSet())
        };
      }
    };
  }
  __name(notebookSearchServiceWithInfo, "notebookSearchServiceWithInfo");
  test("Search Model: Search adds to results", async () => {
    const results = [
      aRawMatch(
        "/1",
        new TextSearchMatch("preview 1", new OneLineRange(1, 1, 4)),
        new TextSearchMatch("preview 1", new OneLineRange(1, 4, 11))
      ),
      aRawMatch("/2", new TextSearchMatch("preview 2", lineOneRange))
    ];
    instantiationService.stub(ISearchService, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
    instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([], void 0));
    const testObject = instantiationService.createInstance(SearchModel);
    store.add(testObject);
    await testObject.search({ contentPattern: { pattern: "somestring" }, type: QueryType.Text, folderQueries }).asyncResults;
    const actual = testObject.searchResult.matches();
    assert.strictEqual(2, actual.length);
    assert.strictEqual(URI.file(`${getRootName()}/1`).toString(), actual[0].resource.toString());
    let actuaMatches = actual[0].matches();
    assert.strictEqual(2, actuaMatches.length);
    assert.strictEqual("preview 1", actuaMatches[0].text());
    assert.ok(new Range(2, 2, 2, 5).equalsRange(actuaMatches[0].range()));
    assert.strictEqual("preview 1", actuaMatches[1].text());
    assert.ok(new Range(2, 5, 2, 12).equalsRange(actuaMatches[1].range()));
    actuaMatches = actual[1].matches();
    assert.strictEqual(1, actuaMatches.length);
    assert.strictEqual("preview 2", actuaMatches[0].text());
    assert.ok(new Range(2, 1, 2, 2).equalsRange(actuaMatches[0].range()));
  });
  test("Search Model: Search can return notebook results", async () => {
    const results = [
      aRawMatch(
        "/2",
        new TextSearchMatch("test", new OneLineRange(1, 1, 5)),
        new TextSearchMatch("this is a test", new OneLineRange(1, 11, 15))
      ),
      aRawMatch("/3", new TextSearchMatch("test", lineOneRange))
    ];
    instantiationService.stub(ISearchService, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
    sinon.stub(CellMatch.prototype, "addContext");
    const mdInputCell = {
      cellKind: CellKind.Markup,
      textBuffer: {
        getLineContent(lineNumber) {
          if (lineNumber === 1) {
            return "# Test";
          } else {
            return "";
          }
        }
      },
      id: "mdInputCell"
    };
    const findMatchMds = [new FindMatch(new Range(1, 3, 1, 7), ["Test"])];
    const codeCell = {
      cellKind: CellKind.Code,
      textBuffer: {
        getLineContent(lineNumber) {
          if (lineNumber === 1) {
            return 'print("test! testing!!")';
          } else {
            return "";
          }
        }
      },
      id: "codeCell"
    };
    const findMatchCodeCells = [
      new FindMatch(new Range(1, 8, 1, 12), ["test"]),
      new FindMatch(new Range(1, 14, 1, 18), ["test"])
    ];
    const webviewMatches = [
      {
        index: 0,
        searchPreviewInfo: {
          line: "test! testing!!",
          range: {
            start: 1,
            end: 5
          }
        }
      },
      {
        index: 1,
        searchPreviewInfo: {
          line: "test! testing!!",
          range: {
            start: 7,
            end: 11
          }
        }
      }
    ];
    const cellMatchMd = {
      cell: mdInputCell,
      index: 0,
      contentResults: contentMatchesToTextSearchMatches(findMatchMds, mdInputCell),
      webviewResults: []
    };
    const cellMatchCode = {
      cell: codeCell,
      index: 1,
      contentResults: contentMatchesToTextSearchMatches(findMatchCodeCells, codeCell),
      webviewResults: webviewMatchesToTextSearchMatches(webviewMatches)
    };
    const notebookSearchService = instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([aRawMatchWithCells("/1", cellMatchMd, cellMatchCode)], void 0));
    const notebookSearch = sinon.spy(notebookSearchService, "notebookSearch");
    const model = instantiationService.createInstance(SearchModel);
    store.add(model);
    await model.search({ contentPattern: { pattern: "test" }, type: QueryType.Text, folderQueries }).asyncResults;
    const actual = model.searchResult.matches();
    assert(notebookSearch.calledOnce);
    assert.strictEqual(3, actual.length);
    assert.strictEqual(URI.file(`${getRootName()}/1`).toString(), actual[0].resource.toString());
    const notebookFileMatches = actual[0].matches();
    assert.ok(notebookFileMatches[0].range().equalsRange(new Range(1, 3, 1, 7)));
    assert.ok(notebookFileMatches[1].range().equalsRange(new Range(1, 8, 1, 12)));
    assert.ok(notebookFileMatches[2].range().equalsRange(new Range(1, 14, 1, 18)));
    assert.ok(notebookFileMatches[3].range().equalsRange(new Range(1, 2, 1, 6)));
    assert.ok(notebookFileMatches[4].range().equalsRange(new Range(1, 8, 1, 12)));
    notebookFileMatches.forEach((match) => match instanceof MatchInNotebook);
    assert(notebookFileMatches[0].cell?.id === "mdInputCell");
    assert(notebookFileMatches[1].cell?.id === "codeCell");
    assert(notebookFileMatches[2].cell?.id === "codeCell");
    assert(notebookFileMatches[3].cell?.id === "codeCell");
    assert(notebookFileMatches[4].cell?.id === "codeCell");
    const mdCellMatchProcessed = notebookFileMatches[0].cellParent;
    const codeCellMatchProcessed = notebookFileMatches[1].cellParent;
    assert(mdCellMatchProcessed.contentMatches.length === 1);
    assert(codeCellMatchProcessed.contentMatches.length === 2);
    assert(codeCellMatchProcessed.webviewMatches.length === 2);
    assert(mdCellMatchProcessed.contentMatches[0] === notebookFileMatches[0]);
    assert(codeCellMatchProcessed.contentMatches[0] === notebookFileMatches[1]);
    assert(codeCellMatchProcessed.contentMatches[1] === notebookFileMatches[2]);
    assert(codeCellMatchProcessed.webviewMatches[0] === notebookFileMatches[3]);
    assert(codeCellMatchProcessed.webviewMatches[1] === notebookFileMatches[4]);
    assert.strictEqual(URI.file(`${getRootName()}/2`).toString(), actual[1].resource.toString());
    assert.strictEqual(URI.file(`${getRootName()}/3`).toString(), actual[2].resource.toString());
  });
  test("Search Model: Search reports telemetry on search completed", async () => {
    const target = instantiationService.spy(ITelemetryService, "publicLog");
    const results = [
      aRawMatch(
        "/1",
        new TextSearchMatch("preview 1", new OneLineRange(1, 1, 4)),
        new TextSearchMatch("preview 1", new OneLineRange(1, 4, 11))
      ),
      aRawMatch(
        "/2",
        new TextSearchMatch("preview 2", lineOneRange)
      )
    ];
    instantiationService.stub(ISearchService, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
    instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([], void 0));
    const testObject = instantiationService.createInstance(SearchModel);
    store.add(testObject);
    await testObject.search({ contentPattern: { pattern: "somestring" }, type: QueryType.Text, folderQueries }).asyncResults;
    assert.ok(target.calledThrice);
    assert.ok(target.calledWith("searchResultsFirstRender"));
    assert.ok(target.calledWith("searchResultsFinished"));
  });
  test("Search Model: Search reports timed telemetry on search when progress is not called", () => {
    const target2 = sinon.spy();
    sinon.stub(nullEvent, "stop").callsFake(target2);
    const target1 = sinon.stub().returns(nullEvent);
    instantiationService.stub(ITelemetryService, "publicLog", target1);
    instantiationService.stub(ISearchService, searchServiceWithResults([], { limitHit: false, messages: [], results: [] }));
    instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([], void 0));
    const testObject = instantiationService.createInstance(SearchModel);
    store.add(testObject);
    const result = testObject.search({ contentPattern: { pattern: "somestring" }, type: QueryType.Text, folderQueries }).asyncResults;
    return result.then(() => {
      return timeout(1).then(() => {
        assert.ok(target1.calledWith("searchResultsFirstRender"));
        assert.ok(target1.calledWith("searchResultsFinished"));
      });
    });
  });
  test("Search Model: Search reports timed telemetry on search when progress is called", () => {
    const target2 = sinon.spy();
    sinon.stub(nullEvent, "stop").callsFake(target2);
    const target1 = sinon.stub().returns(nullEvent);
    instantiationService.stub(ITelemetryService, "publicLog", target1);
    instantiationService.stub(ISearchService, searchServiceWithResults(
      [aRawMatch("/1", new TextSearchMatch("some preview", lineOneRange))],
      { results: [], stats: testSearchStats, messages: [] }
    ));
    instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([], void 0));
    const testObject = instantiationService.createInstance(SearchModel);
    store.add(testObject);
    const result = testObject.search({ contentPattern: { pattern: "somestring" }, type: QueryType.Text, folderQueries }).asyncResults;
    return result.then(() => {
      return timeout(1).then(() => {
        assert.ok(target1.calledWith("searchResultsFirstRender"));
        assert.ok(target1.calledWith("searchResultsFinished"));
      });
    });
  });
  test("Search Model: Search reports timed telemetry on search when error is called", () => {
    const target2 = sinon.spy();
    sinon.stub(nullEvent, "stop").callsFake(target2);
    const target1 = sinon.stub().returns(nullEvent);
    instantiationService.stub(ITelemetryService, "publicLog", target1);
    instantiationService.stub(ISearchService, searchServiceWithError(new Error("This error should be thrown by this test.")));
    instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([], void 0));
    const testObject = instantiationService.createInstance(SearchModel);
    store.add(testObject);
    const result = testObject.search({ contentPattern: { pattern: "somestring" }, type: QueryType.Text, folderQueries }).asyncResults;
    return result.then(() => {
    }, () => {
      return timeout(1).then(() => {
        assert.ok(target1.calledWith("searchResultsFirstRender"));
        assert.ok(target1.calledWith("searchResultsFinished"));
      });
    });
  });
  test("Search Model: Search reports timed telemetry on search when error is cancelled error", () => {
    const target2 = sinon.spy();
    sinon.stub(nullEvent, "stop").callsFake(target2);
    const target1 = sinon.stub().returns(nullEvent);
    instantiationService.stub(ITelemetryService, "publicLog", target1);
    const deferredPromise = new DeferredPromise();
    instantiationService.stub(ISearchService, searchServiceWithDeferredPromise(deferredPromise.p));
    instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([], void 0));
    const testObject = instantiationService.createInstance(SearchModel);
    store.add(testObject);
    const result = testObject.search({ contentPattern: { pattern: "somestring" }, type: QueryType.Text, folderQueries }).asyncResults;
    deferredPromise.cancel();
    return result.then(() => {
    }, async () => {
      return timeout(1).then(() => {
        assert.ok(target1.calledWith("searchResultsFirstRender"));
        assert.ok(target1.calledWith("searchResultsFinished"));
      });
    });
  });
  test("Search Model: Search results are cleared during search", async () => {
    const results = [
      aRawMatch(
        "/1",
        new TextSearchMatch("preview 1", new OneLineRange(1, 1, 4)),
        new TextSearchMatch("preview 1", new OneLineRange(1, 4, 11))
      ),
      aRawMatch(
        "/2",
        new TextSearchMatch("preview 2", lineOneRange)
      )
    ];
    instantiationService.stub(ISearchService, searchServiceWithResults(results, { limitHit: false, messages: [], results: [] }));
    instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([], void 0));
    const testObject = instantiationService.createInstance(SearchModel);
    store.add(testObject);
    await testObject.search({ contentPattern: { pattern: "somestring" }, type: QueryType.Text, folderQueries }).asyncResults;
    assert.ok(!testObject.searchResult.isEmpty());
    instantiationService.stub(ISearchService, searchServiceWithResults([]));
    testObject.search({ contentPattern: { pattern: "somestring" }, type: QueryType.Text, folderQueries });
    assert.ok(testObject.searchResult.isEmpty());
  });
  test("Search Model: Previous search is cancelled when new search is called", async () => {
    const tokenSource = new CancellationTokenSource();
    store.add(tokenSource);
    instantiationService.stub(ISearchService, canceleableSearchService(tokenSource));
    instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([], tokenSource));
    const testObject = instantiationService.createInstance(SearchModel);
    store.add(testObject);
    testObject.search({ contentPattern: { pattern: "somestring" }, type: QueryType.Text, folderQueries });
    instantiationService.stub(ISearchService, searchServiceWithResults([]));
    instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([], void 0));
    testObject.search({ contentPattern: { pattern: "somestring" }, type: QueryType.Text, folderQueries });
    assert.ok(tokenSource.token.isCancellationRequested);
  });
  test("getReplaceString returns proper replace string for regExpressions", async () => {
    const results = [
      aRawMatch(
        "/1",
        new TextSearchMatch("preview 1", new OneLineRange(1, 1, 4)),
        new TextSearchMatch("preview 1", new OneLineRange(1, 4, 11))
      )
    ];
    instantiationService.stub(ISearchService, searchServiceWithResults(results, { limitHit: false, messages: [], results }));
    instantiationService.stub(INotebookSearchService, notebookSearchServiceWithInfo([], void 0));
    const testObject = instantiationService.createInstance(SearchModel);
    store.add(testObject);
    await testObject.search({ contentPattern: { pattern: "re" }, type: QueryType.Text, folderQueries }).asyncResults;
    testObject.replaceString = "hello";
    let match = testObject.searchResult.matches()[0].matches()[0];
    assert.strictEqual("hello", match.replaceString);
    await testObject.search({ contentPattern: { pattern: "re", isRegExp: true }, type: QueryType.Text, folderQueries }).asyncResults;
    match = testObject.searchResult.matches()[0].matches()[0];
    assert.strictEqual("hello", match.replaceString);
    await testObject.search({ contentPattern: { pattern: "re(?:vi)", isRegExp: true }, type: QueryType.Text, folderQueries }).asyncResults;
    match = testObject.searchResult.matches()[0].matches()[0];
    assert.strictEqual("hello", match.replaceString);
    await testObject.search({ contentPattern: { pattern: "r(e)(?:vi)", isRegExp: true }, type: QueryType.Text, folderQueries }).asyncResults;
    match = testObject.searchResult.matches()[0].matches()[0];
    assert.strictEqual("hello", match.replaceString);
    await testObject.search({ contentPattern: { pattern: "r(e)(?:vi)", isRegExp: true }, type: QueryType.Text, folderQueries }).asyncResults;
    testObject.replaceString = "hello$1";
    match = testObject.searchResult.matches()[0].matches()[0];
    assert.strictEqual("helloe", match.replaceString);
  });
  function aRawMatch(resource, ...results) {
    return { resource: createFileUriFromPathFromRoot(resource), results };
  }
  __name(aRawMatch, "aRawMatch");
  function aRawMatchWithCells(resource, ...cells) {
    return { resource: createFileUriFromPathFromRoot(resource), cellResults: cells };
  }
  __name(aRawMatchWithCells, "aRawMatchWithCells");
  function stubModelService(instantiationService2) {
    instantiationService2.stub(IThemeService, new TestThemeService());
    const config = new TestConfigurationService();
    config.setUserConfiguration("search", { searchOnType: true });
    instantiationService2.stub(IConfigurationService, config);
    const modelService = instantiationService2.createInstance(ModelService);
    store.add(modelService);
    return modelService;
  }
  __name(stubModelService, "stubModelService");
  function stubNotebookEditorService(instantiationService2) {
    instantiationService2.stub(IEditorGroupsService, new TestEditorGroupsService());
    instantiationService2.stub(IContextKeyService, new MockContextKeyService());
    instantiationService2.stub(IEditorService, store.add(new TestEditorService()));
    const notebookEditorWidgetService = instantiationService2.createInstance(NotebookEditorWidgetService);
    store.add(notebookEditorWidgetService);
    return notebookEditorWidgetService;
  }
  __name(stubNotebookEditorService, "stubNotebookEditorService");
});
//# sourceMappingURL=searchModel.test.js.map
