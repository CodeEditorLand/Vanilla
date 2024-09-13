var D=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var y=(a,d,i,n)=>{for(var s=n>1?void 0:n?w(d,i):d,o=a.length-1,e;o>=0;o--)(e=a[o])&&(s=(n?e(d,i,s):e(s))||s);return n&&s&&D(d,i,s),s},x=(a,d)=>(i,n)=>d(i,n,a);import{Queue as O}from"../../../base/common/async.js";import{VSBuffer as P}from"../../../base/common/buffer.js";import{getErrorMessage as U}from"../../../base/common/errors.js";import{Emitter as u}from"../../../base/common/event.js";import{Disposable as F}from"../../../base/common/lifecycle.js";import{ResourceMap as N}from"../../../base/common/map.js";import{isObject as A,isString as c,isUndefined as g}from"../../../base/common/types.js";import{URI as L}from"../../../base/common/uri.js";import{FileOperationResult as E,IFileService as T,toFileOperationResult as v}from"../../files/common/files.js";import{createDecorator as M}from"../../instantiation/common/instantiation.js";import{ILogService as C}from"../../log/common/log.js";import{ITelemetryService as b}from"../../telemetry/common/telemetry.js";import{IUriIdentityService as Q}from"../../uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as V}from"../../userDataProfile/common/userDataProfile.js";import{isIExtensionIdentifier as j}from"./extensionManagement.js";import{areSameExtensions as m}from"./extensionManagementUtil.js";var J=(i=>(i.ERROR_PROFILE_NOT_FOUND="ERROR_PROFILE_NOT_FOUND",i.ERROR_INVALID_CONTENT="ERROR_INVALID_CONTENT",i))(J||{});class R extends Error{constructor(i,n){super(i);this.code=n}}const se=M("IExtensionsProfileScannerService");let h=class extends F{constructor(i,n,s,o,e,t){super();this.extensionsLocation=i;this.fileService=n;this.userDataProfilesService=s;this.uriIdentityService=o;this.telemetryService=e;this.logService=t}_serviceBrand;_onAddExtensions=this._register(new u);onAddExtensions=this._onAddExtensions.event;_onDidAddExtensions=this._register(new u);onDidAddExtensions=this._onDidAddExtensions.event;_onRemoveExtensions=this._register(new u);onRemoveExtensions=this._onRemoveExtensions.event;_onDidRemoveExtensions=this._register(new u);onDidRemoveExtensions=this._onDidRemoveExtensions.event;resourcesAccessQueueMap=new N;scanProfileExtensions(i,n){return this.withProfileExtensions(i,void 0,n)}async addExtensionsToProfile(i,n,s){const o=[],e=[];try{return await this.withProfileExtensions(n,t=>{const r=[];if(s)r.push(...t);else for(const l of t)i.some(([f])=>m(f.identifier,l.identifier)&&f.manifest.version!==l.version)?o.push(l):r.push(l);for(const[l,f]of i){const S=r.findIndex(p=>m(p.identifier,l.identifier)&&p.version===l.manifest.version),I={identifier:l.identifier,version:l.manifest.version,location:l.location,metadata:f};S===-1?(e.push(I),r.push(I)):r.splice(S,1,I)}return e.length&&this._onAddExtensions.fire({extensions:e,profileLocation:n}),o.length&&this._onRemoveExtensions.fire({extensions:o,profileLocation:n}),r}),e.length&&this._onDidAddExtensions.fire({extensions:e,profileLocation:n}),o.length&&this._onDidRemoveExtensions.fire({extensions:o,profileLocation:n}),e}catch(t){throw e.length&&this._onDidAddExtensions.fire({extensions:e,error:t,profileLocation:n}),o.length&&this._onDidRemoveExtensions.fire({extensions:o,error:t,profileLocation:n}),t}}async updateMetadata(i,n){const s=[];return await this.withProfileExtensions(n,o=>{const e=[];for(const t of o){const r=i.find(([l])=>m(l.identifier,t.identifier)&&l.manifest.version===t.version);r&&(t.metadata={...t.metadata,...r[1]},s.push(t)),e.push(t)}return e}),s}async removeExtensionFromProfile(i,n){const s=[];try{await this.withProfileExtensions(n,o=>{const e=[];for(const t of o)m(t.identifier,i.identifier)?s.push(t):e.push(t);return s.length&&this._onRemoveExtensions.fire({extensions:s,profileLocation:n}),e}),s.length&&this._onDidRemoveExtensions.fire({extensions:s,profileLocation:n})}catch(o){throw s.length&&this._onDidRemoveExtensions.fire({extensions:s,error:o,profileLocation:n}),o}}async withProfileExtensions(i,n,s){return this.getResourceAccessQueue(i).queue(async()=>{let o=[],e;try{const t=await this.fileService.readFile(i);e=JSON.parse(t.value.toString().trim()||"[]")}catch(t){if(v(t)!==E.FILE_NOT_FOUND)throw t;if(this.uriIdentityService.extUri.isEqual(i,this.userDataProfilesService.defaultProfile.extensionsResource)&&(e=await this.migrateFromOldDefaultProfileExtensionsLocation()),!e&&s?.bailOutWhenFileNotFound)throw new R(U(t),"ERROR_PROFILE_NOT_FOUND")}if(e){Array.isArray(e)||this.reportAndThrowInvalidConentError(i);let t=!1;for(const r of e){_(r)||this.reportAndThrowInvalidConentError(i);let l;if(c(r.relativeLocation)&&r.relativeLocation)l=this.resolveExtensionLocation(r.relativeLocation);else if(c(r.location)){this.logService.warn(`Extensions profile: Ignoring extension with invalid location: ${r.location}`);continue}else{l=L.revive(r.location);const f=this.toRelativePath(l);f&&(t=!0,r.relativeLocation=f)}g(r.metadata?.hasPreReleaseVersion)&&r.metadata?.preRelease&&(t=!0,r.metadata.hasPreReleaseVersion=!0),o.push({identifier:r.identifier,location:l,version:r.version,metadata:r.metadata})}t&&await this.fileService.writeFile(i,P.fromString(JSON.stringify(e)))}if(n){o=n(o);const t=o.map(r=>({identifier:r.identifier,version:r.version,location:r.location.toJSON(),relativeLocation:this.toRelativePath(r.location),metadata:r.metadata}));await this.fileService.writeFile(i,P.fromString(JSON.stringify(t)))}return o})}reportAndThrowInvalidConentError(i){const n=new R(`Invalid extensions content in ${i.toString()}`,"ERROR_INVALID_CONTENT");throw this.telemetryService.publicLogError2("extensionsProfileScanningError",{code:n.code}),n}toRelativePath(i){return this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.dirname(i),this.extensionsLocation)?this.uriIdentityService.extUri.basename(i):void 0}resolveExtensionLocation(i){return this.uriIdentityService.extUri.joinPath(this.extensionsLocation,i)}_migrationPromise;async migrateFromOldDefaultProfileExtensionsLocation(){return this._migrationPromise||(this._migrationPromise=(async()=>{const i=this.uriIdentityService.extUri.joinPath(this.userDataProfilesService.defaultProfile.location,"extensions.json"),n=this.uriIdentityService.extUri.joinPath(this.extensionsLocation,".init-default-profile-extensions");let s;try{s=(await this.fileService.readFile(i)).value.toString()}catch(e){if(v(e)===E.FILE_NOT_FOUND)return;throw e}this.logService.info("Migrating extensions from old default profile location",i.toString());let o;try{const e=JSON.parse(s);Array.isArray(e)&&e.every(t=>_(t))?o=e:this.logService.warn("Skipping migrating from old default profile locaiton: Found invalid data",e)}catch(e){this.logService.error(e)}if(o)try{await this.fileService.createFile(this.userDataProfilesService.defaultProfile.extensionsResource,P.fromString(JSON.stringify(o)),{overwrite:!1}),this.logService.info("Migrated extensions from old default profile location to new location",i.toString(),this.userDataProfilesService.defaultProfile.extensionsResource.toString())}catch(e){if(v(e)===E.FILE_MODIFIED_SINCE)this.logService.info("Migration from old default profile location to new location is done by another window",i.toString(),this.userDataProfilesService.defaultProfile.extensionsResource.toString());else throw e}try{await this.fileService.del(i)}catch(e){v(e)!==E.FILE_NOT_FOUND&&this.logService.error(e)}try{await this.fileService.del(n)}catch(e){v(e)!==E.FILE_NOT_FOUND&&this.logService.error(e)}return o})()),this._migrationPromise}getResourceAccessQueue(i){let n=this.resourcesAccessQueueMap.get(i);return n||(n=new O,this.resourcesAccessQueueMap.set(i,n)),n}};h=y([x(1,T),x(2,V),x(3,Q),x(4,b),x(5,C)],h);function _(a){return A(a)&&j(a.identifier)&&(k(a.location)||c(a.location)&&a.location)&&(g(a.relativeLocation)||c(a.relativeLocation))&&a.version&&c(a.version)}function k(a){return a?c(a.path)&&c(a.scheme):!1}export{h as AbstractExtensionsProfileScannerService,R as ExtensionsProfileScanningError,J as ExtensionsProfileScanningErrorCode,se as IExtensionsProfileScannerService};
