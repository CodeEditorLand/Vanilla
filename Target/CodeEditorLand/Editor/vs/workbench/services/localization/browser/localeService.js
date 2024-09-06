var p=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var u=(n,e,o,t)=>{for(var a=t>1?void 0:t?S(e,o):e,l=n.length-1,m;l>=0;l--)(m=n[l])&&(a=(t?m(e,o,a):m(a))||a);return t&&a&&p(e,o,a),a},s=(n,e)=>(o,t)=>e(o,t,n);import{getCookieValue as f}from"../../../../../vs/base/browser/dom.js";import{CancellationToken as I}from"../../../../../vs/base/common/cancellation.js";import{Language as L,LANGUAGE_DEFAULT as y}from"../../../../../vs/base/common/platform.js";import{localize as c}from"../../../../../vs/nls.js";import{IDialogService as h}from"../../../../../vs/platform/dialogs/common/dialogs.js";import{IExtensionGalleryService as C}from"../../../../../vs/platform/extensionManagement/common/extensionManagement.js";import{InstantiationType as v,registerSingleton as E}from"../../../../../vs/platform/instantiation/common/extensions.js";import"../../../../../vs/platform/languagePacks/common/languagePacks.js";import{ILogService as O}from"../../../../../vs/platform/log/common/log.js";import{IProductService as _}from"../../../../../vs/platform/product/common/productService.js";import{IHostService as A}from"../../../../../vs/workbench/services/host/browser/host.js";import{IActiveLanguagePackService as T,ILocaleService as x}from"../../../../../vs/workbench/services/localization/common/locale.js";const i=new class r{static LOCAL_STORAGE_LOCALE_KEY="vscode.nls.locale";static LOCAL_STORAGE_EXTENSION_ID_KEY="vscode.nls.languagePackExtensionId";constructor(){this.migrateCookie()}migrateCookie(){const e=f(r.LOCAL_STORAGE_LOCALE_KEY),o=localStorage.getItem(r.LOCAL_STORAGE_LOCALE_KEY);typeof e!="string"&&typeof o!="string"||e===o||(typeof o=="string"?this.doSetLocaleToCookie(o):this.doClearLocaleToCookie())}setLocale(e){localStorage.setItem(r.LOCAL_STORAGE_LOCALE_KEY,e),this.doSetLocaleToCookie(e)}doSetLocaleToCookie(e){document.cookie=`${r.LOCAL_STORAGE_LOCALE_KEY}=${e};path=/;max-age=3153600000`}clearLocale(){localStorage.removeItem(r.LOCAL_STORAGE_LOCALE_KEY),this.doClearLocaleToCookie()}doClearLocaleToCookie(){document.cookie=`${r.LOCAL_STORAGE_LOCALE_KEY}=;path=/;max-age=0`}setExtensionId(e){localStorage.setItem(r.LOCAL_STORAGE_EXTENSION_ID_KEY,e)}getExtensionId(){return localStorage.getItem(r.LOCAL_STORAGE_EXTENSION_ID_KEY)}clearExtensionId(){localStorage.removeItem(r.LOCAL_STORAGE_EXTENSION_ID_KEY)}};let d=class{constructor(e,o,t){this.dialogService=e;this.hostService=o;this.productService=t}async setLocale(e,o=!1){const t=e.id;if(t===L.value()||!t&&L.value()===navigator.language.toLowerCase())return;t?(i.setLocale(t),e.extensionId&&i.setExtensionId(e.extensionId)):(i.clearLocale(),i.clearExtensionId()),(await this.dialogService.confirm({type:"info",message:c("relaunchDisplayLanguageMessage","To change the display language, {0} needs to reload",this.productService.nameLong),detail:c("relaunchDisplayLanguageDetail","Press the reload button to refresh the page and set the display language to {0}.",e.label),primaryButton:c({key:"reload",comment:["&& denotes a mnemonic character"]},"&&Reload")})).confirmed&&this.hostService.restart()}async clearLocalePreference(){if(i.clearLocale(),i.clearExtensionId(),L.value()===navigator.language.toLowerCase())return;(await this.dialogService.confirm({type:"info",message:c("clearDisplayLanguageMessage","To change the display language, {0} needs to reload",this.productService.nameLong),detail:c("clearDisplayLanguageDetail","Press the reload button to refresh the page and use your browser's language."),primaryButton:c({key:"reload",comment:["&& denotes a mnemonic character"]},"&&Reload")})).confirmed&&this.hostService.restart()}};d=u([s(0,h),s(1,A),s(2,_)],d);let g=class{constructor(e,o){this.galleryService=e;this.logService=o}_serviceBrand;async getExtensionIdProvidingCurrentLocale(){const e=L.value();if(e===y)return;const o=i.getExtensionId();if(o)return o;if(this.galleryService.isEnabled())try{const a=(await this.galleryService.query({text:`tag:lp-${e}`},I.None)).firstPage.find(l=>l.publisher==="MS-CEINTL"&&l.name.startsWith("vscode-language-pack"));if(a)return i.setExtensionId(a.identifier.id),a.identifier.id}catch(t){this.logService.error(t)}}};g=u([s(0,C),s(1,O)],g),E(x,d,v.Delayed),E(T,g,v.Delayed);export{d as WebLocaleService};