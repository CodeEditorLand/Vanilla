var S=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var v=(g,s,e,t)=>{for(var i=t>1?void 0:t?P(s,e):s,r=g.length-1,o;r>=0;r--)(o=g[r])&&(i=(t?o(s,e,i):o(i))||i);return t&&i&&S(s,e,i),i},p=(g,s)=>(e,t)=>s(e,t,g);import{localize as x}from"../../../../nls.js";import{GroupLocation as u,GroupsOrder as h,IEditorGroupsService as w}from"../../../services/editor/common/editorGroupsService.js";import{Emitter as a}from"../../../../base/common/event.js";import{DisposableMap as C,DisposableStore as _,toDisposable as y}from"../../../../base/common/lifecycle.js";import"../../../common/editor.js";import{MainEditorPart as A}from"./editorPart.js";import"./editor.js";import{InstantiationType as K,registerSingleton as D}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as R}from"../../../../platform/instantiation/common/instantiation.js";import{distinct as T}from"../../../../base/common/arrays.js";import{AuxiliaryEditorPart as V}from"./auxiliaryEditorPart.js";import{MultiWindowParts as k}from"../../part.js";import{DeferredPromise as E}from"../../../../base/common/async.js";import{IStorageService as O,StorageScope as l,StorageTarget as m}from"../../../../platform/storage/common/storage.js";import{IThemeService as b}from"../../../../platform/theme/common/themeService.js";import{IAuxiliaryWindowService as M}from"../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js";import{generateUuid as W}from"../../../../base/common/uuid.js";import{IContextKeyService as L}from"../../../../platform/contextkey/common/contextkey.js";import{isHTMLElement as U}from"../../../../base/browser/dom.js";import{ServiceCollection as z}from"../../../../platform/instantiation/common/serviceCollection.js";import{IEditorService as f}from"../../../services/editor/common/editorService.js";let n=class extends k{constructor(e,t,i,r,o){super("workbench.editorParts",i,t);this.instantiationService=e;this.storageService=t;this.auxiliaryWindowService=r;this.contextKeyService=o;this._register(this.registerPart(this.mainPart)),this.restoreParts(),this.registerListeners()}mainPart=this._register(this.createMainEditorPart());mostRecentActiveParts=[this.mainPart];registerListeners(){this._register(this.onDidChangeMementoValue(l.WORKSPACE,this._store)(e=>this.onDidChangeMementoState(e))),this.whenReady.then(()=>this.registerGroupsContextKeyListeners())}createMainEditorPart(){return this.instantiationService.createInstance(A,this)}mapPartToInstantiationService=new Map;getScopedInstantiationService(e){return e===this.mainPart&&(this.mapPartToInstantiationService.has(e.windowId)||this.instantiationService.invokeFunction(t=>{const i=t.get(f);this.mapPartToInstantiationService.set(e.windowId,this._register(this.instantiationService.createChild(new z([f,i.createScoped("main",this._store)]))))})),this.mapPartToInstantiationService.get(e.windowId)??this.instantiationService}_onDidCreateAuxiliaryEditorPart=this._register(new a);onDidCreateAuxiliaryEditorPart=this._onDidCreateAuxiliaryEditorPart.event;async createAuxiliaryEditorPart(e){const{part:t,instantiationService:i,disposables:r}=await this.instantiationService.createInstance(V,this).create(this.getGroupsLabel(this._parts.size),e);return this.mapPartToInstantiationService.set(t.windowId,i),r.add(y(()=>this.mapPartToInstantiationService.delete(t.windowId))),this._onDidAddGroup.fire(t.activeGroup),this._onDidCreateAuxiliaryEditorPart.fire(t),t}registerPart(e){const t=this._register(new _);return t.add(super.registerPart(e)),this.registerEditorPartListeners(e,t),t}unregisterPart(e){super.unregisterPart(e),this.parts.forEach((t,i)=>{t!==this.mainPart&&t.notifyGroupsLabelChange(this.getGroupsLabel(i))})}registerEditorPartListeners(e,t){t.add(e.onDidFocus(()=>{this.doUpdateMostRecentActive(e,!0),this._parts.size>1&&this._onDidActiveGroupChange.fire(this.activeGroup)})),t.add(y(()=>this.doUpdateMostRecentActive(e))),t.add(e.onDidChangeActiveGroup(i=>this._onDidActiveGroupChange.fire(i))),t.add(e.onDidAddGroup(i=>this._onDidAddGroup.fire(i))),t.add(e.onDidRemoveGroup(i=>this._onDidRemoveGroup.fire(i))),t.add(e.onDidMoveGroup(i=>this._onDidMoveGroup.fire(i))),t.add(e.onDidActivateGroup(i=>this._onDidActivateGroup.fire(i))),t.add(e.onDidChangeGroupMaximized(i=>this._onDidChangeGroupMaximized.fire(i))),t.add(e.onDidChangeGroupIndex(i=>this._onDidChangeGroupIndex.fire(i))),t.add(e.onDidChangeGroupLocked(i=>this._onDidChangeGroupLocked.fire(i)))}doUpdateMostRecentActive(e,t){const i=this.mostRecentActiveParts.indexOf(e);i!==-1&&this.mostRecentActiveParts.splice(i,1),t&&this.mostRecentActiveParts.unshift(e)}getGroupsLabel(e){return x("groupLabel","Window {0}",e+1)}getPart(e){if(this._parts.size>1)if(U(e)){const t=e;return this.getPartByDocument(t.ownerDocument)}else{const t=e;let i;typeof t=="number"?i=t:i=t.id;for(const r of this._parts)if(r.hasGroup(i))return r}return this.mainPart}static EDITOR_PARTS_UI_STATE_STORAGE_KEY="editorparts.state";workspaceMemento=this.getMemento(l.WORKSPACE,m.USER);_isReady=!1;get isReady(){return this._isReady}whenReadyPromise=new E;whenReady=this.whenReadyPromise.p;whenRestoredPromise=new E;whenRestored=this.whenRestoredPromise.p;async restoreParts(){if(await this.mainPart.whenReady,this.mainPart.willRestoreState){const t=this.loadState();t&&await this.restoreState(t)}this.mostRecentActiveParts.at(0)?.activeGroup.focus(),this._isReady=!0,this.whenReadyPromise.complete(),await Promise.allSettled(this.parts.map(t=>t.whenRestored)),this.whenRestoredPromise.complete()}loadState(){return this.workspaceMemento[n.EDITOR_PARTS_UI_STATE_STORAGE_KEY]}saveState(){const e=this.createState();e.auxiliary.length===0?delete this.workspaceMemento[n.EDITOR_PARTS_UI_STATE_STORAGE_KEY]:this.workspaceMemento[n.EDITOR_PARTS_UI_STATE_STORAGE_KEY]=e}createState(){return{auxiliary:this.parts.filter(e=>e!==this.mainPart).map(e=>{const t=this.auxiliaryWindowService.getWindow(e.windowId);return{state:e.createState(),...t?.createState()}}),mru:this.mostRecentActiveParts.map(e=>this.parts.indexOf(e))}}async restoreState(e){if(e.auxiliary.length){const t=[];for(const i of e.auxiliary)t.push(this.createAuxiliaryEditorPart(i));await Promise.allSettled(t),e.mru.length===this.parts.length?this.mostRecentActiveParts=e.mru.map(i=>this.parts[i]):this.mostRecentActiveParts=[...this.parts],await Promise.allSettled(this.parts.map(i=>i.whenReady))}}get hasRestorableState(){return this.parts.some(e=>e.hasRestorableState)}onDidChangeMementoState(e){if(e.external&&e.scope===l.WORKSPACE){this.reloadMemento(e.scope);const t=this.loadState();t&&this.applyState(t)}}async applyState(e){for(const t of this.parts){if(t===this.mainPart)continue;for(const r of t.getGroups(h.MOST_RECENTLY_ACTIVE))await r.closeAllEditors({excludeConfirming:!0});if(!t.close())return!1}return e!=="empty"&&await this.restoreState(e),!0}static EDITOR_WORKING_SETS_STORAGE_KEY="editor.workingSets";editorWorkingSets=(()=>{const e=this.storageService.get(n.EDITOR_WORKING_SETS_STORAGE_KEY,l.WORKSPACE);return e?JSON.parse(e):[]})();saveWorkingSet(e){const t={id:W(),name:e,main:this.mainPart.createState(),auxiliary:this.createState()};return this.editorWorkingSets.push(t),this.saveWorkingSets(),{id:t.id,name:t.name}}getWorkingSets(){return this.editorWorkingSets.map(e=>({id:e.id,name:e.name}))}deleteWorkingSet(e){const t=this.indexOfWorkingSet(e);typeof t=="number"&&(this.editorWorkingSets.splice(t,1),this.saveWorkingSets())}async applyWorkingSet(e,t){let i;if(e==="empty"?i="empty":i=this.editorWorkingSets[this.indexOfWorkingSet(e)??-1],!i||!await this.applyState(i==="empty"?i:i.auxiliary))return!1;if(await this.mainPart.applyState(i==="empty"?i:i.main,t),!t?.preserveFocus){const o=this.mostRecentActiveParts.at(0);o&&(await o.whenReady,o.activeGroup.focus())}return!0}indexOfWorkingSet(e){for(let t=0;t<this.editorWorkingSets.length;t++)if(this.editorWorkingSets[t].id===e.id)return t}saveWorkingSets(){this.storageService.store(n.EDITOR_WORKING_SETS_STORAGE_KEY,JSON.stringify(this.editorWorkingSets),l.WORKSPACE,m.MACHINE)}_onDidActiveGroupChange=this._register(new a);onDidChangeActiveGroup=this._onDidActiveGroupChange.event;_onDidAddGroup=this._register(new a);onDidAddGroup=this._onDidAddGroup.event;_onDidRemoveGroup=this._register(new a);onDidRemoveGroup=this._onDidRemoveGroup.event;_onDidMoveGroup=this._register(new a);onDidMoveGroup=this._onDidMoveGroup.event;_onDidActivateGroup=this._register(new a);onDidActivateGroup=this._onDidActivateGroup.event;_onDidChangeGroupIndex=this._register(new a);onDidChangeGroupIndex=this._onDidChangeGroupIndex.event;_onDidChangeGroupLocked=this._register(new a);onDidChangeGroupLocked=this._onDidChangeGroupLocked.event;_onDidChangeGroupMaximized=this._register(new a);onDidChangeGroupMaximized=this._onDidChangeGroupMaximized.event;get activeGroup(){return this.activePart.activeGroup}get sideGroup(){return this.activePart.sideGroup}get groups(){return this.getGroups()}get count(){return this.groups.length}getGroups(e=h.CREATION_TIME){if(this._parts.size>1){let t;switch(e){case h.GRID_APPEARANCE:case h.CREATION_TIME:t=this.parts;break;case h.MOST_RECENTLY_ACTIVE:t=T([...this.mostRecentActiveParts,...this.parts]);break}return t.map(i=>i.getGroups(e)).flat()}return this.mainPart.getGroups(e)}getGroup(e){if(this._parts.size>1)for(const t of this._parts){const i=t.getGroup(e);if(i)return i}return this.mainPart.getGroup(e)}assertGroupView(e){let t;if(typeof e=="number"?t=this.getGroup(e):t=e,!t)throw new Error("Invalid editor group provided!");return t}activateGroup(e){return this.getPart(e).activateGroup(e)}getSize(e){return this.getPart(e).getSize(e)}setSize(e,t){this.getPart(e).setSize(e,t)}arrangeGroups(e,t=this.activePart.activeGroup){this.getPart(t).arrangeGroups(e,t)}toggleMaximizeGroup(e=this.activePart.activeGroup){this.getPart(e).toggleMaximizeGroup(e)}toggleExpandGroup(e=this.activePart.activeGroup){this.getPart(e).toggleExpandGroup(e)}restoreGroup(e){return this.getPart(e).restoreGroup(e)}applyLayout(e){this.activePart.applyLayout(e)}getLayout(){return this.activePart.getLayout()}get orientation(){return this.activePart.orientation}setGroupOrientation(e){this.activePart.setGroupOrientation(e)}findGroup(e,t=this.activeGroup,i){const r=this.getPart(t);if(this._parts.size>1){const o=this.getGroups(h.GRID_APPEARANCE);if(e.location===u.FIRST||e.location===u.LAST)return e.location===u.FIRST?o[0]:o[o.length-1];const c=r.findGroup(e,t,!1);if(c)return c;if(e.location===u.NEXT||e.location===u.PREVIOUS){const G=this.assertGroupView(t),I=o.indexOf(G);if(e.location===u.NEXT){let d=o[I+1];return!d&&i&&(d=o[0]),d}else{let d=o[I-1];return!d&&i&&(d=o[o.length-1]),d}}}return r.findGroup(e,t,i)}addGroup(e,t){return this.getPart(e).addGroup(e,t)}removeGroup(e){this.getPart(e).removeGroup(e)}moveGroup(e,t,i){return this.getPart(e).moveGroup(e,t,i)}mergeGroup(e,t,i){return this.getPart(e).mergeGroup(e,t,i)}mergeAllGroups(e){return this.activePart.mergeAllGroups(e)}copyGroup(e,t,i){return this.getPart(e).copyGroup(e,t,i)}createEditorDropTarget(e,t){return this.getPart(e).createEditorDropTarget(e,t)}globalContextKeys=new Map;scopedContextKeys=new Map;registerGroupsContextKeyListeners(){this._register(this.onDidChangeActiveGroup(()=>this.updateGlobalContextKeys())),this.groups.forEach(e=>this.registerGroupContextKeyProvidersListeners(e)),this._register(this.onDidAddGroup(e=>this.registerGroupContextKeyProvidersListeners(e))),this._register(this.onDidRemoveGroup(e=>{this.scopedContextKeys.delete(e.id),this.registeredContextKeys.delete(e.id),this.contextKeyProviderDisposables.deleteAndDispose(e.id)}))}updateGlobalContextKeys(){const e=this.scopedContextKeys.get(this.activeGroup.id);if(e)for(const[t,i]of this.globalContextKeys){const r=e.get(t);r?i.set(r.get()):i.reset()}}bind(e,t){let i=this.globalContextKeys.get(e.key);i||(i=e.bindTo(this.contextKeyService),this.globalContextKeys.set(e.key,i));let r=this.scopedContextKeys.get(t.id);r||(r=new Map,this.scopedContextKeys.set(t.id,r));let o=r.get(e.key);o||(o=e.bindTo(t.scopedContextKeyService),r.set(e.key,o));const c=this;return{get(){return o.get()},set(G){c.activeGroup===t&&i.set(G),o.set(G)},reset(){c.activeGroup===t&&i.reset(),o.reset()}}}contextKeyProviders=new Map;registeredContextKeys=new Map;registerContextKeyProvider(e){if(this.contextKeyProviders.has(e.contextKey.key)||this.globalContextKeys.has(e.contextKey.key))throw new Error(`A context key provider for key ${e.contextKey.key} already exists.`);this.contextKeyProviders.set(e.contextKey.key,e);const t=()=>{for(const r of this.groups)this.updateRegisteredContextKey(r,e)};t();const i=e.onDidChange?.(()=>t());return y(()=>{i?.dispose(),this.globalContextKeys.delete(e.contextKey.key),this.scopedContextKeys.forEach(r=>r.delete(e.contextKey.key)),this.contextKeyProviders.delete(e.contextKey.key),this.registeredContextKeys.forEach(r=>r.delete(e.contextKey.key))})}contextKeyProviderDisposables=this._register(new C);registerGroupContextKeyProvidersListeners(e){const t=e.onDidActiveEditorChange(()=>{for(const i of this.contextKeyProviders.values())this.updateRegisteredContextKey(e,i)});this.contextKeyProviderDisposables.set(e.id,t)}updateRegisteredContextKey(e,t){let i=this.registeredContextKeys.get(e.id);i||(i=new Map,this.registeredContextKeys.set(e.id,i));let r=i.get(t.contextKey.key);r||(r=this.bind(t.contextKey,e),i.set(t.contextKey.key,r)),r.set(t.getGroupContextKeyValue(e))}get partOptions(){return this.mainPart.partOptions}get onDidChangeEditorPartOptions(){return this.mainPart.onDidChangeEditorPartOptions}};n=v([p(0,R),p(1,O),p(2,b),p(3,M),p(4,L)],n),D(w,n,K.Eager);export{n as EditorParts};
