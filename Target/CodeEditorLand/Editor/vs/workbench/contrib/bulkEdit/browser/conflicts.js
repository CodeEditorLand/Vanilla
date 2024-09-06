var p=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var a=(c,t,r,o)=>{for(var s=o>1?void 0:o?h(t,r):t,i=c.length-1,d;i>=0;i--)(d=c[i])&&(s=(o?d(t,r,s):d(s))||s);return o&&s&&p(t,r,s),s},l=(c,t)=>(r,o)=>t(r,o,c);import{Emitter as m}from"../../../../../vs/base/common/event.js";import{DisposableStore as _}from"../../../../../vs/base/common/lifecycle.js";import{ResourceMap as u}from"../../../../../vs/base/common/map.js";import"../../../../../vs/base/common/uri.js";import{ResourceFileEdit as v,ResourceTextEdit as I}from"../../../../../vs/editor/browser/services/bulkEditService.js";import"../../../../../vs/editor/common/model.js";import{IModelService as R}from"../../../../../vs/editor/common/services/model.js";import{IFileService as b}from"../../../../../vs/platform/files/common/files.js";import{ILogService as C}from"../../../../../vs/platform/log/common/log.js";import{ResourceNotebookCellEdit as g}from"../../../../../vs/workbench/contrib/bulkEdit/browser/bulkCellEdits.js";let f=class{_conflicts=new u;_disposables=new _;_onDidConflict=new m;onDidConflict=this._onDidConflict.event;constructor(t,r,o,s){const i=new u;for(const e of t)if(e instanceof I){if(i.set(e.resource,!0),typeof e.versionId=="number"){const n=o.getModel(e.resource);n&&n.getVersionId()!==e.versionId&&(this._conflicts.set(e.resource,!0),this._onDidConflict.fire(this))}}else e instanceof v?e.newResource?i.set(e.newResource,!0):e.oldResource&&i.set(e.oldResource,!0):e instanceof g?i.set(e.resource,!0):s.warn("UNKNOWN edit type",e);this._disposables.add(r.onDidFilesChange(e=>{for(const n of i.keys())if(!o.getModel(n)&&e.contains(n)){this._conflicts.set(n,!0),this._onDidConflict.fire(this);break}}));const d=e=>{i.has(e.uri)&&(this._conflicts.set(e.uri,!0),this._onDidConflict.fire(this))};for(const e of o.getModels())this._disposables.add(e.onDidChangeContent(()=>d(e)))}dispose(){this._disposables.dispose(),this._onDidConflict.dispose()}list(){return[...this._conflicts.keys()]}hasConflicts(){return this._conflicts.size>0}};f=a([l(1,b),l(2,R),l(3,C)],f);export{f as ConflictDetector};