import { localize } from "../../../../../nls.js";
import { registerColor } from "../../../../../platform/theme/common/colorUtils.js";
const terminalStickyScrollBackground = registerColor("terminalStickyScroll.background", null, localize("terminalStickyScroll.background", "The background color of the sticky scroll overlay in the terminal."));
const terminalStickyScrollHoverBackground = registerColor("terminalStickyScrollHover.background", {
  dark: "#2A2D2E",
  light: "#F0F0F0",
  hcDark: "#E48B39",
  hcLight: "#0f4a85"
}, localize("terminalStickyScrollHover.background", "The background color of the sticky scroll overlay in the terminal when hovered."));
registerColor("terminalStickyScroll.border", {
  dark: null,
  light: null,
  hcDark: "#6fc3df",
  hcLight: "#0f4a85"
}, localize("terminalStickyScroll.border", "The border of the sticky scroll overlay in the terminal."));
export {
  terminalStickyScrollBackground,
  terminalStickyScrollHoverBackground
};
//# sourceMappingURL=terminalStickyScrollColorRegistry.js.map
