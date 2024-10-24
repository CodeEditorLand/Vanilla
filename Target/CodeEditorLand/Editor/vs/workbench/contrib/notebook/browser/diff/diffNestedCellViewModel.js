var d=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var p=(r,u,t,o)=>{for(var e=o>1?void 0:o?_(u,t):u,s=r.length-1,i;s>=0;s--)(i=r[s])&&(e=(o?i(u,t,e):i(e))||e);return o&&e&&d(u,t,e),e},l=(r,u)=>(t,o)=>u(t,o,r);import{Emitter as a}from"../../../../../base/common/event.js";import{Disposable as g}from"../../../../../base/common/lifecycle.js";import{generateUuid as c}from"../../../../../base/common/uuid.js";import{PrefixSumComputer as m}from"../../../../../editor/common/model/prefixSumComputer.js";import"./notebookDiffEditorBrowser.js";import"../notebookBrowser.js";import"../notebookViewEvents.js";import{CellOutputViewModel as h}from"../viewModel/cellOutputViewModel.js";import"../../common/model/notebookCellTextModel.js";import{INotebookService as C}from"../../common/notebookService.js";let n=class extends g{constructor(t,o){super();this.textModel=t;this._notebookService=o;this._id=c(),this._outputViewModels=this.textModel.outputs.map(e=>new h(this,e,this._notebookService)),this._register(this.textModel.onDidChangeOutputs(e=>{this._outputCollection.splice(e.start,e.deleteCount,...e.newOutputs.map(()=>0)),this._outputViewModels.splice(e.start,e.deleteCount,...e.newOutputs.map(i=>new h(this,i,this._notebookService))).forEach(i=>i.dispose()),this._outputsTop=null,this._onDidChangeOutputLayout.fire()})),this._outputCollection=new Array(this.textModel.outputs.length)}_id;get id(){return this._id}get outputs(){return this.textModel.outputs}get language(){return this.textModel.language}get metadata(){return this.textModel.metadata}get uri(){return this.textModel.uri}get handle(){return this.textModel.handle}_onDidChangeState=this._register(new a);_hoveringOutput=!1;get outputIsHovered(){return this._hoveringOutput}set outputIsHovered(t){this._hoveringOutput=t,this._onDidChangeState.fire({outputIsHoveredChanged:!0})}_focusOnOutput=!1;get outputIsFocused(){return this._focusOnOutput}set outputIsFocused(t){this._focusOnOutput=t,this._onDidChangeState.fire({outputIsFocusedChanged:!0})}_focusInputInOutput=!1;get inputInOutputIsFocused(){return this._focusInputInOutput}set inputInOutputIsFocused(t){this._focusInputInOutput=t}_outputViewModels;get outputsViewModels(){return this._outputViewModels}_outputCollection=[];_outputsTop=null;_onDidChangeOutputLayout=this._register(new a);onDidChangeOutputLayout=this._onDidChangeOutputLayout.event;_ensureOutputsTop(){if(!this._outputsTop){const t=new Uint32Array(this._outputCollection.length);for(let o=0;o<this._outputCollection.length;o++)t[o]=this._outputCollection[o];this._outputsTop=new m(t)}}getOutputOffset(t){if(this._ensureOutputsTop(),t>=this._outputCollection.length)throw new Error("Output index out of range!");return this._outputsTop.getPrefixSum(t-1)}updateOutputHeight(t,o){if(t>=this._outputCollection.length)throw new Error("Output index out of range!");this._ensureOutputsTop(),this._outputCollection[t]=o,this._outputsTop.setValue(t,o)&&this._onDidChangeOutputLayout.fire()}getOutputTotalHeight(){return this._ensureOutputsTop(),this._outputsTop?.getTotalSum()??0}dispose(){super.dispose(),this._outputViewModels.forEach(t=>{t.dispose()})}};n=p([l(1,C)],n);export{n as DiffNestedCellViewModel};
