import { HelpQuickAccessProvider } from "../../../../platform/quickinput/browser/helpQuickAccess.js";
import {
  Extensions
} from "../../../../platform/quickinput/common/quickAccess.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { QuickHelpNLS } from "../../../common/standaloneStrings.js";
Registry.as(
  Extensions.Quickaccess
).registerQuickAccessProvider({
  ctor: HelpQuickAccessProvider,
  prefix: "",
  helpEntries: [{ description: QuickHelpNLS.helpQuickAccessActionLabel }]
});
