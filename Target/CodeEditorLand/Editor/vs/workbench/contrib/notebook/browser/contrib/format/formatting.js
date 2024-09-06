var V=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var h=(e,o,r,t)=>{for(var i=t>1?void 0:t?j(o,r):o,n=e.length-1,a;n>=0;n--)(a=e[n])&&(i=(t?a(o,r,i):a(i))||i);return t&&i&&V(o,r,i),i},c=(e,o)=>(r,t)=>o(r,t,e);import{CancellationToken as g}from"../../../../../../base/common/cancellation.js";import{KeyCode as E,KeyMod as s}from"../../../../../../base/common/keyCodes.js";import{Disposable as z,DisposableStore as A}from"../../../../../../base/common/lifecycle.js";import"../../../../../../editor/browser/editorBrowser.js";import{EditorAction as G,registerEditorAction as H}from"../../../../../../editor/browser/editorExtensions.js";import{IBulkEditService as M,ResourceTextEdit as T}from"../../../../../../editor/browser/services/bulkEditService.js";import{EditorContextKeys as d}from"../../../../../../editor/common/editorContextKeys.js";import{IEditorWorkerService as W}from"../../../../../../editor/common/services/editorWorker.js";import{ILanguageFeaturesService as K}from"../../../../../../editor/common/services/languageFeatures.js";import{ITextModelService as R}from"../../../../../../editor/common/services/resolverService.js";import{formatDocumentWithSelectedProvider as U,FormattingMode as y,getDocumentFormattingEditsWithSelectedProvider as O}from"../../../../../../editor/contrib/format/browser/format.js";import{localize as x,localize2 as Y}from"../../../../../../nls.js";import{Action2 as q,MenuId as J,registerAction2 as Q}from"../../../../../../platform/actions/common/actions.js";import{IConfigurationService as X}from"../../../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as k}from"../../../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as C}from"../../../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as P}from"../../../../../../platform/keybinding/common/keybindingsRegistry.js";import{Progress as _}from"../../../../../../platform/progress/common/progress.js";import{Registry as Z}from"../../../../../../platform/registry/common/platform.js";import{Extensions as $}from"../../../../../common/contributions.js";import{IEditorService as ee}from"../../../../../services/editor/common/editorService.js";import{LifecyclePhase as oe}from"../../../../../services/lifecycle/common/lifecycle.js";import{NotebookSetting as te}from"../../../common/notebookCommon.js";import{NOTEBOOK_EDITOR_EDITABLE as D,NOTEBOOK_IS_ACTIVE_EDITOR as B}from"../../../common/notebookContextKeys.js";import{INotebookExecutionService as re}from"../../../common/notebookExecutionService.js";import"../../../common/notebookExecutionStateService.js";import{INotebookService as ie}from"../../../common/notebookService.js";import{NOTEBOOK_ACTIONS_CATEGORY as ne}from"../../controller/coreActions.js";import{getNotebookEditorFromEditorPane as ae}from"../../notebookBrowser.js";import{CodeActionParticipantUtils as ce}from"../saveParticipants/saveParticipants.js";Q(class extends q{constructor(){super({id:"notebook.format",title:Y("format.title","Format Notebook"),category:ne,precondition:k.and(B,D),keybinding:{when:d.editorTextFocus.toNegated(),primary:s.Shift|s.Alt|E.KeyF,linux:{primary:s.CtrlCmd|s.Shift|E.KeyI},weight:P.WorkbenchContrib},f1:!0,menu:{id:J.EditorContext,when:k.and(d.inCompositeEditor,d.hasDocumentFormattingProvider),group:"1_modification",order:1.3}})}async run(e){const o=e.get(ee),r=e.get(R),t=e.get(W),i=e.get(K),n=e.get(M),a=e.get(C),l=ae(o.activeEditorPane);if(!l||!l.hasModel())return;const p=l.textModel,u=await a.invokeFunction(ce.checkAndRunFormatCodeAction,p,_.None,g.None),f=new A;try{if(!u){const S=await Promise.all(p.cells.map(async m=>{const N=await r.createModelReference(m.uri);f.add(N);const I=N.object.textEditorModel,F=await O(t,i,I,y.Explicit,g.None),w=[];if(F){for(const L of F)w.push(new T(I.uri,L,I.getVersionId()));return w}return[]}));await n.apply(S.flat(),{label:x("label","Format Notebook"),code:"undoredo.formatNotebook"})}}finally{f.dispose()}}}),H(class extends G{constructor(){super({id:"notebook.formatCell",label:x("formatCell.label","Format Cell"),alias:"Format Cell",precondition:k.and(B,D,d.inCompositeEditor,d.writable,d.hasDocumentFormattingProvider),kbOpts:{kbExpr:k.and(d.editorTextFocus),primary:s.Shift|s.Alt|E.KeyF,linux:{primary:s.CtrlCmd|s.Shift|E.KeyI},weight:P.EditorContrib},contextMenuOpts:{group:"1_modification",order:1.301}})}async run(o,r){r.hasModel()&&await o.get(C).invokeFunction(U,r,y.Explicit,_.None,g.None,!0)}});let v=class{constructor(o,r,t,i,n,a){this.bulkEditService=o;this.languageFeaturesService=r;this.textModelService=t;this.editorWorkerService=i;this.configurationService=n;this._notebookService=a}async onWillExecuteCell(o){if(!this.configurationService.getValue(te.formatOnCellExecution))return;const t=new A;try{const i=await Promise.all(o.map(async n=>{const a=this._notebookService.getNotebookTextModel(n.notebook);if(!a)return[];let l;for(const m of a.cells)if(m.handle===n.cellHandle){l=m;break}if(!l)return[];const p=await this.textModelService.createModelReference(l.uri);t.add(p);const u=p.object.textEditorModel,f=await O(this.editorWorkerService,this.languageFeaturesService,u,y.Silent,g.None),S=[];return f?(S.push(...f.map(m=>new T(u.uri,m,u.getVersionId()))),S):[]}));await this.bulkEditService.apply(i.flat(),{label:x("formatCells.label","Format Cells"),code:"undoredo.notebooks.onWillExecuteFormat"})}finally{t.dispose()}}};v=h([c(0,M),c(1,K),c(2,R),c(3,W),c(4,X),c(5,ie)],v);let b=class extends z{constructor(r,t){super();this.instantiationService=r;this.notebookExecutionService=t;this.registerKernelExecutionParticipants()}registerKernelExecutionParticipants(){this._register(this.notebookExecutionService.registerExecutionParticipant(this.instantiationService.createInstance(v)))}};b=h([c(0,C),c(1,re)],b);const se=Z.as($.Workbench);se.registerWorkbenchContribution(b,oe.Restored);export{b as CellExecutionParticipantsContribution};
