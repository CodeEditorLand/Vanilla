var p=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var c=(s,e,t,i)=>{for(var o=i>1?void 0:i?P(e,t):e,r=s.length-1,n;r>=0;r--)(n=s[r])&&(o=(i?n(e,t,o):n(o))||o);return i&&o&&p(e,t,o),o},u=(s,e)=>(t,i)=>e(t,i,s);import"../../../../../vs/base/common/cancellation.js";import{Disposable as v}from"../../../../../vs/base/common/lifecycle.js";import{ResourceMap as D}from"../../../../../vs/base/common/map.js";import"../../../../../vs/editor/common/core/position.js";import{USUAL_WORD_SEPARATORS as h}from"../../../../../vs/editor/common/core/wordHelper.js";import{DocumentHighlightKind as a}from"../../../../../vs/editor/common/languages.js";import"../../../../../vs/editor/common/languageSelector.js";import"../../../../../vs/editor/common/model.js";import{ILanguageFeaturesService as H}from"../../../../../vs/editor/common/services/languageFeatures.js";class d{selector={language:"*"};provideDocumentHighlights(e,t,i){const o=[],r=e.getWordAtPosition({lineNumber:t.lineNumber,column:t.column});return r?e.isDisposed()?void 0:e.findMatches(r.word,!0,!1,!0,h,!1).map(m=>({range:m.range,kind:a.Text})):Promise.resolve(o)}provideMultiDocumentHighlights(e,t,i,o){const r=new D,n=e.getWordAtPosition({lineNumber:t.lineNumber,column:t.column});if(!n)return Promise.resolve(r);for(const m of[e,...i]){if(m.isDisposed())continue;const g=m.findMatches(n.word,!0,!1,!0,h,!1).map(f=>({range:f.range,kind:a.Text}));g&&r.set(m.uri,g)}return r}}let l=class extends v{constructor(e){super(),this._register(e.documentHighlightProvider.register("*",new d)),this._register(e.multiDocumentHighlightProvider.register("*",new d))}};l=c([u(0,H)],l);export{l as TextualMultiDocumentHighlightFeature};