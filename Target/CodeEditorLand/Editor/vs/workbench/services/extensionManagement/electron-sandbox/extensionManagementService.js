var y=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var s=(a,t,r,i)=>{for(var o=i>1?void 0:i?D(t,r):t,n=a.length-1,m;n>=0;n--)(m=a[n])&&(o=(i?m(t,r,o):m(o))||o);return i&&o&&y(t,r,o),o},e=(a,t)=>(r,i)=>t(r,i,a);import{Schemas as h}from"../../../../base/common/network.js";import{joinPath as M}from"../../../../base/common/resources.js";import"../../../../base/common/uri.js";import{generateUuid as P}from"../../../../base/common/uuid.js";import{IConfigurationService as U}from"../../../../platform/configuration/common/configuration.js";import{IDialogService as w}from"../../../../platform/dialogs/common/dialogs.js";import{IDownloadService as b}from"../../../../platform/download/common/download.js";import{IExtensionGalleryService as k}from"../../../../platform/extensionManagement/common/extensionManagement.js";import{IExtensionsScannerService as L}from"../../../../platform/extensionManagement/common/extensionsScannerService.js";import{IFileService as R}from"../../../../platform/files/common/files.js";import{InstantiationType as T,registerSingleton as W}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as q}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as C}from"../../../../platform/log/common/log.js";import{IProductService as F}from"../../../../platform/product/common/productService.js";import{ITelemetryService as G}from"../../../../platform/telemetry/common/telemetry.js";import{IUserDataSyncEnablementService as N}from"../../../../platform/userDataSync/common/userDataSync.js";import{IWorkspaceTrustRequestService as O}from"../../../../platform/workspace/common/workspaceTrust.js";import{INativeWorkbenchEnvironmentService as V}from"../../environment/electron-sandbox/environmentService.js";import{IExtensionManifestPropertiesService as X}from"../../extensions/common/extensionManifestPropertiesService.js";import{IUserDataProfileService as j}from"../../userDataProfile/common/userDataProfile.js";import{IExtensionManagementServerService as B,IWorkbenchExtensionManagementService as z}from"../common/extensionManagement.js";import{ExtensionManagementService as A}from"../common/extensionManagementService.js";let c=class extends A{constructor(r,i,o,n,m,S,v,I,l,p,f,d,E,g,u,x){super(i,o,n,m,S,v,I,l,p,f,d,E,g,u,x);this.environmentService=r}async installVSIXInServer(r,i,o){if(r.scheme===h.vscodeRemote&&i===this.extensionManagementServerService.localExtensionManagementServer){const n=M(this.environmentService.tmpDir,P());await this.downloadService.download(r,n),r=n}return super.installVSIXInServer(r,i,o)}};c=s([e(0,V),e(1,B),e(2,k),e(3,j),e(4,U),e(5,F),e(6,b),e(7,N),e(8,w),e(9,O),e(10,X),e(11,R),e(12,C),e(13,q),e(14,L),e(15,G)],c),W(z,c,T.Delayed);export{c as ExtensionManagementService};
