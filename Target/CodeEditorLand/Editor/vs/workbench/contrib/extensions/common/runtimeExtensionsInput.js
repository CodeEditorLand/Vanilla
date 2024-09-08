import { Codicon } from "../../../../base/common/codicons.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import {
  EditorInputCapabilities
} from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
const RuntimeExtensionsEditorIcon = registerIcon(
  "runtime-extensions-editor-label-icon",
  Codicon.extensions,
  nls.localize(
    "runtimeExtensionEditorLabelIcon",
    "Icon of the runtime extensions editor label."
  )
);
class RuntimeExtensionsInput extends EditorInput {
  static ID = "workbench.runtimeExtensions.input";
  get typeId() {
    return RuntimeExtensionsInput.ID;
  }
  get capabilities() {
    return EditorInputCapabilities.Readonly | EditorInputCapabilities.Singleton;
  }
  static _instance;
  static get instance() {
    if (!RuntimeExtensionsInput._instance || RuntimeExtensionsInput._instance.isDisposed()) {
      RuntimeExtensionsInput._instance = new RuntimeExtensionsInput();
    }
    return RuntimeExtensionsInput._instance;
  }
  resource = URI.from({
    scheme: "runtime-extensions",
    path: "default"
  });
  getName() {
    return nls.localize("extensionsInputName", "Running Extensions");
  }
  getIcon() {
    return RuntimeExtensionsEditorIcon;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof RuntimeExtensionsInput;
  }
}
export {
  RuntimeExtensionsInput
};
