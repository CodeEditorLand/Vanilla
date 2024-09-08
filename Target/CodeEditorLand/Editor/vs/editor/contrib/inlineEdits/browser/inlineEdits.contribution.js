import {
  EditorContributionInstantiation,
  registerEditorAction,
  registerEditorContribution
} from "../../../browser/editorExtensions.js";
import {
  AcceptInlineEdit,
  HideInlineEdit,
  ShowNextInlineEditAction,
  ShowPreviousInlineEditAction,
  TriggerInlineEditAction
} from "./commands.js";
import { InlineEditsController } from "./inlineEditsController.js";
registerEditorContribution(
  InlineEditsController.ID,
  InlineEditsController,
  EditorContributionInstantiation.Eventually
);
registerEditorAction(TriggerInlineEditAction);
registerEditorAction(ShowNextInlineEditAction);
registerEditorAction(ShowPreviousInlineEditAction);
registerEditorAction(AcceptInlineEdit);
registerEditorAction(HideInlineEdit);
