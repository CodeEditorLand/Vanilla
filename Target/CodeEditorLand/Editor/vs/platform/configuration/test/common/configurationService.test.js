import assert from "assert";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Event } from "../../../../base/common/event.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { runWithFakedTimers } from "../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { FileService } from "../../../files/common/fileService.js";
import { InMemoryFileSystemProvider } from "../../../files/common/inMemoryFilesystemProvider.js";
import { NullLogService } from "../../../log/common/log.js";
import { FilePolicyService } from "../../../policy/common/filePolicyService.js";
import { NullPolicyService } from "../../../policy/common/policy.js";
import { Registry } from "../../../registry/common/platform.js";
import {
  ConfigurationTarget,
  isConfigured
} from "../../common/configuration.js";
import {
  Extensions as ConfigurationExtensions
} from "../../common/configurationRegistry.js";
import { ConfigurationService } from "../../common/configurationService.js";
suite("ConfigurationService.test.ts", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  let fileService;
  let settingsResource;
  setup(async () => {
    fileService = disposables.add(new FileService(new NullLogService()));
    const diskFileSystemProvider = disposables.add(
      new InMemoryFileSystemProvider()
    );
    disposables.add(
      fileService.registerProvider(Schemas.file, diskFileSystemProvider)
    );
    settingsResource = URI.file("settings.json");
  });
  test("simple", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await fileService.writeFile(
      settingsResource,
      VSBuffer.fromString('{ "foo": "bar" }')
    );
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    const config = testObject.getValue();
    assert.ok(config);
    assert.strictEqual(config.foo, "bar");
  }));
  test("config gets flattened", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await fileService.writeFile(
      settingsResource,
      VSBuffer.fromString('{ "testworkbench.editor.tabs": true }')
    );
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    const config = testObject.getValue();
    assert.ok(config);
    assert.ok(config.testworkbench);
    assert.ok(config.testworkbench.editor);
    assert.strictEqual(config.testworkbench.editor.tabs, true);
  }));
  test("error case does not explode", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await fileService.writeFile(
      settingsResource,
      VSBuffer.fromString(",,,,")
    );
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    const config = testObject.getValue();
    assert.ok(config);
  }));
  test("missing file does not explode", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const testObject = disposables.add(
      new ConfigurationService(
        URI.file("__testFile"),
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    const config = testObject.getValue();
    assert.ok(config);
  }));
  test("trigger configuration change event when file does not exist", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    return new Promise((c, e) => {
      disposables.add(
        Event.filter(
          testObject.onDidChangeConfiguration,
          (e2) => e2.source === ConfigurationTarget.USER
        )(() => {
          assert.strictEqual(testObject.getValue("foo"), "bar");
          c();
        })
      );
      fileService.writeFile(
        settingsResource,
        VSBuffer.fromString('{ "foo": "bar" }')
      ).catch(e);
    });
  }));
  test("trigger configuration change event when file exists", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await fileService.writeFile(
      settingsResource,
      VSBuffer.fromString('{ "foo": "bar" }')
    );
    await testObject.initialize();
    return new Promise((c) => {
      disposables.add(
        Event.filter(
          testObject.onDidChangeConfiguration,
          (e) => e.source === ConfigurationTarget.USER
        )(async (e) => {
          assert.strictEqual(testObject.getValue("foo"), "barz");
          c();
        })
      );
      fileService.writeFile(
        settingsResource,
        VSBuffer.fromString('{ "foo": "barz" }')
      );
    });
  }));
  test("reloadConfiguration", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    await fileService.writeFile(
      settingsResource,
      VSBuffer.fromString('{ "foo": "bar" }')
    );
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    let config = testObject.getValue();
    assert.ok(config);
    assert.strictEqual(config.foo, "bar");
    await fileService.writeFile(
      settingsResource,
      VSBuffer.fromString('{ "foo": "changed" }')
    );
    await testObject.reloadConfiguration();
    config = testObject.getValue();
    assert.ok(config);
    assert.strictEqual(config.foo, "changed");
  }));
  test("model defaults", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const configurationRegistry = Registry.as(
      ConfigurationExtensions.Configuration
    );
    configurationRegistry.registerConfiguration({
      id: "_test",
      type: "object",
      properties: {
        "configuration.service.testSetting": {
          type: "string",
          default: "isSet"
        }
      }
    });
    let testObject = disposables.add(
      new ConfigurationService(
        URI.file("__testFile"),
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    let setting = testObject.getValue();
    assert.ok(setting);
    assert.strictEqual(
      setting.configuration.service.testSetting,
      "isSet"
    );
    await fileService.writeFile(
      settingsResource,
      VSBuffer.fromString('{ "testworkbench.editor.tabs": true }')
    );
    testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    setting = testObject.getValue();
    assert.ok(setting);
    assert.strictEqual(
      setting.configuration.service.testSetting,
      "isSet"
    );
    await fileService.writeFile(
      settingsResource,
      VSBuffer.fromString(
        '{ "configuration.service.testSetting": "isChanged" }'
      )
    );
    await testObject.reloadConfiguration();
    setting = testObject.getValue();
    assert.ok(setting);
    assert.strictEqual(
      setting.configuration.service.testSetting,
      "isChanged"
    );
  }));
  test("lookup", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const configurationRegistry = Registry.as(
      ConfigurationExtensions.Configuration
    );
    configurationRegistry.registerConfiguration({
      id: "_test",
      type: "object",
      properties: {
        "lookup.service.testSetting": {
          type: "string",
          default: "isSet"
        }
      }
    });
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    let res = testObject.inspect("something.missing");
    assert.strictEqual(res.value, void 0);
    assert.strictEqual(res.defaultValue, void 0);
    assert.strictEqual(res.userValue, void 0);
    assert.strictEqual(isConfigured(res), false);
    res = testObject.inspect("lookup.service.testSetting");
    assert.strictEqual(res.defaultValue, "isSet");
    assert.strictEqual(res.value, "isSet");
    assert.strictEqual(res.userValue, void 0);
    assert.strictEqual(isConfigured(res), false);
    await fileService.writeFile(
      settingsResource,
      VSBuffer.fromString('{ "lookup.service.testSetting": "bar" }')
    );
    await testObject.reloadConfiguration();
    res = testObject.inspect("lookup.service.testSetting");
    assert.strictEqual(res.defaultValue, "isSet");
    assert.strictEqual(res.userValue, "bar");
    assert.strictEqual(res.value, "bar");
    assert.strictEqual(isConfigured(res), true);
  }));
  test("lookup with null", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const configurationRegistry = Registry.as(
      ConfigurationExtensions.Configuration
    );
    configurationRegistry.registerConfiguration({
      id: "_testNull",
      type: "object",
      properties: {
        "lookup.service.testNullSetting": {
          type: "null"
        }
      }
    });
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    let res = testObject.inspect("lookup.service.testNullSetting");
    assert.strictEqual(res.defaultValue, null);
    assert.strictEqual(res.value, null);
    assert.strictEqual(res.userValue, void 0);
    await fileService.writeFile(
      settingsResource,
      VSBuffer.fromString(
        '{ "lookup.service.testNullSetting": null }'
      )
    );
    await testObject.reloadConfiguration();
    res = testObject.inspect("lookup.service.testNullSetting");
    assert.strictEqual(res.defaultValue, null);
    assert.strictEqual(res.value, null);
    assert.strictEqual(res.userValue, null);
  }));
  test("update configuration", async () => {
    const configurationRegistry = Registry.as(
      ConfigurationExtensions.Configuration
    );
    configurationRegistry.registerConfiguration({
      id: "_test",
      type: "object",
      properties: {
        "configurationService.testSetting": {
          type: "string",
          default: "isSet"
        }
      }
    });
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    await testObject.updateValue(
      "configurationService.testSetting",
      "value"
    );
    assert.strictEqual(
      testObject.getValue("configurationService.testSetting"),
      "value"
    );
  });
  test("update configuration when exist", async () => {
    const configurationRegistry = Registry.as(
      ConfigurationExtensions.Configuration
    );
    configurationRegistry.registerConfiguration({
      id: "_test",
      type: "object",
      properties: {
        "configurationService.testSetting": {
          type: "string",
          default: "isSet"
        }
      }
    });
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    await testObject.updateValue(
      "configurationService.testSetting",
      "value"
    );
    await testObject.updateValue(
      "configurationService.testSetting",
      "updatedValue"
    );
    assert.strictEqual(
      testObject.getValue("configurationService.testSetting"),
      "updatedValue"
    );
  });
  test("update configuration to default value should remove", async () => {
    const configurationRegistry = Registry.as(
      ConfigurationExtensions.Configuration
    );
    configurationRegistry.registerConfiguration({
      id: "_test",
      type: "object",
      properties: {
        "configurationService.testSetting": {
          type: "string",
          default: "isSet"
        }
      }
    });
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    await testObject.updateValue(
      "configurationService.testSetting",
      "value"
    );
    await testObject.updateValue(
      "configurationService.testSetting",
      "isSet"
    );
    const inspect = testObject.inspect("configurationService.testSetting");
    assert.strictEqual(inspect.userValue, void 0);
  });
  test("update configuration should remove when undefined is passed", async () => {
    const configurationRegistry = Registry.as(
      ConfigurationExtensions.Configuration
    );
    configurationRegistry.registerConfiguration({
      id: "_test",
      type: "object",
      properties: {
        "configurationService.testSetting": {
          type: "string",
          default: "isSet"
        }
      }
    });
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    await testObject.updateValue(
      "configurationService.testSetting",
      "value"
    );
    await testObject.updateValue(
      "configurationService.testSetting",
      void 0
    );
    const inspect = testObject.inspect("configurationService.testSetting");
    assert.strictEqual(inspect.userValue, void 0);
  });
  test("update unknown configuration", async () => {
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    await testObject.updateValue(
      "configurationService.unknownSetting",
      "value"
    );
    assert.strictEqual(
      testObject.getValue("configurationService.unknownSetting"),
      "value"
    );
  });
  test("update configuration in non user target throws error", async () => {
    const configurationRegistry = Registry.as(
      ConfigurationExtensions.Configuration
    );
    configurationRegistry.registerConfiguration({
      id: "_test",
      type: "object",
      properties: {
        "configurationService.testSetting": {
          type: "string",
          default: "isSet"
        }
      }
    });
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        new NullPolicyService(),
        new NullLogService()
      )
    );
    await testObject.initialize();
    try {
      await testObject.updateValue(
        "configurationService.testSetting",
        "value",
        ConfigurationTarget.WORKSPACE
      );
      assert.fail("Should fail with error");
    } catch (e) {
    }
  });
  test("update configuration throws error for policy setting", async () => {
    const configurationRegistry = Registry.as(
      ConfigurationExtensions.Configuration
    );
    configurationRegistry.registerConfiguration({
      id: "_test",
      type: "object",
      properties: {
        "configurationService.policySetting": {
          type: "string",
          default: "isSet",
          policy: {
            name: "configurationService.policySetting",
            minimumVersion: "1.0.0"
          }
        }
      }
    });
    const logService = new NullLogService();
    const policyFile = URI.file("policies.json");
    await fileService.writeFile(
      policyFile,
      VSBuffer.fromString(
        '{ "configurationService.policySetting": "policyValue" }'
      )
    );
    const policyService = disposables.add(
      new FilePolicyService(policyFile, fileService, logService)
    );
    const testObject = disposables.add(
      new ConfigurationService(
        settingsResource,
        fileService,
        policyService,
        logService
      )
    );
    await testObject.initialize();
    try {
      await testObject.updateValue(
        "configurationService.policySetting",
        "value"
      );
      assert.fail("Should throw error");
    } catch (error) {
    }
  });
});
