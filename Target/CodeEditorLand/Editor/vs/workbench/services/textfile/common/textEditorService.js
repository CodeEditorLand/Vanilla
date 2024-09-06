var m=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var p=(a,d,t,i)=>{for(var e=i>1?void 0:i?v(d,t):d,r=a.length-1,o;r>=0;r--)(o=a[r])&&(e=(i?o(d,t,e):o(e))||e);return i&&e&&m(d,t,e),e},s=(a,d)=>(t,i)=>d(t,i,a);import{Event as y}from"../../../../base/common/event.js";import{Disposable as x}from"../../../../base/common/lifecycle.js";import{ResourceMap as T}from"../../../../base/common/map.js";import{Schemas as u}from"../../../../base/common/network.js";import{basename as g}from"../../../../base/common/resources.js";import{URI as S}from"../../../../base/common/uri.js";import{IFileService as U}from"../../../../platform/files/common/files.js";import{InstantiationType as F,registerSingleton as h}from"../../../../platform/instantiation/common/extensions.js";import{createDecorator as R,IInstantiationService as P}from"../../../../platform/instantiation/common/instantiation.js";import{Registry as b}from"../../../../platform/registry/common/platform.js";import{IUriIdentityService as D}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{DEFAULT_EDITOR_ASSOCIATION as I,EditorExtensions as C,isResourceDiffEditorInput as O,isResourceMergeEditorInput as N,isResourceSideBySideEditorInput as w}from"../../../common/editor.js";import{DiffEditorInput as M}from"../../../common/editor/diffEditorInput.js";import"../../../common/editor/editorInput.js";import{SideBySideEditorInput as _}from"../../../common/editor/sideBySideEditorInput.js";import{TextResourceEditorInput as E}from"../../../common/editor/textResourceEditorInput.js";import{IEditorResolverService as B,RegisteredEditorPriority as A}from"../../editor/common/editorResolverService.js";import{UntitledTextEditorInput as f}from"../../untitled/common/untitledTextEditorInput.js";import"../../untitled/common/untitledTextEditorModel.js";import{IUntitledTextEditorService as G}from"../../untitled/common/untitledTextEditorService.js";const L=R("textEditorService");let c=class extends x{constructor(t,i,e,r,o){super();this.untitledTextEditorService=t;this.instantiationService=i;this.uriIdentityService=e;this.fileService=r;this.editorResolverService=o;this.registerDefaultEditor()}editorInputCache=new T;fileEditorFactory=b.as(C.EditorFactory).getFileEditorFactory();registerDefaultEditor(){this._register(this.editorResolverService.registerEditor("*",{id:I.id,label:I.displayName,detail:I.providerDisplayName,priority:A.builtin},{},{createEditorInput:t=>({editor:this.createTextEditor(t)}),createUntitledEditorInput:t=>({editor:this.createTextEditor(t)}),createDiffEditorInput:t=>({editor:this.createTextEditor(t)})}))}async resolveTextEditor(t){return this.createTextEditor(t)}createTextEditor(t){if(N(t))return this.createTextEditor(t.result);if(O(t)){const r=this.createTextEditor(t.original),o=this.createTextEditor(t.modified);return this.instantiationService.createInstance(M,t.label,t.description,r,o,void 0)}if(w(t)){const r=this.createTextEditor(t.primary),o=this.createTextEditor(t.secondary);return this.instantiationService.createInstance(_,t.label,t.description,o,r)}const i=t;if(i.forceUntitled||!i.resource||i.resource.scheme===u.untitled){const r={languageId:i.languageId,initialValue:i.contents,encoding:i.encoding};let o;return i.resource?.scheme===u.untitled?o=this.untitledTextEditorService.create({untitledResource:i.resource,...r}):o=this.untitledTextEditorService.create({associatedResource:i.resource,...r}),this.createOrGetCached(o.resource,()=>this.instantiationService.createInstance(f,o))}const e=t;if(e.resource instanceof S){const r=e.label||g(e.resource),o=e.resource,l=this.uriIdentityService.asCanonicalUri(o);return this.createOrGetCached(l,()=>e.forceFile||this.fileService.hasProvider(l)?this.fileEditorFactory.createFileEditor(l,o,e.label,e.description,e.encoding,e.languageId,e.contents,this.instantiationService):this.instantiationService.createInstance(E,l,e.label,e.description,e.languageId,e.contents),n=>{n instanceof f||(n instanceof E?(r&&n.setName(r),e.description&&n.setDescription(e.description),e.languageId&&n.setPreferredLanguageId(e.languageId),typeof e.contents=="string"&&n.setPreferredContents(e.contents)):(n.setPreferredResource(o),e.label&&n.setPreferredName(e.label),e.description&&n.setPreferredDescription(e.description),e.encoding&&n.setPreferredEncoding(e.encoding),e.languageId&&n.setPreferredLanguageId(e.languageId),typeof e.contents=="string"&&n.setPreferredContents(e.contents)))})}throw new Error(`ITextEditorService: Unable to create texteditor from ${JSON.stringify(t)}`)}createOrGetCached(t,i,e){let r=this.editorInputCache.get(t);return r?(e?.(r),r):(r=i(),this.editorInputCache.set(t,r),y.once(r.onWillDispose)(()=>this.editorInputCache.delete(t)),r)}};c=p([s(0,G),s(1,P),s(2,D),s(3,U),s(4,B)],c),h(L,c,F.Eager);export{L as ITextEditorService,c as TextEditorService};
