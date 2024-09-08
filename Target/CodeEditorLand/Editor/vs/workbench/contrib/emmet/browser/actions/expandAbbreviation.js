import { KeyCode } from "../../../../../base/common/keyCodes.js";
import { registerEditorAction } from "../../../../../editor/browser/editorExtensions.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import * as nls from "../../../../../nls.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { EmmetEditorAction } from "../emmetActions.js";
class ExpandAbbreviationAction extends EmmetEditorAction {
  constructor() {
    super({
      id: "editor.emmet.action.expandAbbreviation",
      label: nls.localize(
        "expandAbbreviationAction",
        "Emmet: Expand Abbreviation"
      ),
      alias: "Emmet: Expand Abbreviation",
      precondition: EditorContextKeys.writable,
      actionName: "expand_abbreviation",
      kbOpts: {
        primary: KeyCode.Tab,
        kbExpr: ContextKeyExpr.and(
          EditorContextKeys.editorTextFocus,
          EditorContextKeys.tabDoesNotMoveFocus,
          ContextKeyExpr.has("config.emmet.triggerExpansionOnTab")
        ),
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarEditMenu,
        group: "5_insert",
        title: nls.localize(
          {
            key: "miEmmetExpandAbbreviation",
            comment: ["&& denotes a mnemonic"]
          },
          "Emmet: E&&xpand Abbreviation"
        ),
        order: 3
      }
    });
  }
}
registerEditorAction(ExpandAbbreviationAction);
