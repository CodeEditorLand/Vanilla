var E=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var c=(l,i,e,t)=>{for(var o=t>1?void 0:t?L(i,e):i,m=l.length-1,n;m>=0;m--)(n=l[m])&&(o=(t?n(i,e,o):n(o))||o);return t&&o&&E(i,e,o),o},r=(l,i)=>(e,t)=>i(e,t,l);import{Promises as R}from"../../../../../vs/base/common/async.js";import"../../../../../vs/base/common/uri.js";import{ICodeEditorService as y}from"../../../../../vs/editor/browser/services/codeEditorService.js";import{ILanguageService as C}from"../../../../../vs/editor/common/languages/language.js";import{IModelService as O}from"../../../../../vs/editor/common/services/model.js";import{ITextResourceConfigurationService as P}from"../../../../../vs/editor/common/services/textResourceConfiguration.js";import{localize as D}from"../../../../../vs/nls.js";import{IDialogService as W,IFileDialogService as b}from"../../../../../vs/platform/dialogs/common/dialogs.js";import{IFileService as U}from"../../../../../vs/platform/files/common/files.js";import{InstantiationType as j,registerSingleton as k}from"../../../../../vs/platform/instantiation/common/extensions.js";import{IInstantiationService as w}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as M}from"../../../../../vs/platform/log/common/log.js";import{IUriIdentityService as N}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IDecorationsService as A}from"../../../../../vs/workbench/services/decorations/common/decorations.js";import{INativeWorkbenchEnvironmentService as _}from"../../../../../vs/workbench/services/environment/electron-sandbox/environmentService.js";import{IElevatedFileService as G}from"../../../../../vs/workbench/services/files/common/elevatedFileService.js";import{IFilesConfigurationService as V}from"../../../../../vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";import{ILifecycleService as z}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";import{IPathService as q}from"../../../../../vs/workbench/services/path/common/pathService.js";import{AbstractTextFileService as B}from"../../../../../vs/workbench/services/textfile/browser/textFileService.js";import{ITextFileService as H,TextFileEditorModelState as a}from"../../../../../vs/workbench/services/textfile/common/textfiles.js";import{IUntitledTextEditorService as J}from"../../../../../vs/workbench/services/untitled/common/untitledTextEditorService.js";import{IWorkingCopyFileService as K}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyFileService.js";let s=class extends B{environmentService;constructor(i,e,t,o,m,n,I,v,S,d,p,f,F,g,u,x,h,T){super(i,e,t,o,m,n,I,v,S,d,p,f,F,g,u,h,x,T),this.environmentService=n,this.registerListeners()}registerListeners(){this._register(this.lifecycleService.onWillShutdown(i=>i.join(this.onWillShutdown(),{id:"join.textFiles",label:D("join.textFiles","Saving text files")})))}async onWillShutdown(){let i;for(;(i=this.files.models.filter(e=>e.hasState(a.PENDING_SAVE))).length>0;)await R.settled(i.map(e=>e.joinState(a.PENDING_SAVE)))}async read(i,e){return e=this.ensureLimits(e),super.read(i,e)}async readStream(i,e){return e=this.ensureLimits(e),super.readStream(i,e)}ensureLimits(i){let e;i?e=i:e=Object.create(null);let t;return e.limits?t=e.limits:(t=Object.create(null),e={...e,limits:t}),e}};s=c([r(0,U),r(1,J),r(2,z),r(3,w),r(4,O),r(5,_),r(6,W),r(7,b),r(8,P),r(9,V),r(10,y),r(11,q),r(12,K),r(13,N),r(14,C),r(15,G),r(16,M),r(17,A)],s),k(H,s,j.Eager);export{s as NativeTextFileService};
