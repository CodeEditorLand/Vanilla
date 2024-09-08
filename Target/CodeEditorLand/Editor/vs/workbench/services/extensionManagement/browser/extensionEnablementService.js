var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { StorageManager } from "../../../../platform/extensionManagement/common/extensionEnablementService.js";
import {
  DISABLED_EXTENSIONS_STORAGE_PATH,
  ENABLED_EXTENSIONS_STORAGE_PATH,
  IExtensionManagementService,
  IGlobalExtensionEnablementService,
  InstallOperation
} from "../../../../platform/extensionManagement/common/extensionManagement.js";
import {
  areSameExtensions,
  BetterMergeId,
  getExtensionDependencies
} from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import {
  isAuthenticationProviderExtension,
  isLanguagePackExtension,
  isResolverExtension
} from "../../../../platform/extensions/common/extensions.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  INotificationService,
  NotificationPriority,
  Severity
} from "../../../../platform/notification/common/notification.js";
import {
  IStorageService,
  StorageScope
} from "../../../../platform/storage/common/storage.js";
import { IUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { IUserDataSyncAccountService } from "../../../../platform/userDataSync/common/userDataSyncAccount.js";
import { isVirtualWorkspace } from "../../../../platform/workspace/common/virtualWorkspace.js";
import {
  IWorkspaceContextService,
  WorkbenchState
} from "../../../../platform/workspace/common/workspace.js";
import {
  IWorkspaceTrustManagementService,
  IWorkspaceTrustRequestService
} from "../../../../platform/workspace/common/workspaceTrust.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IExtensionManifestPropertiesService } from "../../extensions/common/extensionManifestPropertiesService.js";
import {
  webWorkerExtHostConfig
} from "../../extensions/common/extensions.js";
import { IHostService } from "../../host/browser/host.js";
import {
  ILifecycleService,
  LifecyclePhase
} from "../../lifecycle/common/lifecycle.js";
import {
  EnablementState,
  ExtensionInstallLocation,
  IExtensionManagementServerService,
  IWorkbenchExtensionEnablementService,
  IWorkbenchExtensionManagementService
} from "../common/extensionManagement.js";
import { IExtensionBisectService } from "./extensionBisect.js";
const SOURCE = "IWorkbenchExtensionEnablementService";
let ExtensionEnablementService = class extends Disposable {
  constructor(storageService, globalExtensionEnablementService, contextService, environmentService, extensionManagementService, configurationService, extensionManagementServerService, userDataSyncEnablementService, userDataSyncAccountService, lifecycleService, notificationService, hostService, extensionBisectService, workspaceTrustManagementService, workspaceTrustRequestService, extensionManifestPropertiesService, instantiationService) {
    super();
    this.globalExtensionEnablementService = globalExtensionEnablementService;
    this.contextService = contextService;
    this.environmentService = environmentService;
    this.configurationService = configurationService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.userDataSyncAccountService = userDataSyncAccountService;
    this.lifecycleService = lifecycleService;
    this.notificationService = notificationService;
    this.extensionBisectService = extensionBisectService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    this.storageManager = this._register(
      new StorageManager(storageService)
    );
    const uninstallDisposable = this._register(
      Event.filter(
        extensionManagementService.onDidUninstallExtension,
        (e) => !e.error
      )(({ identifier }) => this._reset(identifier))
    );
    let isDisposed = false;
    this._register(toDisposable(() => isDisposed = true));
    this.extensionsManager = this._register(
      instantiationService.createInstance(ExtensionsManager)
    );
    this.extensionsManager.whenInitialized().then(() => {
      if (!isDisposed) {
        this._register(
          this.extensionsManager.onDidChangeExtensions(
            ({ added, removed, isProfileSwitch }) => this._onDidChangeExtensions(
              added,
              removed,
              isProfileSwitch
            )
          )
        );
        uninstallDisposable.dispose();
      }
    });
    this._register(
      this.globalExtensionEnablementService.onDidChangeEnablement(
        ({ extensions, source }) => this._onDidChangeGloballyDisabledExtensions(
          extensions,
          source
        )
      )
    );
    if (this.allUserExtensionsDisabled) {
      this.lifecycleService.when(LifecyclePhase.Eventually).then(() => {
        this.notificationService.prompt(
          Severity.Info,
          localize(
            "extensionsDisabled",
            "All installed extensions are temporarily disabled."
          ),
          [
            {
              label: localize(
                "Reload",
                "Reload and Enable Extensions"
              ),
              run: () => hostService.reload({
                disableExtensions: false
              })
            }
          ],
          {
            sticky: true,
            priority: NotificationPriority.URGENT
          }
        );
      });
    }
  }
  _onEnablementChanged = new Emitter();
  onEnablementChanged = this._onEnablementChanged.event;
  extensionsManager;
  storageManager;
  get hasWorkspace() {
    return this.contextService.getWorkbenchState() !== WorkbenchState.EMPTY;
  }
  get allUserExtensionsDisabled() {
    return this.environmentService.disableExtensions === true;
  }
  getEnablementState(extension) {
    return this._computeEnablementState(
      extension,
      this.extensionsManager.extensions,
      this.getWorkspaceType()
    );
  }
  getEnablementStates(extensions, workspaceTypeOverrides = {}) {
    const extensionsEnablements = /* @__PURE__ */ new Map();
    const workspaceType = {
      ...this.getWorkspaceType(),
      ...workspaceTypeOverrides
    };
    return extensions.map(
      (extension) => this._computeEnablementState(
        extension,
        extensions,
        workspaceType,
        extensionsEnablements
      )
    );
  }
  getDependenciesEnablementStates(extension) {
    return getExtensionDependencies(
      this.extensionsManager.extensions,
      extension
    ).map((e) => [e, this.getEnablementState(e)]);
  }
  canChangeEnablement(extension) {
    try {
      this.throwErrorIfCannotChangeEnablement(extension);
      return true;
    } catch (error) {
      return false;
    }
  }
  canChangeWorkspaceEnablement(extension) {
    if (!this.canChangeEnablement(extension)) {
      return false;
    }
    try {
      this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
      return true;
    } catch (error) {
      return false;
    }
  }
  throwErrorIfCannotChangeEnablement(extension, donotCheckDependencies) {
    if (isLanguagePackExtension(extension.manifest)) {
      throw new Error(
        localize(
          "cannot disable language pack extension",
          "Cannot change enablement of {0} extension because it contributes language packs.",
          extension.manifest.displayName || extension.identifier.id
        )
      );
    }
    if (this.userDataSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account && isAuthenticationProviderExtension(extension.manifest) && extension.manifest.contributes.authentication.some(
      (a) => a.id === this.userDataSyncAccountService.account.authenticationProviderId
    )) {
      throw new Error(
        localize(
          "cannot disable auth extension",
          "Cannot change enablement {0} extension because Settings Sync depends on it.",
          extension.manifest.displayName || extension.identifier.id
        )
      );
    }
    if (this._isEnabledInEnv(extension)) {
      throw new Error(
        localize(
          "cannot change enablement environment",
          "Cannot change enablement of {0} extension because it is enabled in environment",
          extension.manifest.displayName || extension.identifier.id
        )
      );
    }
    this.throwErrorIfEnablementStateCannotBeChanged(
      extension,
      this.getEnablementState(extension),
      donotCheckDependencies
    );
  }
  throwErrorIfEnablementStateCannotBeChanged(extension, enablementStateOfExtension, donotCheckDependencies) {
    switch (enablementStateOfExtension) {
      case EnablementState.DisabledByEnvironment:
        throw new Error(
          localize(
            "cannot change disablement environment",
            "Cannot change enablement of {0} extension because it is disabled in environment",
            extension.manifest.displayName || extension.identifier.id
          )
        );
      case EnablementState.DisabledByVirtualWorkspace:
        throw new Error(
          localize(
            "cannot change enablement virtual workspace",
            "Cannot change enablement of {0} extension because it does not support virtual workspaces",
            extension.manifest.displayName || extension.identifier.id
          )
        );
      case EnablementState.DisabledByExtensionKind:
        throw new Error(
          localize(
            "cannot change enablement extension kind",
            "Cannot change enablement of {0} extension because of its extension kind",
            extension.manifest.displayName || extension.identifier.id
          )
        );
      case EnablementState.DisabledByExtensionDependency:
        if (donotCheckDependencies) {
          break;
        }
        for (const dependency of getExtensionDependencies(
          this.extensionsManager.extensions,
          extension
        )) {
          if (this.isEnabled(dependency)) {
            continue;
          }
          try {
            this.throwErrorIfCannotChangeEnablement(
              dependency,
              true
            );
          } catch (error) {
            throw new Error(
              localize(
                "cannot change enablement dependency",
                "Cannot enable '{0}' extension because it depends on '{1}' extension that cannot be enabled",
                extension.manifest.displayName || extension.identifier.id,
                dependency.manifest.displayName || dependency.identifier.id
              )
            );
          }
        }
    }
  }
  throwErrorIfCannotChangeWorkspaceEnablement(extension) {
    if (!this.hasWorkspace) {
      throw new Error(localize("noWorkspace", "No workspace."));
    }
    if (isAuthenticationProviderExtension(extension.manifest)) {
      throw new Error(
        localize(
          "cannot disable auth extension in workspace",
          "Cannot change enablement of {0} extension in workspace because it contributes authentication providers",
          extension.manifest.displayName || extension.identifier.id
        )
      );
    }
  }
  async setEnablement(extensions, newState) {
    await this.extensionsManager.whenInitialized();
    if (newState === EnablementState.EnabledGlobally || newState === EnablementState.EnabledWorkspace) {
      extensions.push(
        ...this.getExtensionsToEnableRecursively(
          extensions,
          this.extensionsManager.extensions,
          newState,
          { dependencies: true, pack: true }
        )
      );
    }
    const workspace = newState === EnablementState.DisabledWorkspace || newState === EnablementState.EnabledWorkspace;
    for (const extension of extensions) {
      if (workspace) {
        this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
      } else {
        this.throwErrorIfCannotChangeEnablement(extension);
      }
    }
    const result = [];
    for (const extension of extensions) {
      const enablementState = this.getEnablementState(extension);
      if (enablementState === EnablementState.DisabledByTrustRequirement || /* All its disabled dependencies are disabled by Trust Requirement */
      enablementState === EnablementState.DisabledByExtensionDependency && this.getDependenciesEnablementStates(extension).every(
        ([, e]) => this.isEnabledEnablementState(e) || e === EnablementState.DisabledByTrustRequirement
      )) {
        const trustState = await this.workspaceTrustRequestService.requestWorkspaceTrust();
        result.push(trustState ?? false);
      } else {
        result.push(
          await this._setUserEnablementState(extension, newState)
        );
      }
    }
    const changedExtensions = extensions.filter(
      (e, index) => result[index]
    );
    if (changedExtensions.length) {
      this._onEnablementChanged.fire(changedExtensions);
    }
    return result;
  }
  getExtensionsToEnableRecursively(extensions, allExtensions, enablementState, options, checked = []) {
    if (!options.dependencies && !options.pack) {
      return [];
    }
    const toCheck = extensions.filter((e) => checked.indexOf(e) === -1);
    if (!toCheck.length) {
      return [];
    }
    for (const extension of toCheck) {
      checked.push(extension);
    }
    const extensionsToEnable = [];
    for (const extension of allExtensions) {
      if (checked.some(
        (e) => areSameExtensions(e.identifier, extension.identifier)
      )) {
        continue;
      }
      const enablementStateOfExtension = this.getEnablementState(extension);
      if (this.isEnabledEnablementState(enablementStateOfExtension)) {
        continue;
      }
      if (enablementStateOfExtension === EnablementState.DisabledByExtensionKind) {
        continue;
      }
      if (extensions.some(
        (e) => options.dependencies && e.manifest.extensionDependencies?.some(
          (id) => areSameExtensions({ id }, extension.identifier)
        ) || options.pack && e.manifest.extensionPack?.some(
          (id) => areSameExtensions({ id }, extension.identifier)
        )
      )) {
        const index = extensionsToEnable.findIndex(
          (e) => areSameExtensions(e.identifier, extension.identifier)
        );
        if (index === -1) {
          extensionsToEnable.push(extension);
        } else {
          try {
            this.throwErrorIfEnablementStateCannotBeChanged(
              extension,
              enablementStateOfExtension,
              true
            );
            extensionsToEnable.splice(index, 1, extension);
          } catch (error) {
          }
        }
      }
    }
    if (extensionsToEnable.length) {
      extensionsToEnable.push(
        ...this.getExtensionsToEnableRecursively(
          extensionsToEnable,
          allExtensions,
          enablementState,
          options,
          checked
        )
      );
    }
    return extensionsToEnable;
  }
  _setUserEnablementState(extension, newState) {
    const currentState = this._getUserEnablementState(extension.identifier);
    if (currentState === newState) {
      return Promise.resolve(false);
    }
    switch (newState) {
      case EnablementState.EnabledGlobally:
        this._enableExtension(extension.identifier);
        break;
      case EnablementState.DisabledGlobally:
        this._disableExtension(extension.identifier);
        break;
      case EnablementState.EnabledWorkspace:
        this._enableExtensionInWorkspace(extension.identifier);
        break;
      case EnablementState.DisabledWorkspace:
        this._disableExtensionInWorkspace(extension.identifier);
        break;
    }
    return Promise.resolve(true);
  }
  isEnabled(extension) {
    const enablementState = this.getEnablementState(extension);
    return this.isEnabledEnablementState(enablementState);
  }
  isEnabledEnablementState(enablementState) {
    return enablementState === EnablementState.EnabledByEnvironment || enablementState === EnablementState.EnabledWorkspace || enablementState === EnablementState.EnabledGlobally;
  }
  isDisabledGlobally(extension) {
    return this._isDisabledGlobally(extension.identifier);
  }
  _computeEnablementState(extension, extensions, workspaceType, computedEnablementStates) {
    computedEnablementStates = computedEnablementStates ?? /* @__PURE__ */ new Map();
    let enablementState = computedEnablementStates.get(extension);
    if (enablementState !== void 0) {
      return enablementState;
    }
    enablementState = this._getUserEnablementState(extension.identifier);
    if (this.extensionBisectService.isDisabledByBisect(extension)) {
      enablementState = EnablementState.DisabledByEnvironment;
    } else if (this._isDisabledInEnv(extension)) {
      enablementState = EnablementState.DisabledByEnvironment;
    } else if (this._isDisabledByVirtualWorkspace(extension, workspaceType)) {
      enablementState = EnablementState.DisabledByVirtualWorkspace;
    } else if (this.isEnabledEnablementState(enablementState) && this._isDisabledByWorkspaceTrust(extension, workspaceType)) {
      enablementState = EnablementState.DisabledByTrustRequirement;
    } else if (this._isDisabledByExtensionKind(extension)) {
      enablementState = EnablementState.DisabledByExtensionKind;
    } else if (this.isEnabledEnablementState(enablementState) && this._isDisabledByExtensionDependency(
      extension,
      extensions,
      workspaceType,
      computedEnablementStates
    )) {
      enablementState = EnablementState.DisabledByExtensionDependency;
    } else if (!this.isEnabledEnablementState(enablementState) && this._isEnabledInEnv(extension)) {
      enablementState = EnablementState.EnabledByEnvironment;
    }
    computedEnablementStates.set(extension, enablementState);
    return enablementState;
  }
  _isDisabledInEnv(extension) {
    if (this.allUserExtensionsDisabled) {
      return !extension.isBuiltin && !isResolverExtension(
        extension.manifest,
        this.environmentService.remoteAuthority
      );
    }
    const disabledExtensions = this.environmentService.disableExtensions;
    if (Array.isArray(disabledExtensions)) {
      return disabledExtensions.some(
        (id) => areSameExtensions({ id }, extension.identifier)
      );
    }
    if (areSameExtensions({ id: BetterMergeId.value }, extension.identifier)) {
      return true;
    }
    return false;
  }
  _isEnabledInEnv(extension) {
    const enabledExtensions = this.environmentService.enableExtensions;
    if (Array.isArray(enabledExtensions)) {
      return enabledExtensions.some(
        (id) => areSameExtensions({ id }, extension.identifier)
      );
    }
    return false;
  }
  _isDisabledByVirtualWorkspace(extension, workspaceType) {
    if (!workspaceType.virtual) {
      return false;
    }
    if (this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(
      extension.manifest
    ) !== false) {
      return false;
    }
    if (this.extensionManagementServerService.getExtensionManagementServer(
      extension
    ) === this.extensionManagementServerService.webExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnWeb(
      extension.manifest
    )) {
      return false;
    }
    return true;
  }
  _isDisabledByExtensionKind(extension) {
    if (this.extensionManagementServerService.remoteExtensionManagementServer || this.extensionManagementServerService.webExtensionManagementServer) {
      const installLocation = this.extensionManagementServerService.getExtensionInstallLocation(
        extension
      );
      for (const extensionKind of this.extensionManifestPropertiesService.getExtensionKind(
        extension.manifest
      )) {
        if (extensionKind === "ui") {
          if (installLocation === ExtensionInstallLocation.Local) {
            return false;
          }
        }
        if (extensionKind === "workspace") {
          if (installLocation === ExtensionInstallLocation.Remote) {
            return false;
          }
        }
        if (extensionKind === "web") {
          if (this.extensionManagementServerService.webExtensionManagementServer) {
            if (installLocation === ExtensionInstallLocation.Web || installLocation === ExtensionInstallLocation.Remote) {
              return false;
            }
          } else if (installLocation === ExtensionInstallLocation.Local) {
            const enableLocalWebWorker = this.configurationService.getValue(
              webWorkerExtHostConfig
            );
            if (enableLocalWebWorker === true || enableLocalWebWorker === "auto") {
              return false;
            }
          }
        }
      }
      return true;
    }
    return false;
  }
  _isDisabledByWorkspaceTrust(extension, workspaceType) {
    if (workspaceType.trusted) {
      return false;
    }
    if (this.contextService.isInsideWorkspace(extension.location)) {
      return true;
    }
    return this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(
      extension.manifest
    ) === false;
  }
  _isDisabledByExtensionDependency(extension, extensions, workspaceType, computedEnablementStates) {
    const dependencyExtensions = extension.manifest.extensionDependencies ? extensions.filter(
      (e) => extension.manifest.extensionDependencies.some(
        (id) => areSameExtensions(e.identifier, { id }) && this.extensionManagementServerService.getExtensionManagementServer(
          e
        ) === this.extensionManagementServerService.getExtensionManagementServer(
          extension
        )
      )
    ) : [];
    if (!dependencyExtensions.length) {
      return false;
    }
    const hasEnablementState = computedEnablementStates.has(extension);
    if (!hasEnablementState) {
      computedEnablementStates.set(
        extension,
        EnablementState.EnabledGlobally
      );
    }
    try {
      for (const dependencyExtension of dependencyExtensions) {
        const enablementState = this._computeEnablementState(
          dependencyExtension,
          extensions,
          workspaceType,
          computedEnablementStates
        );
        if (!this.isEnabledEnablementState(enablementState) && enablementState !== EnablementState.DisabledByExtensionKind) {
          return true;
        }
      }
    } finally {
      if (!hasEnablementState) {
        computedEnablementStates.delete(extension);
      }
    }
    return false;
  }
  _getUserEnablementState(identifier) {
    if (this.hasWorkspace) {
      if (this._getWorkspaceEnabledExtensions().filter(
        (e) => areSameExtensions(e, identifier)
      )[0]) {
        return EnablementState.EnabledWorkspace;
      }
      if (this._getWorkspaceDisabledExtensions().filter(
        (e) => areSameExtensions(e, identifier)
      )[0]) {
        return EnablementState.DisabledWorkspace;
      }
    }
    if (this._isDisabledGlobally(identifier)) {
      return EnablementState.DisabledGlobally;
    }
    return EnablementState.EnabledGlobally;
  }
  _isDisabledGlobally(identifier) {
    return this.globalExtensionEnablementService.getDisabledExtensions().some((e) => areSameExtensions(e, identifier));
  }
  _enableExtension(identifier) {
    this._removeFromWorkspaceDisabledExtensions(identifier);
    this._removeFromWorkspaceEnabledExtensions(identifier);
    return this.globalExtensionEnablementService.enableExtension(
      identifier,
      SOURCE
    );
  }
  _disableExtension(identifier) {
    this._removeFromWorkspaceDisabledExtensions(identifier);
    this._removeFromWorkspaceEnabledExtensions(identifier);
    return this.globalExtensionEnablementService.disableExtension(
      identifier,
      SOURCE
    );
  }
  _enableExtensionInWorkspace(identifier) {
    this._removeFromWorkspaceDisabledExtensions(identifier);
    this._addToWorkspaceEnabledExtensions(identifier);
  }
  _disableExtensionInWorkspace(identifier) {
    this._addToWorkspaceDisabledExtensions(identifier);
    this._removeFromWorkspaceEnabledExtensions(identifier);
  }
  _addToWorkspaceDisabledExtensions(identifier) {
    if (!this.hasWorkspace) {
      return Promise.resolve(false);
    }
    const disabledExtensions = this._getWorkspaceDisabledExtensions();
    if (disabledExtensions.every((e) => !areSameExtensions(e, identifier))) {
      disabledExtensions.push(identifier);
      this._setDisabledExtensions(disabledExtensions);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
  async _removeFromWorkspaceDisabledExtensions(identifier) {
    if (!this.hasWorkspace) {
      return false;
    }
    const disabledExtensions = this._getWorkspaceDisabledExtensions();
    for (let index = 0; index < disabledExtensions.length; index++) {
      const disabledExtension = disabledExtensions[index];
      if (areSameExtensions(disabledExtension, identifier)) {
        disabledExtensions.splice(index, 1);
        this._setDisabledExtensions(disabledExtensions);
        return true;
      }
    }
    return false;
  }
  _addToWorkspaceEnabledExtensions(identifier) {
    if (!this.hasWorkspace) {
      return false;
    }
    const enabledExtensions = this._getWorkspaceEnabledExtensions();
    if (enabledExtensions.every((e) => !areSameExtensions(e, identifier))) {
      enabledExtensions.push(identifier);
      this._setEnabledExtensions(enabledExtensions);
      return true;
    }
    return false;
  }
  _removeFromWorkspaceEnabledExtensions(identifier) {
    if (!this.hasWorkspace) {
      return false;
    }
    const enabledExtensions = this._getWorkspaceEnabledExtensions();
    for (let index = 0; index < enabledExtensions.length; index++) {
      const disabledExtension = enabledExtensions[index];
      if (areSameExtensions(disabledExtension, identifier)) {
        enabledExtensions.splice(index, 1);
        this._setEnabledExtensions(enabledExtensions);
        return true;
      }
    }
    return false;
  }
  _getWorkspaceEnabledExtensions() {
    return this._getExtensions(ENABLED_EXTENSIONS_STORAGE_PATH);
  }
  _setEnabledExtensions(enabledExtensions) {
    this._setExtensions(ENABLED_EXTENSIONS_STORAGE_PATH, enabledExtensions);
  }
  _getWorkspaceDisabledExtensions() {
    return this._getExtensions(DISABLED_EXTENSIONS_STORAGE_PATH);
  }
  _setDisabledExtensions(disabledExtensions) {
    this._setExtensions(
      DISABLED_EXTENSIONS_STORAGE_PATH,
      disabledExtensions
    );
  }
  _getExtensions(storageId) {
    if (!this.hasWorkspace) {
      return [];
    }
    return this.storageManager.get(storageId, StorageScope.WORKSPACE);
  }
  _setExtensions(storageId, extensions) {
    this.storageManager.set(storageId, extensions, StorageScope.WORKSPACE);
  }
  async _onDidChangeGloballyDisabledExtensions(extensionIdentifiers, source) {
    if (source !== SOURCE) {
      await this.extensionsManager.whenInitialized();
      const extensions = this.extensionsManager.extensions.filter(
        (installedExtension) => extensionIdentifiers.some(
          (identifier) => areSameExtensions(
            identifier,
            installedExtension.identifier
          )
        )
      );
      this._onEnablementChanged.fire(extensions);
    }
  }
  _onDidChangeExtensions(added, removed, isProfileSwitch) {
    const disabledExtensions = added.filter(
      (e) => !this.isEnabledEnablementState(this.getEnablementState(e))
    );
    if (disabledExtensions.length) {
      this._onEnablementChanged.fire(disabledExtensions);
    }
    if (!isProfileSwitch) {
      removed.forEach(({ identifier }) => this._reset(identifier));
    }
  }
  async updateExtensionsEnablementsWhenWorkspaceTrustChanges() {
    await this.extensionsManager.whenInitialized();
    const computeEnablementStates = (workspaceType2) => {
      const extensionsEnablements = /* @__PURE__ */ new Map();
      return this.extensionsManager.extensions.map((extension) => [
        extension,
        this._computeEnablementState(
          extension,
          this.extensionsManager.extensions,
          workspaceType2,
          extensionsEnablements
        )
      ]);
    };
    const workspaceType = this.getWorkspaceType();
    const enablementStatesWithTrustedWorkspace = computeEnablementStates({
      ...workspaceType,
      trusted: true
    });
    const enablementStatesWithUntrustedWorkspace = computeEnablementStates({
      ...workspaceType,
      trusted: false
    });
    const enablementChangedExtensionsBecauseOfTrust = enablementStatesWithTrustedWorkspace.filter(
      ([, enablementState], index) => enablementState !== enablementStatesWithUntrustedWorkspace[index][1]
    ).map(([extension]) => extension);
    if (enablementChangedExtensionsBecauseOfTrust.length) {
      this._onEnablementChanged.fire(
        enablementChangedExtensionsBecauseOfTrust
      );
    }
  }
  getWorkspaceType() {
    return {
      trusted: this.workspaceTrustManagementService.isWorkspaceTrusted(),
      virtual: isVirtualWorkspace(this.contextService.getWorkspace())
    };
  }
  _reset(extension) {
    this._removeFromWorkspaceDisabledExtensions(extension);
    this._removeFromWorkspaceEnabledExtensions(extension);
    this.globalExtensionEnablementService.enableExtension(extension);
  }
};
ExtensionEnablementService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IGlobalExtensionEnablementService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IExtensionManagementService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IExtensionManagementServerService),
  __decorateParam(7, IUserDataSyncEnablementService),
  __decorateParam(8, IUserDataSyncAccountService),
  __decorateParam(9, ILifecycleService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IHostService),
  __decorateParam(12, IExtensionBisectService),
  __decorateParam(13, IWorkspaceTrustManagementService),
  __decorateParam(14, IWorkspaceTrustRequestService),
  __decorateParam(15, IExtensionManifestPropertiesService),
  __decorateParam(16, IInstantiationService)
], ExtensionEnablementService);
let ExtensionsManager = class extends Disposable {
  constructor(extensionManagementService, extensionManagementServerService, logService) {
    super();
    this.extensionManagementService = extensionManagementService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.logService = logService;
    this._register(toDisposable(() => this.disposed = true));
    this.initializePromise = this.initialize();
  }
  _extensions = [];
  get extensions() {
    return this._extensions;
  }
  _onDidChangeExtensions = this._register(
    new Emitter()
  );
  onDidChangeExtensions = this._onDidChangeExtensions.event;
  initializePromise;
  disposed = false;
  whenInitialized() {
    return this.initializePromise;
  }
  async initialize() {
    try {
      this._extensions = [
        ...await this.extensionManagementService.getInstalled(),
        ...await this.extensionManagementService.getInstalledWorkspaceExtensions(
          true
        )
      ];
      if (this.disposed) {
        return;
      }
      this._onDidChangeExtensions.fire({
        added: this.extensions,
        removed: [],
        isProfileSwitch: false
      });
    } catch (error) {
      this.logService.error(error);
    }
    this._register(
      this.extensionManagementService.onDidInstallExtensions(
        (e) => this.updateExtensions(
          e.reduce((result, { local, operation }) => {
            if (local && operation !== InstallOperation.Migrate) {
              result.push(local);
            }
            return result;
          }, []),
          [],
          void 0,
          false
        )
      )
    );
    this._register(
      Event.filter(
        this.extensionManagementService.onDidUninstallExtension,
        (e) => !e.error
      )(
        (e) => this.updateExtensions([], [e.identifier], e.server, false)
      )
    );
    this._register(
      this.extensionManagementService.onDidChangeProfile(
        ({ added, removed, server }) => {
          this.updateExtensions(
            added,
            removed.map(({ identifier }) => identifier),
            server,
            true
          );
        }
      )
    );
  }
  updateExtensions(added, identifiers, server, isProfileSwitch) {
    if (added.length) {
      this._extensions.push(...added);
    }
    const removed = [];
    for (const identifier of identifiers) {
      const index = this._extensions.findIndex(
        (e) => areSameExtensions(e.identifier, identifier) && this.extensionManagementServerService.getExtensionManagementServer(
          e
        ) === server
      );
      if (index !== -1) {
        removed.push(...this._extensions.splice(index, 1));
      }
    }
    if (added.length || removed.length) {
      this._onDidChangeExtensions.fire({
        added,
        removed,
        isProfileSwitch
      });
    }
  }
};
ExtensionsManager = __decorateClass([
  __decorateParam(0, IWorkbenchExtensionManagementService),
  __decorateParam(1, IExtensionManagementServerService),
  __decorateParam(2, ILogService)
], ExtensionsManager);
registerSingleton(
  IWorkbenchExtensionEnablementService,
  ExtensionEnablementService,
  InstantiationType.Delayed
);
export {
  ExtensionEnablementService
};
