var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import * as extensionsRegistry from "../../../services/extensions/common/extensionsRegistry.js";
import { terminalContributionsDescriptor } from "./terminal.js";
const terminalsExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint(
  terminalContributionsDescriptor
);
const ITerminalContributionService = createDecorator(
  "terminalContributionsService"
);
class TerminalContributionService {
  static {
    __name(this, "TerminalContributionService");
  }
  _terminalProfiles = [];
  get terminalProfiles() {
    return this._terminalProfiles;
  }
  constructor() {
    terminalsExtPoint.setHandler((contributions) => {
      this._terminalProfiles = contributions.flatMap((c) => {
        return c.value?.profiles?.filter((p) => hasValidTerminalIcon(p)).map((e) => {
          return {
            ...e,
            extensionIdentifier: c.description.identifier.value
          };
        }) || [];
      });
    });
  }
}
function hasValidTerminalIcon(profile) {
  return !profile.icon || typeof profile.icon === "string" || URI.isUri(profile.icon) || "light" in profile.icon && "dark" in profile.icon && URI.isUri(profile.icon.light) && URI.isUri(profile.icon.dark);
}
__name(hasValidTerminalIcon, "hasValidTerminalIcon");
export {
  ITerminalContributionService,
  TerminalContributionService
};
//# sourceMappingURL=terminalExtensionPoints.js.map
