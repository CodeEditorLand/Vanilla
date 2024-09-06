import{NotSupportedError as i}from"../../../../base/common/errors.js";import{Event as o}from"../../../../base/common/event.js";import{Disposable as l}from"../../../../base/common/lifecycle.js";import"../../../../base/common/uri.js";import{createFileSystemProviderError as s,FileSystemProviderCapabilities as t,FileSystemProviderErrorCode as a,FileType as m}from"../../../../platform/files/common/files.js";class S{capabilities=t.Readonly+t.FileReadWrite+t.PathCaseSensitive;onDidChangeCapabilities=o.None;onDidChangeFile=o.None;async readFile(r){try{const e=await fetch(r.toString(!0));if(e.status===200)return new Uint8Array(await e.arrayBuffer());throw s(e.statusText,a.Unknown)}catch(e){throw s(e,a.Unknown)}}async stat(r){return{type:m.File,size:0,mtime:0,ctime:0}}watch(){return l.None}writeFile(r,e,n){throw new i}readdir(r){throw new i}mkdir(r){throw new i}delete(r,e){throw new i}rename(r,e,n){throw new i}}export{S as FetchFileSystemProvider};
