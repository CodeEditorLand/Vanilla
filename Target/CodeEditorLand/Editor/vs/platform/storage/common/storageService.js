import{Promises as n}from"../../../base/common/async.js";import{DisposableStore as l}from"../../../base/common/lifecycle.js";import{Schemas as o}from"../../../base/common/network.js";import{joinPath as p}from"../../../base/common/resources.js";import{Storage as s}from"../../../base/parts/storage/common/storage.js";import"../../environment/common/environment.js";import"../../ipc/common/services.js";import{isUserDataProfile as c}from"../../userDataProfile/common/userDataProfile.js";import"../../workspace/common/workspace.js";import{AbstractStorageService as g,isProfileUsingDefaultStorage as S,StorageScope as i,WillSaveStateReason as h}from"./storage.js";import{ApplicationStorageDatabaseClient as f,ProfileStorageDatabaseClient as d,WorkspaceStorageDatabaseClient as m}from"./storageIpc.js";class F extends g{constructor(e,t,r,a){super();this.initialWorkspace=e;this.initialProfiles=t;this.remoteService=r;this.environmentService=a}applicationStorageProfile=this.initialProfiles.defaultProfile;applicationStorage=this.createApplicationStorage();profileStorageProfile=this.initialProfiles.currentProfile;profileStorageDisposables=this._register(new l);profileStorage=this.createProfileStorage(this.profileStorageProfile);workspaceStorageId=this.initialWorkspace?.id;workspaceStorageDisposables=this._register(new l);workspaceStorage=this.createWorkspaceStorage(this.initialWorkspace);createApplicationStorage(){const e=this._register(new f(this.remoteService.getChannel("storage"))),t=this._register(new s(e));return this._register(t.onDidChangeStorage(r=>this.emitDidChangeValue(i.APPLICATION,r))),t}createProfileStorage(e){this.profileStorageDisposables.clear(),this.profileStorageProfile=e;let t;if(S(e))t=this.applicationStorage;else{const r=this.profileStorageDisposables.add(new d(this.remoteService.getChannel("storage"),e));t=this.profileStorageDisposables.add(new s(r))}return this.profileStorageDisposables.add(t.onDidChangeStorage(r=>this.emitDidChangeValue(i.PROFILE,r))),t}createWorkspaceStorage(e){this.workspaceStorageDisposables.clear(),this.workspaceStorageId=e?.id;let t;if(e){const r=this.workspaceStorageDisposables.add(new m(this.remoteService.getChannel("storage"),e));t=this.workspaceStorageDisposables.add(new s(r)),this.workspaceStorageDisposables.add(t.onDidChangeStorage(a=>this.emitDidChangeValue(i.WORKSPACE,a)))}return t}async doInitialize(){await n.settled([this.applicationStorage.init(),this.profileStorage.init(),this.workspaceStorage?.init()??Promise.resolve()])}getStorage(e){switch(e){case i.APPLICATION:return this.applicationStorage;case i.PROFILE:return this.profileStorage;default:return this.workspaceStorage}}getLogDetails(e){switch(e){case i.APPLICATION:return this.applicationStorageProfile.globalStorageHome.with({scheme:o.file}).fsPath;case i.PROFILE:return this.profileStorageProfile?.globalStorageHome.with({scheme:o.file}).fsPath;default:return this.workspaceStorageId?`${p(this.environmentService.workspaceStorageHome,this.workspaceStorageId,"state.vscdb").with({scheme:o.file}).fsPath}`:void 0}}async close(){this.stopFlushWhenIdle(),this.emitWillSaveState(h.SHUTDOWN),await n.settled([this.applicationStorage.close(),this.profileStorage.close(),this.workspaceStorage?.close()??Promise.resolve()])}async switchToProfile(e){if(!this.canSwitchProfile(this.profileStorageProfile,e))return;const t=this.profileStorage,r=t.items;t!==this.applicationStorage&&await t.close(),this.profileStorage=this.createProfileStorage(e),await this.profileStorage.init(),this.switchData(r,this.profileStorage,i.PROFILE)}async switchToWorkspace(e,t){const r=this.workspaceStorage,a=r?.items??new Map;await r?.close(),this.workspaceStorage=this.createWorkspaceStorage(e),await this.workspaceStorage.init(),this.switchData(a,this.workspaceStorage,i.WORKSPACE)}hasScope(e){return c(e)?this.profileStorageProfile.id===e.id:this.workspaceStorageId===e.id}}export{F as RemoteStorageService};
