var k=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var g=(c,e,n,t)=>{for(var i=t>1?void 0:t?N(e,n):e,r=c.length-1,d;r>=0;r--)(d=c[r])&&(i=(t?d(e,n,i):d(i))||i);return t&&i&&k(e,n,i),i},o=(c,e)=>(n,t)=>e(n,t,c);import{disposableWindowInterval as _}from"../../../../base/browser/dom.js";import{mainWindow as D}from"../../../../base/browser/window.js";import{isCancellationError as A}from"../../../../base/common/errors.js";import{combinedDisposable as P}from"../../../../base/common/lifecycle.js";import{URI as K}from"../../../../base/common/uri.js";import{localize as u,localize2 as E}from"../../../../nls.js";import{Action2 as W,MenuId as B,registerAction2 as z}from"../../../../platform/actions/common/actions.js";import{ICommandService as M}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as F}from"../../../../platform/configuration/common/configuration.js";import{IsWebContext as J}from"../../../../platform/contextkey/common/contextkeys.js";import{IDialogService as $}from"../../../../platform/dialogs/common/dialogs.js";import{ExtensionIdentifier as a}from"../../../../platform/extensions/common/extensions.js";import{InstantiationType as V,registerSingleton as Q}from"../../../../platform/instantiation/common/extensions.js";import{createDecorator as Y}from"../../../../platform/instantiation/common/instantiation.js";import{INotificationService as j}from"../../../../platform/notification/common/notification.js";import{IProductService as G}from"../../../../platform/product/common/productService.js";import{IQuickInputService as X}from"../../../../platform/quickinput/common/quickInput.js";import{IStorageService as U,StorageScope as f,StorageTarget as y}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as q}from"../../../../platform/telemetry/common/telemetry.js";import{IURLService as R}from"../../../../platform/url/common/url.js";import{registerWorkbenchContribution2 as Z,WorkbenchPhase as ee}from"../../../common/contributions.js";import{IWorkbenchEnvironmentService as te}from"../../environment/common/environmentService.js";import{IHostService as ne}from"../../host/browser/host.js";import{ActivationKind as ie,IExtensionService as re}from"../common/extensions.js";const oe=5*60*1e3,se=30*1e3,I="extensionUrlHandler.urlToHandle",ae="extensions.confirmedUriHandlerExtensionIds",b="extensionUrlHandler.confirmedExtensions";function H(c){return/^[a-z0-9][a-z0-9\-]*\.[a-z0-9][a-z0-9\-]*$/i.test(c)}class L{constructor(e){this.storageService=e}get extensions(){const e=this.storageService.get(b,f.PROFILE,"[]");try{return JSON.parse(e)}catch{return[]}}has(e){return this.extensions.indexOf(e)>-1}add(e){this.set([...this.extensions,e])}set(e){this.storageService.store(b,JSON.stringify(e),f.PROFILE,y.MACHINE)}}const le=Y("extensionUrlHandler");let p=class{constructor(e,n,t,i,r,d,m,x,h,l,v){this.extensionService=n;this.dialogService=t;this.commandService=i;this.hostService=r;this.storageService=d;this.configurationService=m;this.telemetryService=x;this.notificationService=h;this.productService=l;this.workbenchEnvironmentService=v;this.userTrustedExtensionsStorage=new L(d);const C=_(D,()=>this.garbageCollect(),se),S=this.storageService.get(I,f.WORKSPACE);S&&(this.storageService.remove(I,f.WORKSPACE),this.handleURL(K.revive(JSON.parse(S)),{trusted:!0})),this.disposable=P(e.registerHandler(this),C);const w=s.cache;setTimeout(()=>w.forEach(([O,T])=>this.handleURL(O,T)))}_serviceBrand;extensionHandlers=new Map;uriBuffer=new Map;userTrustedExtensionsStorage;disposable;async handleURL(e,n){if(!H(e.authority))return!1;const t=e.authority;this.telemetryService.publicLog2("uri_invoked/start",{extensionId:t});const i=this.extensionHandlers.get(a.toKey(t));let r;if(i)r=i.extensionDisplayName;else{const l=await this.extensionService.getExtension(t);if(l)r=l.displayName??"";else return await this.handleUnhandledURL(e,t,n),!0}if(!(n?.trusted||this.productService.trustedExtensionProtocolHandlers?.includes(t)||this.didUserTrustExtension(a.toKey(t)))){let l=e.toString(!1);l.length>40&&(l=`${l.substring(0,30)}...${l.substring(l.length-5)}`);const v=await this.dialogService.confirm({message:u("confirmUrl","Allow '{0}' extension to open this URI?",r),checkbox:{label:u("rememberConfirmUrl","Do not ask me again for this extension")},detail:l,primaryButton:u({key:"open",comment:["&& denotes a mnemonic"]},"&&Open")});if(!v.confirmed)return this.telemetryService.publicLog2("uri_invoked/cancel",{extensionId:t}),!0;v.checkboxChecked&&this.userTrustedExtensionsStorage.add(a.toKey(t))}const m=this.extensionHandlers.get(a.toKey(t));if(m)return i?!1:await this.handleURLByExtension(t,m,e,n);const x=new Date().getTime();let h=this.uriBuffer.get(a.toKey(t));return h||(h=[],this.uriBuffer.set(a.toKey(t),h)),h.push({timestamp:x,uri:e}),await this.extensionService.activateByEvent(`onUri:${a.toKey(t)}`,ie.Immediate),!0}registerExtensionHandler(e,n){this.extensionHandlers.set(a.toKey(e),n);const t=this.uriBuffer.get(a.toKey(e))||[];for(const{uri:i}of t)this.handleURLByExtension(e,n,i);this.uriBuffer.delete(a.toKey(e))}unregisterExtensionHandler(e){this.extensionHandlers.delete(a.toKey(e))}async handleURLByExtension(e,n,t,i){return this.telemetryService.publicLog2("uri_invoked/end",{extensionId:a.toKey(e)}),await n.handleURL(t,i)}async handleUnhandledURL(e,n,t){this.telemetryService.publicLog2("uri_invoked/install_extension/start",{extensionId:n});try{await this.commandService.executeCommand("workbench.extensions.installExtension",n,{justification:{reason:`${u("installDetail","This extension wants to open a URI:")}
${e.toString()}`,action:u("openUri","Open URI")},enable:!0}),this.telemetryService.publicLog2("uri_invoked/install_extension/accept",{extensionId:n})}catch(r){A(r)?this.telemetryService.publicLog2("uri_invoked/install_extension/cancel",{extensionId:n}):(this.telemetryService.publicLog2("uri_invoked/install_extension/error",{extensionId:n}),this.notificationService.error(r));return}if(await this.extensionService.getExtension(n))await this.handleURL(e,{...t,trusted:!0});else{if(this.telemetryService.publicLog2("uri_invoked/install_extension/reload",{extensionId:n,isRemote:!!this.workbenchEnvironmentService.remoteAuthority}),!(await this.dialogService.confirm({message:u("reloadAndHandle","Extension '{0}' is not loaded. Would you like to reload the window to load the extension and open the URL?",n),primaryButton:u({key:"reloadAndOpen",comment:["&& denotes a mnemonic"]},"&&Reload Window and Open")})).confirmed)return;this.storageService.store(I,JSON.stringify(e.toJSON()),f.WORKSPACE,y.MACHINE),await this.hostService.reload()}}garbageCollect(){const e=new Date().getTime(),n=new Map;this.uriBuffer.forEach((t,i)=>{t=t.filter(({timestamp:r})=>e-r<oe),t.length>0&&n.set(i,t)}),this.uriBuffer=n}didUserTrustExtension(e){return this.userTrustedExtensionsStorage.has(e)?!0:this.getConfirmedTrustedExtensionIdsFromConfiguration().indexOf(e)>-1}getConfirmedTrustedExtensionIdsFromConfiguration(){const e=this.configurationService.getValue(ae);return Array.isArray(e)?e:[]}dispose(){this.disposable.dispose(),this.extensionHandlers.clear(),this.uriBuffer.clear()}};p=g([o(0,R),o(1,re),o(2,$),o(3,M),o(4,ne),o(5,U),o(6,F),o(7,q),o(8,j),o(9,G),o(10,te)],p),Q(le,p,V.Eager);let s=class{static ID="workbench.contrib.extensionUrlBootstrapHandler";static _cache=[];static disposable;static get cache(){s.disposable.dispose();const e=s._cache;return s._cache=[],e}constructor(e){s.disposable=e.registerHandler(this)}async handleURL(e,n){return H(e.authority)?(s._cache.push([e,n]),!0):!1}};s=g([o(0,R)],s),Z(s.ID,s,ee.BlockRestore);class ce extends W{constructor(){super({id:"workbench.extensions.action.manageAuthorizedExtensionURIs",title:E("manage","Manage Authorized Extension URIs..."),category:E("extensions","Extensions"),menu:{id:B.CommandPalette,when:J.toNegated()}})}async run(e){const n=e.get(U),t=e.get(X),i=new L(n),r=i.extensions.map(m=>({label:m,picked:!0}));if(r.length===0){await t.pick([{label:u("no","There are currently no authorized extension URIs.")}]);return}const d=await t.pick(r,{canPickMany:!0});d&&i.set(d.map(m=>m.label))}}z(ce);export{le as IExtensionUrlHandler};
