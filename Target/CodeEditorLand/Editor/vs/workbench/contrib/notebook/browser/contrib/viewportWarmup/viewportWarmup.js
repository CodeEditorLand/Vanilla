var b=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var a=(n,i,t,o)=>{for(var e=o>1?void 0:o?k(i,t):i,r=n.length-1,l;r>=0;r--)(l=n[r])&&(e=(o?l(i,t,e):l(e))||e);return o&&e&&b(i,t,e),e},p=(n,i)=>(t,o)=>i(t,o,n);import{RunOnceScheduler as m}from"../../../../../../../vs/base/common/async.js";import{Disposable as f}from"../../../../../../../vs/base/common/lifecycle.js";import{IAccessibilityService as E}from"../../../../../../../vs/platform/accessibility/common/accessibility.js";import{CellEditState as h,RenderOutputType as v}from"../../../../../../../vs/workbench/contrib/notebook/browser/notebookBrowser.js";import{registerNotebookContribution as C}from"../../../../../../../vs/workbench/contrib/notebook/browser/notebookEditorExtensions.js";import{outputDisplayLimit as I}from"../../../../../../../vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel.js";import{CellKind as d}from"../../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import{cellRangesToIndexes as g}from"../../../../../../../vs/workbench/contrib/notebook/common/notebookRange.js";import{INotebookService as M}from"../../../../../../../vs/workbench/contrib/notebook/common/notebookService.js";let s=class extends f{constructor(t,o,e){super();this._notebookEditor=t;this._notebookService=o;this._warmupViewport=new m(()=>this._warmupViewportNow(),200),this._register(this._warmupViewport),this._register(this._notebookEditor.onDidScroll(()=>{this._warmupViewport.schedule()})),this._warmupDocument=new m(()=>this._warmupDocumentNow(),200),this._register(this._warmupDocument),this._register(this._notebookEditor.onDidAttachViewModel(()=>{this._notebookEditor.hasModel()&&this._warmupDocument?.schedule()})),this._notebookEditor.hasModel()&&this._warmupDocument?.schedule()}static id="workbench.notebook.viewportWarmup";_warmupViewport;_warmupDocument=null;_warmupDocumentNow(){if(this._notebookEditor.hasModel())for(let t=0;t<this._notebookEditor.getLength();t++){const o=this._notebookEditor.cellAt(t);o?.cellKind===d.Markup&&o?.getEditState()===h.Preview&&!o.isInputCollapsed||o?.cellKind===d.Code&&this._warmupCodeCell(o)}}_warmupViewportNow(){if(this._notebookEditor.isDisposed||!this._notebookEditor.hasModel())return;const t=this._notebookEditor.getVisibleRangesPlusViewportAboveAndBelow();g(t).forEach(o=>{const e=this._notebookEditor.cellAt(o);e?.cellKind===d.Markup&&e?.getEditState()===h.Preview&&!e.isInputCollapsed?this._notebookEditor.createMarkupPreview(e):e?.cellKind===d.Code&&this._warmupCodeCell(e)})}_warmupCodeCell(t){if(t.isOutputCollapsed)return;const o=t.outputsViewModels;for(const e of o.slice(0,I)){const[r,l]=e.resolveMimeTypes(this._notebookEditor.textModel,void 0);if(!r.find(w=>w.isTrusted)||r.length===0)continue;const u=r[l];if(!u||!this._notebookEditor.hasModel())return;const c=this._notebookService.getRendererInfo(u.rendererId);if(!c)return;const _={type:v.Extension,renderer:c,source:e,mimeType:u.mimeType};this._notebookEditor.createOutput(t,_,0,!0)}}};s=a([p(1,M),p(2,E)],s),C(s.id,s);