var p=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var I=(s,o,n,t)=>{for(var e=t>1?void 0:t?S(o,n):o,a=s.length-1,i;a>=0;a--)(i=s[a])&&(e=(t?i(o,n,e):i(e))||e);return t&&e&&p(o,n,e),e},r=(s,o)=>(n,t)=>o(n,t,s);import{IExtensionsProfileScannerService as P}from"../../../../platform/extensionManagement/common/extensionsProfileScannerService.js";import{AbstractExtensionsScannerService as v,IExtensionsScannerService as x}from"../../../../platform/extensionManagement/common/extensionsScannerService.js";import{IFileService as U}from"../../../../platform/files/common/files.js";import{InstantiationType as g,registerSingleton as u}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as D}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as E}from"../../../../platform/log/common/log.js";import{IProductService as h}from"../../../../platform/product/common/productService.js";import{IUriIdentityService as d}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as j}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{IWorkbenchEnvironmentService as y}from"../../environment/common/environmentService.js";import{IUserDataProfileService as T}from"../../userDataProfile/common/userDataProfile.js";let m=class extends v{constructor(o,n,t,e,a,i,f,c,l){super(c.extUri.joinPath(i.userRoamingDataHome,"systemExtensions"),c.extUri.joinPath(i.userRoamingDataHome,"userExtensions"),c.extUri.joinPath(i.userRoamingDataHome,"userExtensions","control.json"),o.currentProfile,n,t,e,a,i,f,c,l)}async getTranslations(){return{}}};m=I([r(0,T),r(1,j),r(2,P),r(3,U),r(4,E),r(5,y),r(6,h),r(7,d),r(8,D)],m),u(x,m,g.Delayed);export{m as ExtensionsScannerService};
