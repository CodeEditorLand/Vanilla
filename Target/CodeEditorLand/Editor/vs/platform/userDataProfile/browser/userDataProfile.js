var P=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var p=(l,e,t,r)=>{for(var i=r>1?void 0:r?g(e,t):e,o=l.length-1,s;o>=0;o--)(s=l[o])&&(i=(r?s(e,t,i):s(i))||i);return r&&i&&P(e,t,i),i},f=(l,e)=>(t,r)=>e(t,r,l);import{BroadcastDataChannel as m}from"../../../base/browser/broadcast.js";import{revive as v}from"../../../base/common/marshalling.js";import"../../../base/common/uri.js";import{IEnvironmentService as I}from"../../environment/common/environment.js";import{IFileService as D}from"../../files/common/files.js";import{ILogService as O}from"../../log/common/log.js";import{IUriIdentityService as u}from"../../uriIdentity/common/uriIdentity.js";import{reviveProfile as d,UserDataProfilesService as n}from"../common/userDataProfile.js";let c=class extends n{changesBroadcastChannel;constructor(e,t,r,i){super(e,t,r,i),this.changesBroadcastChannel=this._register(new m(`${n.PROFILES_KEY}.changes`)),this._register(this.changesBroadcastChannel.onDidReceiveData(o=>{try{this._profilesObject=void 0;const s=o.added.map(a=>d(a,this.profilesHome.scheme)),h=o.removed.map(a=>d(a,this.profilesHome.scheme)),S=o.updated.map(a=>d(a,this.profilesHome.scheme));this.updateTransientProfiles(s.filter(a=>a.isTransient),h.filter(a=>a.isTransient),S.filter(a=>a.isTransient)),this._onDidChangeProfiles.fire({added:s,removed:h,updated:S,all:this.profiles})}catch{}}))}updateTransientProfiles(e,t,r){if(e.length&&this.transientProfilesObject.profiles.push(...e),t.length||r.length){const i=this.transientProfilesObject.profiles;this.transientProfilesObject.profiles=[];for(const o of i)t.some(s=>o.id===s.id)||this.transientProfilesObject.profiles.push(r.find(s=>o.id===s.id)??o)}}getStoredProfiles(){try{const e=localStorage.getItem(n.PROFILES_KEY);if(e)return v(JSON.parse(e))}catch(e){this.logService.error(e)}return[]}triggerProfilesChanges(e,t,r){super.triggerProfilesChanges(e,t,r),this.changesBroadcastChannel.postData({added:e,removed:t,updated:r})}saveStoredProfiles(e){localStorage.setItem(n.PROFILES_KEY,JSON.stringify(e))}getStoredProfileAssociations(){const e="profileAssociationsMigration";try{const t=localStorage.getItem(n.PROFILE_ASSOCIATIONS_KEY);if(t){let r=JSON.parse(t);return localStorage.getItem(e)||(r=this.migrateStoredProfileAssociations(r),this.saveStoredProfileAssociations(r),localStorage.setItem(e,"true")),r}}catch(t){this.logService.error(t)}return{}}saveStoredProfileAssociations(e){localStorage.setItem(n.PROFILE_ASSOCIATIONS_KEY,JSON.stringify(e))}};c=p([f(0,I),f(1,D),f(2,u),f(3,O)],c);export{c as BrowserUserDataProfilesService};
