import { localize } from "../../../../nls.js";
import {
  editorBackground,
  registerColor
} from "../../../../platform/theme/common/colorRegistry.js";
const multiDiffEditorHeaderBackground = registerColor(
  "multiDiffEditor.headerBackground",
  {
    dark: "#262626",
    light: "tab.inactiveBackground",
    hcDark: "tab.inactiveBackground",
    hcLight: "tab.inactiveBackground"
  },
  localize(
    "multiDiffEditor.headerBackground",
    "The background color of the diff editor's header"
  )
);
const multiDiffEditorBackground = registerColor(
  "multiDiffEditor.background",
  editorBackground,
  localize(
    "multiDiffEditor.background",
    "The background color of the multi file diff editor"
  )
);
const multiDiffEditorBorder = registerColor(
  "multiDiffEditor.border",
  {
    dark: "sideBarSectionHeader.border",
    light: "#cccccc",
    hcDark: "sideBarSectionHeader.border",
    hcLight: "#cccccc"
  },
  localize(
    "multiDiffEditor.border",
    "The border color of the multi file diff editor"
  )
);
export {
  multiDiffEditorBackground,
  multiDiffEditorBorder,
  multiDiffEditorHeaderBackground
};
//# sourceMappingURL=colors.js.map
