import * as nls from "../../../../nls.js";
import { Color, RGBA } from "../../../../base/common/color.js";
import { registerColor, transparent } from "../colorUtils.js";
import { editorInfoForeground, editorWarningForeground, editorWarningBorder, editorInfoBorder } from "./editorColors.js";
import { scrollbarSliderBackground, scrollbarSliderHoverBackground, scrollbarSliderActiveBackground } from "./miscColors.js";
const minimapFindMatch = registerColor(
  "minimap.findMatchHighlight",
  { light: "#d18616", dark: "#d18616", hcDark: "#AB5A00", hcLight: "#0F4A85" },
  nls.localize("minimapFindMatchHighlight", "Minimap marker color for find matches."),
  true
);
const minimapSelectionOccurrenceHighlight = registerColor(
  "minimap.selectionOccurrenceHighlight",
  { light: "#c9c9c9", dark: "#676767", hcDark: "#ffffff", hcLight: "#0F4A85" },
  nls.localize("minimapSelectionOccurrenceHighlight", "Minimap marker color for repeating editor selections."),
  true
);
const minimapSelection = registerColor(
  "minimap.selectionHighlight",
  { light: "#ADD6FF", dark: "#264F78", hcDark: "#ffffff", hcLight: "#0F4A85" },
  nls.localize("minimapSelectionHighlight", "Minimap marker color for the editor selection."),
  true
);
const minimapInfo = registerColor(
  "minimap.infoHighlight",
  { dark: editorInfoForeground, light: editorInfoForeground, hcDark: editorInfoBorder, hcLight: editorInfoBorder },
  nls.localize("minimapInfo", "Minimap marker color for infos.")
);
const minimapWarning = registerColor(
  "minimap.warningHighlight",
  { dark: editorWarningForeground, light: editorWarningForeground, hcDark: editorWarningBorder, hcLight: editorWarningBorder },
  nls.localize("overviewRuleWarning", "Minimap marker color for warnings.")
);
const minimapError = registerColor(
  "minimap.errorHighlight",
  { dark: new Color(new RGBA(255, 18, 18, 0.7)), light: new Color(new RGBA(255, 18, 18, 0.7)), hcDark: new Color(new RGBA(255, 50, 50, 1)), hcLight: "#B5200D" },
  nls.localize("minimapError", "Minimap marker color for errors.")
);
const minimapBackground = registerColor(
  "minimap.background",
  null,
  nls.localize("minimapBackground", "Minimap background color.")
);
const minimapForegroundOpacity = registerColor(
  "minimap.foregroundOpacity",
  Color.fromHex("#000f"),
  nls.localize("minimapForegroundOpacity", 'Opacity of foreground elements rendered in the minimap. For example, "#000000c0" will render the elements with 75% opacity.')
);
const minimapSliderBackground = registerColor(
  "minimapSlider.background",
  transparent(scrollbarSliderBackground, 0.5),
  nls.localize("minimapSliderBackground", "Minimap slider background color.")
);
const minimapSliderHoverBackground = registerColor(
  "minimapSlider.hoverBackground",
  transparent(scrollbarSliderHoverBackground, 0.5),
  nls.localize("minimapSliderHoverBackground", "Minimap slider background color when hovering.")
);
const minimapSliderActiveBackground = registerColor(
  "minimapSlider.activeBackground",
  transparent(scrollbarSliderActiveBackground, 0.5),
  nls.localize("minimapSliderActiveBackground", "Minimap slider background color when clicked on.")
);
export {
  minimapBackground,
  minimapError,
  minimapFindMatch,
  minimapForegroundOpacity,
  minimapInfo,
  minimapSelection,
  minimapSelectionOccurrenceHighlight,
  minimapSliderActiveBackground,
  minimapSliderBackground,
  minimapSliderHoverBackground,
  minimapWarning
};
//# sourceMappingURL=minimapColors.js.map
