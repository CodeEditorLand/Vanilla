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
import { promiseWithResolvers } from "../../../../base/common/async.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { LinkedList } from "../../../../base/common/linkedList.js";
import { Schemas } from "../../../../base/common/network.js";
import { isWeb } from "../../../../base/common/platform.js";
import { isEqualAuthority } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  IRemoteAuthorityResolverService
} from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { getRemoteAuthority } from "../../../../platform/remote/common/remoteHosts.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { isVirtualResource } from "../../../../platform/workspace/common/virtualWorkspace.js";
import {
  IWorkspaceContextService,
  WorkbenchState,
  isSavedWorkspace,
  isSingleFolderWorkspaceIdentifier,
  isTemporaryWorkspace,
  toWorkspaceIdentifier
} from "../../../../platform/workspace/common/workspace.js";
import {
  IWorkspaceTrustEnablementService,
  IWorkspaceTrustManagementService,
  IWorkspaceTrustRequestService,
  WorkspaceTrustUriResponse
} from "../../../../platform/workspace/common/workspaceTrust.js";
import { Memento } from "../../../common/memento.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
const WORKSPACE_TRUST_ENABLED = "security.workspace.trust.enabled";
const WORKSPACE_TRUST_STARTUP_PROMPT = "security.workspace.trust.startupPrompt";
const WORKSPACE_TRUST_BANNER = "security.workspace.trust.banner";
const WORKSPACE_TRUST_UNTRUSTED_FILES = "security.workspace.trust.untrustedFiles";
const WORKSPACE_TRUST_EMPTY_WINDOW = "security.workspace.trust.emptyWindow";
const WORKSPACE_TRUST_EXTENSION_SUPPORT = "extensions.supportUntrustedWorkspaces";
const WORKSPACE_TRUST_STORAGE_KEY = "content.trust.model.key";
class CanonicalWorkspace {
  constructor(originalWorkspace, canonicalFolderUris, canonicalConfiguration) {
    this.originalWorkspace = originalWorkspace;
    this.canonicalFolderUris = canonicalFolderUris;
    this.canonicalConfiguration = canonicalConfiguration;
  }
  static {
    __name(this, "CanonicalWorkspace");
  }
  get folders() {
    return this.originalWorkspace.folders.map((folder, index) => {
      return {
        index: folder.index,
        name: folder.name,
        toResource: folder.toResource,
        uri: this.canonicalFolderUris[index]
      };
    });
  }
  get transient() {
    return this.originalWorkspace.transient;
  }
  get configuration() {
    return this.canonicalConfiguration ?? this.originalWorkspace.configuration;
  }
  get id() {
    return this.originalWorkspace.id;
  }
}
let WorkspaceTrustEnablementService = class extends Disposable {
  constructor(configurationService, environmentService) {
    super();
    this.configurationService = configurationService;
    this.environmentService = environmentService;
  }
  static {
    __name(this, "WorkspaceTrustEnablementService");
  }
  _serviceBrand;
  isWorkspaceTrustEnabled() {
    if (this.environmentService.disableWorkspaceTrust) {
      return false;
    }
    return !!this.configurationService.getValue(WORKSPACE_TRUST_ENABLED);
  }
};
WorkspaceTrustEnablementService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkbenchEnvironmentService)
], WorkspaceTrustEnablementService);
let WorkspaceTrustManagementService = class extends Disposable {
  constructor(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, workspaceService, workspaceTrustEnablementService, fileService) {
    super();
    this.configurationService = configurationService;
    this.remoteAuthorityResolverService = remoteAuthorityResolverService;
    this.storageService = storageService;
    this.uriIdentityService = uriIdentityService;
    this.environmentService = environmentService;
    this.workspaceService = workspaceService;
    this.workspaceTrustEnablementService = workspaceTrustEnablementService;
    this.fileService = fileService;
    this._canonicalUrisResolved = false;
    this._canonicalWorkspace = this.workspaceService.getWorkspace();
    ({
      promise: this._workspaceResolvedPromise,
      resolve: this._workspaceResolvedPromiseResolve
    } = promiseWithResolvers());
    ({
      promise: this._workspaceTrustInitializedPromise,
      resolve: this._workspaceTrustInitializedPromiseResolve
    } = promiseWithResolvers());
    this._storedTrustState = new WorkspaceTrustMemento(
      isWeb && this.isEmptyWorkspace() ? void 0 : this.storageService
    );
    this._trustTransitionManager = this._register(
      new WorkspaceTrustTransitionManager()
    );
    this._trustStateInfo = this.loadTrustInfo();
    this._isTrusted = this.calculateWorkspaceTrust();
    this.initializeWorkspaceTrust();
    this.registerListeners();
  }
  static {
    __name(this, "WorkspaceTrustManagementService");
  }
  _serviceBrand;
  storageKey = WORKSPACE_TRUST_STORAGE_KEY;
  _workspaceResolvedPromise;
  _workspaceResolvedPromiseResolve;
  _workspaceTrustInitializedPromise;
  _workspaceTrustInitializedPromiseResolve;
  _onDidChangeTrust = this._register(new Emitter());
  onDidChangeTrust = this._onDidChangeTrust.event;
  _onDidChangeTrustedFolders = this._register(
    new Emitter()
  );
  onDidChangeTrustedFolders = this._onDidChangeTrustedFolders.event;
  _canonicalStartupFiles = [];
  _canonicalWorkspace;
  _canonicalUrisResolved;
  _isTrusted;
  _trustStateInfo;
  _remoteAuthority;
  _storedTrustState;
  _trustTransitionManager;
  //#region initialize
  initializeWorkspaceTrust() {
    this.resolveCanonicalUris().then(async () => {
      this._canonicalUrisResolved = true;
      await this.updateWorkspaceTrust();
    }).finally(() => {
      this._workspaceResolvedPromiseResolve();
      if (!this.environmentService.remoteAuthority) {
        this._workspaceTrustInitializedPromiseResolve();
      }
    });
    if (this.environmentService.remoteAuthority) {
      this.remoteAuthorityResolverService.resolveAuthority(this.environmentService.remoteAuthority).then(async (result) => {
        this._remoteAuthority = result;
        await this.fileService.activateProvider(
          Schemas.vscodeRemote
        );
        await this.updateWorkspaceTrust();
      }).finally(() => {
        this._workspaceTrustInitializedPromiseResolve();
      });
    }
    if (this.isEmptyWorkspace()) {
      this._workspaceTrustInitializedPromise.then(() => {
        if (this._storedTrustState.isEmptyWorkspaceTrusted === void 0) {
          this._storedTrustState.isEmptyWorkspaceTrusted = this.isWorkspaceTrusted();
        }
      });
    }
  }
  //#endregion
  //#region private interface
  registerListeners() {
    this._register(
      this.workspaceService.onDidChangeWorkspaceFolders(
        async () => await this.updateWorkspaceTrust()
      )
    );
    this._register(
      this.storageService.onDidChangeValue(
        StorageScope.APPLICATION,
        this.storageKey,
        this._register(new DisposableStore())
      )(async () => {
        if (JSON.stringify(this._trustStateInfo) !== JSON.stringify(this.loadTrustInfo())) {
          this._trustStateInfo = this.loadTrustInfo();
          this._onDidChangeTrustedFolders.fire();
          await this.updateWorkspaceTrust();
        }
      })
    );
  }
  async getCanonicalUri(uri) {
    let canonicalUri = uri;
    if (this.environmentService.remoteAuthority && uri.scheme === Schemas.vscodeRemote) {
      canonicalUri = await this.remoteAuthorityResolverService.getCanonicalURI(uri);
    } else if (uri.scheme === "vscode-vfs") {
      const index = uri.authority.indexOf("+");
      if (index !== -1) {
        canonicalUri = uri.with({
          authority: uri.authority.substr(0, index)
        });
      }
    }
    return canonicalUri.with({ query: null, fragment: null });
  }
  async resolveCanonicalUris() {
    const filesToOpen = [];
    if (this.environmentService.filesToOpenOrCreate) {
      filesToOpen.push(...this.environmentService.filesToOpenOrCreate);
    }
    if (this.environmentService.filesToDiff) {
      filesToOpen.push(...this.environmentService.filesToDiff);
    }
    if (this.environmentService.filesToMerge) {
      filesToOpen.push(...this.environmentService.filesToMerge);
    }
    if (filesToOpen.length) {
      const filesToOpenOrCreateUris = filesToOpen.filter((f) => !!f.fileUri).map((f) => f.fileUri);
      const canonicalFilesToOpen = await Promise.all(
        filesToOpenOrCreateUris.map((uri) => this.getCanonicalUri(uri))
      );
      this._canonicalStartupFiles.push(
        ...canonicalFilesToOpen.filter(
          (uri) => this._canonicalStartupFiles.every(
            (u) => !this.uriIdentityService.extUri.isEqual(uri, u)
          )
        )
      );
    }
    const workspaceUris = this.workspaceService.getWorkspace().folders.map((f) => f.uri);
    const canonicalWorkspaceFolders = await Promise.all(
      workspaceUris.map((uri) => this.getCanonicalUri(uri))
    );
    let canonicalWorkspaceConfiguration = this.workspaceService.getWorkspace().configuration;
    if (canonicalWorkspaceConfiguration && isSavedWorkspace(
      canonicalWorkspaceConfiguration,
      this.environmentService
    )) {
      canonicalWorkspaceConfiguration = await this.getCanonicalUri(
        canonicalWorkspaceConfiguration
      );
    }
    this._canonicalWorkspace = new CanonicalWorkspace(
      this.workspaceService.getWorkspace(),
      canonicalWorkspaceFolders,
      canonicalWorkspaceConfiguration
    );
  }
  loadTrustInfo() {
    const infoAsString = this.storageService.get(
      this.storageKey,
      StorageScope.APPLICATION
    );
    let result;
    try {
      if (infoAsString) {
        result = JSON.parse(infoAsString);
      }
    } catch {
    }
    if (!result) {
      result = {
        uriTrustInfo: []
      };
    }
    if (!result.uriTrustInfo) {
      result.uriTrustInfo = [];
    }
    result.uriTrustInfo = result.uriTrustInfo.map((info) => {
      return { uri: URI.revive(info.uri), trusted: info.trusted };
    });
    result.uriTrustInfo = result.uriTrustInfo.filter(
      (info) => info.trusted
    );
    return result;
  }
  async saveTrustInfo() {
    this.storageService.store(
      this.storageKey,
      JSON.stringify(this._trustStateInfo),
      StorageScope.APPLICATION,
      StorageTarget.MACHINE
    );
    this._onDidChangeTrustedFolders.fire();
    await this.updateWorkspaceTrust();
  }
  getWorkspaceUris() {
    const workspaceUris = this._canonicalWorkspace.folders.map(
      (f) => f.uri
    );
    const workspaceConfiguration = this._canonicalWorkspace.configuration;
    if (workspaceConfiguration && isSavedWorkspace(workspaceConfiguration, this.environmentService)) {
      workspaceUris.push(workspaceConfiguration);
    }
    return workspaceUris;
  }
  calculateWorkspaceTrust() {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      return true;
    }
    if (!this._canonicalUrisResolved) {
      return false;
    }
    if (this.environmentService.remoteAuthority && this._remoteAuthority?.options?.isTrusted) {
      return this._remoteAuthority.options.isTrusted;
    }
    if (this.isEmptyWorkspace()) {
      if (this._storedTrustState.isEmptyWorkspaceTrusted !== void 0) {
        return this._storedTrustState.isEmptyWorkspaceTrusted;
      }
      if (this._canonicalStartupFiles.length) {
        return this.getUrisTrust(this._canonicalStartupFiles);
      }
      return !!this.configurationService.getValue(
        WORKSPACE_TRUST_EMPTY_WINDOW
      );
    }
    return this.getUrisTrust(this.getWorkspaceUris());
  }
  async updateWorkspaceTrust(trusted) {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      return;
    }
    if (trusted === void 0) {
      await this.resolveCanonicalUris();
      trusted = this.calculateWorkspaceTrust();
    }
    if (this.isWorkspaceTrusted() === trusted) {
      return;
    }
    this.isTrusted = trusted;
    await this._trustTransitionManager.participate(trusted);
    this._onDidChangeTrust.fire(trusted);
  }
  getUrisTrust(uris) {
    let state = true;
    for (const uri of uris) {
      const { trusted } = this.doGetUriTrustInfo(uri);
      if (!trusted) {
        state = trusted;
        return state;
      }
    }
    return state;
  }
  doGetUriTrustInfo(uri) {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      return { trusted: true, uri };
    }
    if (this.isTrustedVirtualResource(uri)) {
      return { trusted: true, uri };
    }
    if (this.isTrustedByRemote(uri)) {
      return { trusted: true, uri };
    }
    let resultState = false;
    let maxLength = -1;
    let resultUri = uri;
    for (const trustInfo of this._trustStateInfo.uriTrustInfo) {
      if (this.uriIdentityService.extUri.isEqualOrParent(
        uri,
        trustInfo.uri
      )) {
        const fsPath = trustInfo.uri.fsPath;
        if (fsPath.length > maxLength) {
          maxLength = fsPath.length;
          resultState = trustInfo.trusted;
          resultUri = trustInfo.uri;
        }
      }
    }
    return { trusted: resultState, uri: resultUri };
  }
  async doSetUrisTrust(uris, trusted) {
    let changed = false;
    for (const uri of uris) {
      if (trusted) {
        if (this.isTrustedVirtualResource(uri)) {
          continue;
        }
        if (this.isTrustedByRemote(uri)) {
          continue;
        }
        const foundItem = this._trustStateInfo.uriTrustInfo.find(
          (trustInfo) => this.uriIdentityService.extUri.isEqual(
            trustInfo.uri,
            uri
          )
        );
        if (!foundItem) {
          this._trustStateInfo.uriTrustInfo.push({
            uri,
            trusted: true
          });
          changed = true;
        }
      } else {
        const previousLength = this._trustStateInfo.uriTrustInfo.length;
        this._trustStateInfo.uriTrustInfo = this._trustStateInfo.uriTrustInfo.filter(
          (trustInfo) => !this.uriIdentityService.extUri.isEqual(
            trustInfo.uri,
            uri
          )
        );
        if (previousLength !== this._trustStateInfo.uriTrustInfo.length) {
          changed = true;
        }
      }
    }
    if (changed) {
      await this.saveTrustInfo();
    }
  }
  isEmptyWorkspace() {
    if (this.workspaceService.getWorkbenchState() === WorkbenchState.EMPTY) {
      return true;
    }
    const workspace = this.workspaceService.getWorkspace();
    if (workspace) {
      return isTemporaryWorkspace(this.workspaceService.getWorkspace()) && workspace.folders.length === 0;
    }
    return false;
  }
  isTrustedVirtualResource(uri) {
    return isVirtualResource(uri) && uri.scheme !== "vscode-vfs";
  }
  isTrustedByRemote(uri) {
    if (!this.environmentService.remoteAuthority) {
      return false;
    }
    if (!this._remoteAuthority) {
      return false;
    }
    return isEqualAuthority(
      getRemoteAuthority(uri),
      this._remoteAuthority.authority.authority
    ) && !!this._remoteAuthority.options?.isTrusted;
  }
  set isTrusted(value) {
    this._isTrusted = value;
    if (!value) {
      this._storedTrustState.acceptsOutOfWorkspaceFiles = false;
    }
    if (this.isEmptyWorkspace()) {
      this._storedTrustState.isEmptyWorkspaceTrusted = value;
    }
  }
  //#endregion
  //#region public interface
  get workspaceResolved() {
    return this._workspaceResolvedPromise;
  }
  get workspaceTrustInitialized() {
    return this._workspaceTrustInitializedPromise;
  }
  get acceptsOutOfWorkspaceFiles() {
    return this._storedTrustState.acceptsOutOfWorkspaceFiles;
  }
  set acceptsOutOfWorkspaceFiles(value) {
    this._storedTrustState.acceptsOutOfWorkspaceFiles = value;
  }
  isWorkspaceTrusted() {
    return this._isTrusted;
  }
  isWorkspaceTrustForced() {
    if (this.environmentService.remoteAuthority && this._remoteAuthority && this._remoteAuthority.options?.isTrusted !== void 0) {
      return true;
    }
    const workspaceUris = this.getWorkspaceUris().filter(
      (uri) => !this.isTrustedVirtualResource(uri)
    );
    if (workspaceUris.length === 0) {
      return true;
    }
    return false;
  }
  canSetParentFolderTrust() {
    const workspaceIdentifier = toWorkspaceIdentifier(
      this._canonicalWorkspace
    );
    if (!isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return false;
    }
    if (workspaceIdentifier.uri.scheme !== Schemas.file && workspaceIdentifier.uri.scheme !== Schemas.vscodeRemote) {
      return false;
    }
    const parentFolder = this.uriIdentityService.extUri.dirname(
      workspaceIdentifier.uri
    );
    if (this.uriIdentityService.extUri.isEqual(
      workspaceIdentifier.uri,
      parentFolder
    )) {
      return false;
    }
    return true;
  }
  async setParentFolderTrust(trusted) {
    if (this.canSetParentFolderTrust()) {
      const workspaceUri = toWorkspaceIdentifier(
        this._canonicalWorkspace
      ).uri;
      const parentFolder = this.uriIdentityService.extUri.dirname(workspaceUri);
      await this.setUrisTrust([parentFolder], trusted);
    }
  }
  canSetWorkspaceTrust() {
    if (this.environmentService.remoteAuthority && (!this._remoteAuthority || this._remoteAuthority.options?.isTrusted !== void 0)) {
      return false;
    }
    if (this.isEmptyWorkspace()) {
      return true;
    }
    const workspaceUris = this.getWorkspaceUris().filter(
      (uri) => !this.isTrustedVirtualResource(uri)
    );
    if (workspaceUris.length === 0) {
      return false;
    }
    if (!this.isWorkspaceTrusted()) {
      return true;
    }
    const workspaceIdentifier = toWorkspaceIdentifier(
      this._canonicalWorkspace
    );
    if (!isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return false;
    }
    if (workspaceIdentifier.uri.scheme !== Schemas.file && workspaceIdentifier.uri.scheme !== "vscode-vfs") {
      return false;
    }
    const trustInfo = this.doGetUriTrustInfo(workspaceIdentifier.uri);
    if (!trustInfo.trusted || !this.uriIdentityService.extUri.isEqual(
      workspaceIdentifier.uri,
      trustInfo.uri
    )) {
      return false;
    }
    if (this.canSetParentFolderTrust()) {
      const parentFolder = this.uriIdentityService.extUri.dirname(
        workspaceIdentifier.uri
      );
      const parentPathTrustInfo = this.doGetUriTrustInfo(parentFolder);
      if (parentPathTrustInfo.trusted) {
        return false;
      }
    }
    return true;
  }
  async setWorkspaceTrust(trusted) {
    if (this.isEmptyWorkspace()) {
      await this.updateWorkspaceTrust(trusted);
      return;
    }
    const workspaceFolders = this.getWorkspaceUris();
    await this.setUrisTrust(workspaceFolders, trusted);
  }
  async getUriTrustInfo(uri) {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      return { trusted: true, uri };
    }
    if (this.isTrustedByRemote(uri)) {
      return { trusted: true, uri };
    }
    return this.doGetUriTrustInfo(await this.getCanonicalUri(uri));
  }
  async setUrisTrust(uris, trusted) {
    this.doSetUrisTrust(
      await Promise.all(uris.map((uri) => this.getCanonicalUri(uri))),
      trusted
    );
  }
  getTrustedUris() {
    return this._trustStateInfo.uriTrustInfo.map((info) => info.uri);
  }
  async setTrustedUris(uris) {
    this._trustStateInfo.uriTrustInfo = [];
    for (const uri of uris) {
      const canonicalUri = await this.getCanonicalUri(uri);
      const cleanUri = this.uriIdentityService.extUri.removeTrailingPathSeparator(
        canonicalUri
      );
      let added = false;
      for (const addedUri of this._trustStateInfo.uriTrustInfo) {
        if (this.uriIdentityService.extUri.isEqual(
          addedUri.uri,
          cleanUri
        )) {
          added = true;
          break;
        }
      }
      if (added) {
        continue;
      }
      this._trustStateInfo.uriTrustInfo.push({
        trusted: true,
        uri: cleanUri
      });
    }
    await this.saveTrustInfo();
  }
  addWorkspaceTrustTransitionParticipant(participant) {
    return this._trustTransitionManager.addWorkspaceTrustTransitionParticipant(
      participant
    );
  }
  //#endregion
};
WorkspaceTrustManagementService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IRemoteAuthorityResolverService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IWorkspaceTrustEnablementService),
  __decorateParam(7, IFileService)
], WorkspaceTrustManagementService);
let WorkspaceTrustRequestService = class extends Disposable {
  constructor(configurationService, workspaceTrustManagementService) {
    super();
    this.configurationService = configurationService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
  }
  static {
    __name(this, "WorkspaceTrustRequestService");
  }
  _serviceBrand;
  _openFilesTrustRequestPromise;
  _openFilesTrustRequestResolver;
  _workspaceTrustRequestPromise;
  _workspaceTrustRequestResolver;
  _onDidInitiateOpenFilesTrustRequest = this._register(
    new Emitter()
  );
  onDidInitiateOpenFilesTrustRequest = this._onDidInitiateOpenFilesTrustRequest.event;
  _onDidInitiateWorkspaceTrustRequest = this._register(
    new Emitter()
  );
  onDidInitiateWorkspaceTrustRequest = this._onDidInitiateWorkspaceTrustRequest.event;
  _onDidInitiateWorkspaceTrustRequestOnStartup = this._register(new Emitter());
  onDidInitiateWorkspaceTrustRequestOnStartup = this._onDidInitiateWorkspaceTrustRequestOnStartup.event;
  //#region Open file(s) trust request
  get untrustedFilesSetting() {
    return this.configurationService.getValue(
      WORKSPACE_TRUST_UNTRUSTED_FILES
    );
  }
  set untrustedFilesSetting(value) {
    this.configurationService.updateValue(
      WORKSPACE_TRUST_UNTRUSTED_FILES,
      value
    );
  }
  async completeOpenFilesTrustRequest(result, saveResponse) {
    if (!this._openFilesTrustRequestResolver) {
      return;
    }
    if (result === WorkspaceTrustUriResponse.Open) {
      this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles = true;
    }
    if (saveResponse) {
      if (result === WorkspaceTrustUriResponse.Open) {
        this.untrustedFilesSetting = "open";
      }
      if (result === WorkspaceTrustUriResponse.OpenInNewWindow) {
        this.untrustedFilesSetting = "newWindow";
      }
    }
    this._openFilesTrustRequestResolver(result);
    this._openFilesTrustRequestResolver = void 0;
    this._openFilesTrustRequestPromise = void 0;
  }
  async requestOpenFilesTrust(uris) {
    if (!this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      return WorkspaceTrustUriResponse.Open;
    }
    const openFilesTrustInfo = await Promise.all(
      uris.map(
        (uri) => this.workspaceTrustManagementService.getUriTrustInfo(uri)
      )
    );
    if (openFilesTrustInfo.map((info) => info.trusted).every((trusted) => trusted)) {
      return WorkspaceTrustUriResponse.Open;
    }
    if (this.untrustedFilesSetting !== "prompt") {
      if (this.untrustedFilesSetting === "newWindow") {
        return WorkspaceTrustUriResponse.OpenInNewWindow;
      }
      if (this.untrustedFilesSetting === "open") {
        return WorkspaceTrustUriResponse.Open;
      }
    }
    if (this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles) {
      return WorkspaceTrustUriResponse.Open;
    }
    if (this._openFilesTrustRequestPromise) {
      return this._openFilesTrustRequestPromise;
    } else {
      this._openFilesTrustRequestPromise = new Promise((resolve) => {
        this._openFilesTrustRequestResolver = resolve;
      });
    }
    this._onDidInitiateOpenFilesTrustRequest.fire();
    return this._openFilesTrustRequestPromise;
  }
  //#endregion
  //#region Workspace trust request
  resolveWorkspaceTrustRequest(trusted) {
    if (this._workspaceTrustRequestResolver) {
      this._workspaceTrustRequestResolver(
        trusted ?? this.workspaceTrustManagementService.isWorkspaceTrusted()
      );
      this._workspaceTrustRequestResolver = void 0;
      this._workspaceTrustRequestPromise = void 0;
    }
  }
  cancelWorkspaceTrustRequest() {
    if (this._workspaceTrustRequestResolver) {
      this._workspaceTrustRequestResolver(void 0);
      this._workspaceTrustRequestResolver = void 0;
      this._workspaceTrustRequestPromise = void 0;
    }
  }
  async completeWorkspaceTrustRequest(trusted) {
    if (trusted === void 0 || trusted === this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      this.resolveWorkspaceTrustRequest(trusted);
      return;
    }
    Event.once(this.workspaceTrustManagementService.onDidChangeTrust)(
      (trusted2) => this.resolveWorkspaceTrustRequest(trusted2)
    );
    await this.workspaceTrustManagementService.setWorkspaceTrust(trusted);
  }
  async requestWorkspaceTrust(options) {
    if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      return this.workspaceTrustManagementService.isWorkspaceTrusted();
    }
    if (this._workspaceTrustRequestPromise) {
      return this._workspaceTrustRequestPromise;
    } else {
      this._workspaceTrustRequestPromise = new Promise((resolve) => {
        this._workspaceTrustRequestResolver = resolve;
      });
    }
    this._onDidInitiateWorkspaceTrustRequest.fire(options);
    return this._workspaceTrustRequestPromise;
  }
  requestWorkspaceTrustOnStartup() {
    if (!this._workspaceTrustRequestPromise) {
      this._workspaceTrustRequestPromise = new Promise((resolve) => {
        this._workspaceTrustRequestResolver = resolve;
      });
    }
    this._onDidInitiateWorkspaceTrustRequestOnStartup.fire();
  }
  //#endregion
};
WorkspaceTrustRequestService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkspaceTrustManagementService)
], WorkspaceTrustRequestService);
class WorkspaceTrustTransitionManager extends Disposable {
  static {
    __name(this, "WorkspaceTrustTransitionManager");
  }
  participants = new LinkedList();
  addWorkspaceTrustTransitionParticipant(participant) {
    const remove = this.participants.push(participant);
    return toDisposable(() => remove());
  }
  async participate(trusted) {
    for (const participant of this.participants) {
      await participant.participate(trusted);
    }
  }
  dispose() {
    this.participants.clear();
    super.dispose();
  }
}
class WorkspaceTrustMemento {
  static {
    __name(this, "WorkspaceTrustMemento");
  }
  _memento;
  _mementoObject;
  _acceptsOutOfWorkspaceFilesKey = "acceptsOutOfWorkspaceFiles";
  _isEmptyWorkspaceTrustedKey = "isEmptyWorkspaceTrusted";
  constructor(storageService) {
    if (storageService) {
      this._memento = new Memento("workspaceTrust", storageService);
      this._mementoObject = this._memento.getMemento(
        StorageScope.WORKSPACE,
        StorageTarget.MACHINE
      );
    } else {
      this._mementoObject = {};
    }
  }
  get acceptsOutOfWorkspaceFiles() {
    return this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] ?? false;
  }
  set acceptsOutOfWorkspaceFiles(value) {
    this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] = value;
    this._memento?.saveMemento();
  }
  get isEmptyWorkspaceTrusted() {
    return this._mementoObject[this._isEmptyWorkspaceTrustedKey];
  }
  set isEmptyWorkspaceTrusted(value) {
    this._mementoObject[this._isEmptyWorkspaceTrustedKey] = value;
    this._memento?.saveMemento();
  }
}
registerSingleton(
  IWorkspaceTrustRequestService,
  WorkspaceTrustRequestService,
  InstantiationType.Delayed
);
export {
  CanonicalWorkspace,
  WORKSPACE_TRUST_BANNER,
  WORKSPACE_TRUST_EMPTY_WINDOW,
  WORKSPACE_TRUST_ENABLED,
  WORKSPACE_TRUST_EXTENSION_SUPPORT,
  WORKSPACE_TRUST_STARTUP_PROMPT,
  WORKSPACE_TRUST_STORAGE_KEY,
  WORKSPACE_TRUST_UNTRUSTED_FILES,
  WorkspaceTrustEnablementService,
  WorkspaceTrustManagementService,
  WorkspaceTrustRequestService
};
//# sourceMappingURL=workspaceTrust.js.map
