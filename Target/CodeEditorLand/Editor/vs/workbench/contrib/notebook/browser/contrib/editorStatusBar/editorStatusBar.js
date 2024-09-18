var T=Object.defineProperty;var z=Object.getOwnPropertyDescriptor;var p=(l,n,e,t)=>{for(var o=t>1?void 0:t?z(n,e):n,i=l.length-1,s;i>=0;i--)(s=l[i])&&(o=(t?s(n,e,o):s(o))||o);return t&&o&&T(n,e,o),o},a=(l,n)=>(e,t)=>n(e,t,l);import*as c from"../../../../../../nls.js";import{Disposable as I,DisposableStore as b,MutableDisposable as w}from"../../../../../../base/common/lifecycle.js";import{Schemas as K}from"../../../../../../base/common/network.js";import{ILanguageFeaturesService as L}from"../../../../../../editor/common/services/languageFeatures.js";import{IConfigurationService as A}from"../../../../../../platform/configuration/common/configuration.js";import{IInstantiationService as M}from"../../../../../../platform/instantiation/common/instantiation.js";import{ILogService as O}from"../../../../../../platform/log/common/log.js";import{WorkbenchPhase as P,registerWorkbenchContribution2 as R}from"../../../../../common/contributions.js";import{CENTER_ACTIVE_CELL as W}from"../navigation/arrow.js";import{SELECT_KERNEL_ID as f}from"../../controller/coreActions.js";import{SELECT_NOTEBOOK_INDENTATION_ID as G}from"../../controller/editActions.js";import{getNotebookEditorFromEditorPane as C}from"../../notebookBrowser.js";import"../../../common/model/notebookTextModel.js";import{NotebookCellsChangeType as g}from"../../../common/notebookCommon.js";import{INotebookKernelService as x}from"../../../common/notebookKernelService.js";import{IEditorService as D}from"../../../../../services/editor/common/editorService.js";import{IStatusbarService as y,StatusbarAlignment as k}from"../../../../../services/statusbar/browser/statusbar.js";import{IEditorGroupsService as F}from"../../../../../services/editor/common/editorGroupsService.js";import{Event as H}from"../../../../../../base/common/event.js";let _=class{dispose;constructor(n,e,t,o,i){const s=new b;this.dispose=s.dispose.bind(s);const d=()=>{s.clear(),t.selectKernelForNotebook(e,n)};s.add(n.onDidChangeContent(r=>{for(const h of r.rawEvents)switch(h.kind){case g.ChangeCellContent:case g.ModelChange:case g.Move:case g.ChangeCellLanguage:i.trace("IMPLICIT kernel selection because of change event",h.kind),d();break}})),s.add(o.hoverProvider.register({scheme:K.vscodeNotebookCell,pattern:n.uri.path},{provideHover(){i.trace("IMPLICIT kernel selection because of hover"),d()}}))}};_=p([a(2,x),a(3,L),a(4,O)],_);let u=class extends I{constructor(e,t,o,i){super();this._editorService=e;this._statusbarService=t;this._notebookKernelService=o;this._instantiationService=i;this._register(this._editorService.onDidActiveEditorChange(()=>this._updateStatusbar()))}_editorDisposables=this._register(new b);_kernelInfoElement=this._register(new b);_updateStatusbar(){this._editorDisposables.clear();const e=C(this._editorService.activeEditorPane);if(!e){this._kernelInfoElement.clear();return}const t=()=>{if(e.notebookOptions.getDisplayOptions().globalToolbar){this._kernelInfoElement.clear();return}const o=e.textModel;o?this._showKernelStatus(o):this._kernelInfoElement.clear()};this._editorDisposables.add(this._notebookKernelService.onDidAddKernel(t)),this._editorDisposables.add(this._notebookKernelService.onDidChangeSelectedNotebooks(t)),this._editorDisposables.add(this._notebookKernelService.onDidChangeNotebookAffinity(t)),this._editorDisposables.add(e.onDidChangeModel(t)),this._editorDisposables.add(e.notebookOptions.onDidChangeOptions(t)),t()}_showKernelStatus(e){this._kernelInfoElement.clear();const{selected:t,suggestions:o,all:i}=this._notebookKernelService.getMatchingKernel(e),s=(o.length===1?o[0]:void 0)??i.length===1?i[0]:void 0;let d=!1;if(i.length!==0)if(t||s){let r=t;r||(r=s,d=!0,this._kernelInfoElement.add(this._instantiationService.createInstance(_,e,r)));const h=r.description??r.detail??r.label;this._kernelInfoElement.add(this._statusbarService.addEntry({name:c.localize("notebook.info","Notebook Kernel Info"),text:`$(notebook-kernel-select) ${r.label}`,ariaLabel:r.label,tooltip:d?c.localize("tooltop","{0} (suggestion)",h):h,command:f},f,k.RIGHT,10)),this._kernelInfoElement.add(r.onDidChange(()=>this._showKernelStatus(e)))}else this._kernelInfoElement.add(this._statusbarService.addEntry({name:c.localize("notebook.select","Notebook Kernel Selection"),text:c.localize("kernel.select.label","Select Kernel"),ariaLabel:c.localize("kernel.select.label","Select Kernel"),command:f,kind:"prominent"},f,k.RIGHT,10))}};u=p([a(0,D),a(1,y),a(2,x),a(3,M)],u);let S=class extends I{constructor(e,t){super();this._editorService=e;this._statusbarService=t;this._register(this._editorService.onDidActiveEditorChange(()=>this._update()))}_itemDisposables=this._register(new b);_accessor=this._register(new w);_update(){this._itemDisposables.clear();const e=C(this._editorService.activeEditorPane);e?(this._itemDisposables.add(e.onDidChangeSelection(()=>this._show(e))),this._itemDisposables.add(e.onDidChangeActiveCell(()=>this._show(e))),this._show(e)):this._accessor.clear()}_show(e){if(!e.hasModel()){this._accessor.clear();return}const t=this._getSelectionsText(e);if(!t){this._accessor.clear();return}const o={name:c.localize("notebook.activeCellStatusName","Notebook Editor Selections"),text:t,ariaLabel:t,command:W};this._accessor.value?this._accessor.value.update(o):this._accessor.value=this._statusbarService.addEntry(o,"notebook.activeCellStatus",k.RIGHT,100)}_getSelectionsText(e){if(!e.hasModel())return;const t=e.getActiveCell();if(!t)return;const o=e.getCellIndex(t)+1,i=e.getSelections().reduce((d,r)=>d+(r.end-r.start),0),s=e.getLength();return i>1?c.localize("notebook.multiActiveCellIndicator","Cell {0} ({1} selected)",o,i):c.localize("notebook.singleActiveCellIndicator","Cell {0} of {1}",o,s)}};S=p([a(0,D),a(1,y)],S);let m=class extends I{constructor(e,t,o){super();this._editorService=e;this._statusbarService=t;this._configurationService=o;this._register(this._editorService.onDidActiveEditorChange(()=>this._update())),this._register(this._configurationService.onDidChangeConfiguration(i=>{(i.affectsConfiguration("editor")||i.affectsConfiguration("notebook"))&&this._update()}))}_itemDisposables=this._register(new b);_accessor=this._register(new w);static ID="selectNotebookIndentation";_update(){this._itemDisposables.clear();const e=C(this._editorService.activeEditorPane);e?(this._show(e),this._itemDisposables.add(e.onDidChangeSelection(()=>{this._accessor.clear(),this._show(e)}))):this._accessor.clear()}_show(e){if(!e.hasModel()){this._accessor.clear();return}const t=e.getActiveCell()?.textModel?.getOptions();if(!t){this._accessor.clear();return}const o=e.notebookOptions.getDisplayOptions().editorOptionsCustomizations,i=o?.["editor.indentSize"]??t?.indentSize,s=o?.["editor.insertSpaces"]??t?.insertSpaces,d=o?.["editor.tabSize"]??t?.tabSize,r=typeof i=="number"?i:d,E=s?`Spaces: ${r}`:`Tab Size: ${r}`;if(!E){this._accessor.clear();return}const N={name:c.localize("notebook.indentation","Notebook Indentation"),text:E,ariaLabel:E,tooltip:c.localize("selectNotebookIndentation","Select Indentation"),command:G};this._accessor.value?this._accessor.value.update(N):this._accessor.value=this._statusbarService.addEntry(N,"notebook.status.indentation",k.RIGHT,100.4)}};m=p([a(0,D),a(1,y),a(2,A)],m);let v=class extends I{constructor(e){super();this.editorGroupService=e;for(const t of e.parts)this.createNotebookStatus(t);this._register(e.onDidCreateAuxiliaryEditorPart(t=>this.createNotebookStatus(t)))}static ID="notebook.contrib.editorStatus";createNotebookStatus(e){const t=new b;H.once(e.onWillDispose)(()=>t.dispose());const o=this.editorGroupService.getScopedInstantiationService(e);t.add(o.createInstance(u)),t.add(o.createInstance(S)),t.add(o.createInstance(m))}};v=p([a(0,F)],v),R(v.ID,v,P.AfterRestored);export{S as ActiveCellStatus,u as KernelStatus,v as NotebookEditorStatusContribution,m as NotebookIndentationStatus};
