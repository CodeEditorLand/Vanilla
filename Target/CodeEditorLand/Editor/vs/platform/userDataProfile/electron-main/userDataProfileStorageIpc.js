import{Emitter as h,Event as l}from"../../../base/common/event.js";import{Disposable as S,DisposableStore as d,MutableDisposable as c}from"../../../base/common/lifecycle.js";import"../../../base/parts/ipc/common/ipc.js";import"../../log/common/log.js";import"../common/userDataProfileStorageService.js";import{loadKeyTargets as f,StorageScope as p,TARGET_KEY as a}from"../../storage/common/storage.js";import"../../storage/common/storageIpc.js";import"../../storage/electron-main/storageMain.js";import"../../storage/electron-main/storageMainService.js";import"../common/userDataProfile.js";class x extends S{constructor(r,e,i){super();this.storageMainService=r;this.userDataProfilesService=e;this.logService=i;const t=this._register(new c);this._onDidChange=this._register(new h({onWillAddFirstListener:()=>t.value=this.registerStorageChangeListeners(),onDidRemoveLastListener:()=>t.value=void 0}))}_onDidChange;registerStorageChangeListeners(){this.logService.debug("ProfileStorageChangesListenerChannel#registerStorageChangeListeners");const r=new d;return r.add(l.debounce(this.storageMainService.applicationStorage.onDidChangeStorage,(e,i)=>(e?e.push(i.key):e=[i.key],e),100)(e=>this.onDidChangeApplicationStorage(e))),r.add(l.debounce(this.storageMainService.onDidChangeProfileStorage,(e,i)=>{e||(e=new Map);let t=e.get(i.profile.id);return t||e.set(i.profile.id,t={profile:i.profile,keys:[],storage:i.storage}),t.keys.push(i.key),e},100)(e=>this.onDidChangeProfileStorage(e))),r}onDidChangeApplicationStorage(r){const e=r.includes(a)?[this.userDataProfilesService.defaultProfile]:[],i=[];if(r=r.filter(t=>t!==a),r.length){const t=f(this.storageMainService.applicationStorage.storage);i.push({profile:this.userDataProfilesService.defaultProfile,changes:r.map(o=>({key:o,scope:p.PROFILE,target:t[o]}))})}this.triggerEvents(e,i)}onDidChangeProfileStorage(r){const e=[],i=new Map;for(const[t,o]of r.entries()){o.keys.includes(a)&&e.push(o.profile);const n=o.keys.filter(s=>s!==a);if(n.length){const s=f(o.storage.storage);i.set(t,{profile:o.profile,changes:n.map(g=>({key:g,scope:p.PROFILE,target:s[g]}))})}}this.triggerEvents(e,[...i.values()])}triggerEvents(r,e){(r.length||e.length)&&this._onDidChange.fire({valueChanges:e,targetChanges:r})}listen(r,e,i){switch(e){case"onDidChange":return this._onDidChange.event}throw new Error(`[ProfileStorageChangesListenerChannel] Event not found: ${e}`)}async call(r,e){throw new Error(`Call not found: ${e}`)}}export{x as ProfileStorageChangesListenerChannel};
