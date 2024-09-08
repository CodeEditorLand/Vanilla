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
import {
  Disposable,
  dispose
} from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import {
  INotificationService,
  NotificationsFilter
} from "../../../../platform/notification/common/notification.js";
import {
  NotificationChangeType,
  StatusMessageChangeType
} from "../../../common/notifications.js";
import {
  IStatusbarService,
  StatusbarAlignment
} from "../../../services/statusbar/browser/statusbar.js";
import {
  HIDE_NOTIFICATIONS_CENTER,
  SHOW_NOTIFICATIONS_CENTER
} from "./notificationsCommands.js";
let NotificationsStatus = class extends Disposable {
  constructor(model, statusbarService, notificationService) {
    super();
    this.model = model;
    this.statusbarService = statusbarService;
    this.notificationService = notificationService;
    this.updateNotificationsCenterStatusItem();
    if (model.statusMessage) {
      this.doSetStatusMessage(model.statusMessage);
    }
    this.registerListeners();
  }
  notificationsCenterStatusItem;
  newNotificationsCount = 0;
  currentStatusMessage;
  isNotificationsCenterVisible = false;
  isNotificationsToastsVisible = false;
  registerListeners() {
    this._register(
      this.model.onDidChangeNotification(
        (e) => this.onDidChangeNotification(e)
      )
    );
    this._register(
      this.model.onDidChangeStatusMessage(
        (e) => this.onDidChangeStatusMessage(e)
      )
    );
    this._register(
      this.notificationService.onDidChangeFilter(
        () => this.updateNotificationsCenterStatusItem()
      )
    );
  }
  onDidChangeNotification(e) {
    if (!this.isNotificationsCenterVisible) {
      if (e.kind === NotificationChangeType.ADD) {
        this.newNotificationsCount++;
      } else if (e.kind === NotificationChangeType.REMOVE && this.newNotificationsCount > 0) {
        this.newNotificationsCount--;
      }
    }
    this.updateNotificationsCenterStatusItem();
  }
  updateNotificationsCenterStatusItem() {
    let notificationsInProgress = 0;
    if (!this.isNotificationsCenterVisible && !this.isNotificationsToastsVisible) {
      for (const notification of this.model.notifications) {
        if (notification.hasProgress) {
          notificationsInProgress++;
        }
      }
    }
    let statusProperties = {
      name: localize("status.notifications", "Notifications"),
      text: `${notificationsInProgress > 0 || this.newNotificationsCount > 0 ? "$(bell-dot)" : "$(bell)"}`,
      ariaLabel: localize("status.notifications", "Notifications"),
      command: this.isNotificationsCenterVisible ? HIDE_NOTIFICATIONS_CENTER : SHOW_NOTIFICATIONS_CENTER,
      tooltip: this.getTooltip(notificationsInProgress),
      showBeak: this.isNotificationsCenterVisible
    };
    if (this.notificationService.getFilter() === NotificationsFilter.ERROR) {
      statusProperties = {
        ...statusProperties,
        text: `${notificationsInProgress > 0 || this.newNotificationsCount > 0 ? "$(bell-slash-dot)" : "$(bell-slash)"}`,
        ariaLabel: localize("status.doNotDisturb", "Do Not Disturb"),
        tooltip: localize(
          "status.doNotDisturbTooltip",
          "Do Not Disturb Mode is Enabled"
        )
      };
    }
    if (this.notificationsCenterStatusItem) {
      this.notificationsCenterStatusItem.update(statusProperties);
    } else {
      this.notificationsCenterStatusItem = this.statusbarService.addEntry(
        statusProperties,
        "status.notifications",
        StatusbarAlignment.RIGHT,
        -Number.MAX_VALUE
      );
    }
  }
  getTooltip(notificationsInProgress) {
    if (this.isNotificationsCenterVisible) {
      return localize("hideNotifications", "Hide Notifications");
    }
    if (this.model.notifications.length === 0) {
      return localize("zeroNotifications", "No Notifications");
    }
    if (notificationsInProgress === 0) {
      if (this.newNotificationsCount === 0) {
        return localize("noNotifications", "No New Notifications");
      }
      if (this.newNotificationsCount === 1) {
        return localize("oneNotification", "1 New Notification");
      }
      return localize(
        {
          key: "notifications",
          comment: ["{0} will be replaced by a number"]
        },
        "{0} New Notifications",
        this.newNotificationsCount
      );
    }
    if (this.newNotificationsCount === 0) {
      return localize(
        {
          key: "noNotificationsWithProgress",
          comment: ["{0} will be replaced by a number"]
        },
        "No New Notifications ({0} in progress)",
        notificationsInProgress
      );
    }
    if (this.newNotificationsCount === 1) {
      return localize(
        {
          key: "oneNotificationWithProgress",
          comment: ["{0} will be replaced by a number"]
        },
        "1 New Notification ({0} in progress)",
        notificationsInProgress
      );
    }
    return localize(
      {
        key: "notificationsWithProgress",
        comment: ["{0} and {1} will be replaced by a number"]
      },
      "{0} New Notifications ({1} in progress)",
      this.newNotificationsCount,
      notificationsInProgress
    );
  }
  update(isCenterVisible, isToastsVisible) {
    let updateNotificationsCenterStatusItem = false;
    if (this.isNotificationsCenterVisible !== isCenterVisible) {
      this.isNotificationsCenterVisible = isCenterVisible;
      this.newNotificationsCount = 0;
      updateNotificationsCenterStatusItem = true;
    }
    if (this.isNotificationsToastsVisible !== isToastsVisible) {
      this.isNotificationsToastsVisible = isToastsVisible;
      updateNotificationsCenterStatusItem = true;
    }
    if (updateNotificationsCenterStatusItem) {
      this.updateNotificationsCenterStatusItem();
    }
  }
  onDidChangeStatusMessage(e) {
    const statusItem = e.item;
    switch (e.kind) {
      // Show status notification
      case StatusMessageChangeType.ADD:
        this.doSetStatusMessage(statusItem);
        break;
      // Hide status notification (if its still the current one)
      case StatusMessageChangeType.REMOVE:
        if (this.currentStatusMessage && this.currentStatusMessage[0] === statusItem) {
          dispose(this.currentStatusMessage[1]);
          this.currentStatusMessage = void 0;
        }
        break;
    }
  }
  doSetStatusMessage(item) {
    const message = item.message;
    const showAfter = item.options && typeof item.options.showAfter === "number" ? item.options.showAfter : 0;
    const hideAfter = item.options && typeof item.options.hideAfter === "number" ? item.options.hideAfter : -1;
    if (this.currentStatusMessage) {
      dispose(this.currentStatusMessage[1]);
    }
    let statusMessageEntry;
    let showHandle = setTimeout(() => {
      statusMessageEntry = this.statusbarService.addEntry(
        {
          name: localize("status.message", "Status Message"),
          text: message,
          ariaLabel: message
        },
        "status.message",
        StatusbarAlignment.LEFT,
        -Number.MAX_VALUE
      );
      showHandle = null;
    }, showAfter);
    let hideHandle;
    const statusMessageDispose = {
      dispose: () => {
        if (showHandle) {
          clearTimeout(showHandle);
        }
        if (hideHandle) {
          clearTimeout(hideHandle);
        }
        statusMessageEntry?.dispose();
      }
    };
    if (hideAfter > 0) {
      hideHandle = setTimeout(
        () => statusMessageDispose.dispose(),
        hideAfter
      );
    }
    this.currentStatusMessage = [item, statusMessageDispose];
  }
};
NotificationsStatus = __decorateClass([
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, INotificationService)
], NotificationsStatus);
export {
  NotificationsStatus
};
