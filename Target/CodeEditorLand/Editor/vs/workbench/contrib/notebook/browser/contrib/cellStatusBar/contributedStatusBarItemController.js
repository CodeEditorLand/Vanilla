var u=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var h=(n,l,e,o)=>{for(var t=o>1?void 0:o?v(l,e):l,s=n.length-1,r;s>=0;s--)(r=n[s])&&(t=(o?r(l,e,t):r(t))||t);return o&&t&&u(l,e,t),t},_=(n,l)=>(e,o)=>l(e,o,n);import{Throttler as b}from"../../../../../../base/common/async.js";import{CancellationTokenSource as C}from"../../../../../../base/common/cancellation.js";import{Disposable as p,toDisposable as m}from"../../../../../../base/common/lifecycle.js";import{INotebookCellStatusBarService as k}from"../../../common/notebookCellStatusBarService.js";import"../../../common/notebookCommon.js";import"../../notebookBrowser.js";import{registerNotebookContribution as S}from"../../notebookEditorExtensions.js";import{NotebookVisibleCellObserver as g}from"./notebookVisibleCellObserver.js";let d=class extends p{constructor(e,o){super();this._notebookEditor=e;this._notebookCellStatusBarService=o;this._observer=this._register(new g(this._notebookEditor)),this._register(this._observer.onDidChangeVisibleCells(this._updateVisibleCells,this)),this._updateEverything(),this._register(this._notebookCellStatusBarService.onDidChangeProviders(this._updateEverything,this)),this._register(this._notebookCellStatusBarService.onDidChangeItems(this._updateEverything,this))}static id="workbench.notebook.statusBar.contributed";_visibleCells=new Map;_observer;_updateEverything(){const e=this._observer.visibleCells.filter(i=>!this._visibleCells.has(i.handle)),o=new Set(this._observer.visibleCells.map(i=>i.handle)),t=Array.from(this._visibleCells.keys()),s=t.filter(i=>!o.has(i)),r=t.filter(i=>o.has(i));this._updateVisibleCells({added:e,removed:s.map(i=>({handle:i}))}),r.forEach(i=>this._visibleCells.get(i)?.update())}_updateVisibleCells(e){const o=this._notebookEditor.getViewModel();if(o){for(const t of e.added){const s=new I(o,t,this._notebookCellStatusBarService);this._visibleCells.set(t.handle,s)}for(const t of e.removed)this._visibleCells.get(t.handle)?.dispose(),this._visibleCells.delete(t.handle)}}dispose(){super.dispose(),this._visibleCells.forEach(e=>e.dispose()),this._visibleCells.clear()}};d=h([_(1,k)],d);class I extends p{constructor(e,o,t){super();this._notebookViewModel=e;this._cell=o;this._notebookCellStatusBarService=t;this._register(m(()=>this._activeToken?.dispose(!0))),this._updateSoon(),this._register(this._cell.model.onDidChangeContent(()=>this._updateSoon())),this._register(this._cell.model.onDidChangeLanguage(()=>this._updateSoon())),this._register(this._cell.model.onDidChangeMetadata(()=>this._updateSoon())),this._register(this._cell.model.onDidChangeInternalMetadata(()=>this._updateSoon())),this._register(this._cell.model.onDidChangeOutputs(()=>this._updateSoon()))}_currentItemIds=[];_currentItemLists=[];_activeToken;_isDisposed=!1;_updateThrottler=this._register(new b);update(){this._updateSoon()}_updateSoon(){setTimeout(()=>{this._isDisposed||this._updateThrottler.queue(()=>this._update())},0)}async _update(){const e=this._notebookViewModel.getCellIndex(this._cell),o=this._notebookViewModel.notebookDocument.uri,t=this._notebookViewModel.notebookDocument.viewType;this._activeToken?.dispose(!0);const s=this._activeToken=new C,r=await this._notebookCellStatusBarService.getStatusBarItemsForCell(o,e,t,s.token);if(s.token.isCancellationRequested){r.forEach(a=>a.dispose&&a.dispose());return}const i=r.map(a=>a.items).flat(),c=this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds,[{handle:this._cell.handle,items:i}]);this._currentItemLists.forEach(a=>a.dispose&&a.dispose()),this._currentItemLists=r,this._currentItemIds=c}dispose(){super.dispose(),this._isDisposed=!0,this._activeToken?.dispose(!0),this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds,[{handle:this._cell.handle,items:[]}]),this._currentItemLists.forEach(e=>e.dispose&&e.dispose())}}S(d.id,d);export{d as ContributedStatusBarItemController};
