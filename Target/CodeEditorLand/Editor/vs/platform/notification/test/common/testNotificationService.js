import { Event } from "../../../../base/common/event.js";
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import {
  NoOpNotification,
  NotificationsFilter,
  Severity
} from "../../common/notification.js";
class TestNotificationService {
  onDidAddNotification = Event.None;
  onDidRemoveNotification = Event.None;
  onDidChangeFilter = Event.None;
  static NO_OP = new NoOpNotification();
  info(message) {
    return this.notify({ severity: Severity.Info, message });
  }
  warn(message) {
    return this.notify({ severity: Severity.Warning, message });
  }
  error(error) {
    return this.notify({ severity: Severity.Error, message: error });
  }
  notify(notification) {
    return TestNotificationService.NO_OP;
  }
  prompt(severity, message, choices, options) {
    return TestNotificationService.NO_OP;
  }
  status(message, options) {
    return Disposable.None;
  }
  setFilter() {
  }
  getFilter(source) {
    return NotificationsFilter.OFF;
  }
  getFilters() {
    return [];
  }
  removeFilter(sourceId) {
  }
}
export {
  TestNotificationService
};
