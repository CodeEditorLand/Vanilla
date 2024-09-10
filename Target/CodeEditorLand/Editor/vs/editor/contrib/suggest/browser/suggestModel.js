var K=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var M=(d,e,t,o)=>{for(var i=o>1?void 0:o?A(e,t):e,n=d.length-1,s;n>=0;n--)(s=d[n])&&(i=(o?s(e,t,i):s(i))||i);return o&&i&&K(e,t,i),i},g=(d,e)=>(t,o)=>e(t,o,d);import{TimeoutTimer as W}from"../../../../base/common/async.js";import{CancellationTokenSource as N}from"../../../../base/common/cancellation.js";import{onUnexpectedError as z}from"../../../../base/common/errors.js";import{Emitter as T}from"../../../../base/common/event.js";import{DisposableStore as w,dispose as x}from"../../../../base/common/lifecycle.js";import{getLeadingWhitespace as k,isHighSurrogate as B,isLowSurrogate as q}from"../../../../base/common/strings.js";import{EditorOption as a}from"../../../common/config/editorOptions.js";import{CursorChangeReason as f}from"../../../common/cursorEvents.js";import{Selection as Q}from"../../../common/core/selection.js";import{CompletionItemKind as r,CompletionTriggerKind as _}from"../../../common/languages.js";import{IEditorWorkerService as V}from"../../../common/services/editorWorker.js";import{WordDistance as R}from"./wordDistance.js";import{IClipboardService as U}from"../../../../platform/clipboard/common/clipboardService.js";import{IConfigurationService as j}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as G}from"../../../../platform/contextkey/common/contextkey.js";import{ILogService as H}from"../../../../platform/log/common/log.js";import{ITelemetryService as J}from"../../../../platform/telemetry/common/telemetry.js";import{CompletionModel as $}from"./completionModel.js";import{CompletionOptions as X,getSnippetSuggestSupport as Y,provideSuggestionItems as Z,QuickSuggestionsOptions as C,SnippetSortOrder as b}from"./suggest.js";import{ILanguageFeaturesService as ee}from"../../../common/services/languageFeatures.js";import{FuzzyScoreOptions as te}from"../../../../base/common/filters.js";import{assertType as E}from"../../../../base/common/types.js";import{InlineCompletionContextKeys as D}from"../../inlineCompletions/browser/controller/inlineCompletionContextKeys.js";import{SnippetController2 as ie}from"../../snippet/browser/snippetController2.js";import{IEnvironmentService as oe}from"../../../../platform/environment/common/environment.js";class l{static shouldAutoTrigger(e){if(!e.hasModel())return!1;const t=e.getModel(),o=e.getPosition();t.tokenization.tokenizeIfCheap(o.lineNumber);const i=t.getWordAtPosition(o);return!(!i||i.endColumn!==o.column&&i.startColumn+1!==o.column||!isNaN(Number(i.word)))}lineNumber;column;leadingLineContent;leadingWord;triggerOptions;constructor(e,t,o){this.leadingLineContent=e.getLineContent(t.lineNumber).substr(0,t.column-1),this.leadingWord=e.getWordUntilPosition(t),this.lineNumber=t.lineNumber,this.column=t.column,this.triggerOptions=o}}var re=(o=>(o[o.Idle=0]="Idle",o[o.Manual=1]="Manual",o[o.Auto=2]="Auto",o))(re||{});function ne(d,e,t){if(!e.getContextKeyValue(D.inlineSuggestionVisible.key))return!0;const o=e.getContextKeyValue(D.suppressSuggestions.key);return o!==void 0?!o:!d.getOption(a.inlineSuggest).suppressSuggestions}function se(d,e,t){if(!e.getContextKeyValue("inlineSuggestionVisible"))return!0;const o=e.getContextKeyValue(D.suppressSuggestions.key);return o!==void 0?!o:!d.getOption(a.inlineSuggest).suppressSuggestions}let h=class{constructor(e,t,o,i,n,s,c,m,O){this._editor=e;this._editorWorkerService=t;this._clipboardService=o;this._telemetryService=i;this._logService=n;this._contextKeyService=s;this._configurationService=c;this._languageFeaturesService=m;this._envService=O;this._currentSelection=this._editor.getSelection()||new Q(1,1,1,1),this._toDispose.add(this._editor.onDidChangeModel(()=>{this._updateTriggerCharacters(),this.cancel()})),this._toDispose.add(this._editor.onDidChangeModelLanguage(()=>{this._updateTriggerCharacters(),this.cancel()})),this._toDispose.add(this._editor.onDidChangeConfiguration(()=>{this._updateTriggerCharacters()})),this._toDispose.add(this._languageFeaturesService.completionProvider.onDidChange(()=>{this._updateTriggerCharacters(),this._updateActiveSuggestSession()}));let u=!1;this._toDispose.add(this._editor.onDidCompositionStart(()=>{u=!0})),this._toDispose.add(this._editor.onDidCompositionEnd(()=>{u=!1,this._onCompositionEnd()})),this._toDispose.add(this._editor.onDidChangeCursorSelection(S=>{u||this._onCursorChange(S)})),this._toDispose.add(this._editor.onDidChangeModelContent(()=>{!u&&this._triggerState!==void 0&&this._refilterCompletionItems()})),this._updateTriggerCharacters()}_toDispose=new w;_triggerCharacterListener=new w;_triggerQuickSuggest=new W;_triggerState=void 0;_requestToken;_context;_currentSelection;_completionModel;_completionDisposables=new w;_onDidCancel=new T;_onDidTrigger=new T;_onDidSuggest=new T;onDidCancel=this._onDidCancel.event;onDidTrigger=this._onDidTrigger.event;onDidSuggest=this._onDidSuggest.event;dispose(){x(this._triggerCharacterListener),x([this._onDidCancel,this._onDidSuggest,this._onDidTrigger,this._triggerQuickSuggest]),this._toDispose.dispose(),this._completionDisposables.dispose(),this.cancel()}_updateTriggerCharacters(){if(this._triggerCharacterListener.clear(),this._editor.getOption(a.readOnly)||!this._editor.hasModel()||!this._editor.getOption(a.suggestOnTriggerCharacters))return;const e=new Map;for(const o of this._languageFeaturesService.completionProvider.all(this._editor.getModel()))for(const i of o.triggerCharacters||[]){let n=e.get(i);if(!n){n=new Set;const s=Y();s&&n.add(s),e.set(i,n)}n.add(o)}const t=o=>{if(!se(this._editor,this._contextKeyService,this._configurationService)||l.shouldAutoTrigger(this._editor))return;if(!o){const s=this._editor.getPosition();o=this._editor.getModel().getLineContent(s.lineNumber).substr(0,s.column-1)}let i="";q(o.charCodeAt(o.length-1))?B(o.charCodeAt(o.length-2))&&(i=o.substr(o.length-2)):i=o.charAt(o.length-1);const n=e.get(i);if(n){const s=new Map;if(this._completionModel)for(const[c,m]of this._completionModel.getItemsByProvider())n.has(c)||s.set(c,m);this.trigger({auto:!0,triggerKind:_.TriggerCharacter,triggerCharacter:i,retrigger:!!this._completionModel,clipboardText:this._completionModel?.clipboardText,completionOptions:{providerFilter:n,providerItemsToReuse:s}})}};this._triggerCharacterListener.add(this._editor.onDidType(t)),this._triggerCharacterListener.add(this._editor.onDidCompositionEnd(()=>t()))}get state(){return this._triggerState?this._triggerState.auto?2:1:0}cancel(e=!1){this._triggerState!==void 0&&(this._triggerQuickSuggest.cancel(),this._requestToken?.cancel(),this._requestToken=void 0,this._triggerState=void 0,this._completionModel=void 0,this._context=void 0,this._onDidCancel.fire({retrigger:e}))}clear(){this._completionDisposables.clear()}_updateActiveSuggestSession(){this._triggerState!==void 0&&(!this._editor.hasModel()||!this._languageFeaturesService.completionProvider.has(this._editor.getModel())?this.cancel():this.trigger({auto:this._triggerState.auto,retrigger:!0}))}_onCursorChange(e){if(!this._editor.hasModel())return;const t=this._currentSelection;if(this._currentSelection=this._editor.getSelection(),!e.selection.isEmpty()||e.reason!==f.NotSet&&e.reason!==f.Explicit||e.source!=="keyboard"&&e.source!=="deleteLeft"){this.cancel();return}this._triggerState===void 0&&e.reason===f.NotSet?(t.containsRange(this._currentSelection)||t.getEndPosition().isBeforeOrEqual(this._currentSelection.getPosition()))&&this._doTriggerQuickSuggest():this._triggerState!==void 0&&e.reason===f.Explicit&&this._refilterCompletionItems()}_onCompositionEnd(){this._triggerState===void 0?this._doTriggerQuickSuggest():this._refilterCompletionItems()}_doTriggerQuickSuggest(){C.isAllOff(this._editor.getOption(a.quickSuggestions))||this._editor.getOption(a.suggest).snippetsPreventQuickSuggestions&&ie.get(this._editor)?.isInSnippet()||(this.cancel(),this._triggerQuickSuggest.cancelAndSet(()=>{if(this._triggerState!==void 0||!l.shouldAutoTrigger(this._editor)||!this._editor.hasModel()||!this._editor.hasWidgetFocus())return;const e=this._editor.getModel(),t=this._editor.getPosition(),o=this._editor.getOption(a.quickSuggestions);if(!C.isAllOff(o)){if(!C.isAllOn(o)){e.tokenization.tokenizeIfCheap(t.lineNumber);const i=e.tokenization.getLineTokens(t.lineNumber),n=i.getStandardTokenType(i.findTokenIndexAtOffset(Math.max(t.column-1-1,0)));if(C.valueFor(o,n)!=="on")return}ne(this._editor,this._contextKeyService,this._configurationService)&&this._languageFeaturesService.completionProvider.has(e)&&this.trigger({auto:!0})}},this._editor.getOption(a.quickSuggestionsDelay)))}_refilterCompletionItems(){E(this._editor.hasModel()),E(this._triggerState!==void 0);const e=this._editor.getModel(),t=this._editor.getPosition(),o=new l(e,t,{...this._triggerState,refilter:!0});this._onNewContext(o)}trigger(e){if(!this._editor.hasModel())return;const t=this._editor.getModel(),o=new l(t,this._editor.getPosition(),e);this.cancel(e.retrigger),this._triggerState=e,this._onDidTrigger.fire({auto:e.auto,shy:e.shy??!1,position:this._editor.getPosition()}),this._context=o;let i={triggerKind:e.triggerKind??_.Invoke};e.triggerCharacter&&(i={triggerKind:_.TriggerCharacter,triggerCharacter:e.triggerCharacter}),this._requestToken=new N;const n=this._editor.getOption(a.snippetSuggestions);let s=b.Inline;switch(n){case"top":s=b.Top;break;case"bottom":s=b.Bottom;break}const{itemKind:c,showDeprecated:m}=h.createSuggestFilter(this._editor),O=new X(s,e.completionOptions?.kindFilter??c,e.completionOptions?.providerFilter,e.completionOptions?.providerItemsToReuse,m),u=R.create(this._editorWorkerService,this._editor),S=Z(this._languageFeaturesService.completionProvider,t,this._editor.getPosition(),O,i,this._requestToken.token);Promise.all([S,u]).then(async([p,P])=>{if(this._requestToken?.dispose(),!this._editor.hasModel())return;let v=e?.clipboardText;if(!v&&p.needsClipboard&&(v=await this._clipboardService.readText()),this._triggerState===void 0)return;const F=this._editor.getModel(),y=new l(F,this._editor.getPosition(),e),L={...te.default,firstMatchCanBeWeak:!this._editor.getOption(a.suggest).matchOnWordStartOnly};if(this._completionModel=new $(p.items,this._context.column,{leadingLineContent:y.leadingLineContent,characterCountDelta:y.column-this._context.column},P,this._editor.getOption(a.suggest),this._editor.getOption(a.snippetSuggestions),L,v),this._completionDisposables.add(p.disposable),this._onNewContext(y),this._reportDurationsTelemetry(p.durations),!this._envService.isBuilt||this._envService.isExtensionDevelopment)for(const I of p.items)I.isInvalid&&this._logService.warn(`[suggest] did IGNORE invalid completion item from ${I.provider._debugDisplayName}`,I.completion)}).catch(z)}_telemetryGate=0;_reportDurationsTelemetry(e){this._telemetryGate++%230===0&&setTimeout(()=>{this._telemetryService.publicLog2("suggest.durations.json",{data:JSON.stringify(e)}),this._logService.debug("suggest.durations.json",e)})}static createSuggestFilter(e){const t=new Set;e.getOption(a.snippetSuggestions)==="none"&&t.add(r.Snippet);const i=e.getOption(a.suggest);return i.showMethods||t.add(r.Method),i.showFunctions||t.add(r.Function),i.showConstructors||t.add(r.Constructor),i.showFields||t.add(r.Field),i.showVariables||t.add(r.Variable),i.showClasses||t.add(r.Class),i.showStructs||t.add(r.Struct),i.showInterfaces||t.add(r.Interface),i.showModules||t.add(r.Module),i.showProperties||t.add(r.Property),i.showEvents||t.add(r.Event),i.showOperators||t.add(r.Operator),i.showUnits||t.add(r.Unit),i.showValues||t.add(r.Value),i.showConstants||t.add(r.Constant),i.showEnums||t.add(r.Enum),i.showEnumMembers||t.add(r.EnumMember),i.showKeywords||t.add(r.Keyword),i.showWords||t.add(r.Text),i.showColors||t.add(r.Color),i.showFiles||t.add(r.File),i.showReferences||t.add(r.Reference),i.showColors||t.add(r.Customcolor),i.showFolders||t.add(r.Folder),i.showTypeParameters||t.add(r.TypeParameter),i.showSnippets||t.add(r.Snippet),i.showUsers||t.add(r.User),i.showIssues||t.add(r.Issue),{itemKind:t,showDeprecated:i.showDeprecated}}_onNewContext(e){if(this._context){if(e.lineNumber!==this._context.lineNumber){this.cancel();return}if(k(e.leadingLineContent)!==k(this._context.leadingLineContent)){this.cancel();return}if(e.column<this._context.column){e.leadingWord.word?this.trigger({auto:this._context.triggerOptions.auto,retrigger:!0}):this.cancel();return}if(this._completionModel){if(e.leadingWord.word.length!==0&&e.leadingWord.startColumn>this._context.leadingWord.startColumn){if(l.shouldAutoTrigger(this._editor)&&this._context){const o=this._completionModel.getItemsByProvider();this.trigger({auto:this._context.triggerOptions.auto,retrigger:!0,clipboardText:this._completionModel.clipboardText,completionOptions:{providerItemsToReuse:o}})}return}if(e.column>this._context.column&&this._completionModel.getIncompleteProvider().size>0&&e.leadingWord.word.length!==0){const t=new Map,o=new Set;for(const[i,n]of this._completionModel.getItemsByProvider())n.length>0&&n[0].container.incomplete?o.add(i):t.set(i,n);this.trigger({auto:this._context.triggerOptions.auto,triggerKind:_.TriggerForIncompleteCompletions,retrigger:!0,clipboardText:this._completionModel.clipboardText,completionOptions:{providerFilter:o,providerItemsToReuse:t}})}else{const t=this._completionModel.lineContext;let o=!1;if(this._completionModel.lineContext={leadingLineContent:e.leadingLineContent,characterCountDelta:e.column-this._context.column},this._completionModel.items.length===0){const i=l.shouldAutoTrigger(this._editor);if(!this._context){this.cancel();return}if(i&&this._context.leadingWord.endColumn<e.leadingWord.startColumn){this.trigger({auto:this._context.triggerOptions.auto,retrigger:!0});return}if(this._context.triggerOptions.auto){this.cancel();return}else if(this._completionModel.lineContext=t,o=this._completionModel.items.length>0,o&&e.leadingWord.word.length===0){this.cancel();return}}this._onDidSuggest.fire({completionModel:this._completionModel,triggerOptions:e.triggerOptions,isFrozen:o})}}}}};h=M([g(1,V),g(2,U),g(3,J),g(4,H),g(5,G),g(6,j),g(7,ee),g(8,oe)],h);export{l as LineContext,re as State,h as SuggestModel};
