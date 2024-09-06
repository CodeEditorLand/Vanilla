var Y=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var P=(w,r,o,t)=>{for(var e=t>1?void 0:t?j(r,o):r,i=w.length-1,a;i>=0;i--)(a=w[i])&&(e=(t?a(r,o,e):a(e))||e);return t&&e&&Y(r,o,e),e},u=(w,r)=>(o,t)=>r(o,t,w);import{getActiveWindow as Q,isDragEvent as $,triggerDownload as J}from"../../../../../vs/base/browser/dom.js";import{coalesce as C}from"../../../../../vs/base/common/arrays.js";import{Limiter as q,Promises as T,RunOnceWorker as M}from"../../../../../vs/base/common/async.js";import{newWriteableBufferStream as Z,VSBuffer as z}from"../../../../../vs/base/common/buffer.js";import{CancellationTokenSource as R}from"../../../../../vs/base/common/cancellation.js";import{canceled as ee}from"../../../../../vs/base/common/errors.js";import{createSingleCallFunction as re}from"../../../../../vs/base/common/functional.js";import{mnemonicButtonLabel as ie}from"../../../../../vs/base/common/labels.js";import{DisposableStore as te,toDisposable as oe}from"../../../../../vs/base/common/lifecycle.js";import{FileAccess as ae,Schemas as k}from"../../../../../vs/base/common/network.js";import{isWeb as _}from"../../../../../vs/base/common/platform.js";import{basename as g,dirname as se,joinPath as D}from"../../../../../vs/base/common/resources.js";import{listenStream as ne}from"../../../../../vs/base/common/stream.js";import{URI as le}from"../../../../../vs/base/common/uri.js";import{ResourceFileEdit as U}from"../../../../../vs/editor/browser/services/bulkEditService.js";import{localize as l}from"../../../../../vs/nls.js";import{IConfigurationService as de}from"../../../../../vs/platform/configuration/common/configuration.js";import{getFileNamesMessage as ce,IDialogService as N,IFileDialogService as fe}from"../../../../../vs/platform/dialogs/common/dialogs.js";import{extractEditorsAndFilesDropData as me}from"../../../../../vs/platform/dnd/browser/dnd.js";import{WebFileSystemAccess as ue}from"../../../../../vs/platform/files/browser/webFileSystemAccess.js";import{ByteSize as v,FileSystemProviderCapabilities as pe,IFileService as B}from"../../../../../vs/platform/files/common/files.js";import{IInstantiationService as ve}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as we}from"../../../../../vs/platform/log/common/log.js";import{INotificationService as he,Severity as Se}from"../../../../../vs/platform/notification/common/notification.js";import{IProgressService as W,ProgressLocation as F}from"../../../../../vs/platform/progress/common/progress.js";import{IStorageService as ge,StorageScope as H,StorageTarget as ye}from"../../../../../vs/platform/storage/common/storage.js";import{IWorkspaceContextService as Ie}from"../../../../../vs/platform/workspace/common/workspace.js";import{IExplorerService as A}from"../../../../../vs/workbench/contrib/files/browser/files.js";import{ExplorerItem as be}from"../../../../../vs/workbench/contrib/files/common/explorerModel.js";import{UndoConfirmLevel as G,VIEW_ID as L}from"../../../../../vs/workbench/contrib/files/common/files.js";import{IEditorService as V}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IHostService as De}from"../../../../../vs/workbench/services/host/browser/host.js";import{IWorkspaceEditingService as Fe}from"../../../../../vs/workbench/services/workspaces/common/workspaceEditing.js";let y=class{constructor(r,o,t,e,i){this.progressService=r;this.dialogService=o;this.explorerService=t;this.editorService=e;this.fileService=i}static MAX_PARALLEL_UPLOADS=20;upload(r,o){const t=new R,e=this.progressService.withProgress({location:F.Window,delay:800,cancellable:!0,title:l("uploadingFiles","Uploading")},async i=>this.doUpload(r,this.toTransfer(o),i,t.token),()=>t.dispose(!0));return this.progressService.withProgress({location:L,delay:500},()=>e),e}toTransfer(r){if($(r))return r.dataTransfer;const o={items:[]};for(const t of r)o.items.push({webkitGetAsEntry:()=>({name:t.name,isDirectory:!1,isFile:!0,createReader:()=>{throw new Error("Unsupported for files")},file:e=>e(t)})});return o}async doUpload(r,o,t,e){const i=o.items,a=[];for(const f of i)a.push(f.webkitGetAsEntry());const c=[],s={startTime:Date.now(),progressScheduler:new M(f=>{t.report(f[f.length-1])},1e3),filesTotal:a.length,filesUploaded:0,totalBytesUploaded:0},n=new q(y.MAX_PARALLEL_UPLOADS);await T.settled(a.map(f=>n.queue(async()=>{if(e.isCancellationRequested)return;if(r&&f.name&&r.getChild(f.name)){const{confirmed:p}=await this.dialogService.confirm(O(f.name));if(!p||(await this.explorerService.applyBulkEdit([new U(D(r.resource,f.name),void 0,{recursive:!0,folder:r.getChild(f.name)?.isDirectory})],{undoLabel:l("overwrite","Overwrite {0}",f.name),progressLabel:l("overwriting","Overwriting {0}",f.name)}),e.isCancellationRequested))return}const m=await this.doUploadEntry(f,r.resource,r,t,s,e);m&&c.push(m)}))),s.progressScheduler.dispose();const d=c[0];!e.isCancellationRequested&&d?.isFile&&await this.editorService.openEditor({resource:d.resource,options:{pinned:!0}})}async doUploadEntry(r,o,t,e,i,a){if(a.isCancellationRequested||!r.name||!r.isFile&&!r.isDirectory)return;let c=0;const s=(d,f)=>{c+=f,i.totalBytesUploaded+=f;const m=i.totalBytesUploaded/((Date.now()-i.startTime)/1e3);let p;d<v.MB?i.filesTotal===1?p=`${r.name}`:p=l("uploadProgressSmallMany","{0} of {1} files ({2}/s)",i.filesUploaded,i.filesTotal,v.formatSize(m)):p=l("uploadProgressLarge","{0} ({1} of {2}, {3}/s)",r.name,v.formatSize(c),v.formatSize(d),v.formatSize(m)),i.progressScheduler.work({message:p})};i.filesUploaded++,s(0,0);const n=D(o,r.name);if(r.isFile){const d=await new Promise((f,m)=>r.file(f,m));return a.isCancellationRequested?void 0:(typeof d.stream=="function"&&d.size>v.MB?await this.doUploadFileBuffered(n,d,s,a):await this.doUploadFileUnbuffered(n,d,s),{isFile:!0,resource:n})}else{if(await this.fileService.createFolder(n),a.isCancellationRequested)return;const d=r.createReader(),f=[];let m=!1;do{const h=await new Promise((K,X)=>d.readEntries(K,X));h.length>0?f.push(...h):m=!0}while(!m&&!a.isCancellationRequested);i.filesTotal+=f.length;const p=t&&t.getChild(r.name)||void 0,S=[],x=[];for(const h of f)h.isFile?S.push(h):h.isDirectory&&x.push(h);const b=new q(y.MAX_PARALLEL_UPLOADS);await T.settled(S.map(h=>b.queue(()=>this.doUploadEntry(h,n,p,e,i,a))));for(const h of x)await this.doUploadEntry(h,n,p,e,i,a);return{isFile:!1,resource:n}}}async doUploadFileBuffered(r,o,t,e){const i=Z({highWaterMark:10}),a=this.fileService.writeFile(r,i);try{const c=o.stream().getReader();let s=await c.read();for(;!s.done&&!e.isCancellationRequested;){const n=z.wrap(s.value);if(await i.write(n),e.isCancellationRequested)break;t(o.size,n.byteLength),s=await c.read()}i.end(void 0)}catch(c){i.error(c),i.end()}e.isCancellationRequested||await a}doUploadFileUnbuffered(r,o,t){return new Promise((e,i)=>{const a=new FileReader;a.onload=async c=>{try{if(c.target?.result instanceof ArrayBuffer){const s=z.wrap(new Uint8Array(c.target.result));await this.fileService.writeFile(r,s),t(o.size,s.byteLength)}else throw new Error("Could not read from dropped file.");e()}catch(s){i(s)}},a.readAsArrayBuffer(o)})}};y=P([u(0,W),u(1,N),u(2,A),u(3,V),u(4,B)],y);let E=class{constructor(r,o,t,e,i,a,c,s,n,d,f){this.fileService=r;this.hostService=o;this.contextService=t;this.configurationService=e;this.dialogService=i;this.workspaceEditingService=a;this.explorerService=c;this.editorService=s;this.progressService=n;this.notificationService=d;this.instantiationService=f}async import(r,o,t){const e=new R,i=this.progressService.withProgress({location:F.Window,delay:800,cancellable:!0,title:l("copyingFiles","Copying...")},async()=>await this.doImport(r,o,t,e.token),()=>e.dispose(!0));return this.progressService.withProgress({location:L,delay:500},()=>i),i}async doImport(r,o,t,e){const i=C((await this.instantiationService.invokeFunction(n=>me(n,o))).map(n=>n.resource));await Promise.all(i.map(n=>this.fileService.activateProvider(n.scheme)));const a=C(i.filter(n=>this.fileService.hasProvider(n))),c=await this.fileService.resolveAll(a.map(n=>({resource:n})));if(e.isCancellationRequested)return;this.hostService.focus(t);const s=c.filter(n=>n.success&&n.stat?.isDirectory).map(n=>({uri:n.stat.resource}));if(s.length>0&&r.isRoot){let n;(b=>(b[b.Copy=1]="Copy",b[b.Add=2]="Add"))(n||={});const d=[{label:s.length>1?l("copyFolders","&&Copy Folders"):l("copyFolder","&&Copy Folder"),run:()=>1}];let f;const m=this.contextService.getWorkspace().folders.map(S=>S.uri.scheme);s.some(S=>m.indexOf(S.uri.scheme)>=0)?(d.unshift({label:s.length>1?l("addFolders","&&Add Folders to Workspace"):l("addFolder","&&Add Folder to Workspace"),run:()=>2}),f=s.length>1?l("dropFolders","Do you want to copy the folders or add the folders to the workspace?"):l("dropFolder","Do you want to copy '{0}' or add '{0}' as a folder to the workspace?",g(s[0].uri))):f=s.length>1?l("copyfolders","Are you sure to want to copy folders?"):l("copyfolder","Are you sure to want to copy '{0}'?",g(s[0].uri));const{result:p}=await this.dialogService.prompt({type:Se.Info,message:f,buttons:d,cancelButton:!0});if(p===2)return this.workspaceEditingService.addFolders(s);if(p===1)return this.importResources(r,a,e)}else if(r instanceof be)return this.importResources(r,a,e)}async importResources(r,o,t){if(o&&o.length>0){const e=await this.fileService.resolve(r.resource);if(t.isCancellationRequested)return;const i=new Set,a=this.fileService.hasCapability(r.resource,pe.PathCaseSensitive);e.children&&e.children.forEach(m=>{i.add(a?m.name:m.name.toLowerCase())});let c=0;const s=C(await T.settled(o.map(async m=>{if(!await this.fileService.exists(m)){c++;return}if(!(i.has(a?g(m):g(m).toLowerCase())&&!(await this.dialogService.confirm(O(g(m)))).confirmed))return m})));c>0&&this.notificationService.error(c>1?l("filesInaccessible","Some or all of the dropped files could not be accessed for import."):l("fileInaccessible","The dropped file could not be accessed for import."));const n=s.map(m=>{const p=g(m),S=D(r.resource,p);return new U(m,S,{overwrite:!0,copy:!0})}),d=this.configurationService.getValue().explorer.confirmUndo;if(await this.explorerService.applyBulkEdit(n,{undoLabel:s.length===1?l({comment:["substitution will be the name of the file that was imported"],key:"importFile"},"Import {0}",g(s[0])):l({comment:["substitution will be the number of files that were imported"],key:"importnFile"},"Import {0} resources",s.length),progressLabel:s.length===1?l({comment:["substitution will be the name of the file that was copied"],key:"copyingFile"},"Copying {0}",g(s[0])):l({comment:["substitution will be the number of files that were copied"],key:"copyingnFile"},"Copying {0} resources",s.length),progressLocation:F.Window,confirmBeforeUndo:d===G.Verbose||d===G.Default}),this.configurationService.getValue().explorer.autoOpenDroppedFile&&n.length===1){const m=this.explorerService.findClosest(n[0].newResource);m&&!m.isDirectory&&this.editorService.openEditor({resource:m.resource,options:{pinned:!0}})}}}};E=P([u(0,B),u(1,De),u(2,Ie),u(3,de),u(4,N),u(5,Fe),u(6,A),u(7,V),u(8,W),u(9,he),u(10,ve)],E);let I=class{constructor(r,o,t,e,i,a){this.fileService=r;this.explorerService=o;this.progressService=t;this.logService=e;this.fileDialogService=i;this.storageService=a}static LAST_USED_DOWNLOAD_PATH_STORAGE_KEY="workbench.explorer.downloadPath";download(r){const o=new R,t=this.progressService.withProgress({location:F.Window,delay:800,cancellable:_,title:l("downloadingFiles","Downloading")},async e=>this.doDownload(r,e,o),()=>o.dispose(!0));return this.progressService.withProgress({location:L,delay:500},()=>t),t}async doDownload(r,o,t){for(const e of r){if(t.token.isCancellationRequested)return;_?await this.doDownloadBrowser(e.resource,o,t):await this.doDownloadNative(e,o,t)}}async doDownloadBrowser(r,o,t){const e=await this.fileService.resolve(r,{resolveMetadata:!0});if(t.token.isCancellationRequested)return;const i=32*v.MB,a=e.isDirectory||e.size>i,c=Q();if(a&&ue.supported(c))try{const s=await c.showDirectoryPicker(),n={startTime:Date.now(),progressScheduler:new M(d=>{o.report(d[d.length-1])},1e3),filesTotal:e.isDirectory?0:1,filesDownloaded:0,totalBytesDownloaded:0,fileBytesDownloaded:0};if(e.isDirectory){const d=await s.getDirectoryHandle(e.name,{create:!0});await this.downloadFolderBrowser(e,d,n,t.token)}else await this.downloadFileBrowser(s,e,n,t.token);n.progressScheduler.dispose()}catch(s){this.logService.warn(s),t.cancel()}else if(e.isFile){let s;try{s=(await this.fileService.readFile(e.resource,{limits:{size:i}},t.token)).value.buffer}catch{s=ae.uriToBrowserUri(e.resource)}t.token.isCancellationRequested||J(s,e.name)}}async downloadFileBufferedBrowser(r,o,t,e){const i=await this.fileService.readFileStream(r,void 0,e);if(e.isCancellationRequested){o.close();return}return new Promise((a,c)=>{const s=i.value,n=new te;n.add(oe(()=>o.close())),n.add(re(e.onCancellationRequested)(()=>{n.dispose(),c(ee())})),ne(s,{onData:d=>{o.write(d.buffer),this.reportProgress(i.name,i.size,d.byteLength,t)},onError:d=>{n.dispose(),c(d)},onEnd:()=>{n.dispose(),a()}},e)})}async downloadFileUnbufferedBrowser(r,o,t,e){const i=await this.fileService.readFile(r,void 0,e);e.isCancellationRequested||(o.write(i.value.buffer),this.reportProgress(i.name,i.size,i.value.byteLength,t)),o.close()}async downloadFileBrowser(r,o,t,e){t.filesDownloaded++,t.fileBytesDownloaded=0,this.reportProgress(o.name,0,0,t);const a=await(await r.getFileHandle(o.name,{create:!0})).createWritable();return o.size>v.MB?this.downloadFileBufferedBrowser(o.resource,a,t,e):this.downloadFileUnbufferedBrowser(o.resource,a,t,e)}async downloadFolderBrowser(r,o,t,e){if(r.children){t.filesTotal+=r.children.map(i=>i.isFile).length;for(const i of r.children){if(e.isCancellationRequested)return;if(i.isFile)await this.downloadFileBrowser(o,i,t,e);else{const a=await o.getDirectoryHandle(i.name,{create:!0}),c=await this.fileService.resolve(i.resource,{resolveMetadata:!0});await this.downloadFolderBrowser(c,a,t,e)}}}}reportProgress(r,o,t,e){e.fileBytesDownloaded+=t,e.totalBytesDownloaded+=t;const i=e.totalBytesDownloaded/((Date.now()-e.startTime)/1e3);let a;o<v.MB?e.filesTotal===1?a=r:a=l("downloadProgressSmallMany","{0} of {1} files ({2}/s)",e.filesDownloaded,e.filesTotal,v.formatSize(i)):a=l("downloadProgressLarge","{0} ({1} of {2}, {3}/s)",r,v.formatSize(e.fileBytesDownloaded),v.formatSize(o),v.formatSize(i)),e.progressScheduler.work({message:a})}async doDownloadNative(r,o,t){o.report({message:r.name});let e;const i=this.storageService.get(I.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY,H.APPLICATION);i?e=D(le.file(i),r.name):e=D(r.isDirectory?await this.fileDialogService.defaultFolderPath(k.file):await this.fileDialogService.defaultFilePath(k.file),r.name);const a=await this.fileDialogService.showSaveDialog({availableFileSystems:[k.file],saveLabel:ie(l("downloadButton","Download")),title:l("chooseWhereToDownload","Choose Where to Download"),defaultUri:e});a?(this.storageService.store(I.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY,se(a).fsPath,H.APPLICATION,ye.MACHINE),await this.explorerService.applyBulkEdit([new U(r.resource,a,{overwrite:!0,copy:!0})],{undoLabel:l("downloadBulkEdit","Download {0}",r.name),progressLabel:l("downloadingBulkEdit","Downloading {0}",r.name),progressLocation:F.Window})):t.cancel()}};I=P([u(0,B),u(1,A),u(2,W),u(3,we),u(4,fe),u(5,ge)],I);function O(w){return{message:l("confirmOverwrite","A file or folder with the name '{0}' already exists in the destination folder. Do you want to replace it?",w),detail:l("irreversible","This action is irreversible!"),primaryButton:l({key:"replaceButtonLabel",comment:["&& denotes a mnemonic"]},"&&Replace"),type:"warning"}}function mr(w){return w.length>1?{message:l("confirmManyOverwrites","The following {0} files and/or folders already exist in the destination folder. Do you want to replace them?",w.length),detail:ce(w)+`
`+l("irreversible","This action is irreversible!"),primaryButton:l({key:"replaceButtonLabel",comment:["&& denotes a mnemonic"]},"&&Replace"),type:"warning"}:O(g(w[0]))}export{y as BrowserFileUpload,E as ExternalFileImport,I as FileDownload,O as getFileOverwriteConfirm,mr as getMultipleFilesOverwriteConfirm};
