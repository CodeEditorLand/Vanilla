var h=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var m=(a,o,e,r)=>{for(var t=r>1?void 0:r?k(o,e):o,i=a.length-1,n;i>=0;i--)(n=a[i])&&(t=(r?n(o,e,t):n(t))||t);return r&&t&&h(o,e,t),t},l=(a,o)=>(e,r)=>o(e,r,a);import{throttle as g}from"../../../../../../../vs/base/common/decorators.js";import{Disposable as b}from"../../../../../../../vs/base/common/lifecycle.js";import{isEqual as f}from"../../../../../../../vs/base/common/resources.js";import"../../../../../../../vs/base/common/uri.js";import{IMarkerNavigationService as _,MarkerList as I}from"../../../../../../../vs/editor/contrib/gotoError/browser/markerNavigationService.js";import{IConfigurationService as S}from"../../../../../../../vs/platform/configuration/common/configuration.js";import{IMarkerService as p,MarkerSeverity as c}from"../../../../../../../vs/platform/markers/common/markers.js";import{editorErrorForeground as E,editorWarningForeground as D}from"../../../../../../../vs/platform/theme/common/colorRegistry.js";import{registerWorkbenchContribution2 as C,WorkbenchPhase as R}from"../../../../../../../vs/workbench/common/contributions.js";import{NotebookOverviewRulerLane as N}from"../../../../../../../vs/workbench/contrib/notebook/browser/notebookBrowser.js";import{registerNotebookContribution as w}from"../../../../../../../vs/workbench/contrib/notebook/browser/notebookEditorExtensions.js";import{CellUri as u}from"../../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";let d=class{constructor(o,e,r){this._markerService=o;this._configService=r;this._dispoables=e.registerProvider(this)}static ID="workbench.contrib.markerListProvider";_dispoables;dispose(){this._dispoables.dispose()}getMarkerList(o){if(!o)return;const e=u.parse(o);if(e)return new I(r=>u.parse(r)?.notebook.toString()===e.notebook.toString(),this._markerService,this._configService)}};d=m([l(0,p),l(1,_),l(2,S)],d);let s=class extends b{constructor(e,r){super();this._notebookEditor=e;this._markerService=r;this._update(),this._register(this._notebookEditor.onDidChangeModel(()=>this._update())),this._register(this._markerService.onMarkerChanged(t=>{t.some(i=>this._notebookEditor.getCellsInRange().some(n=>f(n.uri,i)))&&this._update()}))}static id="workbench.notebook.markerDecoration";_markersOverviewRulerDecorations=[];_update(){if(!this._notebookEditor.hasModel())return;const e=[];this._notebookEditor.getCellsInRange().forEach(r=>{this._markerService.read({resource:r.uri,severities:c.Error|c.Warning}).forEach(i=>{const n=i.severity===c.Error?E:D,v={startLineNumber:i.startLineNumber,startColumn:i.startColumn,endLineNumber:i.endLineNumber,endColumn:i.endColumn};e.push({handle:r.handle,options:{overviewRuler:{color:n,modelRanges:[v],includeOutput:!1,position:N.Right}}})})}),this._markersOverviewRulerDecorations=this._notebookEditor.deltaCellDecorations(this._markersOverviewRulerDecorations,e)}};m([g(100)],s.prototype,"_update",1),s=m([l(1,p)],s),C(d.ID,d,R.BlockRestore),w(s.id,s);