var R=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var g=(s,r,e,i)=>{for(var t=i>1?void 0:i?F(r,e):r,o=s.length-1,n;o>=0;o--)(n=s[o])&&(t=(i?n(r,e,t):n(t))||t);return i&&t&&R(r,e,t),t},c=(s,r)=>(e,i)=>r(e,i,s);import{disposableTimeout as C,RunOnceScheduler as U}from"../../../../../../base/common/async.js";import{Disposable as E,dispose as M,MutableDisposable as P}from"../../../../../../base/common/lifecycle.js";import{language as L}from"../../../../../../base/common/platform.js";import{localize as u}from"../../../../../../nls.js";import{IInstantiationService as y}from"../../../../../../platform/instantiation/common/instantiation.js";import{themeColorFromId as w}from"../../../../../../platform/theme/common/themeService.js";import{ThemeIcon as O}from"../../../../../../base/common/themables.js";import{NotebookVisibleCellObserver as B}from"./notebookVisibleCellObserver.js";import{registerNotebookContribution as T}from"../../notebookEditorExtensions.js";import{cellStatusIconError as G,cellStatusIconSuccess as X}from"../../notebookEditorWidget.js";import{errorStateIcon as j,executingStateIcon as D,pendingStateIcon as z,successStateIcon as J}from"../../notebookIcons.js";import{CellStatusbarAlignment as k,NotebookCellExecutionState as m}from"../../../common/notebookCommon.js";import{INotebookExecutionStateService as V,NotebookExecutionType as q}from"../../../common/notebookExecutionStateService.js";import{INotebookService as H}from"../../../common/notebookService.js";function h(s,r=!0){if(r&&s<1e3)return`${s}ms`;const e=Math.floor(s/1e3/60),i=Math.floor(s/1e3)%60,t=Math.floor(s%1e3/100);return e>0?`${e}m ${i}.${t}s`:`${i}.${t}s`}class A extends E{constructor(e,i){super();this._notebookEditor=e;this._itemFactory=i;this._observer=this._register(new B(this._notebookEditor)),this._register(this._observer.onDidChangeVisibleCells(this._updateVisibleCells,this)),this._updateEverything()}_visibleCells=new Map;_observer;_updateEverything(){this._visibleCells.forEach(M),this._visibleCells.clear(),this._updateVisibleCells({added:this._observer.visibleCells,removed:[]})}_updateVisibleCells(e){const i=this._notebookEditor.getViewModel();if(i){for(const t of e.removed)this._visibleCells.get(t.handle)?.dispose(),this._visibleCells.delete(t.handle);for(const t of e.added)this._visibleCells.set(t.handle,this._itemFactory(i,t))}}dispose(){super.dispose(),this._visibleCells.forEach(M),this._visibleCells.clear()}}let p=class extends E{static id="workbench.notebook.statusBar.execState";constructor(r,e){super(),this._register(new A(r,(i,t)=>e.createInstance(l,i,t)))}};p=g([c(1,y)],p),T(p.id,p);let l=class extends E{constructor(e,i,t){super();this._notebookViewModel=e;this._cell=i;this._executionStateService=t;this._update(),this._register(this._executionStateService.onDidChangeExecution(o=>{o.type===q.cell&&o.affectsCell(this._cell.uri)&&this._update()})),this._register(this._cell.model.onDidChangeInternalMetadata(()=>this._update()))}static MIN_SPINNER_TIME=500;_currentItemIds=[];_showedExecutingStateTime;_clearExecutingStateTimer=this._register(new P);async _update(){const e=this._getItemsForCell();Array.isArray(e)&&(this._currentItemIds=this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds,[{handle:this._cell.handle,items:e}]))}_getItemsForCell(){const e=this._executionStateService.getCellExecution(this._cell.uri);if(e?.state===m.Executing&&typeof this._showedExecutingStateTime!="number")this._showedExecutingStateTime=Date.now();else if(e?.state!==m.Executing&&typeof this._showedExecutingStateTime=="number"){const t=l.MIN_SPINNER_TIME-(Date.now()-this._showedExecutingStateTime);if(t>0){this._clearExecutingStateTimer.value||(this._clearExecutingStateTimer.value=C(()=>{this._showedExecutingStateTime=void 0,this._clearExecutingStateTimer.clear(),this._update()},t));return}else this._showedExecutingStateTime=void 0}return this._getItemForState(e,this._cell.internalMetadata)}_getItemForState(e,i){const t=e?.state,{lastRunSuccess:o}=i;return!t&&o?[{text:`$(${J.id})`,color:w(X),tooltip:u("notebook.cell.status.success","Success"),alignment:k.Left,priority:Number.MAX_SAFE_INTEGER}]:!t&&o===!1?[{text:`$(${j.id})`,color:w(G),tooltip:u("notebook.cell.status.failed","Failed"),alignment:k.Left,priority:Number.MAX_SAFE_INTEGER}]:t===m.Pending||t===m.Unconfirmed?[{text:`$(${z.id})`,tooltip:u("notebook.cell.status.pending","Pending"),alignment:k.Left,priority:Number.MAX_SAFE_INTEGER}]:t===m.Executing?[{text:`$(${(e?.didPause?D:O.modify(D,"spin")).id})`,tooltip:u("notebook.cell.status.executing","Executing"),alignment:k.Left,priority:Number.MAX_SAFE_INTEGER}]:[]}dispose(){super.dispose(),this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds,[{handle:this._cell.handle,items:[]}])}};l=g([c(2,V)],l);let _=class extends E{static id="workbench.notebook.statusBar.execTimer";constructor(r,e){super(),this._register(new A(r,(i,t)=>e.createInstance(a,i,t)))}};_=g([c(1,y)],_),T(_.id,_);const K=200;let a=class extends E{constructor(e,i,t,o){super();this._notebookViewModel=e;this._cell=i;this._executionStateService=t;this._notebookService=o;this._scheduler=this._register(new U(()=>this._update(),a.UPDATE_INTERVAL)),this._update(),this._register(this._cell.model.onDidChangeInternalMetadata(()=>this._update()))}static UPDATE_INTERVAL=100;_currentItemIds=[];_scheduler;_deferredUpdate;async _update(){let e;const i=this._executionStateService.getCellExecution(this._cell.uri),t=i?.state,o=this._cell.internalMetadata.runStartTime,n=this._cell.internalMetadata.runStartTimeAdjustment??0,d=this._cell.internalMetadata.runEndTime;if(i?.didPause)e=void 0;else if(t===m.Executing)typeof o=="number"&&(e=this._getTimeItem(o,Date.now(),n),this._scheduler.schedule());else if(!t&&typeof o=="number"&&typeof d=="number"){const b=Date.now()-o+n,f=d-o,S=this._cell.internalMetadata.renderDuration??{};e=this._getTimeItem(o,d,void 0,{timerDuration:b,executionDuration:f,renderDuration:S})}const I=e?[e]:[];!I.length&&i?this._deferredUpdate||(this._deferredUpdate=C(()=>{this._deferredUpdate=void 0,this._currentItemIds=this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds,[{handle:this._cell.handle,items:I}])},K)):(this._deferredUpdate?.dispose(),this._deferredUpdate=void 0,this._currentItemIds=this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds,[{handle:this._cell.handle,items:I}]))}_getTimeItem(e,i,t=0,o){const n=i-e+t;let d;if(o){const I=new Date(i).toLocaleTimeString(L),{renderDuration:b,executionDuration:f,timerDuration:S}=o;let N="";for(const v in b){const x=this._notebookService.getRendererInfo(v),$=encodeURIComponent(JSON.stringify({extensionId:x?.extensionId.value??"",issueBody:`Auto-generated text from notebook cell performance. The duration for the renderer, ${x?.displayName??v}, is slower than expected.
Execution Time: ${h(f)}
Renderer Duration: ${h(b[v])}
`}));N+=`- [${x?.displayName??v}](command:workbench.action.openIssueReporter?${$}) ${h(b[v])}
`}N+=`
*${u("notebook.cell.statusBar.timerTooltip.reportIssueFootnote","Use the links above to file an issue using the issue reporter.")}*
`,d={value:u("notebook.cell.statusBar.timerTooltip",`**Last Execution** {0}

**Execution Time** {1}

**Overhead Time** {2}

**Render Times**

{3}`,I,h(f),h(S-f),N),isTrusted:!0}}return{text:h(n,!1),alignment:k.Left,priority:Number.MAX_SAFE_INTEGER-5,tooltip:d}}dispose(){super.dispose(),this._deferredUpdate?.dispose(),this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds,[{handle:this._cell.handle,items:[]}])}};a=g([c(2,V),c(3,H)],a);export{p as ExecutionStateCellStatusBarContrib,A as NotebookStatusBarController,_ as TimerCellStatusBarContrib,h as formatCellDuration};
