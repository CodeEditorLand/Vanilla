import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { localize, localize2 } from "../../../../nls.js";
import {
  MenuId,
  MenuRegistry
} from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import {
  KeybindingWeight,
  KeybindingsRegistry
} from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  ActiveCompareEditorCanSwapContext,
  TextCompareEditorActiveContext,
  TextCompareEditorVisibleContext
} from "../../../common/contextkeys.js";
import { DiffEditorInput } from "../../../common/editor/diffEditorInput.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { TextDiffEditor } from "./textDiffEditor.js";
const TOGGLE_DIFF_SIDE_BY_SIDE = "toggle.diff.renderSideBySide";
const GOTO_NEXT_CHANGE = "workbench.action.compareEditor.nextChange";
const GOTO_PREVIOUS_CHANGE = "workbench.action.compareEditor.previousChange";
const DIFF_FOCUS_PRIMARY_SIDE = "workbench.action.compareEditor.focusPrimarySide";
const DIFF_FOCUS_SECONDARY_SIDE = "workbench.action.compareEditor.focusSecondarySide";
const DIFF_FOCUS_OTHER_SIDE = "workbench.action.compareEditor.focusOtherSide";
const DIFF_OPEN_SIDE = "workbench.action.compareEditor.openSide";
const TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE = "toggle.diff.ignoreTrimWhitespace";
const DIFF_SWAP_SIDES = "workbench.action.compareEditor.swapSides";
function registerDiffEditorCommands() {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: GOTO_NEXT_CHANGE,
    weight: KeybindingWeight.WorkbenchContrib,
    when: TextCompareEditorVisibleContext,
    primary: KeyMod.Alt | KeyCode.F5,
    handler: (accessor, ...args) => navigateInDiffEditor(accessor, args, true)
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: GOTO_NEXT_CHANGE,
      title: localize2("compare.nextChange", "Go to Next Change")
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: GOTO_PREVIOUS_CHANGE,
    weight: KeybindingWeight.WorkbenchContrib,
    when: TextCompareEditorVisibleContext,
    primary: KeyMod.Alt | KeyMod.Shift | KeyCode.F5,
    handler: (accessor, ...args) => navigateInDiffEditor(accessor, args, false)
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: GOTO_PREVIOUS_CHANGE,
      title: localize2("compare.previousChange", "Go to Previous Change")
    }
  });
  function getActiveTextDiffEditor(accessor, args) {
    const editorService = accessor.get(IEditorService);
    const resource = args.length > 0 && args[0] instanceof URI ? args[0] : void 0;
    for (const editor of [
      editorService.activeEditorPane,
      ...editorService.visibleEditorPanes
    ]) {
      if (editor instanceof TextDiffEditor && (!resource || editor.input instanceof DiffEditorInput && isEqual(editor.input.primary.resource, resource))) {
        return editor;
      }
    }
    return void 0;
  }
  function navigateInDiffEditor(accessor, args, next) {
    const activeTextDiffEditor = getActiveTextDiffEditor(accessor, args);
    if (activeTextDiffEditor) {
      activeTextDiffEditor.getControl()?.goToDiff(next ? "next" : "previous");
    }
  }
  let FocusTextDiffEditorMode;
  ((FocusTextDiffEditorMode2) => {
    FocusTextDiffEditorMode2[FocusTextDiffEditorMode2["Original"] = 0] = "Original";
    FocusTextDiffEditorMode2[FocusTextDiffEditorMode2["Modified"] = 1] = "Modified";
    FocusTextDiffEditorMode2[FocusTextDiffEditorMode2["Toggle"] = 2] = "Toggle";
  })(FocusTextDiffEditorMode || (FocusTextDiffEditorMode = {}));
  function focusInDiffEditor(accessor, args, mode) {
    const activeTextDiffEditor = getActiveTextDiffEditor(accessor, args);
    if (activeTextDiffEditor) {
      switch (mode) {
        case 0 /* Original */:
          activeTextDiffEditor.getControl()?.getOriginalEditor().focus();
          break;
        case 1 /* Modified */:
          activeTextDiffEditor.getControl()?.getModifiedEditor().focus();
          break;
        case 2 /* Toggle */:
          if (activeTextDiffEditor.getControl()?.getModifiedEditor().hasWidgetFocus()) {
            return focusInDiffEditor(
              accessor,
              args,
              0 /* Original */
            );
          } else {
            return focusInDiffEditor(
              accessor,
              args,
              1 /* Modified */
            );
          }
      }
    }
  }
  function toggleDiffSideBySide(accessor, args) {
    const configService = accessor.get(ITextResourceConfigurationService);
    const activeTextDiffEditor = getActiveTextDiffEditor(accessor, args);
    const m = activeTextDiffEditor?.getControl()?.getModifiedEditor()?.getModel();
    if (!m) {
      return;
    }
    const key = "diffEditor.renderSideBySide";
    const val = configService.getValue(m.uri, key);
    configService.updateValue(m.uri, key, !val);
  }
  function toggleDiffIgnoreTrimWhitespace(accessor, args) {
    const configService = accessor.get(ITextResourceConfigurationService);
    const activeTextDiffEditor = getActiveTextDiffEditor(accessor, args);
    const m = activeTextDiffEditor?.getControl()?.getModifiedEditor()?.getModel();
    if (!m) {
      return;
    }
    const key = "diffEditor.ignoreTrimWhitespace";
    const val = configService.getValue(m.uri, key);
    configService.updateValue(m.uri, key, !val);
  }
  async function swapDiffSides(accessor, args) {
    const editorService = accessor.get(IEditorService);
    const diffEditor = getActiveTextDiffEditor(accessor, args);
    const activeGroup = diffEditor?.group;
    const diffInput = diffEditor?.input;
    if (!diffEditor || typeof activeGroup === "undefined" || !(diffInput instanceof DiffEditorInput) || !diffInput.modified.resource) {
      return;
    }
    const untypedDiffInput = diffInput.toUntyped({
      preserveViewState: activeGroup.id,
      preserveResource: true
    });
    if (!untypedDiffInput) {
      return;
    }
    if (diffInput.modified.isModified() && editorService.findEditors({
      resource: diffInput.modified.resource,
      typeId: diffInput.modified.typeId,
      editorId: diffInput.modified.editorId
    }).length === 0) {
      await editorService.openEditor(
        {
          ...untypedDiffInput.modified,
          options: {
            ...untypedDiffInput.modified.options,
            pinned: true,
            inactive: true
          }
        },
        activeGroup
      );
    }
    await editorService.replaceEditors(
      [
        {
          editor: diffInput,
          replacement: {
            ...untypedDiffInput,
            original: untypedDiffInput.modified,
            modified: untypedDiffInput.original,
            options: {
              ...untypedDiffInput.options,
              pinned: true
            }
          }
        }
      ],
      activeGroup
    );
  }
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: TOGGLE_DIFF_SIDE_BY_SIDE,
    weight: KeybindingWeight.WorkbenchContrib,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args) => toggleDiffSideBySide(accessor, args)
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_FOCUS_PRIMARY_SIDE,
    weight: KeybindingWeight.WorkbenchContrib,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args) => focusInDiffEditor(accessor, args, 1 /* Modified */)
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_FOCUS_SECONDARY_SIDE,
    weight: KeybindingWeight.WorkbenchContrib,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args) => focusInDiffEditor(accessor, args, 0 /* Original */)
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_FOCUS_OTHER_SIDE,
    weight: KeybindingWeight.WorkbenchContrib,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args) => focusInDiffEditor(accessor, args, 2 /* Toggle */)
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
    weight: KeybindingWeight.WorkbenchContrib,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args) => toggleDiffIgnoreTrimWhitespace(accessor, args)
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_SWAP_SIDES,
    weight: KeybindingWeight.WorkbenchContrib,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args) => swapDiffSides(accessor, args)
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: TOGGLE_DIFF_SIDE_BY_SIDE,
      title: localize2("toggleInlineView", "Toggle Inline View"),
      category: localize("compare", "Compare")
    },
    when: TextCompareEditorActiveContext
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: DIFF_SWAP_SIDES,
      title: localize2(
        "swapDiffSides",
        "Swap Left and Right Editor Side"
      ),
      category: localize("compare", "Compare")
    },
    when: ContextKeyExpr.and(
      TextCompareEditorActiveContext,
      ActiveCompareEditorCanSwapContext
    )
  });
}
export {
  DIFF_FOCUS_OTHER_SIDE,
  DIFF_FOCUS_PRIMARY_SIDE,
  DIFF_FOCUS_SECONDARY_SIDE,
  DIFF_OPEN_SIDE,
  DIFF_SWAP_SIDES,
  GOTO_NEXT_CHANGE,
  GOTO_PREVIOUS_CHANGE,
  TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
  TOGGLE_DIFF_SIDE_BY_SIDE,
  registerDiffEditorCommands
};
