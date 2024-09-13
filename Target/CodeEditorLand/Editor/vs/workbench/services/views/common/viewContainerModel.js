var R=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var I=(d,l,e,t)=>{for(var s=t>1?void 0:t?k(l,e):l,r=d.length-1,i;r>=0;r--)(i=d[r])&&(s=(t?i(l,e,s):i(s))||s);return t&&s&&R(l,e,s),s},h=(d,l)=>(e,t)=>l(e,t,d);import{coalesce as x,move as G}from"../../../../base/common/arrays.js";import{Emitter as w,Event as W}from"../../../../base/common/event.js";import{Lazy as m}from"../../../../base/common/lazy.js";import{Disposable as y,DisposableStore as E}from"../../../../base/common/lifecycle.js";import{CounterSet as z}from"../../../../base/common/map.js";import{isEqual as O}from"../../../../base/common/resources.js";import{ThemeIcon as u}from"../../../../base/common/themables.js";import{isUndefined as f,isUndefinedOrNull as p}from"../../../../base/common/types.js";import{URI as C}from"../../../../base/common/uri.js";import{localize2 as L}from"../../../../nls.js";import{Categories as $}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as M,registerAction2 as H}from"../../../../platform/actions/common/actions.js";import{IContextKeyService as N}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as K}from"../../../../platform/instantiation/common/instantiation.js";import{ILoggerService as S}from"../../../../platform/log/common/log.js";import{Registry as U}from"../../../../platform/registry/common/platform.js";import{IStorageService as T,StorageScope as v,StorageTarget as A}from"../../../../platform/storage/common/storage.js";import{VIEWS_LOG_ID as g,VIEWS_LOG_NAME as _,Extensions as P,defaultViewIcon as F}from"../../../common/views.js";import{IOutputService as j}from"../../output/common/output.js";H(class extends M{constructor(){super({id:"_workbench.output.showViewsLog",title:L("showViewsLog","Show Views Log"),category:$.Developer,f1:!0})}async run(d){const l=d.get(S),e=d.get(j);l.setVisibility(g,!0),e.showChannel(g)}});function B(d){return`${d}.hidden`}let D=class extends y{constructor(e,t,s,r){super();this.viewContainerName=t;this.storageService=s;this.logger=new m(()=>r.createLogger(g,{name:_,hidden:!0})),this.globalViewsStateStorageId=B(e),this.workspaceViewsStateStorageId=e,this._register(this.storageService.onDidChangeValue(v.PROFILE,this.globalViewsStateStorageId,this._register(new E))(()=>this.onDidStorageChange())),this.state=this.initialize()}workspaceViewsStateStorageId;globalViewsStateStorageId;state;_onDidChangeStoredState=this._register(new w);onDidChangeStoredState=this._onDidChangeStoredState.event;logger;set(e,t){this.state.set(e,t)}get(e){return this.state.get(e)}updateState(e){this.updateWorkspaceState(e),this.updateGlobalState(e)}updateWorkspaceState(e){const t=this.getStoredWorkspaceState();for(const s of e){const r=this.get(s.id);r&&(t[s.id]={collapsed:!!r.collapsed,isHidden:!r.visibleWorkspace,size:r.size,order:s.workspace&&r?r.order:void 0})}Object.keys(t).length>0?this.storageService.store(this.workspaceViewsStateStorageId,JSON.stringify(t),v.WORKSPACE,A.MACHINE):this.storageService.remove(this.workspaceViewsStateStorageId,v.WORKSPACE)}updateGlobalState(e){const t=this.getStoredGlobalState();for(const s of e){const r=this.get(s.id);t.set(s.id,{id:s.id,isHidden:r&&s.canToggleVisibility?!r.visibleGlobal:!1,order:!s.workspace&&r?r.order:void 0})}this.setStoredGlobalState(t)}onDidStorageChange(){if(this.globalViewsStatesValue!==this.getStoredGlobalViewsStatesValue()){this._globalViewsStatesValue=void 0;const e=this.getStoredGlobalState(),t=this.getStoredWorkspaceState(),s=[];for(const[r,i]of e){const n=this.get(r);if(n)n.visibleGlobal!==!i.isHidden&&(i.isHidden||this.logger.value.info(`View visibility state changed: ${r} is now visible`,this.viewContainerName),s.push({id:r,visible:!i.isHidden}));else{const o=t[r];this.set(r,{active:!1,visibleGlobal:!i.isHidden,visibleWorkspace:f(o?.isHidden)?void 0:!o?.isHidden,collapsed:o?.collapsed,order:o?.order,size:o?.size})}}if(s.length){this._onDidChangeStoredState.fire(s);for(const r of s){const i=this.get(r.id);i&&(i.visibleGlobal=r.visible)}}}}initialize(){const e=new Map,t=this.getStoredWorkspaceState();for(const o of Object.keys(t)){const a=t[o];e.set(o,{active:!1,visibleGlobal:void 0,visibleWorkspace:f(a.isHidden)?void 0:!a.isHidden,collapsed:a.collapsed,order:a.order,size:a.size})}const s=this.storageService.get(this.globalViewsStateStorageId,v.WORKSPACE,"[]"),{state:r}=this.parseStoredGlobalState(s);if(r.size>0){for(const{id:o,isHidden:a}of r.values()){const c=e.get(o);c?f(c.visibleWorkspace)&&(c.visibleWorkspace=!a):e.set(o,{active:!1,collapsed:void 0,visibleGlobal:void 0,visibleWorkspace:!a})}this.storageService.remove(this.globalViewsStateStorageId,v.WORKSPACE)}const{state:i,hasDuplicates:n}=this.parseStoredGlobalState(this.globalViewsStatesValue);n&&this.setStoredGlobalState(i);for(const{id:o,isHidden:a,order:c}of i.values()){const b=e.get(o);b?(b.visibleGlobal=!a,f(c)||(b.order=c)):e.set(o,{active:!1,visibleGlobal:!a,order:c,collapsed:void 0,visibleWorkspace:void 0})}return e}getStoredWorkspaceState(){return JSON.parse(this.storageService.get(this.workspaceViewsStateStorageId,v.WORKSPACE,"{}"))}getStoredGlobalState(){return this.parseStoredGlobalState(this.globalViewsStatesValue).state}setStoredGlobalState(e){this.globalViewsStatesValue=JSON.stringify([...e.values()])}parseStoredGlobalState(e){const t=JSON.parse(e);let s=!1;return{state:t.reduce((i,n)=>(typeof n=="string"?(s=s||i.has(n),i.set(n,{id:n,isHidden:!0})):(s=s||i.has(n.id),i.set(n.id,n)),i),new Map),hasDuplicates:s}}_globalViewsStatesValue;get globalViewsStatesValue(){return this._globalViewsStatesValue||(this._globalViewsStatesValue=this.getStoredGlobalViewsStatesValue()),this._globalViewsStatesValue}set globalViewsStatesValue(e){this.globalViewsStatesValue!==e&&(this._globalViewsStatesValue=e,this.setStoredGlobalViewsStatesValue(e))}getStoredGlobalViewsStatesValue(){return this.storageService.get(this.globalViewsStateStorageId,v.PROFILE,"[]")}setStoredGlobalViewsStatesValue(e){this.storageService.store(this.globalViewsStateStorageId,e,v.PROFILE,A.USER)}};D=I([h(2,T),h(3,S)],D);let V=class extends y{constructor(e,t,s,r){super();this.viewContainer=e;this.contextKeyService=s;this.logger=new m(()=>r.createLogger(g,{name:_,hidden:!0})),this._register(W.filter(s.onDidChangeContext,i=>i.affectsSome(this.contextKeys))(()=>this.onDidChangeContext())),this.viewDescriptorsState=this._register(t.createInstance(D,e.storageId||`${e.id}.state`,typeof e.title=="string"?e.title:e.title.original)),this._register(this.viewDescriptorsState.onDidChangeStoredState(i=>this.updateVisibility(i))),this.updateContainerInfo()}contextKeys=new z;viewDescriptorItems=[];viewDescriptorsState;_title;get title(){return this._title}_icon;get icon(){return this._icon}_keybindingId;get keybindingId(){return this._keybindingId}_onDidChangeContainerInfo=this._register(new w);onDidChangeContainerInfo=this._onDidChangeContainerInfo.event;get allViewDescriptors(){return this.viewDescriptorItems.map(e=>e.viewDescriptor)}_onDidChangeAllViewDescriptors=this._register(new w);onDidChangeAllViewDescriptors=this._onDidChangeAllViewDescriptors.event;get activeViewDescriptors(){return this.viewDescriptorItems.filter(e=>e.state.active).map(e=>e.viewDescriptor)}_onDidChangeActiveViewDescriptors=this._register(new w);onDidChangeActiveViewDescriptors=this._onDidChangeActiveViewDescriptors.event;get visibleViewDescriptors(){return this.viewDescriptorItems.filter(e=>this.isViewDescriptorVisible(e)).map(e=>e.viewDescriptor)}_onDidAddVisibleViewDescriptors=this._register(new w);onDidAddVisibleViewDescriptors=this._onDidAddVisibleViewDescriptors.event;_onDidRemoveVisibleViewDescriptors=this._register(new w);onDidRemoveVisibleViewDescriptors=this._onDidRemoveVisibleViewDescriptors.event;_onDidMoveVisibleViewDescriptors=this._register(new w);onDidMoveVisibleViewDescriptors=this._onDidMoveVisibleViewDescriptors.event;logger;updateContainerInfo(){const e=this.viewContainer.alwaysUseContainerInfo||this.visibleViewDescriptors.length===0||this.visibleViewDescriptors.some(a=>U.as(P.ViewsRegistry).getViewContainer(a.id)===this.viewContainer),t=e?typeof this.viewContainer.title=="string"?this.viewContainer.title:this.viewContainer.title.value:this.visibleViewDescriptors[0]?.containerTitle||this.visibleViewDescriptors[0]?.name?.value||"";let s=!1;this._title!==t&&(this._title=t,s=!0);const r=e?this.viewContainer.icon:this.visibleViewDescriptors[0]?.containerIcon||F;let i=!1;this.isEqualIcon(r)||(this._icon=r,i=!0);const n=this.viewContainer.openCommandActionDescriptor?.id??this.activeViewDescriptors.find(a=>a.openCommandActionDescriptor)?.openCommandActionDescriptor?.id;let o=!1;this._keybindingId!==n&&(this._keybindingId=n,o=!0),(s||i||o)&&this._onDidChangeContainerInfo.fire({title:s,icon:i,keybindingId:o})}isEqualIcon(e){return C.isUri(e)?C.isUri(this._icon)&&O(e,this._icon):u.isThemeIcon(e)?u.isThemeIcon(this._icon)&&u.isEqual(e,this._icon):e===this._icon}isVisible(e){const t=this.viewDescriptorItems.find(s=>s.viewDescriptor.id===e);if(!t)throw new Error(`Unknown view ${e}`);return this.isViewDescriptorVisible(t)}setVisible(e,t){this.updateVisibility([{id:e,visible:t}])}updateVisibility(e){const t=x(e.filter(({visible:i})=>!i).map(({id:i})=>this.findAndIgnoreIfNotFound(i))),s=[];for(const{viewDescriptorItem:i,visibleIndex:n}of t)this.updateViewDescriptorItemVisibility(i,!1)&&s.push({viewDescriptor:i.viewDescriptor,index:n});s.length&&this.broadCastRemovedVisibleViewDescriptors(s);const r=[];for(const{id:i,visible:n}of e){if(!n)continue;const o=this.findAndIgnoreIfNotFound(i);if(!o)continue;const{viewDescriptorItem:a,visibleIndex:c}=o;this.updateViewDescriptorItemVisibility(a,!0)&&r.push({index:c,viewDescriptor:a.viewDescriptor,size:a.state.size,collapsed:!!a.state.collapsed})}r.length&&this.broadCastAddedVisibleViewDescriptors(r)}updateViewDescriptorItemVisibility(e,t){return!e.viewDescriptor.canToggleVisibility||this.isViewDescriptorVisibleWhenActive(e)===t?!1:(e.viewDescriptor.workspace?e.state.visibleWorkspace=t:(e.state.visibleGlobal=t,t&&this.logger.value.info(`Showing view ${e.viewDescriptor.id} in the container ${this.viewContainer.id}`)),this.isViewDescriptorVisible(e)===t)}isCollapsed(e){return!!this.find(e).viewDescriptorItem.state.collapsed}setCollapsed(e,t){const{viewDescriptorItem:s}=this.find(e);s.state.collapsed!==t&&(s.state.collapsed=t),this.viewDescriptorsState.updateState(this.allViewDescriptors)}getSize(e){return this.find(e).viewDescriptorItem.state.size}setSizes(e){for(const{id:t,size:s}of e){const{viewDescriptorItem:r}=this.find(t);r.state.size!==s&&(r.state.size=s)}this.viewDescriptorsState.updateState(this.allViewDescriptors)}move(e,t){const s=this.viewDescriptorItems.findIndex(o=>o.viewDescriptor.id===e),r=this.viewDescriptorItems.findIndex(o=>o.viewDescriptor.id===t),i=this.viewDescriptorItems[s],n=this.viewDescriptorItems[r];G(this.viewDescriptorItems,s,r);for(let o=0;o<this.viewDescriptorItems.length;o++)this.viewDescriptorItems[o].state.order=o;this.broadCastMovedViewDescriptors({index:s,viewDescriptor:i.viewDescriptor},{index:r,viewDescriptor:n.viewDescriptor})}add(e){const t=[];for(const i of e){const n=i.viewDescriptor;if(n.when)for(const a of n.when.keys())this.contextKeys.add(a);let o=this.viewDescriptorsState.get(n.id);if(o){if(n.workspace)o.visibleWorkspace=p(i.visible)?p(o.visibleWorkspace)?!n.hideByDefault:o.visibleWorkspace:i.visible;else{const a=o.visibleGlobal;o.visibleGlobal=p(i.visible)?p(o.visibleGlobal)?!n.hideByDefault:o.visibleGlobal:i.visible,o.visibleGlobal&&!a&&this.logger.value.info(`Added view ${n.id} in the container ${this.viewContainer.id} and showing it.`,`${a}`,`${n.hideByDefault}`,`${i.visible}`)}o.collapsed=p(i.collapsed)?p(o.collapsed)?!!n.collapsed:o.collapsed:i.collapsed}else o={active:!1,visibleGlobal:p(i.visible)?!n.hideByDefault:i.visible,visibleWorkspace:p(i.visible)?!n.hideByDefault:i.visible,collapsed:p(i.collapsed)?!!n.collapsed:i.collapsed};this.viewDescriptorsState.set(n.id,o),o.active=this.contextKeyService.contextMatchesRules(n.when),t.push({viewDescriptor:n,state:o})}this.viewDescriptorItems.push(...t),this.viewDescriptorItems.sort(this.compareViewDescriptors.bind(this)),this._onDidChangeAllViewDescriptors.fire({added:t.map(({viewDescriptor:i})=>i),removed:[]});const s=[];for(const i of t)i.state.active&&s.push({viewDescriptorItem:i,visible:this.isViewDescriptorVisible(i)});s.length&&this._onDidChangeActiveViewDescriptors.fire({added:s.map(({viewDescriptorItem:i})=>i.viewDescriptor),removed:[]});const r=[];for(const{viewDescriptorItem:i,visible:n}of s)if(n&&this.isViewDescriptorVisible(i)){const{visibleIndex:o}=this.find(i.viewDescriptor.id);r.push({index:o,viewDescriptor:i.viewDescriptor,size:i.state.size,collapsed:!!i.state.collapsed})}this.broadCastAddedVisibleViewDescriptors(r)}remove(e){const t=[],s=[],r=[],i=[];for(const n of e){if(n.when)for(const a of n.when.keys())this.contextKeys.delete(a);const o=this.viewDescriptorItems.findIndex(a=>a.viewDescriptor.id===n.id);if(o!==-1){t.push(n);const a=this.viewDescriptorItems[o];if(a.state.active&&r.push(a.viewDescriptor),this.isViewDescriptorVisible(a)){const{visibleIndex:c}=this.find(a.viewDescriptor.id);i.push({index:c,viewDescriptor:a.viewDescriptor})}s.push(a)}}s.forEach(n=>this.viewDescriptorItems.splice(this.viewDescriptorItems.indexOf(n),1)),this.broadCastRemovedVisibleViewDescriptors(i),r.length&&this._onDidChangeActiveViewDescriptors.fire({added:[],removed:r}),t.length&&this._onDidChangeAllViewDescriptors.fire({added:[],removed:t})}onDidChangeContext(){const e=[],t=[];for(const i of this.viewDescriptorItems){const n=i.state.active,o=this.contextKeyService.contextMatchesRules(i.viewDescriptor.when);n!==o&&(o?e.push({item:i,visibleWhenActive:this.isViewDescriptorVisibleWhenActive(i)}):t.push(i))}const s=[];for(const i of t)if(this.isViewDescriptorVisible(i)){const{visibleIndex:n}=this.find(i.viewDescriptor.id);s.push({index:n,viewDescriptor:i.viewDescriptor})}t.forEach(i=>i.state.active=!1),e.forEach(({item:i})=>i.state.active=!0),this.broadCastRemovedVisibleViewDescriptors(s),(e.length||t.length)&&this._onDidChangeActiveViewDescriptors.fire({added:e.map(({item:i})=>i.viewDescriptor),removed:t.map(i=>i.viewDescriptor)});const r=[];for(const{item:i,visibleWhenActive:n}of e)if(n&&this.isViewDescriptorVisible(i)){const{visibleIndex:o}=this.find(i.viewDescriptor.id);r.push({index:o,viewDescriptor:i.viewDescriptor,size:i.state.size,collapsed:!!i.state.collapsed})}this.broadCastAddedVisibleViewDescriptors(r)}broadCastAddedVisibleViewDescriptors(e){e.length&&(this._onDidAddVisibleViewDescriptors.fire(e.sort((t,s)=>t.index-s.index)),this.updateState(`Added views:${e.map(t=>t.viewDescriptor.id).join(",")} in ${this.viewContainer.id}`))}broadCastRemovedVisibleViewDescriptors(e){e.length&&(this._onDidRemoveVisibleViewDescriptors.fire(e.sort((t,s)=>s.index-t.index)),this.updateState(`Removed views:${e.map(t=>t.viewDescriptor.id).join(",")} from ${this.viewContainer.id}`))}broadCastMovedViewDescriptors(e,t){this._onDidMoveVisibleViewDescriptors.fire({from:e,to:t}),this.updateState(`Moved view ${e.viewDescriptor.id} to ${t.viewDescriptor.id} in ${this.viewContainer.id}`)}updateState(e){this.logger.value.info(e),this.viewDescriptorsState.updateState(this.allViewDescriptors),this.updateContainerInfo()}isViewDescriptorVisible(e){return e.state.active?this.isViewDescriptorVisibleWhenActive(e):!1}isViewDescriptorVisibleWhenActive(e){return e.viewDescriptor.workspace?!!e.state.visibleWorkspace:!!e.state.visibleGlobal}find(e){const t=this.findAndIgnoreIfNotFound(e);if(t)return t;throw new Error(`view descriptor ${e} not found`)}findAndIgnoreIfNotFound(e){for(let t=0,s=0;t<this.viewDescriptorItems.length;t++){const r=this.viewDescriptorItems[t];if(r.viewDescriptor.id===e)return{index:t,visibleIndex:s,viewDescriptorItem:r};this.isViewDescriptorVisible(r)&&s++}}compareViewDescriptors(e,t){return e.viewDescriptor.id===t.viewDescriptor.id?0:this.getViewOrder(e)-this.getViewOrder(t)||this.getGroupOrderResult(e.viewDescriptor,t.viewDescriptor)}getViewOrder(e){const t=typeof e.state.order=="number"?e.state.order:e.viewDescriptor.order;return typeof t=="number"?t:Number.MAX_VALUE}getGroupOrderResult(e,t){return!e.group||!t.group||e.group===t.group?0:e.group<t.group?-1:1}};V=I([h(1,K),h(2,N),h(3,S)],V);export{V as ViewContainerModel,B as getViewsStateStorageId};
