var l=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var m=(a,e,i,n)=>{for(var r=n>1?void 0:n?v(e,i):e,o=a.length-1,c;o>=0;o--)(c=a[o])&&(r=(n?c(e,i,r):c(r))||r);return n&&r&&l(e,i,r),r},t=(a,e)=>(i,n)=>e(i,n,a);import*as p from"../../../../base/common/platform.js";import{URI as f}from"../../../../base/common/uri.js";import{InstantiationType as g,registerSingleton as h}from"../../../../platform/instantiation/common/extensions.js";import{ILogService as S}from"../../../../platform/log/common/log.js";import{IRemoteExtensionsScannerService as u,RemoteExtensionsScannerChannelName as I}from"../../../../platform/remote/common/remoteExtensionsScanner.js";import{IWorkbenchEnvironmentService as d}from"../../environment/common/environmentService.js";import{IWorkbenchExtensionManagementService as P}from"../../extensionManagement/common/extensionManagement.js";import{IActiveLanguagePackService as x}from"../../localization/common/locale.js";import{IRemoteUserDataProfilesService as y}from"../../userDataProfile/common/remoteUserDataProfiles.js";import{IUserDataProfileService as D}from"../../userDataProfile/common/userDataProfile.js";import{IRemoteAgentService as E}from"./remoteAgentService.js";let s=class{constructor(e,i,n,r,o,c,R){this.remoteAgentService=e;this.environmentService=i;this.userDataProfileService=n;this.remoteUserDataProfilesService=r;this.activeLanguagePackService=o;this.extensionManagementService=c;this.logService=R}whenExtensionsReady(){return this.withChannel(e=>e.call("whenExtensionsReady"),void 0)}async scanExtensions(){try{const e=await this.activeLanguagePackService.getExtensionIdProvidingCurrentLocale();return await this.withChannel(async i=>{const n=this.userDataProfileService.currentProfile.isDefault?void 0:(await this.remoteUserDataProfilesService.getRemoteProfile(this.userDataProfileService.currentProfile)).extensionsResource,r=await i.call("scanExtensions",[p.language,n,this.extensionManagementService.getInstalledWorkspaceExtensionLocations(),this.environmentService.extensionDevelopmentLocationURI,e]);return r.forEach(o=>{o.extensionLocation=f.revive(o.extensionLocation)}),r},[])}catch(e){return this.logService.error(e),[]}}withChannel(e,i){const n=this.remoteAgentService.getConnection();return n?n.withChannel(I,r=>e(r)):Promise.resolve(i)}};s=m([t(0,E),t(1,d),t(2,D),t(3,y),t(4,x),t(5,P),t(6,S)],s),h(u,s,g.Delayed);
