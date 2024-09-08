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
function isDark(scheme) {
  return scheme === "dark" /* DARK */ || scheme === "hcDark" /* HIGH_CONTRAST_DARK */;
}
export {
  ColorScheme,
  isDark,
  isHighContrast
};
