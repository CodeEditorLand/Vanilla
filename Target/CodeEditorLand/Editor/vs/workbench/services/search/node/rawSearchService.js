import*as w from"../../../../base/common/arrays.js";import{createCancelablePromise as p}from"../../../../base/common/async.js";import"../../../../base/common/cancellation.js";import{canceled as T}from"../../../../base/common/errors.js";import{Emitter as y}from"../../../../base/common/event.js";import{compareItemsByFuzzyScore as M,prepareQuery as R}from"../../../../base/common/fuzzyScorer.js";import{revive as z}from"../../../../base/common/marshalling.js";import{basename as x,dirname as b,join as E,sep as f}from"../../../../base/common/path.js";import{StopWatch as C}from"../../../../base/common/stopwatch.js";import{URI as Q}from"../../../../base/common/uri.js";import{ByteSize as A}from"../../../../platform/files/common/files.js";import{DEFAULT_MAX_SEARCH_RESULTS as k,isFilePatternMatch as L}from"../common/search.js";import{Engine as P}from"./fileSearch.js";import{TextSearchEngineAdapter as H}from"./textSearchAdapter.js";class F{constructor(r="searchProcess",e){this.processType=r;this.getNumThreads=e}static BATCH_SIZE=512;caches=Object.create(null);fileSearch(r){let e;const a=g(r),t=new y({onDidAddFirstListener:()=>{e=p(async i=>{const u=await this.getNumThreads?.();return this.doFileSearchWithEngine(P,a,s=>t.fire(s),i,F.BATCH_SIZE,u)}),e.then(i=>t.fire(i),i=>t.fire({type:"error",error:{message:i.message,stack:i.stack}}))},onDidRemoveLastListener:()=>{e.cancel()}});return t.event}textSearch(r){let e;const a=g(r),t=new y({onDidAddFirstListener:()=>{e=p(i=>this.ripgrepTextSearch(a,u=>t.fire(u),i)),e.then(i=>t.fire(i),i=>t.fire({type:"error",error:{message:i.message,stack:i.stack}}))},onDidRemoveLastListener:()=>{e.cancel()}});return t.event}async ripgrepTextSearch(r,e,a){r.maxFileSize=this.getPlatformFileLimits().maxFileSize;const t=await this.getNumThreads?.();return new H(r,t).search(a,e,e)}getPlatformFileLimits(){return{maxFileSize:16*A.GB}}doFileSearch(r,e,a,t){return this.doFileSearchWithEngine(P,r,a,t,F.BATCH_SIZE,e)}doFileSearchWithEngine(r,e,a,t,i=F.BATCH_SIZE,u){let s=0;const c=n=>{Array.isArray(n)?(s+=n.length,a(n.map(h=>this.rawMatchToSearchItem(h)))):n.relativePath?(s++,a(this.rawMatchToSearchItem(n))):a(n)};if(e.sortByScore){let n=this.trySortedSearchFromCache(e,c,t);if(!n){const h=e.maxResults?Object.assign({},e,{maxResults:null}):e,l=new r(h,u);n=this.doSortedSearch(l,e,a,c,t)}return new Promise((h,l)=>{n.then(([S,I])=>{const d=I.map(v=>this.rawMatchToSearchItem(v));this.sendProgress(d,a,i),h(S)},l)})}const o=new r(e,u);return this.doSearch(o,c,i,t).then(n=>({limitHit:n.limitHit,type:"success",stats:{detailStats:n.stats,type:this.processType,fromCache:!1,resultCount:s,sortingTime:void 0},messages:[]}))}rawMatchToSearchItem(r){return{path:r.base?E(r.base,r.relativePath):r.relativePath}}doSortedSearch(r,e,a,t,i){const u=new y;let s=p(o=>{let n=[];const h=l=>{Array.isArray(l)?n=l:(t(l),u.fire(l))};return this.doSearch(r,h,-1,o).then(l=>[l,n])}),c;if(e.cacheKey){c=this.getOrCreateCache(e.cacheKey);const o={promise:s,event:u.event,resolved:!1};c.resultsToSearchCache[e.filePattern||""]=o,s.then(()=>{o.resolved=!0},n=>{delete c.resultsToSearchCache[e.filePattern||""]}),s=this.preventCancellation(s)}return s.then(([o,n])=>{const h=c?c.scorerCache:Object.create(null),l=(typeof e.maxResults!="number"||e.maxResults>0)&&C.create(!1);return this.sortResults(e,n,h,i).then(S=>{const I=l?l.elapsed():-1;return[{type:"success",stats:{detailStats:o.stats,sortingTime:I,fromCache:!1,type:this.processType,resultCount:S.length},messages:o.messages,limitHit:o.limitHit||typeof e.maxResults=="number"&&n.length>e.maxResults},S]})})}getOrCreateCache(r){const e=this.caches[r];return e||(this.caches[r]=new O)}trySortedSearchFromCache(r,e,a){const t=r.cacheKey&&this.caches[r.cacheKey];if(!t)return;const i=this.getResultsFromCache(t,r.filePattern||"",e,a);if(i)return i.then(([u,s,c])=>{const o=C.create(!1);return this.sortResults(r,s,t.scorerCache,a).then(n=>{const h=o.elapsed(),l={fromCache:!0,detailStats:c,type:this.processType,resultCount:s.length,sortingTime:h};return[{type:"success",limitHit:u.limitHit||typeof r.maxResults=="number"&&s.length>r.maxResults,stats:l,messages:[]},n]})})}sortResults(r,e,a,t){const i=R(r.filePattern||""),u=(c,o)=>M(c,o,i,!0,W,a),s=typeof r.maxResults=="number"?r.maxResults:k;return w.topAsync(e,u,s,1e4,t)}sendProgress(r,e,a){if(a&&a>0)for(let t=0;t<r.length;t+=a)e(r.slice(t,t+a));else e(r)}getResultsFromCache(r,e,a,t){const i=C.create(!1),u=e.indexOf(f)>=0;let s;for(const h in r.resultsToSearchCache)if(e.startsWith(h)){if(u&&h.indexOf(f)<0&&h!=="")continue;const l=r.resultsToSearchCache[h];s={promise:this.preventCancellation(l.promise),event:l.event,resolved:l.resolved};break}if(!s)return null;const c=i.elapsed(),o=C.create(!1),n=s.event(a);return t&&t.onCancellationRequested(()=>{n.dispose()}),s.promise.then(([h,l])=>{if(t&&t.isCancellationRequested)throw T();const S=[],I=R(e).normalizedLowercase;for(const d of l)L(d,I)&&S.push(d);return[h,S,{cacheWasResolved:s.resolved,cacheLookupTime:c,cacheFilterTime:o.elapsed(),cacheEntryCount:l.length}]})}doSearch(r,e,a,t){return new Promise((i,u)=>{let s=[];t?.onCancellationRequested(()=>r.cancel()),r.search(c=>{c&&(a?(s.push(c),a>0&&s.length>=a&&(e(s),s=[])):e(c))},c=>{e(c)},(c,o)=>{s.length&&e(s),c?(e({message:"Search finished. Error: "+c.message}),u(c)):(e({message:"Search finished. Stats: "+JSON.stringify(o.stats)}),i(o))})})}clearCache(r){return delete this.caches[r],Promise.resolve(void 0)}preventCancellation(r){return new class{get[Symbol.toStringTag](){return this.toString()}cancel(){}then(e,a){return r.then(e,a)}catch(e){return this.then(void 0,e)}finally(e){return r.finally(e)}}}}class O{resultsToSearchCache=Object.create(null);scorerCache=Object.create(null)}const W=new class{getItemLabel(m){return x(m.relativePath)}getItemDescription(m){return b(m.relativePath)}getItemPath(m){return m.relativePath}};function g(m){return{...m,folderQueries:m.folderQueries&&m.folderQueries.map(U),extraFileResources:m.extraFileResources&&m.extraFileResources.map(r=>Q.revive(r))}}function U(m){return z(m)}export{F as SearchService};
