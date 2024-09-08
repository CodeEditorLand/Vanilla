import { Emitter } from "../../../../base/common/event.js";
import { TernarySearchTree } from "../../../../base/common/ternarySearchTree.js";
import { Registry } from "../../../registry/common/platform.js";
import {
  getConfigurationValue,
  isConfigurationOverrides
} from "../../common/configuration.js";
import {
  Extensions
} from "../../common/configurationRegistry.js";
class TestConfigurationService {
  _serviceBrand;
  configuration;
  onDidChangeConfigurationEmitter = new Emitter();
  onDidChangeConfiguration = this.onDidChangeConfigurationEmitter.event;
  constructor(configuration) {
    this.configuration = configuration || /* @__PURE__ */ Object.create(null);
  }
  configurationByRoot = TernarySearchTree.forPaths();
  reloadConfiguration() {
    return Promise.resolve(this.getValue());
  }
  getValue(arg1, arg2) {
    let configuration;
    const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : void 0;
    if (overrides) {
      if (overrides.resource) {
        configuration = this.configurationByRoot.findSubstr(
          overrides.resource.fsPath
        );
      }
    }
    configuration = configuration ? configuration : this.configuration;
    if (arg1 && typeof arg1 === "string") {
      return configuration[arg1] ?? getConfigurationValue(configuration, arg1);
    }
    return configuration;
  }
  updateValue(key, value) {
    return Promise.resolve(void 0);
  }
  setUserConfiguration(key, value, root) {
    if (root) {
      const configForRoot = this.configurationByRoot.get(root.fsPath) || /* @__PURE__ */ Object.create(null);
      configForRoot[key] = value;
      this.configurationByRoot.set(root.fsPath, configForRoot);
    } else {
      this.configuration[key] = value;
    }
    return Promise.resolve(void 0);
  }
  overrideIdentifiers = /* @__PURE__ */ new Map();
  setOverrideIdentifiers(key, identifiers) {
    this.overrideIdentifiers.set(key, identifiers);
  }
  inspect(key, overrides) {
    const config = this.getValue(void 0, overrides);
    return {
      value: getConfigurationValue(config, key),
      defaultValue: getConfigurationValue(config, key),
      userValue: getConfigurationValue(config, key),
      overrideIdentifiers: this.overrideIdentifiers.get(key)
    };
  }
  keys() {
    return {
      default: Object.keys(
        Registry.as(
          Extensions.Configuration
        ).getConfigurationProperties()
      ),
      user: Object.keys(this.configuration),
      workspace: [],
      workspaceFolder: []
    };
  }
  getConfigurationData() {
    return null;
  }
}
export {
  TestConfigurationService
};
