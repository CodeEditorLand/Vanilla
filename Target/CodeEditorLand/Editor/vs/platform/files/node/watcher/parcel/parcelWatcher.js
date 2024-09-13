import*as S from"@parcel/watcher";import*as x from"@bpasero/watcher";import{existsSync as T,statSync as k,unlinkSync as $}from"fs";import{tmpdir as N,homedir as M}from"os";import{URI as I}from"../../../../../base/common/uri.js";import{DeferredPromise as v,RunOnceScheduler as C,RunOnceWorker as y,ThrottledWorker as H}from"../../../../../base/common/async.js";import{CancellationTokenSource as R}from"../../../../../base/common/cancellation.js";import{toErrorMessage as P}from"../../../../../base/common/errorMessage.js";import{Emitter as E,Event as w}from"../../../../../base/common/event.js";import{randomPath as U,isEqual as m,isEqualOrParent as O}from"../../../../../base/common/extpath.js";import{GLOBSTAR as z,patternsEquals as b}from"../../../../../base/common/glob.js";import{BaseWatcher as B}from"../baseWatcher.js";import{TernarySearchTree as G}from"../../../../../base/common/ternarySearchTree.js";import{normalizeNFC as j}from"../../../../../base/common/normalization.js";import{dirname as K,normalize as V,join as Y}from"../../../../../base/common/path.js";import{isLinux as d,isMacintosh as X,isWindows as q}from"../../../../../base/common/platform.js";import{realcaseSync as J,realpathSync as F}from"../../../../../base/node/extpath.js";import{NodeJSFileWatcherLibrary as Q}from"../nodejs/nodejsWatcherLib.js";import{FileChangeType as h}from"../../../common/files.js";import{coalesceEvents as Z,parseWatcherPatterns as _,isFiltered as ee}from"../../../common/watcher.js";import{Disposable as te,DisposableStore as re,toDisposable as A}from"../../../../../base/common/lifecycle.js";const W=process.env.VSCODE_USE_WATCHER2==="true",D=W?x:S;class L extends te{constructor(t,i,r,s,n,o){super();this.ready=t;this.request=i;this.restarts=r;this.token=s;this.worker=n;this.stopFn=o;this._register(A(()=>this.subscriptions.clear()))}_onDidStop=this._register(new E);onDidStop=this._onDidStop.event;_onDidFail=this._register(new E);onDidFail=this._onDidFail.event;didFail=!1;get failed(){return this.didFail}didStop=!1;get stopped(){return this.didStop}includes=this.request.includes?_(this.request.path,this.request.includes):void 0;excludes=this.request.excludes?_(this.request.path,this.request.excludes):void 0;subscriptions=new Map;subscribe(t,i){t=I.file(t).fsPath;let r=this.subscriptions.get(t);return r||(r=new Set,this.subscriptions.set(t,r)),r.add(i),A(()=>{const s=this.subscriptions.get(t);s&&(s.delete(i),s.size===0&&this.subscriptions.delete(t))})}get subscriptionsCount(){return this.subscriptions.size}notifyFileChange(t,i){const r=this.subscriptions.get(t);if(r)for(const s of r)s(i)}notifyWatchFailed(){this.didFail=!0,this._onDidFail.fire()}include(t){return!this.includes||this.includes.length===0?!0:this.includes.some(i=>i(t))}exclude(t){return!!this.excludes?.some(i=>i(t))}async stop(t){this.didStop=!0;try{await this.stopFn()}finally{this._onDidStop.fire({joinRestart:t}),this.dispose()}}}class a extends B{static MAP_PARCEL_WATCHER_ACTION_TO_FILE_CHANGE=new Map([["create",h.ADDED],["update",h.UPDATED],["delete",h.DELETED]]);static PREDEFINED_EXCLUDES={win32:[],darwin:[Y(M(),"Library","Containers")],linux:[]};static PARCEL_WATCHER_BACKEND=q?"windows":d?"inotify":"fs-events";_onDidError=this._register(new E);onDidError=this._onDidError.event;watchers=new Set;static FILE_CHANGES_HANDLER_DELAY=75;throttledFileChangesEmitter=this._register(new H({maxWorkChunkSize:500,throttleDelay:200,maxBufferedWork:3e4},e=>this._onDidChangeFile.fire(e)));enospcErrorLogged=!1;constructor(){super(),this.registerListeners()}registerListeners(){process.on("uncaughtException",e=>this.onUnexpectedError(e)),process.on("unhandledRejection",e=>this.onUnexpectedError(e))}async doWatch(e){e=this.removeDuplicateRequests(e);const t=[],i=new Set(Array.from(this.watchers));for(const r of e){const s=this.findWatcher(r);s&&b(s.request.excludes,r.excludes)&&b(s.request.includes,r.includes)&&s.request.pollingInterval===r.pollingInterval?i.delete(s):t.push(r)}t.length&&this.trace(`Request to start watching: ${t.map(r=>this.requestToString(r)).join(",")}`),i.size&&this.trace(`Request to stop watching: ${Array.from(i).map(r=>this.requestToString(r.request)).join(",")}`);for(const r of i)await this.stopWatching(r);for(const r of t)r.pollingInterval?this.startPolling(r,r.pollingInterval):await this.startWatching(r)}findWatcher(e){for(const t of this.watchers)if(this.isCorrelated(e)||this.isCorrelated(t.request)){if(t.request.correlationId===e.correlationId)return t}else if(m(t.request.path,e.path,!d))return t}startPolling(e,t,i=0){const r=new R,s=new v,n=U(N(),"vscode-watcher-snapshot"),o=new L(s.p,e,i,r.token,new y(g=>this.handleParcelEvents(g,o),a.FILE_CHANGES_HANDLER_DELAY),async()=>{r.dispose(!0),o.worker.flush(),o.worker.dispose(),f.dispose(),$(n)});this.watchers.add(o);const{realPath:c,realPathDiffers:l,realPathLength:p}=this.normalizePath(e);this.trace(`Started watching: '${c}' with polling interval '${t}'`);let u=0;const f=new C(async()=>{if(u++,!r.token.isCancellationRequested){if(u>1){const g=await D.getEventsSince(c,n,{ignore:this.addPredefinedExcludes(e.excludes),backend:a.PARCEL_WATCHER_BACKEND});if(r.token.isCancellationRequested)return;this.onParcelEvents(g,o,l,p)}await D.writeSnapshot(c,n,{ignore:this.addPredefinedExcludes(e.excludes),backend:a.PARCEL_WATCHER_BACKEND}),u===1&&s.complete(),!r.token.isCancellationRequested&&f.schedule()}},t);f.schedule(0)}async startWatching(e,t=0){const i=new R,r=new v,s=new L(r.p,e,t,i.token,new y(l=>this.handleParcelEvents(l,s),a.FILE_CHANGES_HANDLER_DELAY),async()=>{i.dispose(!0),s.worker.flush(),s.worker.dispose(),await(await r.p)?.unsubscribe()});this.watchers.add(s);const{realPath:n,realPathDiffers:o,realPathLength:c}=this.normalizePath(e);try{const l=await D.subscribe(n,(p,u)=>{s.token.isCancellationRequested||(p&&this.onUnexpectedError(p,e),this.onParcelEvents(u,s,o,c))},{backend:a.PARCEL_WATCHER_BACKEND,ignore:this.addPredefinedExcludes(s.request.excludes)});this.trace(`Started watching: '${n}' with backend '${a.PARCEL_WATCHER_BACKEND}'`),r.complete(l)}catch(l){this.onUnexpectedError(l,e),r.complete(void 0),s.notifyWatchFailed(),this._onDidWatchFail.fire(e)}}addPredefinedExcludes(e){const t=[...e],i=a.PREDEFINED_EXCLUDES[process.platform];if(Array.isArray(i))for(const r of i)t.includes(r)||t.push(r);return t}onParcelEvents(e,t,i,r){if(e.length===0)return;this.normalizeEvents(e,t.request,i,r);const s=this.handleIncludes(t,e);for(const n of s)t.worker.work(n)}handleIncludes(e,t){const i=[];for(const{path:r,type:s}of t){const n=a.MAP_PARCEL_WATCHER_ACTION_TO_FILE_CHANGE.get(s);this.verboseLogging&&this.traceWithCorrelation(`${n===h.ADDED?"[ADDED]":n===h.DELETED?"[DELETED]":"[CHANGED]"} ${r}`,e.request),e.include(r)?i.push({type:n,resource:I.file(r),cId:e.request.correlationId}):this.verboseLogging&&this.traceWithCorrelation(` >> ignored (not included) ${r}`,e.request)}return i}handleParcelEvents(e,t){const i=Z(e),{events:r,rootDeleted:s}=this.filterEvents(i,t);this.emitEvents(r,t),s&&this.onWatchedPathDeleted(t)}emitEvents(e,t){if(e.length===0)return;this.throttledFileChangesEmitter.work(e)?this.throttledFileChangesEmitter.pending>0&&this.trace(`started throttling events due to large amount of file change events at once (pending: ${this.throttledFileChangesEmitter.pending}, most recent change: ${e[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`,t):this.warn(`started ignoring events due to too many file change events at once (incoming: ${e.length}, most recent change: ${e[0].resource.fsPath}). Use 'files.watcherExclude' setting to exclude folders with lots of changing files (e.g. compilation output).`)}normalizePath(e){let t=e.path,i=!1,r=e.path.length;try{t=F(e.path),e.path===t&&(t=J(e.path)??e.path),e.path!==t&&(r=t.length,i=!0,this.trace(`correcting a path to watch that seems to be a symbolic link or wrong casing (original: ${e.path}, real: ${t})`))}catch{}return{realPath:t,realPathDiffers:i,realPathLength:r}}normalizeEvents(e,t,i,r){for(const s of e)X&&(s.path=j(s.path)),q&&t.path.length<=3&&(s.path=V(s.path)),i&&(s.path=t.path+s.path.substr(r))}filterEvents(e,t){const i=[];let r=!1;const s=this.isCorrelated(t.request)?t.request.filter:void 0;for(const n of e){if(t.subscriptionsCount>0&&t.notifyFileChange(n.resource.fsPath,n),r=n.type===h.DELETED&&m(n.resource.fsPath,t.request.path,!d),ee(n,s)||r&&!this.isCorrelated(t.request)){this.verboseLogging&&this.traceWithCorrelation(` >> ignored (filtered) ${n.resource.fsPath}`,t.request);continue}this.traceEvent(n,t.request),i.push(n)}return{events:i,rootDeleted:r}}onWatchedPathDeleted(e){this.warn("Watcher shutdown because watched path got deleted",e);let t=!1;this.isCorrelated(e.request)||(t=this.legacyMonitorRequest(e)),t||(e.notifyWatchFailed(),this._onDidWatchFail.fire(e.request))}legacyMonitorRequest(e){const t=K(e.request.path);if(T(t)){this.trace("Trying to watch on the parent path to restart the watcher...",e);const i=new Q({path:t,excludes:[],recursive:!1,correlationId:e.request.correlationId},void 0,r=>{if(!e.token.isCancellationRequested){for(const{resource:s,type:n}of r)if(m(s.fsPath,e.request.path,!d)&&(n===h.ADDED||n===h.UPDATED)&&this.isPathValid(e.request.path)){this.warn("Watcher restarts because watched path got created again",e),i.dispose(),this.restartWatching(e);break}}},void 0,r=>this._onDidLogMessage.fire(r),this.verboseLogging);return e.token.onCancellationRequested(()=>i.dispose()),!0}return!1}onUnexpectedError(e,t){const i=P(e);i.indexOf("No space left on device")!==-1?this.enospcErrorLogged||(this.error("Inotify limit reached (ENOSPC)",t),this.enospcErrorLogged=!0):(this.error(`Unexpected error: ${i} (EUNKNOWN)`,t),this._onDidError.fire({request:t,error:i}))}async stop(){await super.stop();for(const e of this.watchers)await this.stopWatching(e)}restartWatching(e,t=800){const i=new C(async()=>{if(e.token.isCancellationRequested)return;const r=new v;try{await this.stopWatching(e,r.p),e.request.pollingInterval?this.startPolling(e.request,e.request.pollingInterval,e.restarts+1):await this.startWatching(e.request,e.restarts+1)}finally{r.complete()}},t);i.schedule(),e.token.onCancellationRequested(()=>i.dispose())}async stopWatching(e,t){this.trace("stopping file watcher",e),this.watchers.delete(e);try{await e.stop(t)}catch(i){this.error(`Unexpected error stopping watcher: ${P(i)}`,e.request)}}removeDuplicateRequests(e,t=!0){e.sort((s,n)=>s.path.length-n.path.length);const i=new Map;for(const s of e){if(s.excludes.includes(z))continue;const n=d?s.path:s.path.toLowerCase();let o=i.get(s.correlationId);o||(o=new Map,i.set(s.correlationId,o)),o.has(n)&&this.trace(`ignoring a request for watching who's path is already watched: ${this.requestToString(s)}`),o.set(n,s)}const r=[];for(const s of i.values()){const n=G.forPaths(!d);for(const o of s.values()){if(n.findSubstr(o.path))try{if(F(o.path)===o.path){this.trace(`ignoring a request for watching who's parent is already watched: ${this.requestToString(o)}`);continue}}catch(c){this.trace(`ignoring a request for watching who's realpath failed to resolve: ${this.requestToString(o)} (error: ${c})`),this._onDidWatchFail.fire(o);continue}if(t&&!this.isPathValid(o.path)){this._onDidWatchFail.fire(o);continue}n.set(o.path,o)}r.push(...Array.from(n).map(([,o])=>o))}return r}isPathValid(e){try{if(!k(e).isDirectory())return this.trace(`ignoring a path for watching that is a file and not a folder: ${e}`),!1}catch(t){return this.trace(`ignoring a path for watching who's stat info failed to resolve: ${e} (error: ${t})`),!1}return!0}subscribe(e,t){for(const i of this.watchers){if(i.failed||!O(e,i.request.path,!d)||i.exclude(e)||!i.include(e))continue;const r=new re;return r.add(w.once(i.onDidStop)(async s=>{await s.joinRestart,!r.isDisposed&&t(!0)})),r.add(w.once(i.onDidFail)(()=>t(!0))),r.add(i.subscribe(e,s=>t(null,s))),r}}trace(e,t){this.verboseLogging&&this._onDidLogMessage.fire({type:"trace",message:this.toMessage(e,t?.request)})}warn(e,t){this._onDidLogMessage.fire({type:"warn",message:this.toMessage(e,t?.request)})}error(e,t){this._onDidLogMessage.fire({type:"error",message:this.toMessage(e,t)})}toMessage(e,t){return t?`[File Watcher (${W?"parcel-next":"parcel-classic"})] ${e} (path: ${t.path})`:`[File Watcher (${W?"parcel-next":"parcel-classic"})] ${e}`}get recursiveWatcher(){return this}}export{a as ParcelWatcher,L as ParcelWatcherInstance};
