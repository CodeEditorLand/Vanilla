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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { INotificationService, NotificationMessage, NotificationPriority } from "../../../../platform/notification/common/notification.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { hash } from "../../../../base/common/hash.js";
function notificationToMetrics(message, source, silent) {
  return {
    id: hash(message.toString()).toString(),
    silent,
    source: source || "core"
  };
}
__name(notificationToMetrics, "notificationToMetrics");
let NotificationsTelemetry = class extends Disposable {
  constructor(telemetryService, notificationService) {
    super();
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
    this.registerListeners();
  }
  static {
    __name(this, "NotificationsTelemetry");
  }
  registerListeners() {
    this._register(this.notificationService.onDidAddNotification((notification) => {
      const source = notification.source && typeof notification.source !== "string" ? notification.source.id : notification.source;
      this.telemetryService.publicLog2("notification:show", notificationToMetrics(notification.message, source, notification.priority === NotificationPriority.SILENT));
    }));
    this._register(this.notificationService.onDidRemoveNotification((notification) => {
      const source = notification.source && typeof notification.source !== "string" ? notification.source.id : notification.source;
      this.telemetryService.publicLog2("notification:close", notificationToMetrics(notification.message, source, notification.priority === NotificationPriority.SILENT));
    }));
  }
};
NotificationsTelemetry = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, INotificationService)
], NotificationsTelemetry);
export {
  NotificationsTelemetry,
  notificationToMetrics
};
//# sourceMappingURL=notificationsTelemetry.js.map
