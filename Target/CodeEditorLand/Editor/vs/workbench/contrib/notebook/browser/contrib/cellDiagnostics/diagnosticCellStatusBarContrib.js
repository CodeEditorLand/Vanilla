var I=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var m=(n,r,t,e)=>{for(var o=e>1?void 0:e?b(r,t):r,i=n.length-1,l;i>=0;i--)(l=n[i])&&(o=(e?l(r,t,o):l(o))||o);return e&&o&&I(r,t,o),o},a=(n,r)=>(t,e)=>r(t,e,n);import{Disposable as p}from"../../../../../../base/common/lifecycle.js";import{autorun as u}from"../../../../../../base/common/observable.js";import{localize as k}from"../../../../../../nls.js";import{IInstantiationService as f}from"../../../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as h}from"../../../../../../platform/keybinding/common/keybinding.js";import{CellStatusbarAlignment as E}from"../../../common/notebookCommon.js";import{registerNotebookContribution as N}from"../../notebookEditorExtensions.js";import{CodeCellViewModel as _}from"../../viewModel/codeCellViewModel.js";import{NotebookStatusBarController as v}from"../cellStatusBar/executionStatusBarItemController.js";import{OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID as c}from"./cellDiagnosticsActions.js";let s=class extends p{static id="workbench.notebook.statusBar.diagtnostic";constructor(r,t){super(),this._register(new v(r,(e,o)=>o instanceof _?t.createInstance(d,e,o):p.None))}};s=m([a(1,f)],s),N(s.id,s);let d=class extends p{constructor(t,e,o){super();this._notebookViewModel=t;this.cell=e;this.keybindingService=o;this._register(u(i=>this.updateSparkleItem(i.readObservable(e.excecutionError))))}_currentItemIds=[];async updateSparkleItem(t){let e;if(t?.location){const i=this.keybindingService.lookupKeybinding(c)?.getLabel();e={text:"$(sparkle)",tooltip:k("notebook.cell.status.diagnostic","Quick Actions {0}",`(${i})`),alignment:E.Left,command:c,priority:Number.MAX_SAFE_INTEGER-1}}const o=e?[e]:[];this._currentItemIds=this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds,[{handle:this.cell.handle,items:o}])}dispose(){super.dispose(),this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds,[{handle:this.cell.handle,items:[]}])}};d=m([a(2,h)],d);export{s as DiagnosticCellStatusBarContrib};
