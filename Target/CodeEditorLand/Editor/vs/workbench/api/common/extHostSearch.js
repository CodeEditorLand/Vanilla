var p=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var v=(i,e,t,r)=>{for(var o=r>1?void 0:r?m(e,t):e,a=i.length-1,s;a>=0;a--)(s=i[a])&&(o=(r?s(e,t,o):s(o))||o);return r&&o&&p(e,t,o),o},d=(i,e)=>(t,r)=>e(t,r,i);import"../../../../vs/base/common/cancellation.js";import{toDisposable as h}from"../../../../vs/base/common/lifecycle.js";import{revive as I}from"../../../../vs/base/common/marshalling.js";import{URI as P}from"../../../../vs/base/common/uri.js";import{createDecorator as u}from"../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as T}from"../../../../vs/platform/log/common/log.js";import{IExtHostRpcService as _}from"../../../../vs/workbench/api/common/extHostRpcService.js";import{IURITransformerService as g}from"../../../../vs/workbench/api/common/extHostUriTransformerService.js";import{FileSearchManager as f}from"../../../../vs/workbench/services/search/common/fileSearchManager.js";import"../../../../vs/workbench/services/search/common/search.js";import{OldAITextSearchProviderConverter as y,OldFileSearchProviderConverter as w,OldTextSearchProviderConverter as U}from"../../../../vs/workbench/services/search/common/searchExtConversionTypes.js";import{TextSearchManager as x}from"../../../../vs/workbench/services/search/common/textSearchManager.js";import{MainContext as F}from"../common/extHost.protocol.js";const ie=u("IExtHostSearch");let n=class{constructor(e,t,r){this.extHostRpc=e;this._uriTransformer=t;this._logService=r}_proxy=this.extHostRpc.getProxy(F.MainThreadSearch);_handlePool=0;_textSearchProvider=new Map;_textSearchUsedSchemes=new Set;_aiTextSearchProvider=new Map;_aiTextSearchUsedSchemes=new Set;_fileSearchProvider=new Map;_fileSearchUsedSchemes=new Set;_fileSearchManager=new f;_transformScheme(e){return this._uriTransformer.transformOutgoingScheme(e)}registerTextSearchProviderOld(e,t){if(this._textSearchUsedSchemes.has(e))throw new Error(`a text search provider for the scheme '${e}' is already registered`);this._textSearchUsedSchemes.add(e);const r=this._handlePool++;return this._textSearchProvider.set(r,new U(t)),this._proxy.$registerTextSearchProvider(r,this._transformScheme(e)),h(()=>{this._textSearchUsedSchemes.delete(e),this._textSearchProvider.delete(r),this._proxy.$unregisterProvider(r)})}registerTextSearchProvider(e,t){if(this._textSearchUsedSchemes.has(e))throw new Error(`a text search provider for the scheme '${e}' is already registered`);this._textSearchUsedSchemes.add(e);const r=this._handlePool++;return this._textSearchProvider.set(r,t),this._proxy.$registerTextSearchProvider(r,this._transformScheme(e)),h(()=>{this._textSearchUsedSchemes.delete(e),this._textSearchProvider.delete(r),this._proxy.$unregisterProvider(r)})}registerAITextSearchProviderOld(e,t){if(this._aiTextSearchUsedSchemes.has(e))throw new Error(`an AI text search provider for the scheme '${e}'is already registered`);this._aiTextSearchUsedSchemes.add(e);const r=this._handlePool++;return this._aiTextSearchProvider.set(r,new y(t)),this._proxy.$registerAITextSearchProvider(r,this._transformScheme(e)),h(()=>{this._aiTextSearchUsedSchemes.delete(e),this._aiTextSearchProvider.delete(r),this._proxy.$unregisterProvider(r)})}registerAITextSearchProvider(e,t){if(this._aiTextSearchUsedSchemes.has(e))throw new Error(`an AI text search provider for the scheme '${e}'is already registered`);this._aiTextSearchUsedSchemes.add(e);const r=this._handlePool++;return this._aiTextSearchProvider.set(r,t),this._proxy.$registerAITextSearchProvider(r,this._transformScheme(e)),h(()=>{this._aiTextSearchUsedSchemes.delete(e),this._aiTextSearchProvider.delete(r),this._proxy.$unregisterProvider(r)})}registerFileSearchProviderOld(e,t){if(this._fileSearchUsedSchemes.has(e))throw new Error(`a file search provider for the scheme '${e}' is already registered`);this._fileSearchUsedSchemes.add(e);const r=this._handlePool++;return this._fileSearchProvider.set(r,new w(t)),this._proxy.$registerFileSearchProvider(r,this._transformScheme(e)),h(()=>{this._fileSearchUsedSchemes.delete(e),this._fileSearchProvider.delete(r),this._proxy.$unregisterProvider(r)})}registerFileSearchProvider(e,t){if(this._fileSearchUsedSchemes.has(e))throw new Error(`a file search provider for the scheme '${e}' is already registered`);this._fileSearchUsedSchemes.add(e);const r=this._handlePool++;return this._fileSearchProvider.set(r,t),this._proxy.$registerFileSearchProvider(r,this._transformScheme(e)),h(()=>{this._fileSearchUsedSchemes.delete(e),this._fileSearchProvider.delete(r),this._proxy.$unregisterProvider(r)})}$provideFileSearchResults(e,t,r,o){const a=S(r),s=this._fileSearchProvider.get(e);if(s)return this._fileSearchManager.fileSearch(a,s,l=>{this._proxy.$handleFileMatch(e,t,l.map(c=>c.resource))},o);throw new Error("unknown provider: "+e)}async doInternalFileSearchWithCustomCallback(e,t,r){return{messages:[]}}$clearCache(e){return this._fileSearchManager.clearCache(e),Promise.resolve(void 0)}$provideTextSearchResults(e,t,r,o){const a=this._textSearchProvider.get(e);if(!a||!a.provideTextSearchResults)throw new Error(`Unknown Text Search Provider ${e}`);const s=S(r);return this.createTextSearchManager(s,a).search(c=>this._proxy.$handleTextMatch(e,t,c),o)}$provideAITextSearchResults(e,t,r,o){const a=this._aiTextSearchProvider.get(e);if(!a||!a.provideAITextSearchResults)throw new Error(`Unknown AI Text Search Provider ${e}`);const s=S(r);return this.createAITextSearchManager(s,a).search(c=>this._proxy.$handleTextMatch(e,t,c),o)}$enableExtensionHostSearch(){}createTextSearchManager(e,t){return new x({query:e,provider:t},{readdir:r=>Promise.resolve([]),toCanonicalName:r=>r},"textSearchProvider")}createAITextSearchManager(e,t){return new x({query:e,provider:t},{readdir:r=>Promise.resolve([]),toCanonicalName:r=>r},"aiTextSearchProvider")}};n=v([d(0,_),d(1,g),d(2,T)],n);function S(i){return{...i,folderQueries:i.folderQueries&&i.folderQueries.map(R),extraFileResources:i.extraFileResources&&i.extraFileResources.map(e=>P.revive(e))}}function R(i){return I(i)}export{n as ExtHostSearch,ie as IExtHostSearch,S as reviveQuery};