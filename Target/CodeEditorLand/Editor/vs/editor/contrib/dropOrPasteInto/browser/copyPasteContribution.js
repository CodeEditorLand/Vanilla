var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { IJSONSchema, SchemaToType } from "../../../../base/common/jsonSchema.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, EditorCommand, EditorContributionInstantiation, ServicesAccessor, registerEditorAction, registerEditorCommand, registerEditorContribution } from "../../../browser/editorExtensions.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { registerEditorFeature } from "../../../common/editorFeatures.js";
import { CopyPasteController, changePasteTypeCommandId, pasteWidgetVisibleCtx } from "./copyPasteController.js";
import { DefaultPasteProvidersFeature, DefaultTextPasteOrDropEditProvider } from "./defaultProviders.js";
import * as nls from "../../../../nls.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
registerEditorContribution(CopyPasteController.ID, CopyPasteController, EditorContributionInstantiation.Eager);
registerEditorFeature(DefaultPasteProvidersFeature);
registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: changePasteTypeCommandId,
      precondition: pasteWidgetVisibleCtx,
      kbOpts: {
        weight: KeybindingWeight.EditorContrib,
        primary: KeyMod.CtrlCmd | KeyCode.Period
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    return CopyPasteController.get(editor)?.changePasteType();
  }
}());
registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: "editor.hidePasteWidget",
      precondition: pasteWidgetVisibleCtx,
      kbOpts: {
        weight: KeybindingWeight.EditorContrib,
        primary: KeyCode.Escape
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    CopyPasteController.get(editor)?.clearWidgets();
  }
}());
registerEditorAction(class PasteAsAction extends EditorAction {
  static {
    __name(this, "PasteAsAction");
  }
  static argsSchema = {
    type: "object",
    properties: {
      kind: {
        type: "string",
        description: nls.localize("pasteAs.kind", "The kind of the paste edit to try applying. If not provided or there are multiple edits for this kind, the editor will show a picker.")
      }
    }
  };
  constructor() {
    super({
      id: "editor.action.pasteAs",
      label: nls.localize("pasteAs", "Paste As..."),
      alias: "Paste As...",
      precondition: EditorContextKeys.writable,
      metadata: {
        description: "Paste as",
        args: [{
          name: "args",
          schema: PasteAsAction.argsSchema
        }]
      }
    });
  }
  run(_accessor, editor, args) {
    let kind = typeof args?.kind === "string" ? args.kind : void 0;
    if (!kind && args) {
      kind = typeof args.id === "string" ? args.id : void 0;
    }
    return CopyPasteController.get(editor)?.pasteAs(kind ? new HierarchicalKind(kind) : void 0);
  }
});
registerEditorAction(class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.pasteAsText",
      label: nls.localize("pasteAsText", "Paste as Text"),
      alias: "Paste as Text",
      precondition: EditorContextKeys.writable
    });
  }
  run(_accessor, editor) {
    return CopyPasteController.get(editor)?.pasteAs({ providerId: DefaultTextPasteOrDropEditProvider.id });
  }
});
//# sourceMappingURL=copyPasteContribution.js.map
