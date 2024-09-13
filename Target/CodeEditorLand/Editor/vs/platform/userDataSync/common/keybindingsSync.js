var T=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var w=(l,e,t,i)=>{for(var r=i>1?void 0:i?q(e,t):e,o=l.length-1,n;o>=0;o--)(n=l[o])&&(r=(i?n(e,t,r):n(r))||r);return i&&r&&T(e,t,r),r},s=(l,e)=>(t,i)=>e(t,i,l);import{isNonEmptyArray as L}from"../../../base/common/arrays.js";import{VSBuffer as z}from"../../../base/common/buffer.js";import{Event as j}from"../../../base/common/event.js";import{parse as P}from"../../../base/common/json.js";import{OS as D,OperatingSystem as d}from"../../../base/common/platform.js";import{isUndefined as v}from"../../../base/common/types.js";import{localize as k}from"../../../nls.js";import{IConfigurationService as J}from"../../configuration/common/configuration.js";import{IEnvironmentService as E}from"../../environment/common/environment.js";import{FileOperationResult as F,IFileService as x}from"../../files/common/files.js";import{IStorageService as N}from"../../storage/common/storage.js";import{ITelemetryService as Y}from"../../telemetry/common/telemetry.js";import{IUriIdentityService as O}from"../../uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as B}from"../../userDataProfile/common/userDataProfile.js";import{AbstractInitializer as G,AbstractJsonFileSynchroniser as V}from"./abstractSynchronizer.js";import{merge as M}from"./keybindingsMerge.js";import{CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM as W,Change as a,IUserDataSyncEnablementService as H,IUserDataSyncLocalStoreService as Q,IUserDataSyncLogService as K,IUserDataSyncStoreService as X,IUserDataSyncUtilService as Z,SyncResource as _,USER_DATA_SYNC_SCHEME as R,UserDataSyncError as A,UserDataSyncErrorCode as $}from"./userDataSync.js";function U(l,e,t){try{const i=JSON.parse(l);if(!e)return v(i.all)?null:i.all;switch(D){case d.Macintosh:return v(i.mac)?null:i.mac;case d.Linux:return v(i.linux)?null:i.linux;case d.Windows:return v(i.windows)?null:i.windows}}catch(i){return t.error(i),null}}let C=class extends V{version=2;previewResource=this.extUri.joinPath(this.syncPreviewFolder,"keybindings.json");baseResource=this.previewResource.with({scheme:R,authority:"base"});localResource=this.previewResource.with({scheme:R,authority:"local"});remoteResource=this.previewResource.with({scheme:R,authority:"remote"});acceptedResource=this.previewResource.with({scheme:R,authority:"accepted"});constructor(e,t,i,r,o,n,c,h,u,S,f,g,m){super(e.keybindingsResource,{syncResource:_.Keybindings,profile:e},t,h,u,S,i,r,c,g,o,f,n,m),this._register(j.filter(n.onDidChangeConfiguration,b=>b.affectsConfiguration("settingsSync.keybindingsPerPlatform"))(()=>this.triggerLocalChange()))}async generateSyncPreview(e,t,i,r){const o=e.syncData?U(e.syncData.content,r.keybindingsPerPlatform??this.syncKeybindingsPerPlatform(),this.logService):null;t=t===null&&i?e:t;const n=t?this.getKeybindingsContentFromLastSyncUserData(t):null,c=await this.getLocalFileContent(),h=await this.getFormattingOptions();let u=null,S=!1,f=!1,g=!1;if(o){let y=c?c.value.toString():"[]";if(y=y||"[]",this.hasErrors(y,!0))throw new A(k("errorInvalidSettings","Unable to sync keybindings because the content in the file is not valid. Please open the file and correct it."),$.LocalInvalidContent,this.resource);if(!n||n!==y||n!==o){this.logService.trace(`${this.syncResourceLogLabel}: Merging remote keybindings with local keybindings...`);const p=await M(y,o,n,h,this.userDataSyncUtilService);p.hasChanges&&(u=p.mergeContent,g=p.hasConflicts,S=g||p.mergeContent!==y,f=g||p.mergeContent!==o)}}else c&&(this.logService.trace(`${this.syncResourceLogLabel}: Remote keybindings does not exist. Synchronizing keybindings for the first time.`),u=c.value.toString(),f=!0);const m={content:g?n:u,localChange:S?c?a.Modified:a.Added:a.None,remoteChange:f?a.Modified:a.None,hasConflicts:g},b=c?c.value.toString():null;return[{fileContent:c,baseResource:this.baseResource,baseContent:n,localResource:this.localResource,localContent:b,localChange:m.localChange,remoteResource:this.remoteResource,remoteContent:o,remoteChange:m.remoteChange,previewResource:this.previewResource,previewResult:m,acceptedResource:this.acceptedResource}]}async hasRemoteChanged(e){const t=this.getKeybindingsContentFromLastSyncUserData(e);if(t===null)return!0;const i=await this.getLocalFileContent(),r=i?i.value.toString():"",o=await this.getFormattingOptions(),n=await M(r||"[]",t,t,o,this.userDataSyncUtilService);return n.hasConflicts||n.mergeContent!==t}async getMergeResult(e,t){return e.previewResult}async getAcceptResult(e,t,i,r){if(this.extUri.isEqual(t,this.localResource))return{content:e.fileContent?e.fileContent.value.toString():null,localChange:a.None,remoteChange:a.Modified};if(this.extUri.isEqual(t,this.remoteResource))return{content:e.remoteContent,localChange:a.Modified,remoteChange:a.None};if(this.extUri.isEqual(t,this.previewResource))return i===void 0?{content:e.previewResult.content,localChange:e.previewResult.localChange,remoteChange:e.previewResult.remoteChange}:{content:i,localChange:a.Modified,remoteChange:a.Modified};throw new Error(`Invalid Resource: ${t.toString()}`)}async applyResult(e,t,i,r){const{fileContent:o}=i[0][0];let{content:n,localChange:c,remoteChange:h}=i[0][1];if(c===a.None&&h===a.None&&this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing keybindings.`),n!==null&&(n=n.trim(),n=n||"[]",this.hasErrors(n,!0)))throw new A(k("errorInvalidSettings","Unable to sync keybindings because the content in the file is not valid. Please open the file and correct it."),$.LocalInvalidContent,this.resource);if(c!==a.None&&(this.logService.trace(`${this.syncResourceLogLabel}: Updating local keybindings...`),o&&await this.backupLocal(this.toSyncContent(o.value.toString())),await this.updateLocalFileContent(n||"[]",o,r),this.logService.info(`${this.syncResourceLogLabel}: Updated local keybindings`)),h!==a.None){this.logService.trace(`${this.syncResourceLogLabel}: Updating remote keybindings...`);const u=this.toSyncContent(n||"[]",e.syncData?.content);e=await this.updateRemoteUserData(u,r?null:e.ref),this.logService.info(`${this.syncResourceLogLabel}: Updated remote keybindings`)}try{await this.fileService.del(this.previewResource)}catch{}t?.ref!==e.ref&&(this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized keybindings...`),await this.updateLastSyncUserData(e,{platformSpecific:this.syncKeybindingsPerPlatform()}),this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized keybindings`))}async hasLocalData(){try{const e=await this.getLocalFileContent();if(e){const t=P(e.value.toString());if(L(t))return!0}}catch(e){if(e.fileOperationResult!==F.FILE_NOT_FOUND)return!0}return!1}async resolveContent(e){return this.extUri.isEqual(this.remoteResource,e)||this.extUri.isEqual(this.baseResource,e)||this.extUri.isEqual(this.localResource,e)||this.extUri.isEqual(this.acceptedResource,e)?this.resolvePreviewContent(e):null}getKeybindingsContentFromLastSyncUserData(e){return!e.syncData||e.platformSpecific!==void 0&&e.platformSpecific!==this.syncKeybindingsPerPlatform()?null:U(e.syncData.content,this.syncKeybindingsPerPlatform(),this.logService)}toSyncContent(e,t){let i={};try{i=JSON.parse(t||"{}")}catch(r){this.logService.error(r)}switch(this.syncKeybindingsPerPlatform()?delete i.all:i.all=e,D){case d.Macintosh:i.mac=e;break;case d.Linux:i.linux=e;break;case d.Windows:i.windows=e;break}return JSON.stringify(i)}syncKeybindingsPerPlatform(){return!!this.configurationService.getValue(W)}};C=w([s(2,X),s(3,Q),s(4,K),s(5,J),s(6,H),s(7,x),s(8,E),s(9,N),s(10,Z),s(11,Y),s(12,O)],C);let I=class extends G{constructor(e,t,i,r,o,n){super(_.Keybindings,t,i,r,e,o,n)}async doInitialize(e){const t=e.syncData?this.getKeybindingsContentFromSyncContent(e.syncData.content):null;if(!t){this.logService.info("Skipping initializing keybindings because remote keybindings does not exist.");return}if(!await this.isEmpty()){this.logService.info("Skipping initializing keybindings because local keybindings exist.");return}await this.fileService.writeFile(this.userDataProfilesService.defaultProfile.keybindingsResource,z.fromString(t)),await this.updateLastSyncUserData(e)}async isEmpty(){try{const e=await this.fileService.readFile(this.userDataProfilesService.defaultProfile.settingsResource),t=P(e.value.toString());return!L(t)}catch(e){return e.fileOperationResult===F.FILE_NOT_FOUND}}getKeybindingsContentFromSyncContent(e){try{return U(e,!0,this.logService)}catch(t){return this.logService.error(t),null}}};I=w([s(0,x),s(1,B),s(2,E),s(3,K),s(4,N),s(5,O)],I);export{I as KeybindingsInitializer,C as KeybindingsSynchroniser,U as getKeybindingsContentFromSyncContent};
