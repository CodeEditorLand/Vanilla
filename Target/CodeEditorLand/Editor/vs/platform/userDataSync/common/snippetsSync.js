var D=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var g=(p,t,i,o)=>{for(var n=o>1?void 0:o?j(t,i):t,s=p.length-1,e;s>=0;s--)(e=p[s])&&(n=(o?e(t,i,n):e(n))||n);return o&&n&&D(t,i,n),n},h=(p,t)=>(i,o)=>t(i,o,p);import{VSBuffer as v}from"../../../base/common/buffer.js";import{Event as L}from"../../../base/common/event.js";import{deepClone as k}from"../../../base/common/objects.js";import{IConfigurationService as O}from"../../configuration/common/configuration.js";import{IEnvironmentService as f}from"../../environment/common/environment.js";import{FileOperationError as N,FileOperationResult as w,IFileService as S}from"../../files/common/files.js";import{IStorageService as R}from"../../storage/common/storage.js";import{ITelemetryService as E}from"../../telemetry/common/telemetry.js";import{IUriIdentityService as P}from"../../uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as A}from"../../userDataProfile/common/userDataProfile.js";import{AbstractInitializer as M,AbstractSynchroniser as $}from"./abstractSynchronizer.js";import{areSame as _,merge as C}from"./snippetsMerge.js";import{Change as a,IUserDataSyncLocalStoreService as T,IUserDataSyncLogService as I,IUserDataSyncEnablementService as q,IUserDataSyncStoreService as z,SyncResource as U,USER_DATA_SYNC_SCHEME as c}from"./userDataSync.js";function H(p){return JSON.parse(p.content)}let m=class extends ${version=1;snippetsFolder;constructor(t,i,o,n,s,e,r,l,u,d,x,b){super({syncResource:U.Snippets,profile:t},i,n,o,s,e,r,d,x,l,u,b),this.snippetsFolder=t.snippetsHome,this._register(this.fileService.watch(o.userRoamingDataHome)),this._register(this.fileService.watch(this.snippetsFolder)),this._register(L.filter(this.fileService.onDidFilesChange,F=>F.affects(this.snippetsFolder))(()=>this.triggerLocalChange()))}async generateSyncPreview(t,i,o){const n=await this.getSnippetsFileContents(),s=this.toSnippetsContents(n),e=t.syncData?this.parseSnippets(t.syncData):null;i=i===null&&o?t:i;const r=i&&i.syncData?this.parseSnippets(i.syncData):null;e?this.logService.trace(`${this.syncResourceLogLabel}: Merging remote snippets with local snippets...`):this.logService.trace(`${this.syncResourceLogLabel}: Remote snippets does not exist. Synchronizing snippets for the first time.`);const l=C(s,e,r);return this.getResourcePreviews(l,n,e||{},r||{})}async hasRemoteChanged(t){const i=t.syncData?this.parseSnippets(t.syncData):null;if(i===null)return!0;const o=await this.getSnippetsFileContents(),n=this.toSnippetsContents(o),s=C(n,i,i);return Object.keys(s.remote.added).length>0||Object.keys(s.remote.updated).length>0||s.remote.removed.length>0||s.conflicts.length>0}async getMergeResult(t,i){return t.previewResult}async getAcceptResult(t,i,o,n){if(this.extUri.isEqualOrParent(i,this.syncPreviewFolder.with({scheme:c,authority:"local"})))return{content:t.fileContent?t.fileContent.value.toString():null,localChange:a.None,remoteChange:t.fileContent?t.remoteContent!==null?a.Modified:a.Added:a.Deleted};if(this.extUri.isEqualOrParent(i,this.syncPreviewFolder.with({scheme:c,authority:"remote"})))return{content:t.remoteContent,localChange:t.remoteContent!==null?t.fileContent?a.Modified:a.Added:a.Deleted,remoteChange:a.None};if(this.extUri.isEqualOrParent(i,this.syncPreviewFolder))return o===void 0?{content:t.previewResult.content,localChange:t.previewResult.localChange,remoteChange:t.previewResult.remoteChange}:{content:o,localChange:o===null?t.fileContent!==null?a.Deleted:a.None:a.Modified,remoteChange:o===null?t.remoteContent!==null?a.Deleted:a.None:a.Modified};throw new Error(`Invalid Resource: ${i.toString()}`)}async applyResult(t,i,o,n){const s=o.map(([e,r])=>({...e,acceptResult:r}));s.every(({localChange:e,remoteChange:r})=>e===a.None&&r===a.None)&&this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing snippets.`),s.some(({localChange:e})=>e!==a.None)&&(await this.updateLocalBackup(s),await this.updateLocalSnippets(s,n)),s.some(({remoteChange:e})=>e!==a.None)&&(t=await this.updateRemoteSnippets(s,t,n)),i?.ref!==t.ref&&(this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized snippets...`),await this.updateLastSyncUserData(t),this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized snippets`));for(const{previewResource:e}of s)try{await this.fileService.del(e)}catch{}}getResourcePreviews(t,i,o,n){const s=new Map;for(const e of Object.keys(t.local.added)){const r={content:t.local.added[e],hasConflicts:!1,localChange:a.Added,remoteChange:a.None};s.set(e,{baseResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"base"}),baseContent:null,fileContent:null,localResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"local"}),localContent:null,remoteResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"remote"}),remoteContent:o[e],previewResource:this.extUri.joinPath(this.syncPreviewFolder,e),previewResult:r,localChange:r.localChange,remoteChange:r.remoteChange,acceptedResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"accepted"})})}for(const e of Object.keys(t.local.updated)){const r={content:t.local.updated[e],hasConflicts:!1,localChange:a.Modified,remoteChange:a.None},l=i[e]?i[e].value.toString():null;s.set(e,{baseResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"base"}),baseContent:n[e]??null,localResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"local"}),fileContent:i[e],localContent:l,remoteResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"remote"}),remoteContent:o[e],previewResource:this.extUri.joinPath(this.syncPreviewFolder,e),previewResult:r,localChange:r.localChange,remoteChange:r.remoteChange,acceptedResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"accepted"})})}for(const e of t.local.removed){const r={content:null,hasConflicts:!1,localChange:a.Deleted,remoteChange:a.None},l=i[e]?i[e].value.toString():null;s.set(e,{baseResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"base"}),baseContent:n[e]??null,localResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"local"}),fileContent:i[e],localContent:l,remoteResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"remote"}),remoteContent:null,previewResource:this.extUri.joinPath(this.syncPreviewFolder,e),previewResult:r,localChange:r.localChange,remoteChange:r.remoteChange,acceptedResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"accepted"})})}for(const e of Object.keys(t.remote.added)){const r={content:t.remote.added[e],hasConflicts:!1,localChange:a.None,remoteChange:a.Added},l=i[e]?i[e].value.toString():null;s.set(e,{baseResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"base"}),baseContent:n[e]??null,localResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"local"}),fileContent:i[e],localContent:l,remoteResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"remote"}),remoteContent:null,previewResource:this.extUri.joinPath(this.syncPreviewFolder,e),previewResult:r,localChange:r.localChange,remoteChange:r.remoteChange,acceptedResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"accepted"})})}for(const e of Object.keys(t.remote.updated)){const r={content:t.remote.updated[e],hasConflicts:!1,localChange:a.None,remoteChange:a.Modified},l=i[e]?i[e].value.toString():null;s.set(e,{baseResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"base"}),baseContent:n[e]??null,localResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"local"}),fileContent:i[e],localContent:l,remoteResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"remote"}),remoteContent:o[e],previewResource:this.extUri.joinPath(this.syncPreviewFolder,e),previewResult:r,localChange:r.localChange,remoteChange:r.remoteChange,acceptedResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"accepted"})})}for(const e of t.remote.removed){const r={content:null,hasConflicts:!1,localChange:a.None,remoteChange:a.Deleted};s.set(e,{baseResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"base"}),baseContent:n[e]??null,localResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"local"}),fileContent:null,localContent:null,remoteResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"remote"}),remoteContent:o[e],previewResource:this.extUri.joinPath(this.syncPreviewFolder,e),previewResult:r,localChange:r.localChange,remoteChange:r.remoteChange,acceptedResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"accepted"})})}for(const e of t.conflicts){const r={content:n[e]??null,hasConflicts:!0,localChange:i[e]?a.Modified:a.Added,remoteChange:o[e]?a.Modified:a.Added},l=i[e]?i[e].value.toString():null;s.set(e,{baseResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"base"}),baseContent:n[e]??null,localResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"local"}),fileContent:i[e]||null,localContent:l,remoteResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"remote"}),remoteContent:o[e]||null,previewResource:this.extUri.joinPath(this.syncPreviewFolder,e),previewResult:r,localChange:r.localChange,remoteChange:r.remoteChange,acceptedResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"accepted"})})}for(const e of Object.keys(i))if(!s.has(e)){const r={content:i[e]?i[e].value.toString():null,hasConflicts:!1,localChange:a.None,remoteChange:a.None},l=i[e]?i[e].value.toString():null;s.set(e,{baseResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"base"}),baseContent:n[e]??null,localResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"local"}),fileContent:i[e]||null,localContent:l,remoteResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"remote"}),remoteContent:o[e]||null,previewResource:this.extUri.joinPath(this.syncPreviewFolder,e),previewResult:r,localChange:r.localChange,remoteChange:r.remoteChange,acceptedResource:this.extUri.joinPath(this.syncPreviewFolder,e).with({scheme:c,authority:"accepted"})})}return[...s.values()]}async resolveContent(t){return this.extUri.isEqualOrParent(t,this.syncPreviewFolder.with({scheme:c,authority:"remote"}))||this.extUri.isEqualOrParent(t,this.syncPreviewFolder.with({scheme:c,authority:"local"}))||this.extUri.isEqualOrParent(t,this.syncPreviewFolder.with({scheme:c,authority:"base"}))||this.extUri.isEqualOrParent(t,this.syncPreviewFolder.with({scheme:c,authority:"accepted"}))?this.resolvePreviewContent(t):null}async hasLocalData(){try{const t=await this.getSnippetsFileContents();if(Object.keys(t).length)return!0}catch{}return!1}async updateLocalBackup(t){const i={};for(const o of t)o.fileContent&&(i[this.extUri.basename(o.localResource)]=o.fileContent);await this.backupLocal(JSON.stringify(this.toSnippetsContents(i)))}async updateLocalSnippets(t,i){for(const{fileContent:o,acceptResult:n,localResource:s,remoteResource:e,localChange:r}of t)if(r!==a.None){const l=e?this.extUri.basename(e):this.extUri.basename(s),u=this.extUri.joinPath(this.snippetsFolder,l);r===a.Deleted?(this.logService.trace(`${this.syncResourceLogLabel}: Deleting snippet...`,this.extUri.basename(u)),await this.fileService.del(u),this.logService.info(`${this.syncResourceLogLabel}: Deleted snippet`,this.extUri.basename(u))):r===a.Added?(this.logService.trace(`${this.syncResourceLogLabel}: Creating snippet...`,this.extUri.basename(u)),await this.fileService.createFile(u,v.fromString(n.content),{overwrite:i}),this.logService.info(`${this.syncResourceLogLabel}: Created snippet`,this.extUri.basename(u))):(this.logService.trace(`${this.syncResourceLogLabel}: Updating snippet...`,this.extUri.basename(u)),await this.fileService.writeFile(u,v.fromString(n.content),i?void 0:o),this.logService.info(`${this.syncResourceLogLabel}: Updated snippet`,this.extUri.basename(u)))}}async updateRemoteSnippets(t,i,o){const n=i.syncData?this.parseSnippets(i.syncData):{},s=k(n);for(const{acceptResult:e,localResource:r,remoteResource:l,remoteChange:u}of t)if(u!==a.None){const d=r?this.extUri.basename(r):this.extUri.basename(l);u===a.Deleted?delete s[d]:s[d]=e.content}return _(n,s)||(this.logService.trace(`${this.syncResourceLogLabel}: Updating remote snippets...`),i=await this.updateRemoteUserData(JSON.stringify(s),o?null:i.ref),this.logService.info(`${this.syncResourceLogLabel}: Updated remote snippets`)),i}parseSnippets(t){return H(t)}toSnippetsContents(t){const i={};for(const o of Object.keys(t))i[o]=t[o].value.toString();return i}async getSnippetsFileContents(){const t={};let i;try{i=await this.fileService.resolve(this.snippetsFolder)}catch(o){if(o instanceof N&&o.fileOperationResult===w.FILE_NOT_FOUND)return t;throw o}for(const o of i.children||[]){const n=o.resource,s=this.extUri.extname(n);if(s===".json"||s===".code-snippets"){const e=this.extUri.relativePath(this.snippetsFolder,n),r=await this.fileService.readFile(n);t[e]=r}}return t}};m=g([h(2,f),h(3,S),h(4,R),h(5,z),h(6,T),h(7,I),h(8,O),h(9,q),h(10,E),h(11,P)],m);let y=class extends M{constructor(t,i,o,n,s,e){super(U.Snippets,i,o,n,t,s,e)}async doInitialize(t){const i=t.syncData?JSON.parse(t.syncData.content):null;if(!i){this.logService.info("Skipping initializing snippets because remote snippets does not exist.");return}if(!await this.isEmpty()){this.logService.info("Skipping initializing snippets because local snippets exist.");return}for(const n of Object.keys(i)){const s=i[n];if(s){const e=this.extUri.joinPath(this.userDataProfilesService.defaultProfile.snippetsHome,n);await this.fileService.createFile(e,v.fromString(s)),this.logService.info("Created snippet",this.extUri.basename(e))}}await this.updateLastSyncUserData(t)}async isEmpty(){try{return!(await this.fileService.resolve(this.userDataProfilesService.defaultProfile.snippetsHome)).children?.length}catch(t){return t.fileOperationResult===w.FILE_NOT_FOUND}}};y=g([h(0,S),h(1,A),h(2,f),h(3,I),h(4,R),h(5,P)],y);export{y as SnippetsInitializer,m as SnippetsSynchroniser,H as parseSnippets};
