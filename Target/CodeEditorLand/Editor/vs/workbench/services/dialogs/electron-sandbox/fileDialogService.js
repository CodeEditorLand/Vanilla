var w=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var d=(n,o,e,i)=>{for(var t=i>1?void 0:i?U(o,e):o,a=n.length-1,s;a>=0;a--)(s=n[a])&&(t=(i?s(o,e,t):s(t))||t);return i&&t&&w(o,e,t),t},r=(n,o)=>(e,i)=>o(e,i,n);import"../../../../base/parts/sandbox/common/electronTypes.js";import{IHostService as y}from"../../host/browser/host.js";import{IFileDialogService as A,IDialogService as W}from"../../../../platform/dialogs/common/dialogs.js";import{IWorkspaceContextService as N}from"../../../../platform/workspace/common/workspace.js";import{IHistoryService as H}from"../../history/common/history.js";import{IWorkbenchEnvironmentService as b}from"../../environment/common/environmentService.js";import{URI as p}from"../../../../base/common/uri.js";import{IInstantiationService as L}from"../../../../platform/instantiation/common/instantiation.js";import{IConfigurationService as C}from"../../../../platform/configuration/common/configuration.js";import{InstantiationType as E,registerSingleton as x}from"../../../../platform/instantiation/common/extensions.js";import{IFileService as R}from"../../../../platform/files/common/files.js";import{IOpenerService as T}from"../../../../platform/opener/common/opener.js";import{INativeHostService as V}from"../../../../platform/native/common/native.js";import{AbstractFileDialogService as M}from"../browser/abstractFileDialogService.js";import{Schemas as f}from"../../../../base/common/network.js";import{ILanguageService as j}from"../../../../editor/common/languages/language.js";import{IWorkspacesService as q}from"../../../../platform/workspaces/common/workspaces.js";import{ILabelService as z}from"../../../../platform/label/common/label.js";import{IPathService as B}from"../../path/common/pathService.js";import{ICommandService as G}from"../../../../platform/commands/common/commands.js";import{ICodeEditorService as J}from"../../../../editor/browser/services/codeEditorService.js";import{IEditorService as K}from"../../editor/common/editorService.js";import{ILogService as Q}from"../../../../platform/log/common/log.js";import{getActiveWindow as m}from"../../../../base/browser/dom.js";let l=class extends M{constructor(e,i,t,a,s,c,S,h,X,v,u,I,g,O,D,F,P,k){super(e,i,t,a,s,c,S,h,v,u,I,g,O,D,F,P,k);this.nativeHostService=X}toNativeOpenDialogOptions(e){return{forceNewWindow:e.forceNewWindow,telemetryExtraData:e.telemetryExtraData,defaultPath:e.defaultUri?.fsPath}}shouldUseSimplified(e){const i=this.configurationService.getValue("files.simpleDialog.enable")===!0,t=this.configurationService.getValue("window.openFilesInNewWindow")==="on";return{useSimplified:e!==f.file&&e!==f.vscodeUserData||i,isSetting:t}}async pickFileFolderAndOpen(e){const i=this.getFileSystemSchema(e);e.defaultUri||(e.defaultUri=await this.defaultFilePath(i));const t=this.shouldUseSimplified(i);return t.useSimplified?this.pickFileFolderAndOpenSimplified(i,e,t.isSetting):this.nativeHostService.pickFileFolderAndOpen(this.toNativeOpenDialogOptions(e))}async pickFileAndOpen(e){const i=this.getFileSystemSchema(e);e.defaultUri||(e.defaultUri=await this.defaultFilePath(i));const t=this.shouldUseSimplified(i);return t.useSimplified?this.pickFileAndOpenSimplified(i,e,t.isSetting):this.nativeHostService.pickFileAndOpen(this.toNativeOpenDialogOptions(e))}async pickFolderAndOpen(e){const i=this.getFileSystemSchema(e);return e.defaultUri||(e.defaultUri=await this.defaultFolderPath(i)),this.shouldUseSimplified(i).useSimplified?this.pickFolderAndOpenSimplified(i,e):this.nativeHostService.pickFolderAndOpen(this.toNativeOpenDialogOptions(e))}async pickWorkspaceAndOpen(e){e.availableFileSystems=this.getWorkspaceAvailableFileSystems(e);const i=this.getFileSystemSchema(e);return e.defaultUri||(e.defaultUri=await this.defaultWorkspacePath(i)),this.shouldUseSimplified(i).useSimplified?this.pickWorkspaceAndOpenSimplified(i,e):this.nativeHostService.pickWorkspaceAndOpen(this.toNativeOpenDialogOptions(e))}async pickFileToSave(e,i){const t=this.getFileSystemSchema({defaultUri:e,availableFileSystems:i}),a=this.getPickFileToSaveDialogOptions(e,i);if(this.shouldUseSimplified(t).useSimplified)return this.pickFileToSaveSimplified(t,a);{const s=await this.nativeHostService.showSaveDialog(this.toNativeSaveDialogOptions(a));if(s&&!s.canceled&&s.filePath){const c=p.file(s.filePath);return this.addFileToRecentlyOpened(c),c}}}toNativeSaveDialogOptions(e){return e.defaultUri=e.defaultUri?p.file(e.defaultUri.path):void 0,{defaultPath:e.defaultUri?.fsPath,buttonLabel:e.saveLabel,filters:e.filters,title:e.title,targetWindowId:m().vscodeWindowId}}async showSaveDialog(e){const i=this.getFileSystemSchema(e);if(this.shouldUseSimplified(i).useSimplified)return this.showSaveDialogSimplified(i,e);const t=await this.nativeHostService.showSaveDialog(this.toNativeSaveDialogOptions(e));if(t&&!t.canceled&&t.filePath)return p.file(t.filePath)}async showOpenDialog(e){const i=this.getFileSystemSchema(e);if(this.shouldUseSimplified(i).useSimplified)return this.showOpenDialogSimplified(i,e);const t={title:e.title,defaultPath:e.defaultUri?.fsPath,buttonLabel:e.openLabel,filters:e.filters,properties:[],targetWindowId:m().vscodeWindowId};t.properties.push("createDirectory"),e.canSelectFiles&&t.properties.push("openFile"),e.canSelectFolders&&t.properties.push("openDirectory"),e.canSelectMany&&t.properties.push("multiSelections");const a=await this.nativeHostService.showOpenDialog(t);return a&&Array.isArray(a.filePaths)&&a.filePaths.length>0?a.filePaths.map(p.file):void 0}};l=d([r(0,y),r(1,N),r(2,H),r(3,b),r(4,L),r(5,C),r(6,R),r(7,T),r(8,V),r(9,W),r(10,j),r(11,q),r(12,z),r(13,B),r(14,G),r(15,K),r(16,J),r(17,Q)],l),x(A,l,E.Delayed);export{l as FileDialogService};
