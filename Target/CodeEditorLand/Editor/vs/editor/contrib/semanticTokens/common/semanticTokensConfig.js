var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const SEMANTIC_HIGHLIGHTING_SETTING_ID = "editor.semanticHighlighting";
function isSemanticColoringEnabled(model, themeService, configurationService) {
  const setting = configurationService.getValue(
    SEMANTIC_HIGHLIGHTING_SETTING_ID,
    { overrideIdentifier: model.getLanguageId(), resource: model.uri }
  )?.enabled;
  if (typeof setting === "boolean") {
    return setting;
  }
  return themeService.getColorTheme().semanticHighlighting;
}
__name(isSemanticColoringEnabled, "isSemanticColoringEnabled");
export {
  SEMANTIC_HIGHLIGHTING_SETTING_ID,
  isSemanticColoringEnabled
};
//# sourceMappingURL=semanticTokensConfig.js.map
