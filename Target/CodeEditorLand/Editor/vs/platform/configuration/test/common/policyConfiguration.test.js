import assert from "assert";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Event } from "../../../../base/common/event.js";
import { deepClone } from "../../../../base/common/objects.js";
import { URI } from "../../../../base/common/uri.js";
import { runWithFakedTimers } from "../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { FileService } from "../../../files/common/fileService.js";
import { InMemoryFileSystemProvider } from "../../../files/common/inMemoryFilesystemProvider.js";
import { NullLogService } from "../../../log/common/log.js";
import { FilePolicyService } from "../../../policy/common/filePolicyService.js";
import { Registry } from "../../../registry/common/platform.js";
import {
  Extensions
} from "../../common/configurationRegistry.js";
import {
  DefaultConfiguration,
  PolicyConfiguration
} from "../../common/configurations.js";
suite("PolicyConfiguration", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  let testObject;
  let fileService;
  let policyService;
  const policyFile = URI.file("policyFile").with({ scheme: "vscode-tests" });
  const policyConfigurationNode = {
    id: "policyConfiguration",
    order: 1,
    title: "a",
    type: "object",
    properties: {
      "policy.settingA": {
        type: "string",
        default: "defaultValueA",
        policy: {
          name: "PolicySettingA",
          minimumVersion: "1.0.0"
        }
      },
      "policy.settingB": {
        type: "string",
        default: "defaultValueB",
        policy: {
          name: "PolicySettingB",
          minimumVersion: "1.0.0"
        }
      },
      "nonPolicy.setting": {
        type: "boolean",
        default: true
      }
    }
  };
  suiteSetup(
    () => Registry.as(
      Extensions.Configuration
    ).registerConfiguration(policyConfigurationNode)
  );
  suiteTeardown(
    () => Registry.as(
      Extensions.Configuration
    ).deregisterConfigurations([policyConfigurationNode])
  );
  setup(async () => {
    const defaultConfiguration = disposables.add(
      new DefaultConfiguration(new NullLogService())
    );
    await defaultConfiguration.initialize();
    fileService = disposables.add(new FileService(new NullLogService()));
    const diskFileSystemProvider = disposables.add(
      new InMemoryFileSystemProvider()
    );
    disposables.add(
      fileService.registerProvider(
        policyFile.scheme,
        diskFileSystemProvider
      )
    );
    policyService = disposables.add(
      new FilePolicyService(
        policyFile,
        fileService,
        new NullLogService()
      )
    );
    testObject = disposables.add(
      new PolicyConfiguration(
        defaultConfiguration,
        policyService,
        new NullLogService()
      )
    );
  });
  test("initialize: with policies", async () => {
    await fileService.writeFile(
      policyFile,
      VSBuffer.fromString(
        JSON.stringify({ PolicySettingA: "policyValueA" })
      )
    );
    await testObject.initialize();
    const acutal = testObject.configurationModel;
    assert.strictEqual(acutal.getValue("policy.settingA"), "policyValueA");
    assert.strictEqual(acutal.getValue("policy.settingB"), void 0);
    assert.strictEqual(acutal.getValue("nonPolicy.setting"), void 0);
    assert.deepStrictEqual(acutal.keys, ["policy.settingA"]);
    assert.deepStrictEqual(acutal.overrides, []);
  });
  test("initialize: no policies", async () => {
    await testObject.initialize();
    const acutal = testObject.configurationModel;
    assert.deepStrictEqual(acutal.keys, []);
    assert.deepStrictEqual(acutal.overrides, []);
    assert.strictEqual(acutal.getValue("policy.settingA"), void 0);
    assert.strictEqual(acutal.getValue("policy.settingB"), void 0);
    assert.strictEqual(acutal.getValue("nonPolicy.setting"), void 0);
  });
  test("initialize: with policies but not registered", async () => {
    await fileService.writeFile(
      policyFile,
      VSBuffer.fromString(
        JSON.stringify({
          PolicySettingA: "policyValueA",
          PolicySettingB: "policyValueB",
          PolicySettingC: "policyValueC"
        })
      )
    );
    await testObject.initialize();
    const acutal = testObject.configurationModel;
    assert.strictEqual(acutal.getValue("policy.settingA"), "policyValueA");
    assert.strictEqual(acutal.getValue("policy.settingB"), "policyValueB");
    assert.strictEqual(acutal.getValue("nonPolicy.setting"), void 0);
    assert.deepStrictEqual(acutal.keys, [
      "policy.settingA",
      "policy.settingB"
    ]);
    assert.deepStrictEqual(acutal.overrides, []);
  });
  test("change: when policy is added", async () => {
    await fileService.writeFile(
      policyFile,
      VSBuffer.fromString(
        JSON.stringify({ PolicySettingA: "policyValueA" })
      )
    );
    await testObject.initialize();
    await runWithFakedTimers({ useFakeTimers: true }, async () => {
      const promise = Event.toPromise(
        testObject.onDidChangeConfiguration
      );
      await fileService.writeFile(
        policyFile,
        VSBuffer.fromString(
          JSON.stringify({
            PolicySettingA: "policyValueA",
            PolicySettingB: "policyValueB",
            PolicySettingC: "policyValueC"
          })
        )
      );
      await promise;
    });
    const acutal = testObject.configurationModel;
    assert.strictEqual(acutal.getValue("policy.settingA"), "policyValueA");
    assert.strictEqual(acutal.getValue("policy.settingB"), "policyValueB");
    assert.strictEqual(acutal.getValue("nonPolicy.setting"), void 0);
    assert.deepStrictEqual(acutal.keys, [
      "policy.settingA",
      "policy.settingB"
    ]);
    assert.deepStrictEqual(acutal.overrides, []);
  });
  test("change: when policy is updated", async () => {
    await fileService.writeFile(
      policyFile,
      VSBuffer.fromString(
        JSON.stringify({ PolicySettingA: "policyValueA" })
      )
    );
    await testObject.initialize();
    await runWithFakedTimers({ useFakeTimers: true }, async () => {
      const promise = Event.toPromise(
        testObject.onDidChangeConfiguration
      );
      await fileService.writeFile(
        policyFile,
        VSBuffer.fromString(
          JSON.stringify({ PolicySettingA: "policyValueAChanged" })
        )
      );
      await promise;
    });
    const acutal = testObject.configurationModel;
    assert.strictEqual(
      acutal.getValue("policy.settingA"),
      "policyValueAChanged"
    );
    assert.strictEqual(acutal.getValue("policy.settingB"), void 0);
    assert.strictEqual(acutal.getValue("nonPolicy.setting"), void 0);
    assert.deepStrictEqual(acutal.keys, ["policy.settingA"]);
    assert.deepStrictEqual(acutal.overrides, []);
  });
  test("change: when policy is removed", async () => {
    await fileService.writeFile(
      policyFile,
      VSBuffer.fromString(
        JSON.stringify({ PolicySettingA: "policyValueA" })
      )
    );
    await testObject.initialize();
    await runWithFakedTimers({ useFakeTimers: true }, async () => {
      const promise = Event.toPromise(
        testObject.onDidChangeConfiguration
      );
      await fileService.writeFile(
        policyFile,
        VSBuffer.fromString(JSON.stringify({}))
      );
      await promise;
    });
    const acutal = testObject.configurationModel;
    assert.strictEqual(acutal.getValue("policy.settingA"), void 0);
    assert.strictEqual(acutal.getValue("policy.settingB"), void 0);
    assert.strictEqual(acutal.getValue("nonPolicy.setting"), void 0);
    assert.deepStrictEqual(acutal.keys, []);
    assert.deepStrictEqual(acutal.overrides, []);
  });
  test("change: when policy setting is registered", async () => {
    await fileService.writeFile(
      policyFile,
      VSBuffer.fromString(
        JSON.stringify({ PolicySettingC: "policyValueC" })
      )
    );
    await testObject.initialize();
    const promise = Event.toPromise(testObject.onDidChangeConfiguration);
    policyConfigurationNode.properties["policy.settingC"] = {
      type: "string",
      default: "defaultValueC",
      policy: {
        name: "PolicySettingC",
        minimumVersion: "1.0.0"
      }
    };
    Registry.as(
      Extensions.Configuration
    ).registerConfiguration(deepClone(policyConfigurationNode));
    await promise;
    const acutal = testObject.configurationModel;
    assert.strictEqual(acutal.getValue("policy.settingC"), "policyValueC");
    assert.strictEqual(acutal.getValue("policy.settingA"), void 0);
    assert.strictEqual(acutal.getValue("policy.settingB"), void 0);
    assert.strictEqual(acutal.getValue("nonPolicy.setting"), void 0);
    assert.deepStrictEqual(acutal.keys, ["policy.settingC"]);
    assert.deepStrictEqual(acutal.overrides, []);
  });
  test("change: when policy setting is deregistered", async () => {
    await fileService.writeFile(
      policyFile,
      VSBuffer.fromString(
        JSON.stringify({ PolicySettingA: "policyValueA" })
      )
    );
    await testObject.initialize();
    const promise = Event.toPromise(testObject.onDidChangeConfiguration);
    Registry.as(
      Extensions.Configuration
    ).deregisterConfigurations([policyConfigurationNode]);
    await promise;
    const acutal = testObject.configurationModel;
    assert.strictEqual(acutal.getValue("policy.settingA"), void 0);
    assert.strictEqual(acutal.getValue("policy.settingB"), void 0);
    assert.strictEqual(acutal.getValue("nonPolicy.setting"), void 0);
    assert.deepStrictEqual(acutal.keys, []);
    assert.deepStrictEqual(acutal.overrides, []);
  });
});
