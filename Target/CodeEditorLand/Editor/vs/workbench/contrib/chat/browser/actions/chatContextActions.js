var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { Schemas } from "../../../../../base/common/network.js";
import { compare } from "../../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { IRange } from "../../../../../editor/common/core/range.js";
import { EditorType } from "../../../../../editor/common/editorCommon.js";
import { Command } from "../../../../../editor/common/languages.js";
import { AbstractGotoSymbolQuickAccessProvider, IGotoSymbolQuickPickItem } from "../../../../../editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { AnythingQuickAccessProviderRunOptions } from "../../../../../platform/quickinput/common/quickAccess.js";
import { IQuickInputService, IQuickPickItem, QuickPickItem } from "../../../../../platform/quickinput/common/quickInput.js";
import { CHAT_CATEGORY } from "./chatActions.js";
import { IChatWidget, IChatWidgetService, IQuickChatService } from "../chat.js";
import { isQuickChat } from "../chatWidget.js";
import { ChatContextAttachments } from "../contrib/chatContextAttachments.js";
import { ChatAgentLocation, IChatAgentService } from "../../common/chatAgents.js";
import { CONTEXT_CHAT_LOCATION, CONTEXT_IN_CHAT_INPUT } from "../../common/chatContextKeys.js";
import { IChatRequestVariableEntry } from "../../common/chatModel.js";
import { ChatRequestAgentPart } from "../../common/chatParserTypes.js";
import { IChatVariablesService } from "../../common/chatVariables.js";
import { ILanguageModelToolsService } from "../../common/languageModelToolsService.js";
import { AnythingQuickAccessProvider } from "../../../search/browser/anythingQuickAccess.js";
import { ISymbolQuickPickItem, SymbolsQuickAccessProvider } from "../../../search/browser/symbolsQuickAccess.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
function registerChatContextActions() {
  registerAction2(AttachContextAction);
  registerAction2(AttachFileAction);
  registerAction2(AttachSelectionAction);
}
__name(registerChatContextActions, "registerChatContextActions");
class AttachFileAction extends Action2 {
  static {
    __name(this, "AttachFileAction");
  }
  static ID = "workbench.action.chat.attachFile";
  constructor() {
    super({
      id: AttachFileAction.ID,
      title: localize2("workbench.action.chat.attachFile.label", "Attach File"),
      category: CHAT_CATEGORY,
      f1: false
    });
  }
  async run(accessor, ...args) {
    const variablesService = accessor.get(IChatVariablesService);
    const textEditorService = accessor.get(IEditorService);
    const activeUri = textEditorService.activeEditor?.resource;
    if (textEditorService.activeTextEditorControl?.getEditorType() === EditorType.ICodeEditor && activeUri && [Schemas.file, Schemas.vscodeRemote, Schemas.untitled].includes(activeUri.scheme)) {
      variablesService.attachContext("file", activeUri, ChatAgentLocation.Panel);
    }
  }
}
class AttachSelectionAction extends Action2 {
  static {
    __name(this, "AttachSelectionAction");
  }
  static ID = "workbench.action.chat.attachSelection";
  constructor() {
    super({
      id: AttachSelectionAction.ID,
      title: localize2("workbench.action.chat.attachSelection.label", "Add Selection to Chat"),
      category: CHAT_CATEGORY,
      f1: false
    });
  }
  async run(accessor, ...args) {
    const variablesService = accessor.get(IChatVariablesService);
    const textEditorService = accessor.get(IEditorService);
    const activeEditor = textEditorService.activeTextEditorControl;
    const activeUri = textEditorService.activeEditor?.resource;
    if (textEditorService.activeTextEditorControl?.getEditorType() === EditorType.ICodeEditor && activeUri && [Schemas.file, Schemas.vscodeRemote, Schemas.untitled].includes(activeUri.scheme)) {
      const selection = activeEditor?.getSelection();
      if (selection) {
        variablesService.attachContext("file", { uri: activeUri, range: selection }, ChatAgentLocation.Panel);
      }
    }
  }
}
class AttachContextAction extends Action2 {
  static {
    __name(this, "AttachContextAction");
  }
  static ID = "workbench.action.chat.attachContext";
  // used to enable/disable the keybinding and defined menu containment
  static _cdt = ContextKeyExpr.or(
    ContextKeyExpr.and(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Panel)),
    ContextKeyExpr.and(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Editor), ContextKeyExpr.equals("config.chat.experimental.variables.editor", true)),
    ContextKeyExpr.and(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Notebook), ContextKeyExpr.equals("config.chat.experimental.variables.notebook", true)),
    ContextKeyExpr.and(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Terminal), ContextKeyExpr.equals("config.chat.experimental.variables.terminal", true))
  );
  constructor() {
    super({
      id: AttachContextAction.ID,
      title: localize2("workbench.action.chat.attachContext.label", "Attach Context"),
      icon: Codicon.attach,
      category: CHAT_CATEGORY,
      precondition: AttachContextAction._cdt,
      keybinding: {
        when: CONTEXT_IN_CHAT_INPUT,
        primary: KeyMod.CtrlCmd | KeyCode.Slash,
        weight: KeybindingWeight.EditorContrib
      },
      menu: [
        {
          when: AttachContextAction._cdt,
          id: MenuId.ChatExecute,
          group: "navigation"
        }
      ]
    });
  }
  _getFileContextId(item) {
    if ("resource" in item) {
      return item.resource.toString();
    }
    return item.uri.toString() + (item.range.startLineNumber !== item.range.endLineNumber ? `:${item.range.startLineNumber}-${item.range.endLineNumber}` : `:${item.range.startLineNumber}`);
  }
  async _attachContext(widget, commandService, ...picks) {
    const toAttach = [];
    for (const pick of picks) {
      if (pick && typeof pick === "object" && "command" in pick && pick.command) {
        const selection = await commandService.executeCommand(pick.command.id, ...pick.command.arguments ?? []);
        if (!selection) {
          continue;
        }
        toAttach.push({
          ...pick,
          isDynamic: pick.isDynamic,
          value: pick.value,
          name: `${typeof pick.value === "string" && pick.value.startsWith("#") ? pick.value.slice(1) : ""}${selection}`,
          // Apply the original icon with the new name
          fullName: selection
        });
      } else if ("symbol" in pick && pick.symbol) {
        toAttach.push({
          ...pick,
          id: this._getFileContextId(pick.symbol.location),
          value: pick.symbol.location,
          fullName: pick.label,
          name: pick.symbol.name,
          isDynamic: true
        });
      } else if (pick && typeof pick === "object" && "resource" in pick && pick.resource) {
        toAttach.push({
          ...pick,
          id: this._getFileContextId({ resource: pick.resource }),
          value: pick.resource,
          name: pick.label,
          isFile: true,
          isDynamic: true
        });
      } else if ("symbolName" in pick && pick.uri && pick.range) {
        toAttach.push({
          ...pick,
          range: void 0,
          id: this._getFileContextId({ uri: pick.uri, range: pick.range.decoration }),
          value: { uri: pick.uri, range: pick.range.decoration },
          fullName: pick.label,
          name: pick.symbolName,
          isDynamic: true
        });
      } else if ("kind" in pick && pick.kind === "tool") {
        toAttach.push({
          id: pick.id,
          name: pick.label,
          fullName: pick.label,
          value: void 0,
          icon: pick.icon,
          isTool: true
        });
      } else {
        toAttach.push({
          ...pick,
          range: void 0,
          id: pick.id ?? "",
          value: "value" in pick ? pick.value : void 0,
          fullName: pick.label,
          name: "name" in pick && typeof pick.name === "string" ? pick.name : pick.label,
          icon: "icon" in pick && ThemeIcon.isThemeIcon(pick.icon) ? pick.icon : void 0
        });
      }
    }
    widget.getContrib(ChatContextAttachments.ID)?.setContext(false, ...toAttach);
  }
  async run(accessor, ...args) {
    const quickInputService = accessor.get(IQuickInputService);
    const chatAgentService = accessor.get(IChatAgentService);
    const chatVariablesService = accessor.get(IChatVariablesService);
    const commandService = accessor.get(ICommandService);
    const widgetService = accessor.get(IChatWidgetService);
    const languageModelToolsService = accessor.get(ILanguageModelToolsService);
    const quickChatService = accessor.get(IQuickChatService);
    const context = args[0];
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const usedAgent = widget.parsedInput.parts.find((p) => p instanceof ChatRequestAgentPart);
    const slowSupported = usedAgent ? usedAgent.agent.metadata.supportsSlowVariables : true;
    const quickPickItems = [];
    for (const variable of chatVariablesService.getVariables(widget.location)) {
      if (variable.fullName && (!variable.isSlow || slowSupported)) {
        quickPickItems.push({
          label: variable.fullName,
          name: variable.name,
          id: variable.id,
          iconClass: variable.icon ? ThemeIcon.asClassName(variable.icon) : void 0,
          icon: variable.icon
        });
      }
    }
    if (widget.viewModel?.sessionId) {
      const agentPart = widget.parsedInput.parts.find((part) => part instanceof ChatRequestAgentPart);
      if (agentPart) {
        const completions = await chatAgentService.getAgentCompletionItems(agentPart.agent.id, "", CancellationToken.None);
        for (const variable of completions) {
          if (variable.fullName) {
            quickPickItems.push({
              label: variable.fullName,
              id: variable.id,
              command: variable.command,
              icon: variable.icon,
              iconClass: variable.icon ? ThemeIcon.asClassName(variable.icon) : void 0,
              value: variable.value,
              isDynamic: true,
              name: variable.name
            });
          }
        }
      }
    }
    if (!usedAgent || usedAgent.agent.supportsToolReferences) {
      for (const tool of languageModelToolsService.getTools()) {
        if (tool.canBeInvokedManually) {
          const item = {
            kind: "tool",
            label: tool.displayName ?? tool.name ?? "",
            id: tool.id,
            icon: ThemeIcon.isThemeIcon(tool.icon) ? tool.icon : void 0
            // TODO need to support icon path?
          };
          if (ThemeIcon.isThemeIcon(tool.icon)) {
            item.iconClass = ThemeIcon.asClassName(tool.icon);
          } else if (tool.icon) {
            item.iconPath = tool.icon;
          }
          quickPickItems.push(item);
        }
      }
    }
    quickPickItems.push({
      label: localize("chatContext.symbol", "Symbol..."),
      icon: ThemeIcon.fromId(Codicon.symbolField.id),
      iconClass: ThemeIcon.asClassName(Codicon.symbolField),
      prefix: SymbolsQuickAccessProvider.PREFIX
    });
    function extractTextFromIconLabel(label) {
      if (!label) {
        return "";
      }
      const match = label.match(/\$\([^\)]+\)\s*(.+)/);
      return match ? match[1] : label;
    }
    __name(extractTextFromIconLabel, "extractTextFromIconLabel");
    this._show(quickInputService, commandService, widget, quickChatService, quickPickItems.sort(function(a, b) {
      const first = extractTextFromIconLabel(a.label).toUpperCase();
      const second = extractTextFromIconLabel(b.label).toUpperCase();
      return compare(first, second);
    }));
  }
  _show(quickInputService, commandService, widget, quickChatService, quickPickItems, query = "") {
    quickInputService.quickAccess.show(query, {
      enabledProviderPrefixes: [
        AnythingQuickAccessProvider.PREFIX,
        SymbolsQuickAccessProvider.PREFIX,
        AbstractGotoSymbolQuickAccessProvider.PREFIX
      ],
      placeholder: localize("chatContext.attach.placeholder", "Search attachments"),
      providerOptions: {
        handleAccept: /* @__PURE__ */ __name((item) => {
          if ("prefix" in item) {
            this._show(quickInputService, commandService, widget, quickChatService, quickPickItems, item.prefix);
          } else {
            this._attachContext(widget, commandService, item);
            if (isQuickChat(widget)) {
              quickChatService.open();
            }
          }
        }, "handleAccept"),
        additionPicks: quickPickItems,
        filter: /* @__PURE__ */ __name((item) => {
          const attachedContext = widget.getContrib(ChatContextAttachments.ID)?.getContext() ?? /* @__PURE__ */ new Set();
          if ("symbol" in item && item.symbol) {
            return !attachedContext.has(this._getFileContextId(item.symbol.location));
          }
          if (item && typeof item === "object" && "resource" in item && URI.isUri(item.resource)) {
            return [Schemas.file, Schemas.vscodeRemote].includes(item.resource.scheme) && !attachedContext.has(this._getFileContextId({ resource: item.resource }));
          }
          if (item && typeof item === "object" && "uri" in item && item.uri && item.range) {
            return !attachedContext.has(this._getFileContextId({ uri: item.uri, range: item.range.decoration }));
          }
          if (!("command" in item) && item.id) {
            return !attachedContext.has(item.id);
          }
          return true;
        }, "filter")
      }
    });
  }
}
export {
  registerChatContextActions
};
//# sourceMappingURL=chatContextActions.js.map
