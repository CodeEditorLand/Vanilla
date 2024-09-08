import assert from "assert";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import {
  ExtensionStorageService,
  IExtensionStorageService
} from "../../../../../platform/extensionManagement/common/extensionStorage.js";
import { FileService } from "../../../../../platform/files/common/fileService.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { InMemoryFileSystemProvider } from "../../../../../platform/files/common/inMemoryFilesystemProvider.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import {
  IStorageService,
  StorageScope
} from "../../../../../platform/storage/common/storage.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import {
  IUserDataProfilesService,
  UserDataProfilesService
} from "../../../../../platform/userDataProfile/common/userDataProfile.js";
import { TestWorkspace } from "../../../../../platform/workspace/test/common/testWorkspace.js";
import { workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
import { IUserDataProfileService } from "../../../userDataProfile/common/userDataProfile.js";
import { UserDataProfileService } from "../../../userDataProfile/common/userDataProfileService.js";
import { migrateExtensionStorage } from "../../common/extensionStorageMigration.js";
suite("ExtensionStorageMigration", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  const ROOT = URI.file("tests").with({ scheme: "vscode-tests" });
  const workspaceStorageHome = joinPath(ROOT, "workspaceStorageHome");
  let instantiationService;
  setup(() => {
    instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    const fileService = disposables.add(
      new FileService(new NullLogService())
    );
    disposables.add(
      fileService.registerProvider(
        ROOT.scheme,
        disposables.add(new InMemoryFileSystemProvider())
      )
    );
    instantiationService.stub(IFileService, fileService);
    const environmentService = instantiationService.stub(
      IEnvironmentService,
      {
        userRoamingDataHome: ROOT,
        workspaceStorageHome,
        cacheHome: ROOT
      }
    );
    const userDataProfilesService = instantiationService.stub(
      IUserDataProfilesService,
      disposables.add(
        new UserDataProfilesService(
          environmentService,
          fileService,
          disposables.add(new UriIdentityService(fileService)),
          new NullLogService()
        )
      )
    );
    instantiationService.stub(
      IUserDataProfileService,
      disposables.add(
        new UserDataProfileService(
          userDataProfilesService.defaultProfile
        )
      )
    );
    instantiationService.stub(
      IExtensionStorageService,
      disposables.add(
        instantiationService.createInstance(ExtensionStorageService)
      )
    );
  });
  test("migrate extension storage", async () => {
    const fromExtensionId = "pub.from", toExtensionId = "pub.to", storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
    const extensionStorageService = instantiationService.get(
      IExtensionStorageService
    ), fileService = instantiationService.get(IFileService), storageService = instantiationService.get(IStorageService), userDataProfilesService = instantiationService.get(
      IUserDataProfilesService
    );
    extensionStorageService.setExtensionState(
      fromExtensionId,
      { globalKey: "hello global state" },
      true
    );
    extensionStorageService.setExtensionState(
      fromExtensionId,
      { workspaceKey: "hello workspace state" },
      false
    );
    await fileService.writeFile(
      joinPath(
        userDataProfilesService.defaultProfile.globalStorageHome,
        fromExtensionId
      ),
      VSBuffer.fromString("hello global storage")
    );
    await fileService.writeFile(
      joinPath(workspaceStorageHome, TestWorkspace.id, fromExtensionId),
      VSBuffer.fromString("hello workspace storage")
    );
    await migrateExtensionStorage(
      fromExtensionId,
      toExtensionId,
      true,
      instantiationService
    );
    await migrateExtensionStorage(
      fromExtensionId,
      toExtensionId,
      false,
      instantiationService
    );
    assert.deepStrictEqual(
      extensionStorageService.getExtensionState(fromExtensionId, true),
      void 0
    );
    assert.deepStrictEqual(
      extensionStorageService.getExtensionState(fromExtensionId, false),
      void 0
    );
    assert.deepStrictEqual(
      await fileService.exists(
        joinPath(
          userDataProfilesService.defaultProfile.globalStorageHome,
          fromExtensionId
        )
      ),
      false
    );
    assert.deepStrictEqual(
      await fileService.exists(
        joinPath(
          workspaceStorageHome,
          TestWorkspace.id,
          fromExtensionId
        )
      ),
      false
    );
    assert.deepStrictEqual(
      extensionStorageService.getExtensionState(toExtensionId, true),
      { globalKey: "hello global state" }
    );
    assert.deepStrictEqual(
      extensionStorageService.getExtensionState(toExtensionId, false),
      { workspaceKey: "hello workspace state" }
    );
    assert.deepStrictEqual(
      (await fileService.readFile(
        joinPath(
          userDataProfilesService.defaultProfile.globalStorageHome,
          toExtensionId
        )
      )).value.toString(),
      "hello global storage"
    );
    assert.deepStrictEqual(
      (await fileService.readFile(
        joinPath(
          workspaceStorageHome,
          TestWorkspace.id,
          toExtensionId
        )
      )).value.toString(),
      "hello workspace storage"
    );
    assert.deepStrictEqual(
      storageService.get(storageMigratedKey, StorageScope.PROFILE),
      "true"
    );
    assert.deepStrictEqual(
      storageService.get(storageMigratedKey, StorageScope.WORKSPACE),
      "true"
    );
  });
  test("migrate extension storage when does not exist", async () => {
    const fromExtensionId = "pub.from", toExtensionId = "pub.to", storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
    const extensionStorageService = instantiationService.get(
      IExtensionStorageService
    ), fileService = instantiationService.get(IFileService), storageService = instantiationService.get(IStorageService), userDataProfilesService = instantiationService.get(
      IUserDataProfilesService
    );
    await migrateExtensionStorage(
      fromExtensionId,
      toExtensionId,
      true,
      instantiationService
    );
    await migrateExtensionStorage(
      fromExtensionId,
      toExtensionId,
      false,
      instantiationService
    );
    assert.deepStrictEqual(
      extensionStorageService.getExtensionState(fromExtensionId, true),
      void 0
    );
    assert.deepStrictEqual(
      extensionStorageService.getExtensionState(fromExtensionId, false),
      void 0
    );
    assert.deepStrictEqual(
      await fileService.exists(
        joinPath(
          userDataProfilesService.defaultProfile.globalStorageHome,
          fromExtensionId
        )
      ),
      false
    );
    assert.deepStrictEqual(
      await fileService.exists(
        joinPath(
          workspaceStorageHome,
          TestWorkspace.id,
          fromExtensionId
        )
      ),
      false
    );
    assert.deepStrictEqual(
      extensionStorageService.getExtensionState(toExtensionId, true),
      void 0
    );
    assert.deepStrictEqual(
      extensionStorageService.getExtensionState(toExtensionId, false),
      void 0
    );
    assert.deepStrictEqual(
      await fileService.exists(
        joinPath(
          userDataProfilesService.defaultProfile.globalStorageHome,
          toExtensionId
        )
      ),
      false
    );
    assert.deepStrictEqual(
      await fileService.exists(
        joinPath(workspaceStorageHome, TestWorkspace.id, toExtensionId)
      ),
      false
    );
    assert.deepStrictEqual(
      storageService.get(storageMigratedKey, StorageScope.PROFILE),
      "true"
    );
    assert.deepStrictEqual(
      storageService.get(storageMigratedKey, StorageScope.WORKSPACE),
      "true"
    );
  });
});
