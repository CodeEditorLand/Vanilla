import { localize } from "../../../../nls.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
const inlineEditAcceptId = "editor.action.inlineEdits.accept";
const showPreviousInlineEditActionId = "editor.action.inlineEdits.showPrevious";
const showNextInlineEditActionId = "editor.action.inlineEdits.showNext";
const inlineEditVisible = new RawContextKey(
  "inlineEditsVisible",
  false,
  localize("inlineEditsVisible", "Whether an inline edit is visible")
);
const isPinnedContextKey = new RawContextKey(
  "inlineEditsIsPinned",
  false,
  localize("isPinned", "Whether an inline edit is visible")
);
export {
  inlineEditAcceptId,
  inlineEditVisible,
  isPinnedContextKey,
  showNextInlineEditActionId,
  showPreviousInlineEditActionId
};
//# sourceMappingURL=consts.js.map
