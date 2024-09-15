var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../../base/common/uri.js";
import { IChatWidget, IChatWidgetService } from "../../browser/chat.js";
class MockChatWidgetService {
  static {
    __name(this, "MockChatWidgetService");
  }
  _serviceBrand;
  /**
   * Returns the most recently focused widget if any.
   */
  lastFocusedWidget;
  getWidgetByInputUri(uri) {
    return void 0;
  }
  getWidgetBySessionId(sessionId) {
    return void 0;
  }
}
export {
  MockChatWidgetService
};
//# sourceMappingURL=mockChatWidget.js.map
