var h=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var v=(d,e,i,t)=>{for(var r=t>1?void 0:t?m(e,i):e,a=d.length-1,o;a>=0;a--)(o=d[a])&&(r=(t?o(e,i,r):o(r))||r);return t&&r&&h(e,i,r),r},s=(d,e)=>(i,t)=>e(i,t,d);import"../../../../../vs/base/common/cancellation.js";import"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/base/common/uri.js";import{ICodeEditorService as u}from"../../../../../vs/editor/browser/services/codeEditorService.js";import{score as I}from"../../../../../vs/editor/common/languageSelector.js";import{localize as p}from"../../../../../vs/nls.js";import"../../../../../vs/platform/actions/common/actions.js";import{IContextKeyService as S,RawContextKey as f}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{ILabelService as y}from"../../../../../vs/platform/label/common/label.js";import{IQuickInputService as C}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{ITelemetryService as b}from"../../../../../vs/platform/telemetry/common/telemetry.js";import"../../../../../vs/workbench/contrib/share/common/share.js";const g=new f("shareProviderCount",0,p("shareProviderCount","The number of available share providers"));let c=class{constructor(e,i,t,r,a){this.contextKeyService=e;this.labelService=i;this.quickInputService=t;this.codeEditorService=r;this.telemetryService=a;this.providerCount=g.bindTo(this.contextKeyService)}_serviceBrand;providerCount;_providers=new Set;registerShareProvider(e){return this._providers.add(e),this.providerCount.set(this._providers.size),{dispose:()=>{this._providers.delete(e),this.providerCount.set(this._providers.size)}}}getShareActions(){return[]}async provideShare(e,i){const t=this.codeEditorService.getActiveCodeEditor()?.getModel()?.getLanguageId()??"",r=[...this._providers.values()].filter(n=>I(n.selector,e.resourceUri,t,!0,void 0,void 0)>0).sort((n,l)=>n.priority-l.priority);if(r.length===0)return;if(r.length===1)return this.telemetryService.publicLog2("shareService.share",{providerId:r[0].id}),r[0].provideShare(e,i);const a=r.map(n=>({label:n.label,provider:n})),o=await this.quickInputService.pick(a,{canPickMany:!1,placeHolder:p("type to filter","Choose how to share {0}",this.labelService.getUriLabel(e.resourceUri))},i);if(o!==void 0)return this.telemetryService.publicLog2("shareService.share",{providerId:o.provider.id}),o.provider.provideShare(e,i)}};c=v([s(0,S),s(1,y),s(2,C),s(3,u),s(4,b)],c);export{g as ShareProviderCountContext,c as ShareService};