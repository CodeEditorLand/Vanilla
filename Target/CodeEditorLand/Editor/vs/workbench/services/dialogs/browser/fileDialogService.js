var S=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var f=(p,e,i,s)=>{for(var t=s>1?void 0:s?y(e,i):e,r=p.length-1,n;r>=0;r--)(n=p[r])&&(t=(s?n(e,i,t):n(t))||t);return s&&t&&S(e,i,t),t};import{getActiveWindow as d,triggerDownload as g,triggerUpload as F}from"../../../../base/browser/dom.js";import{VSBuffer as v}from"../../../../base/common/buffer.js";import{memoize as w}from"../../../../base/common/decorators.js";import{Iterable as c}from"../../../../base/common/iterator.js";import{getMediaOrTextMime as k}from"../../../../base/common/mime.js";import{Schemas as o}from"../../../../base/common/network.js";import{basename as m}from"../../../../base/common/resources.js";import P from"../../../../base/common/severity.js";import{EmbeddedCodeEditorWidget as O}from"../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";import{localize as a}from"../../../../nls.js";import{IFileDialogService as U}from"../../../../platform/dialogs/common/dialogs.js";import{extractFileListData as I}from"../../../../platform/dnd/browser/dnd.js";import{WebFileSystemAccess as l}from"../../../../platform/files/browser/webFileSystemAccess.js";import{InstantiationType as A,registerSingleton as D}from"../../../../platform/instantiation/common/extensions.js";import{AbstractFileDialogService as W}from"./abstractFileDialogService.js";class u extends W{get fileSystemProvider(){return this.fileService.getProvider(o.file)}async pickFileFolderAndOpen(e){const i=this.getFileSystemSchema(e);if(e.defaultUri||(e.defaultUri=await this.defaultFilePath(i)),this.shouldUseSimplified(i))return super.pickFileFolderAndOpenSimplified(i,e,!1);throw new Error(a("pickFolderAndOpen","Can't open folders, try adding a folder to the workspace instead."))}addFileSchemaIfNeeded(e,i){return e===o.untitled?[o.file]:e!==o.file&&(!i||e!==o.vscodeRemote)?[e,o.file]:[e]}async pickFileAndOpen(e){const i=this.getFileSystemSchema(e);if(e.defaultUri||(e.defaultUri=await this.defaultFilePath(i)),this.shouldUseSimplified(i))return super.pickFileAndOpenSimplified(i,e,!1);const s=d();if(!l.supported(s))return this.showUnsupportedBrowserWarning("open");let t;try{[t]=await s.showOpenFilePicker({multiple:!1})}catch{return}if(!l.isFileSystemFileHandle(t))return;const r=await this.fileSystemProvider.registerFileHandle(t);this.addFileToRecentlyOpened(r),await this.openerService.open(r,{fromUserGesture:!0,editorOptions:{pinned:!0}})}async pickFolderAndOpen(e){const i=this.getFileSystemSchema(e);if(e.defaultUri||(e.defaultUri=await this.defaultFolderPath(i)),this.shouldUseSimplified(i))return super.pickFolderAndOpenSimplified(i,e);throw new Error(a("pickFolderAndOpen","Can't open folders, try adding a folder to the workspace instead."))}async pickWorkspaceAndOpen(e){e.availableFileSystems=this.getWorkspaceAvailableFileSystems(e);const i=this.getFileSystemSchema(e);if(e.defaultUri||(e.defaultUri=await this.defaultWorkspacePath(i)),this.shouldUseSimplified(i))return super.pickWorkspaceAndOpenSimplified(i,e);throw new Error(a("pickWorkspaceAndOpen","Can't open workspaces, try adding a folder to the workspace instead."))}async pickFileToSave(e,i){const s=this.getFileSystemSchema({defaultUri:e,availableFileSystems:i}),t=this.getPickFileToSaveDialogOptions(e,i);if(this.shouldUseSimplified(s))return super.pickFileToSaveSimplified(s,t);const r=d();if(!l.supported(r))return this.showUnsupportedBrowserWarning("save");let n;const h=c.first(this.fileSystemProvider.directories);try{n=await r.showSaveFilePicker({types:this.getFilePickerTypes(t.filters),suggestedName:m(e),startIn:h})}catch{return}if(l.isFileSystemFileHandle(n))return this.fileSystemProvider.registerFileHandle(n)}getFilePickerTypes(e){return e?.filter(i=>!(i.extensions.length===1&&(i.extensions[0]==="*"||i.extensions[0]===""))).map(i=>{const s={},t=i.extensions.filter(r=>r.indexOf("-")<0&&r.indexOf("*")<0&&r.indexOf("_")<0);return s[k(`fileName.${i.extensions[0]}`)??"text/plain"]=t.map(r=>r.startsWith(".")?r:`.${r}`),{description:i.name,accept:s}})}async showSaveDialog(e){const i=this.getFileSystemSchema(e);if(this.shouldUseSimplified(i))return super.showSaveDialogSimplified(i,e);const s=d();if(!l.supported(s))return this.showUnsupportedBrowserWarning("save");let t;const r=c.first(this.fileSystemProvider.directories);try{t=await s.showSaveFilePicker({types:this.getFilePickerTypes(e.filters),...e.defaultUri?{suggestedName:m(e.defaultUri)}:void 0,startIn:r})}catch{return}if(l.isFileSystemFileHandle(t))return this.fileSystemProvider.registerFileHandle(t)}async showOpenDialog(e){const i=this.getFileSystemSchema(e);if(this.shouldUseSimplified(i))return super.showOpenDialogSimplified(i,e);const s=d();if(!l.supported(s))return this.showUnsupportedBrowserWarning("open");let t;const r=c.first(this.fileSystemProvider.directories)??"documents";try{if(e.canSelectFiles){const n=await s.showOpenFilePicker({multiple:!1,types:this.getFilePickerTypes(e.filters),startIn:r});n.length===1&&l.isFileSystemFileHandle(n[0])&&(t=await this.fileSystemProvider.registerFileHandle(n[0]))}else{const n=await s.showDirectoryPicker({startIn:r});t=await this.fileSystemProvider.registerDirectoryHandle(n)}}catch{}return t?[t]:void 0}async showUnsupportedBrowserWarning(e){if(e==="save"){const s=this.codeEditorService.getActiveCodeEditor();if(!(s instanceof O)){const t=s?.getModel();if(t){g(v.fromString(t.getValue()).buffer,m(t.uri));return}}}const i=[{label:a({key:"openRemote",comment:["&& denotes a mnemonic"]},"&&Open Remote..."),run:async()=>{await this.commandService.executeCommand("workbench.action.remote.showMenu")}},{label:a({key:"learnMore",comment:["&& denotes a mnemonic"]},"&&Learn More"),run:async()=>{await this.openerService.open("https://aka.ms/VSCodeWebLocalFileSystemAccess")}}];e==="open"&&i.push({label:a({key:"openFiles",comment:["&& denotes a mnemonic"]},"Open &&Files..."),run:async()=>{const s=await F();if(s){const t=(await this.instantiationService.invokeFunction(r=>I(r,s))).filter(r=>!r.isDirectory);t.length>0&&this.editorService.openEditors(t.map(r=>({resource:r.resource,contents:r.contents?.toString(),options:{pinned:!0}})))}}}),await this.dialogService.prompt({type:P.Warning,message:a("unsupportedBrowserMessage","Opening Local Folders is Unsupported"),detail:a("unsupportedBrowserDetail",`Your browser doesn't support opening local folders.
You can either open single files or open a remote repository.`),buttons:i})}shouldUseSimplified(e){return![o.file,o.vscodeUserData,o.tmp].includes(e)}}f([w],u.prototype,"fileSystemProvider",1),D(U,u,A.Delayed);export{u as FileDialogService};
