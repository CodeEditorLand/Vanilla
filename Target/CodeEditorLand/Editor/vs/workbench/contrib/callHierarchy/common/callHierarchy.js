import{CancellationToken as g}from"../../../../base/common/cancellation.js";import{LanguageFeatureRegistry as v}from"../../../../editor/common/languageFeatureRegistry.js";import{URI as h}from"../../../../base/common/uri.js";import{Position as x}from"../../../../editor/common/core/position.js";import{isNonEmptyArray as C}from"../../../../base/common/arrays.js";import{onUnexpectedExternalError as p}from"../../../../base/common/errors.js";import{RefCountedDisposable as H}from"../../../../base/common/lifecycle.js";import{CommandsRegistry as u}from"../../../../platform/commands/common/commands.js";import{assertType as d}from"../../../../base/common/types.js";import{IModelService as R}from"../../../../editor/common/services/model.js";import{ITextModelService as P}from"../../../../editor/common/services/resolverService.js";var M=(e=>(e.CallsTo="incomingCalls",e.CallsFrom="outgoingCalls",e))(M||{});const T=new v;class m{constructor(o,e,r,a){this.id=o;this.provider=e;this.roots=r;this.ref=a;this.root=r[0]}static async create(o,e,r){const[a]=T.ordered(o);if(!a)return;const t=await a.prepareCallHierarchy(o,e,r);if(t)return new m(t.roots.reduce((s,i)=>s+i._sessionId,""),a,t.roots,new H(t))}root;dispose(){this.ref.release()}fork(o){const e=this;return new class extends m{constructor(){super(e.id,e.provider,[o],e.ref.acquire())}}}async resolveIncomingCalls(o,e){try{const r=await this.provider.provideIncomingCalls(o,e);if(C(r))return r}catch(r){p(r)}return[]}async resolveOutgoingCalls(o,e){try{const r=await this.provider.provideOutgoingCalls(o,e);if(C(r))return r}catch(r){p(r)}return[]}}const l=new Map;u.registerCommand("_executePrepareCallHierarchy",async(n,...o)=>{const[e,r]=o;d(h.isUri(e)),d(x.isIPosition(r));let t=n.get(R).getModel(e),s;if(!t){const c=await n.get(P).createModelReference(e);t=c.object.textEditorModel,s=c}try{const i=await m.create(t,r,g.None);return i?(l.set(i.id,i),l.forEach((c,y,I)=>{I.size>10&&(c.dispose(),l.delete(y))}),[i.root]):[]}finally{s?.dispose()}});function f(n){return!0}u.registerCommand("_executeProvideIncomingCalls",async(n,...o)=>{const[e]=o;d(f(e));const r=l.get(e._sessionId);if(r)return r.resolveIncomingCalls(e,g.None)}),u.registerCommand("_executeProvideOutgoingCalls",async(n,...o)=>{const[e]=o;d(f(e));const r=l.get(e._sessionId);if(r)return r.resolveOutgoingCalls(e,g.None)});export{M as CallHierarchyDirection,m as CallHierarchyModel,T as CallHierarchyProviderRegistry};
