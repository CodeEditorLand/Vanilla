var L=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var _=(l,s,e,t)=>{for(var o=t>1?void 0:t?R(s,e):s,i=l.length-1,n;i>=0;i--)(n=l[i])&&(o=(t?n(s,e,o):n(o))||o);return t&&o&&L(s,e,o),o},r=(l,s)=>(e,t)=>s(e,t,l);import{Emitter as h}from"../../../../../../vs/base/common/event.js";import{combinedDisposable as M,Disposable as v}from"../../../../../../vs/base/common/lifecycle.js";import{ResourceMap as b}from"../../../../../../vs/base/common/map.js";import{isEqual as I}from"../../../../../../vs/base/common/resources.js";import"../../../../../../vs/base/common/uri.js";import{generateUuid as P}from"../../../../../../vs/base/common/uuid.js";import{AccessibilitySignal as F,IAccessibilitySignalService as U}from"../../../../../../vs/platform/accessibilitySignal/browser/accessibilitySignalService.js";import{IInstantiationService as $}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as C}from"../../../../../../vs/platform/log/common/log.js";import"../../../../../../vs/workbench/contrib/notebook/common/model/notebookTextModel.js";import{CellEditType as E,CellUri as f,NotebookCellExecutionState as m,NotebookExecutionState as S}from"../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import{CellExecutionUpdateType as u,INotebookExecutionService as A}from"../../../../../../vs/workbench/contrib/notebook/common/notebookExecutionService.js";import{INotebookExecutionStateService as H,NotebookExecutionType as T}from"../../../../../../vs/workbench/contrib/notebook/common/notebookExecutionStateService.js";import{INotebookKernelService as O}from"../../../../../../vs/workbench/contrib/notebook/common/notebookKernelService.js";import{INotebookService as w}from"../../../../../../vs/workbench/contrib/notebook/common/notebookService.js";let k=class extends v{constructor(e,t,o,i){super();this._instantiationService=e;this._logService=t;this._notebookService=o;this._accessibilitySignalService=i}_executions=new b;_notebookExecutions=new b;_notebookListeners=new b;_cellListeners=new b;_lastFailedCells=new b;_onDidChangeExecution=this._register(new h);onDidChangeExecution=this._onDidChangeExecution.event;_onDidChangeLastRunFailState=this._register(new h);onDidChangeLastRunFailState=this._onDidChangeLastRunFailState.event;getLastFailedCellForNotebook(e){const t=this._lastFailedCells.get(e);return t?.visible?t.cellHandle:void 0}forceCancelNotebookExecutions(e){const t=this._executions.get(e);if(t)for(const o of t.values())this._onCellExecutionDidComplete(e,o.cellHandle,o);this._notebookExecutions.has(e)&&this._onExecutionDidComplete(e)}getCellExecution(e){const t=f.parse(e);if(!t)throw new Error(`Not a cell URI: ${e}`);const o=this._executions.get(t.notebook);if(o)return o.get(t.handle)}getExecution(e){return this._notebookExecutions.get(e)?.[0]}getCellExecutionsForNotebook(e){const t=this._executions.get(e);return t?Array.from(t.values()):[]}getCellExecutionsByHandleForNotebook(e){const t=this._executions.get(e);return t?new Map(t.entries()):void 0}_onCellExecutionDidChange(e,t,o){this._onDidChangeExecution.fire(new y(e,t,o))}_onCellExecutionDidComplete(e,t,o,i){const n=this._executions.get(e);if(!n){this._logService.debug(`NotebookExecutionStateService#_onCellExecutionDidComplete - unknown notebook ${e.toString()}`);return}o.dispose();const a=f.generate(e,t);this._cellListeners.get(a)?.dispose(),this._cellListeners.delete(a),n.delete(t),n.size===0&&(this._executions.delete(e),this._notebookListeners.get(e)?.dispose(),this._notebookListeners.delete(e)),i!==void 0&&(i?(this._executions.size===0&&this._accessibilitySignalService.playSignal(F.notebookCellCompleted),this._clearLastFailedCell(e)):(this._accessibilitySignalService.playSignal(F.notebookCellFailed),this._setLastFailedCell(e,t))),this._onDidChangeExecution.fire(new y(e,t))}_onExecutionDidChange(e,t){this._onDidChangeExecution.fire(new N(e,t))}_onExecutionDidComplete(e){const t=this._notebookExecutions.get(e);if(!Array.isArray(t)){this._logService.debug(`NotebookExecutionStateService#_onCellExecutionDidComplete - unknown notebook ${e.toString()}`);return}this._notebookExecutions.delete(e),this._onDidChangeExecution.fire(new N(e)),t.forEach(o=>o.dispose())}createCellExecution(e,t){const o=this._notebookService.getNotebookTextModel(e);if(!o)throw new Error(`Notebook not found: ${e.toString()}`);let i=this._executions.get(e);if(!i){const a=this._instantiationService.createInstance(p,e);this._notebookListeners.set(e,a),i=new Map,this._executions.set(e,i)}let n=i.get(t);return n||(n=this._createNotebookCellExecution(o,t),i.set(t,n),n.initialize(),this._onDidChangeExecution.fire(new y(e,t,n))),n}createExecution(e){const t=this._notebookService.getNotebookTextModel(e);if(!t)throw new Error(`Notebook not found: ${e.toString()}`);if(!this._notebookListeners.has(e)){const i=this._instantiationService.createInstance(p,e);this._notebookListeners.set(e,i)}let o=this._notebookExecutions.get(e);return o||(o=this._createNotebookExecution(t),this._notebookExecutions.set(e,o),this._onDidChangeExecution.fire(new N(e,o[0]))),o[0]}_createNotebookCellExecution(e,t){const o=e.uri,i=this._instantiationService.createInstance(x,t,e),n=M(i.onDidUpdate(()=>this._onCellExecutionDidChange(o,t,i)),i.onDidComplete(a=>this._onCellExecutionDidComplete(o,t,i,a)));return this._cellListeners.set(f.generate(o,t),n),i}_createNotebookExecution(e){const t=e.uri,o=this._instantiationService.createInstance(g,e),i=M(o.onDidUpdate(()=>this._onExecutionDidChange(t,o)),o.onDidComplete(()=>this._onExecutionDidComplete(t)));return[o,i]}_setLastFailedCell(e,t){const o=this._lastFailedCells.get(e),i=this._notebookService.getNotebookTextModel(e);if(!i)return;const n={cellHandle:t,disposable:o?o.disposable:this._getFailedCellListener(i),visible:!0};this._lastFailedCells.set(e,n),this._onDidChangeLastRunFailState.fire({visible:!0,notebook:e})}_setLastFailedCellVisibility(e,t){const o=this._lastFailedCells.get(e);o&&this._lastFailedCells.set(e,{cellHandle:o.cellHandle,disposable:o.disposable,visible:t}),this._onDidChangeLastRunFailState.fire({visible:t,notebook:e})}_clearLastFailedCell(e){const t=this._lastFailedCells.get(e);t&&(t.disposable?.dispose(),this._lastFailedCells.delete(e)),this._onDidChangeLastRunFailState.fire({visible:!1,notebook:e})}_getFailedCellListener(e){return e.onWillAddRemoveCells(t=>{const o=this._lastFailedCells.get(e.uri)?.cellHandle;if(o!==void 0){const i=e.cells.findIndex(n=>n.handle===o);t.rawEvent.changes.forEach(([n,a,d])=>{a&&i>=n&&i<n+a&&this._setLastFailedCellVisibility(e.uri,!1),d.some(c=>c.handle===o)&&this._setLastFailedCellVisibility(e.uri,!0)})}})}dispose(){super.dispose(),this._executions.forEach(e=>{e.forEach(t=>t.dispose()),e.clear()}),this._executions.clear(),this._notebookExecutions.forEach(e=>{e.forEach(t=>t.dispose())}),this._notebookExecutions.clear(),this._cellListeners.forEach(e=>e.dispose()),this._notebookListeners.forEach(e=>e.dispose()),this._lastFailedCells.forEach(e=>e.disposable.dispose())}};k=_([r(0,$),r(1,C),r(2,w),r(3,U)],k);class y{constructor(s,e,t){this.notebook=s;this.cellHandle=e;this.changed=t}type=T.cell;affectsCell(s){const e=f.parse(s);return!!e&&I(this.notebook,e.notebook)&&this.cellHandle===e.handle}affectsNotebook(s){return I(this.notebook,s)}}class N{constructor(s,e){this.notebook=s;this.changed=e}type=T.notebook;affectsNotebook(s){return I(this.notebook,s)}}let p=class extends v{constructor(e,t,o,i,n,a){super();this._notebookService=t;this._notebookKernelService=o;this._notebookExecutionService=i;this._notebookExecutionStateService=n;this._logService=a;this._logService.debug(`NotebookExecution#ctor ${e.toString()}`);const d=this._notebookService.getNotebookTextModel(e);if(!d)throw new Error("Notebook not found: "+e);this._notebookModel=d,this._register(this._notebookModel.onWillAddRemoveCells(c=>this.onWillAddRemoveCells(c))),this._register(this._notebookModel.onWillDispose(()=>this.onWillDisposeDocument()))}_notebookModel;cancelAll(){this._logService.debug("NotebookExecutionListeners#cancelAll");const e=this._notebookExecutionStateService.getCellExecutionsForNotebook(this._notebookModel.uri);this._notebookExecutionService.cancelNotebookCellHandles(this._notebookModel,e.map(t=>t.cellHandle))}onWillDisposeDocument(){this._logService.debug("NotebookExecution#onWillDisposeDocument"),this.cancelAll()}onWillAddRemoveCells(e){const t=this._notebookExecutionStateService.getCellExecutionsByHandleForNotebook(this._notebookModel.uri),o=new Set,i=new Set;if(t&&e.rawEvent.changes.forEach(([n,a])=>{a&&this._notebookModel.cells.slice(n,n+a).map(c=>c.handle).forEach(c=>{const D=t.get(c);D?.state===m.Executing?o.add(c):D&&i.add(c)})}),o.size||i.size){const n=this._notebookKernelService.getSelectedOrSuggestedKernel(this._notebookModel);if(n){const d=n.implementsInterrupt?[...o]:[...o,...i];this._logService.debug(`NotebookExecution#onWillAddRemoveCells, ${JSON.stringify([...d])}`),d.length&&n.cancelNotebookCellExecution(this._notebookModel.uri,d)}}}};p=_([r(1,w),r(2,O),r(3,A),r(4,H),r(5,C)],p);function W(l,s){if(l.editType===u.Output)return{editType:E.Output,handle:l.cellHandle,append:l.append,outputs:l.outputs};if(l.editType===u.OutputItems)return{editType:E.OutputItems,items:l.items,append:l.append,outputId:l.outputId};if(l.editType===u.ExecutionState){const e={};return typeof l.executionOrder<"u"&&(e.executionOrder=l.executionOrder),typeof l.runStartTime<"u"&&(e.runStartTime=l.runStartTime),{editType:E.PartialInternalMetadata,handle:s,internalMetadata:e}}throw new Error("Unknown cell update type")}let x=class extends v{constructor(e,t,o){super();this.cellHandle=e;this._notebookModel=t;this._logService=o;this._logService.debug(`CellExecution#ctor ${this.getCellLog()}`)}_onDidUpdate=this._register(new h);onDidUpdate=this._onDidUpdate.event;_onDidComplete=this._register(new h);onDidComplete=this._onDidComplete.event;_state=m.Unconfirmed;get state(){return this._state}get notebook(){return this._notebookModel.uri}_didPause=!1;get didPause(){return this._didPause}_isPaused=!1;get isPaused(){return this._isPaused}initialize(){const e={editType:E.PartialInternalMetadata,handle:this.cellHandle,internalMetadata:{executionId:P(),runStartTime:null,runEndTime:null,lastRunSuccess:null,executionOrder:null,renderDuration:null}};this._applyExecutionEdits([e])}getCellLog(){return`${this._notebookModel.uri.toString()}, ${this.cellHandle}`}logUpdates(e){const t=e.map(o=>u[o.editType]).join(", ");this._logService.debug(`CellExecution#updateExecution ${this.getCellLog()}, [${t}]`)}confirm(){this._logService.debug(`CellExecution#confirm ${this.getCellLog()}`),this._state=m.Pending,this._onDidUpdate.fire()}update(e){this.logUpdates(e),e.some(i=>i.editType===u.ExecutionState)&&(this._state=m.Executing),!this._didPause&&e.some(i=>i.editType===u.ExecutionState&&i.didPause)&&(this._didPause=!0);const t=[...e].reverse().find(i=>i.editType===u.ExecutionState&&typeof i.isPaused=="boolean");if(t&&(this._isPaused=t.isPaused),!this._notebookModel.cells.find(i=>i.handle===this.cellHandle))this._logService.debug(`CellExecution#update, updating cell not in notebook: ${this._notebookModel.uri.toString()}, ${this.cellHandle}`);else{const i=e.map(n=>W(n,this.cellHandle));this._applyExecutionEdits(i)}e.some(i=>i.editType===u.ExecutionState)&&this._onDidUpdate.fire()}complete(e){const t=this._notebookModel.cells.find(o=>o.handle===this.cellHandle);if(!t)this._logService.debug(`CellExecution#complete, completing cell not in notebook: ${this._notebookModel.uri.toString()}, ${this.cellHandle}`);else{const o={editType:E.PartialInternalMetadata,handle:this.cellHandle,internalMetadata:{lastRunSuccess:e.lastRunSuccess,runStartTime:this._didPause?null:t.internalMetadata.runStartTime,runEndTime:this._didPause?null:e.runEndTime,error:e.error}};this._applyExecutionEdits([o])}this._onDidComplete.fire(e.lastRunSuccess)}_applyExecutionEdits(e){this._notebookModel.applyEdits(e,!0,void 0,()=>{},void 0,!1)}};x=_([r(2,C)],x);let g=class extends v{constructor(e,t){super();this._notebookModel=e;this._logService=t;this._logService.debug("NotebookExecution#ctor")}_onDidUpdate=this._register(new h);onDidUpdate=this._onDidUpdate.event;_onDidComplete=this._register(new h);onDidComplete=this._onDidComplete.event;_state=S.Unconfirmed;get state(){return this._state}get notebook(){return this._notebookModel.uri}debug(e){this._logService.debug(`${e} ${this._notebookModel.uri.toString()}`)}confirm(){this.debug("Execution#confirm"),this._state=S.Pending,this._onDidUpdate.fire()}begin(){this.debug("Execution#begin"),this._state=S.Executing,this._onDidUpdate.fire()}complete(){this.debug("Execution#begin"),this._state=S.Unconfirmed,this._onDidComplete.fire()}};g=_([r(1,C)],g);export{k as NotebookExecutionStateService};
