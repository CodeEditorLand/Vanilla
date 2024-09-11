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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { editorBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IViewPaneOptions, ViewPane } from "../../../browser/parts/views/viewPane.js";
import { Memento } from "../../../common/memento.js";
import { SIDE_BAR_FOREGROUND } from "../../../common/theme.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IChatViewState, ChatWidget } from "./chatWidget.js";
import { ChatAgentLocation, IChatAgentService } from "../common/chatAgents.js";
import { CHAT_PROVIDER_ID } from "../common/chatParticipantContribTypes.js";
import { ChatModelInitState, IChatModel } from "../common/chatModel.js";
import { IChatService } from "../common/chatService.js";
import { IChatViewTitleActionContext } from "./actions/chatActions.js";
const CHAT_SIDEBAR_PANEL_ID = "workbench.panel.chatSidebar";
let ChatViewPane = class extends ViewPane {
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService, storageService, chatService, chatAgentService, logService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
    this.storageService = storageService;
    this.chatService = chatService;
    this.chatAgentService = chatAgentService;
    this.logService = logService;
    this.memento = new Memento("interactive-session-view-" + CHAT_PROVIDER_ID, this.storageService);
    this.viewState = this.memento.getMemento(StorageScope.WORKSPACE, StorageTarget.MACHINE);
    this._register(this.chatAgentService.onDidChangeAgents(() => {
      if (this.chatAgentService.getDefaultAgent(ChatAgentLocation.Panel)) {
        if (!this._widget?.viewModel) {
          const sessionId = this.getSessionId();
          const model = sessionId ? this.chatService.getOrRestoreSession(sessionId) : void 0;
          try {
            this._widget.setVisible(false);
            this.updateModel(model);
            this.didProviderRegistrationFail = false;
            this.didUnregisterProvider = false;
            this._onDidChangeViewWelcomeState.fire();
          } finally {
            this.widget.setVisible(true);
          }
        }
      } else if (this._widget?.viewModel?.initState === ChatModelInitState.Initialized) {
        this.didUnregisterProvider = true;
      }
      this._onDidChangeViewWelcomeState.fire();
    }));
  }
  static {
    __name(this, "ChatViewPane");
  }
  _widget;
  get widget() {
    return this._widget;
  }
  modelDisposables = this._register(new DisposableStore());
  memento;
  viewState;
  didProviderRegistrationFail = false;
  didUnregisterProvider = false;
  getActionsContext() {
    return {
      chatView: this
    };
  }
  updateModel(model) {
    this.modelDisposables.clear();
    model = model ?? (this.chatService.transferredSessionData?.sessionId ? this.chatService.getOrRestoreSession(this.chatService.transferredSessionData.sessionId) : this.chatService.startSession(ChatAgentLocation.Panel, CancellationToken.None));
    if (!model) {
      throw new Error("Could not start chat session");
    }
    this._widget.setModel(model, { ...this.viewState });
    this.viewState.sessionId = model.sessionId;
  }
  shouldShowWelcome() {
    if (!this.chatAgentService.getContributedDefaultAgent(ChatAgentLocation.Panel)) {
      return true;
    }
    const noPersistedSessions = !this.chatService.hasSessions();
    return this.didUnregisterProvider || !this._widget?.viewModel && (noPersistedSessions || this.didProviderRegistrationFail);
  }
  getSessionId() {
    let sessionId;
    if (this.chatService.transferredSessionData) {
      sessionId = this.chatService.transferredSessionData.sessionId;
      this.viewState.inputValue = this.chatService.transferredSessionData.inputValue;
    } else {
      sessionId = this.viewState.sessionId;
    }
    return sessionId;
  }
  renderBody(parent) {
    try {
      super.renderBody(parent);
      const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
      const locationBasedColors = this.getLocationBasedColors();
      this._widget = this._register(scopedInstantiationService.createInstance(
        ChatWidget,
        ChatAgentLocation.Panel,
        { viewId: this.id },
        { supportsFileReferences: true },
        {
          listForeground: SIDE_BAR_FOREGROUND,
          listBackground: locationBasedColors.background,
          inputEditorBackground: locationBasedColors.background,
          resultEditorBackground: editorBackground
        }
      ));
      this._register(this.onDidChangeBodyVisibility((visible) => {
        this._widget.setVisible(visible);
      }));
      this._register(this._widget.onDidClear(() => this.clear()));
      this._widget.render(parent);
      const sessionId = this.getSessionId();
      const disposeListener = sessionId ? this._register(this.chatService.onDidDisposeSession((e) => {
        if (e.reason === "initializationFailed") {
          this.didProviderRegistrationFail = true;
          disposeListener?.dispose();
          this._onDidChangeViewWelcomeState.fire();
        }
      })) : void 0;
      const model = sessionId ? this.chatService.getOrRestoreSession(sessionId) : void 0;
      this.updateModel(model);
    } catch (e) {
      this.logService.error(e);
      throw e;
    }
  }
  acceptInput(query) {
    this._widget.acceptInput(query);
  }
  clear() {
    if (this.widget.viewModel) {
      this.chatService.clearSession(this.widget.viewModel.sessionId);
    }
    this.updateViewState();
    this.updateModel(void 0);
  }
  loadSession(sessionId) {
    if (this.widget.viewModel) {
      this.chatService.clearSession(this.widget.viewModel.sessionId);
    }
    const newModel = this.chatService.getOrRestoreSession(sessionId);
    this.updateModel(newModel);
  }
  focusInput() {
    this._widget.focusInput();
  }
  focus() {
    super.focus();
    this._widget.focusInput();
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this._widget.layout(height, width);
  }
  saveState() {
    if (this._widget) {
      this._widget.saveState();
      this.updateViewState();
      this.memento.saveMemento();
    }
    super.saveState();
  }
  updateViewState() {
    const widgetViewState = this._widget.getViewState();
    this.viewState.inputValue = widgetViewState.inputValue;
    this.viewState.inputState = widgetViewState.inputState;
  }
};
ChatViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IHoverService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IChatService),
  __decorateParam(13, IChatAgentService),
  __decorateParam(14, ILogService)
], ChatViewPane);
export {
  CHAT_SIDEBAR_PANEL_ID,
  ChatViewPane
};
//# sourceMappingURL=chatViewPane.js.map
