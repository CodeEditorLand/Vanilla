var v=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var c=(n,t,o,e)=>{for(var i=e>1?void 0:e?h(t,o):t,r=n.length-1,s;r>=0;r--)(s=n[r])&&(i=(e?s(t,o,i):s(i))||i);return e&&i&&v(t,o,i),i},d=(n,t)=>(o,e)=>t(o,e,n);import{DisposableStore as l,dispose as m}from"../../../../vs/base/common/lifecycle.js";import{equals as E}from"../../../../vs/base/common/objects.js";import{URI as b}from"../../../../vs/base/common/uri.js";import{IConfigurationService as I}from"../../../../vs/platform/configuration/common/configuration.js";import{EditorActivation as f}from"../../../../vs/platform/editor/common/editor.js";import{getNotebookEditorFromEditorPane as u}from"../../../../vs/workbench/contrib/notebook/browser/notebookBrowser.js";import{INotebookEditorService as S}from"../../../../vs/workbench/contrib/notebook/browser/services/notebookEditorService.js";import"../../../../vs/workbench/contrib/notebook/common/notebookRange.js";import{columnToEditorGroup as _,editorGroupToColumn as g}from"../../../../vs/workbench/services/editor/common/editorGroupColumn.js";import{IEditorGroupsService as C}from"../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorService as k}from"../../../../vs/workbench/services/editor/common/editorService.js";import"../../../../vs/workbench/services/extensions/common/extHostCustomers.js";import{ExtHostContext as w,NotebookEditorRevealType as a}from"../common/extHost.protocol.js";class y{constructor(t,o){this.editor=t;this.disposables=o}dispose(){this.disposables.dispose()}}let p=class{constructor(t,o,e,i,r){this._editorService=o;this._notebookEditorService=e;this._editorGroupService=i;this._configurationService=r;this._proxy=t.getProxy(w.ExtHostNotebookEditors),this._editorService.onDidActiveEditorChange(()=>this._updateEditorViewColumns(),this,this._disposables),this._editorGroupService.onDidRemoveGroup(()=>this._updateEditorViewColumns(),this,this._disposables),this._editorGroupService.onDidMoveGroup(()=>this._updateEditorViewColumns(),this,this._disposables)}_disposables=new l;_proxy;_mainThreadEditors=new Map;_currentViewColumnInfo;dispose(){this._disposables.dispose(),m(this._mainThreadEditors.values())}handleEditorsAdded(t){for(const o of t){const e=new l;e.add(o.onDidChangeVisibleRanges(()=>{this._proxy.$acceptEditorPropertiesChanged(o.getId(),{visibleRanges:{ranges:o.visibleRanges}})})),e.add(o.onDidChangeSelection(()=>{this._proxy.$acceptEditorPropertiesChanged(o.getId(),{selections:{selections:o.getSelections()}})}));const i=new y(o,e);this._mainThreadEditors.set(o.getId(),i)}}handleEditorsRemoved(t){for(const o of t)this._mainThreadEditors.get(o)?.dispose(),this._mainThreadEditors.delete(o)}_updateEditorViewColumns(){const t=Object.create(null);for(const o of this._editorService.visibleEditorPanes){const e=u(o);e&&this._mainThreadEditors.has(e.getId())&&(t[e.getId()]=g(this._editorGroupService,o.group))}E(t,this._currentViewColumnInfo)||(this._currentViewColumnInfo=t,this._proxy.$acceptEditorViewColumns(t))}async $tryShowNotebookDocument(t,o,e){const i={cellSelections:e.selections,preserveFocus:e.preserveFocus,pinned:e.pinned,activation:e.preserveFocus?f.RESTORE:void 0,label:e.label,override:o},r=await this._editorService.openEditor({resource:b.revive(t),options:i},_(this._editorGroupService,this._configurationService,e.position)),s=u(r);if(s)return s.getId();throw new Error(`Notebook Editor creation failure for document ${JSON.stringify(t)}`)}async $tryRevealRange(t,o,e){const i=this._notebookEditorService.getNotebookEditor(t);if(!i)return;const r=i;if(!r.hasModel()||o.start>=r.getLength())return;const s=r.cellAt(o.start);switch(e){case a.Default:return r.revealCellRangeInView(o);case a.InCenter:return r.revealInCenter(s);case a.InCenterIfOutsideViewport:return r.revealInCenterIfOutsideViewport(s);case a.AtTop:return r.revealInViewAtTop(s)}}$trySetSelections(t,o){const e=this._notebookEditorService.getNotebookEditor(t);e&&(e.setSelections(o),o.length&&e.setFocus({start:o[0].start,end:o[0].start+1}))}};p=c([d(1,k),d(2,S),d(3,C),d(4,I)],p);export{p as MainThreadNotebookEditors};
