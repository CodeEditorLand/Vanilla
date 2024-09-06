var F=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var S=(f,a,t,e)=>{for(var i=e>1?void 0:e?V(a,t):a,r=f.length-1,o;r>=0;r--)(o=f[r])&&(i=(e?o(a,t,i):o(i))||i);return e&&i&&F(a,t,i),i},c=(f,a)=>(t,e)=>a(t,e,f);import{createStyleSheet2 as k}from"../../../../base/browser/dom.js";import{CancellationTokenSource as L}from"../../../../base/common/cancellation.js";import{onUnexpectedExternalError as x}from"../../../../base/common/errors.js";import{Disposable as O}from"../../../../base/common/lifecycle.js";import{autorun as g,constObservable as p,observableFromEvent as E,observableSignalFromEvent as b,observableValue as y,transaction as B}from"../../../../base/common/observable.js";import{derivedDisposable as K}from"../../../../base/common/observableInternal/derived.js";import{ICommandService as N}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as W}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as j,RawContextKey as P}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as q}from"../../../../platform/instantiation/common/instantiation.js";import"../../../browser/editorBrowser.js";import{IDiffProviderFactoryService as M}from"../../../browser/widget/diffEditor/diffProviderFactoryService.js";import{EditorOption as I}from"../../../common/config/editorOptions.js";import{EditOperation as G}from"../../../common/core/editOperation.js";import{Position as w}from"../../../common/core/position.js";import{Range as v}from"../../../common/core/range.js";import{InlineEditTriggerKind as D}from"../../../common/languages.js";import{ILanguageFeaturesService as H}from"../../../common/services/languageFeatures.js";import{IModelService as U}from"../../../common/services/model.js";import{GhostText as Z,GhostTextPart as $}from"../../inlineCompletions/browser/model/ghostText.js";import{GhostTextWidget as z}from"./ghostTextWidget.js";import{InlineEditHintsWidget as J}from"./inlineEditHintsWidget.js";import{InlineEditSideBySideWidget as Q}from"./inlineEditSideBySideWidget.js";let u=class extends O{constructor(t,e,i,r,o,d,s,h){super();this.editor=t;this.instantiationService=e;this.contextKeyService=i;this.languageFeaturesService=r;this._commandService=o;this._configurationService=d;this._diffProviderFactoryService=s;this._modelService=h;const C=b("InlineEditController.modelContentChangedSignal",t.onDidChangeModelContent);this._register(g(n=>{this._enabled.read(n)&&(C.read(n),!this._isAccepting.read(n)&&this.getInlineEdit(t,!0))}));const m=E(this,t.onDidChangeCursorPosition,()=>t.getPosition());this._register(g(n=>{if(!this._enabled.read(n))return;const l=m.read(n);l&&this.checkCursorPosition(l)})),this._register(g(n=>{const l=this._currentEdit.read(n);if(this._isCursorAtInlineEditContext.set(!1),!l){this._isVisibleContext.set(!1);return}this._isVisibleContext.set(!0);const _=t.getPosition();_&&this.checkCursorPosition(_)}));const R=b("InlineEditController.editorBlurSignal",t.onDidBlurEditorWidget);this._register(g(async n=>{this._enabled.read(n)&&(R.read(n),!(this._configurationService.getValue("editor.experimentalInlineEdit.keepOnBlur")||t.getOption(I.inlineEdit).keepOnBlur)&&(this._currentRequestCts?.dispose(!0),this._currentRequestCts=void 0,await this.clear(!1)))}));const T=b("InlineEditController.editorFocusSignal",t.onDidFocusEditorText);this._register(g(n=>{this._enabled.read(n)&&(T.read(n),this.getInlineEdit(t,!0))}));const A=this._register(k());this._register(g(n=>{const l=this._fontFamily.read(n);A.setStyle(l===""||l==="default"?"":`
.monaco-editor .inline-edit-decoration,
.monaco-editor .inline-edit-decoration-preview,
.monaco-editor .inline-edit {
	font-family: ${l};
}`)})),this._register(new J(this.editor,this._currentWidget,this.instantiationService)),this._register(new Q(this.editor,this._currentEdit,this.instantiationService,this._diffProviderFactoryService,this._modelService))}static ID="editor.contrib.inlineEditController";static inlineEditVisibleKey="inlineEditVisible";static inlineEditVisibleContext=new P(this.inlineEditVisibleKey,!1);_isVisibleContext=u.inlineEditVisibleContext.bindTo(this.contextKeyService);static cursorAtInlineEditKey="cursorAtInlineEdit";static cursorAtInlineEditContext=new P(this.cursorAtInlineEditKey,!1);_isCursorAtInlineEditContext=u.cursorAtInlineEditContext.bindTo(this.contextKeyService);static get(t){return t.getContribution(u.ID)}_currentEdit=y(this,void 0);_currentWidget=K(this._currentEdit,t=>{const e=this._currentEdit.read(t);if(!e)return;const i=e.range.endLineNumber,r=e.range.endColumn,o=e.text.endsWith(`
`)&&!(e.range.startLineNumber===e.range.endLineNumber&&e.range.startColumn===e.range.endColumn)?e.text.slice(0,-1):e.text,d=new Z(i,[new $(r,o,!1)]),s=e.range.startLineNumber===e.range.endLineNumber&&d.parts.length===1&&d.parts[0].lines.length===1,h=e.text==="";return!s&&!h?void 0:this.instantiationService.createInstance(z,this.editor,{ghostText:p(d),minReservedLineCount:p(0),targetTextModel:p(this.editor.getModel()??void 0),range:p(e.range)})});_currentRequestCts;_jumpBackPosition;_isAccepting=y(this,!1);_enabled=E(this,this.editor.onDidChangeConfiguration,()=>this.editor.getOption(I.inlineEdit).enabled);_fontFamily=E(this,this.editor.onDidChangeConfiguration,()=>this.editor.getOption(I.inlineEdit).fontFamily);checkCursorPosition(t){if(!this._currentEdit){this._isCursorAtInlineEditContext.set(!1);return}const e=this._currentEdit.get();if(!e){this._isCursorAtInlineEditContext.set(!1);return}this._isCursorAtInlineEditContext.set(v.containsPosition(e.range,t))}validateInlineEdit(t,e){if(e.text.includes(`
`)&&e.range.startLineNumber!==e.range.endLineNumber&&e.range.startColumn!==e.range.endColumn){if(e.range.startColumn!==1)return!1;const r=e.range.endLineNumber,o=e.range.endColumn,d=t.getModel()?.getLineLength(r)??0;if(o!==d+1)return!1}return!0}async fetchInlineEdit(t,e){this._currentRequestCts&&this._currentRequestCts.dispose(!0);const i=t.getModel();if(!i)return;const r=i.getVersionId(),o=this.languageFeaturesService.inlineEditProvider.all(i);if(o.length===0)return;const d=o[0];this._currentRequestCts=new L;const s=this._currentRequestCts.token,h=e?D.Automatic:D.Invoke;if(e&&await X(50,s),s.isCancellationRequested||i.isDisposed()||i.getVersionId()!==r)return;const m=await d.provideInlineEdit(i,{triggerKind:h},s);if(m&&!(s.isCancellationRequested||i.isDisposed()||i.getVersionId()!==r)&&this.validateInlineEdit(t,m))return m}async getInlineEdit(t,e){this._isCursorAtInlineEditContext.set(!1),await this.clear();const i=await this.fetchInlineEdit(t,e);i&&this._currentEdit.set(i,void 0)}async trigger(){await this.getInlineEdit(this.editor,!1)}async jumpBack(){this._jumpBackPosition&&(this.editor.setPosition(this._jumpBackPosition),this.editor.revealPositionInCenterIfOutsideViewport(this._jumpBackPosition))}async accept(){this._isAccepting.set(!0,void 0);const t=this._currentEdit.get();if(!t)return;let e=t.text;t.text.startsWith(`
`)&&(e=t.text.substring(1)),this.editor.pushUndoStop(),this.editor.executeEdits("acceptCurrent",[G.replace(v.lift(t.range),e)]),t.accepted&&await this._commandService.executeCommand(t.accepted.id,...t.accepted.arguments||[]).then(void 0,x),this.freeEdit(t),B(i=>{this._currentEdit.set(void 0,i),this._isAccepting.set(!1,i)})}jumpToCurrent(){this._jumpBackPosition=this.editor.getSelection()?.getStartPosition();const t=this._currentEdit.get();if(!t)return;const e=w.lift({lineNumber:t.range.startLineNumber,column:t.range.startColumn});this.editor.setPosition(e),this.editor.revealPositionInCenterIfOutsideViewport(e)}async clear(t=!0){const e=this._currentEdit.get();e&&e?.rejected&&t&&await this._commandService.executeCommand(e.rejected.id,...e.rejected.arguments||[]).then(void 0,x),e&&this.freeEdit(e),this._currentEdit.set(void 0,void 0)}freeEdit(t){const e=this.editor.getModel();if(!e)return;const i=this.languageFeaturesService.inlineEditProvider.all(e);i.length!==0&&i[0].freeInlineEdit(t)}shouldShowHoverAt(t){const e=this._currentEdit.get(),i=this._currentWidget.get();if(!e||!i)return!1;const r=e,o=i.model;if(v.containsPosition(r.range,t.getStartPosition())||v.containsPosition(r.range,t.getEndPosition()))return!0;const s=o.ghostText.get();return s?s.parts.some(h=>t.containsPosition(new w(s.lineNumber,h.column))):!1}shouldShowHoverAtViewZone(t){return this._currentWidget.get()?.ownsViewZone(t)??!1}};u=S([c(1,q),c(2,j),c(3,H),c(4,N),c(5,W),c(6,M),c(7,U)],u);function X(f,a){return new Promise(t=>{let e;const i=setTimeout(()=>{e&&e.dispose(),t()},f);a&&(e=a.onCancellationRequested(()=>{clearTimeout(i),e&&e.dispose(),t()}))})}export{u as InlineEditController};
