import{DeferredPromise as a,RunOnceScheduler as d}from"../../../../vs/base/common/async.js";import"../../../../vs/base/common/lifecycle.js";import"../../../../vs/platform/extensions/common/extensions.js";import"../../../../vs/workbench/api/common/extHostStorage.js";class h{_id;_shared;_storage;_init;_value;_storageListener;_deferredPromises=new Map;_scheduler;constructor(e,r,s){this._id=e,this._shared=r,this._storage=s,this._init=this._storage.initializeExtensionStorage(this._shared,this._id,Object.create(null)).then(t=>(this._value=t,this)),this._storageListener=this._storage.onDidChangeStorage(t=>{t.shared===this._shared&&t.key===this._id&&(this._value=t.value)}),this._scheduler=new d(()=>{const t=this._deferredPromises;this._deferredPromises=new Map,(async()=>{try{await this._storage.setValue(this._shared,this._id,this._value);for(const i of t.values())i.complete()}catch(i){for(const n of t.values())n.error(i)}})()},0)}keys(){return Object.entries(this._value??{}).filter(([,e])=>e!==void 0).map(([e])=>e)}get whenReady(){return this._init}get(e,r){let s=this._value[e];return typeof s>"u"&&(s=r),s}update(e,r){this._value[e]=r;const s=this._deferredPromises.get(e);if(s!==void 0)return s.p;const t=new a;return this._deferredPromises.set(e,t),this._scheduler.isScheduled()||this._scheduler.schedule(),t.p}dispose(){this._storageListener.dispose()}}class m extends h{_extension;setKeysForSync(e){this._storage.registerExtensionStorageKeysToSync({id:this._id,version:this._extension.version},e)}constructor(e,r){super(e.identifier.value,!0,r),this._extension=e}}export{m as ExtensionGlobalMemento,h as ExtensionMemento};