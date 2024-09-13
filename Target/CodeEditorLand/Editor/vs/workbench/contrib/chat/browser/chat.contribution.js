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
import {
  MarkdownString,
  isMarkdownString
} from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import * as nls from "../../../../nls.js";
import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import {
  Extensions as ConfigurationExtensions
} from "../../../../platform/configuration/common/configurationRegistry.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  EditorPaneDescriptor
} from "../../../browser/editor.js";
import {
  Extensions as WorkbenchExtensions,
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import {
  EditorExtensions
} from "../../../common/editor.js";
import { ChatAccessibilityHelp } from "./actions/chatAccessibilityHelp.js";
import { registerChatActions } from "./actions/chatActions.js";
import {
  ACTION_ID_NEW_CHAT,
  registerNewChatActions
} from "./actions/chatClearActions.js";
import {
  registerChatCodeBlockActions,
  registerChatCodeCompareBlockActions
} from "./actions/chatCodeblockActions.js";
import { registerChatContextActions } from "./actions/chatContextActions.js";
import { registerChatCopyActions } from "./actions/chatCopyActions.js";
import { registerChatDeveloperActions } from "./actions/chatDeveloperActions.js";
import {
  SubmitAction,
  registerChatExecuteActions
} from "./actions/chatExecuteActions.js";
import { registerChatFileTreeActions } from "./actions/chatFileTreeActions.js";
import { registerChatExportActions } from "./actions/chatImportExport.js";
import { registerMoveActions } from "./actions/chatMoveActions.js";
import { registerQuickChatActions } from "./actions/chatQuickInputActions.js";
import { registerChatTitleActions } from "./actions/chatTitleActions.js";
import {
  IChatAccessibilityService,
  IChatCodeBlockContextProviderService,
  IChatWidgetService,
  IQuickChatService
} from "./chat.js";
import { ChatAccessibilityService } from "./chatAccessibilityService.js";
import { ChatEditor } from "./chatEditor.js";
import {
  ChatEditorInput,
  ChatEditorInputSerializer
} from "./chatEditorInput.js";
import {
  agentSlashCommandToMarkdown,
  agentToMarkdown
} from "./chatMarkdownDecorationsRenderer.js";
import {
  ChatCompatibilityNotifier,
  ChatExtensionPointHandler
} from "./chatParticipantContributions.js";
import { QuickChatService } from "./chatQuick.js";
import { ChatResponseAccessibleView } from "./chatResponseAccessibleView.js";
import { ChatVariablesService } from "./chatVariables.js";
import { ChatWidgetService } from "./chatWidget.js";
import { ChatCodeBlockContextProviderService } from "./codeBlockContextProviderService.js";
import "./contrib/chatContextAttachments.js";
import "./contrib/chatInputCompletions.js";
import "./contrib/chatInputEditorContrib.js";
import "./contrib/chatInputEditorHover.js";
import {
  IEditorResolverService,
  RegisteredEditorPriority
} from "../../../services/editor/common/editorResolverService.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import {
  ChatAgentLocation,
  ChatAgentNameService,
  ChatAgentService,
  IChatAgentNameService,
  IChatAgentService
} from "../common/chatAgents.js";
import { chatVariableLeader } from "../common/chatParserTypes.js";
import { IChatService } from "../common/chatService.js";
import { ChatService } from "../common/chatServiceImpl.js";
import {
  ChatSlashCommandService,
  IChatSlashCommandService
} from "../common/chatSlashCommands.js";
import { IChatVariablesService } from "../common/chatVariables.js";
import {
  ChatWidgetHistoryService,
  IChatWidgetHistoryService
} from "../common/chatWidgetHistoryService.js";
import {
  ILanguageModelStatsService,
  LanguageModelStatsService
} from "../common/languageModelStats.js";
import {
  ILanguageModelToolsService,
  LanguageModelToolsService
} from "../common/languageModelToolsService.js";
import {
  ILanguageModelsService,
  LanguageModelsService
} from "../common/languageModels.js";
import { LanguageModelToolsExtensionPointHandler } from "../common/tools/languageModelToolsContribution.js";
import {
  IVoiceChatService,
  VoiceChatService
} from "../common/voiceChatService.js";
import "../common/chatColors.js";
const configurationRegistry = Registry.as(
  ConfigurationExtensions.Configuration
);
configurationRegistry.registerConfiguration({
  id: "chatSidebar",
  title: nls.localize("interactiveSessionConfigurationTitle", "Chat"),
  type: "object",
  properties: {
    "chat.editor.fontSize": {
      type: "number",
      description: nls.localize(
        "interactiveSession.editor.fontSize",
        "Controls the font size in pixels in chat codeblocks."
      ),
      default: isMacintosh ? 12 : 14
    },
    "chat.editor.fontFamily": {
      type: "string",
      description: nls.localize(
        "interactiveSession.editor.fontFamily",
        "Controls the font family in chat codeblocks."
      ),
      default: "default"
    },
    "chat.editor.fontWeight": {
      type: "string",
      description: nls.localize(
        "interactiveSession.editor.fontWeight",
        "Controls the font weight in chat codeblocks."
      ),
      default: "default"
    },
    "chat.editor.wordWrap": {
      type: "string",
      description: nls.localize(
        "interactiveSession.editor.wordWrap",
        "Controls whether lines should wrap in chat codeblocks."
      ),
      default: "off",
      enum: ["on", "off"]
    },
    "chat.editor.lineHeight": {
      type: "number",
      description: nls.localize(
        "interactiveSession.editor.lineHeight",
        "Controls the line height in pixels in chat codeblocks. Use 0 to compute the line height from the font size."
      ),
      default: 0
    },
    "chat.experimental.implicitContext": {
      type: "boolean",
      description: nls.localize(
        "chat.experimental.implicitContext",
        "Controls whether a checkbox is shown to allow the user to determine which implicit context is included with a chat participant's prompt."
      ),
      deprecated: true,
      default: false
    },
    "chat.experimental.variables.editor": {
      type: "boolean",
      description: nls.localize(
        "chat.experimental.variables.editor",
        "Enables variables for editor chat."
      ),
      default: true
    },
    "chat.experimental.variables.notebook": {
      type: "boolean",
      description: nls.localize(
        "chat.experimental.variables.notebook",
        "Enables variables for notebook chat."
      ),
      default: false
    },
    "chat.experimental.variables.terminal": {
      type: "boolean",
      description: nls.localize(
        "chat.experimental.variables.terminal",
        "Enables variables for terminal chat."
      ),
      default: false
    },
    "chat.experimental.detectParticipant.enabled": {
      type: "boolean",
      description: nls.localize(
        "chat.experimental.detectParticipant.enabled",
        "Enables chat participant autodetection for panel chat."
      ),
      default: null
    }
  }
});
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    ChatEditor,
    ChatEditorInput.EditorID,
    nls.localize("chat", "Chat")
  ),
  [new SyncDescriptor(ChatEditorInput)]
);
let ChatResolverContribution = class extends Disposable {
  static {
    __name(this, "ChatResolverContribution");
  }
  static ID = "workbench.contrib.chatResolver";
  constructor(editorResolverService, instantiationService) {
    super();
    this._register(
      editorResolverService.registerEditor(
        `${Schemas.vscodeChatSesssion}:**/**`,
        {
          id: ChatEditorInput.EditorID,
          label: nls.localize("chat", "Chat"),
          priority: RegisteredEditorPriority.builtin
        },
        {
          singlePerResource: true,
          canSupportResource: /* @__PURE__ */ __name((resource) => resource.scheme === Schemas.vscodeChatSesssion, "canSupportResource")
        },
        {
          createEditorInput: /* @__PURE__ */ __name(({ resource, options }) => {
            return {
              editor: instantiationService.createInstance(
                ChatEditorInput,
                resource,
                options
              ),
              options
            };
          }, "createEditorInput")
        }
      )
    );
  }
};
ChatResolverContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IInstantiationService)
], ChatResolverContribution);
AccessibleViewRegistry.register(new ChatResponseAccessibleView());
AccessibleViewRegistry.register(new ChatAccessibilityHelp());
let ChatSlashStaticSlashCommandsContribution = class extends Disposable {
  static {
    __name(this, "ChatSlashStaticSlashCommandsContribution");
  }
  constructor(slashCommandService, commandService, chatAgentService, chatVariablesService, instantiationService) {
    super();
    this._store.add(
      slashCommandService.registerSlashCommand(
        {
          command: "clear",
          detail: nls.localize("clear", "Start a new chat"),
          sortText: "z2_clear",
          executeImmediately: true,
          locations: [ChatAgentLocation.Panel]
        },
        async () => {
          commandService.executeCommand(ACTION_ID_NEW_CHAT);
        }
      )
    );
    this._store.add(
      slashCommandService.registerSlashCommand(
        {
          command: "help",
          detail: "",
          sortText: "z1_help",
          executeImmediately: true,
          locations: [ChatAgentLocation.Panel]
        },
        async (prompt, progress) => {
          const defaultAgent = chatAgentService.getDefaultAgent(
            ChatAgentLocation.Panel
          );
          const agents = chatAgentService.getAgents();
          if (defaultAgent?.metadata.helpTextPrefix) {
            if (isMarkdownString(
              defaultAgent.metadata.helpTextPrefix
            )) {
              progress.report({
                content: defaultAgent.metadata.helpTextPrefix,
                kind: "markdownContent"
              });
            } else {
              progress.report({
                content: new MarkdownString(
                  defaultAgent.metadata.helpTextPrefix
                ),
                kind: "markdownContent"
              });
            }
            progress.report({
              content: new MarkdownString("\n\n"),
              kind: "markdownContent"
            });
          }
          const agentText = (await Promise.all(
            agents.filter((a) => a.id !== defaultAgent?.id).filter(
              (a) => a.locations.includes(
                ChatAgentLocation.Panel
              )
            ).map(async (a) => {
              const description = a.description ? `- ${a.description}` : "";
              const agentMarkdown = instantiationService.invokeFunction(
                (accessor) => agentToMarkdown(
                  a,
                  true,
                  accessor
                )
              );
              const agentLine = `- ${agentMarkdown} ${description}`;
              const commandText = a.slashCommands.map((c) => {
                const description2 = c.description ? `- ${c.description}` : "";
                return `	* ${agentSlashCommandToMarkdown(a, c)} ${description2}`;
              }).join("\n");
              return (agentLine + "\n" + commandText).trim();
            })
          )).join("\n");
          progress.report({
            content: new MarkdownString(agentText, {
              isTrusted: { enabledCommands: [SubmitAction.ID] }
            }),
            kind: "markdownContent"
          });
          if (defaultAgent?.metadata.helpTextVariablesPrefix) {
            progress.report({
              content: new MarkdownString("\n\n"),
              kind: "markdownContent"
            });
            if (isMarkdownString(
              defaultAgent.metadata.helpTextVariablesPrefix
            )) {
              progress.report({
                content: defaultAgent.metadata.helpTextVariablesPrefix,
                kind: "markdownContent"
              });
            } else {
              progress.report({
                content: new MarkdownString(
                  defaultAgent.metadata.helpTextVariablesPrefix
                ),
                kind: "markdownContent"
              });
            }
            const variables = [
              ...chatVariablesService.getVariables(
                ChatAgentLocation.Panel
              ),
              {
                name: "file",
                description: nls.localize(
                  "file",
                  "Choose a file in the workspace"
                )
              }
            ];
            const variableText = variables.map(
              (v) => `* \`${chatVariableLeader}${v.name}\` - ${v.description}`
            ).join("\n");
            progress.report({
              content: new MarkdownString("\n" + variableText),
              kind: "markdownContent"
            });
          }
          if (defaultAgent?.metadata.helpTextPostfix) {
            progress.report({
              content: new MarkdownString("\n\n"),
              kind: "markdownContent"
            });
            if (isMarkdownString(
              defaultAgent.metadata.helpTextPostfix
            )) {
              progress.report({
                content: defaultAgent.metadata.helpTextPostfix,
                kind: "markdownContent"
              });
            } else {
              progress.report({
                content: new MarkdownString(
                  defaultAgent.metadata.helpTextPostfix
                ),
                kind: "markdownContent"
              });
            }
          }
        }
      )
    );
  }
};
ChatSlashStaticSlashCommandsContribution = __decorateClass([
  __decorateParam(0, IChatSlashCommandService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IChatAgentService),
  __decorateParam(3, IChatVariablesService),
  __decorateParam(4, IInstantiationService)
], ChatSlashStaticSlashCommandsContribution);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
registerWorkbenchContribution2(
  ChatResolverContribution.ID,
  ChatResolverContribution,
  WorkbenchPhase.BlockStartup
);
workbenchContributionsRegistry.registerWorkbenchContribution(
  ChatSlashStaticSlashCommandsContribution,
  LifecyclePhase.Eventually
);
Registry.as(
  EditorExtensions.EditorFactory
).registerEditorSerializer(ChatEditorInput.TypeID, ChatEditorInputSerializer);
registerWorkbenchContribution2(
  ChatExtensionPointHandler.ID,
  ChatExtensionPointHandler,
  WorkbenchPhase.BlockStartup
);
registerWorkbenchContribution2(
  LanguageModelToolsExtensionPointHandler.ID,
  LanguageModelToolsExtensionPointHandler,
  WorkbenchPhase.BlockRestore
);
registerWorkbenchContribution2(
  ChatCompatibilityNotifier.ID,
  ChatCompatibilityNotifier,
  WorkbenchPhase.Eventually
);
registerChatActions();
registerChatCopyActions();
registerChatCodeBlockActions();
registerChatCodeCompareBlockActions();
registerChatFileTreeActions();
registerChatTitleActions();
registerChatExecuteActions();
registerQuickChatActions();
registerChatExportActions();
registerMoveActions();
registerNewChatActions();
registerChatContextActions();
registerChatDeveloperActions();
registerSingleton(IChatService, ChatService, InstantiationType.Delayed);
registerSingleton(
  IChatWidgetService,
  ChatWidgetService,
  InstantiationType.Delayed
);
registerSingleton(
  IQuickChatService,
  QuickChatService,
  InstantiationType.Delayed
);
registerSingleton(
  IChatAccessibilityService,
  ChatAccessibilityService,
  InstantiationType.Delayed
);
registerSingleton(
  IChatWidgetHistoryService,
  ChatWidgetHistoryService,
  InstantiationType.Delayed
);
registerSingleton(
  ILanguageModelsService,
  LanguageModelsService,
  InstantiationType.Delayed
);
registerSingleton(
  ILanguageModelStatsService,
  LanguageModelStatsService,
  InstantiationType.Delayed
);
registerSingleton(
  IChatSlashCommandService,
  ChatSlashCommandService,
  InstantiationType.Delayed
);
registerSingleton(
  IChatAgentService,
  ChatAgentService,
  InstantiationType.Delayed
);
registerSingleton(
  IChatAgentNameService,
  ChatAgentNameService,
  InstantiationType.Delayed
);
registerSingleton(
  IChatVariablesService,
  ChatVariablesService,
  InstantiationType.Delayed
);
registerSingleton(
  ILanguageModelToolsService,
  LanguageModelToolsService,
  InstantiationType.Delayed
);
registerSingleton(
  IVoiceChatService,
  VoiceChatService,
  InstantiationType.Delayed
);
registerSingleton(
  IChatCodeBlockContextProviderService,
  ChatCodeBlockContextProviderService,
  InstantiationType.Delayed
);
//# sourceMappingURL=chat.contribution.js.map
