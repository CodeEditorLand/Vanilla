import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import {
  EditorContributionInstantiation,
  registerEditorAction,
  registerEditorContribution
} from "../../../browser/editorExtensions.js";
import { HoverParticipantRegistry } from "../../hover/browser/hoverTypes.js";
import {
  AcceptInlineCompletion,
  AcceptNextLineOfInlineCompletion,
  AcceptNextWordOfInlineCompletion,
  HideInlineCompletion,
  ShowNextInlineSuggestionAction,
  ShowPreviousInlineSuggestionAction,
  ToggleAlwaysShowInlineSuggestionToolbar,
  TriggerInlineSuggestionAction
} from "./controller/commands.js";
import { InlineCompletionsController } from "./controller/inlineCompletionsController.js";
import { InlineCompletionsHoverParticipant } from "./hintsWidget/hoverParticipant.js";
import { InlineCompletionsAccessibleView } from "./inlineCompletionsAccessibleView.js";
registerEditorContribution(
  InlineCompletionsController.ID,
  InlineCompletionsController,
  EditorContributionInstantiation.Eventually
);
registerEditorAction(TriggerInlineSuggestionAction);
registerEditorAction(ShowNextInlineSuggestionAction);
registerEditorAction(ShowPreviousInlineSuggestionAction);
registerEditorAction(AcceptNextWordOfInlineCompletion);
registerEditorAction(AcceptNextLineOfInlineCompletion);
registerEditorAction(AcceptInlineCompletion);
registerEditorAction(HideInlineCompletion);
registerAction2(ToggleAlwaysShowInlineSuggestionToolbar);
HoverParticipantRegistry.register(InlineCompletionsHoverParticipant);
AccessibleViewRegistry.register(new InlineCompletionsAccessibleView());
//# sourceMappingURL=inlineCompletions.contribution.js.map
