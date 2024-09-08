import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalInlineChatAccessibleView } from "./terminalChatAccessibleView.js";
import { TerminalChatController } from "./terminalChatController.js";
import "./terminalChatActions.js";
import { AccessibleViewRegistry } from "../../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import {
  registerWorkbenchContribution2,
  WorkbenchPhase
} from "../../../../common/contributions.js";
import { TerminalChatAccessibilityHelp } from "./terminalChatAccessibilityHelp.js";
import { TerminalChatEnabler } from "./terminalChatEnabler.js";
registerTerminalContribution(
  TerminalChatController.ID,
  TerminalChatController,
  false
);
AccessibleViewRegistry.register(new TerminalInlineChatAccessibleView());
AccessibleViewRegistry.register(new TerminalChatAccessibilityHelp());
registerWorkbenchContribution2(
  TerminalChatEnabler.Id,
  TerminalChatEnabler,
  WorkbenchPhase.AfterRestored
);
