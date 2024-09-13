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
import { localize } from "../../../../nls.js";
import { IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { IPickerQuickAccessItem, PickerQuickAccessProvider, TriggerAction } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { matchesFuzzy } from "../../../../base/common/filters.js";
import { ITerminalEditorService, ITerminalGroupService, ITerminalInstance, ITerminalService } from "./terminal.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { TerminalCommandId } from "../common/terminal.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { killTerminalIcon, renameTerminalIcon } from "./terminalIcons.js";
import { getColorClass, getIconId, getUriClasses } from "./terminalIcon.js";
import { terminalStrings } from "../common/terminalStrings.js";
import { TerminalLocation } from "../../../../platform/terminal/common/terminal.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
let terminalPicks = [];
let TerminalQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(_editorService, _terminalService, _terminalEditorService, _terminalGroupService, _commandService, _themeService, _instantiationService) {
    super(TerminalQuickAccessProvider.PREFIX, { canAcceptInBackground: true });
    this._editorService = _editorService;
    this._terminalService = _terminalService;
    this._terminalEditorService = _terminalEditorService;
    this._terminalGroupService = _terminalGroupService;
    this._commandService = _commandService;
    this._themeService = _themeService;
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "TerminalQuickAccessProvider");
  }
  static PREFIX = "term ";
  _getPicks(filter) {
    terminalPicks = [];
    terminalPicks.push({ type: "separator", label: "panel" });
    const terminalGroups = this._terminalGroupService.groups;
    for (let groupIndex = 0; groupIndex < terminalGroups.length; groupIndex++) {
      const terminalGroup = terminalGroups[groupIndex];
      for (let terminalIndex = 0; terminalIndex < terminalGroup.terminalInstances.length; terminalIndex++) {
        const terminal = terminalGroup.terminalInstances[terminalIndex];
        const pick = this._createPick(terminal, terminalIndex, filter, { groupIndex, groupSize: terminalGroup.terminalInstances.length });
        if (pick) {
          terminalPicks.push(pick);
        }
      }
    }
    if (terminalPicks.length > 0) {
      terminalPicks.push({ type: "separator", label: "editor" });
    }
    const terminalEditors = this._terminalEditorService.instances;
    for (let editorIndex = 0; editorIndex < terminalEditors.length; editorIndex++) {
      const term = terminalEditors[editorIndex];
      term.target = TerminalLocation.Editor;
      const pick = this._createPick(term, editorIndex, filter);
      if (pick) {
        terminalPicks.push(pick);
      }
    }
    if (terminalPicks.length > 0) {
      terminalPicks.push({ type: "separator" });
    }
    const createTerminalLabel = localize("workbench.action.terminal.newplus", "Create New Terminal");
    terminalPicks.push({
      label: `$(plus) ${createTerminalLabel}`,
      ariaLabel: createTerminalLabel,
      accept: /* @__PURE__ */ __name(() => this._commandService.executeCommand(TerminalCommandId.New), "accept")
    });
    const createWithProfileLabel = localize("workbench.action.terminal.newWithProfilePlus", "Create New Terminal With Profile...");
    terminalPicks.push({
      label: `$(plus) ${createWithProfileLabel}`,
      ariaLabel: createWithProfileLabel,
      accept: /* @__PURE__ */ __name(() => this._commandService.executeCommand(TerminalCommandId.NewWithProfile), "accept")
    });
    return terminalPicks;
  }
  _createPick(terminal, terminalIndex, filter, groupInfo) {
    const iconId = this._instantiationService.invokeFunction(getIconId, terminal);
    const index = groupInfo ? groupInfo.groupSize > 1 ? `${groupInfo.groupIndex + 1}.${terminalIndex + 1}` : `${groupInfo.groupIndex + 1}` : `${terminalIndex + 1}`;
    const label = `$(${iconId}) ${index}: ${terminal.title}`;
    const iconClasses = [];
    const colorClass = getColorClass(terminal);
    if (colorClass) {
      iconClasses.push(colorClass);
    }
    const uriClasses = getUriClasses(terminal, this._themeService.getColorTheme().type);
    if (uriClasses) {
      iconClasses.push(...uriClasses);
    }
    const highlights = matchesFuzzy(filter, label, true);
    if (highlights) {
      return {
        label,
        description: terminal.description,
        highlights: { label: highlights },
        buttons: [
          {
            iconClass: ThemeIcon.asClassName(renameTerminalIcon),
            tooltip: localize("renameTerminal", "Rename Terminal")
          },
          {
            iconClass: ThemeIcon.asClassName(killTerminalIcon),
            tooltip: terminalStrings.kill.value
          }
        ],
        iconClasses,
        trigger: /* @__PURE__ */ __name((buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              this._commandService.executeCommand(TerminalCommandId.Rename, terminal);
              return TriggerAction.NO_ACTION;
            case 1:
              this._terminalService.safeDisposeTerminal(terminal);
              return TriggerAction.REMOVE_ITEM;
          }
          return TriggerAction.NO_ACTION;
        }, "trigger"),
        accept: /* @__PURE__ */ __name((keyMod, event) => {
          if (terminal.target === TerminalLocation.Editor) {
            const existingEditors = this._editorService.findEditors(terminal.resource);
            this._terminalEditorService.openEditor(terminal, { viewColumn: existingEditors?.[0].groupId });
            this._terminalEditorService.setActiveInstance(terminal);
          } else {
            this._terminalGroupService.showPanel(!event.inBackground);
            this._terminalGroupService.setActiveInstance(terminal);
          }
        }, "accept")
      };
    }
    return void 0;
  }
};
TerminalQuickAccessProvider = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ITerminalService),
  __decorateParam(2, ITerminalEditorService),
  __decorateParam(3, ITerminalGroupService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IInstantiationService)
], TerminalQuickAccessProvider);
export {
  TerminalQuickAccessProvider
};
//# sourceMappingURL=terminalQuickAccess.js.map
