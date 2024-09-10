var W=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var f=(d,e,r,i)=>{for(var t=i>1?void 0:i?x(e,r):e,o=d.length-1,s;o>=0;o--)(s=d[o])&&(t=(i?s(e,r,t):s(t))||t);return i&&t&&W(e,r,t),t},n=(d,e)=>(r,i)=>e(r,i,d);import{isCancellationError as g}from"../../../base/common/errors.js";import{DisposableStore as T}from"../../../base/common/lifecycle.js";import{isNative as E}from"../../../base/common/platform.js";import{URI as l}from"../../../base/common/uri.js";import{localize as p}from"../../../nls.js";import{IEnvironmentService as b}from"../../../platform/environment/common/environment.js";import{IFileService as P}from"../../../platform/files/common/files.js";import{IInstantiationService as U}from"../../../platform/instantiation/common/instantiation.js";import{ILabelService as D}from"../../../platform/label/common/label.js";import{INotificationService as M}from"../../../platform/notification/common/notification.js";import{IRequestService as F}from"../../../platform/request/common/request.js";import{IWorkspaceTrustManagementService as R,IWorkspaceTrustRequestService as $}from"../../../platform/workspace/common/workspaceTrust.js";import{IWorkspaceContextService as q,WorkbenchState as A,isUntitledWorkspace as w}from"../../../platform/workspace/common/workspace.js";import{extHostNamedCustomer as B}from"../../services/extensions/common/extHostCustomers.js";import{checkGlobFileExists as H}from"../../services/extensions/common/workspaceContains.js";import{QueryBuilder as z}from"../../services/search/common/queryBuilder.js";import{IEditorService as O}from"../../services/editor/common/editorService.js";import{ISearchService as Q}from"../../services/search/common/search.js";import{IWorkspaceEditingService as G}from"../../services/workspaces/common/workspaceEditing.js";import{ExtHostContext as L,MainContext as j}from"../common/extHost.protocol.js";import{IEditSessionIdentityService as Y}from"../../../platform/workspace/common/editSessions.js";import{EditorResourceAccessor as K,SaveReason as X,SideBySideEditor as k}from"../../common/editor.js";import{coalesce as J}from"../../../base/common/arrays.js";import{ICanonicalUriService as N}from"../../../platform/workspace/common/canonicalUri.js";import{revive as I}from"../../../base/common/marshalling.js";let v=class{constructor(e,r,i,t,o,s,a,u,S,m,_,c,y,V,Z){this._searchService=r;this._contextService=i;this._editSessionIdentityService=t;this._canonicalUriService=o;this._editorService=s;this._workspaceEditingService=a;this._notificationService=u;this._requestService=S;this._instantiationService=m;this._labelService=_;this._environmentService=c;this._workspaceTrustManagementService=V;this._workspaceTrustRequestService=Z;this._proxy=e.getProxy(L.ExtHostWorkspace);const h=this._contextService.getWorkspace();h.configuration&&!E&&!y.hasProvider(h.configuration)?this._proxy.$initializeWorkspace(this.getWorkspaceData(h),this.isWorkspaceTrusted()):this._contextService.getCompleteWorkspace().then(C=>this._proxy.$initializeWorkspace(this.getWorkspaceData(C),this.isWorkspaceTrusted())),this._contextService.onDidChangeWorkspaceFolders(this._onDidChangeWorkspace,this,this._toDispose),this._contextService.onDidChangeWorkbenchState(this._onDidChangeWorkspace,this,this._toDispose),this._workspaceTrustManagementService.onDidChangeTrust(this._onDidGrantWorkspaceTrust,this,this._toDispose)}_toDispose=new T;_activeCancelTokens=Object.create(null);_proxy;_queryBuilder=this._instantiationService.createInstance(z);dispose(){this._toDispose.dispose();for(const e in this._activeCancelTokens)this._activeCancelTokens[e].cancel()}$updateWorkspaceFolders(e,r,i,t){const o=t.map(s=>({uri:l.revive(s.uri),name:s.name}));return this._notificationService.status(this.getStatusMessage(e,o.length,i),{hideAfter:10*1e3}),this._workspaceEditingService.updateFolders(r,i,o,!0)}getStatusMessage(e,r,i){let t;const o=r>0,s=i>0;return o&&!s?r===1?t=p("folderStatusMessageAddSingleFolder","Extension '{0}' added 1 folder to the workspace",e):t=p("folderStatusMessageAddMultipleFolders","Extension '{0}' added {1} folders to the workspace",e,r):s&&!o?i===1?t=p("folderStatusMessageRemoveSingleFolder","Extension '{0}' removed 1 folder from the workspace",e):t=p("folderStatusMessageRemoveMultipleFolders","Extension '{0}' removed {1} folders from the workspace",e,i):t=p("folderStatusChangeFolder","Extension '{0}' changed folders of the workspace",e),t}_onDidChangeWorkspace(){this._proxy.$acceptWorkspaceData(this.getWorkspaceData(this._contextService.getWorkspace()))}getWorkspaceData(e){return this._contextService.getWorkbenchState()===A.EMPTY?null:{configuration:e.configuration||void 0,isUntitled:e.configuration?w(e.configuration,this._environmentService):!1,folders:e.folders,id:e.id,name:this._labelService.getWorkspaceLabel(e),transient:e.transient}}$startFileSearch(e,r,i){const t=l.revive(e),o=this._contextService.getWorkspace(),s=this._queryBuilder.file(t?[t]:o.folders,I(r));return this._searchService.fileSearch(s,i).then(a=>a.results.map(u=>u.resource),a=>g(a)?null:Promise.reject(a))}$startTextSearch(e,r,i,t,o){const s=l.revive(r),a=this._contextService.getWorkspace(),u=s?[s]:a.folders.map(c=>c.uri),S=this._queryBuilder.text(e,u,I(i));S._reason="startTextSearch";const m=c=>{c.results&&this._proxy.$handleTextSearchResult(c,t)};return this._searchService.textSearch(S,o,m).then(c=>({limitHit:c.limitHit}),c=>g(c)?null:Promise.reject(c))}$checkExists(e,r,i){return this._instantiationService.invokeFunction(t=>H(t,e,r,i))}async $save(e,r){const i=l.revive(e),t=[...this._editorService.findEditors(i,{supportSideBySide:k.PRIMARY})],o=await this._editorService.save(t,{reason:X.EXPLICIT,saveAs:r.saveAs,force:!r.saveAs});return this._saveResultToUris(o).at(0)}_saveResultToUris(e){return e.success?J(e.editors.map(r=>K.getCanonicalUri(r,{supportSideBySide:k.PRIMARY}))):[]}$saveAll(e){return this._editorService.saveAll({includeUntitled:e}).then(r=>r.success)}$resolveProxy(e){return this._requestService.resolveProxy(e)}$lookupAuthorization(e){return this._requestService.lookupAuthorization(e)}$lookupKerberosAuthorization(e){return this._requestService.lookupKerberosAuthorization(e)}$loadCertificates(){return this._requestService.loadCertificates()}$requestWorkspaceTrust(e){return this._workspaceTrustRequestService.requestWorkspaceTrust(e)}isWorkspaceTrusted(){return this._workspaceTrustManagementService.isWorkspaceTrusted()}_onDidGrantWorkspaceTrust(){this._proxy.$onDidGrantWorkspaceTrust()}registeredEditSessionProviders=new Map;$registerEditSessionIdentityProvider(e,r){const i=this._editSessionIdentityService.registerEditSessionIdentityProvider({scheme:r,getEditSessionIdentifier:async(t,o)=>this._proxy.$getEditSessionIdentifier(t.uri,o),provideEditSessionIdentityMatch:async(t,o,s,a)=>this._proxy.$provideEditSessionIdentityMatch(t.uri,o,s,a)});this.registeredEditSessionProviders.set(e,i),this._toDispose.add(i)}$unregisterEditSessionIdentityProvider(e){this.registeredEditSessionProviders.get(e)?.dispose(),this.registeredEditSessionProviders.delete(e)}registeredCanonicalUriProviders=new Map;$registerCanonicalUriProvider(e,r){const i=this._canonicalUriService.registerCanonicalUriProvider({scheme:r,provideCanonicalUri:async(t,o,s)=>{const a=await this._proxy.$provideCanonicalUri(t,o,s);return a&&l.revive(a)}});this.registeredCanonicalUriProviders.set(e,i),this._toDispose.add(i)}$unregisterCanonicalUriProvider(e){this.registeredCanonicalUriProviders.get(e)?.dispose(),this.registeredCanonicalUriProviders.delete(e)}};v=f([B(j.MainThreadWorkspace),n(1,Q),n(2,q),n(3,Y),n(4,N),n(5,O),n(6,G),n(7,M),n(8,F),n(9,U),n(10,D),n(11,b),n(12,P),n(13,R),n(14,$)],v);export{v as MainThreadWorkspace};
