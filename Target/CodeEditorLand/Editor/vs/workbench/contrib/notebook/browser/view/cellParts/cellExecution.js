var h=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var a=(l,i,e,o)=>{for(var t=o>1?void 0:o?p(i,e):i,r=l.length-1,n;r>=0;r--)(n=l[r])&&(t=(o?n(i,e,t):n(t))||t);return o&&t&&h(i,e,t),t},d=(l,i)=>(e,o)=>i(e,o,l);import*as u from"../../../../../../base/browser/dom.js";import{disposableTimeout as C}from"../../../../../../base/common/async.js";import{DisposableStore as f}from"../../../../../../base/common/lifecycle.js";import{clamp as m}from"../../../../../../base/common/numbers.js";import"../../notebookBrowser.js";import"../../notebookViewEvents.js";import{CellContentPart as b}from"../cellPart.js";import{CodeCellViewModel as E}from"../../viewModel/codeCellViewModel.js";import"../../../common/notebookCommon.js";import{INotebookExecutionStateService as _}from"../../../common/notebookExecutionStateService.js";const x=200;let s=class extends b{constructor(e,o,t){super();this._notebookEditor=e;this._executionOrderLabel=o;this._notebookExecutionStateService=t;this._register(this._notebookEditor.onDidChangeActiveKernel(()=>{this.currentCell&&(this.kernelDisposables.clear(),this._notebookEditor.activeKernel&&this.kernelDisposables.add(this._notebookEditor.activeKernel.onDidChange(()=>{this.currentCell&&this.updateExecutionOrder(this.currentCell.internalMetadata)})),this.updateExecutionOrder(this.currentCell.internalMetadata))})),this._register(this._notebookEditor.onDidScroll(()=>{this._updatePosition()}))}kernelDisposables=this._register(new f);didRenderCell(e){this.updateExecutionOrder(e.internalMetadata,!0)}updateExecutionOrder(e,o=!1){if(this._notebookEditor.activeKernel?.implementsExecutionOrder||!this._notebookEditor.activeKernel&&typeof e.executionOrder=="number"){if(typeof e.executionOrder!="number"&&!o&&this._notebookExecutionStateService.getCellExecution(this.currentCell.uri)){const r=this.currentCell;C(()=>{this.currentCell===r&&this.updateExecutionOrder(this.currentCell.internalMetadata,!0)},x,this.cellDisposables);return}const t=typeof e.executionOrder=="number"?`[${e.executionOrder}]`:"[ ]";this._executionOrderLabel.innerText=t}else this._executionOrderLabel.innerText=""}updateState(e,o){o.internalMetadataChanged&&this.updateExecutionOrder(e.internalMetadata)}updateInternalLayoutNow(e){this._updatePosition()}_updatePosition(){if(this.currentCell)if(this.currentCell.isInputCollapsed)u.hide(this._executionOrderLabel);else{u.show(this._executionOrderLabel);let e=this.currentCell.layoutInfo.editorHeight-22+this.currentCell.layoutInfo.statusBarHeight;if(this.currentCell instanceof E){const t=this._notebookEditor.getAbsoluteTopOfElement(this.currentCell)+this.currentCell.layoutInfo.outputContainerOffset,r=this._notebookEditor.scrollBottom,n=22;if(r<=t){const c=t-r;e-=c,e=m(e,n+12,this.currentCell.layoutInfo.editorHeight-n+this.currentCell.layoutInfo.statusBarHeight)}}this._executionOrderLabel.style.top=`${e}px`}}};s=a([d(2,_)],s);export{s as CellExecutionPart};
