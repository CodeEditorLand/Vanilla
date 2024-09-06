var y=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var D=(u,o,t,e)=>{for(var s=e>1?void 0:e?v(o,t):o,n=u.length-1,a;n>=0;n--)(a=u[n])&&(s=(e?a(o,t,s):a(s))||s);return e&&s&&y(o,t,s),s},d=(u,o)=>(t,e)=>o(t,e,u);import{distinct as m}from"../../../../base/common/arrays.js";import"../../../../base/common/collections.js";import{Emitter as b}from"../../../../base/common/event.js";import{Disposable as I}from"../../../../base/common/lifecycle.js";import{equals as A}from"../../../../base/common/objects.js";import"../../../../base/common/severity.js";import{isBoolean as F}from"../../../../base/common/types.js";import"../../../../base/parts/storage/common/storage.js";import{localize as g}from"../../../../nls.js";import{IDialogService as C}from"../../../../platform/dialogs/common/dialogs.js";import{ExtensionIdentifier as S}from"../../../../platform/extensions/common/extensions.js";import{InstantiationType as w,registerSingleton as _}from"../../../../platform/instantiation/common/extensions.js";import{Registry as M}from"../../../../platform/registry/common/platform.js";import{IStorageService as R,StorageScope as E,StorageTarget as N}from"../../../../platform/storage/common/storage.js";import{IExtensionService as k}from"../../extensions/common/extensions.js";import{Extensions as O,IExtensionFeaturesManagementService as T}from"./extensionFeatures.js";const x="extension.features.state";let l=class extends I{constructor(t,e,s){super();this.storageService=t;this.dialogService=e;this.extensionService=s;this.registry=M.as(O.ExtensionFeaturesRegistry),this.extensionFeaturesState=this.loadState(),this._register(t.onDidChangeValue(E.PROFILE,x,this._store)(n=>this.onDidStorageChange(n)))}_onDidChangeEnablement=this._register(new b);onDidChangeEnablement=this._onDidChangeEnablement.event;_onDidChangeAccessData=this._register(new b);onDidChangeAccessData=this._onDidChangeAccessData.event;registry;extensionFeaturesState=new Map;isEnabled(t,e){const s=this.registry.getExtensionFeature(e);if(!s)return!1;const n=this.getExtensionFeatureState(t,e)?.disabled;if(F(n))return!n;const a=s.access.extensionsList?.[t.value];return F(a)?a:!s.access.requireUserConsent}setEnablement(t,e,s){if(!this.registry.getExtensionFeature(e))throw new Error(`No feature with id '${e}'`);const a=this.getAndSetIfNotExistsExtensionFeatureState(t,e);a.disabled!==!s&&(a.disabled=!s,this._onDidChangeEnablement.fire({extension:t,featureId:e,enabled:s}),this.saveState())}getEnablementData(t){const e=[];if(this.registry.getExtensionFeature(t))for(const[n,a]of this.extensionFeaturesState){const i=a.get(t);i?.disabled!==void 0&&e.push({extension:new S(n),enabled:!i.disabled})}return e}async getAccess(t,e,s){const n=this.registry.getExtensionFeature(e);if(!n)return!1;const a=this.getAndSetIfNotExistsExtensionFeatureState(t,e);if(a.disabled)return!1;if(a.disabled===void 0){let i=!0;if(n.access.requireUserConsent){const r=this.extensionService.extensions.find(f=>S.equals(f.identifier,t));i=(await this.dialogService.confirm({title:g("accessExtensionFeature","Access '{0}' Feature",n.label),message:g("accessExtensionFeatureMessage","'{0}' extension would like to access the '{1}' feature.",r?.displayName??t.value,n.label),detail:s??n.description,custom:!0,primaryButton:g("allow","Allow"),cancelButton:g("disallow","Don't Allow")})).confirmed}if(this.setEnablement(t,e,i),!i)return!1}return a.accessData.current={count:a.accessData.current?.count?a.accessData.current?.count+1:1,lastAccessed:Date.now(),status:a.accessData.current?.status},a.accessData.totalCount=a.accessData.totalCount+1,this.saveState(),this._onDidChangeAccessData.fire({extension:t,featureId:e,accessData:a.accessData}),!0}getAccessData(t,e){if(this.registry.getExtensionFeature(e))return this.getExtensionFeatureState(t,e)?.accessData}setStatus(t,e,s){if(!this.registry.getExtensionFeature(e))throw new Error(`No feature with id '${e}'`);const a=this.getAndSetIfNotExistsExtensionFeatureState(t,e);a.accessData.current={count:a.accessData.current?.count??0,lastAccessed:a.accessData.current?.lastAccessed??0,status:s},this._onDidChangeAccessData.fire({extension:t,featureId:e,accessData:this.getAccessData(t,e)})}getExtensionFeatureState(t,e){return this.extensionFeaturesState.get(t.value)?.get(e)}getAndSetIfNotExistsExtensionFeatureState(t,e){let s=this.extensionFeaturesState.get(t.value);s||(s=new Map,this.extensionFeaturesState.set(t.value,s));let n=s.get(e);return n||(n={accessData:{totalCount:0}},s.set(e,n)),n}onDidStorageChange(t){if(t.external){const e=this.extensionFeaturesState;this.extensionFeaturesState=this.loadState();for(const s of m([...e.keys(),...this.extensionFeaturesState.keys()])){const n=new S(s),a=e.get(s),i=this.extensionFeaturesState.get(s);for(const r of m([...a?.keys()??[],...i?.keys()??[]])){const c=this.isEnabled(n,r),f=!a?.get(r)?.disabled;c!==f&&this._onDidChangeEnablement.fire({extension:n,featureId:r,enabled:c});const h=this.getAccessData(n,r),p=a?.get(r)?.accessData;A(h,p)||this._onDidChangeAccessData.fire({extension:n,featureId:r,accessData:h??{totalCount:0}})}}}}loadState(){let t={};const e=this.storageService.get(x,E.PROFILE,"{}");try{t=JSON.parse(e)}catch{}const s=new Map;for(const n in t){const a=new Map,i=t[n];for(const r in i){const c=i[r];a.set(r,{disabled:c.disabled,accessData:{totalCount:c.accessCount}})}s.set(n,a)}return s}saveState(){const t={};this.extensionFeaturesState.forEach((e,s)=>{const n={};e.forEach((a,i)=>{n[i]={disabled:a.disabled,accessCount:a.accessData.totalCount}}),t[s]=n}),this.storageService.store(x,JSON.stringify(t),E.PROFILE,N.USER)}};l=D([d(0,R),d(1,C),d(2,k)],l),_(T,l,w.Delayed);
