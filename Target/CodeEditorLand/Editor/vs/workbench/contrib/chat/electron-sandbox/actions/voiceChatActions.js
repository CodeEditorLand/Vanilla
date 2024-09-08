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
import "./media/voiceChatActions.css";
import { renderStringAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import {
  RunOnceScheduler,
  disposableTimeout,
  raceCancellation
} from "../../../../../base/common/async.js";
import {
  CancellationTokenSource
} from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Event } from "../../../../../base/common/event.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import { isNumber } from "../../../../../base/common/types.js";
import { getCodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { localize, localize2 } from "../../../../../nls.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import {
  Action2,
  MenuId
} from "../../../../../platform/actions/common/actions.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import {
  Extensions
} from "../../../../../platform/configuration/common/configurationRegistry.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../../platform/contextkey/common/contextkey.js";
import {
  IInstantiationService
} from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ProgressLocation } from "../../../../../platform/progress/common/progress.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import {
  contrastBorder,
  focusBorder
} from "../../../../../platform/theme/common/colorRegistry.js";
import {
  spinningLoading,
  syncing
} from "../../../../../platform/theme/common/iconRegistry.js";
import { ColorScheme } from "../../../../../platform/theme/common/theme.js";
import { registerThemingParticipant } from "../../../../../platform/theme/common/themeService.js";
import { ActiveEditorContext } from "../../../../common/contextkeys.js";
import { ACTIVITY_BAR_BADGE_BACKGROUND } from "../../../../common/theme.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import {
  IWorkbenchLayoutService,
  Parts
} from "../../../../services/layout/browser/layoutService.js";
import {
  IStatusbarService,
  StatusbarAlignment
} from "../../../../services/statusbar/browser/statusbar.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import {
  AccessibilityVoiceSettingId,
  SpeechTimeoutDefault,
  accessibilityConfigurationNodeBase
} from "../../../accessibility/browser/accessibilityConfiguration.js";
import { IExtensionsWorkbenchService } from "../../../extensions/common/extensions.js";
import { InlineChatController } from "../../../inlineChat/browser/inlineChatController.js";
import {
  CTX_INLINE_CHAT_FOCUSED,
  MENU_INLINE_CHAT_WIDGET_SECONDARY
} from "../../../inlineChat/common/inlineChat.js";
import { NOTEBOOK_EDITOR_FOCUSED } from "../../../notebook/common/notebookContextKeys.js";
import {
  TextToSpeechInProgress as GlobalTextToSpeechInProgress,
  HasSpeechProvider,
  ISpeechService,
  KeywordRecognitionStatus,
  SpeechToTextInProgress,
  SpeechToTextStatus,
  TextToSpeechStatus
} from "../../../speech/common/speechService.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
import {
  TerminalChatContextKeys,
  TerminalChatController
} from "../../../terminal/browser/terminalContribExports.js";
import { CHAT_CATEGORY } from "../../browser/actions/chatActions.js";
import {
  IChatWidgetService,
  IQuickChatService,
  showChatView
} from "../../browser/chat.js";
import {
  ChatAgentLocation,
  IChatAgentService
} from "../../common/chatAgents.js";
import {
  CONTEXT_CHAT_ENABLED,
  CONTEXT_CHAT_REQUEST_IN_PROGRESS,
  CONTEXT_IN_CHAT_INPUT,
  CONTEXT_RESPONSE,
  CONTEXT_RESPONSE_FILTERED
} from "../../common/chatContextKeys.js";
import { KEYWORD_ACTIVIATION_SETTING_ID } from "../../common/chatService.js";
import { isResponseVM } from "../../common/chatViewModel.js";
import {
  VoiceChatInProgress as GlobalVoiceChatInProgress,
  IVoiceChatService
} from "../../common/voiceChatService.js";
const VoiceChatSessionContexts = [
  "view",
  "inline",
  "terminal",
  "quick",
  "editor"
];
const TerminalChatExecute = MenuId.for("terminalChatInput");
const CanVoiceChat = ContextKeyExpr.and(
  CONTEXT_CHAT_ENABLED,
  HasSpeechProvider
);
const FocusInChatInput = ContextKeyExpr.or(
  CTX_INLINE_CHAT_FOCUSED,
  CONTEXT_IN_CHAT_INPUT
);
const AnyChatRequestInProgress = ContextKeyExpr.or(
  CONTEXT_CHAT_REQUEST_IN_PROGRESS,
  TerminalChatContextKeys.requestActive
);
const ScopedVoiceChatGettingReady = new RawContextKey(
  "scopedVoiceChatGettingReady",
  false,
  {
    type: "boolean",
    description: localize(
      "scopedVoiceChatGettingReady",
      "True when getting ready for receiving voice input from the microphone for voice chat. This key is only defined scoped, per chat context."
    )
  }
);
const ScopedVoiceChatInProgress = new RawContextKey("scopedVoiceChatInProgress", void 0, {
  type: "string",
  description: localize(
    "scopedVoiceChatInProgress",
    "Defined as a location where voice recording from microphone is in progress for voice chat. This key is only defined scoped, per chat context."
  )
});
const AnyScopedVoiceChatInProgress = ContextKeyExpr.or(
  ...VoiceChatSessionContexts.map(
    (context) => ScopedVoiceChatInProgress.isEqualTo(context)
  )
);
var VoiceChatSessionState = /* @__PURE__ */ ((VoiceChatSessionState2) => {
  VoiceChatSessionState2[VoiceChatSessionState2["Stopped"] = 1] = "Stopped";
  VoiceChatSessionState2[VoiceChatSessionState2["GettingReady"] = 2] = "GettingReady";
  VoiceChatSessionState2[VoiceChatSessionState2["Started"] = 3] = "Started";
  return VoiceChatSessionState2;
})(VoiceChatSessionState || {});
class VoiceChatSessionControllerFactory {
  static async create(accessor, context) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const quickChatService = accessor.get(IQuickChatService);
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const editorService = accessor.get(IEditorService);
    const terminalService = accessor.get(ITerminalService);
    const viewsService = accessor.get(IViewsService);
    switch (context) {
      case "focused": {
        const controller = VoiceChatSessionControllerFactory.doCreateForFocusedChat(
          terminalService,
          chatWidgetService,
          layoutService
        );
        return controller ?? VoiceChatSessionControllerFactory.create(accessor, "view");
      }
      case "view": {
        const chatWidget = await showChatView(viewsService);
        if (chatWidget) {
          return VoiceChatSessionControllerFactory.doCreateForChatWidget(
            "view",
            chatWidget
          );
        }
        break;
      }
      case "inline": {
        const activeCodeEditor = getCodeEditor(
          editorService.activeTextEditorControl
        );
        if (activeCodeEditor) {
          const inlineChat = InlineChatController.get(activeCodeEditor);
          if (inlineChat) {
            if (!inlineChat.joinCurrentRun()) {
              inlineChat.run();
            }
            return VoiceChatSessionControllerFactory.doCreateForChatWidget(
              "inline",
              inlineChat.chatWidget
            );
          }
        }
        break;
      }
      case "quick": {
        quickChatService.open();
        return VoiceChatSessionControllerFactory.create(
          accessor,
          "focused"
        );
      }
    }
    return void 0;
  }
  static doCreateForFocusedChat(terminalService, chatWidgetService, layoutService) {
    const activeInstance = terminalService.activeInstance;
    if (activeInstance) {
      const terminalChat = TerminalChatController.activeChatWidget || TerminalChatController.get(activeInstance);
      if (terminalChat?.hasFocus()) {
        return VoiceChatSessionControllerFactory.doCreateForTerminalChat(
          terminalChat
        );
      }
    }
    const chatWidget = chatWidgetService.lastFocusedWidget;
    if (chatWidget?.hasInputFocus()) {
      let context;
      if (layoutService.hasFocus(Parts.EDITOR_PART)) {
        context = chatWidget.location === ChatAgentLocation.Panel ? "editor" : "inline";
      } else if ([
        Parts.SIDEBAR_PART,
        Parts.PANEL_PART,
        Parts.AUXILIARYBAR_PART,
        Parts.TITLEBAR_PART,
        Parts.STATUSBAR_PART,
        Parts.BANNER_PART,
        Parts.ACTIVITYBAR_PART
      ].some((part) => layoutService.hasFocus(part))) {
        context = "view";
      } else {
        context = "quick";
      }
      return VoiceChatSessionControllerFactory.doCreateForChatWidget(
        context,
        chatWidget
      );
    }
    return void 0;
  }
  static createChatContextKeyController(contextKeyService, context) {
    const contextVoiceChatGettingReady = ScopedVoiceChatGettingReady.bindTo(contextKeyService);
    const contextVoiceChatInProgress = ScopedVoiceChatInProgress.bindTo(contextKeyService);
    return (state) => {
      switch (state) {
        case 2 /* GettingReady */:
          contextVoiceChatGettingReady.set(true);
          contextVoiceChatInProgress.reset();
          break;
        case 3 /* Started */:
          contextVoiceChatGettingReady.reset();
          contextVoiceChatInProgress.set(context);
          break;
        case 1 /* Stopped */:
          contextVoiceChatGettingReady.reset();
          contextVoiceChatInProgress.reset();
          break;
      }
    };
  }
  static doCreateForChatWidget(context, chatWidget) {
    return {
      context,
      scopedContextKeyService: chatWidget.scopedContextKeyService,
      onDidAcceptInput: chatWidget.onDidAcceptInput,
      onDidHideInput: chatWidget.onDidHide,
      focusInput: () => chatWidget.focusInput(),
      acceptInput: () => chatWidget.acceptInput(),
      updateInput: (text) => chatWidget.setInput(text),
      getInput: () => chatWidget.getInput(),
      setInputPlaceholder: (text) => chatWidget.setInputPlaceholder(text),
      clearInputPlaceholder: () => chatWidget.resetInputPlaceholder(),
      updateState: VoiceChatSessionControllerFactory.createChatContextKeyController(
        chatWidget.scopedContextKeyService,
        context
      )
    };
  }
  static doCreateForTerminalChat(terminalChat) {
    const context = "terminal";
    return {
      context,
      scopedContextKeyService: terminalChat.scopedContextKeyService,
      onDidAcceptInput: terminalChat.onDidAcceptInput,
      onDidHideInput: terminalChat.onDidHide,
      focusInput: () => terminalChat.focus(),
      acceptInput: () => terminalChat.acceptInput(),
      updateInput: (text) => terminalChat.updateInput(text, false),
      getInput: () => terminalChat.getInput(),
      setInputPlaceholder: (text) => terminalChat.setPlaceholder(text),
      clearInputPlaceholder: () => terminalChat.resetPlaceholder(),
      updateState: VoiceChatSessionControllerFactory.createChatContextKeyController(
        terminalChat.scopedContextKeyService,
        context
      )
    };
  }
}
let VoiceChatSessions = class {
  constructor(voiceChatService, configurationService, instantiationService, accessibilityService) {
    this.voiceChatService = voiceChatService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.accessibilityService = accessibilityService;
  }
  static instance = void 0;
  static getInstance(instantiationService) {
    if (!VoiceChatSessions.instance) {
      VoiceChatSessions.instance = instantiationService.createInstance(VoiceChatSessions);
    }
    return VoiceChatSessions.instance;
  }
  currentVoiceChatSession = void 0;
  voiceChatSessionIds = 0;
  async start(controller, context) {
    this.stop();
    ChatSynthesizerSessions.getInstance(this.instantiationService).stop();
    let disableTimeout = false;
    const sessionId = ++this.voiceChatSessionIds;
    const session = this.currentVoiceChatSession = {
      id: sessionId,
      controller,
      disposables: new DisposableStore(),
      setTimeoutDisabled: (disabled) => {
        disableTimeout = disabled;
      },
      accept: () => this.accept(sessionId),
      stop: () => this.stop(sessionId, controller.context)
    };
    const cts = new CancellationTokenSource();
    session.disposables.add(toDisposable(() => cts.dispose(true)));
    session.disposables.add(
      controller.onDidAcceptInput(
        () => this.stop(sessionId, controller.context)
      )
    );
    session.disposables.add(
      controller.onDidHideInput(
        () => this.stop(sessionId, controller.context)
      )
    );
    controller.focusInput();
    controller.updateState(2 /* GettingReady */);
    const voiceChatSession = await this.voiceChatService.createVoiceChatSession(cts.token, {
      usesAgents: controller.context !== "inline",
      model: context?.widget?.viewModel?.model
    });
    let inputValue = controller.getInput();
    let voiceChatTimeout = this.configurationService.getValue(
      AccessibilityVoiceSettingId.SpeechTimeout
    );
    if (!isNumber(voiceChatTimeout) || voiceChatTimeout < 0) {
      voiceChatTimeout = SpeechTimeoutDefault;
    }
    const acceptTranscriptionScheduler = session.disposables.add(
      new RunOnceScheduler(
        () => this.accept(sessionId),
        voiceChatTimeout
      )
    );
    session.disposables.add(
      voiceChatSession.onDidChange(
        ({ status, text, waitingForInput }) => {
          if (cts.token.isCancellationRequested) {
            return;
          }
          switch (status) {
            case SpeechToTextStatus.Started:
              this.onDidSpeechToTextSessionStart(
                controller,
                session.disposables
              );
              break;
            case SpeechToTextStatus.Recognizing:
              if (text) {
                session.controller.updateInput(
                  inputValue ? [inputValue, text].join(" ") : text
                );
                if (voiceChatTimeout > 0 && context?.voice?.disableTimeout !== true && !disableTimeout) {
                  acceptTranscriptionScheduler.cancel();
                }
              }
              break;
            case SpeechToTextStatus.Recognized:
              if (text) {
                inputValue = inputValue ? [inputValue, text].join(" ") : text;
                session.controller.updateInput(inputValue);
                if (voiceChatTimeout > 0 && context?.voice?.disableTimeout !== true && !waitingForInput && !disableTimeout) {
                  acceptTranscriptionScheduler.schedule();
                }
              }
              break;
            case SpeechToTextStatus.Stopped:
              this.stop(session.id, controller.context);
              break;
          }
        }
      )
    );
    return session;
  }
  onDidSpeechToTextSessionStart(controller, disposables) {
    controller.updateState(3 /* Started */);
    let dotCount = 0;
    const updatePlaceholder = () => {
      dotCount = (dotCount + 1) % 4;
      controller.setInputPlaceholder(
        `${localize("listening", "I'm listening")}${".".repeat(dotCount)}`
      );
      placeholderScheduler.schedule();
    };
    const placeholderScheduler = disposables.add(
      new RunOnceScheduler(updatePlaceholder, 500)
    );
    updatePlaceholder();
  }
  stop(voiceChatSessionId = this.voiceChatSessionIds, context) {
    if (!this.currentVoiceChatSession || this.voiceChatSessionIds !== voiceChatSessionId || context && this.currentVoiceChatSession.controller.context !== context) {
      return;
    }
    this.currentVoiceChatSession.controller.clearInputPlaceholder();
    this.currentVoiceChatSession.controller.updateState(
      1 /* Stopped */
    );
    this.currentVoiceChatSession.disposables.dispose();
    this.currentVoiceChatSession = void 0;
  }
  async accept(voiceChatSessionId = this.voiceChatSessionIds) {
    if (!this.currentVoiceChatSession || this.voiceChatSessionIds !== voiceChatSessionId) {
      return;
    }
    const controller = this.currentVoiceChatSession.controller;
    const response = await controller.acceptInput();
    if (!response) {
      return;
    }
    const autoSynthesize = this.configurationService.getValue(AccessibilityVoiceSettingId.AutoSynthesize);
    if (autoSynthesize === "on" || autoSynthesize === "auto" && !this.accessibilityService.isScreenReaderOptimized()) {
      let context;
      if (controller.context === "inline") {
        context = "focused";
      } else {
        context = controller;
      }
      ChatSynthesizerSessions.getInstance(
        this.instantiationService
      ).start(
        this.instantiationService.invokeFunction(
          (accessor) => ChatSynthesizerSessionController.create(
            accessor,
            context,
            response
          )
        )
      );
    }
  }
};
VoiceChatSessions = __decorateClass([
  __decorateParam(0, IVoiceChatService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IAccessibilityService)
], VoiceChatSessions);
const VOICE_KEY_HOLD_THRESHOLD = 500;
async function startVoiceChatWithHoldMode(id, accessor, target, context) {
  const instantiationService = accessor.get(IInstantiationService);
  const keybindingService = accessor.get(IKeybindingService);
  const holdMode = keybindingService.enableKeybindingHoldMode(id);
  const controller = await VoiceChatSessionControllerFactory.create(
    accessor,
    target
  );
  if (!controller) {
    return;
  }
  const session = await VoiceChatSessions.getInstance(
    instantiationService
  ).start(controller, context);
  let acceptVoice = false;
  const handle = disposableTimeout(() => {
    acceptVoice = true;
    session?.setTimeoutDisabled(true);
  }, VOICE_KEY_HOLD_THRESHOLD);
  await holdMode;
  handle.dispose();
  if (acceptVoice) {
    session.accept();
  }
}
class VoiceChatWithHoldModeAction extends Action2 {
  constructor(desc, target) {
    super(desc);
    this.target = target;
  }
  run(accessor, context) {
    return startVoiceChatWithHoldMode(
      this.desc.id,
      accessor,
      this.target,
      context
    );
  }
}
class VoiceChatInChatViewAction extends VoiceChatWithHoldModeAction {
  static ID = "workbench.action.chat.voiceChatInChatView";
  constructor() {
    super(
      {
        id: VoiceChatInChatViewAction.ID,
        title: localize2(
          "workbench.action.chat.voiceChatInView.label",
          "Voice Chat in Chat View"
        ),
        category: CHAT_CATEGORY,
        precondition: ContextKeyExpr.and(
          CanVoiceChat,
          CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()
          // disable when a chat request is in progress
        ),
        f1: true
      },
      "view"
    );
  }
}
class HoldToVoiceChatInChatViewAction extends Action2 {
  static ID = "workbench.action.chat.holdToVoiceChatInChatView";
  constructor() {
    super({
      id: HoldToVoiceChatInChatViewAction.ID,
      title: localize2(
        "workbench.action.chat.holdToVoiceChatInChatView.label",
        "Hold to Voice Chat in Chat View"
      ),
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: ContextKeyExpr.and(
          CanVoiceChat,
          CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate(),
          // disable when a chat request is in progress
          FocusInChatInput?.negate(),
          // when already in chat input, disable this action and prefer to start voice chat directly
          EditorContextKeys.focus.negate(),
          // do not steal the inline-chat keybinding
          NOTEBOOK_EDITOR_FOCUSED.negate()
          // do not steal the notebook keybinding
        ),
        primary: KeyMod.CtrlCmd | KeyCode.KeyI
      }
    });
  }
  async run(accessor, context) {
    const instantiationService = accessor.get(IInstantiationService);
    const keybindingService = accessor.get(IKeybindingService);
    const viewsService = accessor.get(IViewsService);
    const holdMode = keybindingService.enableKeybindingHoldMode(
      HoldToVoiceChatInChatViewAction.ID
    );
    let session;
    const handle = disposableTimeout(async () => {
      const controller = await VoiceChatSessionControllerFactory.create(
        accessor,
        "view"
      );
      if (controller) {
        session = await VoiceChatSessions.getInstance(
          instantiationService
        ).start(controller, context);
        session.setTimeoutDisabled(true);
      }
    }, VOICE_KEY_HOLD_THRESHOLD);
    (await showChatView(viewsService))?.focusInput();
    await holdMode;
    handle.dispose();
    if (session) {
      session.accept();
    }
  }
}
class InlineVoiceChatAction extends VoiceChatWithHoldModeAction {
  static ID = "workbench.action.chat.inlineVoiceChat";
  constructor() {
    super(
      {
        id: InlineVoiceChatAction.ID,
        title: localize2(
          "workbench.action.chat.inlineVoiceChat",
          "Inline Voice Chat"
        ),
        category: CHAT_CATEGORY,
        precondition: ContextKeyExpr.and(
          CanVoiceChat,
          ActiveEditorContext,
          CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()
          // disable when a chat request is in progress
        ),
        f1: true
      },
      "inline"
    );
  }
}
class QuickVoiceChatAction extends VoiceChatWithHoldModeAction {
  static ID = "workbench.action.chat.quickVoiceChat";
  constructor() {
    super(
      {
        id: QuickVoiceChatAction.ID,
        title: localize2(
          "workbench.action.chat.quickVoiceChat.label",
          "Quick Voice Chat"
        ),
        category: CHAT_CATEGORY,
        precondition: ContextKeyExpr.and(
          CanVoiceChat,
          CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()
          // disable when a chat request is in progress
        ),
        f1: true
      },
      "quick"
    );
  }
}
class StartVoiceChatAction extends Action2 {
  static ID = "workbench.action.chat.startVoiceChat";
  constructor() {
    super({
      id: StartVoiceChatAction.ID,
      title: localize2(
        "workbench.action.chat.startVoiceChat.label",
        "Start Voice Chat"
      ),
      category: CHAT_CATEGORY,
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: ContextKeyExpr.and(
          FocusInChatInput,
          // scope this action to chat input fields only
          EditorContextKeys.focus.negate(),
          // do not steal the editor inline-chat keybinding
          NOTEBOOK_EDITOR_FOCUSED.negate()
          // do not steal the notebook inline-chat keybinding
        ),
        primary: KeyMod.CtrlCmd | KeyCode.KeyI
      },
      icon: Codicon.mic,
      precondition: ContextKeyExpr.and(
        CanVoiceChat,
        ScopedVoiceChatGettingReady.negate(),
        // disable when voice chat is getting ready
        AnyChatRequestInProgress?.negate(),
        // disable when any chat request is in progress
        SpeechToTextInProgress.negate()
        // disable when speech to text is in progress
      ),
      menu: [
        {
          id: MenuId.ChatExecute,
          when: ContextKeyExpr.and(
            HasSpeechProvider,
            ScopedChatSynthesisInProgress.negate(),
            // hide when text to speech is in progress
            AnyScopedVoiceChatInProgress?.negate()
            // hide when voice chat is in progress
          ),
          group: "navigation",
          order: -1
        },
        {
          id: TerminalChatExecute,
          when: ContextKeyExpr.and(
            HasSpeechProvider,
            ScopedChatSynthesisInProgress.negate(),
            // hide when text to speech is in progress
            AnyScopedVoiceChatInProgress?.negate()
            // hide when voice chat is in progress
          ),
          group: "navigation",
          order: -1
        }
      ]
    });
  }
  async run(accessor, context) {
    const widget = context?.widget;
    if (widget) {
      widget.focusInput();
    }
    return startVoiceChatWithHoldMode(
      this.desc.id,
      accessor,
      "focused",
      context
    );
  }
}
class StopListeningAction extends Action2 {
  static ID = "workbench.action.chat.stopListening";
  constructor() {
    super({
      id: StopListeningAction.ID,
      title: localize2(
        "workbench.action.chat.stopListening.label",
        "Stop Listening"
      ),
      category: CHAT_CATEGORY,
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib + 100,
        primary: KeyCode.Escape,
        when: AnyScopedVoiceChatInProgress
      },
      icon: spinningLoading,
      precondition: GlobalVoiceChatInProgress,
      // need global context here because of `f1: true`
      menu: [
        {
          id: MenuId.ChatExecute,
          when: AnyScopedVoiceChatInProgress,
          group: "navigation",
          order: -1
        },
        {
          id: TerminalChatExecute,
          when: AnyScopedVoiceChatInProgress,
          group: "navigation",
          order: -1
        }
      ]
    });
  }
  async run(accessor) {
    VoiceChatSessions.getInstance(
      accessor.get(IInstantiationService)
    ).stop();
  }
}
class StopListeningAndSubmitAction extends Action2 {
  static ID = "workbench.action.chat.stopListeningAndSubmit";
  constructor() {
    super({
      id: StopListeningAndSubmitAction.ID,
      title: localize2(
        "workbench.action.chat.stopListeningAndSubmit.label",
        "Stop Listening and Submit"
      ),
      category: CHAT_CATEGORY,
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: ContextKeyExpr.and(
          FocusInChatInput,
          AnyScopedVoiceChatInProgress
        ),
        primary: KeyMod.CtrlCmd | KeyCode.KeyI
      },
      precondition: GlobalVoiceChatInProgress
      // need global context here because of `f1: true`
    });
  }
  run(accessor) {
    VoiceChatSessions.getInstance(
      accessor.get(IInstantiationService)
    ).accept();
  }
}
const ScopedChatSynthesisInProgress = new RawContextKey(
  "scopedChatSynthesisInProgress",
  false,
  {
    type: "boolean",
    description: localize(
      "scopedChatSynthesisInProgress",
      "Defined as a location where voice recording from microphone is in progress for voice chat. This key is only defined scoped, per chat context."
    )
  }
);
class ChatSynthesizerSessionController {
  static create(accessor, context, response) {
    if (context === "focused") {
      return ChatSynthesizerSessionController.doCreateForFocusedChat(
        accessor,
        response
      );
    } else {
      return {
        onDidHideChat: context.onDidHideInput,
        contextKeyService: context.scopedContextKeyService,
        response
      };
    }
  }
  static doCreateForFocusedChat(accessor, response) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const contextKeyService = accessor.get(IContextKeyService);
    const terminalService = accessor.get(ITerminalService);
    const activeInstance = terminalService.activeInstance;
    if (activeInstance) {
      const terminalChat = TerminalChatController.activeChatWidget || TerminalChatController.get(activeInstance);
      if (terminalChat?.hasFocus()) {
        return {
          onDidHideChat: terminalChat.onDidHide,
          contextKeyService: terminalChat.scopedContextKeyService,
          response
        };
      }
    }
    let chatWidget = chatWidgetService.getWidgetBySessionId(
      response.session.sessionId
    );
    if (chatWidget?.location === ChatAgentLocation.Editor) {
      chatWidget = chatWidgetService.lastFocusedWidget;
    }
    return {
      onDidHideChat: chatWidget?.onDidHide ?? Event.None,
      contextKeyService: chatWidget?.scopedContextKeyService ?? contextKeyService,
      response
    };
  }
}
let ChatSynthesizerSessions = class {
  constructor(speechService, instantiationService) {
    this.speechService = speechService;
    this.instantiationService = instantiationService;
  }
  static instance = void 0;
  static getInstance(instantiationService) {
    if (!ChatSynthesizerSessions.instance) {
      ChatSynthesizerSessions.instance = instantiationService.createInstance(ChatSynthesizerSessions);
    }
    return ChatSynthesizerSessions.instance;
  }
  activeSession = void 0;
  async start(controller) {
    this.stop();
    VoiceChatSessions.getInstance(this.instantiationService).stop();
    const activeSession = this.activeSession = new CancellationTokenSource();
    const disposables = new DisposableStore();
    activeSession.token.onCancellationRequested(
      () => disposables.dispose()
    );
    const session = await this.speechService.createTextToSpeechSession(
      activeSession.token,
      "chat"
    );
    if (activeSession.token.isCancellationRequested) {
      return;
    }
    disposables.add(controller.onDidHideChat(() => this.stop()));
    const scopedChatToSpeechInProgress = ScopedChatSynthesisInProgress.bindTo(controller.contextKeyService);
    disposables.add(
      toDisposable(() => scopedChatToSpeechInProgress.reset())
    );
    disposables.add(
      session.onDidChange((e) => {
        switch (e.status) {
          case TextToSpeechStatus.Started:
            scopedChatToSpeechInProgress.set(true);
            break;
          case TextToSpeechStatus.Stopped:
            scopedChatToSpeechInProgress.reset();
            break;
        }
      })
    );
    for await (const chunk of this.nextChatResponseChunk(
      controller.response,
      activeSession.token
    )) {
      if (activeSession.token.isCancellationRequested) {
        return;
      }
      await raceCancellation(
        session.synthesize(chunk),
        activeSession.token
      );
    }
  }
  async *nextChatResponseChunk(response, token) {
    let totalOffset = 0;
    let complete = false;
    do {
      const responseLength = response.response.toString().length;
      const { chunk, offset } = this.parseNextChatResponseChunk(
        response,
        totalOffset
      );
      totalOffset = offset;
      complete = response.isComplete;
      if (chunk) {
        yield chunk;
      }
      if (token.isCancellationRequested) {
        return;
      }
      if (!complete && responseLength === response.response.toString().length) {
        await raceCancellation(
          Event.toPromise(response.onDidChange),
          token
        );
      }
    } while (!token.isCancellationRequested && !complete);
  }
  parseNextChatResponseChunk(response, offset) {
    let chunk;
    const text = response.response.toString();
    if (response.isComplete) {
      chunk = text.substring(offset);
      offset = text.length + 1;
    } else {
      const res = parseNextChatResponseChunk(text, offset);
      chunk = res.chunk;
      offset = res.offset;
    }
    return {
      chunk: chunk ? renderStringAsPlaintext({ value: chunk }) : chunk,
      // convert markdown to plain text
      offset
    };
  }
  stop() {
    this.activeSession?.dispose(true);
    this.activeSession = void 0;
  }
};
ChatSynthesizerSessions = __decorateClass([
  __decorateParam(0, ISpeechService),
  __decorateParam(1, IInstantiationService)
], ChatSynthesizerSessions);
const sentenceDelimiter = [".", "!", "?", ":"];
const lineDelimiter = "\n";
const wordDelimiter = " ";
function parseNextChatResponseChunk(text, offset) {
  let chunk;
  for (let i = text.length - 1; i >= offset; i--) {
    const cur = text[i];
    const next = text[i + 1];
    if (sentenceDelimiter.includes(cur) && next === wordDelimiter || // end of sentence
    lineDelimiter === cur) {
      chunk = text.substring(offset, i + 1).trim();
      offset = i + 1;
      break;
    }
  }
  return { chunk, offset };
}
class ReadChatResponseAloud extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.readChatResponseAloud",
      title: localize2(
        "workbench.action.chat.readChatResponseAloud",
        "Read Aloud"
      ),
      icon: Codicon.unmute,
      precondition: CanVoiceChat,
      menu: [
        {
          id: MenuId.ChatMessageTitle,
          when: ContextKeyExpr.and(
            CanVoiceChat,
            CONTEXT_RESPONSE,
            // only for responses
            ScopedChatSynthesisInProgress.negate(),
            // but not when already in progress
            CONTEXT_RESPONSE_FILTERED.negate()
            // and not when response is filtered
          ),
          group: "navigation"
        },
        {
          id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
          when: ContextKeyExpr.and(
            CanVoiceChat,
            CONTEXT_RESPONSE,
            // only for responses
            ScopedChatSynthesisInProgress.negate(),
            // but not when already in progress
            CONTEXT_RESPONSE_FILTERED.negate()
            // and not when response is filtered
          ),
          group: "navigation"
        }
      ]
    });
  }
  run(accessor, ...args) {
    const instantiationService = accessor.get(IInstantiationService);
    const response = args[0];
    if (!isResponseVM(response)) {
      return;
    }
    const controller = ChatSynthesizerSessionController.create(
      accessor,
      "focused",
      response.model
    );
    ChatSynthesizerSessions.getInstance(instantiationService).start(
      controller
    );
  }
}
class StopReadAloud extends Action2 {
  static ID = "workbench.action.speech.stopReadAloud";
  constructor() {
    super({
      id: StopReadAloud.ID,
      icon: syncing,
      title: localize2(
        "workbench.action.speech.stopReadAloud",
        "Stop Reading Aloud"
      ),
      f1: true,
      category: CHAT_CATEGORY,
      precondition: GlobalTextToSpeechInProgress,
      // need global context here because of `f1: true`
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib + 100,
        primary: KeyCode.Escape,
        when: ScopedChatSynthesisInProgress
      },
      menu: [
        {
          id: MenuId.ChatExecute,
          when: ScopedChatSynthesisInProgress,
          group: "navigation",
          order: -1
        },
        {
          id: TerminalChatExecute,
          when: ScopedChatSynthesisInProgress,
          group: "navigation",
          order: -1
        }
      ]
    });
  }
  async run(accessor) {
    ChatSynthesizerSessions.getInstance(
      accessor.get(IInstantiationService)
    ).stop();
  }
}
class StopReadChatItemAloud extends Action2 {
  static ID = "workbench.action.chat.stopReadChatItemAloud";
  constructor() {
    super({
      id: StopReadChatItemAloud.ID,
      icon: Codicon.mute,
      title: localize2(
        "workbench.action.chat.stopReadChatItemAloud",
        "Stop Reading Aloud"
      ),
      precondition: ScopedChatSynthesisInProgress,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib + 100,
        primary: KeyCode.Escape
      },
      menu: [
        {
          id: MenuId.ChatMessageTitle,
          when: ContextKeyExpr.and(
            ScopedChatSynthesisInProgress,
            // only when in progress
            CONTEXT_RESPONSE,
            // only for responses
            CONTEXT_RESPONSE_FILTERED.negate()
            // but not when response is filtered
          ),
          group: "navigation"
        },
        {
          id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
          when: ContextKeyExpr.and(
            ScopedChatSynthesisInProgress,
            // only when in progress
            CONTEXT_RESPONSE,
            // only for responses
            CONTEXT_RESPONSE_FILTERED.negate()
            // but not when response is filtered
          ),
          group: "navigation"
        }
      ]
    });
  }
  async run(accessor, ...args) {
    ChatSynthesizerSessions.getInstance(
      accessor.get(IInstantiationService)
    ).stop();
  }
}
function supportsKeywordActivation(configurationService, speechService, chatAgentService) {
  if (!speechService.hasSpeechProvider || !chatAgentService.getDefaultAgent(ChatAgentLocation.Panel)) {
    return false;
  }
  const value = configurationService.getValue(KEYWORD_ACTIVIATION_SETTING_ID);
  return typeof value === "string" && value !== KeywordActivationContribution.SETTINGS_VALUE.OFF;
}
let KeywordActivationContribution = class extends Disposable {
  constructor(speechService, configurationService, commandService, instantiationService, editorService, hostService, chatAgentService) {
    super();
    this.speechService = speechService;
    this.configurationService = configurationService;
    this.commandService = commandService;
    this.editorService = editorService;
    this.hostService = hostService;
    this.chatAgentService = chatAgentService;
    this._register(instantiationService.createInstance(KeywordActivationStatusEntry));
    this.registerListeners();
  }
  static ID = "workbench.contrib.keywordActivation";
  static SETTINGS_VALUE = {
    OFF: "off",
    INLINE_CHAT: "inlineChat",
    QUICK_CHAT: "quickChat",
    VIEW_CHAT: "chatInView",
    CHAT_IN_CONTEXT: "chatInContext"
  };
  activeSession = void 0;
  registerListeners() {
    this._register(
      Event.runAndSubscribe(
        this.speechService.onDidChangeHasSpeechProvider,
        () => {
          this.updateConfiguration();
          this.handleKeywordActivation();
        }
      )
    );
    const onDidAddDefaultAgent = this._register(
      this.chatAgentService.onDidChangeAgents(() => {
        if (this.chatAgentService.getDefaultAgent(
          ChatAgentLocation.Panel
        )) {
          this.updateConfiguration();
          this.handleKeywordActivation();
          onDidAddDefaultAgent.dispose();
        }
      })
    );
    this._register(
      this.speechService.onDidStartSpeechToTextSession(
        () => this.handleKeywordActivation()
      )
    );
    this._register(
      this.speechService.onDidEndSpeechToTextSession(
        () => this.handleKeywordActivation()
      )
    );
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(KEYWORD_ACTIVIATION_SETTING_ID)) {
          this.handleKeywordActivation();
        }
      })
    );
  }
  updateConfiguration() {
    if (!this.speechService.hasSpeechProvider || !this.chatAgentService.getDefaultAgent(ChatAgentLocation.Panel)) {
      return;
    }
    const registry = Registry.as(
      Extensions.Configuration
    );
    registry.registerConfiguration({
      ...accessibilityConfigurationNodeBase,
      properties: {
        [KEYWORD_ACTIVIATION_SETTING_ID]: {
          type: "string",
          enum: [
            KeywordActivationContribution.SETTINGS_VALUE.OFF,
            KeywordActivationContribution.SETTINGS_VALUE.VIEW_CHAT,
            KeywordActivationContribution.SETTINGS_VALUE.QUICK_CHAT,
            KeywordActivationContribution.SETTINGS_VALUE.INLINE_CHAT,
            KeywordActivationContribution.SETTINGS_VALUE.CHAT_IN_CONTEXT
          ],
          enumDescriptions: [
            localize(
              "voice.keywordActivation.off",
              "Keyword activation is disabled."
            ),
            localize(
              "voice.keywordActivation.chatInView",
              "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the chat view."
            ),
            localize(
              "voice.keywordActivation.quickChat",
              "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the quick chat."
            ),
            localize(
              "voice.keywordActivation.inlineChat",
              "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the active editor if possible."
            ),
            localize(
              "voice.keywordActivation.chatInContext",
              "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the active editor or view depending on keyboard focus."
            )
          ],
          description: localize(
            "voice.keywordActivation",
            "Controls whether the keyword phrase 'Hey Code' is recognized to start a voice chat session. Enabling this will start recording from the microphone but the audio is processed locally and never sent to a server."
          ),
          default: "off",
          tags: ["accessibility"]
        }
      }
    });
  }
  handleKeywordActivation() {
    const enabled = supportsKeywordActivation(
      this.configurationService,
      this.speechService,
      this.chatAgentService
    ) && !this.speechService.hasActiveSpeechToTextSession;
    if (enabled && this.activeSession || !enabled && !this.activeSession) {
      return;
    }
    if (enabled) {
      this.enableKeywordActivation();
    } else {
      this.disableKeywordActivation();
    }
  }
  async enableKeywordActivation() {
    const session = this.activeSession = new CancellationTokenSource();
    const result = await this.speechService.recognizeKeyword(session.token);
    if (session.token.isCancellationRequested || session !== this.activeSession) {
      return;
    }
    this.activeSession = void 0;
    if (result === KeywordRecognitionStatus.Recognized) {
      if (this.hostService.hasFocus) {
        this.commandService.executeCommand(this.getKeywordCommand());
      }
      this.handleKeywordActivation();
    }
  }
  getKeywordCommand() {
    const setting = this.configurationService.getValue(
      KEYWORD_ACTIVIATION_SETTING_ID
    );
    switch (setting) {
      case KeywordActivationContribution.SETTINGS_VALUE.INLINE_CHAT:
        return InlineVoiceChatAction.ID;
      case KeywordActivationContribution.SETTINGS_VALUE.QUICK_CHAT:
        return QuickVoiceChatAction.ID;
      case KeywordActivationContribution.SETTINGS_VALUE.CHAT_IN_CONTEXT: {
        const activeCodeEditor = getCodeEditor(
          this.editorService.activeTextEditorControl
        );
        if (activeCodeEditor?.hasWidgetFocus()) {
          return InlineVoiceChatAction.ID;
        }
      }
      default:
        return VoiceChatInChatViewAction.ID;
    }
  }
  disableKeywordActivation() {
    this.activeSession?.dispose(true);
    this.activeSession = void 0;
  }
  dispose() {
    this.activeSession?.dispose();
    super.dispose();
  }
};
KeywordActivationContribution = __decorateClass([
  __decorateParam(0, ISpeechService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IHostService),
  __decorateParam(6, IChatAgentService)
], KeywordActivationContribution);
let KeywordActivationStatusEntry = class extends Disposable {
  constructor(speechService, statusbarService, commandService, configurationService, chatAgentService) {
    super();
    this.speechService = speechService;
    this.statusbarService = statusbarService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.chatAgentService = chatAgentService;
    this._register(CommandsRegistry.registerCommand(KeywordActivationStatusEntry.STATUS_COMMAND, () => this.commandService.executeCommand("workbench.action.openSettings", KEYWORD_ACTIVIATION_SETTING_ID)));
    this.registerListeners();
    this.updateStatusEntry();
  }
  entry = this._register(
    new MutableDisposable()
  );
  static STATUS_NAME = localize(
    "keywordActivation.status.name",
    "Voice Keyword Activation"
  );
  static STATUS_COMMAND = "keywordActivation.status.command";
  static STATUS_ACTIVE = localize(
    "keywordActivation.status.active",
    "Listening to 'Hey Code'..."
  );
  static STATUS_INACTIVE = localize(
    "keywordActivation.status.inactive",
    "Waiting for voice chat to end..."
  );
  registerListeners() {
    this._register(
      this.speechService.onDidStartKeywordRecognition(
        () => this.updateStatusEntry()
      )
    );
    this._register(
      this.speechService.onDidEndKeywordRecognition(
        () => this.updateStatusEntry()
      )
    );
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(KEYWORD_ACTIVIATION_SETTING_ID)) {
          this.updateStatusEntry();
        }
      })
    );
  }
  updateStatusEntry() {
    const visible = supportsKeywordActivation(
      this.configurationService,
      this.speechService,
      this.chatAgentService
    );
    if (visible) {
      if (!this.entry.value) {
        this.createStatusEntry();
      }
      this.updateStatusLabel();
    } else {
      this.entry.clear();
    }
  }
  createStatusEntry() {
    this.entry.value = this.statusbarService.addEntry(
      this.getStatusEntryProperties(),
      "status.voiceKeywordActivation",
      StatusbarAlignment.RIGHT,
      103
    );
  }
  getStatusEntryProperties() {
    return {
      name: KeywordActivationStatusEntry.STATUS_NAME,
      text: this.speechService.hasActiveKeywordRecognition ? "$(mic-filled)" : "$(mic)",
      tooltip: this.speechService.hasActiveKeywordRecognition ? KeywordActivationStatusEntry.STATUS_ACTIVE : KeywordActivationStatusEntry.STATUS_INACTIVE,
      ariaLabel: this.speechService.hasActiveKeywordRecognition ? KeywordActivationStatusEntry.STATUS_ACTIVE : KeywordActivationStatusEntry.STATUS_INACTIVE,
      command: KeywordActivationStatusEntry.STATUS_COMMAND,
      kind: "prominent",
      showInAllWindows: true
    };
  }
  updateStatusLabel() {
    this.entry.value?.update(this.getStatusEntryProperties());
  }
};
KeywordActivationStatusEntry = __decorateClass([
  __decorateParam(0, ISpeechService),
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IChatAgentService)
], KeywordActivationStatusEntry);
const InstallingSpeechProvider = new RawContextKey(
  "installingSpeechProvider",
  false,
  true
);
class BaseInstallSpeechProviderAction extends Action2 {
  static SPEECH_EXTENSION_ID = "ms-vscode.vscode-speech";
  async run(accessor) {
    const contextKeyService = accessor.get(IContextKeyService);
    const extensionsWorkbenchService = accessor.get(
      IExtensionsWorkbenchService
    );
    try {
      InstallingSpeechProvider.bindTo(contextKeyService).set(true);
      await extensionsWorkbenchService.install(
        BaseInstallSpeechProviderAction.SPEECH_EXTENSION_ID,
        {
          justification: this.getJustification(),
          enable: true
        },
        ProgressLocation.Notification
      );
    } finally {
      InstallingSpeechProvider.bindTo(contextKeyService).reset();
    }
  }
}
class InstallSpeechProviderForVoiceChatAction extends BaseInstallSpeechProviderAction {
  static ID = "workbench.action.chat.installProviderForVoiceChat";
  constructor() {
    super({
      id: InstallSpeechProviderForVoiceChatAction.ID,
      title: localize2(
        "workbench.action.chat.installProviderForVoiceChat.label",
        "Start Voice Chat"
      ),
      icon: Codicon.mic,
      precondition: InstallingSpeechProvider.negate(),
      menu: [
        {
          id: MenuId.ChatExecute,
          when: HasSpeechProvider.negate(),
          group: "navigation",
          order: -1
        },
        {
          id: TerminalChatExecute,
          when: HasSpeechProvider.negate(),
          group: "navigation",
          order: -1
        }
      ]
    });
  }
  getJustification() {
    return localize(
      "installProviderForVoiceChat.justification",
      "Microphone support requires this extension."
    );
  }
}
class InstallSpeechProviderForSynthesizeChatAction extends BaseInstallSpeechProviderAction {
  static ID = "workbench.action.chat.installProviderForSynthesis";
  constructor() {
    super({
      id: InstallSpeechProviderForSynthesizeChatAction.ID,
      title: localize2(
        "workbench.action.chat.installProviderForSynthesis.label",
        "Read Aloud"
      ),
      icon: Codicon.unmute,
      precondition: InstallingSpeechProvider.negate(),
      menu: [
        {
          id: MenuId.ChatMessageTitle,
          when: HasSpeechProvider.negate(),
          group: "navigation"
        }
      ]
    });
  }
  getJustification() {
    return localize(
      "installProviderForSynthesis.justification",
      "Speaker support requires this extension."
    );
  }
}
registerThemingParticipant((theme, collector) => {
  let activeRecordingColor;
  let activeRecordingDimmedColor;
  if (theme.type === ColorScheme.LIGHT || theme.type === ColorScheme.DARK) {
    activeRecordingColor = theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND) ?? theme.getColor(focusBorder);
    activeRecordingDimmedColor = activeRecordingColor?.transparent(0.38);
  } else {
    activeRecordingColor = theme.getColor(contrastBorder);
    activeRecordingDimmedColor = theme.getColor(contrastBorder);
  }
  collector.addRule(`
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled),
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled) {
			color: ${activeRecordingColor};
			outline: 1px solid ${activeRecordingColor};
			outline-offset: -1px;
			animation: pulseAnimation 1s infinite;
			border-radius: 50%;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::before,
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::before {
			position: absolute;
			outline: 1px solid ${activeRecordingColor};
			outline-offset: 2px;
			border-radius: 50%;
			width: 16px;
			height: 16px;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::after,
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::after {
			outline: 2px solid ${activeRecordingColor};
			outline-offset: -1px;
			animation: pulseAnimation 1500ms cubic-bezier(0.75, 0, 0.25, 1) infinite;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::before,
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::before {
			position: absolute;
			outline: 1px solid ${activeRecordingColor};
			outline-offset: 2px;
			border-radius: 50%;
			width: 16px;
			height: 16px;
		}

		@keyframes pulseAnimation {
			0% {
				outline-width: 2px;
			}
			62% {
				outline-width: 5px;
				outline-color: ${activeRecordingDimmedColor};
			}
			100% {
				outline-width: 2px;
			}
		}
	`);
});
export {
  HoldToVoiceChatInChatViewAction,
  InlineVoiceChatAction,
  InstallSpeechProviderForSynthesizeChatAction,
  InstallSpeechProviderForVoiceChatAction,
  KeywordActivationContribution,
  QuickVoiceChatAction,
  ReadChatResponseAloud,
  StartVoiceChatAction,
  StopListeningAction,
  StopListeningAndSubmitAction,
  StopReadAloud,
  StopReadChatItemAloud,
  VOICE_KEY_HOLD_THRESHOLD,
  VoiceChatInChatViewAction,
  parseNextChatResponseChunk
};
