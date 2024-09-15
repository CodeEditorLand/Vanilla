var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import {
  NotificationPriority,
  Severity
} from "../../../../platform/notification/common/notification.js";
import {
  NotificationChangeType,
  NotificationViewItemContentChangeKind
} from "../../../common/notifications.js";
class NotificationsAlerts extends Disposable {
  constructor(model) {
    super();
    this.model = model;
    for (const notification of model.notifications) {
      this.triggerAriaAlert(notification);
    }
    this.registerListeners();
  }
  static {
    __name(this, "NotificationsAlerts");
  }
  registerListeners() {
    this._register(
      this.model.onDidChangeNotification(
        (e) => this.onDidChangeNotification(e)
      )
    );
  }
  onDidChangeNotification(e) {
    if (e.kind === NotificationChangeType.ADD) {
      this.triggerAriaAlert(e.item);
      if (e.item.severity === Severity.Error) {
        if (e.item.message.original instanceof Error) {
          console.error(e.item.message.original);
        } else {
          console.error(
            toErrorMessage(
              e.item.message.linkedText.toString(),
              true
            )
          );
        }
      }
    }
  }
  triggerAriaAlert(notification) {
    if (notification.priority === NotificationPriority.SILENT) {
      return;
    }
    const listener = notification.onDidChangeContent((e) => {
      if (e.kind === NotificationViewItemContentChangeKind.MESSAGE) {
        this.doTriggerAriaAlert(notification);
      }
    });
    Event.once(notification.onDidClose)(() => listener.dispose());
    this.doTriggerAriaAlert(notification);
  }
  doTriggerAriaAlert(notification) {
    let alertText;
    if (notification.severity === Severity.Error) {
      alertText = localize(
        "alertErrorMessage",
        "Error: {0}",
        notification.message.linkedText.toString()
      );
    } else if (notification.severity === Severity.Warning) {
      alertText = localize(
        "alertWarningMessage",
        "Warning: {0}",
        notification.message.linkedText.toString()
      );
    } else {
      alertText = localize(
        "alertInfoMessage",
        "Info: {0}",
        notification.message.linkedText.toString()
      );
    }
    alert(alertText);
  }
}
export {
  NotificationsAlerts
};
//# sourceMappingURL=notificationsAlerts.js.map
