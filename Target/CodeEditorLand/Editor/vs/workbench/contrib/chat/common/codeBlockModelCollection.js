var y=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var I=(a,d,r,e)=>{for(var t=e>1?void 0:e?M(d,r):d,i=a.length-1,n;i>=0;i--)(n=a[i])&&(t=(e?n(d,r,t):n(t))||t);return e&&t&&y(d,r,t),t},f=(a,d)=>(r,e)=>d(r,e,a);import{Disposable as R}from"../../../../base/common/lifecycle.js";import{ResourceMap as w}from"../../../../base/common/map.js";import{Schemas as V}from"../../../../base/common/network.js";import{URI as v}from"../../../../base/common/uri.js";import{Range as U}from"../../../../editor/common/core/range.js";import{ILanguageService as x}from"../../../../editor/common/languages/language.js";import{EndOfLinePreference as C}from"../../../../editor/common/model.js";import{ITextModelService as b}from"../../../../editor/common/services/resolverService.js";import{extractCodeblockUrisFromText as L,extractVulnerabilitiesFromText as S}from"./annotations.js";import{isResponseVM as T}from"./chatViewModel.js";let m=class extends R{constructor(r,e){super();this.languageService=r;this.textModelService=e}_models=new w;maxModelCount=100;dispose(){super.dispose(),this.clear()}get(r,e,t){const i=this.getUri(r,e,t),n=this._models.get(i);if(n)return{model:n.model.then(s=>s.object),vulns:n.vulns,codemapperUri:n.codemapperUri}}getOrCreate(r,e,t){const i=this.get(r,e,t);if(i)return i;const n=this.getUri(r,e,t),s=this.textModelService.createModelReference(n);for(this._models.set(n,{model:s,vulns:[],codemapperUri:void 0});this._models.size>this.maxModelCount;){const o=Array.from(this._models.keys()).at(0);if(!o)break;this.delete(o)}return{model:s.then(o=>o.object),vulns:[],codemapperUri:void 0}}delete(r){const e=this._models.get(r);e&&(e.model.then(t=>t.dispose()),this._models.delete(r))}clear(){this._models.forEach(async r=>(await r.model).dispose()),this._models.clear()}async update(r,e,t,i){const n=this.getOrCreate(r,e,t),s=S(i.text);let o=_(s.newText,i.languageId);this.setVulns(r,e,t,s.vulnerabilities);const p=L(o);p&&(this.setCodemapperUri(r,e,t,p.uri),o=p.textWithoutResult);const l=(await n.model).textEditorModel;if(i.languageId){const u=this.languageService.getLanguageIdByLanguageName(i.languageId);u&&u!==l.getLanguageId()&&l.setLanguage(u)}const g=l.getValue(C.LF);if(o===g)return n;if(o.startsWith(g)){const u=o.slice(g.length),c=l.getLineCount(),h=l.getLineMaxColumn(c);l.applyEdits([{range:new U(c,h,c,h),text:u}])}else l.setValue(o);return n}setCodemapperUri(r,e,t,i){const n=this.getUri(r,e,t),s=this._models.get(n);s&&(s.codemapperUri=i)}setVulns(r,e,t,i){const n=this.getUri(r,e,t),s=this._models.get(n);s&&(s.vulns=i)}getUri(r,e,t){const i=this.getUriMetaData(e);return v.from({scheme:V.vscodeChatCodeBlock,authority:r,path:`/${e.id}/${t}`,fragment:i?JSON.stringify(i):void 0})}getUriMetaData(r){if(T(r))return{references:r.contentReferences.map(e=>{if(typeof e.reference=="string")return;const t="variableName"in e.reference?e.reference.value:e.reference;if(t)return v.isUri(t)?{uri:t.toJSON()}:{uri:t.uri.toJSON(),range:t.range}})}}};m=I([f(0,x),f(1,b)],m);function _(a,d){return d==="php"&&!a.trim().startsWith("<")?`<?php
${a}`:a}export{m as CodeBlockModelCollection};
