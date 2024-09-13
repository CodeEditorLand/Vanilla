var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as arrays from "../../../../base/common/arrays.js";
import {
  createCancelablePromise
} from "../../../../base/common/async.js";
import { canceled } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  compareItemsByFuzzyScore,
  prepareQuery
} from "../../../../base/common/fuzzyScorer.js";
import { revive } from "../../../../base/common/marshalling.js";
import { basename, dirname, join, sep } from "../../../../base/common/path.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { URI } from "../../../../base/common/uri.js";
import { ByteSize } from "../../../../platform/files/common/files.js";
import {
  DEFAULT_MAX_SEARCH_RESULTS,
  isFilePatternMatch
} from "../common/search.js";
import { Engine as FileSearchEngine } from "./fileSearch.js";
import { TextSearchEngineAdapter } from "./textSearchAdapter.js";
class SearchService {
  constructor(processType = "searchProcess", getNumThreads) {
    this.processType = processType;
    this.getNumThreads = getNumThreads;
  }
  static {
    __name(this, "SearchService");
  }
  static BATCH_SIZE = 512;
  caches = /* @__PURE__ */ Object.create(null);
  fileSearch(config) {
    let promise;
    const query = reviveQuery(config);
    const emitter = new Emitter({
      onDidAddFirstListener: /* @__PURE__ */ __name(() => {
        promise = createCancelablePromise(async (token) => {
          const numThreads = await this.getNumThreads?.();
          return this.doFileSearchWithEngine(
            FileSearchEngine,
            query,
            (p) => emitter.fire(p),
            token,
            SearchService.BATCH_SIZE,
            numThreads
          );
        });
        promise.then(
          (c) => emitter.fire(c),
          (err) => emitter.fire({
            type: "error",
            error: { message: err.message, stack: err.stack }
          })
        );
      }, "onDidAddFirstListener"),
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
        promise.cancel();
      }, "onDidRemoveLastListener")
    });
    return emitter.event;
  }
  textSearch(rawQuery) {
    let promise;
    const query = reviveQuery(rawQuery);
    const emitter = new Emitter({
      onDidAddFirstListener: /* @__PURE__ */ __name(() => {
        promise = createCancelablePromise((token) => {
          return this.ripgrepTextSearch(
            query,
            (p) => emitter.fire(p),
            token
          );
        });
        promise.then(
          (c) => emitter.fire(c),
          (err) => emitter.fire({
            type: "error",
            error: { message: err.message, stack: err.stack }
          })
        );
      }, "onDidAddFirstListener"),
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
        promise.cancel();
      }, "onDidRemoveLastListener")
    });
    return emitter.event;
  }
  async ripgrepTextSearch(config, progressCallback, token) {
    config.maxFileSize = this.getPlatformFileLimits().maxFileSize;
    const numThreads = await this.getNumThreads?.();
    const engine = new TextSearchEngineAdapter(config, numThreads);
    return engine.search(token, progressCallback, progressCallback);
  }
  getPlatformFileLimits() {
    return {
      maxFileSize: 16 * ByteSize.GB
    };
  }
  doFileSearch(config, numThreads, progressCallback, token) {
    return this.doFileSearchWithEngine(
      FileSearchEngine,
      config,
      progressCallback,
      token,
      SearchService.BATCH_SIZE,
      numThreads
    );
  }
  doFileSearchWithEngine(EngineClass, config, progressCallback, token, batchSize = SearchService.BATCH_SIZE, threads) {
    let resultCount = 0;
    const fileProgressCallback = /* @__PURE__ */ __name((progress) => {
      if (Array.isArray(progress)) {
        resultCount += progress.length;
        progressCallback(
          progress.map((m) => this.rawMatchToSearchItem(m))
        );
      } else if (progress.relativePath) {
        resultCount++;
        progressCallback(
          this.rawMatchToSearchItem(progress)
        );
      } else {
        progressCallback(progress);
      }
    }, "fileProgressCallback");
    if (config.sortByScore) {
      let sortedSearch = this.trySortedSearchFromCache(
        config,
        fileProgressCallback,
        token
      );
      if (!sortedSearch) {
        const walkerConfig = config.maxResults ? Object.assign({}, config, { maxResults: null }) : config;
        const engine2 = new EngineClass(walkerConfig, threads);
        sortedSearch = this.doSortedSearch(
          engine2,
          config,
          progressCallback,
          fileProgressCallback,
          token
        );
      }
      return new Promise((c, e) => {
        sortedSearch.then(([result, rawMatches]) => {
          const serializedMatches = rawMatches.map(
            (rawMatch) => this.rawMatchToSearchItem(rawMatch)
          );
          this.sendProgress(
            serializedMatches,
            progressCallback,
            batchSize
          );
          c(result);
        }, e);
      });
    }
    const engine = new EngineClass(config, threads);
    return this.doSearch(
      engine,
      fileProgressCallback,
      batchSize,
      token
    ).then((complete) => {
      return {
        limitHit: complete.limitHit,
        type: "success",
        stats: {
          detailStats: complete.stats,
          type: this.processType,
          fromCache: false,
          resultCount,
          sortingTime: void 0
        },
        messages: []
      };
    });
  }
  rawMatchToSearchItem(match) {
    return {
      path: match.base ? join(match.base, match.relativePath) : match.relativePath
    };
  }
  doSortedSearch(engine, config, progressCallback, fileProgressCallback, token) {
    const emitter = new Emitter();
    let allResultsPromise = createCancelablePromise((token2) => {
      let results = [];
      const innerProgressCallback = /* @__PURE__ */ __name((progress) => {
        if (Array.isArray(progress)) {
          results = progress;
        } else {
          fileProgressCallback(progress);
          emitter.fire(progress);
        }
      }, "innerProgressCallback");
      return this.doSearch(engine, innerProgressCallback, -1, token2).then((result) => {
        return [result, results];
      });
    });
    let cache;
    if (config.cacheKey) {
      cache = this.getOrCreateCache(config.cacheKey);
      const cacheRow = {
        promise: allResultsPromise,
        event: emitter.event,
        resolved: false
      };
      cache.resultsToSearchCache[config.filePattern || ""] = cacheRow;
      allResultsPromise.then(
        () => {
          cacheRow.resolved = true;
        },
        (err) => {
          delete cache.resultsToSearchCache[config.filePattern || ""];
        }
      );
      allResultsPromise = this.preventCancellation(allResultsPromise);
    }
    return allResultsPromise.then(([result, results]) => {
      const scorerCache = cache ? cache.scorerCache : /* @__PURE__ */ Object.create(null);
      const sortSW = (typeof config.maxResults !== "number" || config.maxResults > 0) && StopWatch.create(false);
      return this.sortResults(config, results, scorerCache, token).then((sortedResults) => {
        const sortingTime = sortSW ? sortSW.elapsed() : -1;
        return [
          {
            type: "success",
            stats: {
              detailStats: result.stats,
              sortingTime,
              fromCache: false,
              type: this.processType,
              resultCount: sortedResults.length
            },
            messages: result.messages,
            limitHit: result.limitHit || typeof config.maxResults === "number" && results.length > config.maxResults
          },
          sortedResults
        ];
      });
    });
  }
  getOrCreateCache(cacheKey) {
    const existing = this.caches[cacheKey];
    if (existing) {
      return existing;
    }
    return this.caches[cacheKey] = new Cache();
  }
  trySortedSearchFromCache(config, progressCallback, token) {
    const cache = config.cacheKey && this.caches[config.cacheKey];
    if (!cache) {
      return void 0;
    }
    const cached = this.getResultsFromCache(
      cache,
      config.filePattern || "",
      progressCallback,
      token
    );
    if (cached) {
      return cached.then(([result, results, cacheStats]) => {
        const sortSW = StopWatch.create(false);
        return this.sortResults(
          config,
          results,
          cache.scorerCache,
          token
        ).then(
          (sortedResults) => {
            const sortingTime = sortSW.elapsed();
            const stats = {
              fromCache: true,
              detailStats: cacheStats,
              type: this.processType,
              resultCount: results.length,
              sortingTime
            };
            return [
              {
                type: "success",
                limitHit: result.limitHit || typeof config.maxResults === "number" && results.length > config.maxResults,
                stats,
                messages: []
              },
              sortedResults
            ];
          }
        );
      });
    }
    return void 0;
  }
  sortResults(config, results, scorerCache, token) {
    const query = prepareQuery(config.filePattern || "");
    const compare = /* @__PURE__ */ __name((matchA, matchB) => compareItemsByFuzzyScore(
      matchA,
      matchB,
      query,
      true,
      FileMatchItemAccessor,
      scorerCache
    ), "compare");
    const maxResults = typeof config.maxResults === "number" ? config.maxResults : DEFAULT_MAX_SEARCH_RESULTS;
    return arrays.topAsync(results, compare, maxResults, 1e4, token);
  }
  sendProgress(results, progressCb, batchSize) {
    if (batchSize && batchSize > 0) {
      for (let i = 0; i < results.length; i += batchSize) {
        progressCb(results.slice(i, i + batchSize));
      }
    } else {
      progressCb(results);
    }
  }
  getResultsFromCache(cache, searchValue, progressCallback, token) {
    const cacheLookupSW = StopWatch.create(false);
    const hasPathSep = searchValue.indexOf(sep) >= 0;
    let cachedRow;
    for (const previousSearch in cache.resultsToSearchCache) {
      if (searchValue.startsWith(previousSearch)) {
        if (hasPathSep && previousSearch.indexOf(sep) < 0 && previousSearch !== "") {
          continue;
        }
        const row = cache.resultsToSearchCache[previousSearch];
        cachedRow = {
          promise: this.preventCancellation(row.promise),
          event: row.event,
          resolved: row.resolved
        };
        break;
      }
    }
    if (!cachedRow) {
      return null;
    }
    const cacheLookupTime = cacheLookupSW.elapsed();
    const cacheFilterSW = StopWatch.create(false);
    const listener = cachedRow.event(progressCallback);
    if (token) {
      token.onCancellationRequested(() => {
        listener.dispose();
      });
    }
    return cachedRow.promise.then(([complete, cachedEntries]) => {
      if (token && token.isCancellationRequested) {
        throw canceled();
      }
      const results = [];
      const normalizedSearchValueLowercase = prepareQuery(searchValue).normalizedLowercase;
      for (const entry of cachedEntries) {
        if (!isFilePatternMatch(entry, normalizedSearchValueLowercase)) {
          continue;
        }
        results.push(entry);
      }
      return [
        complete,
        results,
        {
          cacheWasResolved: cachedRow.resolved,
          cacheLookupTime,
          cacheFilterTime: cacheFilterSW.elapsed(),
          cacheEntryCount: cachedEntries.length
        }
      ];
    });
  }
  doSearch(engine, progressCallback, batchSize, token) {
    return new Promise((c, e) => {
      let batch = [];
      token?.onCancellationRequested(() => engine.cancel());
      engine.search(
        (match) => {
          if (match) {
            if (batchSize) {
              batch.push(match);
              if (batchSize > 0 && batch.length >= batchSize) {
                progressCallback(batch);
                batch = [];
              }
            } else {
              progressCallback(match);
            }
          }
        },
        (progress) => {
          progressCallback(progress);
        },
        (error, complete) => {
          if (batch.length) {
            progressCallback(batch);
          }
          if (error) {
            progressCallback({
              message: "Search finished. Error: " + error.message
            });
            e(error);
          } else {
            progressCallback({
              message: "Search finished. Stats: " + JSON.stringify(complete.stats)
            });
            c(complete);
          }
        }
      );
    });
  }
  clearCache(cacheKey) {
    delete this.caches[cacheKey];
    return Promise.resolve(void 0);
  }
  /**
   * Return a CancelablePromise which is not actually cancelable
   * TODO@rob - Is this really needed?
   */
  preventCancellation(promise) {
    return new class {
      get [Symbol.toStringTag]() {
        return this.toString();
      }
      cancel() {
      }
      then(resolve, reject) {
        return promise.then(resolve, reject);
      }
      catch(reject) {
        return this.then(void 0, reject);
      }
      finally(onFinally) {
        return promise.finally(onFinally);
      }
    }();
  }
}
class Cache {
  static {
    __name(this, "Cache");
  }
  resultsToSearchCache = /* @__PURE__ */ Object.create(null);
  scorerCache = /* @__PURE__ */ Object.create(null);
}
const FileMatchItemAccessor = new class {
  getItemLabel(match) {
    return basename(match.relativePath);
  }
  getItemDescription(match) {
    return dirname(match.relativePath);
  }
  getItemPath(match) {
    return match.relativePath;
  }
}();
function reviveQuery(rawQuery) {
  return {
    ...rawQuery,
    // TODO
    ...{
      folderQueries: rawQuery.folderQueries && rawQuery.folderQueries.map(reviveFolderQuery),
      extraFileResources: rawQuery.extraFileResources && rawQuery.extraFileResources.map(
        (components) => URI.revive(components)
      )
    }
  };
}
__name(reviveQuery, "reviveQuery");
function reviveFolderQuery(rawFolderQuery) {
  return revive(rawFolderQuery);
}
__name(reviveFolderQuery, "reviveFolderQuery");
export {
  SearchService
};
//# sourceMappingURL=rawSearchService.js.map
