var P=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var K=(l,e,i)=>e in l?P(l,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):l[e]=i;var R=(l,e,i,m)=>{for(var p=m>1?void 0:m?H(e,i):e,w=l.length-1,r;w>=0;w--)(r=l[w])&&(p=(m?r(e,i,p):r(p))||p);return m&&p&&P(e,i,p),p},c=(l,e)=>(i,m)=>e(i,m,l);var b=(l,e,i)=>K(l,typeof e!="symbol"?e+"":e,i);import{DisposableMap as V,DisposableStore as $}from"../../../base/common/lifecycle.js";import{FileOperation as d,IFileService as q}from"../../../platform/files/common/files.js";import{extHostNamedCustomer as G}from"../../services/extensions/common/extHostCustomers.js";import{ExtHostContext as Y,MainContext as z}from"../common/extHost.protocol.js";import{localize as t}from"../../../nls.js";import{IWorkingCopyFileService as j}from"../../services/workingCopy/common/workingCopyFileService.js";import{IBulkEditService as J}from"../../../editor/browser/services/bulkEditService.js";import{IProgressService as Q,ProgressLocation as X}from"../../../platform/progress/common/progress.js";import{raceCancellation as Z}from"../../../base/common/async.js";import{CancellationTokenSource as ee}from"../../../base/common/cancellation.js";import{IDialogService as te}from"../../../platform/dialogs/common/dialogs.js";import W from"../../../base/common/severity.js";import{IStorageService as D,StorageScope as C,StorageTarget as ie}from"../../../platform/storage/common/storage.js";import{Action2 as ne,registerAction2 as re}from"../../../platform/actions/common/actions.js";import"../../../platform/instantiation/common/instantiation.js";import{ILogService as N}from"../../../platform/log/common/log.js";import{IEnvironmentService as oe}from"../../../platform/environment/common/environment.js";import{IUriIdentityService as se}from"../../../platform/uriIdentity/common/uriIdentity.js";import{reviveWorkspaceEditDto as ae}from"./mainThreadBulkEdits.js";import{GLOBSTAR as ce}from"../../../base/common/glob.js";import{rtrim as le}from"../../../base/common/strings.js";import{URI as me}from"../../../base/common/uri.js";import{IConfigurationService as pe}from"../../../platform/configuration/common/configuration.js";import{normalizeWatcherPattern as de}from"../../../platform/files/common/watcher.js";import{IWorkspaceContextService as he}from"../../../platform/workspace/common/workspace.js";let u=class{constructor(e,i,m,p,w,r,n,h,y,a,g,F,fe){this._fileService=i;this._contextService=g;this._logService=F;this._configurationService=fe;this._proxy=e.getProxy(Y.ExtHostFileSystemEventService),this._listener.add(i.onDidFilesChange(f=>{this._proxy.$onFileEvent({created:f.rawAdded,changed:f.rawUpdated,deleted:f.rawDeleted})}));const A=this,T=new class{async participate(f,v,_,E,L){if(_?.isUndoing)return;const k=new ee(L),U=setTimeout(()=>k.cancel(),E),o=await w.withProgress({location:X.Notification,title:this._progressLabel(v),cancellable:!0,delay:Math.min(E/2,3e3)},()=>{const s=A._proxy.$onWillRunFileOperation(v,f,E,k.token);return Z(s,k.token)},()=>{k.cancel()}).finally(()=>{k.dispose(),clearTimeout(U)});if(!o||o.edit.edits.length===0)return;const M=o.edit.edits.some(s=>s.metadata?.needsConfirmation);let S=n.getBoolean(u.MementoKeyAdditionalEdits,C.PROFILE);if(y.extensionTestsLocationURI&&(S=!1),S===void 0){let s;if(o.extensionNames.length===1?v===d.CREATE?s=t("ask.1.create","Extension '{0}' wants to make refactoring changes with this file creation",o.extensionNames[0]):v===d.COPY?s=t("ask.1.copy","Extension '{0}' wants to make refactoring changes with this file copy",o.extensionNames[0]):v===d.MOVE?s=t("ask.1.move","Extension '{0}' wants to make refactoring changes with this file move",o.extensionNames[0]):s=t("ask.1.delete","Extension '{0}' wants to make refactoring changes with this file deletion",o.extensionNames[0]):v===d.CREATE?s=t({key:"ask.N.create",comment:['{0} is a number, e.g "3 extensions want..."']},"{0} extensions want to make refactoring changes with this file creation",o.extensionNames.length):v===d.COPY?s=t({key:"ask.N.copy",comment:['{0} is a number, e.g "3 extensions want..."']},"{0} extensions want to make refactoring changes with this file copy",o.extensionNames.length):v===d.MOVE?s=t({key:"ask.N.move",comment:['{0} is a number, e.g "3 extensions want..."']},"{0} extensions want to make refactoring changes with this file move",o.extensionNames.length):s=t({key:"ask.N.delete",comment:['{0} is a number, e.g "3 extensions want..."']},"{0} extensions want to make refactoring changes with this file deletion",o.extensionNames.length),M){const{confirmed:I}=await r.confirm({type:W.Info,message:s,primaryButton:t("preview","Show &&Preview"),cancelButton:t("cancel","Skip Changes")});if(S=!0,!I)return}else{let I;(x=>(x[x.OK=0]="OK",x[x.Preview=1]="Preview",x[x.Cancel=2]="Cancel"))(I||={});const{result:O,checkboxChecked:B}=await r.prompt({type:W.Info,message:s,buttons:[{label:t({key:"ok",comment:["&& denotes a mnemonic"]},"&&OK"),run:()=>0},{label:t({key:"preview",comment:["&& denotes a mnemonic"]},"Show &&Preview"),run:()=>1}],cancelButton:{label:t("cancel","Skip Changes"),run:()=>2},checkbox:{label:t("again","Do not ask me again")}});if(O===2)return;S=O===1,B&&n.store(u.MementoKeyAdditionalEdits,S,C.PROFILE,ie.USER)}}h.info("[onWill-handler] applying additional workspace edit from extensions",o.extensionNames),await p.apply(ae(o.edit,a),{undoRedoGroupId:_?.undoRedoGroupId,showPreview:S})}_progressLabel(f){switch(f){case d.CREATE:return t("msg-create","Running 'File Create' participants...");case d.MOVE:return t("msg-rename","Running 'File Rename' participants...");case d.COPY:return t("msg-copy","Running 'File Copy' participants...");case d.DELETE:return t("msg-delete","Running 'File Delete' participants...");case d.WRITE:return t("msg-write","Running 'File Write' participants...")}}};this._listener.add(m.addFileOperationParticipant(T)),this._listener.add(m.onDidRunWorkingCopyFileOperation(f=>this._proxy.$onDidRunFileOperation(f.operation,f.files)))}_proxy;_listener=new $;_watches=new V;async $watch(e,i,m,p,w){const r=me.revive(m),n={...p};if(n.recursive)try{(await this._fileService.stat(r)).isDirectory||(n.recursive=!1)}catch{}if(w){this._logService.trace(`MainThreadFileSystemEventService#$watch(): request to start watching correlated (extension: ${e}, path: ${r.toString(!0)}, recursive: ${n.recursive}, session: ${i})`);const h=new $,y=h.add(this._fileService.createWatcher(r,n));h.add(y.onDidChange(a=>{this._proxy.$onFileEvent({session:i,created:a.rawAdded,changed:a.rawUpdated,deleted:a.rawDeleted})})),this._watches.set(i,h)}else{this._logService.trace(`MainThreadFileSystemEventService#$watch(): request to start watching uncorrelated (extension: ${e}, path: ${r.toString(!0)}, recursive: ${n.recursive}, session: ${i})`);const h=this._contextService.getWorkspaceFolder(r);if(n.recursive&&n.excludes.length===0){const a=this._configurationService.getValue();if(a.files?.watcherExclude)for(const g in a.files.watcherExclude)g&&a.files.watcherExclude[g]===!0&&n.excludes.push(g)}else if(!n.recursive&&h){const a=this._configurationService.getValue();if(a.files?.watcherExclude){for(const g in a.files.watcherExclude)if(g&&a.files.watcherExclude[g]===!0){n.includes||(n.includes=[]);const F=`${le(g,"/")}/${ce}`;n.includes.push(de(h.uri.fsPath,F))}}if(!n.includes||n.includes.length===0){this._logService.trace(`MainThreadFileSystemEventService#$watch(): ignoring request to start watching because path is inside workspace and no excludes are configured (extension: ${e}, path: ${r.toString(!0)}, recursive: ${n.recursive}, session: ${i})`);return}}const y=this._fileService.watch(r,n);this._watches.set(i,y)}}$unwatch(e){this._watches.has(e)&&(this._logService.trace(`MainThreadFileSystemEventService#$unwatch(): request to stop watching (session: ${e})`),this._watches.deleteAndDispose(e))}dispose(){this._listener.dispose(),this._watches.dispose()}};b(u,"MementoKeyAdditionalEdits","file.particpants.additionalEdits"),u=R([G(z.MainThreadFileSystemEventService),c(1,q),c(2,j),c(3,J),c(4,Q),c(5,te),c(6,D),c(7,N),c(8,oe),c(9,se),c(10,he),c(11,N),c(12,pe)],u),re(class extends ne{constructor(){super({id:"files.participants.resetChoice",title:{value:t("label","Reset choice for 'File operation needs preview'"),original:"Reset choice for 'File operation needs preview'"},f1:!0})}run(e){e.get(D).remove(u.MementoKeyAdditionalEdits,C.PROFILE)}});export{u as MainThreadFileSystemEventService};
