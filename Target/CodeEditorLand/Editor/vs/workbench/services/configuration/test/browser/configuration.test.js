var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Event } from "../../../../../base/common/event.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Extensions, IConfigurationRegistry } from "../../../../../platform/configuration/common/configurationRegistry.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { DefaultConfiguration } from "../../browser/configuration.js";
import { ConfigurationKey, IConfigurationCache } from "../../common/configuration.js";
import { BrowserWorkbenchEnvironmentService } from "../../../environment/browser/environmentService.js";
import { TestEnvironmentService } from "../../../../test/browser/workbenchTestServices.js";
import { TestProductService } from "../../../../test/common/workbenchTestServices.js";
class ConfigurationCache {
  static {
    __name(this, "ConfigurationCache");
  }
  cache = /* @__PURE__ */ new Map();
  needsCaching(resource) {
    return false;
  }
  async read({ type, key }) {
    return this.cache.get(`${type}:${key}`) || "";
  }
  async write({ type, key }, content) {
    this.cache.set(`${type}:${key}`, content);
  }
  async remove({ type, key }) {
    this.cache.delete(`${type}:${key}`);
  }
}
suite("DefaultConfiguration", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  const configurationRegistry = Registry.as(Extensions.Configuration);
  const cacheKey = { type: "defaults", key: "configurationDefaultsOverrides" };
  let configurationCache;
  setup(() => {
    configurationCache = new ConfigurationCache();
    configurationRegistry.registerConfiguration({
      "id": "test.configurationDefaultsOverride",
      "type": "object",
      "properties": {
        "test.configurationDefaultsOverride": {
          "type": "string",
          "default": "defaultValue"
        }
      }
    });
  });
  teardown(() => {
    configurationRegistry.deregisterConfigurations(configurationRegistry.getConfigurations());
    configurationRegistry.deregisterDefaultConfigurations(configurationRegistry.getRegisteredDefaultConfigurations());
  });
  test("configuration default overrides are read from environment", async () => {
    const environmentService = new BrowserWorkbenchEnvironmentService("", joinPath(URI.file("tests").with({ scheme: "vscode-tests" }), "logs"), { configurationDefaults: { "test.configurationDefaultsOverride": "envOverrideValue" } }, TestProductService);
    const testObject = disposables.add(new DefaultConfiguration(configurationCache, environmentService, new NullLogService()));
    await testObject.initialize();
    assert.deepStrictEqual(testObject.configurationModel.getValue("test.configurationDefaultsOverride"), "envOverrideValue");
  });
  test("configuration default overrides are read from cache", async () => {
    localStorage.setItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, "yes");
    await configurationCache.write(cacheKey, JSON.stringify({ "test.configurationDefaultsOverride": "overrideValue" }));
    const testObject = disposables.add(new DefaultConfiguration(configurationCache, TestEnvironmentService, new NullLogService()));
    const actual = await testObject.initialize();
    assert.deepStrictEqual(actual.getValue("test.configurationDefaultsOverride"), "overrideValue");
    assert.deepStrictEqual(testObject.configurationModel.getValue("test.configurationDefaultsOverride"), "overrideValue");
  });
  test("configuration default overrides are not read from cache when model is read before initialize", async () => {
    localStorage.setItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, "yes");
    await configurationCache.write(cacheKey, JSON.stringify({ "test.configurationDefaultsOverride": "overrideValue" }));
    const testObject = disposables.add(new DefaultConfiguration(configurationCache, TestEnvironmentService, new NullLogService()));
    assert.deepStrictEqual(testObject.configurationModel.getValue("test.configurationDefaultsOverride"), void 0);
  });
  test("configuration default overrides read from cache override environment", async () => {
    const environmentService = new BrowserWorkbenchEnvironmentService("", joinPath(URI.file("tests").with({ scheme: "vscode-tests" }), "logs"), { configurationDefaults: { "test.configurationDefaultsOverride": "envOverrideValue" } }, TestProductService);
    localStorage.setItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, "yes");
    await configurationCache.write(cacheKey, JSON.stringify({ "test.configurationDefaultsOverride": "overrideValue" }));
    const testObject = disposables.add(new DefaultConfiguration(configurationCache, environmentService, new NullLogService()));
    const actual = await testObject.initialize();
    assert.deepStrictEqual(actual.getValue("test.configurationDefaultsOverride"), "overrideValue");
  });
  test("configuration default overrides are read from cache when default configuration changed", async () => {
    localStorage.setItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, "yes");
    await configurationCache.write(cacheKey, JSON.stringify({ "test.configurationDefaultsOverride": "overrideValue" }));
    const testObject = disposables.add(new DefaultConfiguration(configurationCache, TestEnvironmentService, new NullLogService()));
    await testObject.initialize();
    const promise = Event.toPromise(testObject.onDidChangeConfiguration);
    configurationRegistry.registerConfiguration({
      "id": "test.configurationDefaultsOverride",
      "type": "object",
      "properties": {
        "test.configurationDefaultsOverride1": {
          "type": "string",
          "default": "defaultValue"
        }
      }
    });
    const { defaults: actual } = await promise;
    assert.deepStrictEqual(actual.getValue("test.configurationDefaultsOverride"), "overrideValue");
  });
  test("configuration default overrides are not read from cache after reload", async () => {
    localStorage.setItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, "yes");
    await configurationCache.write(cacheKey, JSON.stringify({ "test.configurationDefaultsOverride": "overrideValue" }));
    const testObject = disposables.add(new DefaultConfiguration(configurationCache, TestEnvironmentService, new NullLogService()));
    await testObject.initialize();
    const actual = testObject.reload();
    assert.deepStrictEqual(actual.getValue("test.configurationDefaultsOverride"), "defaultValue");
  });
  test("cache is reset after reload", async () => {
    localStorage.setItem(DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, "yes");
    await configurationCache.write(cacheKey, JSON.stringify({ "test.configurationDefaultsOverride": "overrideValue" }));
    const testObject = disposables.add(new DefaultConfiguration(configurationCache, TestEnvironmentService, new NullLogService()));
    await testObject.initialize();
    testObject.reload();
    assert.deepStrictEqual(await configurationCache.read(cacheKey), "");
  });
  test("configuration default overrides are written in cache", async () => {
    const testObject = disposables.add(new DefaultConfiguration(configurationCache, TestEnvironmentService, new NullLogService()));
    await testObject.initialize();
    testObject.reload();
    const promise = Event.toPromise(testObject.onDidChangeConfiguration);
    configurationRegistry.registerDefaultConfigurations([{ overrides: { "test.configurationDefaultsOverride": "newoverrideValue" } }]);
    await promise;
    const actual = JSON.parse(await configurationCache.read(cacheKey));
    assert.deepStrictEqual(actual, { "test.configurationDefaultsOverride": "newoverrideValue" });
  });
  test("configuration default overrides are removed from cache if there are no overrides", async () => {
    const testObject = disposables.add(new DefaultConfiguration(configurationCache, TestEnvironmentService, new NullLogService()));
    await testObject.initialize();
    const promise = Event.toPromise(testObject.onDidChangeConfiguration);
    configurationRegistry.registerConfiguration({
      "id": "test.configurationDefaultsOverride",
      "type": "object",
      "properties": {
        "test.configurationDefaultsOverride1": {
          "type": "string",
          "default": "defaultValue"
        }
      }
    });
    await promise;
    assert.deepStrictEqual(await configurationCache.read(cacheKey), "");
  });
});
//# sourceMappingURL=configuration.test.js.map
