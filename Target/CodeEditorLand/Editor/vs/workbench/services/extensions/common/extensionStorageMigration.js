import{getErrorMessage as F}from"../../../../base/common/errors.js";import{IEnvironmentService as L}from"../../../../platform/environment/common/environment.js";import{IExtensionStorageService as k}from"../../../../platform/extensionManagement/common/extensionStorage.js";import{FileSystemProviderErrorCode as U,IFileService as h}from"../../../../platform/files/common/files.js";import{ILogService as M}from"../../../../platform/log/common/log.js";import{IStorageService as j,StorageScope as l,StorageTarget as K}from"../../../../platform/storage/common/storage.js";import{IUriIdentityService as R}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as H}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{IWorkspaceContextService as W}from"../../../../platform/workspace/common/workspace.js";async function z(e,r,t,y){return y.invokeFunction(async o=>{const w=o.get(L),P=o.get(H),n=o.get(k),g=o.get(j),S=o.get(R),$=o.get(h),C=o.get(W),m=o.get(M),c=`extensionStorage.migrate.${e}-${r}`,f=e.toLowerCase()===r.toLowerCase()?`extension.storage.migrateFromLowerCaseKey.${e.toLowerCase()}`:void 0;if(e===r)return;const p=(i,a)=>a?S.extUri.joinPath(P.defaultProfile.globalStorageHome,i.toLowerCase()):S.extUri.joinPath(w.workspaceStorageHome,C.getWorkspace().id,i),s=t?l.PROFILE:l.WORKSPACE;if(!g.getBoolean(c,s,!1)&&!(f&&g.getBoolean(f,s,!1))){m.info(`Migrating ${t?"global":"workspace"} extension storage from ${e} to ${r}...`);const i=n.getExtensionState(e,t);i&&(n.setExtensionState(r,i,t),n.setExtensionState(e,void 0,t));const a=p(e,t),v=p(r,t);if(!S.extUri.isEqual(a,v))try{await $.move(a,v,!0)}catch(u){u.code!==U.FileNotFound&&m.info(`Error while migrating ${t?"global":"workspace"} file storage from '${e}' to '${r}'`,F(u))}m.info(`Migrated ${t?"global":"workspace"} extension storage from ${e} to ${r}`),g.store(c,!0,s,K.MACHINE)}})}export{z as migrateExtensionStorage};
