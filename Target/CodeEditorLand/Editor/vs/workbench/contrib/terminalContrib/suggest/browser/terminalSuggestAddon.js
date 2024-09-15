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
import * as dom from "../../../../../base/browser/dom.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import {
  Disposable,
  MutableDisposable,
  combinedDisposable
} from "../../../../../base/common/lifecycle.js";
import { sep } from "../../../../../base/common/path.js";
import { commonPrefixLength } from "../../../../../base/common/strings.js";
import { editorSuggestWidgetSelectedBackground } from "../../../../../editor/contrib/suggest/browser/suggestWidget.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../../platform/storage/common/storage.js";
import {
  TerminalCapability
} from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { ShellIntegrationOscPs } from "../../../../../platform/terminal/common/xterm/shellIntegrationAddon.js";
import { getListStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { activeContrastBorder } from "../../../../../platform/theme/common/colorRegistry.js";
import {
  SimpleCompletionItem
} from "../../../../services/suggest/browser/simpleCompletionItem.js";
import {
  LineContext,
  SimpleCompletionModel
} from "../../../../services/suggest/browser/simpleCompletionModel.js";
import {
  SimpleSuggestWidget
} from "../../../../services/suggest/browser/simpleSuggestWidget.js";
import { ITerminalConfigurationService } from "../../../terminal/browser/terminal.js";
import { TerminalStorageKeys } from "../../../terminal/common/terminalStorageKeys.js";
import {
  terminalSuggestConfigSection
} from "../common/terminalSuggestConfiguration.js";
var VSCodeSuggestOscPt = /* @__PURE__ */ ((VSCodeSuggestOscPt2) => {
  VSCodeSuggestOscPt2["Completions"] = "Completions";
  VSCodeSuggestOscPt2["CompletionsPwshCommands"] = "CompletionsPwshCommands";
  VSCodeSuggestOscPt2["CompletionsBash"] = "CompletionsBash";
  VSCodeSuggestOscPt2["CompletionsBashFirstWord"] = "CompletionsBashFirstWord";
  return VSCodeSuggestOscPt2;
})(VSCodeSuggestOscPt || {});
const pwshTypeToIconMap = {
  0: Codicon.symbolText,
  1: Codicon.history,
  2: Codicon.symbolMethod,
  3: Codicon.symbolFile,
  4: Codicon.folder,
  5: Codicon.symbolProperty,
  6: Codicon.symbolMethod,
  7: Codicon.symbolVariable,
  8: Codicon.symbolValue,
  9: Codicon.symbolVariable,
  10: Codicon.symbolNamespace,
  11: Codicon.symbolInterface,
  12: Codicon.symbolKeyword,
  13: Codicon.symbolKeyword
};
let SuggestAddon = class extends Disposable {
  constructor(_cachedPwshCommands, _capabilities, _terminalSuggestWidgetVisibleContextKey, _configurationService, _instantiationService, _terminalConfigurationService) {
    super();
    this._cachedPwshCommands = _cachedPwshCommands;
    this._capabilities = _capabilities;
    this._terminalSuggestWidgetVisibleContextKey = _terminalSuggestWidgetVisibleContextKey;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._register(
      Event.runAndSubscribe(
        Event.any(
          this._capabilities.onDidAddCapabilityType,
          this._capabilities.onDidRemoveCapabilityType
        ),
        () => {
          const commandDetection = this._capabilities.get(
            TerminalCapability.CommandDetection
          );
          if (commandDetection) {
            if (this._promptInputModel !== commandDetection.promptInputModel) {
              this._promptInputModel = commandDetection.promptInputModel;
              this._promptInputModelSubscriptions.value = combinedDisposable(
                this._promptInputModel.onDidChangeInput(
                  (e) => this._sync(e)
                ),
                this._promptInputModel.onDidFinishInput(
                  () => this.hideSuggestWidget()
                )
              );
            }
          } else {
            this._promptInputModel = void 0;
          }
        }
      )
    );
  }
  static {
    __name(this, "SuggestAddon");
  }
  _terminal;
  _promptInputModel;
  _promptInputModelSubscriptions = this._register(
    new MutableDisposable()
  );
  _mostRecentPromptInputState;
  _currentPromptInputState;
  _model;
  _container;
  _screen;
  _suggestWidget;
  _enableWidget = true;
  _pathSeparator = sep;
  _isFilteringDirectories = false;
  _mostRecentCompletion;
  _codeCompletionsRequested = false;
  _gitCompletionsRequested = false;
  // TODO: Remove these in favor of prompt input state
  _leadingLineContent;
  _cursorIndexDelta = 0;
  _lastUserDataTimestamp = 0;
  _lastAcceptedCompletionTimestamp = 0;
  _lastUserData;
  isPasting = false;
  static requestCompletionsSequence = "\x1B[24~e";
  // F12,e
  static requestGlobalCompletionsSequence = "\x1B[24~f";
  // F12,f
  static requestEnableGitCompletionsSequence = "\x1B[24~g";
  // F12,g
  static requestEnableCodeCompletionsSequence = "\x1B[24~h";
  // F12,h
  _onBell = this._register(new Emitter());
  onBell = this._onBell.event;
  _onAcceptedCompletion = this._register(
    new Emitter()
  );
  onAcceptedCompletion = this._onAcceptedCompletion.event;
  _onDidRequestCompletions = this._register(
    new Emitter()
  );
  onDidRequestCompletions = this._onDidRequestCompletions.event;
  _onDidReceiveCompletions = this._register(
    new Emitter()
  );
  onDidReceiveCompletions = this._onDidReceiveCompletions.event;
  activate(xterm) {
    this._terminal = xterm;
    this._register(
      xterm.parser.registerOscHandler(
        ShellIntegrationOscPs.VSCode,
        (data) => {
          return this._handleVSCodeSequence(data);
        }
      )
    );
    this._register(
      xterm.onData((e) => {
        this._lastUserData = e;
        this._lastUserDataTimestamp = Date.now();
      })
    );
  }
  setContainerWithOverflow(container) {
    this._container = container;
  }
  setScreen(screen) {
    this._screen = screen;
  }
  _requestCompletions() {
    if (!this._promptInputModel) {
      return;
    }
    if (this.isPasting) {
      return;
    }
    const builtinCompletionsConfig = this._configurationService.getValue(
      terminalSuggestConfigSection
    ).builtinCompletions;
    if (!this._codeCompletionsRequested && builtinCompletionsConfig.pwshCode) {
      this._onAcceptedCompletion.fire(
        SuggestAddon.requestEnableCodeCompletionsSequence
      );
      this._codeCompletionsRequested = true;
    }
    if (!this._gitCompletionsRequested && builtinCompletionsConfig.pwshGit) {
      this._onAcceptedCompletion.fire(
        SuggestAddon.requestEnableGitCompletionsSequence
      );
      this._gitCompletionsRequested = true;
    }
    if (this._cachedPwshCommands.size === 0) {
      this._requestGlobalCompletions();
    }
    if (this._lastUserDataTimestamp > this._lastAcceptedCompletionTimestamp) {
      this._onAcceptedCompletion.fire(
        SuggestAddon.requestCompletionsSequence
      );
      this._onDidRequestCompletions.fire();
    }
  }
  _requestGlobalCompletions() {
    this._onAcceptedCompletion.fire(
      SuggestAddon.requestGlobalCompletionsSequence
    );
  }
  _sync(promptInputState) {
    const config = this._configurationService.getValue(
      terminalSuggestConfigSection
    );
    if (!this._mostRecentPromptInputState || promptInputState.cursorIndex > this._mostRecentPromptInputState.cursorIndex) {
      let sent = false;
      if (!this._terminalSuggestWidgetVisibleContextKey.get()) {
        if (config.quickSuggestions) {
          if (promptInputState.cursorIndex === 1 || promptInputState.prefix.match(/([\s[])[^\s]$/)) {
            if (!this._lastUserData?.match(/^\x1b[[O]?[A-D]$/)) {
              this._requestCompletions();
              sent = true;
            }
          }
        }
      }
      if (config.suggestOnTriggerCharacters && !sent) {
        const prefix = promptInputState.prefix;
        if (
          // Only trigger on `-` if it's after a space. This is required to not clear
          // completions when typing the `-` in `git cherry-pick`
          prefix?.match(/\s[-]$/) || // Only trigger on `\` and `/` if it's a directory. Not doing so causes problems
          // with git branches in particular
          this._isFilteringDirectories && prefix?.match(/[\\/]$/)
        ) {
          this._requestCompletions();
          sent = true;
        }
      }
    }
    this._mostRecentPromptInputState = promptInputState;
    if (!this._promptInputModel || !this._terminal || !this._suggestWidget || this._leadingLineContent === void 0) {
      return;
    }
    this._currentPromptInputState = promptInputState;
    if (this._currentPromptInputState.cursorIndex > 1 && this._currentPromptInputState.value.at(
      this._currentPromptInputState.cursorIndex - 1
    ) === " ") {
      this.hideSuggestWidget();
      return;
    }
    if (this._currentPromptInputState.cursorIndex < this._replacementIndex + this._replacementLength) {
      this.hideSuggestWidget();
      return;
    }
    if (this._terminalSuggestWidgetVisibleContextKey.get()) {
      this._cursorIndexDelta = this._currentPromptInputState.cursorIndex - (this._replacementIndex + this._replacementLength);
      let normalizedLeadingLineContent = this._currentPromptInputState.value.substring(
        this._replacementIndex,
        this._replacementIndex + this._replacementLength + this._cursorIndexDelta
      );
      if (this._isFilteringDirectories) {
        normalizedLeadingLineContent = normalizePathSeparator(
          normalizedLeadingLineContent,
          this._pathSeparator
        );
      }
      const lineContext = new LineContext(
        normalizedLeadingLineContent,
        this._cursorIndexDelta
      );
      this._suggestWidget.setLineContext(lineContext);
    }
    if (!this._suggestWidget.hasCompletions()) {
      this.hideSuggestWidget();
      return;
    }
    const dimensions = this._getTerminalDimensions();
    if (!dimensions.width || !dimensions.height) {
      return;
    }
    const xtermBox = this._screen.getBoundingClientRect();
    this._suggestWidget.showSuggestions(0, false, false, {
      left: xtermBox.left + this._terminal.buffer.active.cursorX * dimensions.width,
      top: xtermBox.top + this._terminal.buffer.active.cursorY * dimensions.height,
      height: dimensions.height
    });
  }
  _handleVSCodeSequence(data) {
    if (!this._terminal) {
      return false;
    }
    const [command, ...args] = data.split(";");
    switch (command) {
      case "Completions" /* Completions */:
        this._handleCompletionsSequence(
          this._terminal,
          data,
          command,
          args
        );
        return true;
      case "CompletionsBash" /* CompletionsBash */:
        this._handleCompletionsBashSequence(
          this._terminal,
          data,
          command,
          args
        );
        return true;
      case "CompletionsBashFirstWord" /* CompletionsBashFirstWord */:
        return this._handleCompletionsBashFirstWordSequence(
          this._terminal,
          data,
          command,
          args
        );
    }
    return false;
  }
  _replacementIndex = 0;
  _replacementLength = 0;
  _handleCompletionsSequence(terminal, data, command, args) {
    this._onDidReceiveCompletions.fire();
    if (!terminal.element || !this._enableWidget || !this._promptInputModel) {
      return;
    }
    if (!dom.isAncestorOfActiveElement(terminal.element)) {
      return;
    }
    let replacementIndex = 0;
    let replacementLength = this._promptInputModel.cursorIndex;
    this._currentPromptInputState = {
      value: this._promptInputModel.value,
      prefix: this._promptInputModel.prefix,
      suffix: this._promptInputModel.suffix,
      cursorIndex: this._promptInputModel.cursorIndex,
      ghostTextIndex: this._promptInputModel.ghostTextIndex
    };
    this._leadingLineContent = this._currentPromptInputState.prefix.substring(
      replacementIndex,
      replacementIndex + replacementLength + this._cursorIndexDelta
    );
    const payload = data.slice(
      command.length + args[0].length + args[1].length + args[2].length + 4
    );
    const rawCompletions = args.length === 0 || payload.length === 0 ? void 0 : JSON.parse(payload);
    const completions = parseCompletionsFromShell(rawCompletions);
    const firstChar = this._leadingLineContent.length === 0 ? "" : this._leadingLineContent[0];
    if (this._leadingLineContent.includes(" ") || firstChar === "[") {
      replacementIndex = Number.parseInt(args[0]);
      replacementLength = Number.parseInt(args[1]);
      this._leadingLineContent = this._promptInputModel.prefix;
    } else {
      completions.push(...this._cachedPwshCommands);
    }
    this._replacementIndex = replacementIndex;
    this._replacementLength = replacementLength;
    if (this._mostRecentCompletion?.isDirectory && completions.every((e) => e.completion.isDirectory)) {
      completions.push(
        new SimpleCompletionItem(this._mostRecentCompletion)
      );
    }
    this._mostRecentCompletion = void 0;
    this._cursorIndexDelta = this._currentPromptInputState.cursorIndex - (replacementIndex + replacementLength);
    let normalizedLeadingLineContent = this._leadingLineContent;
    this._isFilteringDirectories = completions.some(
      (e) => e.completion.isDirectory
    );
    if (this._isFilteringDirectories) {
      const firstDir = completions.find((e) => e.completion.isDirectory);
      this._pathSeparator = firstDir?.completion.label.match(/(?<sep>[\\/])/)?.groups?.sep ?? sep;
      normalizedLeadingLineContent = normalizePathSeparator(
        normalizedLeadingLineContent,
        this._pathSeparator
      );
    }
    const lineContext = new LineContext(
      normalizedLeadingLineContent,
      this._cursorIndexDelta
    );
    const model = new SimpleCompletionModel(
      completions,
      lineContext,
      replacementIndex,
      replacementLength
    );
    this._handleCompletionModel(model);
  }
  // TODO: These aren't persisted across reloads
  // TODO: Allow triggering anywhere in the first word based on the cached completions
  _cachedBashAliases = /* @__PURE__ */ new Set();
  _cachedBashBuiltins = /* @__PURE__ */ new Set();
  _cachedBashCommands = /* @__PURE__ */ new Set();
  _cachedBashKeywords = /* @__PURE__ */ new Set();
  _cachedFirstWord;
  _handleCompletionsBashFirstWordSequence(terminal, data, command, args) {
    const type = args[0];
    const completionList = data.slice(
      command.length + type.length + 2
      /*semi-colons*/
    ).split(";");
    let set;
    switch (type) {
      case "alias":
        set = this._cachedBashAliases;
        break;
      case "builtin":
        set = this._cachedBashBuiltins;
        break;
      case "command":
        set = this._cachedBashCommands;
        break;
      case "keyword":
        set = this._cachedBashKeywords;
        break;
      default:
        return false;
    }
    set.clear();
    const distinctLabels = /* @__PURE__ */ new Set();
    for (const label of completionList) {
      distinctLabels.add(label);
    }
    for (const label of distinctLabels) {
      set.add(
        new SimpleCompletionItem({
          label,
          icon: Codicon.symbolString,
          detail: type
        })
      );
    }
    this._cachedFirstWord = void 0;
    return true;
  }
  _handleCompletionsBashSequence(terminal, data, command, args) {
    if (!terminal.element) {
      return;
    }
    let replacementIndex = Number.parseInt(args[0]);
    const replacementLength = Number.parseInt(args[1]);
    if (!args[2]) {
      this._onBell.fire();
      return;
    }
    const completionList = data.slice(
      command.length + args[0].length + args[1].length + args[2].length + 4
    ).split(";");
    let completions;
    if (replacementIndex !== 100 && completionList.length > 0) {
      completions = completionList.map((label) => {
        return new SimpleCompletionItem({
          label,
          icon: Codicon.symbolProperty
        });
      });
    } else {
      replacementIndex = 0;
      if (!this._cachedFirstWord) {
        this._cachedFirstWord = [
          ...this._cachedBashAliases,
          ...this._cachedBashBuiltins,
          ...this._cachedBashCommands,
          ...this._cachedBashKeywords
        ];
        this._cachedFirstWord.sort((a, b) => {
          const aCode = a.completion.label.charCodeAt(0);
          const bCode = b.completion.label.charCodeAt(0);
          const isANonAlpha = aCode < 65 || aCode > 90 && aCode < 97 || aCode > 122 ? 1 : 0;
          const isBNonAlpha = bCode < 65 || bCode > 90 && bCode < 97 || bCode > 122 ? 1 : 0;
          if (isANonAlpha !== isBNonAlpha) {
            return isANonAlpha - isBNonAlpha;
          }
          return a.completion.label.localeCompare(b.completion.label);
        });
      }
      completions = this._cachedFirstWord;
    }
    if (completions.length === 0) {
      return;
    }
    this._leadingLineContent = completions[0].completion.label.slice(
      0,
      replacementLength
    );
    const model = new SimpleCompletionModel(
      completions,
      new LineContext(this._leadingLineContent, replacementIndex),
      replacementIndex,
      replacementLength
    );
    if (completions.length === 1) {
      const insertText = completions[0].completion.label.substring(replacementLength);
      if (insertText.length === 0) {
        this._onBell.fire();
        return;
      }
    }
    this._handleCompletionModel(model);
  }
  _getTerminalDimensions() {
    const cssCellDims = this._terminal._core._renderService.dimensions.css.cell;
    return {
      width: cssCellDims.width,
      height: cssCellDims.height
    };
  }
  _handleCompletionModel(model) {
    if (!this._terminal?.element) {
      return;
    }
    const suggestWidget = this._ensureSuggestWidget(this._terminal);
    suggestWidget.setCompletionModel(model);
    if (model.items.length === 0 || !this._promptInputModel) {
      return;
    }
    this._model = model;
    const dimensions = this._getTerminalDimensions();
    if (!dimensions.width || !dimensions.height) {
      return;
    }
    const xtermBox = this._screen.getBoundingClientRect();
    suggestWidget.showSuggestions(0, false, false, {
      left: xtermBox.left + this._terminal.buffer.active.cursorX * dimensions.width,
      top: xtermBox.top + this._terminal.buffer.active.cursorY * dimensions.height,
      height: dimensions.height
    });
  }
  _ensureSuggestWidget(terminal) {
    this._terminalSuggestWidgetVisibleContextKey.set(true);
    if (!this._suggestWidget) {
      const c = this._terminalConfigurationService.config;
      const font = this._terminalConfigurationService.getFont(
        dom.getActiveWindow()
      );
      const fontInfo = {
        fontFamily: font.fontFamily,
        fontSize: font.fontSize,
        lineHeight: Math.ceil(1.5 * font.fontSize),
        fontWeight: c.fontWeight.toString(),
        letterSpacing: font.letterSpacing
      };
      this._suggestWidget = this._register(
        this._instantiationService.createInstance(
          SimpleSuggestWidget,
          this._container,
          this._instantiationService.createInstance(
            PersistedWidgetSize
          ),
          () => fontInfo,
          {}
        )
      );
      this._suggestWidget.list.style(
        getListStyles({
          listInactiveFocusBackground: editorSuggestWidgetSelectedBackground,
          listInactiveFocusOutline: activeContrastBorder
        })
      );
      this._register(
        this._suggestWidget.onDidSelect(
          async (e) => this.acceptSelectedSuggestion(e)
        )
      );
      this._register(
        this._suggestWidget.onDidHide(
          () => this._terminalSuggestWidgetVisibleContextKey.set(false)
        )
      );
      this._register(
        this._suggestWidget.onDidShow(
          () => this._terminalSuggestWidgetVisibleContextKey.set(true)
        )
      );
    }
    return this._suggestWidget;
  }
  selectPreviousSuggestion() {
    this._suggestWidget?.selectPrevious();
  }
  selectPreviousPageSuggestion() {
    this._suggestWidget?.selectPreviousPage();
  }
  selectNextSuggestion() {
    this._suggestWidget?.selectNext();
  }
  selectNextPageSuggestion() {
    this._suggestWidget?.selectNextPage();
  }
  acceptSelectedSuggestion(suggestion, respectRunOnEnter) {
    if (!suggestion) {
      suggestion = this._suggestWidget?.getFocusedItem();
    }
    const initialPromptInputState = this._mostRecentPromptInputState;
    if (!suggestion || !initialPromptInputState || !this._leadingLineContent || !this._model) {
      return;
    }
    this._lastAcceptedCompletionTimestamp = Date.now();
    this._suggestWidget?.hide();
    const currentPromptInputState = this._currentPromptInputState ?? initialPromptInputState;
    const replacementText = currentPromptInputState.value.substring(
      this._model.replacementIndex,
      currentPromptInputState.cursorIndex
    );
    let rightSideReplacementText = "";
    if (
      // The line didn't end with ghost text
      (currentPromptInputState.ghostTextIndex === -1 || currentPromptInputState.ghostTextIndex > currentPromptInputState.cursorIndex) && // There is more than one charatcer
      currentPromptInputState.value.length > currentPromptInputState.cursorIndex + 1 && // THe next character is not a space
      currentPromptInputState.value.at(
        currentPromptInputState.cursorIndex
      ) !== " "
    ) {
      const spaceIndex = currentPromptInputState.value.substring(
        currentPromptInputState.cursorIndex,
        currentPromptInputState.ghostTextIndex === -1 ? void 0 : currentPromptInputState.ghostTextIndex
      ).indexOf(" ");
      rightSideReplacementText = currentPromptInputState.value.substring(
        currentPromptInputState.cursorIndex,
        spaceIndex === -1 ? void 0 : currentPromptInputState.cursorIndex + spaceIndex
      );
    }
    const completion = suggestion.item.completion;
    const completionText = completion.label;
    let runOnEnter = false;
    if (respectRunOnEnter) {
      const runOnEnterConfig = this._configurationService.getValue(
        terminalSuggestConfigSection
      ).runOnEnter;
      switch (runOnEnterConfig) {
        case "always": {
          runOnEnter = true;
          break;
        }
        case "exactMatch": {
          runOnEnter = replacementText.toLowerCase() === completionText.toLowerCase();
          break;
        }
        case "exactMatchIgnoreExtension": {
          runOnEnter = replacementText.toLowerCase() === completionText.toLowerCase();
          if (completion.isFile) {
            runOnEnter ||= replacementText.toLowerCase() === completionText.toLowerCase().replace(/\.[^.]+$/, "");
          }
          break;
        }
      }
    }
    if (completion.icon === Codicon.folder) {
      this._lastAcceptedCompletionTimestamp = 0;
    }
    this._mostRecentCompletion = completion;
    const commonPrefixLen = commonPrefixLength(
      replacementText,
      completion.label
    );
    const commonPrefix = replacementText.substring(
      replacementText.length - 1 - commonPrefixLen,
      replacementText.length - 1
    );
    const completionSuffix = completion.label.substring(commonPrefixLen);
    let resultSequence;
    if (currentPromptInputState.suffix.length > 0 && currentPromptInputState.prefix.endsWith(commonPrefix) && currentPromptInputState.suffix.startsWith(completionSuffix)) {
      resultSequence = "\x1BOC".repeat(
        completion.label.length - commonPrefixLen
      );
    } else {
      resultSequence = [
        // Backspace (left) to remove all additional input
        "\x7F".repeat(replacementText.length - commonPrefixLen),
        // Delete (right) to remove any additional text in the same word
        "\x1B[3~".repeat(rightSideReplacementText.length),
        // Write the completion
        completionSuffix,
        // Run on enter if needed
        runOnEnter ? "\r" : ""
      ].join("");
    }
    this._onAcceptedCompletion.fire(resultSequence);
    this.hideSuggestWidget();
  }
  hideSuggestWidget() {
    this._currentPromptInputState = void 0;
    this._leadingLineContent = void 0;
    this._suggestWidget?.hide();
  }
};
SuggestAddon = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITerminalConfigurationService)
], SuggestAddon);
let PersistedWidgetSize = class {
  constructor(_storageService) {
    this._storageService = _storageService;
  }
  static {
    __name(this, "PersistedWidgetSize");
  }
  _key = TerminalStorageKeys.TerminalSuggestSize;
  restore() {
    const raw = this._storageService.get(this._key, StorageScope.PROFILE) ?? "";
    try {
      const obj = JSON.parse(raw);
      if (dom.Dimension.is(obj)) {
        return dom.Dimension.lift(obj);
      }
    } catch {
    }
    return void 0;
  }
  store(size) {
    this._storageService.store(
      this._key,
      JSON.stringify(size),
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
  }
  reset() {
    this._storageService.remove(this._key, StorageScope.PROFILE);
  }
};
PersistedWidgetSize = __decorateClass([
  __decorateParam(0, IStorageService)
], PersistedWidgetSize);
function parseCompletionsFromShell(rawCompletions) {
  if (!rawCompletions) {
    return [];
  }
  let typedRawCompletions;
  if (Array.isArray(rawCompletions)) {
    if (rawCompletions.length === 0) {
      return [];
    }
    if (typeof rawCompletions[0] === "string") {
      typedRawCompletions = [
        rawCompletions
      ].map((e) => ({
        CompletionText: e[0],
        ResultType: e[1],
        ToolTip: e[2],
        CustomIcon: e[3]
      }));
    } else if (Array.isArray(rawCompletions[0])) {
      typedRawCompletions = rawCompletions.map((e) => ({
        CompletionText: e[0],
        ResultType: e[1],
        ToolTip: e[2],
        CustomIcon: e[3]
      }));
    } else {
      typedRawCompletions = rawCompletions;
    }
  } else {
    typedRawCompletions = [rawCompletions];
  }
  return typedRawCompletions.map(
    (e) => rawCompletionToSimpleCompletionItem(e)
  );
}
__name(parseCompletionsFromShell, "parseCompletionsFromShell");
function rawCompletionToSimpleCompletionItem(rawCompletion) {
  let label = rawCompletion.CompletionText;
  if (rawCompletion.ResultType === 4 && !label.match(/^[-+]$/) && // Don't add a `/` to `-` or `+` (navigate location history)
  !label.match(/^\.\.?$/) && !label.match(/[\\/]$/)) {
    const separator = label.match(/(?<sep>[\\/])/)?.groups?.sep ?? sep;
    label = label + separator;
  }
  const detail = rawCompletion.ToolTip ?? label;
  const icon = getIcon(rawCompletion.ResultType, rawCompletion.CustomIcon);
  const isExecutable = rawCompletion.ResultType === 2 && rawCompletion.CompletionText.match(/\.[a-z0-9]{2,4}$/i);
  if (isExecutable) {
    rawCompletion.ResultType = 3;
  }
  return new SimpleCompletionItem({
    label,
    icon,
    detail,
    isFile: rawCompletion.ResultType === 3,
    isDirectory: rawCompletion.ResultType === 4,
    isKeyword: rawCompletion.ResultType === 12
  });
}
__name(rawCompletionToSimpleCompletionItem, "rawCompletionToSimpleCompletionItem");
function getIcon(resultType, customIconId) {
  if (customIconId) {
    const icon = customIconId in Codicon ? Codicon[customIconId] : Codicon.symbolText;
    if (icon) {
      return icon;
    }
  }
  return pwshTypeToIconMap[resultType] ?? Codicon.symbolText;
}
__name(getIcon, "getIcon");
function normalizePathSeparator(path, sep2) {
  if (sep2 === "/") {
    return path.replaceAll("\\", "/");
  }
  return path.replaceAll("/", "\\");
}
__name(normalizePathSeparator, "normalizePathSeparator");
export {
  SuggestAddon,
  VSCodeSuggestOscPt,
  parseCompletionsFromShell
};
//# sourceMappingURL=terminalSuggestAddon.js.map
