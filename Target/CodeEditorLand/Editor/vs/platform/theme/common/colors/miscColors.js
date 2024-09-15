import * as nls from "../../../../nls.js";
import { Color } from "../../../../base/common/color.js";
import { registerColor, transparent } from "../colorUtils.js";
import { contrastBorder, focusBorder } from "./baseColors.js";
const sashHoverBorder = registerColor(
  "sash.hoverBorder",
  focusBorder,
  nls.localize("sashActiveBorder", "Border color of active sashes.")
);
const badgeBackground = registerColor(
  "badge.background",
  {
    dark: "#4D4D4D",
    light: "#C4C4C4",
    hcDark: Color.black,
    hcLight: "#0F4A85"
  },
  nls.localize(
    "badgeBackground",
    "Badge background color. Badges are small information labels, e.g. for search results count."
  )
);
const badgeForeground = registerColor(
  "badge.foreground",
  {
    dark: Color.white,
    light: "#333",
    hcDark: Color.white,
    hcLight: Color.white
  },
  nls.localize(
    "badgeForeground",
    "Badge foreground color. Badges are small information labels, e.g. for search results count."
  )
);
const scrollbarShadow = registerColor(
  "scrollbar.shadow",
  { dark: "#000000", light: "#DDDDDD", hcDark: null, hcLight: null },
  nls.localize(
    "scrollbarShadow",
    "Scrollbar shadow to indicate that the view is scrolled."
  )
);
const scrollbarSliderBackground = registerColor(
  "scrollbarSlider.background",
  {
    dark: Color.fromHex("#797979").transparent(0.4),
    light: Color.fromHex("#646464").transparent(0.4),
    hcDark: transparent(contrastBorder, 0.6),
    hcLight: transparent(contrastBorder, 0.4)
  },
  nls.localize(
    "scrollbarSliderBackground",
    "Scrollbar slider background color."
  )
);
const scrollbarSliderHoverBackground = registerColor(
  "scrollbarSlider.hoverBackground",
  {
    dark: Color.fromHex("#646464").transparent(0.7),
    light: Color.fromHex("#646464").transparent(0.7),
    hcDark: transparent(contrastBorder, 0.8),
    hcLight: transparent(contrastBorder, 0.8)
  },
  nls.localize(
    "scrollbarSliderHoverBackground",
    "Scrollbar slider background color when hovering."
  )
);
const scrollbarSliderActiveBackground = registerColor(
  "scrollbarSlider.activeBackground",
  {
    dark: Color.fromHex("#BFBFBF").transparent(0.4),
    light: Color.fromHex("#000000").transparent(0.6),
    hcDark: contrastBorder,
    hcLight: contrastBorder
  },
  nls.localize(
    "scrollbarSliderActiveBackground",
    "Scrollbar slider background color when clicked on."
  )
);
const progressBarBackground = registerColor(
  "progressBar.background",
  {
    dark: Color.fromHex("#0E70C0"),
    light: Color.fromHex("#0E70C0"),
    hcDark: contrastBorder,
    hcLight: contrastBorder
  },
  nls.localize(
    "progressBarBackground",
    "Background color of the progress bar that can show for long running operations."
  )
);
export {
  badgeBackground,
  badgeForeground,
  progressBarBackground,
  sashHoverBorder,
  scrollbarShadow,
  scrollbarSliderActiveBackground,
  scrollbarSliderBackground,
  scrollbarSliderHoverBackground
};
//# sourceMappingURL=miscColors.js.map
