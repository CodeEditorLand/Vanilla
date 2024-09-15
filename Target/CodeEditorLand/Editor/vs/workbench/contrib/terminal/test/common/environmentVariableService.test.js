var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual } from "assert";
import { TestExtensionService, TestHistoryService, TestStorageService } from "../../../../test/common/workbenchTestServices.js";
import { EnvironmentVariableService } from "../../common/environmentVariableService.js";
import { EnvironmentVariableMutatorType, IEnvironmentVariableMutator } from "../../../../../platform/terminal/common/environmentVariable.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { Emitter } from "../../../../../base/common/event.js";
import { IProcessEnvironment } from "../../../../../base/common/platform.js";
import { IHistoryService } from "../../../../services/history/common/history.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
class TestEnvironmentVariableService extends EnvironmentVariableService {
  static {
    __name(this, "TestEnvironmentVariableService");
  }
  persistCollections() {
    this._persistCollections();
  }
  notifyCollectionUpdates() {
    this._notifyCollectionUpdates();
  }
}
suite("EnvironmentVariable - EnvironmentVariableService", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let environmentVariableService;
  let changeExtensionsEvent;
  setup(() => {
    changeExtensionsEvent = store.add(new Emitter());
    instantiationService = store.add(new TestInstantiationService());
    instantiationService.stub(IExtensionService, TestExtensionService);
    instantiationService.stub(IStorageService, store.add(new TestStorageService()));
    instantiationService.stub(IHistoryService, new TestHistoryService());
    instantiationService.stub(IExtensionService, TestExtensionService);
    instantiationService.stub(IExtensionService, "onDidChangeExtensions", changeExtensionsEvent.event);
    instantiationService.stub(IExtensionService, "extensions", [
      { identifier: { value: "ext1" } },
      { identifier: { value: "ext2" } },
      { identifier: { value: "ext3" } }
    ]);
    environmentVariableService = store.add(instantiationService.createInstance(TestEnvironmentVariableService));
  });
  test("should persist collections to the storage service and be able to restore from them", () => {
    const collection = /* @__PURE__ */ new Map();
    collection.set("A-key", { value: "a", type: EnvironmentVariableMutatorType.Replace, variable: "A" });
    collection.set("B-key", { value: "b", type: EnvironmentVariableMutatorType.Append, variable: "B" });
    collection.set("C-key", { value: "c", type: EnvironmentVariableMutatorType.Prepend, variable: "C", options: { applyAtProcessCreation: true, applyAtShellIntegration: true } });
    environmentVariableService.set("ext1", { map: collection, persistent: true });
    deepStrictEqual([...environmentVariableService.mergedCollection.getVariableMap(void 0).entries()], [
      ["A", [{ extensionIdentifier: "ext1", type: EnvironmentVariableMutatorType.Replace, value: "a", variable: "A", options: void 0 }]],
      ["B", [{ extensionIdentifier: "ext1", type: EnvironmentVariableMutatorType.Append, value: "b", variable: "B", options: void 0 }]],
      ["C", [{ extensionIdentifier: "ext1", type: EnvironmentVariableMutatorType.Prepend, value: "c", variable: "C", options: { applyAtProcessCreation: true, applyAtShellIntegration: true } }]]
    ]);
    environmentVariableService.persistCollections();
    const service2 = store.add(instantiationService.createInstance(TestEnvironmentVariableService));
    deepStrictEqual([...service2.mergedCollection.getVariableMap(void 0).entries()], [
      ["A", [{ extensionIdentifier: "ext1", type: EnvironmentVariableMutatorType.Replace, value: "a", variable: "A", options: void 0 }]],
      ["B", [{ extensionIdentifier: "ext1", type: EnvironmentVariableMutatorType.Append, value: "b", variable: "B", options: void 0 }]],
      ["C", [{ extensionIdentifier: "ext1", type: EnvironmentVariableMutatorType.Prepend, value: "c", variable: "C", options: { applyAtProcessCreation: true, applyAtShellIntegration: true } }]]
    ]);
  });
  suite("mergedCollection", () => {
    test("should overwrite any other variable with the first extension that replaces", () => {
      const collection1 = /* @__PURE__ */ new Map();
      const collection2 = /* @__PURE__ */ new Map();
      const collection3 = /* @__PURE__ */ new Map();
      collection1.set("A-key", { value: "a1", type: EnvironmentVariableMutatorType.Append, variable: "A" });
      collection1.set("B-key", { value: "b1", type: EnvironmentVariableMutatorType.Replace, variable: "B" });
      collection2.set("A-key", { value: "a2", type: EnvironmentVariableMutatorType.Replace, variable: "A" });
      collection2.set("B-key", { value: "b2", type: EnvironmentVariableMutatorType.Append, variable: "B" });
      collection3.set("A-key", { value: "a3", type: EnvironmentVariableMutatorType.Prepend, variable: "A" });
      collection3.set("B-key", { value: "b3", type: EnvironmentVariableMutatorType.Replace, variable: "B" });
      environmentVariableService.set("ext1", { map: collection1, persistent: true });
      environmentVariableService.set("ext2", { map: collection2, persistent: true });
      environmentVariableService.set("ext3", { map: collection3, persistent: true });
      deepStrictEqual([...environmentVariableService.mergedCollection.getVariableMap(void 0).entries()], [
        ["A", [
          { extensionIdentifier: "ext2", type: EnvironmentVariableMutatorType.Replace, value: "a2", variable: "A", options: void 0 },
          { extensionIdentifier: "ext1", type: EnvironmentVariableMutatorType.Append, value: "a1", variable: "A", options: void 0 }
        ]],
        ["B", [{ extensionIdentifier: "ext1", type: EnvironmentVariableMutatorType.Replace, value: "b1", variable: "B", options: void 0 }]]
      ]);
    });
    test("should correctly apply the environment values from multiple extension contributions in the correct order", async () => {
      const collection1 = /* @__PURE__ */ new Map();
      const collection2 = /* @__PURE__ */ new Map();
      const collection3 = /* @__PURE__ */ new Map();
      collection1.set("A-key", { value: ":a1", type: EnvironmentVariableMutatorType.Append, variable: "A" });
      collection2.set("A-key", { value: "a2:", type: EnvironmentVariableMutatorType.Prepend, variable: "A" });
      collection3.set("A-key", { value: "a3", type: EnvironmentVariableMutatorType.Replace, variable: "A" });
      environmentVariableService.set("ext1", { map: collection1, persistent: true });
      environmentVariableService.set("ext2", { map: collection2, persistent: true });
      environmentVariableService.set("ext3", { map: collection3, persistent: true });
      deepStrictEqual([...environmentVariableService.mergedCollection.getVariableMap(void 0).entries()], [
        ["A", [
          { extensionIdentifier: "ext3", type: EnvironmentVariableMutatorType.Replace, value: "a3", variable: "A", options: void 0 },
          { extensionIdentifier: "ext2", type: EnvironmentVariableMutatorType.Prepend, value: "a2:", variable: "A", options: void 0 },
          { extensionIdentifier: "ext1", type: EnvironmentVariableMutatorType.Append, value: ":a1", variable: "A", options: void 0 }
        ]]
      ]);
      const env = { A: "foo" };
      await environmentVariableService.mergedCollection.applyToProcessEnvironment(env, void 0);
      deepStrictEqual(env, { A: "a2:a3:a1" });
    });
    test("should correctly apply the workspace specific environment values from multiple extension contributions in the correct order", async () => {
      const scope1 = { workspaceFolder: { uri: URI.file("workspace1"), name: "workspace1", index: 0 } };
      const scope2 = { workspaceFolder: { uri: URI.file("workspace2"), name: "workspace2", index: 3 } };
      const collection1 = /* @__PURE__ */ new Map();
      const collection2 = /* @__PURE__ */ new Map();
      const collection3 = /* @__PURE__ */ new Map();
      collection1.set("A-key", { value: ":a1", type: EnvironmentVariableMutatorType.Append, scope: scope1, variable: "A" });
      collection2.set("A-key", { value: "a2:", type: EnvironmentVariableMutatorType.Prepend, variable: "A" });
      collection3.set("A-key", { value: "a3", type: EnvironmentVariableMutatorType.Replace, scope: scope2, variable: "A" });
      environmentVariableService.set("ext1", { map: collection1, persistent: true });
      environmentVariableService.set("ext2", { map: collection2, persistent: true });
      environmentVariableService.set("ext3", { map: collection3, persistent: true });
      deepStrictEqual([...environmentVariableService.mergedCollection.getVariableMap(scope1).entries()], [
        ["A", [
          { extensionIdentifier: "ext2", type: EnvironmentVariableMutatorType.Prepend, value: "a2:", variable: "A", options: void 0 },
          { extensionIdentifier: "ext1", type: EnvironmentVariableMutatorType.Append, value: ":a1", scope: scope1, variable: "A", options: void 0 }
        ]]
      ]);
      const env = { A: "foo" };
      await environmentVariableService.mergedCollection.applyToProcessEnvironment(env, scope1);
      deepStrictEqual(env, { A: "a2:foo:a1" });
    });
  });
});
//# sourceMappingURL=environmentVariableService.test.js.map
