var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Color } from "../../../../../base/common/color.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { Extensions, IColorRegistry } from "../../../../../platform/theme/common/colorRegistry.js";
suite("ColorRegistry", () => {
  if (process.env.VSCODE_COLOR_REGISTRY_EXPORT) {
    test("exports", () => {
      const themingRegistry = Registry.as(Extensions.ColorContribution);
      const colors = themingRegistry.getColors();
      const replacer = /* @__PURE__ */ __name((_key, value) => value instanceof Color ? Color.Format.CSS.formatHexA(value) : value, "replacer");
      console.log(`#colors:${JSON.stringify(colors, replacer)}
`);
    });
  }
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=colorRegistryExport.test.js.map
