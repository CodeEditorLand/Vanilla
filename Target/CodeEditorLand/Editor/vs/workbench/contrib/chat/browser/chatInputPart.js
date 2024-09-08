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
import * as dom from "../../../../base/browser/dom.js";
import { DEFAULT_FONT_FAMILY } from "../../../../base/browser/fonts.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { HistoryNavigator2 } from "../../../../base/common/history.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { basename, dirname } from "../../../../base/common/path.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { Range } from "../../../../editor/common/core/range.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ContentHoverController } from "../../../../editor/contrib/hover/browser/contentHoverController.js";
import { GlyphHoverController } from "../../../../editor/contrib/hover/browser/glyphHoverController.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { DropdownWithPrimaryActionViewItem } from "../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js";
import { createAndFillInActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  HiddenItemStrategy,
  MenuWorkbenchToolBar
} from "../../../../platform/actions/browser/toolbar.js";
import {
  IMenuService,
  MenuId,
  MenuItemAction
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { registerAndCreateHistoryNavigationContext } from "../../../../platform/history/browser/contextScopedHistoryWidget.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ResourceLabels } from "../../../browser/labels.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { AccessibilityCommandId } from "../../accessibility/common/accessibilityCommands.js";
import {
  getSimpleCodeEditorWidgetOptions,
  getSimpleEditorOptions,
  setupSimpleEditorSelectionStyling
} from "../../codeEditor/browser/simpleEditorOptions.js";
import { ChatAgentLocation, IChatAgentService } from "../common/chatAgents.js";
import {
  CONTEXT_CHAT_INPUT_CURSOR_AT_TOP,
  CONTEXT_CHAT_INPUT_HAS_FOCUS,
  CONTEXT_CHAT_INPUT_HAS_TEXT,
  CONTEXT_IN_CHAT_INPUT
} from "../common/chatContextKeys.js";
import {
  IChatWidgetHistoryService
} from "../common/chatWidgetHistoryService.js";
import {
  CancelAction,
  ChatSubmitSecondaryAgentAction,
  SubmitAction
} from "./actions/chatExecuteActions.js";
import { ChatFollowups } from "./chatFollowups.js";
const $ = dom.$;
const INPUT_EDITOR_MAX_HEIGHT = 250;
let ChatInputPart = class extends Disposable {
  constructor(location, options, getInputState, historyService, modelService, instantiationService, contextKeyService, configurationService, keybindingService, accessibilityService, logService) {
    super();
    this.location = location;
    this.options = options;
    this.getInputState = getInputState;
    this.historyService = historyService;
    this.modelService = modelService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.accessibilityService = accessibilityService;
    this.logService = logService;
    this.inputEditorMaxHeight = this.options.renderStyle === "compact" ? INPUT_EDITOR_MAX_HEIGHT / 3 : INPUT_EDITOR_MAX_HEIGHT;
    this.inputEditorHasText = CONTEXT_CHAT_INPUT_HAS_TEXT.bindTo(contextKeyService);
    this.chatCursorAtTop = CONTEXT_CHAT_INPUT_CURSOR_AT_TOP.bindTo(contextKeyService);
    this.inputEditorHasFocus = CONTEXT_CHAT_INPUT_HAS_FOCUS.bindTo(contextKeyService);
    this.history = this.loadHistory();
    this._register(this.historyService.onDidClearHistory(() => this.history = new HistoryNavigator2([{ text: "" }], 50, historyKeyFn)));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(AccessibilityVerbositySettingId.Chat)) {
        this.inputEditor.updateOptions({ ariaLabel: this._getAriaLabel() });
      }
    }));
  }
  static INPUT_SCHEME = "chatSessionInput";
  static _counter = 0;
  _onDidLoadInputState = this._register(new Emitter());
  onDidLoadInputState = this._onDidLoadInputState.event;
  _onDidChangeHeight = this._register(new Emitter());
  onDidChangeHeight = this._onDidChangeHeight.event;
  _onDidFocus = this._register(new Emitter());
  onDidFocus = this._onDidFocus.event;
  _onDidBlur = this._register(new Emitter());
  onDidBlur = this._onDidBlur.event;
  _onDidChangeContext = this._register(
    new Emitter()
  );
  onDidChangeContext = this._onDidChangeContext.event;
  _onDidAcceptFollowup = this._register(
    new Emitter()
  );
  onDidAcceptFollowup = this._onDidAcceptFollowup.event;
  get attachedContext() {
    return this._attachedContext;
  }
  _indexOfLastAttachedContextDeletedWithKeyboard = -1;
  _attachedContext = /* @__PURE__ */ new Set();
  _onDidChangeVisibility = this._register(
    new Emitter()
  );
  _contextResourceLabels = this.instantiationService.createInstance(ResourceLabels, {
    onDidChangeVisibility: this._onDidChangeVisibility.event
  });
  inputEditorMaxHeight;
  inputEditorHeight = 0;
  container;
  inputSideToolbarContainer;
  followupsContainer;
  followupsDisposables = this._register(
    new DisposableStore()
  );
  attachedContextContainer;
  attachedContextDisposables = this._register(
    new DisposableStore()
  );
  _inputPartHeight = 0;
  get inputPartHeight() {
    return this._inputPartHeight;
  }
  _inputEditor;
  _inputEditorElement;
  toolbar;
  get inputEditor() {
    return this._inputEditor;
  }
  history;
  historyNavigationBackwardsEnablement;
  historyNavigationForewardsEnablement;
  inHistoryNavigation = false;
  inputModel;
  inputEditorHasText;
  chatCursorAtTop;
  inputEditorHasFocus;
  cachedDimensions;
  cachedToolbarWidth;
  inputUri = URI.parse(
    `${ChatInputPart.INPUT_SCHEME}:input-${ChatInputPart._counter++}`
  );
  loadHistory() {
    const history = this.historyService.getHistory(this.location);
    if (history.length === 0) {
      history.push({ text: "" });
    }
    return new HistoryNavigator2(history, 50, historyKeyFn);
  }
  _getAriaLabel() {
    const verbose = this.configurationService.getValue(
      AccessibilityVerbositySettingId.Chat
    );
    if (verbose) {
      const kbLabel = this.keybindingService.lookupKeybinding(AccessibilityCommandId.OpenAccessibilityHelp)?.getLabel();
      return kbLabel ? localize(
        "actions.chat.accessibiltyHelp",
        "Chat Input,  Type to ask questions or type / for topics, press enter to send out the request. Use {0} for Chat Accessibility Help.",
        kbLabel
      ) : localize(
        "chatInput.accessibilityHelpNoKb",
        "Chat Input,  Type code here and press Enter to run. Use the Chat Accessibility Help command for more information."
      );
    }
    return localize("chatInput", "Chat Input");
  }
  updateState(inputState) {
    if (this.inHistoryNavigation) {
      return;
    }
    const newEntry = {
      text: this._inputEditor.getValue(),
      state: inputState
    };
    if (this.history.isAtEnd()) {
      this.history.replaceLast(newEntry);
    } else {
      this.history.replaceLast(newEntry);
      this.history.resetCursor();
    }
  }
  initForNewChatModel(inputValue, inputState) {
    this.history = this.loadHistory();
    this.history.add({
      text: inputValue ?? this.history.current().text,
      state: inputState
    });
    if (inputValue) {
      this.setValue(inputValue, false);
    }
  }
  logInputHistory() {
    const historyStr = [...this.history].map((entry) => JSON.stringify(entry)).join("\n");
    this.logService.info(
      `[${this.location}] Chat input history:`,
      historyStr
    );
  }
  setVisible(visible) {
    this._onDidChangeVisibility.fire(visible);
  }
  get element() {
    return this.container;
  }
  showPreviousValue() {
    const inputState = this.getInputState();
    if (this.history.isAtEnd()) {
      this.saveCurrentValue(inputState);
    } else if (!this.history.has({
      text: this._inputEditor.getValue(),
      state: inputState
    })) {
      this.saveCurrentValue(inputState);
      this.history.resetCursor();
    }
    this.navigateHistory(true);
  }
  showNextValue() {
    const inputState = this.getInputState();
    if (this.history.isAtEnd()) {
      return;
    } else if (!this.history.has({
      text: this._inputEditor.getValue(),
      state: inputState
    })) {
      this.saveCurrentValue(inputState);
      this.history.resetCursor();
    }
    this.navigateHistory(false);
  }
  navigateHistory(previous) {
    const historyEntry = previous ? this.history.previous() : this.history.next();
    aria.status(historyEntry.text);
    this.inHistoryNavigation = true;
    this.setValue(historyEntry.text, true);
    this.inHistoryNavigation = false;
    this._onDidLoadInputState.fire(historyEntry.state);
    if (previous) {
      this._inputEditor.setPosition({ lineNumber: 1, column: 1 });
    } else {
      const model = this._inputEditor.getModel();
      if (!model) {
        return;
      }
      this._inputEditor.setPosition(getLastPosition(model));
    }
  }
  setValue(value, transient) {
    this.inputEditor.setValue(value);
    this.inputEditor.setPosition({
      lineNumber: 1,
      column: value.length + 1
    });
    if (!transient) {
      this.saveCurrentValue(this.getInputState());
    }
  }
  saveCurrentValue(inputState) {
    const newEntry = {
      text: this._inputEditor.getValue(),
      state: inputState
    };
    this.history.replaceLast(newEntry);
  }
  focus() {
    this._inputEditor.focus();
  }
  hasFocus() {
    return this._inputEditor.hasWidgetFocus();
  }
  /**
   * Reset the input and update history.
   * @param userQuery If provided, this will be added to the history. Followups and programmatic queries should not be passed.
   */
  async acceptInput(isUserQuery) {
    if (isUserQuery) {
      const userQuery = this._inputEditor.getValue();
      const entry = {
        text: userQuery,
        state: this.getInputState()
      };
      this.history.replaceLast(entry);
      this.history.add({ text: "" });
    }
    this._attachedContext.clear();
    this._onDidLoadInputState.fire({});
    if (this.accessibilityService.isScreenReaderOptimized() && isMacintosh) {
      this._acceptInputForVoiceover();
    } else {
      this._inputEditor.focus();
      this._inputEditor.setValue("");
    }
  }
  _acceptInputForVoiceover() {
    const domNode = this._inputEditor.getDomNode();
    if (!domNode) {
      return;
    }
    domNode.remove();
    this._inputEditor.setValue("");
    this._inputEditorElement.appendChild(domNode);
    this._inputEditor.focus();
  }
  attachContext(overwrite, ...contentReferences) {
    const removed = [];
    if (overwrite) {
      removed.push(...Array.from(this._attachedContext));
      this._attachedContext.clear();
    }
    if (contentReferences.length > 0) {
      for (const reference of contentReferences) {
        this._attachedContext.add(reference);
      }
    }
    if (removed.length > 0 || contentReferences.length > 0) {
      this.initAttachedContext(this.attachedContextContainer);
      if (!overwrite) {
        this._onDidChangeContext.fire({
          removed,
          added: contentReferences
        });
      }
    }
  }
  render(container, initialValue, widget) {
    this.container = dom.append(container, $(".interactive-input-part"));
    this.container.classList.toggle(
      "compact",
      this.options.renderStyle === "compact"
    );
    let inputContainer;
    let inputAndSideToolbar;
    if (this.options.renderStyle === "compact") {
      inputAndSideToolbar = dom.append(
        this.container,
        $(".interactive-input-and-side-toolbar")
      );
      this.followupsContainer = dom.append(
        this.container,
        $(".interactive-input-followups")
      );
      inputContainer = dom.append(
        inputAndSideToolbar,
        $(".interactive-input-and-execute-toolbar")
      );
      this.attachedContextContainer = dom.append(
        this.container,
        $(".chat-attached-context")
      );
    } else {
      this.followupsContainer = dom.append(
        this.container,
        $(".interactive-input-followups")
      );
      this.attachedContextContainer = dom.append(
        this.container,
        $(".chat-attached-context")
      );
      inputAndSideToolbar = dom.append(
        this.container,
        $(".interactive-input-and-side-toolbar")
      );
      inputContainer = dom.append(
        inputAndSideToolbar,
        $(".interactive-input-and-execute-toolbar")
      );
    }
    this.initAttachedContext(this.attachedContextContainer);
    const inputScopedContextKeyService = this._register(
      this.contextKeyService.createScoped(inputContainer)
    );
    CONTEXT_IN_CHAT_INPUT.bindTo(inputScopedContextKeyService).set(true);
    const scopedInstantiationService = this._register(
      this.instantiationService.createChild(
        new ServiceCollection([
          IContextKeyService,
          inputScopedContextKeyService
        ])
      )
    );
    const {
      historyNavigationBackwardsEnablement,
      historyNavigationForwardsEnablement
    } = this._register(
      registerAndCreateHistoryNavigationContext(
        inputScopedContextKeyService,
        this
      )
    );
    this.historyNavigationBackwardsEnablement = historyNavigationBackwardsEnablement;
    this.historyNavigationForewardsEnablement = historyNavigationForwardsEnablement;
    const options = getSimpleEditorOptions(
      this.configurationService
    );
    options.overflowWidgetsDomNode = this.options.editorOverflowWidgetsDomNode;
    options.readOnly = false;
    options.ariaLabel = this._getAriaLabel();
    options.fontFamily = DEFAULT_FONT_FAMILY;
    options.fontSize = 13;
    options.lineHeight = 20;
    options.padding = this.options.renderStyle === "compact" ? { top: 2, bottom: 2 } : { top: 8, bottom: 8 };
    options.cursorWidth = 1;
    options.wrappingStrategy = "advanced";
    options.bracketPairColorization = { enabled: false };
    options.suggest = {
      showIcons: false,
      showSnippets: false,
      showWords: true,
      showStatusBar: false,
      insertMode: "replace"
    };
    options.scrollbar = {
      ...options.scrollbar ?? {},
      vertical: "hidden"
    };
    options.stickyScroll = { enabled: false };
    this._inputEditorElement = dom.append(
      inputContainer,
      $(chatInputEditorContainerSelector)
    );
    const editorOptions = getSimpleCodeEditorWidgetOptions();
    editorOptions.contributions?.push(
      ...EditorExtensionsRegistry.getSomeEditorContributions([
        ContentHoverController.ID,
        GlyphHoverController.ID
      ])
    );
    this._inputEditor = this._register(
      scopedInstantiationService.createInstance(
        CodeEditorWidget,
        this._inputEditorElement,
        options,
        editorOptions
      )
    );
    this._register(
      this._inputEditor.onDidChangeModelContent(() => {
        const currentHeight = Math.min(
          this._inputEditor.getContentHeight(),
          this.inputEditorMaxHeight
        );
        if (currentHeight !== this.inputEditorHeight) {
          this.inputEditorHeight = currentHeight;
          this._onDidChangeHeight.fire();
        }
        const model = this._inputEditor.getModel();
        const inputHasText = !!model && model.getValue().trim().length > 0;
        this.inputEditorHasText.set(inputHasText);
      })
    );
    this._register(
      this._inputEditor.onDidFocusEditorText(() => {
        this.inputEditorHasFocus.set(true);
        this._onDidFocus.fire();
        inputContainer.classList.toggle("focused", true);
      })
    );
    this._register(
      this._inputEditor.onDidBlurEditorText(() => {
        this.inputEditorHasFocus.set(false);
        inputContainer.classList.toggle("focused", false);
        this._onDidBlur.fire();
      })
    );
    this.toolbar = this._register(
      this.instantiationService.createInstance(
        MenuWorkbenchToolBar,
        inputContainer,
        this.options.menus.executeToolbar,
        {
          telemetrySource: this.options.menus.telemetrySource,
          menuOptions: {
            shouldForwardArgs: true
          },
          hiddenItemStrategy: HiddenItemStrategy.Ignore,
          // keep it lean when hiding items and avoid a "..." overflow menu
          actionViewItemProvider: (action, options2) => {
            if (this.location === ChatAgentLocation.Panel) {
              if ((action.id === SubmitAction.ID || action.id === CancelAction.ID) && action instanceof MenuItemAction) {
                const dropdownAction = this.instantiationService.createInstance(
                  MenuItemAction,
                  {
                    id: "chat.moreExecuteActions",
                    title: localize(
                      "notebook.moreExecuteActionsLabel",
                      "More..."
                    ),
                    icon: Codicon.chevronDown
                  },
                  void 0,
                  void 0,
                  void 0,
                  void 0
                );
                return this.instantiationService.createInstance(
                  ChatSubmitDropdownActionItem,
                  action,
                  dropdownAction
                );
              }
            }
            return void 0;
          }
        }
      )
    );
    this.toolbar.getElement().classList.add("interactive-execute-toolbar");
    this.toolbar.context = { widget };
    this._register(
      this.toolbar.onDidChangeMenuItems(() => {
        if (this.cachedDimensions && typeof this.cachedToolbarWidth === "number" && this.cachedToolbarWidth !== this.toolbar.getItemsWidth()) {
          this.layout(
            this.cachedDimensions.height,
            this.cachedDimensions.width
          );
        }
      })
    );
    if (this.options.menus.inputSideToolbar) {
      const toolbarSide = this._register(
        this.instantiationService.createInstance(
          MenuWorkbenchToolBar,
          inputAndSideToolbar,
          this.options.menus.inputSideToolbar,
          {
            telemetrySource: this.options.menus.telemetrySource,
            menuOptions: {
              shouldForwardArgs: true
            }
          }
        )
      );
      this.inputSideToolbarContainer = toolbarSide.getElement();
      toolbarSide.getElement().classList.add("chat-side-toolbar");
      toolbarSide.context = {
        widget
      };
    }
    let inputModel = this.modelService.getModel(this.inputUri);
    if (!inputModel) {
      inputModel = this.modelService.createModel(
        "",
        null,
        this.inputUri,
        true
      );
      this._register(inputModel);
    }
    this.inputModel = inputModel;
    this.inputModel.updateOptions({
      bracketColorizationOptions: {
        enabled: false,
        independentColorPoolPerBracketType: false
      }
    });
    this._inputEditor.setModel(this.inputModel);
    if (initialValue) {
      this.inputModel.setValue(initialValue);
      const lineNumber = this.inputModel.getLineCount();
      this._inputEditor.setPosition({
        lineNumber,
        column: this.inputModel.getLineMaxColumn(lineNumber)
      });
    }
    const onDidChangeCursorPosition = () => {
      const model = this._inputEditor.getModel();
      if (!model) {
        return;
      }
      const position = this._inputEditor.getPosition();
      if (!position) {
        return;
      }
      const atTop = position.column === 1 && position.lineNumber === 1;
      this.chatCursorAtTop.set(atTop);
      this.historyNavigationBackwardsEnablement.set(atTop);
      this.historyNavigationForewardsEnablement.set(
        position.equals(getLastPosition(model))
      );
    };
    this._register(
      this._inputEditor.onDidChangeCursorPosition(
        (e) => onDidChangeCursorPosition()
      )
    );
    onDidChangeCursorPosition();
  }
  initAttachedContext(container, isLayout = false) {
    const oldHeight = container.offsetHeight;
    dom.clearNode(container);
    this.attachedContextDisposables.clear();
    dom.setVisibility(
      Boolean(this.attachedContext.size),
      this.attachedContextContainer
    );
    if (!this.attachedContext.size) {
      this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
    }
    [...this.attachedContext.values()].forEach((attachment, index) => {
      const widget = dom.append(
        container,
        $(".chat-attached-context-attachment.show-file-icons")
      );
      const label = this._contextResourceLabels.create(widget, {
        supportIcons: true
      });
      const file = URI.isUri(attachment.value) ? attachment.value : attachment.value && typeof attachment.value === "object" && "uri" in attachment.value && URI.isUri(attachment.value.uri) ? attachment.value.uri : void 0;
      const range = attachment.value && typeof attachment.value === "object" && "range" in attachment.value && Range.isIRange(attachment.value.range) ? attachment.value.range : void 0;
      if (file && attachment.isFile) {
        const fileBasename = basename(file.path);
        const fileDirname = dirname(file.path);
        const friendlyName = `${fileBasename} ${fileDirname}`;
        const ariaLabel = range ? localize(
          "chat.fileAttachmentWithRange",
          "Attached file, {0}, line {1} to line {2}",
          friendlyName,
          range.startLineNumber,
          range.endLineNumber
        ) : localize(
          "chat.fileAttachment",
          "Attached file, {0}",
          friendlyName
        );
        label.setFile(file, {
          fileKind: FileKind.FILE,
          hidePath: true,
          range
        });
        widget.ariaLabel = ariaLabel;
        widget.tabIndex = 0;
      } else {
        const attachmentLabel = attachment.fullName ?? attachment.name;
        const withIcon = attachment.icon?.id ? `$(${attachment.icon.id}) ${attachmentLabel}` : attachmentLabel;
        label.setLabel(withIcon, void 0);
        widget.ariaLabel = localize(
          "chat.attachment",
          "Attached context, {0}",
          attachment.name
        );
        widget.tabIndex = 0;
      }
      const clearButton = new Button(widget, { supportIcons: true });
      if (index === Math.min(
        this._indexOfLastAttachedContextDeletedWithKeyboard,
        this.attachedContext.size - 1
      )) {
        clearButton.focus();
      }
      this.attachedContextDisposables.add(clearButton);
      clearButton.icon = Codicon.close;
      const disp = clearButton.onDidClick((e) => {
        this._attachedContext.delete(attachment);
        disp.dispose();
        if (dom.isKeyboardEvent(e)) {
          const event = new StandardKeyboardEvent(e);
          if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
            this._indexOfLastAttachedContextDeletedWithKeyboard = index;
          }
        }
        this._onDidChangeHeight.fire();
        this._onDidChangeContext.fire({ removed: [attachment] });
      });
      this.attachedContextDisposables.add(disp);
    });
    if (oldHeight !== container.offsetHeight && !isLayout) {
      this._onDidChangeHeight.fire();
    }
  }
  async renderFollowups(items, response) {
    if (!this.options.renderFollowups) {
      return;
    }
    this.followupsDisposables.clear();
    dom.clearNode(this.followupsContainer);
    if (items && items.length > 0) {
      this.followupsDisposables.add(
        this.instantiationService.createInstance(
          ChatFollowups,
          this.followupsContainer,
          items,
          this.location,
          void 0,
          (followup) => this._onDidAcceptFollowup.fire({ followup, response })
        )
      );
    }
    this._onDidChangeHeight.fire();
  }
  get contentHeight() {
    const data = this.getLayoutData();
    return data.followupsHeight + data.inputPartEditorHeight + data.inputPartVerticalPadding + data.inputEditorBorder + data.implicitContextHeight;
  }
  layout(height, width) {
    this.cachedDimensions = new dom.Dimension(width, height);
    return this._layout(height, width);
  }
  previousInputEditorDimension;
  _layout(height, width, allowRecurse = true) {
    this.initAttachedContext(this.attachedContextContainer, true);
    const data = this.getLayoutData();
    const inputEditorHeight = Math.min(
      data.inputPartEditorHeight,
      height - data.followupsHeight - data.inputPartVerticalPadding
    );
    const followupsWidth = width - data.inputPartHorizontalPadding;
    this.followupsContainer.style.width = `${followupsWidth}px`;
    this._inputPartHeight = data.followupsHeight + inputEditorHeight + data.inputPartVerticalPadding + data.inputEditorBorder + data.implicitContextHeight;
    const initialEditorScrollWidth = this._inputEditor.getScrollWidth();
    const newEditorWidth = width - data.inputPartHorizontalPadding - data.editorBorder - data.editorPadding - data.executeToolbarWidth - data.sideToolbarWidth - data.toolbarPadding;
    const newDimension = {
      width: newEditorWidth,
      height: inputEditorHeight
    };
    if (!this.previousInputEditorDimension || this.previousInputEditorDimension.width !== newDimension.width || this.previousInputEditorDimension.height !== newDimension.height) {
      this._inputEditor.layout(newDimension);
      this.previousInputEditorDimension = newDimension;
    }
    if (allowRecurse && initialEditorScrollWidth < 10) {
      return this._layout(height, width, false);
    }
  }
  getLayoutData() {
    return {
      inputEditorBorder: 2,
      followupsHeight: this.followupsContainer.offsetHeight,
      inputPartEditorHeight: Math.min(
        this._inputEditor.getContentHeight(),
        this.inputEditorMaxHeight
      ),
      inputPartHorizontalPadding: this.options.renderStyle === "compact" ? 12 : 40,
      inputPartVerticalPadding: this.options.renderStyle === "compact" ? 12 : 24,
      implicitContextHeight: this.attachedContextContainer.offsetHeight,
      editorBorder: 2,
      editorPadding: 12,
      toolbarPadding: (this.toolbar.getItemsLength() - 1) * 4,
      executeToolbarWidth: this.cachedToolbarWidth = this.toolbar.getItemsWidth(),
      sideToolbarWidth: this.inputSideToolbarContainer ? dom.getTotalWidth(this.inputSideToolbarContainer) + 4 : 0
    };
  }
  saveState() {
    this.saveCurrentValue(this.getInputState());
    const inputHistory = [...this.history];
    this.historyService.saveHistory(this.location, inputHistory);
  }
};
ChatInputPart = __decorateClass([
  __decorateParam(3, IChatWidgetHistoryService),
  __decorateParam(4, IModelService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, IAccessibilityService),
  __decorateParam(10, ILogService)
], ChatInputPart);
const historyKeyFn = (entry) => JSON.stringify(entry);
function getLastPosition(model) {
  return {
    lineNumber: model.getLineCount(),
    column: model.getLineLength(model.getLineCount()) + 1
  };
}
let ChatSubmitDropdownActionItem = class extends DropdownWithPrimaryActionViewItem {
  constructor(action, dropdownAction, menuService, contextMenuService, chatAgentService, contextKeyService, keybindingService, notificationService, themeService, accessibilityService) {
    super(
      action,
      dropdownAction,
      [],
      "",
      contextMenuService,
      {
        getKeyBinding: (action2) => keybindingService.lookupKeybinding(
          action2.id,
          contextKeyService
        )
      },
      keybindingService,
      notificationService,
      contextKeyService,
      themeService,
      accessibilityService
    );
    const menu = menuService.createMenu(
      MenuId.ChatExecuteSecondary,
      contextKeyService
    );
    const setActions = () => {
      const secondary = [];
      createAndFillInActionBarActions(
        menu,
        { shouldForwardArgs: true },
        secondary
      );
      const secondaryAgent = chatAgentService.getSecondaryAgent();
      if (secondaryAgent) {
        secondary.forEach((a) => {
          if (a.id === ChatSubmitSecondaryAgentAction.ID) {
            a.label = localize(
              "chat.submitToSecondaryAgent",
              "Send to @{0}",
              secondaryAgent.name
            );
          }
          return a;
        });
      }
      this.update(dropdownAction, secondary);
    };
    setActions();
    this._register(menu.onDidChange(() => setActions()));
  }
};
ChatSubmitDropdownActionItem = __decorateClass([
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IChatAgentService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IAccessibilityService)
], ChatSubmitDropdownActionItem);
const chatInputEditorContainerSelector = ".interactive-input-editor";
setupSimpleEditorSelectionStyling(chatInputEditorContainerSelector);
export {
  ChatInputPart
};
