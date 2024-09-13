import { EditorContributionInstantiation, registerEditorAction, registerEditorContribution } from "../../../browser/editorExtensions.js";
import {
  TriggerInlineEditAction,
  ShowNextInlineEditAction,
  ShowPreviousInlineEditAction,
  AcceptInlineEdit,
  HideInlineEdit
} from "./commands.js";
import { InlineEditsController } from "./inlineEditsController.js";
registerEditorContribution(InlineEditsController.ID, InlineEditsController, EditorContributionInstantiation.Eventually);
registerEditorAction(TriggerInlineEditAction);
registerEditorAction(ShowNextInlineEditAction);
registerEditorAction(ShowPreviousInlineEditAction);
registerEditorAction(AcceptInlineEdit);
registerEditorAction(HideInlineEdit);
//# sourceMappingURL=inlineEdits.contribution.js.map
