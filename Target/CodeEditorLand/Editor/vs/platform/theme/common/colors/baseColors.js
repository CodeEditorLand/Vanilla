import * as nls from "../../../../nls.js";
import { Color } from "../../../../base/common/color.js";
import { registerColor, transparent } from "../colorUtils.js";
const foreground = registerColor(
  "foreground",
  {
    dark: "#CCCCCC",
    light: "#616161",
    hcDark: "#FFFFFF",
    hcLight: "#292929"
  },
  nls.localize(
    "foreground",
    "Overall foreground color. This color is only used if not overridden by a component."
  )
);
const disabledForeground = registerColor(
  "disabledForeground",
  {
    dark: "#CCCCCC80",
    light: "#61616180",
    hcDark: "#A5A5A5",
    hcLight: "#7F7F7F"
  },
  nls.localize(
    "disabledForeground",
    "Overall foreground for disabled elements. This color is only used if not overridden by a component."
  )
);
const errorForeground = registerColor(
  "errorForeground",
  {
    dark: "#F48771",
    light: "#A1260D",
    hcDark: "#F48771",
    hcLight: "#B5200D"
  },
  nls.localize(
    "errorForeground",
    "Overall foreground color for error messages. This color is only used if not overridden by a component."
  )
);
const descriptionForeground = registerColor(
  "descriptionForeground",
  {
    light: "#717171",
    dark: transparent(foreground, 0.7),
    hcDark: transparent(foreground, 0.7),
    hcLight: transparent(foreground, 0.7)
  },
  nls.localize(
    "descriptionForeground",
    "Foreground color for description text providing additional information, for example for a label."
  )
);
const iconForeground = registerColor(
  "icon.foreground",
  {
    dark: "#C5C5C5",
    light: "#424242",
    hcDark: "#FFFFFF",
    hcLight: "#292929"
  },
  nls.localize(
    "iconForeground",
    "The default color for icons in the workbench."
  )
);
const focusBorder = registerColor(
  "focusBorder",
  {
    dark: "#007FD4",
    light: "#0090F1",
    hcDark: "#F38518",
    hcLight: "#006BBD"
  },
  nls.localize(
    "focusBorder",
    "Overall border color for focused elements. This color is only used if not overridden by a component."
  )
);
const contrastBorder = registerColor(
  "contrastBorder",
  { light: null, dark: null, hcDark: "#6FC3DF", hcLight: "#0F4A85" },
  nls.localize(
    "contrastBorder",
    "An extra border around elements to separate them from others for greater contrast."
  )
);
const activeContrastBorder = registerColor(
  "contrastActiveBorder",
  { light: null, dark: null, hcDark: focusBorder, hcLight: focusBorder },
  nls.localize(
    "activeContrastBorder",
    "An extra border around active elements to separate them from others for greater contrast."
  )
);
const selectionBackground = registerColor(
  "selection.background",
  null,
  nls.localize(
    "selectionBackground",
    "The background color of text selections in the workbench (e.g. for input fields or text areas). Note that this does not apply to selections within the editor."
  )
);
const textLinkForeground = registerColor(
  "textLink.foreground",
  {
    light: "#006AB1",
    dark: "#3794FF",
    hcDark: "#21A6FF",
    hcLight: "#0F4A85"
  },
  nls.localize("textLinkForeground", "Foreground color for links in text.")
);
const textLinkActiveForeground = registerColor(
  "textLink.activeForeground",
  {
    light: "#006AB1",
    dark: "#3794FF",
    hcDark: "#21A6FF",
    hcLight: "#0F4A85"
  },
  nls.localize(
    "textLinkActiveForeground",
    "Foreground color for links in text when clicked on and on mouse hover."
  )
);
const textSeparatorForeground = registerColor(
  "textSeparator.foreground",
  {
    light: "#0000002e",
    dark: "#ffffff2e",
    hcDark: Color.black,
    hcLight: "#292929"
  },
  nls.localize("textSeparatorForeground", "Color for text separators.")
);
const textPreformatForeground = registerColor(
  "textPreformat.foreground",
  {
    light: "#A31515",
    dark: "#D7BA7D",
    hcDark: "#000000",
    hcLight: "#FFFFFF"
  },
  nls.localize(
    "textPreformatForeground",
    "Foreground color for preformatted text segments."
  )
);
const textPreformatBackground = registerColor(
  "textPreformat.background",
  {
    light: "#0000001A",
    dark: "#FFFFFF1A",
    hcDark: "#FFFFFF",
    hcLight: "#09345f"
  },
  nls.localize(
    "textPreformatBackground",
    "Background color for preformatted text segments."
  )
);
const textBlockQuoteBackground = registerColor(
  "textBlockQuote.background",
  { light: "#f2f2f2", dark: "#222222", hcDark: null, hcLight: "#F2F2F2" },
  nls.localize(
    "textBlockQuoteBackground",
    "Background color for block quotes in text."
  )
);
const textBlockQuoteBorder = registerColor(
  "textBlockQuote.border",
  {
    light: "#007acc80",
    dark: "#007acc80",
    hcDark: Color.white,
    hcLight: "#292929"
  },
  nls.localize(
    "textBlockQuoteBorder",
    "Border color for block quotes in text."
  )
);
const textCodeBlockBackground = registerColor(
  "textCodeBlock.background",
  {
    light: "#dcdcdc66",
    dark: "#0a0a0a66",
    hcDark: Color.black,
    hcLight: "#F2F2F2"
  },
  nls.localize(
    "textCodeBlockBackground",
    "Background color for code blocks in text."
  )
);
export {
  activeContrastBorder,
  contrastBorder,
  descriptionForeground,
  disabledForeground,
  errorForeground,
  focusBorder,
  foreground,
  iconForeground,
  selectionBackground,
  textBlockQuoteBackground,
  textBlockQuoteBorder,
  textCodeBlockBackground,
  textLinkActiveForeground,
  textLinkForeground,
  textPreformatBackground,
  textPreformatForeground,
  textSeparatorForeground
};
//# sourceMappingURL=baseColors.js.map
