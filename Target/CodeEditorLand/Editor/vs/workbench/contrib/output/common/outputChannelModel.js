var D=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var f=(d,r,e,t)=>{for(var i=t>1?void 0:t?x(r,e):r,o=d.length-1,n;o>=0;o--)(n=d[o])&&(i=(t?n(r,e,i):n(i))||i);return t&&i&&D(r,e,i),i},s=(d,r)=>(e,t)=>r(e,t,d);import{Promises as T,ThrottledDelayer as C}from"../../../../../vs/base/common/async.js";import{VSBuffer as M}from"../../../../../vs/base/common/buffer.js";import{CancellationTokenSource as O}from"../../../../../vs/base/common/cancellation.js";import{isCancellationError as y}from"../../../../../vs/base/common/errors.js";import{Emitter as m}from"../../../../../vs/base/common/event.js";import{Disposable as I,dispose as L,MutableDisposable as R,toDisposable as _}from"../../../../../vs/base/common/lifecycle.js";import*as E from"../../../../../vs/base/common/resources.js";import{isNumber as w}from"../../../../../vs/base/common/types.js";import"../../../../../vs/base/common/uri.js";import{EditOperation as v}from"../../../../../vs/editor/common/core/editOperation.js";import{Position as F}from"../../../../../vs/editor/common/core/position.js";import{Range as V}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/languages/language.js";import"../../../../../vs/editor/common/model.js";import{IEditorWorkerService as U}from"../../../../../vs/editor/common/services/editorWorker.js";import{IModelService as P}from"../../../../../vs/editor/common/services/model.js";import{IFileService as S}from"../../../../../vs/platform/files/common/files.js";import{IInstantiationService as W}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ILoggerService as k,ILogService as b}from"../../../../../vs/platform/log/common/log.js";import{OutputChannelUpdateMode as l}from"../../../../../vs/workbench/services/output/common/output.js";class H extends I{constructor(e,t,i){super();this.file=e;this.fileService=t;this.logService=i;this.syncDelayer=new C(500)}_onDidContentChange=new m;onDidContentChange=this._onDidContentChange.event;watching=!1;syncDelayer;etag;watch(e){this.watching||(this.etag=e,this.poll(),this.logService.trace("Started polling",this.file.toString()),this.watching=!0)}poll(){const e=()=>this.doWatch().then(()=>this.poll());this.syncDelayer.trigger(e).catch(t=>{if(!y(t))throw t})}async doWatch(){const e=await this.fileService.stat(this.file);e.etag!==this.etag&&(this.etag=e.etag,this._onDidContentChange.fire(e.size))}unwatch(){this.watching&&(this.syncDelayer.cancel(),this.watching=!1,this.logService.trace("Stopped polling",this.file.toString()))}dispose(){this.unwatch(),super.dispose()}}let h=class extends I{constructor(e,t,i,o,n,a,p){super();this.modelUri=e;this.language=t;this.file=i;this.fileService=o;this.modelService=n;this.editorWorkerService=p;this.fileHandler=this._register(new H(this.file,this.fileService,a)),this._register(this.fileHandler.onDidContentChange(u=>this.onDidContentChange(u))),this._register(_(()=>this.fileHandler.unwatch()))}_onDispose=this._register(new m);onDispose=this._onDispose.event;fileHandler;etag="";loadModelPromise=null;model=null;modelUpdateInProgress=!1;modelUpdateCancellationSource=this._register(new R);appendThrottler=this._register(new C(300));replacePromise;startOffset=0;endOffset=0;append(e){throw new Error("Not supported")}replace(e){throw new Error("Not supported")}clear(){this.update(l.Clear,this.endOffset,!0)}update(e,t,i){(this.loadModelPromise?this.loadModelPromise:Promise.resolve()).then(()=>this.doUpdate(e,t,i))}loadModel(){return this.loadModelPromise=T.withAsyncBody(async(e,t)=>{try{let i="";if(await this.fileService.exists(this.file)){const o=await this.fileService.readFile(this.file,{position:this.startOffset});this.endOffset=this.startOffset+o.value.byteLength,this.etag=o.etag,i=o.value.toString()}else this.startOffset=0,this.endOffset=0;e(this.createModel(i))}catch(i){t(i)}}),this.loadModelPromise}createModel(e){if(this.model)this.model.setValue(e);else{this.model=this.modelService.createModel(e,this.language,this.modelUri),this.fileHandler.watch(this.etag);const t=this.model.onWillDispose(()=>{this.cancelModelUpdate(),this.fileHandler.unwatch(),this.model=null,L(t)})}return this.model}doUpdate(e,t,i){if((e===l.Clear||e===l.Replace)&&(this.startOffset=this.endOffset=w(t)?t:this.endOffset,this.cancelModelUpdate()),!this.model)return;this.modelUpdateInProgress=!0,this.modelUpdateCancellationSource.value||(this.modelUpdateCancellationSource.value=new O);const o=this.modelUpdateCancellationSource.value.token;e===l.Clear?this.clearContent(this.model):e===l.Replace?this.replacePromise=this.replaceContent(this.model,o).finally(()=>this.replacePromise=void 0):this.appendContent(this.model,i,o)}clearContent(e){this.doUpdateModel(e,[v.delete(e.getFullModelRange())],M.fromString(""))}appendContent(e,t,i){this.appendThrottler.trigger(async()=>{if(i.isCancellationRequested)return;if(this.replacePromise){try{await this.replacePromise}catch{}if(i.isCancellationRequested)return}const o=await this.getContentToUpdate();if(i.isCancellationRequested)return;const n=e.getLineCount(),a=e.getLineMaxColumn(n),p=[v.insert(new F(n,a),o.toString())];this.doUpdateModel(e,p,o)},t?0:void 0).catch(o=>{if(!y(o))throw o})}async replaceContent(e,t){const i=await this.getContentToUpdate();if(t.isCancellationRequested)return;const o=await this.getReplaceEdits(e,i.toString());t.isCancellationRequested||this.doUpdateModel(e,o,i)}async getReplaceEdits(e,t){if(!t)return[v.delete(e.getFullModelRange())];if(t!==e.getValue()){const i=await this.editorWorkerService.computeMoreMinimalEdits(e.uri,[{text:t.toString(),range:e.getFullModelRange()}]);if(i?.length)return i.map(o=>v.replace(V.lift(o.range),o.text))}return[]}doUpdateModel(e,t,i){t.length&&e.applyEdits(t),this.endOffset=this.endOffset+i.byteLength,this.modelUpdateInProgress=!1}cancelModelUpdate(){this.modelUpdateCancellationSource.value?.cancel(),this.modelUpdateCancellationSource.value=void 0,this.appendThrottler.cancel(),this.replacePromise=void 0,this.modelUpdateInProgress=!1}async getContentToUpdate(){const e=await this.fileService.readFile(this.file,{position:this.endOffset});return this.etag=e.etag,e.value}onDidContentChange(e){this.model&&(this.modelUpdateInProgress||w(e)&&this.endOffset>e&&this.update(l.Clear,0,!0),this.update(l.Append,void 0,!1))}isVisible(){return!!this.model}dispose(){this._onDispose.fire(),super.dispose()}};h=f([s(3,S),s(4,P),s(5,b),s(6,U)],h);let c=class extends h{logger;_offset;constructor(r,e,t,i,o,n,a,p,u){super(e,t,i,o,n,p,u),this.logger=a.createLogger(i,{logLevel:"always",donotRotate:!0,donotUseFormatters:!0,hidden:!0}),this._offset=0}append(r){this.write(r),this.update(l.Append,void 0,this.isVisible())}replace(r){const e=this._offset;this.write(r),this.update(l.Replace,e,!0)}write(r){this._offset+=M.fromString(r).byteLength,this.logger.info(r),this.isVisible()&&this.logger.flush()}};c=f([s(4,S),s(5,P),s(6,k),s(7,b),s(8,U)],c);let g=class extends I{constructor(e,t,i,o,n,a){super();this.instantiationService=n;this.fileService=a;this.outputChannelModel=this.createOutputChannelModel(e,t,i,o)}_onDispose=this._register(new m);onDispose=this._onDispose.event;outputChannelModel;async createOutputChannelModel(e,t,i,o){const n=await o,a=E.joinPath(n,`${e.replace(/[\\/:\*\?"<>\|]/g,"")}.log`);await this.fileService.createFile(a);const p=this._register(this.instantiationService.createInstance(c,e,t,i,a));return this._register(p.onDispose(()=>this._onDispose.fire())),p}append(e){this.outputChannelModel.then(t=>t.append(e))}update(e,t,i){this.outputChannelModel.then(o=>o.update(e,t,i))}loadModel(){return this.outputChannelModel.then(e=>e.loadModel())}clear(){this.outputChannelModel.then(e=>e.clear())}replace(e){this.outputChannelModel.then(t=>t.replace(e))}};g=f([s(4,W),s(5,S)],g);export{g as DelegatedOutputChannelModel,h as FileOutputChannelModel};
