var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as sinon from "sinon";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { IEncryptionService, KnownStorageProvider } from "../../../encryption/common/encryptionService.js";
import { NullLogService } from "../../../log/common/log.js";
import { BaseSecretStorageService } from "../../common/secrets.js";
import { InMemoryStorageService } from "../../../storage/common/storage.js";
class TestEncryptionService {
  static {
    __name(this, "TestEncryptionService");
  }
  _serviceBrand;
  encryptedPrefix = "encrypted+";
  // prefix to simulate encryption
  setUsePlainTextEncryption() {
    return Promise.resolve();
  }
  getKeyStorageProvider() {
    return Promise.resolve(KnownStorageProvider.basicText);
  }
  encrypt(value) {
    return Promise.resolve(this.encryptedPrefix + value);
  }
  decrypt(value) {
    return Promise.resolve(value.substring(this.encryptedPrefix.length));
  }
  isEncryptionAvailable() {
    return Promise.resolve(true);
  }
}
class TestNoEncryptionService {
  static {
    __name(this, "TestNoEncryptionService");
  }
  _serviceBrand;
  setUsePlainTextEncryption() {
    throw new Error("Method not implemented.");
  }
  getKeyStorageProvider() {
    throw new Error("Method not implemented.");
  }
  encrypt(value) {
    throw new Error("Method not implemented.");
  }
  decrypt(value) {
    throw new Error("Method not implemented.");
  }
  isEncryptionAvailable() {
    return Promise.resolve(false);
  }
}
suite("secrets", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  suite("BaseSecretStorageService useInMemoryStorage=true", () => {
    let service;
    let spyEncryptionService;
    let sandbox;
    setup(() => {
      sandbox = sinon.createSandbox();
      spyEncryptionService = sandbox.spy(new TestEncryptionService());
      service = store.add(new BaseSecretStorageService(
        true,
        store.add(new InMemoryStorageService()),
        spyEncryptionService,
        store.add(new NullLogService())
      ));
    });
    teardown(() => {
      sandbox.restore();
    });
    test("type", async () => {
      assert.strictEqual(service.type, "unknown");
      await service.set("my-secret", "my-secret-value");
      assert.strictEqual(service.type, "in-memory");
    });
    test("set and get", async () => {
      const key = "my-secret";
      const value = "my-secret-value";
      await service.set(key, value);
      const result = await service.get(key);
      assert.strictEqual(result, value);
      assert.strictEqual(spyEncryptionService.encrypt.callCount, 0);
      assert.strictEqual(spyEncryptionService.decrypt.callCount, 0);
    });
    test("delete", async () => {
      const key = "my-secret";
      const value = "my-secret-value";
      await service.set(key, value);
      await service.delete(key);
      const result = await service.get(key);
      assert.strictEqual(result, void 0);
    });
    test("onDidChangeSecret", async () => {
      const key = "my-secret";
      const value = "my-secret-value";
      let eventFired = false;
      store.add(service.onDidChangeSecret((changedKey) => {
        assert.strictEqual(changedKey, key);
        eventFired = true;
      }));
      await service.set(key, value);
      assert.strictEqual(eventFired, true);
    });
  });
  suite("BaseSecretStorageService useInMemoryStorage=false", () => {
    let service;
    let spyEncryptionService;
    let sandbox;
    setup(() => {
      sandbox = sinon.createSandbox();
      spyEncryptionService = sandbox.spy(new TestEncryptionService());
      service = store.add(
        new BaseSecretStorageService(
          false,
          store.add(new InMemoryStorageService()),
          spyEncryptionService,
          store.add(new NullLogService())
        )
      );
    });
    teardown(() => {
      sandbox.restore();
    });
    test("type", async () => {
      assert.strictEqual(service.type, "unknown");
      await service.set("my-secret", "my-secret-value");
      assert.strictEqual(service.type, "persisted");
    });
    test("set and get", async () => {
      const key = "my-secret";
      const value = "my-secret-value";
      await service.set(key, value);
      const result = await service.get(key);
      assert.strictEqual(result, value);
      assert.strictEqual(spyEncryptionService.encrypt.callCount, 1);
      assert.strictEqual(spyEncryptionService.decrypt.callCount, 1);
    });
    test("delete", async () => {
      const key = "my-secret";
      const value = "my-secret-value";
      await service.set(key, value);
      await service.delete(key);
      const result = await service.get(key);
      assert.strictEqual(result, void 0);
    });
    test("onDidChangeSecret", async () => {
      const key = "my-secret";
      const value = "my-secret-value";
      let eventFired = false;
      store.add(service.onDidChangeSecret((changedKey) => {
        assert.strictEqual(changedKey, key);
        eventFired = true;
      }));
      await service.set(key, value);
      assert.strictEqual(eventFired, true);
    });
  });
  suite("BaseSecretStorageService useInMemoryStorage=false, encryption not available", () => {
    let service;
    let spyNoEncryptionService;
    let sandbox;
    setup(() => {
      sandbox = sinon.createSandbox();
      spyNoEncryptionService = sandbox.spy(new TestNoEncryptionService());
      service = store.add(
        new BaseSecretStorageService(
          false,
          store.add(new InMemoryStorageService()),
          spyNoEncryptionService,
          store.add(new NullLogService())
        )
      );
    });
    teardown(() => {
      sandbox.restore();
    });
    test("type", async () => {
      assert.strictEqual(service.type, "unknown");
      await service.set("my-secret", "my-secret-value");
      assert.strictEqual(service.type, "in-memory");
    });
    test("set and get", async () => {
      const key = "my-secret";
      const value = "my-secret-value";
      await service.set(key, value);
      const result = await service.get(key);
      assert.strictEqual(result, value);
      assert.strictEqual(spyNoEncryptionService.encrypt.callCount, 0);
      assert.strictEqual(spyNoEncryptionService.decrypt.callCount, 0);
    });
  });
});
//# sourceMappingURL=secrets.test.js.map
