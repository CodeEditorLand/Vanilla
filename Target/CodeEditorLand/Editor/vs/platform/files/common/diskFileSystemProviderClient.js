import{VSBuffer as o}from"../../../base/common/buffer.js";import{toErrorMessage as c}from"../../../base/common/errorMessage.js";import{canceled as h}from"../../../base/common/errors.js";import{Emitter as m,Event as y}from"../../../base/common/event.js";import{Disposable as F,DisposableStore as b,toDisposable as I}from"../../../base/common/lifecycle.js";import{newWriteableStream as C}from"../../../base/common/stream.js";import{generateUuid as d}from"../../../base/common/uuid.js";import{FileSystemProviderCapabilities as a,FileSystemProviderErrorCode as v,createFileSystemProviderError as u}from"./files.js";import{reviveFileChanges as S}from"./watcher.js";const E="localFilesystem";class k extends F{constructor(e,i){super();this.channel=e;this.extraCapabilities=i;this.registerFileChangeListeners()}onDidChangeCapabilities=y.None;_capabilities;get capabilities(){return this._capabilities||(this._capabilities=a.FileReadWrite|a.FileOpenReadWriteClose|a.FileReadStream|a.FileFolderCopy|a.FileWriteUnlock|a.FileAtomicRead|a.FileAtomicWrite|a.FileAtomicDelete|a.FileClone,this.extraCapabilities.pathCaseSensitive&&(this._capabilities|=a.PathCaseSensitive),this.extraCapabilities.trash&&(this._capabilities|=a.Trash)),this._capabilities}stat(e){return this.channel.call("stat",[e])}readdir(e){return this.channel.call("readdir",[e])}async readFile(e,i){const{buffer:t}=await this.channel.call("readFile",[e,i]);return t}readFileStream(e,i,t){const r=C(l=>o.concat(l.map(s=>o.wrap(s))).buffer),n=new b;return n.add(this.channel.listen("readFileStream",[e,i])(l=>{if(l instanceof o)r.write(l.buffer);else{if(l==="end")r.end();else{let s;if(l instanceof Error)s=l;else{const p=l;s=u(p.message??c(p),p.code??v.Unknown)}r.error(s),r.end()}n.dispose()}})),n.add(t.onCancellationRequested(()=>{r.error(h()),r.end(),n.dispose()})),r}writeFile(e,i,t){return this.channel.call("writeFile",[e,o.wrap(i),t])}open(e,i){return this.channel.call("open",[e,i])}close(e){return this.channel.call("close",[e])}async read(e,i,t,r,n){const[l,s]=await this.channel.call("read",[e,i,n]);return t.set(l.buffer.slice(0,s),r),s}write(e,i,t,r,n){return this.channel.call("write",[e,i,o.wrap(t),r,n])}mkdir(e){return this.channel.call("mkdir",[e])}delete(e,i){return this.channel.call("delete",[e,i])}rename(e,i,t){return this.channel.call("rename",[e,i,t])}copy(e,i,t){return this.channel.call("copy",[e,i,t])}cloneFile(e,i){return this.channel.call("cloneFile",[e,i])}_onDidChange=this._register(new m);onDidChangeFile=this._onDidChange.event;_onDidWatchError=this._register(new m);onDidWatchError=this._onDidWatchError.event;sessionId=d();registerFileChangeListeners(){this._register(this.channel.listen("fileChange",[this.sessionId])(e=>{if(Array.isArray(e)){const i=e;this._onDidChange.fire(S(i))}else{const i=e;this._onDidWatchError.fire(i)}}))}watch(e,i){const t=d();return this.channel.call("watch",[this.sessionId,t,e,i]),I(()=>this.channel.call("unwatch",[this.sessionId,t]))}}export{k as DiskFileSystemProviderClient,E as LOCAL_FILE_SYSTEM_CHANNEL_NAME};
