var S=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var m=(i,e,r,t)=>{for(var o=t>1?void 0:t?x(e,r):e,n=i.length-1,a;n>=0;n--)(a=i[n])&&(o=(t?a(e,r,o):a(o))||o);return t&&o&&S(e,r,o),o},d=(i,e)=>(r,t)=>e(r,t,i);import*as f from"vs/base/common/marked/marked";import{Schemas as T}from"../../../../../vs/base/common/network.js";import{assertIsDefined as k}from"../../../../../vs/base/common/types.js";import"../../../../../vs/base/common/uri.js";import{Range as w}from"../../../../../vs/editor/common/core/range.js";import{ILanguageService as M}from"../../../../../vs/editor/common/languages/language.js";import{DefaultEndOfLine as P,EndOfLinePreference as C}from"../../../../../vs/editor/common/model.js";import{createTextBufferFactory as R}from"../../../../../vs/editor/common/model/textModel.js";import{IModelService as F}from"../../../../../vs/editor/common/services/model.js";import{ITextModelService as B}from"../../../../../vs/editor/common/services/resolverService.js";import{IInstantiationService as L}from"../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../vs/workbench/common/contributions.js";class b{providers=new Map;registerProvider(e,r){this.providers.set(e,r)}getProvider(e){return this.providers.get(e)}}const W=new b;async function E(i,e){if(!e.query)throw new Error("Walkthrough: invalid resource");const r=JSON.parse(e.query);if(!r.moduleId)throw new Error("Walkthrough: invalid resource");const t=W.getProvider(r.moduleId);return t?i.invokeFunction(t):new Promise((o,n)=>{require([r.moduleId],a=>{try{o(i.invokeFunction(a.default))}catch(s){n(s)}})})}let c=class{constructor(e,r,t,o){this.textModelResolverService=e;this.languageService=r;this.modelService=t;this.instantiationService=o;this.textModelResolverService.registerTextModelContentProvider(T.walkThroughSnippet,this)}static ID="workbench.contrib.walkThroughSnippetContentProvider";loads=new Map;async textBufferFactoryFromResource(e){let r=this.loads.get(e.toString());return r||(r=E(this.instantiationService,e).then(t=>R(t)).finally(()=>this.loads.delete(e.toString())),this.loads.set(e.toString(),r)),r}async provideTextContent(e){const r=await this.textBufferFactoryFromResource(e.with({fragment:""}));let t=this.modelService.getModel(e);if(!t){const o=parseInt(e.fragment);let n=0;const a=new f.marked.Renderer;a.code=({text:I,lang:l})=>{n++;const h=typeof l=="string"&&this.languageService.getLanguageIdByLanguageName(l)||"",p=this.languageService.createById(h),y=this.modelService.createModel(I,p,e.with({fragment:`${n}.${l}`}));return n===o&&(t=y),""};const s=r.create(P.LF).textBuffer,g=s.getLineCount(),u=new w(1,1,g,s.getLineLength(g)+1),v=s.getValueInRange(u,C.TextDefined);f.marked(v,{renderer:a})}return k(t)}};c=m([d(0,B),d(1,M),d(2,F),d(3,L)],c);export{c as WalkThroughSnippetContentProvider,E as moduleToContent,W as walkThroughContentRegistry};