var We=Object.defineProperty;var De=Object.getOwnPropertyDescriptor;var H=(p,o,e,t)=>{for(var n=t>1?void 0:t?De(o,e):o,s=p.length-1,r;s>=0;s--)(r=p[s])&&(n=(t?r(o,e,n):r(n))||n);return t&&n&&We(o,e,n),n},c=(p,o)=>(e,t)=>o(e,t,p);import{$ as k,append as B}from"../../../../../vs/base/browser/dom.js";import{alert as Ue}from"../../../../../vs/base/browser/ui/aria/aria.js";import{CountBadge as Ne}from"../../../../../vs/base/browser/ui/countBadge/countBadge.js";import{HoverPosition as O}from"../../../../../vs/base/browser/ui/hover/hoverWidget.js";import"../../../../../vs/base/browser/ui/list/list.js";import{Action as Ae,ActionRunner as Fe,Separator as Ve}from"../../../../../vs/base/common/actions.js";import{coalesce as q,distinct as G}from"../../../../../vs/base/common/arrays.js";import{createCancelablePromise as He,ThrottledDelayer as Ge}from"../../../../../vs/base/common/async.js";import{CancellationToken as $e}from"../../../../../vs/base/common/cancellation.js";import{createErrorWithActions as ze}from"../../../../../vs/base/common/errorMessage.js";import{getErrorMessage as Ke,isCancellationError as ee}from"../../../../../vs/base/common/errors.js";import{Emitter as $,Event as L}from"../../../../../vs/base/common/event.js";import{Disposable as _e,DisposableStore as D,toDisposable as Ze}from"../../../../../vs/base/common/lifecycle.js";import{DelayedPagedModel as te,PagedModel as f}from"../../../../../vs/base/common/paging.js";import{isString as U}from"../../../../../vs/base/common/types.js";import"../../../../../vs/base/common/uri.js";import{isOfflineError as je}from"../../../../../vs/base/parts/request/common/request.js";import{localize as E}from"../../../../../vs/nls.js";import{IConfigurationService as ne}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as se}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as ie}from"../../../../../vs/platform/contextview/browser/contextView.js";import{ExtensionGalleryError as Ye,ExtensionGalleryErrorCode as Je,SortBy as S,SortOrder as re}from"../../../../../vs/platform/extensionManagement/common/extensionManagement.js";import{areSameExtensions as I,getExtensionDependencies as Xe}from"../../../../../vs/platform/extensionManagement/common/extensionManagementUtil.js";import{ExtensionIdentifier as qe,ExtensionIdentifierMap as et,isLanguagePackExtension as oe}from"../../../../../vs/platform/extensions/common/extensions.js";import{IHoverService as ae}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as le}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as de}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{WorkbenchPagedList as tt}from"../../../../../vs/platform/list/browser/listService.js";import{ILogService as ce}from"../../../../../vs/platform/log/common/log.js";import{INotificationService as ue,Severity as z}from"../../../../../vs/platform/notification/common/notification.js";import{IOpenerService as me}from"../../../../../vs/platform/opener/common/opener.js";import{IProductService as pe}from"../../../../../vs/platform/product/common/productService.js";import{Registry as nt}from"../../../../../vs/platform/registry/common/platform.js";import{SeverityIcon as he}from"../../../../../vs/platform/severityIcon/browser/severityIcon.js";import{IStorageService as ge,StorageScope as xe,StorageTarget as st}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as fe}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{defaultCountBadgeStyles as it}from"../../../../../vs/platform/theme/browser/defaultStyles.js";import{IThemeService as ye}from"../../../../../vs/platform/theme/common/themeService.js";import{IUriIdentityService as ve}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{isVirtualWorkspace as rt}from"../../../../../vs/platform/workspace/common/virtualWorkspace.js";import{IWorkspaceContextService as N}from"../../../../../vs/platform/workspace/common/workspace.js";import{IWorkspaceTrustManagementService as Ee}from"../../../../../vs/platform/workspace/common/workspaceTrust.js";import{ViewPane as ot,ViewPaneShowActions as at}from"../../../../../vs/workbench/browser/parts/views/viewPane.js";import"../../../../../vs/workbench/browser/parts/views/viewsViewlet.js";import{IViewDescriptorService as Ie,ViewContainerLocation as Se}from"../../../../../vs/workbench/common/views.js";import{ExtensionAction as lt,getContextMenuActions as dt,ManageExtensionAction as ct}from"../../../../../vs/workbench/contrib/extensions/browser/extensionsActions.js";import{Delegate as ut,Renderer as mt}from"../../../../../vs/workbench/contrib/extensions/browser/extensionsList.js";import{Query as pt}from"../../../../../vs/workbench/contrib/extensions/common/extensionQuery.js";import{ExtensionState as ht,IExtensionsWorkbenchService as we}from"../../../../../vs/workbench/contrib/extensions/common/extensions.js";import{Extensions as gt,IExtensionFeaturesManagementService as be}from"../../../../../vs/workbench/services/extensionManagement/common/extensionFeatures.js";import{EnablementState as T,IExtensionManagementServerService as Re,IWorkbenchExtensionEnablementService as Ce,IWorkbenchExtensionManagementService as Pe}from"../../../../../vs/workbench/services/extensionManagement/common/extensionManagement.js";import{IExtensionRecommendationsService as Me}from"../../../../../vs/workbench/services/extensionRecommendations/common/extensionRecommendations.js";import{IExtensionManifestPropertiesService as Qe}from"../../../../../vs/workbench/services/extensions/common/extensionManifestPropertiesService.js";import{IExtensionService as ke,toExtension as Be}from"../../../../../vs/workbench/services/extensions/common/extensions.js";import{IWorkbenchLayoutService as Oe,Position as Le}from"../../../../../vs/workbench/services/layout/browser/layoutService.js";import{IPreferencesService as Te}from"../../../../../vs/workbench/services/preferences/common/preferences.js";const xt="none";class ft extends _e{_onFocus=this._register(new $);onFocus=this._onFocus.event;_onBlur=this._register(new $);onBlur=this._onBlur.event;currentlyFocusedItems=[];onFocusChange(o){this.currentlyFocusedItems.forEach(e=>this._onBlur.fire(e)),this.currentlyFocusedItems=o,this.currentlyFocusedItems.forEach(e=>this._onFocus.fire(e))}}var yt=(o=>(o.UpdateDate="UpdateDate",o))(yt||{});function vt(p){switch(p){case"UpdateDate":return!0}}let u=class extends ot{constructor(e,t,n,s,r,a,i,d,l,m,g,w,x,v,h,y,b,R,Q,C,P,M,K,V,_,Z,j,Y,J,X){super({...t,showActions:at.Always,maximumBodySize:e.flexibleHeight?V.getNumber(`${t.id}.size`,xe.PROFILE,0)?void 0:0:void 0},s,r,x,C,P,a,M,i,g,w);this.options=e;this.notificationService=n;this.extensionService=d;this.extensionsWorkbenchService=l;this.extensionRecommendationsService=m;this.contextService=v;this.extensionManagementServerService=h;this.extensionManifestPropertiesService=y;this.extensionManagementService=b;this.workspaceService=R;this.productService=Q;this.preferencesService=K;this.storageService=V;this.workspaceTrustManagementService=_;this.extensionEnablementService=Z;this.layoutService=j;this.extensionFeaturesManagementService=Y;this.uriIdentityService=J;this.logService=X;this.options.onDidChangeTitle&&this._register(this.options.onDidChangeTitle(W=>this.updateTitle(W))),this._register(this.contextMenuActionRunner.onDidRun(({error:W})=>W&&this.notificationService.error(W))),this.registerActions()}static RECENT_UPDATE_DURATION=7*24*60*60*1e3;bodyTemplate;badge;list=null;queryRequest=null;queryResult;contextMenuActionRunner=this._register(new Fe);registerActions(){}renderHeader(e){e.classList.add("extension-view-header"),super.renderHeader(e),this.options.hideBadge||(this.badge=new Ne(B(e,k(".count-badge-wrapper")),{},it))}renderBody(e){super.renderBody(e);const t=B(e,k(".extensions-list")),n=B(e,k(".message-container")),s=B(n,k("")),r=B(n,k(".message")),a=new ut,i=new ft,d=this.instantiationService.createInstance(mt,i,{hoverOptions:{position:()=>{const l=this.viewDescriptorService.getViewLocationById(this.id);return l===Se.Sidebar?this.layoutService.getSideBarPosition()===Le.LEFT?O.RIGHT:O.LEFT:l===Se.AuxiliaryBar?this.layoutService.getSideBarPosition()===Le.LEFT?O.LEFT:O.RIGHT:O.RIGHT}}});this.list=this.instantiationService.createInstance(tt,"Extensions",t,a,[d],{multipleSelectionSupport:!1,setRowLineHeight:!1,horizontalScrolling:!1,accessibilityProvider:{getAriaLabel(l){return Et(l)},getWidgetAriaLabel(){return E("extensions","Extensions")}},overrideStyles:this.getLocationBasedColors().listOverrideStyles,openOnSingleClick:!0}),this._register(this.list.onContextMenu(l=>this.onContextMenu(l),this)),this._register(this.list.onDidChangeFocus(l=>i.onFocusChange(q(l.elements)),this)),this._register(this.list),this._register(i),this._register(L.debounce(L.filter(this.list.onDidOpen,l=>l.element!==null),(l,m)=>m,75,!0)(l=>{this.openExtension(l.element,{sideByside:l.sideBySide,...l.editorOptions})})),this.bodyTemplate={extensionsList:t,messageBox:r,messageContainer:n,messageSeverityIcon:s},this.queryResult&&this.setModel(this.queryResult.model)}layoutBody(e,t){super.layoutBody(e,t),this.bodyTemplate&&(this.bodyTemplate.extensionsList.style.height=e+"px"),this.list?.layout(e,t)}async show(e,t){if(this.queryRequest){if(!t&&this.queryRequest.query===e)return this.queryRequest.request;this.queryRequest.request.cancel(),this.queryRequest=null}this.queryResult&&(this.queryResult.disposables.dispose(),this.queryResult=void 0);const n=pt.parse(e),s={sortOrder:re.Default};switch(n.sortBy){case"installs":s.sortBy=S.InstallCount;break;case"rating":s.sortBy=S.WeightedRating;break;case"name":s.sortBy=S.Title;break;case"publishedDate":s.sortBy=S.PublishedDate;break;case"updateDate":s.sortBy="UpdateDate";break}const r=He(async a=>{try{this.queryResult=await this.query(n,s,a);const i=this.queryResult.model;return this.setModel(i),this.queryResult.onDidChangeModel&&this.queryResult.disposables.add(this.queryResult.onDidChangeModel(d=>{this.queryResult&&(this.queryResult.model=d,this.updateModel(d))})),i}catch(i){const d=new f([]);return ee(i)||(this.logService.error(i),this.setModel(d,i)),this.list?this.list.model:d}});return r.finally(()=>this.queryRequest=null),this.queryRequest={query:e,request:r},r}count(){return this.queryResult?.model.length??0}showEmptyModel(){const e=new f([]);return this.setModel(e),Promise.resolve(e)}async onContextMenu(e){if(e.element){const t=new D,n=t.add(this.instantiationService.createInstance(ct)),s=e.element&&this.extensionsWorkbenchService.local.find(i=>I(i.identifier,e.element.identifier)&&(!e.element.server||e.element.server===i.server))||e.element;n.extension=s;let r=[];n.enabled?r=await n.getActionGroups():s&&(r=await dt(s,this.contextKeyService,this.instantiationService),r.forEach(i=>i.forEach(d=>{d instanceof lt&&(d.extension=s)})));let a=[];for(const i of r)a=[...a,...i,new Ve];a.pop(),this.contextMenuService.showContextMenu({getAnchor:()=>e.anchor,getActions:()=>a,actionRunner:this.contextMenuActionRunner,onHide:()=>t.dispose()})}}async query(e,t,n){const s=/@id:(([a-z0-9A-Z][a-z0-9\-A-Z]*)\.([a-z0-9A-Z][a-z0-9\-A-Z]*))/g,r=[];let a;for(;(a=s.exec(e.value))!==null;){const l=a[1];r.push(l)}if(r.length)return{model:await this.queryByIds(r,t,n),disposables:new D};if(u.isLocalExtensionsQuery(e.value,e.sortBy))return this.queryLocal(e,t);u.isSearchPopularQuery(e.value)?(e.value=e.value.replace("@popular",""),t.sortBy=t.sortBy?t.sortBy:S.InstallCount):u.isSearchRecentlyPublishedQuery(e.value)&&(e.value=e.value.replace("@recentlyPublished",""),t.sortBy=t.sortBy?t.sortBy:S.PublishedDate);const i={...t,sortBy:vt(t.sortBy)?void 0:t.sortBy};return{model:await this.queryGallery(e,i,n),disposables:new D}}async queryByIds(e,t,n){const s=e.reduce((i,d)=>(i.add(d.toLowerCase()),i),new Set),r=(await this.extensionsWorkbenchService.queryLocal(this.options.server)).filter(i=>s.has(i.identifier.id.toLowerCase())),a=r.length?e.filter(i=>r.every(d=>!I(d.identifier,{id:i}))):e;if(a.length){const i=await this.extensionsWorkbenchService.getExtensions(a.map(d=>({id:d})),{source:"queryById"},n);r.push(...i)}return this.getPagedModel(r)}async queryLocal(e,t){const n=await this.extensionsWorkbenchService.queryLocal(this.options.server);let{extensions:s,canIncludeInstalledExtensions:r}=await this.filterLocal(n,this.extensionService.extensions,e,t);const a=new D,i=a.add(new $);if(r){let d=!1;a.add(Ze(()=>d=!0)),a.add(L.debounce(L.any(L.filter(this.extensionsWorkbenchService.onChange,l=>l?.state===ht.Installed),this.extensionService.onDidChangeExtensions),()=>{})(async()=>{const l=this.options.server?this.extensionsWorkbenchService.installed.filter(g=>g.server===this.options.server):this.extensionsWorkbenchService.local,{extensions:m}=await this.filterLocal(l,this.extensionService.extensions,e,t);if(!d){const g=this.mergeAddedExtensions(s,m);g&&(s=g,i.fire(new f(s)))}}))}return{model:new f(s),onDidChangeModel:i.event,disposables:a}}async filterLocal(e,t,n,s){const r=n.value;let a=[],i=!0;return/@builtin/i.test(r)?(a=this.filterBuiltinExtensions(e,n,s),i=!1):/@installed/i.test(r)?a=this.filterInstalledExtensions(e,t,n,s):/@outdated/i.test(r)?a=this.filterOutdatedExtensions(e,n,s):/@disabled/i.test(r)?a=this.filterDisabledExtensions(e,t,n,s):/@enabled/i.test(r)?a=this.filterEnabledExtensions(e,t,n,s):/@workspaceUnsupported/i.test(r)?a=this.filterWorkspaceUnsupportedExtensions(e,n,s):/@deprecated/i.test(n.value)?a=await this.filterDeprecatedExtensions(e,n,s):/@recentlyUpdated/i.test(n.value)?a=this.filterRecentlyUpdatedExtensions(e,n,s):/@feature:/i.test(n.value)&&(a=this.filterExtensionsByFeature(e,n,s)),{extensions:a,canIncludeInstalledExtensions:i}}filterBuiltinExtensions(e,t,n){let{value:s,includedCategories:r,excludedCategories:a}=this.parseCategories(t.value);s=s.replace(/@builtin/g,"").replace(/@sort:(\w+)(-\w*)?/g,"").trim().toLowerCase();const i=e.filter(d=>d.isBuiltin&&(d.name.toLowerCase().indexOf(s)>-1||d.displayName.toLowerCase().indexOf(s)>-1)&&this.filterExtensionByCategory(d,r,a));return this.sortExtensions(i,n)}filterExtensionByCategory(e,t,n){return!t.length&&!n.length?!0:e.categories.length?n.length&&e.categories.some(s=>n.includes(s.toLowerCase()))?!1:e.categories.some(s=>t.includes(s.toLowerCase())):t.includes(xt)}parseCategories(e){const t=[],n=[];return e=e.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g,(s,r,a)=>{const i=(a||r||"").toLowerCase();return i.startsWith("-")?n.indexOf(i)===-1&&n.push(i):t.indexOf(i)===-1&&t.push(i),""}),{value:e,includedCategories:t,excludedCategories:n}}filterInstalledExtensions(e,t,n,s){let{value:r,includedCategories:a,excludedCategories:i}=this.parseCategories(n.value);r=r.replace(/@installed/g,"").replace(/@sort:(\w+)(-\w*)?/g,"").trim().toLowerCase();const d=m=>(m.name.toLowerCase().indexOf(r)>-1||m.displayName.toLowerCase().indexOf(r)>-1||m.description.toLowerCase().indexOf(r)>-1)&&this.filterExtensionByCategory(m,a,i);let l;if(s.sortBy!==void 0)l=e.filter(m=>!m.isBuiltin&&d(m)),l=this.sortExtensions(l,s);else{l=e.filter(h=>(!h.isBuiltin||h.outdated||h.runtimeState!==void 0)&&d(h));const m=t.reduce((h,y)=>(h.set(y.identifier.value,y),h),new et),g=(h,y)=>{const b=m.get(h.identifier.id),R=!!b&&this.extensionManagementServerService.getExtensionManagementServer(Be(b))===h.server,Q=m.get(y.identifier.id),C=Q&&this.extensionManagementServerService.getExtensionManagementServer(Be(Q))===y.server;if(R&&C)return h.displayName.localeCompare(y.displayName);const P=h.local&&oe(h.local.manifest),M=y.local&&oe(y.local.manifest);return!R&&!C?P?-1:M?1:h.displayName.localeCompare(y.displayName):R&&M||C&&P?h.displayName.localeCompare(y.displayName):R?-1:1},w=[],x=[],v=[];l.forEach(h=>{h.outdated?w.push(h):h.runtimeState?x.push(h):v.push(h)}),l=[...w.sort(g),...x.sort(g),...v.sort(g)]}return l}filterOutdatedExtensions(e,t,n){let{value:s,includedCategories:r,excludedCategories:a}=this.parseCategories(t.value);s=s.replace(/@outdated/g,"").replace(/@sort:(\w+)(-\w*)?/g,"").trim().toLowerCase();const i=e.sort((d,l)=>d.displayName.localeCompare(l.displayName)).filter(d=>d.outdated&&(d.name.toLowerCase().indexOf(s)>-1||d.displayName.toLowerCase().indexOf(s)>-1)&&this.filterExtensionByCategory(d,r,a));return this.sortExtensions(i,n)}filterDisabledExtensions(e,t,n,s){let{value:r,includedCategories:a,excludedCategories:i}=this.parseCategories(n.value);r=r.replace(/@disabled/g,"").replace(/@sort:(\w+)(-\w*)?/g,"").trim().toLowerCase();const d=e.sort((l,m)=>l.displayName.localeCompare(m.displayName)).filter(l=>t.every(m=>!I({id:m.identifier.value,uuid:m.uuid},l.identifier))&&(l.name.toLowerCase().indexOf(r)>-1||l.displayName.toLowerCase().indexOf(r)>-1)&&this.filterExtensionByCategory(l,a,i));return this.sortExtensions(d,s)}filterEnabledExtensions(e,t,n,s){let{value:r,includedCategories:a,excludedCategories:i}=this.parseCategories(n.value);r=r?r.replace(/@enabled/g,"").replace(/@sort:(\w+)(-\w*)?/g,"").trim().toLowerCase():"",e=e.filter(l=>!l.isBuiltin);const d=e.sort((l,m)=>l.displayName.localeCompare(m.displayName)).filter(l=>t.some(m=>I({id:m.identifier.value,uuid:m.uuid},l.identifier))&&(l.name.toLowerCase().indexOf(r)>-1||l.displayName.toLowerCase().indexOf(r)>-1)&&this.filterExtensionByCategory(l,a,i));return this.sortExtensions(d,s)}filterWorkspaceUnsupportedExtensions(e,t,n){const r=t.value.match(/^\s*@workspaceUnsupported(?::(untrusted|virtual)(Partial)?)?(?:\s+([^\s]*))?/i);if(!r)return[];const a=r[1]?.toLowerCase(),i=!!r[2],d=r[3]?.toLowerCase();d&&(e=e.filter(x=>x.name.toLowerCase().indexOf(d)>-1||x.displayName.toLowerCase().indexOf(d)>-1));const l=(x,v)=>x.local&&this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(x.local.manifest)===v,m=(x,v)=>{if(!x.local)return!1;const h=this.extensionEnablementService.getEnablementState(x.local);return h!==T.EnabledGlobally&&h!==T.EnabledWorkspace&&h!==T.DisabledByTrustRequirement&&h!==T.DisabledByExtensionDependency?!1:this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(x.local.manifest)===v?!0:v===!1?Xe(e.map(b=>b.local),x.local).some(b=>this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(b.manifest)===v):!1},g=rt(this.workspaceService.getWorkspace()),w=!this.workspaceTrustManagementService.isWorkspaceTrusted();return a==="virtual"?e=e.filter(x=>g&&l(x,i?"limited":!1)&&!(w&&m(x,!1))):a==="untrusted"?e=e.filter(x=>m(x,i?"limited":!1)&&!(g&&l(x,!1))):e=e.filter(x=>g&&!l(x,!0)||w&&!m(x,!0)),this.sortExtensions(e,n)}async filterDeprecatedExtensions(e,t,n){const s=t.value.replace(/@deprecated/g,"").replace(/@sort:(\w+)(-\w*)?/g,"").trim().toLowerCase(),r=await this.extensionManagementService.getExtensionsControlManifest(),a=Object.keys(r.deprecated);return e=e.filter(i=>a.includes(i.identifier.id)&&(!s||i.name.toLowerCase().indexOf(s)>-1||i.displayName.toLowerCase().indexOf(s)>-1)),this.sortExtensions(e,n)}filterRecentlyUpdatedExtensions(e,t,n){let{value:s,includedCategories:r,excludedCategories:a}=this.parseCategories(t.value);const i=Date.now();e=e.filter(l=>!l.isBuiltin&&!l.outdated&&l.local?.updated&&l.local?.installedTimestamp!==void 0&&i-l.local.installedTimestamp<u.RECENT_UPDATE_DURATION),s=s.replace(/@recentlyUpdated/g,"").replace(/@sort:(\w+)(-\w*)?/g,"").trim().toLowerCase();const d=e.filter(l=>(l.name.toLowerCase().indexOf(s)>-1||l.displayName.toLowerCase().indexOf(s)>-1)&&this.filterExtensionByCategory(l,r,a));return n.sortBy=n.sortBy??"UpdateDate",this.sortExtensions(d,n)}filterExtensionsByFeature(e,t,n){const r=t.value.replace(/@feature:/g,"").trim().split(" ")[0],a=nt.as(gt.ExtensionFeaturesRegistry).getExtensionFeature(r);if(!a)return[];const i=a.renderer?this.instantiationService.createInstance(a.renderer):void 0;try{const d=e.filter(l=>l.local?i?.shouldRender(l.local.manifest)||this.extensionFeaturesManagementService.getAccessData(new qe(l.identifier.id),r):!1);return this.sortExtensions(d,n)}finally{i?.dispose()}}mergeAddedExtensions(e,t){const n=[...e],s=a=>{let i=-1;const d=t[a];return d&&(i=n.findIndex(l=>I(l.identifier,d.identifier)),i===-1)?s(a-1):i};let r=!1;for(let a=0;a<t.length;a++){const i=t[a];e.every(d=>!I(d.identifier,i.identifier))&&(r=!0,e.splice(s(a-1)+1,0,i))}return r?e:void 0}async queryGallery(e,t,n){const s=t.sortBy!==void 0;if(!s&&!e.value.trim()&&(t.sortBy=S.InstallCount),this.isRecommendationsQuery(e))return this.queryRecommendations(e,t,n);const r=e.value;if(/\bext:([^\s]+)\b/g.test(r))return t.text=r,t.source="file-extension-tags",this.extensionsWorkbenchService.queryGallery(t,n).then(l=>this.getPagedModel(l));let a=[];if(r){if(t.text=r.substring(0,350),t.source="searchText",!s){const m=(await this.extensionManagementService.getExtensionsControlManifest()).search;if(Array.isArray(m)){for(const g of m)if(g.query&&g.query.toLowerCase()===r.toLowerCase()&&Array.isArray(g.preferredResults)){a=g.preferredResults;break}}}}else t.source="viewlet";const i=await this.extensionsWorkbenchService.queryGallery(t,n);let d=0;for(const l of a)for(let m=d;m<i.firstPage.length;m++)if(I(i.firstPage[m].identifier,{id:l})){if(d!==m){const g=i.firstPage.splice(m,1)[0];i.firstPage.splice(d,0,g),d++}break}return this.getPagedModel(i)}sortExtensions(e,t){switch(t.sortBy){case S.InstallCount:e=e.sort((n,s)=>typeof s.installCount=="number"&&typeof n.installCount=="number"?s.installCount-n.installCount:NaN);break;case"UpdateDate":e=e.sort((n,s)=>typeof s.local?.installedTimestamp=="number"&&typeof n.local?.installedTimestamp=="number"?s.local.installedTimestamp-n.local.installedTimestamp:typeof s.local?.installedTimestamp=="number"?1:typeof n.local?.installedTimestamp=="number"?-1:NaN);break;case S.AverageRating:case S.WeightedRating:e=e.sort((n,s)=>typeof s.rating=="number"&&typeof n.rating=="number"?s.rating-n.rating:NaN);break;default:e=e.sort((n,s)=>n.displayName.localeCompare(s.displayName));break}return t.sortOrder===re.Descending&&(e=e.reverse()),e}isRecommendationsQuery(e){return u.isWorkspaceRecommendedExtensionsQuery(e.value)||u.isKeymapsRecommendedExtensionsQuery(e.value)||u.isLanguageRecommendedExtensionsQuery(e.value)||u.isExeRecommendedExtensionsQuery(e.value)||u.isRemoteRecommendedExtensionsQuery(e.value)||/@recommended:all/i.test(e.value)||u.isSearchRecommendedExtensionsQuery(e.value)||u.isRecommendedExtensionsQuery(e.value)}async queryRecommendations(e,t,n){return u.isWorkspaceRecommendedExtensionsQuery(e.value)?this.getWorkspaceRecommendationsModel(e,t,n):u.isKeymapsRecommendedExtensionsQuery(e.value)?this.getKeymapRecommendationsModel(e,t,n):u.isLanguageRecommendedExtensionsQuery(e.value)?this.getLanguageRecommendationsModel(e,t,n):u.isExeRecommendedExtensionsQuery(e.value)?this.getExeRecommendationsModel(e,t,n):u.isRemoteRecommendedExtensionsQuery(e.value)?this.getRemoteRecommendationsModel(e,t,n):/@recommended:all/i.test(e.value)?this.getAllRecommendationsModel(t,n):u.isSearchRecommendedExtensionsQuery(e.value)||u.isRecommendedExtensionsQuery(e.value)&&t.sortBy!==void 0?this.searchRecommendations(e,t,n):u.isRecommendedExtensionsQuery(e.value)?this.getOtherRecommendationsModel(e,t,n):new f([])}async getInstallableRecommendations(e,t,n){const s=[];if(e.length){const r=[],a=[];for(const i of e)typeof i=="string"?r.push(i):a.push(i);if(r.length)try{const i=await this.extensionsWorkbenchService.getExtensions(r.map(d=>({id:d})),{source:t.source},n);for(const d of i)d.gallery&&!d.deprecationInfo&&await this.extensionManagementService.canInstall(d.gallery)&&s.push(d)}catch(i){if(!a.length||!this.isOfflineError(i))throw i}if(a.length){const i=await this.extensionsWorkbenchService.getResourceExtensions(a,!0);for(const d of i)await this.extensionsWorkbenchService.canInstall(d)&&s.push(d)}}return s}async getWorkspaceRecommendations(){const e=await this.extensionRecommendationsService.getWorkspaceRecommendations(),{important:t}=await this.extensionRecommendationsService.getConfigBasedRecommendations();for(const n of t)e.find(s=>s===n)||e.push(n);return e}async getWorkspaceRecommendationsModel(e,t,n){const s=await this.getWorkspaceRecommendations(),r=await this.getInstallableRecommendations(s,{...t,source:"recommendations-workspace"},n);return new f(r)}async getKeymapRecommendationsModel(e,t,n){const s=e.value.replace(/@recommended:keymaps/g,"").trim().toLowerCase(),r=this.extensionRecommendationsService.getKeymapRecommendations(),a=(await this.getInstallableRecommendations(r,{...t,source:"recommendations-keymaps"},n)).filter(i=>i.identifier.id.toLowerCase().indexOf(s)>-1);return new f(a)}async getLanguageRecommendationsModel(e,t,n){const s=e.value.replace(/@recommended:languages/g,"").trim().toLowerCase(),r=this.extensionRecommendationsService.getLanguageRecommendations(),a=(await this.getInstallableRecommendations(r,{...t,source:"recommendations-languages"},n)).filter(i=>i.identifier.id.toLowerCase().indexOf(s)>-1);return new f(a)}async getRemoteRecommendationsModel(e,t,n){const s=e.value.replace(/@recommended:remotes/g,"").trim().toLowerCase(),r=this.extensionRecommendationsService.getRemoteRecommendations(),a=(await this.getInstallableRecommendations(r,{...t,source:"recommendations-remotes"},n)).filter(i=>i.identifier.id.toLowerCase().indexOf(s)>-1);return new f(a)}async getExeRecommendationsModel(e,t,n){const s=e.value.replace(/@exe:/g,"").trim().toLowerCase(),{important:r,others:a}=await this.extensionRecommendationsService.getExeBasedRecommendations(s.startsWith('"')?s.substring(1,s.length-1):s),i=await this.getInstallableRecommendations([...r,...a],{...t,source:"recommendations-exe"},n);return new f(i)}async getOtherRecommendationsModel(e,t,n){const s=await this.getOtherRecommendations(),r=await this.getInstallableRecommendations(s,{...t,source:"recommendations-other",sortBy:void 0},n),a=q(s.map(i=>r.find(d=>I(d.identifier,{id:i}))));return new f(a)}async getOtherRecommendations(){const e=(await this.extensionsWorkbenchService.queryLocal(this.options.server)).map(n=>n.identifier.id.toLowerCase()),t=(await this.getWorkspaceRecommendations()).map(n=>U(n)?n.toLowerCase():n);return G((await Promise.all([this.extensionRecommendationsService.getImportantRecommendations(),this.extensionRecommendationsService.getFileBasedRecommendations(),this.extensionRecommendationsService.getOtherRecommendations()])).flat().filter(n=>!e.includes(n.toLowerCase())&&!t.includes(n.toLowerCase())),n=>n.toLowerCase())}async getAllRecommendationsModel(e,t){const n=await this.extensionsWorkbenchService.queryLocal(this.options.server),s=n.map(d=>d.identifier.id.toLowerCase()),r=G((await Promise.all([this.getWorkspaceRecommendations(),this.extensionRecommendationsService.getImportantRecommendations(),this.extensionRecommendationsService.getFileBasedRecommendations(),this.extensionRecommendationsService.getOtherRecommendations()])).flat().filter(d=>U(d)?!s.includes(d.toLowerCase()):!n.some(l=>l.local&&this.uriIdentityService.extUri.isEqual(l.local.location,d)))),a=await this.getInstallableRecommendations(r,{...e,source:"recommendations-all",sortBy:void 0},t),i=[];for(let d=0;d<a.length&&i.length<8;d++){const l=r[d];if(U(l)){const m=a.find(g=>I(g.identifier,{id:l}));m&&i.push(m)}else{const m=a.find(g=>g.resourceExtension&&this.uriIdentityService.extUri.isEqual(g.resourceExtension.location,l));m&&i.push(m)}}return new f(i)}async searchRecommendations(e,t,n){const s=e.value.replace(/@recommended/g,"").trim().toLowerCase(),r=G([...await this.getWorkspaceRecommendations(),...await this.getOtherRecommendations()]),a=(await this.getInstallableRecommendations(r,{...t,source:"recommendations",sortBy:void 0},n)).filter(i=>i.identifier.id.toLowerCase().indexOf(s)>-1);return new f(this.sortExtensions(a,t))}setModel(e,t,n){this.list&&(this.list.model=new te(e),n||(this.list.scrollTop=0),this.updateBody(t)),this.badge&&this.badge.setCount(this.count())}updateModel(e){this.list&&(this.list.model=new te(e),this.updateBody()),this.badge&&this.badge.setCount(this.count())}updateBody(e){if(this.bodyTemplate){const t=this.count();this.bodyTemplate.extensionsList.classList.toggle("hidden",t===0),this.bodyTemplate.messageContainer.classList.toggle("hidden",t>0),t===0&&this.isBodyVisible()&&(e?this.isOfflineError(e)?(this.bodyTemplate.messageSeverityIcon.className=he.className(z.Warning),this.bodyTemplate.messageBox.textContent=E("offline error","Unable to search the Marketplace when offline, please check your network connection.")):(this.bodyTemplate.messageSeverityIcon.className=he.className(z.Error),this.bodyTemplate.messageBox.textContent=E("error","Error while fetching extensions. {0}",Ke(e))):(this.bodyTemplate.messageSeverityIcon.className="",this.bodyTemplate.messageBox.textContent=E("no extensions found","No extensions found.")),Ue(this.bodyTemplate.messageBox.textContent))}this.updateSize()}isOfflineError(e){return e instanceof Ye?e.code===Je.Offline:je(e)}updateSize(){this.options.flexibleHeight&&(this.maximumBodySize=this.list?.model.length?Number.POSITIVE_INFINITY:0,this.storageService.store(`${this.id}.size`,this.list?.model.length||0,xe.PROFILE,st.MACHINE))}openExtension(e,t){e=this.extensionsWorkbenchService.local.filter(n=>I(n.identifier,e.identifier))[0]||e,this.extensionsWorkbenchService.open(e,t).then(void 0,n=>this.onError(n))}onError(e){if(ee(e))return;const t=e&&e.message||"";if(/ECONNREFUSED/.test(t)){const n=ze(E("suggestProxyError","Marketplace returned 'ECONNREFUSED'. Please check the 'http.proxy' setting."),[new Ae("open user settings",E("open user settings","Open User Settings"),void 0,!0,()=>this.preferencesService.openUserSettings())]);this.notificationService.error(n);return}this.notificationService.error(e)}getPagedModel(e){if(Array.isArray(e))return new f(e);const t={total:e.total,pageSize:e.pageSize,firstPage:e.firstPage,getPage:(n,s)=>e.getPage(n,s)};return new f(t)}dispose(){super.dispose(),this.queryRequest&&(this.queryRequest.request.cancel(),this.queryRequest=null),this.queryResult&&(this.queryResult.disposables.dispose(),this.queryResult=void 0),this.list=null}static isLocalExtensionsQuery(e,t){return this.isInstalledExtensionsQuery(e)||this.isSearchInstalledExtensionsQuery(e)||this.isOutdatedExtensionsQuery(e)||this.isEnabledExtensionsQuery(e)||this.isDisabledExtensionsQuery(e)||this.isBuiltInExtensionsQuery(e)||this.isSearchBuiltInExtensionsQuery(e)||this.isBuiltInGroupExtensionsQuery(e)||this.isSearchDeprecatedExtensionsQuery(e)||this.isSearchWorkspaceUnsupportedExtensionsQuery(e)||this.isSearchRecentlyUpdatedQuery(e)||this.isSearchExtensionUpdatesQuery(e)||this.isSortInstalledExtensionsQuery(e,t)||this.isFeatureExtensionsQuery(e)}static isSearchBuiltInExtensionsQuery(e){return/@builtin\s.+/i.test(e)}static isBuiltInExtensionsQuery(e){return/^\s*@builtin$/i.test(e.trim())}static isBuiltInGroupExtensionsQuery(e){return/^\s*@builtin:.+$/i.test(e.trim())}static isSearchWorkspaceUnsupportedExtensionsQuery(e){return/^\s*@workspaceUnsupported(:(untrusted|virtual)(Partial)?)?(\s|$)/i.test(e)}static isInstalledExtensionsQuery(e){return/@installed$/i.test(e)}static isSearchInstalledExtensionsQuery(e){return/@installed\s./i.test(e)||this.isFeatureExtensionsQuery(e)}static isOutdatedExtensionsQuery(e){return/@outdated/i.test(e)}static isEnabledExtensionsQuery(e){return/@enabled/i.test(e)}static isDisabledExtensionsQuery(e){return/@disabled/i.test(e)}static isSearchDeprecatedExtensionsQuery(e){return/@deprecated\s?.*/i.test(e)}static isRecommendedExtensionsQuery(e){return/^@recommended$/i.test(e.trim())}static isSearchRecommendedExtensionsQuery(e){return/@recommended\s.+/i.test(e)}static isWorkspaceRecommendedExtensionsQuery(e){return/@recommended:workspace/i.test(e)}static isExeRecommendedExtensionsQuery(e){return/@exe:.+/i.test(e)}static isRemoteRecommendedExtensionsQuery(e){return/@recommended:remotes/i.test(e)}static isKeymapsRecommendedExtensionsQuery(e){return/@recommended:keymaps/i.test(e)}static isLanguageRecommendedExtensionsQuery(e){return/@recommended:languages/i.test(e)}static isSortInstalledExtensionsQuery(e,t){return t!==void 0&&t!==""&&e===""||!t&&/^@sort:\S*$/i.test(e)}static isSearchPopularQuery(e){return/@popular/i.test(e)}static isSearchRecentlyPublishedQuery(e){return/@recentlyPublished/i.test(e)}static isSearchRecentlyUpdatedQuery(e){return/@recentlyUpdated/i.test(e)}static isSearchExtensionUpdatesQuery(e){return/@updates/i.test(e)}static isSortUpdateDateQuery(e){return/@sort:updateDate/i.test(e)}static isFeatureExtensionsQuery(e){return/@feature:/i.test(e)}focus(){super.focus(),this.list&&(this.list.getFocus().length||this.list.getSelection().length||this.list.focusNext(),this.list.domFocus())}};u=H([c(2,ue),c(3,de),c(4,ie),c(5,le),c(6,ye),c(7,ke),c(8,we),c(9,Me),c(10,fe),c(11,ae),c(12,ne),c(13,N),c(14,Re),c(15,Qe),c(16,Pe),c(17,N),c(18,pe),c(19,se),c(20,Ie),c(21,me),c(22,Te),c(23,ge),c(24,Ee),c(25,Ce),c(26,Oe),c(27,be),c(28,ve),c(29,ce)],u);class $n extends u{async show(){const o=this.extensionManagementServerService.webExtensionManagementServer&&!this.extensionManagementServerService.localExtensionManagementServer&&!this.extensionManagementServerService.remoteExtensionManagementServer?"@web":"";return super.show(o)}}class zn extends u{async show(o){return o=o||"@installed",(!u.isLocalExtensionsQuery(o)||u.isSortInstalledExtensionsQuery(o))&&(o=o+=" @installed"),super.show(o.trim())}}class Kn extends u{async show(o){return o=o||"@enabled",u.isEnabledExtensionsQuery(o)?super.show(o):u.isSortInstalledExtensionsQuery(o)?super.show("@enabled "+o):this.showEmptyModel()}}class _n extends u{async show(o){return o=o||"@disabled",u.isDisabledExtensionsQuery(o)?super.show(o):u.isSortInstalledExtensionsQuery(o)?super.show("@disabled "+o):this.showEmptyModel()}}class Zn extends u{async show(o){return o=o||"@outdated",u.isSearchExtensionUpdatesQuery(o)&&(o=o.replace("@updates","@outdated")),super.show(o.trim())}updateSize(){super.updateSize(),this.setExpanded(this.count()>0)}}class jn extends u{async show(o){return o=o||"@recentlyUpdated",u.isSearchExtensionUpdatesQuery(o)&&(o=o.replace("@updates","@recentlyUpdated")),super.show(o.trim())}}let A=class extends u{constructor(e,t,n,s,r,a,i,d,l,m,g,w,x,v,h,y,b,R,Q,C,P,M,K,V,_,Z,j,Y,J,X){super(e,t,n,s,r,a,i,d,l,m,g,w,x,v,h,y,b,R,Q,C,P,M,K,V,_,Z,j,Y,J,X);this.options=e}show(){return super.show(this.options.query)}};A=H([c(2,ue),c(3,de),c(4,ie),c(5,le),c(6,ye),c(7,ke),c(8,we),c(9,Me),c(10,fe),c(11,ae),c(12,ne),c(13,N),c(14,Re),c(15,Qe),c(16,Pe),c(17,N),c(18,pe),c(19,se),c(20,Ie),c(21,me),c(22,Te),c(23,ge),c(24,Ee),c(25,Ce),c(26,Oe),c(27,be),c(28,ve),c(29,ce)],A);function F(p,o){if(!p)return"@workspaceUnsupported:"+o;const e=p.match(new RegExp(`@workspaceUnsupported(:${o})?(\\s|$)`,"i"));if(e)return e[1]?p:p.replace(/@workspaceUnsupported/gi,"@workspaceUnsupported:"+o)}class Yn extends u{async show(o){const e=F(o,"untrusted");return e?super.show(e):this.showEmptyModel()}}class Jn extends u{async show(o){const e=F(o,"untrustedPartial");return e?super.show(e):this.showEmptyModel()}}class Xn extends u{async show(o){const e=F(o,"virtual");return e?super.show(e):this.showEmptyModel()}}class qn extends u{async show(o){const e=F(o,"virtualPartial");return e?super.show(e):this.showEmptyModel()}}class es extends u{async show(o){return u.isSearchDeprecatedExtensionsQuery(o)?super.show(o):this.showEmptyModel()}}class ts extends u{reportSearchFinishedDelayer=this._register(new Ge(2e3));searchWaitPromise=Promise.resolve();async show(o){const e=super.show(o);return this.reportSearchFinishedDelayer.trigger(()=>this.reportSearchFinished()),this.searchWaitPromise=e.then(null,null),e}async reportSearchFinished(){await this.searchWaitPromise,this.telemetryService.publicLog2("extensionsView:MarketplaceSearchFinished")}}class ns extends u{recommendedExtensionsQuery="@recommended:all";renderBody(o){super.renderBody(o),this._register(this.extensionRecommendationsService.onDidChangeRecommendations(()=>{this.show("")}))}async show(o){if(o&&o.trim()!==this.recommendedExtensionsQuery)return this.showEmptyModel();const e=await super.show(this.recommendedExtensionsQuery);return this.extensionsWorkbenchService.local.some(t=>!t.isBuiltin)||this.setExpanded(e.length>0),e}}class ss extends u{recommendedExtensionsQuery="@recommended";renderBody(o){super.renderBody(o),this._register(this.extensionRecommendationsService.onDidChangeRecommendations(()=>{this.show("")}))}async show(o){return o&&o.trim()!==this.recommendedExtensionsQuery?this.showEmptyModel():super.show(this.recommendedExtensionsQuery)}}class is extends u{recommendedExtensionsQuery="@recommended:workspace";renderBody(o){super.renderBody(o),this._register(this.extensionRecommendationsService.onDidChangeRecommendations(()=>this.show(this.recommendedExtensionsQuery))),this._register(this.contextService.onDidChangeWorkbenchState(()=>this.show(this.recommendedExtensionsQuery)))}async show(o){const t=await(o&&o.trim()!=="@recommended"&&o.trim()!=="@recommended:workspace"?this.showEmptyModel():super.show(this.recommendedExtensionsQuery));return this.setExpanded(t.length>0),t}async getInstallableWorkspaceRecommendations(){const o=(await this.extensionsWorkbenchService.queryLocal()).filter(t=>t.enablementState!==T.DisabledByExtensionKind),e=(await this.getWorkspaceRecommendations()).filter(t=>o.every(n=>U(t)?!I({id:t},n.identifier):!this.uriIdentityService.extUri.isEqual(t,n.local?.location)));return this.getInstallableRecommendations(e,{source:"install-all-workspace-recommendations"},$e.None)}async installWorkspaceRecommendations(){const o=await this.getInstallableWorkspaceRecommendations();if(o.length){const e=[],t=[];for(const n of o)n.gallery?e.push({extension:n.gallery,options:{}}):t.push(n);await Promise.all([this.extensionManagementService.installGalleryExtensions(e),...t.map(n=>this.extensionsWorkbenchService.install(n))])}else this.notificationService.notify({severity:z.Info,message:E("no local extensions","There are no extensions to install.")})}}function Et(p){if(!p)return"";const o=p.publisherDomain?.verified?E("extension.arialabel.verifiedPublisher","Verified Publisher {0}",p.publisherDisplayName):E("extension.arialabel.publisher","Publisher {0}",p.publisherDisplayName),e=p?.deprecationInfo?E("extension.arialabel.deprecated","Deprecated"):"",t=p?.rating?E("extension.arialabel.rating","Rated {0} out of 5 stars by {1} users",p.rating.toFixed(2),p.ratingCount):"";return`${p.displayName}, ${e?`${e}, `:""}${p.version}, ${o}, ${p.description} ${t?`, ${t}`:""}`}export{$n as DefaultPopularExtensionsView,ns as DefaultRecommendedExtensionsView,es as DeprecatedExtensionsView,_n as DisabledExtensionsView,Kn as EnabledExtensionsView,u as ExtensionsListView,xt as NONE_CATEGORY,Zn as OutdatedExtensionsView,jn as RecentlyUpdatedExtensionsView,ss as RecommendedExtensionsView,ts as SearchMarketplaceExtensionsView,zn as ServerInstalledExtensionsView,A as StaticQueryExtensionsView,Jn as UntrustedWorkspacePartiallySupportedExtensionsView,Yn as UntrustedWorkspaceUnsupportedExtensionsView,qn as VirtualWorkspacePartiallySupportedExtensionsView,Xn as VirtualWorkspaceUnsupportedExtensionsView,is as WorkspaceRecommendedExtensionsView,Et as getAriaLabelForExtension};