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
import { Range } from "../../../../../editor/common/core/range.js";
import {
  getWordAtText
} from "../../../../../editor/common/core/wordHelper.js";
import {
  CompletionItemKind
} from "../../../../../editor/common/languages.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { localize } from "../../../../../nls.js";
import {
  Action2,
  registerAction2
} from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../../common/contributions.js";
import { LifecyclePhase } from "../../../../services/lifecycle/common/lifecycle.js";
import {
  ChatAgentLocation,
  IChatAgentNameService,
  IChatAgentService,
  getFullyQualifiedId
} from "../../common/chatAgents.js";
import {
  ChatRequestAgentPart,
  ChatRequestAgentSubcommandPart,
  ChatRequestTextPart,
  ChatRequestToolPart,
  ChatRequestVariablePart,
  chatAgentLeader,
  chatSubcommandLeader,
  chatVariableLeader
} from "../../common/chatParserTypes.js";
import { IChatSlashCommandService } from "../../common/chatSlashCommands.js";
import { IChatVariablesService } from "../../common/chatVariables.js";
import { ILanguageModelToolsService } from "../../common/languageModelToolsService.js";
import { SubmitAction } from "../actions/chatExecuteActions.js";
import { IChatWidgetService } from "../chat.js";
import { ChatInputPart } from "../chatInputPart.js";
import { SelectAndInsertFileAction } from "./chatDynamicVariables.js";
let SlashCommandCompletions = class extends Disposable {
  constructor(languageFeaturesService, chatWidgetService, chatSlashCommandService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this.chatSlashCommandService = chatSlashCommandService;
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
      _debugDisplayName: "globalSlashCommands",
      triggerCharacters: ["/"],
      provideCompletionItems: async (model, position, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return null;
        }
        const range = computeCompletionRanges(model, position, /\/\w*/g);
        if (!range) {
          return null;
        }
        const parsedRequest = widget.parsedInput.parts;
        const usedAgent = parsedRequest.find((p) => p instanceof ChatRequestAgentPart);
        if (usedAgent) {
          return;
        }
        const slashCommands = this.chatSlashCommandService.getCommands(widget.location);
        if (!slashCommands) {
          return null;
        }
        return {
          suggestions: slashCommands.map((c, i) => {
            const withSlash = `/${c.command}`;
            return {
              label: withSlash,
              insertText: c.executeImmediately ? "" : `${withSlash} `,
              detail: c.detail,
              range: new Range(1, 1, 1, 1),
              sortText: c.sortText ?? "a".repeat(i + 1),
              kind: CompletionItemKind.Text,
              // The icons are disabled here anyway,
              command: c.executeImmediately ? { id: SubmitAction.ID, title: withSlash, arguments: [{ widget, inputValue: `${withSlash} ` }] } : void 0
            };
          })
        };
      }
    }));
  }
};
SlashCommandCompletions = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IChatSlashCommandService)
], SlashCommandCompletions);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(
  SlashCommandCompletions,
  LifecyclePhase.Eventually
);
let AgentCompletions = class extends Disposable {
  constructor(languageFeaturesService, chatWidgetService, chatAgentService, chatAgentNameService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this.chatAgentService = chatAgentService;
    this.chatAgentNameService = chatAgentNameService;
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatAgent",
      triggerCharacters: ["@"],
      provideCompletionItems: async (model, position, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return null;
        }
        const parsedRequest = widget.parsedInput.parts;
        const usedAgent = parsedRequest.find((p) => p instanceof ChatRequestAgentPart);
        if (usedAgent && !Range.containsPosition(usedAgent.editorRange, position)) {
          return;
        }
        const range = computeCompletionRanges(model, position, /@\w*/g);
        if (!range) {
          return null;
        }
        const agents = this.chatAgentService.getAgents().filter((a) => !a.isDefault).filter((a) => a.locations.includes(widget.location));
        return {
          suggestions: agents.map((agent, i) => {
            const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
            return {
              // Leading space is important because detail has no space at the start by design
              label: isDupe ? { label: agentLabel, description: agent.description, detail: ` (${agent.publisherDisplayName})` } : agentLabel,
              insertText: `${agentLabel} `,
              detail: agent.description,
              range: new Range(1, 1, 1, 1),
              command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] },
              kind: CompletionItemKind.Text
              // The icons are disabled here anyway
            };
          })
        };
      }
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatAgentSubcommand",
      triggerCharacters: ["/"],
      provideCompletionItems: async (model, position, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return;
        }
        const range = computeCompletionRanges(model, position, /\/\w*/g);
        if (!range) {
          return null;
        }
        const parsedRequest = widget.parsedInput.parts;
        const usedAgentIdx = parsedRequest.findIndex((p) => p instanceof ChatRequestAgentPart);
        if (usedAgentIdx < 0) {
          return;
        }
        const usedSubcommand = parsedRequest.find((p) => p instanceof ChatRequestAgentSubcommandPart);
        if (usedSubcommand) {
          return;
        }
        for (const partAfterAgent of parsedRequest.slice(usedAgentIdx + 1)) {
          if (!(partAfterAgent instanceof ChatRequestTextPart) || !partAfterAgent.text.trim().match(/^(\/\w*)?$/)) {
            return;
          }
        }
        const usedAgent = parsedRequest[usedAgentIdx];
        return {
          suggestions: usedAgent.agent.slashCommands.map((c, i) => {
            const withSlash = `/${c.name}`;
            return {
              label: withSlash,
              insertText: `${withSlash} `,
              detail: c.description,
              range,
              kind: CompletionItemKind.Text
              // The icons are disabled here anyway
            };
          })
        };
      }
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatAgentAndSubcommand",
      triggerCharacters: ["/"],
      provideCompletionItems: async (model, position, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        const viewModel = widget?.viewModel;
        if (!widget || !viewModel) {
          return;
        }
        const range = computeCompletionRanges(model, position, /\/\w*/g);
        if (!range) {
          return null;
        }
        const agents = this.chatAgentService.getAgents().filter((a) => a.locations.includes(widget.location));
        const getFilterText = (agent, command) => {
          const dummyPrefix = agent.id === "github.copilot.terminalPanel" ? `0000` : ``;
          return `${chatSubcommandLeader}${dummyPrefix}${agent.name}.${command}`;
        };
        const justAgents = agents.filter((a) => !a.isDefault).map((agent) => {
          const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
          const detail = agent.description;
          return {
            label: isDupe ? { label: agentLabel, description: agent.description, detail: ` (${agent.publisherDisplayName})` } : agentLabel,
            detail,
            filterText: `${chatSubcommandLeader}${agent.name}`,
            insertText: `${agentLabel} `,
            range: new Range(1, 1, 1, 1),
            kind: CompletionItemKind.Text,
            sortText: `${chatSubcommandLeader}${agent.name}`,
            command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] }
          };
        });
        return {
          suggestions: justAgents.concat(
            agents.flatMap((agent) => agent.slashCommands.map((c, i) => {
              const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
              const withSlash = `${chatSubcommandLeader}${c.name}`;
              const item = {
                label: { label: withSlash, description: agentLabel, detail: isDupe ? ` (${agent.publisherDisplayName})` : void 0 },
                filterText: getFilterText(agent, c.name),
                commitCharacters: [" "],
                insertText: `${agentLabel} ${withSlash} `,
                detail: `(${agentLabel}) ${c.description ?? ""}`,
                range: new Range(1, 1, 1, 1),
                kind: CompletionItemKind.Text,
                // The icons are disabled here anyway
                sortText: `${chatSubcommandLeader}${agent.name}${c.name}`,
                command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] }
              };
              if (agent.isDefault) {
                item.label = withSlash;
                item.insertText = `${withSlash} `;
                item.detail = c.description;
              }
              return item;
            }))
          )
        };
      }
    }));
  }
  getAgentCompletionDetails(agent) {
    const isAllowed = this.chatAgentNameService.getAgentNameRestriction(agent);
    const agentLabel = `${chatAgentLeader}${isAllowed ? agent.name : getFullyQualifiedId(agent)}`;
    const isDupe = isAllowed && this.chatAgentService.agentHasDupeName(agent.id);
    return { label: agentLabel, isDupe };
  }
};
AgentCompletions = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IChatAgentService),
  __decorateParam(3, IChatAgentNameService)
], AgentCompletions);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(AgentCompletions, LifecyclePhase.Eventually);
class AssignSelectedAgentAction extends Action2 {
  static ID = "workbench.action.chat.assignSelectedAgent";
  constructor() {
    super({
      id: AssignSelectedAgentAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args) {
    const arg = args[0];
    if (!arg || !arg.widget || !arg.agent) {
      return;
    }
    arg.widget.lastSelectedAgent = arg.agent;
  }
}
registerAction2(AssignSelectedAgentAction);
let BuiltinDynamicCompletions = class extends Disposable {
  // MUST be using `g`-flag
  constructor(languageFeaturesService, chatWidgetService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatDynamicCompletions",
      triggerCharacters: [chatVariableLeader],
      provideCompletionItems: async (model, position, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.supportsFileReferences) {
          return null;
        }
        const range = computeCompletionRanges(model, position, BuiltinDynamicCompletions.VariableNameDef, true);
        if (!range) {
          return null;
        }
        const afterRange = new Range(position.lineNumber, range.replace.startColumn, position.lineNumber, range.replace.startColumn + "#file:".length);
        return {
          suggestions: [
            {
              label: `${chatVariableLeader}file`,
              insertText: `${chatVariableLeader}file:`,
              detail: localize("pickFileLabel", "Pick a file"),
              range,
              kind: CompletionItemKind.Text,
              command: { id: SelectAndInsertFileAction.ID, title: SelectAndInsertFileAction.ID, arguments: [{ widget, range: afterRange }] },
              sortText: "z"
            }
          ]
        };
      }
    }));
  }
  static VariableNameDef = new RegExp(
    `${chatVariableLeader}\\w*`,
    "g"
  );
};
BuiltinDynamicCompletions = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IChatWidgetService)
], BuiltinDynamicCompletions);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(
  BuiltinDynamicCompletions,
  LifecyclePhase.Eventually
);
function computeCompletionRanges(model, position, reg, onlyOnWordStart = false) {
  const varWord = getWordAtText(
    position.column,
    reg,
    model.getLineContent(position.lineNumber),
    0
  );
  if (!varWord && model.getWordUntilPosition(position).word) {
    return;
  }
  if (varWord && onlyOnWordStart) {
    const wordBefore = model.getWordUntilPosition({
      lineNumber: position.lineNumber,
      column: varWord.startColumn
    });
    if (wordBefore.word) {
      return;
    }
  }
  let insert;
  let replace;
  if (varWord) {
    insert = new Range(
      position.lineNumber,
      varWord.startColumn,
      position.lineNumber,
      position.column
    );
    replace = new Range(
      position.lineNumber,
      varWord.startColumn,
      position.lineNumber,
      varWord.endColumn
    );
  } else {
    insert = replace = Range.fromPositions(position);
  }
  return { insert, replace, varWord };
}
let VariableCompletions = class extends Disposable {
  // MUST be using `g`-flag
  constructor(languageFeaturesService, chatWidgetService, chatVariablesService, configService, toolsService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this.chatVariablesService = chatVariablesService;
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatVariables",
      triggerCharacters: [chatVariableLeader],
      provideCompletionItems: async (model, position, _context, _token) => {
        const locations = /* @__PURE__ */ new Set();
        locations.add(ChatAgentLocation.Panel);
        for (const value of Object.values(ChatAgentLocation)) {
          if (typeof value === "string" && configService.getValue(`chat.experimental.variables.${value}`)) {
            locations.add(value);
          }
        }
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !locations.has(widget.location)) {
          return null;
        }
        const range = computeCompletionRanges(model, position, VariableCompletions.VariableNameDef, true);
        if (!range) {
          return null;
        }
        const usedAgent = widget.parsedInput.parts.find((p) => p instanceof ChatRequestAgentPart);
        const slowSupported = usedAgent ? usedAgent.agent.metadata.supportsSlowVariables : true;
        const usedVariables = widget.parsedInput.parts.filter((p) => p instanceof ChatRequestVariablePart);
        const usedVariableNames = new Set(usedVariables.map((v) => v.variableName));
        const variableItems = Array.from(this.chatVariablesService.getVariables(widget.location)).filter((v) => !usedVariableNames.has(v.name)).filter((v) => !v.isSlow || slowSupported).map((v) => {
          const withLeader = `${chatVariableLeader}${v.name}`;
          return {
            label: withLeader,
            range,
            insertText: withLeader + " ",
            detail: v.description,
            kind: CompletionItemKind.Text,
            // The icons are disabled here anyway
            sortText: "z"
          };
        });
        const usedTools = widget.parsedInput.parts.filter((p) => p instanceof ChatRequestToolPart);
        const usedToolNames = new Set(usedTools.map((v) => v.toolName));
        const toolItems = [];
        if (!usedAgent || usedAgent.agent.supportsToolReferences) {
          toolItems.push(...Array.from(toolsService.getTools()).filter((t) => t.canBeInvokedManually).filter((t) => !usedToolNames.has(t.name ?? "")).map((t) => {
            const withLeader = `${chatVariableLeader}${t.name}`;
            return {
              label: withLeader,
              range,
              insertText: withLeader + " ",
              detail: t.userDescription,
              kind: CompletionItemKind.Text,
              sortText: "z"
            };
          }));
        }
        return {
          suggestions: [...variableItems, ...toolItems]
        };
      }
    }));
  }
  static VariableNameDef = new RegExp(
    `${chatVariableLeader}\\w*`,
    "g"
  );
};
VariableCompletions = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IChatVariablesService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILanguageModelToolsService)
], VariableCompletions);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(VariableCompletions, LifecyclePhase.Eventually);
