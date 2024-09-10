import{ThrottledDelayer as l}from"../../../common/async.js";import{Event as d,PauseableEmitter as g}from"../../../common/event.js";import{Disposable as h}from"../../../common/lifecycle.js";import{parse as u,stringify as c}from"../../../common/marshalling.js";import{isObject as p,isUndefinedOrNull as s}from"../../../common/types.js";var m=(e=>(e[e.STORAGE_DOES_NOT_EXIST=0]="STORAGE_DOES_NOT_EXIST",e[e.STORAGE_IN_MEMORY=1]="STORAGE_IN_MEMORY",e))(m||{});function D(a){const i=a;return i?.changed instanceof Map||i?.deleted instanceof Set}var f=(t=>(t[t.None=0]="None",t[t.Initialized=1]="Initialized",t[t.Closed=2]="Closed",t))(f||{});class o extends h{constructor(e,t=Object.create(null)){super();this.database=e;this.options=t;this.registerListeners()}static DEFAULT_FLUSH_DELAY=100;_onDidChangeStorage=this._register(new g);onDidChangeStorage=this._onDidChangeStorage.event;state=0;cache=new Map;flushDelayer=this._register(new l(o.DEFAULT_FLUSH_DELAY));pendingDeletes=new Set;pendingInserts=new Map;pendingClose=void 0;whenFlushedCallbacks=[];registerListeners(){this._register(this.database.onDidChangeItemsExternal(e=>this.onDidChangeItemsExternal(e)))}onDidChangeItemsExternal(e){this._onDidChangeStorage.pause();try{e.changed?.forEach((t,n)=>this.acceptExternal(n,t)),e.deleted?.forEach(t=>this.acceptExternal(t,void 0))}finally{this._onDidChangeStorage.resume()}}acceptExternal(e,t){if(this.state===2)return;let n=!1;s(t)?n=this.cache.delete(e):this.cache.get(e)!==t&&(this.cache.set(e,t),n=!0),n&&this._onDidChangeStorage.fire({key:e,external:!0})}get items(){return this.cache}get size(){return this.cache.size}async init(){this.state===0&&(this.state=1,this.options.hint!==0&&(this.cache=await this.database.getItems()))}get(e,t){const n=this.cache.get(e);return s(n)?t:n}getBoolean(e,t){const n=this.get(e);return s(n)?t:n==="true"}getNumber(e,t){const n=this.get(e);return s(n)?t:parseInt(n,10)}getObject(e,t){const n=this.get(e);return s(n)?t:u(n)}async set(e,t,n=!1){if(this.state===2)return;if(s(t))return this.delete(e,n);const r=p(t)||Array.isArray(t)?c(t):String(t);if(this.cache.get(e)!==r)return this.cache.set(e,r),this.pendingInserts.set(e,r),this.pendingDeletes.delete(e),this._onDidChangeStorage.fire({key:e,external:n}),this.doFlush()}async delete(e,t=!1){if(!(this.state===2||!this.cache.delete(e)))return this.pendingDeletes.has(e)||this.pendingDeletes.add(e),this.pendingInserts.delete(e),this._onDidChangeStorage.fire({key:e,external:t}),this.doFlush()}async optimize(){if(this.state!==2)return await this.flush(0),this.database.optimize()}async close(){return this.pendingClose||(this.pendingClose=this.doClose()),this.pendingClose}async doClose(){this.state=2;try{await this.doFlush(0)}catch{}await this.database.close(()=>this.cache)}get hasPending(){return this.pendingInserts.size>0||this.pendingDeletes.size>0}async flushPending(){if(!this.hasPending)return;const e={insert:this.pendingInserts,delete:this.pendingDeletes};return this.pendingDeletes=new Set,this.pendingInserts=new Map,this.database.updateItems(e).finally(()=>{if(!this.hasPending)for(;this.whenFlushedCallbacks.length;)this.whenFlushedCallbacks.pop()?.()})}async flush(e){if(!(this.state===2||this.pendingClose))return this.doFlush(e)}async doFlush(e){return this.options.hint===1?this.flushPending():this.flushDelayer.trigger(()=>this.flushPending(),e)}async whenFlushed(){if(this.hasPending)return new Promise(e=>this.whenFlushedCallbacks.push(e))}isInMemory(){return this.options.hint===1}}class P{onDidChangeItemsExternal=d.None;items=new Map;async getItems(){return this.items}async updateItems(i){i.insert?.forEach((e,t)=>this.items.set(t,e)),i.delete?.forEach(e=>this.items.delete(e))}async optimize(){}async close(){}}export{P as InMemoryStorageDatabase,o as Storage,m as StorageHint,f as StorageState,D as isStorageItemsChangeEvent};
