var R=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var E=(s,t,e,n)=>{for(var o=n>1?void 0:n?O(t,e):t,a=s.length-1,l;a>=0;a--)(l=s[a])&&(o=(n?l(t,e,o):l(o))||o);return n&&o&&R(t,e,o),o},u=(s,t)=>(e,n)=>t(e,n,s);import*as D from"../../../../../../vs/base/browser/dom.js";import"../../../../../../vs/base/browser/ui/actionbar/actionbar.js";import"../../../../../../vs/base/browser/ui/actionbar/actionViewItems.js";import{DomScrollableElement as G}from"../../../../../../vs/base/browser/ui/scrollbar/scrollableElement.js";import{ToolBar as V}from"../../../../../../vs/base/browser/ui/toolbar/toolbar.js";import{Separator as h}from"../../../../../../vs/base/common/actions.js";import{disposableTimeout as W}from"../../../../../../vs/base/common/async.js";import{Emitter as z,Event as K}from"../../../../../../vs/base/common/event.js";import{Disposable as B}from"../../../../../../vs/base/common/lifecycle.js";import{ScrollbarVisibility as w}from"../../../../../../vs/base/common/scrollable.js";import{MenuEntryActionViewItem as p,SubmenuEntryActionViewItem as M}from"../../../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import{HiddenItemStrategy as U,WorkbenchToolBar as N}from"../../../../../../vs/platform/actions/browser/toolbar.js";import{IMenuService as H,MenuId as g,MenuItemAction as m,SubmenuItemAction as v}from"../../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as F}from"../../../../../../vs/platform/configuration/common/configuration.js";import"../../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as P}from"../../../../../../vs/platform/contextview/browser/contextView.js";import{WorkbenchHoverDelegate as Y}from"../../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as X}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as Z}from"../../../../../../vs/platform/keybinding/common/keybinding.js";import{SELECT_KERNEL_ID as A}from"../../../../../../vs/workbench/contrib/notebook/browser/controller/coreActions.js";import"../../../../../../vs/workbench/contrib/notebook/browser/notebookBrowser.js";import"../../../../../../vs/workbench/contrib/notebook/browser/notebookOptions.js";import{ActionViewWithLabel as k,UnifiedSubmenuActionView as _}from"../../../../../../vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView.js";import{NotebooKernelActionViewItem as I}from"../../../../../../vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView.js";import{NOTEBOOK_EDITOR_ID as j,NotebookSetting as S}from"../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import{IWorkbenchAssignmentService as q}from"../../../../../../vs/workbench/services/assignment/common/assignmentService.js";import{IEditorService as J}from"../../../../../../vs/workbench/services/editor/common/editorService.js";var Q=(n=>(n[n.Always=0]="Always",n[n.Never=1]="Never",n[n.Dynamic=2]="Dynamic",n))(Q||{});function He(s){switch(s){case!0:return 0;case!1:return 1;case"always":return 0;case"never":return 1;case"dynamic":return 2}}const L=21,$=21,b=8;class ee{constructor(t,e,n,o){this.notebookEditor=t;this.editorToolbar=e;this.goToMenu=n;this.instantiationService=o}actionProvider(t,e){if(t.id===A)return this.instantiationService.createInstance(I,t,this.notebookEditor,e);if(t instanceof m)return this.instantiationService.createInstance(k,t,{hoverDelegate:e.hoverDelegate});if(t instanceof v&&t.item.submenu.id===g.NotebookCellExecuteGoTo.id)return this.instantiationService.createInstance(_,t,{hoverDelegate:e.hoverDelegate},!0,{getActions:()=>this.goToMenu.getActions().find(([n])=>n==="navigation/execute")?.[1]??[]},this.actionProvider.bind(this))}calculateActions(t){const e=this.editorToolbar.primaryActions,n=this.editorToolbar.secondaryActions,o=C(e,n,t);return{primaryActions:o.primaryActions.map(a=>a.action),secondaryActions:o.secondaryActions}}}class te{constructor(t,e,n,o){this.notebookEditor=t;this.editorToolbar=e;this.goToMenu=n;this.instantiationService=o}actionProvider(t,e){if(t.id===A)return this.instantiationService.createInstance(I,t,this.notebookEditor,e);if(t instanceof m)return this.instantiationService.createInstance(p,t,{hoverDelegate:e.hoverDelegate});if(t instanceof v)return t.item.submenu.id===g.NotebookCellExecuteGoTo.id?this.instantiationService.createInstance(_,t,{hoverDelegate:e.hoverDelegate},!1,{getActions:()=>this.goToMenu.getActions().find(([n])=>n==="navigation/execute")?.[1]??[]},this.actionProvider.bind(this)):this.instantiationService.createInstance(M,t,{hoverDelegate:e.hoverDelegate})}calculateActions(t){const e=this.editorToolbar.primaryActions,n=this.editorToolbar.secondaryActions,o=C(e,n,t);return{primaryActions:o.primaryActions.map(a=>a.action),secondaryActions:o.secondaryActions}}}class oe{constructor(t,e,n,o){this.notebookEditor=t;this.editorToolbar=e;this.goToMenu=n;this.instantiationService=o}actionProvider(t,e){if(t.id===A)return this.instantiationService.createInstance(I,t,this.notebookEditor,e);const n=this.editorToolbar.primaryActions.find(o=>o.action.id===t.id);return!n||n.renderLabel?t instanceof m?this.instantiationService.createInstance(k,t,{hoverDelegate:e.hoverDelegate}):t instanceof v&&t.item.submenu.id===g.NotebookCellExecuteGoTo.id?this.instantiationService.createInstance(_,t,{hoverDelegate:e.hoverDelegate},!0,{getActions:()=>this.goToMenu.getActions().find(([o])=>o==="navigation/execute")?.[1]??[]},this.actionProvider.bind(this)):void 0:(t instanceof m&&this.instantiationService.createInstance(p,t,{hoverDelegate:e.hoverDelegate}),t instanceof v?t.item.submenu.id===g.NotebookCellExecuteGoTo.id?this.instantiationService.createInstance(_,t,{hoverDelegate:e.hoverDelegate},!1,{getActions:()=>this.goToMenu.getActions().find(([o])=>o==="navigation/execute")?.[1]??[]},this.actionProvider.bind(this)):this.instantiationService.createInstance(M,t,{hoverDelegate:e.hoverDelegate}):void 0)}calculateActions(t){const e=this.editorToolbar.primaryActions,n=this.editorToolbar.secondaryActions,o=ie(e,n,t);return{primaryActions:o.primaryActions.map(a=>a.action),secondaryActions:o.secondaryActions}}}let y=class extends B{constructor(e,n,o,a,l,r,i,c,d,f,ne){super();this.notebookEditor=e;this.contextKeyService=n;this.notebookOptions=o;this.domNode=a;this.instantiationService=l;this.configurationService=r;this.contextMenuService=i;this.menuService=c;this.editorService=d;this.keybindingService=f;this.experimentService=ne;this._primaryActions=[],this._secondaryActions=[],this._buildBody(),this._register(K.debounce(this.editorService.onDidActiveEditorChange,(x,re)=>x,200)(this._updatePerEditorChange,this)),this._registerNotebookActionsToolbar()}_leftToolbarScrollable;_notebookTopLeftToolbarContainer;_notebookTopRightToolbarContainer;_notebookGlobalActionsMenu;_executeGoToActionsMenu;_notebookLeftToolbar;_primaryActions;get primaryActions(){return this._primaryActions}_secondaryActions;get secondaryActions(){return this._secondaryActions}_notebookRightToolbar;_useGlobalToolbar=!1;_strategy;_renderLabel=0;_visible=!1;set visible(e){this._visible!==e&&(this._visible=e,this._onDidChangeVisibility.fire(e))}_onDidChangeVisibility=this._register(new z);onDidChangeVisibility=this._onDidChangeVisibility.event;get useGlobalToolbar(){return this._useGlobalToolbar}_dimension=null;_deferredActionUpdate;_buildBody(){this._notebookTopLeftToolbarContainer=document.createElement("div"),this._notebookTopLeftToolbarContainer.classList.add("notebook-toolbar-left"),this._leftToolbarScrollable=new G(this._notebookTopLeftToolbarContainer,{vertical:w.Hidden,horizontal:w.Visible,horizontalScrollbarSize:3,useShadows:!1,scrollYToX:!0}),this._register(this._leftToolbarScrollable),D.append(this.domNode,this._leftToolbarScrollable.getDomNode()),this._notebookTopRightToolbarContainer=document.createElement("div"),this._notebookTopRightToolbarContainer.classList.add("notebook-toolbar-right"),D.append(this.domNode,this._notebookTopRightToolbarContainer)}_updatePerEditorChange(){if(this.editorService.activeEditorPane?.getId()===j&&this.editorService.activeEditorPane.getControl()===this.notebookEditor){this._showNotebookActionsinEditorToolbar();return}}_registerNotebookActionsToolbar(){this._notebookGlobalActionsMenu=this._register(this.menuService.createMenu(this.notebookEditor.creationOptions.menuIds.notebookToolbar,this.contextKeyService)),this._executeGoToActionsMenu=this._register(this.menuService.createMenu(g.NotebookCellExecuteGoTo,this.contextKeyService)),this._useGlobalToolbar=this.notebookOptions.getDisplayOptions().globalToolbar,this._renderLabel=this._convertConfiguration(this.configurationService.getValue(S.globalToolbarShowLabel)),this._updateStrategy();const e={ui:!0,notebookEditor:this.notebookEditor,source:"notebookToolbar"},n=(i,c)=>{if(i.id===A)return this.instantiationService.createInstance(I,i,this.notebookEditor,c);if(this._renderLabel!==1){const d=this._primaryActions.find(f=>f.action.id===i.id);return d&&d.renderLabel?i instanceof m?this.instantiationService.createInstance(k,i,{hoverDelegate:c.hoverDelegate}):void 0:i instanceof m?this.instantiationService.createInstance(p,i,{hoverDelegate:c.hoverDelegate}):void 0}else return i instanceof m?this.instantiationService.createInstance(p,i,{hoverDelegate:c.hoverDelegate}):void 0},o=this._register(this.instantiationService.createInstance(Y,"element",!0,{}));o.setInstantHoverTimeLimit(600);const a={hiddenItemStrategy:U.RenderInSecondaryGroup,resetMenu:g.NotebookToolbar,actionViewItemProvider:(i,c)=>this._strategy.actionProvider(i,c),getKeyBinding:i=>this.keybindingService.lookupKeybinding(i.id),renderDropdownAsChildElement:!0,hoverDelegate:o};this._notebookLeftToolbar=this.instantiationService.createInstance(N,this._notebookTopLeftToolbarContainer,a),this._register(this._notebookLeftToolbar),this._notebookLeftToolbar.context=e,this._notebookRightToolbar=new V(this._notebookTopRightToolbarContainer,this.contextMenuService,{getKeyBinding:i=>this.keybindingService.lookupKeybinding(i.id),actionViewItemProvider:n,renderDropdownAsChildElement:!0,hoverDelegate:o}),this._register(this._notebookRightToolbar),this._notebookRightToolbar.context=e,this._showNotebookActionsinEditorToolbar();let l=!1,r;this._register(this._notebookGlobalActionsMenu.onDidChange(()=>{if(l){r=()=>this._showNotebookActionsinEditorToolbar();return}this.notebookEditor.isVisible&&this._showNotebookActionsinEditorToolbar()})),this._register(this._notebookLeftToolbar.onDidChangeDropdownVisibility(i=>{l=i,r&&!i&&(setTimeout(()=>{r?.()},0),r=void 0)})),this._register(this.notebookOptions.onDidChangeOptions(i=>{i.globalToolbar!==void 0&&(this._useGlobalToolbar=this.notebookOptions.getDisplayOptions().globalToolbar,this._showNotebookActionsinEditorToolbar())})),this._register(this.configurationService.onDidChangeConfiguration(i=>{if(i.affectsConfiguration(S.globalToolbarShowLabel)){this._renderLabel=this._convertConfiguration(this.configurationService.getValue(S.globalToolbarShowLabel)),this._updateStrategy(),this._notebookLeftToolbar.getElement().remove(),this._notebookLeftToolbar.dispose(),this._notebookLeftToolbar=this.instantiationService.createInstance(N,this._notebookTopLeftToolbarContainer,a),this._register(this._notebookLeftToolbar),this._notebookLeftToolbar.context=e,this._showNotebookActionsinEditorToolbar();return}})),this.experimentService&&this.experimentService.getTreatment("nbtoolbarineditor").then(i=>{i!==void 0&&this._useGlobalToolbar!==i&&(this._useGlobalToolbar=i,this._showNotebookActionsinEditorToolbar())})}_updateStrategy(){switch(this._renderLabel){case 0:this._strategy=new ee(this.notebookEditor,this,this._executeGoToActionsMenu,this.instantiationService);break;case 1:this._strategy=new te(this.notebookEditor,this,this._executeGoToActionsMenu,this.instantiationService);break;case 2:this._strategy=new oe(this.notebookEditor,this,this._executeGoToActionsMenu,this.instantiationService);break}}_convertConfiguration(e){switch(e){case!0:return 0;case!1:return 1;case"always":return 0;case"never":return 1;case"dynamic":return 2}}_showNotebookActionsinEditorToolbar(){if(!this.notebookEditor.hasModel()){this._deferredActionUpdate?.dispose(),this._deferredActionUpdate=void 0,this.visible=!1;return}this._deferredActionUpdate||(this._useGlobalToolbar?this._deferredActionUpdate=W(async()=>{await this._setNotebookActions(),this.visible=!0,this._deferredActionUpdate=void 0},50):(this.domNode.style.display="none",this._deferredActionUpdate=void 0,this.visible=!1))}async _setNotebookActions(){const e=this._notebookGlobalActionsMenu.getActions({shouldForwardArgs:!0,renderShortTitle:!0});this.domNode.style.display="flex";const n=e.filter(i=>/^navigation/.test(i[0])),o=[];n.sort((i,c)=>i[0]==="navigation"?1:c[0]==="navigation"?-1:0).forEach((i,c)=>{o.push(...i[1]),c<n.length-1&&o.push(new h)});const a=e.find(i=>/^status/.test(i[0])),l=a?a[1]:[],r=e.filter(i=>!/^navigation/.test(i[0])&&!/^status/.test(i[0])).reduce((i,c)=>(i.push(...c[1]),i),[]);this._notebookLeftToolbar.setActions([],[]),this._primaryActions=o.map(i=>({action:i,size:i instanceof h?1:0,renderLabel:!0,visible:!0})),this._notebookLeftToolbar.setActions(o,r),this._secondaryActions=r,this._notebookRightToolbar.setActions(l,[]),this._secondaryActions=r,this._dimension&&this._dimension.width>=0&&this._dimension.height>=0&&this._cacheItemSizes(this._notebookLeftToolbar),this._computeSizes()}_cacheItemSizes(e){for(let n=0;n<e.getItemsLength();n++){const o=e.getItemAction(n);if(o&&o.id!=="toolbar.toggle.more"){const a=this._primaryActions.find(l=>l.action.id===o.id);a&&(a.size=e.getItemWidth(n))}}}_computeSizes(){const e=this._notebookLeftToolbar,n=this._notebookRightToolbar;if(e&&n&&this._dimension&&this._dimension.height>=0&&this._dimension.width>=0){if(this._primaryActions.length===0&&e.getItemsLength()!==this._primaryActions.length&&this._cacheItemSizes(this._notebookLeftToolbar),this._primaryActions.length===0)return;const o=(n.getItemsLength()?n.getItemWidth(0):0)+b,a=this._dimension.width-o-(b+$)-b-b,l=this._strategy.calculateActions(a);this._notebookLeftToolbar.setActions(l.primaryActions,l.secondaryActions)}}layout(e){this._dimension=e,this._useGlobalToolbar?this.domNode.style.display="flex":this.domNode.style.display="none",this._computeSizes()}dispose(){this._notebookLeftToolbar.context=void 0,this._notebookRightToolbar.context=void 0,this._notebookLeftToolbar.dispose(),this._notebookRightToolbar.dispose(),this._notebookLeftToolbar=null,this._notebookRightToolbar=null,this._deferredActionUpdate?.dispose(),this._deferredActionUpdate=void 0,super.dispose()}};y=E([u(4,X),u(5,F),u(6,P),u(7,H),u(8,J),u(9,Z),u(10,q)],y);function C(s,t,e){return T(s,t,e,!1)}function ie(s,t,e){if(s.length===0)return{primaryActions:[],secondaryActions:t};const n=s.filter(r=>r.size!==0).length;if(s.map(r=>r.size).reduce((r,i)=>r+i,0)+(n-1)*b<=e)return s.forEach(r=>{r.renderLabel=!0}),T(s,t,e,!1);if(n*L+(n-1)*b>e)return s.forEach(r=>{r.renderLabel=!1}),T(s,t,e,!0);let a=0,l=-1;for(let r=0;r<s.length;r++)if(a+=s[r].size+b,s[r].action instanceof h){const i=s.slice(r+1).filter(d=>d.size!==0);a+(i.length===0?0:i.length*L+(i.length-1)*b)<=e&&(l=r)}else continue;return l<0?(s.forEach(r=>{r.renderLabel=!1}),T(s,t,e,!0)):(s.slice(0,l+1).forEach(r=>{r.renderLabel=!0}),s.slice(l+1).forEach(r=>{r.renderLabel=!1}),{primaryActions:s,secondaryActions:t})}function T(s,t,e,n){const o=[],a=[];let l=0,r=!1,i=!1;if(s.length===0)return{primaryActions:[],secondaryActions:t};for(let c=0;c<s.length;c++){const d=s[c],f=n?d.size===0?0:L:d.size;if(!(d.action instanceof h&&o.length>0&&o[o.length-1].action instanceof h)&&!(d.action instanceof h&&!r))if(l+f<=e&&!i)l+=b+f,o.push(d),f!==0&&(r=!0),d.action instanceof h&&(r=!1);else if(i=!0,f===0)o.push(d);else{if(d.action instanceof h)continue;a.push(d.action)}}for(let c=o.length-1;c>0;c--){const d=o[c];if(d.size!==0){d.action instanceof h&&o.splice(c,1);break}}if(o.length&&o[o.length-1].action instanceof h&&o.pop(),a.length!==0&&a.push(new h),n){const c=o.findIndex(d=>d.action.id==="notebook.cell.insertMarkdownCellBelow");c!==-1&&o.splice(c,1)}return{primaryActions:o,secondaryActions:[...a,...t]}}export{y as NotebookEditorWorkbenchToolbar,Q as RenderLabel,He as convertConfiguration,C as workbenchCalculateActions,ie as workbenchDynamicCalculateActions};