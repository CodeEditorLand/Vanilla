var w=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var I=(a,o,i,e)=>{for(var r=e>1?void 0:e?k(o,i):o,t=a.length-1,s;t>=0;t--)(s=a[t])&&(r=(e?s(o,i,r):s(r))||r);return e&&r&&w(o,i,r),r},h=(a,o)=>(i,e)=>o(i,e,a);import{hash as U}from"../../../base/common/hash.js";import{Emitter as m}from"../../../base/common/event.js";import{Disposable as O}from"../../../base/common/lifecycle.js";import{basename as W,joinPath as p}from"../../../base/common/resources.js";import{URI as l}from"../../../base/common/uri.js";import{localize as j}from"../../../nls.js";import{IEnvironmentService as x}from"../../environment/common/environment.js";import{FileOperationResult as R,IFileService as E,toFileOperationResult as A}from"../../files/common/files.js";import{createDecorator as F}from"../../instantiation/common/instantiation.js";import{ILogService as _}from"../../log/common/log.js";import{isSingleFolderWorkspaceIdentifier as y,isWorkspaceIdentifier as v}from"../../workspace/common/workspace.js";import{ResourceMap as D}from"../../../base/common/map.js";import"../../../base/common/collections.js";import{IUriIdentityService as C}from"../../uriIdentity/common/uriIdentity.js";import{Promises as H}from"../../../base/common/async.js";import{generateUuid as b}from"../../../base/common/uuid.js";import{escapeRegExpCharacters as N}from"../../../base/common/strings.js";import{isString as S}from"../../../base/common/types.js";var T=(s=>(s.Settings="settings",s.Keybindings="keybindings",s.Snippets="snippets",s.Tasks="tasks",s.Extensions="extensions",s.GlobalState="globalState",s))(T||{});function fe(a){const o=a;return!!(o&&typeof o=="object"&&typeof o.id=="string"&&typeof o.isDefault=="boolean"&&typeof o.name=="string"&&l.isUri(o.location)&&l.isUri(o.globalStorageHome)&&l.isUri(o.settingsResource)&&l.isUri(o.keybindingsResource)&&l.isUri(o.tasksResource)&&l.isUri(o.snippetsHome)&&l.isUri(o.extensionsResource))}const ce=F("IUserDataProfilesService");function de(a,o){return{id:a.id,isDefault:a.isDefault,name:a.name,shortName:a.shortName,icon:a.icon,location:l.revive(a.location).with({scheme:o}),globalStorageHome:l.revive(a.globalStorageHome).with({scheme:o}),settingsResource:l.revive(a.settingsResource).with({scheme:o}),keybindingsResource:l.revive(a.keybindingsResource).with({scheme:o}),tasksResource:l.revive(a.tasksResource).with({scheme:o}),snippetsHome:l.revive(a.snippetsHome).with({scheme:o}),extensionsResource:l.revive(a.extensionsResource).with({scheme:o}),cacheHome:l.revive(a.cacheHome).with({scheme:o}),useDefaultFlags:a.useDefaultFlags,isTransient:a.isTransient}}function g(a,o,i,e,r,t){return{id:a,name:o,location:i,isDefault:!1,shortName:r?.shortName,icon:r?.icon,globalStorageHome:t&&r?.useDefaultFlags?.globalState?t.globalStorageHome:p(i,"globalStorage"),settingsResource:t&&r?.useDefaultFlags?.settings?t.settingsResource:p(i,"settings.json"),keybindingsResource:t&&r?.useDefaultFlags?.keybindings?t.keybindingsResource:p(i,"keybindings.json"),tasksResource:t&&r?.useDefaultFlags?.tasks?t.tasksResource:p(i,"tasks.json"),snippetsHome:t&&r?.useDefaultFlags?.snippets?t.snippetsHome:p(i,"snippets"),extensionsResource:t&&r?.useDefaultFlags?.extensions?t.extensionsResource:p(i,"extensions.json"),cacheHome:p(e,a),useDefaultFlags:r?.useDefaultFlags,isTransient:r?.transient}}let u=class extends O{constructor(i,e,r,t){super();this.environmentService=i;this.fileService=e;this.uriIdentityService=r;this.logService=t;this.profilesHome=p(this.environmentService.userRoamingDataHome,"profiles"),this.profilesCacheHome=p(this.environmentService.cacheHome,"CachedProfilesData")}static PROFILES_KEY="userDataProfiles";static PROFILE_ASSOCIATIONS_KEY="profileAssociations";_serviceBrand;enabled=!0;profilesHome;profilesCacheHome;get defaultProfile(){return this.profiles[0]}get profiles(){return[...this.profilesObject.profiles,...this.transientProfilesObject.profiles]}_onDidChangeProfiles=this._register(new m);onDidChangeProfiles=this._onDidChangeProfiles.event;_onWillCreateProfile=this._register(new m);onWillCreateProfile=this._onWillCreateProfile.event;_onWillRemoveProfile=this._register(new m);onWillRemoveProfile=this._onWillRemoveProfile.event;_onDidResetWorkspaces=this._register(new m);onDidResetWorkspaces=this._onDidResetWorkspaces.event;profileCreationPromises=new Map;transientProfilesObject={profiles:[],folders:new D,workspaces:new D,emptyWindows:new Map};init(){this._profilesObject=void 0}setEnablement(i){this.enabled!==i&&(this._profilesObject=void 0,this.enabled=i)}isEnabled(){return this.enabled}_profilesObject;get profilesObject(){if(!this._profilesObject){const i=this.createDefaultProfile(),e=[i];if(this.enabled)try{for(const s of this.getStoredProfiles()){if(!s.name||!S(s.name)||!s.location){this.logService.warn("Skipping the invalid stored profile",s.location||s.name);continue}e.push(g(W(s.location),s.name,s.location,this.profilesCacheHome,{shortName:s.shortName,icon:s.icon,useDefaultFlags:s.useDefaultFlags},i))}}catch(s){this.logService.error(s)}const r=new D,t=new Map;if(e.length)try{const s=this.getStoredProfileAssociations();if(s.workspaces)for(const[f,n]of Object.entries(s.workspaces)){const d=l.parse(f),c=e.find(P=>P.id===n);c&&r.set(d,c)}if(s.emptyWindows)for(const[f,n]of Object.entries(s.emptyWindows)){const d=e.find(c=>c.id===n);d&&t.set(f,d)}}catch(s){this.logService.error(s)}this._profilesObject={profiles:e,workspaces:r,emptyWindows:t}}return this._profilesObject}createDefaultProfile(){const i=g("__default__profile__",j("defaultProfile","Default"),this.environmentService.userRoamingDataHome,this.profilesCacheHome);return{...i,extensionsResource:this.getDefaultProfileExtensionsLocation()??i.extensionsResource,isDefault:!0}}async createTransientProfile(i){const e="Temp",r=new RegExp(`${N(e)}\\s(\\d+)`);let t=0;for(const f of this.profiles){const n=r.exec(f.name),d=n?parseInt(n[1]):0;t=d>t?d:t}const s=`${e} ${t+1}`;return this.createProfile(U(b()).toString(16),s,{transient:!0},i)}async createNamedProfile(i,e,r){return this.createProfile(U(b()).toString(16),i,e,r)}async createProfile(i,e,r,t){if(!this.enabled)throw new Error("Profiles are disabled in the current environment.");const s=await this.doCreateProfile(i,e,r);return t&&await this.setProfileForWorkspace(t,s),s}async doCreateProfile(i,e,r){if(!S(e)||!e)throw new Error("Name of the profile is mandatory and must be of type `string`");let t=this.profileCreationPromises.get(e);return t||(t=(async()=>{try{if(this.profiles.find(d=>d.name===e||d.id===i))throw new Error(`Profile with ${e} name already exists`);const f=g(i,e,p(this.profilesHome,i),this.profilesCacheHome,r,this.defaultProfile);await this.fileService.createFolder(f.location);const n=[];return this._onWillCreateProfile.fire({profile:f,join(d){n.push(d)}}),await H.settled(n),this.updateProfiles([f],[],[]),f}finally{this.profileCreationPromises.delete(e)}})(),this.profileCreationPromises.set(e,t)),t}async updateProfile(i,e){if(!this.enabled)throw new Error("Profiles are disabled in the current environment.");let r=this.profiles.find(t=>t.id===i.id);if(!r)throw new Error(`Profile '${i.name}' does not exist`);return r=g(r.id,e.name??r.name,r.location,this.profilesCacheHome,{shortName:e.shortName??r.shortName,icon:e.icon===null?void 0:e.icon??r.icon,transient:e.transient??r.isTransient,useDefaultFlags:e.useDefaultFlags??r.useDefaultFlags},this.defaultProfile),this.updateProfiles([],[],[r]),r}async removeProfile(i){if(!this.enabled)throw new Error("Profiles are disabled in the current environment.");if(i.isDefault)throw new Error("Cannot remove default profile");const e=this.profiles.find(t=>t.id===i.id);if(!e)throw new Error(`Profile '${i.name}' does not exist`);const r=[];this._onWillRemoveProfile.fire({profile:e,join(t){r.push(t)}});try{await Promise.allSettled(r)}catch(t){this.logService.error(t)}for(const t of[...this.profilesObject.emptyWindows.keys()])e.id===this.profilesObject.emptyWindows.get(t)?.id&&this.profilesObject.emptyWindows.delete(t);for(const t of[...this.profilesObject.workspaces.keys()])e.id===this.profilesObject.workspaces.get(t)?.id&&this.profilesObject.workspaces.delete(t);this.updateStoredProfileAssociations(),this.updateProfiles([],[e],[]);try{await this.fileService.del(e.cacheHome,{recursive:!0})}catch(t){A(t)!==R.FILE_NOT_FOUND&&this.logService.error(t)}}async setProfileForWorkspace(i,e){if(!this.enabled)throw new Error("Profiles are disabled in the current environment.");const r=this.profiles.find(t=>t.id===e.id);if(!r)throw new Error(`Profile '${e.name}' does not exist`);this.updateWorkspaceAssociation(i,r)}unsetWorkspace(i,e){if(!this.enabled)throw new Error("Profiles are disabled in the current environment.");this.updateWorkspaceAssociation(i,void 0,e)}async resetWorkspaces(){this.transientProfilesObject.folders.clear(),this.transientProfilesObject.workspaces.clear(),this.transientProfilesObject.emptyWindows.clear(),this.profilesObject.workspaces.clear(),this.profilesObject.emptyWindows.clear(),this.updateStoredProfileAssociations(),this._onDidResetWorkspaces.fire()}async cleanUp(){if(this.enabled&&await this.fileService.exists(this.profilesHome)){const i=await this.fileService.resolve(this.profilesHome);await Promise.all((i.children||[]).filter(e=>e.isDirectory&&this.profiles.every(r=>!this.uriIdentityService.extUri.isEqual(r.location,e.resource))).map(e=>this.fileService.del(e.resource,{recursive:!0})))}}async cleanUpTransientProfiles(){if(!this.enabled)return;const i=this.transientProfilesObject.profiles.filter(e=>!this.isProfileAssociatedToWorkspace(e));await Promise.allSettled(i.map(e=>this.removeProfile(e)))}getProfileForWorkspace(i){const e=this.getWorkspace(i),r=l.isUri(e)?this.profilesObject.workspaces.get(e):this.profilesObject.emptyWindows.get(e);return r||(y(i)?this.transientProfilesObject.folders.get(i.uri):v(i)?this.transientProfilesObject.workspaces.get(i.configPath):this.transientProfilesObject.emptyWindows.get(i.id))}getWorkspace(i){return y(i)?i.uri:v(i)?i.configPath:i.id}isProfileAssociatedToWorkspace(i){return!!([...this.profilesObject.emptyWindows.values()].some(e=>this.uriIdentityService.extUri.isEqual(e.location,i.location))||[...this.profilesObject.workspaces.values()].some(e=>this.uriIdentityService.extUri.isEqual(e.location,i.location))||[...this.transientProfilesObject.emptyWindows.values()].some(e=>this.uriIdentityService.extUri.isEqual(e.location,i.location))||[...this.transientProfilesObject.workspaces.values()].some(e=>this.uriIdentityService.extUri.isEqual(e.location,i.location))||[...this.transientProfilesObject.folders.values()].some(e=>this.uriIdentityService.extUri.isEqual(e.location,i.location)))}updateProfiles(i,e,r){const t=[...this.profiles,...i],s=[],f=this.transientProfilesObject.profiles;this.transientProfilesObject.profiles=[];for(let n of t){if(n.isDefault||e.some(c=>n.id===c.id))continue;n=r.find(c=>n.id===c.id)??n;const d=f.find(c=>n.id===c.id);if(n.isTransient)this.transientProfilesObject.profiles.push(n);else{if(d){for(const[c,P]of this.transientProfilesObject.emptyWindows.entries())if(n.id===P.id){this.updateWorkspaceAssociation({id:c},n);break}for(const[c,P]of this.transientProfilesObject.workspaces.entries())if(n.id===P.id){this.updateWorkspaceAssociation({id:"",configPath:c},n);break}for(const[c,P]of this.transientProfilesObject.folders.entries())if(n.id===P.id){this.updateWorkspaceAssociation({id:"",uri:c},n);break}}s.push({location:n.location,name:n.name,shortName:n.shortName,icon:n.icon,useDefaultFlags:n.useDefaultFlags})}}this.saveStoredProfiles(s),this._profilesObject=void 0,this.triggerProfilesChanges(i,e,r)}triggerProfilesChanges(i,e,r){this._onDidChangeProfiles.fire({added:i,removed:e,updated:r,all:this.profiles})}updateWorkspaceAssociation(i,e,r){if(r=e?.isTransient?!0:r,r)y(i)?(this.transientProfilesObject.folders.delete(i.uri),e&&this.transientProfilesObject.folders.set(i.uri,e)):v(i)?(this.transientProfilesObject.workspaces.delete(i.configPath),e&&this.transientProfilesObject.workspaces.set(i.configPath,e)):(this.transientProfilesObject.emptyWindows.delete(i.id),e&&this.transientProfilesObject.emptyWindows.set(i.id,e));else{this.updateWorkspaceAssociation(i,void 0,!0);const t=this.getWorkspace(i);l.isUri(t)?(this.profilesObject.workspaces.delete(t),e&&this.profilesObject.workspaces.set(t,e)):(this.profilesObject.emptyWindows.delete(t),e&&this.profilesObject.emptyWindows.set(t,e)),this.updateStoredProfileAssociations()}}updateStoredProfileAssociations(){const i={};for(const[r,t]of this.profilesObject.workspaces.entries())i[r.toString()]=t.id;const e={};for(const[r,t]of this.profilesObject.emptyWindows.entries())e[r.toString()]=t.id;this.saveStoredProfileAssociations({workspaces:i,emptyWindows:e}),this._profilesObject=void 0}migrateStoredProfileAssociations(i){const e={},r=this.createDefaultProfile();if(i.workspaces)for(const[s,f]of Object.entries(i.workspaces)){const n=l.parse(f);e[s]=this.uriIdentityService.extUri.isEqual(n,r.location)?r.id:this.uriIdentityService.extUri.basename(n)}const t={};if(i.emptyWindows)for(const[s,f]of Object.entries(i.emptyWindows)){const n=l.parse(f);t[s]=this.uriIdentityService.extUri.isEqual(n,r.location)?r.id:this.uriIdentityService.extUri.basename(n)}return{workspaces:e,emptyWindows:t}}getStoredProfiles(){return[]}saveStoredProfiles(i){throw new Error("not implemented")}getStoredProfileAssociations(){return{}}saveStoredProfileAssociations(i){throw new Error("not implemented")}getDefaultProfileExtensionsLocation(){}};u=I([h(0,x),h(1,E),h(2,C),h(3,_)],u);class pe extends u{storedProfiles=[];getStoredProfiles(){return this.storedProfiles}saveStoredProfiles(o){this.storedProfiles=o}storedProfileAssociations={};getStoredProfileAssociations(){return this.storedProfileAssociations}saveStoredProfileAssociations(o){this.storedProfileAssociations=o}}export{ce as IUserDataProfilesService,pe as InMemoryUserDataProfilesService,T as ProfileResourceType,u as UserDataProfilesService,fe as isUserDataProfile,de as reviveProfile,g as toUserDataProfile};
