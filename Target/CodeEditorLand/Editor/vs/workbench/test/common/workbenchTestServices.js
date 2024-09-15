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
import { join } from "../../../base/common/path.js";
import { basename, isEqual, isEqualOrParent } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { Event, Emitter } from "../../../base/common/event.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IWorkspaceContextService, IWorkspace, WorkbenchState, IWorkspaceFolder, IWorkspaceFoldersChangeEvent, Workspace, IWorkspaceFoldersWillChangeEvent, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from "../../../platform/workspace/common/workspace.js";
import { TestWorkspace } from "../../../platform/workspace/test/common/testWorkspace.js";
import { ITextResourcePropertiesService } from "../../../editor/common/services/textResourceConfiguration.js";
import { isLinux, isMacintosh } from "../../../base/common/platform.js";
import { InMemoryStorageService, WillSaveStateReason } from "../../../platform/storage/common/storage.js";
import { IWorkingCopy, IWorkingCopyBackup, WorkingCopyCapabilities } from "../../services/workingCopy/common/workingCopy.js";
import { NullExtensionService } from "../../services/extensions/common/extensions.js";
import { IWorkingCopyFileService, IWorkingCopyFileOperationParticipant, WorkingCopyFileEvent, IDeleteOperation, ICopyOperation, IMoveOperation, IFileOperationUndoRedoInfo, ICreateFileOperation, ICreateOperation, IStoredFileWorkingCopySaveParticipant, IStoredFileWorkingCopySaveParticipantContext } from "../../services/workingCopy/common/workingCopyFileService.js";
import { IDisposable, Disposable } from "../../../base/common/lifecycle.js";
import { IBaseFileStat, IFileStatWithMetadata } from "../../../platform/files/common/files.js";
import { ISaveOptions, IRevertOptions, SaveReason, GroupIdentifier } from "../../common/editor.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import product from "../../../platform/product/common/product.js";
import { IActivity, IActivityService } from "../../services/activity/common/activity.js";
import { IStoredFileWorkingCopySaveEvent } from "../../services/workingCopy/common/storedFileWorkingCopy.js";
import { AbstractLoggerService, ILogger, LogLevel, NullLogger } from "../../../platform/log/common/log.js";
import { IResourceEditorInput } from "../../../platform/editor/common/editor.js";
import { EditorInput } from "../../common/editor/editorInput.js";
import { IHistoryService } from "../../services/history/common/history.js";
import { IAutoSaveConfiguration, IAutoSaveMode, IFilesConfigurationService } from "../../services/filesConfiguration/common/filesConfigurationService.js";
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService, IWorkspaceTrustRequestService, IWorkspaceTrustTransitionParticipant, IWorkspaceTrustUriInfo, WorkspaceTrustRequestOptions, WorkspaceTrustUriResponse } from "../../../platform/workspace/common/workspaceTrust.js";
import { IMarker, IMarkerData, IMarkerService, IResourceMarker, MarkerStatistics } from "../../../platform/markers/common/markers.js";
import { IProgress, IProgressStep } from "../../../platform/progress/common/progress.js";
class TestLoggerService extends AbstractLoggerService {
  static {
    __name(this, "TestLoggerService");
  }
  constructor(logsHome) {
    super(LogLevel.Info, logsHome ?? URI.file("tests").with({ scheme: "vscode-tests" }));
  }
  doCreateLogger() {
    return new NullLogger();
  }
}
let TestTextResourcePropertiesService = class {
  constructor(configurationService) {
    this.configurationService = configurationService;
  }
  static {
    __name(this, "TestTextResourcePropertiesService");
  }
  getEOL(resource, language) {
    const eol = this.configurationService.getValue("files.eol", { overrideIdentifier: language, resource });
    if (eol && typeof eol === "string" && eol !== "auto") {
      return eol;
    }
    return isLinux || isMacintosh ? "\n" : "\r\n";
  }
};
TestTextResourcePropertiesService = __decorateClass([
  __decorateParam(0, IConfigurationService)
], TestTextResourcePropertiesService);
class TestContextService {
  static {
    __name(this, "TestContextService");
  }
  workspace;
  options;
  _onDidChangeWorkspaceName;
  get onDidChangeWorkspaceName() {
    return this._onDidChangeWorkspaceName.event;
  }
  _onWillChangeWorkspaceFolders;
  get onWillChangeWorkspaceFolders() {
    return this._onWillChangeWorkspaceFolders.event;
  }
  _onDidChangeWorkspaceFolders;
  get onDidChangeWorkspaceFolders() {
    return this._onDidChangeWorkspaceFolders.event;
  }
  _onDidChangeWorkbenchState;
  get onDidChangeWorkbenchState() {
    return this._onDidChangeWorkbenchState.event;
  }
  constructor(workspace = TestWorkspace, options = null) {
    this.workspace = workspace;
    this.options = options || /* @__PURE__ */ Object.create(null);
    this._onDidChangeWorkspaceName = new Emitter();
    this._onWillChangeWorkspaceFolders = new Emitter();
    this._onDidChangeWorkspaceFolders = new Emitter();
    this._onDidChangeWorkbenchState = new Emitter();
  }
  getFolders() {
    return this.workspace ? this.workspace.folders : [];
  }
  getWorkbenchState() {
    if (this.workspace.configuration) {
      return WorkbenchState.WORKSPACE;
    }
    if (this.workspace.folders.length) {
      return WorkbenchState.FOLDER;
    }
    return WorkbenchState.EMPTY;
  }
  getCompleteWorkspace() {
    return Promise.resolve(this.getWorkspace());
  }
  getWorkspace() {
    return this.workspace;
  }
  getWorkspaceFolder(resource) {
    return this.workspace.getFolder(resource);
  }
  setWorkspace(workspace) {
    this.workspace = workspace;
  }
  getOptions() {
    return this.options;
  }
  updateOptions() {
  }
  isInsideWorkspace(resource) {
    if (resource && this.workspace) {
      return isEqualOrParent(resource, this.workspace.folders[0].uri);
    }
    return false;
  }
  toResource(workspaceRelativePath) {
    return URI.file(join("C:\\", workspaceRelativePath));
  }
  isCurrentWorkspace(workspaceIdOrFolder) {
    return URI.isUri(workspaceIdOrFolder) && isEqual(this.workspace.folders[0].uri, workspaceIdOrFolder);
  }
}
class TestStorageService extends InMemoryStorageService {
  static {
    __name(this, "TestStorageService");
  }
  testEmitWillSaveState(reason) {
    super.emitWillSaveState(reason);
  }
}
class TestHistoryService {
  constructor(root) {
    this.root = root;
  }
  static {
    __name(this, "TestHistoryService");
  }
  async reopenLastClosedEditor() {
  }
  async goForward() {
  }
  async goBack() {
  }
  async goPrevious() {
  }
  async goLast() {
  }
  removeFromHistory(_input) {
  }
  clear() {
  }
  clearRecentlyOpened() {
  }
  getHistory() {
    return [];
  }
  async openNextRecentlyUsedEditor(group) {
  }
  async openPreviouslyUsedEditor(group) {
  }
  getLastActiveWorkspaceRoot(_schemeFilter) {
    return this.root;
  }
  getLastActiveFile(_schemeFilter) {
    return void 0;
  }
}
class TestWorkingCopy extends Disposable {
  constructor(resource, isDirty = false, typeId = "testWorkingCopyType") {
    super();
    this.resource = resource;
    this.typeId = typeId;
    this.dirty = isDirty;
  }
  static {
    __name(this, "TestWorkingCopy");
  }
  _onDidChangeDirty = this._register(new Emitter());
  onDidChangeDirty = this._onDidChangeDirty.event;
  _onDidChangeContent = this._register(new Emitter());
  onDidChangeContent = this._onDidChangeContent.event;
  _onDidSave = this._register(new Emitter());
  onDidSave = this._onDidSave.event;
  capabilities = WorkingCopyCapabilities.None;
  name = basename(this.resource);
  dirty = false;
  setDirty(dirty) {
    if (this.dirty !== dirty) {
      this.dirty = dirty;
      this._onDidChangeDirty.fire();
    }
  }
  setContent(content) {
    this._onDidChangeContent.fire();
  }
  isDirty() {
    return this.dirty;
  }
  isModified() {
    return this.isDirty();
  }
  async save(options, stat) {
    this._onDidSave.fire({ reason: options?.reason ?? SaveReason.EXPLICIT, stat: stat ?? createFileStat(this.resource), source: options?.source });
    return true;
  }
  async revert(options) {
    this.setDirty(false);
  }
  async backup(token) {
    return {};
  }
}
function createFileStat(resource, readonly = false) {
  return {
    resource,
    etag: Date.now().toString(),
    mtime: Date.now(),
    ctime: Date.now(),
    size: 42,
    isFile: true,
    isDirectory: false,
    isSymbolicLink: false,
    readonly,
    locked: false,
    name: basename(resource),
    children: void 0
  };
}
__name(createFileStat, "createFileStat");
class TestWorkingCopyFileService {
  static {
    __name(this, "TestWorkingCopyFileService");
  }
  onWillRunWorkingCopyFileOperation = Event.None;
  onDidFailWorkingCopyFileOperation = Event.None;
  onDidRunWorkingCopyFileOperation = Event.None;
  addFileOperationParticipant(participant) {
    return Disposable.None;
  }
  hasSaveParticipants = false;
  addSaveParticipant(participant) {
    return Disposable.None;
  }
  async runSaveParticipants(workingCopy, context, progress, token) {
  }
  async delete(operations, token, undoInfo) {
  }
  registerWorkingCopyProvider(provider) {
    return Disposable.None;
  }
  getDirty(resource) {
    return [];
  }
  create(operations, token, undoInfo) {
    throw new Error("Method not implemented.");
  }
  createFolder(operations, token, undoInfo) {
    throw new Error("Method not implemented.");
  }
  move(operations, token, undoInfo) {
    throw new Error("Method not implemented.");
  }
  copy(operations, token, undoInfo) {
    throw new Error("Method not implemented.");
  }
}
function mock() {
  return function() {
  };
}
__name(mock, "mock");
class TestExtensionService extends NullExtensionService {
  static {
    __name(this, "TestExtensionService");
  }
}
const TestProductService = { _serviceBrand: void 0, ...product };
class TestActivityService {
  static {
    __name(this, "TestActivityService");
  }
  _serviceBrand;
  onDidChangeActivity = Event.None;
  getViewContainerActivities(viewContainerId) {
    return [];
  }
  getActivity(id) {
    return [];
  }
  showViewContainerActivity(viewContainerId, badge) {
    return this;
  }
  showViewActivity(viewId, badge) {
    return this;
  }
  showAccountsActivity(activity) {
    return this;
  }
  showGlobalActivity(activity) {
    return this;
  }
  dispose() {
  }
}
const NullFilesConfigurationService = new class {
  _serviceBrand;
  onDidChangeAutoSaveConfiguration = Event.None;
  onDidChangeAutoSaveDisabled = Event.None;
  onDidChangeReadonly = Event.None;
  onDidChangeFilesAssociation = Event.None;
  isHotExitEnabled = false;
  hotExitConfiguration = void 0;
  getAutoSaveConfiguration() {
    throw new Error("Method not implemented.");
  }
  getAutoSaveMode() {
    throw new Error("Method not implemented.");
  }
  hasShortAutoSaveDelay() {
    throw new Error("Method not implemented.");
  }
  toggleAutoSave() {
    throw new Error("Method not implemented.");
  }
  disableAutoSave(resourceOrEditor) {
    throw new Error("Method not implemented.");
  }
  isReadonly(resource, stat) {
    return false;
  }
  async updateReadonly(resource, readonly) {
  }
  preventSaveConflicts(resource, language) {
    throw new Error("Method not implemented.");
  }
}();
class TestWorkspaceTrustEnablementService {
  constructor(isEnabled = true) {
    this.isEnabled = isEnabled;
  }
  static {
    __name(this, "TestWorkspaceTrustEnablementService");
  }
  _serviceBrand;
  isWorkspaceTrustEnabled() {
    return this.isEnabled;
  }
}
class TestWorkspaceTrustManagementService extends Disposable {
  constructor(trusted = true) {
    super();
    this.trusted = trusted;
  }
  static {
    __name(this, "TestWorkspaceTrustManagementService");
  }
  _serviceBrand;
  _onDidChangeTrust = this._register(new Emitter());
  onDidChangeTrust = this._onDidChangeTrust.event;
  _onDidChangeTrustedFolders = this._register(new Emitter());
  onDidChangeTrustedFolders = this._onDidChangeTrustedFolders.event;
  _onDidInitiateWorkspaceTrustRequestOnStartup = this._register(new Emitter());
  onDidInitiateWorkspaceTrustRequestOnStartup = this._onDidInitiateWorkspaceTrustRequestOnStartup.event;
  get acceptsOutOfWorkspaceFiles() {
    throw new Error("Method not implemented.");
  }
  set acceptsOutOfWorkspaceFiles(value) {
    throw new Error("Method not implemented.");
  }
  addWorkspaceTrustTransitionParticipant(participant) {
    throw new Error("Method not implemented.");
  }
  getTrustedUris() {
    throw new Error("Method not implemented.");
  }
  setParentFolderTrust(trusted) {
    throw new Error("Method not implemented.");
  }
  getUriTrustInfo(uri) {
    throw new Error("Method not implemented.");
  }
  async setTrustedUris(folders) {
    throw new Error("Method not implemented.");
  }
  async setUrisTrust(uris, trusted) {
    throw new Error("Method not implemented.");
  }
  canSetParentFolderTrust() {
    throw new Error("Method not implemented.");
  }
  canSetWorkspaceTrust() {
    throw new Error("Method not implemented.");
  }
  isWorkspaceTrusted() {
    return this.trusted;
  }
  isWorkspaceTrustForced() {
    return false;
  }
  get workspaceTrustInitialized() {
    return Promise.resolve();
  }
  get workspaceResolved() {
    return Promise.resolve();
  }
  async setWorkspaceTrust(trusted) {
    if (this.trusted !== trusted) {
      this.trusted = trusted;
      this._onDidChangeTrust.fire(this.trusted);
    }
  }
}
class TestWorkspaceTrustRequestService extends Disposable {
  constructor(_trusted) {
    super();
    this._trusted = _trusted;
  }
  static {
    __name(this, "TestWorkspaceTrustRequestService");
  }
  _serviceBrand;
  _onDidInitiateOpenFilesTrustRequest = this._register(new Emitter());
  onDidInitiateOpenFilesTrustRequest = this._onDidInitiateOpenFilesTrustRequest.event;
  _onDidInitiateWorkspaceTrustRequest = this._register(new Emitter());
  onDidInitiateWorkspaceTrustRequest = this._onDidInitiateWorkspaceTrustRequest.event;
  _onDidInitiateWorkspaceTrustRequestOnStartup = this._register(new Emitter());
  onDidInitiateWorkspaceTrustRequestOnStartup = this._onDidInitiateWorkspaceTrustRequestOnStartup.event;
  requestOpenUrisHandler = /* @__PURE__ */ __name(async (uris) => {
    return WorkspaceTrustUriResponse.Open;
  }, "requestOpenUrisHandler");
  requestOpenFilesTrust(uris) {
    return this.requestOpenUrisHandler(uris);
  }
  async completeOpenFilesTrustRequest(result, saveResponse) {
    throw new Error("Method not implemented.");
  }
  cancelWorkspaceTrustRequest() {
    throw new Error("Method not implemented.");
  }
  async completeWorkspaceTrustRequest(trusted) {
    throw new Error("Method not implemented.");
  }
  async requestWorkspaceTrust(options) {
    return this._trusted;
  }
  requestWorkspaceTrustOnStartup() {
    throw new Error("Method not implemented.");
  }
}
class TestMarkerService {
  static {
    __name(this, "TestMarkerService");
  }
  _serviceBrand;
  onMarkerChanged = Event.None;
  getStatistics() {
    throw new Error("Method not implemented.");
  }
  changeOne(owner, resource, markers) {
  }
  changeAll(owner, data) {
  }
  remove(owner, resources) {
  }
  read(filter) {
    return [];
  }
}
export {
  NullFilesConfigurationService,
  TestActivityService,
  TestContextService,
  TestExtensionService,
  TestHistoryService,
  TestLoggerService,
  TestMarkerService,
  TestProductService,
  TestStorageService,
  TestTextResourcePropertiesService,
  TestWorkingCopy,
  TestWorkingCopyFileService,
  TestWorkspaceTrustEnablementService,
  TestWorkspaceTrustManagementService,
  TestWorkspaceTrustRequestService,
  createFileStat,
  mock
};
//# sourceMappingURL=workbenchTestServices.js.map
