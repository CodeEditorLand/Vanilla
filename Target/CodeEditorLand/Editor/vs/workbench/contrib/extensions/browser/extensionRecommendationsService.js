var h=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var d=(m,s,e,n)=>{for(var o=n>1?void 0:n?p(s,e):s,i=m.length-1,a;i>=0;i--)(a=m[i])&&(o=(n?a(s,e,o):a(o))||o);return n&&o&&h(s,e,o),o},t=(m,s)=>(e,n)=>s(e,n,m);import{shuffle as R}from"../../../../base/common/arrays.js";import{timeout as g}from"../../../../base/common/async.js";import{Emitter as v,Event as f}from"../../../../base/common/event.js";import{Disposable as x,toDisposable as I}from"../../../../base/common/lifecycle.js";import{isString as r}from"../../../../base/common/types.js";import{URI as y}from"../../../../base/common/uri.js";import{IEnvironmentService as u}from"../../../../platform/environment/common/environment.js";import{IExtensionGalleryService as E,IExtensionManagementService as S,InstallOperation as w}from"../../../../platform/extensionManagement/common/extensionManagement.js";import{areSameExtensions as B}from"../../../../platform/extensionManagement/common/extensionManagementUtil.js";import{IExtensionRecommendationNotificationService as b}from"../../../../platform/extensionRecommendations/common/extensionRecommendations.js";import{IInstantiationService as P}from"../../../../platform/instantiation/common/instantiation.js";import{IRemoteExtensionsScannerService as k}from"../../../../platform/remote/common/remoteExtensionsScanner.js";import{ITelemetryService as C}from"../../../../platform/telemetry/common/telemetry.js";import{IExtensionIgnoredRecommendationsService as D}from"../../../services/extensionRecommendations/common/extensionRecommendations.js";import{ILifecycleService as _,LifecyclePhase as L}from"../../../services/lifecycle/common/lifecycle.js";import{IUserDataInitializationService as W}from"../../../services/userData/browser/userDataInit.js";import{IExtensionsWorkbenchService as T}from"../common/extensions.js";import{ConfigBasedRecommendations as A}from"./configBasedRecommendations.js";import{ExeBasedRecommendations as M}from"./exeBasedRecommendations.js";import"./extensionRecommendations.js";import{FileBasedRecommendations as N}from"./fileBasedRecommendations.js";import{KeymapRecommendations as F}from"./keymapRecommendations.js";import{LanguageRecommendations as U}from"./languageRecommendations.js";import{RemoteRecommendations as z}from"./remoteRecommendations.js";import{WebRecommendations as G}from"./webRecommendations.js";import{WorkspaceRecommendations as K}from"./workspaceRecommendations.js";let c=class extends x{constructor(e,n,o,i,a,O,j,q,H,J,Q){super();this.lifecycleService=n;this.galleryService=o;this.telemetryService=i;this.environmentService=a;this.extensionManagementService=O;this.extensionRecommendationsManagementService=j;this.extensionRecommendationNotificationService=q;this.extensionsWorkbenchService=H;this.remoteExtensionsScannerService=J;this.userDataInitializationService=Q;if(this.workspaceRecommendations=this._register(e.createInstance(K)),this.fileBasedRecommendations=this._register(e.createInstance(N)),this.configBasedRecommendations=this._register(e.createInstance(A)),this.exeBasedRecommendations=this._register(e.createInstance(M)),this.keymapRecommendations=this._register(e.createInstance(F)),this.webRecommendations=this._register(e.createInstance(G)),this.languageRecommendations=this._register(e.createInstance(U)),this.remoteRecommendations=this._register(e.createInstance(z)),!this.isEnabled()){this.sessionSeed=0,this.activationPromise=Promise.resolve();return}this.sessionSeed=+new Date,this.activationPromise=this.activate(),this._register(this.extensionManagementService.onDidInstallExtensions(l=>this.onDidInstallExtensions(l)))}fileBasedRecommendations;workspaceRecommendations;configBasedRecommendations;exeBasedRecommendations;keymapRecommendations;webRecommendations;languageRecommendations;remoteRecommendations;activationPromise;sessionSeed;_onDidChangeRecommendations=this._register(new v);onDidChangeRecommendations=this._onDidChangeRecommendations.event;async activate(){try{await Promise.allSettled([this.remoteExtensionsScannerService.whenExtensionsReady(),this.userDataInitializationService.whenInitializationFinished(),this.lifecycleService.when(L.Restored)])}catch{}await Promise.all([this.workspaceRecommendations.activate(),this.configBasedRecommendations.activate(),this.fileBasedRecommendations.activate(),this.keymapRecommendations.activate(),this.languageRecommendations.activate(),this.webRecommendations.activate(),this.remoteRecommendations.activate()]),this._register(f.any(this.workspaceRecommendations.onDidChangeRecommendations,this.configBasedRecommendations.onDidChangeRecommendations,this.extensionRecommendationsManagementService.onDidChangeIgnoredRecommendations)(()=>this._onDidChangeRecommendations.fire())),this._register(this.extensionRecommendationsManagementService.onDidChangeGlobalIgnoredRecommendation(({extensionId:e,isRecommended:n})=>{if(!n){const o=this.getAllRecommendationsWithReason()[e];o&&o.reasonId&&this.telemetryService.publicLog2("extensionsRecommendations:ignoreRecommendation",{extensionId:e,recommendationReason:o.reasonId})}})),this.promptWorkspaceRecommendations()}isEnabled(){return this.galleryService.isEnabled()&&!this.environmentService.isExtensionDevelopment}async activateProactiveRecommendations(){await Promise.all([this.exeBasedRecommendations.activate(),this.configBasedRecommendations.activate()])}getAllRecommendationsWithReason(){this.activateProactiveRecommendations();const e=Object.create(null),n=[...this.configBasedRecommendations.recommendations,...this.exeBasedRecommendations.recommendations,...this.fileBasedRecommendations.recommendations,...this.workspaceRecommendations.recommendations,...this.keymapRecommendations.recommendations,...this.languageRecommendations.recommendations,...this.webRecommendations.recommendations];for(const{extension:o,reason:i}of n)r(o)&&this.isExtensionAllowedToBeRecommended(o)&&(e[o.toLowerCase()]=i);return e}async getConfigBasedRecommendations(){return await this.configBasedRecommendations.activate(),{important:this.toExtensionIds(this.configBasedRecommendations.importantRecommendations),others:this.toExtensionIds(this.configBasedRecommendations.otherRecommendations)}}async getOtherRecommendations(){await this.activationPromise,await this.activateProactiveRecommendations();const e=[...this.configBasedRecommendations.otherRecommendations,...this.exeBasedRecommendations.otherRecommendations,...this.webRecommendations.recommendations],n=this.toExtensionIds(e);return R(n,this.sessionSeed),n}async getImportantRecommendations(){await this.activateProactiveRecommendations();const e=[...this.fileBasedRecommendations.importantRecommendations,...this.configBasedRecommendations.importantRecommendations,...this.exeBasedRecommendations.importantRecommendations],n=this.toExtensionIds(e);return R(n,this.sessionSeed),n}getKeymapRecommendations(){return this.toExtensionIds(this.keymapRecommendations.recommendations)}getLanguageRecommendations(){return this.toExtensionIds(this.languageRecommendations.recommendations)}getRemoteRecommendations(){return this.toExtensionIds(this.remoteRecommendations.recommendations)}async getWorkspaceRecommendations(){if(!this.isEnabled())return[];await this.workspaceRecommendations.activate();const e=[];for(const{extension:n}of this.workspaceRecommendations.recommendations)r(n)?!e.includes(n.toLowerCase())&&this.isExtensionAllowedToBeRecommended(n)&&e.push(n.toLowerCase()):e.push(n);return e}async getExeBasedRecommendations(e){await this.exeBasedRecommendations.activate();const{important:n,others:o}=e?this.exeBasedRecommendations.getRecommendations(e):{important:this.exeBasedRecommendations.importantRecommendations,others:this.exeBasedRecommendations.otherRecommendations};return{important:this.toExtensionIds(n),others:this.toExtensionIds(o)}}getFileBasedRecommendations(){return this.toExtensionIds(this.fileBasedRecommendations.recommendations)}onDidInstallExtensions(e){for(const n of e)if(n.source&&!y.isUri(n.source)&&n.operation===w.Install){const i=(this.getAllRecommendationsWithReason()||{})[n.source.identifier.id.toLowerCase()];i&&this.telemetryService.publicLog("extensionGallery:install:recommendations",{...n.source.telemetryData,recommendationReason:i.reasonId})}}toExtensionIds(e){const n=[];for(const{extension:o}of e)r(o)&&this.isExtensionAllowedToBeRecommended(o)&&!n.includes(o.toLowerCase())&&n.push(o.toLowerCase());return n}isExtensionAllowedToBeRecommended(e){return!this.extensionRecommendationsManagementService.ignoredRecommendations.includes(e.toLowerCase())}async promptWorkspaceRecommendations(){const e=await this.extensionsWorkbenchService.queryLocal(),n=[...this.workspaceRecommendations.recommendations,...this.configBasedRecommendations.importantRecommendations.filter(o=>!o.whenNotInstalled||o.whenNotInstalled.every(i=>e.every(a=>!B(a.identifier,{id:i}))))].map(({extension:o})=>o).filter(o=>!r(o)||this.isExtensionAllowedToBeRecommended(o));n.length&&(await this._registerP(g(5e3)),await this.extensionRecommendationNotificationService.promptWorkspaceRecommendations(n))}_registerP(e){return this._register(I(()=>e.cancel())),e}};c=d([t(0,P),t(1,_),t(2,E),t(3,C),t(4,u),t(5,S),t(6,D),t(7,b),t(8,T),t(9,k),t(10,W)],c);export{c as ExtensionRecommendationsService};
