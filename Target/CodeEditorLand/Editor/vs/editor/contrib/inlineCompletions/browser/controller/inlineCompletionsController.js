var D=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var y=(m,a,e,t)=>{for(var o=t>1?void 0:t?V(a,e):a,r=m.length-1,h;r>=0;r--)(h=m[r])&&(o=(t?h(a,e,o):h(o))||o);return t&&o&&D(a,e,o),o},s=(m,a)=>(e,t)=>a(e,t,m);import{createStyleSheetFromObservable as W}from"../../../../../../vs/base/browser/domObservable.js";import{alert as F}from"../../../../../../vs/base/browser/ui/aria/aria.js";import{timeout as R}from"../../../../../../vs/base/common/async.js";import{cancelOnDispose as I}from"../../../../../../vs/base/common/cancellation.js";import{Disposable as E,toDisposable as K}from"../../../../../../vs/base/common/lifecycle.js";import{autorun as C,constObservable as L,derived as b,observableFromEvent as c,observableSignal as M,observableValue as x,transaction as S,waitForState as G}from"../../../../../../vs/base/common/observable.js";import"../../../../../../vs/base/common/observableInternal/base.js";import{derivedDisposable as P}from"../../../../../../vs/base/common/observableInternal/derived.js";import{derivedObservableWithCache as U,mapObservableArrayCached as k}from"../../../../../../vs/base/common/observableInternal/utils.js";import{isUndefined as z}from"../../../../../../vs/base/common/types.js";import{CoreEditingCommands as _}from"../../../../../../vs/editor/browser/coreCommands.js";import"../../../../../../vs/editor/browser/editorBrowser.js";import{observableCodeEditor as H,reactToChange as O,reactToChangeWithStore as B}from"../../../../../../vs/editor/browser/observableCodeEditor.js";import{EditorOption as g}from"../../../../../../vs/editor/common/config/editorOptions.js";import{Position as w}from"../../../../../../vs/editor/common/core/position.js";import"../../../../../../vs/editor/common/core/range.js";import{CursorChangeReason as N}from"../../../../../../vs/editor/common/cursorEvents.js";import{ILanguageFeatureDebounceService as Z}from"../../../../../../vs/editor/common/services/languageFeatureDebounce.js";import{ILanguageFeaturesService as $}from"../../../../../../vs/editor/common/services/languageFeatures.js";import{inlineSuggestCommitId as j}from"../../../../../../vs/editor/contrib/inlineCompletions/browser/controller/commandIds.js";import{InlineCompletionContextKeys as q}from"../../../../../../vs/editor/contrib/inlineCompletions/browser/controller/inlineCompletionContextKeys.js";import{InlineCompletionsHintsWidget as J,InlineSuggestionHintsContentWidget as Q}from"../../../../../../vs/editor/contrib/inlineCompletions/browser/hintsWidget/inlineCompletionsHintsWidget.js";import{InlineCompletionsModel as X}from"../../../../../../vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsModel.js";import{SuggestWidgetAdaptor as Y}from"../../../../../../vs/editor/contrib/inlineCompletions/browser/model/suggestWidgetAdaptor.js";import{GhostTextView as ee}from"../../../../../../vs/editor/contrib/inlineCompletions/browser/view/ghostTextView.js";import{localize as te}from"../../../../../../vs/nls.js";import{IAccessibilityService as ie}from"../../../../../../vs/platform/accessibility/common/accessibility.js";import{AccessibilitySignal as oe,IAccessibilitySignalService as re}from"../../../../../../vs/platform/accessibilitySignal/browser/accessibilitySignalService.js";import{ICommandService as ne}from"../../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as se}from"../../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as ae}from"../../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as de}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as le}from"../../../../../../vs/platform/keybinding/common/keybinding.js";let p=class extends E{constructor(e,t,o,r,h,d,f,ge,he,me){super();this.editor=e;this._instantiationService=t;this._contextKeyService=o;this._configurationService=r;this._commandService=h;this._debounceService=d;this._languageFeaturesService=f;this._accessibilitySignalService=ge;this._keybindingService=he;this._accessibilityService=me;this._register(new q(this._contextKeyService,this.model)),this._register(O(this._editorObs.onDidType,(i,n)=>{this._enabled.get()&&this.model.get()?.trigger()})),this._register(this._commandService.onDidExecuteCommand(i=>{new Set([_.Tab.id,_.DeleteLeft.id,_.DeleteRight.id,j,"acceptSelectedSuggestion"]).has(i.commandId)&&e.hasTextFocus()&&this._enabled.get()&&this._editorObs.forceUpdate(l=>{this.model.get()?.trigger(l)})})),this._register(O(this._editorObs.selections,(i,n)=>{n.some(l=>l.reason===N.Explicit||l.source==="api")&&this.model.get()?.stop()})),this._register(this.editor.onDidBlurEditorWidget(()=>{this._contextKeyService.getContextKeyValue("accessibleViewIsShown")||this._configurationService.getValue("editor.inlineSuggest.keepOnBlur")||e.getOption(g.inlineSuggest).keepOnBlur||Q.dropDownVisible||S(i=>{this.model.get()?.stop(i)})})),this._register(C(i=>{const n=this.model.read(i)?.state.read(i);n?.suggestItem?n.primaryGhostText.lineCount>=2&&this._suggestWidgetAdaptor.forceRenderingAbove():this._suggestWidgetAdaptor.stopForceRenderingAbove()})),this._register(K(()=>{this._suggestWidgetAdaptor.stopForceRenderingAbove()}));const A=U(this,(i,n)=>{const u=this.model.read(i)?.state.read(i);return this._suggestWidgetSelectedItem.get()?n:u?.inlineCompletion?.semanticId});this._register(B(b(i=>(this._playAccessibilitySignal.read(i),A.read(i),{})),async(i,n,l)=>{const u=this.model.get(),v=u?.state.get();if(!v||!u)return;const T=u.textModel.getLineContent(v.primaryGhostText.lineNumber);await R(50,I(l)),await G(this._suggestWidgetSelectedItem,z,()=>!1,I(l)),await this._accessibilitySignalService.playSignal(oe.inlineSuggestion),this.editor.getOption(g.screenReaderAnnounceInlineSuggestion)&&this._provideScreenReaderUpdate(v.primaryGhostText.renderForScreenReader(T))})),this._register(new J(this.editor,this.model,this._instantiationService)),this._register(W(b(i=>{const n=this._fontFamily.read(i);return n===""||n==="default"?"":`
.monaco-editor .ghost-text-decoration,
.monaco-editor .ghost-text-decoration-preview,
.monaco-editor .ghost-text {
	font-family: ${n};
}`}))),this._register(this._configurationService.onDidChangeConfiguration(i=>{i.affectsConfiguration("accessibility.verbosity.inlineCompletions")&&this.editor.updateOptions({inlineCompletionsAccessibilityVerbose:this._configurationService.getValue("accessibility.verbosity.inlineCompletions")})})),this.editor.updateOptions({inlineCompletionsAccessibilityVerbose:this._configurationService.getValue("accessibility.verbosity.inlineCompletions")})}static ID="editor.contrib.inlineCompletionsController";static get(e){return e.getContribution(p.ID)}_editorObs=H(this.editor);_positions=b(this,e=>this._editorObs.selections.read(e)?.map(t=>t.getEndPosition())??[new w(1,1)]);_suggestWidgetAdaptor=this._register(new Y(this.editor,()=>(this._editorObs.forceUpdate(),this.model.get()?.selectedInlineCompletion.get()?.toSingleTextEdit(void 0)),e=>this._editorObs.forceUpdate(t=>{this.model.get()?.handleSuggestAccepted(e)})));_suggestWidgetSelectedItem=c(this,e=>this._suggestWidgetAdaptor.onDidSelectedItemChange(()=>{this._editorObs.forceUpdate(t=>e(void 0))}),()=>this._suggestWidgetAdaptor.selectedItem);_enabledInConfig=c(this,this.editor.onDidChangeConfiguration,()=>this.editor.getOption(g.inlineSuggest).enabled);_isScreenReaderEnabled=c(this,this._accessibilityService.onDidChangeScreenReaderOptimized,()=>this._accessibilityService.isScreenReaderOptimized());_editorDictationInProgress=c(this,this._contextKeyService.onDidChangeContext,()=>this._contextKeyService.getContext(this.editor.getDomNode()).getValue("editorDictation.inProgress")===!0);_enabled=b(this,e=>this._enabledInConfig.read(e)&&(!this._isScreenReaderEnabled.read(e)||!this._editorDictationInProgress.read(e)));_debounceValue=this._debounceService.for(this._languageFeaturesService.inlineCompletionsProvider,"InlineCompletionsDebounce",{min:50,max:50});model=P(this,e=>{if(this._editorObs.isReadonly.read(e))return;const t=this._editorObs.model.read(e);return t?this._instantiationService.createInstance(X,t,this._suggestWidgetSelectedItem,this._editorObs.versionId,this._positions,this._debounceValue,c(this.editor.onDidChangeConfiguration,()=>this.editor.getOption(g.suggest).preview),c(this.editor.onDidChangeConfiguration,()=>this.editor.getOption(g.suggest).previewMode),c(this.editor.onDidChangeConfiguration,()=>this.editor.getOption(g.inlineSuggest).mode),this._enabled):void 0}).recomputeInitiallyAndOnChange(this._store);_ghostTexts=b(this,e=>this.model.read(e)?.ghostTexts.read(e)??[]);_stablizedGhostTexts=ce(this._ghostTexts,this._store);_ghostTextWidgets=k(this,this._stablizedGhostTexts,(e,t)=>t.add(this._instantiationService.createInstance(ee,this.editor,{ghostText:e,minReservedLineCount:L(0),targetTextModel:this.model.map(o=>o?.textModel)}))).recomputeInitiallyAndOnChange(this._store);_playAccessibilitySignal=M(this);_fontFamily=c(this,this.editor.onDidChangeConfiguration,()=>this.editor.getOption(g.inlineSuggest).fontFamily);playAccessibilitySignal(e){this._playAccessibilitySignal.trigger(e)}_provideScreenReaderUpdate(e){const t=this._contextKeyService.getContextKeyValue("accessibleViewIsShown"),o=this._keybindingService.lookupKeybinding("editor.action.accessibleView");let r;!t&&o&&this.editor.getOption(g.inlineCompletionsAccessibilityVerbose)&&(r=te("showAccessibleViewHint","Inspect this in the accessible view ({0})",o.getAriaLabel())),F(r?e+", "+r:e)}shouldShowHoverAt(e){const t=this.model.get()?.primaryGhostText.get();return t?t.parts.some(o=>e.containsPosition(new w(t.lineNumber,o.column))):!1}shouldShowHoverAtViewZone(e){return this._ghostTextWidgets.get()[0]?.ownsViewZone(e)??!1}hide(){S(e=>{this.model.get()?.stop(e)})}};p=y([s(1,de),s(2,ae),s(3,se),s(4,ne),s(5,Z),s(6,$),s(7,re),s(8,le),s(9,ie)],p);function ce(m,a){const e=x("result",[]),t=[];return a.add(C(o=>{const r=m.read(o);S(h=>{if(r.length!==t.length){t.length=r.length;for(let d=0;d<t.length;d++)t[d]||(t[d]=x("item",r[d]));e.set([...t],h)}t.forEach((d,f)=>d.set(r[f],h))})})),e}export{p as InlineCompletionsController};
