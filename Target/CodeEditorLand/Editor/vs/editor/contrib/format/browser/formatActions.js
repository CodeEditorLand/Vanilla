var A=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var u=(n,e,t,o)=>{for(var i=o>1?void 0:o?N(e,t):e,r=n.length-1,s;r>=0;r--)(s=n[r])&&(i=(o?s(e,t,i):s(i))||i);return o&&i&&A(e,t,i),i},c=(n,e)=>(t,o)=>e(t,o,n);import{isNonEmptyArray as P}from"../../../../base/common/arrays.js";import{CancellationToken as f,CancellationTokenSource as K}from"../../../../base/common/cancellation.js";import{onUnexpectedError as L}from"../../../../base/common/errors.js";import{KeyChord as T,KeyCode as g,KeyMod as l}from"../../../../base/common/keyCodes.js";import{DisposableStore as h}from"../../../../base/common/lifecycle.js";import*as y from"../../../../nls.js";import{AccessibilitySignal as R,IAccessibilitySignalService as W}from"../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";import{CommandsRegistry as B,ICommandService as j}from"../../../../platform/commands/common/commands.js";import{ContextKeyExpr as b}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as v}from"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as E}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{IEditorProgressService as D,Progress as S}from"../../../../platform/progress/common/progress.js";import{EditorAction as I,EditorContributionInstantiation as F,registerEditorAction as M,registerEditorContribution as w}from"../../../browser/editorExtensions.js";import{ICodeEditorService as z}from"../../../browser/services/codeEditorService.js";import{EditorOption as C}from"../../../common/config/editorOptions.js";import{CharacterSet as q}from"../../../common/core/characterClassifier.js";import{Range as G}from"../../../common/core/range.js";import{EditorContextKeys as d}from"../../../common/editorContextKeys.js";import{IEditorWorkerService as U}from"../../../common/services/editorWorker.js";import{ILanguageFeaturesService as x}from"../../../common/services/languageFeatures.js";import{FormattingMode as _,formatDocumentRangesWithSelectedProvider as O,formatDocumentWithSelectedProvider as H,getOnTypeFormattingEdits as J}from"./format.js";import{FormattingEdit as Q}from"./formattingEdit.js";let m=class{constructor(e,t,o,i){this._editor=e;this._languageFeaturesService=t;this._workerService=o;this._accessibilitySignalService=i;this._disposables.add(t.onTypeFormattingEditProvider.onDidChange(this._update,this)),this._disposables.add(e.onDidChangeModel(()=>this._update())),this._disposables.add(e.onDidChangeModelLanguage(()=>this._update())),this._disposables.add(e.onDidChangeConfiguration(r=>{r.hasChanged(C.formatOnType)&&this._update()})),this._update()}static ID="editor.contrib.autoFormat";_disposables=new h;_sessionDisposables=new h;dispose(){this._disposables.dispose(),this._sessionDisposables.dispose()}_update(){if(this._sessionDisposables.clear(),!this._editor.getOption(C.formatOnType)||!this._editor.hasModel())return;const e=this._editor.getModel(),[t]=this._languageFeaturesService.onTypeFormattingEditProvider.ordered(e);if(!t||!t.autoFormatTriggerCharacters)return;const o=new q;for(const i of t.autoFormatTriggerCharacters)o.add(i.charCodeAt(0));this._sessionDisposables.add(this._editor.onDidType(i=>{const r=i.charCodeAt(i.length-1);o.has(r)&&this._trigger(String.fromCharCode(r))}))}_trigger(e){if(!this._editor.hasModel()||this._editor.getSelections().length>1||!this._editor.getSelection().isEmpty())return;const t=this._editor.getModel(),o=this._editor.getPosition(),i=new K,r=this._editor.onDidChangeModelContent(s=>{if(s.isFlush){i.cancel(),r.dispose();return}for(let a=0,k=s.changes.length;a<k;a++)if(s.changes[a].range.endLineNumber<=o.lineNumber){i.cancel(),r.dispose();return}});J(this._workerService,this._languageFeaturesService,t,o,e,t.getFormattingOptions(),i.token).then(s=>{i.token.isCancellationRequested||P(s)&&(this._accessibilitySignalService.playSignal(R.format,{userGesture:!1}),Q.execute(this._editor,s,!0))}).finally(()=>{r.dispose()})}};m=u([c(1,x),c(2,U),c(3,W)],m);let p=class{constructor(e,t,o){this.editor=e;this._languageFeaturesService=t;this._instantiationService=o;this._callOnDispose.add(e.onDidChangeConfiguration(()=>this._update())),this._callOnDispose.add(e.onDidChangeModel(()=>this._update())),this._callOnDispose.add(e.onDidChangeModelLanguage(()=>this._update())),this._callOnDispose.add(t.documentRangeFormattingEditProvider.onDidChange(this._update,this))}static ID="editor.contrib.formatOnPaste";_callOnDispose=new h;_callOnModel=new h;dispose(){this._callOnDispose.dispose(),this._callOnModel.dispose()}_update(){this._callOnModel.clear(),this.editor.getOption(C.formatOnPaste)&&this.editor.hasModel()&&this._languageFeaturesService.documentRangeFormattingEditProvider.has(this.editor.getModel())&&this._callOnModel.add(this.editor.onDidPaste(({range:e})=>this._trigger(e)))}_trigger(e){this.editor.hasModel()&&(this.editor.getSelections().length>1||this._instantiationService.invokeFunction(O,this.editor,e,_.Silent,S.None,f.None,!1).catch(L))}};p=u([c(1,x),c(2,v)],p);class V extends I{constructor(){super({id:"editor.action.formatDocument",label:y.localize("formatDocument.label","Format Document"),alias:"Format Document",precondition:b.and(d.notInCompositeEditor,d.writable,d.hasDocumentFormattingProvider),kbOpts:{kbExpr:d.editorTextFocus,primary:l.Shift|l.Alt|g.KeyF,linux:{primary:l.CtrlCmd|l.Shift|g.KeyI},weight:E.EditorContrib},contextMenuOpts:{group:"1_modification",order:1.3}})}async run(e,t){if(t.hasModel()){const o=e.get(v);await e.get(D).showWhile(o.invokeFunction(H,t,_.Explicit,S.None,f.None,!0),250)}}}class X extends I{constructor(){super({id:"editor.action.formatSelection",label:y.localize("formatSelection.label","Format Selection"),alias:"Format Selection",precondition:b.and(d.writable,d.hasDocumentSelectionFormattingProvider),kbOpts:{kbExpr:d.editorTextFocus,primary:T(l.CtrlCmd|g.KeyK,l.CtrlCmd|g.KeyF),weight:E.EditorContrib},contextMenuOpts:{when:d.hasNonEmptySelection,group:"1_modification",order:1.31}})}async run(e,t){if(!t.hasModel())return;const o=e.get(v),i=t.getModel(),r=t.getSelections().map(a=>a.isEmpty()?new G(a.startLineNumber,1,a.startLineNumber,i.getLineMaxColumn(a.startLineNumber)):a);await e.get(D).showWhile(o.invokeFunction(O,t,r,_.Explicit,S.None,f.None,!0),250)}}w(m.ID,m,F.BeforeFirstInteraction),w(p.ID,p,F.BeforeFirstInteraction),M(V),M(X),B.registerCommand("editor.action.format",async n=>{const e=n.get(z).getFocusedCodeEditor();if(!e||!e.hasModel())return;const t=n.get(j);e.getSelection().isEmpty()?await t.executeCommand("editor.action.formatDocument"):await t.executeCommand("editor.action.formatSelection")});export{m as FormatOnType};
