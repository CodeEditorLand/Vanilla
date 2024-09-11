var I=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var k=(l,e,o,t)=>{for(var i=t>1?void 0:t?S(e,o):e,s=l.length-1,n;s>=0;s--)(n=l[s])&&(i=(t?n(e,o,i):n(i))||i);return t&&i&&I(e,o,i),i},u=(l,e)=>(o,t)=>e(o,t,l);import{isNonEmptyArray as g}from"../../../base/common/arrays.js";import{CancellationToken as y}from"../../../base/common/cancellation.js";import{onUnexpectedError as v}from"../../../base/common/errors.js";import{Emitter as h}from"../../../base/common/event.js";import{DisposableMap as K,DisposableStore as f,toDisposable as N}from"../../../base/common/lifecycle.js";import{URI as c}from"../../../base/common/uri.js";import{ILanguageService as C}from"../../../editor/common/languages/language.js";import"../../../platform/extensions/common/extensions.js";import{NotebookDto as x}from"./mainThreadNotebookDto.js";import{extHostNamedCustomer as D}from"../../services/extensions/common/extHostCustomers.js";import"../../contrib/notebook/browser/notebookBrowser.js";import{INotebookEditorService as R}from"../../contrib/notebook/browser/services/notebookEditorService.js";import{INotebookExecutionStateService as M,NotebookExecutionType as P}from"../../contrib/notebook/common/notebookExecutionStateService.js";import{INotebookKernelService as A}from"../../contrib/notebook/common/notebookKernelService.js";import"../../services/extensions/common/proxyIdentifier.js";import{ExtHostContext as $,MainContext as w}from"../common/extHost.protocol.js";import{INotebookService as T}from"../../contrib/notebook/common/notebookService.js";import{AsyncIterableSource as U}from"../../../base/common/async.js";class V{constructor(e,o){this._languageService=o;this.id=e.id,this.viewType=e.notebookType,this.extension=e.extensionId,this.implementsInterrupt=e.supportsInterrupt??!1,this.label=e.label,this.description=e.description,this.detail=e.detail,this.supportedLanguages=g(e.supportedLanguages)?e.supportedLanguages:o.getRegisteredLanguageIds(),this.implementsExecutionOrder=e.supportsExecutionOrder??!1,this.hasVariableProvider=e.hasVariableProvider??!1,this.localResourceRoot=c.revive(e.extensionLocation),this.preloads=e.preloads?.map(t=>({uri:c.revive(t.uri),provides:t.provides}))??[]}_onDidChange=new h;preloads;onDidChange=this._onDidChange.event;id;viewType;extension;implementsInterrupt;label;description;detail;supportedLanguages;implementsExecutionOrder;hasVariableProvider;localResourceRoot;get preloadUris(){return this.preloads.map(e=>e.uri)}get preloadProvides(){return this.preloads.flatMap(e=>e.provides)}update(e){const o=Object.create(null);e.label!==void 0&&(this.label=e.label,o.label=!0),e.description!==void 0&&(this.description=e.description,o.description=!0),e.detail!==void 0&&(this.detail=e.detail,o.detail=!0),e.supportedLanguages!==void 0&&(this.supportedLanguages=g(e.supportedLanguages)?e.supportedLanguages:this._languageService.getRegisteredLanguageIds(),o.supportedLanguages=!0),e.supportsExecutionOrder!==void 0&&(this.implementsExecutionOrder=e.supportsExecutionOrder,o.hasExecutionOrder=!0),e.supportsInterrupt!==void 0&&(this.implementsInterrupt=e.supportsInterrupt,o.hasInterruptHandler=!0),e.hasVariableProvider!==void 0&&(this.hasVariableProvider=e.hasVariableProvider,o.hasVariableProvider=!0),this._onDidChange.fire(o)}}class L{constructor(e){this.notebookType=e}}let m=class{constructor(e,o,t,i,s,n){this._languageService=o;this._notebookKernelService=t;this._notebookExecutionStateService=i;this._notebookService=s;this._proxy=e.getProxy($.ExtHostNotebookKernels),n.listNotebookEditors().forEach(this._onEditorAdd,this),n.onDidAddNotebookEditor(this._onEditorAdd,this,this._disposables),n.onDidRemoveNotebookEditor(this._onEditorRemove,this,this._disposables),this._disposables.add(N(()=>{this._executions.forEach(r=>{r.complete({})}),this._notebookExecutions.forEach(r=>r.complete())})),this._disposables.add(this._notebookExecutionStateService.onDidChangeExecution(r=>{r.type===P.cell&&this._proxy.$cellExecutionChanged(r.notebook,r.cellHandle,r.changed?.state)})),this._disposables.add(this._notebookKernelService.onDidChangeSelectedNotebooks(r=>{for(const[a,[p]]of this._kernels)r.oldKernel===p.id?this._proxy.$acceptNotebookAssociation(a,r.notebook,!1):r.newKernel===p.id&&this._proxy.$acceptNotebookAssociation(a,r.notebook,!0)}))}_editors=new K;_disposables=new f;_kernels=new Map;_kernelDetectionTasks=new Map;_kernelSourceActionProviders=new Map;_kernelSourceActionProvidersEventRegistrations=new Map;_proxy;_executions=new Map;_notebookExecutions=new Map;dispose(){this._disposables.dispose();for(const[,e]of this._kernels.values())e.dispose();for(const[,e]of this._kernelDetectionTasks.values())e.dispose();for(const[,e]of this._kernelSourceActionProviders.values())e.dispose();this._editors.dispose()}_onEditorAdd(e){const o=e.onDidReceiveMessage(t=>{if(!e.hasModel())return;const{selected:i}=this._notebookKernelService.getMatchingKernel(e.textModel);if(i){for(const[s,n]of this._kernels)if(n[0]===i){this._proxy.$acceptKernelMessageFromRenderer(s,e.getId(),t.message);break}}});this._editors.set(e,o)}_onEditorRemove(e){this._editors.deleteAndDispose(e)}async $postMessage(e,o,t){const i=this._kernels.get(e);if(!i)throw new Error("kernel already disposed");const[s]=i;let n=!1;for(const[r]of this._editors)if(r.hasModel()&&this._notebookKernelService.getMatchingKernel(r.textModel).selected===s){if(o===void 0)r.postMessage(t),n=!0;else if(r.getId()===o){r.postMessage(t),n=!0;break}}return n}variableRequestIndex=0;variableRequestMap=new Map;$receiveVariable(e,o){const t=this.variableRequestMap.get(e);t&&t.emitOne(o)}async $addKernel(e,o){const t=this,i=new class extends V{async executeNotebookCellsRequest(n,r){await t._proxy.$executeCells(e,n,r)}async cancelNotebookCellExecution(n,r){await t._proxy.$cancelCells(e,n,r)}provideVariables(n,r,a,p,_){const d=`${e}variables${t.variableRequestIndex++}`;if(t.variableRequestMap.has(d))return t.variableRequestMap.get(d).asyncIterable;const b=new U;return t.variableRequestMap.set(d,b),t._proxy.$provideVariables(e,d,n,r,a,p,_).then(()=>{b.resolve(),t.variableRequestMap.delete(d)}).catch(E=>{b.reject(E),t.variableRequestMap.delete(d)}),b.asyncIterable}}(o,this._languageService),s=this._disposables.add(new f);this._kernels.set(e,[i,s]),s.add(this._notebookKernelService.registerKernel(i))}$updateKernel(e,o){const t=this._kernels.get(e);t&&t[0].update(o)}$removeKernel(e){const o=this._kernels.get(e);o&&(o[1].dispose(),this._kernels.delete(e))}$updateNotebookPriority(e,o,t){const i=this._kernels.get(e);i&&this._notebookKernelService.updateKernelNotebookAffinity(i[0],c.revive(o),t)}$createExecution(e,o,t,i){const s=c.revive(t),n=this._notebookService.getNotebookTextModel(s);if(!n)throw new Error(`Notebook not found: ${s.toString()}`);const r=this._notebookKernelService.getMatchingKernel(n);if(!r.selected||r.selected.id!==o)throw new Error(`Kernel is not selected: ${r.selected?.id} !== ${o}`);const a=this._notebookExecutionStateService.createCellExecution(s,i);a.confirm(),this._executions.set(e,a)}$updateExecution(e,o){const t=o.value;try{this._executions.get(e)?.update(t.map(x.fromCellExecuteUpdateDto))}catch(i){v(i)}}$completeExecution(e,o){try{this._executions.get(e)?.complete(x.fromCellExecuteCompleteDto(o.value))}catch(t){v(t)}finally{this._executions.delete(e)}}$createNotebookExecution(e,o,t){const i=c.revive(t),s=this._notebookService.getNotebookTextModel(i);if(!s)throw new Error(`Notebook not found: ${i.toString()}`);const n=this._notebookKernelService.getMatchingKernel(s);if(!n.selected||n.selected.id!==o)throw new Error(`Kernel is not selected: ${n.selected?.id} !== ${o}`);const r=this._notebookExecutionStateService.createExecution(i);r.confirm(),this._notebookExecutions.set(e,r)}$beginNotebookExecution(e){try{this._notebookExecutions.get(e)?.begin()}catch(o){v(o)}}$completeNotebookExecution(e){try{this._notebookExecutions.get(e)?.complete()}catch(o){v(o)}finally{this._notebookExecutions.delete(e)}}async $addKernelDetectionTask(e,o){const t=new L(o),i=this._notebookKernelService.registerNotebookKernelDetectionTask(t);this._kernelDetectionTasks.set(e,[t,i])}$removeKernelDetectionTask(e){const o=this._kernelDetectionTasks.get(e);o&&(o[1].dispose(),this._kernelDetectionTasks.delete(e))}async $addKernelSourceActionProvider(e,o,t){const i={viewType:t,provideKernelSourceActions:async()=>(await this._proxy.$provideKernelSourceActions(e,y.None)).map(r=>{let a=r.documentation;return r.documentation&&typeof r.documentation!="string"&&(a=c.revive(r.documentation)),{label:r.label,command:r.command,description:r.description,detail:r.detail,documentation:a}})};if(typeof o=="number"){const n=new h;this._kernelSourceActionProvidersEventRegistrations.set(o,n),i.onDidChangeSourceActions=n.event}const s=this._notebookKernelService.registerKernelSourceActionProvider(t,i);this._kernelSourceActionProviders.set(e,[i,s])}$removeKernelSourceActionProvider(e,o){const t=this._kernelSourceActionProviders.get(e);t&&(t[1].dispose(),this._kernelSourceActionProviders.delete(e)),typeof o=="number"&&this._kernelSourceActionProvidersEventRegistrations.delete(o)}$emitNotebookKernelSourceActionsChangeEvent(e){const o=this._kernelSourceActionProvidersEventRegistrations.get(e);o instanceof h&&o.fire(void 0)}$variablesUpdated(e){this._notebookKernelService.notifyVariablesChange(c.revive(e))}};m=k([D(w.MainThreadNotebookKernels),u(1,C),u(2,A),u(3,M),u(4,T),u(5,R)],m);export{m as MainThreadNotebookKernels};
