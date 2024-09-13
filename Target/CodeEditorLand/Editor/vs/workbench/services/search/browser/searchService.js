var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { createWebWorker } from "../../../../base/browser/defaultWorkerFactory.js";
import { memoize } from "../../../../base/common/decorators.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { revive } from "../../../../base/common/marshalling.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import {
  logOnceWebWorkerWarning
} from "../../../../base/common/worker/simpleWorker.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize } from "../../../../nls.js";
import { WebFileSystemAccess } from "../../../../platform/files/browser/webFileSystemAccess.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import {
  LocalFileSearchSimpleWorkerHost
} from "../common/localFileSearchWorkerTypes.js";
import {
  ISearchService,
  SearchProviderType,
  TextSearchCompleteMessageType
} from "../common/search.js";
import { SearchService } from "../common/searchService.js";
let RemoteSearchService = class extends SearchService {
  constructor(modelService, editorService, telemetryService, logService, extensionService, fileService, instantiationService, uriIdentityService) {
    super(modelService, editorService, telemetryService, logService, extensionService, fileService, uriIdentityService);
    this.instantiationService = instantiationService;
    const searchProvider = this.instantiationService.createInstance(LocalFileSearchWorkerClient);
    this.registerSearchResultProvider(Schemas.file, SearchProviderType.file, searchProvider);
    this.registerSearchResultProvider(Schemas.file, SearchProviderType.text, searchProvider);
  }
  static {
    __name(this, "RemoteSearchService");
  }
};
RemoteSearchService = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IExtensionService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IUriIdentityService)
], RemoteSearchService);
let LocalFileSearchWorkerClient = class extends Disposable {
  constructor(fileService, uriIdentityService) {
    super();
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this._worker = null;
  }
  static {
    __name(this, "LocalFileSearchWorkerClient");
  }
  _worker;
  _onDidReceiveTextSearchMatch = new Emitter();
  onDidReceiveTextSearchMatch = this._onDidReceiveTextSearchMatch.event;
  cache;
  queryId = 0;
  sendTextSearchMatch(match, queryId) {
    this._onDidReceiveTextSearchMatch.fire({ match, queryId });
  }
  get fileSystemProvider() {
    return this.fileService.getProvider(
      Schemas.file
    );
  }
  async cancelQuery(queryId) {
    const proxy = this._getOrCreateWorker().proxy;
    proxy.$cancelQuery(queryId);
  }
  async textSearch(query, onProgress, token) {
    try {
      const queryDisposables = new DisposableStore();
      const proxy = this._getOrCreateWorker().proxy;
      const results = [];
      let limitHit = false;
      await Promise.all(
        query.folderQueries.map(async (fq) => {
          const queryId = this.queryId++;
          queryDisposables.add(
            token?.onCancellationRequested(
              (e) => this.cancelQuery(queryId)
            ) || Disposable.None
          );
          const handle = await this.fileSystemProvider.getHandle(fq.folder);
          if (!handle || !WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
            console.error(
              "Could not get directory handle for ",
              fq
            );
            return;
          }
          const reviveMatch = /* @__PURE__ */ __name((result2) => ({
            resource: URI.revive(result2.resource),
            results: revive(result2.results)
          }), "reviveMatch");
          queryDisposables.add(
            this.onDidReceiveTextSearchMatch((e) => {
              if (e.queryId === queryId) {
                onProgress?.(reviveMatch(e.match));
              }
            })
          );
          const ignorePathCasing = this.uriIdentityService.extUri.ignorePathCasing(
            fq.folder
          );
          const folderResults = await proxy.$searchDirectory(
            handle,
            query,
            fq,
            ignorePathCasing,
            queryId
          );
          for (const folderResult of folderResults.results) {
            results.push(revive(folderResult));
          }
          if (folderResults.limitHit) {
            limitHit = true;
          }
        })
      );
      queryDisposables.dispose();
      const result = { messages: [], results, limitHit };
      return result;
    } catch (e) {
      console.error("Error performing web worker text search", e);
      return {
        results: [],
        messages: [
          {
            text: localize(
              "errorSearchText",
              "Unable to search with Web Worker text searcher"
            ),
            type: TextSearchCompleteMessageType.Warning
          }
        ]
      };
    }
  }
  async fileSearch(query, token) {
    try {
      const queryDisposables = new DisposableStore();
      let limitHit = false;
      const proxy = this._getOrCreateWorker().proxy;
      const results = [];
      await Promise.all(
        query.folderQueries.map(async (fq) => {
          const queryId = this.queryId++;
          queryDisposables.add(
            token?.onCancellationRequested(
              (e) => this.cancelQuery(queryId)
            ) || Disposable.None
          );
          const handle = await this.fileSystemProvider.getHandle(fq.folder);
          if (!handle || !WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
            console.error(
              "Could not get directory handle for ",
              fq
            );
            return;
          }
          const caseSensitive = this.uriIdentityService.extUri.ignorePathCasing(
            fq.folder
          );
          const folderResults = await proxy.$listDirectory(
            handle,
            query,
            fq,
            caseSensitive,
            queryId
          );
          for (const folderResult of folderResults.results) {
            results.push({
              resource: URI.joinPath(fq.folder, folderResult)
            });
          }
          if (folderResults.limitHit) {
            limitHit = true;
          }
        })
      );
      queryDisposables.dispose();
      const result = { messages: [], results, limitHit };
      return result;
    } catch (e) {
      console.error("Error performing web worker file search", e);
      return {
        results: [],
        messages: [
          {
            text: localize(
              "errorSearchFile",
              "Unable to search with Web Worker file searcher"
            ),
            type: TextSearchCompleteMessageType.Warning
          }
        ]
      };
    }
  }
  async clearCache(cacheKey) {
    if (this.cache?.key === cacheKey) {
      this.cache = void 0;
    }
  }
  _getOrCreateWorker() {
    if (!this._worker) {
      try {
        this._worker = this._register(
          createWebWorker(
            "vs/workbench/services/search/worker/localFileSearch",
            "LocalFileSearchWorker"
          )
        );
        LocalFileSearchSimpleWorkerHost.setChannel(this._worker, {
          $sendTextSearchMatch: /* @__PURE__ */ __name((match, queryId) => {
            return this.sendTextSearchMatch(match, queryId);
          }, "$sendTextSearchMatch")
        });
      } catch (err) {
        logOnceWebWorkerWarning(err);
        throw err;
      }
    }
    return this._worker;
  }
};
__decorateClass([
  memoize
], LocalFileSearchWorkerClient.prototype, "fileSystemProvider", 1);
LocalFileSearchWorkerClient = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUriIdentityService)
], LocalFileSearchWorkerClient);
registerSingleton(
  ISearchService,
  RemoteSearchService,
  InstantiationType.Delayed
);
export {
  LocalFileSearchWorkerClient,
  RemoteSearchService
};
//# sourceMappingURL=searchService.js.map
