import * as arrays from "../../../base/common/arrays.js";
import { Emitter, Event } from "../../../base/common/event.js";
import * as json from "../../../base/common/json.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ResourceMap, getOrSet } from "../../../base/common/map.js";
import * as objects from "../../../base/common/objects.js";
import * as types from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { FileOperation } from "../../files/common/files.js";
import { Registry } from "../../registry/common/platform.js";
import {
  addToValueTree,
  getConfigurationValue,
  removeFromValueTree,
  toValuesTree
} from "./configuration.js";
import {
  ConfigurationScope,
  Extensions,
  OVERRIDE_PROPERTY_REGEX,
  overrideIdentifiersFromKey
} from "./configurationRegistry.js";
function freeze(data) {
  return Object.isFrozen(data) ? data : objects.deepFreeze(data);
}
class ConfigurationModel {
  constructor(_contents, _keys, _overrides, raw, logService) {
    this._contents = _contents;
    this._keys = _keys;
    this._overrides = _overrides;
    this.raw = raw;
    this.logService = logService;
  }
  static createEmptyModel(logService) {
    return new ConfigurationModel({}, [], [], void 0, logService);
  }
  overrideConfigurations = /* @__PURE__ */ new Map();
  _rawConfiguration;
  get rawConfiguration() {
    if (!this._rawConfiguration) {
      if (this.raw?.length) {
        const rawConfigurationModels = this.raw.map((raw) => {
          if (raw instanceof ConfigurationModel) {
            return raw;
          }
          const parser = new ConfigurationModelParser(
            "",
            this.logService
          );
          parser.parseRaw(raw);
          return parser.configurationModel;
        });
        this._rawConfiguration = rawConfigurationModels.reduce(
          (previous, current) => current === previous ? current : previous.merge(current),
          rawConfigurationModels[0]
        );
      } else {
        this._rawConfiguration = this;
      }
    }
    return this._rawConfiguration;
  }
  get contents() {
    return this._contents;
  }
  get overrides() {
    return this._overrides;
  }
  get keys() {
    return this._keys;
  }
  isEmpty() {
    return this._keys.length === 0 && Object.keys(this._contents).length === 0 && this._overrides.length === 0;
  }
  getValue(section) {
    return section ? getConfigurationValue(this.contents, section) : this.contents;
  }
  inspect(section, overrideIdentifier) {
    const that = this;
    return {
      get value() {
        return freeze(that.rawConfiguration.getValue(section));
      },
      get override() {
        return overrideIdentifier ? freeze(
          that.rawConfiguration.getOverrideValue(
            section,
            overrideIdentifier
          )
        ) : void 0;
      },
      get merged() {
        return freeze(
          overrideIdentifier ? that.rawConfiguration.override(overrideIdentifier).getValue(section) : that.rawConfiguration.getValue(section)
        );
      },
      get overrides() {
        const overrides = [];
        for (const { contents, identifiers, keys } of that.rawConfiguration.overrides) {
          const value = new ConfigurationModel(
            contents,
            keys,
            [],
            void 0,
            that.logService
          ).getValue(section);
          if (value !== void 0) {
            overrides.push({ identifiers, value });
          }
        }
        return overrides.length ? freeze(overrides) : void 0;
      }
    };
  }
  getOverrideValue(section, overrideIdentifier) {
    const overrideContents = this.getContentsForOverrideIdentifer(overrideIdentifier);
    return overrideContents ? section ? getConfigurationValue(overrideContents, section) : overrideContents : void 0;
  }
  getKeysForOverrideIdentifier(identifier) {
    const keys = [];
    for (const override of this.overrides) {
      if (override.identifiers.includes(identifier)) {
        keys.push(...override.keys);
      }
    }
    return arrays.distinct(keys);
  }
  getAllOverrideIdentifiers() {
    const result = [];
    for (const override of this.overrides) {
      result.push(...override.identifiers);
    }
    return arrays.distinct(result);
  }
  override(identifier) {
    let overrideConfigurationModel = this.overrideConfigurations.get(identifier);
    if (!overrideConfigurationModel) {
      overrideConfigurationModel = this.createOverrideConfigurationModel(identifier);
      this.overrideConfigurations.set(
        identifier,
        overrideConfigurationModel
      );
    }
    return overrideConfigurationModel;
  }
  merge(...others) {
    const contents = objects.deepClone(this.contents);
    const overrides = objects.deepClone(this.overrides);
    const keys = [...this.keys];
    const raws = this.raw?.length ? [...this.raw] : [this];
    for (const other of others) {
      raws.push(...other.raw?.length ? other.raw : [other]);
      if (other.isEmpty()) {
        continue;
      }
      this.mergeContents(contents, other.contents);
      for (const otherOverride of other.overrides) {
        const [override] = overrides.filter(
          (o) => arrays.equals(o.identifiers, otherOverride.identifiers)
        );
        if (override) {
          this.mergeContents(
            override.contents,
            otherOverride.contents
          );
          override.keys.push(...otherOverride.keys);
          override.keys = arrays.distinct(override.keys);
        } else {
          overrides.push(objects.deepClone(otherOverride));
        }
      }
      for (const key of other.keys) {
        if (keys.indexOf(key) === -1) {
          keys.push(key);
        }
      }
    }
    return new ConfigurationModel(
      contents,
      keys,
      overrides,
      raws.every((raw) => raw instanceof ConfigurationModel) ? void 0 : raws,
      this.logService
    );
  }
  createOverrideConfigurationModel(identifier) {
    const overrideContents = this.getContentsForOverrideIdentifer(identifier);
    if (!overrideContents || typeof overrideContents !== "object" || !Object.keys(overrideContents).length) {
      return this;
    }
    const contents = {};
    for (const key of arrays.distinct([
      ...Object.keys(this.contents),
      ...Object.keys(overrideContents)
    ])) {
      let contentsForKey = this.contents[key];
      const overrideContentsForKey = overrideContents[key];
      if (overrideContentsForKey) {
        if (typeof contentsForKey === "object" && typeof overrideContentsForKey === "object") {
          contentsForKey = objects.deepClone(contentsForKey);
          this.mergeContents(contentsForKey, overrideContentsForKey);
        } else {
          contentsForKey = overrideContentsForKey;
        }
      }
      contents[key] = contentsForKey;
    }
    return new ConfigurationModel(
      contents,
      this.keys,
      this.overrides,
      void 0,
      this.logService
    );
  }
  mergeContents(source, target) {
    for (const key of Object.keys(target)) {
      if (key in source) {
        if (types.isObject(source[key]) && types.isObject(target[key])) {
          this.mergeContents(source[key], target[key]);
          continue;
        }
      }
      source[key] = objects.deepClone(target[key]);
    }
  }
  getContentsForOverrideIdentifer(identifier) {
    let contentsForIdentifierOnly = null;
    let contents = null;
    const mergeContents = (contentsToMerge) => {
      if (contentsToMerge) {
        if (contents) {
          this.mergeContents(contents, contentsToMerge);
        } else {
          contents = objects.deepClone(contentsToMerge);
        }
      }
    };
    for (const override of this.overrides) {
      if (override.identifiers.length === 1 && override.identifiers[0] === identifier) {
        contentsForIdentifierOnly = override.contents;
      } else if (override.identifiers.includes(identifier)) {
        mergeContents(override.contents);
      }
    }
    mergeContents(contentsForIdentifierOnly);
    return contents;
  }
  toJSON() {
    return {
      contents: this.contents,
      overrides: this.overrides,
      keys: this.keys
    };
  }
  // Update methods
  addValue(key, value) {
    this.updateValue(key, value, true);
  }
  setValue(key, value) {
    this.updateValue(key, value, false);
  }
  removeValue(key) {
    const index = this.keys.indexOf(key);
    if (index === -1) {
      return;
    }
    this.keys.splice(index, 1);
    removeFromValueTree(this.contents, key);
    if (OVERRIDE_PROPERTY_REGEX.test(key)) {
      this.overrides.splice(
        this.overrides.findIndex(
          (o) => arrays.equals(
            o.identifiers,
            overrideIdentifiersFromKey(key)
          )
        ),
        1
      );
    }
  }
  updateValue(key, value, add) {
    addToValueTree(
      this.contents,
      key,
      value,
      (e) => this.logService.error(e)
    );
    add = add || this.keys.indexOf(key) === -1;
    if (add) {
      this.keys.push(key);
    }
    if (OVERRIDE_PROPERTY_REGEX.test(key)) {
      const identifiers = overrideIdentifiersFromKey(key);
      const override = {
        identifiers,
        keys: Object.keys(this.contents[key]),
        contents: toValuesTree(
          this.contents[key],
          (message) => this.logService.error(message)
        )
      };
      const index = this.overrides.findIndex(
        (o) => arrays.equals(o.identifiers, identifiers)
      );
      if (index !== -1) {
        this.overrides[index] = override;
      } else {
        this.overrides.push(override);
      }
    }
  }
}
class ConfigurationModelParser {
  constructor(_name, logService) {
    this._name = _name;
    this.logService = logService;
  }
  _raw = null;
  _configurationModel = null;
  _restrictedConfigurations = [];
  _parseErrors = [];
  get configurationModel() {
    return this._configurationModel || ConfigurationModel.createEmptyModel(this.logService);
  }
  get restrictedConfigurations() {
    return this._restrictedConfigurations;
  }
  get errors() {
    return this._parseErrors;
  }
  parse(content, options) {
    if (!types.isUndefinedOrNull(content)) {
      const raw = this.doParseContent(content);
      this.parseRaw(raw, options);
    }
  }
  reparse(options) {
    if (this._raw) {
      this.parseRaw(this._raw, options);
    }
  }
  parseRaw(raw, options) {
    this._raw = raw;
    const { contents, keys, overrides, restricted, hasExcludedProperties } = this.doParseRaw(raw, options);
    this._configurationModel = new ConfigurationModel(
      contents,
      keys,
      overrides,
      hasExcludedProperties ? [raw] : void 0,
      this.logService
    );
    this._restrictedConfigurations = restricted || [];
  }
  doParseContent(content) {
    let raw = {};
    let currentProperty = null;
    let currentParent = [];
    const previousParents = [];
    const parseErrors = [];
    function onValue(value) {
      if (Array.isArray(currentParent)) {
        currentParent.push(value);
      } else if (currentProperty !== null) {
        currentParent[currentProperty] = value;
      }
    }
    const visitor = {
      onObjectBegin: () => {
        const object = {};
        onValue(object);
        previousParents.push(currentParent);
        currentParent = object;
        currentProperty = null;
      },
      onObjectProperty: (name) => {
        currentProperty = name;
      },
      onObjectEnd: () => {
        currentParent = previousParents.pop();
      },
      onArrayBegin: () => {
        const array = [];
        onValue(array);
        previousParents.push(currentParent);
        currentParent = array;
        currentProperty = null;
      },
      onArrayEnd: () => {
        currentParent = previousParents.pop();
      },
      onLiteralValue: onValue,
      onError: (error, offset, length) => {
        parseErrors.push({ error, offset, length });
      }
    };
    if (content) {
      try {
        json.visit(content, visitor);
        raw = currentParent[0] || {};
      } catch (e) {
        this.logService.error(
          `Error while parsing settings file ${this._name}: ${e}`
        );
        this._parseErrors = [e];
      }
    }
    return raw;
  }
  doParseRaw(raw, options) {
    const configurationProperties = Registry.as(
      Extensions.Configuration
    ).getConfigurationProperties();
    const filtered = this.filter(
      raw,
      configurationProperties,
      true,
      options
    );
    raw = filtered.raw;
    const contents = toValuesTree(
      raw,
      (message) => this.logService.error(
        `Conflict in settings file ${this._name}: ${message}`
      )
    );
    const keys = Object.keys(raw);
    const overrides = this.toOverrides(
      raw,
      (message) => this.logService.error(
        `Conflict in settings file ${this._name}: ${message}`
      )
    );
    return {
      contents,
      keys,
      overrides,
      restricted: filtered.restricted,
      hasExcludedProperties: filtered.hasExcludedProperties
    };
  }
  filter(properties, configurationProperties, filterOverriddenProperties, options) {
    let hasExcludedProperties = false;
    if (!options?.scopes && !options?.skipRestricted && !options?.exclude?.length) {
      return { raw: properties, restricted: [], hasExcludedProperties };
    }
    const raw = {};
    const restricted = [];
    for (const key in properties) {
      if (OVERRIDE_PROPERTY_REGEX.test(key) && filterOverriddenProperties) {
        const result = this.filter(
          properties[key],
          configurationProperties,
          false,
          options
        );
        raw[key] = result.raw;
        hasExcludedProperties = hasExcludedProperties || result.hasExcludedProperties;
        restricted.push(...result.restricted);
      } else {
        const propertySchema = configurationProperties[key];
        const scope = propertySchema ? typeof propertySchema.scope !== "undefined" ? propertySchema.scope : ConfigurationScope.WINDOW : void 0;
        if (propertySchema?.restricted) {
          restricted.push(key);
        }
        if (!options.exclude?.includes(key) && (options.include?.includes(key) || (scope === void 0 || options.scopes === void 0 || options.scopes.includes(
          scope
        )) && !(options.skipRestricted && propertySchema?.restricted))) {
          raw[key] = properties[key];
        } else {
          hasExcludedProperties = true;
        }
      }
    }
    return { raw, restricted, hasExcludedProperties };
  }
  toOverrides(raw, conflictReporter) {
    const overrides = [];
    for (const key of Object.keys(raw)) {
      if (OVERRIDE_PROPERTY_REGEX.test(key)) {
        const overrideRaw = {};
        for (const keyInOverrideRaw in raw[key]) {
          overrideRaw[keyInOverrideRaw] = raw[key][keyInOverrideRaw];
        }
        overrides.push({
          identifiers: overrideIdentifiersFromKey(key),
          keys: Object.keys(overrideRaw),
          contents: toValuesTree(overrideRaw, conflictReporter)
        });
      }
    }
    return overrides;
  }
}
class UserSettings extends Disposable {
  constructor(userSettingsResource, parseOptions, extUri, fileService, logService) {
    super();
    this.userSettingsResource = userSettingsResource;
    this.parseOptions = parseOptions;
    this.fileService = fileService;
    this.logService = logService;
    this.parser = new ConfigurationModelParser(
      this.userSettingsResource.toString(),
      logService
    );
    this._register(
      this.fileService.watch(extUri.dirname(this.userSettingsResource))
    );
    this._register(this.fileService.watch(this.userSettingsResource));
    this._register(
      Event.any(
        Event.filter(
          this.fileService.onDidFilesChange,
          (e) => e.contains(this.userSettingsResource)
        ),
        Event.filter(
          this.fileService.onDidRunOperation,
          (e) => (e.isOperation(FileOperation.CREATE) || e.isOperation(FileOperation.COPY) || e.isOperation(FileOperation.DELETE) || e.isOperation(FileOperation.WRITE)) && extUri.isEqual(e.resource, userSettingsResource)
        )
      )(() => this._onDidChange.fire())
    );
  }
  parser;
  _onDidChange = this._register(
    new Emitter()
  );
  onDidChange = this._onDidChange.event;
  async loadConfiguration() {
    try {
      const content = await this.fileService.readFile(
        this.userSettingsResource
      );
      this.parser.parse(
        content.value.toString() || "{}",
        this.parseOptions
      );
      return this.parser.configurationModel;
    } catch (e) {
      return ConfigurationModel.createEmptyModel(this.logService);
    }
  }
  reparse(parseOptions) {
    if (parseOptions) {
      this.parseOptions = parseOptions;
    }
    this.parser.reparse(this.parseOptions);
    return this.parser.configurationModel;
  }
  getRestrictedSettings() {
    return this.parser.restrictedConfigurations;
  }
}
class ConfigurationInspectValue {
  constructor(key, overrides, _value, overrideIdentifiers, defaultConfiguration, policyConfiguration, applicationConfiguration, userConfiguration, localUserConfiguration, remoteUserConfiguration, workspaceConfiguration, folderConfigurationModel, memoryConfigurationModel) {
    this.key = key;
    this.overrides = overrides;
    this._value = _value;
    this.overrideIdentifiers = overrideIdentifiers;
    this.defaultConfiguration = defaultConfiguration;
    this.policyConfiguration = policyConfiguration;
    this.applicationConfiguration = applicationConfiguration;
    this.userConfiguration = userConfiguration;
    this.localUserConfiguration = localUserConfiguration;
    this.remoteUserConfiguration = remoteUserConfiguration;
    this.workspaceConfiguration = workspaceConfiguration;
    this.folderConfigurationModel = folderConfigurationModel;
    this.memoryConfigurationModel = memoryConfigurationModel;
  }
  get value() {
    return freeze(this._value);
  }
  toInspectValue(inspectValue) {
    return inspectValue?.value !== void 0 || inspectValue?.override !== void 0 || inspectValue?.overrides !== void 0 ? inspectValue : void 0;
  }
  _defaultInspectValue;
  get defaultInspectValue() {
    if (!this._defaultInspectValue) {
      this._defaultInspectValue = this.defaultConfiguration.inspect(
        this.key,
        this.overrides.overrideIdentifier
      );
    }
    return this._defaultInspectValue;
  }
  get defaultValue() {
    return this.defaultInspectValue.merged;
  }
  get default() {
    return this.toInspectValue(this.defaultInspectValue);
  }
  _policyInspectValue;
  get policyInspectValue() {
    if (this._policyInspectValue === void 0) {
      this._policyInspectValue = this.policyConfiguration ? this.policyConfiguration.inspect(this.key) : null;
    }
    return this._policyInspectValue;
  }
  get policyValue() {
    return this.policyInspectValue?.merged;
  }
  get policy() {
    return this.policyInspectValue?.value !== void 0 ? { value: this.policyInspectValue.value } : void 0;
  }
  _applicationInspectValue;
  get applicationInspectValue() {
    if (this._applicationInspectValue === void 0) {
      this._applicationInspectValue = this.applicationConfiguration ? this.applicationConfiguration.inspect(this.key) : null;
    }
    return this._applicationInspectValue;
  }
  get applicationValue() {
    return this.applicationInspectValue?.merged;
  }
  get application() {
    return this.toInspectValue(this.applicationInspectValue);
  }
  _userInspectValue;
  get userInspectValue() {
    if (!this._userInspectValue) {
      this._userInspectValue = this.userConfiguration.inspect(
        this.key,
        this.overrides.overrideIdentifier
      );
    }
    return this._userInspectValue;
  }
  get userValue() {
    return this.userInspectValue.merged;
  }
  get user() {
    return this.toInspectValue(this.userInspectValue);
  }
  _userLocalInspectValue;
  get userLocalInspectValue() {
    if (!this._userLocalInspectValue) {
      this._userLocalInspectValue = this.localUserConfiguration.inspect(
        this.key,
        this.overrides.overrideIdentifier
      );
    }
    return this._userLocalInspectValue;
  }
  get userLocalValue() {
    return this.userLocalInspectValue.merged;
  }
  get userLocal() {
    return this.toInspectValue(this.userLocalInspectValue);
  }
  _userRemoteInspectValue;
  get userRemoteInspectValue() {
    if (!this._userRemoteInspectValue) {
      this._userRemoteInspectValue = this.remoteUserConfiguration.inspect(
        this.key,
        this.overrides.overrideIdentifier
      );
    }
    return this._userRemoteInspectValue;
  }
  get userRemoteValue() {
    return this.userRemoteInspectValue.merged;
  }
  get userRemote() {
    return this.toInspectValue(this.userRemoteInspectValue);
  }
  _workspaceInspectValue;
  get workspaceInspectValue() {
    if (this._workspaceInspectValue === void 0) {
      this._workspaceInspectValue = this.workspaceConfiguration ? this.workspaceConfiguration.inspect(
        this.key,
        this.overrides.overrideIdentifier
      ) : null;
    }
    return this._workspaceInspectValue;
  }
  get workspaceValue() {
    return this.workspaceInspectValue?.merged;
  }
  get workspace() {
    return this.toInspectValue(this.workspaceInspectValue);
  }
  _workspaceFolderInspectValue;
  get workspaceFolderInspectValue() {
    if (this._workspaceFolderInspectValue === void 0) {
      this._workspaceFolderInspectValue = this.folderConfigurationModel ? this.folderConfigurationModel.inspect(
        this.key,
        this.overrides.overrideIdentifier
      ) : null;
    }
    return this._workspaceFolderInspectValue;
  }
  get workspaceFolderValue() {
    return this.workspaceFolderInspectValue?.merged;
  }
  get workspaceFolder() {
    return this.toInspectValue(this.workspaceFolderInspectValue);
  }
  _memoryInspectValue;
  get memoryInspectValue() {
    if (this._memoryInspectValue === void 0) {
      this._memoryInspectValue = this.memoryConfigurationModel.inspect(
        this.key,
        this.overrides.overrideIdentifier
      );
    }
    return this._memoryInspectValue;
  }
  get memoryValue() {
    return this.memoryInspectValue.merged;
  }
  get memory() {
    return this.toInspectValue(this.memoryInspectValue);
  }
}
class Configuration {
  constructor(_defaultConfiguration, _policyConfiguration, _applicationConfiguration, _localUserConfiguration, _remoteUserConfiguration, _workspaceConfiguration, _folderConfigurations, _memoryConfiguration, _memoryConfigurationByResource, logService) {
    this._defaultConfiguration = _defaultConfiguration;
    this._policyConfiguration = _policyConfiguration;
    this._applicationConfiguration = _applicationConfiguration;
    this._localUserConfiguration = _localUserConfiguration;
    this._remoteUserConfiguration = _remoteUserConfiguration;
    this._workspaceConfiguration = _workspaceConfiguration;
    this._folderConfigurations = _folderConfigurations;
    this._memoryConfiguration = _memoryConfiguration;
    this._memoryConfigurationByResource = _memoryConfigurationByResource;
    this.logService = logService;
  }
  _workspaceConsolidatedConfiguration = null;
  _foldersConsolidatedConfigurations = new ResourceMap();
  getValue(section, overrides, workspace) {
    const consolidateConfigurationModel = this.getConsolidatedConfigurationModel(
      section,
      overrides,
      workspace
    );
    return consolidateConfigurationModel.getValue(section);
  }
  updateValue(key, value, overrides = {}) {
    let memoryConfiguration;
    if (overrides.resource) {
      memoryConfiguration = this._memoryConfigurationByResource.get(
        overrides.resource
      );
      if (!memoryConfiguration) {
        memoryConfiguration = ConfigurationModel.createEmptyModel(
          this.logService
        );
        this._memoryConfigurationByResource.set(
          overrides.resource,
          memoryConfiguration
        );
      }
    } else {
      memoryConfiguration = this._memoryConfiguration;
    }
    if (value === void 0) {
      memoryConfiguration.removeValue(key);
    } else {
      memoryConfiguration.setValue(key, value);
    }
    if (!overrides.resource) {
      this._workspaceConsolidatedConfiguration = null;
    }
  }
  inspect(key, overrides, workspace) {
    const consolidateConfigurationModel = this.getConsolidatedConfigurationModel(key, overrides, workspace);
    const folderConfigurationModel = this.getFolderConfigurationModelForResource(
      overrides.resource,
      workspace
    );
    const memoryConfigurationModel = overrides.resource ? this._memoryConfigurationByResource.get(overrides.resource) || this._memoryConfiguration : this._memoryConfiguration;
    const overrideIdentifiers = /* @__PURE__ */ new Set();
    for (const override of consolidateConfigurationModel.overrides) {
      for (const overrideIdentifier of override.identifiers) {
        if (consolidateConfigurationModel.getOverrideValue(
          key,
          overrideIdentifier
        ) !== void 0) {
          overrideIdentifiers.add(overrideIdentifier);
        }
      }
    }
    return new ConfigurationInspectValue(
      key,
      overrides,
      consolidateConfigurationModel.getValue(key),
      overrideIdentifiers.size ? [...overrideIdentifiers] : void 0,
      this._defaultConfiguration,
      this._policyConfiguration.isEmpty() ? void 0 : this._policyConfiguration,
      this.applicationConfiguration.isEmpty() ? void 0 : this.applicationConfiguration,
      this.userConfiguration,
      this.localUserConfiguration,
      this.remoteUserConfiguration,
      workspace ? this._workspaceConfiguration : void 0,
      folderConfigurationModel ? folderConfigurationModel : void 0,
      memoryConfigurationModel
    );
  }
  keys(workspace) {
    const folderConfigurationModel = this.getFolderConfigurationModelForResource(void 0, workspace);
    return {
      default: this._defaultConfiguration.keys.slice(0),
      user: this.userConfiguration.keys.slice(0),
      workspace: this._workspaceConfiguration.keys.slice(0),
      workspaceFolder: folderConfigurationModel ? folderConfigurationModel.keys.slice(0) : []
    };
  }
  updateDefaultConfiguration(defaultConfiguration) {
    this._defaultConfiguration = defaultConfiguration;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations.clear();
  }
  updatePolicyConfiguration(policyConfiguration) {
    this._policyConfiguration = policyConfiguration;
  }
  updateApplicationConfiguration(applicationConfiguration) {
    this._applicationConfiguration = applicationConfiguration;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations.clear();
  }
  updateLocalUserConfiguration(localUserConfiguration) {
    this._localUserConfiguration = localUserConfiguration;
    this._userConfiguration = null;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations.clear();
  }
  updateRemoteUserConfiguration(remoteUserConfiguration) {
    this._remoteUserConfiguration = remoteUserConfiguration;
    this._userConfiguration = null;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations.clear();
  }
  updateWorkspaceConfiguration(workspaceConfiguration) {
    this._workspaceConfiguration = workspaceConfiguration;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations.clear();
  }
  updateFolderConfiguration(resource, configuration) {
    this._folderConfigurations.set(resource, configuration);
    this._foldersConsolidatedConfigurations.delete(resource);
  }
  deleteFolderConfiguration(resource) {
    this.folderConfigurations.delete(resource);
    this._foldersConsolidatedConfigurations.delete(resource);
  }
  compareAndUpdateDefaultConfiguration(defaults, keys) {
    const overrides = [];
    if (!keys) {
      const { added, updated, removed } = compare(
        this._defaultConfiguration,
        defaults
      );
      keys = [...added, ...updated, ...removed];
    }
    for (const key of keys) {
      for (const overrideIdentifier of overrideIdentifiersFromKey(key)) {
        const fromKeys = this._defaultConfiguration.getKeysForOverrideIdentifier(
          overrideIdentifier
        );
        const toKeys = defaults.getKeysForOverrideIdentifier(overrideIdentifier);
        const keys2 = [
          ...toKeys.filter((key2) => fromKeys.indexOf(key2) === -1),
          ...fromKeys.filter((key2) => toKeys.indexOf(key2) === -1),
          ...fromKeys.filter(
            (key2) => !objects.equals(
              this._defaultConfiguration.override(overrideIdentifier).getValue(key2),
              defaults.override(overrideIdentifier).getValue(key2)
            )
          )
        ];
        overrides.push([overrideIdentifier, keys2]);
      }
    }
    this.updateDefaultConfiguration(defaults);
    return { keys, overrides };
  }
  compareAndUpdatePolicyConfiguration(policyConfiguration) {
    const { added, updated, removed } = compare(
      this._policyConfiguration,
      policyConfiguration
    );
    const keys = [...added, ...updated, ...removed];
    if (keys.length) {
      this.updatePolicyConfiguration(policyConfiguration);
    }
    return { keys, overrides: [] };
  }
  compareAndUpdateApplicationConfiguration(application) {
    const { added, updated, removed, overrides } = compare(
      this.applicationConfiguration,
      application
    );
    const keys = [...added, ...updated, ...removed];
    if (keys.length) {
      this.updateApplicationConfiguration(application);
    }
    return { keys, overrides };
  }
  compareAndUpdateLocalUserConfiguration(user) {
    const { added, updated, removed, overrides } = compare(
      this.localUserConfiguration,
      user
    );
    const keys = [...added, ...updated, ...removed];
    if (keys.length) {
      this.updateLocalUserConfiguration(user);
    }
    return { keys, overrides };
  }
  compareAndUpdateRemoteUserConfiguration(user) {
    const { added, updated, removed, overrides } = compare(
      this.remoteUserConfiguration,
      user
    );
    const keys = [...added, ...updated, ...removed];
    if (keys.length) {
      this.updateRemoteUserConfiguration(user);
    }
    return { keys, overrides };
  }
  compareAndUpdateWorkspaceConfiguration(workspaceConfiguration) {
    const { added, updated, removed, overrides } = compare(
      this.workspaceConfiguration,
      workspaceConfiguration
    );
    const keys = [...added, ...updated, ...removed];
    if (keys.length) {
      this.updateWorkspaceConfiguration(workspaceConfiguration);
    }
    return { keys, overrides };
  }
  compareAndUpdateFolderConfiguration(resource, folderConfiguration) {
    const currentFolderConfiguration = this.folderConfigurations.get(resource);
    const { added, updated, removed, overrides } = compare(
      currentFolderConfiguration,
      folderConfiguration
    );
    const keys = [...added, ...updated, ...removed];
    if (keys.length || !currentFolderConfiguration) {
      this.updateFolderConfiguration(resource, folderConfiguration);
    }
    return { keys, overrides };
  }
  compareAndDeleteFolderConfiguration(folder) {
    const folderConfig = this.folderConfigurations.get(folder);
    if (!folderConfig) {
      throw new Error("Unknown folder");
    }
    this.deleteFolderConfiguration(folder);
    const { added, updated, removed, overrides } = compare(
      folderConfig,
      void 0
    );
    return { keys: [...added, ...updated, ...removed], overrides };
  }
  get defaults() {
    return this._defaultConfiguration;
  }
  get applicationConfiguration() {
    return this._applicationConfiguration;
  }
  _userConfiguration = null;
  get userConfiguration() {
    if (!this._userConfiguration) {
      this._userConfiguration = this._remoteUserConfiguration.isEmpty() ? this._localUserConfiguration : this._localUserConfiguration.merge(
        this._remoteUserConfiguration
      );
    }
    return this._userConfiguration;
  }
  get localUserConfiguration() {
    return this._localUserConfiguration;
  }
  get remoteUserConfiguration() {
    return this._remoteUserConfiguration;
  }
  get workspaceConfiguration() {
    return this._workspaceConfiguration;
  }
  get folderConfigurations() {
    return this._folderConfigurations;
  }
  getConsolidatedConfigurationModel(section, overrides, workspace) {
    let configurationModel = this.getConsolidatedConfigurationModelForResource(
      overrides,
      workspace
    );
    if (overrides.overrideIdentifier) {
      configurationModel = configurationModel.override(
        overrides.overrideIdentifier
      );
    }
    if (!this._policyConfiguration.isEmpty() && this._policyConfiguration.getValue(section) !== void 0) {
      configurationModel = configurationModel.merge(
        this._policyConfiguration
      );
    }
    return configurationModel;
  }
  getConsolidatedConfigurationModelForResource({ resource }, workspace) {
    let consolidateConfiguration = this.getWorkspaceConsolidatedConfiguration();
    if (workspace && resource) {
      const root = workspace.getFolder(resource);
      if (root) {
        consolidateConfiguration = this.getFolderConsolidatedConfiguration(root.uri) || consolidateConfiguration;
      }
      const memoryConfigurationForResource = this._memoryConfigurationByResource.get(resource);
      if (memoryConfigurationForResource) {
        consolidateConfiguration = consolidateConfiguration.merge(
          memoryConfigurationForResource
        );
      }
    }
    return consolidateConfiguration;
  }
  getWorkspaceConsolidatedConfiguration() {
    if (!this._workspaceConsolidatedConfiguration) {
      this._workspaceConsolidatedConfiguration = this._defaultConfiguration.merge(
        this.applicationConfiguration,
        this.userConfiguration,
        this._workspaceConfiguration,
        this._memoryConfiguration
      );
    }
    return this._workspaceConsolidatedConfiguration;
  }
  getFolderConsolidatedConfiguration(folder) {
    let folderConsolidatedConfiguration = this._foldersConsolidatedConfigurations.get(folder);
    if (!folderConsolidatedConfiguration) {
      const workspaceConsolidateConfiguration = this.getWorkspaceConsolidatedConfiguration();
      const folderConfiguration = this._folderConfigurations.get(folder);
      if (folderConfiguration) {
        folderConsolidatedConfiguration = workspaceConsolidateConfiguration.merge(
          folderConfiguration
        );
        this._foldersConsolidatedConfigurations.set(
          folder,
          folderConsolidatedConfiguration
        );
      } else {
        folderConsolidatedConfiguration = workspaceConsolidateConfiguration;
      }
    }
    return folderConsolidatedConfiguration;
  }
  getFolderConfigurationModelForResource(resource, workspace) {
    if (workspace && resource) {
      const root = workspace.getFolder(resource);
      if (root) {
        return this._folderConfigurations.get(root.uri);
      }
    }
    return void 0;
  }
  toData() {
    return {
      defaults: {
        contents: this._defaultConfiguration.contents,
        overrides: this._defaultConfiguration.overrides,
        keys: this._defaultConfiguration.keys
      },
      policy: {
        contents: this._policyConfiguration.contents,
        overrides: this._policyConfiguration.overrides,
        keys: this._policyConfiguration.keys
      },
      application: {
        contents: this.applicationConfiguration.contents,
        overrides: this.applicationConfiguration.overrides,
        keys: this.applicationConfiguration.keys
      },
      user: {
        contents: this.userConfiguration.contents,
        overrides: this.userConfiguration.overrides,
        keys: this.userConfiguration.keys
      },
      workspace: {
        contents: this._workspaceConfiguration.contents,
        overrides: this._workspaceConfiguration.overrides,
        keys: this._workspaceConfiguration.keys
      },
      folders: [...this._folderConfigurations.keys()].reduce((result, folder) => {
        const { contents, overrides, keys } = this._folderConfigurations.get(folder);
        result.push([folder, { contents, overrides, keys }]);
        return result;
      }, [])
    };
  }
  allKeys() {
    const keys = /* @__PURE__ */ new Set();
    this._defaultConfiguration.keys.forEach((key) => keys.add(key));
    this.userConfiguration.keys.forEach((key) => keys.add(key));
    this._workspaceConfiguration.keys.forEach((key) => keys.add(key));
    this._folderConfigurations.forEach(
      (folderConfiguration) => folderConfiguration.keys.forEach((key) => keys.add(key))
    );
    return [...keys.values()];
  }
  allOverrideIdentifiers() {
    const keys = /* @__PURE__ */ new Set();
    this._defaultConfiguration.getAllOverrideIdentifiers().forEach((key) => keys.add(key));
    this.userConfiguration.getAllOverrideIdentifiers().forEach((key) => keys.add(key));
    this._workspaceConfiguration.getAllOverrideIdentifiers().forEach((key) => keys.add(key));
    this._folderConfigurations.forEach(
      (folderConfiguration) => folderConfiguration.getAllOverrideIdentifiers().forEach((key) => keys.add(key))
    );
    return [...keys.values()];
  }
  getAllKeysForOverrideIdentifier(overrideIdentifier) {
    const keys = /* @__PURE__ */ new Set();
    this._defaultConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach((key) => keys.add(key));
    this.userConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach((key) => keys.add(key));
    this._workspaceConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach((key) => keys.add(key));
    this._folderConfigurations.forEach(
      (folderConfiguration) => folderConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach((key) => keys.add(key))
    );
    return [...keys.values()];
  }
  static parse(data, logService) {
    const defaultConfiguration = this.parseConfigurationModel(
      data.defaults,
      logService
    );
    const policyConfiguration = this.parseConfigurationModel(
      data.policy,
      logService
    );
    const applicationConfiguration = this.parseConfigurationModel(
      data.application,
      logService
    );
    const userConfiguration = this.parseConfigurationModel(
      data.user,
      logService
    );
    const workspaceConfiguration = this.parseConfigurationModel(
      data.workspace,
      logService
    );
    const folders = data.folders.reduce(
      (result, value) => {
        result.set(
          URI.revive(value[0]),
          this.parseConfigurationModel(value[1], logService)
        );
        return result;
      },
      new ResourceMap()
    );
    return new Configuration(
      defaultConfiguration,
      policyConfiguration,
      applicationConfiguration,
      userConfiguration,
      ConfigurationModel.createEmptyModel(logService),
      workspaceConfiguration,
      folders,
      ConfigurationModel.createEmptyModel(logService),
      new ResourceMap(),
      logService
    );
  }
  static parseConfigurationModel(model, logService) {
    return new ConfigurationModel(
      model.contents,
      model.keys,
      model.overrides,
      void 0,
      logService
    );
  }
}
function mergeChanges(...changes) {
  if (changes.length === 0) {
    return { keys: [], overrides: [] };
  }
  if (changes.length === 1) {
    return changes[0];
  }
  const keysSet = /* @__PURE__ */ new Set();
  const overridesMap = /* @__PURE__ */ new Map();
  for (const change of changes) {
    change.keys.forEach((key) => keysSet.add(key));
    change.overrides.forEach(([identifier, keys]) => {
      const result = getOrSet(
        overridesMap,
        identifier,
        /* @__PURE__ */ new Set()
      );
      keys.forEach((key) => result.add(key));
    });
  }
  const overrides = [];
  overridesMap.forEach(
    (keys, identifier) => overrides.push([identifier, [...keys.values()]])
  );
  return { keys: [...keysSet.values()], overrides };
}
class ConfigurationChangeEvent {
  constructor(change, previous, currentConfiguraiton, currentWorkspace, logService) {
    this.change = change;
    this.previous = previous;
    this.currentConfiguraiton = currentConfiguraiton;
    this.currentWorkspace = currentWorkspace;
    this.logService = logService;
    for (const key of change.keys) {
      this.affectedKeys.add(key);
    }
    for (const [, keys] of change.overrides) {
      for (const key of keys) {
        this.affectedKeys.add(key);
      }
    }
    this._affectsConfigStr = this._marker;
    for (const key of this.affectedKeys) {
      this._affectsConfigStr += key + this._marker;
    }
  }
  _marker = "\n";
  _markerCode1 = this._marker.charCodeAt(0);
  _markerCode2 = ".".charCodeAt(0);
  _affectsConfigStr;
  affectedKeys = /* @__PURE__ */ new Set();
  source;
  _previousConfiguration = void 0;
  get previousConfiguration() {
    if (!this._previousConfiguration && this.previous) {
      this._previousConfiguration = Configuration.parse(
        this.previous.data,
        this.logService
      );
    }
    return this._previousConfiguration;
  }
  affectsConfiguration(section, overrides) {
    const needle = this._marker + section;
    const idx = this._affectsConfigStr.indexOf(needle);
    if (idx < 0) {
      return false;
    }
    const pos = idx + needle.length;
    if (pos >= this._affectsConfigStr.length) {
      return false;
    }
    const code = this._affectsConfigStr.charCodeAt(pos);
    if (code !== this._markerCode1 && code !== this._markerCode2) {
      return false;
    }
    if (overrides) {
      const value1 = this.previousConfiguration ? this.previousConfiguration.getValue(
        section,
        overrides,
        this.previous?.workspace
      ) : void 0;
      const value2 = this.currentConfiguraiton.getValue(
        section,
        overrides,
        this.currentWorkspace
      );
      return !objects.equals(value1, value2);
    }
    return true;
  }
}
function compare(from, to) {
  const { added, removed, updated } = compareConfigurationContents(
    to?.rawConfiguration,
    from?.rawConfiguration
  );
  const overrides = [];
  const fromOverrideIdentifiers = from?.getAllOverrideIdentifiers() || [];
  const toOverrideIdentifiers = to?.getAllOverrideIdentifiers() || [];
  if (to) {
    const addedOverrideIdentifiers = toOverrideIdentifiers.filter(
      (key) => !fromOverrideIdentifiers.includes(key)
    );
    for (const identifier of addedOverrideIdentifiers) {
      overrides.push([
        identifier,
        to.getKeysForOverrideIdentifier(identifier)
      ]);
    }
  }
  if (from) {
    const removedOverrideIdentifiers = fromOverrideIdentifiers.filter(
      (key) => !toOverrideIdentifiers.includes(key)
    );
    for (const identifier of removedOverrideIdentifiers) {
      overrides.push([
        identifier,
        from.getKeysForOverrideIdentifier(identifier)
      ]);
    }
  }
  if (to && from) {
    for (const identifier of fromOverrideIdentifiers) {
      if (toOverrideIdentifiers.includes(identifier)) {
        const result = compareConfigurationContents(
          {
            contents: from.getOverrideValue(void 0, identifier) || {},
            keys: from.getKeysForOverrideIdentifier(identifier)
          },
          {
            contents: to.getOverrideValue(void 0, identifier) || {},
            keys: to.getKeysForOverrideIdentifier(identifier)
          }
        );
        overrides.push([
          identifier,
          [...result.added, ...result.removed, ...result.updated]
        ]);
      }
    }
  }
  return { added, removed, updated, overrides };
}
function compareConfigurationContents(to, from) {
  const added = to ? from ? to.keys.filter((key) => from.keys.indexOf(key) === -1) : [...to.keys] : [];
  const removed = from ? to ? from.keys.filter((key) => to.keys.indexOf(key) === -1) : [...from.keys] : [];
  const updated = [];
  if (to && from) {
    for (const key of from.keys) {
      if (to.keys.indexOf(key) !== -1) {
        const value1 = getConfigurationValue(from.contents, key);
        const value2 = getConfigurationValue(to.contents, key);
        if (!objects.equals(value1, value2)) {
          updated.push(key);
        }
      }
    }
  }
  return { added, removed, updated };
}
export {
  Configuration,
  ConfigurationChangeEvent,
  ConfigurationModel,
  ConfigurationModelParser,
  UserSettings,
  mergeChanges
};
