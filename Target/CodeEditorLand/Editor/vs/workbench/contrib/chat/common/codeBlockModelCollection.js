var I=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var c=(o,a,r,e)=>{for(var t=e>1?void 0:e?M(a,r):a,i=o.length-1,n;i>=0;i--)(n=o[i])&&(t=(e?n(a,r,t):n(t))||t);return e&&t&&I(a,r,t),t},h=(o,a)=>(r,e)=>a(r,e,o);import{Disposable as y}from"../../../../../vs/base/common/lifecycle.js";import{ResourceMap as R}from"../../../../../vs/base/common/map.js";import{Schemas as w}from"../../../../../vs/base/common/network.js";import{URI as v}from"../../../../../vs/base/common/uri.js";import{Range as V}from"../../../../../vs/editor/common/core/range.js";import{ILanguageService as x}from"../../../../../vs/editor/common/languages/language.js";import{EndOfLinePreference as b}from"../../../../../vs/editor/common/model.js";import{ITextModelService as C}from"../../../../../vs/editor/common/services/resolverService.js";import{isResponseVM as L}from"../../../../../vs/workbench/contrib/chat/common/chatViewModel.js";import{extractVulnerabilitiesFromText as S}from"./annotations.js";let g=class extends y{constructor(r,e){super();this.languageService=r;this.textModelService=e}_models=new R;maxModelCount=100;dispose(){super.dispose(),this.clear()}get(r,e,t){const i=this.getUri(r,e,t),n=this._models.get(i);if(n)return{model:n.model.then(s=>s.object),vulns:n.vulns}}getOrCreate(r,e,t){const i=this.get(r,e,t);if(i)return i;const n=this.getUri(r,e,t),s=this.textModelService.createModelReference(n);for(this._models.set(n,{model:s,vulns:[]});this._models.size>this.maxModelCount;){const l=Array.from(this._models.keys()).at(0);if(!l)break;this.delete(l)}return{model:s.then(l=>l.object),vulns:[]}}delete(r){const e=this._models.get(r);e&&(e.model.then(t=>t.dispose()),this._models.delete(r))}clear(){this._models.forEach(async r=>(await r.model).dispose()),this._models.clear()}async update(r,e,t,i){const n=this.getOrCreate(r,e,t),s=S(i.text),l=T(s.newText,i.languageId);this.setVulns(r,e,t,s.vulnerabilities);const d=(await n.model).textEditorModel;if(i.languageId){const u=this.languageService.getLanguageIdByLanguageName(i.languageId);u&&u!==d.getLanguageId()&&d.setLanguage(u)}const m=d.getValue(b.LF);if(l!==m)if(l.startsWith(m)){const u=l.slice(m.length),f=d.getLineCount(),p=d.getLineMaxColumn(f);d.applyEdits([{range:new V(f,p,f,p),text:u}])}else d.setValue(l)}setVulns(r,e,t,i){const n=this.getUri(r,e,t),s=this._models.get(n);s&&(s.vulns=i)}getUri(r,e,t){const i=this.getUriMetaData(e);return v.from({scheme:w.vscodeChatCodeBlock,authority:r,path:`/${e.id}/${t}`,fragment:i?JSON.stringify(i):void 0})}getUriMetaData(r){if(L(r))return{references:r.contentReferences.map(e=>{if(typeof e.reference=="string")return;const t="variableName"in e.reference?e.reference.value:e.reference;if(t)return v.isUri(t)?{uri:t.toJSON()}:{uri:t.uri.toJSON(),range:t.range}})}}};g=c([h(0,x),h(1,C)],g);function T(o,a){return a==="php"&&!o.trim().startsWith("<")?`<?php
${o}`:o}export{g as CodeBlockModelCollection};