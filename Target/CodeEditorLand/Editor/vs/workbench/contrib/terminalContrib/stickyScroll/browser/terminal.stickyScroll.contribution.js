var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/stickyScroll.css";
import { localize, localize2 } from "../../../../../nls.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalStickyScrollSettingId } from "../common/terminalStickyScrollConfiguration.js";
import { TerminalStickyScrollContribution } from "./terminalStickyScrollContribution.js";
registerTerminalContribution(
  TerminalStickyScrollContribution.ID,
  TerminalStickyScrollContribution,
  true
);
var TerminalStickyScrollCommandId = /* @__PURE__ */ ((TerminalStickyScrollCommandId2) => {
  TerminalStickyScrollCommandId2["ToggleStickyScroll"] = "workbench.action.terminal.toggleStickyScroll";
  return TerminalStickyScrollCommandId2;
})(TerminalStickyScrollCommandId || {});
registerTerminalAction({
  id: "workbench.action.terminal.toggleStickyScroll" /* ToggleStickyScroll */,
  title: localize2(
    "workbench.action.terminal.toggleStickyScroll",
    "Toggle Sticky Scroll"
  ),
  toggled: {
    condition: ContextKeyExpr.equals(
      `config.${TerminalStickyScrollSettingId.Enabled}`,
      true
    ),
    title: localize("stickyScroll", "Sticky Scroll"),
    mnemonicTitle: localize(
      { key: "miStickyScroll", comment: ["&& denotes a mnemonic"] },
      "&&Sticky Scroll"
    )
  },
  run: /* @__PURE__ */ __name((c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue(
      TerminalStickyScrollSettingId.Enabled
    );
    return configurationService.updateValue(
      TerminalStickyScrollSettingId.Enabled,
      newValue
    );
  }, "run"),
  menu: [{ id: MenuId.TerminalStickyScrollContext }]
});
import "./terminalStickyScrollColorRegistry.js";
//# sourceMappingURL=terminal.stickyScroll.contribution.js.map
