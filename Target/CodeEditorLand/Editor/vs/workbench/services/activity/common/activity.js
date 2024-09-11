var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Event } from "../../../../base/common/event.js";
import { ViewContainer } from "../../../common/views.js";
import { IColorTheme } from "../../../../platform/theme/common/themeService.js";
import { Color } from "../../../../base/common/color.js";
import { registerColor } from "../../../../platform/theme/common/colorUtils.js";
import { localize } from "../../../../nls.js";
import { Codicon } from "../../../../base/common/codicons.js";
const IActivityService = createDecorator("activityService");
class BaseBadge {
  constructor(descriptorFn, stylesFn) {
    this.descriptorFn = descriptorFn;
    this.stylesFn = stylesFn;
  }
  static {
    __name(this, "BaseBadge");
  }
  getDescription() {
    return this.descriptorFn(null);
  }
  getColors(theme) {
    return this.stylesFn?.(theme);
  }
}
class NumberBadge extends BaseBadge {
  constructor(number, descriptorFn) {
    super(descriptorFn, void 0);
    this.number = number;
    this.number = number;
  }
  static {
    __name(this, "NumberBadge");
  }
  getDescription() {
    return this.descriptorFn(this.number);
  }
}
class IconBadge extends BaseBadge {
  constructor(icon, descriptorFn, stylesFn) {
    super(descriptorFn, stylesFn);
    this.icon = icon;
  }
  static {
    __name(this, "IconBadge");
  }
}
class ProgressBadge extends BaseBadge {
  static {
    __name(this, "ProgressBadge");
  }
  constructor(descriptorFn) {
    super(descriptorFn, void 0);
  }
}
class WarningBadge extends IconBadge {
  static {
    __name(this, "WarningBadge");
  }
  constructor(descriptorFn) {
    super(Codicon.warning, descriptorFn, (theme) => ({
      badgeBackground: theme.getColor(activityWarningBadgeBackground),
      badgeForeground: theme.getColor(activityWarningBadgeForeground),
      badgeBorder: void 0
    }));
  }
}
class ErrorBadge extends IconBadge {
  static {
    __name(this, "ErrorBadge");
  }
  constructor(descriptorFn) {
    super(Codicon.error, descriptorFn, (theme) => ({
      badgeBackground: theme.getColor(activityErrorBadgeBackground),
      badgeForeground: theme.getColor(activityErrorBadgeForeground),
      badgeBorder: void 0
    }));
  }
}
const activityWarningBadgeForeground = registerColor(
  "activityWarningBadge.foreground",
  { dark: Color.black.lighten(0.2), light: Color.white, hcDark: null, hcLight: null },
  localize("activityWarningBadge.foreground", "Foreground color of the warning activity badge")
);
const activityWarningBadgeBackground = registerColor(
  "activityWarningBadge.background",
  { dark: "#CCA700", light: "#BF8803", hcDark: null, hcLight: null },
  localize("activityWarningBadge.background", "Background color of the warning activity badge")
);
const activityErrorBadgeForeground = registerColor(
  "activityErrorBadge.foreground",
  { dark: Color.black.lighten(0.2), light: Color.white, hcDark: null, hcLight: null },
  localize("activityErrorBadge.foreground", "Foreground color of the error activity badge")
);
const activityErrorBadgeBackground = registerColor(
  "activityErrorBadge.background",
  { dark: "#F14C4C", light: "#E51400", hcDark: null, hcLight: null },
  localize("activityErrorBadge.background", "Background color of the error activity badge")
);
export {
  ErrorBadge,
  IActivityService,
  IconBadge,
  NumberBadge,
  ProgressBadge,
  WarningBadge
};
//# sourceMappingURL=activity.js.map
