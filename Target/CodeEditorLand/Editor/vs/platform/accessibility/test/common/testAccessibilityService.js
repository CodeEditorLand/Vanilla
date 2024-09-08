import { Event } from "../../../../base/common/event.js";
import {
  AccessibilitySupport
} from "../../common/accessibility.js";
class TestAccessibilityService {
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
