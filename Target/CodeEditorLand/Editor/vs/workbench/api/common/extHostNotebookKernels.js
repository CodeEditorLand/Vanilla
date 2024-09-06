var B=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var H=(k,r,e,t)=>{for(var o=t>1?void 0:t?q(r,e):r,n=k.length-1,i;n>=0;n--)(i=k[n])&&(o=(t?i(r,e,o):i(o))||o);return t&&o&&B(r,e,o),o},P=(k,r)=>(e,t)=>r(e,t,k);import"vscode";import{asArray as $}from"../../../base/common/arrays.js";import{DeferredPromise as z,timeout as W}from"../../../base/common/async.js";import{CancellationTokenSource as K}from"../../../base/common/cancellation.js";import{Emitter as g}from"../../../base/common/event.js";import{Disposable as R,DisposableStore as X}from"../../../base/common/lifecycle.js";import{ResourceMap as I}from"../../../base/common/map.js";import{URI as x}from"../../../base/common/uri.js";import{ExtensionIdentifier as Y}from"../../../platform/extensions/common/extensions.js";import{ILogService as G}from"../../../platform/log/common/log.js";import"../../contrib/notebook/common/notebookCommon.js";import{CellExecutionUpdateType as S}from"../../contrib/notebook/common/notebookExecutionService.js";import{variablePageSize as J}from"../../contrib/notebook/common/notebookKernelService.js";import{asWebviewUri as Q}from"../../contrib/webview/common/webview.js";import{checkProposedApiEnabled as _}from"../../services/extensions/common/extensions.js";import{SerializableObjectWithBuffers as M}from"../../services/extensions/common/proxyIdentifier.js";import{MainContext as Z}from"./extHost.protocol.js";import{ApiCommand as U,ApiCommandArgument as V,ApiCommandResult as L}from"./extHostCommands.js";import"./extHostInitDataService.js";import"./extHostNotebook.js";import"./extHostNotebookDocument.js";import*as m from"./extHostTypeConverters.js";import{NotebookCellExecutionState as ee,NotebookCellOutput as j,NotebookControllerAffinity2 as te,NotebookVariablesRequestKind as F}from"./extHostTypes.js";let D=class{constructor(r,e,t,o,n){this._initData=e;this._extHostNotebook=t;this._commands=o;this._logService=n;this._proxy=r.getProxy(Z.MainThreadNotebookKernels);const i=new U("notebook.selectKernel","_notebook.selectKernel","Trigger kernel picker for specified notebook editor widget",[new V("options","Select kernel options",a=>!0,a=>{if(a&&"notebookEditor"in a&&"id"in a){const b=this._extHostNotebook.getIdByEditor(a.notebookEditor);return{id:a.id,extension:a.extension,notebookEditorId:b}}else if(a&&"notebookEditor"in a){const b=this._extHostNotebook.getIdByEditor(a.notebookEditor);if(b===void 0)throw new Error(`Cannot invoke 'notebook.selectKernel' for unrecognized notebook editor ${a.notebookEditor.notebook.uri.toString()}`);return{notebookEditorId:b}}return a})],L.Void),l=new U("vscode.executeNotebookVariableProvider","_executeNotebookVariableProvider","Execute notebook variable provider",[V.Uri],new L("A promise that resolves to an array of variables",(a,b)=>a.map(d=>({variable:{name:d.name,value:d.value,expression:d.expression,type:d.type,language:d.language},hasNamedChildren:d.hasNamedChildren,indexedChildrenCount:d.indexedChildrenCount}))));this._commands.registerApiCommand(i),this._commands.registerApiCommand(l)}_proxy;_activeExecutions=new I;_activeNotebookExecutions=new I;_kernelDetectionTask=new Map;_kernelDetectionTaskHandlePool=0;_kernelSourceActionProviders=new Map;_kernelSourceActionProviderHandlePool=0;_kernelData=new Map;_handlePool=0;_onDidChangeCellExecutionState=new g;onDidChangeNotebookCellExecutionState=this._onDidChangeCellExecutionState.event;createNotebookController(r,e,t,o,n,i){for(const s of this._kernelData.values())if(s.controller.id===e&&Y.equals(r.identifier,s.extensionId))throw new Error(`notebook controller with id '${e}' ALREADY exist`);const l=this._handlePool++,a=this;this._logService.trace(`NotebookController[${l}], CREATED by ${r.identifier.value}, ${e}`);const b=()=>console.warn(`NO execute handler from notebook controller '${c.id}' of extension: '${r.identifier}'`);let d=!1;const v=new g,f=new g,c={id:y(r.identifier,e),notebookType:t,extensionId:r.identifier,extensionLocation:r.extensionLocation,label:o||r.identifier.value,preloads:i?i.map(m.NotebookRendererScript.from):[]};let E=n??b,u,C;this._proxy.$addKernel(l,c).catch(s=>{console.log(s),d=!0});let T=0;const h=()=>{if(d)return;const s=++T;Promise.resolve().then(()=>{s===T&&this._proxy.$updateKernel(l,c)})},N=new I,A={get id(){return e},get notebookType(){return c.notebookType},onDidChangeSelectedNotebooks:v.event,get label(){return c.label},set label(s){c.label=s??r.displayName??r.name,h()},get detail(){return c.detail??""},set detail(s){c.detail=s,h()},get description(){return c.description??""},set description(s){c.description=s,h()},get supportedLanguages(){return c.supportedLanguages},set supportedLanguages(s){c.supportedLanguages=s,h()},get supportsExecutionOrder(){return c.supportsExecutionOrder??!1},set supportsExecutionOrder(s){c.supportsExecutionOrder=s,h()},get rendererScripts(){return c.preloads?c.preloads.map(m.NotebookRendererScript.to):[]},get executeHandler(){return E},set executeHandler(s){E=s??b},get interruptHandler(){return u},set interruptHandler(s){u=s,c.supportsInterrupt=!!s,h()},set variableProvider(s){_(r,"notebookVariableProvider"),C=s,c.hasVariableProvider=!!s,s?.onDidChangeVariables(p=>a._proxy.$variablesUpdated(p.uri)),h()},get variableProvider(){return C},createNotebookCellExecution(s){if(d)throw new Error("notebook controller is DISPOSED");if(!N.has(s.notebook.uri))throw a._logService.trace(`NotebookController[${l}] NOT associated to notebook, associated to THESE notebooks:`,Array.from(N.keys()).map(p=>p.toString())),new Error(`notebook controller is NOT associated to notebook: ${s.notebook.uri.toString()}`);return a._createNotebookCellExecution(s,y(r.identifier,this.id))},createNotebookExecution(s){if(_(r,"notebookExecution"),d)throw new Error("notebook controller is DISPOSED");if(!N.has(s.uri))throw a._logService.trace(`NotebookController[${l}] NOT associated to notebook, associated to THESE notebooks:`,Array.from(N.keys()).map(p=>p.toString())),new Error(`notebook controller is NOT associated to notebook: ${s.uri.toString()}`);return a._createNotebookExecution(s,y(r.identifier,this.id))},dispose:()=>{d||(this._logService.trace(`NotebookController[${l}], DISPOSED`),d=!0,this._kernelData.delete(l),v.dispose(),f.dispose(),this._proxy.$removeKernel(l))},updateNotebookAffinity(s,p){p===te.Hidden&&_(r,"notebookControllerAffinityHidden"),a._proxy.$updateNotebookPriority(l,s.uri,p)},onDidReceiveMessage:f.event,postMessage(s,p){return _(r,"notebookMessaging"),a._proxy.$postMessage(l,p&&a._extHostNotebook.getIdByEditor(p),s)},asWebviewUri(s){return _(r,"notebookMessaging"),Q(s,a._initData.remote)}};return this._kernelData.set(l,{extensionId:r.identifier,controller:A,onDidReceiveMessage:f,onDidChangeSelection:v,associatedNotebooks:N}),A}getIdByController(r){for(const[e,t]of this._kernelData)if(t.controller===r)return y(t.extensionId,r.id);return null}createNotebookControllerDetectionTask(r,e){const t=this._kernelDetectionTaskHandlePool++,o=this;this._logService.trace(`NotebookControllerDetectionTask[${t}], CREATED by ${r.identifier.value}`),this._proxy.$addKernelDetectionTask(t,e);const n={dispose:()=>{this._kernelDetectionTask.delete(t),o._proxy.$removeKernelDetectionTask(t)}};return this._kernelDetectionTask.set(t,n),n}registerKernelSourceActionProvider(r,e,t){const o=this._kernelSourceActionProviderHandlePool++,n=typeof t.onDidChangeNotebookKernelSourceActions=="function"?o:void 0,i=this;this._kernelSourceActionProviders.set(o,t),this._logService.trace(`NotebookKernelSourceActionProvider[${o}], CREATED by ${r.identifier.value}`),this._proxy.$addKernelSourceActionProvider(o,o,e);let l;return n!==void 0&&(l=t.onDidChangeNotebookKernelSourceActions(a=>this._proxy.$emitNotebookKernelSourceActionsChangeEvent(n))),{dispose:()=>{this._kernelSourceActionProviders.delete(o),i._proxy.$removeKernelSourceActionProvider(o,o),l?.dispose()}}}async $provideKernelSourceActions(r,e){const t=this._kernelSourceActionProviders.get(r);if(t){const o=new X;return(await t.provideNotebookKernelSourceActions(e)??[]).map(i=>m.NotebookKernelSourceAction.from(i,this._commands.converter,o))}return[]}$acceptNotebookAssociation(r,e,t){const o=this._kernelData.get(r);if(o){const n=this._extHostNotebook.getNotebookDocument(x.revive(e));t?o.associatedNotebooks.set(n.uri,!0):o.associatedNotebooks.delete(n.uri),this._logService.trace(`NotebookController[${r}] ASSOCIATE notebook`,n.uri.toString(),t),o.onDidChangeSelection.fire({selected:t,notebook:n.apiNotebook})}}async $executeCells(r,e,t){const o=this._kernelData.get(r);if(!o)return;const n=this._extHostNotebook.getNotebookDocument(x.revive(e)),i=[];for(const l of t){const a=n.getCell(l);a&&i.push(a.apiCell)}try{this._logService.trace(`NotebookController[${r}] EXECUTE cells`,n.uri.toString(),i.length),await o.controller.executeHandler.call(o.controller,i,n.apiNotebook,o.controller)}catch(l){this._logService.error(`NotebookController[${r}] execute cells FAILED`,l),console.error(l)}}async $cancelCells(r,e,t){const o=this._kernelData.get(r);if(!o)return;const n=this._extHostNotebook.getNotebookDocument(x.revive(e));if(o.controller.interruptHandler)await o.controller.interruptHandler.call(o.controller,n.apiNotebook);else for(const i of t){const l=n.getCell(i);l&&this._activeExecutions.get(l.uri)?.cancel()}if(o.controller.interruptHandler){const i=this._activeNotebookExecutions.get(n.uri);this._activeNotebookExecutions.delete(n.uri),t.length&&Array.isArray(i)&&i.length&&i.forEach(l=>l.dispose())}}id=0;variableStore={};async $provideVariables(r,e,t,o,n,i,l){const a=this._kernelData.get(r);if(!a)return;const b=this._extHostNotebook.getNotebookDocument(x.revive(t)),d=a.controller.variableProvider;if(!d)return;let v;if(o!==void 0){if(v=this.variableStore[o],!v)return}else this.variableStore={};const f=n==="named"?F.Named:F.Indexed,c=d.provideVariables(b.apiNotebook,v,f,i,l);let E=0;for await(const u of c){if(l.isCancellationRequested)return;const C={id:this.id++,name:u.variable.name,value:u.variable.value,type:u.variable.type,interfaces:u.variable.interfaces,language:u.variable.language,expression:u.variable.expression,hasNamedChildren:u.hasNamedChildren,indexedChildrenCount:u.indexedChildrenCount,extensionId:a.extensionId.value};if(this.variableStore[C.id]=u.variable,this._proxy.$receiveVariable(e,C),E++>=J)return}}$acceptKernelMessageFromRenderer(r,e,t){const o=this._kernelData.get(r);if(!o)return;const n=this._extHostNotebook.getEditorById(e);o.onDidReceiveMessage.fire(Object.freeze({editor:n.apiEditor,message:t}))}$cellExecutionChanged(r,e,t){const n=this._extHostNotebook.getNotebookDocument(x.revive(r)).getCell(e);if(n){const i=t?m.NotebookCellExecutionState.to(t):ee.Idle;i!==void 0&&this._onDidChangeCellExecutionState.fire({cell:n.apiCell,state:i})}}_createNotebookCellExecution(r,e){if(r.index<0)throw new Error("CANNOT execute cell that has been REMOVED from notebook");const o=this._extHostNotebook.getNotebookDocument(r.notebook.uri).getCellFromApiCell(r);if(!o)throw new Error("invalid cell");if(this._activeExecutions.has(o.uri))throw new Error(`duplicate execution for ${o.uri}`);const n=new w(e,o,this._proxy);this._activeExecutions.set(o.uri,n);const i=n.onDidChangeState(()=>{n.state===2&&(n.dispose(),i.dispose(),this._activeExecutions.delete(o.uri))});return n.asApiObject()}_createNotebookExecution(r,e){const t=this._extHostNotebook.getNotebookDocument(r.uri),o=r.getCells().find(l=>{const a=t.getCellFromApiCell(l);return a&&this._activeExecutions.has(a.uri)});if(o)throw new Error(`duplicate cell execution for ${o.document.uri}`);if(this._activeNotebookExecutions.has(t.uri))throw new Error(`duplicate notebook execution for ${t.uri}`);const n=new O(e,t,this._proxy),i=n.onDidChangeState(()=>{n.state===2&&(n.dispose(),i.dispose(),this._activeNotebookExecutions.delete(t.uri))});return this._activeNotebookExecutions.set(t.uri,[n,i]),n.asApiObject()}};D=H([P(4,G)],D);var oe=(t=>(t[t.Init=0]="Init",t[t.Started=1]="Started",t[t.Resolved=2]="Resolved",t))(oe||{});class w extends R{constructor(e,t,o){super();this._cell=t;this._proxy=o;this._collector=new ne(10,n=>this.update(n)),this._executionOrder=t.internalMetadata.executionOrder,this._proxy.$createExecution(this._handle,e,this._cell.notebook.uri,this._cell.handle)}static HANDLE=0;_handle=w.HANDLE++;_onDidChangeState=new g;onDidChangeState=this._onDidChangeState.event;_state=0;get state(){return this._state}_tokenSource=this._register(new K);_collector;_executionOrder;cancel(){this._tokenSource.cancel()}async updateSoon(e){await this._collector.addItem(e)}async update(e){const t=Array.isArray(e)?e:[e];return this._proxy.$updateExecution(this._handle,new M(t))}verifyStateForOutput(){if(this._state===0)throw new Error("Must call start before modifying cell output");if(this._state===2)throw new Error("Cannot modify cell output after calling resolve")}cellIndexToHandle(e){let t=this._cell;if(e&&(t=this._cell.notebook.getCellFromApiCell(e)),!t)throw new Error("INVALID cell");return t.handle}validateAndConvertOutputs(e){return e.map(t=>{const o=j.ensureUniqueMimeTypes(t.items,!0);return o===t.items?m.NotebookCellOutput.from(t):m.NotebookCellOutput.from({items:o,id:t.id,metadata:t.metadata})})}async updateOutputs(e,t,o){const n=this.cellIndexToHandle(t),i=this.validateAndConvertOutputs($(e));return this.updateSoon({editType:S.Output,cellHandle:n,append:o,outputs:i})}async updateOutputItems(e,t,o){return e=j.ensureUniqueMimeTypes($(e),!0),this.updateSoon({editType:S.OutputItems,items:e.map(m.NotebookCellOutputItem.from),outputId:t.id,append:o})}asApiObject(){const e=this;return Object.freeze({get token(){return e._tokenSource.token},get cell(){return e._cell.apiCell},get executionOrder(){return e._executionOrder},set executionOrder(o){e._executionOrder=o,e.update([{editType:S.ExecutionState,executionOrder:e._executionOrder}])},start(o){if(e._state===2||e._state===1)throw new Error("Cannot call start again");e._state=1,e._onDidChangeState.fire(),e.update({editType:S.ExecutionState,runStartTime:o})},end(o,n,i){if(e._state===2)throw new Error("Cannot call resolve twice");e._state=2,e._onDidChangeState.fire(),e._collector.flush();const l=i?{message:i.message,stack:i.stack,location:i?.location?{startLineNumber:i.location.start.line,startColumn:i.location.start.character,endLineNumber:i.location.end.line,endColumn:i.location.end.character}:void 0,uri:i.uri}:void 0;e._proxy.$completeExecution(e._handle,new M({runEndTime:n,lastRunSuccess:o,error:l}))},clearOutput(o){return e.verifyStateForOutput(),e.updateOutputs([],o,!1)},appendOutput(o,n){return e.verifyStateForOutput(),e.updateOutputs(o,n,!0)},replaceOutput(o,n){return e.verifyStateForOutput(),e.updateOutputs(o,n,!1)},appendOutputItems(o,n){return e.verifyStateForOutput(),e.updateOutputItems(o,n,!0)},replaceOutputItems(o,n){return e.verifyStateForOutput(),e.updateOutputItems(o,n,!1)}})}}var re=(t=>(t[t.Init=0]="Init",t[t.Started=1]="Started",t[t.Resolved=2]="Resolved",t))(re||{});class O extends R{constructor(e,t,o){super();this._notebook=t;this._proxy=o;this._proxy.$createNotebookExecution(this._handle,e,this._notebook.uri)}static HANDLE=0;_handle=O.HANDLE++;_onDidChangeState=new g;onDidChangeState=this._onDidChangeState.event;_state=0;get state(){return this._state}_tokenSource=this._register(new K);cancel(){this._tokenSource.cancel()}asApiObject(){return Object.freeze({start:()=>{if(this._state===2||this._state===1)throw new Error("Cannot call start again");this._state=1,this._onDidChangeState.fire(),this._proxy.$beginNotebookExecution(this._handle)},end:()=>{if(this._state===2)throw new Error("Cannot call resolve twice");this._state=2,this._onDidChangeState.fire(),this._proxy.$completeNotebookExecution(this._handle)}})}}class ne{constructor(r,e){this.delay=r;this.callback=e}batch=[];startedTimer=Date.now();currentDeferred;addItem(r){return this.batch.push(r),this.currentDeferred||(this.currentDeferred=new z,this.startedTimer=Date.now(),W(this.delay).then(()=>this.flush())),Date.now()-this.startedTimer>this.delay?this.flush():this.currentDeferred.p}flush(){if(this.batch.length===0||!this.currentDeferred)return Promise.resolve();const r=this.currentDeferred;this.currentDeferred=void 0;const e=this.batch;return this.batch=[],this.callback(e).finally(()=>r.complete())}}function y(k,r){return`${k.value}/${r}`}export{D as ExtHostNotebookKernels,y as createKernelId};
