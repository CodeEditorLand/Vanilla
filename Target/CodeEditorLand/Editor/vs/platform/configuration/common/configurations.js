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
import { coalesce } from "../../../base/common/arrays.js";
import { IStringDictionary } from "../../../base/common/collections.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { equals } from "../../../base/common/objects.js";
import { isEmptyObject } from "../../../base/common/types.js";
import { ConfigurationModel } from "./configurationModels.js";
import { Extensions, IConfigurationRegistry, IRegisteredConfigurationPropertySchema } from "./configurationRegistry.js";
import { ILogService, NullLogService } from "../../log/common/log.js";
import { IPolicyService, PolicyDefinition, PolicyName, PolicyValue } from "../../policy/common/policy.js";
import { Registry } from "../../registry/common/platform.js";
class DefaultConfiguration extends Disposable {
  constructor(logService) {
    super();
    this.logService = logService;
  }
  static {
    __name(this, "DefaultConfiguration");
  }
  _onDidChangeConfiguration = this._register(new Emitter());
  onDidChangeConfiguration = this._onDidChangeConfiguration.event;
  _configurationModel = ConfigurationModel.createEmptyModel(this.logService);
  get configurationModel() {
    return this._configurationModel;
  }
  async initialize() {
    this.resetConfigurationModel();
    this._register(Registry.as(Extensions.Configuration).onDidUpdateConfiguration(({ properties, defaultsOverrides }) => this.onDidUpdateConfiguration(Array.from(properties), defaultsOverrides)));
    return this.configurationModel;
  }
  reload() {
    this.resetConfigurationModel();
    return this.configurationModel;
  }
  onDidUpdateConfiguration(properties, defaultsOverrides) {
    this.updateConfigurationModel(properties, Registry.as(Extensions.Configuration).getConfigurationProperties());
    this._onDidChangeConfiguration.fire({ defaults: this.configurationModel, properties });
  }
  getConfigurationDefaultOverrides() {
    return {};
  }
  resetConfigurationModel() {
    this._configurationModel = ConfigurationModel.createEmptyModel(this.logService);
    const properties = Registry.as(Extensions.Configuration).getConfigurationProperties();
    this.updateConfigurationModel(Object.keys(properties), properties);
  }
  updateConfigurationModel(properties, configurationProperties) {
    const configurationDefaultsOverrides = this.getConfigurationDefaultOverrides();
    for (const key of properties) {
      const defaultOverrideValue = configurationDefaultsOverrides[key];
      const propertySchema = configurationProperties[key];
      if (defaultOverrideValue !== void 0) {
        this._configurationModel.setValue(key, defaultOverrideValue);
      } else if (propertySchema) {
        this._configurationModel.setValue(key, propertySchema.default);
      } else {
        this._configurationModel.removeValue(key);
      }
    }
  }
}
class NullPolicyConfiguration {
  static {
    __name(this, "NullPolicyConfiguration");
  }
  onDidChangeConfiguration = Event.None;
  configurationModel = ConfigurationModel.createEmptyModel(new NullLogService());
  async initialize() {
    return this.configurationModel;
  }
}
let PolicyConfiguration = class extends Disposable {
  constructor(defaultConfiguration, policyService, logService) {
    super();
    this.defaultConfiguration = defaultConfiguration;
    this.policyService = policyService;
    this.logService = logService;
  }
  static {
    __name(this, "PolicyConfiguration");
  }
  _onDidChangeConfiguration = this._register(new Emitter());
  onDidChangeConfiguration = this._onDidChangeConfiguration.event;
  _configurationModel = ConfigurationModel.createEmptyModel(this.logService);
  get configurationModel() {
    return this._configurationModel;
  }
  async initialize() {
    this.logService.trace("PolicyConfiguration#initialize");
    this.update(await this.updatePolicyDefinitions(this.defaultConfiguration.configurationModel.keys), false);
    this._register(this.policyService.onDidChange((policyNames) => this.onDidChangePolicies(policyNames)));
    this._register(this.defaultConfiguration.onDidChangeConfiguration(async ({ properties }) => this.update(await this.updatePolicyDefinitions(properties), true)));
    return this._configurationModel;
  }
  async updatePolicyDefinitions(properties) {
    this.logService.trace("PolicyConfiguration#updatePolicyDefinitions", properties);
    const policyDefinitions = {};
    const keys = [];
    const configurationProperties = Registry.as(Extensions.Configuration).getConfigurationProperties();
    for (const key of properties) {
      const config = configurationProperties[key];
      if (!config) {
        keys.push(key);
        continue;
      }
      if (config.policy) {
        if (config.type !== "string" && config.type !== "number") {
          this.logService.warn(`Policy ${config.policy.name} has unsupported type ${config.type}`);
          continue;
        }
        keys.push(key);
        policyDefinitions[config.policy.name] = { type: config.type };
      }
    }
    if (!isEmptyObject(policyDefinitions)) {
      await this.policyService.updatePolicyDefinitions(policyDefinitions);
    }
    return keys;
  }
  onDidChangePolicies(policyNames) {
    this.logService.trace("PolicyConfiguration#onDidChangePolicies", policyNames);
    const policyConfigurations = Registry.as(Extensions.Configuration).getPolicyConfigurations();
    const keys = coalesce(policyNames.map((policyName) => policyConfigurations.get(policyName)));
    this.update(keys, true);
  }
  update(keys, trigger) {
    this.logService.trace("PolicyConfiguration#update", keys);
    const configurationProperties = Registry.as(Extensions.Configuration).getConfigurationProperties();
    const changed = [];
    const wasEmpty = this._configurationModel.isEmpty();
    for (const key of keys) {
      const policyName = configurationProperties[key]?.policy?.name;
      if (policyName) {
        const policyValue = this.policyService.getPolicyValue(policyName);
        if (wasEmpty ? policyValue !== void 0 : !equals(this._configurationModel.getValue(key), policyValue)) {
          changed.push([key, policyValue]);
        }
      } else {
        if (this._configurationModel.getValue(key) !== void 0) {
          changed.push([key, void 0]);
        }
      }
    }
    if (changed.length) {
      this.logService.trace("PolicyConfiguration#changed", changed);
      const old = this._configurationModel;
      this._configurationModel = ConfigurationModel.createEmptyModel(this.logService);
      for (const key of old.keys) {
        this._configurationModel.setValue(key, old.getValue(key));
      }
      for (const [key, policyValue] of changed) {
        if (policyValue === void 0) {
          this._configurationModel.removeValue(key);
        } else {
          this._configurationModel.setValue(key, policyValue);
        }
      }
      if (trigger) {
        this._onDidChangeConfiguration.fire(this._configurationModel);
      }
    }
  }
};
PolicyConfiguration = __decorateClass([
  __decorateParam(1, IPolicyService),
  __decorateParam(2, ILogService)
], PolicyConfiguration);
export {
  DefaultConfiguration,
  NullPolicyConfiguration,
  PolicyConfiguration
};
//# sourceMappingURL=configurations.js.map
