var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Event } from "../../../../../base/common/event.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable
} from "../../../../../base/common/lifecycle.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { Position } from "../../../../../editor/common/core/position.js";
import { localize2 } from "../../../../../nls.js";
import {
  AccessibleViewProviderId,
  IAccessibleViewService,
  NavigationType
} from "../../../../../platform/accessibility/browser/accessibleView.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../../platform/accessibility/common/accessibility.js";
import {
  AccessibilitySignal,
  IAccessibilitySignalService
} from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import {
  Action2,
  registerAction2
} from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../../platform/contextkey/common/contextkey.js";
import {
  IInstantiationService
} from "../../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  TerminalCapability
} from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { TerminalSettingId } from "../../../../../platform/terminal/common/terminal.js";
import {
  accessibleViewCurrentProviderId,
  accessibleViewIsShown
} from "../../../accessibility/browser/accessibilityConfiguration.js";
import {
  AccessibilityHelpAction,
  AccessibleViewAction
} from "../../../accessibility/browser/accessibleViewActions.js";
import {
  ITerminalService
} from "../../../terminal/browser/terminal.js";
import { registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { TerminalAccessibilityCommandId } from "../common/terminal.accessibility.js";
import { TerminalAccessibilitySettingId } from "../common/terminalAccessibilityConfiguration.js";
import { BufferContentTracker } from "./bufferContentTracker.js";
import { TerminalAccessibilityHelpProvider } from "./terminalAccessibilityHelp.js";
import {
  TerminalAccessibleBufferProvider
} from "./terminalAccessibleBufferProvider.js";
import { TextAreaSyncAddon } from "./textAreaSyncAddon.js";
let TextAreaSyncContribution = class extends DisposableStore {
  constructor(_instance, processManager, widgetManager, _instantiationService) {
    super();
    this._instance = _instance;
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "TextAreaSyncContribution");
  }
  static ID = "terminal.textAreaSync";
  static get(instance) {
    return instance.getContribution(
      TextAreaSyncContribution.ID
    );
  }
  _addon;
  layout(xterm) {
    if (this._addon) {
      return;
    }
    this._addon = this.add(
      this._instantiationService.createInstance(
        TextAreaSyncAddon,
        this._instance.capabilities
      )
    );
    xterm.raw.loadAddon(this._addon);
    this._addon.activate(xterm.raw);
  }
};
TextAreaSyncContribution = __decorateClass([
  __decorateParam(3, IInstantiationService)
], TextAreaSyncContribution);
registerTerminalContribution(
  TextAreaSyncContribution.ID,
  TextAreaSyncContribution
);
let TerminalAccessibleViewContribution = class extends Disposable {
  constructor(_instance, processManager, widgetManager, _accessibleViewService, _instantiationService, _terminalService, _configurationService, _contextKeyService, _accessibilitySignalService) {
    super();
    this._instance = _instance;
    this._accessibleViewService = _accessibleViewService;
    this._instantiationService = _instantiationService;
    this._terminalService = _terminalService;
    this._configurationService = _configurationService;
    this._contextKeyService = _contextKeyService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._register(AccessibleViewAction.addImplementation(90, "terminal", () => {
      if (this._terminalService.activeInstance !== this._instance) {
        return false;
      }
      this.show();
      return true;
    }, TerminalContextKeys.focus));
    this._register(_instance.onDidExecuteText(() => {
      const focusAfterRun = _configurationService.getValue(TerminalSettingId.FocusAfterRun);
      if (focusAfterRun === "terminal") {
        _instance.focus(true);
      } else if (focusAfterRun === "accessible-buffer") {
        this.show();
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TerminalAccessibilitySettingId.AccessibleViewFocusOnCommandExecution)) {
        this._updateCommandExecutedListener();
      }
    }));
    this._register(this._instance.capabilities.onDidAddCapability((e) => {
      if (e.capability.type === TerminalCapability.CommandDetection) {
        this._updateCommandExecutedListener();
      }
    }));
  }
  static {
    __name(this, "TerminalAccessibleViewContribution");
  }
  static ID = "terminal.accessibleBufferProvider";
  static get(instance) {
    return instance.getContribution(
      TerminalAccessibleViewContribution.ID
    );
  }
  _bufferTracker;
  _bufferProvider;
  _xterm;
  _onDidRunCommand = new MutableDisposable();
  xtermReady(xterm) {
    const addon = this._instantiationService.createInstance(
      TextAreaSyncAddon,
      this._instance.capabilities
    );
    xterm.raw.loadAddon(addon);
    addon.activate(xterm.raw);
    this._xterm = xterm;
    this._register(
      this._xterm.raw.onWriteParsed(async () => {
        if (this._terminalService.activeInstance !== this._instance) {
          return;
        }
        if (this._isTerminalAccessibleViewOpen() && this._xterm.raw.buffer.active.baseY === 0) {
          this.show();
        }
      })
    );
    const onRequestUpdateEditor = Event.latch(this._xterm.raw.onScroll);
    this._register(
      onRequestUpdateEditor(() => {
        if (this._terminalService.activeInstance !== this._instance) {
          return;
        }
        if (this._isTerminalAccessibleViewOpen()) {
          this.show();
        }
      })
    );
  }
  _updateCommandExecutedListener() {
    if (!this._instance.capabilities.has(
      TerminalCapability.CommandDetection
    )) {
      return;
    }
    if (!this._configurationService.getValue(
      TerminalAccessibilitySettingId.AccessibleViewFocusOnCommandExecution
    )) {
      this._onDidRunCommand.clear();
      return;
    } else if (this._onDidRunCommand.value) {
      return;
    }
    const capability = this._instance.capabilities.get(
      TerminalCapability.CommandDetection
    );
    this._onDidRunCommand.value = this._register(
      capability.onCommandExecuted(() => {
        if (this._instance.hasFocus) {
          this.show();
        }
      })
    );
  }
  _isTerminalAccessibleViewOpen() {
    return accessibleViewCurrentProviderId.getValue(
      this._contextKeyService
    ) === AccessibleViewProviderId.Terminal;
  }
  show() {
    if (!this._xterm) {
      return;
    }
    if (!this._bufferTracker) {
      this._bufferTracker = this._register(
        this._instantiationService.createInstance(
          BufferContentTracker,
          this._xterm
        )
      );
    }
    if (!this._bufferProvider) {
      this._bufferProvider = this._register(
        this._instantiationService.createInstance(
          TerminalAccessibleBufferProvider,
          this._instance,
          this._bufferTracker,
          () => {
            return this._register(
              this._instantiationService.createInstance(
                TerminalAccessibilityHelpProvider,
                this._instance,
                this._xterm
              )
            ).provideContent();
          }
        )
      );
    }
    const position = this._configurationService.getValue(
      TerminalAccessibilitySettingId.AccessibleViewPreserveCursorPosition
    ) ? this._accessibleViewService.getPosition(
      AccessibleViewProviderId.Terminal
    ) : void 0;
    this._accessibleViewService.show(this._bufferProvider, position);
  }
  navigateToCommand(type) {
    const currentLine = this._accessibleViewService.getPosition(
      AccessibleViewProviderId.Terminal
    )?.lineNumber;
    const commands = this._getCommandsWithEditorLine();
    if (!commands?.length || !currentLine) {
      return;
    }
    const filteredCommands = type === NavigationType.Previous ? commands.filter((c) => c.lineNumber < currentLine).sort((a, b) => b.lineNumber - a.lineNumber) : commands.filter((c) => c.lineNumber > currentLine).sort((a, b) => a.lineNumber - b.lineNumber);
    if (!filteredCommands.length) {
      return;
    }
    const command = filteredCommands[0];
    const commandLine = command.command.command;
    if (!isWindows && commandLine) {
      this._accessibleViewService.setPosition(
        new Position(command.lineNumber, 1),
        true
      );
      alert(commandLine);
    } else {
      this._accessibleViewService.setPosition(
        new Position(command.lineNumber, 1),
        true,
        true
      );
    }
    if (command.exitCode) {
      this._accessibilitySignalService.playSignal(
        AccessibilitySignal.terminalCommandFailed
      );
    } else {
      this._accessibilitySignalService.playSignal(
        AccessibilitySignal.terminalCommandSucceeded
      );
    }
  }
  _getCommandsWithEditorLine() {
    const capability = this._instance.capabilities.get(
      TerminalCapability.CommandDetection
    );
    const commands = capability?.commands;
    const currentCommand = capability?.currentCommand;
    if (!commands?.length) {
      return;
    }
    const result = [];
    for (const command of commands) {
      const lineNumber = this._getEditorLineForCommand(command);
      if (!lineNumber) {
        continue;
      }
      result.push({ command, lineNumber, exitCode: command.exitCode });
    }
    if (currentCommand) {
      const lineNumber = this._getEditorLineForCommand(currentCommand);
      if (!!lineNumber) {
        result.push({ command: currentCommand, lineNumber });
      }
    }
    return result;
  }
  _getEditorLineForCommand(command) {
    if (!this._bufferTracker) {
      return;
    }
    let line;
    if ("marker" in command) {
      line = command.marker?.line;
    } else if ("commandStartMarker" in command) {
      line = command.commandStartMarker?.line;
    }
    if (line === void 0 || line < 0) {
      return;
    }
    line = this._bufferTracker.bufferToEditorLineMapping.get(line);
    if (line === void 0) {
      return;
    }
    return line + 1;
  }
};
TerminalAccessibleViewContribution = __decorateClass([
  __decorateParam(3, IAccessibleViewService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITerminalService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IAccessibilitySignalService)
], TerminalAccessibleViewContribution);
registerTerminalContribution(
  TerminalAccessibleViewContribution.ID,
  TerminalAccessibleViewContribution
);
class TerminalAccessibilityHelpContribution extends Disposable {
  static {
    __name(this, "TerminalAccessibilityHelpContribution");
  }
  static ID;
  constructor() {
    super();
    this._register(
      AccessibilityHelpAction.addImplementation(
        105,
        "terminal",
        async (accessor) => {
          const instantiationService = accessor.get(
            IInstantiationService
          );
          const terminalService = accessor.get(ITerminalService);
          const accessibleViewService = accessor.get(
            IAccessibleViewService
          );
          const instance = await terminalService.getActiveOrCreateInstance();
          await terminalService.revealActiveTerminal();
          const terminal = instance?.xterm;
          if (!terminal) {
            return;
          }
          accessibleViewService.show(
            instantiationService.createInstance(
              TerminalAccessibilityHelpProvider,
              instance,
              terminal
            )
          );
        },
        ContextKeyExpr.or(
          TerminalContextKeys.focus,
          ContextKeyExpr.and(
            accessibleViewIsShown,
            ContextKeyExpr.equals(
              accessibleViewCurrentProviderId.key,
              AccessibleViewProviderId.Terminal
            )
          )
        )
      )
    );
  }
}
registerTerminalContribution(
  TerminalAccessibilityHelpContribution.ID,
  TerminalAccessibilityHelpContribution
);
class FocusAccessibleBufferAction extends Action2 {
  static {
    __name(this, "FocusAccessibleBufferAction");
  }
  constructor() {
    super({
      id: TerminalAccessibilityCommandId.FocusAccessibleBuffer,
      title: localize2(
        "workbench.action.terminal.focusAccessibleBuffer",
        "Focus Accessible Terminal View"
      ),
      precondition: ContextKeyExpr.or(
        TerminalContextKeys.processSupported,
        TerminalContextKeys.terminalHasBeenCreated
      ),
      keybinding: [
        {
          primary: KeyMod.Alt | KeyCode.F2,
          secondary: [KeyMod.CtrlCmd | KeyCode.UpArrow],
          linux: {
            primary: KeyMod.Alt | KeyCode.F2 | KeyMod.Shift,
            secondary: [KeyMod.CtrlCmd | KeyCode.UpArrow]
          },
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            CONTEXT_ACCESSIBILITY_MODE_ENABLED,
            TerminalContextKeys.focus
          )
        }
      ]
    });
  }
  async run(accessor, ...args) {
    const terminalService = accessor.get(ITerminalService);
    const terminal = await terminalService.getActiveOrCreateInstance();
    if (!terminal?.xterm) {
      return;
    }
    TerminalAccessibleViewContribution.get(terminal)?.show();
  }
}
registerAction2(FocusAccessibleBufferAction);
registerTerminalAction({
  id: TerminalAccessibilityCommandId.AccessibleBufferGoToNextCommand,
  title: localize2(
    "workbench.action.terminal.accessibleBufferGoToNextCommand",
    "Accessible Buffer Go to Next Command"
  ),
  precondition: ContextKeyExpr.or(
    TerminalContextKeys.processSupported,
    TerminalContextKeys.terminalHasBeenCreated,
    ContextKeyExpr.and(
      accessibleViewIsShown,
      ContextKeyExpr.equals(
        accessibleViewCurrentProviderId.key,
        AccessibleViewProviderId.Terminal
      )
    )
  ),
  keybinding: [
    {
      primary: KeyMod.Alt | KeyCode.DownArrow,
      when: ContextKeyExpr.and(
        ContextKeyExpr.and(
          accessibleViewIsShown,
          ContextKeyExpr.equals(
            accessibleViewCurrentProviderId.key,
            AccessibleViewProviderId.Terminal
          )
        )
      ),
      weight: KeybindingWeight.WorkbenchContrib + 2
    }
  ],
  run: /* @__PURE__ */ __name(async (c) => {
    const instance = await c.service.activeInstance;
    if (!instance) {
      return;
    }
    await TerminalAccessibleViewContribution.get(
      instance
    )?.navigateToCommand(NavigationType.Next);
  }, "run")
});
registerTerminalAction({
  id: TerminalAccessibilityCommandId.AccessibleBufferGoToPreviousCommand,
  title: localize2(
    "workbench.action.terminal.accessibleBufferGoToPreviousCommand",
    "Accessible Buffer Go to Previous Command"
  ),
  precondition: ContextKeyExpr.and(
    ContextKeyExpr.or(
      TerminalContextKeys.processSupported,
      TerminalContextKeys.terminalHasBeenCreated
    ),
    ContextKeyExpr.and(
      accessibleViewIsShown,
      ContextKeyExpr.equals(
        accessibleViewCurrentProviderId.key,
        AccessibleViewProviderId.Terminal
      )
    )
  ),
  keybinding: [
    {
      primary: KeyMod.Alt | KeyCode.UpArrow,
      when: ContextKeyExpr.and(
        ContextKeyExpr.and(
          accessibleViewIsShown,
          ContextKeyExpr.equals(
            accessibleViewCurrentProviderId.key,
            AccessibleViewProviderId.Terminal
          )
        )
      ),
      weight: KeybindingWeight.WorkbenchContrib + 2
    }
  ],
  run: /* @__PURE__ */ __name(async (c) => {
    const instance = await c.service.activeInstance;
    if (!instance) {
      return;
    }
    await TerminalAccessibleViewContribution.get(
      instance
    )?.navigateToCommand(NavigationType.Previous);
  }, "run")
});
registerTerminalAction({
  id: TerminalAccessibilityCommandId.ScrollToBottomAccessibleView,
  title: localize2(
    "workbench.action.terminal.scrollToBottomAccessibleView",
    "Scroll to Accessible View Bottom"
  ),
  precondition: ContextKeyExpr.and(
    ContextKeyExpr.or(
      TerminalContextKeys.processSupported,
      TerminalContextKeys.terminalHasBeenCreated
    ),
    ContextKeyExpr.and(
      accessibleViewIsShown,
      ContextKeyExpr.equals(
        accessibleViewCurrentProviderId.key,
        AccessibleViewProviderId.Terminal
      )
    )
  ),
  keybinding: {
    primary: KeyMod.CtrlCmd | KeyCode.End,
    linux: { primary: KeyMod.Shift | KeyCode.End },
    when: accessibleViewCurrentProviderId.isEqualTo(
      AccessibleViewProviderId.Terminal
    ),
    weight: KeybindingWeight.WorkbenchContrib
  },
  run: /* @__PURE__ */ __name((c, accessor) => {
    const accessibleViewService = accessor.get(IAccessibleViewService);
    const lastPosition = accessibleViewService.getLastPosition();
    if (!lastPosition) {
      return;
    }
    accessibleViewService.setPosition(lastPosition, true);
  }, "run")
});
registerTerminalAction({
  id: TerminalAccessibilityCommandId.ScrollToTopAccessibleView,
  title: localize2(
    "workbench.action.terminal.scrollToTopAccessibleView",
    "Scroll to Accessible View Top"
  ),
  precondition: ContextKeyExpr.and(
    ContextKeyExpr.or(
      TerminalContextKeys.processSupported,
      TerminalContextKeys.terminalHasBeenCreated
    ),
    ContextKeyExpr.and(
      accessibleViewIsShown,
      ContextKeyExpr.equals(
        accessibleViewCurrentProviderId.key,
        AccessibleViewProviderId.Terminal
      )
    )
  ),
  keybinding: {
    primary: KeyMod.CtrlCmd | KeyCode.Home,
    linux: { primary: KeyMod.Shift | KeyCode.Home },
    when: accessibleViewCurrentProviderId.isEqualTo(
      AccessibleViewProviderId.Terminal
    ),
    weight: KeybindingWeight.WorkbenchContrib
  },
  run: /* @__PURE__ */ __name((c, accessor) => {
    const accessibleViewService = accessor.get(IAccessibleViewService);
    accessibleViewService.setPosition(new Position(1, 1), true);
  }, "run")
});
export {
  TerminalAccessibilityHelpContribution,
  TerminalAccessibleViewContribution
};
//# sourceMappingURL=terminal.accessibility.contribution.js.map
