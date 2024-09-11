var h=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var C=(a,r,e,t)=>{for(var i=t>1?void 0:t?I(r,e):r,n=a.length-1,o;n>=0;n--)(o=a[n])&&(i=(t?o(r,e,i):o(i))||i);return t&&i&&h(r,e,i),i},s=(a,r)=>(e,t)=>r(e,t,a);import{Registry as p}from"../../platform/registry/common/platform.js";import{Composite as g,CompositeDescriptor as P,CompositeRegistry as l}from"./composite.js";import{IInstantiationService as A}from"../../platform/instantiation/common/instantiation.js";import"../../base/common/uri.js";import"../../base/browser/dom.js";import"../../base/browser/ui/actionbar/actionbar.js";import{Separator as S}from"../../base/common/actions.js";import{SubmenuItemAction as f}from"../../platform/actions/common/actions.js";import{IContextMenuService as x}from"../../platform/contextview/browser/contextView.js";import{IStorageService as V}from"../../platform/storage/common/storage.js";import{ITelemetryService as b}from"../../platform/telemetry/common/telemetry.js";import{IThemeService as y}from"../../platform/theme/common/themeService.js";import{IWorkspaceContextService as M}from"../../platform/workspace/common/workspace.js";import{ViewsSubMenu as T}from"./parts/views/viewPaneContainer.js";import"../common/panecomposite.js";import"../common/views.js";import{IExtensionService as D}from"../services/extensions/common/extensions.js";import{VIEWPANE_FILTER_ACTION as B}from"./parts/views/viewPane.js";import"../../base/browser/ui/sash/sash.js";import"../../base/browser/ui/actionbar/actionViewItems.js";let m=class extends g{constructor(e,t,i,n,o,c,u,E){super(e,t,o,i);this.storageService=i;this.instantiationService=n;this.contextMenuService=c;this.extensionService=u;this.contextService=E}viewPaneContainer;create(e){super.create(e),this.viewPaneContainer=this._register(this.createViewPaneContainer(e)),this._register(this.viewPaneContainer.onTitleAreaUpdate(()=>this.updateTitleArea())),this.viewPaneContainer.create(e)}setVisible(e){super.setVisible(e),this.viewPaneContainer?.setVisible(e)}layout(e){this.viewPaneContainer?.layout(e)}setBoundarySashes(e){this.viewPaneContainer?.setBoundarySashes(e)}getOptimalWidth(){return this.viewPaneContainer?.getOptimalWidth()??0}openView(e,t){return this.viewPaneContainer?.openView(e,t)}getViewPaneContainer(){return this.viewPaneContainer}getActionsContext(){return this.getViewPaneContainer()?.getActionsContext()}getContextMenuActions(){return this.viewPaneContainer?.menuActions?.getContextMenuActions()??[]}getMenuIds(){const e=[];return this.viewPaneContainer?.menuActions&&(e.push(this.viewPaneContainer.menuActions.menuId),this.viewPaneContainer.isViewMergedWithContainer()&&e.push(this.viewPaneContainer.panes[0].menuActions.menuId)),e}getActions(){const e=[];if(this.viewPaneContainer?.menuActions&&(e.push(...this.viewPaneContainer.menuActions.getPrimaryActions()),this.viewPaneContainer.isViewMergedWithContainer())){const t=this.viewPaneContainer.panes[0];t.shouldShowFilterInHeader()&&e.push(B),e.push(...t.menuActions.getPrimaryActions())}return e}getSecondaryActions(){if(!this.viewPaneContainer?.menuActions)return[];const e=this.viewPaneContainer.isViewMergedWithContainer()?this.viewPaneContainer.panes[0].menuActions.getSecondaryActions():[];let t=this.viewPaneContainer.menuActions.getSecondaryActions();const i=t.findIndex(n=>n instanceof f&&n.item.submenu===T);if(i!==-1){const n=t[i];n.actions.some(({enabled:o})=>o)?t.length===1&&e.length===0?t=n.actions.slice():i!==0&&(t=[n,...t.slice(0,i),...t.slice(i+1)]):t.splice(i,1)}return t.length&&e.length?[...t,new S,...e]:t.length?t:e}getActionViewItem(e,t){return this.viewPaneContainer?.getActionViewItem(e,t)}getTitle(){return this.viewPaneContainer?.getTitle()??""}focus(){super.focus(),this.viewPaneContainer?.focus()}};m=C([s(1,b),s(2,V),s(3,A),s(4,y),s(5,x),s(6,D),s(7,M)],m);class w extends P{constructor(e,t,i,n,o,c,u){super(e,t,i,n,o,c);this.iconUrl=u}static create(e,t,i,n,o,c,u){return new w(e,t,i,n,o,c,u)}}const d={Viewlets:"workbench.contributions.viewlets",Panels:"workbench.contributions.panels",Auxiliary:"workbench.contributions.auxiliary"};class v extends l{registerPaneComposite(r){super.registerComposite(r)}deregisterPaneComposite(r){super.deregisterComposite(r)}getPaneComposite(r){return this.getComposite(r)}getPaneComposites(){return this.getComposites()}}p.add(d.Viewlets,new v),p.add(d.Panels,new v),p.add(d.Auxiliary,new v);export{d as Extensions,m as PaneComposite,w as PaneCompositeDescriptor,v as PaneCompositeRegistry};
