var B=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var W=(r,t,i,e)=>{for(var o=e>1?void 0:e?V(t,i):t,d=r.length-1,n;d>=0;d--)(n=r[d])&&(o=(e?n(t,i,o):n(o))||o);return e&&o&&B(t,i,o),o},s=(r,t)=>(i,e)=>t(i,e,r);import{addDisposableListener as T,onDidRegisterWindow as z}from"../../../../base/browser/dom.js";import{mainWindow as F}from"../../../../base/browser/window.js";import{Codicon as K}from"../../../../base/common/codicons.js";import{Event as G}from"../../../../base/common/event.js";import{KeyCode as N,KeyMod as Z}from"../../../../base/common/keyCodes.js";import{Disposable as b,DisposableStore as j}from"../../../../base/common/lifecycle.js";import"../../../../editor/browser/editorBrowser.js";import{EditorAction as q,EditorContributionInstantiation as H,registerDiffEditorContribution as J,registerEditorAction as Q,registerEditorContribution as U}from"../../../../editor/browser/editorExtensions.js";import{ICodeEditorService as I}from"../../../../editor/browser/services/codeEditorService.js";import{EditorOption as a}from"../../../../editor/common/config/editorOptions.js";import"../../../../editor/common/editorCommon.js";import{EditorContextKeys as X}from"../../../../editor/common/editorContextKeys.js";import"../../../../editor/common/model.js";import*as _ from"../../../../nls.js";import{MenuId as w,MenuRegistry as D}from"../../../../platform/actions/common/actions.js";import{ContextKeyExpr as f,IContextKeyService as L,RawContextKey as A}from"../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as Y}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{WorkbenchPhase as $,registerWorkbenchContribution2 as ii}from"../../../common/contributions.js";import{IEditorService as ei}from"../../../services/editor/common/editorService.js";const R="transientWordWrapState",M="isWordWrapMinified",O="isDominatedByLongLines",P=new A("canToggleWordWrap",!1,!0),k=new A("editorWordWrap",!1,_.localize("editorWordWrap","Whether the editor is currently using word wrapping."));function S(r,t,i){i.setTransientModelProperty(r,R,t)}function C(r,t){return t.getTransientModelProperty(r,R)}const y="editor.action.toggleWordWrap";class ti extends q{constructor(){super({id:y,label:_.localize("toggle.wordwrap","View: Toggle Word Wrap"),alias:"View: Toggle Word Wrap",precondition:void 0,kbOpts:{kbExpr:null,primary:Z.Alt|N.KeyZ,weight:Y.EditorContrib}})}run(t,i){const e=t.get(I);if(!E(e,i))return;const o=i.getModel(),d=C(o,e);let n;d?n=null:n={wordWrapOverride:i.getOption(a.wrappingInfo).wrappingColumn===-1?"on":"off"},S(o,n,e);const c=oi(i,e);if(c){const v=c.getOriginalEditor(),p=c.getModifiedEditor(),l=v===i?p:v;E(e,l)&&(S(l.getModel(),n,e),c.updateOptions({}))}}}function oi(r,t){if(!r.getOption(a.inDiffEditor))return null;for(const i of t.listDiffEditors()){const e=i.getOriginalEditor(),o=i.getModifiedEditor();if(e===r||o===r)return i}return null}let g=class extends b{constructor(i,e,o){super();this._editor=i;this._contextKeyService=e;this._codeEditorService=o;const n=this._editor.getOptions().get(a.wrappingInfo),c=this._contextKeyService.createKey(M,n.isWordWrapMinified),v=this._contextKeyService.createKey(O,n.isDominatedByLongLines);let p=!1;this._register(i.onDidChangeConfiguration(m=>{if(!m.hasChanged(a.wrappingInfo))return;const x=this._editor.getOptions().get(a.wrappingInfo);c.set(x.isWordWrapMinified),v.set(x.isDominatedByLongLines),p||l()})),this._register(i.onDidChangeModel(m=>{l()})),this._register(o.onDidChangeTransientModelProperty(()=>{l()}));const l=()=>{if(!E(this._codeEditorService,this._editor))return;const m=C(this._editor.getModel(),this._codeEditorService);try{p=!0,this._applyWordWrapState(m)}finally{p=!1}}}static ID="editor.contrib.toggleWordWrapController";_applyWordWrapState(i){const e=i?i.wordWrapOverride:"inherit";this._editor.updateOptions({wordWrapOverride2:e})}};g=W([s(1,L),s(2,I)],g);let u=class extends b{constructor(i,e){super();this._diffEditor=i;this._codeEditorService=e;this._register(this._diffEditor.onDidChangeModel(()=>{this._ensureSyncedWordWrapToggle()}))}static ID="diffeditor.contrib.toggleWordWrapController";_ensureSyncedWordWrapToggle(){const i=this._diffEditor.getOriginalEditor(),e=this._diffEditor.getModifiedEditor();if(!i.hasModel()||!e.hasModel())return;const o=C(i.getModel(),this._codeEditorService),d=C(e.getModel(),this._codeEditorService);o&&!d&&E(this._codeEditorService,i)&&(S(e.getModel(),o,this._codeEditorService),this._diffEditor.updateOptions({})),!o&&d&&E(this._codeEditorService,e)&&(S(i.getModel(),d,this._codeEditorService),this._diffEditor.updateOptions({}))}};u=W([s(1,I)],u);function E(r,t){if(!t||t.isSimpleWidget||!t.getModel())return!1;if(t.getOption(a.inDiffEditor)){for(const e of r.listDiffEditors())if(e.getOriginalEditor()===t&&!e.renderSideBySide)return!1}return!0}let h=class extends b{constructor(i,e,o){super();this._editorService=i;this._codeEditorService=e;this._contextService=o;this._register(G.runAndSubscribe(z,({window:d,disposables:n})=>{n.add(T(d,"focus",()=>this._update(),!0)),n.add(T(d,"blur",()=>this._update(),!0))},{window:F,disposables:this._store})),this._register(this._editorService.onDidActiveEditorChange(()=>this._update())),this._canToggleWordWrap=P.bindTo(this._contextService),this._editorWordWrap=k.bindTo(this._contextService),this._activeEditor=null,this._activeEditorListener=new j,this._update()}static ID="workbench.contrib.editorWordWrapContextKeyTracker";_canToggleWordWrap;_editorWordWrap;_activeEditor;_activeEditorListener;_update(){const i=this._codeEditorService.getFocusedCodeEditor()||this._codeEditorService.getActiveCodeEditor();this._activeEditor!==i&&(this._activeEditorListener.clear(),this._activeEditor=i,i&&(this._activeEditorListener.add(i.onDidChangeModel(()=>this._updateFromCodeEditor())),this._activeEditorListener.add(i.onDidChangeConfiguration(e=>{e.hasChanged(a.wrappingInfo)&&this._updateFromCodeEditor()})),this._updateFromCodeEditor()))}_updateFromCodeEditor(){if(E(this._codeEditorService,this._activeEditor)){const i=this._activeEditor.getOption(a.wrappingInfo);this._setValues(!0,i.wrappingColumn!==-1)}else return this._setValues(!1,!1)}_setValues(i,e){this._canToggleWordWrap.set(i),this._editorWordWrap.set(e)}};h=W([s(0,ei),s(1,I),s(2,L)],h),ii(h.ID,h,$.AfterRestored),U(g.ID,g,H.Eager),J(u.ID,u),Q(ti),D.appendMenuItem(w.EditorTitle,{command:{id:y,title:_.localize("unwrapMinified","Disable wrapping for this file"),icon:K.wordWrap},group:"navigation",order:1,when:f.and(f.has(O),f.has(M))}),D.appendMenuItem(w.EditorTitle,{command:{id:y,title:_.localize("wrapMinified","Enable wrapping for this file"),icon:K.wordWrap},group:"navigation",order:1,when:f.and(X.inDiffEditor.negate(),f.has(O),f.not(M))}),D.appendMenuItem(w.MenubarViewMenu,{command:{id:y,title:_.localize({key:"miToggleWordWrap",comment:["&& denotes a mnemonic"]},"&&Word Wrap"),toggled:k,precondition:P},order:1,group:"5_editor"});export{C as readTransientState,S as writeTransientState};
