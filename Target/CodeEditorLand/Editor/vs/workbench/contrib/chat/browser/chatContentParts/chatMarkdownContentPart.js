var T=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var b=(c,t,e,o)=>{for(var r=o>1?void 0:o?O(t,e):t,l=c.length-1,n;l>=0;l--)(n=c[l])&&(r=(o?n(t,e,r):n(r))||r);return o&&r&&T(t,e,r),r},m=(c,t)=>(e,o)=>t(e,o,c);import*as V from"../../../../../base/browser/dom.js";import{Emitter as F}from"../../../../../base/common/event.js";import"../../../../../base/common/htmlContent.js";import{Disposable as x}from"../../../../../base/common/lifecycle.js";import{equalsIgnoreCase as K}from"../../../../../base/common/strings.js";import"../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";import{Range as q}from"../../../../../editor/common/core/range.js";import{ITextModelService as A}from"../../../../../editor/common/services/resolverService.js";import{MenuId as N}from"../../../../../platform/actions/common/actions.js";import{IContextKeyService as $}from"../../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as S}from"../../../../../platform/instantiation/common/instantiation.js";import"../chat.js";import{ResourcePool as z}from"./chatCollections.js";import"./chatContentParts.js";import"../chatListRenderer.js";import{ChatMarkdownDecorationsRenderer as G}from"../chatMarkdownDecorationsRenderer.js";import"../chatOptions.js";import{CodeBlockPart as J,localFileLanguageId as Q,parseLocalFileData as W}from"../codeBlockPart.js";import"../../common/annotations.js";import"../../common/chatModel.js";import{isRequestVM as X,isResponseVM as k}from"../../common/chatViewModel.js";import"../../common/codeBlockModelCollection.js";import"../../../../../base/common/uri.js";const Y=V.$;let a=class extends x{constructor(e,o,r,l=!1,n=0,u,f,Z,P,_,ee,w){super();this.markdown=e;this.editorPool=r;this.codeBlockModelCollection=Z;this.textModelService=ee;const i=o.element,j=w.createInstance(G),R=[];let U=n;const v=this._register(u.render(e,{fillInIncompleteTokens:l,codeBlockRendererSync:(I,B)=>{const C=U++;let g,y,D,M;if(K(I,Q))try{const d=W(B);y=d.range&&q.lift(d.range),g=this.textModelService.createModelReference(d.uri).then(p=>p.object)}catch{return Y("div")}else{const d=k(i)||X(i)?i.sessionId:"",p=this.codeBlockModelCollection.getOrCreate(d,i,C);D=p.vulns,M=p.codemapperUri,g=p.model}const E=k(i)&&i.errorDetails?.responseIsFiltered,s=this.renderCodeBlock({languageId:I,textModel:g,codeBlockIndex:C,element:i,range:y,hideToolbar:E,parentContextKeyService:_,vulns:D,codemapperUri:M},B,f,P.editableCodeBlock);this.allRefs.push(s),this._register(s.object.onDidChangeContentHeight(()=>this._onDidChangeHeight.fire()));const H=this.id,L=new class{ownerMarkdownPartId=H;codeBlockIndex=C;element=i;codemapperUri=void 0;get uri(){return s.object.uri}focus(){s.object.focus()}getContent(){return s.object.editor.getValue()}};return this.codeblocks.push(L),R.push(s),s.object.element},asyncRenderCallback:()=>this._onDidChangeHeight.fire()}));this._register(j.walkTreeAndAnnotateReferenceLinks(v.element)),R.reverse().forEach(I=>this._register(I)),this.domNode=v.element}static idPool=0;id=String(++a.idPool);domNode;allRefs=[];_onDidChangeHeight=this._register(new F);onDidChangeHeight=this._onDidChangeHeight.event;codeblocks=[];renderCodeBlock(e,o,r,l){const n=this.editorPool.get(),u=n.object;return k(e.element)&&this.codeBlockModelCollection.update(e.element.sessionId,e.element,e.codeBlockIndex,{text:o,languageId:e.languageId}).then(f=>{this.codeblocks[e.codeBlockIndex].codemapperUri=f.codemapperUri}),u.render(e,r,l),n}hasSameContent(e){return e.kind==="markdownContent"&&e.content.value===this.markdown.value}layout(e){this.allRefs.forEach(o=>o.object.layout(e))}addDisposable(e){this._register(e)}};a=b([m(9,$),m(10,A),m(11,S)],a);let h=class extends x{_pool;inUse(){return this._pool.inUse}constructor(t,e,o,r){super(),this._pool=this._register(new z(()=>r.createInstance(J,t,N.ChatCodeBlock,e,o)))}get(){const t=this._pool.get();let e=!1;return{object:t,isStale:()=>e,dispose:()=>{t.reset(),e=!0,this._pool.release(t)}}}};h=b([m(3,S)],h);export{a as ChatMarkdownContentPart,h as EditorPool};
