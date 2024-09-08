import { Codicon } from "../../../../base/common/codicons.js";
import { localize } from "../../../../nls.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
const DisassemblyEditorIcon = registerIcon(
  "disassembly-editor-label-icon",
  Codicon.debug,
  localize(
    "disassemblyEditorLabelIcon",
    "Icon of the disassembly editor label."
  )
);
class DisassemblyViewInput extends EditorInput {
  static ID = "debug.disassemblyView.input";
  get typeId() {
    return DisassemblyViewInput.ID;
  }
  static _instance;
  static get instance() {
    if (!DisassemblyViewInput._instance || DisassemblyViewInput._instance.isDisposed()) {
      DisassemblyViewInput._instance = new DisassemblyViewInput();
    }
    return DisassemblyViewInput._instance;
  }
  resource = void 0;
  getName() {
    return localize("disassemblyInputName", "Disassembly");
  }
  getIcon() {
    return DisassemblyEditorIcon;
  }
  matches(other) {
    return other instanceof DisassemblyViewInput;
  }
}
export {
  DisassemblyViewInput
};
