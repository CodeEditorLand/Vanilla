var l=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var c=(t,r,i,o)=>{for(var e=o>1?void 0:o?D(r,i):r,f=t.length-1,n;f>=0;f--)(n=t[f])&&(e=(o?n(r,i,e):n(e))||e);return o&&e&&l(r,i,e),e},d=(t,r)=>(i,o)=>r(i,o,t);import{Emitter as P}from"../../../../base/common/event.js";import{Disposable as m}from"../../../../base/common/lifecycle.js";import{isEqualOrParent as u}from"../../../../base/common/resources.js";import"../../../../base/common/uri.js";import{score as v}from"../../../../editor/common/languageSelector.js";import{IUriIdentityService as k}from"../../../../platform/uriIdentity/common/uriIdentity.js";import"./quickDiff.js";function U(t){return(r,i)=>{if(r.rootUri&&!i.rootUri)return-1;if(!r.rootUri&&i.rootUri)return 1;if(!r.rootUri&&!i.rootUri)return 0;const o=u(t,r.rootUri),e=u(t,i.rootUri);return o&&e?r.rootUri.fsPath.length-i.rootUri.fsPath.length:o?-1:e?1:0}}let a=class extends m{constructor(i){super();this.uriIdentityService=i}quickDiffProviders=new Set;_onDidChangeQuickDiffProviders=this._register(new P);onDidChangeQuickDiffProviders=this._onDidChangeQuickDiffProviders.event;addQuickDiffProvider(i){return this.quickDiffProviders.add(i),this._onDidChangeQuickDiffProviders.fire(),{dispose:()=>{this.quickDiffProviders.delete(i),this._onDidChangeQuickDiffProviders.fire()}}}isQuickDiff(i){return!!i.originalResource&&typeof i.label=="string"&&typeof i.isSCM=="boolean"}async getQuickDiffs(i,o="",e=!1){const f=Array.from(this.quickDiffProviders).filter(s=>!s.rootUri||this.uriIdentityService.extUri.isEqualOrParent(i,s.rootUri)).sort(U(i));return(await Promise.all(f.map(async s=>({originalResource:(s.selector?v(s.selector,i,o,e,void 0,void 0):10)>0?await s.getOriginalResource(i)??void 0:void 0,label:s.label,isSCM:s.isSCM})))).filter(this.isQuickDiff)}};a=c([d(0,k)],a);export{a as QuickDiffService};
