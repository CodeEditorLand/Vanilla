var V=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var y=(m,a,e,t)=>{for(var o=t>1?void 0:t?R(a,e):a,n=m.length-1,h;n>=0;n--)(h=m[n])&&(o=(t?h(a,e,o):h(o))||o);return t&&o&&V(a,e,o),o},s=(m,a)=>(e,t)=>a(e,t,m);import{createStyleSheetFromObservable as W}from"../../../../../base/browser/domObservable.js";import{alert as F}from"../../../../../base/browser/ui/aria/aria.js";import{timeout as E}from"../../../../../base/common/async.js";import{cancelOnDispose as I}from"../../../../../base/common/cancellation.js";import{readHotReloadableExport as K}from"../../../../../base/common/hotReloadHelpers.js";import{Disposable as L,toDisposable as M}from"../../../../../base/common/lifecycle.js";import{autorun as C,constObservable as G,derived as b,observableFromEvent as c,observableSignal as P,observableValue as O,transaction as S,waitForState as U}from"../../../../../base/common/observable.js";import"../../../../../base/common/observableInternal/base.js";import{derivedDisposable as x}from"../../../../../base/common/observableInternal/derived.js";import{derivedObservableWithCache as H,mapObservableArrayCached as k,runOnChange as A,runOnChangeWithStore as z}from"../../../../../base/common/observableInternal/utils.js";import{isUndefined as B}from"../../../../../base/common/types.js";import{localize as N}from"../../../../../nls.js";import{IAccessibilityService as Z}from"../../../../../platform/accessibility/common/accessibility.js";import{AccessibilitySignal as $,IAccessibilitySignalService as j}from"../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";import{ICommandService as q}from"../../../../../platform/commands/common/commands.js";import{IConfigurationService as J}from"../../../../../platform/configuration/common/configuration.js";import{IContextKeyService as Q}from"../../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as X}from"../../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as Y}from"../../../../../platform/keybinding/common/keybinding.js";import{CoreEditingCommands as f}from"../../../../browser/coreCommands.js";import"../../../../browser/editorBrowser.js";import{observableCodeEditor as ee}from"../../../../browser/observableCodeEditor.js";import{EditorOption as g}from"../../../../common/config/editorOptions.js";import{Position as w}from"../../../../common/core/position.js";import"../../../../common/core/range.js";import{CursorChangeReason as te}from"../../../../common/cursorEvents.js";import{ILanguageFeatureDebounceService as ie}from"../../../../common/services/languageFeatureDebounce.js";import{ILanguageFeaturesService as oe}from"../../../../common/services/languageFeatures.js";import{InlineCompletionsHintsWidget as ne,InlineSuggestionHintsContentWidget as re}from"../hintsWidget/inlineCompletionsHintsWidget.js";import{InlineCompletionsModel as se}from"../model/inlineCompletionsModel.js";import{SuggestWidgetAdaptor as ae}from"../model/suggestWidgetAdaptor.js";import{GhostTextView as de}from"../view/ghostTextView.js";import{inlineSuggestCommitId as le}from"./commandIds.js";import{InlineCompletionContextKeys as ce}from"./inlineCompletionContextKeys.js";let p=class extends L{constructor(e,t,o,n,h,d,_,he,me,pe){super();this.editor=e;this._instantiationService=t;this._contextKeyService=o;this._configurationService=n;this._commandService=h;this._debounceService=d;this._languageFeaturesService=_;this._accessibilitySignalService=he;this._keybindingService=me;this._accessibilityService=pe;this._register(new ce(this._contextKeyService,this.model)),this._register(A(this._editorObs.onDidType,(i,r)=>{this._enabled.get()&&this.model.get()?.trigger()})),this._register(this._commandService.onDidExecuteCommand(i=>{new Set([f.Tab.id,f.DeleteLeft.id,f.DeleteRight.id,le,"acceptSelectedSuggestion"]).has(i.commandId)&&e.hasTextFocus()&&this._enabled.get()&&this._editorObs.forceUpdate(l=>{this.model.get()?.trigger(l)})})),this._register(A(this._editorObs.selections,(i,r)=>{r.some(l=>l.reason===te.Explicit||l.source==="api")&&this.model.get()?.stop()})),this._register(this.editor.onDidBlurEditorWidget(()=>{this._contextKeyService.getContextKeyValue("accessibleViewIsShown")||this._configurationService.getValue("editor.inlineSuggest.keepOnBlur")||e.getOption(g.inlineSuggest).keepOnBlur||re.dropDownVisible||S(i=>{this.model.get()?.stop(i)})})),this._register(C(i=>{const r=this.model.read(i)?.state.read(i);r?.suggestItem?r.primaryGhostText.lineCount>=2&&this._suggestWidgetAdaptor.forceRenderingAbove():this._suggestWidgetAdaptor.stopForceRenderingAbove()})),this._register(M(()=>{this._suggestWidgetAdaptor.stopForceRenderingAbove()}));const D=H(this,(i,r)=>{const u=this.model.read(i)?.state.read(i);return this._suggestWidgetSelectedItem.get()?r:u?.inlineCompletion?.semanticId});this._register(z(b(i=>(this._playAccessibilitySignal.read(i),D.read(i),{})),async(i,r,l)=>{const u=this.model.get(),v=u?.state.get();if(!v||!u)return;const T=u.textModel.getLineContent(v.primaryGhostText.lineNumber);await E(50,I(l)),await U(this._suggestWidgetSelectedItem,B,()=>!1,I(l)),await this._accessibilitySignalService.playSignal($.inlineSuggestion),this.editor.getOption(g.screenReaderAnnounceInlineSuggestion)&&this._provideScreenReaderUpdate(v.primaryGhostText.renderForScreenReader(T))})),this._register(new ne(this.editor,this.model,this._instantiationService)),this._register(W(b(i=>{const r=this._fontFamily.read(i);return r===""||r==="default"?"":`
.monaco-editor .ghost-text-decoration,
.monaco-editor .ghost-text-decoration-preview,
.monaco-editor .ghost-text {
	font-family: ${r};
}`}))),this._register(this._configurationService.onDidChangeConfiguration(i=>{i.affectsConfiguration("accessibility.verbosity.inlineCompletions")&&this.editor.updateOptions({inlineCompletionsAccessibilityVerbose:this._configurationService.getValue("accessibility.verbosity.inlineCompletions")})})),this.editor.updateOptions({inlineCompletionsAccessibilityVerbose:this._configurationService.getValue("accessibility.verbosity.inlineCompletions")})}static ID="editor.contrib.inlineCompletionsController";static get(e){return e.getContribution(p.ID)}_editorObs=ee(this.editor);_positions=b(this,e=>this._editorObs.selections.read(e)?.map(t=>t.getEndPosition())??[new w(1,1)]);_suggestWidgetAdaptor=this._register(new ae(this.editor,()=>(this._editorObs.forceUpdate(),this.model.get()?.selectedInlineCompletion.get()?.toSingleTextEdit(void 0)),e=>this._editorObs.forceUpdate(t=>{this.model.get()?.handleSuggestAccepted(e)})));_suggestWidgetSelectedItem=c(this,e=>this._suggestWidgetAdaptor.onDidSelectedItemChange(()=>{this._editorObs.forceUpdate(t=>e(void 0))}),()=>this._suggestWidgetAdaptor.selectedItem);_enabledInConfig=c(this,this.editor.onDidChangeConfiguration,()=>this.editor.getOption(g.inlineSuggest).enabled);_isScreenReaderEnabled=c(this,this._accessibilityService.onDidChangeScreenReaderOptimized,()=>this._accessibilityService.isScreenReaderOptimized());_editorDictationInProgress=c(this,this._contextKeyService.onDidChangeContext,()=>this._contextKeyService.getContext(this.editor.getDomNode()).getValue("editorDictation.inProgress")===!0);_enabled=b(this,e=>this._enabledInConfig.read(e)&&(!this._isScreenReaderEnabled.read(e)||!this._editorDictationInProgress.read(e)));_debounceValue=this._debounceService.for(this._languageFeaturesService.inlineCompletionsProvider,"InlineCompletionsDebounce",{min:50,max:50});model=x(this,e=>{if(this._editorObs.isReadonly.read(e))return;const t=this._editorObs.model.read(e);return t?this._instantiationService.createInstance(se,t,this._suggestWidgetSelectedItem,this._editorObs.versionId,this._positions,this._debounceValue,c(this.editor.onDidChangeConfiguration,()=>this.editor.getOption(g.suggest).preview),c(this.editor.onDidChangeConfiguration,()=>this.editor.getOption(g.suggest).previewMode),c(this.editor.onDidChangeConfiguration,()=>this.editor.getOption(g.inlineSuggest).mode),this._enabled):void 0}).recomputeInitiallyAndOnChange(this._store);_ghostTexts=b(this,e=>this.model.read(e)?.ghostTexts.read(e)??[]);_stablizedGhostTexts=ge(this._ghostTexts,this._store);_ghostTextWidgets=k(this,this._stablizedGhostTexts,(e,t)=>x(o=>this._instantiationService.createInstance(K(de,o),this.editor,{ghostText:e,minReservedLineCount:G(0),targetTextModel:this.model.map(n=>n?.textModel)})).recomputeInitiallyAndOnChange(t)).recomputeInitiallyAndOnChange(this._store);_playAccessibilitySignal=P(this);_fontFamily=c(this,this.editor.onDidChangeConfiguration,()=>this.editor.getOption(g.inlineSuggest).fontFamily);playAccessibilitySignal(e){this._playAccessibilitySignal.trigger(e)}_provideScreenReaderUpdate(e){const t=this._contextKeyService.getContextKeyValue("accessibleViewIsShown"),o=this._keybindingService.lookupKeybinding("editor.action.accessibleView");let n;!t&&o&&this.editor.getOption(g.inlineCompletionsAccessibilityVerbose)&&(n=N("showAccessibleViewHint","Inspect this in the accessible view ({0})",o.getAriaLabel())),F(n?e+", "+n:e)}shouldShowHoverAt(e){const t=this.model.get()?.primaryGhostText.get();return t?t.parts.some(o=>e.containsPosition(new w(t.lineNumber,o.column))):!1}shouldShowHoverAtViewZone(e){return this._ghostTextWidgets.get()[0]?.get().ownsViewZone(e)??!1}hide(){S(e=>{this.model.get()?.stop(e)})}};p=y([s(1,X),s(2,Q),s(3,J),s(4,q),s(5,ie),s(6,oe),s(7,j),s(8,Y),s(9,Z)],p);function ge(m,a){const e=O("result",[]),t=[];return a.add(C(o=>{const n=m.read(o);S(h=>{if(n.length!==t.length){t.length=n.length;for(let d=0;d<t.length;d++)t[d]||(t[d]=O("item",n[d]));e.set([...t],h)}t.forEach((d,_)=>d.set(n[_],h))})})),e}export{p as InlineCompletionsController};
