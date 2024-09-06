var z=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var C=(S,e,o,t)=>{for(var i=t>1?void 0:t?X(e,o):e,l=S.length-1,r;l>=0;l--)(r=S[l])&&(i=(t?r(e,o,i):r(i))||i);return t&&i&&z(e,o,i),i},g=(S,e)=>(o,t)=>e(o,t,S);import"../../../../../../base/common/cancellation.js";import{HierarchicalKind as q}from"../../../../../../base/common/hierarchicalKind.js";import{Disposable as J,DisposableStore as h}from"../../../../../../base/common/lifecycle.js";import{isEqual as Q}from"../../../../../../base/common/resources.js";import"../../../../../../editor/browser/editorBrowser.js";import{IBulkEditService as N,ResourceTextEdit as O}from"../../../../../../editor/browser/services/bulkEditService.js";import{trimTrailingWhitespace as Y}from"../../../../../../editor/common/commands/trimTrailingWhitespaceCommand.js";import{Position as Z}from"../../../../../../editor/common/core/position.js";import{Range as G}from"../../../../../../editor/common/core/range.js";import"../../../../../../editor/common/core/selection.js";import{CodeActionTriggerType as ee}from"../../../../../../editor/common/languages.js";import"../../../../../../editor/common/model.js";import{IEditorWorkerService as te}from"../../../../../../editor/common/services/editorWorker.js";import{ILanguageFeaturesService as V}from"../../../../../../editor/common/services/languageFeatures.js";import{ITextModelService as _}from"../../../../../../editor/common/services/resolverService.js";import{applyCodeAction as U,ApplyCodeActionReason as $,getCodeActions as oe}from"../../../../../../editor/contrib/codeAction/browser/codeAction.js";import{CodeActionKind as x,CodeActionTriggerSource as ie}from"../../../../../../editor/contrib/codeAction/common/types.js";import{FormattingMode as re,getDocumentFormattingEditsWithSelectedProvider as ne}from"../../../../../../editor/contrib/format/browser/format.js";import{SnippetController2 as ae}from"../../../../../../editor/contrib/snippet/browser/snippetController2.js";import{localize as I}from"../../../../../../nls.js";import{IConfigurationService as F}from"../../../../../../platform/configuration/common/configuration.js";import{IInstantiationService as E}from"../../../../../../platform/instantiation/common/instantiation.js";import{ILogService as B}from"../../../../../../platform/log/common/log.js";import"../../../../../../platform/progress/common/progress.js";import{Registry as se}from"../../../../../../platform/registry/common/platform.js";import{IWorkspaceTrustManagementService as ce}from"../../../../../../platform/workspace/common/workspaceTrust.js";import{Extensions as le}from"../../../../../common/contributions.js";import{SaveReason as A}from"../../../../../common/editor.js";import{IEditorService as D}from"../../../../../services/editor/common/editorService.js";import{LifecyclePhase as de}from"../../../../../services/lifecycle/common/lifecycle.js";import"../../../../../services/workingCopy/common/storedFileWorkingCopy.js";import{IWorkingCopyFileService as pe}from"../../../../../services/workingCopy/common/workingCopyFileService.js";import"../../../common/model/notebookTextModel.js";import{CellKind as j,NotebookSetting as K}from"../../../common/notebookCommon.js";import{NotebookFileWorkingCopyModel as M}from"../../../common/notebookEditorModel.js";import{getNotebookEditorFromEditorPane as ge}from"../../notebookBrowser.js";let P=class{constructor(e,o,t,i,l,r){this.editorWorkerService=e;this.languageFeaturesService=o;this.instantiationService=t;this.textModelService=i;this.bulkEditService=l;this.configurationService=r}async participate(e,o,t,i){if(!e.model||!(e.model instanceof M)||o.reason===A.AUTO||!this.configurationService.getValue(K.formatOnSave))return;t.report({message:I("notebookFormatSave.formatting","Formatting")});const r=e.model.notebookModel,u=await this.instantiationService.invokeFunction(b.checkAndRunFormatCodeAction,r,t,i),p=new h;try{if(!u){const v=await Promise.all(r.cells.map(async a=>{const s=await this.textModelService.createModelReference(a.uri);p.add(s);const n=s.object.textEditorModel,c=await ne(this.editorWorkerService,this.languageFeaturesService,n,re.Silent,i),f=[];return c?(f.push(...c.map(d=>new O(n.uri,d,n.getVersionId()))),f):[]}));await this.bulkEditService.apply(v.flat(),{label:I("formatNotebook","Format Notebook"),code:"undoredo.formatNotebook"})}}finally{t.report({increment:100}),p.dispose()}}};P=C([g(0,te),g(1,V),g(2,E),g(3,_),g(4,N),g(5,F)],P);let W=class{constructor(e,o,t,i){this.configurationService=e;this.editorService=o;this.textModelService=t;this.bulkEditService=i}async participate(e,o,t,i){const l=this.configurationService.getValue("files.trimTrailingWhitespace"),r=this.configurationService.getValue("files.trimTrailingWhitespaceInRegexAndStrings");l&&await this.doTrimTrailingWhitespace(e,o.reason===A.AUTO,r,t)}async doTrimTrailingWhitespace(e,o,t,i){if(!e.model||!(e.model instanceof M))return;const l=new h,r=e.model.notebookModel,u=H(this.editorService);let p=[],v=[];try{const s=(await Promise.all(r.cells.map(async n=>{if(n.cellKind!==j.Code)return[];const c=await this.textModelService.createModelReference(n.uri);l.add(c);const f=c.object.textEditorModel;if(u&&n.uri.toString()===u.getModel()?.uri.toString()&&(v=u.getSelections()??[],o)){p=v.map(k=>k.getPosition());const m=ae.get(u)?.getSessionEnclosingRange();if(m)for(let k=m.startLineNumber;k<=m.endLineNumber;k++)p.push(new Z(k,f.getLineMaxColumn(k)))}const y=Y(f,p,t);return y.length?y.map(m=>new O(f.uri,{...m,text:m.text||""},f.getVersionId())):[]}))).flat().filter(n=>n!==void 0);await this.bulkEditService.apply(s,{label:I("trimNotebookWhitespace","Notebook Trim Trailing Whitespace"),code:"undoredo.notebookTrimTrailingWhitespace"})}finally{i.report({increment:100}),l.dispose()}}};W=C([g(0,F),g(1,D),g(2,_),g(3,N)],W);let T=class{constructor(e,o,t){this.configurationService=e;this.editorService=o;this.bulkEditService=t}async participate(e,o,t,i){this.configurationService.getValue("files.trimFinalNewlines")&&await this.doTrimFinalNewLines(e,o.reason===A.AUTO,t)}findLastNonEmptyLine(e){for(let o=e.getLineCount();o>=1;o--)if(e.getLineLength(o))return o;return 0}async doTrimFinalNewLines(e,o,t){if(!e.model||!(e.model instanceof M))return;const i=new h,l=e.model.notebookModel,r=H(this.editorService);try{const p=(await Promise.all(l.cells.map(async v=>{if(v.cellKind!==j.Code)return;let a=0;const s=r&&v.uri.toString()===r.getModel()?.uri.toString();if(o&&s){const y=r.getSelections()??[];for(const m of y)a=Math.max(a,m.selectionStartLineNumber)}const n=v.textBuffer,c=this.findLastNonEmptyLine(n),f=Math.max(c+1,a+1);if(f>n.getLineCount())return;const d=new G(f,1,n.getLineCount(),n.getLineLastNonWhitespaceColumn(n.getLineCount()));if(!d.isEmpty())return new O(v.uri,{range:d,text:""},v.textModel?.getVersionId())}))).flat().filter(v=>v!==void 0);await this.bulkEditService.apply(p,{label:I("trimNotebookNewlines","Trim Final New Lines"),code:"undoredo.trimFinalNewLines"})}finally{t.report({increment:100}),i.dispose()}}};T=C([g(0,F),g(1,D),g(2,N)],T);let w=class{constructor(e,o,t){this.configurationService=e;this.bulkEditService=o;this.editorService=t}async participate(e,o,t,i){this.configurationService.getValue(K.insertFinalNewline)&&await this.doInsertFinalNewLine(e,o.reason===A.AUTO,t)}async doInsertFinalNewLine(e,o,t){if(!e.model||!(e.model instanceof M))return;const i=new h,l=e.model.notebookModel,r=H(this.editorService);let u;r&&(u=r.getSelections()??[]);try{const v=(await Promise.all(l.cells.map(async a=>{if(a.cellKind!==j.Code)return;const s=a.textBuffer.getLineCount(),n=a.textBuffer.getLineFirstNonWhitespaceColumn(s)===0;if(!(!s||n))return new O(a.uri,{range:new G(s+1,a.textBuffer.getLineLength(s),s+1,a.textBuffer.getLineLength(s)),text:a.textBuffer.getEOL()},a.textModel?.getVersionId())}))).filter(a=>a!==void 0);await this.bulkEditService.apply(v,{label:I("insertFinalNewLine","Insert Final New Line"),code:"undoredo.insertFinalNewLine"}),r&&u&&r.setSelections(u)}finally{t.report({increment:100}),i.dispose()}}};w=C([g(0,F),g(1,N),g(2,D)],w);let L=class{constructor(e,o,t,i,l){this.configurationService=e;this.logService=o;this.workspaceTrustManagementService=t;this.textModelService=i;this.instantiationService=l}async participate(e,o,t,i){if(!this.workspaceTrustManagementService.isWorkspaceTrusted()||!e.model||!(e.model instanceof M))return;let r="";if(o.reason===A.AUTO)return;if(o.reason===A.EXPLICIT)r="explicit";else return;const u=e.model.notebookModel,p=this.configurationService.getValue(K.codeActionsOnSave),v=Array.isArray(p)?p:Object.keys(p).filter(d=>p[d]),a=this.createCodeActionsOnSave(v),s=a.filter(d=>p[d.value]==="never"||p[d.value]===!1),n=a.filter(d=>p[d.value]===r||p[d.value]===!0),c=n.filter(d=>!x.Notebook.contains(d)),f=n.filter(d=>x.Notebook.contains(d));if(f.length){const d=new h;t.report({message:I("notebookSaveParticipants.notebookCodeActions","Running 'Notebook' code actions")});try{const y=u.cells[0],m=await this.textModelService.createModelReference(y.uri);d.add(m);const k=m.object.textEditorModel;await this.instantiationService.invokeFunction(b.applyOnSaveGenericCodeActions,k,f,s,t,i)}catch{this.logService.error("Failed to apply notebook code action on save")}finally{t.report({increment:100}),d.dispose()}}if(c.length){Array.isArray(p)||c.sort((y,m)=>x.SourceFixAll.contains(y)?x.SourceFixAll.contains(m)?0:-1:x.SourceFixAll.contains(m)?1:0);const d=new h;t.report({message:I("notebookSaveParticipants.cellCodeActions","Running 'Cell' code actions")});try{await Promise.all(u.cells.map(async y=>{const m=await this.textModelService.createModelReference(y.uri);d.add(m);const k=m.object.textEditorModel;await this.instantiationService.invokeFunction(b.applyOnSaveGenericCodeActions,k,c,s,t,i)}))}catch{this.logService.error("Failed to apply code action on save")}finally{t.report({increment:100}),d.dispose()}}}createCodeActionsOnSave(e){const o=e.map(t=>new q(t));return o.filter(t=>o.every(i=>i.equals(t)||!i.contains(t)))}};L=C([g(0,F),g(1,B),g(2,ce),g(3,_),g(4,E)],L);class b{static async checkAndRunFormatCodeAction(e,o,t,i){const l=e.get(E),r=e.get(_),u=e.get(B),p=e.get(F),v=new h;let a=!1;t.report({message:I("notebookSaveParticipants.formatCodeActions","Running 'Format' code actions")});try{const s=o.cells[0],n=await r.createModelReference(s.uri);v.add(n);const c=n.object.textEditorModel,f=p.getValue(K.defaultFormatter);a=await l.invokeFunction(b.applyOnSaveFormatCodeAction,c,new q("notebook.format"),[],f,t,i)}catch{u.error("Failed to apply notebook format action on save")}finally{t.report({increment:100}),v.dispose()}return a}static async applyOnSaveGenericCodeActions(e,o,t,i,l,r){const u=e.get(E),p=e.get(V),v=e.get(B),a=new class{_names=new Set;_report(){l.report({message:I({key:"codeaction.get2",comment:["[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}"]},"Getting code actions from '{0}' ([configure]({1})).",[...this._names].map(s=>`'${s}'`).join(", "),"command:workbench.action.openSettings?%5B%22notebook.codeActionsOnSave%22%5D")})}report(s){s.displayName&&!this._names.has(s.displayName)&&(this._names.add(s.displayName),this._report())}};for(const s of t){const n=await b.getActionsToRun(o,s,i,p,a,r);if(r.isCancellationRequested){n.dispose();return}try{for(const c of n.validActions){const f=c.action.edit?.edits;let d=!1;if(!c.action.kind?.startsWith("notebook"))for(const y of f??[]){const m=y;if(!(m.resource&&Q(m.resource,o.uri))){d=!0;break}}if(d){v.warn("Failed to apply code action on save, applied to multiple resources.");continue}if(l.report({message:I("codeAction.apply","Applying code action '{0}'.",c.action.title)}),await u.invokeFunction(U,c,$.OnSave,{},r),r.isCancellationRequested)return}}catch{}finally{n.dispose()}}}static async applyOnSaveFormatCodeAction(e,o,t,i,l,r,u){const p=e.get(E),v=e.get(V),a=e.get(B),s=new class{_names=new Set;_report(){r.report({message:I({key:"codeaction.get2",comment:["[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}"]},"Getting code actions from '{0}' ([configure]({1})).",[...this._names].map(c=>`'${c}'`).join(", "),"command:workbench.action.openSettings?%5B%22notebook.defaultFormatter%22%5D")})}report(c){c.displayName&&!this._names.has(c.displayName)&&(this._names.add(c.displayName),this._report())}},n=await b.getActionsToRun(o,t,i,v,s,u);if(n.validActions.length>1&&!l&&a.warn("More than one format code action is provided, the 0th one will be used. A default can be specified via `notebook.defaultFormatter` in your settings."),u.isCancellationRequested)return n.dispose(),!1;try{const c=l?n.validActions.find(f=>f.provider?.extensionId===l):n.validActions[0];if(!c||(r.report({message:I("codeAction.apply","Applying code action '{0}'.",c.action.title)}),await p.invokeFunction(U,c,$.OnSave,{},u),u.isCancellationRequested))return!1}catch{return a.error("Failed to apply notebook format code action on save"),!1}finally{n.dispose()}return!0}static getActionsToRun(e,o,t,i,l,r){return oe(i.codeActionProvider,e,e.getFullModelRange(),{type:ee.Invoke,triggerAction:ie.OnSave,filter:{include:o,excludes:t,includeSourceActions:!0}},l,r)}}function H(S){const e=S.activeEditorPane;return ge(e)?.activeCodeEditor}let R=class extends J{constructor(o,t){super();this.instantiationService=o;this.workingCopyFileService=t;this.registerSaveParticipants()}registerSaveParticipants(){this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(W))),this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(L))),this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(P))),this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(w))),this._register(this.workingCopyFileService.addSaveParticipant(this.instantiationService.createInstance(T)))}};R=C([g(0,E),g(1,pe)],R);const ue=se.as(le.Workbench);ue.registerWorkbenchContribution(R,de.Restored);export{b as CodeActionParticipantUtils,R as SaveParticipantsContribution};
