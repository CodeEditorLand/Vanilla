var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Extensions as ThemeingExtensions, IColorRegistry, ColorIdentifier } from "../../../../../platform/theme/common/colorRegistry.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { ansiColorIdentifiers, registerColors } from "../../common/terminalColorRegistry.js";
import { IColorTheme } from "../../../../../platform/theme/common/themeService.js";
import { Color } from "../../../../../base/common/color.js";
import { ColorScheme } from "../../../../../platform/theme/common/theme.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
registerColors();
const themingRegistry = Registry.as(ThemeingExtensions.ColorContribution);
function getMockTheme(type) {
  const theme = {
    selector: "",
    label: "",
    type,
    getColor: /* @__PURE__ */ __name((colorId) => themingRegistry.resolveDefaultColor(colorId, theme), "getColor"),
    defines: /* @__PURE__ */ __name(() => true, "defines"),
    getTokenStyleMetadata: /* @__PURE__ */ __name(() => void 0, "getTokenStyleMetadata"),
    tokenColorMap: [],
    semanticHighlighting: false
  };
  return theme;
}
__name(getMockTheme, "getMockTheme");
suite("Workbench - TerminalColorRegistry", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("hc colors", function() {
    const theme = getMockTheme(ColorScheme.HIGH_CONTRAST_DARK);
    const colors = ansiColorIdentifiers.map((colorId) => Color.Format.CSS.formatHexA(theme.getColor(colorId), true));
    assert.deepStrictEqual(colors, [
      "#000000",
      "#cd0000",
      "#00cd00",
      "#cdcd00",
      "#0000ee",
      "#cd00cd",
      "#00cdcd",
      "#e5e5e5",
      "#7f7f7f",
      "#ff0000",
      "#00ff00",
      "#ffff00",
      "#5c5cff",
      "#ff00ff",
      "#00ffff",
      "#ffffff"
    ], "The high contrast terminal colors should be used when the hc theme is active");
  });
  test("light colors", function() {
    const theme = getMockTheme(ColorScheme.LIGHT);
    const colors = ansiColorIdentifiers.map((colorId) => Color.Format.CSS.formatHexA(theme.getColor(colorId), true));
    assert.deepStrictEqual(colors, [
      "#000000",
      "#cd3131",
      "#107c10",
      "#949800",
      "#0451a5",
      "#bc05bc",
      "#0598bc",
      "#555555",
      "#666666",
      "#cd3131",
      "#14ce14",
      "#b5ba00",
      "#0451a5",
      "#bc05bc",
      "#0598bc",
      "#a5a5a5"
    ], "The light terminal colors should be used when the light theme is active");
  });
  test("dark colors", function() {
    const theme = getMockTheme(ColorScheme.DARK);
    const colors = ansiColorIdentifiers.map((colorId) => Color.Format.CSS.formatHexA(theme.getColor(colorId), true));
    assert.deepStrictEqual(colors, [
      "#000000",
      "#cd3131",
      "#0dbc79",
      "#e5e510",
      "#2472c8",
      "#bc3fbc",
      "#11a8cd",
      "#e5e5e5",
      "#666666",
      "#f14c4c",
      "#23d18b",
      "#f5f543",
      "#3b8eea",
      "#d670d6",
      "#29b8db",
      "#e5e5e5"
    ], "The dark terminal colors should be used when a dark theme is active");
  });
});
//# sourceMappingURL=terminalColorRegistry.test.js.map
