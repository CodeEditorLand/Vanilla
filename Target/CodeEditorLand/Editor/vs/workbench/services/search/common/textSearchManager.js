var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isThenable } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { Schemas } from "../../../../base/common/network.js";
import * as path from "../../../../base/common/path.js";
import * as resources from "../../../../base/common/resources.js";
import { TernarySearchTree } from "../../../../base/common/ternarySearchTree.js";
import { URI } from "../../../../base/common/uri.js";
import { DEFAULT_MAX_SEARCH_RESULTS, hasSiblingPromiseFn, IAITextQuery, IExtendedExtensionSearchOptions, IFileMatch, IFolderQuery, excludeToGlobPattern, IPatternInfo, ISearchCompleteStats, ITextQuery, ITextSearchContext, ITextSearchMatch, ITextSearchResult, ITextSearchStats, QueryGlobTester, QueryType, resolvePatternsForProvider, ISearchRange, DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS } from "./search.js";
import { AITextSearchProviderNew, TextSearchCompleteNew, TextSearchMatchNew, TextSearchProviderFolderOptions, TextSearchProviderNew, TextSearchProviderOptions, TextSearchQueryNew, TextSearchResultNew } from "./searchExtTypes.js";
class TextSearchManager {
  constructor(queryProviderPair, fileUtils, processType) {
    this.queryProviderPair = queryProviderPair;
    this.fileUtils = fileUtils;
    this.processType = processType;
  }
  static {
    __name(this, "TextSearchManager");
  }
  collector = null;
  isLimitHit = false;
  resultCount = 0;
  get query() {
    return this.queryProviderPair.query;
  }
  search(onProgress, token) {
    const folderQueries = this.query.folderQueries || [];
    const tokenSource = new CancellationTokenSource(token);
    return new Promise((resolve, reject) => {
      this.collector = new TextSearchResultsCollector(onProgress);
      let isCanceled = false;
      const onResult = /* @__PURE__ */ __name((result, folderIdx) => {
        if (isCanceled) {
          return;
        }
        if (!this.isLimitHit) {
          const resultSize = this.resultSize(result);
          if (result instanceof TextSearchMatchNew && typeof this.query.maxResults === "number" && this.resultCount + resultSize > this.query.maxResults) {
            this.isLimitHit = true;
            isCanceled = true;
            tokenSource.cancel();
            result = this.trimResultToSize(result, this.query.maxResults - this.resultCount);
          }
          const newResultSize = this.resultSize(result);
          this.resultCount += newResultSize;
          const a = result instanceof TextSearchMatchNew;
          if (newResultSize > 0 || !a) {
            this.collector.add(result, folderIdx);
          }
        }
      }, "onResult");
      this.doSearch(folderQueries, onResult, tokenSource.token).then((result) => {
        tokenSource.dispose();
        this.collector.flush();
        resolve({
          limitHit: this.isLimitHit || result?.limitHit,
          messages: this.getMessagesFromResults(result),
          stats: {
            type: this.processType
          }
        });
      }, (err) => {
        tokenSource.dispose();
        const errMsg = toErrorMessage(err);
        reject(new Error(errMsg));
      });
    });
  }
  getMessagesFromResults(result) {
    if (!result?.message) {
      return [];
    }
    if (Array.isArray(result.message)) {
      return result.message;
    }
    return [result.message];
  }
  resultSize(result) {
    if (result instanceof TextSearchMatchNew) {
      return Array.isArray(result.ranges) ? result.ranges.length : 1;
    } else {
      return 0;
    }
  }
  trimResultToSize(result, size) {
    return new TextSearchMatchNew(result.uri, result.ranges.slice(0, size), result.previewText);
  }
  async doSearch(folderQueries, onResult, token) {
    const folderMappings = TernarySearchTree.forUris();
    folderQueries.forEach((fq, i) => {
      const queryTester = new QueryGlobTester(this.query, fq);
      folderMappings.set(fq.folder, { queryTester, folder: fq.folder, folderIdx: i });
    });
    const testingPs = [];
    const progress = {
      report: /* @__PURE__ */ __name((result2) => {
        if (result2.uri === void 0) {
          throw Error("Text search result URI is undefined. Please check provider implementation.");
        }
        const folderQuery = folderMappings.findSubstr(result2.uri);
        const hasSibling = folderQuery.folder.scheme === Schemas.file ? hasSiblingPromiseFn(() => {
          return this.fileUtils.readdir(resources.dirname(result2.uri));
        }) : void 0;
        const relativePath = resources.relativePath(folderQuery.folder, result2.uri);
        if (relativePath) {
          const included = folderQuery.queryTester.includedInQuery(relativePath, path.basename(relativePath), hasSibling);
          if (isThenable(included)) {
            testingPs.push(
              included.then((isIncluded) => {
                if (isIncluded) {
                  onResult(result2, folderQuery.folderIdx);
                }
              })
            );
          } else if (included) {
            onResult(result2, folderQuery.folderIdx);
          }
        }
      }, "report")
    };
    const folderOptions = folderQueries.map((fq) => this.getSearchOptionsForFolder(fq));
    const searchOptions = {
      folderOptions,
      maxFileSize: this.query.maxFileSize,
      maxResults: this.query.maxResults ?? DEFAULT_MAX_SEARCH_RESULTS,
      previewOptions: this.query.previewOptions ?? DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS,
      surroundingContext: this.query.surroundingContext ?? 0
    };
    if ("usePCRE2" in this.query) {
      searchOptions.usePCRE2 = this.query.usePCRE2;
    }
    let result;
    if (this.queryProviderPair.query.type === QueryType.aiText) {
      result = await this.queryProviderPair.provider.provideAITextSearchResults(this.queryProviderPair.query.contentPattern, searchOptions, progress, token);
    } else {
      result = await this.queryProviderPair.provider.provideTextSearchResults(patternInfoToQuery(this.queryProviderPair.query.contentPattern), searchOptions, progress, token);
    }
    if (testingPs.length) {
      await Promise.all(testingPs);
    }
    return result;
  }
  getSearchOptionsForFolder(fq) {
    const includes = resolvePatternsForProvider(this.query.includePattern, fq.includePattern);
    let excludePattern = fq.excludePattern?.map((e) => ({
      folder: e.folder,
      patterns: resolvePatternsForProvider(this.query.excludePattern, e.pattern)
    }));
    if (!excludePattern || excludePattern.length === 0) {
      excludePattern = [{
        folder: void 0,
        patterns: resolvePatternsForProvider(this.query.excludePattern, void 0)
      }];
    }
    const excludes = excludeToGlobPattern(excludePattern);
    const options = {
      folder: URI.from(fq.folder),
      excludes,
      includes,
      useIgnoreFiles: {
        local: !fq.disregardIgnoreFiles,
        parent: !fq.disregardParentIgnoreFiles,
        global: !fq.disregardGlobalIgnoreFiles
      },
      followSymlinks: !fq.ignoreSymlinks,
      encoding: (fq.fileEncoding && this.fileUtils.toCanonicalName(fq.fileEncoding)) ?? ""
    };
    return options;
  }
}
function patternInfoToQuery(patternInfo) {
  return {
    isCaseSensitive: patternInfo.isCaseSensitive || false,
    isRegExp: patternInfo.isRegExp || false,
    isWordMatch: patternInfo.isWordMatch || false,
    isMultiline: patternInfo.isMultiline || false,
    pattern: patternInfo.pattern
  };
}
__name(patternInfoToQuery, "patternInfoToQuery");
class TextSearchResultsCollector {
  constructor(_onResult) {
    this._onResult = _onResult;
    this._batchedCollector = new BatchedCollector(512, (items) => this.sendItems(items));
  }
  static {
    __name(this, "TextSearchResultsCollector");
  }
  _batchedCollector;
  _currentFolderIdx = -1;
  _currentUri;
  _currentFileMatch = null;
  add(data, folderIdx) {
    if (this._currentFileMatch && (this._currentFolderIdx !== folderIdx || !resources.isEqual(this._currentUri, data.uri))) {
      this.pushToCollector();
      this._currentFileMatch = null;
    }
    if (!this._currentFileMatch) {
      this._currentFolderIdx = folderIdx;
      this._currentFileMatch = {
        resource: data.uri,
        results: []
      };
    }
    this._currentFileMatch.results.push(extensionResultToFrontendResult(data));
  }
  pushToCollector() {
    const size = this._currentFileMatch && this._currentFileMatch.results ? this._currentFileMatch.results.length : 0;
    this._batchedCollector.addItem(this._currentFileMatch, size);
  }
  flush() {
    this.pushToCollector();
    this._batchedCollector.flush();
  }
  sendItems(items) {
    this._onResult(items);
  }
}
function extensionResultToFrontendResult(data) {
  if (data instanceof TextSearchMatchNew) {
    return {
      previewText: data.previewText,
      rangeLocations: data.ranges.map((r) => ({
        preview: {
          startLineNumber: r.previewRange.start.line,
          startColumn: r.previewRange.start.character,
          endLineNumber: r.previewRange.end.line,
          endColumn: r.previewRange.end.character
        },
        source: {
          startLineNumber: r.sourceRange.start.line,
          startColumn: r.sourceRange.start.character,
          endLineNumber: r.sourceRange.end.line,
          endColumn: r.sourceRange.end.character
        }
      }))
    };
  } else {
    return {
      text: data.text,
      lineNumber: data.lineNumber
    };
  }
}
__name(extensionResultToFrontendResult, "extensionResultToFrontendResult");
class BatchedCollector {
  constructor(maxBatchSize, cb) {
    this.maxBatchSize = maxBatchSize;
    this.cb = cb;
  }
  static {
    __name(this, "BatchedCollector");
  }
  static TIMEOUT = 4e3;
  // After START_BATCH_AFTER_COUNT items have been collected, stop flushing on timeout
  static START_BATCH_AFTER_COUNT = 50;
  totalNumberCompleted = 0;
  batch = [];
  batchSize = 0;
  timeoutHandle;
  addItem(item, size) {
    if (!item) {
      return;
    }
    this.addItemToBatch(item, size);
  }
  addItems(items, size) {
    if (!items) {
      return;
    }
    this.addItemsToBatch(items, size);
  }
  addItemToBatch(item, size) {
    this.batch.push(item);
    this.batchSize += size;
    this.onUpdate();
  }
  addItemsToBatch(item, size) {
    this.batch = this.batch.concat(item);
    this.batchSize += size;
    this.onUpdate();
  }
  onUpdate() {
    if (this.totalNumberCompleted < BatchedCollector.START_BATCH_AFTER_COUNT) {
      this.flush();
    } else if (this.batchSize >= this.maxBatchSize) {
      this.flush();
    } else if (!this.timeoutHandle) {
      this.timeoutHandle = setTimeout(() => {
        this.flush();
      }, BatchedCollector.TIMEOUT);
    }
  }
  flush() {
    if (this.batchSize) {
      this.totalNumberCompleted += this.batchSize;
      this.cb(this.batch);
      this.batch = [];
      this.batchSize = 0;
      if (this.timeoutHandle) {
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = 0;
      }
    }
  }
}
export {
  BatchedCollector,
  TextSearchManager,
  TextSearchResultsCollector
};
//# sourceMappingURL=textSearchManager.js.map
