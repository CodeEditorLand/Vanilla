var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var ColorScheme = /* @__PURE__ */ ((ColorScheme2) => {
  ColorScheme2["DARK"] = "dark";
  ColorScheme2["LIGHT"] = "light";
  ColorScheme2["HIGH_CONTRAST_DARK"] = "hcDark";
  ColorScheme2["HIGH_CONTRAST_LIGHT"] = "hcLight";
  return ColorScheme2;
})(ColorScheme || {});
function isHighContrast(scheme) {
  return scheme === "hcDark" /* HIGH_CONTRAST_DARK */ || scheme === "hcLight" /* HIGH_CONTRAST_LIGHT */;
}
__name(isHighContrast, "isHighContrast");
function isDark(scheme) {
  return scheme === "dark" /* DARK */ || scheme === "hcDark" /* HIGH_CONTRAST_DARK */;
}
__name(isDark, "isDark");
export {
  ColorScheme,
  isDark,
  isHighContrast
};
//# sourceMappingURL=theme.js.map
