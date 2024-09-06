var G=Object.defineProperty;var Y=Object.getOwnPropertyDescriptor;var U=(o,u,e,t)=>{for(var r=t>1?void 0:t?Y(u,e):u,s=o.length-1,i;s>=0;s--)(i=o[s])&&(r=(t?i(u,e,r):i(r))||r);return t&&r&&G(u,e,r),r},n=(o,u)=>(e,t)=>u(e,t,o);import{equals as W}from"../../../../vs/base/common/arrays.js";import{createCancelablePromise as B,ThrottledDelayer as Q}from"../../../../vs/base/common/async.js";import{VSBuffer as p}from"../../../../vs/base/common/buffer.js";import{CancellationToken as I}from"../../../../vs/base/common/cancellation.js";import"../../../../vs/base/common/collections.js";import{Emitter as A}from"../../../../vs/base/common/event.js";import{parse as X}from"../../../../vs/base/common/json.js";import"../../../../vs/base/common/jsonFormatter.js";import{Disposable as Z}from"../../../../vs/base/common/lifecycle.js";import"../../../../vs/base/common/resources.js";import{uppercaseFirstLetter as ee}from"../../../../vs/base/common/strings.js";import{isUndefined as te}from"../../../../vs/base/common/types.js";import"../../../../vs/base/common/uri.js";import"../../../../vs/base/parts/request/common/request.js";import{localize as K}from"../../../../vs/nls.js";import{IConfigurationService as M}from"../../../../vs/platform/configuration/common/configuration.js";import{IEnvironmentService as b}from"../../../../vs/platform/environment/common/environment.js";import{getServiceMachineId as re}from"../../../../vs/platform/externalServices/common/serviceMachineId.js";import{FileOperationError as C,FileOperationResult as R,IFileService as F,toFileOperationResult as se}from"../../../../vs/platform/files/common/files.js";import{ILogService as ie}from"../../../../vs/platform/log/common/log.js";import{IStorageService as E,StorageScope as w,StorageTarget as T}from"../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as H}from"../../../../vs/platform/telemetry/common/telemetry.js";import{IUriIdentityService as O}from"../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as ae}from"../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{Change as D,getLastSyncResourceUri as j,getPathSegments as ne,IUserDataSyncEnablementService as k,IUserDataSyncLocalStoreService as z,IUserDataSyncLogService as J,IUserDataSyncStoreService as q,IUserDataSyncUtilService as oe,MergeState as S,PREVIEW_DIR_NAME as ce,SyncStatus as y,USER_DATA_SYNC_CONFIGURATION_SCOPE as le,USER_DATA_SYNC_SCHEME as ue,UserDataSyncError as v,UserDataSyncErrorCode as m}from"../../../../vs/platform/userDataSync/common/userDataSync.js";function ye(o){return!!(o&&o.ref!==void 0&&typeof o.ref=="string"&&o.ref!==""&&o.syncData!==void 0&&(o.syncData===null||V(o.syncData)))}function V(o){return!!(o&&o.version!==void 0&&typeof o.version=="number"&&o.content!==void 0&&typeof o.content=="string"&&(Object.keys(o).length===2||Object.keys(o).length===3&&o.machineId!==void 0&&typeof o.machineId=="string"))}function he(o,u){return`${ee(o)}${u.isDefault?"":` (${u.name})`}`}let P=class extends Z{constructor(e,t,r,s,i,a,h,l,c,g,d,f){super();this.syncResource=e;this.collection=t;this.fileService=r;this.environmentService=s;this.storageService=i;this.userDataSyncStoreService=a;this.userDataSyncLocalStoreService=h;this.userDataSyncEnablementService=l;this.telemetryService=c;this.logService=g;this.configurationService=d;this.syncResourceLogLabel=he(e.syncResource,e.profile),this.extUri=f.extUri,this.syncFolder=this.extUri.joinPath(s.userDataSyncHome,...ne(e.profile.isDefault?void 0:e.profile.id,e.syncResource)),this.syncPreviewFolder=this.extUri.joinPath(this.syncFolder,ce),this.lastSyncResource=j(e.profile.isDefault?void 0:e.profile.id,e.syncResource,s,this.extUri),this.currentMachineIdPromise=re(s,r,i)}syncPreviewPromise=null;syncFolder;syncPreviewFolder;extUri;currentMachineIdPromise;_status=y.Idle;get status(){return this._status}_onDidChangStatus=this._register(new A);onDidChangeStatus=this._onDidChangStatus.event;_conflicts=[];get conflicts(){return{...this.syncResource,conflicts:this._conflicts}}_onDidChangeConflicts=this._register(new A);onDidChangeConflicts=this._onDidChangeConflicts.event;localChangeTriggerThrottler=this._register(new Q(50));_onDidChangeLocal=this._register(new A);onDidChangeLocal=this._onDidChangeLocal.event;lastSyncResource;lastSyncUserDataStateKey=`${this.collection?`${this.collection}.`:""}${this.syncResource.syncResource}.lastSyncUserData`;hasSyncResourceStateVersionChanged=!1;syncResourceLogLabel;syncHeaders={};resource=this.syncResource.syncResource;triggerLocalChange(){this.localChangeTriggerThrottler.trigger(()=>this.doTriggerLocalChange())}async doTriggerLocalChange(){if(this.status===y.HasConflicts){this.logService.info(`${this.syncResourceLogLabel}: In conflicts state and local change detected. Syncing again...`);const e=await this.syncPreviewPromise;this.syncPreviewPromise=null;const t=await this.performSync(e.remoteUserData,e.lastSyncUserData,!0,this.getUserDataSyncConfiguration());this.setStatus(t)}else{this.logService.trace(`${this.syncResourceLogLabel}: Checking for local changes...`);const e=await this.getLastSyncUserData();(e?await this.hasRemoteChanged(e):!0)&&this._onDidChangeLocal.fire()}}setStatus(e){this._status!==e&&(this._status=e,this._onDidChangStatus.fire(e))}async sync(e,t={}){await this._sync(e,!0,this.getUserDataSyncConfiguration(),t)}async preview(e,t,r={}){return this._sync(e,!1,t,r)}async apply(e,t={}){try{this.syncHeaders={...t};const r=await this.doApply(e);return this.setStatus(r),this.syncPreviewPromise}finally{this.syncHeaders={}}}async _sync(e,t,r,s){try{if(this.syncHeaders={...s},this.status===y.HasConflicts)return this.logService.info(`${this.syncResourceLogLabel}: Skipped synchronizing ${this.resource.toLowerCase()} as there are conflicts.`),this.syncPreviewPromise;if(this.status===y.Syncing)return this.logService.info(`${this.syncResourceLogLabel}: Skipped synchronizing ${this.resource.toLowerCase()} as it is running already.`),this.syncPreviewPromise;this.logService.trace(`${this.syncResourceLogLabel}: Started synchronizing ${this.resource.toLowerCase()}...`),this.setStatus(y.Syncing);let i=y.Idle;try{const a=await this.getLastSyncUserData(),h=await this.getLatestRemoteUserData(e,a);return i=await this.performSync(h,a,t,r),i===y.HasConflicts?this.logService.info(`${this.syncResourceLogLabel}: Detected conflicts while synchronizing ${this.resource.toLowerCase()}.`):i===y.Idle&&this.logService.trace(`${this.syncResourceLogLabel}: Finished synchronizing ${this.resource.toLowerCase()}.`),this.syncPreviewPromise||null}finally{this.setStatus(i)}}finally{this.syncHeaders={}}}async replace(e){const t=this.parseSyncData(e);if(!t)return!1;await this.stop();try{this.logService.trace(`${this.syncResourceLogLabel}: Started resetting ${this.resource.toLowerCase()}...`),this.setStatus(y.Syncing);const r=await this.getLastSyncUserData(),s=await this.getLatestRemoteUserData(null,r),i=await this.isRemoteDataFromCurrentMachine(s),a=await this.generateSyncPreview({ref:s.ref,syncData:t},r,i,this.getUserDataSyncConfiguration(),I.None),h=[];for(const l of a){const c=await this.getAcceptResult(l,l.remoteResource,void 0,I.None),{remoteChange:g}=await this.getAcceptResult(l,l.previewResource,l.remoteContent,I.None);h.push([l,{...c,remoteChange:g!==D.None?g:D.Modified}])}await this.applyResult(s,r,h,!1),this.logService.info(`${this.syncResourceLogLabel}: Finished resetting ${this.resource.toLowerCase()}.`)}finally{this.setStatus(y.Idle)}return!0}async isRemoteDataFromCurrentMachine(e){const t=await this.currentMachineIdPromise;return!!e.syncData?.machineId&&e.syncData.machineId===t}async getLatestRemoteUserData(e,t){if(t){const r=e?e[this.resource]:void 0;if(t.ref===r||r===void 0&&t.syncData===null)return t}return this.getRemoteUserData(t)}async performSync(e,t,r,s){if(e.syncData&&e.syncData.version>this.version)throw this.telemetryService.publicLog2("sync/incompatible",{source:this.resource}),new v(K({key:"incompatible",comment:["This is an error while syncing a resource that its local version is not compatible with its remote version."]},"Cannot sync {0} as its local version {1} is not compatible with its remote version {2}",this.resource,this.version,e.syncData.version),m.IncompatibleLocalContent,this.resource);try{return await this.doSync(e,t,r,s)}catch(i){if(i instanceof v)switch(i.code){case m.LocalPreconditionFailed:return this.logService.info(`${this.syncResourceLogLabel}: Failed to synchronize ${this.syncResourceLogLabel} as there is a new local version available. Synchronizing again...`),this.performSync(e,t,r,s);case m.Conflict:case m.PreconditionFailed:return this.logService.info(`${this.syncResourceLogLabel}: Failed to synchronize as there is a new remote version available. Synchronizing again...`),e=await this.getRemoteUserData(null),t=await this.getLastSyncUserData(),this.performSync(e,t,r,s)}throw i}}async doSync(e,t,r,s){try{const i=await this.isRemoteDataFromCurrentMachine(e),a=!i&&t===null&&this.getStoredLastSyncUserDataStateContent()!==void 0,h=r&&!a;this.syncPreviewPromise||(this.syncPreviewPromise=B(c=>this.doGenerateSyncResourcePreview(e,t,i,h,s,c)));let l=await this.syncPreviewPromise;if(r&&a){this.logService.info(`${this.syncResourceLogLabel}: Accepting remote because it was synced before and the last sync data is not available.`);for(const c of l.resourcePreviews)l=await this.accept(c.remoteResource)||l}return this.updateConflicts(l.resourcePreviews),l.resourcePreviews.some(({mergeState:c})=>c===S.Conflict)?y.HasConflicts:r?await this.doApply(!1):y.Syncing}catch(i){throw this.syncPreviewPromise=null,i}}async merge(e){return await this.updateSyncResourcePreview(e,async t=>{const r=await this.getMergeResult(t,I.None);await this.fileService.writeFile(t.previewResource,p.fromString(r?.content||""));const s=r&&!r.hasConflicts?await this.getAcceptResult(t,t.previewResource,void 0,I.None):void 0;return t.acceptResult=s,t.mergeState=r.hasConflicts?S.Conflict:s?S.Accepted:S.Preview,t.localChange=s?s.localChange:r.localChange,t.remoteChange=s?s.remoteChange:r.remoteChange,t}),this.syncPreviewPromise}async accept(e,t){return await this.updateSyncResourcePreview(e,async r=>{const s=await this.getAcceptResult(r,e,t,I.None);return r.acceptResult=s,r.mergeState=S.Accepted,r.localChange=s.localChange,r.remoteChange=s.remoteChange,r}),this.syncPreviewPromise}async discard(e){return await this.updateSyncResourcePreview(e,async t=>{const r=await this.getMergeResult(t,I.None);return await this.fileService.writeFile(t.previewResource,p.fromString(r.content||"")),t.acceptResult=void 0,t.mergeState=S.Preview,t.localChange=r.localChange,t.remoteChange=r.remoteChange,t}),this.syncPreviewPromise}async updateSyncResourcePreview(e,t){if(!this.syncPreviewPromise)return;let r=await this.syncPreviewPromise;const s=r.resourcePreviews.findIndex(({localResource:i,remoteResource:a,previewResource:h})=>this.extUri.isEqual(i,e)||this.extUri.isEqual(a,e)||this.extUri.isEqual(h,e));s!==-1&&(this.syncPreviewPromise=B(async i=>{const a=[...r.resourcePreviews];return a[s]=await t(a[s]),{...r,resourcePreviews:a}}),r=await this.syncPreviewPromise,this.updateConflicts(r.resourcePreviews),r.resourcePreviews.some(({mergeState:i})=>i===S.Conflict)?this.setStatus(y.HasConflicts):this.setStatus(y.Syncing))}async doApply(e){if(!this.syncPreviewPromise)return y.Idle;const t=await this.syncPreviewPromise;return t.resourcePreviews.some(({mergeState:r})=>r===S.Conflict)?y.HasConflicts:t.resourcePreviews.some(({mergeState:r})=>r!==S.Accepted)?y.Syncing:(await this.applyResult(t.remoteUserData,t.lastSyncUserData,t.resourcePreviews.map(r=>[r,r.acceptResult]),e),this.syncPreviewPromise=null,await this.clearPreviewFolder(),y.Idle)}async clearPreviewFolder(){try{await this.fileService.del(this.syncPreviewFolder,{recursive:!0})}catch{}}updateConflicts(e){const t=e.filter(({mergeState:r})=>r===S.Conflict);W(this._conflicts,t,(r,s)=>this.extUri.isEqual(r.previewResource,s.previewResource))||(this._conflicts=t,this._onDidChangeConflicts.fire(this.conflicts))}async hasPreviouslySynced(){const e=await this.getLastSyncUserData();return!!e&&e.syncData!==null}async resolvePreviewContent(e){const t=this.syncPreviewPromise?await this.syncPreviewPromise:null;if(t)for(const r of t.resourcePreviews){if(this.extUri.isEqual(r.acceptedResource,e))return r.acceptResult?r.acceptResult.content:null;if(this.extUri.isEqual(r.remoteResource,e))return r.remoteContent;if(this.extUri.isEqual(r.localResource,e))return r.localContent;if(this.extUri.isEqual(r.baseResource,e))return r.baseContent}return null}async resetLocal(){this.storageService.remove(this.lastSyncUserDataStateKey,w.APPLICATION);try{await this.fileService.del(this.lastSyncResource)}catch(e){se(e)!==R.FILE_NOT_FOUND&&this.logService.error(e)}}async doGenerateSyncResourcePreview(e,t,r,s,i,a){const h=await this.generateSyncPreview(e,t,r,i,a),l=[];for(const c of h){const g=c.previewResource.with({scheme:ue,authority:"accepted"});if(c.localChange===D.None&&c.remoteChange===D.None)l.push({...c,acceptedResource:g,acceptResult:{content:null,localChange:D.None,remoteChange:D.None},mergeState:S.Accepted});else{const d=s?await this.getMergeResult(c,a):void 0;if(a.isCancellationRequested)break;await this.fileService.writeFile(c.previewResource,p.fromString(d?.content||""));const f=d&&!d.hasConflicts?await this.getAcceptResult(c,c.previewResource,void 0,a):void 0;l.push({...c,acceptResult:f,mergeState:d?.hasConflicts?S.Conflict:f?S.Accepted:S.Preview,localChange:f?f.localChange:d?d.localChange:c.localChange,remoteChange:f?f.remoteChange:d?d.remoteChange:c.remoteChange})}}return{syncResource:this.resource,profile:this.syncResource.profile,remoteUserData:e,lastSyncUserData:t,resourcePreviews:l,isLastSyncFromCurrentMachine:r}}async getLastSyncUserData(){let e=this.getStoredLastSyncUserDataStateContent();if(e||(e=await this.migrateLastSyncUserData()),!e)return this.logService.info(`${this.syncResourceLogLabel}: Last sync data state does not exist.`),null;const t=JSON.parse(e),r=this.userDataSyncEnablementService.getResourceSyncStateVersion(this.resource);if(this.hasSyncResourceStateVersionChanged=!!t.version&&!!r&&t.version!==r,this.hasSyncResourceStateVersionChanged)return this.logService.info(`${this.syncResourceLogLabel}: Reset last sync state because last sync state version ${t.version} is not compatible with current sync state version ${r}.`),await this.resetLocal(),null;let s,i=1;for(;s===void 0&&i++<6;)try{const a=await this.readLastSyncStoredRemoteUserData();a&&(a.ref===t.ref?s=a.syncData:this.logService.info(`${this.syncResourceLogLabel}: Last sync data stored locally is not same as the last sync state.`));break}catch(a){if(a instanceof C&&a.fileOperationResult===R.FILE_NOT_FOUND){this.logService.info(`${this.syncResourceLogLabel}: Last sync resource does not exist locally.`);break}else{if(a instanceof v)throw a;this.logService.error(a,i)}}if(s===void 0)try{const a=await this.userDataSyncStoreService.resolveResourceContent(this.resource,t.ref,this.collection,this.syncHeaders);s=a===null?null:this.parseSyncData(a),await this.writeLastSyncStoredRemoteUserData({ref:t.ref,syncData:s})}catch(a){if(a instanceof v&&a.code===m.NotFound)this.logService.info(`${this.syncResourceLogLabel}: Last sync resource does not exist remotely.`);else throw a}return s===void 0?null:{...t,syncData:s}}async updateLastSyncUserData(e,t={}){if(t.ref||t.version)throw new Error("Cannot have core properties as additional");const r=this.userDataSyncEnablementService.getResourceSyncStateVersion(this.resource),s={ref:e.ref,version:r,...t};this.storageService.store(this.lastSyncUserDataStateKey,JSON.stringify(s),w.APPLICATION,T.MACHINE),await this.writeLastSyncStoredRemoteUserData(e)}getStoredLastSyncUserDataStateContent(){return this.storageService.get(this.lastSyncUserDataStateKey,w.APPLICATION)}async readLastSyncStoredRemoteUserData(){const e=(await this.fileService.readFile(this.lastSyncResource)).value.toString();try{const t=e?JSON.parse(e):void 0;if(ye(t))return t}catch(t){this.logService.error(t)}}async writeLastSyncStoredRemoteUserData(e){await this.fileService.writeFile(this.lastSyncResource,p.fromString(JSON.stringify(e)))}async migrateLastSyncUserData(){try{const e=await this.fileService.readFile(this.lastSyncResource),t=JSON.parse(e.value.toString());await this.fileService.del(this.lastSyncResource),t.ref&&t.content!==void 0?(this.storageService.store(this.lastSyncUserDataStateKey,JSON.stringify({...t,content:void 0}),w.APPLICATION,T.MACHINE),await this.writeLastSyncStoredRemoteUserData({ref:t.ref,syncData:t.content===null?null:JSON.parse(t.content)})):this.logService.info(`${this.syncResourceLogLabel}: Migrating last sync user data. Invalid data.`,t)}catch(e){e instanceof C&&e.fileOperationResult===R.FILE_NOT_FOUND?this.logService.info(`${this.syncResourceLogLabel}: Migrating last sync user data. Resource does not exist.`):this.logService.error(e)}return this.storageService.get(this.lastSyncUserDataStateKey,w.APPLICATION)}async getRemoteUserData(e){const{ref:t,content:r}=await this.getUserData(e);let s=null;return r!==null&&(s=this.parseSyncData(r)),{ref:t,syncData:s}}parseSyncData(e){try{const t=JSON.parse(e);if(V(t))return t}catch(t){this.logService.error(t)}throw new v(K("incompatible sync data","Cannot parse sync data as it is not compatible with the current version."),m.IncompatibleRemoteContent,this.resource)}async getUserData(e){const t=e?{ref:e.ref,content:e.syncData?JSON.stringify(e.syncData):null}:null;return this.userDataSyncStoreService.readResource(this.resource,t,this.collection,this.syncHeaders)}async updateRemoteUserData(e,t){const r=await this.currentMachineIdPromise,s={version:this.version,machineId:r,content:e};try{return t=await this.userDataSyncStoreService.writeResource(this.resource,JSON.stringify(s),t,this.collection,this.syncHeaders),{ref:t,syncData:s}}catch(i){throw i instanceof v&&i.code===m.TooLarge&&(i=new v(i.message,i.code,this.resource)),i}}async backupLocal(e){const t={version:this.version,content:e};return this.userDataSyncLocalStoreService.writeResource(this.resource,JSON.stringify(t),new Date,this.syncResource.profile.isDefault?void 0:this.syncResource.profile.id)}async stop(){this.status!==y.Idle&&(this.logService.trace(`${this.syncResourceLogLabel}: Stopping synchronizing ${this.resource.toLowerCase()}.`),this.syncPreviewPromise&&(this.syncPreviewPromise.cancel(),this.syncPreviewPromise=null),this.updateConflicts([]),await this.clearPreviewFolder(),this.setStatus(y.Idle),this.logService.info(`${this.syncResourceLogLabel}: Stopped synchronizing ${this.resource.toLowerCase()}.`))}getUserDataSyncConfiguration(){return this.configurationService.getValue(le)}};P=U([n(2,F),n(3,b),n(4,E),n(5,q),n(6,z),n(7,k),n(8,H),n(9,J),n(10,M),n(11,O)],P);let L=class extends P{constructor(e,t,r,s,i,a,h,l,c,g,d,f,x){super(t,r,s,i,a,h,l,c,g,d,f,x);this.file=e;this._register(this.fileService.watch(this.extUri.dirname(e))),this._register(this.fileService.onDidFilesChange($=>this.onFileChanges($)))}async getLocalFileContent(){try{return await this.fileService.readFile(this.file)}catch{return null}}async updateLocalFileContent(e,t,r){try{t?await this.fileService.writeFile(this.file,p.fromString(e),r?void 0:t):await this.fileService.createFile(this.file,p.fromString(e),{overwrite:r})}catch(s){throw s instanceof C&&s.fileOperationResult===R.FILE_NOT_FOUND||s instanceof C&&s.fileOperationResult===R.FILE_MODIFIED_SINCE?new v(s.message,m.LocalPreconditionFailed):s}}async deleteLocalFile(){try{await this.fileService.del(this.file)}catch(e){if(!(e instanceof C&&e.fileOperationResult===R.FILE_NOT_FOUND))throw e}}onFileChanges(e){e.contains(this.file)&&this.triggerLocalChange()}};L=U([n(3,F),n(4,b),n(5,E),n(6,q),n(7,z),n(8,k),n(9,H),n(10,J),n(11,M),n(12,O)],L);let N=class extends L{constructor(e,t,r,s,i,a,h,l,c,g,d,f,x,$){super(e,t,r,s,i,a,h,l,c,g,d,x,$);this.userDataSyncUtilService=f}hasErrors(e,t){const r=[],s=X(e,r,{allowEmptyContent:!0,allowTrailingComma:!0});return r.length>0||!te(s)&&t!==Array.isArray(s)}_formattingOptions=void 0;getFormattingOptions(){return this._formattingOptions||(this._formattingOptions=this.userDataSyncUtilService.resolveFormattingOptions(this.file)),this._formattingOptions}};N=U([n(3,F),n(4,b),n(5,E),n(6,q),n(7,z),n(8,k),n(9,H),n(10,J),n(11,oe),n(12,M),n(13,O)],N);let _=class{constructor(u,e,t,r,s,i,a){this.resource=u;this.userDataProfilesService=e;this.environmentService=t;this.logService=r;this.fileService=s;this.storageService=i;this.extUri=a.extUri,this.lastSyncResource=j(void 0,this.resource,t,this.extUri)}extUri;lastSyncResource;async initialize({ref:u,content:e}){if(!e){this.logService.info("Remote content does not exist.",this.resource);return}const t=this.parseSyncData(e);if(t)try{await this.doInitialize({ref:u,syncData:t})}catch(r){this.logService.error(r)}}parseSyncData(u){try{const e=JSON.parse(u);if(V(e))return e}catch(e){this.logService.error(e)}this.logService.info("Cannot parse sync data as it is not compatible with the current version.",this.resource)}async updateLastSyncUserData(u,e={}){if(e.ref||e.version)throw new Error("Cannot have core properties as additional");const t={ref:u.ref,version:void 0,...e};this.storageService.store(`${this.resource}.lastSyncUserData`,JSON.stringify(t),w.APPLICATION,T.MACHINE),await this.fileService.writeFile(this.lastSyncResource,p.fromString(JSON.stringify(u)))}};_=U([n(1,ae),n(2,b),n(3,ie),n(4,F),n(5,E),n(6,O)],_);export{L as AbstractFileSynchroniser,_ as AbstractInitializer,N as AbstractJsonFileSynchroniser,P as AbstractSynchroniser,he as getSyncResourceLogLabel,ye as isRemoteUserData,V as isSyncData};