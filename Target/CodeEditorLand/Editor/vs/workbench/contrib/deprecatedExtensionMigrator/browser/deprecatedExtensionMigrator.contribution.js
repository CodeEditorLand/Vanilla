var v=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var S=(a,e,i,t)=>{for(var r=t>1?void 0:t?p(e,i):e,o=a.length-1,s;o>=0;o--)(s=a[o])&&(r=(t?s(e,i,r):s(r))||r);return t&&r&&v(e,i,r),r},n=(a,e)=>(i,t)=>e(i,t,a);import{Action as m}from"../../../../base/common/actions.js";import{onUnexpectedError as g}from"../../../../base/common/errors.js";import{isDefined as h}from"../../../../base/common/types.js";import{localize as l}from"../../../../nls.js";import{ConfigurationTarget as u,IConfigurationService as y}from"../../../../platform/configuration/common/configuration.js";import{INotificationService as k,Severity as I}from"../../../../platform/notification/common/notification.js";import{IOpenerService as P}from"../../../../platform/opener/common/opener.js";import{Registry as C}from"../../../../platform/registry/common/platform.js";import{IStorageService as E,StorageScope as b,StorageTarget as x}from"../../../../platform/storage/common/storage.js";import{Extensions as W}from"../../../common/contributions.js";import{EnablementState as f}from"../../../services/extensionManagement/common/extensionManagement.js";import{LifecyclePhase as w}from"../../../services/lifecycle/common/lifecycle.js";import{IExtensionsWorkbenchService as z}from"../../extensions/common/extensions.js";let c=class{constructor(e,i,t,r,o){this.configurationService=e;this.extensionsWorkbenchService=i;this.storageService=t;this.notificationService=r;this.openerService=o;this.init().catch(g)}async init(){const e="coenraads.bracket-pair-colorizer";await this.extensionsWorkbenchService.queryLocal();const i=this.extensionsWorkbenchService.installed.find(d=>d.identifier.id===e);if(!i||i.enablementState!==f.EnabledGlobally&&i.enablementState!==f.EnabledWorkspace)return;const t=await this.getState();if(t.disablementLog.some(d=>d.extensionId===e))return;t.disablementLog.push({extensionId:e,disablementDateTime:new Date().getTime()}),await this.setState(t),await this.extensionsWorkbenchService.setEnablement(i,f.DisabledGlobally);const o="editor.bracketPairColorization.enabled",s=!!this.configurationService.inspect(o).user;this.notificationService.notify({message:l("bracketPairColorizer.notification","The extension 'Bracket pair Colorizer' got disabled because it was deprecated."),severity:I.Info,actions:{primary:[new m("",l("bracketPairColorizer.notification.action.uninstall","Uninstall Extension"),void 0,void 0,()=>{this.extensionsWorkbenchService.uninstall(i)})],secondary:[s?void 0:new m("",l("bracketPairColorizer.notification.action.enableNative","Enable Native Bracket Pair Colorization"),void 0,void 0,()=>{this.configurationService.updateValue(o,!0,u.USER)}),new m("",l("bracketPairColorizer.notification.action.showMoreInfo","More Info"),void 0,void 0,()=>{this.openerService.open("https://github.com/microsoft/vscode/issues/155179")})].filter(h)}})}storageKey="deprecatedExtensionMigrator.state";async getState(){const e=await this.storageService.get(this.storageKey,b.APPLICATION,"");return e===""?{disablementLog:[]}:JSON.parse(e)}async setState(e){const i=JSON.stringify(e);await this.storageService.store(this.storageKey,i,b.APPLICATION,x.USER)}};c=S([n(0,y),n(1,z),n(2,E),n(3,k),n(4,P)],c),C.as(W.Workbench).registerWorkbenchContribution(c,w.Restored);
