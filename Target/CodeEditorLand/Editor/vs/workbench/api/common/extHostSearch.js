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
import {
  toDisposable
} from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { URI } from "../../../base/common/uri.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { FileSearchManager } from "../../services/search/common/fileSearchManager.js";
import {
  OldAITextSearchProviderConverter,
  OldFileSearchProviderConverter,
  OldTextSearchProviderConverter
} from "../../services/search/common/searchExtConversionTypes.js";
import { TextSearchManager } from "../../services/search/common/textSearchManager.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { IURITransformerService } from "./extHostUriTransformerService.js";
const IExtHostSearch = createDecorator("IExtHostSearch");
let ExtHostSearch = class {
  constructor(extHostRpc, _uriTransformer, _logService) {
    this.extHostRpc = extHostRpc;
    this._uriTransformer = _uriTransformer;
    this._logService = _logService;
  }
  _proxy = this.extHostRpc.getProxy(
    MainContext.MainThreadSearch
  );
  _handlePool = 0;
  _textSearchProvider = /* @__PURE__ */ new Map();
  _textSearchUsedSchemes = /* @__PURE__ */ new Set();
  _aiTextSearchProvider = /* @__PURE__ */ new Map();
  _aiTextSearchUsedSchemes = /* @__PURE__ */ new Set();
  _fileSearchProvider = /* @__PURE__ */ new Map();
  _fileSearchUsedSchemes = /* @__PURE__ */ new Set();
  _fileSearchManager = new FileSearchManager();
  _transformScheme(scheme) {
    return this._uriTransformer.transformOutgoingScheme(scheme);
  }
  registerTextSearchProviderOld(scheme, provider) {
    if (this._textSearchUsedSchemes.has(scheme)) {
      throw new Error(
        `a text search provider for the scheme '${scheme}' is already registered`
      );
    }
    this._textSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._textSearchProvider.set(
      handle,
      new OldTextSearchProviderConverter(provider)
    );
    this._proxy.$registerTextSearchProvider(
      handle,
      this._transformScheme(scheme)
    );
    return toDisposable(() => {
      this._textSearchUsedSchemes.delete(scheme);
      this._textSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  registerTextSearchProvider(scheme, provider) {
    if (this._textSearchUsedSchemes.has(scheme)) {
      throw new Error(
        `a text search provider for the scheme '${scheme}' is already registered`
      );
    }
    this._textSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._textSearchProvider.set(handle, provider);
    this._proxy.$registerTextSearchProvider(
      handle,
      this._transformScheme(scheme)
    );
    return toDisposable(() => {
      this._textSearchUsedSchemes.delete(scheme);
      this._textSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  registerAITextSearchProviderOld(scheme, provider) {
    if (this._aiTextSearchUsedSchemes.has(scheme)) {
      throw new Error(
        `an AI text search provider for the scheme '${scheme}'is already registered`
      );
    }
    this._aiTextSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._aiTextSearchProvider.set(
      handle,
      new OldAITextSearchProviderConverter(provider)
    );
    this._proxy.$registerAITextSearchProvider(
      handle,
      this._transformScheme(scheme)
    );
    return toDisposable(() => {
      this._aiTextSearchUsedSchemes.delete(scheme);
      this._aiTextSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  registerAITextSearchProvider(scheme, provider) {
    if (this._aiTextSearchUsedSchemes.has(scheme)) {
      throw new Error(
        `an AI text search provider for the scheme '${scheme}'is already registered`
      );
    }
    this._aiTextSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._aiTextSearchProvider.set(handle, provider);
    this._proxy.$registerAITextSearchProvider(
      handle,
      this._transformScheme(scheme)
    );
    return toDisposable(() => {
      this._aiTextSearchUsedSchemes.delete(scheme);
      this._aiTextSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  registerFileSearchProviderOld(scheme, provider) {
    if (this._fileSearchUsedSchemes.has(scheme)) {
      throw new Error(
        `a file search provider for the scheme '${scheme}' is already registered`
      );
    }
    this._fileSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._fileSearchProvider.set(
      handle,
      new OldFileSearchProviderConverter(provider)
    );
    this._proxy.$registerFileSearchProvider(
      handle,
      this._transformScheme(scheme)
    );
    return toDisposable(() => {
      this._fileSearchUsedSchemes.delete(scheme);
      this._fileSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  registerFileSearchProvider(scheme, provider) {
    if (this._fileSearchUsedSchemes.has(scheme)) {
      throw new Error(
        `a file search provider for the scheme '${scheme}' is already registered`
      );
    }
    this._fileSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._fileSearchProvider.set(handle, provider);
    this._proxy.$registerFileSearchProvider(
      handle,
      this._transformScheme(scheme)
    );
    return toDisposable(() => {
      this._fileSearchUsedSchemes.delete(scheme);
      this._fileSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  $provideFileSearchResults(handle, session, rawQuery, token) {
    const query = reviveQuery(rawQuery);
    const provider = this._fileSearchProvider.get(handle);
    if (provider) {
      return this._fileSearchManager.fileSearch(
        query,
        provider,
        (batch) => {
          this._proxy.$handleFileMatch(
            handle,
            session,
            batch.map((p) => p.resource)
          );
        },
        token
      );
    } else {
      throw new Error("unknown provider: " + handle);
    }
  }
  async doInternalFileSearchWithCustomCallback(query, token, handleFileMatch) {
    return { messages: [] };
  }
  $clearCache(cacheKey) {
    this._fileSearchManager.clearCache(cacheKey);
    return Promise.resolve(void 0);
  }
  $provideTextSearchResults(handle, session, rawQuery, token) {
    const provider = this._textSearchProvider.get(handle);
    if (!provider || !provider.provideTextSearchResults) {
      throw new Error(`Unknown Text Search Provider ${handle}`);
    }
    const query = reviveQuery(rawQuery);
    const engine = this.createTextSearchManager(query, provider);
    return engine.search(
      (progress) => this._proxy.$handleTextMatch(handle, session, progress),
      token
    );
  }
  $provideAITextSearchResults(handle, session, rawQuery, token) {
    const provider = this._aiTextSearchProvider.get(handle);
    if (!provider || !provider.provideAITextSearchResults) {
      throw new Error(`Unknown AI Text Search Provider ${handle}`);
    }
    const query = reviveQuery(rawQuery);
    const engine = this.createAITextSearchManager(query, provider);
    return engine.search(
      (progress) => this._proxy.$handleTextMatch(handle, session, progress),
      token
    );
  }
  $enableExtensionHostSearch() {
  }
  createTextSearchManager(query, provider) {
    return new TextSearchManager(
      { query, provider },
      {
        readdir: (resource) => Promise.resolve([]),
        toCanonicalName: (encoding) => encoding
      },
      "textSearchProvider"
    );
  }
  createAITextSearchManager(query, provider) {
    return new TextSearchManager(
      { query, provider },
      {
        readdir: (resource) => Promise.resolve([]),
        toCanonicalName: (encoding) => encoding
      },
      "aiTextSearchProvider"
    );
  }
};
ExtHostSearch = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IURITransformerService),
  __decorateParam(2, ILogService)
], ExtHostSearch);
function reviveQuery(rawQuery) {
  return {
    ...rawQuery,
    // TODO@rob ???
    ...{
      folderQueries: rawQuery.folderQueries && rawQuery.folderQueries.map(reviveFolderQuery),
      extraFileResources: rawQuery.extraFileResources && rawQuery.extraFileResources.map(
        (components) => URI.revive(components)
      )
    }
  };
}
function reviveFolderQuery(rawFolderQuery) {
  return revive(rawFolderQuery);
}
export {
  ExtHostSearch,
  IExtHostSearch,
  reviveQuery
};
