var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import {
  AccessibleViewProviderId,
  AccessibleViewType
} from "../../../../platform/accessibility/browser/accessibleView.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { GettingStartedPage } from "./gettingStarted.js";
import { GettingStartedInput } from "./gettingStartedInput.js";
import {
  IWalkthroughsService
} from "./gettingStartedService.js";
class GettingStartedAccessibleView {
  static {
    __name(this, "GettingStartedAccessibleView");
  }
  type = AccessibleViewType.View;
  priority = 110;
  name = "walkthroughs";
  when;
  getProvider = /* @__PURE__ */ __name((accessor) => {
    const editorService = accessor.get(IEditorService);
    const editorPane = editorService.activeEditorPane;
    if (!(editorPane instanceof GettingStartedPage)) {
      return;
    }
    const gettingStartedInput = editorPane.input;
    if (!(gettingStartedInput instanceof GettingStartedInput) || !gettingStartedInput.selectedCategory) {
      return;
    }
    const gettingStartedService = accessor.get(IWalkthroughsService);
    const currentWalkthrough = gettingStartedService.getWalkthrough(
      gettingStartedInput.selectedCategory
    );
    if (currentWalkthrough) {
      return new GettingStartedAccessibleProvider(
        editorPane,
        currentWalkthrough
      );
    }
    return;
  }, "getProvider");
}
class GettingStartedAccessibleProvider extends Disposable {
  constructor(_gettingStartedPage, _focusedItem) {
    super();
    this._gettingStartedPage = _gettingStartedPage;
    this._focusedItem = _focusedItem;
  }
  static {
    __name(this, "GettingStartedAccessibleProvider");
  }
  id = AccessibleViewProviderId.Walkthrough;
  verbositySettingKey = AccessibilityVerbositySettingId.Walkthrough;
  options = { type: AccessibleViewType.View };
  provideContent() {
    return this._getContent(this._focusedItem);
  }
  _getContent(item) {
    const stepsContent = item.steps.map((step, index) => {
      return localize(
        "gettingStarted.step",
        "Step {0}: {1}\nDescription: {2}",
        index + 1,
        step.title,
        step.description.join(" ")
      );
    }).join("\n\n");
    return [
      localize("gettingStarted.title", "Title: {0}", item.title),
      localize(
        "gettingStarted.description",
        "Description: {0}",
        item.description
      ),
      stepsContent
    ].join("\n\n");
  }
  onClose() {
    this._gettingStartedPage.focus();
  }
}
export {
  GettingStartedAccessibleView
};
//# sourceMappingURL=gettingStartedAccessibleView.js.map
