var K=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var b=(a,n,e,i)=>{for(var t=i>1?void 0:i?A(n,e):n,o=a.length-1,d;o>=0;o--)(d=a[o])&&(t=(i?d(n,e,t):d(t))||t);return i&&t&&K(n,e,t),t},l=(a,n)=>(e,i)=>n(e,i,a);import"./editorDictation.css";import{localize as I,localize2 as h}from"../../../../../nls.js";import"../../../../../base/browser/dom.js";import{CancellationTokenSource as W}from"../../../../../base/common/cancellation.js";import{Disposable as S,DisposableStore as O,MutableDisposable as R,toDisposable as p}from"../../../../../base/common/lifecycle.js";import{ContentWidgetPositionPreference as u}from"../../../../../editor/browser/editorBrowser.js";import"../../../../../editor/common/editorCommon.js";import{ContextKeyExpr as L,IContextKeyService as M,RawContextKey as z}from"../../../../../platform/contextkey/common/contextkey.js";import{HasSpeechProvider as B,ISpeechService as H,SpeechToTextInProgress as V,SpeechToTextStatus as m}from"../../../speech/common/speechService.js";import{Codicon as _}from"../../../../../base/common/codicons.js";import{EditorOption as q}from"../../../../../editor/common/config/editorOptions.js";import{EditorAction2 as D,EditorContributionInstantiation as $,registerEditorContribution as G}from"../../../../../editor/browser/editorExtensions.js";import{EditorContextKeys as F}from"../../../../../editor/common/editorContextKeys.js";import{KeyCode as f,KeyMod as y}from"../../../../../base/common/keyCodes.js";import{KeybindingWeight as w}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import"../../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as E}from"../../../../../platform/keybinding/common/keybinding.js";import{EditOperation as X}from"../../../../../editor/common/core/editOperation.js";import{Selection as Y}from"../../../../../editor/common/core/selection.js";import{Position as j}from"../../../../../editor/common/core/position.js";import{Range as x}from"../../../../../editor/common/core/range.js";import{registerAction2 as P}from"../../../../../platform/actions/common/actions.js";import{assertIsDefined as J}from"../../../../../base/common/types.js";import{ActionBar as Q}from"../../../../../base/browser/ui/actionbar/actionbar.js";import{toAction as U}from"../../../../../base/common/actions.js";import{ThemeIcon as Z}from"../../../../../base/common/themables.js";import{isWindows as ee}from"../../../../../base/common/platform.js";const k=new z("editorDictation.inProgress",!1),T=h("voiceCategory","Voice");class te extends D{constructor(){super({id:"workbench.action.editorDictation.start",title:h("startDictation","Start Dictation in Editor"),category:T,precondition:L.and(B,V.toNegated(),F.readOnly.toNegated()),f1:!0,keybinding:{primary:y.CtrlCmd|y.Alt|f.KeyV,weight:w.WorkbenchContrib,secondary:ee?[y.Alt|f.Backquote]:void 0}})}runEditorCommand(n,e){const t=n.get(E).enableKeybindingHoldMode(this.desc.id);if(t){let o=!1;const d=setTimeout(()=>{o=!0},500);t.finally(()=>{clearTimeout(d),o&&r.get(e)?.stop()})}r.get(e)?.start()}}class c extends D{static ID="workbench.action.editorDictation.stop";constructor(){super({id:c.ID,title:h("stopDictation","Stop Dictation in Editor"),category:T,precondition:k,f1:!0,keybinding:{primary:f.Escape,weight:w.WorkbenchContrib+100}})}runEditorCommand(n,e){r.get(e)?.stop()}}class ie extends S{constructor(e,i){super();this.editor=e;const t=this._register(new Q(this.domNode)),o=i.lookupKeybinding(c.ID)?.getLabel();t.push(U({id:c.ID,label:o?I("stopDictationShort1","Stop Dictation ({0})",o):I("stopDictationShort2","Stop Dictation"),class:Z.asClassName(_.micFilled),run:()=>r.get(e)?.stop()}),{icon:!0,label:!1,keybinding:o}),this.domNode.classList.add("editor-dictation-widget"),this.domNode.appendChild(t.domNode)}suppressMouseDown=!0;allowEditorOverflow=!0;domNode=document.createElement("div");getId(){return"editorDictation"}getDomNode(){return this.domNode}getPosition(){if(!this.editor.hasModel())return null;const e=this.editor.getSelection();return{position:e.getPosition(),preference:[e.getPosition().equals(e.getStartPosition())?u.ABOVE:u.BELOW,u.EXACT]}}beforeRender(){const e=this.editor.getOption(q.lineHeight),i=this.editor.getLayoutInfo().contentWidth*.7;return this.domNode.style.setProperty("--vscode-editor-dictation-widget-height",`${e}px`),this.domNode.style.setProperty("--vscode-editor-dictation-widget-width",`${i}px`),null}show(){this.editor.addContentWidget(this)}layout(){this.editor.layoutContentWidget(this)}active(){this.domNode.classList.add("recording")}hide(){this.domNode.classList.remove("recording"),this.editor.removeContentWidget(this)}}let r=class extends S{constructor(e,i,t,o){super();this.editor=e;this.speechService=i;this.contextKeyService=t;this.keybindingService=o}static ID="editorDictation";static get(e){return e.getContribution(r.ID)}widget=this._register(new ie(this.editor,this.keybindingService));editorDictationInProgress=k.bindTo(this.contextKeyService);sessionDisposables=this._register(new R);async start(){const e=new O;this.sessionDisposables.value=e,this.widget.show(),e.add(p(()=>this.widget.hide())),this.editorDictationInProgress.set(!0),e.add(p(()=>this.editorDictationInProgress.reset()));const i=this.editor.createDecorationsCollection();e.add(p(()=>i.clear())),e.add(this.editor.onDidChangeCursorPosition(()=>this.widget.layout()));let t,o=0;const d=(s,v)=>{t||(t=J(this.editor.getPosition()));const C=new j(t.lineNumber,t.column+s.length);this.editor.executeEdits(r.ID,[X.replace(x.fromPositions(t,t.with(void 0,t.column+o)),s)],[Y.fromPositions(C)]),v?i.set([{range:x.fromPositions(t,t.with(void 0,t.column+s.length)),options:{description:"editor-dictation-preview",inlineClassName:"ghost-text-decoration-preview"}}]):i.clear(),o=s.length,v||(t=void 0,o=0),this.editor.revealPositionInCenterIfOutsideViewport(C)},g=new W;e.add(p(()=>g.dispose(!0)));const N=await this.speechService.createSpeechToTextSession(g.token,"editor");e.add(N.onDidChange(s=>{if(!g.token.isCancellationRequested)switch(s.status){case m.Started:this.widget.active();break;case m.Stopped:e.dispose();break;case m.Recognizing:{if(!s.text)return;d(s.text,!0);break}case m.Recognized:{if(!s.text)return;d(`${s.text} `,!1);break}}}))}stop(){this.sessionDisposables.clear()}};r=b([l(1,H),l(2,M),l(3,E)],r),G(r.ID,r,$.Lazy),P(te),P(c);export{ie as DictationWidget,r as EditorDictation,te as EditorDictationStartAction,c as EditorDictationStopAction};
