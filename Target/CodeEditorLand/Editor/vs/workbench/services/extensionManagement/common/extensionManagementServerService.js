var x=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var l=(i,e,r,t)=>{for(var n=t>1?void 0:t?I(e,r):e,o=i.length-1,s;o>=0;o--)(s=i[o])&&(n=(t?s(e,r,n):s(n))||n);return t&&n&&x(e,r,n),n},m=(i,e)=>(r,t)=>e(r,t,i);import{Schemas as c}from"../../../../base/common/network.js";import{isWeb as E}from"../../../../base/common/platform.js";import"../../../../base/parts/ipc/common/ipc.js";import{localize as g}from"../../../../nls.js";import"../../../../platform/extensions/common/extensions.js";import{InstantiationType as S,registerSingleton as M}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as f}from"../../../../platform/instantiation/common/instantiation.js";import{ILabelService as p}from"../../../../platform/label/common/label.js";import{IRemoteAgentService as b}from"../../remote/common/remoteAgentService.js";import{ExtensionInstallLocation as v,IExtensionManagementServerService as d}from"./extensionManagement.js";import{RemoteExtensionManagementService as h}from"./remoteExtensionManagementService.js";import{WebExtensionManagementService as u}from"./webExtensionManagementService.js";let a=class{localExtensionManagementServer=null;remoteExtensionManagementServer=null;webExtensionManagementServer=null;constructor(e,r,t){const n=e.getConnection();if(n){const o=t.createInstance(h,n.getChannel("extensions"));this.remoteExtensionManagementServer={id:"remote",extensionManagementService:o,get label(){return r.getHostLabel(c.vscodeRemote,n.remoteAuthority)||g("remote","Remote")}}}if(E){const o=t.createInstance(u);this.webExtensionManagementServer={id:"web",extensionManagementService:o,label:g("browser","Browser")}}}getExtensionManagementServer(e){if(e.location.scheme===c.vscodeRemote)return this.remoteExtensionManagementServer;if(this.webExtensionManagementServer)return this.webExtensionManagementServer;throw new Error(`Invalid Extension ${e.location}`)}getExtensionInstallLocation(e){return this.getExtensionManagementServer(e)===this.remoteExtensionManagementServer?v.Remote:v.Web}};a=l([m(0,b),m(1,p),m(2,f)],a),M(d,a,S.Delayed);export{a as ExtensionManagementServerService};
