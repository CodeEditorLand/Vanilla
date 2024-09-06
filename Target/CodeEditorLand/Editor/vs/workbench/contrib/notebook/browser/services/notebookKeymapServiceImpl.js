var v=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var d=(a,i,r,o)=>{for(var e=o>1?void 0:o?h(i,r):i,n=a.length-1,t;n>=0;n--)(t=a[n])&&(e=(o?t(i,r,e):t(e))||e);return o&&e&&v(i,r,e),e},m=(a,i)=>(r,o)=>i(r,o,a);import{distinct as y}from"../../../../../../vs/base/common/arrays.js";import{onUnexpectedError as E}from"../../../../../../vs/base/common/errors.js";import{Event as c}from"../../../../../../vs/base/common/event.js";import{Disposable as S}from"../../../../../../vs/base/common/lifecycle.js";import{localize as l}from"../../../../../../vs/nls.js";import{IExtensionManagementService as x,InstallOperation as u}from"../../../../../../vs/platform/extensionManagement/common/extensionManagement.js";import{areSameExtensions as f}from"../../../../../../vs/platform/extensionManagement/common/extensionManagementUtil.js";import{IInstantiationService as k}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{INotificationService as g,Severity as K}from"../../../../../../vs/platform/notification/common/notification.js";import{IStorageService as M,StorageScope as O,StorageTarget as D}from"../../../../../../vs/platform/storage/common/storage.js";import{Memento as F}from"../../../../../../vs/workbench/common/memento.js";import{getInstalledExtensions as w}from"../../../../../../vs/workbench/contrib/extensions/common/extensionsUtils.js";import"../../../../../../vs/workbench/contrib/notebook/common/notebookKeymapService.js";import{EnablementState as P,IWorkbenchExtensionEnablementService as b}from"../../../../../../vs/workbench/services/extensionManagement/common/extensionManagement.js";import{ILifecycleService as N}from"../../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";function R(a){const i=a.get(x),r=a.get(b),o=c.chain(i.onDidInstallExtensions,e=>e.filter(n=>n.some(({operation:t})=>t===u.Install)).map(n=>n.map(({identifier:t})=>t)));return c.debounce(c.any(c.any(o,c.map(i.onDidUninstallExtension,e=>[e.identifier])),c.map(r.onEnablementChanged,e=>e.map(n=>n.identifier))),(e,n)=>{e=e||(n.length?[n[0]]:[]);for(const t of n)e.some(s=>!f(s,t))&&e.push(t);return e})}const j="hasRecommendedKeymap";let p=class extends S{constructor(r,o,e,n,t){super();this.instantiationService=r;this.extensionEnablementService=o;this.notificationService=e;this.notebookKeymapMemento=new F("notebookKeymap",n),this.notebookKeymap=this.notebookKeymapMemento.getMemento(O.PROFILE,D.USER),this._register(t.onDidShutdown(()=>this.dispose())),this._register(this.instantiationService.invokeFunction(R)(s=>{Promise.all(s.map(I=>this.checkForOtherKeymaps(I))).then(void 0,E)}))}_serviceBrand;notebookKeymapMemento;notebookKeymap;checkForOtherKeymaps(r){return this.instantiationService.invokeFunction(w).then(o=>{const e=o.filter(t=>C(t)),n=e.find(t=>f(t.identifier,r));if(n&&n.globallyEnabled){this.notebookKeymap[j]=!0,this.notebookKeymapMemento.saveMemento();const t=e.filter(s=>!f(s.identifier,r)&&s.globallyEnabled);if(t.length)return this.promptForDisablingOtherKeymaps(n,t)}})}promptForDisablingOtherKeymaps(r,o){const e=n=>{n&&this.extensionEnablementService.setEnablement(o.map(t=>t.local),P.DisabledGlobally)};this.notificationService.prompt(K.Info,l("disableOtherKeymapsConfirmation","Disable other keymaps ({0}) to avoid conflicts between keybindings?",y(o.map(n=>n.local.manifest.displayName)).map(n=>`'${n}'`).join(", ")),[{label:l("yes","Yes"),run:()=>e(!0)},{label:l("no","No"),run:()=>e(!1)}])}};p=d([m(0,k),m(1,b),m(2,g),m(3,M),m(4,N)],p);function C(a){if(a.local.manifest.extensionPack)return!1;const i=a.local.manifest.keywords;return i?i.indexOf("notebook-keymap")!==-1:!1}export{p as NotebookKeymapService,C as isNotebookKeymapExtension};
