var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as arrays from "../../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { ResourceMap, ResourceSet } from "../../../../../base/common/map.js";
import { isNumber } from "../../../../../base/common/types.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { IEditorResolverService } from "../../../../services/editor/common/editorResolverService.js";
import { QueryBuilder } from "../../../../services/search/common/queryBuilder.js";
import {
  DEFAULT_MAX_SEARCH_RESULTS,
  ISearchService,
  pathIncludedInQuery,
  QueryType
} from "../../../../services/search/common/search.js";
import { INotebookEditorService } from "../../../notebook/browser/services/notebookEditorService.js";
import { INotebookService } from "../../../notebook/common/notebookService.js";
import {
  contentMatchesToTextSearchMatches,
  webviewMatchesToTextSearchMatches
} from "./searchNotebookHelpers.js";
let NotebookSearchService = class {
  constructor(uriIdentityService, notebookEditorService, logService, notebookService, configurationService, editorResolverService, searchService, instantiationService) {
    this.uriIdentityService = uriIdentityService;
    this.notebookEditorService = notebookEditorService;
    this.logService = logService;
    this.notebookService = notebookService;
    this.configurationService = configurationService;
    this.editorResolverService = editorResolverService;
    this.searchService = searchService;
    this.queryBuilder = instantiationService.createInstance(QueryBuilder);
  }
  queryBuilder;
  notebookSearch(query, token, searchInstanceID, onProgress) {
    if (query.type !== QueryType.Text) {
      return {
        openFilesToScan: new ResourceSet(),
        completeData: Promise.resolve({
          messages: [],
          limitHit: false,
          results: []
        }),
        allScannedFiles: Promise.resolve(new ResourceSet())
      };
    }
    const localNotebookWidgets = this.getLocalNotebookWidgets();
    const localNotebookFiles = localNotebookWidgets.map(
      (widget) => widget.viewModel.uri
    );
    const getAllResults = () => {
      const searchStart = Date.now();
      const localResultPromise = this.getLocalNotebookResults(
        query,
        token ?? CancellationToken.None,
        localNotebookWidgets,
        searchInstanceID
      );
      const searchLocalEnd = Date.now();
      const experimentalNotebooksEnabled = this.configurationService.getValue(
        "search"
      ).experimental?.closedNotebookRichContentResults ?? false;
      let closedResultsPromise = Promise.resolve(void 0);
      if (experimentalNotebooksEnabled) {
        closedResultsPromise = this.getClosedNotebookResults(
          query,
          new ResourceSet(
            localNotebookFiles,
            (uri) => this.uriIdentityService.extUri.getComparisonKey(uri)
          ),
          token ?? CancellationToken.None
        );
      }
      const promise = Promise.all([
        localResultPromise,
        closedResultsPromise
      ]);
      return {
        completeData: promise.then(
          (resolvedPromise) => {
            const openNotebookResult = resolvedPromise[0];
            const closedNotebookResult = resolvedPromise[1];
            const resolved = resolvedPromise.filter(
              (e) => !!e
            );
            const resultArray = [
              ...openNotebookResult.results.values(),
              ...closedNotebookResult?.results.values() ?? []
            ];
            const results = arrays.coalesce(resultArray);
            if (onProgress) {
              results.forEach(onProgress);
            }
            this.logService.trace(
              `local notebook search time | ${searchLocalEnd - searchStart}ms`
            );
            return {
              messages: [],
              limitHit: resolved.reduce(
                (prev, cur) => prev || cur.limitHit,
                false
              ),
              results
            };
          }
        ),
        allScannedFiles: promise.then((resolvedPromise) => {
          const openNotebookResults = resolvedPromise[0];
          const closedNotebookResults = resolvedPromise[1];
          const results = arrays.coalesce([
            ...openNotebookResults.results.keys(),
            ...closedNotebookResults?.results.keys() ?? []
          ]);
          return new ResourceSet(
            results,
            (uri) => this.uriIdentityService.extUri.getComparisonKey(uri)
          );
        })
      };
    };
    const promiseResults = getAllResults();
    return {
      openFilesToScan: new ResourceSet(localNotebookFiles),
      completeData: promiseResults.completeData,
      allScannedFiles: promiseResults.allScannedFiles
    };
  }
  async doesFileExist(includes, folderQueries, token) {
    const promises = includes.map(
      async (includePattern) => {
        const query = this.queryBuilder.file(
          folderQueries.map((e) => e.folder),
          {
            includePattern: includePattern.startsWith("/") ? includePattern : "**/" + includePattern,
            // todo: find cleaner way to ensure that globs match all appropriate filetypes
            exists: true,
            onlyFileScheme: true
          }
        );
        return this.searchService.fileSearch(query, token).then((ret) => {
          return !!ret.limitHit;
        });
      }
    );
    return Promise.any(promises);
  }
  async getClosedNotebookResults(textQuery, scannedFiles, token) {
    const userAssociations = this.editorResolverService.getAllUserAssociations();
    const allPriorityInfo = /* @__PURE__ */ new Map();
    const contributedNotebookTypes = this.notebookService.getContributedNotebookTypes();
    userAssociations.forEach((association) => {
      if (!association.filenamePattern) {
        return;
      }
      const info = {
        isFromSettings: true,
        filenamePatterns: [association.filenamePattern]
      };
      const existingEntry = allPriorityInfo.get(association.viewType);
      if (existingEntry) {
        allPriorityInfo.set(
          association.viewType,
          existingEntry.concat(info)
        );
      } else {
        allPriorityInfo.set(association.viewType, [info]);
      }
    });
    const promises = [];
    contributedNotebookTypes.forEach((notebook) => {
      if (notebook.selectors.length > 0) {
        promises.push(
          (async () => {
            const includes = notebook.selectors.map((selector) => {
              const globPattern = selector.include || selector;
              return globPattern.toString();
            });
            const isInWorkspace = await this.doesFileExist(
              includes,
              textQuery.folderQueries,
              token
            );
            if (isInWorkspace) {
              const canResolve = await this.notebookService.canResolve(
                notebook.id
              );
              if (!canResolve) {
                return void 0;
              }
              const serializer = (await this.notebookService.withNotebookDataProvider(
                notebook.id
              )).serializer;
              return await serializer.searchInNotebooks(
                textQuery,
                token,
                allPriorityInfo
              );
            } else {
              return void 0;
            }
          })()
        );
      }
    });
    const start = Date.now();
    const searchComplete = arrays.coalesce(await Promise.all(promises));
    const results = searchComplete.flatMap((e) => e.results);
    let limitHit = searchComplete.some((e) => e.limitHit);
    const uniqueResults = new ResourceMap(
      (uri) => this.uriIdentityService.extUri.getComparisonKey(uri)
    );
    let numResults = 0;
    for (const result of results) {
      if (textQuery.maxResults && numResults >= textQuery.maxResults) {
        limitHit = true;
        break;
      }
      if (!scannedFiles.has(result.resource) && !uniqueResults.has(result.resource)) {
        uniqueResults.set(
          result.resource,
          result.cellResults.length > 0 ? result : null
        );
        numResults++;
      }
    }
    const end = Date.now();
    this.logService.trace(`query: ${textQuery.contentPattern.pattern}`);
    this.logService.trace(`closed notebook search time | ${end - start}ms`);
    return {
      results: uniqueResults,
      limitHit
    };
  }
  async getLocalNotebookResults(query, token, widgets, searchID) {
    const localResults = new ResourceMap(
      (uri) => this.uriIdentityService.extUri.getComparisonKey(uri)
    );
    let limitHit = false;
    for (const widget of widgets) {
      if (!widget.hasModel()) {
        continue;
      }
      const askMax = (isNumber(query.maxResults) ? query.maxResults : DEFAULT_MAX_SEARCH_RESULTS) + 1;
      const uri = widget.viewModel.uri;
      if (!pathIncludedInQuery(query, uri.fsPath)) {
        continue;
      }
      let matches = await widget.find(
        query.contentPattern.pattern,
        {
          regex: query.contentPattern.isRegExp,
          wholeWord: query.contentPattern.isWordMatch,
          caseSensitive: query.contentPattern.isCaseSensitive,
          includeMarkupInput: query.contentPattern.notebookInfo?.isInNotebookMarkdownInput ?? true,
          includeMarkupPreview: query.contentPattern.notebookInfo?.isInNotebookMarkdownPreview ?? true,
          includeCodeInput: query.contentPattern.notebookInfo?.isInNotebookCellInput ?? true,
          includeOutput: query.contentPattern.notebookInfo?.isInNotebookCellOutput ?? true
        },
        token,
        false,
        true,
        searchID
      );
      if (matches.length) {
        if (askMax && matches.length >= askMax) {
          limitHit = true;
          matches = matches.slice(0, askMax - 1);
        }
        const cellResults = matches.map(
          (match) => {
            const contentResults = contentMatchesToTextSearchMatches(
              match.contentMatches,
              match.cell
            );
            const webviewResults = webviewMatchesToTextSearchMatches(
              match.webviewMatches
            );
            return {
              cell: match.cell,
              index: match.index,
              contentResults,
              webviewResults
            };
          }
        );
        const fileMatch = {
          resource: uri,
          cellResults
        };
        localResults.set(uri, fileMatch);
      } else {
        localResults.set(uri, null);
      }
    }
    return {
      results: localResults,
      limitHit
    };
  }
  getLocalNotebookWidgets() {
    const notebookWidgets = this.notebookEditorService.retrieveAllExistingWidgets();
    return notebookWidgets.map((widget) => widget.value).filter(
      (val) => !!val && val.hasModel()
    );
  }
};
NotebookSearchService = __decorateClass([
  __decorateParam(0, IUriIdentityService),
  __decorateParam(1, INotebookEditorService),
  __decorateParam(2, ILogService),
  __decorateParam(3, INotebookService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IEditorResolverService),
  __decorateParam(6, ISearchService),
  __decorateParam(7, IInstantiationService)
], NotebookSearchService);
export {
  NotebookSearchService
};
