var f=Object.defineProperty;var s=Object.getOwnPropertyDescriptor;var p=(m,r,t,i)=>{for(var e=i>1?void 0:i?s(r,t):r,I=m.length-1,v;I>=0;I--)(v=m[I])&&(e=(i?v(r,t,e):v(e))||e);return i&&e&&f(r,t,e),e},o=(m,r)=>(t,i)=>r(t,i,m);import{URI as S}from"../../../../vs/base/common/uri.js";import{INativeEnvironmentService as a}from"../../../../vs/platform/environment/common/environment.js";import{AbstractExtensionsProfileScannerService as l}from"../../../../vs/platform/extensionManagement/common/extensionsProfileScannerService.js";import{IFileService as U}from"../../../../vs/platform/files/common/files.js";import{ILogService as n}from"../../../../vs/platform/log/common/log.js";import{ITelemetryService as y}from"../../../../vs/platform/telemetry/common/telemetry.js";import{IUriIdentityService as d}from"../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as g}from"../../../../vs/platform/userDataProfile/common/userDataProfile.js";let c=class extends l{constructor(r,t,i,e,I,v){super(S.file(r.extensionsPath),t,i,e,I,v)}};c=p([o(0,a),o(1,U),o(2,g),o(3,d),o(4,y),o(5,n)],c);export{c as ExtensionsProfileScannerService};