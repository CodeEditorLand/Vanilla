import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
const INTERACTIVE_INPUT_CURSOR_BOUNDARY = new RawContextKey("interactiveInputCursorAtBoundary", "none");
const InteractiveWindowSetting = {
  interactiveWindowAlwaysScrollOnNewCell: "interactiveWindow.alwaysScrollOnNewCell",
  executeWithShiftEnter: "interactiveWindow.executeWithShiftEnter",
  showExecutionHint: "interactiveWindow.showExecutionHint"
};
export {
  INTERACTIVE_INPUT_CURSOR_BOUNDARY,
  InteractiveWindowSetting
};
