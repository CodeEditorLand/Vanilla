var h=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var d=(m,s,e,n)=>{for(var o=n>1?void 0:n?p(s,e):s,i=m.length-1,a;i>=0;i--)(a=m[i])&&(o=(n?a(s,e,o):a(o))||o);return n&&o&&h(s,e,o),o},t=(m,s)=>(e,n)=>s(e,n,m);import{Disposable as g,toDisposable as v}from"../../../../base/common/lifecycle.js";import{IExtensionManagementService as f,IExtensionGalleryService as x,InstallOperation as I}from"../../../../platform/extensionManagement/common/extensionManagement.js";import{IExtensionIgnoredRecommendationsService as y}from"../../../services/extensionRecommendations/common/extensionRecommendations.js";import{IInstantiationService as u}from"../../../../platform/instantiation/common/instantiation.js";import{ITelemetryService as E}from"../../../../platform/telemetry/common/telemetry.js";import{shuffle as R}from"../../../../base/common/arrays.js";import{Emitter as S,Event as w}from"../../../../base/common/event.js";import{IEnvironmentService as B}from"../../../../platform/environment/common/environment.js";import{LifecyclePhase as b,ILifecycleService as P}from"../../../services/lifecycle/common/lifecycle.js";import{ExeBasedRecommendations as k}from"./exeBasedRecommendations.js";import{WorkspaceRecommendations as C}from"./workspaceRecommendations.js";import{FileBasedRecommendations as D}from"./fileBasedRecommendations.js";import{KeymapRecommendations as _}from"./keymapRecommendations.js";import{LanguageRecommendations as L}from"./languageRecommendations.js";import"./extensionRecommendations.js";import{ConfigBasedRecommendations as W}from"./configBasedRecommendations.js";import{IExtensionRecommendationNotificationService as T}from"../../../../platform/extensionRecommendations/common/extensionRecommendations.js";import{timeout as A}from"../../../../base/common/async.js";import{URI as M}from"../../../../base/common/uri.js";import{WebRecommendations as N}from"./webRecommendations.js";import{IExtensionsWorkbenchService as F}from"../common/extensions.js";import{areSameExtensions as U}from"../../../../platform/extensionManagement/common/extensionManagementUtil.js";import{RemoteRecommendations as z}from"./remoteRecommendations.js";import{IRemoteExtensionsScannerService as G}from"../../../../platform/remote/common/remoteExtensionsScanner.js";import{IUserDataInitializationService as K}from"../../../services/userData/browser/userDataInit.js";import{isString as r}from"../../../../base/common/types.js";let c=class extends g{constructor(e,n,o,i,a,O,j,q,H,J,Q){super();this.lifecycleService=n;this.galleryService=o;this.telemetryService=i;this.environmentService=a;this.extensionManagementService=O;this.extensionRecommendationsManagementService=j;this.extensionRecommendationNotificationService=q;this.extensionsWorkbenchService=H;this.remoteExtensionsScannerService=J;this.userDataInitializationService=Q;if(this.workspaceRecommendations=this._register(e.createInstance(C)),this.fileBasedRecommendations=this._register(e.createInstance(D)),this.configBasedRecommendations=this._register(e.createInstance(W)),this.exeBasedRecommendations=this._register(e.createInstance(k)),this.keymapRecommendations=this._register(e.createInstance(_)),this.webRecommendations=this._register(e.createInstance(N)),this.languageRecommendations=this._register(e.createInstance(L)),this.remoteRecommendations=this._register(e.createInstance(z)),!this.isEnabled()){this.sessionSeed=0,this.activationPromise=Promise.resolve();return}this.sessionSeed=+new Date,this.activationPromise=this.activate(),this._register(this.extensionManagementService.onDidInstallExtensions(l=>this.onDidInstallExtensions(l)))}fileBasedRecommendations;workspaceRecommendations;configBasedRecommendations;exeBasedRecommendations;keymapRecommendations;webRecommendations;languageRecommendations;remoteRecommendations;activationPromise;sessionSeed;_onDidChangeRecommendations=this._register(new S);onDidChangeRecommendations=this._onDidChangeRecommendations.event;async activate(){try{await Promise.allSettled([this.remoteExtensionsScannerService.whenExtensionsReady(),this.userDataInitializationService.whenInitializationFinished(),this.lifecycleService.when(b.Restored)])}catch{}await Promise.all([this.workspaceRecommendations.activate(),this.configBasedRecommendations.activate(),this.fileBasedRecommendations.activate(),this.keymapRecommendations.activate(),this.languageRecommendations.activate(),this.webRecommendations.activate(),this.remoteRecommendations.activate()]),this._register(w.any(this.workspaceRecommendations.onDidChangeRecommendations,this.configBasedRecommendations.onDidChangeRecommendations,this.extensionRecommendationsManagementService.onDidChangeIgnoredRecommendations)(()=>this._onDidChangeRecommendations.fire())),this._register(this.extensionRecommendationsManagementService.onDidChangeGlobalIgnoredRecommendation(({extensionId:e,isRecommended:n})=>{if(!n){const o=this.getAllRecommendationsWithReason()[e];o&&o.reasonId&&this.telemetryService.publicLog2("extensionsRecommendations:ignoreRecommendation",{extensionId:e,recommendationReason:o.reasonId})}})),this.promptWorkspaceRecommendations()}isEnabled(){return this.galleryService.isEnabled()&&!this.environmentService.isExtensionDevelopment}async activateProactiveRecommendations(){await Promise.all([this.exeBasedRecommendations.activate(),this.configBasedRecommendations.activate()])}getAllRecommendationsWithReason(){this.activateProactiveRecommendations();const e=Object.create(null),n=[...this.configBasedRecommendations.recommendations,...this.exeBasedRecommendations.recommendations,...this.fileBasedRecommendations.recommendations,...this.workspaceRecommendations.recommendations,...this.keymapRecommendations.recommendations,...this.languageRecommendations.recommendations,...this.webRecommendations.recommendations];for(const{extension:o,reason:i}of n)r(o)&&this.isExtensionAllowedToBeRecommended(o)&&(e[o.toLowerCase()]=i);return e}async getConfigBasedRecommendations(){return await this.configBasedRecommendations.activate(),{important:this.toExtensionIds(this.configBasedRecommendations.importantRecommendations),others:this.toExtensionIds(this.configBasedRecommendations.otherRecommendations)}}async getOtherRecommendations(){await this.activationPromise,await this.activateProactiveRecommendations();const e=[...this.configBasedRecommendations.otherRecommendations,...this.exeBasedRecommendations.otherRecommendations,...this.webRecommendations.recommendations],n=this.toExtensionIds(e);return R(n,this.sessionSeed),n}async getImportantRecommendations(){await this.activateProactiveRecommendations();const e=[...this.fileBasedRecommendations.importantRecommendations,...this.configBasedRecommendations.importantRecommendations,...this.exeBasedRecommendations.importantRecommendations],n=this.toExtensionIds(e);return R(n,this.sessionSeed),n}getKeymapRecommendations(){return this.toExtensionIds(this.keymapRecommendations.recommendations)}getLanguageRecommendations(){return this.toExtensionIds(this.languageRecommendations.recommendations)}getRemoteRecommendations(){return this.toExtensionIds(this.remoteRecommendations.recommendations)}async getWorkspaceRecommendations(){if(!this.isEnabled())return[];await this.workspaceRecommendations.activate();const e=[];for(const{extension:n}of this.workspaceRecommendations.recommendations)r(n)?!e.includes(n.toLowerCase())&&this.isExtensionAllowedToBeRecommended(n)&&e.push(n.toLowerCase()):e.push(n);return e}async getExeBasedRecommendations(e){await this.exeBasedRecommendations.activate();const{important:n,others:o}=e?this.exeBasedRecommendations.getRecommendations(e):{important:this.exeBasedRecommendations.importantRecommendations,others:this.exeBasedRecommendations.otherRecommendations};return{important:this.toExtensionIds(n),others:this.toExtensionIds(o)}}getFileBasedRecommendations(){return this.toExtensionIds(this.fileBasedRecommendations.recommendations)}onDidInstallExtensions(e){for(const n of e)if(n.source&&!M.isUri(n.source)&&n.operation===I.Install){const i=(this.getAllRecommendationsWithReason()||{})[n.source.identifier.id.toLowerCase()];i&&this.telemetryService.publicLog("extensionGallery:install:recommendations",{...n.source.telemetryData,recommendationReason:i.reasonId})}}toExtensionIds(e){const n=[];for(const{extension:o}of e)r(o)&&this.isExtensionAllowedToBeRecommended(o)&&!n.includes(o.toLowerCase())&&n.push(o.toLowerCase());return n}isExtensionAllowedToBeRecommended(e){return!this.extensionRecommendationsManagementService.ignoredRecommendations.includes(e.toLowerCase())}async promptWorkspaceRecommendations(){const e=await this.extensionsWorkbenchService.queryLocal(),n=[...this.workspaceRecommendations.recommendations,...this.configBasedRecommendations.importantRecommendations.filter(o=>!o.whenNotInstalled||o.whenNotInstalled.every(i=>e.every(a=>!U(a.identifier,{id:i}))))].map(({extension:o})=>o).filter(o=>!r(o)||this.isExtensionAllowedToBeRecommended(o));n.length&&(await this._registerP(A(5e3)),await this.extensionRecommendationNotificationService.promptWorkspaceRecommendations(n))}_registerP(e){return this._register(v(()=>e.cancel())),e}};c=d([t(0,u),t(1,P),t(2,x),t(3,E),t(4,B),t(5,f),t(6,y),t(7,T),t(8,F),t(9,G),t(10,K)],c);export{c as ExtensionRecommendationsService};
