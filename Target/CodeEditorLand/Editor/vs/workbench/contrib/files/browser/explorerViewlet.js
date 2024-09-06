var Y=Object.defineProperty;var z=Object.getOwnPropertyDescriptor;var x=(w,e,o,r)=>{for(var t=r>1?void 0:r?z(e,o):e,s=w.length-1,a;s>=0;s--)(a=w[s])&&(t=(r?a(e,o,t):a(t))||t);return r&&t&&Y(e,o,t),t},i=(w,e)=>(o,r)=>e(o,r,w);import"vs/css!./media/explorerviewlet";import{isMouseEvent as K}from"../../../../../vs/base/browser/dom.js";import{Codicon as A}from"../../../../../vs/base/common/codicons.js";import{KeyChord as G,KeyCode as D,KeyMod as C}from"../../../../../vs/base/common/keyCodes.js";import{Disposable as U}from"../../../../../vs/base/common/lifecycle.js";import{mark as M}from"vs/base/common/performance";import{isMacintosh as j,isWeb as J}from"../../../../../vs/base/common/platform.js";import{localize as c,localize2 as k}from"../../../../../vs/nls.js";import{IConfigurationService as Q}from"../../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as n,IContextKeyService as X}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IsWebContext as S}from"../../../../../vs/platform/contextkey/common/contextkeys.js";import{IContextMenuService as Z}from"../../../../../vs/platform/contextview/browser/contextView.js";import{SyncDescriptor as I}from"../../../../../vs/platform/instantiation/common/descriptors.js";import{IInstantiationService as ee}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IProgressService as oe,ProgressLocation as re}from"../../../../../vs/platform/progress/common/progress.js";import{Registry as P}from"../../../../../vs/platform/registry/common/platform.js";import{IStorageService as te}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as ie}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{registerIcon as q}from"../../../../../vs/platform/theme/common/iconRegistry.js";import{IThemeService as ne}from"../../../../../vs/platform/theme/common/themeService.js";import{IWorkspaceContextService as $,WorkbenchState as se}from"../../../../../vs/platform/workspace/common/workspace.js";import{OpenRecentAction as ce}from"../../../../../vs/workbench/browser/actions/windowActions.js";import{AddRootFolderAction as N,OpenFileFolderAction as ae,OpenFolderAction as pe,OpenFolderViaWorkspaceAction as de}from"../../../../../vs/workbench/browser/actions/workspaceActions.js";import"../../../../../vs/workbench/browser/parts/views/viewPane.js";import{ViewPaneContainer as le}from"../../../../../vs/workbench/browser/parts/views/viewPaneContainer.js";import"../../../../../vs/workbench/browser/parts/views/viewsViewlet.js";import{OpenFolderWorkspaceSupportContext as B,RemoteNameContext as b,WorkbenchStateContext as m}from"../../../../../vs/workbench/common/contextkeys.js";import"../../../../../vs/workbench/common/contributions.js";import{Extensions as L,IViewDescriptorService as me,ViewContainerLocation as we,ViewContentGroups as h}from"../../../../../vs/workbench/common/views.js";import{EmptyView as p}from"../../../../../vs/workbench/contrib/files/browser/views/emptyView.js";import{ExplorerView as H}from"../../../../../vs/workbench/contrib/files/browser/views/explorerView.js";import{OpenEditorsView as y}from"../../../../../vs/workbench/contrib/files/browser/views/openEditorsView.js";import{ExplorerViewletVisibleContext as fe,VIEW_ID as v,VIEWLET_ID as W}from"../../../../../vs/workbench/contrib/files/common/files.js";import{IExtensionService as ue}from"../../../../../vs/workbench/services/extensions/common/extensions.js";import{IWorkbenchLayoutService as he}from"../../../../../vs/workbench/services/layout/browser/layoutService.js";const O=q("explorer-view-icon",A.files,c("explorerViewIcon","View icon of the explorer view.")),Ve=q("open-editors-view-icon",A.book,c("openEditorsIcon","View icon of the open editors view."));let E=class extends U{constructor(o,r){super();this.workspaceContextService=o;r.withProgress({location:re.Explorer},()=>o.getCompleteWorkspace()).finally(()=>{this.registerViews(),this._register(o.onDidChangeWorkbenchState(()=>this.registerViews())),this._register(o.onDidChangeWorkspaceFolders(()=>this.registerViews()))})}static ID="workbench.contrib.explorerViewletViews";registerViews(){M("code/willRegisterExplorerViews");const o=d.getViews(T),r=[],t=[],s=this.createOpenEditorsViewDescriptor();o.some(l=>l.id===s.id)||r.push(s);const a=this.createExplorerViewDescriptor(),f=o.find(l=>l.id===a.id),g=this.createEmptyViewDescriptor(),u=o.find(l=>l.id===g.id);this.workspaceContextService.getWorkbenchState()===se.EMPTY||this.workspaceContextService.getWorkspace().folders.length===0?(f&&t.push(f),u||r.push(g)):(u&&t.push(u),f||r.push(a)),t.length&&d.deregisterViews(t,T),r.length&&d.registerViews(r,T),M("code/didRegisterExplorerViews")}createOpenEditorsViewDescriptor(){return{id:y.ID,name:y.NAME,ctorDescriptor:new I(y),containerIcon:Ve,order:0,canToggleVisibility:!0,canMoveView:!0,collapsed:!1,hideByDefault:!0,focusCommand:{id:"workbench.files.action.focusOpenEditorsView",keybindings:{primary:G(C.CtrlCmd|D.KeyK,D.KeyE)}}}}createEmptyViewDescriptor(){return{id:p.ID,name:p.NAME,containerIcon:O,ctorDescriptor:new I(p),order:1,canToggleVisibility:!0,focusCommand:{id:"workbench.explorer.fileView.focus"}}}createExplorerViewDescriptor(){return{id:v,name:k("folders","Folders"),containerIcon:O,ctorDescriptor:new I(H),order:1,canMoveView:!0,canToggleVisibility:!1,focusCommand:{id:"workbench.explorer.fileView.focus"}}}};E=x([i(0,$),i(1,oe)],E);let V=class extends le{viewletVisibleContextKey;constructor(e,o,r,t,s,a,f,g,u,l,_){super(W,{mergeViewWithContainerWhenSingleView:!0},a,s,e,u,o,l,g,t,r,_),this.viewletVisibleContextKey=fe.bindTo(f),this._register(this.contextService.onDidChangeWorkspaceName(Ce=>this.updateTitleArea()))}create(e){super.create(e),e.classList.add("explorer-viewlet")}createView(e,o){return e.id===v?this.instantiationService.createInstance(H,{...o,delegate:{willOpenElement:r=>{if(!K(r))return;const t=this.getOpenEditorsView();if(t){let s=0;this.configurationService.getValue().workbench?.editor?.enablePreview&&(s=250),t.setStructuralRefreshDelay(s)}},didOpenElement:r=>{if(!K(r))return;this.getOpenEditorsView()?.setStructuralRefreshDelay(0)}}}):super.createView(e,o)}getExplorerView(){return this.getView(v)}getOpenEditorsView(){return this.getView(y.ID)}setVisible(e){this.viewletVisibleContextKey.set(e),super.setVisible(e)}focus(){const e=this.getView(v);e&&this.panes.every(o=>!o.isExpanded())&&e.setExpanded(!0),e?.isExpanded()?e.focus():super.focus()}};V=x([i(0,he),i(1,ie),i(2,$),i(3,te),i(4,Q),i(5,ee),i(6,X),i(7,ne),i(8,Z),i(9,ue),i(10,me)],V);const ge=P.as(L.ViewContainersRegistry),T=ge.registerViewContainer({id:W,title:k("explore","Explorer"),ctorDescriptor:new I(V),storageId:"workbench.explorer.views.state",icon:O,alwaysUseContainerInfo:!0,hideIfEmpty:!0,order:0,openCommandActionDescriptor:{id:W,title:k("explore","Explorer"),mnemonicTitle:c({key:"miViewExplorer",comment:["&& denotes a mnemonic"]},"&&Explorer"),keybindings:{primary:C.CtrlCmd|C.Shift|D.KeyE},order:0}},we.Sidebar,{isDefault:!0}),F=c("openFolder","Open Folder"),Ie=c("addAFolder","add a folder"),ye=c("openRecent","Open Recent"),ve=`[${F}](command:${N.ID})`,Ee=`[${Ie}](command:${N.ID})`,R=`[${F}](command:${j&&!J?ae.ID:pe.ID})`,xe=`[${F}](command:${de.ID})`,De=`[${ye}](command:${ce.ID})`,d=P.as(L.ViewsRegistry);d.registerViewWelcomeContent(p.ID,{content:c({key:"noWorkspaceHelp",comment:['Please do not translate the word "command", it is part of our internal syntax which must not change']},`You have not yet added a folder to the workspace.
{0}`,ve),when:n.and(m.isEqualTo("workspace"),B),group:h.Open,order:1}),d.registerViewWelcomeContent(p.ID,{content:c({key:"noFolderHelpWeb",comment:['Please do not translate the word "command", it is part of our internal syntax which must not change']},`You have not yet opened a folder.
{0}
{1}`,xe,De),when:n.and(m.isEqualTo("workspace"),B.toNegated()),group:h.Open,order:1}),d.registerViewWelcomeContent(p.ID,{content:c({key:"remoteNoFolderHelp",comment:['Please do not translate the word "command", it is part of our internal syntax which must not change']},`Connected to remote.
{0}`,R),when:n.and(m.notEqualsTo("workspace"),b.notEqualsTo(""),S.toNegated()),group:h.Open,order:1}),d.registerViewWelcomeContent(p.ID,{content:c({key:"noFolderButEditorsHelp",comment:['Please do not translate the word "command", it is part of our internal syntax which must not change']},`You have not yet opened a folder.
{0}
Opening a folder will close all currently open editors. To keep them open, {1} instead.`,R,Ee),when:n.and(n.has("editorIsOpen"),n.or(n.and(m.notEqualsTo("workspace"),b.isEqualTo("")),n.and(m.notEqualsTo("workspace"),S))),group:h.Open,order:1}),d.registerViewWelcomeContent(p.ID,{content:c({key:"noFolderHelp",comment:['Please do not translate the word "command", it is part of our internal syntax which must not change']},`You have not yet opened a folder.
{0}`,R),when:n.and(n.has("editorIsOpen")?.negate(),n.or(n.and(m.notEqualsTo("workspace"),b.isEqualTo("")),n.and(m.notEqualsTo("workspace"),S))),group:h.Open,order:1});export{V as ExplorerViewPaneContainer,E as ExplorerViewletViewsContribution,T as VIEW_CONTAINER};