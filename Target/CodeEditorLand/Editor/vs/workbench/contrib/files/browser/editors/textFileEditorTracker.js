var f=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var c=(n,o,e,i)=>{for(var r=i>1?void 0:i?S(o,e):o,s=n.length-1,d;s>=0;s--)(d=n[s])&&(r=(i?d(o,e,r):d(r))||r);return i&&r&&f(o,e,r),r},t=(n,o)=>(e,i)=>o(e,i,n);import{coalesce as h,distinct as v}from"../../../../../../vs/base/common/arrays.js";import{RunOnceWorker as u}from"../../../../../../vs/base/common/async.js";import{Disposable as m}from"../../../../../../vs/base/common/lifecycle.js";import{Schemas as a}from"../../../../../../vs/base/common/network.js";import"../../../../../../vs/base/common/uri.js";import{ICodeEditorService as y}from"../../../../../../vs/editor/browser/services/codeEditorService.js";import"../../../../../../vs/workbench/common/contributions.js";import{DEFAULT_EDITOR_ASSOCIATION as I}from"../../../../../../vs/workbench/common/editor.js";import{FILE_EDITOR_INPUT_ID as D}from"../../../../../../vs/workbench/contrib/files/common/files.js";import{IEditorService as g}from"../../../../../../vs/workbench/services/editor/common/editorService.js";import{IFilesConfigurationService as F}from"../../../../../../vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";import{IHostService as E}from"../../../../../../vs/workbench/services/host/browser/host.js";import{ILifecycleService as x}from"../../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";import{ITextFileService as C,TextFileEditorModelState as p}from"../../../../../../vs/workbench/services/textfile/common/textfiles.js";import{UntitledTextEditorInput as k}from"../../../../../../vs/workbench/services/untitled/common/untitledTextEditorInput.js";import{IWorkingCopyEditorService as O}from"../../../../../../vs/workbench/services/workingCopy/common/workingCopyEditorService.js";let l=class extends m{constructor(e,i,r,s,d,T,A){super();this.editorService=e;this.textFileService=i;this.lifecycleService=r;this.hostService=s;this.codeEditorService=d;this.filesConfigurationService=T;this.workingCopyEditorService=A;this.registerListeners()}static ID="workbench.contrib.textFileEditorTracker";registerListeners(){this._register(this.textFileService.files.onDidChangeDirty(e=>this.ensureDirtyFilesAreOpenedWorker.work(e.resource))),this._register(this.textFileService.files.onDidSaveError(e=>this.ensureDirtyFilesAreOpenedWorker.work(e.resource))),this._register(this.textFileService.untitled.onDidChangeDirty(e=>this.ensureDirtyFilesAreOpenedWorker.work(e.resource))),this._register(this.hostService.onDidChangeFocus(e=>e?this.reloadVisibleTextFileEditors():void 0)),this._register(this.lifecycleService.onDidShutdown(()=>this.dispose()))}ensureDirtyFilesAreOpenedWorker=this._register(new u(e=>this.ensureDirtyTextFilesAreOpened(e),this.getDirtyTextFileTrackerDelay()));getDirtyTextFileTrackerDelay(){return 800}ensureDirtyTextFilesAreOpened(e){this.doEnsureDirtyTextFilesAreOpened(v(e.filter(i=>{if(!this.textFileService.isDirty(i))return!1;const r=this.textFileService.files.get(i);if(r?.hasState(p.PENDING_SAVE)||i.scheme!==a.untitled&&!r?.hasState(p.ERROR)&&this.filesConfigurationService.hasShortAutoSaveDelay(i)||this.editorService.isOpened({resource:i,typeId:i.scheme===a.untitled?k.ID:D,editorId:I.id}))return!1;const s=r??this.textFileService.untitled.get(i);return!(s&&this.workingCopyEditorService.findEditor(s))}),i=>i.toString()))}doEnsureDirtyTextFilesAreOpened(e){e.length&&this.editorService.openEditors(e.map(i=>({resource:i,options:{inactive:!0,pinned:!0,preserveFocus:!0}})))}reloadVisibleTextFileEditors(){v(h(this.codeEditorService.listCodeEditors().map(e=>{const i=e.getModel()?.uri;if(!i)return;const r=this.textFileService.files.get(i);if(!(!r||r.isDirty()||!r.isResolved()))return r})),e=>e.resource.toString()).forEach(e=>this.textFileService.files.resolve(e.resource,{reload:{async:!0}}))}};l=c([t(0,g),t(1,C),t(2,x),t(3,E),t(4,y),t(5,F),t(6,O)],l);export{l as TextFileEditorTracker};