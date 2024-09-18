var M=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var _=(r,e,i,t)=>{for(var n=t>1?void 0:t?O(e,i):e,o=r.length-1,s;o>=0;o--)(s=r[o])&&(n=(t?s(e,i,n):s(n))||n);return t&&n&&M(e,i,n),n},h=(r,e)=>(i,t)=>e(i,t,r);import{CancellationTokenSource as D}from"../../../../../base/common/cancellation.js";import{equalsIfDefined as q,itemEquals as w}from"../../../../../base/common/equals.js";import{matchesSubString as P}from"../../../../../base/common/filters.js";import{Disposable as V,MutableDisposable as U}from"../../../../../base/common/lifecycle.js";import{derivedOpts as k,disposableObservableValue as v,transaction as F}from"../../../../../base/common/observable.js";import"../../../../common/core/position.js";import{Range as x}from"../../../../common/core/range.js";import{SingleTextEdit as R}from"../../../../common/core/textEdit.js";import{TextLength as T}from"../../../../common/core/textLength.js";import{InlineCompletionTriggerKind as I}from"../../../../common/languages.js";import{ILanguageConfigurationService as W}from"../../../../common/languages/languageConfigurationRegistry.js";import{EndOfLinePreference as L}from"../../../../common/model.js";import"../../../../common/services/languageFeatureDebounce.js";import{ILanguageFeaturesService as E}from"../../../../common/services/languageFeatures.js";import{provideInlineCompletions as A}from"./provideInlineCompletions.js";import{singleTextRemoveCommonPrefix as B}from"./singleTextEditHelpers.js";let f=class extends V{constructor(i,t,n,o,s){super();this._textModel=i;this._versionId=t;this._debounceValue=n;this._languageFeaturesService=o;this._languageConfigurationService=s;this._register(this._textModel.onDidChangeContent(()=>{this._updateOperation.clear()}))}_updateOperation=this._register(new U);inlineCompletions=v("inlineCompletions",void 0);suggestWidgetInlineCompletions=v("suggestWidgetInlineCompletions",void 0);fetch(i,t,n){const o=new N(i,t,this._textModel.getVersionId()),s=t.selectedSuggestionInfo?this.suggestWidgetInlineCompletions:this.inlineCompletions;if(this._updateOperation.value?.request.satisfies(o))return this._updateOperation.value.promise;if(s.get()?.request.satisfies(o))return Promise.resolve(!0);const d=!!this._updateOperation.value;this._updateOperation.clear();const a=new D,l=(async()=>{if((d||t.triggerKind===I.Automatic)&&await K(this._debounceValue.get(this._textModel),a.token),a.token.isCancellationRequested||this._store.isDisposed||this._textModel.getVersionId()!==o.versionId)return!1;const c=new Date,m=await A(this._languageFeaturesService.inlineCompletionsProvider,i,this._textModel,t,a.token,this._languageConfigurationService);if(a.token.isCancellationRequested||this._store.isDisposed||this._textModel.getVersionId()!==o.versionId)return!1;const S=new Date;this._debounceValue.update(this._textModel,S.getTime()-c.getTime());const C=new G(m,o,this._textModel,this._versionId);if(n){const g=n.toInlineCompletion(void 0);n.canBeReused(this._textModel,i)&&!m.has(g)&&C.prepend(n.inlineCompletion,g.range,!0)}return this._updateOperation.clear(),F(g=>{s.set(C,g)}),!0})(),p=new z(o,a,l);return this._updateOperation.value=p,l}clear(i){this._updateOperation.clear(),this.inlineCompletions.set(void 0,i),this.suggestWidgetInlineCompletions.set(void 0,i)}clearSuggestWidgetInlineCompletions(i){this._updateOperation.value?.request.context.selectedSuggestionInfo&&this._updateOperation.clear(),this.suggestWidgetInlineCompletions.set(void 0,i)}cancelUpdate(){this._updateOperation.clear()}};f=_([h(3,E),h(4,W)],f);function K(r,e){return new Promise(i=>{let t;const n=setTimeout(()=>{t&&t.dispose(),i()},r);e&&(t=e.onCancellationRequested(()=>{clearTimeout(n),t&&t.dispose(),i()}))})}class N{constructor(e,i,t){this.position=e;this.context=i;this.versionId=t}satisfies(e){return this.position.equals(e.position)&&q(this.context.selectedSuggestionInfo,e.context.selectedSuggestionInfo,w())&&(e.context.triggerKind===I.Automatic||this.context.triggerKind===I.Explicit)&&this.versionId===e.versionId}}class z{constructor(e,i,t){this.request=e;this.cancellationTokenSource=i;this.promise=t}dispose(){this.cancellationTokenSource.cancel()}}class G{constructor(e,i,t,n){this.inlineCompletionProviderResult=e;this.request=i;this._textModel=t;this._versionId=n;const o=t.deltaDecorations([],e.completions.map(s=>({range:s.range,options:{description:"inline-completion-tracking-range"}})));this._inlineCompletions=e.completions.map((s,d)=>new y(s,o[d],this._textModel,this._versionId))}_inlineCompletions;get inlineCompletions(){return this._inlineCompletions}_refCount=1;_prependedInlineCompletionItems=[];clone(){return this._refCount++,this}dispose(){if(this._refCount--,this._refCount===0){setTimeout(()=>{this._textModel.isDisposed()||this._textModel.deltaDecorations(this._inlineCompletions.map(e=>e.decorationId),[])},0),this.inlineCompletionProviderResult.dispose();for(const e of this._prependedInlineCompletionItems)e.source.removeRef()}}prepend(e,i,t){t&&e.source.addRef();const n=this._textModel.deltaDecorations([],[{range:i,options:{description:"inline-completion-tracking-range"}}])[0];this._inlineCompletions.unshift(new y(e,n,this._textModel,this._versionId)),this._prependedInlineCompletionItems.push(e)}}class y{constructor(e,i,t,n){this.inlineCompletion=e;this.decorationId=i;this._textModel=t;this._modelVersion=n}semanticId=JSON.stringify([this.inlineCompletion.filterText,this.inlineCompletion.insertText,this.inlineCompletion.range.getStartPosition().toString()]);get forwardStable(){return this.inlineCompletion.source.inlineCompletions.enableForwardStability??!1}_updatedRange=k({owner:this,equalsFn:x.equalsRange},e=>(this._modelVersion.read(e),this._textModel.getDecorationRange(this.decorationId)));toInlineCompletion(e){return this.inlineCompletion.withRange(this._updatedRange.read(e)??b)}toSingleTextEdit(e){return new R(this._updatedRange.read(e)??b,this.inlineCompletion.insertText)}isVisible(e,i,t){const n=B(this._toFilterTextReplacement(t),e),o=this._updatedRange.read(t);if(!o||!this.inlineCompletion.range.getStartPosition().equals(o.getStartPosition())||i.lineNumber!==n.range.startLineNumber)return!1;const s=e.getValueInRange(n.range,L.LF),d=n.text,a=Math.max(0,i.column-n.range.startColumn);let l=d.substring(0,a),p=d.substring(a),u=s.substring(0,a),c=s.substring(a);const m=e.getLineIndentColumn(n.range.startLineNumber);return n.range.startColumn<=m&&(u=u.trimStart(),u.length===0&&(c=c.trimStart()),l=l.trimStart(),l.length===0&&(p=p.trimStart())),l.startsWith(u)&&!!P(c,p)}canBeReused(e,i){const t=this._updatedRange.read(void 0);return!!t&&t.containsPosition(i)&&this.isVisible(e,i,void 0)&&T.ofRange(t).isGreaterThanOrEqualTo(T.ofRange(this.inlineCompletion.range))}_toFilterTextReplacement(e){return new R(this._updatedRange.read(e)??b,this.inlineCompletion.filterText)}}const b=new x(1,1,1,1);export{y as InlineCompletionWithUpdatedRange,f as InlineCompletionsSource,G as UpToDateInlineCompletions};
