var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/gettingStarted.css";
import { localize } from "../../../../nls.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { URI } from "../../../../base/common/uri.js";
import { Schemas } from "../../../../base/common/network.js";
import { IUntypedEditorInput } from "../../../common/editor.js";
import { IEditorOptions } from "../../../../platform/editor/common/editor.js";
const gettingStartedInputTypeId = "workbench.editors.gettingStartedInput";
class GettingStartedInput extends EditorInput {
  static {
    __name(this, "GettingStartedInput");
  }
  static ID = gettingStartedInputTypeId;
  static RESOURCE = URI.from({ scheme: Schemas.walkThrough, authority: "vscode_getting_started_page" });
  get typeId() {
    return GettingStartedInput.ID;
  }
  get editorId() {
    return this.typeId;
  }
  toUntyped() {
    return {
      resource: GettingStartedInput.RESOURCE,
      options: {
        override: GettingStartedInput.ID,
        pinned: false
      }
    };
  }
  get resource() {
    return GettingStartedInput.RESOURCE;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    if (other instanceof GettingStartedInput) {
      return other.selectedCategory === this.selectedCategory;
    }
    return false;
  }
  constructor(options) {
    super();
    this.selectedCategory = options.selectedCategory;
    this.selectedStep = options.selectedStep;
    this.showTelemetryNotice = !!options.showTelemetryNotice;
  }
  getName() {
    return localize("getStarted", "Welcome");
  }
  selectedCategory;
  selectedStep;
  showTelemetryNotice;
}
export {
  GettingStartedInput,
  gettingStartedInputTypeId
};
//# sourceMappingURL=gettingStartedInput.js.map
