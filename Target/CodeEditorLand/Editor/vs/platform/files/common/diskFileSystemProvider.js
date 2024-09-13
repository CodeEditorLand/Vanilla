import{insert as a}from"../../../base/common/arrays.js";import{ThrottledDelayer as o}from"../../../base/common/async.js";import{onUnexpectedError as n}from"../../../base/common/errors.js";import{Emitter as c}from"../../../base/common/event.js";import{removeTrailingPathSeparator as u}from"../../../base/common/extpath.js";import{Disposable as g,toDisposable as h}from"../../../base/common/lifecycle.js";import{normalize as d}from"../../../base/common/path.js";import{LogLevel as t}from"../../log/common/log.js";import{isRecursiveWatchRequest as l,reviveFileChanges as v}from"./watcher.js";class q extends g{constructor(e,r){super();this.logService=e;this.options=r}_onDidChangeFile=this._register(new c);onDidChangeFile=this._onDidChangeFile.event;_onDidWatchError=this._register(new c);onDidWatchError=this._onDidWatchError.event;watch(e,r){return r.recursive||this.options?.watcher?.forceUniversal?this.watchUniversal(e,r):this.watchNonRecursive(e,r)}universalWatcher;universalWatchRequests=[];universalWatchRequestDelayer=this._register(new o(0));watchUniversal(e,r){const i={path:this.toWatchPath(e),excludes:r.excludes,includes:r.includes,recursive:r.recursive,filter:r.filter,correlationId:r.correlationId},s=a(this.universalWatchRequests,i);return this.refreshUniversalWatchers(),h(()=>{s(),this.refreshUniversalWatchers()})}refreshUniversalWatchers(){this.universalWatchRequestDelayer.trigger(()=>this.doRefreshUniversalWatchers()).catch(e=>n(e))}doRefreshUniversalWatchers(){this.universalWatcher||(this.universalWatcher=this._register(this.createUniversalWatcher(r=>this._onDidChangeFile.fire(v(r)),r=>this.onWatcherLogMessage(r),this.logService.getLevel()===t.Trace)),this._register(this.logService.onDidChangeLogLevel(()=>{this.universalWatcher?.setVerboseLogging(this.logService.getLevel()===t.Trace)})));const e=this.options?.watcher?.recursive?.usePolling;if(e===!0)for(const r of this.universalWatchRequests)l(r)&&(r.pollingInterval=this.options?.watcher?.recursive?.pollingInterval??5e3);else if(Array.isArray(e))for(const r of this.universalWatchRequests)l(r)&&e.includes(r.path)&&(r.pollingInterval=this.options?.watcher?.recursive?.pollingInterval??5e3);return this.universalWatcher.watch(this.universalWatchRequests)}nonRecursiveWatcher;nonRecursiveWatchRequests=[];nonRecursiveWatchRequestDelayer=this._register(new o(0));watchNonRecursive(e,r){const i={path:this.toWatchPath(e),excludes:r.excludes,includes:r.includes,recursive:!1,filter:r.filter,correlationId:r.correlationId},s=a(this.nonRecursiveWatchRequests,i);return this.refreshNonRecursiveWatchers(),h(()=>{s(),this.refreshNonRecursiveWatchers()})}refreshNonRecursiveWatchers(){this.nonRecursiveWatchRequestDelayer.trigger(()=>this.doRefreshNonRecursiveWatchers()).catch(e=>n(e))}doRefreshNonRecursiveWatchers(){return this.nonRecursiveWatcher||(this.nonRecursiveWatcher=this._register(this.createNonRecursiveWatcher(e=>this._onDidChangeFile.fire(v(e)),e=>this.onWatcherLogMessage(e),this.logService.getLevel()===t.Trace)),this._register(this.logService.onDidChangeLogLevel(()=>{this.nonRecursiveWatcher?.setVerboseLogging(this.logService.getLevel()===t.Trace)}))),this.nonRecursiveWatcher.watch(this.nonRecursiveWatchRequests)}onWatcherLogMessage(e){e.type==="error"&&this._onDidWatchError.fire(e.message),this.logWatcherMessage(e)}logWatcherMessage(e){this.logService[e.type](e.message)}toFilePath(e){return d(e.fsPath)}toWatchPath(e){const r=this.toFilePath(e);return u(r)}}export{q as AbstractDiskFileSystemProvider};
