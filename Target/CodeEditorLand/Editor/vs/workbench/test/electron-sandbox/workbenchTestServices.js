var g=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var v=(s,e,i,r)=>{for(var n=r>1?void 0:r?y(e,i):e,c=s.length-1,a;c>=0;c--)(a=s[c])&&(n=(r?a(e,i,n):a(n))||n);return r&&n&&g(e,i,n),n},o=(s,e)=>(i,r)=>e(i,r,s);import{Event as t}from"../../../base/common/event.js";import{workbenchInstantiationService as I,TestEncodingOracle as P,TestEnvironmentService as h,TestLifecycleService as w}from"../browser/workbenchTestServices.js";import"../../../platform/ipc/electron-sandbox/services.js";import{INativeHostService as u}from"../../../platform/native/common/native.js";import{VSBuffer as b}from"../../../base/common/buffer.js";import{DisposableStore as k}from"../../../base/common/lifecycle.js";import"../../../base/common/uri.js";import{IFileDialogService as C}from"../../../platform/dialogs/common/dialogs.js";import"../../../platform/theme/common/themeService.js";import"../../../platform/window/common/window.js";import"../../../platform/configuration/test/common/testConfigurationService.js";import"../../../platform/contextkey/common/contextkey.js";import{INativeEnvironmentService as O}from"../../../platform/environment/common/environment.js";import{IFileService as f}from"../../../platform/files/common/files.js";import"../../../platform/instantiation/common/instantiation.js";import{IEditorService as E}from"../../services/editor/common/editorService.js";import"../../services/path/common/pathService.js";import"../../services/textfile/common/textEditorService.js";import{ITextFileService as W}from"../../services/textfile/common/textfiles.js";import{AbstractNativeExtensionTipsService as x}from"../../../platform/extensionManagement/common/extensionTipsService.js";import{IExtensionManagementService as T}from"../../../platform/extensionManagement/common/extensionManagement.js";import{IExtensionRecommendationNotificationService as B}from"../../../platform/extensionRecommendations/common/extensionRecommendations.js";import{IProductService as N}from"../../../platform/product/common/productService.js";import{IStorageService as F}from"../../../platform/storage/common/storage.js";import{ITelemetryService as D}from"../../../platform/telemetry/common/telemetry.js";import{IModelService as R}from"../../../editor/common/services/model.js";import"../../../editor/common/services/modelService.js";import{IWorkspaceContextService as M}from"../../../platform/workspace/common/workspace.js";import{IFilesConfigurationService as A}from"../../services/filesConfiguration/common/filesConfigurationService.js";import{ILifecycleService as _}from"../../services/lifecycle/common/lifecycle.js";import{IWorkingCopyBackupService as H}from"../../services/workingCopy/common/workingCopyBackup.js";import{IWorkingCopyService as U}from"../../services/workingCopy/common/workingCopyService.js";import"../common/workbenchTestServices.js";import{NativeTextFileService as V}from"../../services/textfile/electron-sandbox/nativeTextFileService.js";import{insert as J}from"../../../base/common/arrays.js";import{Schemas as m}from"../../../base/common/network.js";import{FileService as K}from"../../../platform/files/common/fileService.js";import{InMemoryFileSystemProvider as z}from"../../../platform/files/common/inMemoryFilesystemProvider.js";import{NullLogService as L}from"../../../platform/log/common/log.js";import{FileUserDataProvider as Y}from"../../../platform/userData/common/fileUserDataProvider.js";import"../../services/workingCopy/common/workingCopy.js";import{NativeWorkingCopyBackupService as j}from"../../services/workingCopy/electron-sandbox/workingCopyBackupService.js";import"../../../base/common/cancellation.js";import{UriIdentityService as G}from"../../../platform/uriIdentity/common/uriIdentityService.js";import{UserDataProfilesService as q}from"../../../platform/userDataProfile/common/userDataProfile.js";import"../../../platform/request/common/request.js";class Wi{createRawConnection(){throw new Error("Not Implemented")}getChannel(e){}registerChannel(e,i){}notifyRestored(){}}class Q{windowId=-1;onDidOpenMainWindow=t.None;onDidMaximizeWindow=t.None;onDidUnmaximizeWindow=t.None;onDidFocusMainWindow=t.None;onDidBlurMainWindow=t.None;onDidFocusMainOrAuxiliaryWindow=t.None;onDidBlurMainOrAuxiliaryWindow=t.None;onDidResumeOS=t.None;onDidChangeColorScheme=t.None;onDidChangePassword=t.None;onDidTriggerWindowSystemContextMenu=t.None;onDidChangeWindowFullScreen=t.None;onDidChangeDisplay=t.None;windowCount=Promise.resolve(1);getWindowCount(){return this.windowCount}async getWindows(){return[]}async getActiveWindowId(){}async getActiveWindowPosition(){}openWindow(e,i){throw new Error("Method not implemented.")}async toggleFullScreen(){}async handleTitleDoubleClick(){}async isMaximized(){return!0}async isFullScreen(){return!0}async maximizeWindow(){}async unmaximizeWindow(){}async minimizeWindow(){}async moveWindowTop(e){}getCursorScreenPoint(){throw new Error("Method not implemented.")}async positionWindow(e,i){}async updateWindowControls(e){}async setMinimumSize(e,i){}async saveWindowSplash(e){}async focusWindow(e){}async showMessageBox(e){throw new Error("Method not implemented.")}async showSaveDialog(e){throw new Error("Method not implemented.")}async showOpenDialog(e){throw new Error("Method not implemented.")}async pickFileFolderAndOpen(e){}async pickFileAndOpen(e){}async pickFolderAndOpen(e){}async pickWorkspaceAndOpen(e){}async showItemInFolder(e){}async setRepresentedFilename(e){}async isAdmin(){return!1}async writeElevated(e,i){}async isRunningUnderARM64Translation(){return!1}async getOSProperties(){return Object.create(null)}async getOSStatistics(){return Object.create(null)}async getOSVirtualMachineHint(){return 0}async getOSColorScheme(){return{dark:!0,highContrast:!1}}async hasWSLFeatureInstalled(){return!1}async getProcessId(){throw new Error("Method not implemented.")}async killProcess(){}async setDocumentEdited(e){}async openExternal(e,i){return!1}async updateTouchBar(){}async moveItemToTrash(){}async newWindowTab(){}async showPreviousWindowTab(){}async showNextWindowTab(){}async moveWindowTabToNewWindow(){}async mergeAllWindowTabs(){}async toggleWindowTabsBar(){}async installShellCommand(){}async uninstallShellCommand(){}async notifyReady(){}async relaunch(e){}async reload(){}async closeWindow(){}async quit(){}async exit(e){}async openDevTools(){}async toggleDevTools(){}async resolveProxy(e){}async lookupAuthorization(e){}async lookupKerberosAuthorization(e){}async loadCertificates(){return[]}async findFreePort(e,i,r,n){return-1}async readClipboardText(e){return""}async writeClipboardText(e,i){}async readClipboardFindText(){return""}async writeClipboardFindText(e){}async writeClipboardBuffer(e,i,r){}async readClipboardBuffer(e){return b.wrap(Uint8Array.from([]))}async hasClipboard(e,i){return!1}async windowsGetStringRegKey(e,i,r){}async profileRenderer(){throw new Error}}let p=class extends x{constructor(e,i,r,n,c,a,d,S){super(e.userHome,c,i,r,n,a,d,S)}};p=v([o(0,O),o(1,D),o(2,T),o(3,F),o(4,u),o(5,B),o(6,f),o(7,N)],p);function xi(s,e=new k){const i=I({workingCopyBackupService:()=>e.add(new X),...s},e);return i.stub(u,new Q),i}let l=class{constructor(e,i,r,n,c,a,d,S,Z,$,ee){this.lifecycleService=e;this.textFileService=i;this.filesConfigurationService=r;this.contextService=n;this.modelService=c;this.fileService=a;this.nativeHostService=d;this.fileDialogService=S;this.workingCopyBackupService=Z;this.workingCopyService=$;this.editorService=ee}};l=v([o(0,_),o(1,W),o(2,A),o(3,M),o(4,R),o(5,f),o(6,u),o(7,C),o(8,H),o(9,U),o(10,E)],l);class Ti extends V{_testEncoding;get encoding(){return this._testEncoding||(this._testEncoding=this._register(this.instantiationService.createInstance(P))),this._testEncoding}}class X extends j{backupResourceJoiners;discardBackupJoiners;discardedBackups;discardedAllBackups;pendingBackupsArr;constructor(){const e=h,i=new L,r=new K(i),n=new w;super(e,r,i,n);const c=this._register(new z);this._register(r.registerProvider(m.inMemory,c));const a=this._register(new G(r)),d=this._register(new q(e,r,a,i));this._register(r.registerProvider(m.vscodeUserData,this._register(new Y(m.file,c,m.vscodeUserData,d,a,i)))),this.backupResourceJoiners=[],this.discardBackupJoiners=[],this.discardedBackups=[],this.pendingBackupsArr=[],this.discardedAllBackups=!1,this._register(r),this._register(n)}testGetFileService(){return this.fileService}async waitForAllBackups(){await Promise.all(this.pendingBackupsArr)}joinBackupResource(){return new Promise(e=>this.backupResourceJoiners.push(e))}async backup(e,i,r,n,c){const a=super.backup(e,i,r,n,c),d=J(this.pendingBackupsArr,a.then(void 0,void 0));try{await a}finally{d()}for(;this.backupResourceJoiners.length;)this.backupResourceJoiners.pop()()}joinDiscardBackup(){return new Promise(e=>this.discardBackupJoiners.push(e))}async discardBackup(e){for(await super.discardBackup(e),this.discardedBackups.push(e);this.discardBackupJoiners.length;)this.discardBackupJoiners.pop()()}async discardBackups(e){return this.discardedAllBackups=!0,super.discardBackups(e)}async getBackupContents(e){const i=this.toBackupResource(e);return(await this.fileService.readFile(i)).value.toString()}}export{p as TestExtensionTipsService,Q as TestNativeHostService,Ti as TestNativeTextFileServiceWithEncodingOverrides,X as TestNativeWorkingCopyBackupService,l as TestServiceAccessor,Wi as TestSharedProcessService,xi as workbenchInstantiationService};
