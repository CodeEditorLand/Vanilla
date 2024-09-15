var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Emitter, Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { InMemoryStorageDatabase, IStorageItemsChangeEvent, IUpdateRequest, Storage } from "../../../../base/parts/storage/common/storage.js";
import { AbstractUserDataProfileStorageService, IUserDataProfileStorageService } from "../../common/userDataProfileStorageService.js";
import { InMemoryStorageService, loadKeyTargets, StorageTarget, TARGET_KEY } from "../../../storage/common/storage.js";
import { IUserDataProfile, toUserDataProfile } from "../../common/userDataProfile.js";
import { runWithFakedTimers } from "../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
class TestStorageDatabase extends InMemoryStorageDatabase {
  static {
    __name(this, "TestStorageDatabase");
  }
  _onDidChangeItemsExternal = new Emitter();
  onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
  async updateItems(request) {
    await super.updateItems(request);
    if (request.insert || request.delete) {
      this._onDidChangeItemsExternal.fire({ changed: request.insert, deleted: request.delete });
    }
  }
}
class TestUserDataProfileStorageService extends AbstractUserDataProfileStorageService {
  static {
    __name(this, "TestUserDataProfileStorageService");
  }
  onDidChange = Event.None;
  databases = /* @__PURE__ */ new Map();
  async createStorageDatabase(profile) {
    let database = this.databases.get(profile.id);
    if (!database) {
      this.databases.set(profile.id, database = new TestStorageDatabase());
    }
    return database;
  }
  setupStorageDatabase(profile) {
    return this.createStorageDatabase(profile);
  }
}
suite("ProfileStorageService", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  const profile = toUserDataProfile("test", "test", URI.file("foo"), URI.file("cache"));
  let testObject;
  let storage;
  setup(async () => {
    testObject = disposables.add(new TestUserDataProfileStorageService(false, disposables.add(new InMemoryStorageService())));
    storage = disposables.add(new Storage(await testObject.setupStorageDatabase(profile)));
    await storage.init();
  });
  test("read empty storage", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const actual = await testObject.readStorageData(profile);
    assert.strictEqual(actual.size, 0);
  }));
  test("read storage with data", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    storage.set("foo", "bar");
    storage.set(TARGET_KEY, JSON.stringify({ foo: StorageTarget.USER }));
    await storage.flush();
    const actual = await testObject.readStorageData(profile);
    assert.strictEqual(actual.size, 1);
    assert.deepStrictEqual(actual.get("foo"), { "value": "bar", "target": StorageTarget.USER });
  }));
  test("write in empty storage", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    const data = /* @__PURE__ */ new Map();
    data.set("foo", "bar");
    await testObject.updateStorageData(profile, data, StorageTarget.USER);
    assert.strictEqual(storage.items.size, 2);
    assert.deepStrictEqual(loadKeyTargets(storage), { foo: StorageTarget.USER });
    assert.strictEqual(storage.get("foo"), "bar");
  }));
  test("write in storage with data", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    storage.set("foo", "bar");
    storage.set(TARGET_KEY, JSON.stringify({ foo: StorageTarget.USER }));
    await storage.flush();
    const data = /* @__PURE__ */ new Map();
    data.set("abc", "xyz");
    await testObject.updateStorageData(profile, data, StorageTarget.MACHINE);
    assert.strictEqual(storage.items.size, 3);
    assert.deepStrictEqual(loadKeyTargets(storage), { foo: StorageTarget.USER, abc: StorageTarget.MACHINE });
    assert.strictEqual(storage.get("foo"), "bar");
    assert.strictEqual(storage.get("abc"), "xyz");
  }));
  test("write in storage with data (insert, update, remove)", () => runWithFakedTimers({ useFakeTimers: true }, async () => {
    storage.set("foo", "bar");
    storage.set("abc", "xyz");
    storage.set(TARGET_KEY, JSON.stringify({ foo: StorageTarget.USER, abc: StorageTarget.MACHINE }));
    await storage.flush();
    const data = /* @__PURE__ */ new Map();
    data.set("foo", void 0);
    data.set("abc", "def");
    data.set("var", "const");
    await testObject.updateStorageData(profile, data, StorageTarget.USER);
    assert.strictEqual(storage.items.size, 3);
    assert.deepStrictEqual(loadKeyTargets(storage), { abc: StorageTarget.USER, var: StorageTarget.USER });
    assert.strictEqual(storage.get("abc"), "def");
    assert.strictEqual(storage.get("var"), "const");
  }));
});
export {
  TestUserDataProfileStorageService
};
//# sourceMappingURL=userDataProfileStorageService.test.js.map
