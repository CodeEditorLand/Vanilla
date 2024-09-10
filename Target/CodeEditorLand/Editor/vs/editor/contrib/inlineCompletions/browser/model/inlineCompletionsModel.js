var $=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var O=(p,a,e,t)=>{for(var n=t>1?void 0:t?k(a,e):a,i=p.length-1,o;i>=0;i--)(o=p[i])&&(n=(t?o(a,e,n):o(n))||n);return t&&n&&$(a,e,n),n},P=(p,a)=>(e,t)=>a(e,t,p);import{compareBy as H,Permutation as j}from"../../../../../base/common/arrays.js";import{mapFindFirst as z}from"../../../../../base/common/arraysFind.js";import{itemsEquals as W}from"../../../../../base/common/equals.js";import{BugIndicatingError as T,onUnexpectedError as J,onUnexpectedExternalError as Q}from"../../../../../base/common/errors.js";import{Disposable as X}from"../../../../../base/common/lifecycle.js";import{autorun as Y,derived as b,derivedHandleChanges as Z,derivedOpts as v,observableSignal as ee,observableValue as V,recomputeInitiallyAndOnChange as te,subtransaction as G,transaction as ne}from"../../../../../base/common/observable.js";import{commonPrefixLength as ie,splitLinesIncludeSeparators as oe}from"../../../../../base/common/strings.js";import{isDefined as E}from"../../../../../base/common/types.js";import"../../../../browser/editorBrowser.js";import{EditOperation as w}from"../../../../common/core/editOperation.js";import{Position as L}from"../../../../common/core/position.js";import{Range as I}from"../../../../common/core/range.js";import{Selection as N}from"../../../../common/core/selection.js";import{SingleTextEdit as q,TextEdit as se}from"../../../../common/core/textEdit.js";import{TextLength as re}from"../../../../common/core/textLength.js";import{ScrollType as le}from"../../../../common/editorCommon.js";import{InlineCompletionTriggerKind as R,PartialAcceptTriggerKind as A}from"../../../../common/languages.js";import{ILanguageConfigurationService as de}from"../../../../common/languages/languageConfigurationRegistry.js";import{EndOfLinePreference as ae}from"../../../../common/model.js";import"../../../../common/services/languageFeatureDebounce.js";import"../../../../common/textModelEvents.js";import{GhostText as ce,ghostTextOrReplacementEquals as pe,ghostTextsOrReplacementsEqual as K}from"./ghostText.js";import{InlineCompletionsSource as me}from"./inlineCompletionsSource.js";import{computeGhostText as F,singleTextEditAugments as ge,singleTextRemoveCommonPrefix as M}from"./singleTextEdit.js";import"./suggestWidgetAdaptor.js";import{addPositions as ue,subtractPositions as D}from"../utils.js";import{SnippetController2 as fe}from"../../../snippet/browser/snippetController2.js";import{ICommandService as he}from"../../../../../platform/commands/common/commands.js";import{IInstantiationService as Ie}from"../../../../../platform/instantiation/common/instantiation.js";let S=class extends X{constructor(e,t,n,i,o,r,l,s,c,d,m,g){super();this.textModel=e;this.selectedSuggestItem=t;this._textModelVersionId=n;this._positions=i;this._debounceValue=o;this._suggestPreviewEnabled=r;this._suggestPreviewMode=l;this._inlineSuggestMode=s;this._enabled=c;this._instantiationService=d;this._commandService=m;this._languageConfigurationService=g;this._register(te(this._fetchInlineCompletionsPromise));let u;this._register(Y(f=>{const h=this.state.read(f)?.inlineCompletion;if(h?.semanticId!==u?.semanticId&&(u=h,h)){const C=h.inlineCompletion,y=C.source;y.provider.handleItemDidShow?.(y.inlineCompletions,C.sourceInlineCompletion,C.insertText)}}))}_source=this._register(this._instantiationService.createInstance(me,this.textModel,this._textModelVersionId,this._debounceValue));_isActive=V(this,!1);_forceUpdateExplicitlySignal=ee(this);_selectedInlineCompletionId=V(this,void 0);_primaryPosition=b(this,e=>this._positions.read(e)[0]??new L(1,1));_isAcceptingPartially=!1;get isAcceptingPartially(){return this._isAcceptingPartially}_preserveCurrentCompletionReasons=new Set([1,0,2]);_getReason(e){return e?.isUndoing?0:e?.isRedoing?1:this.isAcceptingPartially?2:3}_fetchInlineCompletionsPromise=Z({owner:this,createEmptyChangeSummary:()=>({preserveCurrentCompletion:!1,inlineCompletionTriggerKind:R.Automatic}),handleChange:(e,t)=>(e.didChange(this._textModelVersionId)&&this._preserveCurrentCompletionReasons.has(this._getReason(e.change))?t.preserveCurrentCompletion=!0:e.didChange(this._forceUpdateExplicitlySignal)&&(t.inlineCompletionTriggerKind=R.Explicit),!0)},(e,t)=>{if(this._forceUpdateExplicitlySignal.read(e),!(this._enabled.read(e)&&this.selectedSuggestItem.read(e)||this._isActive.read(e))){this._source.cancelUpdate();return}this._textModelVersionId.read(e);const i=this._source.suggestWidgetInlineCompletions.get(),o=this.selectedSuggestItem.read(e);if(i&&!o){const d=this._source.inlineCompletions.get();ne(m=>{(!d||i.request.versionId>d.request.versionId)&&this._source.inlineCompletions.set(i.clone(),m),this._source.clearSuggestWidgetInlineCompletions(m)})}const r=this._primaryPosition.read(e),l={triggerKind:t.inlineCompletionTriggerKind,selectedSuggestionInfo:o?.toSelectedSuggestionInfo()},s=this.selectedInlineCompletion.get(),c=t.preserveCurrentCompletion||s?.forwardStable?s:void 0;return this._source.fetch(r,l,c)});async trigger(e){this._isActive.set(!0,e),await this._fetchInlineCompletionsPromise.get()}async triggerExplicitly(e){G(e,t=>{this._isActive.set(!0,t),this._forceUpdateExplicitlySignal.trigger(t)}),await this._fetchInlineCompletionsPromise.get()}stop(e){G(e,t=>{this._isActive.set(!1,t),this._source.clear(t)})}_filteredInlineCompletionItems=v({owner:this,equalsFn:W()},e=>{const t=this._source.inlineCompletions.read(e);if(!t)return[];const n=this._primaryPosition.read(e);return t.inlineCompletions.filter(o=>o.isVisible(this.textModel,n,e))});selectedInlineCompletionIndex=b(this,e=>{const t=this._selectedInlineCompletionId.read(e),n=this._filteredInlineCompletionItems.read(e),i=this._selectedInlineCompletionId===void 0?-1:n.findIndex(o=>o.semanticId===t);return i===-1?(this._selectedInlineCompletionId.set(void 0,void 0),0):i});selectedInlineCompletion=b(this,e=>{const t=this._filteredInlineCompletionItems.read(e),n=this.selectedInlineCompletionIndex.read(e);return t[n]});activeCommands=v({owner:this,equalsFn:W()},e=>this.selectedInlineCompletion.read(e)?.inlineCompletion.source.inlineCompletions.commands??[]);lastTriggerKind=this._source.inlineCompletions.map(this,e=>e?.request.context.triggerKind);inlineCompletionsCount=b(this,e=>{if(this.lastTriggerKind.read(e)===R.Explicit)return this._filteredInlineCompletionItems.read(e).length});state=v({owner:this,equalsFn:(e,t)=>!e||!t?e===t:K(e.ghostTexts,t.ghostTexts)&&e.inlineCompletion===t.inlineCompletion&&e.suggestItem===t.suggestItem},e=>{const t=this.textModel,n=this.selectedSuggestItem.read(e);if(n){const i=M(n.toSingleTextEdit(),t),o=this._computeAugmentation(i,e);if(!this._suggestPreviewEnabled.read(e)&&!o)return;const l=o?.edit??i,s=o?o.edit.text.length-i.text.length:0,c=this._suggestPreviewMode.read(e),d=this._positions.read(e),m=[l,...U(this.textModel,d,l)],g=m.map((f,x)=>F(f,t,c,d[x],s)).filter(E),u=g[0]??new ce(l.range.endLineNumber,[]);return{edits:m,primaryGhostText:u,ghostTexts:g,inlineCompletion:o?.completion,suggestItem:n}}else{if(!this._isActive.read(e))return;const i=this.selectedInlineCompletion.read(e);if(!i)return;const o=i.toSingleTextEdit(e),r=this._inlineSuggestMode.read(e),l=this._positions.read(e),s=[o,...U(this.textModel,l,o)],c=s.map((d,m)=>F(d,t,r,l[m],0)).filter(E);return c[0]?{edits:s,primaryGhostText:c[0],ghostTexts:c,inlineCompletion:i,suggestItem:void 0}:void 0}});_computeAugmentation(e,t){const n=this.textModel,i=this._source.suggestWidgetInlineCompletions.read(t),o=i?i.inlineCompletions:[this.selectedInlineCompletion.read(t)].filter(E);return z(o,l=>{let s=l.toSingleTextEdit(t);return s=M(s,n,I.fromPositions(s.range.getStartPosition(),e.range.getEndPosition())),ge(s,e)?{completion:l,edit:s}:void 0})}ghostTexts=v({owner:this,equalsFn:K},e=>{const t=this.state.read(e);if(t)return t.ghostTexts});primaryGhostText=v({owner:this,equalsFn:pe},e=>{const t=this.state.read(e);if(t)return t?.primaryGhostText});async _deltaSelectedInlineCompletionIndex(e){await this.triggerExplicitly();const t=this._filteredInlineCompletionItems.get()||[];if(t.length>0){const n=(this.selectedInlineCompletionIndex.get()+e+t.length)%t.length;this._selectedInlineCompletionId.set(t[n].semanticId,void 0)}else this._selectedInlineCompletionId.set(void 0,void 0)}async next(){await this._deltaSelectedInlineCompletionIndex(1)}async previous(){await this._deltaSelectedInlineCompletionIndex(-1)}async accept(e){if(e.getModel()!==this.textModel)throw new T;const t=this.state.get();if(!t||t.primaryGhostText.isEmpty()||!t.inlineCompletion)return;const n=t.inlineCompletion.toInlineCompletion(void 0);if(n.command&&n.source.addRef(),e.pushUndoStop(),n.snippetInfo)e.executeEdits("inlineSuggestion.accept",[w.replace(n.range,""),...n.additionalTextEdits]),e.setPosition(n.snippetInfo.range.getStartPosition(),"inlineCompletionAccept"),fe.get(e)?.insert(n.snippetInfo.snippet,{undoStopBefore:!1});else{const i=t.edits,o=B(i).map(r=>N.fromPositions(r));e.executeEdits("inlineSuggestion.accept",[...i.map(r=>w.replace(r.range,r.text)),...n.additionalTextEdits]),e.setSelections(o,"inlineCompletionAccept")}this.stop(),n.command&&(await this._commandService.executeCommand(n.command.id,...n.command.arguments||[]).then(void 0,Q),n.source.removeRef())}async acceptNextWord(e){await this._acceptNext(e,(t,n)=>{const i=this.textModel.getLanguageIdAtPosition(t.lineNumber,t.column),o=this._languageConfigurationService.getLanguageConfiguration(i),r=new RegExp(o.wordDefinition.source,o.wordDefinition.flags.replace("g","")),l=n.match(r);let s=0;l&&l.index!==void 0?l.index===0?s=l[0].length:s=l.index:s=n.length;const d=/\s+/g.exec(n);return d&&d.index!==void 0&&d.index+d[0].length<s&&(s=d.index+d[0].length),s},A.Word)}async acceptNextLine(e){await this._acceptNext(e,(t,n)=>{const i=n.match(/\n/);return i&&i.index!==void 0?i.index+1:n.length},A.Line)}async _acceptNext(e,t,n){if(e.getModel()!==this.textModel)throw new T;const i=this.state.get();if(!i||i.primaryGhostText.isEmpty()||!i.inlineCompletion)return;const o=i.primaryGhostText,r=i.inlineCompletion.toInlineCompletion(void 0);if(r.snippetInfo||r.filterText!==r.insertText){await this.accept(e);return}const l=o.parts[0],s=new L(o.lineNumber,l.column),c=l.text,d=t(s,c);if(d===c.length&&o.parts.length===1){this.accept(e);return}const m=c.substring(0,d),g=this._positions.get(),u=g[0];r.source.addRef();try{this._isAcceptingPartially=!0;try{e.pushUndoStop();const f=I.fromPositions(u,s),x=e.getModel().getValueInRange(f)+m,h=new q(f,x),C=[h,...U(this.textModel,g,h)],y=B(C).map(_=>N.fromPositions(_));e.executeEdits("inlineSuggestion.accept",C.map(_=>w.replace(_.range,_.text))),e.setSelections(y,"inlineCompletionPartialAccept"),e.revealPositionInCenterIfOutsideViewport(e.getPosition(),le.Immediate)}finally{this._isAcceptingPartially=!1}if(r.source.provider.handlePartialAccept){const f=I.fromPositions(r.range.getStartPosition(),re.ofText(m).addToPosition(s)),x=e.getModel().getValueInRange(f,ae.LF);r.source.provider.handlePartialAccept(r.source.inlineCompletions,r.sourceInlineCompletion,x.length,{kind:n})}}finally{r.source.removeRef()}}handleSuggestAccepted(e){const t=M(e.toSingleTextEdit(),this.textModel),n=this._computeAugmentation(t,void 0);if(!n)return;const i=n.completion.inlineCompletion;i.source.provider.handlePartialAccept?.(i.source.inlineCompletions,i.sourceInlineCompletion,t.text.length,{kind:A.Suggest})}};S=O([P(9,Ie),P(10,he),P(11,de)],S);var xe=(n=>(n[n.Undo=0]="Undo",n[n.Redo=1]="Redo",n[n.AcceptWord=2]="AcceptWord",n[n.Other=3]="Other",n))(xe||{});function U(p,a,e){if(a.length===1)return[];const t=a[0],n=a.slice(1),i=e.range.getStartPosition(),o=e.range.getEndPosition(),r=p.getValueInRange(I.fromPositions(t,o)),l=D(t,i);if(l.lineNumber<1)return J(new T(`positionWithinTextEdit line number should be bigger than 0.
			Invalid subtraction between ${t.toString()} and ${i.toString()}`)),[];const s=Ce(e.text,l);return n.map(c=>{const d=ue(D(c,i),o),m=p.getValueInRange(I.fromPositions(c,d)),g=ie(r,m),u=I.fromPositions(c,c.delta(0,g));return new q(u,s)})}function Ce(p,a){let e="";const t=oe(p);for(let n=a.lineNumber-1;n<t.length;n++)e+=t[n].substring(n===a.lineNumber-1?a.column-1:0);return e}function B(p){const a=j.createSortPermutation(p,H(i=>i.range,I.compareRangesUsingStarts)),t=new se(a.apply(p)).getNewRanges();return a.inverse().apply(t).map(i=>i.getEndPosition())}export{S as InlineCompletionsModel,xe as VersionIdChangeReason,U as getSecondaryEdits};
