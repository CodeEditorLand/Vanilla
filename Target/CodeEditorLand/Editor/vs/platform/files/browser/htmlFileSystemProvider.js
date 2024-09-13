import{VSBuffer as h}from"../../../base/common/buffer.js";import{Event as F}from"../../../base/common/event.js";import{Disposable as S}from"../../../base/common/lifecycle.js";import{Schemas as v}from"../../../base/common/network.js";import{basename as u,extname as g,normalize as P}from"../../../base/common/path.js";import{isLinux as f}from"../../../base/common/platform.js";import{extUri as d,extUriIgnorePathCase as H}from"../../../base/common/resources.js";import{newWriteableStream as I}from"../../../base/common/stream.js";import{URI as U}from"../../../base/common/uri.js";import{localize as p}from"../../../nls.js";import{FileSystemProviderCapabilities as y,FileSystemProviderError as b,FileSystemProviderErrorCode as n,FileType as m,createFileSystemProviderError as w}from"../common/files.js";import{WebFileSystemAccess as l}from"./webFileSystemAccess.js";class M{constructor(e,i,t){this.indexedDB=e;this.store=i;this.logService=t}onDidChangeCapabilities=F.None;onDidChangeFile=F.None;extUri=f?d:H;_capabilities;get capabilities(){return this._capabilities||(this._capabilities=y.FileReadWrite|y.FileReadStream,f&&(this._capabilities|=y.PathCaseSensitive)),this._capabilities}async stat(e){try{const i=await this.getHandle(e);if(!i)throw this.createFileSystemProviderError(e,"No such file or directory, stat",n.FileNotFound);if(l.isFileSystemFileHandle(i)){const t=await i.getFile();return{type:m.File,mtime:t.lastModified,ctime:0,size:t.size}}return{type:m.Directory,mtime:0,ctime:0,size:0}}catch(i){throw this.toFileSystemProviderError(i)}}async readdir(e){try{const i=await this.getDirectoryHandle(e);if(!i)throw this.createFileSystemProviderError(e,"No such file or directory, readdir",n.FileNotFound);const t=[];for await(const[r,a]of i)t.push([r,l.isFileSystemFileHandle(a)?m.File:m.Directory]);return t}catch(i){throw this.toFileSystemProviderError(i)}}readFileStream(e,i,t){const r=I(a=>h.concat(a.map(o=>h.wrap(o))).buffer,{highWaterMark:10});return(async()=>{try{const a=await this.getFileHandle(e);if(!a)throw this.createFileSystemProviderError(e,"No such file or directory, readFile",n.FileNotFound);const o=await a.getFile();if(typeof i.length=="number"||typeof i.position=="number"){let s=new Uint8Array(await o.arrayBuffer());typeof i?.position=="number"&&(s=s.slice(i.position)),typeof i?.length=="number"&&(s=s.slice(0,i.length)),r.end(s)}else{const s=o.stream().getReader();let c=await s.read();for(;!c.done&&!(t.isCancellationRequested||(await r.write(c.value),t.isCancellationRequested));)c=await s.read();r.end(void 0)}}catch(a){r.error(this.toFileSystemProviderError(a)),r.end()}})(),r}async readFile(e){try{const i=await this.getFileHandle(e);if(!i)throw this.createFileSystemProviderError(e,"No such file or directory, readFile",n.FileNotFound);const t=await i.getFile();return new Uint8Array(await t.arrayBuffer())}catch(i){throw this.toFileSystemProviderError(i)}}async writeFile(e,i,t){try{let r=await this.getFileHandle(e);if(!t.create||!t.overwrite){if(r){if(!t.overwrite)throw this.createFileSystemProviderError(e,"File already exists, writeFile",n.FileExists)}else if(!t.create)throw this.createFileSystemProviderError(e,"No such file, writeFile",n.FileNotFound)}if(!r){const o=await this.getDirectoryHandle(this.extUri.dirname(e));if(!o)throw this.createFileSystemProviderError(e,"No such parent directory, writeFile",n.FileNotFound);if(r=await o.getFileHandle(this.extUri.basename(e),{create:!0}),!r)throw this.createFileSystemProviderError(e,"Unable to create file , writeFile",n.Unknown)}const a=await r.createWritable();await a.write(i),await a.close()}catch(r){throw this.toFileSystemProviderError(r)}}async mkdir(e){try{const i=await this.getDirectoryHandle(this.extUri.dirname(e));if(!i)throw this.createFileSystemProviderError(e,"No such parent directory, mkdir",n.FileNotFound);await i.getDirectoryHandle(this.extUri.basename(e),{create:!0})}catch(i){throw this.toFileSystemProviderError(i)}}async delete(e,i){try{const t=await this.getDirectoryHandle(this.extUri.dirname(e));if(!t)throw this.createFileSystemProviderError(e,"No such parent directory, delete",n.FileNotFound);return t.removeEntry(this.extUri.basename(e),{recursive:i.recursive})}catch(t){throw this.toFileSystemProviderError(t)}}async rename(e,i,t){try{if(this.extUri.isEqual(e,i))return;const r=await this.getFileHandle(e);if(r){const a=await r.getFile(),o=new Uint8Array(await a.arrayBuffer());await this.writeFile(i,o,{create:!0,overwrite:t.overwrite,unlock:!1,atomic:!1}),await this.delete(e,{recursive:!1,useTrash:!1,atomic:!1})}else throw this.createFileSystemProviderError(e,p("fileSystemRenameError","Rename is only supported for files."),n.Unavailable)}catch(r){throw this.toFileSystemProviderError(r)}}watch(e,i){return S.None}_files=new Map;_directories=new Map;registerFileHandle(e){return this.registerHandle(e,this._files)}registerDirectoryHandle(e){return this.registerHandle(e,this._directories)}get directories(){return this._directories.values()}async registerHandle(e,i){let t=`/${e.name}`;if(i.has(t)&&!await i.get(t)?.isSameEntry(e)){const r=g(e.name),a=u(e.name,r);let o=1;do t=`/${a}-${o++}${r}`;while(i.has(t)&&!await i.get(t)?.isSameEntry(e))}i.set(t,e);try{await this.indexedDB?.runInTransaction(this.store,"readwrite",r=>r.put(e,t))}catch(r){this.logService.error(r)}return U.from({scheme:v.file,path:t})}async getHandle(e){let i=await this.doGetHandle(e);if(!i){const t=await this.getDirectoryHandle(this.extUri.dirname(e));if(t){const r=d.basename(e);try{i=await t.getFileHandle(r)}catch{try{i=await t.getDirectoryHandle(r)}catch{}}}}return i}async getFileHandle(e){const i=await this.doGetHandle(e);if(i instanceof FileSystemFileHandle)return i;const t=await this.getDirectoryHandle(this.extUri.dirname(e));try{return await t?.getFileHandle(d.basename(e))}catch{return}}async getDirectoryHandle(e){const i=await this.doGetHandle(e);if(i instanceof FileSystemDirectoryHandle)return i;const t=this.extUri.dirname(e);if(this.extUri.isEqual(t,e))return;const r=await this.getDirectoryHandle(t);try{return await r?.getDirectoryHandle(d.basename(e))}catch{return}}async doGetHandle(e){if(this.extUri.dirname(e).path!=="/")return;const i=e.path.replace(/\/$/,""),t=this._files.get(i)??this._directories.get(i);if(t)return t;const r=await this.indexedDB?.runInTransaction(this.store,"readonly",a=>a.get(i));if(l.isFileSystemHandle(r)){let a=await r.queryPermission()==="granted";try{a||(a=await r.requestPermission()==="granted")}catch(o){this.logService.error(o)}if(a)return l.isFileSystemFileHandle(r)?this._files.set(i,r):l.isFileSystemDirectoryHandle(r)&&this._directories.set(i,r),r}throw this.createFileSystemProviderError(e,"No file system handle registered",n.Unavailable)}toFileSystemProviderError(e){if(e instanceof b)return e;let i=n.Unknown;return e.name==="NotAllowedError"&&(e=new Error(p("fileSystemNotAllowedError","Insufficient permissions. Please retry and allow the operation.")),i=n.Unavailable),w(e,i)}createFileSystemProviderError(e,i,t){return w(new Error(`${i} (${P(e.path)})`),t)}}export{M as HTMLFileSystemProvider};
