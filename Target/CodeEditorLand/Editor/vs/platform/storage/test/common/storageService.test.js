var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual, ok, strictEqual } from "assert";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { InMemoryStorageService, IStorageService, IStorageTargetChangeEvent, IStorageValueChangeEvent, StorageScope, StorageTarget } from "../../common/storage.js";
function createSuite(params) {
  let storageService;
  const disposables = new DisposableStore();
  setup(async () => {
    storageService = await params.setup();
  });
  teardown(() => {
    disposables.clear();
    return params.teardown(storageService);
  });
  test("Get Data, Integer, Boolean (application)", () => {
    storeData(StorageScope.APPLICATION);
  });
  test("Get Data, Integer, Boolean (profile)", () => {
    storeData(StorageScope.PROFILE);
  });
  test("Get Data, Integer, Boolean, Object (workspace)", () => {
    storeData(StorageScope.WORKSPACE);
  });
  test("Storage change source", () => {
    const storageValueChangeEvents = [];
    storageService.onDidChangeValue(StorageScope.WORKSPACE, void 0, disposables)((e) => storageValueChangeEvents.push(e), void 0, disposables);
    storageService.storeAll([{ key: "testExternalChange", value: "foobar", scope: StorageScope.WORKSPACE, target: StorageTarget.MACHINE }], true);
    let storageValueChangeEvent = storageValueChangeEvents.find((e) => e.key === "testExternalChange");
    strictEqual(storageValueChangeEvent?.external, true);
    storageService.storeAll([{ key: "testChange", value: "barfoo", scope: StorageScope.WORKSPACE, target: StorageTarget.MACHINE }], false);
    storageValueChangeEvent = storageValueChangeEvents.find((e) => e.key === "testChange");
    strictEqual(storageValueChangeEvent?.external, false);
    storageService.store("testChange", "foobar", StorageScope.WORKSPACE, StorageTarget.MACHINE);
    storageValueChangeEvent = storageValueChangeEvents.find((e) => e.key === "testChange");
    strictEqual(storageValueChangeEvent?.external, false);
  });
  test("Storage change event scope (all keys)", () => {
    const storageValueChangeEvents = [];
    storageService.onDidChangeValue(StorageScope.WORKSPACE, void 0, disposables)((e) => storageValueChangeEvents.push(e), void 0, disposables);
    storageService.store("testChange", "foobar", StorageScope.WORKSPACE, StorageTarget.MACHINE);
    storageService.store("testChange2", "foobar", StorageScope.WORKSPACE, StorageTarget.MACHINE);
    storageService.store("testChange", "foobar", StorageScope.APPLICATION, StorageTarget.MACHINE);
    storageService.store("testChange", "foobar", StorageScope.PROFILE, StorageTarget.MACHINE);
    storageService.store("testChange2", "foobar", StorageScope.PROFILE, StorageTarget.MACHINE);
    strictEqual(storageValueChangeEvents.length, 2);
  });
  test("Storage change event scope (specific key)", () => {
    const storageValueChangeEvents = [];
    storageService.onDidChangeValue(StorageScope.WORKSPACE, "testChange", disposables)((e) => storageValueChangeEvents.push(e), void 0, disposables);
    storageService.store("testChange", "foobar", StorageScope.WORKSPACE, StorageTarget.MACHINE);
    storageService.store("testChange", "foobar", StorageScope.PROFILE, StorageTarget.USER);
    storageService.store("testChange", "foobar", StorageScope.APPLICATION, StorageTarget.MACHINE);
    storageService.store("testChange2", "foobar", StorageScope.WORKSPACE, StorageTarget.MACHINE);
    const storageValueChangeEvent = storageValueChangeEvents.find((e) => e.key === "testChange");
    ok(storageValueChangeEvent);
    strictEqual(storageValueChangeEvents.length, 1);
  });
  function storeData(scope) {
    let storageValueChangeEvents = [];
    storageService.onDidChangeValue(scope, void 0, disposables)((e) => storageValueChangeEvents.push(e), void 0, disposables);
    strictEqual(storageService.get("test.get", scope, "foobar"), "foobar");
    strictEqual(storageService.get("test.get", scope, ""), "");
    strictEqual(storageService.getNumber("test.getNumber", scope, 5), 5);
    strictEqual(storageService.getNumber("test.getNumber", scope, 0), 0);
    strictEqual(storageService.getBoolean("test.getBoolean", scope, true), true);
    strictEqual(storageService.getBoolean("test.getBoolean", scope, false), false);
    deepStrictEqual(storageService.getObject("test.getObject", scope, { "foo": "bar" }), { "foo": "bar" });
    deepStrictEqual(storageService.getObject("test.getObject", scope, {}), {});
    deepStrictEqual(storageService.getObject("test.getObject", scope, []), []);
    storageService.store("test.get", "foobar", scope, StorageTarget.MACHINE);
    strictEqual(storageService.get("test.get", scope, void 0), "foobar");
    let storageValueChangeEvent = storageValueChangeEvents.find((e) => e.key === "test.get");
    strictEqual(storageValueChangeEvent?.scope, scope);
    strictEqual(storageValueChangeEvent?.key, "test.get");
    storageValueChangeEvents = [];
    storageService.store("test.get", "", scope, StorageTarget.MACHINE);
    strictEqual(storageService.get("test.get", scope, void 0), "");
    storageValueChangeEvent = storageValueChangeEvents.find((e) => e.key === "test.get");
    strictEqual(storageValueChangeEvent.scope, scope);
    strictEqual(storageValueChangeEvent.key, "test.get");
    storageService.store("test.getNumber", 5, scope, StorageTarget.MACHINE);
    strictEqual(storageService.getNumber("test.getNumber", scope, void 0), 5);
    storageService.store("test.getNumber", 0, scope, StorageTarget.MACHINE);
    strictEqual(storageService.getNumber("test.getNumber", scope, void 0), 0);
    storageService.store("test.getBoolean", true, scope, StorageTarget.MACHINE);
    strictEqual(storageService.getBoolean("test.getBoolean", scope, void 0), true);
    storageService.store("test.getBoolean", false, scope, StorageTarget.MACHINE);
    strictEqual(storageService.getBoolean("test.getBoolean", scope, void 0), false);
    storageService.store("test.getObject", {}, scope, StorageTarget.MACHINE);
    deepStrictEqual(storageService.getObject("test.getObject", scope, void 0), {});
    storageService.store("test.getObject", [42], scope, StorageTarget.MACHINE);
    deepStrictEqual(storageService.getObject("test.getObject", scope, void 0), [42]);
    storageService.store("test.getObject", { "foo": {} }, scope, StorageTarget.MACHINE);
    deepStrictEqual(storageService.getObject("test.getObject", scope, void 0), { "foo": {} });
    strictEqual(storageService.get("test.getDefault", scope, "getDefault"), "getDefault");
    strictEqual(storageService.getNumber("test.getNumberDefault", scope, 5), 5);
    strictEqual(storageService.getBoolean("test.getBooleanDefault", scope, true), true);
    deepStrictEqual(storageService.getObject("test.getObjectDefault", scope, { "foo": 42 }), { "foo": 42 });
    storageService.storeAll([
      { key: "test.storeAll1", value: "foobar", scope, target: StorageTarget.MACHINE },
      { key: "test.storeAll2", value: 4, scope, target: StorageTarget.MACHINE },
      { key: "test.storeAll3", value: null, scope, target: StorageTarget.MACHINE }
    ], false);
    strictEqual(storageService.get("test.storeAll1", scope, "foobar"), "foobar");
    strictEqual(storageService.get("test.storeAll2", scope, "4"), "4");
    strictEqual(storageService.get("test.storeAll3", scope, "null"), "null");
  }
  __name(storeData, "storeData");
  test("Remove Data (application)", () => {
    removeData(StorageScope.APPLICATION);
  });
  test("Remove Data (profile)", () => {
    removeData(StorageScope.PROFILE);
  });
  test("Remove Data (workspace)", () => {
    removeData(StorageScope.WORKSPACE);
  });
  function removeData(scope) {
    const storageValueChangeEvents = [];
    storageService.onDidChangeValue(scope, void 0, disposables)((e) => storageValueChangeEvents.push(e), void 0, disposables);
    storageService.store("test.remove", "foobar", scope, StorageTarget.MACHINE);
    strictEqual("foobar", storageService.get("test.remove", scope, void 0));
    storageService.remove("test.remove", scope);
    ok(!storageService.get("test.remove", scope, void 0));
    const storageValueChangeEvent = storageValueChangeEvents.find((e) => e.key === "test.remove");
    strictEqual(storageValueChangeEvent?.scope, scope);
    strictEqual(storageValueChangeEvent?.key, "test.remove");
  }
  __name(removeData, "removeData");
  test("Keys (in-memory)", () => {
    let storageTargetEvent = void 0;
    storageService.onDidChangeTarget((e) => storageTargetEvent = e, void 0, disposables);
    for (const scope of [StorageScope.WORKSPACE, StorageScope.PROFILE, StorageScope.APPLICATION]) {
      for (const target of [StorageTarget.MACHINE, StorageTarget.USER]) {
        strictEqual(storageService.keys(scope, target).length, 0);
      }
    }
    let storageValueChangeEvent = void 0;
    for (const scope of [StorageScope.WORKSPACE, StorageScope.PROFILE, StorageScope.APPLICATION]) {
      storageService.onDidChangeValue(scope, void 0, disposables)((e) => storageValueChangeEvent = e, void 0, disposables);
      for (const target of [StorageTarget.MACHINE, StorageTarget.USER]) {
        storageTargetEvent = /* @__PURE__ */ Object.create(null);
        storageValueChangeEvent = /* @__PURE__ */ Object.create(null);
        storageService.store("test.target1", "value1", scope, target);
        strictEqual(storageService.keys(scope, target).length, 1);
        strictEqual(storageTargetEvent?.scope, scope);
        strictEqual(storageValueChangeEvent?.key, "test.target1");
        strictEqual(storageValueChangeEvent?.scope, scope);
        strictEqual(storageValueChangeEvent?.target, target);
        storageTargetEvent = void 0;
        storageValueChangeEvent = /* @__PURE__ */ Object.create(null);
        storageService.store("test.target1", "otherValue1", scope, target);
        strictEqual(storageService.keys(scope, target).length, 1);
        strictEqual(storageTargetEvent, void 0);
        strictEqual(storageValueChangeEvent?.key, "test.target1");
        strictEqual(storageValueChangeEvent?.scope, scope);
        strictEqual(storageValueChangeEvent?.target, target);
        storageService.store("test.target2", "value2", scope, target);
        storageService.store("test.target3", "value3", scope, target);
        strictEqual(storageService.keys(scope, target).length, 3);
      }
    }
    for (const scope of [StorageScope.WORKSPACE, StorageScope.PROFILE, StorageScope.APPLICATION]) {
      for (const target of [StorageTarget.MACHINE, StorageTarget.USER]) {
        const keysLength = storageService.keys(scope, target).length;
        storageService.store("test.target4", "value1", scope, target);
        strictEqual(storageService.keys(scope, target).length, keysLength + 1);
        storageTargetEvent = /* @__PURE__ */ Object.create(null);
        storageValueChangeEvent = /* @__PURE__ */ Object.create(null);
        storageService.remove("test.target4", scope);
        strictEqual(storageService.keys(scope, target).length, keysLength);
        strictEqual(storageTargetEvent?.scope, scope);
        strictEqual(storageValueChangeEvent?.key, "test.target4");
        strictEqual(storageValueChangeEvent?.scope, scope);
      }
    }
    for (const scope of [StorageScope.WORKSPACE, StorageScope.PROFILE, StorageScope.APPLICATION]) {
      for (const target of [StorageTarget.MACHINE, StorageTarget.USER]) {
        const keys = storageService.keys(scope, target);
        for (const key of keys) {
          storageService.remove(key, scope);
        }
        strictEqual(storageService.keys(scope, target).length, 0);
      }
    }
    for (const scope of [StorageScope.WORKSPACE, StorageScope.PROFILE, StorageScope.APPLICATION]) {
      for (const target of [StorageTarget.MACHINE, StorageTarget.USER]) {
        storageService.store("test.target1", "value1", scope, target);
        strictEqual(storageService.keys(scope, target).length, 1);
        storageTargetEvent = /* @__PURE__ */ Object.create(null);
        storageService.store("test.target1", void 0, scope, target);
        strictEqual(storageService.keys(scope, target).length, 0);
        strictEqual(storageTargetEvent?.scope, scope);
        storageService.store("test.target1", "", scope, target);
        strictEqual(storageService.keys(scope, target).length, 1);
        storageService.store("test.target1", null, scope, target);
        strictEqual(storageService.keys(scope, target).length, 0);
      }
    }
    for (const scope of [StorageScope.WORKSPACE, StorageScope.PROFILE, StorageScope.APPLICATION]) {
      storageTargetEvent = void 0;
      storageService.store("test.target5", "value1", scope, StorageTarget.MACHINE);
      ok(storageTargetEvent);
      storageTargetEvent = void 0;
      storageService.store("test.target5", "value1", scope, StorageTarget.USER);
      ok(storageTargetEvent);
      storageTargetEvent = void 0;
      storageService.store("test.target5", "value1", scope, StorageTarget.MACHINE);
      ok(storageTargetEvent);
      storageTargetEvent = void 0;
      storageService.store("test.target5", "value1", scope, StorageTarget.MACHINE);
      ok(!storageTargetEvent);
    }
  });
}
__name(createSuite, "createSuite");
suite("StorageService (in-memory)", function() {
  const disposables = new DisposableStore();
  teardown(() => {
    disposables.clear();
  });
  createSuite({
    setup: /* @__PURE__ */ __name(async () => disposables.add(new InMemoryStorageService()), "setup"),
    teardown: /* @__PURE__ */ __name(async () => {
    }, "teardown")
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
export {
  createSuite
};
//# sourceMappingURL=storageService.test.js.map
