var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { dirname, isEqual, joinPath } from "../../../../base/common/resources.js";
import { ReadableStreamEvents } from "../../../../base/common/stream.js";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { IEnvironmentService } from "../../../environment/common/environment.js";
import { AbstractNativeEnvironmentService } from "../../../environment/common/environmentService.js";
import { FileService } from "../../../files/common/fileService.js";
import { FileChangeType, FileSystemProviderCapabilities, FileType, IFileChange, IFileOpenOptions, IFileReadStreamOptions, IFileService, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IStat } from "../../../files/common/files.js";
import { InMemoryFileSystemProvider } from "../../../files/common/inMemoryFilesystemProvider.js";
import { NullLogService } from "../../../log/common/log.js";
import product from "../../../product/common/product.js";
import { UriIdentityService } from "../../../uriIdentity/common/uriIdentityService.js";
import { FileUserDataProvider } from "../../common/fileUserDataProvider.js";
import { IUserDataProfilesService, UserDataProfilesService } from "../../../userDataProfile/common/userDataProfile.js";
const ROOT = URI.file("tests").with({ scheme: "vscode-tests" });
class TestEnvironmentService extends AbstractNativeEnvironmentService {
  constructor(_appSettingsHome) {
    super(/* @__PURE__ */ Object.create(null), /* @__PURE__ */ Object.create(null), { _serviceBrand: void 0, ...product });
    this._appSettingsHome = _appSettingsHome;
  }
  static {
    __name(this, "TestEnvironmentService");
  }
  get userRoamingDataHome() {
    return this._appSettingsHome.with({ scheme: Schemas.vscodeUserData });
  }
  get cacheHome() {
    return this.userRoamingDataHome;
  }
}
suite("FileUserDataProvider", () => {
  let testObject;
  let userDataHomeOnDisk;
  let backupWorkspaceHomeOnDisk;
  let environmentService;
  let userDataProfilesService;
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  let fileUserDataProvider;
  setup(async () => {
    const logService = new NullLogService();
    testObject = disposables.add(new FileService(logService));
    const fileSystemProvider = disposables.add(new InMemoryFileSystemProvider());
    disposables.add(testObject.registerProvider(ROOT.scheme, fileSystemProvider));
    userDataHomeOnDisk = joinPath(ROOT, "User");
    const backupHome = joinPath(ROOT, "Backups");
    backupWorkspaceHomeOnDisk = joinPath(backupHome, "workspaceId");
    await testObject.createFolder(userDataHomeOnDisk);
    await testObject.createFolder(backupWorkspaceHomeOnDisk);
    environmentService = new TestEnvironmentService(userDataHomeOnDisk);
    const uriIdentityService = disposables.add(new UriIdentityService(testObject));
    userDataProfilesService = disposables.add(new UserDataProfilesService(environmentService, testObject, uriIdentityService, logService));
    fileUserDataProvider = disposables.add(new FileUserDataProvider(ROOT.scheme, fileSystemProvider, Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
    disposables.add(fileUserDataProvider);
    disposables.add(testObject.registerProvider(Schemas.vscodeUserData, fileUserDataProvider));
  });
  test("exists return false when file does not exist", async () => {
    const exists = await testObject.exists(userDataProfilesService.defaultProfile.settingsResource);
    assert.strictEqual(exists, false);
  });
  test("read file throws error if not exist", async () => {
    try {
      await testObject.readFile(userDataProfilesService.defaultProfile.settingsResource);
      assert.fail("Should fail since file does not exist");
    } catch (e) {
    }
  });
  test("read existing file", async () => {
    await testObject.writeFile(joinPath(userDataHomeOnDisk, "settings.json"), VSBuffer.fromString("{}"));
    const result = await testObject.readFile(userDataProfilesService.defaultProfile.settingsResource);
    assert.strictEqual(result.value.toString(), "{}");
  });
  test("create file", async () => {
    const resource = userDataProfilesService.defaultProfile.settingsResource;
    const actual1 = await testObject.createFile(resource, VSBuffer.fromString("{}"));
    assert.strictEqual(actual1.resource.toString(), resource.toString());
    const actual2 = await testObject.readFile(joinPath(userDataHomeOnDisk, "settings.json"));
    assert.strictEqual(actual2.value.toString(), "{}");
  });
  test("write file creates the file if not exist", async () => {
    const resource = userDataProfilesService.defaultProfile.settingsResource;
    const actual1 = await testObject.writeFile(resource, VSBuffer.fromString("{}"));
    assert.strictEqual(actual1.resource.toString(), resource.toString());
    const actual2 = await testObject.readFile(joinPath(userDataHomeOnDisk, "settings.json"));
    assert.strictEqual(actual2.value.toString(), "{}");
  });
  test("write to existing file", async () => {
    const resource = userDataProfilesService.defaultProfile.settingsResource;
    await testObject.writeFile(joinPath(userDataHomeOnDisk, "settings.json"), VSBuffer.fromString("{}"));
    const actual1 = await testObject.writeFile(resource, VSBuffer.fromString("{a:1}"));
    assert.strictEqual(actual1.resource.toString(), resource.toString());
    const actual2 = await testObject.readFile(joinPath(userDataHomeOnDisk, "settings.json"));
    assert.strictEqual(actual2.value.toString(), "{a:1}");
  });
  test("delete file", async () => {
    await testObject.writeFile(joinPath(userDataHomeOnDisk, "settings.json"), VSBuffer.fromString(""));
    await testObject.del(userDataProfilesService.defaultProfile.settingsResource);
    const result = await testObject.exists(joinPath(userDataHomeOnDisk, "settings.json"));
    assert.strictEqual(false, result);
  });
  test("resolve file", async () => {
    await testObject.writeFile(joinPath(userDataHomeOnDisk, "settings.json"), VSBuffer.fromString(""));
    const result = await testObject.resolve(userDataProfilesService.defaultProfile.settingsResource);
    assert.ok(!result.isDirectory);
    assert.ok(result.children === void 0);
  });
  test("exists return false for folder that does not exist", async () => {
    const exists = await testObject.exists(userDataProfilesService.defaultProfile.snippetsHome);
    assert.strictEqual(exists, false);
  });
  test("exists return true for folder that exists", async () => {
    await testObject.createFolder(joinPath(userDataHomeOnDisk, "snippets"));
    const exists = await testObject.exists(userDataProfilesService.defaultProfile.snippetsHome);
    assert.strictEqual(exists, true);
  });
  test("read file throws error for folder", async () => {
    await testObject.createFolder(joinPath(userDataHomeOnDisk, "snippets"));
    try {
      await testObject.readFile(userDataProfilesService.defaultProfile.snippetsHome);
      assert.fail("Should fail since read file is not supported for folders");
    } catch (e) {
    }
  });
  test("read file under folder", async () => {
    await testObject.createFolder(joinPath(userDataHomeOnDisk, "snippets"));
    await testObject.writeFile(joinPath(userDataHomeOnDisk, "snippets", "settings.json"), VSBuffer.fromString("{}"));
    const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, "settings.json");
    const actual = await testObject.readFile(resource);
    assert.strictEqual(actual.resource.toString(), resource.toString());
    assert.strictEqual(actual.value.toString(), "{}");
  });
  test("read file under sub folder", async () => {
    await testObject.createFolder(joinPath(userDataHomeOnDisk, "snippets", "java"));
    await testObject.writeFile(joinPath(userDataHomeOnDisk, "snippets", "java", "settings.json"), VSBuffer.fromString("{}"));
    const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, "java/settings.json");
    const actual = await testObject.readFile(resource);
    assert.strictEqual(actual.resource.toString(), resource.toString());
    assert.strictEqual(actual.value.toString(), "{}");
  });
  test("create file under folder that exists", async () => {
    await testObject.createFolder(joinPath(userDataHomeOnDisk, "snippets"));
    const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, "settings.json");
    const actual1 = await testObject.createFile(resource, VSBuffer.fromString("{}"));
    assert.strictEqual(actual1.resource.toString(), resource.toString());
    const actual2 = await testObject.readFile(joinPath(userDataHomeOnDisk, "snippets", "settings.json"));
    assert.strictEqual(actual2.value.toString(), "{}");
  });
  test("create file under folder that does not exist", async () => {
    const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, "settings.json");
    const actual1 = await testObject.createFile(resource, VSBuffer.fromString("{}"));
    assert.strictEqual(actual1.resource.toString(), resource.toString());
    const actual2 = await testObject.readFile(joinPath(userDataHomeOnDisk, "snippets", "settings.json"));
    assert.strictEqual(actual2.value.toString(), "{}");
  });
  test("write to not existing file under container that exists", async () => {
    await testObject.createFolder(joinPath(userDataHomeOnDisk, "snippets"));
    const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, "settings.json");
    const actual1 = await testObject.writeFile(resource, VSBuffer.fromString("{}"));
    assert.strictEqual(actual1.resource.toString(), resource.toString());
    const actual = await testObject.readFile(joinPath(userDataHomeOnDisk, "snippets", "settings.json"));
    assert.strictEqual(actual.value.toString(), "{}");
  });
  test("write to not existing file under container that does not exists", async () => {
    const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, "settings.json");
    const actual1 = await testObject.writeFile(resource, VSBuffer.fromString("{}"));
    assert.strictEqual(actual1.resource.toString(), resource.toString());
    const actual = await testObject.readFile(joinPath(userDataHomeOnDisk, "snippets", "settings.json"));
    assert.strictEqual(actual.value.toString(), "{}");
  });
  test("write to existing file under container", async () => {
    await testObject.createFolder(joinPath(userDataHomeOnDisk, "snippets"));
    await testObject.writeFile(joinPath(userDataHomeOnDisk, "snippets", "settings.json"), VSBuffer.fromString("{}"));
    const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, "settings.json");
    const actual1 = await testObject.writeFile(resource, VSBuffer.fromString("{a:1}"));
    assert.strictEqual(actual1.resource.toString(), resource.toString());
    const actual = await testObject.readFile(joinPath(userDataHomeOnDisk, "snippets", "settings.json"));
    assert.strictEqual(actual.value.toString(), "{a:1}");
  });
  test("write file under sub container", async () => {
    const resource = joinPath(userDataProfilesService.defaultProfile.snippetsHome, "java/settings.json");
    const actual1 = await testObject.writeFile(resource, VSBuffer.fromString("{}"));
    assert.strictEqual(actual1.resource.toString(), resource.toString());
    const actual = await testObject.readFile(joinPath(userDataHomeOnDisk, "snippets", "java", "settings.json"));
    assert.strictEqual(actual.value.toString(), "{}");
  });
  test("delete throws error for folder that does not exist", async () => {
    try {
      await testObject.del(userDataProfilesService.defaultProfile.snippetsHome);
      assert.fail("Should fail the folder does not exist");
    } catch (e) {
    }
  });
  test("delete not existing file under container that exists", async () => {
    await testObject.createFolder(joinPath(userDataHomeOnDisk, "snippets"));
    try {
      await testObject.del(joinPath(userDataProfilesService.defaultProfile.snippetsHome, "settings.json"));
      assert.fail("Should fail since file does not exist");
    } catch (e) {
    }
  });
  test("delete not existing file under container that does not exists", async () => {
    try {
      await testObject.del(joinPath(userDataProfilesService.defaultProfile.snippetsHome, "settings.json"));
      assert.fail("Should fail since file does not exist");
    } catch (e) {
    }
  });
  test("delete existing file under folder", async () => {
    await testObject.createFolder(joinPath(userDataHomeOnDisk, "snippets"));
    await testObject.writeFile(joinPath(userDataHomeOnDisk, "snippets", "settings.json"), VSBuffer.fromString("{}"));
    await testObject.del(joinPath(userDataProfilesService.defaultProfile.snippetsHome, "settings.json"));
    const exists = await testObject.exists(joinPath(userDataHomeOnDisk, "snippets", "settings.json"));
    assert.strictEqual(exists, false);
  });
  test("resolve folder", async () => {
    await testObject.createFolder(joinPath(userDataHomeOnDisk, "snippets"));
    await testObject.writeFile(joinPath(userDataHomeOnDisk, "snippets", "settings.json"), VSBuffer.fromString("{}"));
    const result = await testObject.resolve(userDataProfilesService.defaultProfile.snippetsHome);
    assert.ok(result.isDirectory);
    assert.ok(result.children !== void 0);
    assert.strictEqual(result.children.length, 1);
    assert.strictEqual(result.children[0].resource.toString(), joinPath(userDataProfilesService.defaultProfile.snippetsHome, "settings.json").toString());
  });
  test("read backup file", async () => {
    await testObject.writeFile(joinPath(backupWorkspaceHomeOnDisk, "backup.json"), VSBuffer.fromString("{}"));
    const result = await testObject.readFile(joinPath(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`));
    assert.strictEqual(result.value.toString(), "{}");
  });
  test("create backup file", async () => {
    await testObject.createFile(joinPath(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`), VSBuffer.fromString("{}"));
    const result = await testObject.readFile(joinPath(backupWorkspaceHomeOnDisk, "backup.json"));
    assert.strictEqual(result.value.toString(), "{}");
  });
  test("write backup file", async () => {
    await testObject.writeFile(joinPath(backupWorkspaceHomeOnDisk, "backup.json"), VSBuffer.fromString("{}"));
    await testObject.writeFile(joinPath(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`), VSBuffer.fromString("{a:1}"));
    const result = await testObject.readFile(joinPath(backupWorkspaceHomeOnDisk, "backup.json"));
    assert.strictEqual(result.value.toString(), "{a:1}");
  });
  test("resolve backups folder", async () => {
    await testObject.writeFile(joinPath(backupWorkspaceHomeOnDisk, "backup.json"), VSBuffer.fromString("{}"));
    const result = await testObject.resolve(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }));
    assert.ok(result.isDirectory);
    assert.ok(result.children !== void 0);
    assert.strictEqual(result.children.length, 1);
    assert.strictEqual(result.children[0].resource.toString(), joinPath(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`).toString());
  });
});
class TestFileSystemProvider {
  constructor(onDidChangeFile) {
    this.onDidChangeFile = onDidChangeFile;
  }
  static {
    __name(this, "TestFileSystemProvider");
  }
  capabilities = FileSystemProviderCapabilities.FileReadWrite;
  onDidChangeCapabilities = Event.None;
  watch() {
    return Disposable.None;
  }
  stat() {
    throw new Error("Not Supported");
  }
  mkdir(resource) {
    throw new Error("Not Supported");
  }
  rename() {
    throw new Error("Not Supported");
  }
  readFile(resource) {
    throw new Error("Not Supported");
  }
  readdir(resource) {
    throw new Error("Not Supported");
  }
  writeFile() {
    throw new Error("Not Supported");
  }
  delete() {
    throw new Error("Not Supported");
  }
  open(resource, opts) {
    throw new Error("Not Supported");
  }
  close(fd) {
    throw new Error("Not Supported");
  }
  read(fd, pos, data, offset, length) {
    throw new Error("Not Supported");
  }
  write(fd, pos, data, offset, length) {
    throw new Error("Not Supported");
  }
  readFileStream(resource, opts, token) {
    throw new Error("Method not implemented.");
  }
}
suite("FileUserDataProvider - Watching", () => {
  let testObject;
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  const rootFileResource = joinPath(ROOT, "User");
  const rootUserDataResource = rootFileResource.with({ scheme: Schemas.vscodeUserData });
  let fileEventEmitter;
  setup(() => {
    const logService = new NullLogService();
    const fileService = disposables.add(new FileService(logService));
    const environmentService = new TestEnvironmentService(rootFileResource);
    const uriIdentityService = disposables.add(new UriIdentityService(fileService));
    const userDataProfilesService = disposables.add(new UserDataProfilesService(environmentService, fileService, uriIdentityService, logService));
    fileEventEmitter = disposables.add(new Emitter());
    testObject = disposables.add(new FileUserDataProvider(rootFileResource.scheme, new TestFileSystemProvider(fileEventEmitter.event), Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, new NullLogService()));
  });
  test("file added change event", (done) => {
    disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
    const expected = joinPath(rootUserDataResource, "settings.json");
    const target = joinPath(rootFileResource, "settings.json");
    disposables.add(testObject.onDidChangeFile((e) => {
      if (isEqual(e[0].resource, expected) && e[0].type === FileChangeType.ADDED) {
        done();
      }
    }));
    fileEventEmitter.fire([{
      resource: target,
      type: FileChangeType.ADDED
    }]);
  });
  test("file updated change event", (done) => {
    disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
    const expected = joinPath(rootUserDataResource, "settings.json");
    const target = joinPath(rootFileResource, "settings.json");
    disposables.add(testObject.onDidChangeFile((e) => {
      if (isEqual(e[0].resource, expected) && e[0].type === FileChangeType.UPDATED) {
        done();
      }
    }));
    fileEventEmitter.fire([{
      resource: target,
      type: FileChangeType.UPDATED
    }]);
  });
  test("file deleted change event", (done) => {
    disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
    const expected = joinPath(rootUserDataResource, "settings.json");
    const target = joinPath(rootFileResource, "settings.json");
    disposables.add(testObject.onDidChangeFile((e) => {
      if (isEqual(e[0].resource, expected) && e[0].type === FileChangeType.DELETED) {
        done();
      }
    }));
    fileEventEmitter.fire([{
      resource: target,
      type: FileChangeType.DELETED
    }]);
  });
  test("file under folder created change event", (done) => {
    disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
    const expected = joinPath(rootUserDataResource, "snippets", "settings.json");
    const target = joinPath(rootFileResource, "snippets", "settings.json");
    disposables.add(testObject.onDidChangeFile((e) => {
      if (isEqual(e[0].resource, expected) && e[0].type === FileChangeType.ADDED) {
        done();
      }
    }));
    fileEventEmitter.fire([{
      resource: target,
      type: FileChangeType.ADDED
    }]);
  });
  test("file under folder updated change event", (done) => {
    disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
    const expected = joinPath(rootUserDataResource, "snippets", "settings.json");
    const target = joinPath(rootFileResource, "snippets", "settings.json");
    disposables.add(testObject.onDidChangeFile((e) => {
      if (isEqual(e[0].resource, expected) && e[0].type === FileChangeType.UPDATED) {
        done();
      }
    }));
    fileEventEmitter.fire([{
      resource: target,
      type: FileChangeType.UPDATED
    }]);
  });
  test("file under folder deleted change event", (done) => {
    disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
    const expected = joinPath(rootUserDataResource, "snippets", "settings.json");
    const target = joinPath(rootFileResource, "snippets", "settings.json");
    disposables.add(testObject.onDidChangeFile((e) => {
      if (isEqual(e[0].resource, expected) && e[0].type === FileChangeType.DELETED) {
        done();
      }
    }));
    fileEventEmitter.fire([{
      resource: target,
      type: FileChangeType.DELETED
    }]);
  });
  test("event is not triggered if not watched", async () => {
    const target = joinPath(rootFileResource, "settings.json");
    let triggered = false;
    disposables.add(testObject.onDidChangeFile(() => triggered = true));
    fileEventEmitter.fire([{
      resource: target,
      type: FileChangeType.DELETED
    }]);
    if (triggered) {
      assert.fail("event should not be triggered");
    }
  });
  test("event is not triggered if not watched 2", async () => {
    disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
    const target = joinPath(dirname(rootFileResource), "settings.json");
    let triggered = false;
    disposables.add(testObject.onDidChangeFile(() => triggered = true));
    fileEventEmitter.fire([{
      resource: target,
      type: FileChangeType.DELETED
    }]);
    if (triggered) {
      assert.fail("event should not be triggered");
    }
  });
});
//# sourceMappingURL=fileUserDataProvider.test.js.map
