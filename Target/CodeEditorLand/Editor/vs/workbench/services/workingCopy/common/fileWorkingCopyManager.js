var x=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var f=(v,l,e,i)=>{for(var o=i>1?void 0:i?N(l,e):l,r=v.length-1,n;r>=0;r--)(n=v[r])&&(o=(i?n(l,e,o):n(o))||o);return i&&o&&x(l,e,o),o},t=(v,l)=>(e,i)=>l(e,i,v);import{Promises as b}from"../../../../base/common/async.js";import"../../../../base/common/buffer.js";import{CancellationToken as g}from"../../../../base/common/cancellation.js";import{Codicon as h}from"../../../../base/common/codicons.js";import{Emitter as L,Event as T}from"../../../../base/common/event.js";import{Disposable as C}from"../../../../base/common/lifecycle.js";import{Schemas as B}from"../../../../base/common/network.js";import{basename as y,dirname as V,isEqual as q,joinPath as k,toLocalResource as u}from"../../../../base/common/resources.js";import{URI as G}from"../../../../base/common/uri.js";import{localize as s}from"../../../../nls.js";import{IDialogService as K,IFileDialogService as Y}from"../../../../platform/dialogs/common/dialogs.js";import{IFileService as H}from"../../../../platform/files/common/files.js";import{ILabelService as j}from"../../../../platform/label/common/label.js";import{ILogService as z}from"../../../../platform/log/common/log.js";import{INotificationService as J}from"../../../../platform/notification/common/notification.js";import{IProgressService as Q}from"../../../../platform/progress/common/progress.js";import{listErrorForeground as F}from"../../../../platform/theme/common/colorRegistry.js";import{IUriIdentityService as X}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{SaveSourceRegistry as W}from"../../../common/editor.js";import{IDecorationsService as Z}from"../../decorations/common/decorations.js";import{IEditorService as $}from"../../editor/common/editorService.js";import{IWorkbenchEnvironmentService as ee}from"../../environment/common/environmentService.js";import{IElevatedFileService as ie}from"../../files/common/elevatedFileService.js";import{IFilesConfigurationService as oe}from"../../filesConfiguration/common/filesConfigurationService.js";import{ILifecycleService as re}from"../../lifecycle/common/lifecycle.js";import{IPathService as te}from"../../path/common/pathService.js";import"./abstractFileWorkingCopyManager.js";import{SnapshotContext as ne}from"./fileWorkingCopy.js";import{StoredFileWorkingCopyState as U}from"./storedFileWorkingCopy.js";import{StoredFileWorkingCopyManager as se}from"./storedFileWorkingCopyManager.js";import{UntitledFileWorkingCopy as S}from"./untitledFileWorkingCopy.js";import{UntitledFileWorkingCopyManager as ae}from"./untitledFileWorkingCopyManager.js";import{IWorkingCopyBackupService as le}from"./workingCopyBackup.js";import{IWorkingCopyEditorService as de}from"./workingCopyEditorService.js";import{IWorkingCopyFileService as pe}from"./workingCopyFileService.js";import{IWorkingCopyService as ce}from"./workingCopyService.js";let d=class extends C{constructor(e,i,o,r,n,a,p,I,c,R,ye,w,m,P,O,D,E,ve,ge,Se,Ie,_){super();this.workingCopyTypeId=e;this.storedWorkingCopyModelFactory=i;this.untitledWorkingCopyModelFactory=o;this.fileService=r;this.logService=p;this.workingCopyFileService=I;this.uriIdentityService=R;this.fileDialogService=ye;this.filesConfigurationService=w;this.pathService=ve;this.environmentService=ge;this.dialogService=Se;this.decorationsService=Ie;this.stored=this._register(new se(this.workingCopyTypeId,this.storedWorkingCopyModelFactory,r,n,a,p,I,c,R,w,m,P,O,D,E,_)),this.untitled=this._register(new ae(this.workingCopyTypeId,this.untitledWorkingCopyModelFactory,async(A,M)=>!!await this.saveAs(A.resource,void 0,M),r,a,p,c,m)),this.onDidCreate=T.any(this.stored.onDidCreate,this.untitled.onDidCreate),this.provideDecorations()}onDidCreate;static FILE_WORKING_COPY_SAVE_CREATE_SOURCE=W.registerSource("fileWorkingCopyCreate.source",s("fileWorkingCopyCreate.source","File Created"));static FILE_WORKING_COPY_SAVE_REPLACE_SOURCE=W.registerSource("fileWorkingCopyReplace.source",s("fileWorkingCopyReplace.source","File Replaced"));stored;untitled;provideDecorations(){const e=this._register(new class extends C{constructor(o){super();this.stored=o;this.registerListeners()}label=s("fileWorkingCopyDecorations","File Working Copy Decorations");_onDidChange=this._register(new L);onDidChange=this._onDidChange.event;registerListeners(){this._register(this.stored.onDidResolve(o=>{(o.isReadonly()||o.hasState(U.ORPHAN))&&this._onDidChange.fire([o.resource])})),this._register(this.stored.onDidRemove(o=>this._onDidChange.fire([o]))),this._register(this.stored.onDidChangeReadonly(o=>this._onDidChange.fire([o.resource]))),this._register(this.stored.onDidChangeOrphaned(o=>this._onDidChange.fire([o.resource])))}provideDecorations(o){const r=this.stored.get(o);if(!r||r.isDisposed())return;const n=r.isReadonly(),a=r.hasState(U.ORPHAN);if(n&&a)return{color:F,letter:h.lockSmall,strikethrough:!0,tooltip:s("readonlyAndDeleted","Deleted, Read-only")};if(n)return{letter:h.lockSmall,tooltip:s("readonly","Read-only")};if(a)return{color:F,strikethrough:!0,tooltip:s("deleted","Deleted")}}}(this.stored));this._register(this.decorationsService.registerDecorationsProvider(e))}get workingCopies(){return[...this.stored.workingCopies,...this.untitled.workingCopies]}get(e){return this.stored.get(e)??this.untitled.get(e)}resolve(e,i){return G.isUri(e)?e.scheme===B.untitled?this.untitled.resolve({untitledResource:e}):this.stored.resolve(e,i):this.untitled.resolve(e)}async saveAs(e,i,o){if(!i){const r=this.get(e);r instanceof S&&r.hasAssociatedFilePath?i=await this.suggestSavePath(e):i=await this.fileDialogService.pickFileToSave(await this.suggestSavePath(o?.suggestedTarget??e),o?.availableFileSystems)}if(i){if(this.filesConfigurationService.isReadonly(i))if(await this.confirmMakeWriteable(i))this.filesConfigurationService.updateReadonly(i,!1);else return;return this.fileService.hasProvider(e)&&q(e,i)?this.doSave(e,{...o,force:!0}):this.fileService.hasProvider(e)&&this.uriIdentityService.extUri.isEqual(e,i)&&await this.fileService.exists(e)?(await this.workingCopyFileService.move([{file:{source:e,target:i}}],g.None),await this.doSave(e,o)??await this.doSave(i,o)):this.doSaveAs(e,i,o)}}async doSave(e,i){const o=this.stored.get(e);if(o&&await o.save(i))return o}async doSaveAs(e,i,o){let r;const n=this.get(e);n?.isResolved()?r=await n.model.snapshot(ne.Save,g.None):r=(await this.fileService.readFileStream(e)).value;const{targetFileExists:a,targetStoredFileWorkingCopy:p}=await this.doResolveSaveTarget(e,i);if(!(n instanceof S&&n.hasAssociatedFilePath&&a&&this.uriIdentityService.extUri.isEqual(i,u(n.resource,this.environmentService.remoteAuthority,this.pathService.defaultUriScheme))&&!await this.confirmOverwrite(i)||(await p.model?.update(r,g.None),o?.source||(o={...o,source:a?d.FILE_WORKING_COPY_SAVE_REPLACE_SOURCE:d.FILE_WORKING_COPY_SAVE_CREATE_SOURCE}),!await p.save({...o,from:e,force:!0})))){try{await n?.revert()}catch(c){this.logService.error(c)}return p}}async doResolveSaveTarget(e,i){let o=!1,r=this.stored.get(i);return r?.isResolved()?o=!0:(o=await this.fileService.exists(i),o||await this.workingCopyFileService.create([{resource:i}],g.None),this.uriIdentityService.extUri.isEqual(e,i)&&this.get(e)?r=await this.stored.resolve(e):r=await this.stored.resolve(i)),{targetFileExists:o,targetStoredFileWorkingCopy:r}}async confirmOverwrite(e){const{confirmed:i}=await this.dialogService.confirm({type:"warning",message:s("confirmOverwrite","'{0}' already exists. Do you want to replace it?",y(e)),detail:s("overwriteIrreversible","A file or folder with the name '{0}' already exists in the folder '{1}'. Replacing it will overwrite its current contents.",y(e),y(V(e))),primaryButton:s({key:"replaceButtonLabel",comment:["&& denotes a mnemonic"]},"&&Replace")});return i}async confirmMakeWriteable(e){const{confirmed:i}=await this.dialogService.confirm({type:"warning",message:s("confirmMakeWriteable","'{0}' is marked as read-only. Do you want to save anyway?",y(e)),detail:s("confirmMakeWriteableDetail","Paths can be configured as read-only via settings."),primaryButton:s({key:"makeWriteableButtonLabel",comment:["&& denotes a mnemonic"]},"&&Save Anyway")});return i}async suggestSavePath(e){if(this.fileService.hasProvider(e))return e;const i=this.get(e);if(i instanceof S&&i.hasAssociatedFilePath)return u(e,this.environmentService.remoteAuthority,this.pathService.defaultUriScheme);const o=await this.fileDialogService.defaultFilePath();if(i){const r=k(o,i.name);if(await this.pathService.hasValidBasename(r,i.name))return r}return k(o,y(e))}async destroy(){await b.settled([this.stored.destroy(),this.untitled.destroy()])}};d=f([t(3,H),t(4,re),t(5,j),t(6,z),t(7,pe),t(8,le),t(9,X),t(10,Y),t(11,oe),t(12,ce),t(13,J),t(14,de),t(15,$),t(16,ie),t(17,te),t(18,ee),t(19,K),t(20,Z),t(21,Q)],d);export{d as FileWorkingCopyManager};
