var I=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var d=(s,i,e,r)=>{for(var t=r>1?void 0:r?u(i,e):i,a=s.length-1,o;a>=0;a--)(o=s[a])&&(t=(r?o(i,e,t):o(t))||t);return r&&t&&I(i,e,t),t},p=(s,i)=>(e,r)=>i(e,r,s);import{Emitter as m}from"../../../base/common/event.js";import{Disposable as D,DisposableMap as P,isDisposable as C,MutableDisposable as y,toDisposable as b}from"../../../base/common/lifecycle.js";import{Storage as w}from"../../../base/parts/storage/common/storage.js";import{createDecorator as U}from"../../instantiation/common/instantiation.js";import"../../ipc/common/services.js";import"../../log/common/log.js";import{AbstractStorageService as M,isProfileUsingDefaultStorage as E,IStorageService as T,StorageScope as n,StorageTarget as f}from"../../storage/common/storage.js";import{ApplicationStorageDatabaseClient as L,ProfileStorageDatabaseClient as _}from"../../storage/common/storageIpc.js";import{reviveProfile as h}from"./userDataProfile.js";const Y=U("IUserDataProfileStorageService");let g=class extends D{constructor(e,r){super();this.storageService=r;e&&(this.storageServicesMap=this._register(new P))}_serviceBrand;storageServicesMap;async readStorageData(e){return this.withProfileScopedStorageService(e,async r=>this.getItems(r))}async updateStorageData(e,r,t){return this.withProfileScopedStorageService(e,async a=>this.writeItems(a,r,t))}async withProfileScopedStorageService(e,r){if(this.storageService.hasScope(e))return r(this.storageService);let t=this.storageServicesMap?.get(e.id);if(!t){t=new x(this.createStorageDatabase(e)),this.storageServicesMap?.set(e.id,t);try{await t.initialize()}catch(a){throw this.storageServicesMap?.has(e.id)?this.storageServicesMap.deleteAndDispose(e.id):t.dispose(),a}}try{const a=await r(t);return await t.flush(),a}finally{this.storageServicesMap?.has(e.id)||t.dispose()}}getItems(e){const r=new Map,t=a=>{for(const o of e.keys(n.PROFILE,a))r.set(o,{value:e.get(o,n.PROFILE),target:a})};return t(f.USER),t(f.MACHINE),r}writeItems(e,r,t){e.storeAll(Array.from(r.entries()).map(([a,o])=>({key:a,value:o,scope:n.PROFILE,target:t})),!0)}};g=d([p(1,T)],g);class Z extends g{constructor(e,r,t,a,o){super(e,a);this.remoteService=r;const v=r.getChannel("profileStorageListener"),c=this._register(new y);this._onDidChange=this._register(new m({onWillAddFirstListener:()=>{c.value=v.listen("onDidChange")(S=>{o.trace("profile storage changes",S),this._onDidChange.fire({targetChanges:S.targetChanges.map(l=>h(l,t.profilesHome.scheme)),valueChanges:S.valueChanges.map(l=>({...l,profile:h(l.profile,t.profilesHome.scheme)}))})})},onDidRemoveLastListener:()=>c.value=void 0})),this.onDidChange=this._onDidChange.event}_onDidChange;onDidChange;async createStorageDatabase(e){const r=this.remoteService.getChannel("storage");return E(e)?new L(r):new _(r,e)}}class x extends M{constructor(e){super({flushInterval:100});this.profileStorageDatabase=e}profileStorage;async doInitialize(){const e=await this.profileStorageDatabase,r=new w(e);return this._register(r.onDidChangeStorage(t=>{this.emitDidChangeValue(n.PROFILE,t)})),this._register(b(()=>{r.close(),r.dispose(),C(e)&&e.dispose()})),this.profileStorage=r,this.profileStorage.init()}getStorage(e){return e===n.PROFILE?this.profileStorage:void 0}getLogDetails(){}async switchToProfile(){}async switchToWorkspace(){}hasScope(){return!1}}export{g as AbstractUserDataProfileStorageService,Y as IUserDataProfileStorageService,Z as RemoteUserDataProfileStorageService};
