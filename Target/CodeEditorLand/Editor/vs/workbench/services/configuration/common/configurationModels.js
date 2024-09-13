var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../../base/common/objects.js";
import { toValuesTree, IConfigurationModel, IConfigurationOverrides, IConfigurationValue, IConfigurationChange } from "../../../../platform/configuration/common/configuration.js";
import { Configuration as BaseConfiguration, ConfigurationModelParser, ConfigurationModel, ConfigurationParseOptions } from "../../../../platform/configuration/common/configurationModels.js";
import { IStoredWorkspaceFolder } from "../../../../platform/workspaces/common/workspaces.js";
import { Workspace } from "../../../../platform/workspace/common/workspace.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { URI } from "../../../../base/common/uri.js";
import { isBoolean } from "../../../../base/common/types.js";
import { distinct } from "../../../../base/common/arrays.js";
import { ILogService } from "../../../../platform/log/common/log.js";
class WorkspaceConfigurationModelParser extends ConfigurationModelParser {
  static {
    __name(this, "WorkspaceConfigurationModelParser");
  }
  _folders = [];
  _transient = false;
  _settingsModelParser;
  _launchModel;
  _tasksModel;
  constructor(name, logService) {
    super(name, logService);
    this._settingsModelParser = new ConfigurationModelParser(name, logService);
    this._launchModel = ConfigurationModel.createEmptyModel(logService);
    this._tasksModel = ConfigurationModel.createEmptyModel(logService);
  }
  get folders() {
    return this._folders;
  }
  get transient() {
    return this._transient;
  }
  get settingsModel() {
    return this._settingsModelParser.configurationModel;
  }
  get launchModel() {
    return this._launchModel;
  }
  get tasksModel() {
    return this._tasksModel;
  }
  reparseWorkspaceSettings(configurationParseOptions) {
    this._settingsModelParser.reparse(configurationParseOptions);
  }
  getRestrictedWorkspaceSettings() {
    return this._settingsModelParser.restrictedConfigurations;
  }
  doParseRaw(raw, configurationParseOptions) {
    this._folders = raw["folders"] || [];
    this._transient = isBoolean(raw["transient"]) && raw["transient"];
    this._settingsModelParser.parseRaw(raw["settings"], configurationParseOptions);
    this._launchModel = this.createConfigurationModelFrom(raw, "launch");
    this._tasksModel = this.createConfigurationModelFrom(raw, "tasks");
    return super.doParseRaw(raw, configurationParseOptions);
  }
  createConfigurationModelFrom(raw, key) {
    const data = raw[key];
    if (data) {
      const contents = toValuesTree(data, (message) => console.error(`Conflict in settings file ${this._name}: ${message}`));
      const scopedContents = /* @__PURE__ */ Object.create(null);
      scopedContents[key] = contents;
      const keys = Object.keys(data).map((k) => `${key}.${k}`);
      return new ConfigurationModel(scopedContents, keys, [], void 0, this.logService);
    }
    return ConfigurationModel.createEmptyModel(this.logService);
  }
}
class StandaloneConfigurationModelParser extends ConfigurationModelParser {
  constructor(name, scope, logService) {
    super(name, logService);
    this.scope = scope;
  }
  static {
    __name(this, "StandaloneConfigurationModelParser");
  }
  doParseRaw(raw, configurationParseOptions) {
    const contents = toValuesTree(raw, (message) => console.error(`Conflict in settings file ${this._name}: ${message}`));
    const scopedContents = /* @__PURE__ */ Object.create(null);
    scopedContents[this.scope] = contents;
    const keys = Object.keys(raw).map((key) => `${this.scope}.${key}`);
    return { contents: scopedContents, keys, overrides: [] };
  }
}
class Configuration extends BaseConfiguration {
  constructor(defaults, policy, application, localUser, remoteUser, workspaceConfiguration, folders, memoryConfiguration, memoryConfigurationByResource, _workspace, logService) {
    super(defaults, policy, application, localUser, remoteUser, workspaceConfiguration, folders, memoryConfiguration, memoryConfigurationByResource, logService);
    this._workspace = _workspace;
  }
  static {
    __name(this, "Configuration");
  }
  getValue(key, overrides = {}) {
    return super.getValue(key, overrides, this._workspace);
  }
  inspect(key, overrides = {}) {
    return super.inspect(key, overrides, this._workspace);
  }
  keys() {
    return super.keys(this._workspace);
  }
  compareAndDeleteFolderConfiguration(folder) {
    if (this._workspace && this._workspace.folders.length > 0 && this._workspace.folders[0].uri.toString() === folder.toString()) {
      return { keys: [], overrides: [] };
    }
    return super.compareAndDeleteFolderConfiguration(folder);
  }
  compare(other) {
    const compare = /* @__PURE__ */ __name((fromKeys, toKeys, overrideIdentifier) => {
      const keys2 = [];
      keys2.push(...toKeys.filter((key) => fromKeys.indexOf(key) === -1));
      keys2.push(...fromKeys.filter((key) => toKeys.indexOf(key) === -1));
      keys2.push(...fromKeys.filter((key) => {
        if (toKeys.indexOf(key) === -1) {
          return false;
        }
        if (!equals(this.getValue(key, { overrideIdentifier }), other.getValue(key, { overrideIdentifier }))) {
          return true;
        }
        return this._workspace && this._workspace.folders.some((folder) => !equals(this.getValue(key, { resource: folder.uri, overrideIdentifier }), other.getValue(key, { resource: folder.uri, overrideIdentifier })));
      }));
      return keys2;
    }, "compare");
    const keys = compare(this.allKeys(), other.allKeys());
    const overrides = [];
    const allOverrideIdentifiers = distinct([...this.allOverrideIdentifiers(), ...other.allOverrideIdentifiers()]);
    for (const overrideIdentifier of allOverrideIdentifiers) {
      const keys2 = compare(this.getAllKeysForOverrideIdentifier(overrideIdentifier), other.getAllKeysForOverrideIdentifier(overrideIdentifier), overrideIdentifier);
      if (keys2.length) {
        overrides.push([overrideIdentifier, keys2]);
      }
    }
    return { keys, overrides };
  }
}
export {
  Configuration,
  StandaloneConfigurationModelParser,
  WorkspaceConfigurationModelParser
};
//# sourceMappingURL=configurationModels.js.map
