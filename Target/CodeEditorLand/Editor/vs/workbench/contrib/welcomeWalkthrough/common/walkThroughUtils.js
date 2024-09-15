import { Color, RGBA } from "../../../../base/common/color.js";
import { localize } from "../../../../nls.js";
import { registerColor } from "../../../../platform/theme/common/colorRegistry.js";
const embeddedEditorBackground = registerColor(
  "walkThrough.embeddedEditorBackground",
  {
    dark: new Color(new RGBA(0, 0, 0, 0.4)),
    light: "#f4f4f4",
    hcDark: null,
    hcLight: null
  },
  localize(
    "walkThrough.embeddedEditorBackground",
    "Background color for the embedded editors on the Interactive Playground."
  )
);
export {
  embeddedEditorBackground
};
//# sourceMappingURL=walkThroughUtils.js.map
