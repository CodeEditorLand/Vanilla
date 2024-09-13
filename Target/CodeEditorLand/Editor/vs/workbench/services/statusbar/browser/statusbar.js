var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IStatusbarService = createDecorator("statusbarService");
var StatusbarAlignment = /* @__PURE__ */ ((StatusbarAlignment2) => {
  StatusbarAlignment2[StatusbarAlignment2["LEFT"] = 0] = "LEFT";
  StatusbarAlignment2[StatusbarAlignment2["RIGHT"] = 1] = "RIGHT";
  return StatusbarAlignment2;
})(StatusbarAlignment || {});
function isStatusbarEntryLocation(thing) {
  const candidate = thing;
  return typeof candidate?.id === "string" && typeof candidate.alignment === "number";
}
__name(isStatusbarEntryLocation, "isStatusbarEntryLocation");
function isStatusbarEntryPriority(thing) {
  const candidate = thing;
  return (typeof candidate?.primary === "number" || isStatusbarEntryLocation(candidate?.primary)) && typeof candidate?.secondary === "number";
}
__name(isStatusbarEntryPriority, "isStatusbarEntryPriority");
const ShowTooltipCommand = {
  id: "statusBar.entry.showTooltip",
  title: ""
};
const StatusbarEntryKinds = [
  "standard",
  "warning",
  "error",
  "prominent",
  "remote",
  "offline"
];
export {
  IStatusbarService,
  ShowTooltipCommand,
  StatusbarAlignment,
  StatusbarEntryKinds,
  isStatusbarEntryLocation,
  isStatusbarEntryPriority
};
//# sourceMappingURL=statusbar.js.map
