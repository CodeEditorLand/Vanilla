var R=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var v=(c,s,e,o)=>{for(var i=o>1?void 0:o?T(s,e):s,r=c.length-1,f;r>=0;r--)(f=c[r])&&(i=(o?f(s,e,i):f(i))||i);return o&&i&&R(s,e,i),i},t=(c,s)=>(e,o)=>s(e,o,c);import{Action as d}from"../../../../../vs/base/common/actions.js";import{VSBuffer as w}from"../../../../../vs/base/common/buffer.js";import"../../../../../vs/base/common/event.js";import{Schemas as A}from"../../../../../vs/base/common/network.js";import{joinPath as B}from"../../../../../vs/base/common/resources.js";import{URI as F}from"../../../../../vs/base/common/uri.js";import*as p from"../../../../../vs/nls.js";import{IClipboardService as k}from"../../../../../vs/platform/clipboard/common/clipboardService.js";import{IContextKeyService as O,RawContextKey as x}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as N}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IFileDialogService as U}from"../../../../../vs/platform/dialogs/common/dialogs.js";import"../../../../../vs/platform/extensions/common/extensions.js";import{IFileService as W}from"../../../../../vs/platform/files/common/files.js";import{IHoverService as z}from"../../../../../vs/platform/hover/browser/hover.js";import{createDecorator as K,IInstantiationService as M}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ILabelService as V}from"../../../../../vs/platform/label/common/label.js";import{INotificationService as X}from"../../../../../vs/platform/notification/common/notification.js";import{Utils as j}from"../../../../../vs/platform/profiling/common/profiling.js";import{IStorageService as G}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as J}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IThemeService as $}from"../../../../../vs/platform/theme/common/themeService.js";import{AbstractRuntimeExtensionsEditor as q}from"../../../../../vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor.js";import{IExtensionsWorkbenchService as Q}from"../../../../../vs/workbench/contrib/extensions/common/extensions.js";import{ReportExtensionIssueAction as Y}from"../../../../../vs/workbench/contrib/extensions/common/reportExtensionIssueAction.js";import{SlowExtensionAction as Z}from"../../../../../vs/workbench/contrib/extensions/electron-sandbox/extensionsSlowActions.js";import"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IWorkbenchEnvironmentService as u}from"../../../../../vs/workbench/services/environment/common/environmentService.js";import{IExtensionFeaturesManagementService as ee}from"../../../../../vs/workbench/services/extensionManagement/common/extensionFeatures.js";import{IExtensionService as ie}from"../../../../../vs/workbench/services/extensions/common/extensions.js";const I=K("extensionHostProfileService"),te=new x("profileSessionState","none"),oe=new x("extensionHostProfileRecorded",!1);var P=(i=>(i[i.None=0]="None",i[i.Starting=1]="Starting",i[i.Running=2]="Running",i[i.Stopping=3]="Stopping",i))(P||{});let m=class extends q{constructor(e,o,i,r,f,S,h,_,E,g,H,y,L,re,D,b){super(e,o,i,r,f,S,h,_,E,g,H,y,L,D,b);this._extensionHostProfileService=re;this._profileInfo=this._extensionHostProfileService.lastProfile,this._extensionsHostRecorded=oe.bindTo(r),this._profileSessionState=te.bindTo(r),this._register(this._extensionHostProfileService.onDidChangeLastProfile(()=>{this._profileInfo=this._extensionHostProfileService.lastProfile,this._extensionsHostRecorded.set(!!this._profileInfo),this._updateExtensions()})),this._register(this._extensionHostProfileService.onDidChangeState(()=>{const C=this._extensionHostProfileService.state;this._profileSessionState.set(P[C].toLowerCase())}))}_profileInfo;_extensionsHostRecorded;_profileSessionState;_getProfileInfo(){return this._profileInfo}_getUnresponsiveProfile(e){return this._extensionHostProfileService.getUnresponsiveProfile(e)}_createSlowExtensionAction(e){return e.unresponsiveProfile?this._instantiationService.createInstance(Z,e.description,e.unresponsiveProfile):null}_createReportExtensionIssueAction(e){return e.marketplaceInfo?this._instantiationService.createInstance(Y,e.description):null}_createSaveExtensionHostProfileAction(){return this._instantiationService.createInstance(l,l.ID,l.LABEL)}_createProfileAction(){return this._extensionHostProfileService.state===2?this._instantiationService.createInstance(a,a.ID,a.LABEL):this._instantiationService.createInstance(n,n.ID,n.LABEL)}};m=v([t(1,J),t(2,$),t(3,O),t(4,Q),t(5,ie),t(6,X),t(7,N),t(8,M),t(9,G),t(10,V),t(11,u),t(12,k),t(13,I),t(14,ee),t(15,z)],m);let n=class extends d{constructor(e=n.ID,o=n.LABEL,i){super(e,o);this._extensionHostProfileService=i}static ID="workbench.extensions.action.extensionHostProfile";static LABEL=p.localize("extensionHostProfileStart","Start Extension Host Profile");run(){return this._extensionHostProfileService.startProfiling(),Promise.resolve()}};n=v([t(2,I)],n);let a=class extends d{constructor(e=n.ID,o=n.LABEL,i){super(e,o);this._extensionHostProfileService=i}static ID="workbench.extensions.action.stopExtensionHostProfile";static LABEL=p.localize("stopExtensionHostProfileStart","Stop Extension Host Profile");run(){return this._extensionHostProfileService.stopProfiling(),Promise.resolve()}};a=v([t(2,I)],a);let l=class extends d{constructor(e=l.ID,o=l.LABEL,i,r,f,S){super(e,o,void 0,!1);this._environmentService=i;this._extensionHostProfileService=r;this._fileService=f;this._fileDialogService=S;this._extensionHostProfileService.onDidChangeLastProfile(()=>{this.enabled=this._extensionHostProfileService.lastProfile!==null})}static LABEL=p.localize("saveExtensionHostProfile","Save Extension Host Profile");static ID="workbench.extensions.action.saveExtensionHostProfile";run(){return Promise.resolve(this._asyncRun())}async _asyncRun(){const e=await this._fileDialogService.showSaveDialog({title:p.localize("saveprofile.dialogTitle","Save Extension Host Profile"),availableFileSystems:[A.file],defaultUri:B(await this._fileDialogService.defaultFilePath(),`CPU-${new Date().toISOString().replace(/[\-:]/g,"")}.cpuprofile`),filters:[{name:"CPU Profiles",extensions:["cpuprofile","txt"]}]});if(!e)return;const o=this._extensionHostProfileService.lastProfile;let i=o?o.data:{},r=e.fsPath;return this._environmentService.isBuilt&&(i=j.rewriteAbsolutePaths(i,"piiRemoved"),r=r+".txt"),this._fileService.writeFile(F.file(r),w.fromString(JSON.stringify(o?o.data:{},null,"	")))}};l=v([t(2,u),t(3,I),t(4,W),t(5,U)],l);export{oe as CONTEXT_EXTENSION_HOST_PROFILE_RECORDED,te as CONTEXT_PROFILE_SESSION_STATE,I as IExtensionHostProfileService,P as ProfileSessionState,m as RuntimeExtensionsEditor,l as SaveExtensionHostProfileAction,n as StartExtensionHostProfileAction,a as StopExtensionHostProfileAction};