import * as nls from "../../../../nls.js";
const SHOW_OR_FOCUS_HOVER_ACTION_ID = "editor.action.showHover";
const SHOW_DEFINITION_PREVIEW_HOVER_ACTION_ID = "editor.action.showDefinitionPreviewHover";
const SCROLL_UP_HOVER_ACTION_ID = "editor.action.scrollUpHover";
const SCROLL_DOWN_HOVER_ACTION_ID = "editor.action.scrollDownHover";
const SCROLL_LEFT_HOVER_ACTION_ID = "editor.action.scrollLeftHover";
const SCROLL_RIGHT_HOVER_ACTION_ID = "editor.action.scrollRightHover";
const PAGE_UP_HOVER_ACTION_ID = "editor.action.pageUpHover";
const PAGE_DOWN_HOVER_ACTION_ID = "editor.action.pageDownHover";
const GO_TO_TOP_HOVER_ACTION_ID = "editor.action.goToTopHover";
const GO_TO_BOTTOM_HOVER_ACTION_ID = "editor.action.goToBottomHover";
const INCREASE_HOVER_VERBOSITY_ACTION_ID = "editor.action.increaseHoverVerbosityLevel";
const INCREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID = "editor.action.increaseHoverVerbosityLevelFromAccessibleView";
const INCREASE_HOVER_VERBOSITY_ACTION_LABEL = nls.localize(
  {
    key: "increaseHoverVerbosityLevel",
    comment: [
      "Label for action that will increase the hover verbosity level."
    ]
  },
  "Increase Hover Verbosity Level"
);
const DECREASE_HOVER_VERBOSITY_ACTION_ID = "editor.action.decreaseHoverVerbosityLevel";
const DECREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID = "editor.action.decreaseHoverVerbosityLevelFromAccessibleView";
const DECREASE_HOVER_VERBOSITY_ACTION_LABEL = nls.localize(
  {
    key: "decreaseHoverVerbosityLevel",
    comment: [
      "Label for action that will decrease the hover verbosity level."
    ]
  },
  "Decrease Hover Verbosity Level"
);
export {
  DECREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID,
  DECREASE_HOVER_VERBOSITY_ACTION_ID,
  DECREASE_HOVER_VERBOSITY_ACTION_LABEL,
  GO_TO_BOTTOM_HOVER_ACTION_ID,
  GO_TO_TOP_HOVER_ACTION_ID,
  INCREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID,
  INCREASE_HOVER_VERBOSITY_ACTION_ID,
  INCREASE_HOVER_VERBOSITY_ACTION_LABEL,
  PAGE_DOWN_HOVER_ACTION_ID,
  PAGE_UP_HOVER_ACTION_ID,
  SCROLL_DOWN_HOVER_ACTION_ID,
  SCROLL_LEFT_HOVER_ACTION_ID,
  SCROLL_RIGHT_HOVER_ACTION_ID,
  SCROLL_UP_HOVER_ACTION_ID,
  SHOW_DEFINITION_PREVIEW_HOVER_ACTION_ID,
  SHOW_OR_FOCUS_HOVER_ACTION_ID
};
