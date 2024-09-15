var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { EditorAction2, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2, MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { StickyScrollController } from "./stickyScrollController.js";
class ToggleStickyScroll extends Action2 {
  static {
    __name(this, "ToggleStickyScroll");
  }
  constructor() {
    super({
      id: "editor.action.toggleStickyScroll",
      title: {
        ...localize2("toggleEditorStickyScroll", "Toggle Editor Sticky Scroll"),
        mnemonicTitle: localize({ key: "mitoggleStickyScroll", comment: ["&& denotes a mnemonic"] }, "&&Toggle Editor Sticky Scroll")
      },
      metadata: {
        description: localize2("toggleEditorStickyScroll.description", "Toggle/enable the editor sticky scroll which shows the nested scopes at the top of the viewport")
      },
      category: Categories.View,
      toggled: {
        condition: ContextKeyExpr.equals("config.editor.stickyScroll.enabled", true),
        title: localize("stickyScroll", "Sticky Scroll"),
        mnemonicTitle: localize({ key: "miStickyScroll", comment: ["&& denotes a mnemonic"] }, "&&Sticky Scroll")
      },
      menu: [
        { id: MenuId.CommandPalette },
        { id: MenuId.MenubarAppearanceMenu, group: "4_editor", order: 3 },
        { id: MenuId.StickyScrollContext }
      ]
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("editor.stickyScroll.enabled");
    return configurationService.updateValue("editor.stickyScroll.enabled", newValue);
  }
}
const weight = KeybindingWeight.EditorContrib;
class FocusStickyScroll extends EditorAction2 {
  static {
    __name(this, "FocusStickyScroll");
  }
  constructor() {
    super({
      id: "editor.action.focusStickyScroll",
      title: {
        ...localize2("focusStickyScroll", "Focus on the editor sticky scroll"),
        mnemonicTitle: localize({ key: "mifocusStickyScroll", comment: ["&& denotes a mnemonic"] }, "&&Focus Sticky Scroll")
      },
      precondition: ContextKeyExpr.and(ContextKeyExpr.has("config.editor.stickyScroll.enabled"), EditorContextKeys.stickyScrollVisible),
      menu: [
        { id: MenuId.CommandPalette }
      ]
    });
  }
  runEditorCommand(_accessor, editor) {
    StickyScrollController.get(editor)?.focus();
  }
}
class SelectNextStickyScrollLine extends EditorAction2 {
  static {
    __name(this, "SelectNextStickyScrollLine");
  }
  constructor() {
    super({
      id: "editor.action.selectNextStickyScrollLine",
      title: localize2("selectNextStickyScrollLine.title", "Select the next editor sticky scroll line"),
      precondition: EditorContextKeys.stickyScrollFocused.isEqualTo(true),
      keybinding: {
        weight,
        primary: KeyCode.DownArrow
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    StickyScrollController.get(editor)?.focusNext();
  }
}
class SelectPreviousStickyScrollLine extends EditorAction2 {
  static {
    __name(this, "SelectPreviousStickyScrollLine");
  }
  constructor() {
    super({
      id: "editor.action.selectPreviousStickyScrollLine",
      title: localize2("selectPreviousStickyScrollLine.title", "Select the previous sticky scroll line"),
      precondition: EditorContextKeys.stickyScrollFocused.isEqualTo(true),
      keybinding: {
        weight,
        primary: KeyCode.UpArrow
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    StickyScrollController.get(editor)?.focusPrevious();
  }
}
class GoToStickyScrollLine extends EditorAction2 {
  static {
    __name(this, "GoToStickyScrollLine");
  }
  constructor() {
    super({
      id: "editor.action.goToFocusedStickyScrollLine",
      title: localize2("goToFocusedStickyScrollLine.title", "Go to the focused sticky scroll line"),
      precondition: EditorContextKeys.stickyScrollFocused.isEqualTo(true),
      keybinding: {
        weight,
        primary: KeyCode.Enter
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    StickyScrollController.get(editor)?.goToFocused();
  }
}
class SelectEditor extends EditorAction2 {
  static {
    __name(this, "SelectEditor");
  }
  constructor() {
    super({
      id: "editor.action.selectEditor",
      title: localize2("selectEditor.title", "Select Editor"),
      precondition: EditorContextKeys.stickyScrollFocused.isEqualTo(true),
      keybinding: {
        weight,
        primary: KeyCode.Escape
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    StickyScrollController.get(editor)?.selectEditor();
  }
}
export {
  FocusStickyScroll,
  GoToStickyScrollLine,
  SelectEditor,
  SelectNextStickyScrollLine,
  SelectPreviousStickyScrollLine,
  ToggleStickyScroll
};
//# sourceMappingURL=stickyScrollActions.js.map
