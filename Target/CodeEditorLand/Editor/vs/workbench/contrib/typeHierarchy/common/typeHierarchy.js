import{isNonEmptyArray as u}from"../../../../../vs/base/common/arrays.js";import{CancellationToken as m}from"../../../../../vs/base/common/cancellation.js";import{onUnexpectedExternalError as f}from"../../../../../vs/base/common/errors.js";import{RefCountedDisposable as H}from"../../../../../vs/base/common/lifecycle.js";import{assertType as y}from"../../../../../vs/base/common/types.js";import{URI as I}from"../../../../../vs/base/common/uri.js";import{Position as S}from"../../../../../vs/editor/common/core/position.js";import{Range as T}from"../../../../../vs/editor/common/core/range.js";import{LanguageFeatureRegistry as x}from"../../../../../vs/editor/common/languageFeatureRegistry.js";import"../../../../../vs/editor/common/languages.js";import"../../../../../vs/editor/common/model.js";import{IModelService as R}from"../../../../../vs/editor/common/services/model.js";import{ITextModelService as P}from"../../../../../vs/editor/common/services/resolverService.js";import{CommandsRegistry as l}from"../../../../../vs/platform/commands/common/commands.js";var b=(e=>(e.Subtypes="subtypes",e.Supertypes="supertypes",e))(b||{});const M=new x;class d{constructor(t,e,r,s){this.id=t;this.provider=e;this.roots=r;this.ref=s;this.root=r[0]}static async create(t,e,r){const[s]=M.ordered(t);if(!s)return;const o=await s.prepareTypeHierarchy(t,e,r);if(o)return new d(o.roots.reduce((p,n)=>p+n._sessionId,""),s,o.roots,new H(o))}root;dispose(){this.ref.release()}fork(t){const e=this;return new class extends d{constructor(){super(e.id,e.provider,[t],e.ref.acquire())}}}async provideSupertypes(t,e){try{const r=await this.provider.provideSupertypes(t,e);if(u(r))return r}catch(r){f(r)}return[]}async provideSubtypes(t,e){try{const r=await this.provider.provideSubtypes(t,e);if(u(r))return r}catch(r){f(r)}return[]}}const a=new Map;l.registerCommand("_executePrepareTypeHierarchy",async(i,...t)=>{const[e,r]=t;y(I.isUri(e)),y(S.isIPosition(r));let o=i.get(R).getModel(e),p;if(!o){const c=await i.get(P).createModelReference(e);o=c.object.textEditorModel,p=c}try{const n=await d.create(o,r,m.None);return n?(a.set(n.id,n),a.forEach((c,g,v)=>{v.size>10&&(c.dispose(),a.delete(g))}),[n.root]):[]}finally{p?.dispose()}});function h(i){const t=i;return typeof i=="object"&&typeof t.name=="string"&&typeof t.kind=="number"&&I.isUri(t.uri)&&T.isIRange(t.range)&&T.isIRange(t.selectionRange)}l.registerCommand("_executeProvideSupertypes",async(i,...t)=>{const[e]=t;y(h(e));const r=a.get(e._sessionId);if(r)return r.provideSupertypes(e,m.None)}),l.registerCommand("_executeProvideSubtypes",async(i,...t)=>{const[e]=t;y(h(e));const r=a.get(e._sessionId);if(r)return r.provideSubtypes(e,m.None)});export{b as TypeHierarchyDirection,d as TypeHierarchyModel,M as TypeHierarchyProviderRegistry};
