var l=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var n=(t,r,e,i)=>{for(var o=i>1?void 0:i?I(r,e):r,a=t.length-1,c;a>=0;a--)(c=t[a])&&(o=(i?c(r,e,o):c(o))||o);return i&&o&&l(r,e,o),o},S=(t,r)=>(e,i)=>r(e,i,t);import{Disposable as m}from"../../../../../vs/base/common/lifecycle.js";import{ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX as p}from"../../../../../vs/platform/accessibility/common/accessibility.js";import{createDecorator as d}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IStorageService as f,StorageScope as v}from"../../../../../vs/platform/storage/common/storage.js";const u=d("accessibleViewInformationService");let s=class extends m{constructor(e){super();this._storageService=e}hasShownAccessibleView(e){return this._storageService.getBoolean(`${p}${e}`,v.APPLICATION,!1)===!0}};s=n([S(0,f)],s);export{s as AccessibleViewInformationService,u as IAccessibleViewInformationService};
