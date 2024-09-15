var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IAuthenticationProvider, SyncStatus, SyncResource, IUserDataSyncResource, IResourcePreview } from "../../../../platform/userDataSync/common/userDataSync.js";
import { Event } from "../../../../base/common/event.js";
import { ContextKeyExpr, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { localize, localize2 } from "../../../../nls.js";
import { URI } from "../../../../base/common/uri.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { IView } from "../../../common/views.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { IAction2Options } from "../../../../platform/actions/common/actions.js";
import { ILocalizedString } from "../../../../platform/action/common/action.js";
const IUserDataSyncWorkbenchService = createDecorator("IUserDataSyncWorkbenchService");
function getSyncAreaLabel(source) {
  switch (source) {
    case SyncResource.Settings:
      return localize("settings", "Settings");
    case SyncResource.Keybindings:
      return localize("keybindings", "Keyboard Shortcuts");
    case SyncResource.Snippets:
      return localize("snippets", "Snippets");
    case SyncResource.Tasks:
      return localize("tasks", "Tasks");
    case SyncResource.Extensions:
      return localize("extensions", "Extensions");
    case SyncResource.GlobalState:
      return localize("ui state label", "UI State");
    case SyncResource.Profiles:
      return localize("profiles", "Profiles");
    case SyncResource.WorkspaceState:
      return localize("workspace state label", "Workspace State");
  }
}
__name(getSyncAreaLabel, "getSyncAreaLabel");
var AccountStatus = /* @__PURE__ */ ((AccountStatus2) => {
  AccountStatus2["Unavailable"] = "unavailable";
  AccountStatus2["Available"] = "available";
  return AccountStatus2;
})(AccountStatus || {});
const SYNC_TITLE = localize2("sync category", "Settings Sync");
const SYNC_VIEW_ICON = registerIcon("settings-sync-view-icon", Codicon.sync, localize("syncViewIcon", "View icon of the Settings Sync view."));
const CONTEXT_SYNC_STATE = new RawContextKey("syncStatus", SyncStatus.Uninitialized);
const CONTEXT_SYNC_ENABLEMENT = new RawContextKey("syncEnabled", false);
const CONTEXT_ACCOUNT_STATE = new RawContextKey("userDataSyncAccountStatus", "unavailable" /* Unavailable */);
const CONTEXT_ENABLE_ACTIVITY_VIEWS = new RawContextKey(`enableSyncActivityViews`, false);
const CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW = new RawContextKey(`enableSyncConflictsView`, false);
const CONTEXT_HAS_CONFLICTS = new RawContextKey("hasConflicts", false);
const CONFIGURE_SYNC_COMMAND_ID = "workbench.userDataSync.actions.configure";
const SHOW_SYNC_LOG_COMMAND_ID = "workbench.userDataSync.actions.showLog";
const SYNC_VIEW_CONTAINER_ID = "workbench.view.sync";
const SYNC_CONFLICTS_VIEW_ID = "workbench.views.sync.conflicts";
const DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR = {
  id: "workbench.userDataSync.actions.downloadSyncActivity",
  title: localize2("download sync activity title", "Download Settings Sync Activity"),
  category: Categories.Developer,
  f1: true,
  precondition: ContextKeyExpr.and(CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* Available */), CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized))
};
export {
  AccountStatus,
  CONFIGURE_SYNC_COMMAND_ID,
  CONTEXT_ACCOUNT_STATE,
  CONTEXT_ENABLE_ACTIVITY_VIEWS,
  CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW,
  CONTEXT_HAS_CONFLICTS,
  CONTEXT_SYNC_ENABLEMENT,
  CONTEXT_SYNC_STATE,
  DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR,
  IUserDataSyncWorkbenchService,
  SHOW_SYNC_LOG_COMMAND_ID,
  SYNC_CONFLICTS_VIEW_ID,
  SYNC_TITLE,
  SYNC_VIEW_CONTAINER_ID,
  SYNC_VIEW_ICON,
  getSyncAreaLabel
};
//# sourceMappingURL=userDataSync.js.map
