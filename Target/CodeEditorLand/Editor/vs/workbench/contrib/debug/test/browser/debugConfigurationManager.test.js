var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { ContextKeyService } from "../../../../../platform/contextkey/browser/contextKeyService.js";
import { FileService } from "../../../../../platform/files/common/fileService.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import { ConfigurationManager } from "../../browser/debugConfigurationManager.js";
import { DebugConfigurationProviderTriggerKind, IAdapterManager, IConfig, IDebugAdapterExecutable, IDebugSession } from "../../common/debug.js";
import { IPreferencesService } from "../../../../services/preferences/common/preferences.js";
import { TestQuickInputService } from "../../../../test/browser/workbenchTestServices.js";
import { TestHistoryService, TestContextService, TestExtensionService, TestStorageService } from "../../../../test/common/workbenchTestServices.js";
suite("debugConfigurationManager", () => {
  const configurationProviderType = "custom-type";
  let _debugConfigurationManager;
  let disposables;
  const adapterManager = {
    getDebugAdapterDescriptor(session, config) {
      return Promise.resolve(void 0);
    },
    activateDebuggers(activationEvent, debugType) {
      return Promise.resolve();
    },
    get onDidDebuggersExtPointRead() {
      return Event.None;
    }
  };
  const preferencesService = {
    userSettingsResource: URI.file("/tmp/settings.json")
  };
  const configurationService = new TestConfigurationService();
  setup(() => {
    disposables = new DisposableStore();
    const fileService = disposables.add(new FileService(new NullLogService()));
    const instantiationService = disposables.add(new TestInstantiationService(new ServiceCollection([IPreferencesService, preferencesService], [IConfigurationService, configurationService])));
    _debugConfigurationManager = new ConfigurationManager(
      adapterManager,
      new TestContextService(),
      configurationService,
      new TestQuickInputService(),
      instantiationService,
      new TestStorageService(),
      new TestExtensionService(),
      new TestHistoryService(),
      new UriIdentityService(fileService),
      new ContextKeyService(configurationService),
      new NullLogService()
    );
  });
  teardown(() => disposables.dispose());
  ensureNoDisposablesAreLeakedInTestSuite();
  test("resolves configuration based on type", async () => {
    disposables.add(_debugConfigurationManager.registerDebugConfigurationProvider({
      type: configurationProviderType,
      resolveDebugConfiguration: /* @__PURE__ */ __name((folderUri, config, token) => {
        assert.strictEqual(config.type, configurationProviderType);
        return Promise.resolve({
          ...config,
          configurationResolved: true
        });
      }, "resolveDebugConfiguration"),
      triggerKind: DebugConfigurationProviderTriggerKind.Initial
    }));
    const initialConfig = {
      type: configurationProviderType,
      request: "launch",
      name: "configName"
    };
    const resultConfig = await _debugConfigurationManager.resolveConfigurationByProviders(void 0, configurationProviderType, initialConfig, CancellationToken.None);
    assert.strictEqual(resultConfig.configurationResolved, true, "Configuration should be updated by test provider");
  });
  test("resolves configuration from second provider if type changes", async () => {
    const secondProviderType = "second-provider";
    disposables.add(_debugConfigurationManager.registerDebugConfigurationProvider({
      type: configurationProviderType,
      resolveDebugConfiguration: /* @__PURE__ */ __name((folderUri, config, token) => {
        assert.strictEqual(config.type, configurationProviderType);
        return Promise.resolve({
          ...config,
          type: secondProviderType
        });
      }, "resolveDebugConfiguration"),
      triggerKind: DebugConfigurationProviderTriggerKind.Initial
    }));
    disposables.add(_debugConfigurationManager.registerDebugConfigurationProvider({
      type: secondProviderType,
      resolveDebugConfiguration: /* @__PURE__ */ __name((folderUri, config, token) => {
        assert.strictEqual(config.type, secondProviderType);
        return Promise.resolve({
          ...config,
          configurationResolved: true
        });
      }, "resolveDebugConfiguration"),
      triggerKind: DebugConfigurationProviderTriggerKind.Initial
    }));
    const initialConfig = {
      type: configurationProviderType,
      request: "launch",
      name: "configName"
    };
    const resultConfig = await _debugConfigurationManager.resolveConfigurationByProviders(void 0, configurationProviderType, initialConfig, CancellationToken.None);
    assert.strictEqual(resultConfig.type, secondProviderType);
    assert.strictEqual(resultConfig.configurationResolved, true, "Configuration should be updated by test provider");
  });
  teardown(() => disposables.clear());
});
//# sourceMappingURL=debugConfigurationManager.test.js.map
