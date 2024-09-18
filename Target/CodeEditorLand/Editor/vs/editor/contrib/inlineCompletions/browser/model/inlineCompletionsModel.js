var $=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var U=(m,p,e,t)=>{for(var i=t>1?void 0:t?k(p,e):p,n=m.length-1,o;n>=0;n--)(o=m[n])&&(i=(t?o(p,e,i):o(i))||i);return t&&i&&$(p,e,i),i},P=(m,p)=>(e,t)=>p(e,t,m);import{mapFindFirst as H}from"../../../../../base/common/arraysFind.js";import{itemsEquals as W}from"../../../../../base/common/equals.js";import{BugIndicatingError as T,onUnexpectedError as j,onUnexpectedExternalError as z}from"../../../../../base/common/errors.js";import{Disposable as J}from"../../../../../base/common/lifecycle.js";import{autorun as Q,derived as b,derivedHandleChanges as X,derivedOpts as v,observableSignal as Y,observableValue as V,recomputeInitiallyAndOnChange as Z,subtransaction as G,transaction as ee}from"../../../../../base/common/observable.js";import{commonPrefixLength as te}from"../../../../../base/common/strings.js";import{isDefined as E}from"../../../../../base/common/types.js";import{ICommandService as ie}from"../../../../../platform/commands/common/commands.js";import{IInstantiationService as ne}from"../../../../../platform/instantiation/common/instantiation.js";import"../../../../browser/editorBrowser.js";import{EditOperation as w}from"../../../../common/core/editOperation.js";import{Position as L}from"../../../../common/core/position.js";import{Range as x}from"../../../../common/core/range.js";import{Selection as q}from"../../../../common/core/selection.js";import{SingleTextEdit as K}from"../../../../common/core/textEdit.js";import{TextLength as oe}from"../../../../common/core/textLength.js";import{ScrollType as se}from"../../../../common/editorCommon.js";import{InlineCompletionTriggerKind as A,PartialAcceptTriggerKind as R}from"../../../../common/languages.js";import{ILanguageConfigurationService as re}from"../../../../common/languages/languageConfigurationRegistry.js";import{EndOfLinePreference as le}from"../../../../common/model.js";import"../../../../common/services/languageFeatureDebounce.js";import"../../../../common/textModelEvents.js";import{SnippetController2 as de}from"../../../snippet/browser/snippetController2.js";import{addPositions as ae,getEndPositionsAfterApplying as F,substringPos as ce,subtractPositions as N}from"../utils.js";import{computeGhostText as D}from"./computeGhostText.js";import{GhostText as pe,ghostTextOrReplacementEquals as me,ghostTextsOrReplacementsEqual as B}from"./ghostText.js";import{InlineCompletionsSource as ge}from"./inlineCompletionsSource.js";import{singleTextEditAugments as ue,singleTextRemoveCommonPrefix as M}from"./singleTextEditHelpers.js";import"./suggestWidgetAdaptor.js";let S=class extends J{constructor(e,t,i,n,o,r,l,s,a,d,c,g){super();this.textModel=e;this.selectedSuggestItem=t;this._textModelVersionId=i;this._positions=n;this._debounceValue=o;this._suggestPreviewEnabled=r;this._suggestPreviewMode=l;this._inlineSuggestMode=s;this._enabled=a;this._instantiationService=d;this._commandService=c;this._languageConfigurationService=g;this._register(Z(this._fetchInlineCompletionsPromise));let u;this._register(Q(h=>{const f=this.state.read(h)?.inlineCompletion;if(f?.semanticId!==u?.semanticId&&(u=f,f)){const C=f.inlineCompletion,_=C.source;_.provider.handleItemDidShow?.(_.inlineCompletions,C.sourceInlineCompletion,C.insertText)}}))}_source=this._register(this._instantiationService.createInstance(ge,this.textModel,this._textModelVersionId,this._debounceValue));_isActive=V(this,!1);_forceUpdateExplicitlySignal=Y(this);_selectedInlineCompletionId=V(this,void 0);_primaryPosition=b(this,e=>this._positions.read(e)[0]??new L(1,1));_isAcceptingPartially=!1;get isAcceptingPartially(){return this._isAcceptingPartially}_preserveCurrentCompletionReasons=new Set([1,0,2]);_getReason(e){return e?.isUndoing?0:e?.isRedoing?1:this.isAcceptingPartially?2:3}_fetchInlineCompletionsPromise=X({owner:this,createEmptyChangeSummary:()=>({preserveCurrentCompletion:!1,inlineCompletionTriggerKind:A.Automatic}),handleChange:(e,t)=>(e.didChange(this._textModelVersionId)&&this._preserveCurrentCompletionReasons.has(this._getReason(e.change))?t.preserveCurrentCompletion=!0:e.didChange(this._forceUpdateExplicitlySignal)&&(t.inlineCompletionTriggerKind=A.Explicit),!0)},(e,t)=>{if(this._forceUpdateExplicitlySignal.read(e),!(this._enabled.read(e)&&this.selectedSuggestItem.read(e)||this._isActive.read(e))){this._source.cancelUpdate();return}this._textModelVersionId.read(e);const n=this._source.suggestWidgetInlineCompletions.get(),o=this.selectedSuggestItem.read(e);if(n&&!o){const d=this._source.inlineCompletions.get();ee(c=>{(!d||n.request.versionId>d.request.versionId)&&this._source.inlineCompletions.set(n.clone(),c),this._source.clearSuggestWidgetInlineCompletions(c)})}const r=this._primaryPosition.read(e),l={triggerKind:t.inlineCompletionTriggerKind,selectedSuggestionInfo:o?.toSelectedSuggestionInfo()},s=this.selectedInlineCompletion.get(),a=t.preserveCurrentCompletion||s?.forwardStable?s:void 0;return this._source.fetch(r,l,a)});async trigger(e){this._isActive.set(!0,e),await this._fetchInlineCompletionsPromise.get()}async triggerExplicitly(e){G(e,t=>{this._isActive.set(!0,t),this._forceUpdateExplicitlySignal.trigger(t)}),await this._fetchInlineCompletionsPromise.get()}stop(e){G(e,t=>{this._isActive.set(!1,t),this._source.clear(t)})}_filteredInlineCompletionItems=v({owner:this,equalsFn:W()},e=>{const t=this._source.inlineCompletions.read(e);if(!t)return[];const i=this._primaryPosition.read(e);return t.inlineCompletions.filter(o=>o.isVisible(this.textModel,i,e))});selectedInlineCompletionIndex=b(this,e=>{const t=this._selectedInlineCompletionId.read(e),i=this._filteredInlineCompletionItems.read(e),n=this._selectedInlineCompletionId===void 0?-1:i.findIndex(o=>o.semanticId===t);return n===-1?(this._selectedInlineCompletionId.set(void 0,void 0),0):n});selectedInlineCompletion=b(this,e=>{const t=this._filteredInlineCompletionItems.read(e),i=this.selectedInlineCompletionIndex.read(e);return t[i]});activeCommands=v({owner:this,equalsFn:W()},e=>this.selectedInlineCompletion.read(e)?.inlineCompletion.source.inlineCompletions.commands??[]);lastTriggerKind=this._source.inlineCompletions.map(this,e=>e?.request.context.triggerKind);inlineCompletionsCount=b(this,e=>{if(this.lastTriggerKind.read(e)===A.Explicit)return this._filteredInlineCompletionItems.read(e).length});state=v({owner:this,equalsFn:(e,t)=>!e||!t?e===t:B(e.ghostTexts,t.ghostTexts)&&e.inlineCompletion===t.inlineCompletion&&e.suggestItem===t.suggestItem},e=>{const t=this.textModel,i=this.selectedSuggestItem.read(e);if(i){const n=M(i.toSingleTextEdit(),t),o=this._computeAugmentation(n,e);if(!this._suggestPreviewEnabled.read(e)&&!o)return;const l=o?.edit??n,s=o?o.edit.text.length-n.text.length:0,a=this._suggestPreviewMode.read(e),d=this._positions.read(e),c=[l,...O(this.textModel,d,l)],g=c.map((h,I)=>D(h,t,a,d[I],s)).filter(E),u=g[0]??new pe(l.range.endLineNumber,[]);return{edits:c,primaryGhostText:u,ghostTexts:g,inlineCompletion:o?.completion,suggestItem:i}}else{if(!this._isActive.read(e))return;const n=this.selectedInlineCompletion.read(e);if(!n)return;const o=n.toSingleTextEdit(e),r=this._inlineSuggestMode.read(e),l=this._positions.read(e),s=[o,...O(this.textModel,l,o)],a=s.map((d,c)=>D(d,t,r,l[c],0)).filter(E);return a[0]?{edits:s,primaryGhostText:a[0],ghostTexts:a,inlineCompletion:n,suggestItem:void 0}:void 0}});_computeAugmentation(e,t){const i=this.textModel,n=this._source.suggestWidgetInlineCompletions.read(t),o=n?n.inlineCompletions:[this.selectedInlineCompletion.read(t)].filter(E);return H(o,l=>{let s=l.toSingleTextEdit(t);return s=M(s,i,x.fromPositions(s.range.getStartPosition(),e.range.getEndPosition())),ue(s,e)?{completion:l,edit:s}:void 0})}ghostTexts=v({owner:this,equalsFn:B},e=>{const t=this.state.read(e);if(t)return t.ghostTexts});primaryGhostText=v({owner:this,equalsFn:me},e=>{const t=this.state.read(e);if(t)return t?.primaryGhostText});async _deltaSelectedInlineCompletionIndex(e){await this.triggerExplicitly();const t=this._filteredInlineCompletionItems.get()||[];if(t.length>0){const i=(this.selectedInlineCompletionIndex.get()+e+t.length)%t.length;this._selectedInlineCompletionId.set(t[i].semanticId,void 0)}else this._selectedInlineCompletionId.set(void 0,void 0)}async next(){await this._deltaSelectedInlineCompletionIndex(1)}async previous(){await this._deltaSelectedInlineCompletionIndex(-1)}async accept(e){if(e.getModel()!==this.textModel)throw new T;const t=this.state.get();if(!t||t.primaryGhostText.isEmpty()||!t.inlineCompletion)return;const i=t.inlineCompletion.toInlineCompletion(void 0);if(i.command&&i.source.addRef(),e.pushUndoStop(),i.snippetInfo)e.executeEdits("inlineSuggestion.accept",[w.replace(i.range,""),...i.additionalTextEdits]),e.setPosition(i.snippetInfo.range.getStartPosition(),"inlineCompletionAccept"),de.get(e)?.insert(i.snippetInfo.snippet,{undoStopBefore:!1});else{const n=t.edits,o=F(n).map(r=>q.fromPositions(r));e.executeEdits("inlineSuggestion.accept",[...n.map(r=>w.replace(r.range,r.text)),...i.additionalTextEdits]),e.setSelections(o,"inlineCompletionAccept")}this.stop(),i.command&&(await this._commandService.executeCommand(i.command.id,...i.command.arguments||[]).then(void 0,z),i.source.removeRef())}async acceptNextWord(e){await this._acceptNext(e,(t,i)=>{const n=this.textModel.getLanguageIdAtPosition(t.lineNumber,t.column),o=this._languageConfigurationService.getLanguageConfiguration(n),r=new RegExp(o.wordDefinition.source,o.wordDefinition.flags.replace("g","")),l=i.match(r);let s=0;l&&l.index!==void 0?l.index===0?s=l[0].length:s=l.index:s=i.length;const d=/\s+/g.exec(i);return d&&d.index!==void 0&&d.index+d[0].length<s&&(s=d.index+d[0].length),s},R.Word)}async acceptNextLine(e){await this._acceptNext(e,(t,i)=>{const n=i.match(/\n/);return n&&n.index!==void 0?n.index+1:i.length},R.Line)}async _acceptNext(e,t,i){if(e.getModel()!==this.textModel)throw new T;const n=this.state.get();if(!n||n.primaryGhostText.isEmpty()||!n.inlineCompletion)return;const o=n.primaryGhostText,r=n.inlineCompletion.toInlineCompletion(void 0);if(r.snippetInfo||r.filterText!==r.insertText){await this.accept(e);return}const l=o.parts[0],s=new L(o.lineNumber,l.column),a=l.text,d=t(s,a);if(d===a.length&&o.parts.length===1){this.accept(e);return}const c=a.substring(0,d),g=this._positions.get(),u=g[0];r.source.addRef();try{this._isAcceptingPartially=!0;try{e.pushUndoStop();const h=x.fromPositions(u,s),I=e.getModel().getValueInRange(h)+c,f=new K(h,I),C=[f,...O(this.textModel,g,f)],_=F(C).map(y=>q.fromPositions(y));e.executeEdits("inlineSuggestion.accept",C.map(y=>w.replace(y.range,y.text))),e.setSelections(_,"inlineCompletionPartialAccept"),e.revealPositionInCenterIfOutsideViewport(e.getPosition(),se.Immediate)}finally{this._isAcceptingPartially=!1}if(r.source.provider.handlePartialAccept){const h=x.fromPositions(r.range.getStartPosition(),oe.ofText(c).addToPosition(s)),I=e.getModel().getValueInRange(h,le.LF);r.source.provider.handlePartialAccept(r.source.inlineCompletions,r.sourceInlineCompletion,I.length,{kind:i})}}finally{r.source.removeRef()}}handleSuggestAccepted(e){const t=M(e.toSingleTextEdit(),this.textModel),i=this._computeAugmentation(t,void 0);if(!i)return;const n=i.completion.inlineCompletion;n.source.provider.handlePartialAccept?.(n.source.inlineCompletions,n.sourceInlineCompletion,t.text.length,{kind:R.Suggest})}};S=U([P(9,ne),P(10,ie),P(11,re)],S);var he=(i=>(i[i.Undo=0]="Undo",i[i.Redo=1]="Redo",i[i.AcceptWord=2]="AcceptWord",i[i.Other=3]="Other",i))(he||{});function O(m,p,e){if(p.length===1)return[];const t=p[0],i=p.slice(1),n=e.range.getStartPosition(),o=e.range.getEndPosition(),r=m.getValueInRange(x.fromPositions(t,o)),l=N(t,n);if(l.lineNumber<1)return j(new T(`positionWithinTextEdit line number should be bigger than 0.
			Invalid subtraction between ${t.toString()} and ${n.toString()}`)),[];const s=ce(e.text,l);return i.map(a=>{const d=ae(N(a,n),o),c=m.getValueInRange(x.fromPositions(a,d)),g=te(r,c),u=x.fromPositions(a,a.delta(0,g));return new K(u,s)})}export{S as InlineCompletionsModel,he as VersionIdChangeReason,O as getSecondaryEdits};
