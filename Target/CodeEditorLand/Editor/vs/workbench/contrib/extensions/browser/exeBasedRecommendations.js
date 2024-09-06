var p=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var m=(s,i,e,t)=>{for(var o=t>1?void 0:t?c(i,e):i,n=s.length-1,r;n>=0;n--)(r=s[n])&&(o=(t?r(i,e,o):r(o))||o);return t&&o&&p(i,e,o),o},d=(s,i)=>(e,t)=>i(e,t,s);import{localize as x}from"../../../../nls.js";import{IExtensionTipsService as E}from"../../../../platform/extensionManagement/common/extensionManagement.js";import{ExtensionRecommendationReason as h}from"../../../services/extensionRecommendations/common/extensionRecommendations.js";import{ExtensionRecommendations as R}from"./extensionRecommendations.js";let a=class extends R{constructor(e){super();this.extensionTipsService=e}_otherTips=[];_importantTips=[];get otherRecommendations(){return this._otherTips.map(e=>this.toExtensionRecommendation(e))}get importantRecommendations(){return this._importantTips.map(e=>this.toExtensionRecommendation(e))}get recommendations(){return[...this.importantRecommendations,...this.otherRecommendations]}getRecommendations(e){const t=this._importantTips.filter(n=>n.exeName.toLowerCase()===e.toLowerCase()).map(n=>this.toExtensionRecommendation(n)),o=this._otherTips.filter(n=>n.exeName.toLowerCase()===e.toLowerCase()).map(n=>this.toExtensionRecommendation(n));return{important:t,others:o}}async doActivate(){this._otherTips=await this.extensionTipsService.getOtherExecutableBasedTips(),await this.fetchImportantExeBasedRecommendations()}_importantExeBasedRecommendations;async fetchImportantExeBasedRecommendations(){return this._importantExeBasedRecommendations||(this._importantExeBasedRecommendations=this.doFetchImportantExeBasedRecommendations()),this._importantExeBasedRecommendations}async doFetchImportantExeBasedRecommendations(){const e=new Map;return this._importantTips=await this.extensionTipsService.getImportantExecutableBasedTips(),this._importantTips.forEach(t=>e.set(t.extensionId.toLowerCase(),t)),e}toExtensionRecommendation(e){return{extension:e.extensionId.toLowerCase(),reason:{reasonId:h.Executable,reasonText:x("exeBasedRecommendation","This extension is recommended because you have {0} installed.",e.exeFriendlyName)}}}};a=m([d(0,E)],a);export{a as ExeBasedRecommendations};
