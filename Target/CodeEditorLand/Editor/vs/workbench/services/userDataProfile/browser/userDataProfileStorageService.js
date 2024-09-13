var S=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var l=(n,t,e,a)=>{for(var r=a>1?void 0:a?p(t,e):t,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(a?o(t,e,r):o(r))||r);return a&&r&&S(t,e,r),r},s=(n,t)=>(e,a)=>t(e,a,n);import{Emitter as D,Event as c}from"../../../../base/common/event.js";import"../../../../base/parts/storage/common/storage.js";import{InstantiationType as d,registerSingleton as I}from"../../../../platform/instantiation/common/extensions.js";import{ILogService as m}from"../../../../platform/log/common/log.js";import{AbstractUserDataProfileStorageService as v,IUserDataProfileStorageService as C}from"../../../../platform/userDataProfile/common/userDataProfileStorageService.js";import{isProfileUsingDefaultStorage as P,IStorageService as u,StorageScope as f}from"../../../../platform/storage/common/storage.js";import"../../../../platform/userDataProfile/common/userDataProfile.js";import{IndexedDBStorageDatabase as h}from"../../storage/browser/storageService.js";import{IUserDataProfileService as _}from"../common/userDataProfile.js";import{DisposableStore as b}from"../../../../base/common/lifecycle.js";let g=class extends v{constructor(e,a,r){super(!0,e);this.userDataProfileService=a;this.logService=r;const i=this._register(new b);this._register(c.filter(e.onDidChangeTarget,o=>o.scope===f.PROFILE,i)(()=>this.onDidChangeStorageTargetInCurrentProfile())),this._register(e.onDidChangeValue(f.PROFILE,void 0,i)(o=>this.onDidChangeStorageValueInCurrentProfile(o)))}_onDidChange=this._register(new D);onDidChange=this._onDidChange.event;onDidChangeStorageTargetInCurrentProfile(){this._onDidChange.fire({targetChanges:[this.userDataProfileService.currentProfile],valueChanges:[]})}onDidChangeStorageValueInCurrentProfile(e){this._onDidChange.fire({targetChanges:[],valueChanges:[{profile:this.userDataProfileService.currentProfile,changes:[e]}]})}createStorageDatabase(e){return P(e)?h.createApplicationStorage(this.logService):h.createProfileStorage(e,this.logService)}};g=l([s(0,u),s(1,_),s(2,m)],g),I(C,g,d.Delayed);export{g as UserDataProfileStorageService};
