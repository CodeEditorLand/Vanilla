var L=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var V=(d,r,e,i)=>{for(var t=i>1?void 0:i?E(r,e):r,o=d.length-1,n;o>=0;o--)(n=d[o])&&(t=(i?n(r,e,t):n(t))||t);return i&&t&&L(r,e,t),t},c=(d,r)=>(e,i)=>r(e,i,d);import{Dimension as T,asCSSUrl as W,createCSSRule as M,isMouseEvent as H}from"../../../base/browser/dom.js";import{ActionsOrientation as O}from"../../../base/browser/ui/actionbar/actionbar.js";import{toAction as b}from"../../../base/common/actions.js";import{StringSHA1 as U}from"../../../base/common/hash.js";import{Disposable as z,DisposableMap as F,DisposableStore as K}from"../../../base/common/lifecycle.js";import{isNative as N}from"../../../base/common/platform.js";import{ThemeIcon as f}from"../../../base/common/themables.js";import{isString as I}from"../../../base/common/types.js";import{URI as v}from"../../../base/common/uri.js";import{localize as D}from"../../../nls.js";import{IConfigurationService as $}from"../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as J,IContextKeyService as j}from"../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as q}from"../../../platform/instantiation/common/instantiation.js";import{IStorageService as G,StorageScope as h,StorageTarget as y}from"../../../platform/storage/common/storage.js";import{ITelemetryService as Y}from"../../../platform/telemetry/common/telemetry.js";import{IViewDescriptorService as X,ViewContainerLocation as S}from"../../common/views.js";import{IActivityService as Q}from"../../services/activity/common/activity.js";import{IWorkbenchEnvironmentService as Z}from"../../services/environment/common/environmentService.js";import{IExtensionService as ee}from"../../services/extensions/common/extensions.js";import{IWorkbenchLayoutService as P,Parts as C}from"../../services/layout/browser/layoutService.js";import{IViewsService as ie}from"../../services/views/common/viewsService.js";import{CompositeBar as te,CompositeDragAndDrop as oe}from"./compositeBar.js";import{CompositeBarAction as ne,ToggleCompositeBadgeAction as k,ToggleCompositePinnedAction as _}from"./compositeBarActions.js";let g=class extends z{constructor(e,i,t,o,n,s,a,m,w,A,ae){super();this.options=e;this.part=i;this.paneCompositePart=t;this.instantiationService=o;this.storageService=n;this.extensionService=s;this.viewDescriptorService=a;this.viewService=m;this.contextKeyService=w;this.environmentService=A;this.layoutService=ae;this.location=t.partId===C.PANEL_PART?S.Panel:t.partId===C.AUXILIARYBAR_PART?S.AuxiliaryBar:S.Sidebar,this.dndHandler=new oe(this.viewDescriptorService,this.location,this.options.orientation,async(p,u)=>await this.paneCompositePart.openPaneComposite(p,u)??null,(p,u,B)=>this.compositeBar.move(p,u,this.options.orientation===O.VERTICAL?B?.verticallyBefore:B?.horizontallyBefore),()=>this.compositeBar.getCompositeBarItems());const R=this.cachedViewContainers.map(p=>({id:p.id,name:p.name,visible:!this.shouldBeHidden(p.id,p),order:p.order,pinned:p.pinned}));this.compositeBar=this.createCompositeBar(R),this.onDidRegisterViewContainers(this.getViewContainers()),this.registerListeners()}viewContainerDisposables=this._register(new F);location;compositeBar;dndHandler;compositeActions=new Map;hasExtensionsRegistered=!1;createCompositeBar(e){return this._register(this.instantiationService.createInstance(te,e,{icon:this.options.icon,compact:this.options.compact,orientation:this.options.orientation,activityHoverOptions:this.options.activityHoverOptions,preventLoopNavigation:this.options.preventLoopNavigation,openComposite:async(i,t)=>await this.paneCompositePart.openPaneComposite(i,!t)??null,getActivityAction:i=>this.getCompositeActions(i).activityAction,getCompositePinnedAction:i=>this.getCompositeActions(i).pinnedAction,getCompositeBadgeAction:i=>this.getCompositeActions(i).badgeAction,getOnCompositeClickAction:i=>this.getCompositeActions(i).activityAction,fillExtraContextMenuActions:(i,t)=>this.options.fillExtraContextMenuActions(i,t),getContextMenuActionsForComposite:i=>this.getContextMenuActionsForComposite(i),getDefaultCompositeId:()=>this.viewDescriptorService.getDefaultViewContainer(this.location)?.id,dndHandler:this.dndHandler,compositeSize:this.options.compositeSize,overflowActionSize:this.options.overflowActionSize,colors:i=>this.options.colors(i)}))}getContextMenuActionsForComposite(e){const i=[],t=this.viewDescriptorService.getViewContainerById(e),o=this.viewDescriptorService.getDefaultViewContainerLocation(t);if(o!==this.viewDescriptorService.getViewContainerLocation(t))i.push(b({id:"resetLocationAction",label:D("resetLocation","Reset Location"),run:()=>this.viewDescriptorService.moveViewContainerToLocation(t,o,void 0,"resetLocationAction")}));else{const n=this.viewDescriptorService.getViewContainerModel(t);if(n.allViewDescriptors.length===1){const s=n.allViewDescriptors[0],a=this.viewDescriptorService.getDefaultContainerById(s.id);a!==t&&i.push(b({id:"resetLocationAction",label:D("resetLocation","Reset Location"),run:()=>this.viewDescriptorService.moveViewsToContainer([s],a,void 0,"resetLocationAction")}))}}return i}registerListeners(){this._register(this.viewDescriptorService.onDidChangeViewContainers(({added:e,removed:i})=>this.onDidChangeViewContainers(e,i))),this._register(this.viewDescriptorService.onDidChangeContainerLocation(({viewContainer:e,from:i,to:t})=>this.onDidChangeViewContainerLocation(e,i,t))),this._register(this.paneCompositePart.onDidPaneCompositeOpen(e=>this.onDidChangeViewContainerVisibility(e.getId(),!0))),this._register(this.paneCompositePart.onDidPaneCompositeClose(e=>this.onDidChangeViewContainerVisibility(e.getId(),!1))),this.extensionService.whenInstalledExtensionsRegistered().then(()=>{this._store.isDisposed||(this.onDidRegisterExtensions(),this._register(this.compositeBar.onDidChange(()=>this.saveCachedViewContainers())),this._register(this.storageService.onDidChangeValue(h.PROFILE,this.options.pinnedViewContainersKey,this._store)(e=>this.onDidPinnedViewContainersStorageValueChange(e))))})}onDidChangeViewContainers(e,i){i.filter(({location:t})=>t===this.location).forEach(({container:t})=>this.onDidDeregisterViewContainer(t)),this.onDidRegisterViewContainers(e.filter(({location:t})=>t===this.location).map(({container:t})=>t))}onDidChangeViewContainerLocation(e,i,t){i===this.location&&this.onDidDeregisterViewContainer(e),t===this.location&&this.onDidRegisterViewContainers([e])}onDidChangeViewContainerVisibility(e,i){i?this.onDidViewContainerVisible(e):this.compositeBar.deactivateComposite(e)}onDidRegisterExtensions(){this.hasExtensionsRegistered=!0;for(const{id:e}of this.cachedViewContainers){const i=this.getViewContainer(e);i?this.showOrHideViewContainer(i):this.viewDescriptorService.isViewContainerRemovedPermanently(e)?this.removeComposite(e):this.hideComposite(e)}this.saveCachedViewContainers()}onDidViewContainerVisible(e){const i=this.getViewContainer(e);i&&(this.addComposite(i),this.compositeBar.activateComposite(i.id),this.shouldBeHidden(i)&&this.viewDescriptorService.getViewContainerModel(i).activeViewDescriptors.length===0&&this.hideComposite(i.id))}create(e){return this.compositeBar.create(e)}getCompositeActions(e){let i=this.compositeActions.get(e);if(!i){const t=this.getViewContainer(e);if(t){const o=this.viewDescriptorService.getViewContainerModel(t);i={activityAction:this._register(this.instantiationService.createInstance(l,this.toCompositeBarActionItemFrom(o),this.part,this.paneCompositePart)),pinnedAction:this._register(new _(this.toCompositeBarActionItemFrom(o),this.compositeBar)),badgeAction:this._register(new k(this.toCompositeBarActionItemFrom(o),this.compositeBar))}}else{const o=this.cachedViewContainers.filter(n=>n.id===e)[0];i={activityAction:this._register(this.instantiationService.createInstance(se,this.toCompositeBarActionItem(e,o?.name??e,o?.icon,void 0),this.part,this.paneCompositePart)),pinnedAction:this._register(new x(e,this.compositeBar)),badgeAction:this._register(new re(e,this.compositeBar))}}this.compositeActions.set(e,i)}return i}onDidRegisterViewContainers(e){for(const i of e){this.addComposite(i),this.cachedViewContainers.filter(({id:a})=>a===i.id)[0]||this.compositeBar.pin(i.id),this.paneCompositePart.getActivePaneComposite()?.getId()===i.id&&this.compositeBar.activateComposite(i.id);const n=this.viewDescriptorService.getViewContainerModel(i);this.updateCompositeBarActionItem(i,n),this.showOrHideViewContainer(i);const s=new K;s.add(n.onDidChangeContainerInfo(()=>this.updateCompositeBarActionItem(i,n))),s.add(n.onDidChangeActiveViewDescriptors(()=>this.showOrHideViewContainer(i))),this.viewContainerDisposables.set(i.id,s)}}onDidDeregisterViewContainer(e){this.viewContainerDisposables.deleteAndDispose(e.id),this.removeComposite(e.id)}updateCompositeBarActionItem(e,i){const t=this.toCompositeBarActionItemFrom(i),{activityAction:o,pinnedAction:n}=this.getCompositeActions(e.id);o.updateCompositeBarActionItem(t),n instanceof x&&n.setActivity(t),this.options.recomputeSizes&&this.compositeBar.recomputeSizes(),this.saveCachedViewContainers()}toCompositeBarActionItemFrom(e){return this.toCompositeBarActionItem(e.viewContainer.id,e.title,e.icon,e.keybindingId)}toCompositeBarActionItem(e,i,t,o){let n,s;if(this.options.icon)if(v.isUri(t)){s=t;const a=W(t),m=new U;m.update(a);const w=`activity-${e.replace(/\./g,"-")}-${m.digest()}`,A=`.monaco-workbench .${this.options.partContainerClass} .monaco-action-bar .action-label.${w}`;n=[w,"uri-icon"],M(A,`
				mask: ${a} no-repeat 50% 50%;
				mask-size: ${this.options.iconSize}px;
				-webkit-mask: ${a} no-repeat 50% 50%;
				-webkit-mask-size: ${this.options.iconSize}px;
				mask-origin: padding;
				-webkit-mask-origin: padding;
			`)}else f.isThemeIcon(t)&&(n=f.asClassNameArray(t));return{id:e,name:i,classNames:n,iconUrl:s,keybindingId:o}}showOrHideViewContainer(e){this.shouldBeHidden(e)?this.hideComposite(e.id):this.addComposite(e)}shouldBeHidden(e,i){const t=I(e)?this.getViewContainer(e):e,o=I(e)?e:e.id;if(t)if(t.hideIfEmpty){if(this.viewService.isViewContainerActive(o))return!1}else return!1;if(!this.hasExtensionsRegistered&&!(this.part===C.SIDEBAR_PART&&this.environmentService.remoteAuthority&&N)){if(i=i||this.cachedViewContainers.find(({id:n})=>n===o),!t&&i?.isBuiltin&&i?.visible)return!1;if(i?.views?.length)return i.views.every(({when:n})=>!!n&&!this.contextKeyService.contextMatchesRules(J.deserialize(n)))}return!0}addComposite(e){this.compositeBar.addComposite({id:e.id,name:typeof e.title=="string"?e.title:e.title.value,order:e.order,requestedIndex:e.requestedIndex})}hideComposite(e){this.compositeBar.hideComposite(e);const i=this.compositeActions.get(e);i&&(i.activityAction.dispose(),i.pinnedAction.dispose(),this.compositeActions.delete(e))}removeComposite(e){this.compositeBar.removeComposite(e);const i=this.compositeActions.get(e);i&&(i.activityAction.dispose(),i.pinnedAction.dispose(),this.compositeActions.delete(e))}getPinnedPaneCompositeIds(){const e=this.compositeBar.getPinnedComposites().map(i=>i.id);return this.getViewContainers().filter(i=>this.compositeBar.isPinned(i.id)).sort((i,t)=>e.indexOf(i.id)-e.indexOf(t.id)).map(i=>i.id)}getVisiblePaneCompositeIds(){return this.compositeBar.getVisibleComposites().filter(e=>this.paneCompositePart.getActivePaneComposite()?.getId()===e.id||this.compositeBar.isPinned(e.id)).map(e=>e.id)}getContextMenuActions(){return this.compositeBar.getContextMenuActions()}focus(e){this.compositeBar.focus(e)}layout(e,i){this.compositeBar.layout(new T(e,i))}getViewContainer(e){const i=this.viewDescriptorService.getViewContainerById(e);return i&&this.viewDescriptorService.getViewContainerLocation(i)===this.location?i:void 0}getViewContainers(){return this.viewDescriptorService.getViewContainersByLocation(this.location)}onDidPinnedViewContainersStorageValueChange(e){if(this.pinnedViewContainersValue!==this.getStoredPinnedViewContainersValue()){this._placeholderViewContainersValue=void 0,this._pinnedViewContainersValue=void 0,this._cachedViewContainers=void 0;const i=[],t=this.compositeBar.getCompositeBarItems();for(const o of this.cachedViewContainers)i.push({id:o.id,name:o.name,order:o.order,pinned:o.pinned,visible:o.visible&&!!this.getViewContainer(o.id)});for(const o of this.getViewContainers())if(!i.some(({id:n})=>n===o.id)){const n=t.findIndex(({id:s})=>s===o.id);if(n!==-1){const s=t[n];i.splice(n,0,{id:o.id,name:typeof o.title=="string"?o.title:o.title.value,order:s.order,pinned:s.pinned,visible:s.visible})}else i.push({id:o.id,name:typeof o.title=="string"?o.title:o.title.value,order:o.order,pinned:!0,visible:!this.shouldBeHidden(o)})}this.compositeBar.setCompositeBarItems(i)}}saveCachedViewContainers(){const e=[],i=this.compositeBar.getCompositeBarItems();for(const t of i){const o=this.getViewContainer(t.id);if(o){const n=this.viewDescriptorService.getViewContainerModel(o),s=[];for(const{when:a}of n.allViewDescriptors)s.push({when:a?a.serialize():void 0});e.push({id:t.id,name:n.title,icon:v.isUri(n.icon)&&this.environmentService.remoteAuthority?void 0:n.icon,views:s,pinned:t.pinned,order:t.order,visible:t.visible,isBuiltin:!o.extensionId})}else e.push({id:t.id,name:t.name,pinned:t.pinned,order:t.order,visible:!1,isBuiltin:!1})}this.storeCachedViewContainersState(e)}_cachedViewContainers=void 0;get cachedViewContainers(){if(this._cachedViewContainers===void 0){this._cachedViewContainers=this.getPinnedViewContainers();for(const e of this.getPlaceholderViewContainers()){const i=this._cachedViewContainers.find(t=>t.id===e.id);i&&(i.visible=e.visible??i.visible,i.name=e.name,i.icon=e.themeIcon?e.themeIcon:e.iconUrl?v.revive(e.iconUrl):void 0,v.isUri(i.icon)&&this.environmentService.remoteAuthority&&(i.icon=void 0),i.views=e.views,i.isBuiltin=e.isBuiltin)}for(const e of this.getViewContainersWorkspaceState()){const i=this._cachedViewContainers.find(t=>t.id===e.id);i&&(i.visible=e.visible??i.visible)}}return this._cachedViewContainers}storeCachedViewContainersState(e){const i=this.getPinnedViewContainers();this.setPinnedViewContainers(e.map(({id:t,pinned:o,order:n})=>({id:t,pinned:o,visible:!!i.find(({id:s})=>s===t)?.visible,order:n}))),this.setPlaceholderViewContainers(e.map(({id:t,icon:o,name:n,views:s,isBuiltin:a})=>({id:t,iconUrl:v.isUri(o)?o:void 0,themeIcon:f.isThemeIcon(o)?o:void 0,name:n,isBuiltin:a,views:s}))),this.setViewContainersWorkspaceState(e.map(({id:t,visible:o})=>({id:t,visible:o})))}getPinnedViewContainers(){return JSON.parse(this.pinnedViewContainersValue)}setPinnedViewContainers(e){this.pinnedViewContainersValue=JSON.stringify(e)}_pinnedViewContainersValue;get pinnedViewContainersValue(){return this._pinnedViewContainersValue||(this._pinnedViewContainersValue=this.getStoredPinnedViewContainersValue()),this._pinnedViewContainersValue}set pinnedViewContainersValue(e){this.pinnedViewContainersValue!==e&&(this._pinnedViewContainersValue=e,this.setStoredPinnedViewContainersValue(e))}getStoredPinnedViewContainersValue(){return this.storageService.get(this.options.pinnedViewContainersKey,h.PROFILE,"[]")}setStoredPinnedViewContainersValue(e){this.storageService.store(this.options.pinnedViewContainersKey,e,h.PROFILE,y.USER)}getPlaceholderViewContainers(){return JSON.parse(this.placeholderViewContainersValue)}setPlaceholderViewContainers(e){this.placeholderViewContainersValue=JSON.stringify(e)}_placeholderViewContainersValue;get placeholderViewContainersValue(){return this._placeholderViewContainersValue||(this._placeholderViewContainersValue=this.getStoredPlaceholderViewContainersValue()),this._placeholderViewContainersValue}set placeholderViewContainersValue(e){this.placeholderViewContainersValue!==e&&(this._placeholderViewContainersValue=e,this.setStoredPlaceholderViewContainersValue(e))}getStoredPlaceholderViewContainersValue(){return this.storageService.get(this.options.placeholderViewContainersKey,h.PROFILE,"[]")}setStoredPlaceholderViewContainersValue(e){this.storageService.store(this.options.placeholderViewContainersKey,e,h.PROFILE,y.MACHINE)}getViewContainersWorkspaceState(){return JSON.parse(this.viewContainersWorkspaceStateValue)}setViewContainersWorkspaceState(e){this.viewContainersWorkspaceStateValue=JSON.stringify(e)}_viewContainersWorkspaceStateValue;get viewContainersWorkspaceStateValue(){return this._viewContainersWorkspaceStateValue||(this._viewContainersWorkspaceStateValue=this.getStoredViewContainersWorkspaceStateValue()),this._viewContainersWorkspaceStateValue}set viewContainersWorkspaceStateValue(e){this.viewContainersWorkspaceStateValue!==e&&(this._viewContainersWorkspaceStateValue=e,this.setStoredViewContainersWorkspaceStateValue(e))}getStoredViewContainersWorkspaceStateValue(){return this.storageService.get(this.options.viewContainersWorkspaceStateKey,h.WORKSPACE,"[]")}setStoredViewContainersWorkspaceStateValue(e){this.storageService.store(this.options.viewContainersWorkspaceStateKey,e,h.WORKSPACE,y.MACHINE)}};g=V([c(3,q),c(4,G),c(5,ee),c(6,X),c(7,ie),c(8,j),c(9,Z),c(10,P)],g);let l=class extends ne{constructor(e,i,t,o,n,s,a){super(e);this.part=i;this.paneCompositePart=t;this.layoutService=o;this.telemetryService=n;this.configurationService=s;this.activityService=a;this.updateActivity(),this._register(this.activityService.onDidChangeActivity(m=>{!I(m)&&m.id===this.compositeBarActionItem.id&&this.updateActivity()}))}static preventDoubleClickDelay=300;lastRun=0;updateCompositeBarActionItem(e){this.compositeBarActionItem=e}updateActivity(){const e=this.activityService.getViewContainerActivities(this.compositeBarActionItem.id);this.activity=e[0]}async run(e){if(H(e)&&e.button===2)return;const i=Date.now();if(i>this.lastRun&&i-this.lastRun<l.preventDoubleClickDelay)return;this.lastRun=i;const t=e&&"preserveFocus"in e?!e.preserveFocus:!0;if(this.part===C.ACTIVITYBAR_PART){const o=this.layoutService.isVisible(C.SIDEBAR_PART),n=this.paneCompositePart.getActivePaneComposite(),s=this.configurationService.getValue("workbench.activityBar.iconClickBehavior");if(o&&n?.getId()===this.compositeBarActionItem.id){switch(s){case"focus":this.logAction("refocus"),this.paneCompositePart.openPaneComposite(this.compositeBarActionItem.id,t);break;case"toggle":default:this.logAction("hide"),this.layoutService.setPartHidden(!0,C.SIDEBAR_PART);break}return}this.logAction("show")}return await this.paneCompositePart.openPaneComposite(this.compositeBarActionItem.id,t),this.activate()}logAction(e){this.telemetryService.publicLog2("activityBarAction",{viewletId:this.compositeBarActionItem.id,action:e})}};l=V([c(3,P),c(4,Y),c(5,$),c(6,Q)],l);class se extends l{}class x extends _{constructor(r,e){super({id:r,name:r,classNames:void 0},e)}setActivity(r){this.label=r.name}}class re extends k{constructor(r,e){super({id:r,name:r,classNames:void 0},e)}setCompositeBarActionItem(r){this.label=r.name}}export{g as PaneCompositeBar};
