import{VSBuffer as p}from"../../../../base/common/buffer.js";import{Event as c}from"../../../../base/common/event.js";import{Disposable as R}from"../../../../base/common/lifecycle.js";import{isEqual as n}from"../../../../base/common/resources.js";import{URI as s}from"../../../../base/common/uri.js";import{FileSystemProviderCapabilities as l,FileType as y,hasReadWriteCapability as I}from"../../../../platform/files/common/files.js";class o{constructor(i){this.fileService=i}static SCHEMA="vscode-local-history";static toLocalHistoryFileSystem(i){const e={location:i.location.toString(!0),associatedResource:i.associatedResource.toString(!0)};return i.associatedResource.with({scheme:o.SCHEMA,query:JSON.stringify(e)})}static fromLocalHistoryFileSystem(i){const e=JSON.parse(i.query);return{location:s.parse(e.location),associatedResource:s.parse(e.associatedResource)}}static EMPTY_RESOURCE=s.from({scheme:o.SCHEMA,path:"/empty"});static EMPTY={location:o.EMPTY_RESOURCE,associatedResource:o.EMPTY_RESOURCE};get capabilities(){return l.FileReadWrite|l.Readonly}mapSchemeToProvider=new Map;async withProvider(i){const e=i.scheme;let r=this.mapSchemeToProvider.get(e);if(!r){const a=this.fileService.getProvider(e);a?r=Promise.resolve(a):r=new Promise(d=>{const m=this.fileService.onDidChangeFileSystemProviderRegistrations(t=>{t.added&&t.provider&&t.scheme===e&&(m.dispose(),d(t.provider))})}),this.mapSchemeToProvider.set(e,r)}return r}async stat(i){const e=o.fromLocalHistoryFileSystem(i).location;return n(o.EMPTY_RESOURCE,e)?{type:y.File,ctime:0,mtime:0,size:0}:(await this.withProvider(e)).stat(e)}async readFile(i){const e=o.fromLocalHistoryFileSystem(i).location;if(n(o.EMPTY_RESOURCE,e))return p.fromString("").buffer;const r=await this.withProvider(e);if(I(r))return r.readFile(e);throw new Error("Unsupported")}onDidChangeCapabilities=c.None;onDidChangeFile=c.None;async writeFile(i,e,r){}async mkdir(i){}async readdir(i){return[]}async rename(i,e,r){}async delete(i,e){}watch(i,e){return R.None}}export{o as LocalHistoryFileSystemProvider};
