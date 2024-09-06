var k=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var l=(n,r,t,o)=>{for(var e=o>1?void 0:o?_(r,t):r,i=n.length-1,c;i>=0;i--)(c=n[i])&&(e=(o?c(r,t,e):c(e))||e);return o&&e&&k(r,t,e),e},u=(n,r)=>(t,o)=>r(t,o,n);import{throttle as v}from"../../../../../../base/common/decorators.js";import{Disposable as E,MutableDisposable as p}from"../../../../../../base/common/lifecycle.js";import{IUserActivityService as x}from"../../../../../services/userActivity/common/userActivityService.js";import{NotebookCellExecutionState as g}from"../../../common/notebookCommon.js";import{INotebookExecutionStateService as f}from"../../../common/notebookExecutionStateService.js";import"../../notebookBrowser.js";import{registerNotebookContribution as m}from"../../notebookEditorExtensions.js";let s=class extends E{constructor(t,o,e){super();this._notebookEditor=t;this._notebookExecutionStateService=o;this._userActivity=e;this._register(t.onDidScroll(()=>this._update())),this._register(o.onDidChangeExecution(i=>{i.notebook.toString()===this._notebookEditor.textModel?.uri.toString()&&this._update()})),this._register(t.onDidChangeModel(()=>this._update()))}static id="workbench.notebook.executionEditorProgress";_activityMutex=this._register(new p);_update(){if(!this._notebookEditor.hasModel())return;const t=this._notebookExecutionStateService.getCellExecutionsForNotebook(this._notebookEditor.textModel?.uri).filter(a=>a.state===g.Executing),o=this._notebookExecutionStateService.getExecution(this._notebookEditor.textModel?.uri),e=a=>{for(const d of this._notebookEditor.visibleRanges)for(const h of this._notebookEditor.getCellsInRange(d))if(h.handle===a.cellHandle){const b=this._notebookEditor.getAbsoluteTopOfElement(h);if(this._notebookEditor.scrollTop<b+5)return!0}return!1},i=t.length||o;i&&!this._activityMutex.value?this._activityMutex.value=this._userActivity.markActive():!i&&this._activityMutex.value&&this._activityMutex.clear();const c=t.length&&!t.some(e)&&!t.some(a=>a.isPaused);!!o||c?this._notebookEditor.showProgress():this._notebookEditor.hideProgress()}};l([v(100)],s.prototype,"_update",1),s=l([u(1,f),u(2,x)],s),m(s.id,s);export{s as ExecutionEditorProgressController};
