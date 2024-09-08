import { localize } from "../../../../../nls.js";
import product from "../../../../../platform/product/common/product.js";
var TerminalStickyScrollSettingId = /* @__PURE__ */ ((TerminalStickyScrollSettingId2) => {
  TerminalStickyScrollSettingId2["Enabled"] = "terminal.integrated.stickyScroll.enabled";
  TerminalStickyScrollSettingId2["MaxLineCount"] = "terminal.integrated.stickyScroll.maxLineCount";
  return TerminalStickyScrollSettingId2;
})(TerminalStickyScrollSettingId || {});
const terminalStickyScrollConfiguration = {
  ["terminal.integrated.stickyScroll.enabled" /* Enabled */]: {
    markdownDescription: localize(
      "stickyScroll.enabled",
      "Shows the current command at the top of the terminal."
    ),
    type: "boolean",
    default: product.quality !== "stable"
  },
  ["terminal.integrated.stickyScroll.maxLineCount" /* MaxLineCount */]: {
    markdownDescription: localize(
      "stickyScroll.maxLineCount",
      "Defines the maximum number of sticky lines to show. Sticky scroll lines will never exceed 40% of the viewport regardless of this setting."
    ),
    type: "number",
    default: 5,
    minimum: 1,
    maximum: 10
  }
};
export {
  TerminalStickyScrollSettingId,
  terminalStickyScrollConfiguration
};
