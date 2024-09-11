var E=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var c=(l,i,e,t)=>{for(var o=t>1?void 0:t?L(i,e):i,m=l.length-1,n;m>=0;m--)(n=l[m])&&(o=(t?n(i,e,o):n(o))||o);return t&&o&&E(i,e,o),o},r=(l,i)=>(e,t)=>i(e,t,l);import{localize as R}from"../../../../nls.js";import{AbstractTextFileService as y}from"../browser/textFileService.js";import{ITextFileService as C,TextFileEditorModelState as a}from"../common/textfiles.js";import{InstantiationType as O,registerSingleton as P}from"../../../../platform/instantiation/common/extensions.js";import"../../../../base/common/uri.js";import{IFileService as D}from"../../../../platform/files/common/files.js";import{ITextResourceConfigurationService as W}from"../../../../editor/common/services/textResourceConfiguration.js";import{IUntitledTextEditorService as b}from"../../untitled/common/untitledTextEditorService.js";import{ILifecycleService as U}from"../../lifecycle/common/lifecycle.js";import{IInstantiationService as j}from"../../../../platform/instantiation/common/instantiation.js";import{IModelService as k}from"../../../../editor/common/services/model.js";import{INativeWorkbenchEnvironmentService as w}from"../../environment/electron-sandbox/environmentService.js";import{IDialogService as M,IFileDialogService as N}from"../../../../platform/dialogs/common/dialogs.js";import{IFilesConfigurationService as A}from"../../filesConfiguration/common/filesConfigurationService.js";import{ICodeEditorService as _}from"../../../../editor/browser/services/codeEditorService.js";import{IPathService as G}from"../../path/common/pathService.js";import{IWorkingCopyFileService as V}from"../../workingCopy/common/workingCopyFileService.js";import{IUriIdentityService as z}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{ILanguageService as q}from"../../../../editor/common/languages/language.js";import{IElevatedFileService as B}from"../../files/common/elevatedFileService.js";import{ILogService as H}from"../../../../platform/log/common/log.js";import{Promises as J}from"../../../../base/common/async.js";import{IDecorationsService as K}from"../../decorations/common/decorations.js";let s=class extends y{environmentService;constructor(i,e,t,o,m,n,I,v,S,d,p,f,F,g,u,x,h,T){super(i,e,t,o,m,n,I,v,S,d,p,f,F,g,u,h,x,T),this.environmentService=n,this.registerListeners()}registerListeners(){this._register(this.lifecycleService.onWillShutdown(i=>i.join(this.onWillShutdown(),{id:"join.textFiles",label:R("join.textFiles","Saving text files")})))}async onWillShutdown(){let i;for(;(i=this.files.models.filter(e=>e.hasState(a.PENDING_SAVE))).length>0;)await J.settled(i.map(e=>e.joinState(a.PENDING_SAVE)))}async read(i,e){return e=this.ensureLimits(e),super.read(i,e)}async readStream(i,e){return e=this.ensureLimits(e),super.readStream(i,e)}ensureLimits(i){let e;i?e=i:e=Object.create(null);let t;return e.limits?t=e.limits:(t=Object.create(null),e={...e,limits:t}),e}};s=c([r(0,D),r(1,b),r(2,U),r(3,j),r(4,k),r(5,w),r(6,M),r(7,N),r(8,W),r(9,A),r(10,_),r(11,G),r(12,V),r(13,z),r(14,q),r(15,B),r(16,H),r(17,K)],s),P(C,s,O.Eager);export{s as NativeTextFileService};
