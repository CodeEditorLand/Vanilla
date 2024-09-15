import { localize } from "../../../../nls.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
const gettingStartedUncheckedCodicon = registerIcon("getting-started-step-unchecked", Codicon.circleLargeOutline, localize("gettingStartedUnchecked", "Used to represent walkthrough steps which have not been completed"));
const gettingStartedCheckedCodicon = registerIcon("getting-started-step-checked", Codicon.passFilled, localize("gettingStartedChecked", "Used to represent walkthrough steps which have been completed"));
export {
  gettingStartedCheckedCodicon,
  gettingStartedUncheckedCodicon
};
//# sourceMappingURL=gettingStartedIcons.js.map
