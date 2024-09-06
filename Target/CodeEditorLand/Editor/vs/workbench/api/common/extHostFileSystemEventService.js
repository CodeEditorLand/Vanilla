import"../../../base/common/cancellation.js";import{AsyncEmitter as h,Emitter as m}from"../../../base/common/event.js";import{GLOB_SPLIT as y,GLOBSTAR as C,parse as W}from"../../../base/common/glob.js";import{Lazy as u}from"../../../base/common/lazy.js";import{URI as a}from"../../../base/common/uri.js";import"../../../platform/extensions/common/extensions.js";import{FileChangeFilter as f,FileOperation as E}from"../../../platform/files/common/files.js";import"../../../platform/log/common/log.js";import{MainContext as x}from"./extHost.protocol.js";import"./extHostDocumentsAndEditors.js";import*as _ from"./extHostTypeConverters.js";import{Disposable as g,WorkspaceEdit as I}from"./extHostTypes.js";import"./extHostWorkspace.js";class S{session=Math.random();_onDidCreate=new m;_onDidChange=new m;_onDidDelete=new m;_disposable;_config;get ignoreCreateEvents(){return!!(this._config&1)}get ignoreChangeEvents(){return!!(this._config&2)}get ignoreDeleteEvents(){return!!(this._config&4)}constructor(t,n,e,i,o,r){this._config=0,r?.ignoreCreateEvents&&(this._config+=1),r?.ignoreChangeEvents&&(this._config+=2),r?.ignoreDeleteEvents&&(this._config+=4);const c=W(o),l=typeof o=="string",s=r?.correlate,p=i(v=>{if(!(typeof v.session=="number"&&v.session!==this.session)&&!(s&&typeof v.session>"u")){if(!r?.ignoreCreateEvents)for(const D of v.created){const d=a.revive(D);c(d.fsPath)&&(!l||n.getWorkspaceFolder(d))&&this._onDidCreate.fire(d)}if(!r?.ignoreChangeEvents)for(const D of v.changed){const d=a.revive(D);c(d.fsPath)&&(!l||n.getWorkspaceFolder(d))&&this._onDidChange.fire(d)}if(!r?.ignoreDeleteEvents)for(const D of v.deleted){const d=a.revive(D);c(d.fsPath)&&(!l||n.getWorkspaceFolder(d))&&this._onDidDelete.fire(d)}}});this._disposable=g.from(this.ensureWatching(t,e,o,r,r?.correlate),this._onDidCreate,this._onDidChange,this._onDidDelete,p)}ensureWatching(t,n,e,i,o){const r=g.from();if(typeof e=="string"||i?.ignoreChangeEvents&&i?.ignoreCreateEvents&&i?.ignoreDeleteEvents)return r;const c=t.getProxy(x.MainThreadFileSystemEventService);let l=!1;(e.pattern.includes(C)||e.pattern.includes(y))&&(l=!0);let s;return o&&(i?.ignoreChangeEvents||i?.ignoreCreateEvents||i?.ignoreDeleteEvents)&&(s=f.UPDATED|f.ADDED|f.DELETED,i?.ignoreChangeEvents&&(s&=~f.UPDATED),i?.ignoreCreateEvents&&(s&=~f.ADDED),i?.ignoreDeleteEvents&&(s&=~f.DELETED)),c.$watch(n.identifier.value,this.session,e.baseUri,{recursive:l,excludes:i?.excludes??[],filter:s},!!o),g.from({dispose:()=>c.$unwatch(this.session)})}dispose(){this._disposable.dispose()}get onDidCreate(){return this._onDidCreate.event}get onDidChange(){return this._onDidChange.event}get onDidDelete(){return this._onDidDelete.event}}class w{constructor(t){this._events=t}session=this._events.session;_created=new u(()=>this._events.created.map(a.revive));get created(){return this._created.value}_changed=new u(()=>this._events.changed.map(a.revive));get changed(){return this._changed.value}_deleted=new u(()=>this._events.deleted.map(a.revive));get deleted(){return this._deleted.value}}class ie{constructor(t,n,e){this._mainContext=t;this._logService=n;this._extHostDocumentsAndEditors=e}_onFileSystemEvent=new m;_onDidRenameFile=new m;_onDidCreateFile=new m;_onDidDeleteFile=new m;_onWillRenameFile=new h;_onWillCreateFile=new h;_onWillDeleteFile=new h;onDidRenameFile=this._onDidRenameFile.event;onDidCreateFile=this._onDidCreateFile.event;onDidDeleteFile=this._onDidDeleteFile.event;createFileSystemWatcher(t,n,e,i){return new S(this._mainContext,t,n,this._onFileSystemEvent.event,_.GlobPattern.from(e),i)}$onFileEvent(t){this._onFileSystemEvent.fire(new w(t))}$onDidRunFileOperation(t,n){switch(t){case E.MOVE:this._onDidRenameFile.fire(Object.freeze({files:n.map(e=>({oldUri:a.revive(e.source),newUri:a.revive(e.target)}))}));break;case E.DELETE:this._onDidDeleteFile.fire(Object.freeze({files:n.map(e=>a.revive(e.target))}));break;case E.CREATE:case E.COPY:this._onDidCreateFile.fire(Object.freeze({files:n.map(e=>a.revive(e.target))}));break;default:}}getOnWillRenameFileEvent(t){return this._createWillExecuteEvent(t,this._onWillRenameFile)}getOnWillCreateFileEvent(t){return this._createWillExecuteEvent(t,this._onWillCreateFile)}getOnWillDeleteFileEvent(t){return this._createWillExecuteEvent(t,this._onWillDeleteFile)}_createWillExecuteEvent(t,n){return(e,i,o)=>{const r=function(l){e.call(i,l)};return r.extension=t,n.event(r,void 0,o)}}async $onWillRunFileOperation(t,n,e,i){switch(t){case E.MOVE:return await this._fireWillEvent(this._onWillRenameFile,{files:n.map(o=>({oldUri:a.revive(o.source),newUri:a.revive(o.target)}))},e,i);case E.DELETE:return await this._fireWillEvent(this._onWillDeleteFile,{files:n.map(o=>a.revive(o.target))},e,i);case E.CREATE:case E.COPY:return await this._fireWillEvent(this._onWillCreateFile,{files:n.map(o=>a.revive(o.target))},e,i)}}async _fireWillEvent(t,n,e,i){const o=new Set,r=[];if(await t.fireAsync(n,i,async(l,s)=>{const p=Date.now(),v=await Promise.resolve(l);v instanceof I&&(r.push([s.extension,v]),o.add(s.extension.displayName??s.extension.identifier.value)),Date.now()-p>e&&this._logService.warn("SLOW file-participant",s.extension.identifier)}),i.isCancellationRequested||r.length===0)return;const c={edits:[]};for(const[,l]of r){const{edits:s}=_.WorkspaceEdit.from(l,{getTextDocumentVersion:p=>this._extHostDocumentsAndEditors.getDocument(p)?.version,getNotebookDocumentVersion:()=>{}});c.edits=c.edits.concat(s)}return{edit:c,extensionNames:Array.from(o)}}}export{ie as ExtHostFileSystemEventService};
