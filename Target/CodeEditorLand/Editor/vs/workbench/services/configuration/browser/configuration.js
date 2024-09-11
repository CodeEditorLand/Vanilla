var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import * as errors from "../../../../base/common/errors.js";
import { Disposable, IDisposable, dispose, toDisposable, MutableDisposable, combinedDisposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { FileChangeType, FileChangesEvent, IFileService, whenProviderRegistered, FileOperationError, FileOperationResult, FileOperation, FileOperationEvent } from "../../../../platform/files/common/files.js";
import { ConfigurationModel, ConfigurationModelParser, ConfigurationParseOptions, UserSettings } from "../../../../platform/configuration/common/configurationModels.js";
import { WorkspaceConfigurationModelParser, StandaloneConfigurationModelParser } from "../common/configurationModels.js";
import { TASKS_CONFIGURATION_KEY, FOLDER_SETTINGS_NAME, LAUNCH_CONFIGURATION_KEY, IConfigurationCache, ConfigurationKey, REMOTE_MACHINE_SCOPES, FOLDER_SCOPES, WORKSPACE_SCOPES, APPLY_ALL_PROFILES_SETTING } from "../common/configuration.js";
import { IStoredWorkspaceFolder } from "../../../../platform/workspaces/common/workspaces.js";
import { WorkbenchState, IWorkspaceFolder, IWorkspaceIdentifier } from "../../../../platform/workspace/common/workspace.js";
import { ConfigurationScope, Extensions, IConfigurationRegistry, OVERRIDE_PROPERTY_REGEX } from "../../../../platform/configuration/common/configurationRegistry.js";
import { equals } from "../../../../base/common/objects.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { hash } from "../../../../base/common/hash.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStringDictionary } from "../../../../base/common/collections.js";
import { joinPath } from "../../../../base/common/resources.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
import { isEmptyObject, isObject } from "../../../../base/common/types.js";
import { DefaultConfiguration as BaseDefaultConfiguration } from "../../../../platform/configuration/common/configurations.js";
import { IJSONEditingService } from "../common/jsonEditing.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
class DefaultConfiguration extends BaseDefaultConfiguration {
  constructor(configurationCache, environmentService, logService) {
    super(logService);
    this.configurationCache = configurationCache;
    if (environmentService.options?.configurationDefaults) {
      this.configurationRegistry.registerDefaultConfigurations([{ overrides: environmentService.options.configurationDefaults }]);
    }
  }
  static {
    __name(this, "DefaultConfiguration");
  }
  static DEFAULT_OVERRIDES_CACHE_EXISTS_KEY = "DefaultOverridesCacheExists";
  configurationRegistry = Registry.as(Extensions.Configuration);
  cachedConfigurationDefaultsOverrides = {};
  cacheKey = { type: "defaults", key: "configurationDefaultsOverrides" };
  updateCache = false;
  getConfigurationDefaultOverrides() {
    return this.cachedConfigurationDefaultsOverrides;
  }
  async initialize() {
    await this.initializeCachedConfigurationDefaultsOverrides();
    return super.initialize();
  }
  reload() {
    this.updateCache = true;
    this.cachedConfigurationDefaultsOverrides = {};
    this.updateCachedConfigurationDefaultsOverrides();
    return super.reload();
  }
  hasCachedConfigurationDefaultsOverrides() {
    return !isEmptyObject(this.cachedConfigurationDefaultsOverrides);
  }
  initiaizeCachedConfigurationDefaultsOverridesPromise;
  initializeCachedConfigurationDefaultsOverrides() {
    if (!this.initiaizeCachedConfigurationDefaultsOverridesPromise) {
      this.initiaizeCachedConfigurationDefaultsOverridesPromise = (async () => {
        try {
          if (localStorage.getItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY)) {
            const content = await this.configurationCache.read(this.cacheKey);
            if (content) {
              this.cachedConfigurationDefaultsOverrides = JSON.parse(content);
            }
          }
        } catch (error) {
        }
        this.cachedConfigurationDefaultsOverrides = isObject(this.cachedConfigurationDefaultsOverrides) ? this.cachedConfigurationDefaultsOverrides : {};
      })();
    }
    return this.initiaizeCachedConfigurationDefaultsOverridesPromise;
  }
  onDidUpdateConfiguration(properties, defaultsOverrides) {
    super.onDidUpdateConfiguration(properties, defaultsOverrides);
    if (defaultsOverrides) {
      this.updateCachedConfigurationDefaultsOverrides();
    }
  }
  async updateCachedConfigurationDefaultsOverrides() {
    if (!this.updateCache) {
      return;
    }
    const cachedConfigurationDefaultsOverrides = {};
    const configurationDefaultsOverrides = this.configurationRegistry.getConfigurationDefaultsOverrides();
    for (const [key, value] of configurationDefaultsOverrides) {
      if (!OVERRIDE_PROPERTY_REGEX.test(key) && value.value !== void 0) {
        cachedConfigurationDefaultsOverrides[key] = value.value;
      }
    }
    try {
      if (Object.keys(cachedConfigurationDefaultsOverrides).length) {
        localStorage.setItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, "yes");
        await this.configurationCache.write(this.cacheKey, JSON.stringify(cachedConfigurationDefaultsOverrides));
      } else {
        localStorage.removeItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY);
        await this.configurationCache.remove(this.cacheKey);
      }
    } catch (error) {
    }
  }
}
class ApplicationConfiguration extends UserSettings {
  static {
    __name(this, "ApplicationConfiguration");
  }
  _onDidChangeConfiguration = this._register(new Emitter());
  onDidChangeConfiguration = this._onDidChangeConfiguration.event;
  reloadConfigurationScheduler;
  constructor(userDataProfilesService, fileService, uriIdentityService, logService) {
    super(userDataProfilesService.defaultProfile.settingsResource, { scopes: [ConfigurationScope.APPLICATION] }, uriIdentityService.extUri, fileService, logService);
    this._register(this.onDidChange(() => this.reloadConfigurationScheduler.schedule()));
    this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.loadConfiguration().then((configurationModel) => this._onDidChangeConfiguration.fire(configurationModel)), 50));
  }
  async initialize() {
    return this.loadConfiguration();
  }
  async loadConfiguration() {
    const model = await super.loadConfiguration();
    const value = model.getValue(APPLY_ALL_PROFILES_SETTING);
    const allProfilesSettings = Array.isArray(value) ? value : [];
    return this.parseOptions.include || allProfilesSettings.length ? this.reparse({ ...this.parseOptions, include: allProfilesSettings }) : model;
  }
}
class UserConfiguration extends Disposable {
  constructor(settingsResource, tasksResource, configurationParseOptions, fileService, uriIdentityService, logService) {
    super();
    this.settingsResource = settingsResource;
    this.tasksResource = tasksResource;
    this.configurationParseOptions = configurationParseOptions;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.userConfiguration.value = new UserSettings(settingsResource, this.configurationParseOptions, uriIdentityService.extUri, this.fileService, logService);
    this.userConfigurationChangeDisposable.value = this.userConfiguration.value.onDidChange(() => this.reloadConfigurationScheduler.schedule());
    this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.userConfiguration.value.loadConfiguration().then((configurationModel) => this._onDidChangeConfiguration.fire(configurationModel)), 50));
  }
  static {
    __name(this, "UserConfiguration");
  }
  _onDidChangeConfiguration = this._register(new Emitter());
  onDidChangeConfiguration = this._onDidChangeConfiguration.event;
  userConfiguration = this._register(new MutableDisposable());
  userConfigurationChangeDisposable = this._register(new MutableDisposable());
  reloadConfigurationScheduler;
  get hasTasksLoaded() {
    return this.userConfiguration.value instanceof FileServiceBasedConfiguration;
  }
  async reset(settingsResource, tasksResource, configurationParseOptions) {
    this.settingsResource = settingsResource;
    this.tasksResource = tasksResource;
    this.configurationParseOptions = configurationParseOptions;
    return this.doReset();
  }
  async doReset(settingsConfiguration) {
    const folder = this.uriIdentityService.extUri.dirname(this.settingsResource);
    const standAloneConfigurationResources = this.tasksResource ? [[TASKS_CONFIGURATION_KEY, this.tasksResource]] : [];
    const fileServiceBasedConfiguration = new FileServiceBasedConfiguration(folder.toString(), this.settingsResource, standAloneConfigurationResources, this.configurationParseOptions, this.fileService, this.uriIdentityService, this.logService);
    const configurationModel = await fileServiceBasedConfiguration.loadConfiguration(settingsConfiguration);
    this.userConfiguration.value = fileServiceBasedConfiguration;
    if (this.userConfigurationChangeDisposable.value) {
      this.userConfigurationChangeDisposable.value = this.userConfiguration.value.onDidChange(() => this.reloadConfigurationScheduler.schedule());
    }
    return configurationModel;
  }
  async initialize() {
    return this.userConfiguration.value.loadConfiguration();
  }
  async reload(settingsConfiguration) {
    if (this.hasTasksLoaded) {
      return this.userConfiguration.value.loadConfiguration();
    }
    return this.doReset(settingsConfiguration);
  }
  reparse(parseOptions) {
    this.configurationParseOptions = { ...this.configurationParseOptions, ...parseOptions };
    return this.userConfiguration.value.reparse(this.configurationParseOptions);
  }
  getRestrictedSettings() {
    return this.userConfiguration.value.getRestrictedSettings();
  }
}
class FileServiceBasedConfiguration extends Disposable {
  constructor(name, settingsResource, standAloneConfigurationResources, configurationParseOptions, fileService, uriIdentityService, logService) {
    super();
    this.settingsResource = settingsResource;
    this.standAloneConfigurationResources = standAloneConfigurationResources;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.allResources = [this.settingsResource, ...this.standAloneConfigurationResources.map(([, resource]) => resource)];
    this._register(combinedDisposable(...this.allResources.map((resource) => combinedDisposable(
      this.fileService.watch(uriIdentityService.extUri.dirname(resource)),
      // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
      this.fileService.watch(resource)
    ))));
    this._folderSettingsModelParser = new ConfigurationModelParser(name, logService);
    this._folderSettingsParseOptions = configurationParseOptions;
    this._standAloneConfigurations = [];
    this._cache = ConfigurationModel.createEmptyModel(this.logService);
    this._register(Event.debounce(
      Event.any(
        Event.filter(this.fileService.onDidFilesChange, (e) => this.handleFileChangesEvent(e)),
        Event.filter(this.fileService.onDidRunOperation, (e) => this.handleFileOperationEvent(e))
      ),
      () => void 0,
      100
    )(() => this._onDidChange.fire()));
  }
  static {
    __name(this, "FileServiceBasedConfiguration");
  }
  allResources;
  _folderSettingsModelParser;
  _folderSettingsParseOptions;
  _standAloneConfigurations;
  _cache;
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  async resolveContents(donotResolveSettings) {
    const resolveContents = /* @__PURE__ */ __name(async (resources) => {
      return Promise.all(resources.map(async (resource) => {
        try {
          const content = await this.fileService.readFile(resource, { atomic: true });
          return content.value.toString();
        } catch (error) {
          this.logService.trace(`Error while resolving configuration file '${resource.toString()}': ${errors.getErrorMessage(error)}`);
          if (error.fileOperationResult !== FileOperationResult.FILE_NOT_FOUND && error.fileOperationResult !== FileOperationResult.FILE_NOT_DIRECTORY) {
            this.logService.error(error);
          }
        }
        return "{}";
      }));
    }, "resolveContents");
    const [[settingsContent], standAloneConfigurationContents] = await Promise.all([
      donotResolveSettings ? Promise.resolve([void 0]) : resolveContents([this.settingsResource]),
      resolveContents(this.standAloneConfigurationResources.map(([, resource]) => resource))
    ]);
    return [settingsContent, standAloneConfigurationContents.map((content, index) => [this.standAloneConfigurationResources[index][0], content])];
  }
  async loadConfiguration(settingsConfiguration) {
    const [settingsContent, standAloneConfigurationContents] = await this.resolveContents(!!settingsConfiguration);
    this._standAloneConfigurations = [];
    this._folderSettingsModelParser.parse("", this._folderSettingsParseOptions);
    if (settingsContent !== void 0) {
      this._folderSettingsModelParser.parse(settingsContent, this._folderSettingsParseOptions);
    }
    for (let index = 0; index < standAloneConfigurationContents.length; index++) {
      const contents = standAloneConfigurationContents[index][1];
      if (contents !== void 0) {
        const standAloneConfigurationModelParser = new StandaloneConfigurationModelParser(this.standAloneConfigurationResources[index][1].toString(), this.standAloneConfigurationResources[index][0], this.logService);
        standAloneConfigurationModelParser.parse(contents);
        this._standAloneConfigurations.push(standAloneConfigurationModelParser.configurationModel);
      }
    }
    this.consolidate(settingsConfiguration);
    return this._cache;
  }
  getRestrictedSettings() {
    return this._folderSettingsModelParser.restrictedConfigurations;
  }
  reparse(configurationParseOptions) {
    const oldContents = this._folderSettingsModelParser.configurationModel.contents;
    this._folderSettingsParseOptions = configurationParseOptions;
    this._folderSettingsModelParser.reparse(this._folderSettingsParseOptions);
    if (!equals(oldContents, this._folderSettingsModelParser.configurationModel.contents)) {
      this.consolidate();
    }
    return this._cache;
  }
  consolidate(settingsConfiguration) {
    this._cache = (settingsConfiguration ?? this._folderSettingsModelParser.configurationModel).merge(...this._standAloneConfigurations);
  }
  handleFileChangesEvent(event) {
    if (this.allResources.some((resource) => event.contains(resource))) {
      return true;
    }
    if (this.allResources.some((resource) => event.contains(this.uriIdentityService.extUri.dirname(resource), FileChangeType.DELETED))) {
      return true;
    }
    return false;
  }
  handleFileOperationEvent(event) {
    if ((event.isOperation(FileOperation.CREATE) || event.isOperation(FileOperation.COPY) || event.isOperation(FileOperation.DELETE) || event.isOperation(FileOperation.WRITE)) && this.allResources.some((resource) => this.uriIdentityService.extUri.isEqual(event.resource, resource))) {
      return true;
    }
    if (event.isOperation(FileOperation.DELETE) && this.allResources.some((resource) => this.uriIdentityService.extUri.isEqual(event.resource, this.uriIdentityService.extUri.dirname(resource)))) {
      return true;
    }
    return false;
  }
}
class RemoteUserConfiguration extends Disposable {
  static {
    __name(this, "RemoteUserConfiguration");
  }
  _cachedConfiguration;
  _fileService;
  _userConfiguration;
  _userConfigurationInitializationPromise = null;
  _onDidChangeConfiguration = this._register(new Emitter());
  onDidChangeConfiguration = this._onDidChangeConfiguration.event;
  _onDidInitialize = this._register(new Emitter());
  onDidInitialize = this._onDidInitialize.event;
  constructor(remoteAuthority, configurationCache, fileService, uriIdentityService, remoteAgentService, logService) {
    super();
    this._fileService = fileService;
    this._userConfiguration = this._cachedConfiguration = new CachedRemoteUserConfiguration(remoteAuthority, configurationCache, { scopes: REMOTE_MACHINE_SCOPES }, logService);
    remoteAgentService.getEnvironment().then(async (environment) => {
      if (environment) {
        const userConfiguration = this._register(new FileServiceBasedRemoteUserConfiguration(environment.settingsPath, { scopes: REMOTE_MACHINE_SCOPES }, this._fileService, uriIdentityService, logService));
        this._register(userConfiguration.onDidChangeConfiguration((configurationModel2) => this.onDidUserConfigurationChange(configurationModel2)));
        this._userConfigurationInitializationPromise = userConfiguration.initialize();
        const configurationModel = await this._userConfigurationInitializationPromise;
        this._userConfiguration.dispose();
        this._userConfiguration = userConfiguration;
        this.onDidUserConfigurationChange(configurationModel);
        this._onDidInitialize.fire(configurationModel);
      }
    });
  }
  async initialize() {
    if (this._userConfiguration instanceof FileServiceBasedRemoteUserConfiguration) {
      return this._userConfiguration.initialize();
    }
    let configurationModel = await this._userConfiguration.initialize();
    if (this._userConfigurationInitializationPromise) {
      configurationModel = await this._userConfigurationInitializationPromise;
      this._userConfigurationInitializationPromise = null;
    }
    return configurationModel;
  }
  reload() {
    return this._userConfiguration.reload();
  }
  reparse() {
    return this._userConfiguration.reparse({ scopes: REMOTE_MACHINE_SCOPES });
  }
  getRestrictedSettings() {
    return this._userConfiguration.getRestrictedSettings();
  }
  onDidUserConfigurationChange(configurationModel) {
    this.updateCache();
    this._onDidChangeConfiguration.fire(configurationModel);
  }
  async updateCache() {
    if (this._userConfiguration instanceof FileServiceBasedRemoteUserConfiguration) {
      let content;
      try {
        content = await this._userConfiguration.resolveContent();
      } catch (error) {
        if (error.fileOperationResult !== FileOperationResult.FILE_NOT_FOUND) {
          return;
        }
      }
      await this._cachedConfiguration.updateConfiguration(content);
    }
  }
}
class FileServiceBasedRemoteUserConfiguration extends Disposable {
  constructor(configurationResource, configurationParseOptions, fileService, uriIdentityService, logService) {
    super();
    this.configurationResource = configurationResource;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.parser = new ConfigurationModelParser(this.configurationResource.toString(), logService);
    this.parseOptions = configurationParseOptions;
    this._register(fileService.onDidFilesChange((e) => this.handleFileChangesEvent(e)));
    this._register(fileService.onDidRunOperation((e) => this.handleFileOperationEvent(e)));
    this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.reload().then((configurationModel) => this._onDidChangeConfiguration.fire(configurationModel)), 50));
    this._register(toDisposable(() => {
      this.stopWatchingResource();
      this.stopWatchingDirectory();
    }));
  }
  static {
    __name(this, "FileServiceBasedRemoteUserConfiguration");
  }
  parser;
  parseOptions;
  reloadConfigurationScheduler;
  _onDidChangeConfiguration = this._register(new Emitter());
  onDidChangeConfiguration = this._onDidChangeConfiguration.event;
  fileWatcherDisposable = this._register(new MutableDisposable());
  directoryWatcherDisposable = this._register(new MutableDisposable());
  watchResource() {
    this.fileWatcherDisposable.value = this.fileService.watch(this.configurationResource);
  }
  stopWatchingResource() {
    this.fileWatcherDisposable.value = void 0;
  }
  watchDirectory() {
    const directory = this.uriIdentityService.extUri.dirname(this.configurationResource);
    this.directoryWatcherDisposable.value = this.fileService.watch(directory);
  }
  stopWatchingDirectory() {
    this.directoryWatcherDisposable.value = void 0;
  }
  async initialize() {
    const exists = await this.fileService.exists(this.configurationResource);
    this.onResourceExists(exists);
    return this.reload();
  }
  async resolveContent() {
    const content = await this.fileService.readFile(this.configurationResource, { atomic: true });
    return content.value.toString();
  }
  async reload() {
    try {
      const content = await this.resolveContent();
      this.parser.parse(content, this.parseOptions);
      return this.parser.configurationModel;
    } catch (e) {
      return ConfigurationModel.createEmptyModel(this.logService);
    }
  }
  reparse(configurationParseOptions) {
    this.parseOptions = configurationParseOptions;
    this.parser.reparse(this.parseOptions);
    return this.parser.configurationModel;
  }
  getRestrictedSettings() {
    return this.parser.restrictedConfigurations;
  }
  handleFileChangesEvent(event) {
    let affectedByChanges = event.contains(this.configurationResource, FileChangeType.UPDATED);
    if (event.contains(this.configurationResource, FileChangeType.ADDED)) {
      affectedByChanges = true;
      this.onResourceExists(true);
    } else if (event.contains(this.configurationResource, FileChangeType.DELETED)) {
      affectedByChanges = true;
      this.onResourceExists(false);
    }
    if (affectedByChanges) {
      this.reloadConfigurationScheduler.schedule();
    }
  }
  handleFileOperationEvent(event) {
    if ((event.isOperation(FileOperation.CREATE) || event.isOperation(FileOperation.COPY) || event.isOperation(FileOperation.DELETE) || event.isOperation(FileOperation.WRITE)) && this.uriIdentityService.extUri.isEqual(event.resource, this.configurationResource)) {
      this.reloadConfigurationScheduler.schedule();
    }
  }
  onResourceExists(exists) {
    if (exists) {
      this.stopWatchingDirectory();
      this.watchResource();
    } else {
      this.stopWatchingResource();
      this.watchDirectory();
    }
  }
}
class CachedRemoteUserConfiguration extends Disposable {
  constructor(remoteAuthority, configurationCache, configurationParseOptions, logService) {
    super();
    this.configurationCache = configurationCache;
    this.key = { type: "user", key: remoteAuthority };
    this.parser = new ConfigurationModelParser("CachedRemoteUserConfiguration", logService);
    this.parseOptions = configurationParseOptions;
    this.configurationModel = ConfigurationModel.createEmptyModel(logService);
  }
  static {
    __name(this, "CachedRemoteUserConfiguration");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  key;
  parser;
  parseOptions;
  configurationModel;
  getConfigurationModel() {
    return this.configurationModel;
  }
  initialize() {
    return this.reload();
  }
  reparse(configurationParseOptions) {
    this.parseOptions = configurationParseOptions;
    this.parser.reparse(this.parseOptions);
    this.configurationModel = this.parser.configurationModel;
    return this.configurationModel;
  }
  getRestrictedSettings() {
    return this.parser.restrictedConfigurations;
  }
  async reload() {
    try {
      const content = await this.configurationCache.read(this.key);
      const parsed = JSON.parse(content);
      if (parsed.content) {
        this.parser.parse(parsed.content, this.parseOptions);
        this.configurationModel = this.parser.configurationModel;
      }
    } catch (e) {
    }
    return this.configurationModel;
  }
  async updateConfiguration(content) {
    if (content) {
      return this.configurationCache.write(this.key, JSON.stringify({ content }));
    } else {
      return this.configurationCache.remove(this.key);
    }
  }
}
class WorkspaceConfiguration extends Disposable {
  constructor(configurationCache, fileService, uriIdentityService, logService) {
    super();
    this.configurationCache = configurationCache;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.fileService = fileService;
    this._workspaceConfiguration = this._cachedConfiguration = new CachedWorkspaceConfiguration(configurationCache, logService);
  }
  static {
    __name(this, "WorkspaceConfiguration");
  }
  _cachedConfiguration;
  _workspaceConfiguration;
  _workspaceConfigurationDisposables = this._register(new DisposableStore());
  _workspaceIdentifier = null;
  _isWorkspaceTrusted = false;
  _onDidUpdateConfiguration = this._register(new Emitter());
  onDidUpdateConfiguration = this._onDidUpdateConfiguration.event;
  _initialized = false;
  get initialized() {
    return this._initialized;
  }
  async initialize(workspaceIdentifier, workspaceTrusted) {
    this._workspaceIdentifier = workspaceIdentifier;
    this._isWorkspaceTrusted = workspaceTrusted;
    if (!this._initialized) {
      if (this.configurationCache.needsCaching(this._workspaceIdentifier.configPath)) {
        this._workspaceConfiguration = this._cachedConfiguration;
        this.waitAndInitialize(this._workspaceIdentifier);
      } else {
        this.doInitialize(new FileServiceBasedWorkspaceConfiguration(this.fileService, this.uriIdentityService, this.logService));
      }
    }
    await this.reload();
  }
  async reload() {
    if (this._workspaceIdentifier) {
      await this._workspaceConfiguration.load(this._workspaceIdentifier, { scopes: WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
    }
  }
  getFolders() {
    return this._workspaceConfiguration.getFolders();
  }
  setFolders(folders, jsonEditingService) {
    if (this._workspaceIdentifier) {
      return jsonEditingService.write(this._workspaceIdentifier.configPath, [{ path: ["folders"], value: folders }], true).then(() => this.reload());
    }
    return Promise.resolve();
  }
  isTransient() {
    return this._workspaceConfiguration.isTransient();
  }
  getConfiguration() {
    return this._workspaceConfiguration.getWorkspaceSettings();
  }
  updateWorkspaceTrust(trusted) {
    this._isWorkspaceTrusted = trusted;
    return this.reparseWorkspaceSettings();
  }
  reparseWorkspaceSettings() {
    this._workspaceConfiguration.reparseWorkspaceSettings({ scopes: WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
    return this.getConfiguration();
  }
  getRestrictedSettings() {
    return this._workspaceConfiguration.getRestrictedSettings();
  }
  async waitAndInitialize(workspaceIdentifier) {
    await whenProviderRegistered(workspaceIdentifier.configPath, this.fileService);
    if (!(this._workspaceConfiguration instanceof FileServiceBasedWorkspaceConfiguration)) {
      const fileServiceBasedWorkspaceConfiguration = this._register(new FileServiceBasedWorkspaceConfiguration(this.fileService, this.uriIdentityService, this.logService));
      await fileServiceBasedWorkspaceConfiguration.load(workspaceIdentifier, { scopes: WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
      this.doInitialize(fileServiceBasedWorkspaceConfiguration);
      this.onDidWorkspaceConfigurationChange(false, true);
    }
  }
  doInitialize(fileServiceBasedWorkspaceConfiguration) {
    this._workspaceConfigurationDisposables.clear();
    this._workspaceConfiguration = this._workspaceConfigurationDisposables.add(fileServiceBasedWorkspaceConfiguration);
    this._workspaceConfigurationDisposables.add(this._workspaceConfiguration.onDidChange((e) => this.onDidWorkspaceConfigurationChange(true, false)));
    this._initialized = true;
  }
  isUntrusted() {
    return !this._isWorkspaceTrusted;
  }
  async onDidWorkspaceConfigurationChange(reload, fromCache) {
    if (reload) {
      await this.reload();
    }
    this.updateCache();
    this._onDidUpdateConfiguration.fire(fromCache);
  }
  async updateCache() {
    if (this._workspaceIdentifier && this.configurationCache.needsCaching(this._workspaceIdentifier.configPath) && this._workspaceConfiguration instanceof FileServiceBasedWorkspaceConfiguration) {
      const content = await this._workspaceConfiguration.resolveContent(this._workspaceIdentifier);
      await this._cachedConfiguration.updateWorkspace(this._workspaceIdentifier, content);
    }
  }
}
class FileServiceBasedWorkspaceConfiguration extends Disposable {
  constructor(fileService, uriIdentityService, logService) {
    super();
    this.fileService = fileService;
    this.logService = logService;
    this.workspaceConfigurationModelParser = new WorkspaceConfigurationModelParser("", logService);
    this.workspaceSettings = ConfigurationModel.createEmptyModel(logService);
    this._register(Event.any(
      Event.filter(this.fileService.onDidFilesChange, (e) => !!this._workspaceIdentifier && e.contains(this._workspaceIdentifier.configPath)),
      Event.filter(this.fileService.onDidRunOperation, (e) => !!this._workspaceIdentifier && (e.isOperation(FileOperation.CREATE) || e.isOperation(FileOperation.COPY) || e.isOperation(FileOperation.DELETE) || e.isOperation(FileOperation.WRITE)) && uriIdentityService.extUri.isEqual(e.resource, this._workspaceIdentifier.configPath))
    )(() => this.reloadConfigurationScheduler.schedule()));
    this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this._onDidChange.fire(), 50));
    this.workspaceConfigWatcher = this._register(this.watchWorkspaceConfigurationFile());
  }
  static {
    __name(this, "FileServiceBasedWorkspaceConfiguration");
  }
  workspaceConfigurationModelParser;
  workspaceSettings;
  _workspaceIdentifier = null;
  workspaceConfigWatcher;
  reloadConfigurationScheduler;
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  get workspaceIdentifier() {
    return this._workspaceIdentifier;
  }
  async resolveContent(workspaceIdentifier) {
    const content = await this.fileService.readFile(workspaceIdentifier.configPath, { atomic: true });
    return content.value.toString();
  }
  async load(workspaceIdentifier, configurationParseOptions) {
    if (!this._workspaceIdentifier || this._workspaceIdentifier.id !== workspaceIdentifier.id) {
      this._workspaceIdentifier = workspaceIdentifier;
      this.workspaceConfigurationModelParser = new WorkspaceConfigurationModelParser(this._workspaceIdentifier.id, this.logService);
      dispose(this.workspaceConfigWatcher);
      this.workspaceConfigWatcher = this._register(this.watchWorkspaceConfigurationFile());
    }
    let contents = "";
    try {
      contents = await this.resolveContent(this._workspaceIdentifier);
    } catch (error) {
      const exists = await this.fileService.exists(this._workspaceIdentifier.configPath);
      if (exists) {
        this.logService.error(error);
      }
    }
    this.workspaceConfigurationModelParser.parse(contents, configurationParseOptions);
    this.consolidate();
  }
  getConfigurationModel() {
    return this.workspaceConfigurationModelParser.configurationModel;
  }
  getFolders() {
    return this.workspaceConfigurationModelParser.folders;
  }
  isTransient() {
    return this.workspaceConfigurationModelParser.transient;
  }
  getWorkspaceSettings() {
    return this.workspaceSettings;
  }
  reparseWorkspaceSettings(configurationParseOptions) {
    this.workspaceConfigurationModelParser.reparseWorkspaceSettings(configurationParseOptions);
    this.consolidate();
    return this.getWorkspaceSettings();
  }
  getRestrictedSettings() {
    return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings();
  }
  consolidate() {
    this.workspaceSettings = this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel, this.workspaceConfigurationModelParser.tasksModel);
  }
  watchWorkspaceConfigurationFile() {
    return this._workspaceIdentifier ? this.fileService.watch(this._workspaceIdentifier.configPath) : Disposable.None;
  }
}
class CachedWorkspaceConfiguration {
  constructor(configurationCache, logService) {
    this.configurationCache = configurationCache;
    this.logService = logService;
    this.workspaceConfigurationModelParser = new WorkspaceConfigurationModelParser("", logService);
    this.workspaceSettings = ConfigurationModel.createEmptyModel(logService);
  }
  static {
    __name(this, "CachedWorkspaceConfiguration");
  }
  onDidChange = Event.None;
  workspaceConfigurationModelParser;
  workspaceSettings;
  async load(workspaceIdentifier, configurationParseOptions) {
    try {
      const key = this.getKey(workspaceIdentifier);
      const contents = await this.configurationCache.read(key);
      const parsed = JSON.parse(contents);
      if (parsed.content) {
        this.workspaceConfigurationModelParser = new WorkspaceConfigurationModelParser(key.key, this.logService);
        this.workspaceConfigurationModelParser.parse(parsed.content, configurationParseOptions);
        this.consolidate();
      }
    } catch (e) {
    }
  }
  get workspaceIdentifier() {
    return null;
  }
  getConfigurationModel() {
    return this.workspaceConfigurationModelParser.configurationModel;
  }
  getFolders() {
    return this.workspaceConfigurationModelParser.folders;
  }
  isTransient() {
    return this.workspaceConfigurationModelParser.transient;
  }
  getWorkspaceSettings() {
    return this.workspaceSettings;
  }
  reparseWorkspaceSettings(configurationParseOptions) {
    this.workspaceConfigurationModelParser.reparseWorkspaceSettings(configurationParseOptions);
    this.consolidate();
    return this.getWorkspaceSettings();
  }
  getRestrictedSettings() {
    return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings();
  }
  consolidate() {
    this.workspaceSettings = this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel, this.workspaceConfigurationModelParser.tasksModel);
  }
  async updateWorkspace(workspaceIdentifier, content) {
    try {
      const key = this.getKey(workspaceIdentifier);
      if (content) {
        await this.configurationCache.write(key, JSON.stringify({ content }));
      } else {
        await this.configurationCache.remove(key);
      }
    } catch (error) {
    }
  }
  getKey(workspaceIdentifier) {
    return {
      type: "workspaces",
      key: workspaceIdentifier.id
    };
  }
}
class CachedFolderConfiguration {
  constructor(folder, configFolderRelativePath, configurationParseOptions, configurationCache, logService) {
    this.configurationCache = configurationCache;
    this.logService = logService;
    this.key = { type: "folder", key: hash(joinPath(folder, configFolderRelativePath).toString()).toString(16) };
    this._folderSettingsModelParser = new ConfigurationModelParser("CachedFolderConfiguration", logService);
    this._folderSettingsParseOptions = configurationParseOptions;
    this._standAloneConfigurations = [];
    this.configurationModel = ConfigurationModel.createEmptyModel(logService);
  }
  static {
    __name(this, "CachedFolderConfiguration");
  }
  onDidChange = Event.None;
  _folderSettingsModelParser;
  _folderSettingsParseOptions;
  _standAloneConfigurations;
  configurationModel;
  key;
  async loadConfiguration() {
    try {
      const contents = await this.configurationCache.read(this.key);
      const { content: configurationContents } = JSON.parse(contents.toString());
      if (configurationContents) {
        for (const key of Object.keys(configurationContents)) {
          if (key === FOLDER_SETTINGS_NAME) {
            this._folderSettingsModelParser.parse(configurationContents[key], this._folderSettingsParseOptions);
          } else {
            const standAloneConfigurationModelParser = new StandaloneConfigurationModelParser(key, key, this.logService);
            standAloneConfigurationModelParser.parse(configurationContents[key]);
            this._standAloneConfigurations.push(standAloneConfigurationModelParser.configurationModel);
          }
        }
      }
      this.consolidate();
    } catch (e) {
    }
    return this.configurationModel;
  }
  async updateConfiguration(settingsContent, standAloneConfigurationContents) {
    const content = {};
    if (settingsContent) {
      content[FOLDER_SETTINGS_NAME] = settingsContent;
    }
    standAloneConfigurationContents.forEach(([key, contents]) => {
      if (contents) {
        content[key] = contents;
      }
    });
    if (Object.keys(content).length) {
      await this.configurationCache.write(this.key, JSON.stringify({ content }));
    } else {
      await this.configurationCache.remove(this.key);
    }
  }
  getRestrictedSettings() {
    return this._folderSettingsModelParser.restrictedConfigurations;
  }
  reparse(configurationParseOptions) {
    this._folderSettingsParseOptions = configurationParseOptions;
    this._folderSettingsModelParser.reparse(this._folderSettingsParseOptions);
    this.consolidate();
    return this.configurationModel;
  }
  consolidate() {
    this.configurationModel = this._folderSettingsModelParser.configurationModel.merge(...this._standAloneConfigurations);
  }
  getUnsupportedKeys() {
    return [];
  }
}
class FolderConfiguration extends Disposable {
  constructor(useCache, workspaceFolder, configFolderRelativePath, workbenchState, workspaceTrusted, fileService, uriIdentityService, logService, configurationCache) {
    super();
    this.workspaceFolder = workspaceFolder;
    this.workbenchState = workbenchState;
    this.workspaceTrusted = workspaceTrusted;
    this.configurationCache = configurationCache;
    this.scopes = WorkbenchState.WORKSPACE === this.workbenchState ? FOLDER_SCOPES : WORKSPACE_SCOPES;
    this.configurationFolder = uriIdentityService.extUri.joinPath(workspaceFolder.uri, configFolderRelativePath);
    this.cachedFolderConfiguration = new CachedFolderConfiguration(workspaceFolder.uri, configFolderRelativePath, { scopes: this.scopes, skipRestricted: this.isUntrusted() }, configurationCache, logService);
    if (useCache && this.configurationCache.needsCaching(workspaceFolder.uri)) {
      this.folderConfiguration = this.cachedFolderConfiguration;
      whenProviderRegistered(workspaceFolder.uri, fileService).then(() => {
        this.folderConfiguration = this._register(this.createFileServiceBasedConfiguration(fileService, uriIdentityService, logService));
        this._register(this.folderConfiguration.onDidChange((e) => this.onDidFolderConfigurationChange()));
        this.onDidFolderConfigurationChange();
      });
    } else {
      this.folderConfiguration = this._register(this.createFileServiceBasedConfiguration(fileService, uriIdentityService, logService));
      this._register(this.folderConfiguration.onDidChange((e) => this.onDidFolderConfigurationChange()));
    }
  }
  static {
    __name(this, "FolderConfiguration");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  folderConfiguration;
  scopes;
  configurationFolder;
  cachedFolderConfiguration;
  loadConfiguration() {
    return this.folderConfiguration.loadConfiguration();
  }
  updateWorkspaceTrust(trusted) {
    this.workspaceTrusted = trusted;
    return this.reparse();
  }
  reparse() {
    const configurationModel = this.folderConfiguration.reparse({ scopes: this.scopes, skipRestricted: this.isUntrusted() });
    this.updateCache();
    return configurationModel;
  }
  getRestrictedSettings() {
    return this.folderConfiguration.getRestrictedSettings();
  }
  isUntrusted() {
    return !this.workspaceTrusted;
  }
  onDidFolderConfigurationChange() {
    this.updateCache();
    this._onDidChange.fire();
  }
  createFileServiceBasedConfiguration(fileService, uriIdentityService, logService) {
    const settingsResource = uriIdentityService.extUri.joinPath(this.configurationFolder, `${FOLDER_SETTINGS_NAME}.json`);
    const standAloneConfigurationResources = [TASKS_CONFIGURATION_KEY, LAUNCH_CONFIGURATION_KEY].map((name) => [name, uriIdentityService.extUri.joinPath(this.configurationFolder, `${name}.json`)]);
    return new FileServiceBasedConfiguration(this.configurationFolder.toString(), settingsResource, standAloneConfigurationResources, { scopes: this.scopes, skipRestricted: this.isUntrusted() }, fileService, uriIdentityService, logService);
  }
  async updateCache() {
    if (this.configurationCache.needsCaching(this.configurationFolder) && this.folderConfiguration instanceof FileServiceBasedConfiguration) {
      const [settingsContent, standAloneConfigurationContents] = await this.folderConfiguration.resolveContents();
      this.cachedFolderConfiguration.updateConfiguration(settingsContent, standAloneConfigurationContents);
    }
  }
}
export {
  ApplicationConfiguration,
  DefaultConfiguration,
  FolderConfiguration,
  RemoteUserConfiguration,
  UserConfiguration,
  WorkspaceConfiguration
};
//# sourceMappingURL=configuration.js.map
