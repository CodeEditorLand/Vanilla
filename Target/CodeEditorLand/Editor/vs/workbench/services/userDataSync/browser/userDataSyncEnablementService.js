import{InstantiationType as n,registerSingleton as r}from"../../../../../vs/platform/instantiation/common/extensions.js";import{IUserDataSyncEnablementService as t,SyncResource as i}from"../../../../../vs/platform/userDataSync/common/userDataSync.js";import{UserDataSyncEnablementService as o}from"../../../../../vs/platform/userDataSync/common/userDataSyncEnablementService.js";import"../../../../../vs/workbench/services/environment/browser/environmentService.js";class s extends o{get workbenchEnvironmentService(){return this.environmentService}getResourceSyncStateVersion(e){return e===i.Extensions?this.workbenchEnvironmentService.options?.settingsSyncOptions?.extensionsSyncStateVersion:void 0}}r(t,s,n.Delayed);export{s as UserDataSyncEnablementService};
