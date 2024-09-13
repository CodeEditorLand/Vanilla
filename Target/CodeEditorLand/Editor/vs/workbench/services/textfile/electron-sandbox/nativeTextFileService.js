var T=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var c=(l,i,e,t)=>{for(var o=t>1?void 0:t?E(i,e):i,m=l.length-1,n;m>=0;m--)(n=l[m])&&(o=(t?n(i,e,o):n(o))||o);return t&&o&&T(i,e,o),o},r=(l,i)=>(e,t)=>i(e,t,l);import{Promises as L}from"../../../../base/common/async.js";import{ICodeEditorService as R}from"../../../../editor/browser/services/codeEditorService.js";import{ILanguageService as C}from"../../../../editor/common/languages/language.js";import{IModelService as O}from"../../../../editor/common/services/model.js";import{ITextResourceConfigurationService as P}from"../../../../editor/common/services/textResourceConfiguration.js";import{localize as b}from"../../../../nls.js";import{IDialogService as D,IFileDialogService as W}from"../../../../platform/dialogs/common/dialogs.js";import{IFileService as j}from"../../../../platform/files/common/files.js";import{InstantiationType as U,registerSingleton as k}from"../../../../platform/instantiation/common/extensions.js";import{IInstantiationService as w}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as M}from"../../../../platform/log/common/log.js";import{IUriIdentityService as N}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IDecorationsService as A}from"../../decorations/common/decorations.js";import{INativeWorkbenchEnvironmentService as _}from"../../environment/electron-sandbox/environmentService.js";import{IElevatedFileService as G}from"../../files/common/elevatedFileService.js";import{IFilesConfigurationService as V}from"../../filesConfiguration/common/filesConfigurationService.js";import{ILifecycleService as z}from"../../lifecycle/common/lifecycle.js";import{IPathService as q}from"../../path/common/pathService.js";import{IUntitledTextEditorService as B}from"../../untitled/common/untitledTextEditorService.js";import{IWorkingCopyFileService as H}from"../../workingCopy/common/workingCopyFileService.js";import{AbstractTextFileService as J}from"../browser/textFileService.js";import{ITextFileService as K,TextFileEditorModelState as a}from"../common/textfiles.js";let s=class extends J{environmentService;constructor(i,e,t,o,m,n,I,v,S,d,p,f,u,F,g,x,h,y){super(i,e,t,o,m,n,I,v,S,d,p,f,u,F,g,h,x,y),this.environmentService=n,this.registerListeners()}registerListeners(){this._register(this.lifecycleService.onWillShutdown(i=>i.join(this.onWillShutdown(),{id:"join.textFiles",label:b("join.textFiles","Saving text files")})))}async onWillShutdown(){let i;for(;(i=this.files.models.filter(e=>e.hasState(a.PENDING_SAVE))).length>0;)await L.settled(i.map(e=>e.joinState(a.PENDING_SAVE)))}async read(i,e){return e=this.ensureLimits(e),super.read(i,e)}async readStream(i,e){return e=this.ensureLimits(e),super.readStream(i,e)}ensureLimits(i){let e;i?e=i:e=Object.create(null);let t;return e.limits?t=e.limits:(t=Object.create(null),e={...e,limits:t}),e}};s=c([r(0,j),r(1,B),r(2,z),r(3,w),r(4,O),r(5,_),r(6,D),r(7,W),r(8,P),r(9,V),r(10,R),r(11,q),r(12,H),r(13,N),r(14,C),r(15,G),r(16,M),r(17,A)],s),k(K,s,U.Eager);export{s as NativeTextFileService};
