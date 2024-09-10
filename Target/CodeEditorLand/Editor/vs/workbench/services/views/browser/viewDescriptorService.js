var O=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var D=(h,V,e,i)=>{for(var t=i>1?void 0:i?A(V,e):V,n=h.length-1,o;n>=0;n--)(o=h[n])&&(t=(i?o(V,e,t):o(t))||t);return i&&t&&O(V,e,t),t},g=(h,V)=>(e,i)=>V(e,i,h);import{ViewContainerLocation as m,IViewDescriptorService as T,Extensions as L,ViewVisibilityState as v,defaultViewIcon as _,ViewContainerLocationToString as z,VIEWS_LOG_ID as B,VIEWS_LOG_NAME as P}from"../../../common/views.js";import{RawContextKey as l,IContextKeyService as N,ContextKeyExpr as c}from"../../../../platform/contextkey/common/contextkey.js";import{IStorageService as $,StorageScope as d,StorageTarget as b}from"../../../../platform/storage/common/storage.js";import{IExtensionService as G}from"../../extensions/common/extensions.js";import{Registry as S}from"../../../../platform/registry/common/platform.js";import{toDisposable as F,DisposableStore as y,Disposable as W,DisposableMap as x}from"../../../../base/common/lifecycle.js";import{ViewPaneContainer as U,ViewPaneContainerAction as R,ViewsSubMenu as q}from"../../../browser/parts/views/viewPaneContainer.js";import{SyncDescriptor as J}from"../../../../platform/instantiation/common/descriptors.js";import{InstantiationType as j,registerSingleton as Z}from"../../../../platform/instantiation/common/extensions.js";import{Event as X,Emitter as u}from"../../../../base/common/event.js";import{ITelemetryService as k}from"../../../../platform/telemetry/common/telemetry.js";import{generateUuid as H}from"../../../../base/common/uuid.js";import{IInstantiationService as Q}from"../../../../platform/instantiation/common/instantiation.js";import{getViewsStateStorageId as Y,ViewContainerModel as ee}from"../common/viewContainerModel.js";import{registerAction2 as I,Action2 as ie,MenuId as f}from"../../../../platform/actions/common/actions.js";import{localize as te,localize2 as ne}from"../../../../nls.js";import{ILoggerService as oe}from"../../../../platform/log/common/log.js";import{Lazy as se}from"../../../../base/common/lazy.js";function E(h){return`${h}.state`}let w=class extends W{constructor(e,i,t,n,o,s){super();this.instantiationService=e;this.contextKeyService=i;this.storageService=t;this.extensionService=n;this.telemetryService=o;this.logger=new se(()=>s.createLogger(B,{name:P,hidden:!0})),this.activeViewContextKeys=new Map,this.movableViewContextKeys=new Map,this.defaultViewLocationContextKeys=new Map,this.defaultViewContainerLocationContextKeys=new Map,this.viewContainersRegistry=S.as(L.ViewContainersRegistry),this.viewsRegistry=S.as(L.ViewsRegistry),this.migrateToViewsCustomizationsStorage(),this.viewContainersCustomLocations=new Map(Object.entries(this.viewCustomizations.viewContainerLocations)),this.viewDescriptorsCustomLocations=new Map(Object.entries(this.viewCustomizations.viewLocations)),this.viewContainerBadgeEnablementStates=new Map(Object.entries(this.viewCustomizations.viewContainerBadgeEnablementStates)),this.viewContainers.forEach(r=>this.onDidRegisterViewContainer(r)),this._register(this.viewsRegistry.onViewsRegistered(r=>this.onDidRegisterViews(r))),this._register(this.viewsRegistry.onViewsDeregistered(({views:r,viewContainer:a})=>this.onDidDeregisterViews(r,a))),this._register(this.viewsRegistry.onDidChangeContainer(({views:r,from:a,to:C})=>this.onDidChangeDefaultContainer(r,a,C))),this._register(this.viewContainersRegistry.onDidRegister(({viewContainer:r})=>{this.onDidRegisterViewContainer(r),this._onDidChangeViewContainers.fire({added:[{container:r,location:this.getViewContainerLocation(r)}],removed:[]})})),this._register(this.viewContainersRegistry.onDidDeregister(({viewContainer:r,viewContainerLocation:a})=>{this.onDidDeregisterViewContainer(r),this._onDidChangeViewContainers.fire({removed:[{container:r,location:a}],added:[]})})),this._register(this.storageService.onDidChangeValue(d.PROFILE,w.VIEWS_CUSTOMIZATIONS,this._register(new y))(()=>this.onDidStorageChange())),this.extensionService.whenInstalledExtensionsRegistered().then(()=>this.whenExtensionsRegistered())}static VIEWS_CUSTOMIZATIONS="views.customizations";static COMMON_CONTAINER_ID_PREFIX="workbench.views.service";_onDidChangeContainer=this._register(new u);onDidChangeContainer=this._onDidChangeContainer.event;_onDidChangeLocation=this._register(new u);onDidChangeLocation=this._onDidChangeLocation.event;_onDidChangeContainerLocation=this._register(new u);onDidChangeContainerLocation=this._onDidChangeContainerLocation.event;viewContainerModels=this._register(new x);viewsVisibilityActionDisposables=this._register(new x);canRegisterViewsVisibilityActions=!1;activeViewContextKeys;movableViewContextKeys;defaultViewLocationContextKeys;defaultViewContainerLocationContextKeys;viewsRegistry;viewContainersRegistry;viewContainersCustomLocations;viewDescriptorsCustomLocations;viewContainerBadgeEnablementStates;_onDidChangeViewContainers=this._register(new u);onDidChangeViewContainers=this._onDidChangeViewContainers.event;get viewContainers(){return this.viewContainersRegistry.all}logger;migrateToViewsCustomizationsStorage(){if(this.storageService.get(w.VIEWS_CUSTOMIZATIONS,d.PROFILE))return;const e=this.storageService.get("views.cachedViewContainerLocations",d.PROFILE),i=this.storageService.get("views.cachedViewPositions",d.PROFILE);if(!e&&!i)return;const t=e?JSON.parse(e):[],n=i?JSON.parse(i):[],o={viewContainerLocations:t.reduce((s,[r,a])=>(s[r]=a,s),{}),viewLocations:n.reduce((s,[r,{containerId:a}])=>(s[r]=a,s),{}),viewContainerBadgeEnablementStates:{}};this.storageService.store(w.VIEWS_CUSTOMIZATIONS,JSON.stringify(o),d.PROFILE,b.USER),this.storageService.remove("views.cachedViewContainerLocations",d.PROFILE),this.storageService.remove("views.cachedViewPositions",d.PROFILE)}registerGroupedViews(e){for(const[i,t]of e.entries()){const n=this.viewContainersRegistry.get(i);if(!n||!this.viewContainerModels.has(n)){if(this.isGeneratedContainerId(i)){const s=this.viewContainersCustomLocations.get(i);s!==void 0&&this.registerGeneratedViewContainer(s,i)}continue}const o=t.filter(s=>this.getViewContainerModel(n).allViewDescriptors.filter(r=>r.id===s.id).length===0);this.addViews(n,o)}}deregisterGroupedViews(e){for(const[i,t]of e.entries()){const n=this.viewContainersRegistry.get(i);!n||!this.viewContainerModels.has(n)||this.removeViews(n,t)}}moveOrphanViewsToDefaultLocation(){for(const[e,i]of this.viewDescriptorsCustomLocations.entries()){if(this.viewContainersRegistry.get(i))continue;const t=this.viewsRegistry.getViewContainer(e),n=this.getViewDescriptorById(e);t&&n&&this.addViews(t,[n])}}whenExtensionsRegistered(){this.moveOrphanViewsToDefaultLocation();for(const e of[...this.viewContainersCustomLocations.keys()])this.cleanUpGeneratedViewContainer(e);this.saveViewCustomizations();for(const[e,i]of this.viewContainerModels)this.registerViewsVisibilityActions(e,i);this.canRegisterViewsVisibilityActions=!0}onDidRegisterViews(e){this.contextKeyService.bufferChangeEvents(()=>{e.forEach(({views:i,viewContainer:t})=>{const n=this.regroupViews(t.id,i);this.registerGroupedViews(n),i.forEach(o=>this.getOrCreateMovableViewContextKey(o).set(!!o.canMoveView))})})}isGeneratedContainerId(e){return e.startsWith(w.COMMON_CONTAINER_ID_PREFIX)}onDidDeregisterViews(e,i){const t=this.regroupViews(i.id,e);this.deregisterGroupedViews(t),this.contextKeyService.bufferChangeEvents(()=>{e.forEach(n=>this.getOrCreateMovableViewContextKey(n).set(!1))})}regroupViews(e,i){const t=new Map;for(const n of i){const o=this.viewDescriptorsCustomLocations.get(n.id)??e;let s=t.get(o);s||t.set(o,s=[]),s.push(n)}return t}getViewDescriptorById(e){return this.viewsRegistry.getView(e)}getViewLocationById(e){const i=this.getViewContainerByViewId(e);return i===null?null:this.getViewContainerLocation(i)}getViewContainerByViewId(e){const i=this.viewDescriptorsCustomLocations.get(e);return i?this.viewContainersRegistry.get(i)??null:this.getDefaultContainerById(e)}getViewContainerLocation(e){return this.viewContainersCustomLocations.get(e.id)??this.getDefaultViewContainerLocation(e)}getDefaultViewContainerLocation(e){return this.viewContainersRegistry.getViewContainerLocation(e)}getDefaultContainerById(e){return this.viewsRegistry.getViewContainer(e)??null}getViewContainerModel(e){return this.getOrRegisterViewContainerModel(e)}getViewContainerById(e){return this.viewContainersRegistry.get(e)||null}getViewContainersByLocation(e){return this.viewContainers.filter(i=>this.getViewContainerLocation(i)===e)}getDefaultViewContainer(e){return this.viewContainersRegistry.getDefaultViewContainer(e)}moveViewContainerToLocation(e,i,t,n){this.logger.value.info(`moveViewContainerToLocation: viewContainer:${e.id} location:${i} reason:${n}`),this.moveViewContainerToLocationWithoutSaving(e,i,t),this.saveViewCustomizations()}getViewContainerBadgeEnablementState(e){return this.viewContainerBadgeEnablementStates.get(e)??!0}setViewContainerBadgeEnablementState(e,i){this.viewContainerBadgeEnablementStates.set(e,i),this.saveViewCustomizations()}moveViewToLocation(e,i,t){this.logger.value.info(`moveViewToLocation: view:${e.id} location:${i} reason:${t}`);const n=this.registerGeneratedViewContainer(i);this.moveViewsToContainer([e],n)}moveViewsToContainer(e,i,t,n){if(!e.length)return;this.logger.value.info(`moveViewsToContainer: views:${e.map(r=>r.id).join(",")} viewContainer:${i.id} reason:${n}`);const o=this.getViewContainerByViewId(e[0].id),s=i;o&&s&&o!==s&&(this.moveViewsWithoutSaving(e,o,s,t),this.cleanUpGeneratedViewContainer(o.id),this.saveViewCustomizations(),this.reportMovedViews(e,o,s))}reset(){for(const e of this.viewContainers){const i=this.getViewContainerModel(e);for(const o of i.allViewDescriptors){const s=this.getDefaultContainerById(o.id),r=this.getViewContainerByViewId(o.id);r&&s&&r!==s&&this.moveViewsWithoutSaving([o],r,s)}const t=this.getDefaultViewContainerLocation(e),n=this.getViewContainerLocation(e);t!==null&&n!==t&&this.moveViewContainerToLocationWithoutSaving(e,t),this.cleanUpGeneratedViewContainer(e.id)}this.viewContainersCustomLocations.clear(),this.viewDescriptorsCustomLocations.clear(),this.saveViewCustomizations()}isViewContainerRemovedPermanently(e){return this.isGeneratedContainerId(e)&&!this.viewContainersCustomLocations.has(e)}onDidChangeDefaultContainer(e,i,t){const n=e.filter(o=>!this.viewDescriptorsCustomLocations.has(o.id)||!this.viewContainers.includes(i)&&this.viewDescriptorsCustomLocations.get(o.id)===i.id);n.length&&this.moveViewsWithoutSaving(n,i,t)}reportMovedViews(e,i,t){const n=p=>p.id.startsWith(w.COMMON_CONTAINER_ID_PREFIX)?"custom":p.extensionId?"extension":p.id,o=this.getViewContainerLocation(i),s=this.getViewContainerLocation(t),r=e.length,a=n(i),C=n(t),K=o===m.Panel?"panel":"sidebar",M=s===m.Panel?"panel":"sidebar";this.telemetryService.publicLog2("viewDescriptorService.moveViews",{viewCount:r,fromContainer:a,toContainer:C,fromLocation:K,toLocation:M})}moveViewsWithoutSaving(e,i,t,n=v.Expand){this.removeViews(i,e),this.addViews(t,e,n);const o=this.getViewContainerLocation(i),s=this.getViewContainerLocation(t);o!==s&&this._onDidChangeLocation.fire({views:e,from:o,to:s}),this._onDidChangeContainer.fire({views:e,from:i,to:t})}moveViewContainerToLocationWithoutSaving(e,i,t){const n=this.getViewContainerLocation(e),o=i;if(n!==o){const s=this.isGeneratedContainerId(e.id),r=o===this.getDefaultViewContainerLocation(e);s||!r?this.viewContainersCustomLocations.set(e.id,o):this.viewContainersCustomLocations.delete(e.id),this.getOrCreateDefaultViewContainerLocationContextKey(e).set(s||r),e.requestedIndex=t,this._onDidChangeContainerLocation.fire({viewContainer:e,from:n,to:o});const a=this.getViewsByContainer(e);this._onDidChangeLocation.fire({views:a,from:n,to:o})}}cleanUpGeneratedViewContainer(e){if(!this.isGeneratedContainerId(e))return;const i=this.getViewContainerById(e);i&&this.getViewContainerModel(i)?.allViewDescriptors.length||[...this.viewDescriptorsCustomLocations.values()].includes(e)||(i&&this.viewContainersRegistry.deregisterViewContainer(i),this.viewContainersCustomLocations.delete(e),this.viewContainerBadgeEnablementStates.delete(e),this.storageService.remove(Y(i?.storageId||E(e)),d.PROFILE))}registerGeneratedViewContainer(e,i){const t=i||this.generateContainerId(e),n=this.viewContainersRegistry.registerViewContainer({id:t,ctorDescriptor:new J(U,[t,{mergeViewWithContainerWhenSingleView:!0}]),title:{value:t,original:t},icon:e===m.Sidebar?_:void 0,storageId:E(t),hideIfEmpty:!0},e,{doNotRegisterOpenCommand:!0});return this.viewContainersCustomLocations.get(n.id)!==e&&this.viewContainersCustomLocations.set(n.id,e),this.getOrCreateDefaultViewContainerLocationContextKey(n).set(!0),n}onDidStorageChange(){JSON.stringify(this.viewCustomizations)!==this.getStoredViewCustomizationsValue()&&this.onDidViewCustomizationsStorageChange()}onDidViewCustomizationsStorageChange(){this._viewCustomizations=void 0;const e=new Map(Object.entries(this.viewCustomizations.viewContainerLocations)),i=new Map(Object.entries(this.viewCustomizations.viewLocations)),t=[],n=[];for(const[o,s]of e.entries()){const r=this.getViewContainerById(o);r?s!==this.getViewContainerLocation(r)&&t.push([r,s]):this.isGeneratedContainerId(o)&&this.registerGeneratedViewContainer(s,o)}for(const o of this.viewContainers)if(!e.has(o.id)){const s=this.getViewContainerLocation(o),r=this.getDefaultViewContainerLocation(o);s!==r&&t.push([o,r])}for(const[o,s]of i.entries()){const r=this.getViewDescriptorById(o);if(r){const a=this.getViewContainerByViewId(o),C=this.viewContainersRegistry.get(s);a&&C&&C!==a&&n.push({views:[r],from:a,to:C})}}for(const o of this.viewContainers){const s=this.getViewContainerModel(o);for(const r of s.allViewDescriptors)if(!i.has(r.id)){const a=this.getViewContainerByViewId(r.id),C=this.getDefaultContainerById(r.id);a&&C&&a!==C&&n.push({views:[r],from:a,to:C})}}for(const[o,s]of t)this.moveViewContainerToLocationWithoutSaving(o,s);for(const{views:o,from:s,to:r}of n)this.moveViewsWithoutSaving(o,s,r,v.Default);this.viewContainersCustomLocations=e,this.viewDescriptorsCustomLocations=i}generateContainerId(e){return`${w.COMMON_CONTAINER_ID_PREFIX}.${z(e)}.${H()}`}saveViewCustomizations(){const e={viewContainerLocations:{},viewLocations:{},viewContainerBadgeEnablementStates:{}};for(const[i,t]of this.viewContainersCustomLocations){const n=this.getViewContainerById(i);n&&!this.isGeneratedContainerId(i)&&t===this.getDefaultViewContainerLocation(n)||(e.viewContainerLocations[i]=t)}for(const[i,t]of this.viewDescriptorsCustomLocations){const n=this.getViewContainerById(t);n&&this.getDefaultContainerById(i)?.id===n.id||(e.viewLocations[i]=t)}for(const[i,t]of this.viewContainerBadgeEnablementStates)t===!1&&(e.viewContainerBadgeEnablementStates[i]=t);this.viewCustomizations=e}_viewCustomizations;get viewCustomizations(){return this._viewCustomizations||(this._viewCustomizations=JSON.parse(this.getStoredViewCustomizationsValue()),this._viewCustomizations.viewContainerLocations=this._viewCustomizations.viewContainerLocations??{},this._viewCustomizations.viewLocations=this._viewCustomizations.viewLocations??{},this._viewCustomizations.viewContainerBadgeEnablementStates=this._viewCustomizations.viewContainerBadgeEnablementStates??{}),this._viewCustomizations}set viewCustomizations(e){const i=JSON.stringify(e);JSON.stringify(this.viewCustomizations)!==i&&(this._viewCustomizations=e,this.setStoredViewCustomizationsValue(i))}getStoredViewCustomizationsValue(){return this.storageService.get(w.VIEWS_CUSTOMIZATIONS,d.PROFILE,"{}")}setStoredViewCustomizationsValue(e){this.storageService.store(w.VIEWS_CUSTOMIZATIONS,e,d.PROFILE,b.USER)}getViewsByContainer(e){const i=this.viewsRegistry.getViews(e).filter(t=>(this.viewDescriptorsCustomLocations.get(t.id)??e.id)===e.id);for(const[t,n]of this.viewDescriptorsCustomLocations.entries()){if(n!==e.id||this.viewsRegistry.getViewContainer(t)===e)continue;const o=this.getViewDescriptorById(t);o&&i.push(o)}return i}onDidRegisterViewContainer(e){const i=this.isGeneratedContainerId(e.id)?!0:this.getViewContainerLocation(e)===this.getDefaultViewContainerLocation(e);this.getOrCreateDefaultViewContainerLocationContextKey(e).set(i),this.getOrRegisterViewContainerModel(e)}getOrRegisterViewContainerModel(e){let i=this.viewContainerModels.get(e)?.viewContainerModel;if(!i){const t=new y;i=t.add(this.instantiationService.createInstance(ee,e)),this.onDidChangeActiveViews({added:i.activeViewDescriptors,removed:[]}),i.onDidChangeActiveViewDescriptors(s=>this.onDidChangeActiveViews(s),this,t),this.onDidChangeVisibleViews({added:[...i.visibleViewDescriptors],removed:[]}),i.onDidAddVisibleViewDescriptors(s=>this.onDidChangeVisibleViews({added:s.map(({viewDescriptor:r})=>r),removed:[]}),this,t),i.onDidRemoveVisibleViewDescriptors(s=>this.onDidChangeVisibleViews({added:[],removed:s.map(({viewDescriptor:r})=>r)}),this,t),t.add(F(()=>this.viewsVisibilityActionDisposables.deleteAndDispose(e))),t.add(this.registerResetViewContainerAction(e));const n={viewContainerModel:i,disposables:t,dispose:()=>t.dispose()};this.viewContainerModels.set(e,n),this.onDidRegisterViews([{views:this.viewsRegistry.getViews(e),viewContainer:e}]);const o=this.getViewsByContainer(e).filter(s=>this.getDefaultContainerById(s.id)!==e);o.length&&(this.addViews(e,o),this.contextKeyService.bufferChangeEvents(()=>{o.forEach(s=>this.getOrCreateMovableViewContextKey(s).set(!!s.canMoveView))})),this.canRegisterViewsVisibilityActions&&this.registerViewsVisibilityActions(e,n)}return i}onDidDeregisterViewContainer(e){this.viewContainerModels.deleteAndDispose(e),this.viewsVisibilityActionDisposables.deleteAndDispose(e)}onDidChangeActiveViews({added:e,removed:i}){this.contextKeyService.bufferChangeEvents(()=>{e.forEach(t=>this.getOrCreateActiveViewContextKey(t).set(!0)),i.forEach(t=>this.getOrCreateActiveViewContextKey(t).set(!1))})}onDidChangeVisibleViews({added:e,removed:i}){this.contextKeyService.bufferChangeEvents(()=>{e.forEach(t=>this.getOrCreateVisibleViewContextKey(t).set(!0)),i.forEach(t=>this.getOrCreateVisibleViewContextKey(t).set(!1))})}registerViewsVisibilityActions(e,{viewContainerModel:i,disposables:t}){this.viewsVisibilityActionDisposables.deleteAndDispose(e),this.viewsVisibilityActionDisposables.set(e,this.registerViewsVisibilityActionsForContainer(i)),t.add(X.any(i.onDidChangeActiveViewDescriptors,i.onDidAddVisibleViewDescriptors,i.onDidRemoveVisibleViewDescriptors,i.onDidMoveVisibleViewDescriptors)(n=>{this.viewsVisibilityActionDisposables.deleteAndDispose(e),this.viewsVisibilityActionDisposables.set(e,this.registerViewsVisibilityActionsForContainer(i))}))}registerViewsVisibilityActionsForContainer(e){const i=new y;return e.activeViewDescriptors.forEach((t,n)=>{t.remoteAuthority||(i.add(I(class extends R{constructor(){super({id:`${t.id}.toggleVisibility`,viewPaneContainerId:e.viewContainer.id,precondition:t.canToggleVisibility&&(!e.isVisible(t.id)||e.visibleViewDescriptors.length>1)?c.true():c.false(),toggled:c.has(`${t.id}.visible`),title:t.name,menu:[{id:q,when:c.equals("viewContainer",e.viewContainer.id),order:n},{id:f.ViewContainerTitleContext,when:c.and(c.equals("viewContainer",e.viewContainer.id)),order:n,group:"1_toggleVisibility"},{id:f.ViewTitleContext,when:c.and(c.or(...e.visibleViewDescriptors.map(o=>c.equals("view",o.id)))),order:n,group:"2_toggleVisibility"}]})}async runInViewPaneContainer(o,s){s.toggleViewVisibility(t.id)}})),i.add(I(class extends R{constructor(){super({id:`${t.id}.removeView`,viewPaneContainerId:e.viewContainer.id,title:te("hideView","Hide '{0}'",t.name.value),precondition:t.canToggleVisibility&&(!e.isVisible(t.id)||e.visibleViewDescriptors.length>1)?c.true():c.false(),menu:[{id:f.ViewTitleContext,when:c.and(c.equals("view",t.id),c.has(`${t.id}.visible`)),group:"1_hide",order:1}]})}async runInViewPaneContainer(o,s){s.toggleViewVisibility(t.id)}})))}),i}registerResetViewContainerAction(e){const i=this;return I(class extends ie{constructor(){super({id:`${e.id}.resetViewContainerLocation`,title:ne("resetViewLocation","Reset Location"),menu:[{id:f.ViewContainerTitleContext,when:c.or(c.and(c.equals("viewContainer",e.id),c.equals(`${e.id}.defaultViewContainerLocation`,!1)))}]})}run(){i.moveViewContainerToLocation(e,i.getDefaultViewContainerLocation(e),void 0,this.desc.id)}})}addViews(e,i,t=v.Default){this.contextKeyService.bufferChangeEvents(()=>{i.forEach(n=>{const o=this.getDefaultContainerById(n.id)===e;this.getOrCreateDefaultViewLocationContextKey(n).set(o),o?this.viewDescriptorsCustomLocations.delete(n.id):this.viewDescriptorsCustomLocations.set(n.id,e.id)})}),this.getViewContainerModel(e).add(i.map(n=>({viewDescriptor:n,collapsed:t===v.Default?void 0:!1,visible:t===v.Default?void 0:!0})))}removeViews(e,i){this.contextKeyService.bufferChangeEvents(()=>{i.forEach(t=>{this.viewDescriptorsCustomLocations.get(t.id)===e.id&&this.viewDescriptorsCustomLocations.delete(t.id),this.getOrCreateDefaultViewLocationContextKey(t).set(!1)})}),this.getViewContainerModel(e).remove(i)}getOrCreateActiveViewContextKey(e){const i=`${e.id}.active`;let t=this.activeViewContextKeys.get(i);return t||(t=new l(i,!1).bindTo(this.contextKeyService),this.activeViewContextKeys.set(i,t)),t}getOrCreateVisibleViewContextKey(e){const i=`${e.id}.visible`;let t=this.activeViewContextKeys.get(i);return t||(t=new l(i,!1).bindTo(this.contextKeyService),this.activeViewContextKeys.set(i,t)),t}getOrCreateMovableViewContextKey(e){const i=`${e.id}.canMove`;let t=this.movableViewContextKeys.get(i);return t||(t=new l(i,!1).bindTo(this.contextKeyService),this.movableViewContextKeys.set(i,t)),t}getOrCreateDefaultViewLocationContextKey(e){const i=`${e.id}.defaultViewLocation`;let t=this.defaultViewLocationContextKeys.get(i);return t||(t=new l(i,!1).bindTo(this.contextKeyService),this.defaultViewLocationContextKeys.set(i,t)),t}getOrCreateDefaultViewContainerLocationContextKey(e){const i=`${e.id}.defaultViewContainerLocation`;let t=this.defaultViewContainerLocationContextKeys.get(i);return t||(t=new l(i,!1).bindTo(this.contextKeyService),this.defaultViewContainerLocationContextKeys.set(i,t)),t}};w=D([g(0,Q),g(1,N),g(2,$),g(3,G),g(4,k),g(5,oe)],w),Z(T,w,j.Delayed);export{w as ViewDescriptorService};
