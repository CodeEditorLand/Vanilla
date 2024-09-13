var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { language } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
let localHistoryDateFormatter;
function getLocalHistoryDateFormatter() {
  if (!localHistoryDateFormatter) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    };
    let formatter;
    try {
      formatter = new Intl.DateTimeFormat(language, options);
    } catch (error) {
      formatter = new Intl.DateTimeFormat(void 0, options);
    }
    localHistoryDateFormatter = {
      format: /* @__PURE__ */ __name((date) => formatter.format(date), "format")
    };
  }
  return localHistoryDateFormatter;
}
__name(getLocalHistoryDateFormatter, "getLocalHistoryDateFormatter");
const LOCAL_HISTORY_MENU_CONTEXT_VALUE = "localHistory:item";
const LOCAL_HISTORY_MENU_CONTEXT_KEY = ContextKeyExpr.equals(
  "timelineItem",
  LOCAL_HISTORY_MENU_CONTEXT_VALUE
);
const LOCAL_HISTORY_ICON_ENTRY = registerIcon(
  "localHistory-icon",
  Codicon.circleOutline,
  localize(
    "localHistoryIcon",
    "Icon for a local history entry in the timeline view."
  )
);
const LOCAL_HISTORY_ICON_RESTORE = registerIcon(
  "localHistory-restore",
  Codicon.check,
  localize(
    "localHistoryRestore",
    "Icon for restoring contents of a local history entry."
  )
);
export {
  LOCAL_HISTORY_ICON_ENTRY,
  LOCAL_HISTORY_ICON_RESTORE,
  LOCAL_HISTORY_MENU_CONTEXT_KEY,
  LOCAL_HISTORY_MENU_CONTEXT_VALUE,
  getLocalHistoryDateFormatter
};
//# sourceMappingURL=localHistory.js.map
