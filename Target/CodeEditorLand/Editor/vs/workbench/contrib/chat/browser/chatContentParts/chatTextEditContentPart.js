var R=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var f=(d,t,e,o)=>{for(var r=o>1?void 0:o?D(t,e):t,a=d.length-1,s;a>=0;a--)(s=d[a])&&(r=(o?s(t,e,r):s(r))||r);return o&&r&&R(t,e,r),r},c=(d,t)=>(e,o)=>t(e,o,d);import*as x from"../../../../../base/browser/dom.js";import{CancellationTokenSource as y}from"../../../../../base/common/cancellation.js";import{Emitter as E,Event as k}from"../../../../../base/common/event.js";import{Disposable as g,RefCountedDisposable as _,toDisposable as v}from"../../../../../base/common/lifecycle.js";import{Schemas as j}from"../../../../../base/common/network.js";import{isEqual as P}from"../../../../../base/common/resources.js";import{assertType as B}from"../../../../../base/common/types.js";import{URI as w}from"../../../../../base/common/uri.js";import{generateUuid as T}from"../../../../../base/common/uuid.js";import"../../../../../editor/common/core/editOperation.js";import{TextEdit as H}from"../../../../../editor/common/languages.js";import{createTextBufferFactoryFromSnapshot as G}from"../../../../../editor/common/model/textModel.js";import{IModelService as O}from"../../../../../editor/common/services/model.js";import{DefaultModelSHA1Computer as q}from"../../../../../editor/common/services/modelService.js";import{ITextModelService as L}from"../../../../../editor/common/services/resolverService.js";import{localize as M}from"../../../../../nls.js";import{MenuId as N}from"../../../../../platform/actions/common/actions.js";import{InstantiationType as A,registerSingleton as U}from"../../../../../platform/instantiation/common/extensions.js";import{createDecorator as V,IInstantiationService as F}from"../../../../../platform/instantiation/common/instantiation.js";import"../chat.js";import{ResourcePool as $}from"./chatCollections.js";import"./chatContentParts.js";import"../chatListRenderer.js";import"../chatOptions.js";import{CodeCompareBlockPart as z}from"../codeBlockPart.js";import"../../common/chatModel.js";import{IChatService as J}from"../../common/chatService.js";import{isResponseVM as K}from"../../common/chatViewModel.js";const S=x.$,b=V("ICodeCompareModelService");let h=class extends g{constructor(e,o,r,a,s,I){super();this.codeCompareModelService=I;const n=o.element;if(B(K(n)),r.renderTextEditsAsSummary?.(e.uri))n.response.value.every(i=>i.kind==="textEditGroup")?this.domNode=S(".interactive-edits-summary",void 0,n.isComplete?n.isCanceled?M("edits0","Making changes was aborted."):M("editsSummary","Made changes."):""):this.domNode=S("div");else{const i=new y;let l=!1;this._register(v(()=>{l=!0,i.dispose(!0)})),this.comparePart=this._register(a.get()),this._register(this.comparePart.object.onDidChangeContentHeight(()=>{this._onDidChangeHeight.fire()}));const C={element:n,edit:e,diffData:(async()=>{const p=await this.codeCompareModelService.createModel(n,e);if(l){p.dispose();return}return this._register(p),{modified:p.object.modified.textEditorModel,original:p.object.original.textEditorModel,originalSha1:p.object.originalSha1}})()};this.comparePart.object.render(C,s,i.token),this.domNode=this.comparePart.object.element}}domNode;comparePart;_onDidChangeHeight=this._register(new E);onDidChangeHeight=this._onDidChangeHeight.event;layout(e){this.comparePart?.object.layout(e)}hasSameContent(e){return e.kind==="textEditGroup"}addDisposable(e){this._register(e)}};h=f([c(5,b)],h);let u=class extends g{_pool;inUse(){return this._pool.inUse}constructor(t,e,o,r){super(),this._pool=this._register(new $(()=>r.createInstance(z,t,N.ChatCompareBlock,e,o)))}get(){const t=this._pool.get();let e=!1;return{object:t,isStale:()=>e,dispose:()=>{t.reset(),e=!0,this._pool.release(t)}}}};u=f([c(3,F)],u);let m=class{constructor(t,e,o){this.textModelService=t;this.modelService=e;this.chatService=o}async createModel(t,e){const o=await this.textModelService.createModelReference(e.uri),r=await this.textModelService.createModelReference(this.modelService.createModel(G(o.object.textEditorModel.createSnapshot()),{languageId:o.object.textEditorModel.getLanguageId(),onDidChange:k.None},w.from({scheme:j.vscodeChatCodeBlock,path:e.uri.path,query:T()}),!1).uri),a=new _(v(()=>{o.dispose(),r.dispose()}));let s="";if(e.state)s=e.state.sha1;else{const i=new q;i.canComputeSHA1(o.object.textEditorModel)&&(s=i.computeSHA1(o.object.textEditorModel),e.state={sha1:s,applied:0})}const I=this.chatService.getSession(t.sessionId),n=[];for(const i of I.getRequests())if(i.response){for(const l of i.response.response.value)if(!(l.kind!=="textEditGroup"||l.state?.applied||!P(l.uri,e.uri)))for(const C of l.edits){const p=C.map(H.asEditOperation);n.push(p)}if(i.response===t.model)break}for(const i of n)r.object.textEditorModel.pushEditOperations(null,i,()=>null);return a.acquire(),setTimeout(()=>a.release(),5e3),{object:{originalSha1:s,original:o.object,modified:r.object},dispose(){a.release()}}}};m=f([c(0,L),c(1,O),c(2,J)],m),U(b,m,A.Delayed);export{h as ChatTextEditContentPart,u as DiffEditorPool};
