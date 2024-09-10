var I=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var y=(a,d,r,o)=>{for(var e=o>1?void 0:o?m(d,r):d,t=a.length-1,i;t>=0;t--)(i=a[t])&&(e=(o?i(d,r,e):i(e))||e);return o&&e&&I(d,r,e),e},p=(a,d)=>(r,o)=>d(r,o,a);import{Disposable as k,DisposableMap as h,DisposableStore as l}from"../../../../base/common/lifecycle.js";import{autorun as W,autorunWithStore as f,derived as _}from"../../../../base/common/observable.js";import{IConfigurationService as w}from"../../../../platform/configuration/common/configuration.js";import{observableConfigValue as R}from"../../../../platform/observable/common/platformObservableUtils.js";import{IStorageService as b,StorageScope as g,StorageTarget as C}from"../../../../platform/storage/common/storage.js";import"../../../common/contributions.js";import{getProviderKey as G}from"./util.js";import{ISCMService as M}from"../common/scm.js";import{IEditorGroupsService as D}from"../../../services/editor/common/editorGroupsService.js";import{IWorkbenchLayoutService as H,Parts as A}from"../../../services/layout/browser/layoutService.js";let S=class extends k{constructor(r,o,e,t,i){super();this.configurationService=r;this.editorGroupsService=o;this.scmService=e;this.storageService=t;this.layoutService=i;this._store.add(f((s,n)=>{if(!this._enabledConfig.read(s)){this.storageService.remove("scm.workingSets",g.WORKSPACE),this._repositoryDisposables.clearAndDisposeAll();return}this._workingSets=this._loadWorkingSets(),this.scmService.onDidAddRepository(this._onDidAddRepository,this,n),this.scmService.onDidRemoveRepository(this._onDidRemoveRepository,this,n);for(const c of this.scmService.repositories)this._onDidAddRepository(c)}))}static ID="workbench.contrib.scmWorkingSets";_workingSets;_enabledConfig=R("scm.workingSets.enabled",!1,this.configurationService);_repositoryDisposables=new h;_onDidAddRepository(r){const o=new l,e=_(t=>r.provider.historyProvider.read(t)?.currentHistoryItemGroup.read(t)?.id);o.add(W(async t=>{const i=e.read(t);if(!i)return;const s=G(r.provider),n=this._workingSets.get(s);if(!n){this._workingSets.set(s,{currentHistoryItemGroupId:i,editorWorkingSets:new Map});return}n.currentHistoryItemGroupId!==i&&(this._saveWorkingSet(s,i,n),await this._restoreWorkingSet(s,i))})),this._repositoryDisposables.set(r,o)}_onDidRemoveRepository(r){this._repositoryDisposables.deleteAndDispose(r)}_loadWorkingSets(){const r=new Map,o=this.storageService.get("scm.workingSets",g.WORKSPACE);if(!o)return r;for(const e of JSON.parse(o))r.set(e.providerKey,{currentHistoryItemGroupId:e.currentHistoryItemGroupId,editorWorkingSets:new Map(e.editorWorkingSets)});return r}_saveWorkingSet(r,o,e){const t=e.currentHistoryItemGroupId,i=e.editorWorkingSets,s=this.editorGroupsService.saveWorkingSet(t);this._workingSets.set(r,{currentHistoryItemGroupId:o,editorWorkingSets:i.set(t,s)});const n=[];for(const[c,{currentHistoryItemGroupId:u,editorWorkingSets:v}]of this._workingSets)n.push({providerKey:c,currentHistoryItemGroupId:u,editorWorkingSets:[...v]});this.storageService.store("scm.workingSets",JSON.stringify(n),g.WORKSPACE,C.MACHINE)}async _restoreWorkingSet(r,o){const e=this._workingSets.get(r);if(!e)return;let t=e.editorWorkingSets.get(o);if(!t&&this.configurationService.getValue("scm.workingSets.default")==="empty"&&(t="empty"),t){const i=this.layoutService.hasFocus(A.PANEL_PART);await this.editorGroupsService.applyWorkingSet(t,{preserveFocus:i})}}dispose(){this._repositoryDisposables.dispose(),super.dispose()}};S=y([p(0,w),p(1,D),p(2,M),p(3,b),p(4,H)],S);export{S as SCMWorkingSetController};
