var w=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var S=(p,l,e,i)=>{for(var o=i>1?void 0:i?D(l,e):l,r=p.length-1,u;r>=0;r--)(u=p[r])&&(o=(i?u(l,e,o):u(o))||o);return i&&o&&w(l,e,o),o},s=(p,l)=>(e,i)=>l(e,i,p);import{createStyleSheetFromObservable as T}from"../../../../../base/browser/domObservable.js";import{alert as V}from"../../../../../base/browser/ui/aria/aria.js";import{timeout as R}from"../../../../../base/common/async.js";import{cancelOnDispose as f}from"../../../../../base/common/cancellation.js";import{readHotReloadableExport as W}from"../../../../../base/common/hotReloadHelpers.js";import{Disposable as F,toDisposable as E}from"../../../../../base/common/lifecycle.js";import{autorun as K,constObservable as L,derived as m,derivedDisposable as y,derivedObservableWithCache as M,mapObservableArrayCached as G,observableFromEvent as a,observableSignal as P,runOnChange as C,runOnChangeWithStore as U,transaction as I,waitForState as H}from"../../../../../base/common/observable.js";import{isUndefined as k}from"../../../../../base/common/types.js";import{localize as z}from"../../../../../nls.js";import{IAccessibilityService as B}from"../../../../../platform/accessibility/common/accessibility.js";import{AccessibilitySignal as N,IAccessibilitySignalService as Z}from"../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";import{ICommandService as $}from"../../../../../platform/commands/common/commands.js";import{IConfigurationService as j}from"../../../../../platform/configuration/common/configuration.js";import{IContextKeyService as q}from"../../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as J}from"../../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as Q}from"../../../../../platform/keybinding/common/keybinding.js";import{CoreEditingCommands as _}from"../../../../browser/coreCommands.js";import"../../../../browser/editorBrowser.js";import{observableCodeEditor as X}from"../../../../browser/observableCodeEditor.js";import{EditorOption as d}from"../../../../common/config/editorOptions.js";import{Position as x}from"../../../../common/core/position.js";import"../../../../common/core/range.js";import{CursorChangeReason as Y}from"../../../../common/cursorEvents.js";import{ILanguageFeatureDebounceService as ee}from"../../../../common/services/languageFeatureDebounce.js";import{ILanguageFeaturesService as ie}from"../../../../common/services/languageFeatures.js";import{InlineCompletionsHintsWidget as te,InlineSuggestionHintsContentWidget as oe}from"../hintsWidget/inlineCompletionsHintsWidget.js";import{InlineCompletionsModel as ne}from"../model/inlineCompletionsModel.js";import{SuggestWidgetAdaptor as re}from"../model/suggestWidgetAdaptor.js";import{convertItemsToStableObservables as se}from"../utils.js";import{GhostTextView as ae}from"../view/ghostTextView.js";import{inlineSuggestCommitId as de}from"./commandIds.js";import{InlineCompletionContextKeys as le}from"./inlineCompletionContextKeys.js";let g=class extends F{constructor(e,i,o,r,u,ce,ge,he,me,pe){super();this.editor=e;this._instantiationService=i;this._contextKeyService=o;this._configurationService=r;this._commandService=u;this._debounceService=ce;this._languageFeaturesService=ge;this._accessibilitySignalService=he;this._keybindingService=me;this._accessibilityService=pe;this._register(new le(this._contextKeyService,this.model)),this._register(C(this._editorObs.onDidType,(t,n)=>{this._enabled.get()&&this.model.get()?.trigger()})),this._register(this._commandService.onDidExecuteCommand(t=>{new Set([_.Tab.id,_.DeleteLeft.id,_.DeleteRight.id,de,"acceptSelectedSuggestion"]).has(t.commandId)&&e.hasTextFocus()&&this._enabled.get()&&this._editorObs.forceUpdate(h=>{this.model.get()?.trigger(h)})})),this._register(C(this._editorObs.selections,(t,n,h)=>{h.some(c=>c.reason===Y.Explicit||c.source==="api")&&this.model.get()?.stop()})),this._register(this.editor.onDidBlurEditorWidget(()=>{this._contextKeyService.getContextKeyValue("accessibleViewIsShown")||this._configurationService.getValue("editor.inlineSuggest.keepOnBlur")||e.getOption(d.inlineSuggest).keepOnBlur||oe.dropDownVisible||I(t=>{this.model.get()?.stop(t)})})),this._register(K(t=>{const n=this.model.read(t)?.state.read(t);n?.suggestItem?n.primaryGhostText.lineCount>=2&&this._suggestWidgetAdaptor.forceRenderingAbove():this._suggestWidgetAdaptor.stopForceRenderingAbove()})),this._register(E(()=>{this._suggestWidgetAdaptor.stopForceRenderingAbove()}));const O=M(this,(t,n)=>{const c=this.model.read(t)?.state.read(t);return this._suggestWidgetSelectedItem.get()?n:c?.inlineCompletion?.semanticId});this._register(U(m(t=>(this._playAccessibilitySignal.read(t),O.read(t),{})),async(t,n,h,c)=>{const b=this.model.get(),v=b?.state.get();if(!v||!b)return;const A=b.textModel.getLineContent(v.primaryGhostText.lineNumber);await R(50,f(c)),await H(this._suggestWidgetSelectedItem,k,()=>!1,f(c)),await this._accessibilitySignalService.playSignal(N.inlineSuggestion),this.editor.getOption(d.screenReaderAnnounceInlineSuggestion)&&this._provideScreenReaderUpdate(v.primaryGhostText.renderForScreenReader(A))})),this._register(new te(this.editor,this.model,this._instantiationService)),this._register(T(m(t=>{const n=this._fontFamily.read(t);return n===""||n==="default"?"":`
.monaco-editor .ghost-text-decoration,
.monaco-editor .ghost-text-decoration-preview,
.monaco-editor .ghost-text {
	font-family: ${n};
}`}))),this._register(this._configurationService.onDidChangeConfiguration(t=>{t.affectsConfiguration("accessibility.verbosity.inlineCompletions")&&this.editor.updateOptions({inlineCompletionsAccessibilityVerbose:this._configurationService.getValue("accessibility.verbosity.inlineCompletions")})})),this.editor.updateOptions({inlineCompletionsAccessibilityVerbose:this._configurationService.getValue("accessibility.verbosity.inlineCompletions")})}static ID="editor.contrib.inlineCompletionsController";static get(e){return e.getContribution(g.ID)}_editorObs=X(this.editor);_positions=m(this,e=>this._editorObs.selections.read(e)?.map(i=>i.getEndPosition())??[new x(1,1)]);_suggestWidgetAdaptor=this._register(new re(this.editor,()=>(this._editorObs.forceUpdate(),this.model.get()?.selectedInlineCompletion.get()?.toSingleTextEdit(void 0)),e=>this._editorObs.forceUpdate(i=>{this.model.get()?.handleSuggestAccepted(e)})));_suggestWidgetSelectedItem=a(this,e=>this._suggestWidgetAdaptor.onDidSelectedItemChange(()=>{this._editorObs.forceUpdate(i=>e(void 0))}),()=>this._suggestWidgetAdaptor.selectedItem);_enabledInConfig=a(this,this.editor.onDidChangeConfiguration,()=>this.editor.getOption(d.inlineSuggest).enabled);_isScreenReaderEnabled=a(this,this._accessibilityService.onDidChangeScreenReaderOptimized,()=>this._accessibilityService.isScreenReaderOptimized());_editorDictationInProgress=a(this,this._contextKeyService.onDidChangeContext,()=>this._contextKeyService.getContext(this.editor.getDomNode()).getValue("editorDictation.inProgress")===!0);_enabled=m(this,e=>this._enabledInConfig.read(e)&&(!this._isScreenReaderEnabled.read(e)||!this._editorDictationInProgress.read(e)));_debounceValue=this._debounceService.for(this._languageFeaturesService.inlineCompletionsProvider,"InlineCompletionsDebounce",{min:50,max:50});model=y(this,e=>{if(this._editorObs.isReadonly.read(e))return;const i=this._editorObs.model.read(e);return i?this._instantiationService.createInstance(ne,i,this._suggestWidgetSelectedItem,this._editorObs.versionId,this._positions,this._debounceValue,a(this.editor.onDidChangeConfiguration,()=>this.editor.getOption(d.suggest).preview),a(this.editor.onDidChangeConfiguration,()=>this.editor.getOption(d.suggest).previewMode),a(this.editor.onDidChangeConfiguration,()=>this.editor.getOption(d.inlineSuggest).mode),this._enabled):void 0}).recomputeInitiallyAndOnChange(this._store);_ghostTexts=m(this,e=>this.model.read(e)?.ghostTexts.read(e)??[]);_stablizedGhostTexts=se(this._ghostTexts,this._store);_ghostTextWidgets=G(this,this._stablizedGhostTexts,(e,i)=>y(o=>this._instantiationService.createInstance(W(ae,o),this.editor,{ghostText:e,minReservedLineCount:L(0),targetTextModel:this.model.map(r=>r?.textModel)})).recomputeInitiallyAndOnChange(i)).recomputeInitiallyAndOnChange(this._store);_playAccessibilitySignal=P(this);_fontFamily=a(this,this.editor.onDidChangeConfiguration,()=>this.editor.getOption(d.inlineSuggest).fontFamily);playAccessibilitySignal(e){this._playAccessibilitySignal.trigger(e)}_provideScreenReaderUpdate(e){const i=this._contextKeyService.getContextKeyValue("accessibleViewIsShown"),o=this._keybindingService.lookupKeybinding("editor.action.accessibleView");let r;!i&&o&&this.editor.getOption(d.inlineCompletionsAccessibilityVerbose)&&(r=z("showAccessibleViewHint","Inspect this in the accessible view ({0})",o.getAriaLabel())),V(r?e+", "+r:e)}shouldShowHoverAt(e){const i=this.model.get()?.primaryGhostText.get();return i?i.parts.some(o=>e.containsPosition(new x(i.lineNumber,o.column))):!1}shouldShowHoverAtViewZone(e){return this._ghostTextWidgets.get()[0]?.get().ownsViewZone(e)??!1}hide(){I(e=>{this.model.get()?.stop(e)})}};g=S([s(1,J),s(2,q),s(3,j),s(4,$),s(5,ee),s(6,ie),s(7,Z),s(8,Q),s(9,B)],g);export{g as InlineCompletionsController};
