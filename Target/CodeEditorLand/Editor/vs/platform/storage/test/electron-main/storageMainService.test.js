import { notStrictEqual, strictEqual } from "assert";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { joinPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { OPTIONS, parseArgs } from "../../../environment/node/argv.js";
import { NativeEnvironmentService } from "../../../environment/node/environmentService.js";
import { FileService } from "../../../files/common/fileService.js";
import { NullLogService } from "../../../log/common/log.js";
import product from "../../../product/common/product.js";
import {
  SaveStrategy,
  StateService
} from "../../../state/node/stateService.js";
import {
  currentSessionDateStorageKey,
  firstSessionDateStorageKey
} from "../../../telemetry/common/telemetry.js";
import { TestLifecycleMainService } from "../../../test/electron-main/workbenchTestServices.js";
import { UriIdentityService } from "../../../uriIdentity/common/uriIdentityService.js";
import { UserDataProfilesMainService } from "../../../userDataProfile/electron-main/userDataProfile.js";
import { IS_NEW_KEY, StorageScope } from "../../common/storage.js";
import { StorageMainService } from "../../electron-main/storageMainService.js";
suite("StorageMainService", () => {
  const disposables = new DisposableStore();
  const productService = {
    _serviceBrand: void 0,
    ...product
  };
  const inMemoryProfileRoot = URI.file("/location").with({
    scheme: Schemas.inMemory
  });
  const inMemoryProfile = {
    id: "id",
    name: "inMemory",
    shortName: "inMemory",
    isDefault: false,
    location: inMemoryProfileRoot,
    globalStorageHome: joinPath(inMemoryProfileRoot, "globalStorageHome"),
    settingsResource: joinPath(inMemoryProfileRoot, "settingsResource"),
    keybindingsResource: joinPath(
      inMemoryProfileRoot,
      "keybindingsResource"
    ),
    tasksResource: joinPath(inMemoryProfileRoot, "tasksResource"),
    snippetsHome: joinPath(inMemoryProfileRoot, "snippetsHome"),
    extensionsResource: joinPath(inMemoryProfileRoot, "extensionsResource"),
    cacheHome: joinPath(inMemoryProfileRoot, "cache")
  };
  class TestStorageMainService extends StorageMainService {
    getStorageOptions() {
      return {
        useInMemoryStorage: true
      };
    }
  }
  async function testStorage(storage, scope) {
    strictEqual(storage.isInMemory(), true);
    if (scope === StorageScope.APPLICATION) {
      strictEqual(storage.items.size, 0);
      await storage.init();
      strictEqual(
        typeof storage.get(firstSessionDateStorageKey),
        "string"
      );
      strictEqual(
        typeof storage.get(currentSessionDateStorageKey),
        "string"
      );
    } else {
      await storage.init();
    }
    let storageChangeEvent;
    disposables.add(
      storage.onDidChangeStorage((e) => {
        storageChangeEvent = e;
      })
    );
    let storageDidClose = false;
    disposables.add(
      storage.onDidCloseStorage(() => storageDidClose = true)
    );
    const size = storage.items.size;
    storage.set("bar", "foo");
    strictEqual(storageChangeEvent.key, "bar");
    storage.set("barNumber", 55);
    storage.set("barBoolean", true);
    strictEqual(storage.get("bar"), "foo");
    strictEqual(storage.get("barNumber"), "55");
    strictEqual(storage.get("barBoolean"), "true");
    strictEqual(storage.items.size, size + 3);
    storage.delete("bar");
    strictEqual(storage.get("bar"), void 0);
    strictEqual(storage.items.size, size + 2);
    strictEqual(storage.get(IS_NEW_KEY), "true");
    await storage.close();
    strictEqual(storageDidClose, true);
  }
  teardown(() => {
    disposables.clear();
  });
  function createStorageService(lifecycleMainService = new TestLifecycleMainService()) {
    const environmentService = new NativeEnvironmentService(
      parseArgs(process.argv, OPTIONS),
      productService
    );
    const fileService = disposables.add(
      new FileService(new NullLogService())
    );
    const uriIdentityService = disposables.add(
      new UriIdentityService(fileService)
    );
    const testStorageService = disposables.add(
      new TestStorageMainService(
        new NullLogService(),
        environmentService,
        disposables.add(
          new UserDataProfilesMainService(
            disposables.add(
              new StateService(
                SaveStrategy.DELAYED,
                environmentService,
                new NullLogService(),
                fileService
              )
            ),
            disposables.add(uriIdentityService),
            environmentService,
            fileService,
            new NullLogService()
          )
        ),
        lifecycleMainService,
        fileService,
        uriIdentityService
      )
    );
    disposables.add(testStorageService.applicationStorage);
    return testStorageService;
  }
  test("basics (application)", () => {
    const storageMainService = createStorageService();
    return testStorage(
      storageMainService.applicationStorage,
      StorageScope.APPLICATION
    );
  });
  test("basics (profile)", () => {
    const storageMainService = createStorageService();
    const profile = inMemoryProfile;
    return testStorage(
      storageMainService.profileStorage(profile),
      StorageScope.PROFILE
    );
  });
  test("basics (workspace)", () => {
    const workspace = { id: generateUuid() };
    const storageMainService = createStorageService();
    return testStorage(
      storageMainService.workspaceStorage(workspace),
      StorageScope.WORKSPACE
    );
  });
  test("storage closed onWillShutdown", async () => {
    const lifecycleMainService = new TestLifecycleMainService();
    const storageMainService = createStorageService(lifecycleMainService);
    const profile = inMemoryProfile;
    const workspace = { id: generateUuid() };
    const workspaceStorage = storageMainService.workspaceStorage(workspace);
    let didCloseWorkspaceStorage = false;
    disposables.add(
      workspaceStorage.onDidCloseStorage(() => {
        didCloseWorkspaceStorage = true;
      })
    );
    const profileStorage = storageMainService.profileStorage(profile);
    let didCloseProfileStorage = false;
    disposables.add(
      profileStorage.onDidCloseStorage(() => {
        didCloseProfileStorage = true;
      })
    );
    const applicationStorage = storageMainService.applicationStorage;
    let didCloseApplicationStorage = false;
    disposables.add(
      applicationStorage.onDidCloseStorage(() => {
        didCloseApplicationStorage = true;
      })
    );
    strictEqual(applicationStorage, storageMainService.applicationStorage);
    strictEqual(profileStorage, storageMainService.profileStorage(profile));
    strictEqual(
      workspaceStorage,
      storageMainService.workspaceStorage(workspace)
    );
    await applicationStorage.init();
    await profileStorage.init();
    await workspaceStorage.init();
    await lifecycleMainService.fireOnWillShutdown();
    strictEqual(didCloseApplicationStorage, true);
    strictEqual(didCloseProfileStorage, true);
    strictEqual(didCloseWorkspaceStorage, true);
    const profileStorage2 = storageMainService.profileStorage(profile);
    notStrictEqual(profileStorage, profileStorage2);
    const workspaceStorage2 = storageMainService.workspaceStorage(workspace);
    notStrictEqual(workspaceStorage, workspaceStorage2);
    await workspaceStorage2.close();
  });
  test("storage closed before init works", async () => {
    const storageMainService = createStorageService();
    const profile = inMemoryProfile;
    const workspace = { id: generateUuid() };
    const workspaceStorage = storageMainService.workspaceStorage(workspace);
    let didCloseWorkspaceStorage = false;
    disposables.add(
      workspaceStorage.onDidCloseStorage(() => {
        didCloseWorkspaceStorage = true;
      })
    );
    const profileStorage = storageMainService.profileStorage(profile);
    let didCloseProfileStorage = false;
    disposables.add(
      profileStorage.onDidCloseStorage(() => {
        didCloseProfileStorage = true;
      })
    );
    const applicationStorage = storageMainService.applicationStorage;
    let didCloseApplicationStorage = false;
    disposables.add(
      applicationStorage.onDidCloseStorage(() => {
        didCloseApplicationStorage = true;
      })
    );
    await applicationStorage.close();
    await profileStorage.close();
    await workspaceStorage.close();
    strictEqual(didCloseApplicationStorage, true);
    strictEqual(didCloseProfileStorage, true);
    strictEqual(didCloseWorkspaceStorage, true);
  });
  test("storage closed before init awaits works", async () => {
    const storageMainService = createStorageService();
    const profile = inMemoryProfile;
    const workspace = { id: generateUuid() };
    const workspaceStorage = storageMainService.workspaceStorage(workspace);
    let didCloseWorkspaceStorage = false;
    disposables.add(
      workspaceStorage.onDidCloseStorage(() => {
        didCloseWorkspaceStorage = true;
      })
    );
    const profileStorage = storageMainService.profileStorage(profile);
    let didCloseProfileStorage = false;
    disposables.add(
      profileStorage.onDidCloseStorage(() => {
        didCloseProfileStorage = true;
      })
    );
    const applicationtorage = storageMainService.applicationStorage;
    let didCloseApplicationStorage = false;
    disposables.add(
      applicationtorage.onDidCloseStorage(() => {
        didCloseApplicationStorage = true;
      })
    );
    applicationtorage.init();
    profileStorage.init();
    workspaceStorage.init();
    await applicationtorage.close();
    await profileStorage.close();
    await workspaceStorage.close();
    strictEqual(didCloseApplicationStorage, true);
    strictEqual(didCloseProfileStorage, true);
    strictEqual(didCloseWorkspaceStorage, true);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
