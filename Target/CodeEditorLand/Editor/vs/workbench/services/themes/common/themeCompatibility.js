var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Color } from "../../../../base/common/color.js";
import * as colorRegistry from "../../../../platform/theme/common/colorRegistry.js";
import * as editorColorRegistry from "../../../../editor/common/core/editorColorRegistry.js";
const settingToColorIdMapping = {};
function addSettingMapping(settingId, colorId) {
  let colorIds = settingToColorIdMapping[settingId];
  if (!colorIds) {
    settingToColorIdMapping[settingId] = colorIds = [];
  }
  colorIds.push(colorId);
}
__name(addSettingMapping, "addSettingMapping");
function convertSettings(oldSettings, result) {
  for (const rule of oldSettings) {
    result.textMateRules.push(rule);
    if (!rule.scope) {
      const settings = rule.settings;
      if (settings) {
        for (const settingKey in settings) {
          const key = settingKey;
          const mappings = settingToColorIdMapping[key];
          if (mappings) {
            const colorHex = settings[key];
            if (typeof colorHex === "string") {
              const color = Color.fromHex(colorHex);
              for (const colorId of mappings) {
                result.colors[colorId] = color;
              }
            }
          }
          if (key !== "foreground" && key !== "background" && key !== "fontStyle") {
            delete settings[key];
          }
        }
      } else {
        rule.settings = {};
      }
    }
  }
}
__name(convertSettings, "convertSettings");
addSettingMapping("background", colorRegistry.editorBackground);
addSettingMapping("foreground", colorRegistry.editorForeground);
addSettingMapping("selection", colorRegistry.editorSelectionBackground);
addSettingMapping("inactiveSelection", colorRegistry.editorInactiveSelection);
addSettingMapping(
  "selectionHighlightColor",
  colorRegistry.editorSelectionHighlight
);
addSettingMapping("findMatchHighlight", colorRegistry.editorFindMatchHighlight);
addSettingMapping("currentFindMatchHighlight", colorRegistry.editorFindMatch);
addSettingMapping("hoverHighlight", colorRegistry.editorHoverHighlight);
addSettingMapping("wordHighlight", "editor.wordHighlightBackground");
addSettingMapping(
  "wordHighlightStrong",
  "editor.wordHighlightStrongBackground"
);
addSettingMapping("findRangeHighlight", colorRegistry.editorFindRangeHighlight);
addSettingMapping(
  "findMatchHighlight",
  "peekViewResult.matchHighlightBackground"
);
addSettingMapping(
  "referenceHighlight",
  "peekViewEditor.matchHighlightBackground"
);
addSettingMapping("lineHighlight", editorColorRegistry.editorLineHighlight);
addSettingMapping("rangeHighlight", editorColorRegistry.editorRangeHighlight);
addSettingMapping("caret", editorColorRegistry.editorCursorForeground);
addSettingMapping("invisibles", editorColorRegistry.editorWhitespaces);
addSettingMapping("guide", editorColorRegistry.editorIndentGuide1);
addSettingMapping("activeGuide", editorColorRegistry.editorActiveIndentGuide1);
const ansiColorMap = [
  "ansiBlack",
  "ansiRed",
  "ansiGreen",
  "ansiYellow",
  "ansiBlue",
  "ansiMagenta",
  "ansiCyan",
  "ansiWhite",
  "ansiBrightBlack",
  "ansiBrightRed",
  "ansiBrightGreen",
  "ansiBrightYellow",
  "ansiBrightBlue",
  "ansiBrightMagenta",
  "ansiBrightCyan",
  "ansiBrightWhite"
];
for (const color of ansiColorMap) {
  addSettingMapping(color, "terminal." + color);
}
export {
  convertSettings
};
//# sourceMappingURL=themeCompatibility.js.map
