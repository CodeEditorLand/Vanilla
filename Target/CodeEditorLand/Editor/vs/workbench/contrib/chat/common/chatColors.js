import { Color, RGBA } from "../../../../base/common/color.js";
import { localize } from "../../../../nls.js";
import { badgeBackground, badgeForeground, contrastBorder, editorBackground, editorWidgetBackground, foreground, registerColor, transparent } from "../../../../platform/theme/common/colorRegistry.js";
const chatRequestBorder = registerColor(
  "chat.requestBorder",
  { dark: new Color(new RGBA(255, 255, 255, 0.1)), light: new Color(new RGBA(0, 0, 0, 0.1)), hcDark: contrastBorder, hcLight: contrastBorder },
  localize("chat.requestBorder", "The border color of a chat request.")
);
const chatRequestBackground = registerColor(
  "chat.requestBackground",
  { dark: transparent(editorBackground, 0.62), light: transparent(editorBackground, 0.62), hcDark: editorWidgetBackground, hcLight: null },
  localize("chat.requestBackground", "The background color of a chat request.")
);
const chatSlashCommandBackground = registerColor(
  "chat.slashCommandBackground",
  { dark: "#34414b8f", light: "#d2ecff99", hcDark: Color.white, hcLight: badgeBackground },
  localize("chat.slashCommandBackground", "The background color of a chat slash command.")
);
const chatSlashCommandForeground = registerColor(
  "chat.slashCommandForeground",
  { dark: "#40A6FF", light: "#306CA2", hcDark: Color.black, hcLight: badgeForeground },
  localize("chat.slashCommandForeground", "The foreground color of a chat slash command.")
);
const chatAvatarBackground = registerColor(
  "chat.avatarBackground",
  { dark: "#1f1f1f", light: "#f2f2f2", hcDark: Color.black, hcLight: Color.white },
  localize("chat.avatarBackground", "The background color of a chat avatar.")
);
const chatAvatarForeground = registerColor(
  "chat.avatarForeground",
  foreground,
  localize("chat.avatarForeground", "The foreground color of a chat avatar.")
);
export {
  chatAvatarBackground,
  chatAvatarForeground,
  chatRequestBackground,
  chatRequestBorder,
  chatSlashCommandBackground,
  chatSlashCommandForeground
};
//# sourceMappingURL=chatColors.js.map
