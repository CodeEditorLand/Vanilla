import { Codicon } from "../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import {
  AccessibleContentProvider,
  AccessibleViewProviderId,
  AccessibleViewType,
  IAccessibleViewService
} from "../../../../platform/accessibility/browser/accessibleView.js";
import {
  AccessibilitySignal,
  IAccessibilitySignalService
} from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import {
  IListService,
  WorkbenchList
} from "../../../../platform/list/browser/listService.js";
import { NotificationFocusedContext } from "../../../common/contextkeys.js";
import { getNotificationFromContext } from "./notificationsCommands.js";
class NotificationAccessibleView {
  priority = 90;
  name = "notifications";
  when = NotificationFocusedContext;
  type = AccessibleViewType.View;
  getProvider(accessor) {
    const accessibleViewService = accessor.get(IAccessibleViewService);
    const listService = accessor.get(IListService);
    const commandService = accessor.get(ICommandService);
    const accessibilitySignalService = accessor.get(
      IAccessibilitySignalService
    );
    function getProvider() {
      const notification = getNotificationFromContext(listService);
      if (!notification) {
        return;
      }
      commandService.executeCommand("notifications.showList");
      let notificationIndex;
      const list = listService.lastFocusedList;
      if (list instanceof WorkbenchList) {
        notificationIndex = list.indexOf(notification);
      }
      if (notificationIndex === void 0) {
        return;
      }
      function focusList() {
        commandService.executeCommand("notifications.showList");
        if (list && notificationIndex !== void 0) {
          list.domFocus();
          try {
            list.setFocus([notificationIndex]);
          } catch {
          }
        }
      }
      function getContentForNotification() {
        const notification2 = getNotificationFromContext(listService);
        const message = notification2?.message.original.toString();
        if (!notification2) {
          return;
        }
        return notification2.source ? localize(
          "notification.accessibleViewSrc",
          "{0} Source: {1}",
          message,
          notification2.source
        ) : localize("notification.accessibleView", "{0}", message);
      }
      const content = getContentForNotification();
      if (!content) {
        return;
      }
      notification.onDidClose(() => accessibleViewService.next());
      return new AccessibleContentProvider(
        AccessibleViewProviderId.Notification,
        { type: AccessibleViewType.View },
        () => content,
        () => focusList(),
        "accessibility.verbosity.notification",
        void 0,
        getActionsFromNotification(
          notification,
          accessibilitySignalService
        ),
        () => {
          if (!list) {
            return;
          }
          focusList();
          list.focusNext();
          return getContentForNotification();
        },
        () => {
          if (!list) {
            return;
          }
          focusList();
          list.focusPrevious();
          return getContentForNotification();
        }
      );
    }
    return getProvider();
  }
}
function getActionsFromNotification(notification, accessibilitySignalService) {
  let actions;
  if (notification.actions) {
    actions = [];
    if (notification.actions.primary) {
      actions.push(...notification.actions.primary);
    }
    if (notification.actions.secondary) {
      actions.push(...notification.actions.secondary);
    }
  }
  if (actions) {
    for (const action of actions) {
      action.class = ThemeIcon.asClassName(Codicon.bell);
      const initialAction = action.run;
      action.run = () => {
        initialAction();
        notification.close();
      };
    }
  }
  const manageExtension = actions?.find(
    (a) => a.label.includes("Manage Extension")
  );
  if (manageExtension) {
    manageExtension.class = ThemeIcon.asClassName(Codicon.gear);
  }
  if (actions) {
    actions.push({
      id: "clearNotification",
      label: localize("clearNotification", "Clear Notification"),
      tooltip: localize("clearNotification", "Clear Notification"),
      run: () => {
        notification.close();
        accessibilitySignalService.playSignal(
          AccessibilitySignal.clear
        );
      },
      enabled: true,
      class: ThemeIcon.asClassName(Codicon.clearAll)
    });
  }
  return actions;
}
export {
  NotificationAccessibleView
};
