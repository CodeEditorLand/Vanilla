var _=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var I=(o,i,e,t)=>{for(var n=t>1?void 0:t?S(i,e):i,s=o.length-1,r;s>=0;s--)(r=o[s])&&(n=(t?r(i,e,n):r(n))||n);return t&&n&&_(i,e,n),n},E=(o,i)=>(e,t)=>i(e,t,o);import{Emitter as x}from"../../../base/common/event.js";import{Disposable as u,DisposableStore as p}from"../../../base/common/lifecycle.js";import{isUndefinedOrNull as c}from"../../../base/common/types.js";import{IStorageService as D,StorageScope as d,StorageTarget as b}from"../../storage/common/storage.js";import{DISABLED_EXTENSIONS_STORAGE_PATH as m,IExtensionManagementService as v,InstallOperation as y}from"./extensionManagement.js";import{areSameExtensions as l}from"./extensionManagementUtil.js";let h=class extends u{_onDidChangeEnablement=new x;onDidChangeEnablement=this._onDidChangeEnablement.event;storageManager;constructor(i,e){super(),this.storageManager=this._register(new O(i)),this._register(this.storageManager.onDidChange(t=>this._onDidChangeEnablement.fire({extensions:t,source:"storage"}))),this._register(e.onDidInstallExtensions(t=>t.forEach(({local:n,operation:s})=>{n&&s===y.Migrate&&this._removeFromDisabledExtensions(n.identifier)})))}async enableExtension(i,e){return this._removeFromDisabledExtensions(i)?(this._onDidChangeEnablement.fire({extensions:[i],source:e}),!0):!1}async disableExtension(i,e){return this._addToDisabledExtensions(i)?(this._onDidChangeEnablement.fire({extensions:[i],source:e}),!0):!1}getDisabledExtensions(){return this._getExtensions(m)}async getDisabledExtensionsAsync(){return this.getDisabledExtensions()}_addToDisabledExtensions(i){const e=this.getDisabledExtensions();return e.every(t=>!l(t,i))?(e.push(i),this._setDisabledExtensions(e),!0):!1}_removeFromDisabledExtensions(i){const e=this.getDisabledExtensions();for(let t=0;t<e.length;t++){const n=e[t];if(l(n,i))return e.splice(t,1),this._setDisabledExtensions(e),!0}return!1}_setDisabledExtensions(i){this._setExtensions(m,i)}_getExtensions(i){return this.storageManager.get(i,d.PROFILE)}_setExtensions(i,e){this.storageManager.set(i,e,d.PROFILE)}};h=I([E(0,D),E(1,v)],h);class O extends u{constructor(e){super();this.storageService=e;this._register(e.onDidChangeValue(d.PROFILE,void 0,this._register(new p))(t=>this.onDidStorageChange(t)))}storage=Object.create(null);_onDidChange=this._register(new x);onDidChange=this._onDidChange.event;get(e,t){let n;return t===d.PROFILE?(c(this.storage[e])&&(this.storage[e]=this._get(e,t)),n=this.storage[e]):n=this._get(e,t),JSON.parse(n)}set(e,t,n){const s=JSON.stringify(t.map(({id:g,uuid:a})=>({id:g,uuid:a})));this._get(e,n)!==s&&(n===d.PROFILE&&(t.length?this.storage[e]=s:delete this.storage[e]),this._set(e,t.length?s:void 0,n))}onDidStorageChange(e){if(!c(this.storage[e.key])&&this._get(e.key,e.scope)!==this.storage[e.key]){const n=this.get(e.key,e.scope);delete this.storage[e.key];const s=this.get(e.key,e.scope),r=n.filter(a=>!s.some(f=>l(a,f))),g=s.filter(a=>!n.some(f=>l(f,a)));(r.length||g.length)&&this._onDidChange.fire([...r,...g])}}_get(e,t){return this.storageService.get(e,t,"[]")}_set(e,t,n){t?this.storageService.store(e,t,n,b.MACHINE):this.storageService.remove(e,n)}}export{h as GlobalExtensionEnablementService,O as StorageManager};
