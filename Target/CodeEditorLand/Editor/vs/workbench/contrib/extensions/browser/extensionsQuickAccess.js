var v=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var l=(a,o,e,i)=>{for(var r=i>1?void 0:i?k(o,e):o,t=a.length-1,p;t>=0;t--)(p=a[t])&&(r=(i?p(o,e,r):p(r))||r);return i&&r&&v(o,e,r),r},n=(a,o)=>(e,i)=>o(e,i,a);import"../../../../../vs/base/common/cancellation.js";import"../../../../../vs/base/common/lifecycle.js";import{localize as m}from"../../../../../vs/nls.js";import{IExtensionGalleryService as u,IExtensionManagementService as y}from"../../../../../vs/platform/extensionManagement/common/extensionManagement.js";import{ILogService as x}from"../../../../../vs/platform/log/common/log.js";import{INotificationService as h}from"../../../../../vs/platform/notification/common/notification.js";import{PickerQuickAccessProvider as P}from"../../../../../vs/platform/quickinput/browser/pickerQuickAccess.js";import"../../../../../vs/platform/quickinput/common/quickInput.js";import{ViewContainerLocation as C}from"../../../../../vs/workbench/common/views.js";import{VIEWLET_ID as g}from"../../../../../vs/workbench/contrib/extensions/common/extensions.js";import{IPaneCompositePartService as S}from"../../../../../vs/workbench/services/panecomposite/browser/panecomposite.js";let c=class extends P{constructor(e,i,r,t,p){super(c.PREFIX);this.paneCompositeService=e;this.galleryService=i;this.extensionsService=r;this.notificationService=t;this.logService=p}static PREFIX="ext install ";_getPicks(e,i,r){if(!e)return[{label:m("type","Type an extension name to install or search.")}];const t={label:m("searchFor","Press Enter to search for extension '{0}'.",e),accept:()=>this.searchExtension(e)};return/\./.test(e)?this.getPicksForExtensionId(e,t,r):[t]}async getPicksForExtensionId(e,i,r){try{const[t]=await this.galleryService.getExtensions([{id:e}],r);return r.isCancellationRequested?[]:t?[{label:m("install","Press Enter to install extension '{0}'.",e),accept:()=>this.installExtension(t,e)}]:[i]}catch(t){return r.isCancellationRequested?[]:(this.logService.error(t),[i])}}async installExtension(e,i){try{await I(this.paneCompositeService,`@id:${i}`),await this.extensionsService.installFromGallery(e)}catch(r){this.notificationService.error(r)}}async searchExtension(e){I(this.paneCompositeService,e)}};c=l([n(0,S),n(1,u),n(2,y),n(3,h),n(4,x)],c);let s=class extends P{constructor(e){super(s.PREFIX);this.paneCompositeService=e}static PREFIX="ext ";_getPicks(){return[{label:m("manage","Press Enter to manage your extensions."),accept:()=>I(this.paneCompositeService)}]}};s=l([n(0,S)],s);async function I(a,o=""){const i=(await a.openPaneComposite(g,C.Sidebar,!0))?.getViewPaneContainer();i?.search(o),i?.focus()}export{c as InstallExtensionQuickAccessProvider,s as ManageExtensionsQuickAccessProvider};
