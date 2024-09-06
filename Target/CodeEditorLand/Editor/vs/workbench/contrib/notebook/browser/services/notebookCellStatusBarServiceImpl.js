import"../../../../../../vs/base/common/cancellation.js";import{onUnexpectedExternalError as l}from"../../../../../../vs/base/common/errors.js";import{Emitter as s}from"../../../../../../vs/base/common/event.js";import{Disposable as d,toDisposable as m}from"../../../../../../vs/base/common/lifecycle.js";import"../../../../../../vs/base/common/uri.js";import"../../../../../../vs/workbench/contrib/notebook/common/notebookCellStatusBarService.js";import"../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";class k extends d{_serviceBrand;_onDidChangeProviders=this._register(new s);onDidChangeProviders=this._onDidChangeProviders.event;_onDidChangeItems=this._register(new s);onDidChangeItems=this._onDidChangeItems.event;_providers=[];registerCellStatusBarItemProvider(e){this._providers.push(e);let t;return e.onDidChangeStatusBarItems&&(t=e.onDidChangeStatusBarItems(()=>this._onDidChangeItems.fire())),this._onDidChangeProviders.fire(),m(()=>{t?.dispose();const o=this._providers.findIndex(i=>i===e);this._providers.splice(o,1)})}async getStatusBarItemsForCell(e,t,o,i){const a=this._providers.filter(r=>r.viewType===o||r.viewType==="*");return await Promise.all(a.map(async r=>{try{return await r.provideCellStatusBarItems(e,t,i)??{items:[]}}catch(n){return l(n),{items:[]}}}))}}export{k as NotebookCellStatusBarService};
