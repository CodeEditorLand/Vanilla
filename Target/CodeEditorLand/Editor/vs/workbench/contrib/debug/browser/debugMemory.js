import{assertNever as v}from"../../../../../vs/base/common/assert.js";import{VSBuffer as I}from"../../../../../vs/base/common/buffer.js";import{Emitter as h,Event as O}from"../../../../../vs/base/common/event.js";import{Disposable as M,DisposableStore as R,toDisposable as F}from"../../../../../vs/base/common/lifecycle.js";import{clamp as u}from"../../../../../vs/base/common/numbers.js";import"../../../../../vs/base/common/uri.js";import{createFileSystemProviderError as s,FileChangeType as y,FilePermission as E,FileSystemProviderCapabilities as b,FileSystemProviderErrorCode as a,FileType as U}from"../../../../../vs/platform/files/common/files.js";import{DEBUG_MEMORY_SCHEME as S,MemoryRangeType as d,State as g}from"../../../../../vs/workbench/contrib/debug/common/debug.js";const P=/range=([0-9]+):([0-9]+)/;class K{constructor(t){this.debugService=t;t.onDidEndSession(({session:e})=>{for(const[r,i]of this.fdMemory)i.session===e&&this.close(r)})}memoryFdCounter=0;fdMemory=new Map;changeEmitter=new h;onDidChangeCapabilities=O.None;onDidChangeFile=this.changeEmitter.event;capabilities=0|b.PathCaseSensitive|b.FileOpenReadWriteClose;watch(t,e){if(e.recursive)return F(()=>{});const{session:r,memoryReference:i,offset:o}=this.parseUri(t),n=new R;return n.add(r.onDidChangeState(()=>{(r.state===g.Running||r.state===g.Inactive)&&this.changeEmitter.fire([{type:y.DELETED,resource:t}])})),n.add(r.onDidInvalidateMemory(m=>{m.body.memoryReference===i&&(o&&(m.body.offset>=o.toOffset||m.body.offset+m.body.count<o.fromOffset)||this.changeEmitter.fire([{resource:t,type:y.UPDATED}]))})),n}stat(t){const{readOnly:e}=this.parseUri(t);return Promise.resolve({type:U.File,mtime:0,ctime:0,size:0,permissions:e?E.Readonly:void 0})}mkdir(){throw s("Not allowed",a.NoPermissions)}readdir(){throw s("Not allowed",a.NoPermissions)}delete(){throw s("Not allowed",a.NoPermissions)}rename(){throw s("Not allowed",a.NoPermissions)}open(t,e){const{session:r,memoryReference:i,offset:o}=this.parseUri(t),n=this.memoryFdCounter++;let m=r.getMemory(i);return o&&(m=new D(m,o)),this.fdMemory.set(n,{session:r,region:m}),Promise.resolve(n)}close(t){return this.fdMemory.get(t)?.region.dispose(),this.fdMemory.delete(t),Promise.resolve()}async writeFile(t,e){const{offset:r}=this.parseUri(t);if(!r)throw s("Range must be present to read a file",a.FileNotFound);const i=await this.open(t,{create:!1});try{await this.write(i,r.fromOffset,e,0,e.length)}finally{this.close(i)}}async readFile(t){const{offset:e}=this.parseUri(t);if(!e)throw s("Range must be present to read a file",a.FileNotFound);const r=new Uint8Array(e.toOffset-e.fromOffset),i=await this.open(t,{create:!1});try{return await this.read(i,e.fromOffset,r,0,r.length),r}finally{this.close(i)}}async read(t,e,r,i,o){const n=this.fdMemory.get(t);if(!n)throw s("No file with that descriptor open",a.Unavailable);const m=await n.region.read(e,o);let f=0;for(const l of m)switch(l.type){case d.Unreadable:return f;case d.Error:if(f>0)return f;throw s(l.error,a.Unknown);case d.Valid:{const c=Math.max(0,e-l.offset),p=l.data.slice(c,Math.min(l.data.byteLength,c+(o-f)));r.set(p.buffer,i+f),f+=p.byteLength;break}default:v(l)}return f}write(t,e,r,i,o){const n=this.fdMemory.get(t);if(!n)throw s("No file with that descriptor open",a.Unavailable);return n.region.write(e,I.wrap(r).slice(i,i+o))}parseUri(t){if(t.scheme!==S)throw s(`Cannot open file with scheme ${t.scheme}`,a.FileNotFound);const e=this.debugService.getModel().getSession(t.authority);if(!e)throw s("Debug session not found",a.FileNotFound);let r;const i=P.exec(t.query);i&&(r={fromOffset:Number(i[1]),toOffset:Number(i[2])});const[,o]=t.path.split("/");return{session:e,offset:r,readOnly:!e.capabilities.supportsWriteMemoryRequest,sessionId:t.authority,memoryReference:decodeURIComponent(o)}}}class D extends M{constructor(e,r){super();this.parent=e;this.range=r;this.writable=e.writable,this._register(e),this._register(e.onDidInvalidate(i=>{const o=u(i.fromOffset-r.fromOffset,0,this.width),n=u(i.toOffset-r.fromOffset,0,this.width);n>o&&this.invalidateEmitter.fire({fromOffset:o,toOffset:n})}))}invalidateEmitter=new h;onDidInvalidate=this.invalidateEmitter.event;writable;width=this.range.toOffset-this.range.fromOffset;read(e,r){if(e<0)throw new RangeError(`Invalid fromOffset: ${e}`);return this.parent.read(this.range.fromOffset+e,this.range.fromOffset+Math.min(r,this.width))}write(e,r){return this.parent.write(this.range.fromOffset+e,r)}}export{K as DebugMemoryFileSystemProvider};