import{VSBuffer as o}from"../../../../vs/base/common/buffer.js";import"../../../../vs/base/common/cancellation.js";import{toErrorMessage as p}from"../../../../vs/base/common/errorMessage.js";import{canceled as c}from"../../../../vs/base/common/errors.js";import{Emitter as m,Event as F}from"../../../../vs/base/common/event.js";import{Disposable as y,DisposableStore as I,toDisposable as b}from"../../../../vs/base/common/lifecycle.js";import{newWriteableStream as C}from"../../../../vs/base/common/stream.js";import"../../../../vs/base/common/uri.js";import{generateUuid as h}from"../../../../vs/base/common/uuid.js";import"../../../../vs/base/parts/ipc/common/ipc.js";import{createFileSystemProviderError as v,FileSystemProviderCapabilities as a,FileSystemProviderErrorCode as S}from"../../../../vs/platform/files/common/files.js";import{reviveFileChanges as u}from"../../../../vs/platform/files/common/watcher.js";const le="localFilesystem";class ne extends y{constructor(e,i){super();this.channel=e;this.extraCapabilities=i;this.registerFileChangeListeners()}onDidChangeCapabilities=F.None;_capabilities;get capabilities(){return this._capabilities||(this._capabilities=a.FileReadWrite|a.FileOpenReadWriteClose|a.FileReadStream|a.FileFolderCopy|a.FileWriteUnlock|a.FileAtomicRead|a.FileAtomicWrite|a.FileAtomicDelete|a.FileClone,this.extraCapabilities.pathCaseSensitive&&(this._capabilities|=a.PathCaseSensitive),this.extraCapabilities.trash&&(this._capabilities|=a.Trash)),this._capabilities}stat(e){return this.channel.call("stat",[e])}readdir(e){return this.channel.call("readdir",[e])}async readFile(e,i){const{buffer:t}=await this.channel.call("readFile",[e,i]);return t}readFileStream(e,i,t){const r=C(l=>o.concat(l.map(s=>o.wrap(s))).buffer),n=new I;return n.add(this.channel.listen("readFileStream",[e,i])(l=>{if(l instanceof o)r.write(l.buffer);else{if(l==="end")r.end();else{let s;if(l instanceof Error)s=l;else{const d=l;s=v(d.message??p(d),d.code??S.Unknown)}r.error(s),r.end()}n.dispose()}})),n.add(t.onCancellationRequested(()=>{r.error(c()),r.end(),n.dispose()})),r}writeFile(e,i,t){return this.channel.call("writeFile",[e,o.wrap(i),t])}open(e,i){return this.channel.call("open",[e,i])}close(e){return this.channel.call("close",[e])}async read(e,i,t,r,n){const[l,s]=await this.channel.call("read",[e,i,n]);return t.set(l.buffer.slice(0,s),r),s}write(e,i,t,r,n){return this.channel.call("write",[e,i,o.wrap(t),r,n])}mkdir(e){return this.channel.call("mkdir",[e])}delete(e,i){return this.channel.call("delete",[e,i])}rename(e,i,t){return this.channel.call("rename",[e,i,t])}copy(e,i,t){return this.channel.call("copy",[e,i,t])}cloneFile(e,i){return this.channel.call("cloneFile",[e,i])}_onDidChange=this._register(new m);onDidChangeFile=this._onDidChange.event;_onDidWatchError=this._register(new m);onDidWatchError=this._onDidWatchError.event;sessionId=h();registerFileChangeListeners(){this._register(this.channel.listen("fileChange",[this.sessionId])(e=>{if(Array.isArray(e)){const i=e;this._onDidChange.fire(u(i))}else{const i=e;this._onDidWatchError.fire(i)}}))}watch(e,i){const t=h();return this.channel.call("watch",[this.sessionId,t,e,i]),b(()=>this.channel.call("unwatch",[this.sessionId,t]))}}export{ne as DiskFileSystemProviderClient,le as LOCAL_FILE_SYSTEM_CHANNEL_NAME};
