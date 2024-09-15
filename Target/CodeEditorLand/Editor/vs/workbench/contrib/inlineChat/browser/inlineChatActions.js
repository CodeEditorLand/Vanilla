var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { ICodeEditor, isCodeEditor, isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import { EditorAction2 } from "../../../../editor/browser/editorExtensions.js";
import { EmbeddedDiffEditorWidget } from "../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js";
import { EmbeddedCodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { InlineChatController, InlineChatRunOptions } from "./inlineChatController.js";
import { ACTION_ACCEPT_CHANGES, CTX_INLINE_CHAT_HAS_AGENT, CTX_INLINE_CHAT_HAS_STASHED_SESSION, CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_INNER_CURSOR_FIRST, CTX_INLINE_CHAT_INNER_CURSOR_LAST, CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_OUTER_CURSOR_POSITION, CTX_INLINE_CHAT_USER_DID_EDIT, CTX_INLINE_CHAT_DOCUMENT_CHANGED, CTX_INLINE_CHAT_EDIT_MODE, EditMode, MENU_INLINE_CHAT_WIDGET_STATUS, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS, CTX_INLINE_CHAT_RESPONSE_TYPE, InlineChatResponseType, ACTION_REGENERATE_RESPONSE, ACTION_VIEW_IN_CHAT, ACTION_TOGGLE_DIFF, CTX_INLINE_CHAT_CHANGE_HAS_DIFF, CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF, MENU_INLINE_CHAT_ZONE, ACTION_DISCARD_CHANGES } from "../common/inlineChat.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, IAction2Options } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../platform/accessibility/common/accessibility.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IChatService } from "../../chat/common/chatService.js";
import { CONTEXT_CHAT_INPUT_HAS_TEXT, CONTEXT_IN_CHAT_INPUT } from "../../chat/common/chatContextKeys.js";
import { HunkInformation } from "./inlineChatSession.js";
CommandsRegistry.registerCommandAlias("interactiveEditor.start", "inlineChat.start");
CommandsRegistry.registerCommandAlias("interactive.acceptChanges", ACTION_ACCEPT_CHANGES);
const LOCALIZED_START_INLINE_CHAT_STRING = localize2("run", "Start in Editor");
const START_INLINE_CHAT = registerIcon("start-inline-chat", Codicon.sparkle, localize("startInlineChat", "Icon which spawns the inline chat from the editor toolbar."));
let _holdForSpeech = void 0;
function setHoldForSpeech(holdForSpeech) {
  _holdForSpeech = holdForSpeech;
}
__name(setHoldForSpeech, "setHoldForSpeech");
class StartSessionAction extends EditorAction2 {
  static {
    __name(this, "StartSessionAction");
  }
  constructor() {
    super({
      id: "inlineChat.start",
      title: LOCALIZED_START_INLINE_CHAT_STRING,
      category: AbstractInlineChatAction.category,
      f1: true,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT, EditorContextKeys.writable),
      keybinding: {
        when: EditorContextKeys.focus,
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyCode.KeyI,
        secondary: [KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyCode.KeyI)]
      },
      icon: START_INLINE_CHAT
    });
  }
  runEditorCommand(accessor, editor, ..._args) {
    const ctrl = InlineChatController.get(editor);
    if (!ctrl) {
      return;
    }
    if (_holdForSpeech) {
      accessor.get(IInstantiationService).invokeFunction(_holdForSpeech, ctrl, this);
    }
    let options;
    const arg = _args[0];
    if (arg && InlineChatRunOptions.isInlineChatRunOptions(arg)) {
      options = arg;
    }
    InlineChatController.get(editor)?.run({ ...options });
  }
}
class UnstashSessionAction extends EditorAction2 {
  static {
    __name(this, "UnstashSessionAction");
  }
  constructor() {
    super({
      id: "inlineChat.unstash",
      title: localize2("unstash", "Resume Last Dismissed Inline Chat"),
      category: AbstractInlineChatAction.category,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_STASHED_SESSION, EditorContextKeys.writable),
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyCode.KeyZ
      }
    });
  }
  async runEditorCommand(_accessor, editor, ..._args) {
    const ctrl = InlineChatController.get(editor);
    if (ctrl) {
      const session = ctrl.unstashLastSession();
      if (session) {
        ctrl.run({
          existingSession: session,
          isUnstashed: true
        });
      }
    }
  }
}
class AbstractInlineChatAction extends EditorAction2 {
  static {
    __name(this, "AbstractInlineChatAction");
  }
  static category = localize2("cat", "Inline Chat");
  constructor(desc) {
    super({
      ...desc,
      category: AbstractInlineChatAction.category,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT, desc.precondition)
    });
  }
  runEditorCommand(accessor, editor, ..._args) {
    const editorService = accessor.get(IEditorService);
    const logService = accessor.get(ILogService);
    let ctrl = InlineChatController.get(editor);
    if (!ctrl) {
      const { activeTextEditorControl } = editorService;
      if (isCodeEditor(activeTextEditorControl)) {
        editor = activeTextEditorControl;
      } else if (isDiffEditor(activeTextEditorControl)) {
        editor = activeTextEditorControl.getModifiedEditor();
      }
      ctrl = InlineChatController.get(editor);
    }
    if (!ctrl) {
      logService.warn("[IE] NO controller found for action", this.desc.id, editor.getModel()?.uri);
      return;
    }
    if (editor instanceof EmbeddedCodeEditorWidget) {
      editor = editor.getParentEditor();
    }
    if (!ctrl) {
      for (const diffEditor of accessor.get(ICodeEditorService).listDiffEditors()) {
        if (diffEditor.getOriginalEditor() === editor || diffEditor.getModifiedEditor() === editor) {
          if (diffEditor instanceof EmbeddedDiffEditorWidget) {
            this.runEditorCommand(accessor, diffEditor.getParentEditor(), ..._args);
          }
        }
      }
      return;
    }
    this.runInlineChatCommand(accessor, ctrl, editor, ..._args);
  }
}
class ArrowOutUpAction extends AbstractInlineChatAction {
  static {
    __name(this, "ArrowOutUpAction");
  }
  constructor() {
    super({
      id: "inlineChat.arrowOutUp",
      title: localize("arrowUp", "Cursor Up"),
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_INNER_CURSOR_FIRST, EditorContextKeys.isEmbeddedDiffEditor.negate(), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      keybinding: {
        weight: KeybindingWeight.EditorCore,
        primary: KeyMod.CtrlCmd | KeyCode.UpArrow
      }
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    ctrl.arrowOut(true);
  }
}
class ArrowOutDownAction extends AbstractInlineChatAction {
  static {
    __name(this, "ArrowOutDownAction");
  }
  constructor() {
    super({
      id: "inlineChat.arrowOutDown",
      title: localize("arrowDown", "Cursor Down"),
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_INNER_CURSOR_LAST, EditorContextKeys.isEmbeddedDiffEditor.negate(), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      keybinding: {
        weight: KeybindingWeight.EditorCore,
        primary: KeyMod.CtrlCmd | KeyCode.DownArrow
      }
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    ctrl.arrowOut(false);
  }
}
class FocusInlineChat extends EditorAction2 {
  static {
    __name(this, "FocusInlineChat");
  }
  constructor() {
    super({
      id: "inlineChat.focus",
      title: localize2("focus", "Focus Input"),
      f1: true,
      category: AbstractInlineChatAction.category,
      precondition: ContextKeyExpr.and(EditorContextKeys.editorTextFocus, CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_FOCUSED.negate(), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      keybinding: [{
        weight: KeybindingWeight.EditorCore + 10,
        // win against core_command
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.isEqualTo("above"), EditorContextKeys.isEmbeddedDiffEditor.negate()),
        primary: KeyMod.CtrlCmd | KeyCode.DownArrow
      }, {
        weight: KeybindingWeight.EditorCore + 10,
        // win against core_command
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.isEqualTo("below"), EditorContextKeys.isEmbeddedDiffEditor.negate()),
        primary: KeyMod.CtrlCmd | KeyCode.UpArrow
      }]
    });
  }
  runEditorCommand(_accessor, editor, ..._args) {
    InlineChatController.get(editor)?.focus();
  }
}
class DiscardAction extends AbstractInlineChatAction {
  static {
    __name(this, "DiscardAction");
  }
  constructor() {
    super({
      id: "inlineChat.discard",
      title: localize("discard", "Discard"),
      icon: Codicon.discard,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      keybinding: {
        weight: KeybindingWeight.EditorContrib - 1,
        primary: KeyCode.Escape,
        when: CTX_INLINE_CHAT_USER_DID_EDIT.negate()
      }
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    await ctrl.cancelSession();
  }
}
class AcceptChanges extends AbstractInlineChatAction {
  static {
    __name(this, "AcceptChanges");
  }
  constructor() {
    super({
      id: ACTION_ACCEPT_CHANGES,
      title: localize2("apply1", "Accept Changes"),
      shortTitle: localize("apply2", "Accept"),
      icon: Codicon.check,
      f1: true,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, ContextKeyExpr.or(CTX_INLINE_CHAT_DOCUMENT_CHANGED.toNegated(), CTX_INLINE_CHAT_EDIT_MODE.notEqualsTo(EditMode.Preview))),
      keybinding: [{
        weight: KeybindingWeight.WorkbenchContrib + 10,
        primary: KeyMod.CtrlCmd | KeyCode.Enter
      }],
      menu: [{
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 1,
        when: ContextKeyExpr.and(
          CONTEXT_CHAT_INPUT_HAS_TEXT.toNegated(),
          CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.toNegated(),
          CTX_INLINE_CHAT_RESPONSE_TYPE.isEqualTo(InlineChatResponseType.MessagesAndEdits)
        )
      }, {
        id: MENU_INLINE_CHAT_ZONE,
        group: "navigation",
        order: 1
      }]
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor, hunk) {
    ctrl.acceptHunk(hunk);
  }
}
class DiscardHunkAction extends AbstractInlineChatAction {
  static {
    __name(this, "DiscardHunkAction");
  }
  constructor() {
    super({
      id: ACTION_DISCARD_CHANGES,
      title: localize("discard", "Discard"),
      icon: Codicon.chromeClose,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      menu: [{
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 2,
        when: ContextKeyExpr.and(
          CONTEXT_CHAT_INPUT_HAS_TEXT.toNegated(),
          CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.negate(),
          CTX_INLINE_CHAT_RESPONSE_TYPE.isEqualTo(InlineChatResponseType.MessagesAndEdits),
          CTX_INLINE_CHAT_EDIT_MODE.isEqualTo(EditMode.Live)
        )
      }, {
        id: MENU_INLINE_CHAT_ZONE,
        group: "navigation",
        order: 2
      }],
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyCode.Escape,
        when: CTX_INLINE_CHAT_RESPONSE_TYPE.isEqualTo(InlineChatResponseType.MessagesAndEdits)
      }
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor, hunk) {
    return ctrl.discardHunk(hunk);
  }
}
class RerunAction extends AbstractInlineChatAction {
  static {
    __name(this, "RerunAction");
  }
  constructor() {
    super({
      id: ACTION_REGENERATE_RESPONSE,
      title: localize2("chat.rerun.label", "Rerun Request"),
      shortTitle: localize("rerun", "Rerun"),
      f1: false,
      icon: Codicon.refresh,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      menu: {
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 5,
        when: ContextKeyExpr.and(
          CONTEXT_CHAT_INPUT_HAS_TEXT.toNegated(),
          CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.negate(),
          CTX_INLINE_CHAT_RESPONSE_TYPE.notEqualsTo(InlineChatResponseType.None)
        )
      },
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyCode.KeyR
      }
    });
  }
  async runInlineChatCommand(accessor, ctrl, _editor, ..._args) {
    const chatService = accessor.get(IChatService);
    const model = ctrl.chatWidget.viewModel?.model;
    const lastRequest = model?.getRequests().at(-1);
    if (lastRequest) {
      await chatService.resendRequest(lastRequest, { noCommandDetection: false, attempt: lastRequest.attempt + 1, location: ctrl.chatWidget.location });
    }
  }
}
class CloseAction extends AbstractInlineChatAction {
  static {
    __name(this, "CloseAction");
  }
  constructor() {
    super({
      id: "inlineChat.close",
      title: localize("close", "Close"),
      icon: Codicon.close,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyCode.Escape
      },
      menu: [{
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 1,
        when: ContextKeyExpr.and(
          CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.negate(),
          ContextKeyExpr.or(
            CTX_INLINE_CHAT_RESPONSE_TYPE.isEqualTo(InlineChatResponseType.Messages),
            CTX_INLINE_CHAT_EDIT_MODE.isEqualTo(EditMode.Preview)
          )
        )
      }]
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    ctrl.cancelSession();
  }
}
class ConfigureInlineChatAction extends AbstractInlineChatAction {
  static {
    __name(this, "ConfigureInlineChatAction");
  }
  constructor() {
    super({
      id: "inlineChat.configure",
      title: localize2("configure", "Configure Inline Chat"),
      icon: Codicon.settingsGear,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      f1: true,
      menu: {
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "zzz",
        order: 5
      }
    });
  }
  async runInlineChatCommand(accessor, ctrl, _editor, ..._args) {
    accessor.get(IPreferencesService).openSettings({ query: "inlineChat" });
  }
}
class MoveToNextHunk extends AbstractInlineChatAction {
  static {
    __name(this, "MoveToNextHunk");
  }
  constructor() {
    super({
      id: "inlineChat.moveToNextHunk",
      title: localize2("moveToNextHunk", "Move to Next Change"),
      precondition: CTX_INLINE_CHAT_VISIBLE,
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyCode.F7
      }
    });
  }
  runInlineChatCommand(accessor, ctrl, editor, ...args) {
    ctrl.moveHunk(true);
  }
}
class MoveToPreviousHunk extends AbstractInlineChatAction {
  static {
    __name(this, "MoveToPreviousHunk");
  }
  constructor() {
    super({
      id: "inlineChat.moveToPreviousHunk",
      title: localize2("moveToPreviousHunk", "Move to Previous Change"),
      f1: true,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.Shift | KeyCode.F7
      }
    });
  }
  runInlineChatCommand(accessor, ctrl, editor, ...args) {
    ctrl.moveHunk(false);
  }
}
class ViewInChatAction extends AbstractInlineChatAction {
  static {
    __name(this, "ViewInChatAction");
  }
  constructor() {
    super({
      id: ACTION_VIEW_IN_CHAT,
      title: localize("viewInChat", "View in Chat"),
      icon: Codicon.commentDiscussion,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      menu: [{
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "more",
        order: 1,
        when: CTX_INLINE_CHAT_RESPONSE_TYPE.notEqualsTo(InlineChatResponseType.Messages)
      }, {
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 1,
        when: ContextKeyExpr.and(
          CONTEXT_CHAT_INPUT_HAS_TEXT.toNegated(),
          CTX_INLINE_CHAT_RESPONSE_TYPE.isEqualTo(InlineChatResponseType.Messages),
          CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.negate()
        )
      }],
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyCode.DownArrow,
        when: CONTEXT_IN_CHAT_INPUT
      }
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    return ctrl.viewInChat();
  }
}
class ToggleDiffForChange extends AbstractInlineChatAction {
  static {
    __name(this, "ToggleDiffForChange");
  }
  constructor() {
    super({
      id: ACTION_TOGGLE_DIFF,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_EDIT_MODE.isEqualTo(EditMode.Live), CTX_INLINE_CHAT_CHANGE_HAS_DIFF),
      title: localize2("showChanges", "Toggle Changes"),
      icon: Codicon.diffSingle,
      toggled: {
        condition: CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF
      },
      menu: [{
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "zzz",
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_EDIT_MODE.isEqualTo(EditMode.Live)),
        order: 1
      }, {
        id: MENU_INLINE_CHAT_ZONE,
        group: "navigation",
        when: CTX_INLINE_CHAT_CHANGE_HAS_DIFF,
        order: 2
      }]
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, hunkInfo) {
    ctrl.toggleDiff(hunkInfo);
  }
}
export {
  AbstractInlineChatAction,
  AcceptChanges,
  ArrowOutDownAction,
  ArrowOutUpAction,
  CloseAction,
  ConfigureInlineChatAction,
  DiscardAction,
  DiscardHunkAction,
  FocusInlineChat,
  LOCALIZED_START_INLINE_CHAT_STRING,
  MoveToNextHunk,
  MoveToPreviousHunk,
  RerunAction,
  START_INLINE_CHAT,
  StartSessionAction,
  ToggleDiffForChange,
  UnstashSessionAction,
  ViewInChatAction,
  setHoldForSpeech
};
//# sourceMappingURL=inlineChatActions.js.map
