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
import { isFirefox } from "../../../../base/browser/browser.js";
import { raceTimeout, timeout } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { Language } from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { AbstractEditorCommandsQuickAccessProvider } from "../../../../editor/contrib/quickAccess/browser/commandsQuickAccess.js";
import { localize, localize2 } from "../../../../nls.js";
import { isLocalizedString } from "../../../../platform/action/common/action.js";
import {
  Action2,
  IMenuService,
  MenuId,
  MenuItemAction
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import {
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  CommandsHistory
} from "../../../../platform/quickinput/browser/commandsQuickAccess.js";
import { TriggerAction } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { DefaultQuickAccessFilterValue } from "../../../../platform/quickinput/common/quickAccess.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  IAiRelatedInformationService,
  RelatedInformationType
} from "../../../services/aiRelatedInformation/common/aiRelatedInformation.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { createKeybindingCommandQuery } from "../../../services/preferences/browser/keybindingsEditorModel.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { CHAT_OPEN_ACTION_ID } from "../../chat/browser/actions/chatActions.js";
import { ASK_QUICK_QUESTION_ACTION_ID } from "../../chat/browser/actions/chatQuickInputActions.js";
import {
  ChatAgentLocation,
  IChatAgentService
} from "../../chat/common/chatAgents.js";
let CommandsQuickAccessProvider = class extends AbstractEditorCommandsQuickAccessProvider {
  constructor(editorService, menuService, extensionService, instantiationService, keybindingService, commandService, telemetryService, dialogService, configurationService, editorGroupService, preferencesService, productService, aiRelatedInformationService, chatAgentService) {
    super({
      showAlias: !Language.isDefaultVariant(),
      noResultsPick: /* @__PURE__ */ __name(() => ({
        label: localize("noCommandResults", "No matching commands"),
        commandId: ""
      }), "noResultsPick")
    }, instantiationService, keybindingService, commandService, telemetryService, dialogService);
    this.editorService = editorService;
    this.menuService = menuService;
    this.extensionService = extensionService;
    this.configurationService = configurationService;
    this.editorGroupService = editorGroupService;
    this.preferencesService = preferencesService;
    this.productService = productService;
    this.aiRelatedInformationService = aiRelatedInformationService;
    this.chatAgentService = chatAgentService;
    this._register(configurationService.onDidChangeConfiguration((e) => this.updateOptions(e)));
    this.updateOptions();
  }
  static {
    __name(this, "CommandsQuickAccessProvider");
  }
  static AI_RELATED_INFORMATION_MAX_PICKS = 5;
  static AI_RELATED_INFORMATION_THRESHOLD = 0.8;
  static AI_RELATED_INFORMATION_DEBOUNCE = 200;
  // If extensions are not yet registered, we wait for a little moment to give them
  // a chance to register so that the complete set of commands shows up as result
  // We do not want to delay functionality beyond that time though to keep the commands
  // functional.
  extensionRegistrationRace = raceTimeout(
    this.extensionService.whenInstalledExtensionsRegistered(),
    800
  );
  useAiRelatedInfo = false;
  get activeTextEditorControl() {
    return this.editorService.activeTextEditorControl;
  }
  get defaultFilterValue() {
    if (this.configuration.preserveInput) {
      return DefaultQuickAccessFilterValue.LAST;
    }
    return void 0;
  }
  get configuration() {
    const commandPaletteConfig = this.configurationService.getValue().workbench.commandPalette;
    return {
      preserveInput: commandPaletteConfig.preserveInput,
      experimental: commandPaletteConfig.experimental
    };
  }
  updateOptions(e) {
    if (e && !e.affectsConfiguration("workbench.commandPalette.experimental")) {
      return;
    }
    const config = this.configuration;
    const suggestedCommandIds = config.experimental.suggestCommands && this.productService.commandPaletteSuggestedCommandIds?.length ? new Set(this.productService.commandPaletteSuggestedCommandIds) : void 0;
    this.options.suggestedCommandIds = suggestedCommandIds;
    this.useAiRelatedInfo = config.experimental.enableNaturalLanguageSearch;
  }
  async getCommandPicks(token) {
    await this.extensionRegistrationRace;
    if (token.isCancellationRequested) {
      return [];
    }
    return [
      ...this.getCodeEditorCommandPicks(),
      ...this.getGlobalCommandPicks()
    ].map((picks) => ({
      ...picks,
      buttons: [
        {
          iconClass: ThemeIcon.asClassName(Codicon.gear),
          tooltip: localize(
            "configure keybinding",
            "Configure Keybinding"
          )
        }
      ],
      trigger: /* @__PURE__ */ __name(() => {
        this.preferencesService.openGlobalKeybindingSettings(false, {
          query: createKeybindingCommandQuery(
            picks.commandId,
            picks.commandWhen
          )
        });
        return TriggerAction.CLOSE_PICKER;
      }, "trigger")
    }));
  }
  hasAdditionalCommandPicks(filter, token) {
    if (!this.useAiRelatedInfo || token.isCancellationRequested || filter === "" || !this.aiRelatedInformationService.isEnabled()) {
      return false;
    }
    return true;
  }
  async getAdditionalCommandPicks(allPicks, picksSoFar, filter, token) {
    if (!this.hasAdditionalCommandPicks(filter, token)) {
      return [];
    }
    let additionalPicks;
    try {
      await timeout(
        CommandsQuickAccessProvider.AI_RELATED_INFORMATION_DEBOUNCE,
        token
      );
      additionalPicks = await this.getRelatedInformationPicks(
        allPicks,
        picksSoFar,
        filter,
        token
      );
    } catch (e) {
      return [];
    }
    if (picksSoFar.length || additionalPicks.length) {
      additionalPicks.push({
        type: "separator"
      });
    }
    const defaultAgent = this.chatAgentService.getDefaultAgent(
      ChatAgentLocation.Panel
    );
    if (defaultAgent) {
      additionalPicks.push({
        label: localize(
          "askXInChat",
          "Ask {0}: {1}",
          defaultAgent.fullName,
          filter
        ),
        commandId: this.configuration.experimental.askChatLocation === "quickChat" ? ASK_QUICK_QUESTION_ACTION_ID : CHAT_OPEN_ACTION_ID,
        args: [filter]
      });
    }
    return additionalPicks;
  }
  async getRelatedInformationPicks(allPicks, picksSoFar, filter, token) {
    const relatedInformation = await this.aiRelatedInformationService.getRelatedInformation(
      filter,
      [RelatedInformationType.CommandInformation],
      token
    );
    relatedInformation.sort((a, b) => b.weight - a.weight);
    const setOfPicksSoFar = new Set(picksSoFar.map((p) => p.commandId));
    const additionalPicks = new Array();
    for (const info of relatedInformation) {
      if (info.weight < CommandsQuickAccessProvider.AI_RELATED_INFORMATION_THRESHOLD || additionalPicks.length === CommandsQuickAccessProvider.AI_RELATED_INFORMATION_MAX_PICKS) {
        break;
      }
      const pick = allPicks.find(
        (p) => p.commandId === info.command && !setOfPicksSoFar.has(p.commandId)
      );
      if (pick) {
        additionalPicks.push(pick);
      }
    }
    return additionalPicks;
  }
  getGlobalCommandPicks() {
    const globalCommandPicks = [];
    const scopedContextKeyService = this.editorService.activeEditorPane?.scopedContextKeyService || this.editorGroupService.activeGroup.scopedContextKeyService;
    const globalCommandsMenu = this.menuService.getMenuActions(
      MenuId.CommandPalette,
      scopedContextKeyService
    );
    const globalCommandsMenuActions = globalCommandsMenu.reduce(
      (r, [, actions]) => [...r, ...actions],
      []
    ).filter(
      (action) => action instanceof MenuItemAction && action.enabled
    );
    for (const action of globalCommandsMenuActions) {
      let label = (typeof action.item.title === "string" ? action.item.title : action.item.title.value) || action.item.id;
      const category = typeof action.item.category === "string" ? action.item.category : action.item.category?.value;
      if (category) {
        label = localize(
          "commandWithCategory",
          "{0}: {1}",
          category,
          label
        );
      }
      const aliasLabel = typeof action.item.title !== "string" ? action.item.title.original : void 0;
      const aliasCategory = category && action.item.category && typeof action.item.category !== "string" ? action.item.category.original : void 0;
      const commandAlias = aliasLabel && category ? aliasCategory ? `${aliasCategory}: ${aliasLabel}` : `${category}: ${aliasLabel}` : aliasLabel;
      const metadataDescription = action.item.metadata?.description;
      const commandDescription = metadataDescription === void 0 || isLocalizedString(metadataDescription) ? metadataDescription : (
        // TODO: this type will eventually not be a string and when that happens, this should simplified.
        {
          value: metadataDescription,
          original: metadataDescription
        }
      );
      globalCommandPicks.push({
        commandId: action.item.id,
        commandWhen: action.item.precondition?.serialize(),
        commandAlias,
        label: stripIcons(label),
        commandDescription
      });
    }
    return globalCommandPicks;
  }
};
CommandsQuickAccessProvider = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IMenuService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IDialogService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IEditorGroupsService),
  __decorateParam(10, IPreferencesService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IAiRelatedInformationService),
  __decorateParam(13, IChatAgentService)
], CommandsQuickAccessProvider);
class ShowAllCommandsAction extends Action2 {
  static {
    __name(this, "ShowAllCommandsAction");
  }
  static ID = "workbench.action.showCommands";
  constructor() {
    super({
      id: ShowAllCommandsAction.ID,
      title: localize2("showTriggerActions", "Show All Commands"),
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: void 0,
        primary: isFirefox ? void 0 : KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyP,
        secondary: [KeyCode.F1]
      },
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(CommandsQuickAccessProvider.PREFIX);
  }
}
class ClearCommandHistoryAction extends Action2 {
  static {
    __name(this, "ClearCommandHistoryAction");
  }
  constructor() {
    super({
      id: "workbench.action.clearCommandHistory",
      title: localize2("clearCommandHistory", "Clear Command History"),
      f1: true
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const storageService = accessor.get(IStorageService);
    const dialogService = accessor.get(IDialogService);
    const commandHistoryLength = CommandsHistory.getConfiguredCommandHistoryLength(
      configurationService
    );
    if (commandHistoryLength > 0) {
      const { confirmed } = await dialogService.confirm({
        type: "warning",
        message: localize(
          "confirmClearMessage",
          "Do you want to clear the history of recently used commands?"
        ),
        detail: localize(
          "confirmClearDetail",
          "This action is irreversible!"
        ),
        primaryButton: localize(
          {
            key: "clearButtonLabel",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Clear"
        )
      });
      if (!confirmed) {
        return;
      }
      CommandsHistory.clearHistory(configurationService, storageService);
    }
  }
}
export {
  ClearCommandHistoryAction,
  CommandsQuickAccessProvider,
  ShowAllCommandsAction
};
//# sourceMappingURL=commandsQuickAccess.js.map
