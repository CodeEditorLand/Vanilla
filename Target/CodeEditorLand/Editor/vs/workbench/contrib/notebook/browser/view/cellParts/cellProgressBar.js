var h=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var l=(i,r,e,t)=>{for(var o=t>1?void 0:t?g(r,e):r,a=i.length-1,n;a>=0;a--)(n=i[a])&&(o=(t?n(r,e,o):n(o))||o);return t&&o&&h(r,e,o),o},p=(i,r)=>(e,t)=>r(e,t,i);import{ProgressBar as u}from"../../../../../../base/browser/ui/progressbar/progressbar.js";import{defaultProgressBarStyles as c}from"../../../../../../platform/theme/browser/defaultStyles.js";import{CellContentPart as E}from"../cellPart.js";import{NotebookCellExecutionState as d}from"../../../common/notebookCommon.js";import{INotebookExecutionStateService as S}from"../../../common/notebookExecutionStateService.js";let s=class extends E{constructor(e,t,o){super();this._notebookExecutionStateService=o;this._progressBar=this._register(new u(e,c)),this._progressBar.hide(),this._collapsedProgressBar=this._register(new u(t,c)),this._collapsedProgressBar.hide()}_progressBar;_collapsedProgressBar;didRenderCell(e){this._updateForExecutionState(e)}updateForExecutionState(e,t){this._updateForExecutionState(e,t)}updateState(e,t){if((t.metadataChanged||t.internalMetadataChanged)&&this._updateForExecutionState(e),t.inputCollapsedChanged){const o=this._notebookExecutionStateService.getCellExecution(e.uri);e.isInputCollapsed?(this._progressBar.hide(),o?.state===d.Executing&&this._updateForExecutionState(e)):(this._collapsedProgressBar.hide(),o?.state===d.Executing&&this._updateForExecutionState(e))}}_updateForExecutionState(e,t){const o=t?.changed??this._notebookExecutionStateService.getCellExecution(e.uri),a=e.isInputCollapsed?this._collapsedProgressBar:this._progressBar;o?.state===d.Executing&&(!o.didPause||e.isInputCollapsed)?x(a):a.hide()}};s=l([p(2,S)],s);function x(i){i.infinite().show(500)}export{s as CellProgressBar};
