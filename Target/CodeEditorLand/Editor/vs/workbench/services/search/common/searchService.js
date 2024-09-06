var R=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var T=(f,u,e,r)=>{for(var t=r>1?void 0:r?E(u,e):u,i=f.length-1,o;i>=0;i--)(o=f[i])&&(t=(r?o(u,e,t):o(t))||t);return r&&t&&R(u,e,t),t},d=(f,u)=>(e,r)=>u(e,r,f);import*as p from"../../../../base/common/arrays.js";import{DeferredPromise as b,raceCancellationError as A}from"../../../../base/common/async.js";import"../../../../base/common/cancellation.js";import{CancellationError as F}from"../../../../base/common/errors.js";import{Disposable as Q,toDisposable as D}from"../../../../base/common/lifecycle.js";import{ResourceMap as P,ResourceSet as k}from"../../../../base/common/map.js";import{Schemas as v}from"../../../../base/common/network.js";import{StopWatch as H}from"../../../../base/common/stopwatch.js";import{isNumber as W}from"../../../../base/common/types.js";import"../../../../base/common/uri.js";import{IModelService as B}from"../../../../editor/common/services/model.js";import{IFileService as U}from"../../../../platform/files/common/files.js";import{ILogService as L}from"../../../../platform/log/common/log.js";import{ITelemetryService as _}from"../../../../platform/telemetry/common/telemetry.js";import{IUriIdentityService as $}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{EditorResourceAccessor as C,SideBySideEditor as w}from"../../../common/editor.js";import{IEditorService as O}from"../../editor/common/editorService.js";import{IExtensionService as N}from"../../extensions/common/extensions.js";import{DEFAULT_MAX_SEARCH_RESULTS as G,deserializeSearchError as Y,FileMatch as j,isFileMatch as x,isProgressMessage as M,pathIncludedInQuery as z,QueryType as m,SEARCH_RESULT_LANGUAGE_ID as J,SearchErrorCode as S,SearchProviderType as I}from"./search.js";import{editorMatchesToTextSearchResults as K,getTextSearchMatchWithModelContext as X}from"./searchHelpers.js";let g=class extends Q{constructor(e,r,t,i,o,n,l){super();this.modelService=e;this.editorService=r;this.telemetryService=t;this.logService=i;this.extensionService=o;this.fileService=n;this.uriIdentityService=l}fileSearchProviders=new Map;textSearchProviders=new Map;aiTextSearchProviders=new Map;deferredFileSearchesByScheme=new Map;deferredTextSearchesByScheme=new Map;deferredAITextSearchesByScheme=new Map;loggedSchemesMissingProviders=new Set;registerSearchResultProvider(e,r,t){let i,o;if(r===I.file)i=this.fileSearchProviders,o=this.deferredFileSearchesByScheme;else if(r===I.text)i=this.textSearchProviders,o=this.deferredTextSearchesByScheme;else if(r===I.aiText)i=this.aiTextSearchProviders,o=this.deferredAITextSearchesByScheme;else throw new Error("Unknown SearchProviderType");return i.set(e,t),o.has(e)&&(o.get(e).complete(t),o.delete(e)),D(()=>{i.delete(e)})}async textSearch(e,r,t){const i=this.textSearchSplitSyncAsync(e,r,t),o=i.syncResults,n=await i.asyncResults;return{limitHit:n.limitHit||o.limitHit,results:[...n.results,...o.results],messages:[...n.messages,...o.messages]}}async aiTextSearch(e,r,t){const i=o=>{t&&(x(o),t(o)),M(o)&&this.logService.debug("SearchService#search",o.message)};return this.doSearch(e,r,i)}textSearchSplitSyncAsync(e,r,t,i,o){const n=this.getOpenEditorResults(e);return t&&p.coalesce([...n.results.values()]).filter(a=>!(i&&i.has(a.resource))).forEach(t),{syncResults:{results:p.coalesce([...n.results.values()]),limitHit:n.limitHit??!1,messages:[]},asyncResults:(async()=>{const a=await o??new k,c=h=>{x(h)?!n.results.has(h.resource)&&!a.has(h.resource)&&t&&t(h):t&&t(h),M(h)&&this.logService.debug("SearchService#search",h.message)};return await this.doSearch(e,r,c)})()}}fileSearch(e,r){return this.doSearch(e,r)}doSearch(e,r,t){this.logService.trace("SearchService#search",JSON.stringify(e));const i=this.getSchemesInQuery(e),o=[Promise.resolve(null)];i.forEach(l=>o.push(this.extensionService.activateByEvent(`onSearch:${l}`))),o.push(this.extensionService.activateByEvent("onSearch:file"));const n=(async()=>{if(await Promise.all(o),await this.extensionService.whenInstalledExtensionsRegistered(),r&&r.isCancellationRequested)return Promise.reject(new F);const l=c=>{r&&r.isCancellationRequested||t?.(c)},s=await Promise.all(e.folderQueries.map(c=>this.fileService.exists(c.folder)));e.folderQueries=e.folderQueries.filter((c,h)=>s[h]);let a=await this.searchWithProviders(e,l,r);return a=p.coalesce(a),a.length?{limitHit:a[0]&&a[0].limitHit,stats:a[0].stats,messages:p.coalesce(a.flatMap(c=>c.messages)).filter(p.uniqueFilter(c=>c.type+c.text+c.trusted)),results:a.flatMap(c=>c.results)}:{limitHit:!1,results:[],messages:[]}})();return r?A(n,r):n}getSchemesInQuery(e){const r=new Set;return e.folderQueries?.forEach(t=>r.add(t.folder.scheme)),e.extraFileResources?.forEach(t=>r.add(t.scheme)),r}async waitForProvider(e,r){const t=this.getDeferredTextSearchesByScheme(e);if(t.has(r))return t.get(r).p;{const i=new b;return t.set(r,i),i.p}}getSearchProvider(e){switch(e){case m.File:return this.fileSearchProviders;case m.Text:return this.textSearchProviders;case m.aiText:return this.aiTextSearchProviders;default:throw new Error(`Unknown query type: ${e}`)}}getDeferredTextSearchesByScheme(e){switch(e){case m.File:return this.deferredFileSearchesByScheme;case m.Text:return this.deferredTextSearchesByScheme;case m.aiText:return this.deferredAITextSearchesByScheme;default:throw new Error(`Unknown query type: ${e}`)}}async searchWithProviders(e,r,t){const i=H.create(!1),o=[],n=this.groupFolderQueriesByScheme(e),l=[...n.keys()].some(s=>this.getSearchProvider(e.type).has(s));return e.type===m.aiText&&!l?[]:(await Promise.all([...n.keys()].map(async s=>{if(e.onlyFileScheme&&s!==v.file)return;const a=n.get(s);let c=this.getSearchProvider(e.type).get(s);if(!c)if(l){this.loggedSchemesMissingProviders.has(s)||(this.logService.warn(`No search provider registered for scheme: ${s}. Another scheme has a provider, not waiting for ${s}`),this.loggedSchemesMissingProviders.add(s));return}else this.loggedSchemesMissingProviders.has(s)||(this.logService.warn(`No search provider registered for scheme: ${s}, waiting`),this.loggedSchemesMissingProviders.add(s)),c=await this.waitForProvider(e.type,s);const h={...e,folderQueries:a},y=()=>{switch(e.type){case m.File:return c.fileSearch(h,t);case m.Text:return c.textSearch(h,r,t);default:return c.textSearch(h,r,t)}};o.push(y())})),Promise.all(o).then(s=>{const a=i.elapsed();return this.logService.trace(`SearchService#search: ${a}ms`),s.forEach(c=>{this.sendTelemetry(e,a,c)}),s},s=>{const a=i.elapsed();this.logService.trace(`SearchService#search: ${a}ms`);const c=Y(s);throw this.logService.trace(`SearchService#searchError: ${c.message}`),this.sendTelemetry(e,a,void 0,c),c}))}groupFolderQueriesByScheme(e){const r=new Map;return e.folderQueries.forEach(t=>{const i=r.get(t.folder.scheme)||[];i.push(t),r.set(t.folder.scheme,i)}),r}sendTelemetry(e,r,t,i){const o=e.folderQueries.every(s=>s.folder.scheme===v.file),n=e.folderQueries.every(s=>s.folder.scheme!==v.file),l=o?v.file:n?"other":"mixed";if(e.type===m.File&&t&&t.stats){const s=t.stats;if(s.fromCache){const a=s.detailStats;this.telemetryService.publicLog2("cachedSearchComplete",{reason:e._reason,resultCount:s.resultCount,workspaceFolderCount:e.folderQueries.length,endToEndTime:r,sortingTime:s.sortingTime,cacheWasResolved:a.cacheWasResolved,cacheLookupTime:a.cacheLookupTime,cacheFilterTime:a.cacheFilterTime,cacheEntryCount:a.cacheEntryCount,scheme:l})}else{const a=s.detailStats;this.telemetryService.publicLog2("searchComplete",{reason:e._reason,resultCount:s.resultCount,workspaceFolderCount:e.folderQueries.length,endToEndTime:r,sortingTime:s.sortingTime,fileWalkTime:a.fileWalkTime,directoriesWalked:a.directoriesWalked,filesWalked:a.filesWalked,cmdTime:a.cmdTime,cmdResultCount:a.cmdResultCount,scheme:l})}}else if(e.type===m.Text){let s;i&&(s=i.code===S.regexParseError?"regex":i.code===S.unknownEncoding?"encoding":i.code===S.globParseError?"glob":i.code===S.invalidLiteral?"literal":i.code===S.other?"other":i.code===S.canceled?"canceled":"unknown"),this.telemetryService.publicLog2("textSearchComplete",{reason:e._reason,workspaceFolderCount:e.folderQueries.length,endToEndTime:r,scheme:l,error:s})}}getOpenEditorResults(e){const r=new P(i=>this.uriIdentityService.extUri.getComparisonKey(i));let t=!1;if(e.type===m.Text){const i=new P;for(const n of this.editorService.editors){const l=C.getCanonicalUri(n,{supportSideBySide:w.PRIMARY}),s=C.getOriginalUri(n,{supportSideBySide:w.PRIMARY});l&&i.set(l,s??l)}this.modelService.getModels().forEach(n=>{const l=n.uri;if(!l||t)return;const s=i.get(l);if(!s||n.getLanguageId()===J&&!(e.includePattern&&e.includePattern["**/*.code-search"])||s.scheme!==v.untitled&&!this.fileService.hasProvider(s)||s.scheme==="git"||!this.matches(s,e))return;const a=(W(e.maxResults)?e.maxResults:G)+1;let c=n.findMatches(e.contentPattern.pattern,!1,!!e.contentPattern.isRegExp,!!e.contentPattern.isCaseSensitive,e.contentPattern.isWordMatch?e.contentPattern.wordSeparators:null,!1,a);if(c.length){a&&c.length>=a&&(t=!0,c=c.slice(0,a-1));const h=new j(s);r.set(s,h);const y=K(c,n,e.previewOptions);h.results=X(y,n,e)}else r.set(s,null)})}return{results:r,limitHit:t}}matches(e,r){return z(r,e.fsPath)}async clearCache(e){const r=Array.from(this.fileSearchProviders.values()).map(t=>t&&t.clearCache(e));await Promise.all(r)}};g=T([d(0,B),d(1,O),d(2,_),d(3,L),d(4,N),d(5,U),d(6,$)],g);export{g as SearchService};
