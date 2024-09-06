import{getErrorMessage as l}from"../../../../vs/base/common/errors.js";import{Emitter as f}from"../../../../vs/base/common/event.js";import{combinedDisposable as h,Disposable as c,DisposableMap as v}from"../../../../vs/base/common/lifecycle.js";import{ResourceSet as x}from"../../../../vs/base/common/map.js";import"../../../../vs/base/common/uri.js";import{getIdAndVersion as E}from"../../../../vs/platform/extensionManagement/common/extensionManagementUtil.js";import"../../../../vs/platform/extensionManagement/common/extensionsProfileScannerService.js";import"../../../../vs/platform/extensionManagement/common/extensionsScannerService.js";import"../../../../vs/platform/extensionManagement/node/extensionManagementService.js";import{ExtensionIdentifier as m}from"../../../../vs/platform/extensions/common/extensions.js";import{FileChangeType as d}from"../../../../vs/platform/files/common/files.js";import"../../../../vs/platform/log/common/log.js";import"../../../../vs/platform/uriIdentity/common/uriIdentity.js";import"../../../../vs/platform/userDataProfile/common/userDataProfile.js";class J extends c{constructor(e,i,n,t,a,r,s){super();this.extensionManagementService=e;this.extensionsScannerService=i;this.userDataProfilesService=n;this.extensionsProfileScannerService=t;this.uriIdentityService=a;this.fileService=r;this.logService=s;this.initialize().then(null,o=>s.error("Error while initializing Extensions Watcher",l(o)))}_onDidChangeExtensionsByAnotherSource=this._register(new f);onDidChangeExtensionsByAnotherSource=this._onDidChangeExtensionsByAnotherSource.event;allExtensions=new Map;extensionsProfileWatchDisposables=this._register(new v);async initialize(){await this.extensionsScannerService.initializeDefaultProfileExtensions(),await this.onDidChangeProfiles(this.userDataProfilesService.profiles),this.registerListeners(),await this.uninstallExtensionsNotInProfiles()}registerListeners(){this._register(this.userDataProfilesService.onDidChangeProfiles(e=>this.onDidChangeProfiles(e.added))),this._register(this.extensionsProfileScannerService.onAddExtensions(e=>this.onAddExtensions(e))),this._register(this.extensionsProfileScannerService.onDidAddExtensions(e=>this.onDidAddExtensions(e))),this._register(this.extensionsProfileScannerService.onRemoveExtensions(e=>this.onRemoveExtensions(e))),this._register(this.extensionsProfileScannerService.onDidRemoveExtensions(e=>this.onDidRemoveExtensions(e))),this._register(this.fileService.onDidFilesChange(e=>this.onDidFilesChange(e)))}async onDidChangeProfiles(e){try{e.length&&await Promise.all(e.map(i=>(this.extensionsProfileWatchDisposables.set(i.id,h(this.fileService.watch(this.uriIdentityService.extUri.dirname(i.extensionsResource)),this.fileService.watch(i.extensionsResource))),this.populateExtensionsFromProfile(i.extensionsResource))))}catch(i){throw this.logService.error(i),i}}async onAddExtensions(e){for(const i of e.extensions)this.addExtensionWithKey(this.getKey(i.identifier,i.version),e.profileLocation)}async onDidAddExtensions(e){for(const i of e.extensions){const n=this.getKey(i.identifier,i.version);e.error?this.removeExtensionWithKey(n,e.profileLocation):this.addExtensionWithKey(n,e.profileLocation)}}async onRemoveExtensions(e){for(const i of e.extensions)this.removeExtensionWithKey(this.getKey(i.identifier,i.version),e.profileLocation)}async onDidRemoveExtensions(e){const i=[],n=[];for(const t of e.extensions){const a=this.getKey(t.identifier,t.version);e.error?this.addExtensionWithKey(a,e.profileLocation):(this.removeExtensionWithKey(a,e.profileLocation),this.allExtensions.has(a)||(this.logService.debug("Extension is removed from all profiles",t.identifier.id,t.version),n.push(this.extensionManagementService.scanInstalledExtensionAtLocation(t.location).then(r=>{r?i.push(r):this.logService.info("Extension not found at the location",t.location.toString())},r=>this.logService.error(r)))))}try{await Promise.all(n),i.length&&await this.uninstallExtensionsNotInProfiles(i)}catch(t){this.logService.error(t)}}onDidFilesChange(e){for(const i of this.userDataProfilesService.profiles)e.contains(i.extensionsResource,d.UPDATED,d.ADDED)&&this.onDidExtensionsProfileChange(i.extensionsResource)}async onDidExtensionsProfileChange(e){const i=[],n=[],t=await this.extensionsProfileScannerService.scanProfileExtensions(e),a=new Set,r=new Set;for(const[s,o]of this.allExtensions)o.has(e)&&r.add(s);for(const s of t){const o=this.getKey(s.identifier,s.version);a.add(o),r.has(o)||(i.push(s.identifier),this.addExtensionWithKey(o,e))}for(const s of r)if(!a.has(s)){const o=this.fromKey(s);o&&(n.push(o.identifier),this.removeExtensionWithKey(s,e))}(i.length||n.length)&&this._onDidChangeExtensionsByAnotherSource.fire({added:i.length?{extensions:i,profileLocation:e}:void 0,removed:n.length?{extensions:n,profileLocation:e}:void 0})}async populateExtensionsFromProfile(e){const i=await this.extensionsProfileScannerService.scanProfileExtensions(e);for(const n of i)this.addExtensionWithKey(this.getKey(n.identifier,n.version),e)}async uninstallExtensionsNotInProfiles(e){e||(e=(await this.extensionManagementService.scanAllUserInstalledExtensions()).filter(n=>!this.allExtensions.has(this.getKey(n.identifier,n.manifest.version)))),e.length&&await this.extensionManagementService.markAsUninstalled(...e)}addExtensionWithKey(e,i){let n=this.allExtensions.get(e);n||this.allExtensions.set(e,n=new x(t=>this.uriIdentityService.extUri.getComparisonKey(t))),n.add(i)}removeExtensionWithKey(e,i){const n=this.allExtensions.get(e);n&&n.delete(i),n?.size||this.allExtensions.delete(e)}getKey(e,i){return`${m.toKey(e.id)}@${i}`}fromKey(e){const[i,n]=E(e);return n?{identifier:{id:i},version:n}:void 0}}export{J as ExtensionsWatcher};
