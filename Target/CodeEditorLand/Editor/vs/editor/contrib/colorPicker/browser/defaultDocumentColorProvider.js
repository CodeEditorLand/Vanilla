var h=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var I=(s,o,r,a)=>{for(var e=a>1?void 0:a?f(o,r):o,t=s.length-1,n;t>=0;t--)(n=s[t])&&(e=(a?n(o,r,e):n(e))||e);return a&&e&&h(o,r,e),e},p=(s,o)=>(r,a)=>o(r,a,s);import{Color as i,RGBA as k}from"../../../../base/common/color.js";import{Disposable as u}from"../../../../base/common/lifecycle.js";import{ILanguageFeaturesService as v}from"../../../common/services/languageFeatures.js";import{IEditorWorkerService as g}from"../../../common/services/editorWorker.js";let m=class{constructor(o){this._editorWorkerService=o}async provideDocumentColors(o,r){return this._editorWorkerService.computeDefaultDocumentColors(o.uri)}provideColorPresentations(o,r,a){const e=r.range,t=r.color,n=t.alpha,l=new i(new k(Math.round(255*t.red),Math.round(255*t.green),Math.round(255*t.blue),n)),d=n?i.Format.CSS.formatRGB(l):i.Format.CSS.formatRGBA(l),C=n?i.Format.CSS.formatHSL(l):i.Format.CSS.formatHSLA(l),x=n?i.Format.CSS.formatHex(l):i.Format.CSS.formatHexA(l),c=[];return c.push({label:d,textEdit:{range:e,text:d}}),c.push({label:C,textEdit:{range:e,text:C}}),c.push({label:x,textEdit:{range:e,text:x}}),c}};m=I([p(0,g)],m);let S=class extends u{constructor(o,r){super(),this._register(o.colorProvider.register("*",new m(r)))}};S=I([p(0,v),p(1,g)],S);export{m as DefaultDocumentColorProvider,S as DefaultDocumentColorProviderFeature};
