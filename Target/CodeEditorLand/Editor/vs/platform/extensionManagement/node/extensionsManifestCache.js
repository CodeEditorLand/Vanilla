import{Disposable as o}from"../../../base/common/lifecycle.js";import{USER_MANIFEST_CACHE_FILE as s}from"../../extensions/common/extensions.js";import{FileOperationResult as n,toFileOperationResult as a}from"../../files/common/files.js";class C extends o{constructor(e,i,v,t,d){super();this.userDataProfilesService=e;this.fileService=i;this.uriIdentityService=v;this.logService=d;this._register(t.onDidInstallExtensions(r=>this.onDidInstallExtensions(r))),this._register(t.onDidUninstallExtension(r=>this.onDidUnInstallExtension(r)))}onDidInstallExtensions(e){for(const i of e)i.local&&this.invalidate(i.profileLocation)}onDidUnInstallExtension(e){e.error||this.invalidate(e.profileLocation)}async invalidate(e){if(e)for(const i of this.userDataProfilesService.profiles)this.uriIdentityService.extUri.isEqual(i.extensionsResource,e)&&await this.deleteUserCacheFile(i);else await this.deleteUserCacheFile(this.userDataProfilesService.defaultProfile)}async deleteUserCacheFile(e){try{await this.fileService.del(this.uriIdentityService.extUri.joinPath(e.cacheHome,s))}catch(i){a(i)!==n.FILE_NOT_FOUND&&this.logService.error(i)}}}export{C as ExtensionsManifestCache};
