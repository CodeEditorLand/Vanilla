var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Action } from "../../../../base/common/actions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isWeb } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  IUserDataAutoSyncService,
  UserDataSyncErrorCode
} from "../../../../platform/userDataSync/common/userDataSync.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { SHOW_SYNC_LOG_COMMAND_ID } from "../../../services/userDataSync/common/userDataSync.js";
import { UserDataSyncWorkbenchContribution } from "./userDataSync.js";
import { UserDataSyncTrigger } from "./userDataSyncTrigger.js";
let UserDataSyncReportIssueContribution = class extends Disposable {
  constructor(userDataAutoSyncService, notificationService, productService, commandService, hostService) {
    super();
    this.notificationService = notificationService;
    this.productService = productService;
    this.commandService = commandService;
    this.hostService = hostService;
    this._register(userDataAutoSyncService.onError((error) => this.onAutoSyncError(error)));
  }
  static {
    __name(this, "UserDataSyncReportIssueContribution");
  }
  onAutoSyncError(error) {
    switch (error.code) {
      case UserDataSyncErrorCode.LocalTooManyRequests: {
        const message = isWeb ? localize(
          {
            key: "local too many requests - reload",
            comment: [
              "Settings Sync is the name of the feature"
            ]
          },
          "Settings sync is suspended temporarily because the current device is making too many requests. Please reload {0} to resume.",
          this.productService.nameLong
        ) : localize(
          {
            key: "local too many requests - restart",
            comment: [
              "Settings Sync is the name of the feature"
            ]
          },
          "Settings sync is suspended temporarily because the current device is making too many requests. Please restart {0} to resume.",
          this.productService.nameLong
        );
        this.notificationService.notify({
          severity: Severity.Error,
          message,
          actions: {
            primary: [
              new Action(
                "Show Sync Logs",
                localize("show sync logs", "Show Log"),
                void 0,
                true,
                () => this.commandService.executeCommand(
                  SHOW_SYNC_LOG_COMMAND_ID
                )
              ),
              new Action(
                "Restart",
                isWeb ? localize("reload", "Reload") : localize("restart", "Restart"),
                void 0,
                true,
                () => this.hostService.restart()
              )
            ]
          }
        });
        return;
      }
      case UserDataSyncErrorCode.TooManyRequests: {
        const operationId = error.operationId ? localize(
          "operationId",
          "Operation Id: {0}",
          error.operationId
        ) : void 0;
        const message = localize(
          {
            key: "server too many requests",
            comment: ["Settings Sync is the name of the feature"]
          },
          "Settings sync is disabled because the current device is making too many requests. Please wait for 10 minutes and turn on sync."
        );
        this.notificationService.notify({
          severity: Severity.Error,
          message: operationId ? `${message} ${operationId}` : message,
          source: error.operationId ? localize(
            "settings sync",
            "Settings Sync. Operation Id: {0}",
            error.operationId
          ) : void 0,
          actions: {
            primary: [
              new Action(
                "Show Sync Logs",
                localize("show sync logs", "Show Log"),
                void 0,
                true,
                () => this.commandService.executeCommand(
                  SHOW_SYNC_LOG_COMMAND_ID
                )
              )
            ]
          }
        });
        return;
      }
    }
  }
};
UserDataSyncReportIssueContribution = __decorateClass([
  __decorateParam(0, IUserDataAutoSyncService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IProductService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IHostService)
], UserDataSyncReportIssueContribution);
const workbenchRegistry = Registry.as(
  WorkbenchExtensions.Workbench
);
workbenchRegistry.registerWorkbenchContribution(
  UserDataSyncWorkbenchContribution,
  LifecyclePhase.Restored
);
workbenchRegistry.registerWorkbenchContribution(
  UserDataSyncTrigger,
  LifecyclePhase.Eventually
);
workbenchRegistry.registerWorkbenchContribution(
  UserDataSyncReportIssueContribution,
  LifecyclePhase.Eventually
);
//# sourceMappingURL=userDataSync.contribution.js.map
