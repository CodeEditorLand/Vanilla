import{Emitter as d,Event as E}from"../../../../vs/base/common/event.js";import{Disposable as h}from"../../../../vs/base/common/lifecycle.js";import{cloneAndChange as v}from"../../../../vs/base/common/objects.js";import{URI as a}from"../../../../vs/base/common/uri.js";import{DefaultURITransformer as m,transformAndReviveIncomingURIs as f}from"../../../../vs/base/common/uriIpc.js";import"../../../../vs/base/parts/ipc/common/ipc.js";import{isTargetPlatformCompatible as U}from"../../../../vs/platform/extensionManagement/common/extensionManagement.js";import"../../../../vs/platform/extensions/common/extensions.js";function c(s,i){return s?a.revive(i?i.transformIncoming(s):s):void 0}function x(s,i){return i?i.transformOutgoingURI(s):s}function l(s,i){i=i||m;const t=s.manifest;return{...f({...s,manifest:void 0},i),manifest:t}}function u(s,i){return s?.profileLocation?f(s,i??m):s}function p(s,i){return i?v(s,t=>t instanceof a?i.transformOutgoingURI(t):void 0):s}class nn{constructor(i,t){this.service=i;this.getUriTransformer=t;this.onInstallExtension=E.buffer(i.onInstallExtension,!0),this.onDidInstallExtensions=E.buffer(i.onDidInstallExtensions,!0),this.onUninstallExtension=E.buffer(i.onUninstallExtension,!0),this.onDidUninstallExtension=E.buffer(i.onDidUninstallExtension,!0),this.onDidUpdateExtensionMetadata=E.buffer(i.onDidUpdateExtensionMetadata,!0)}onInstallExtension;onDidInstallExtensions;onUninstallExtension;onDidUninstallExtension;onDidUpdateExtensionMetadata;listen(i,t){const n=this.getUriTransformer(i);switch(t){case"onInstallExtension":return E.map(this.onInstallExtension,e=>({...e,profileLocation:e.profileLocation?x(e.profileLocation,n):e.profileLocation}));case"onDidInstallExtensions":return E.map(this.onDidInstallExtensions,e=>e.map(o=>({...o,local:o.local?p(o.local,n):o.local,profileLocation:o.profileLocation?x(o.profileLocation,n):o.profileLocation})));case"onUninstallExtension":return E.map(this.onUninstallExtension,e=>({...e,profileLocation:e.profileLocation?x(e.profileLocation,n):e.profileLocation}));case"onDidUninstallExtension":return E.map(this.onDidUninstallExtension,e=>({...e,profileLocation:e.profileLocation?x(e.profileLocation,n):e.profileLocation}));case"onDidUpdateExtensionMetadata":return E.map(this.onDidUpdateExtensionMetadata,e=>({local:p(e.local,n),profileLocation:x(e.profileLocation,n)}))}throw new Error("Invalid listen")}async call(i,t,n){const e=this.getUriTransformer(i);switch(t){case"zip":{const o=l(n[0],e),r=await this.service.zip(o);return x(r,e)}case"install":return this.service.install(c(n[0],e),u(n[1],e));case"installFromLocation":return this.service.installFromLocation(c(n[0],e),c(n[1],e));case"installExtensionsFromProfile":return this.service.installExtensionsFromProfile(n[0],c(n[1],e),c(n[2],e));case"getManifest":return this.service.getManifest(c(n[0],e));case"getTargetPlatform":return this.service.getTargetPlatform();case"canInstall":return this.service.canInstall(n[0]);case"installFromGallery":return this.service.installFromGallery(n[0],u(n[1],e));case"installGalleryExtensions":{const o=n[0];return this.service.installGalleryExtensions(o.map(({extension:r,options:I})=>({extension:r,options:u(I,e)??{}})))}case"uninstall":return this.service.uninstall(l(n[0],e),u(n[1],e));case"uninstallExtensions":{const o=n[0];return this.service.uninstallExtensions(o.map(({extension:r,options:I})=>({extension:l(r,e),options:u(I,e)})))}case"reinstallFromGallery":return this.service.reinstallFromGallery(l(n[0],e));case"getInstalled":return(await this.service.getInstalled(n[0],c(n[1],e),n[2])).map(r=>p(r,e));case"toggleAppliationScope":{const o=await this.service.toggleAppliationScope(l(n[0],e),c(n[1],e));return p(o,e)}case"copyExtensions":return this.service.copyExtensions(c(n[0],e),c(n[1],e));case"updateMetadata":{const o=await this.service.updateMetadata(l(n[0],e),n[1],c(n[2],e));return p(o,e)}case"resetPinnedStateForAllUserExtensions":return this.service.resetPinnedStateForAllUserExtensions(n[0]);case"getExtensionsControlManifest":return this.service.getExtensionsControlManifest();case"download":return this.service.download(n[0],n[1],n[2]);case"cleanUp":return this.service.cleanUp()}throw new Error("Invalid call")}}class en extends h{constructor(t){super();this.channel=t;this._register(this.channel.listen("onInstallExtension")(n=>this.fireEvent(this._onInstallExtension,{...n,source:this.isUriComponents(n.source)?a.revive(n.source):n.source,profileLocation:a.revive(n.profileLocation)}))),this._register(this.channel.listen("onDidInstallExtensions")(n=>this.fireEvent(this._onDidInstallExtensions,n.map(e=>({...e,local:e.local?l(e.local,null):e.local,source:this.isUriComponents(e.source)?a.revive(e.source):e.source,profileLocation:a.revive(e.profileLocation)}))))),this._register(this.channel.listen("onUninstallExtension")(n=>this.fireEvent(this._onUninstallExtension,{...n,profileLocation:a.revive(n.profileLocation)}))),this._register(this.channel.listen("onDidUninstallExtension")(n=>this.fireEvent(this._onDidUninstallExtension,{...n,profileLocation:a.revive(n.profileLocation)}))),this._register(this.channel.listen("onDidUpdateExtensionMetadata")(n=>this.fireEvent(this._onDidUpdateExtensionMetadata,{profileLocation:a.revive(n.profileLocation),local:l(n.local,null)})))}_onInstallExtension=this._register(new d);get onInstallExtension(){return this._onInstallExtension.event}_onDidInstallExtensions=this._register(new d);get onDidInstallExtensions(){return this._onDidInstallExtensions.event}_onUninstallExtension=this._register(new d);get onUninstallExtension(){return this._onUninstallExtension.event}_onDidUninstallExtension=this._register(new d);get onDidUninstallExtension(){return this._onDidUninstallExtension.event}_onDidUpdateExtensionMetadata=this._register(new d);get onDidUpdateExtensionMetadata(){return this._onDidUpdateExtensionMetadata.event}fireEvent(t,n){t.fire(n)}isUriComponents(t){return t?typeof t.path=="string"&&typeof t.scheme=="string":!1}_targetPlatformPromise;getTargetPlatform(){return this._targetPlatformPromise||(this._targetPlatformPromise=this.channel.call("getTargetPlatform")),this._targetPlatformPromise}async canInstall(t){const n=await this.getTargetPlatform();return t.allTargetPlatforms.some(e=>U(e,t.allTargetPlatforms,n))}zip(t){return Promise.resolve(this.channel.call("zip",[t]).then(n=>a.revive(n)))}install(t,n){return Promise.resolve(this.channel.call("install",[t,n])).then(e=>l(e,null))}installFromLocation(t,n){return Promise.resolve(this.channel.call("installFromLocation",[t,n])).then(e=>l(e,null))}async installExtensionsFromProfile(t,n,e){return(await this.channel.call("installExtensionsFromProfile",[t,n,e])).map(r=>l(r,null))}getManifest(t){return Promise.resolve(this.channel.call("getManifest",[t]))}installFromGallery(t,n){return Promise.resolve(this.channel.call("installFromGallery",[t,n])).then(e=>l(e,null))}async installGalleryExtensions(t){return(await this.channel.call("installGalleryExtensions",[t])).map(e=>({...e,local:e.local?l(e.local,null):e.local,source:this.isUriComponents(e.source)?a.revive(e.source):e.source,profileLocation:a.revive(e.profileLocation)}))}uninstall(t,n){if(t.isWorkspaceScoped)throw new Error("Cannot uninstall a workspace extension");return Promise.resolve(this.channel.call("uninstall",[t,n]))}uninstallExtensions(t){if(t.some(n=>n.extension.isWorkspaceScoped))throw new Error("Cannot uninstall a workspace extension");return Promise.resolve(this.channel.call("uninstallExtensions",[t]))}reinstallFromGallery(t){return Promise.resolve(this.channel.call("reinstallFromGallery",[t])).then(n=>l(n,null))}getInstalled(t=null,n,e){return Promise.resolve(this.channel.call("getInstalled",[t,n,e])).then(o=>o.map(r=>l(r,null)))}updateMetadata(t,n,e){return Promise.resolve(this.channel.call("updateMetadata",[t,n,e])).then(o=>l(o,null))}resetPinnedStateForAllUserExtensions(t){return this.channel.call("resetPinnedStateForAllUserExtensions",[t])}toggleAppliationScope(t,n){return this.channel.call("toggleAppliationScope",[t,n]).then(e=>l(e,null))}copyExtensions(t,n){return this.channel.call("copyExtensions",[t,n])}getExtensionsControlManifest(){return Promise.resolve(this.channel.call("getExtensionsControlManifest"))}async download(t,n,e){const o=await this.channel.call("download",[t,n,e]);return a.revive(o)}async cleanUp(){return this.channel.call("cleanUp")}registerParticipant(){throw new Error("Not Supported")}}class tn{constructor(i){this.service=i}listen(i,t){throw new Error("Invalid listen")}call(i,t,n){switch(t){case"getConfigBasedTips":return this.service.getConfigBasedTips(a.revive(n[0]));case"getImportantExecutableBasedTips":return this.service.getImportantExecutableBasedTips();case"getOtherExecutableBasedTips":return this.service.getOtherExecutableBasedTips()}throw new Error("Invalid call")}}export{nn as ExtensionManagementChannel,en as ExtensionManagementChannelClient,tn as ExtensionTipsChannel};
