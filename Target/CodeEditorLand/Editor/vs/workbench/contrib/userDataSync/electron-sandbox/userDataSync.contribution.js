var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { localize, localize2 } from "../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-sandbox/services.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import {
  IUserDataSyncUtilService,
  SyncStatus
} from "../../../../platform/userDataSync/common/userDataSync.js";
import {
  registerWorkbenchContribution2,
  WorkbenchPhase
} from "../../../common/contributions.js";
import {
  CONTEXT_SYNC_STATE,
  DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR,
  IUserDataSyncWorkbenchService,
  SYNC_TITLE
} from "../../../services/userDataSync/common/userDataSync.js";
let UserDataSyncServicesContribution = class extends Disposable {
  static ID = "workbench.contrib.userDataSyncServices";
  constructor(userDataSyncUtilService, sharedProcessService) {
    super();
    sharedProcessService.registerChannel(
      "userDataSyncUtil",
      ProxyChannel.fromService(userDataSyncUtilService, this._store)
    );
  }
};
UserDataSyncServicesContribution = __decorateClass([
  __decorateParam(0, IUserDataSyncUtilService),
  __decorateParam(1, ISharedProcessService)
], UserDataSyncServicesContribution);
registerWorkbenchContribution2(
  UserDataSyncServicesContribution.ID,
  UserDataSyncServicesContribution,
  WorkbenchPhase.BlockStartup
);
registerAction2(
  class OpenSyncBackupsFolder extends Action2 {
    constructor() {
      super({
        id: "workbench.userData.actions.openSyncBackupsFolder",
        title: localize2(
          "Open Backup folder",
          "Open Local Backups Folder"
        ),
        category: SYNC_TITLE,
        menu: {
          id: MenuId.CommandPalette,
          when: CONTEXT_SYNC_STATE.notEqualsTo(
            SyncStatus.Uninitialized
          )
        }
      });
    }
    async run(accessor) {
      const syncHome = accessor.get(IEnvironmentService).userDataSyncHome;
      const nativeHostService = accessor.get(INativeHostService);
      const fileService = accessor.get(IFileService);
      const notificationService = accessor.get(INotificationService);
      if (await fileService.exists(syncHome)) {
        const folderStat = await fileService.resolve(syncHome);
        const item = folderStat.children && folderStat.children[0] ? folderStat.children[0].resource : syncHome;
        return nativeHostService.showItemInFolder(
          item.with({ scheme: Schemas.file }).fsPath
        );
      } else {
        notificationService.info(
          localize(
            "no backups",
            "Local backups folder does not exist"
          )
        );
      }
    }
  }
);
registerAction2(
  class DownloadSyncActivityAction extends Action2 {
    constructor() {
      super(DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR);
    }
    async run(accessor) {
      const userDataSyncWorkbenchService = accessor.get(
        IUserDataSyncWorkbenchService
      );
      const notificationService = accessor.get(INotificationService);
      const hostService = accessor.get(INativeHostService);
      const folder = await userDataSyncWorkbenchService.downloadSyncActivity();
      if (folder) {
        notificationService.prompt(
          Severity.Info,
          localize(
            "download sync activity complete",
            "Successfully downloaded Settings Sync activity."
          ),
          [
            {
              label: localize("open", "Open Folder"),
              run: () => hostService.showItemInFolder(folder.fsPath)
            }
          ]
        );
      }
    }
  }
);
