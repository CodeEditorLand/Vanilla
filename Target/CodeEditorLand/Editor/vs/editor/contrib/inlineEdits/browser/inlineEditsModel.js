var E=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var g=(l,r,e,i)=>{for(var t=i>1?void 0:i?S(r,e):r,n=l.length-1,o;n>=0;n--)(o=l[n])&&(t=(i?o(r,e,t):o(t))||t);return i&&t&&E(r,e,t),t},m=(l,r)=>(e,i)=>r(e,i,l);import{timeout as R}from"../../../../base/common/async.js";import{CancellationToken as P,cancelOnDispose as T}from"../../../../base/common/cancellation.js";import{itemsEquals as I,structuralEquals as M}from"../../../../base/common/equals.js";import{BugIndicatingError as w}from"../../../../base/common/errors.js";import{Disposable as v,DisposableStore as D,toDisposable as F}from"../../../../base/common/lifecycle.js";import{ObservablePromise as O,derived as u,derivedHandleChanges as U,derivedOpts as f,disposableObservableValue as V,observableSignal as q,observableValue as h,recomputeInitiallyAndOnChange as A,subtransaction as _}from"../../../../base/common/observable.js";import{derivedDisposable as b}from"../../../../base/common/observableInternal/derived.js";import{URI as k}from"../../../../base/common/uri.js";import{IDiffProviderFactoryService as K}from"../../../browser/widget/diffEditor/diffProviderFactoryService.js";import{LineRange as L}from"../../../common/core/lineRange.js";import{InlineCompletionTriggerKind as C}from"../../../common/languages.js";import{ILanguageFeaturesService as j}from"../../../common/services/languageFeatures.js";import{IModelService as B}from"../../../common/services/model.js";import{provideInlineCompletions as H}from"../../inlineCompletions/browser/model/provideInlineCompletions.js";import{InlineEdit as N}from"./inlineEditsWidget.js";let s=class extends v{constructor(e,i,t,n,o,p,a){super();this.textModel=e;this._textModelVersionId=i;this._selection=t;this._debounceValue=n;this.languageFeaturesService=o;this._diffProviderFactoryService=p;this._modelService=a;this._register(A(this._fetchInlineEditsPromise))}static _modelId=0;static _createUniqueUri(){return k.from({scheme:"inline-edits",path:new Date().toString()+String(s._modelId++)})}_forceUpdateExplicitlySignal=q(this);_selectedInlineCompletionId=h(this,void 0);_isActive=h(this,!1);_originalModel=b(()=>this._modelService.createModel("",null,s._createUniqueUri())).keepObserved(this._store);_modifiedModel=b(()=>this._modelService.createModel("",null,s._createUniqueUri())).keepObserved(this._store);_pinnedRange=new z(this.textModel,this._textModelVersionId);isPinned=this._pinnedRange.range.map(e=>!!e);userPrompt=h(this,void 0);inlineEdit=u(this,e=>this._inlineEdit.read(e)?.promiseResult.read(e)?.data);_inlineEdit=u(this,e=>{const i=this.selectedInlineEdit.read(e);if(!i)return;const t=i.inlineCompletion.range;if(i.inlineCompletion.insertText.trim()==="")return;let n=i.inlineCompletion.insertText.split(/\r\n|\r|\n/);function o(d){const y=d[0].match(/^\s*/)?.[0]??"";return d.map(x=>x.replace(new RegExp("^"+y),""))}n=o(n);let a=this.textModel.getValueInRange(t).split(/\r\n|\r|\n/);a=o(a),this._originalModel.get().setValue(a.join(`
`)),this._modifiedModel.get().setValue(n.join(`
`));const c=this._diffProviderFactoryService.createDiffProvider({diffAlgorithm:"advanced"});return O.fromFn(async()=>{const d=await c.computeDiff(this._originalModel.get(),this._modifiedModel.get(),{computeMoves:!1,ignoreTrimWhitespace:!1,maxComputationTimeMs:1e3},P.None);if(!d.identical)return new N(L.fromRangeInclusive(t),o(n),d.changes)})});_fetchStore=this._register(new D);_inlineEditsFetchResult=V(this,void 0);_inlineEdits=f({owner:this,equalsFn:M},e=>this._inlineEditsFetchResult.read(e)?.completions.map(i=>new W(i))??[]);_fetchInlineEditsPromise=U({owner:this,createEmptyChangeSummary:()=>({inlineCompletionTriggerKind:C.Automatic}),handleChange:(e,i)=>(e.didChange(this._forceUpdateExplicitlySignal)&&(i.inlineCompletionTriggerKind=C.Explicit),!0)},async(e,i)=>{this._fetchStore.clear(),this._forceUpdateExplicitlySignal.read(e),this._textModelVersionId.read(e);function t(c,d){return d(c)}const n=this._pinnedRange.range.read(e)??t(this._selection.read(e),c=>c.isEmpty()?void 0:c);if(!n){this._inlineEditsFetchResult.set(void 0,void 0),this.userPrompt.set(void 0,void 0);return}const o={triggerKind:i.inlineCompletionTriggerKind,selectedSuggestionInfo:void 0,userPrompt:this.userPrompt.read(e)},p=T(this._fetchStore);await R(200,p);const a=await H(this.languageFeaturesService.inlineCompletionsProvider,n,this.textModel,o,p);p.isCancellationRequested||this._inlineEditsFetchResult.set(a,void 0)});async trigger(e){this._isActive.set(!0,e),await this._fetchInlineEditsPromise.get()}async triggerExplicitly(e){_(e,i=>{this._isActive.set(!0,i),this._forceUpdateExplicitlySignal.trigger(i)}),await this._fetchInlineEditsPromise.get()}stop(e){_(e,i=>{this.userPrompt.set(void 0,i),this._isActive.set(!1,i),this._inlineEditsFetchResult.set(void 0,i),this._pinnedRange.setRange(void 0,i)})}_filteredInlineEditItems=f({owner:this,equalsFn:I()},e=>this._inlineEdits.read(e));selectedInlineCompletionIndex=u(this,e=>{const i=this._selectedInlineCompletionId.read(e),t=this._filteredInlineEditItems.read(e),n=this._selectedInlineCompletionId===void 0?-1:t.findIndex(o=>o.semanticId===i);return n===-1?(this._selectedInlineCompletionId.set(void 0,void 0),0):n});selectedInlineEdit=u(this,e=>{const i=this._filteredInlineEditItems.read(e),t=this.selectedInlineCompletionIndex.read(e);return i[t]});activeCommands=f({owner:this,equalsFn:I()},e=>this.selectedInlineEdit.read(e)?.inlineCompletion.source.inlineCompletions.commands??[]);async _deltaSelectedInlineCompletionIndex(e){await this.triggerExplicitly();const i=this._filteredInlineEditItems.get()||[];if(i.length>0){const t=(this.selectedInlineCompletionIndex.get()+e+i.length)%i.length;this._selectedInlineCompletionId.set(i[t].semanticId,void 0)}else this._selectedInlineCompletionId.set(void 0,void 0)}async next(){await this._deltaSelectedInlineCompletionIndex(1)}async previous(){await this._deltaSelectedInlineCompletionIndex(-1)}togglePin(){this.isPinned.get()?this._pinnedRange.setRange(void 0,void 0):this._pinnedRange.setRange(this._selection.get(),void 0)}async accept(e){if(e.getModel()!==this.textModel)throw new w;const i=this.selectedInlineEdit.get();i&&(e.pushUndoStop(),e.executeEdits("inlineSuggestion.accept",[i.inlineCompletion.toSingleTextEdit().toSingleEditOperation()]),this.stop())}};s=g([m(4,j),m(5,K),m(6,B)],s);class W{constructor(r){this.inlineCompletion=r}semanticId=this.inlineCompletion.hash()}class z extends v{constructor(e,i){super();this._textModel=e;this._versionId=i;this._register(F(()=>{this._textModel.deltaDecorations(this._decorations.get(),[])}))}_decorations=h(this,[]);setRange(e,i){this._decorations.set(this._textModel.deltaDecorations(this._decorations.get(),e?[{range:e,options:{description:"trackedRange"}}]:[]),i)}range=u(this,e=>{this._versionId.read(e);const i=this._decorations.read(e)[0];return i?this._textModel.getDecorationRange(i)??null:null})}export{s as InlineEditsModel};
