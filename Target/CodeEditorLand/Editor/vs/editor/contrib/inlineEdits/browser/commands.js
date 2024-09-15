var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { asyncTransaction, transaction } from "../../../../base/common/observable.js";
import * as nls from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { EmbeddedCodeEditorWidget } from "../../../browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { inlineEditAcceptId, inlineEditVisible, showNextInlineEditActionId, showPreviousInlineEditActionId } from "./consts.js";
import { InlineEditsController } from "./inlineEditsController.js";
function labelAndAlias(str) {
  return {
    label: str.value,
    alias: str.original
  };
}
__name(labelAndAlias, "labelAndAlias");
class ShowNextInlineEditAction extends EditorAction {
  static {
    __name(this, "ShowNextInlineEditAction");
  }
  static ID = showNextInlineEditActionId;
  constructor() {
    super({
      id: ShowNextInlineEditAction.ID,
      ...labelAndAlias(nls.localize2("action.inlineEdits.showNext", "Show Next Inline Edit")),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, inlineEditVisible),
      kbOpts: {
        weight: 100,
        primary: KeyMod.Alt | KeyCode.BracketRight
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineEditsController.get(editor);
    controller?.model.get()?.next();
  }
}
class ShowPreviousInlineEditAction extends EditorAction {
  static {
    __name(this, "ShowPreviousInlineEditAction");
  }
  static ID = showPreviousInlineEditActionId;
  constructor() {
    super({
      id: ShowPreviousInlineEditAction.ID,
      ...labelAndAlias(nls.localize2("action.inlineEdits.showPrevious", "Show Previous Inline Edit")),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, inlineEditVisible),
      kbOpts: {
        weight: 100,
        primary: KeyMod.Alt | KeyCode.BracketLeft
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineEditsController.get(editor);
    controller?.model.get()?.previous();
  }
}
class TriggerInlineEditAction extends EditorAction {
  static {
    __name(this, "TriggerInlineEditAction");
  }
  constructor() {
    super({
      id: "editor.action.inlineEdits.trigger",
      ...labelAndAlias(nls.localize2("action.inlineEdits.trigger", "Trigger Inline Edit")),
      precondition: EditorContextKeys.writable
    });
  }
  async run(accessor, editor) {
    const controller = InlineEditsController.get(editor);
    await asyncTransaction(async (tx) => {
      await controller?.model.get()?.triggerExplicitly(tx);
    });
  }
}
class AcceptInlineEdit extends EditorAction {
  static {
    __name(this, "AcceptInlineEdit");
  }
  constructor() {
    super({
      id: inlineEditAcceptId,
      ...labelAndAlias(nls.localize2("action.inlineEdits.accept", "Accept Inline Edit")),
      precondition: inlineEditVisible,
      menuOpts: {
        menuId: MenuId.InlineEditsActions,
        title: nls.localize("inlineEditsActions", "Accept Inline Edit"),
        group: "primary",
        order: 1,
        icon: Codicon.check
      },
      kbOpts: {
        primary: KeyMod.CtrlCmd | KeyCode.Space,
        weight: 2e4,
        kbExpr: inlineEditVisible
      }
    });
  }
  async run(accessor, editor) {
    if (editor instanceof EmbeddedCodeEditorWidget) {
      editor = editor.getParentEditor();
    }
    const controller = InlineEditsController.get(editor);
    if (controller) {
      controller.model.get()?.accept(controller.editor);
      controller.editor.focus();
    }
  }
}
class HideInlineEdit extends EditorAction {
  static {
    __name(this, "HideInlineEdit");
  }
  static ID = "editor.action.inlineEdits.hide";
  constructor() {
    super({
      id: HideInlineEdit.ID,
      ...labelAndAlias(nls.localize2("action.inlineEdits.hide", "Hide Inline Edit")),
      precondition: inlineEditVisible,
      kbOpts: {
        weight: 100,
        primary: KeyCode.Escape
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineEditsController.get(editor);
    transaction((tx) => {
      controller?.model.get()?.stop(tx);
    });
  }
}
export {
  AcceptInlineEdit,
  HideInlineEdit,
  ShowNextInlineEditAction,
  ShowPreviousInlineEditAction,
  TriggerInlineEditAction
};
//# sourceMappingURL=commands.js.map
