var a=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var v=(m,r,o,i)=>{for(var e=i>1?void 0:i?p(r,o):r,c=m.length-1,I;c>=0;c--)(I=m[c])&&(e=(i?I(r,o,e):I(e))||e);return i&&e&&a(r,o,e),e},t=(m,r)=>(o,i)=>r(o,i,m);import{AbstractExtensionsProfileScannerService as s,IExtensionsProfileScannerService as S}from"../../../../../vs/platform/extensionManagement/common/extensionsProfileScannerService.js";import{IFileService as f}from"../../../../../vs/platform/files/common/files.js";import{InstantiationType as l,registerSingleton as y}from"../../../../../vs/platform/instantiation/common/extensions.js";import{ILogService as g}from"../../../../../vs/platform/log/common/log.js";import{ITelemetryService as d}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IUriIdentityService as D}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as U}from"../../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{IWorkbenchEnvironmentService as b}from"../../../../../vs/workbench/services/environment/common/environmentService.js";let n=class extends s{constructor(r,o,i,e,c,I){super(r.userRoamingDataHome,o,i,e,c,I)}};n=v([t(0,b),t(1,f),t(2,U),t(3,D),t(4,d),t(5,g)],n),y(S,n,l.Delayed);export{n as ExtensionsProfileScannerService};
