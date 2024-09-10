import{FileSystemProviderCapabilities as t,FileType as l,FileSystemProviderErrorCode as o,createFileSystemProviderError as s}from"../../../../platform/files/common/files.js";import{Event as a}from"../../../../base/common/event.js";import{Disposable as m}from"../../../../base/common/lifecycle.js";import{NotSupportedError as i}from"../../../../base/common/errors.js";class S{capabilities=t.Readonly+t.FileReadWrite+t.PathCaseSensitive;onDidChangeCapabilities=a.None;onDidChangeFile=a.None;async readFile(r){try{const e=await fetch(r.toString(!0));if(e.status===200)return new Uint8Array(await e.arrayBuffer());throw s(e.statusText,o.Unknown)}catch(e){throw s(e,o.Unknown)}}async stat(r){return{type:l.File,size:0,mtime:0,ctime:0}}watch(){return m.None}writeFile(r,e,n){throw new i}readdir(r){throw new i}mkdir(r){throw new i}delete(r,e){throw new i}rename(r,e,n){throw new i}}export{S as FetchFileSystemProvider};
