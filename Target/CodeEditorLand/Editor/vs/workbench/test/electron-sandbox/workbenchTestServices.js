var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Event } from "../../../base/common/event.js";
import { workbenchInstantiationService as browserWorkbenchInstantiationService, ITestInstantiationService, TestEncodingOracle, TestEnvironmentService, TestFileDialogService, TestFilesConfigurationService, TestFileService, TestLifecycleService, TestTextFileService } from "../browser/workbenchTestServices.js";
import { ISharedProcessService } from "../../../platform/ipc/electron-sandbox/services.js";
import { INativeHostService, INativeHostOptions, IOSProperties, IOSStatistics } from "../../../platform/native/common/native.js";
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from "../../../base/common/buffer.js";
import { DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IFileDialogService, INativeOpenDialogOptions } from "../../../platform/dialogs/common/dialogs.js";
import { IPartsSplash } from "../../../platform/theme/common/themeService.js";
import { IOpenedMainWindow, IOpenEmptyWindowOptions, IWindowOpenable, IOpenWindowOptions, IColorScheme, IRectangle, IPoint } from "../../../platform/window/common/window.js";
import { TestConfigurationService } from "../../../platform/configuration/test/common/testConfigurationService.js";
import { IContextKeyService } from "../../../platform/contextkey/common/contextkey.js";
import { IEnvironmentService, INativeEnvironmentService } from "../../../platform/environment/common/environment.js";
import { IFileService } from "../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { IEditorService } from "../../services/editor/common/editorService.js";
import { IPathService } from "../../services/path/common/pathService.js";
import { ITextEditorService } from "../../services/textfile/common/textEditorService.js";
import { ITextFileService } from "../../services/textfile/common/textfiles.js";
import { AbstractNativeExtensionTipsService } from "../../../platform/extensionManagement/common/extensionTipsService.js";
import { IExtensionManagementService } from "../../../platform/extensionManagement/common/extensionManagement.js";
import { IExtensionRecommendationNotificationService } from "../../../platform/extensionRecommendations/common/extensionRecommendations.js";
import { IProductService } from "../../../platform/product/common/productService.js";
import { IStorageService } from "../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../platform/telemetry/common/telemetry.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { ModelService } from "../../../editor/common/services/modelService.js";
import { IWorkspaceContextService } from "../../../platform/workspace/common/workspace.js";
import { IFilesConfigurationService } from "../../services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "../../services/lifecycle/common/lifecycle.js";
import { IWorkingCopyBackupService } from "../../services/workingCopy/common/workingCopyBackup.js";
import { IWorkingCopyService } from "../../services/workingCopy/common/workingCopyService.js";
import { TestContextService } from "../common/workbenchTestServices.js";
import { NativeTextFileService } from "../../services/textfile/electron-sandbox/nativeTextFileService.js";
import { insert } from "../../../base/common/arrays.js";
import { Schemas } from "../../../base/common/network.js";
import { FileService } from "../../../platform/files/common/fileService.js";
import { InMemoryFileSystemProvider } from "../../../platform/files/common/inMemoryFilesystemProvider.js";
import { NullLogService } from "../../../platform/log/common/log.js";
import { FileUserDataProvider } from "../../../platform/userData/common/fileUserDataProvider.js";
import { IWorkingCopyIdentifier } from "../../services/workingCopy/common/workingCopy.js";
import { NativeWorkingCopyBackupService } from "../../services/workingCopy/electron-sandbox/workingCopyBackupService.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { UriIdentityService } from "../../../platform/uriIdentity/common/uriIdentityService.js";
import { UserDataProfilesService } from "../../../platform/userDataProfile/common/userDataProfile.js";
import { AuthInfo, Credentials } from "../../../platform/request/common/request.js";
class TestSharedProcessService {
  static {
    __name(this, "TestSharedProcessService");
  }
  createRawConnection() {
    throw new Error("Not Implemented");
  }
  getChannel(channelName) {
    return void 0;
  }
  registerChannel(channelName, channel) {
  }
  notifyRestored() {
  }
}
class TestNativeHostService {
  static {
    __name(this, "TestNativeHostService");
  }
  windowId = -1;
  onDidOpenMainWindow = Event.None;
  onDidMaximizeWindow = Event.None;
  onDidUnmaximizeWindow = Event.None;
  onDidFocusMainWindow = Event.None;
  onDidBlurMainWindow = Event.None;
  onDidFocusMainOrAuxiliaryWindow = Event.None;
  onDidBlurMainOrAuxiliaryWindow = Event.None;
  onDidResumeOS = Event.None;
  onDidChangeColorScheme = Event.None;
  onDidChangePassword = Event.None;
  onDidTriggerWindowSystemContextMenu = Event.None;
  onDidChangeWindowFullScreen = Event.None;
  onDidChangeDisplay = Event.None;
  windowCount = Promise.resolve(1);
  getWindowCount() {
    return this.windowCount;
  }
  async getWindows() {
    return [];
  }
  async getActiveWindowId() {
    return void 0;
  }
  async getActiveWindowPosition() {
    return void 0;
  }
  openWindow(arg1, arg2) {
    throw new Error("Method not implemented.");
  }
  async toggleFullScreen() {
  }
  async handleTitleDoubleClick() {
  }
  async isMaximized() {
    return true;
  }
  async isFullScreen() {
    return true;
  }
  async maximizeWindow() {
  }
  async unmaximizeWindow() {
  }
  async minimizeWindow() {
  }
  async moveWindowTop(options) {
  }
  getCursorScreenPoint() {
    throw new Error("Method not implemented.");
  }
  async positionWindow(position, options) {
  }
  async updateWindowControls(options) {
  }
  async setMinimumSize(width, height) {
  }
  async saveWindowSplash(value) {
  }
  async focusWindow(options) {
  }
  async showMessageBox(options) {
    throw new Error("Method not implemented.");
  }
  async showSaveDialog(options) {
    throw new Error("Method not implemented.");
  }
  async showOpenDialog(options) {
    throw new Error("Method not implemented.");
  }
  async pickFileFolderAndOpen(options) {
  }
  async pickFileAndOpen(options) {
  }
  async pickFolderAndOpen(options) {
  }
  async pickWorkspaceAndOpen(options) {
  }
  async showItemInFolder(path) {
  }
  async setRepresentedFilename(path) {
  }
  async isAdmin() {
    return false;
  }
  async writeElevated(source, target) {
  }
  async isRunningUnderARM64Translation() {
    return false;
  }
  async getOSProperties() {
    return /* @__PURE__ */ Object.create(null);
  }
  async getOSStatistics() {
    return /* @__PURE__ */ Object.create(null);
  }
  async getOSVirtualMachineHint() {
    return 0;
  }
  async getOSColorScheme() {
    return { dark: true, highContrast: false };
  }
  async hasWSLFeatureInstalled() {
    return false;
  }
  async getProcessId() {
    throw new Error("Method not implemented.");
  }
  async killProcess() {
  }
  async setDocumentEdited(edited) {
  }
  async openExternal(url, defaultApplication) {
    return false;
  }
  async updateTouchBar() {
  }
  async moveItemToTrash() {
  }
  async newWindowTab() {
  }
  async showPreviousWindowTab() {
  }
  async showNextWindowTab() {
  }
  async moveWindowTabToNewWindow() {
  }
  async mergeAllWindowTabs() {
  }
  async toggleWindowTabsBar() {
  }
  async installShellCommand() {
  }
  async uninstallShellCommand() {
  }
  async notifyReady() {
  }
  async relaunch(options) {
  }
  async reload() {
  }
  async closeWindow() {
  }
  async quit() {
  }
  async exit(code) {
  }
  async openDevTools() {
  }
  async toggleDevTools() {
  }
  async resolveProxy(url) {
    return void 0;
  }
  async lookupAuthorization(authInfo) {
    return void 0;
  }
  async lookupKerberosAuthorization(url) {
    return void 0;
  }
  async loadCertificates() {
    return [];
  }
  async findFreePort(startPort, giveUpAfter, timeout, stride) {
    return -1;
  }
  async readClipboardText(type) {
    return "";
  }
  async writeClipboardText(text, type) {
  }
  async readClipboardFindText() {
    return "";
  }
  async writeClipboardFindText(text) {
  }
  async writeClipboardBuffer(format, buffer, type) {
  }
  async readClipboardBuffer(format) {
    return VSBuffer.wrap(Uint8Array.from([]));
  }
  async hasClipboard(format, type) {
    return false;
  }
  async windowsGetStringRegKey(hive, path, name) {
    return void 0;
  }
  async profileRenderer() {
    throw new Error();
  }
}
let TestExtensionTipsService = class extends AbstractNativeExtensionTipsService {
  static {
    __name(this, "TestExtensionTipsService");
  }
  constructor(environmentService, telemetryService, extensionManagementService, storageService, nativeHostService, extensionRecommendationNotificationService, fileService, productService) {
    super(environmentService.userHome, nativeHostService, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService);
  }
};
TestExtensionTipsService = __decorateClass([
  __decorateParam(0, INativeEnvironmentService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IExtensionManagementService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, INativeHostService),
  __decorateParam(5, IExtensionRecommendationNotificationService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IProductService)
], TestExtensionTipsService);
function workbenchInstantiationService(overrides, disposables = new DisposableStore()) {
  const instantiationService = browserWorkbenchInstantiationService({
    workingCopyBackupService: /* @__PURE__ */ __name(() => disposables.add(new TestNativeWorkingCopyBackupService()), "workingCopyBackupService"),
    ...overrides
  }, disposables);
  instantiationService.stub(INativeHostService, new TestNativeHostService());
  return instantiationService;
}
__name(workbenchInstantiationService, "workbenchInstantiationService");
let TestServiceAccessor = class {
  constructor(lifecycleService, textFileService, filesConfigurationService, contextService, modelService, fileService, nativeHostService, fileDialogService, workingCopyBackupService, workingCopyService, editorService) {
    this.lifecycleService = lifecycleService;
    this.textFileService = textFileService;
    this.filesConfigurationService = filesConfigurationService;
    this.contextService = contextService;
    this.modelService = modelService;
    this.fileService = fileService;
    this.nativeHostService = nativeHostService;
    this.fileDialogService = fileDialogService;
    this.workingCopyBackupService = workingCopyBackupService;
    this.workingCopyService = workingCopyService;
    this.editorService = editorService;
  }
  static {
    __name(this, "TestServiceAccessor");
  }
};
TestServiceAccessor = __decorateClass([
  __decorateParam(0, ILifecycleService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IFilesConfigurationService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IModelService),
  __decorateParam(5, IFileService),
  __decorateParam(6, INativeHostService),
  __decorateParam(7, IFileDialogService),
  __decorateParam(8, IWorkingCopyBackupService),
  __decorateParam(9, IWorkingCopyService),
  __decorateParam(10, IEditorService)
], TestServiceAccessor);
class TestNativeTextFileServiceWithEncodingOverrides extends NativeTextFileService {
  static {
    __name(this, "TestNativeTextFileServiceWithEncodingOverrides");
  }
  _testEncoding;
  get encoding() {
    if (!this._testEncoding) {
      this._testEncoding = this._register(this.instantiationService.createInstance(TestEncodingOracle));
    }
    return this._testEncoding;
  }
}
class TestNativeWorkingCopyBackupService extends NativeWorkingCopyBackupService {
  static {
    __name(this, "TestNativeWorkingCopyBackupService");
  }
  backupResourceJoiners;
  discardBackupJoiners;
  discardedBackups;
  discardedAllBackups;
  pendingBackupsArr;
  constructor() {
    const environmentService = TestEnvironmentService;
    const logService = new NullLogService();
    const fileService = new FileService(logService);
    const lifecycleService = new TestLifecycleService();
    super(environmentService, fileService, logService, lifecycleService);
    const inMemoryFileSystemProvider = this._register(new InMemoryFileSystemProvider());
    this._register(fileService.registerProvider(Schemas.inMemory, inMemoryFileSystemProvider));
    const uriIdentityService = this._register(new UriIdentityService(fileService));
    const userDataProfilesService = this._register(new UserDataProfilesService(environmentService, fileService, uriIdentityService, logService));
    this._register(fileService.registerProvider(Schemas.vscodeUserData, this._register(new FileUserDataProvider(Schemas.file, inMemoryFileSystemProvider, Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService))));
    this.backupResourceJoiners = [];
    this.discardBackupJoiners = [];
    this.discardedBackups = [];
    this.pendingBackupsArr = [];
    this.discardedAllBackups = false;
    this._register(fileService);
    this._register(lifecycleService);
  }
  testGetFileService() {
    return this.fileService;
  }
  async waitForAllBackups() {
    await Promise.all(this.pendingBackupsArr);
  }
  joinBackupResource() {
    return new Promise((resolve) => this.backupResourceJoiners.push(resolve));
  }
  async backup(identifier, content, versionId, meta, token) {
    const p = super.backup(identifier, content, versionId, meta, token);
    const removeFromPendingBackups = insert(this.pendingBackupsArr, p.then(void 0, void 0));
    try {
      await p;
    } finally {
      removeFromPendingBackups();
    }
    while (this.backupResourceJoiners.length) {
      this.backupResourceJoiners.pop()();
    }
  }
  joinDiscardBackup() {
    return new Promise((resolve) => this.discardBackupJoiners.push(resolve));
  }
  async discardBackup(identifier) {
    await super.discardBackup(identifier);
    this.discardedBackups.push(identifier);
    while (this.discardBackupJoiners.length) {
      this.discardBackupJoiners.pop()();
    }
  }
  async discardBackups(filter) {
    this.discardedAllBackups = true;
    return super.discardBackups(filter);
  }
  async getBackupContents(identifier) {
    const backupResource = this.toBackupResource(identifier);
    const fileContents = await this.fileService.readFile(backupResource);
    return fileContents.value.toString();
  }
}
export {
  TestExtensionTipsService,
  TestNativeHostService,
  TestNativeTextFileServiceWithEncodingOverrides,
  TestNativeWorkingCopyBackupService,
  TestServiceAccessor,
  TestSharedProcessService,
  workbenchInstantiationService
};
//# sourceMappingURL=workbenchTestServices.js.map
