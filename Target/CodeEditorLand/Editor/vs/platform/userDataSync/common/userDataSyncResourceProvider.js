var D=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var y=(S,t,e,n)=>{for(var r=n>1?void 0:n?P(t,e):t,i=S.length-1,a;i>=0;i--)(a=S[i])&&(r=(n?a(t,e,r):a(r))||r);return n&&r&&D(t,e,r),r},l=(S,t)=>(e,n)=>t(e,n,S);import"../../../base/common/resources.js";import{URI as g}from"../../../base/common/uri.js";import{localize as C}from"../../../nls.js";import{IEnvironmentService as b}from"../../environment/common/environment.js";import{IFileService as E}from"../../files/common/files.js";import{getServiceMachineId as x}from"../../externalServices/common/serviceMachineId.js";import{IStorageService as N}from"../../storage/common/storage.js";import{IUriIdentityService as T}from"../../uriIdentity/common/uriIdentity.js";import{IUserDataSyncLocalStoreService as A,IUserDataSyncLogService as L,IUserDataSyncStoreService as O,SyncResource as s,UserDataSyncError as j,UserDataSyncErrorCode as w,USER_DATA_SYNC_SCHEME as m,CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM as G}from"./userDataSync.js";import{IUserDataProfilesService as _}from"../../userDataProfile/common/userDataProfile.js";import{isSyncData as k}from"./abstractSynchronizer.js";import{parseSnippets as R}from"./snippetsSync.js";import{parseSettingsSyncContent as H}from"./settingsSync.js";import{getKeybindingsContentFromSyncContent as K}from"./keybindingsSync.js";import{IConfigurationService as M}from"../../configuration/common/configuration.js";import{getTasksContentFromSyncContent as F}from"./tasksSync.js";import{LocalExtensionsProvider as W,parseExtensions as X,stringify as I}from"./extensionsSync.js";import{LocalGlobalStateProvider as Y,stringify as v}from"./globalStateSync.js";import{IInstantiationService as B}from"../../instantiation/common/instantiation.js";import{parseUserDataProfilesManifest as U,stringifyLocalProfiles as $}from"./userDataProfilesManifestSync.js";import{toFormattedString as q}from"../../../base/common/jsonFormatter.js";import{trim as J}from"../../../base/common/strings.js";import"./userDataSyncMachines.js";let o=class{constructor(t,e,n,r,i,a,u,f,d,h){this.userDataSyncStoreService=t;this.userDataSyncLocalStoreService=e;this.logService=n;this.environmentService=i;this.storageService=a;this.fileService=u;this.userDataProfilesService=f;this.configurationService=d;this.instantiationService=h;this.extUri=r.extUri}_serviceBrand;static NOT_EXISTING_RESOURCE="not-existing-resource";static REMOTE_BACKUP_AUTHORITY="remote-backup";static LOCAL_BACKUP_AUTHORITY="local-backup";extUri;async getRemoteSyncedProfiles(){const t=await this.userDataSyncStoreService.readResource(s.Profiles,null,void 0);if(t.content){const e=this.parseSyncData(t.content,s.Profiles);return U(e)}return[]}async getLocalSyncedProfiles(t){const e=await this.userDataSyncLocalStoreService.getAllResourceRefs(s.Profiles,void 0,t);if(e.length){const n=await this.userDataSyncLocalStoreService.resolveResourceContent(s.Profiles,e[0].ref,void 0,t);if(n){const r=this.parseSyncData(n,s.Profiles);return U(r)}}return[]}async getLocalSyncedMachines(t){const e=await this.userDataSyncLocalStoreService.getAllResourceRefs("machines",void 0,t);if(e.length){const n=await this.userDataSyncLocalStoreService.resolveResourceContent("machines",e[0].ref,void 0,t);if(n)return JSON.parse(n).machines.map(i=>({...i,isCurrent:!1}))}return[]}async getRemoteSyncResourceHandles(t,e){return(await this.userDataSyncStoreService.getAllResourceRefs(t,e?.collection)).map(({created:r,ref:i})=>({created:r,uri:this.toUri({remote:!0,syncResource:t,profile:e?.id??this.userDataProfilesService.defaultProfile.id,location:void 0,collection:e?.collection,ref:i,node:void 0})}))}async getLocalSyncResourceHandles(t,e,n){return(await this.userDataSyncLocalStoreService.getAllResourceRefs(t,e?.collection,n)).map(({created:i,ref:a})=>({created:i,uri:this.toUri({remote:!1,syncResource:t,profile:e?.id??this.userDataProfilesService.defaultProfile.id,collection:e?.collection,ref:a,node:void 0,location:n})}))}resolveUserDataSyncResource({uri:t}){const e=this.resolveUri(t),n=e?this.userDataProfilesService.profiles.find(r=>r.id===e.profile):void 0;return e&&n?{profile:n,syncResource:e?.syncResource}:void 0}async getAssociatedResources({uri:t}){const e=this.resolveUri(t);if(!e)return[];const n=this.userDataProfilesService.profiles.find(r=>r.id===e.profile);switch(e.syncResource){case s.Settings:return this.getSettingsAssociatedResources(t,n);case s.Keybindings:return this.getKeybindingsAssociatedResources(t,n);case s.Tasks:return this.getTasksAssociatedResources(t,n);case s.Snippets:return this.getSnippetsAssociatedResources(t,n);case s.GlobalState:return this.getGlobalStateAssociatedResources(t,n);case s.Extensions:return this.getExtensionsAssociatedResources(t,n);case s.Profiles:return this.getProfilesAssociatedResources(t,n);case s.WorkspaceState:return[]}}async getMachineId({uri:t}){const e=this.resolveUri(t);if(e){if(e.remote){if(e.ref){const{content:n}=await this.getUserData(e.syncResource,e.ref,e.collection);if(n)return this.parseSyncData(n,e.syncResource)?.machineId}return}if(e.location){if(e.ref){const n=await this.userDataSyncLocalStoreService.resolveResourceContent(e.syncResource,e.ref,e.collection,e.location);if(n)return this.parseSyncData(n,e.syncResource)?.machineId}return}return x(this.environmentService,this.fileService,this.storageService)}}async resolveContent(t){const e=this.resolveUri(t);if(!e||e.node===o.NOT_EXISTING_RESOURCE)return null;if(e.ref){const n=await this.getContentFromStore(e.remote,e.syncResource,e.collection,e.ref,e.location);return e.node&&n?this.resolveNodeContent(e.syncResource,n,e.node):n}return!e.remote&&!e.node?this.resolveLatestContent(e.syncResource,e.profile):null}async getContentFromStore(t,e,n,r,i){if(t){const{content:a}=await this.getUserData(e,r,n);return a}return this.userDataSyncLocalStoreService.resolveResourceContent(e,r,n,i)}resolveNodeContent(t,e,n){const r=this.parseSyncData(e,t);switch(t){case s.Settings:return this.resolveSettingsNodeContent(r,n);case s.Keybindings:return this.resolveKeybindingsNodeContent(r,n);case s.Tasks:return this.resolveTasksNodeContent(r,n);case s.Snippets:return this.resolveSnippetsNodeContent(r,n);case s.GlobalState:return this.resolveGlobalStateNodeContent(r,n);case s.Extensions:return this.resolveExtensionsNodeContent(r,n);case s.Profiles:return this.resolveProfileNodeContent(r,n);case s.WorkspaceState:return null}}async resolveLatestContent(t,e){const n=this.userDataProfilesService.profiles.find(r=>r.id===e);if(!n)return null;switch(t){case s.GlobalState:return this.resolveLatestGlobalStateContent(n);case s.Extensions:return this.resolveLatestExtensionsContent(n);case s.Profiles:return this.resolveLatestProfilesContent(n);case s.Settings:return null;case s.Keybindings:return null;case s.Tasks:return null;case s.Snippets:return null;case s.WorkspaceState:return null}}getSettingsAssociatedResources(t,e){const n=this.extUri.joinPath(t,"settings.json"),r=e?e.settingsResource:this.extUri.joinPath(t,o.NOT_EXISTING_RESOURCE);return[{resource:n,comparableResource:r}]}resolveSettingsNodeContent(t,e){switch(e){case"settings.json":return H(t.content).settings}return null}getKeybindingsAssociatedResources(t,e){const n=this.extUri.joinPath(t,"keybindings.json"),r=e?e.keybindingsResource:this.extUri.joinPath(t,o.NOT_EXISTING_RESOURCE);return[{resource:n,comparableResource:r}]}resolveKeybindingsNodeContent(t,e){switch(e){case"keybindings.json":return K(t.content,!!this.configurationService.getValue(G),this.logService)}return null}getTasksAssociatedResources(t,e){const n=this.extUri.joinPath(t,"tasks.json"),r=e?e.tasksResource:this.extUri.joinPath(t,o.NOT_EXISTING_RESOURCE);return[{resource:n,comparableResource:r}]}resolveTasksNodeContent(t,e){switch(e){case"tasks.json":return F(t.content,this.logService)}return null}async getSnippetsAssociatedResources(t,e){const n=await this.resolveContent(t);if(n){const r=this.parseSyncData(n,s.Snippets);if(r){const i=R(r),a=[];for(const u of Object.keys(i)){const f=this.extUri.joinPath(t,u),d=e?this.extUri.joinPath(e.snippetsHome,u):this.extUri.joinPath(t,o.NOT_EXISTING_RESOURCE);a.push({resource:f,comparableResource:d})}return a}}return[]}resolveSnippetsNodeContent(t,e){return R(t)[e]||null}getExtensionsAssociatedResources(t,e){const n=this.extUri.joinPath(t,"extensions.json"),r=e?this.toUri({remote:!1,syncResource:s.Extensions,profile:e.id,location:void 0,collection:void 0,ref:void 0,node:void 0}):this.extUri.joinPath(t,o.NOT_EXISTING_RESOURCE);return[{resource:n,comparableResource:r}]}resolveExtensionsNodeContent(t,e){switch(e){case"extensions.json":return I(X(t),!0)}return null}async resolveLatestExtensionsContent(t){const{localExtensions:e}=await this.instantiationService.createInstance(W).getLocalExtensions(t);return I(e,!0)}getGlobalStateAssociatedResources(t,e){const n=this.extUri.joinPath(t,"globalState.json"),r=e?this.toUri({remote:!1,syncResource:s.GlobalState,profile:e.id,location:void 0,collection:void 0,ref:void 0,node:void 0}):this.extUri.joinPath(t,o.NOT_EXISTING_RESOURCE);return[{resource:n,comparableResource:r}]}resolveGlobalStateNodeContent(t,e){switch(e){case"globalState.json":return v(JSON.parse(t.content),!0)}return null}async resolveLatestGlobalStateContent(t){const e=await this.instantiationService.createInstance(Y).getLocalGlobalState(t);return v(e,!0)}getProfilesAssociatedResources(t,e){const n=this.extUri.joinPath(t,"profiles.json"),r=this.toUri({remote:!1,syncResource:s.Profiles,profile:this.userDataProfilesService.defaultProfile.id,location:void 0,collection:void 0,ref:void 0,node:void 0});return[{resource:n,comparableResource:r}]}resolveProfileNodeContent(t,e){switch(e){case"profiles.json":return q(JSON.parse(t.content),{})}return null}async resolveLatestProfilesContent(t){return $(this.userDataProfilesService.profiles.filter(e=>!e.isDefault&&!e.isTransient),!0)}toUri(t){const e=t.remote?o.REMOTE_BACKUP_AUTHORITY:o.LOCAL_BACKUP_AUTHORITY,n=[];return t.location&&(n.push(`scheme:${t.location.scheme}`),n.push(`authority:${t.location.authority}`),n.push(J(t.location.path,"/"))),n.push(`syncResource:${t.syncResource}`),n.push(`profile:${t.profile}`),t.collection&&n.push(`collection:${t.collection}`),t.ref&&n.push(`ref:${t.ref}`),t.node&&n.push(t.node),this.extUri.joinPath(g.from({scheme:m,authority:e,path:"/",query:t.location?.query,fragment:t.location?.fragment}),...n)}resolveUri(t){if(t.scheme!==m)return;const e=[];for(;t.path!=="/";)e.unshift(this.extUri.basename(t)),t=this.extUri.dirname(t);if(e.length<2)return;const n=t.authority===o.REMOTE_BACKUP_AUTHORITY;let r,i;const a=[];let u,f,d,h,p;for(;e.length;){const c=e.shift();c.startsWith("scheme:")?r=c.substring(7):c.startsWith("authority:")?i=c.substring(10):c.startsWith("syncResource:")?u=c.substring(13):c.startsWith("profile:")?f=c.substring(8):c.startsWith("collection:")?d=c.substring(11):c.startsWith("ref:")?h=c.substring(4):u?p=c:a.push(c)}return{remote:n,syncResource:u,profile:f,collection:d,ref:h,node:p,location:r&&i!==void 0?this.extUri.joinPath(g.from({scheme:r,authority:i,query:t.query,fragment:t.fragment,path:"/"}),...a):void 0}}parseSyncData(t,e){try{const n=JSON.parse(t);if(k(n))return n}catch(n){this.logService.error(n)}throw new j(C("incompatible sync data","Cannot parse sync data as it is not compatible with the current version."),w.IncompatibleRemoteContent,e)}async getUserData(t,e,n){const r=await this.userDataSyncStoreService.resolveResourceContent(t,e,n);return{ref:e,content:r}}};o=y([l(0,O),l(1,A),l(2,L),l(3,T),l(4,b),l(5,N),l(6,E),l(7,_),l(8,M),l(9,B)],o);export{o as UserDataSyncResourceProviderService};
