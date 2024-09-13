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
import { Toggle } from "../../../../base/browser/ui/toggle/toggle.js";
import { fromNow } from "../../../../base/common/date.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import {
  OperatingSystem,
  isMacintosh
} from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import {
  ITextModelService
} from "../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../nls.js";
import {
  AccessibleViewProviderId,
  IAccessibleViewService
} from "../../../../platform/accessibility/browser/accessibleView.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { showWithPinnedItems } from "../../../../platform/quickinput/browser/quickPickPin.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import {
  TerminalCapability
} from "../../../../platform/terminal/common/capabilities/capabilities.js";
import { collapseTildePath } from "../../../../platform/terminal/common/terminalEnvironment.js";
import {
  asCssVariable,
  inputActiveOptionBackground,
  inputActiveOptionBorder,
  inputActiveOptionForeground
} from "../../../../platform/theme/common/colorRegistry.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
  getCommandHistory,
  getDirectoryHistory,
  getShellFileHistory
} from "../common/history.js";
import { TerminalStorageKeys } from "../common/terminalStorageKeys.js";
import { terminalStrings } from "../common/terminalStrings.js";
import {
  commandHistoryFuzzySearchIcon,
  commandHistoryOutputIcon,
  commandHistoryRemoveIcon
} from "./terminalIcons.js";
async function showRunRecentQuickPick(accessor, instance, terminalInRunCommandPicker, type, filterMode, value) {
  if (!instance.xterm) {
    return;
  }
  const editorService = accessor.get(IEditorService);
  const instantiationService = accessor.get(IInstantiationService);
  const quickInputService = accessor.get(IQuickInputService);
  const storageService = accessor.get(IStorageService);
  const accessibleViewService = accessor.get(IAccessibleViewService);
  const runRecentStorageKey = `${TerminalStorageKeys.PinnedRecentCommandsPrefix}.${instance.shellType}`;
  let placeholder;
  let items = [];
  const commandMap = /* @__PURE__ */ new Set();
  const removeFromCommandHistoryButton = {
    iconClass: ThemeIcon.asClassName(commandHistoryRemoveIcon),
    tooltip: localize("removeCommand", "Remove from Command History")
  };
  const commandOutputButton = {
    iconClass: ThemeIcon.asClassName(commandHistoryOutputIcon),
    tooltip: localize("viewCommandOutput", "View Command Output"),
    alwaysVisible: false
  };
  if (type === "command") {
    let formatLabel2 = function(label) {
      return label.replace(/\r?\n/g, "\u23CE").replace(/\s\s\s+/g, "\u22EF");
    };
    var formatLabel = formatLabel2;
    __name(formatLabel2, "formatLabel");
    placeholder = isMacintosh ? localize(
      "selectRecentCommandMac",
      "Select a command to run (hold Option-key to edit the command)"
    ) : localize(
      "selectRecentCommand",
      "Select a command to run (hold Alt-key to edit the command)"
    );
    const cmdDetection = instance.capabilities.get(
      TerminalCapability.CommandDetection
    );
    const commands = cmdDetection?.commands;
    const executingCommand = cmdDetection?.executingCommand;
    if (executingCommand) {
      commandMap.add(executingCommand);
    }
    if (commands && commands.length > 0) {
      for (const entry of commands) {
        const label = entry.command.trim();
        if (label.length === 0 || commandMap.has(label)) {
          continue;
        }
        let description = collapseTildePath(
          entry.cwd,
          instance.userHome,
          instance.os === OperatingSystem.Windows ? "\\" : "/"
        );
        if (entry.exitCode) {
          if (entry.exitCode === -1) {
            description += " failed";
          } else {
            description += ` exitCode: ${entry.exitCode}`;
          }
        }
        description = description.trim();
        const buttons = [commandOutputButton];
        const lastItem = items.length > 0 ? items[items.length - 1] : void 0;
        if (lastItem?.type !== "separator" && lastItem?.label === label) {
          lastItem.id = entry.timestamp.toString();
          lastItem.description = description;
          continue;
        }
        items.push({
          label: formatLabel2(label),
          rawLabel: label,
          description,
          id: entry.timestamp.toString(),
          command: entry,
          buttons: entry.hasOutput() ? buttons : void 0
        });
        commandMap.add(label);
      }
      items = items.reverse();
    }
    if (executingCommand) {
      items.unshift({
        label: formatLabel2(executingCommand),
        rawLabel: executingCommand,
        description: cmdDetection.cwd
      });
    }
    if (items.length > 0) {
      items.unshift({
        type: "separator",
        label: terminalStrings.currentSessionCategory
      });
    }
    const history = instantiationService.invokeFunction(getCommandHistory);
    const previousSessionItems = [];
    for (const [label, info] of history.entries) {
      if (!commandMap.has(label) && info.shellType === instance.shellType) {
        previousSessionItems.unshift({
          label: formatLabel2(label),
          rawLabel: label,
          buttons: [removeFromCommandHistoryButton]
        });
        commandMap.add(label);
      }
    }
    if (previousSessionItems.length > 0) {
      items.push(
        {
          type: "separator",
          label: terminalStrings.previousSessionCategory
        },
        ...previousSessionItems
      );
    }
    const shellFileHistory = await instantiationService.invokeFunction(
      getShellFileHistory,
      instance.shellType
    );
    const dedupedShellFileItems = [];
    for (const label of shellFileHistory) {
      if (!commandMap.has(label)) {
        dedupedShellFileItems.unshift({
          label: formatLabel2(label),
          rawLabel: label
        });
      }
    }
    if (dedupedShellFileItems.length > 0) {
      items.push(
        {
          type: "separator",
          label: localize(
            "shellFileHistoryCategory",
            "{0} history",
            instance.shellType
          )
        },
        ...dedupedShellFileItems
      );
    }
  } else {
    placeholder = isMacintosh ? localize(
      "selectRecentDirectoryMac",
      "Select a directory to go to (hold Option-key to edit the command)"
    ) : localize(
      "selectRecentDirectory",
      "Select a directory to go to (hold Alt-key to edit the command)"
    );
    const cwds = instance.capabilities.get(TerminalCapability.CwdDetection)?.cwds || [];
    if (cwds && cwds.length > 0) {
      for (const label of cwds) {
        items.push({ label, rawLabel: label });
      }
      items = items.reverse();
      items.unshift({
        type: "separator",
        label: terminalStrings.currentSessionCategory
      });
    }
    const history = instantiationService.invokeFunction(getDirectoryHistory);
    const previousSessionItems = [];
    for (const [label, info] of history.entries) {
      if ((info === null || info.remoteAuthority === instance.remoteAuthority) && !cwds.includes(label)) {
        previousSessionItems.unshift({
          label,
          rawLabel: label,
          buttons: [removeFromCommandHistoryButton]
        });
      }
    }
    if (previousSessionItems.length > 0) {
      items.push(
        {
          type: "separator",
          label: terminalStrings.previousSessionCategory
        },
        ...previousSessionItems
      );
    }
  }
  if (items.length === 0) {
    return;
  }
  const disposables = new DisposableStore();
  const fuzzySearchToggle = disposables.add(
    new Toggle({
      title: "Fuzzy search",
      icon: commandHistoryFuzzySearchIcon,
      isChecked: filterMode === "fuzzy",
      inputActiveOptionBorder: asCssVariable(inputActiveOptionBorder),
      inputActiveOptionForeground: asCssVariable(
        inputActiveOptionForeground
      ),
      inputActiveOptionBackground: asCssVariable(
        inputActiveOptionBackground
      )
    })
  );
  disposables.add(
    fuzzySearchToggle.onChange(() => {
      instantiationService.invokeFunction(
        showRunRecentQuickPick,
        instance,
        terminalInRunCommandPicker,
        type,
        fuzzySearchToggle.checked ? "fuzzy" : "contiguous",
        quickPick.value
      );
    })
  );
  const outputProvider = disposables.add(
    instantiationService.createInstance(TerminalOutputProvider)
  );
  const quickPick = disposables.add(
    quickInputService.createQuickPick({ useSeparators: true })
  );
  const originalItems = items;
  quickPick.items = [...originalItems];
  quickPick.sortByLabel = false;
  quickPick.placeholder = placeholder;
  quickPick.matchOnLabelMode = filterMode || "contiguous";
  quickPick.toggles = [fuzzySearchToggle];
  disposables.add(
    quickPick.onDidTriggerItemButton(async (e) => {
      if (e.button === removeFromCommandHistoryButton) {
        if (type === "command") {
          instantiationService.invokeFunction(getCommandHistory)?.remove(e.item.label);
        } else {
          instantiationService.invokeFunction(getDirectoryHistory)?.remove(e.item.label);
        }
      } else if (e.button === commandOutputButton) {
        const selectedCommand = e.item.command;
        const output = selectedCommand?.getOutput();
        if (output && selectedCommand?.command) {
          const textContent = await outputProvider.provideTextContent(
            URI.from({
              scheme: TerminalOutputProvider.scheme,
              path: `${selectedCommand.command}... ${fromNow(selectedCommand.timestamp, true)}`,
              fragment: output,
              query: `terminal-output-${selectedCommand.timestamp}-${instance.instanceId}`
            })
          );
          if (textContent) {
            await editorService.openEditor({
              resource: textContent.uri
            });
          }
        }
      }
      await instantiationService.invokeFunction(
        showRunRecentQuickPick,
        instance,
        terminalInRunCommandPicker,
        type,
        filterMode,
        value
      );
    })
  );
  disposables.add(
    quickPick.onDidChangeValue(async (value2) => {
      if (!value2) {
        await instantiationService.invokeFunction(
          showRunRecentQuickPick,
          instance,
          terminalInRunCommandPicker,
          type,
          filterMode,
          value2
        );
      }
    })
  );
  let terminalScrollStateSaved = false;
  function restoreScrollState() {
    terminalScrollStateSaved = false;
    instance.xterm?.markTracker.restoreScrollState();
    instance.xterm?.markTracker.clear();
  }
  __name(restoreScrollState, "restoreScrollState");
  disposables.add(
    quickPick.onDidChangeActive(async () => {
      const xterm = instance.xterm;
      if (!xterm) {
        return;
      }
      const [item] = quickPick.activeItems;
      if (!item) {
        return;
      }
      if ("command" in item && item.command && item.command.marker) {
        if (!terminalScrollStateSaved) {
          xterm.markTracker.saveScrollState();
          terminalScrollStateSaved = true;
        }
        const promptRowCount = item.command.getPromptRowCount();
        const commandRowCount = item.command.getCommandRowCount();
        xterm.markTracker.revealRange({
          start: {
            x: 1,
            y: item.command.marker.line - (promptRowCount - 1) + 1
          },
          end: {
            x: instance.cols,
            y: item.command.marker.line + (commandRowCount - 1) + 1
          }
        });
      } else {
        restoreScrollState();
      }
    })
  );
  disposables.add(
    quickPick.onDidAccept(async () => {
      const result = quickPick.activeItems[0];
      let text;
      if (type === "cwd") {
        text = `cd ${await instance.preparePathForShell(result.rawLabel)}`;
      } else {
        text = result.rawLabel;
      }
      quickPick.hide();
      instance.runCommand(text, !quickPick.keyMods.alt);
      if (quickPick.keyMods.alt) {
        instance.focus();
      }
      restoreScrollState();
    })
  );
  disposables.add(quickPick.onDidHide(() => restoreScrollState()));
  if (value) {
    quickPick.value = value;
  }
  return new Promise((r) => {
    terminalInRunCommandPicker.set(true);
    disposables.add(
      showWithPinnedItems(
        storageService,
        runRecentStorageKey,
        quickPick,
        true
      )
    );
    disposables.add(
      quickPick.onDidHide(() => {
        terminalInRunCommandPicker.set(false);
        accessibleViewService.showLastProvider(
          AccessibleViewProviderId.Terminal
        );
        r();
        disposables.dispose();
      })
    );
  });
}
__name(showRunRecentQuickPick, "showRunRecentQuickPick");
let TerminalOutputProvider = class extends Disposable {
  constructor(textModelResolverService, _modelService) {
    super();
    this._modelService = _modelService;
    this._register(textModelResolverService.registerTextModelContentProvider(TerminalOutputProvider.scheme, this));
  }
  static {
    __name(this, "TerminalOutputProvider");
  }
  static scheme = "TERMINAL_OUTPUT";
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing && !existing.isDisposed()) {
      return existing;
    }
    return this._modelService.createModel(
      resource.fragment,
      null,
      resource,
      false
    );
  }
};
TerminalOutputProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService)
], TerminalOutputProvider);
export {
  showRunRecentQuickPick
};
//# sourceMappingURL=terminalRunRecentQuickPick.js.map
