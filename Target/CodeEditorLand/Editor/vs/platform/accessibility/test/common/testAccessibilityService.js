var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { IAccessibilityService, AccessibilitySupport } from "../../common/accessibility.js";
class TestAccessibilityService {
  static {
    __name(this, "TestAccessibilityService");
  }
  onDidChangeScreenReaderOptimized = Event.None;
  onDidChangeReducedMotion = Event.None;
  isScreenReaderOptimized() {
    return false;
  }
  isMotionReduced() {
    return false;
  }
  alwaysUnderlineAccessKeys() {
    return Promise.resolve(false);
  }
  setAccessibilitySupport(accessibilitySupport) {
  }
  getAccessibilitySupport() {
    return AccessibilitySupport.Unknown;
  }
  alert(message) {
  }
  status(message) {
  }
}
export {
  TestAccessibilityService
};
//# sourceMappingURL=testAccessibilityService.js.map
