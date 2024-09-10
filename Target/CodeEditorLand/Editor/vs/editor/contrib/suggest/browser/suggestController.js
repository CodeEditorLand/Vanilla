var se=Object.defineProperty;var ne=Object.getOwnPropertyDescriptor;var q=(s,e,o,d)=>{for(var a=d>1?void 0:d?ne(e,o):e,r=s.length-1,i;r>=0;r--)(i=s[r])&&(a=(d?i(e,o,a):i(a))||a);return d&&a&&se(e,o,a),a},F=(s,e)=>(o,d)=>e(o,d,s);import{alert as re}from"../../../../base/browser/ui/aria/aria.js";import{isNonEmptyArray as ae}from"../../../../base/common/arrays.js";import{CancellationTokenSource as le}from"../../../../base/common/cancellation.js";import{onUnexpectedError as de,onUnexpectedExternalError as ge}from"../../../../base/common/errors.js";import{Emitter as ce,Event as j}from"../../../../base/common/event.js";import{KeyCode as n,KeyMod as p}from"../../../../base/common/keyCodes.js";import{KeyCodeChord as G}from"../../../../base/common/keybindings.js";import{DisposableStore as pe,dispose as Q,MutableDisposable as ue,toDisposable as me}from"../../../../base/common/lifecycle.js";import*as he from"../../../../base/common/platform.js";import{StopWatch as J}from"../../../../base/common/stopwatch.js";import{assertType as fe,isObject as Se}from"../../../../base/common/types.js";import{StableEditorScrollState as X}from"../../../browser/stableEditorScroll.js";import{EditorAction as Y,EditorCommand as ve,EditorContributionInstantiation as Ie,registerEditorAction as Z,registerEditorCommand as I,registerEditorContribution as be}from"../../../browser/editorExtensions.js";import{EditorOption as O}from"../../../common/config/editorOptions.js";import{EditOperation as $}from"../../../common/core/editOperation.js";import{Position as L}from"../../../common/core/position.js";import{Range as P}from"../../../common/core/range.js";import{ScrollType as ee}from"../../../common/editorCommon.js";import{EditorContextKeys as u}from"../../../common/editorContextKeys.js";import{TrackedRangeStickiness as ye}from"../../../common/model.js";import{CompletionItemInsertTextRule as R,CompletionTriggerKind as te}from"../../../common/languages.js";import{SnippetController2 as W}from"../../snippet/browser/snippetController2.js";import{SnippetParser as Ce}from"../../snippet/browser/snippetParser.js";import{ISuggestMemoryService as xe}from"./suggestMemory.js";import{WordContextKey as ie}from"./wordContextKey.js";import*as E from"../../../../nls.js";import{CommandsRegistry as we,ICommandService as De}from"../../../../platform/commands/common/commands.js";import{ContextKeyExpr as c,IContextKeyService as Ee}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as Ae}from"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as U}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{ILogService as _e}from"../../../../platform/log/common/log.js";import{Context as t,suggestWidgetStatusbarMenu as k}from"./suggest.js";import{SuggestAlternatives as K}from"./suggestAlternatives.js";import{CommitCharacterController as Te}from"./suggestCommitCharacters.js";import{State as oe,SuggestModel as Me}from"./suggestModel.js";import{OvertypingCapturer as Fe}from"./suggestOvertypingCapturer.js";import{SuggestWidget as Pe}from"./suggestWidget.js";import{ITelemetryService as ke}from"../../../../platform/telemetry/common/telemetry.js";import{basename as Ne,extname as Oe}from"../../../../base/common/resources.js";import{hash as Re}from"../../../../base/common/hash.js";import{WindowIdleValue as H,getWindow as B}from"../../../../base/browser/dom.js";import{ModelDecorationOptions as We}from"../../../common/model/textModel.js";const Ke=!1;class Ve{constructor(e,o){this._model=e;this._position=o;if(e.getLineMaxColumn(o.lineNumber)!==o.column){const a=e.getOffsetAt(o),r=e.getPositionAt(a+1);e.changeDecorations(i=>{this._marker&&i.removeDecoration(this._marker),this._marker=i.addDecoration(P.fromPositions(o,r),this._decorationOptions)})}}_decorationOptions=We.register({description:"suggest-line-suffix",stickiness:ye.NeverGrowsWhenTypingAtEdges});_marker;dispose(){this._marker&&!this._model.isDisposed()&&this._model.changeDecorations(e=>{e.removeDecoration(this._marker),this._marker=void 0})}delta(e){if(this._model.isDisposed()||this._position.lineNumber!==e.lineNumber)return 0;if(this._marker){const o=this._model.getDecorationRange(this._marker);return this._model.getOffsetAt(o.getStartPosition())-this._model.getOffsetAt(e)}else return this._model.getLineMaxColumn(e.lineNumber)-e.column}}var Le=(r=>(r[r.None=0]="None",r[r.NoBeforeUndoStop=1]="NoBeforeUndoStop",r[r.NoAfterUndoStop=2]="NoAfterUndoStop",r[r.KeepAlternativeSuggestions=4]="KeepAlternativeSuggestions",r[r.AlternativeOverwriteConfig=8]="AlternativeOverwriteConfig",r))(Le||{});let D=class{constructor(e,o,d,a,r,i,S){this._memoryService=o;this._commandService=d;this._contextKeyService=a;this._instantiationService=r;this._logService=i;this._telemetryService=S;this.editor=e,this.model=r.createInstance(Me,this.editor),this._selectors.register({priority:0,select:(g,h,v)=>this._memoryService.select(g,h,v)});const m=t.InsertMode.bindTo(a);m.set(e.getOption(O.suggest).insertMode),this._toDispose.add(this.model.onDidTrigger(()=>m.set(e.getOption(O.suggest).insertMode))),this.widget=this._toDispose.add(new H(B(e.getDomNode()),()=>{const g=this._instantiationService.createInstance(Pe,this.editor);this._toDispose.add(g),this._toDispose.add(g.onDidSelect(l=>this._insertSuggestion(l,0),this));const h=new Te(this.editor,g,this.model,l=>this._insertSuggestion(l,2));this._toDispose.add(h);const v=t.MakesTextEdit.bindTo(this._contextKeyService),f=t.HasInsertAndReplaceRange.bindTo(this._contextKeyService),y=t.CanResolve.bindTo(this._contextKeyService);return this._toDispose.add(me(()=>{v.reset(),f.reset(),y.reset()})),this._toDispose.add(g.onDidFocus(({item:l})=>{const A=this.editor.getPosition(),_=l.editStart.column,T=A.column;let w=!0;this.editor.getOption(O.acceptSuggestionOnEnter)==="smart"&&this.model.state===oe.Auto&&!l.completion.additionalTextEdits&&!(l.completion.insertTextRules&R.InsertAsSnippet)&&T-_===l.completion.insertText.length&&(w=this.editor.getModel().getValueInRange({startLineNumber:A.lineNumber,startColumn:_,endLineNumber:A.lineNumber,endColumn:T})!==l.completion.insertText),v.set(w),f.set(!L.equals(l.editInsertEnd,l.editReplaceEnd)),y.set(!!l.provider.resolveCompletionItem||!!l.completion.documentation||l.completion.detail!==l.completion.label)})),this._toDispose.add(g.onDetailsKeyDown(l=>{if(l.toKeyCodeChord().equals(new G(!0,!1,!1,!1,n.KeyC))||he.isMacintosh&&l.toKeyCodeChord().equals(new G(!1,!1,!1,!0,n.KeyC))){l.stopPropagation();return}l.toKeyCodeChord().isModifierKey()||this.editor.focus()})),g})),this._overtypingCapturer=this._toDispose.add(new H(B(e.getDomNode()),()=>this._toDispose.add(new Fe(this.editor,this.model)))),this._alternatives=this._toDispose.add(new H(B(e.getDomNode()),()=>this._toDispose.add(new K(this.editor,this._contextKeyService)))),this._toDispose.add(r.createInstance(ie,e)),this._toDispose.add(this.model.onDidTrigger(g=>{this.widget.value.showTriggered(g.auto,g.shy?250:50),this._lineSuffix.value=new Ve(this.editor.getModel(),g.position)})),this._toDispose.add(this.model.onDidSuggest(g=>{if(g.triggerOptions.shy)return;let h=-1;for(const f of this._selectors.itemsOrderedByPriorityDesc)if(h=f.select(this.editor.getModel(),this.editor.getPosition(),g.completionModel.items),h!==-1)break;if(h===-1&&(h=0),this.model.state===oe.Idle)return;let v=!1;if(g.triggerOptions.auto){const f=this.editor.getOption(O.suggest);f.selectionMode==="never"||f.selectionMode==="always"?v=f.selectionMode==="never":f.selectionMode==="whenTriggerCharacter"?v=g.triggerOptions.triggerKind!==te.TriggerCharacter:f.selectionMode==="whenQuickSuggestion"&&(v=g.triggerOptions.triggerKind===te.TriggerCharacter&&!g.triggerOptions.refilter)}this.widget.value.showSuggestions(g.completionModel,h,g.isFrozen,g.triggerOptions.auto,v)})),this._toDispose.add(this.model.onDidCancel(g=>{g.retrigger||this.widget.value.hideWidget()})),this._toDispose.add(this.editor.onDidBlurEditorWidget(()=>{Ke||(this.model.cancel(),this.model.clear())}));const x=t.AcceptSuggestionsOnEnter.bindTo(a),N=()=>{const g=this.editor.getOption(O.acceptSuggestionOnEnter);x.set(g==="on"||g==="smart")};this._toDispose.add(this.editor.onDidChangeConfiguration(()=>N())),N()}static ID="editor.contrib.suggestController";static get(e){return e.getContribution(D.ID)}editor;model;widget;_alternatives;_lineSuffix=new ue;_toDispose=new pe;_overtypingCapturer;_selectors=new Ue(e=>e.priority);_onWillInsertSuggestItem=new ce;onWillInsertSuggestItem=this._onWillInsertSuggestItem.event;dispose(){this._alternatives.dispose(),this._toDispose.dispose(),this.widget.dispose(),this.model.dispose(),this._lineSuffix.dispose(),this._onWillInsertSuggestItem.dispose()}_insertSuggestion(e,o){if(!e||!e.item){this._alternatives.value.reset(),this.model.cancel(),this.model.clear();return}if(!this.editor.hasModel())return;const d=W.get(this.editor);if(!d)return;this._onWillInsertSuggestItem.fire({item:e.item});const a=this.editor.getModel(),r=a.getAlternativeVersionId(),{item:i}=e,S=[],m=new le;o&1||this.editor.pushUndoStop();const x=this.getOverwriteInfo(i,!!(o&8));this._memoryService.memorize(a,this.editor.getPosition(),i);const N=i.isResolved;let g=-1,h=-1;if(Array.isArray(i.completion.additionalTextEdits)){this.model.cancel();const f=X.capture(this.editor);this.editor.executeEdits("suggestController.additionalTextEdits.sync",i.completion.additionalTextEdits.map(y=>{let l=P.lift(y.range);if(l.startLineNumber===i.position.lineNumber&&l.startColumn>i.position.column){const A=this.editor.getPosition().column-i.position.column,_=A,T=P.spansMultipleLines(l)?0:A;l=new P(l.startLineNumber,l.startColumn+_,l.endLineNumber,l.endColumn+T)}return $.replaceMove(l,y.text)})),f.restoreRelativeVerticalPositionOfCursor(this.editor)}else if(!N){const f=new J;let y;const l=a.onDidChangeContent(w=>{if(w.isFlush){m.cancel(),l.dispose();return}for(const M of w.changes){const z=P.getEndPosition(M.range);(!y||L.isBefore(z,y))&&(y=z)}}),A=o;o|=2;let _=!1;const T=this.editor.onWillType(()=>{T.dispose(),_=!0,A&2||this.editor.pushUndoStop()});S.push(i.resolve(m.token).then(()=>{if(!i.completion.additionalTextEdits||m.token.isCancellationRequested)return;if(y&&i.completion.additionalTextEdits.some(M=>L.isBefore(y,P.getStartPosition(M.range))))return!1;_&&this.editor.pushUndoStop();const w=X.capture(this.editor);return this.editor.executeEdits("suggestController.additionalTextEdits.async",i.completion.additionalTextEdits.map(M=>$.replaceMove(P.lift(M.range),M.text))),w.restoreRelativeVerticalPositionOfCursor(this.editor),(_||!(A&2))&&this.editor.pushUndoStop(),!0}).then(w=>{this._logService.trace("[suggest] async resolving of edits DONE (ms, applied?)",f.elapsed(),w),h=w===!0?1:w===!1?0:-2}).finally(()=>{l.dispose(),T.dispose()}))}let{insertText:v}=i.completion;if(i.completion.insertTextRules&R.InsertAsSnippet||(v=Ce.escape(v)),this.model.cancel(),d.insert(v,{overwriteBefore:x.overwriteBefore,overwriteAfter:x.overwriteAfter,undoStopBefore:!1,undoStopAfter:!1,adjustWhitespace:!(i.completion.insertTextRules&R.KeepWhitespace),clipboardText:e.model.clipboardText,overtypingCapturer:this._overtypingCapturer.value}),o&2||this.editor.pushUndoStop(),i.completion.command)if(i.completion.command.id===V.id)this.model.trigger({auto:!0,retrigger:!0});else{const f=new J;S.push(this._commandService.executeCommand(i.completion.command.id,...i.completion.command.arguments?[...i.completion.command.arguments]:[]).catch(y=>{i.completion.extensionId?ge(y):de(y)}).finally(()=>{g=f.elapsed()}))}o&4&&this._alternatives.value.set(e,f=>{for(m.cancel();a.canUndo();){r!==a.getAlternativeVersionId()&&a.undo(),this._insertSuggestion(f,3|(o&8?8:0));break}}),this._alertCompletionItem(i),Promise.all(S).finally(()=>{this._reportSuggestionAcceptedTelemetry(i,a,N,g,h,e.index,e.model.items),this.model.clear(),m.dispose()})}_reportSuggestionAcceptedTelemetry(e,o,d,a,r,i,S){if(Math.floor(Math.random()*100)===0)return;const m=new Map;for(let h=0;h<Math.min(30,S.length);h++){const v=S[h].textLabel;m.has(v)?m.get(v).push(h):m.set(v,[h])}const x=m.get(e.textLabel),g=x&&x.length>1?x[0]:-1;this._telemetryService.publicLog2("suggest.acceptedSuggestion",{extensionId:e.extensionId?.value??"unknown",providerId:e.provider._debugDisplayName??"unknown",kind:e.completion.kind,basenameHash:Re(Ne(o.uri)).toString(16),languageId:o.getLanguageId(),fileExtension:Oe(o.uri),resolveInfo:e.provider.resolveCompletionItem?d?1:0:-1,resolveDuration:e.resolveDuration,commandDuration:a,additionalEditsAsync:r,index:i,firstIndex:g})}getOverwriteInfo(e,o){fe(this.editor.hasModel());let d=this.editor.getOption(O.suggest).insertMode==="replace";o&&(d=!d);const a=e.position.column-e.editStart.column,r=(d?e.editReplaceEnd.column:e.editInsertEnd.column)-e.position.column,i=this.editor.getPosition().column-e.position.column,S=this._lineSuffix.value?this._lineSuffix.value.delta(this.editor.getPosition()):0;return{overwriteBefore:a+i,overwriteAfter:r+S}}_alertCompletionItem(e){if(ae(e.completion.additionalTextEdits)){const o=E.localize("aria.alert.snippet","Accepting '{0}' made {1} additional edits",e.textLabel,e.completion.additionalTextEdits.length);re(o)}}triggerSuggest(e,o,d){this.editor.hasModel()&&(this.model.trigger({auto:o??!1,completionOptions:{providerFilter:e,kindFilter:d?new Set:void 0}}),this.editor.revealPosition(this.editor.getPosition(),ee.Smooth),this.editor.focus())}triggerSuggestAndAcceptBest(e){if(!this.editor.hasModel())return;const o=this.editor.getPosition(),d=()=>{o.equals(this.editor.getPosition())&&this._commandService.executeCommand(e.fallback)},a=r=>{if(r.completion.insertTextRules&R.InsertAsSnippet||r.completion.additionalTextEdits)return!0;const i=this.editor.getPosition(),S=r.editStart.column,m=i.column;return m-S!==r.completion.insertText.length?!0:this.editor.getModel().getValueInRange({startLineNumber:i.lineNumber,startColumn:S,endLineNumber:i.lineNumber,endColumn:m})!==r.completion.insertText};j.once(this.model.onDidTrigger)(r=>{const i=[];j.any(this.model.onDidTrigger,this.model.onDidCancel)(()=>{Q(i),d()},void 0,i),this.model.onDidSuggest(({completionModel:S})=>{if(Q(i),S.items.length===0){d();return}const m=this._memoryService.select(this.editor.getModel(),this.editor.getPosition(),S.items),x=S.items[m];if(!a(x)){d();return}this.editor.pushUndoStop(),this._insertSuggestion({index:m,item:x,model:S},7)},void 0,i)}),this.model.trigger({auto:!1,shy:!0}),this.editor.revealPosition(o,ee.Smooth),this.editor.focus()}acceptSelectedSuggestion(e,o){const d=this.widget.value.getFocusedItem();let a=0;e&&(a|=4),o&&(a|=8),this._insertSuggestion(d,a)}acceptNextSuggestion(){this._alternatives.value.next()}acceptPrevSuggestion(){this._alternatives.value.prev()}cancelSuggestWidget(){this.model.cancel(),this.model.clear(),this.widget.value.hideWidget()}focusSuggestion(){this.widget.value.focusSelected()}selectNextSuggestion(){this.widget.value.selectNext()}selectNextPageSuggestion(){this.widget.value.selectNextPage()}selectLastSuggestion(){this.widget.value.selectLast()}selectPrevSuggestion(){this.widget.value.selectPrevious()}selectPrevPageSuggestion(){this.widget.value.selectPreviousPage()}selectFirstSuggestion(){this.widget.value.selectFirst()}toggleSuggestionDetails(){this.widget.value.toggleDetails()}toggleExplainMode(){this.widget.value.toggleExplainMode()}toggleSuggestionFocus(){this.widget.value.toggleDetailsFocus()}resetWidgetSize(){this.widget.value.resetPersistedSize()}forceRenderingAbove(){this.widget.value.forceRenderingAbove()}stopForceRenderingAbove(){this.widget.isInitialized&&this.widget.value.stopForceRenderingAbove()}registerSelector(e){return this._selectors.register(e)}};D=q([F(1,xe),F(2,De),F(3,Ee),F(4,Ae),F(5,_e),F(6,ke)],D);class Ue{constructor(e){this.prioritySelector=e}_items=new Array;register(e){if(this._items.indexOf(e)!==-1)throw new Error("Value is already registered");return this._items.push(e),this._items.sort((o,d)=>this.prioritySelector(d)-this.prioritySelector(o)),{dispose:()=>{const o=this._items.indexOf(e);o>=0&&this._items.splice(o,1)}}}get itemsOrderedByPriorityDesc(){return this._items}}class V extends Y{static id="editor.action.triggerSuggest";constructor(){super({id:V.id,label:E.localize("suggest.trigger.label","Trigger Suggest"),alias:"Trigger Suggest",precondition:c.and(u.writable,u.hasCompletionItemProvider,t.Visible.toNegated()),kbOpts:{kbExpr:u.textInputFocus,primary:p.CtrlCmd|n.Space,secondary:[p.CtrlCmd|n.KeyI],mac:{primary:p.WinCtrl|n.Space,secondary:[p.Alt|n.Escape,p.CtrlCmd|n.KeyI]},weight:U.EditorContrib}})}run(e,o,d){const a=D.get(o);if(!a)return;let r;d&&typeof d=="object"&&d.auto===!0&&(r=!0),a.triggerSuggest(void 0,r,void 0)}}be(D.ID,D,Ie.BeforeFirstInteraction),Z(V);const C=U.EditorContrib+90,b=ve.bindToContribution(D.get);I(new b({id:"acceptSelectedSuggestion",precondition:c.and(t.Visible,t.HasFocusedSuggestion),handler(s){s.acceptSelectedSuggestion(!0,!1)},kbOpts:[{primary:n.Tab,kbExpr:c.and(t.Visible,u.textInputFocus),weight:C},{primary:n.Enter,kbExpr:c.and(t.Visible,u.textInputFocus,t.AcceptSuggestionsOnEnter,t.MakesTextEdit),weight:C}],menuOpts:[{menuId:k,title:E.localize("accept.insert","Insert"),group:"left",order:1,when:t.HasInsertAndReplaceRange.toNegated()},{menuId:k,title:E.localize("accept.insert","Insert"),group:"left",order:1,when:c.and(t.HasInsertAndReplaceRange,t.InsertMode.isEqualTo("insert"))},{menuId:k,title:E.localize("accept.replace","Replace"),group:"left",order:1,when:c.and(t.HasInsertAndReplaceRange,t.InsertMode.isEqualTo("replace"))}]})),I(new b({id:"acceptAlternativeSelectedSuggestion",precondition:c.and(t.Visible,u.textInputFocus,t.HasFocusedSuggestion),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:p.Shift|n.Enter,secondary:[p.Shift|n.Tab]},handler(s){s.acceptSelectedSuggestion(!1,!0)},menuOpts:[{menuId:k,group:"left",order:2,when:c.and(t.HasInsertAndReplaceRange,t.InsertMode.isEqualTo("insert")),title:E.localize("accept.replace","Replace")},{menuId:k,group:"left",order:2,when:c.and(t.HasInsertAndReplaceRange,t.InsertMode.isEqualTo("replace")),title:E.localize("accept.insert","Insert")}]})),we.registerCommandAlias("acceptSelectedSuggestionOnEnter","acceptSelectedSuggestion"),I(new b({id:"hideSuggestWidget",precondition:t.Visible,handler:s=>s.cancelSuggestWidget(),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:n.Escape,secondary:[p.Shift|n.Escape]}})),I(new b({id:"selectNextSuggestion",precondition:c.and(t.Visible,c.or(t.MultipleSuggestions,t.HasFocusedSuggestion.negate())),handler:s=>s.selectNextSuggestion(),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:n.DownArrow,secondary:[p.CtrlCmd|n.DownArrow],mac:{primary:n.DownArrow,secondary:[p.CtrlCmd|n.DownArrow,p.WinCtrl|n.KeyN]}}})),I(new b({id:"selectNextPageSuggestion",precondition:c.and(t.Visible,c.or(t.MultipleSuggestions,t.HasFocusedSuggestion.negate())),handler:s=>s.selectNextPageSuggestion(),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:n.PageDown,secondary:[p.CtrlCmd|n.PageDown]}})),I(new b({id:"selectLastSuggestion",precondition:c.and(t.Visible,c.or(t.MultipleSuggestions,t.HasFocusedSuggestion.negate())),handler:s=>s.selectLastSuggestion()})),I(new b({id:"selectPrevSuggestion",precondition:c.and(t.Visible,c.or(t.MultipleSuggestions,t.HasFocusedSuggestion.negate())),handler:s=>s.selectPrevSuggestion(),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:n.UpArrow,secondary:[p.CtrlCmd|n.UpArrow],mac:{primary:n.UpArrow,secondary:[p.CtrlCmd|n.UpArrow,p.WinCtrl|n.KeyP]}}})),I(new b({id:"selectPrevPageSuggestion",precondition:c.and(t.Visible,c.or(t.MultipleSuggestions,t.HasFocusedSuggestion.negate())),handler:s=>s.selectPrevPageSuggestion(),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:n.PageUp,secondary:[p.CtrlCmd|n.PageUp]}})),I(new b({id:"selectFirstSuggestion",precondition:c.and(t.Visible,c.or(t.MultipleSuggestions,t.HasFocusedSuggestion.negate())),handler:s=>s.selectFirstSuggestion()})),I(new b({id:"focusSuggestion",precondition:c.and(t.Visible,t.HasFocusedSuggestion.negate()),handler:s=>s.focusSuggestion(),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:p.CtrlCmd|n.Space,secondary:[p.CtrlCmd|n.KeyI],mac:{primary:p.WinCtrl|n.Space,secondary:[p.CtrlCmd|n.KeyI]}}})),I(new b({id:"focusAndAcceptSuggestion",precondition:c.and(t.Visible,t.HasFocusedSuggestion.negate()),handler:s=>{s.focusSuggestion(),s.acceptSelectedSuggestion(!0,!1)}})),I(new b({id:"toggleSuggestionDetails",precondition:c.and(t.Visible,t.HasFocusedSuggestion),handler:s=>s.toggleSuggestionDetails(),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:p.CtrlCmd|n.Space,secondary:[p.CtrlCmd|n.KeyI],mac:{primary:p.WinCtrl|n.Space,secondary:[p.CtrlCmd|n.KeyI]}},menuOpts:[{menuId:k,group:"right",order:1,when:c.and(t.DetailsVisible,t.CanResolve),title:E.localize("detail.more","Show Less")},{menuId:k,group:"right",order:1,when:c.and(t.DetailsVisible.toNegated(),t.CanResolve),title:E.localize("detail.less","Show More")}]})),I(new b({id:"toggleExplainMode",precondition:t.Visible,handler:s=>s.toggleExplainMode(),kbOpts:{weight:U.EditorContrib,primary:p.CtrlCmd|n.Slash}})),I(new b({id:"toggleSuggestionFocus",precondition:t.Visible,handler:s=>s.toggleSuggestionFocus(),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:p.CtrlCmd|p.Alt|n.Space,mac:{primary:p.WinCtrl|p.Alt|n.Space}}})),I(new b({id:"insertBestCompletion",precondition:c.and(u.textInputFocus,c.equals("config.editor.tabCompletion","on"),ie.AtEnd,t.Visible.toNegated(),K.OtherSuggestions.toNegated(),W.InSnippetMode.toNegated()),handler:(s,e)=>{s.triggerSuggestAndAcceptBest(Se(e)?{fallback:"tab",...e}:{fallback:"tab"})},kbOpts:{weight:C,primary:n.Tab}})),I(new b({id:"insertNextSuggestion",precondition:c.and(u.textInputFocus,c.equals("config.editor.tabCompletion","on"),K.OtherSuggestions,t.Visible.toNegated(),W.InSnippetMode.toNegated()),handler:s=>s.acceptNextSuggestion(),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:n.Tab}})),I(new b({id:"insertPrevSuggestion",precondition:c.and(u.textInputFocus,c.equals("config.editor.tabCompletion","on"),K.OtherSuggestions,t.Visible.toNegated(),W.InSnippetMode.toNegated()),handler:s=>s.acceptPrevSuggestion(),kbOpts:{weight:C,kbExpr:u.textInputFocus,primary:p.Shift|n.Tab}})),Z(class extends Y{constructor(){super({id:"editor.action.resetSuggestSize",label:E.localize("suggest.reset.label","Reset Suggest Widget Size"),alias:"Reset Suggest Widget Size",precondition:void 0})}run(s,e){D.get(e)?.resetWidgetSize()}});export{D as SuggestController,V as TriggerSuggestAction};
