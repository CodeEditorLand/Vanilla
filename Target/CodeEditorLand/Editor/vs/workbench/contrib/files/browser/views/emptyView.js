var h=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var p=(a,i,r,e)=>{for(var t=e>1?void 0:e?I(i,r):i,n=a.length-1,c;n>=0;n--)(c=a[n])&&(t=(e?c(i,r,t):c(t))||t);return e&&t&&h(i,r,t),t},o=(a,i)=>(r,e)=>i(r,e,a);import*as g from"../../../../../nls.js";import{IInstantiationService as u}from"../../../../../platform/instantiation/common/instantiation.js";import{IThemeService as b}from"../../../../../platform/theme/common/themeService.js";import{IKeybindingService as C}from"../../../../../platform/keybinding/common/keybinding.js";import{IContextMenuService as k}from"../../../../../platform/contextview/browser/contextView.js";import{isTemporaryWorkspace as D,IWorkspaceContextService as T,WorkbenchState as y}from"../../../../../platform/workspace/common/workspace.js";import{IConfigurationService as x}from"../../../../../platform/configuration/common/configuration.js";import{ViewPane as W}from"../../../../browser/parts/views/viewPane.js";import{ResourcesDropHandler as O}from"../../../../browser/dnd.js";import{listDropOverBackground as w}from"../../../../../platform/theme/common/colorRegistry.js";import{ILabelService as H}from"../../../../../platform/label/common/label.js";import{IContextKeyService as L}from"../../../../../platform/contextkey/common/contextkey.js";import{IViewDescriptorService as K}from"../../../../common/views.js";import{IOpenerService as M}from"../../../../../platform/opener/common/opener.js";import{ITelemetryService as _}from"../../../../../platform/telemetry/common/telemetry.js";import{isWeb as A}from"../../../../../base/common/platform.js";import{DragAndDropObserver as V,getWindow as z}from"../../../../../base/browser/dom.js";import{IHoverService as B}from"../../../../../platform/hover/browser/hover.js";let s=class extends W{constructor(r,e,t,n,c,l,E,d,N,v,m,S,f){super(r,c,l,d,v,t,n,m,e,S,f);this.contextService=E;this.labelService=N;this._register(this.contextService.onDidChangeWorkbenchState(()=>this.refreshTitle())),this._register(this.labelService.onDidChangeFormatters(()=>this.refreshTitle()))}static ID="workbench.explorer.emptyView";static NAME=g.localize2("noWorkspace","No Folder Opened");_disposed=!1;shouldShowWelcome(){return!0}renderBody(r){super.renderBody(r),this._register(new V(r,{onDrop:e=>{r.style.backgroundColor="",this.instantiationService.createInstance(O,{allowWorkspaceOpen:!A||D(this.contextService.getWorkspace())}).handleDrop(e,z(r))},onDragEnter:()=>{const e=this.themeService.getColorTheme().getColor(w);r.style.backgroundColor=e?e.toString():""},onDragEnd:()=>{r.style.backgroundColor=""},onDragLeave:()=>{r.style.backgroundColor=""},onDragOver:e=>{e.dataTransfer&&(e.dataTransfer.dropEffect="copy")}})),this.refreshTitle()}refreshTitle(){this._disposed||(this.contextService.getWorkbenchState()===y.WORKSPACE?this.updateTitle(s.NAME.value):this.updateTitle(this.title))}dispose(){this._disposed=!0,super.dispose()}};s=p([o(1,b),o(2,K),o(3,u),o(4,C),o(5,k),o(6,T),o(7,x),o(8,H),o(9,L),o(10,M),o(11,_),o(12,B)],s);export{s as EmptyView};
