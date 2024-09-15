var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { asyncTransaction, transaction } from "../../../../../base/common/observable.js";
import * as nls from "../../../../../nls.js";
import { Action2, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { EditorAction, ServicesAccessor } from "../../../../browser/editorExtensions.js";
import { EditorContextKeys } from "../../../../common/editorContextKeys.js";
import { Context as SuggestContext } from "../../../suggest/browser/suggest.js";
import { inlineSuggestCommitId, showNextInlineSuggestionActionId, showPreviousInlineSuggestionActionId } from "./commandIds.js";
import { InlineCompletionContextKeys } from "./inlineCompletionContextKeys.js";
import { InlineCompletionsController } from "./inlineCompletionsController.js";
class ShowNextInlineSuggestionAction extends EditorAction {
  static {
    __name(this, "ShowNextInlineSuggestionAction");
  }
  static ID = showNextInlineSuggestionActionId;
  constructor() {
    super({
      id: ShowNextInlineSuggestionAction.ID,
      label: nls.localize("action.inlineSuggest.showNext", "Show Next Inline Suggestion"),
      alias: "Show Next Inline Suggestion",
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: 100,
        primary: KeyMod.Alt | KeyCode.BracketRight
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    controller?.model.get()?.next();
  }
}
class ShowPreviousInlineSuggestionAction extends EditorAction {
  static {
    __name(this, "ShowPreviousInlineSuggestionAction");
  }
  static ID = showPreviousInlineSuggestionActionId;
  constructor() {
    super({
      id: ShowPreviousInlineSuggestionAction.ID,
      label: nls.localize("action.inlineSuggest.showPrevious", "Show Previous Inline Suggestion"),
      alias: "Show Previous Inline Suggestion",
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: 100,
        primary: KeyMod.Alt | KeyCode.BracketLeft
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    controller?.model.get()?.previous();
  }
}
class TriggerInlineSuggestionAction extends EditorAction {
  static {
    __name(this, "TriggerInlineSuggestionAction");
  }
  constructor() {
    super({
      id: "editor.action.inlineSuggest.trigger",
      label: nls.localize("action.inlineSuggest.trigger", "Trigger Inline Suggestion"),
      alias: "Trigger Inline Suggestion",
      precondition: EditorContextKeys.writable
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    await asyncTransaction(async (tx) => {
      await controller?.model.get()?.triggerExplicitly(tx);
      controller?.playAccessibilitySignal(tx);
    });
  }
}
class AcceptNextWordOfInlineCompletion extends EditorAction {
  static {
    __name(this, "AcceptNextWordOfInlineCompletion");
  }
  constructor() {
    super({
      id: "editor.action.inlineSuggest.acceptNextWord",
      label: nls.localize("action.inlineSuggest.acceptNextWord", "Accept Next Word Of Inline Suggestion"),
      alias: "Accept Next Word Of Inline Suggestion",
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: KeybindingWeight.EditorContrib + 1,
        primary: KeyMod.CtrlCmd | KeyCode.RightArrow,
        kbExpr: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible)
      },
      menuOpts: [{
        menuId: MenuId.InlineSuggestionToolbar,
        title: nls.localize("acceptWord", "Accept Word"),
        group: "primary",
        order: 2
      }]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    await controller?.model.get()?.acceptNextWord(controller.editor);
  }
}
class AcceptNextLineOfInlineCompletion extends EditorAction {
  static {
    __name(this, "AcceptNextLineOfInlineCompletion");
  }
  constructor() {
    super({
      id: "editor.action.inlineSuggest.acceptNextLine",
      label: nls.localize("action.inlineSuggest.acceptNextLine", "Accept Next Line Of Inline Suggestion"),
      alias: "Accept Next Line Of Inline Suggestion",
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: KeybindingWeight.EditorContrib + 1
      },
      menuOpts: [{
        menuId: MenuId.InlineSuggestionToolbar,
        title: nls.localize("acceptLine", "Accept Line"),
        group: "secondary",
        order: 2
      }]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    await controller?.model.get()?.acceptNextLine(controller.editor);
  }
}
class AcceptInlineCompletion extends EditorAction {
  static {
    __name(this, "AcceptInlineCompletion");
  }
  constructor() {
    super({
      id: inlineSuggestCommitId,
      label: nls.localize("action.inlineSuggest.accept", "Accept Inline Suggestion"),
      alias: "Accept Inline Suggestion",
      precondition: InlineCompletionContextKeys.inlineSuggestionVisible,
      menuOpts: [{
        menuId: MenuId.InlineSuggestionToolbar,
        title: nls.localize("accept", "Accept"),
        group: "primary",
        order: 1
      }],
      kbOpts: {
        primary: KeyCode.Tab,
        weight: 200,
        kbExpr: ContextKeyExpr.and(
          InlineCompletionContextKeys.inlineSuggestionVisible,
          EditorContextKeys.tabMovesFocus.toNegated(),
          InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize,
          SuggestContext.Visible.toNegated(),
          EditorContextKeys.hoverFocused.toNegated()
        )
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    if (controller) {
      controller.model.get()?.accept(controller.editor);
      controller.editor.focus();
    }
  }
}
class HideInlineCompletion extends EditorAction {
  static {
    __name(this, "HideInlineCompletion");
  }
  static ID = "editor.action.inlineSuggest.hide";
  constructor() {
    super({
      id: HideInlineCompletion.ID,
      label: nls.localize("action.inlineSuggest.hide", "Hide Inline Suggestion"),
      alias: "Hide Inline Suggestion",
      precondition: InlineCompletionContextKeys.inlineSuggestionVisible,
      kbOpts: {
        weight: 100,
        primary: KeyCode.Escape
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    transaction((tx) => {
      controller?.model.get()?.stop(tx);
    });
  }
}
class ToggleAlwaysShowInlineSuggestionToolbar extends Action2 {
  static {
    __name(this, "ToggleAlwaysShowInlineSuggestionToolbar");
  }
  static ID = "editor.action.inlineSuggest.toggleAlwaysShowToolbar";
  constructor() {
    super({
      id: ToggleAlwaysShowInlineSuggestionToolbar.ID,
      title: nls.localize("action.inlineSuggest.alwaysShowToolbar", "Always Show Toolbar"),
      f1: false,
      precondition: void 0,
      menu: [{
        id: MenuId.InlineSuggestionToolbar,
        group: "secondary",
        order: 10
      }],
      toggled: ContextKeyExpr.equals("config.editor.inlineSuggest.showToolbar", "always")
    });
  }
  async run(accessor, editor) {
    const configService = accessor.get(IConfigurationService);
    const currentValue = configService.getValue("editor.inlineSuggest.showToolbar");
    const newValue = currentValue === "always" ? "onHover" : "always";
    configService.updateValue("editor.inlineSuggest.showToolbar", newValue);
  }
}
export {
  AcceptInlineCompletion,
  AcceptNextLineOfInlineCompletion,
  AcceptNextWordOfInlineCompletion,
  HideInlineCompletion,
  ShowNextInlineSuggestionAction,
  ShowPreviousInlineSuggestionAction,
  ToggleAlwaysShowInlineSuggestionToolbar,
  TriggerInlineSuggestionAction
};
//# sourceMappingURL=commands.js.map
