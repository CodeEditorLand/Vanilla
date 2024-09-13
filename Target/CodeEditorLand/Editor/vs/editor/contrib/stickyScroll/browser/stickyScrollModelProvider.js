var R=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var u=(l,n,e,t)=>{for(var r=t>1?void 0:t?N(n,e):n,i=l.length-1,o;i>=0;i--)(o=l[i])&&(r=(t?o(n,e,r):o(r))||r);return t&&r&&R(n,e,r),r},c=(l,n)=>(e,t)=>n(e,t,l);import{Delayer as C,createCancelablePromise as D}from"../../../../base/common/async.js";import{onUnexpectedError as E}from"../../../../base/common/errors.js";import{Iterable as S}from"../../../../base/common/iterator.js";import{Disposable as L,DisposableStore as T}from"../../../../base/common/lifecycle.js";import{IInstantiationService as w}from"../../../../platform/instantiation/common/instantiation.js";import{EditorOption as A}from"../../../common/config/editorOptions.js";import{ILanguageConfigurationService as F}from"../../../common/languages/languageConfigurationRegistry.js";import{ILanguageFeaturesService as k}from"../../../common/services/languageFeatures.js";import{OutlineElement as V,OutlineGroup as x,OutlineModel as G}from"../../documentSymbols/browser/outlineModel.js";import{FoldingController as j,RangesLimitReporter as U}from"../../folding/browser/folding.js";import{IndentRangeProvider as q}from"../../folding/browser/indentRangeProvider.js";import{SyntaxRangeProvider as z}from"../../folding/browser/syntaxRangeProvider.js";import{StickyElement as f,StickyModel as P,StickyRange as v}from"./stickyScrollElement.js";var B=(t=>(t.OUTLINE_MODEL="outlineModel",t.FOLDING_PROVIDER_MODEL="foldingProviderModel",t.INDENTATION_MODEL="indentationModel",t))(B||{}),H=(t=>(t[t.VALID=0]="VALID",t[t.INVALID=1]="INVALID",t[t.CANCELED=2]="CANCELED",t))(H||{});let _=class extends L{constructor(e,t,r,i){super();this._editor=e;switch(this._editor.getOption(A.stickyScroll).defaultModel){case"outlineModel":this._modelProviders.push(new m(this._editor,i));case"foldingProviderModel":this._modelProviders.push(new g(this._editor,t,i));case"indentationModel":this._modelProviders.push(new p(this._editor,r));break}}_modelProviders=[];_modelPromise=null;_updateScheduler=this._register(new C(300));_updateOperation=this._register(new T);dispose(){this._modelProviders.forEach(e=>e.dispose()),this._updateOperation.clear(),this._cancelModelPromise(),super.dispose()}_cancelModelPromise(){this._modelPromise&&(this._modelPromise.cancel(),this._modelPromise=null)}async update(e){return this._updateOperation.clear(),this._updateOperation.add({dispose:()=>{this._cancelModelPromise(),this._updateScheduler.cancel()}}),this._cancelModelPromise(),await this._updateScheduler.trigger(async()=>{for(const t of this._modelProviders){const{statusPromise:r,modelPromise:i}=t.computeStickyModel(e);this._modelPromise=i;const o=await r;if(this._modelPromise!==i)return null;switch(o){case 2:return this._updateOperation.clear(),null;case 0:return t.stickyModel}}return null}).catch(t=>(E(t),null))}};_=u([c(2,w),c(3,k)],_);class O extends L{constructor(e){super();this._editor=e}_stickyModel=null;get stickyModel(){return this._stickyModel}_invalid(){return this._stickyModel=null,1}computeStickyModel(e){if(e.isCancellationRequested||!this.isProviderValid())return{statusPromise:this._invalid(),modelPromise:null};const t=D(r=>this.createModelFromProvider(r));return{statusPromise:t.then(r=>this.isModelValid(r)?e.isCancellationRequested?2:(this._stickyModel=this.createStickyModel(e,r),0):this._invalid()).then(void 0,r=>(E(r),2)),modelPromise:t}}isModelValid(e){return!0}isProviderValid(){return!0}}let m=class extends O{constructor(e,t){super(e);this._languageFeaturesService=t}createModelFromProvider(e){return G.create(this._languageFeaturesService.documentSymbolProvider,this._editor.getModel(),e)}createStickyModel(e,t){const{stickyOutlineElement:r,providerID:i}=this._stickyModelFromOutlineModel(t,this._stickyModel?.outlineProviderId),o=this._editor.getModel();return new P(o.uri,o.getVersionId(),r,i)}isModelValid(e){return e&&e.children.size>0}_stickyModelFromOutlineModel(e,t){let r;if(S.first(e.children.values())instanceof x){const s=S.find(e.children.values(),d=>d.id===t);if(s)r=s.children;else{let d="",h=-1,y;for(const[J,b]of e.children.entries()){const M=this._findSumOfRangesOfGroup(b);M>h&&(y=b,h=M,d=b.id)}t=d,r=y.children}}else r=e.children;const i=[],o=Array.from(r.values()).sort((s,d)=>{const h=new v(s.symbol.range.startLineNumber,s.symbol.range.endLineNumber),y=new v(d.symbol.range.startLineNumber,d.symbol.range.endLineNumber);return this._comparator(h,y)});for(const s of o)i.push(this._stickyModelFromOutlineElement(s,s.symbol.selectionRange.startLineNumber));return{stickyOutlineElement:new f(void 0,i,void 0),providerID:t}}_stickyModelFromOutlineElement(e,t){const r=[];for(const o of e.children.values())if(o.symbol.selectionRange.startLineNumber!==o.symbol.range.endLineNumber)if(o.symbol.selectionRange.startLineNumber!==t)r.push(this._stickyModelFromOutlineElement(o,o.symbol.selectionRange.startLineNumber));else for(const a of o.children.values())r.push(this._stickyModelFromOutlineElement(a,o.symbol.selectionRange.startLineNumber));r.sort((o,a)=>this._comparator(o.range,a.range));const i=new v(e.symbol.selectionRange.startLineNumber,e.symbol.range.endLineNumber);return new f(i,r,void 0)}_comparator(e,t){return e.startLineNumber!==t.startLineNumber?e.startLineNumber-t.startLineNumber:t.endLineNumber-e.endLineNumber}_findSumOfRangesOfGroup(e){let t=0;for(const r of e.children.values())t+=this._findSumOfRangesOfGroup(r);return e instanceof V?t+e.symbol.range.endLineNumber-e.symbol.selectionRange.startLineNumber:t}};m=u([c(1,k)],m);class I extends O{_foldingLimitReporter;constructor(n){super(n),this._foldingLimitReporter=new U(n)}createStickyModel(n,e){const t=this._fromFoldingRegions(e),r=this._editor.getModel();return new P(r.uri,r.getVersionId(),t,void 0)}isModelValid(n){return n!==null}_fromFoldingRegions(n){const e=n.length,t=[],r=new f(void 0,[],void 0);for(let i=0;i<e;i++){const o=n.getParentIndex(i);let a;o!==-1?a=t[o]:a=r;const s=new f(new v(n.getStartLineNumber(i),n.getEndLineNumber(i)+1),[],a);a.children.push(s),t.push(s)}return r}}let p=class extends I{constructor(e,t){super(e);this._languageConfigurationService=t;this.provider=this._register(new q(e.getModel(),this._languageConfigurationService,this._foldingLimitReporter))}provider;async createModelFromProvider(e){return this.provider.compute(e)}};p=u([c(1,F)],p);let g=class extends I{constructor(e,t,r){super(e);this._languageFeaturesService=r;const i=j.getFoldingRangeProviders(this._languageFeaturesService,e.getModel());i.length>0&&(this.provider=this._register(new z(e.getModel(),i,t,this._foldingLimitReporter,void 0)))}provider;isProviderValid(){return this.provider!==void 0}async createModelFromProvider(e){return this.provider?.compute(e)??null}};g=u([c(2,k)],g);export{_ as StickyModelProvider};
