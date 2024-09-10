var S=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var I=(a,c,e,i)=>{for(var r=i>1?void 0:i?h(c,e):c,t=a.length-1,l;t>=0;t--)(l=a[t])&&(r=(i?l(c,e,r):l(r))||r);return i&&r&&S(c,e,r),r},o=(a,c)=>(e,i)=>c(e,i,a);import{PickerQuickAccessProvider as m}from"../../../../platform/quickinput/browser/pickerQuickAccess.js";import{localize as p}from"../../../../nls.js";import{IExtensionGalleryService as v,IExtensionManagementService as y}from"../../../../platform/extensionManagement/common/extensionManagement.js";import{INotificationService as x}from"../../../../platform/notification/common/notification.js";import{ILogService as u}from"../../../../platform/log/common/log.js";import{IExtensionsWorkbenchService as k}from"../common/extensions.js";let n=class extends m{constructor(e,i,r,t,l){super(n.PREFIX);this.extensionsWorkbenchService=e;this.galleryService=i;this.extensionsService=r;this.notificationService=t;this.logService=l}static PREFIX="ext install ";_getPicks(e,i,r){if(!e)return[{label:p("type","Type an extension name to install or search.")}];const t={label:p("searchFor","Press Enter to search for extension '{0}'.",e),accept:()=>this.extensionsWorkbenchService.openSearch(e)};return/\./.test(e)?this.getPicksForExtensionId(e,t,r):[t]}async getPicksForExtensionId(e,i,r){try{const[t]=await this.galleryService.getExtensions([{id:e}],r);return r.isCancellationRequested?[]:t?[{label:p("install","Press Enter to install extension '{0}'.",e),accept:()=>this.installExtension(t,e)}]:[i]}catch(t){return r.isCancellationRequested?[]:(this.logService.error(t),[i])}}async installExtension(e,i){try{await this.extensionsWorkbenchService.openSearch(`@id:${i}`),await this.extensionsService.installFromGallery(e)}catch(r){this.notificationService.error(r)}}};n=I([o(0,k),o(1,v),o(2,y),o(3,x),o(4,u)],n);let s=class extends m{constructor(e){super(s.PREFIX);this.extensionsWorkbenchService=e}static PREFIX="ext ";_getPicks(){return[{label:p("manage","Press Enter to manage your extensions."),accept:()=>this.extensionsWorkbenchService.openSearch("")}]}};s=I([o(0,k)],s);export{n as InstallExtensionQuickAccessProvider,s as ManageExtensionsQuickAccessProvider};
