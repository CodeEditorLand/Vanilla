var v=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var c=(t,n,r,e)=>{for(var o=e>1?void 0:e?d(n,r):n,s=t.length-1,a;s>=0;s--)(a=t[s])&&(o=(e?a(n,r,o):a(o))||o);return e&&o&&v(n,r,o),o},m=(t,n)=>(r,e)=>n(r,e,t);import{localize as x}from"../../../../../vs/nls.js";import{IProductService as S}from"../../../../../vs/platform/product/common/productService.js";import{ExtensionRecommendations as p}from"../../../../../vs/workbench/contrib/extensions/browser/extensionRecommendations.js";import{IExtensionManagementServerService as E}from"../../../../../vs/workbench/services/extensionManagement/common/extensionManagement.js";import{ExtensionRecommendationReason as g}from"../../../../../vs/workbench/services/extensionRecommendations/common/extensionRecommendations.js";let i=class extends p{constructor(r,e){super();this.productService=r;this.extensionManagementServerService=e}_recommendations=[];get recommendations(){return this._recommendations}async doActivate(){this.extensionManagementServerService.webExtensionManagementServer&&!this.extensionManagementServerService.localExtensionManagementServer&&!this.extensionManagementServerService.remoteExtensionManagementServer&&Array.isArray(this.productService.webExtensionTips)&&(this._recommendations=this.productService.webExtensionTips.map(e=>({extension:e.toLowerCase(),reason:{reasonId:g.Application,reasonText:x("reason","This extension is recommended for {0} for the Web",this.productService.nameLong)}})))}};i=c([m(0,S),m(1,E)],i);export{i as WebRecommendations};