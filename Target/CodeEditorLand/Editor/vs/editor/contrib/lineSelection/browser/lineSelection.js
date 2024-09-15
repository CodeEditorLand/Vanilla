var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import * as nls from "../../../../nls.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  EditorAction,
  registerEditorAction
} from "../../../browser/editorExtensions.js";
import { CursorMoveCommands } from "../../../common/cursor/cursorMoveCommands.js";
import { CursorChangeReason } from "../../../common/cursorEvents.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
class ExpandLineSelectionAction extends EditorAction {
  static {
    __name(this, "ExpandLineSelectionAction");
  }
  constructor() {
    super({
      id: "expandLineSelection",
      label: nls.localize("expandLineSelection", "Expand Line Selection"),
      alias: "Expand Line Selection",
      precondition: void 0,
      kbOpts: {
        weight: KeybindingWeight.EditorCore,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: KeyMod.CtrlCmd | KeyCode.KeyL
      }
    });
  }
  run(_accessor, editor, args) {
    args = args || {};
    if (!editor.hasModel()) {
      return;
    }
    const viewModel = editor._getViewModel();
    viewModel.model.pushStackElement();
    viewModel.setCursorStates(
      args.source,
      CursorChangeReason.Explicit,
      CursorMoveCommands.expandLineSelection(
        viewModel,
        viewModel.getCursorStates()
      )
    );
    viewModel.revealAllCursors(args.source, true);
  }
}
registerEditorAction(ExpandLineSelectionAction);
export {
  ExpandLineSelectionAction
};
//# sourceMappingURL=lineSelection.js.map
