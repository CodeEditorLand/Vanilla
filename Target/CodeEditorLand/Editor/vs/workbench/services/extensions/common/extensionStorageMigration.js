import { getErrorMessage } from "../../../../base/common/errors.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IExtensionStorageService } from "../../../../platform/extensionManagement/common/extensionStorage.js";
import {
  FileSystemProviderErrorCode,
  IFileService
} from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
async function migrateExtensionStorage(fromExtensionId, toExtensionId, global, instantionService) {
  return instantionService.invokeFunction(async (serviceAccessor) => {
    const environmentService = serviceAccessor.get(IEnvironmentService);
    const userDataProfilesService = serviceAccessor.get(
      IUserDataProfilesService
    );
    const extensionStorageService = serviceAccessor.get(
      IExtensionStorageService
    );
    const storageService = serviceAccessor.get(IStorageService);
    const uriIdentityService = serviceAccessor.get(IUriIdentityService);
    const fileService = serviceAccessor.get(IFileService);
    const workspaceContextService = serviceAccessor.get(
      IWorkspaceContextService
    );
    const logService = serviceAccessor.get(ILogService);
    const storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
    const migrateLowerCaseStorageKey = fromExtensionId.toLowerCase() === toExtensionId.toLowerCase() ? `extension.storage.migrateFromLowerCaseKey.${fromExtensionId.toLowerCase()}` : void 0;
    if (fromExtensionId === toExtensionId) {
      return;
    }
    const getExtensionStorageLocation = (extensionId, global2) => {
      if (global2) {
        return uriIdentityService.extUri.joinPath(
          userDataProfilesService.defaultProfile.globalStorageHome,
          extensionId.toLowerCase()
        );
      }
      return uriIdentityService.extUri.joinPath(
        environmentService.workspaceStorageHome,
        workspaceContextService.getWorkspace().id,
        extensionId
      );
    };
    const storageScope = global ? StorageScope.PROFILE : StorageScope.WORKSPACE;
    if (!storageService.getBoolean(
      storageMigratedKey,
      storageScope,
      false
    ) && !(migrateLowerCaseStorageKey && storageService.getBoolean(
      migrateLowerCaseStorageKey,
      storageScope,
      false
    ))) {
      logService.info(
        `Migrating ${global ? "global" : "workspace"} extension storage from ${fromExtensionId} to ${toExtensionId}...`
      );
      const value = extensionStorageService.getExtensionState(
        fromExtensionId,
        global
      );
      if (value) {
        extensionStorageService.setExtensionState(
          toExtensionId,
          value,
          global
        );
        extensionStorageService.setExtensionState(
          fromExtensionId,
          void 0,
          global
        );
      }
      const fromPath = getExtensionStorageLocation(
        fromExtensionId,
        global
      );
      const toPath = getExtensionStorageLocation(toExtensionId, global);
      if (!uriIdentityService.extUri.isEqual(fromPath, toPath)) {
        try {
          await fileService.move(fromPath, toPath, true);
        } catch (error) {
          if (error.code !== FileSystemProviderErrorCode.FileNotFound) {
            logService.info(
              `Error while migrating ${global ? "global" : "workspace"} file storage from '${fromExtensionId}' to '${toExtensionId}'`,
              getErrorMessage(error)
            );
          }
        }
      }
      logService.info(
        `Migrated ${global ? "global" : "workspace"} extension storage from ${fromExtensionId} to ${toExtensionId}`
      );
      storageService.store(
        storageMigratedKey,
        true,
        storageScope,
        StorageTarget.MACHINE
      );
    }
  });
}
export {
  migrateExtensionStorage
};
