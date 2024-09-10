var E=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var u=(a,e,r,t)=>{for(var i=t>1?void 0:t?v(e,r):e,n=a.length-1,o;n>=0;n--)(o=a[n])&&(i=(t?o(e,r,i):o(i))||i);return t&&i&&E(e,r,i),i},c=(a,e)=>(r,t)=>e(r,t,a);import{coalesce as L}from"../../../../base/common/arrays.js";import{UriList as S}from"../../../../base/common/dataTransfer.js";import{HierarchicalKind as y}from"../../../../base/common/hierarchicalKind.js";import{Disposable as g}from"../../../../base/common/lifecycle.js";import{Mimes as s}from"../../../../base/common/mime.js";import{Schemas as M}from"../../../../base/common/network.js";import{relativePath as C}from"../../../../base/common/resources.js";import{URI as w}from"../../../../base/common/uri.js";import{DocumentPasteTriggerKind as R}from"../../../common/languages.js";import{ILanguageFeaturesService as x}from"../../../common/services/languageFeatures.js";import{localize as l}from"../../../../nls.js";import{IWorkspaceContextService as h}from"../../../../platform/workspace/common/workspace.js";class P{async provideDocumentPasteEdits(e,r,t,i,n){const o=await this.getEdit(t,n);if(o)return{edits:[{insertText:o.insertText,title:o.title,kind:o.kind,handledMimeType:o.handledMimeType,yieldTo:o.yieldTo}],dispose(){}}}async provideDocumentDropEdits(e,r,t,i){const n=await this.getEdit(t,i);if(n)return{edits:[{insertText:n.insertText,title:n.title,kind:n.kind,handledMimeType:n.handledMimeType,yieldTo:n.yieldTo}],dispose(){}}}}class p extends P{static id="text";static kind=new y("text.plain");id=p.id;kind=p.kind;dropMimeTypes=[s.text];pasteMimeTypes=[s.text];async getEdit(e,r){const t=e.get(s.text);if(!t||e.has(s.uriList))return;const i=await t.asString();return{handledMimeType:s.text,title:l("text.label","Insert Plain Text"),insertText:i,kind:this.kind}}}class k extends P{kind=new y("uri.absolute");dropMimeTypes=[s.uriList];pasteMimeTypes=[s.uriList];async getEdit(e,r){const t=await D(e);if(!t.length||r.isCancellationRequested)return;let i=0;const n=t.map(({uri:d,originalText:I})=>d.scheme===M.file?d.fsPath:(i++,I)).join(" ");let o;return i>0?o=t.length>1?l("defaultDropProvider.uriList.uris","Insert Uris"):l("defaultDropProvider.uriList.uri","Insert Uri"):o=t.length>1?l("defaultDropProvider.uriList.paths","Insert Paths"):l("defaultDropProvider.uriList.path","Insert Path"),{handledMimeType:s.uriList,insertText:n,title:o,kind:this.kind}}}let m=class extends P{constructor(r){super();this._workspaceContextService=r}kind=new y("uri.relative");dropMimeTypes=[s.uriList];pasteMimeTypes=[s.uriList];async getEdit(r,t){const i=await D(r);if(!i.length||t.isCancellationRequested)return;const n=L(i.map(({uri:o})=>{const d=this._workspaceContextService.getWorkspaceFolder(o);return d?C(d.uri,o):void 0}));if(n.length)return{handledMimeType:s.uriList,insertText:n.join(" "),title:i.length>1?l("defaultDropProvider.uriList.relativePaths","Insert Relative Paths"):l("defaultDropProvider.uriList.relativePath","Insert Relative Path"),kind:this.kind}}};m=u([c(0,h)],m);class _{kind=new y("html");pasteMimeTypes=["text/html"];_yieldTo=[{mimeType:s.text}];async provideDocumentPasteEdits(e,r,t,i,n){if(i.triggerKind!==R.PasteAs&&!i.only?.contains(this.kind))return;const d=await t.get("text/html")?.asString();if(!(!d||n.isCancellationRequested))return{dispose(){},edits:[{insertText:d,yieldTo:this._yieldTo,title:l("pasteHtmlLabel","Insert HTML"),kind:this.kind}]}}}async function D(a){const e=a.get(s.uriList);if(!e)return[];const r=await e.asString(),t=[];for(const i of S.parse(r))try{t.push({uri:w.parse(i),originalText:i})}catch{}return t}let T=class extends g{constructor(e,r){super(),this._register(e.documentDropEditProvider.register("*",new p)),this._register(e.documentDropEditProvider.register("*",new k)),this._register(e.documentDropEditProvider.register("*",new m(r)))}};T=u([c(0,x),c(1,h)],T);let f=class extends g{constructor(e,r){super(),this._register(e.documentPasteEditProvider.register("*",new p)),this._register(e.documentPasteEditProvider.register("*",new k)),this._register(e.documentPasteEditProvider.register("*",new m(r))),this._register(e.documentPasteEditProvider.register("*",new _))}};f=u([c(0,x),c(1,h)],f);export{T as DefaultDropProvidersFeature,f as DefaultPasteProvidersFeature,p as DefaultTextPasteOrDropEditProvider};
