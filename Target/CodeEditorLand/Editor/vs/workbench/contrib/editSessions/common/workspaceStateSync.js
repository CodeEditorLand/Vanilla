var h=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var g=(l,n,e,t)=>{for(var r=t>1?void 0:t?D(n,e):n,o=l.length-1,s;o>=0;o--)(s=l[o])&&(r=(t?s(n,e,r):s(r))||r);return t&&r&&h(n,e,r),r},i=(l,n)=>(e,t)=>n(e,t,l);import{CancellationTokenSource as I}from"../../../../base/common/cancellation.js";import"../../../../base/common/collections.js";import{Emitter as y}from"../../../../base/common/event.js";import{parse as R,stringify as k}from"../../../../base/common/marshalling.js";import"../../../../base/common/uri.js";import{IConfigurationService as E}from"../../../../platform/configuration/common/configuration.js";import{IEnvironmentService as b}from"../../../../platform/environment/common/environment.js";import{IFileService as U}from"../../../../platform/files/common/files.js";import{IStorageService as P,StorageScope as d,StorageTarget as p}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as C}from"../../../../platform/telemetry/common/telemetry.js";import{IUriIdentityService as A}from"../../../../platform/uriIdentity/common/uriIdentity.js";import"../../../../platform/userDataProfile/common/userDataProfile.js";import{AbstractSynchroniser as T}from"../../../../platform/userDataSync/common/abstractSynchronizer.js";import{SyncResource as _}from"../../../../platform/userDataSync/common/userDataSync.js";import{IWorkspaceIdentityService as W}from"../../../services/workspaces/common/workspaceIdentityService.js";import{IEditSessionsStorageService as O}from"./editSessions.js";class M{_serviceBrand;async writeResource(){}async getAllResourceRefs(){return[]}async resolveResourceContent(){return null}}class L{_serviceBrand;_onDidChangeEnablement=new y;onDidChangeEnablement=this._onDidChangeEnablement.event;_onDidChangeResourceEnablement=new y;onDidChangeResourceEnablement=this._onDidChangeResourceEnablement.event;isEnabled(){return!0}canToggleEnablement(){return!0}setEnablement(n){}isResourceEnabled(n){return!0}setResourceEnablement(n,e){}getResourceSyncStateVersion(n){}}let v=class extends T{constructor(e,t,r,o,s,S,a,c,u,m,F,K){const f=new M,w=new L;super({syncResource:_.WorkspaceState,profile:e},t,s,S,u,r,f,w,a,o,c,m);this.workspaceIdentityService=F;this.editSessionsStorageService=K}version=1;async sync(){const e=new I,t=await this.workspaceIdentityService.getWorkspaceStateFolders(e.token);if(!t.length)return;await this.storageService.flush();const r=this.storageService.keys(d.WORKSPACE,p.USER);if(!r.length)return;const o={};r.forEach(S=>{const a=this.storageService.get(S,d.WORKSPACE);a&&(o[S]=a)});const s={folders:t,storage:o,version:this.version};await this.editSessionsStorageService.write("workspaceState",k(s))}async apply(){const e=this.editSessionsStorageService.lastReadResources.get("editSessions")?.content,t=e?JSON.parse(e).workspaceStateId:void 0,r=await this.editSessionsStorageService.read("workspaceState",t);if(!r)return null;const o=R(r.content);if(!o)return this.logService.info("Skipping initializing workspace state because remote workspace state does not exist."),null;const s=new I,S=await this.workspaceIdentityService.matches(o.folders,s.token);if(!S)return this.logService.info("Skipping initializing workspace state because remote workspace state does not match current workspace."),null;const a={};for(const c of Object.keys(o.storage))a[c]=o.storage[c];if(Object.keys(a).length){const c=[];for(const u of Object.keys(a))try{const m=R(a[u]);S(m),c.push({key:u,value:m,scope:d.WORKSPACE,target:p.USER})}catch{c.push({key:u,value:a[u],scope:d.WORKSPACE,target:p.USER})}this.storageService.storeAll(c,!0)}return this.editSessionsStorageService.delete("workspaceState",r.ref),null}applyResult(e,t,r,o){throw new Error("Method not implemented.")}async generateSyncPreview(e,t,r,o,s){return[]}getMergeResult(e,t){throw new Error("Method not implemented.")}getAcceptResult(e,t,r,o){throw new Error("Method not implemented.")}async hasRemoteChanged(e){return!0}async hasLocalData(){return!1}async resolveContent(e){return null}};v=g([i(4,U),i(5,b),i(6,C),i(7,E),i(8,P),i(9,A),i(10,W),i(11,O)],v);export{v as WorkspaceStateSynchroniser};
