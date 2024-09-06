var S=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var l=(n,t,e,a)=>{for(var r=a>1?void 0:a?p(t,e):t,i=n.length-1,o;i>=0;i--)(o=n[i])&&(r=(a?o(t,e,r):o(r))||r);return a&&r&&S(t,e,r),r},s=(n,t)=>(e,a)=>t(e,a,n);import{Emitter as D,Event as c}from"../../../../../vs/base/common/event.js";import{DisposableStore as d}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/base/parts/storage/common/storage.js";import{InstantiationType as I,registerSingleton as m}from"../../../../../vs/platform/instantiation/common/extensions.js";import{ILogService as v}from"../../../../../vs/platform/log/common/log.js";import{isProfileUsingDefaultStorage as C,IStorageService as P,StorageScope as f}from"../../../../../vs/platform/storage/common/storage.js";import"../../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{AbstractUserDataProfileStorageService as u,IUserDataProfileStorageService as _}from"../../../../../vs/platform/userDataProfile/common/userDataProfileStorageService.js";import{IndexedDBStorageDatabase as h}from"../../../../../vs/workbench/services/storage/browser/storageService.js";import{IUserDataProfileService as b}from"../../../../../vs/workbench/services/userDataProfile/common/userDataProfile.js";let g=class extends u{constructor(e,a,r){super(!0,e);this.userDataProfileService=a;this.logService=r;const i=this._register(new d);this._register(c.filter(e.onDidChangeTarget,o=>o.scope===f.PROFILE,i)(()=>this.onDidChangeStorageTargetInCurrentProfile())),this._register(e.onDidChangeValue(f.PROFILE,void 0,i)(o=>this.onDidChangeStorageValueInCurrentProfile(o)))}_onDidChange=this._register(new D);onDidChange=this._onDidChange.event;onDidChangeStorageTargetInCurrentProfile(){this._onDidChange.fire({targetChanges:[this.userDataProfileService.currentProfile],valueChanges:[]})}onDidChangeStorageValueInCurrentProfile(e){this._onDidChange.fire({targetChanges:[],valueChanges:[{profile:this.userDataProfileService.currentProfile,changes:[e]}]})}createStorageDatabase(e){return C(e)?h.createApplicationStorage(this.logService):h.createProfileStorage(e,this.logService)}};g=l([s(0,P),s(1,b),s(2,v)],g),m(_,g,I.Delayed);export{g as UserDataProfileStorageService};
