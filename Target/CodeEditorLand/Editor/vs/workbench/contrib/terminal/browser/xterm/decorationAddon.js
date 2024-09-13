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
import * as dom from "../../../../../base/browser/dom.js";
import { Separator } from "../../../../../base/common/actions.js";
import { Emitter } from "../../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  dispose,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import {
  AccessibilitySignal,
  IAccessibilitySignalService
} from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import {
  INotificationService,
  Severity
} from "../../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import {
  IQuickInputService
} from "../../../../../platform/quickinput/common/quickInput.js";
import {
  CommandInvalidationReason,
  TerminalCapability
} from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { TerminalSettingId } from "../../../../../platform/terminal/common/terminal.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import {
  TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR,
  TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR,
  TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR
} from "../../common/terminalColorRegistry.js";
import {
  terminalDecorationError,
  terminalDecorationIncomplete,
  terminalDecorationMark,
  terminalDecorationSuccess
} from "../terminalIcons.js";
import {
  DecorationSelector,
  TerminalDecorationHoverManager,
  updateLayout
} from "./decorationStyles.js";
let DecorationAddon = class extends Disposable {
  constructor(_capabilities, _clipboardService, _contextMenuService, _configurationService, _themeService, _openerService, _quickInputService, lifecycleService, _commandService, instantiationService, _accessibilitySignalService, _notificationService) {
    super();
    this._capabilities = _capabilities;
    this._clipboardService = _clipboardService;
    this._contextMenuService = _contextMenuService;
    this._configurationService = _configurationService;
    this._themeService = _themeService;
    this._openerService = _openerService;
    this._quickInputService = _quickInputService;
    this._commandService = _commandService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._notificationService = _notificationService;
    this._register(toDisposable(() => this._dispose()));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TerminalSettingId.FontSize) || e.affectsConfiguration(TerminalSettingId.LineHeight)) {
        this.refreshLayouts();
      } else if (e.affectsConfiguration("workbench.colorCustomizations")) {
        this._refreshStyles(true);
      } else if (e.affectsConfiguration(TerminalSettingId.ShellIntegrationDecorationsEnabled)) {
        this._removeCapabilityDisposables(TerminalCapability.CommandDetection);
        this._updateDecorationVisibility();
      }
    }));
    this._register(this._themeService.onDidColorThemeChange(() => this._refreshStyles(true)));
    this._updateDecorationVisibility();
    this._register(this._capabilities.onDidAddCapabilityType((c) => this._createCapabilityDisposables(c)));
    this._register(this._capabilities.onDidRemoveCapabilityType((c) => this._removeCapabilityDisposables(c)));
    this._register(lifecycleService.onWillShutdown(() => this._disposeAllDecorations()));
    this._terminalDecorationHoverManager = this._register(instantiationService.createInstance(TerminalDecorationHoverManager));
  }
  static {
    __name(this, "DecorationAddon");
  }
  _terminal;
  _capabilityDisposables = /* @__PURE__ */ new Map();
  _decorations = /* @__PURE__ */ new Map();
  _placeholderDecoration;
  _showGutterDecorations;
  _showOverviewRulerDecorations;
  _terminalDecorationHoverManager;
  _onDidRequestRunCommand = this._register(
    new Emitter()
  );
  onDidRequestRunCommand = this._onDidRequestRunCommand.event;
  _removeCapabilityDisposables(c) {
    const disposables = this._capabilityDisposables.get(c);
    if (disposables) {
      dispose(disposables);
    }
    this._capabilityDisposables.delete(c);
  }
  _createCapabilityDisposables(c) {
    const store = new DisposableStore();
    const capability = this._capabilities.get(c);
    if (!capability || this._capabilityDisposables.has(c)) {
      return;
    }
    switch (capability.type) {
      case TerminalCapability.BufferMarkDetection:
        store.add(
          capability.onMarkAdded(
            (mark) => this.registerMarkDecoration(mark)
          )
        );
        break;
      case TerminalCapability.CommandDetection: {
        const disposables = this._getCommandDetectionListeners(capability);
        for (const d of disposables) {
          store.add(d);
        }
        break;
      }
    }
    this._capabilityDisposables.set(c, store);
  }
  registerMarkDecoration(mark) {
    if (!this._terminal || !this._showGutterDecorations && !this._showOverviewRulerDecorations) {
      return void 0;
    }
    if (mark.hidden) {
      return void 0;
    }
    return this.registerCommandDecoration(void 0, void 0, mark);
  }
  _updateDecorationVisibility() {
    const showDecorations = this._configurationService.getValue(
      TerminalSettingId.ShellIntegrationDecorationsEnabled
    );
    this._showGutterDecorations = showDecorations === "both" || showDecorations === "gutter";
    this._showOverviewRulerDecorations = showDecorations === "both" || showDecorations === "overviewRuler";
    this._disposeAllDecorations();
    if (this._showGutterDecorations || this._showOverviewRulerDecorations) {
      this._attachToCommandCapability();
      this._updateGutterDecorationVisibility();
    }
    const currentCommand = this._capabilities.get(
      TerminalCapability.CommandDetection
    )?.executingCommandObject;
    if (currentCommand) {
      this.registerCommandDecoration(currentCommand, true);
    }
  }
  _disposeAllDecorations() {
    this._placeholderDecoration?.dispose();
    for (const value of this._decorations.values()) {
      value.decoration.dispose();
      dispose(value.disposables);
    }
  }
  _updateGutterDecorationVisibility() {
    const commandDecorationElements = this._terminal?.element?.querySelectorAll(
      DecorationSelector.CommandDecoration
    );
    if (commandDecorationElements) {
      for (const commandDecorationElement of commandDecorationElements) {
        this._updateCommandDecorationVisibility(
          commandDecorationElement
        );
      }
    }
  }
  _updateCommandDecorationVisibility(commandDecorationElement) {
    if (this._showGutterDecorations) {
      commandDecorationElement.classList.remove(DecorationSelector.Hide);
    } else {
      commandDecorationElement.classList.add(DecorationSelector.Hide);
    }
  }
  refreshLayouts() {
    updateLayout(
      this._configurationService,
      this._placeholderDecoration?.element
    );
    for (const decoration of this._decorations) {
      updateLayout(
        this._configurationService,
        decoration[1].decoration.element
      );
    }
  }
  _refreshStyles(refreshOverviewRulerColors) {
    if (refreshOverviewRulerColors) {
      for (const decoration of this._decorations.values()) {
        const color = this._getDecorationCssColor(decoration)?.toString() ?? "";
        if (decoration.decoration.options?.overviewRulerOptions) {
          decoration.decoration.options.overviewRulerOptions.color = color;
        } else if (decoration.decoration.options) {
          decoration.decoration.options.overviewRulerOptions = {
            color
          };
        }
      }
    }
    this._updateClasses(this._placeholderDecoration?.element);
    for (const decoration of this._decorations.values()) {
      this._updateClasses(
        decoration.decoration.element,
        decoration.exitCode,
        decoration.markProperties
      );
    }
  }
  _dispose() {
    this._terminalDecorationHoverManager.dispose();
    for (const disposable of this._capabilityDisposables.values()) {
      dispose(disposable);
    }
    this.clearDecorations();
  }
  _clearPlaceholder() {
    this._placeholderDecoration?.dispose();
    this._placeholderDecoration = void 0;
  }
  clearDecorations() {
    this._placeholderDecoration?.marker.dispose();
    this._clearPlaceholder();
    this._disposeAllDecorations();
    this._decorations.clear();
  }
  _attachToCommandCapability() {
    if (this._capabilities.has(TerminalCapability.CommandDetection)) {
      const capability = this._capabilities.get(
        TerminalCapability.CommandDetection
      );
      const disposables = this._getCommandDetectionListeners(capability);
      const store = new DisposableStore();
      for (const d of disposables) {
        store.add(d);
      }
      this._capabilityDisposables.set(
        TerminalCapability.CommandDetection,
        store
      );
    }
  }
  _getCommandDetectionListeners(capability) {
    if (this._capabilityDisposables.has(TerminalCapability.CommandDetection)) {
      const disposables = this._capabilityDisposables.get(
        TerminalCapability.CommandDetection
      );
      dispose(disposables);
      this._capabilityDisposables.delete(capability.type);
    }
    const commandDetectionListeners = [];
    if (capability.executingCommandObject?.marker) {
      this.registerCommandDecoration(
        capability.executingCommandObject,
        true
      );
    }
    commandDetectionListeners.push(
      capability.onCommandStarted(
        (command) => this.registerCommandDecoration(command, true)
      )
    );
    for (const command of capability.commands) {
      this.registerCommandDecoration(command);
    }
    commandDetectionListeners.push(
      capability.onCommandFinished((command) => {
        this.registerCommandDecoration(command);
        if (command.exitCode) {
          this._accessibilitySignalService.playSignal(
            AccessibilitySignal.terminalCommandFailed
          );
        } else {
          this._accessibilitySignalService.playSignal(
            AccessibilitySignal.terminalCommandSucceeded
          );
        }
      })
    );
    commandDetectionListeners.push(
      capability.onCommandInvalidated((commands) => {
        for (const command of commands) {
          const id = command.marker?.id;
          if (id) {
            const match = this._decorations.get(id);
            if (match) {
              match.decoration.dispose();
              dispose(match.disposables);
            }
          }
        }
      })
    );
    commandDetectionListeners.push(
      capability.onCurrentCommandInvalidated((request) => {
        if (request.reason === CommandInvalidationReason.NoProblemsReported) {
          const lastDecoration = Array.from(
            this._decorations.entries()
          )[this._decorations.size - 1];
          lastDecoration?.[1].decoration.dispose();
        } else if (request.reason === CommandInvalidationReason.Windows) {
          this._clearPlaceholder();
        }
      })
    );
    return commandDetectionListeners;
  }
  activate(terminal) {
    this._terminal = terminal;
    this._attachToCommandCapability();
  }
  registerCommandDecoration(command, beforeCommandExecution, markProperties) {
    if (!this._terminal || beforeCommandExecution && !command || !this._showGutterDecorations && !this._showOverviewRulerDecorations) {
      return void 0;
    }
    const marker = command?.marker || markProperties?.marker;
    if (!marker) {
      throw new Error(
        `cannot add a decoration for a command ${JSON.stringify(command)} with no marker`
      );
    }
    this._clearPlaceholder();
    const color = this._getDecorationCssColor(command)?.toString() ?? "";
    const decoration = this._terminal.registerDecoration({
      marker,
      overviewRulerOptions: this._showOverviewRulerDecorations ? beforeCommandExecution ? { color, position: "left" } : { color, position: command?.exitCode ? "right" : "left" } : void 0
    });
    if (!decoration) {
      return void 0;
    }
    if (beforeCommandExecution) {
      this._placeholderDecoration = decoration;
    }
    decoration.onRender((element) => {
      if (element.classList.contains(DecorationSelector.OverviewRuler)) {
        return;
      }
      if (!this._decorations.get(decoration.marker.id)) {
        decoration.onDispose(
          () => this._decorations.delete(decoration.marker.id)
        );
        this._decorations.set(decoration.marker.id, {
          decoration,
          disposables: this._createDisposables(
            element,
            command,
            markProperties
          ),
          exitCode: command?.exitCode,
          markProperties: command?.markProperties
        });
      }
      if (!element.classList.contains(DecorationSelector.Codicon) || command?.marker?.line === 0) {
        updateLayout(this._configurationService, element);
        this._updateClasses(
          element,
          command?.exitCode,
          command?.markProperties || markProperties
        );
      }
    });
    return decoration;
  }
  _createDisposables(element, command, markProperties) {
    if (command?.exitCode === void 0 && !command?.markProperties) {
      return [];
    } else if (command?.markProperties || markProperties) {
      return [
        this._terminalDecorationHoverManager.createHover(
          element,
          command || markProperties,
          markProperties?.hoverMessage
        )
      ];
    }
    return [
      ...this._createContextMenu(element, command),
      this._terminalDecorationHoverManager.createHover(element, command)
    ];
  }
  _updateClasses(element, exitCode, markProperties) {
    if (!element) {
      return;
    }
    for (const classes of element.classList) {
      element.classList.remove(classes);
    }
    element.classList.add(
      DecorationSelector.CommandDecoration,
      DecorationSelector.Codicon,
      DecorationSelector.XtermDecoration
    );
    if (markProperties) {
      element.classList.add(
        DecorationSelector.DefaultColor,
        ...ThemeIcon.asClassNameArray(terminalDecorationMark)
      );
      if (!markProperties.hoverMessage) {
        element.classList.add(DecorationSelector.Default);
      }
    } else {
      this._updateCommandDecorationVisibility(element);
      if (exitCode === void 0) {
        element.classList.add(
          DecorationSelector.DefaultColor,
          DecorationSelector.Default
        );
        element.classList.add(
          ...ThemeIcon.asClassNameArray(terminalDecorationIncomplete)
        );
      } else if (exitCode) {
        element.classList.add(DecorationSelector.ErrorColor);
        element.classList.add(
          ...ThemeIcon.asClassNameArray(terminalDecorationError)
        );
      } else {
        element.classList.add(
          ...ThemeIcon.asClassNameArray(terminalDecorationSuccess)
        );
      }
    }
  }
  _createContextMenu(element, command) {
    return [
      dom.addDisposableListener(
        element,
        dom.EventType.MOUSE_DOWN,
        async (e) => {
          e.stopImmediatePropagation();
        }
      ),
      dom.addDisposableListener(
        element,
        dom.EventType.CLICK,
        async (e) => {
          e.stopImmediatePropagation();
          this._terminalDecorationHoverManager.hideHover();
          const actions = await this._getCommandActions(command);
          this._contextMenuService.showContextMenu({
            getAnchor: /* @__PURE__ */ __name(() => element, "getAnchor"),
            getActions: /* @__PURE__ */ __name(() => actions, "getActions")
          });
        }
      ),
      dom.addDisposableListener(
        element,
        dom.EventType.CONTEXT_MENU,
        async (e) => {
          e.stopImmediatePropagation();
          this._terminalDecorationHoverManager.hideHover();
          const actions = this._getContextMenuActions();
          this._contextMenuService.showContextMenu({
            getAnchor: /* @__PURE__ */ __name(() => element, "getAnchor"),
            getActions: /* @__PURE__ */ __name(() => actions, "getActions")
          });
        }
      )
    ];
  }
  _getContextMenuActions() {
    const label = localize(
      "workbench.action.terminal.toggleVisibility",
      "Toggle Visibility"
    );
    return [
      {
        class: void 0,
        tooltip: label,
        id: "terminal.toggleVisibility",
        label,
        enabled: true,
        run: /* @__PURE__ */ __name(async () => {
          this._showToggleVisibilityQuickPick();
        }, "run")
      }
    ];
  }
  async _getCommandActions(command) {
    const actions = [];
    if (command.command !== "") {
      const labelRun = localize("terminal.rerunCommand", "Rerun Command");
      actions.push({
        class: void 0,
        tooltip: labelRun,
        id: "terminal.rerunCommand",
        label: labelRun,
        enabled: true,
        run: /* @__PURE__ */ __name(async () => {
          if (command.command === "") {
            return;
          }
          if (!command.isTrusted) {
            const shouldRun = await new Promise((r) => {
              this._notificationService.prompt(
                Severity.Info,
                localize(
                  "rerun",
                  "Do you want to run the command: {0}",
                  command.command
                ),
                [
                  {
                    label: localize("yes", "Yes"),
                    run: /* @__PURE__ */ __name(() => r(true), "run")
                  },
                  {
                    label: localize("no", "No"),
                    run: /* @__PURE__ */ __name(() => r(false), "run")
                  }
                ]
              );
            });
            if (!shouldRun) {
              return;
            }
          }
          this._onDidRequestRunCommand.fire({ command });
        }, "run")
      });
      actions.push(new Separator());
      const labelCopy = localize("terminal.copyCommand", "Copy Command");
      actions.push({
        class: void 0,
        tooltip: labelCopy,
        id: "terminal.copyCommand",
        label: labelCopy,
        enabled: true,
        run: /* @__PURE__ */ __name(() => this._clipboardService.writeText(command.command), "run")
      });
    }
    if (command.hasOutput()) {
      const labelCopyCommandAndOutput = localize(
        "terminal.copyCommandAndOutput",
        "Copy Command and Output"
      );
      actions.push({
        class: void 0,
        tooltip: labelCopyCommandAndOutput,
        id: "terminal.copyCommandAndOutput",
        label: labelCopyCommandAndOutput,
        enabled: true,
        run: /* @__PURE__ */ __name(() => {
          const output = command.getOutput();
          if (typeof output === "string") {
            this._clipboardService.writeText(
              `${command.command !== "" ? command.command + "\n" : ""}${output}`
            );
          }
        }, "run")
      });
      const labelText = localize("terminal.copyOutput", "Copy Output");
      actions.push({
        class: void 0,
        tooltip: labelText,
        id: "terminal.copyOutput",
        label: labelText,
        enabled: true,
        run: /* @__PURE__ */ __name(() => {
          const text = command.getOutput();
          if (typeof text === "string") {
            this._clipboardService.writeText(text);
          }
        }, "run")
      });
      const labelHtml = localize(
        "terminal.copyOutputAsHtml",
        "Copy Output as HTML"
      );
      actions.push({
        class: void 0,
        tooltip: labelHtml,
        id: "terminal.copyOutputAsHtml",
        label: labelHtml,
        enabled: true,
        run: /* @__PURE__ */ __name(() => this._onDidRequestRunCommand.fire({
          command,
          copyAsHtml: true
        }), "run")
      });
    }
    if (actions.length > 0) {
      actions.push(new Separator());
    }
    const labelRunRecent = localize(
      "workbench.action.terminal.runRecentCommand",
      "Run Recent Command"
    );
    actions.push({
      class: void 0,
      tooltip: labelRunRecent,
      id: "workbench.action.terminal.runRecentCommand",
      label: labelRunRecent,
      enabled: true,
      run: /* @__PURE__ */ __name(() => this._commandService.executeCommand(
        "workbench.action.terminal.runRecentCommand"
      ), "run")
    });
    const labelGoToRecent = localize(
      "workbench.action.terminal.goToRecentDirectory",
      "Go To Recent Directory"
    );
    actions.push({
      class: void 0,
      tooltip: labelRunRecent,
      id: "workbench.action.terminal.goToRecentDirectory",
      label: labelGoToRecent,
      enabled: true,
      run: /* @__PURE__ */ __name(() => this._commandService.executeCommand(
        "workbench.action.terminal.goToRecentDirectory"
      ), "run")
    });
    actions.push(new Separator());
    const labelAbout = localize(
      "terminal.learnShellIntegration",
      "Learn About Shell Integration"
    );
    actions.push({
      class: void 0,
      tooltip: labelAbout,
      id: "terminal.learnShellIntegration",
      label: labelAbout,
      enabled: true,
      run: /* @__PURE__ */ __name(() => this._openerService.open(
        "https://code.visualstudio.com/docs/terminal/shell-integration"
      ), "run")
    });
    return actions;
  }
  _showToggleVisibilityQuickPick() {
    const quickPick = this._register(
      this._quickInputService.createQuickPick()
    );
    quickPick.hideInput = true;
    quickPick.hideCheckAll = true;
    quickPick.canSelectMany = true;
    quickPick.title = localize("toggleVisibility", "Toggle visibility");
    const configValue = this._configurationService.getValue(
      TerminalSettingId.ShellIntegrationDecorationsEnabled
    );
    const gutterIcon = {
      label: localize("gutter", "Gutter command decorations"),
      picked: configValue !== "never" && configValue !== "overviewRuler"
    };
    const overviewRulerIcon = {
      label: localize(
        "overviewRuler",
        "Overview ruler command decorations"
      ),
      picked: configValue !== "never" && configValue !== "gutter"
    };
    quickPick.items = [gutterIcon, overviewRulerIcon];
    const selectedItems = [];
    if (configValue !== "never") {
      if (configValue !== "gutter") {
        selectedItems.push(gutterIcon);
      }
      if (configValue !== "overviewRuler") {
        selectedItems.push(overviewRulerIcon);
      }
    }
    quickPick.selectedItems = selectedItems;
    this._register(
      quickPick.onDidChangeSelection(async (e) => {
        let newValue = "never";
        if (e.includes(gutterIcon)) {
          if (e.includes(overviewRulerIcon)) {
            newValue = "both";
          } else {
            newValue = "gutter";
          }
        } else if (e.includes(overviewRulerIcon)) {
          newValue = "overviewRuler";
        }
        await this._configurationService.updateValue(
          TerminalSettingId.ShellIntegrationDecorationsEnabled,
          newValue
        );
      })
    );
    quickPick.ok = false;
    quickPick.show();
  }
  _getDecorationCssColor(decorationOrCommand) {
    let colorId;
    if (decorationOrCommand?.exitCode === void 0) {
      colorId = TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR;
    } else {
      colorId = decorationOrCommand.exitCode ? TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR : TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR;
    }
    return this._themeService.getColorTheme().getColor(colorId)?.toString();
  }
};
DecorationAddon = __decorateClass([
  __decorateParam(1, IClipboardService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IOpenerService),
  __decorateParam(6, IQuickInputService),
  __decorateParam(7, ILifecycleService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IAccessibilitySignalService),
  __decorateParam(11, INotificationService)
], DecorationAddon);
export {
  DecorationAddon
};
//# sourceMappingURL=decorationAddon.js.map
