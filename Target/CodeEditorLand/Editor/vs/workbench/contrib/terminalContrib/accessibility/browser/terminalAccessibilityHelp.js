var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import {
  AccessibleViewProviderId,
  AccessibleViewType
} from "../../../../../platform/accessibility/browser/accessibleView.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import {
  ShellIntegrationStatus,
  TerminalSettingId,
  WindowsShellType
} from "../../../../../platform/terminal/common/terminal.js";
import {
  AccessibilityVerbositySettingId,
  accessibleViewCurrentProviderId,
  accessibleViewIsShown
} from "../../../accessibility/browser/accessibilityConfiguration.js";
import { AccessibilityCommandId } from "../../../accessibility/common/accessibilityCommands.js";
import { TerminalCommandId } from "../../../terminal/common/terminal.js";
import { TerminalLinksCommandId } from "../../links/common/terminal.links.js";
import { TerminalAccessibilityCommandId } from "../common/terminal.accessibility.js";
import { TerminalAccessibilitySettingId } from "../common/terminalAccessibilityConfiguration.js";
var ClassName = /* @__PURE__ */ ((ClassName2) => {
  ClassName2["Active"] = "active";
  ClassName2["EditorTextArea"] = "textarea";
  return ClassName2;
})(ClassName || {});
let TerminalAccessibilityHelpProvider = class extends Disposable {
  constructor(_instance, _xterm, _instantiationService, _contextKeyService, _commandService, _configurationService) {
    super();
    this._instance = _instance;
    this._contextKeyService = _contextKeyService;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._hasShellIntegration = _xterm.shellIntegration.status === ShellIntegrationStatus.VSCode;
  }
  id = AccessibleViewProviderId.TerminalHelp;
  _hasShellIntegration = false;
  onClose() {
    const expr = ContextKeyExpr.and(
      accessibleViewIsShown,
      ContextKeyExpr.equals(
        accessibleViewCurrentProviderId.key,
        AccessibleViewProviderId.TerminalHelp
      )
    );
    if (expr?.evaluate(this._contextKeyService.getContext(null))) {
      this._commandService.executeCommand(
        TerminalAccessibilityCommandId.FocusAccessibleBuffer
      );
    } else {
      this._instance.focus();
    }
    this.dispose();
  }
  options = {
    type: AccessibleViewType.Help,
    readMoreUrl: "https://code.visualstudio.com/docs/editor/accessibility#_terminal-accessibility"
  };
  verbositySettingKey = AccessibilityVerbositySettingId.Terminal;
  provideContent() {
    const content = [
      localize(
        "focusAccessibleTerminalView",
        "The Focus Accessible Terminal View command<keybinding:{0}> enables screen readers to read terminal contents.",
        TerminalAccessibilityCommandId.FocusAccessibleBuffer
      ),
      localize(
        "preserveCursor",
        "Customize the behavior of the cursor when toggling between the terminal and accessible view with `terminal.integrated.accessibleViewPreserveCursorPosition.`"
      ),
      localize(
        "openDetectedLink",
        "The Open Detected Link command<keybinding:{0}> enables screen readers to easily open links found in the terminal.",
        TerminalLinksCommandId.OpenDetectedLink
      ),
      localize(
        "newWithProfile",
        "The Create New Terminal (With Profile) command<keybinding:{0}> allows for easy terminal creation using a specific profile.",
        TerminalCommandId.NewWithProfile
      ),
      localize(
        "focusAfterRun",
        "Configure what gets focused after running selected text in the terminal with `{0}`.",
        TerminalSettingId.FocusAfterRun
      )
    ];
    if (!this._configurationService.getValue(
      TerminalAccessibilitySettingId.AccessibleViewFocusOnCommandExecution
    )) {
      content.push(
        localize(
          "focusViewOnExecution",
          "Enable `terminal.integrated.accessibleViewFocusOnCommandExecution` to automatically focus the terminal accessible view when a command is executed in the terminal."
        )
      );
    }
    if (this._instance.shellType === WindowsShellType.CommandPrompt) {
      content.push(
        localize(
          "commandPromptMigration",
          "Consider using powershell instead of command prompt for an improved experience"
        )
      );
    }
    if (this._hasShellIntegration) {
      content.push(
        localize(
          "shellIntegration",
          "The terminal has a feature called shell integration that offers an enhanced experience and provides useful commands for screen readers such as:"
        )
      );
      content.push(
        "- " + localize(
          "goToNextCommand",
          "Go to Next Command<keybinding:{0}> in the accessible view",
          TerminalAccessibilityCommandId.AccessibleBufferGoToNextCommand
        )
      );
      content.push(
        "- " + localize(
          "goToPreviousCommand",
          "Go to Previous Command<keybinding:{0}> in the accessible view",
          TerminalAccessibilityCommandId.AccessibleBufferGoToPreviousCommand
        )
      );
      content.push(
        "- " + localize(
          "goToSymbol",
          "Go to Symbol<keybinding:{0}>",
          AccessibilityCommandId.GoToSymbol
        )
      );
      content.push(
        "- " + localize(
          "runRecentCommand",
          "Run Recent Command<keybinding:{0}>",
          TerminalCommandId.RunRecentCommand
        )
      );
      content.push(
        "- " + localize(
          "goToRecentDirectory",
          "Go to Recent Directory<keybinding:{0}>",
          TerminalCommandId.GoToRecentDirectory
        )
      );
    } else {
      content.push(
        localize(
          "noShellIntegration",
          "Shell integration is not enabled. Some accessibility features may not be available."
        )
      );
    }
    return content.join("\n");
  }
};
TerminalAccessibilityHelpProvider = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IConfigurationService)
], TerminalAccessibilityHelpProvider);
export {
  ClassName,
  TerminalAccessibilityHelpProvider
};
