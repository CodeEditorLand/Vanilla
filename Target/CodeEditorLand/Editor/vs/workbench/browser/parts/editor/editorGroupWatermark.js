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
import { $, append, clearNode, h } from "../../../../base/browser/dom.js";
import { KeybindingLabel } from "../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { OS, isMacintosh, isWeb } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { defaultKeybindingLabelStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import {
  editorForeground,
  registerColor,
  transparent
} from "../../../../platform/theme/common/colorRegistry.js";
import {
  IWorkspaceContextService,
  WorkbenchState
} from "../../../../platform/workspace/common/workspace.js";
registerColor(
  "editorWatermark.foreground",
  {
    dark: transparent(editorForeground, 0.6),
    light: transparent(editorForeground, 0.68),
    hcDark: editorForeground,
    hcLight: editorForeground
  },
  localize(
    "editorLineHighlight",
    "Foreground color for the labels in the editor watermark."
  )
);
const showCommands = {
  text: localize("watermark.showCommands", "Show All Commands"),
  id: "workbench.action.showCommands"
};
const quickAccess = {
  text: localize("watermark.quickAccess", "Go to File"),
  id: "workbench.action.quickOpen"
};
const openFileNonMacOnly = {
  text: localize("watermark.openFile", "Open File"),
  id: "workbench.action.files.openFile",
  mac: false
};
const openFolderNonMacOnly = {
  text: localize("watermark.openFolder", "Open Folder"),
  id: "workbench.action.files.openFolder",
  mac: false
};
const openFileOrFolderMacOnly = {
  text: localize("watermark.openFileFolder", "Open File or Folder"),
  id: "workbench.action.files.openFileFolder",
  mac: true
};
const openRecent = {
  text: localize("watermark.openRecent", "Open Recent"),
  id: "workbench.action.openRecent"
};
const newUntitledFileMacOnly = {
  text: localize("watermark.newUntitledFile", "New Untitled Text File"),
  id: "workbench.action.files.newUntitledFile",
  mac: true
};
const findInFiles = {
  text: localize("watermark.findInFiles", "Find in Files"),
  id: "workbench.action.findInFiles"
};
const toggleTerminal = {
  text: localize(
    { key: "watermark.toggleTerminal", comment: ["toggle is a verb here"] },
    "Toggle Terminal"
  ),
  id: "workbench.action.terminal.toggleTerminal",
  when: ContextKeyExpr.equals("terminalProcessSupported", true)
};
const startDebugging = {
  text: localize("watermark.startDebugging", "Start Debugging"),
  id: "workbench.action.debug.start",
  when: ContextKeyExpr.equals("terminalProcessSupported", true)
};
const toggleFullscreen = {
  text: localize(
    {
      key: "watermark.toggleFullscreen",
      comment: ["toggle is a verb here"]
    },
    "Toggle Full Screen"
  ),
  id: "workbench.action.toggleFullScreen"
};
const showSettings = {
  text: localize("watermark.showSettings", "Show Settings"),
  id: "workbench.action.openSettings"
};
const noFolderEntries = [
  showCommands,
  openFileNonMacOnly,
  openFolderNonMacOnly,
  openFileOrFolderMacOnly,
  openRecent,
  newUntitledFileMacOnly
];
const folderEntries = [
  showCommands,
  quickAccess,
  findInFiles,
  startDebugging,
  toggleTerminal,
  toggleFullscreen,
  showSettings
];
let EditorGroupWatermark = class extends Disposable {
  constructor(container, keybindingService, contextService, contextKeyService, configurationService) {
    super();
    this.keybindingService = keybindingService;
    this.contextService = contextService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    const elements = h(".editor-group-watermark", [
      h(".letterpress"),
      h(".shortcuts@shortcuts")
    ]);
    append(container, elements.root);
    this.shortcuts = elements.shortcuts;
    this.registerListeners();
    this.workbenchState = contextService.getWorkbenchState();
    this.render();
  }
  shortcuts;
  transientDisposables = this._register(
    new DisposableStore()
  );
  enabled = false;
  workbenchState;
  keybindingLabels = /* @__PURE__ */ new Set();
  registerListeners() {
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("workbench.tips.enabled")) {
          this.render();
        }
      })
    );
    this._register(
      this.contextService.onDidChangeWorkbenchState((workbenchState) => {
        if (this.workbenchState === workbenchState) {
          return;
        }
        this.workbenchState = workbenchState;
        this.render();
      })
    );
    const allEntriesWhenClauses = [...noFolderEntries, ...folderEntries].filter((entry) => entry.when !== void 0).map((entry) => entry.when);
    const allKeys = /* @__PURE__ */ new Set();
    allEntriesWhenClauses.forEach(
      (when) => when.keys().forEach((key) => allKeys.add(key))
    );
    this._register(
      this.contextKeyService.onDidChangeContext((e) => {
        if (e.affectsSome(allKeys)) {
          this.render();
        }
      })
    );
  }
  render() {
    const enabled = this.configurationService.getValue(
      "workbench.tips.enabled"
    );
    if (enabled === this.enabled) {
      return;
    }
    this.enabled = enabled;
    this.clear();
    if (!enabled) {
      return;
    }
    const box = append(this.shortcuts, $(".watermark-box"));
    const folder = this.workbenchState !== WorkbenchState.EMPTY;
    const selected = (folder ? folderEntries : noFolderEntries).filter(
      (entry) => !("when" in entry) || this.contextKeyService.contextMatchesRules(entry.when)
    ).filter(
      (entry) => !("mac" in entry) || entry.mac === (isMacintosh && !isWeb)
    ).filter((entry) => !!CommandsRegistry.getCommand(entry.id)).filter(
      (entry) => !!this.keybindingService.lookupKeybinding(entry.id)
    );
    const update = () => {
      clearNode(box);
      this.keybindingLabels.forEach((label) => label.dispose());
      this.keybindingLabels.clear();
      for (const entry of selected) {
        const keys = this.keybindingService.lookupKeybinding(entry.id);
        if (!keys) {
          continue;
        }
        const dl = append(box, $("dl"));
        const dt = append(dl, $("dt"));
        dt.textContent = entry.text;
        const dd = append(dl, $("dd"));
        const label = new KeybindingLabel(dd, OS, {
          renderUnboundKeybindings: true,
          ...defaultKeybindingLabelStyles
        });
        label.set(keys);
        this.keybindingLabels.add(label);
      }
    };
    update();
    this.transientDisposables.add(
      this.keybindingService.onDidUpdateKeybindings(update)
    );
  }
  clear() {
    clearNode(this.shortcuts);
    this.transientDisposables.clear();
  }
  dispose() {
    super.dispose();
    this.clear();
    this.keybindingLabels.forEach((label) => label.dispose());
  }
};
EditorGroupWatermark = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService)
], EditorGroupWatermark);
export {
  EditorGroupWatermark
};
