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
import { importAMDNodeModule } from "../../../../../amdX.js";
import * as dom from "../../../../../base/browser/dom.js";
import {
  StandardWheelEvent
} from "../../../../../base/browser/mouseEvent.js";
import { MouseWheelClassifier } from "../../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { debounce } from "../../../../../base/common/decorators.js";
import { Emitter } from "../../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import {
  AccessibilitySignal,
  IAccessibilitySignalService
} from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILayoutService } from "../../../../../platform/layout/browser/layoutService.js";
import { LogLevel } from "../../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import {
  TerminalCapability
} from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import {
  ITerminalLogService,
  TerminalSettingId
} from "../../../../../platform/terminal/common/terminal.js";
import { ShellIntegrationAddon } from "../../../../../platform/terminal/common/xterm/shellIntegrationAddon.js";
import {
  scrollbarSliderActiveBackground,
  scrollbarSliderBackground,
  scrollbarSliderHoverBackground
} from "../../../../../platform/theme/common/colorRegistry.js";
import {
  IThemeService
} from "../../../../../platform/theme/common/themeService.js";
import { PANEL_BACKGROUND } from "../../../../common/theme.js";
import {
  ansiColorIdentifiers,
  TERMINAL_BACKGROUND_COLOR,
  TERMINAL_CURSOR_BACKGROUND_COLOR,
  TERMINAL_CURSOR_FOREGROUND_COLOR,
  TERMINAL_FIND_MATCH_BACKGROUND_COLOR,
  TERMINAL_FIND_MATCH_BORDER_COLOR,
  TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR,
  TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR,
  TERMINAL_FOREGROUND_COLOR,
  TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR,
  TERMINAL_OVERVIEW_RULER_BORDER_COLOR,
  TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR,
  TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR,
  TERMINAL_SELECTION_BACKGROUND_COLOR,
  TERMINAL_SELECTION_FOREGROUND_COLOR
} from "../../common/terminalColorRegistry.js";
import { TerminalContextKeys } from "../../common/terminalContextKey.js";
import {
  ITerminalConfigurationService,
  XtermTerminalConstants
} from "../terminal.js";
import { DecorationAddon } from "./decorationAddon.js";
import { MarkNavigationAddon, ScrollPosition } from "./markNavigationAddon.js";
var RenderConstants = /* @__PURE__ */ ((RenderConstants2) => {
  RenderConstants2[RenderConstants2["SmoothScrollDuration"] = 125] = "SmoothScrollDuration";
  return RenderConstants2;
})(RenderConstants || {});
let ClipboardAddon;
let ImageAddon;
let SearchAddon;
let SerializeAddon;
let Unicode11Addon;
let WebglAddon;
function getFullBufferLineAsString(lineIndex, buffer) {
  let line = buffer.getLine(lineIndex);
  if (!line) {
    return { lineData: void 0, lineIndex };
  }
  let lineData = line.translateToString(true);
  while (lineIndex > 0 && line.isWrapped) {
    line = buffer.getLine(--lineIndex);
    if (!line) {
      break;
    }
    lineData = line.translateToString(false) + lineData;
  }
  return { lineData, lineIndex };
}
let XtermTerminal = class extends Disposable {
  /**
   * @param xtermCtor The xterm.js constructor, this is passed in so it can be fetched lazily
   * outside of this class such that {@link raw} is not nullable.
   */
  constructor(xtermCtor, cols, rows, _xtermColorProvider, _capabilities, shellIntegrationNonce, disableShellIntegrationReporting, _configurationService, _instantiationService, _logService, _notificationService, _themeService, _telemetryService, _terminalConfigurationService, _clipboardService, contextKeyService, _accessibilitySignalService, layoutService) {
    super();
    this._xtermColorProvider = _xtermColorProvider;
    this._capabilities = _capabilities;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    this._themeService = _themeService;
    this._telemetryService = _telemetryService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._clipboardService = _clipboardService;
    this._accessibilitySignalService = _accessibilitySignalService;
    const font = this._terminalConfigurationService.getFont(
      dom.getActiveWindow(),
      void 0,
      true
    );
    const config = this._terminalConfigurationService.config;
    const editorOptions = this._configurationService.getValue("editor");
    this.raw = this._register(
      new xtermCtor({
        allowProposedApi: true,
        cols,
        rows,
        documentOverride: layoutService.mainContainer.ownerDocument,
        altClickMovesCursor: config.altClickMovesCursor && editorOptions.multiCursorModifier === "alt",
        scrollback: config.scrollback,
        theme: this.getXtermTheme(),
        drawBoldTextInBrightColors: config.drawBoldTextInBrightColors,
        fontFamily: font.fontFamily,
        fontWeight: config.fontWeight,
        fontWeightBold: config.fontWeightBold,
        fontSize: font.fontSize,
        letterSpacing: font.letterSpacing,
        lineHeight: font.lineHeight,
        logLevel: vscodeToXtermLogLevel(this._logService.getLevel()),
        logger: this._logService,
        minimumContrastRatio: config.minimumContrastRatio,
        tabStopWidth: config.tabStopWidth,
        cursorBlink: config.cursorBlinking,
        cursorStyle: vscodeToXtermCursorStyle(
          config.cursorStyle
        ),
        cursorInactiveStyle: vscodeToXtermCursorStyle(
          config.cursorStyleInactive
        ),
        cursorWidth: config.cursorWidth,
        macOptionIsMeta: config.macOptionIsMeta,
        macOptionClickForcesSelection: config.macOptionClickForcesSelection,
        rightClickSelectsWord: config.rightClickBehavior === "selectWord",
        fastScrollModifier: "alt",
        fastScrollSensitivity: config.fastScrollSensitivity,
        scrollSensitivity: config.mouseWheelScrollSensitivity,
        wordSeparator: config.wordSeparators,
        overviewRuler: {
          width: 14,
          showTopBorder: true
        },
        ignoreBracketedPasteMode: config.ignoreBracketedPasteMode,
        rescaleOverlappingGlyphs: config.rescaleOverlappingGlyphs,
        windowOptions: {
          getWinSizePixels: true,
          getCellSizePixels: true,
          getWinSizeChars: true
        }
      })
    );
    this._updateSmoothScrolling();
    this._core = this.raw._core;
    this._register(
      this._configurationService.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration(TerminalSettingId.GpuAcceleration)) {
          XtermTerminal._suggestedRendererType = void 0;
        }
        if (e.affectsConfiguration("terminal.integrated") || e.affectsConfiguration("editor.fastScrollSensitivity") || e.affectsConfiguration(
          "editor.mouseWheelScrollSensitivity"
        ) || e.affectsConfiguration("editor.multiCursorModifier")) {
          this.updateConfig();
        }
        if (e.affectsConfiguration(TerminalSettingId.UnicodeVersion)) {
          this._updateUnicodeVersion();
        }
        if (e.affectsConfiguration(
          TerminalSettingId.ShellIntegrationDecorationsEnabled
        )) {
          this._updateTheme();
        }
      })
    );
    this._register(
      this._themeService.onDidColorThemeChange(
        (theme) => this._updateTheme(theme)
      )
    );
    this._register(
      this._logService.onDidChangeLogLevel(
        (e) => this.raw.options.logLevel = vscodeToXtermLogLevel(e)
      )
    );
    this._register(
      this.raw.onSelectionChange(() => {
        this._onDidChangeSelection.fire();
        if (this.isFocused) {
          this._anyFocusedTerminalHasSelection.set(
            this.raw.hasSelection()
          );
        }
      })
    );
    this._updateUnicodeVersion();
    this._markNavigationAddon = this._instantiationService.createInstance(
      MarkNavigationAddon,
      _capabilities
    );
    this.raw.loadAddon(this._markNavigationAddon);
    this._decorationAddon = this._instantiationService.createInstance(
      DecorationAddon,
      this._capabilities
    );
    this._register(
      this._decorationAddon.onDidRequestRunCommand(
        (e) => this._onDidRequestRunCommand.fire(e)
      )
    );
    this.raw.loadAddon(this._decorationAddon);
    this._shellIntegrationAddon = new ShellIntegrationAddon(
      shellIntegrationNonce,
      disableShellIntegrationReporting,
      this._telemetryService,
      this._logService
    );
    this.raw.loadAddon(this._shellIntegrationAddon);
    this._getClipboardAddonConstructor().then((ClipboardAddon2) => {
      this._clipboardAddon = this._instantiationService.createInstance(
        ClipboardAddon2,
        void 0,
        {
          async readText(type) {
            return _clipboardService.readText(
              type === "p" ? "selection" : "clipboard"
            );
          },
          async writeText(type, text) {
            return _clipboardService.writeText(
              text,
              type === "p" ? "selection" : "clipboard"
            );
          }
        }
      );
      this.raw.loadAddon(this._clipboardAddon);
    });
    this._anyTerminalFocusContextKey = TerminalContextKeys.focusInAny.bindTo(contextKeyService);
    this._anyFocusedTerminalHasSelection = TerminalContextKeys.textSelectedInFocused.bindTo(contextKeyService);
  }
  /** The raw xterm.js instance */
  raw;
  _core;
  static _suggestedRendererType = void 0;
  static _checkedWebglCompatible = false;
  _attached;
  _isPhysicalMouseWheel = MouseWheelClassifier.INSTANCE.isPhysicalMouseWheel();
  // Always on addons
  _markNavigationAddon;
  _shellIntegrationAddon;
  _decorationAddon;
  // Always on dynamicly imported addons
  _clipboardAddon;
  // Optional addons
  _searchAddon;
  _unicode11Addon;
  _webglAddon;
  _serializeAddon;
  _imageAddon;
  _attachedDisposables = this._register(
    new DisposableStore()
  );
  _anyTerminalFocusContextKey;
  _anyFocusedTerminalHasSelection;
  _lastFindResult;
  get findResult() {
    return this._lastFindResult;
  }
  get isStdinDisabled() {
    return !!this.raw.options.disableStdin;
  }
  get isGpuAccelerated() {
    return !!this._webglAddon;
  }
  _onDidRequestRunCommand = this._register(
    new Emitter()
  );
  onDidRequestRunCommand = this._onDidRequestRunCommand.event;
  _onDidRequestFocus = this._register(new Emitter());
  onDidRequestFocus = this._onDidRequestFocus.event;
  _onDidRequestSendText = this._register(
    new Emitter()
  );
  onDidRequestSendText = this._onDidRequestSendText.event;
  _onDidRequestFreePort = this._register(
    new Emitter()
  );
  onDidRequestFreePort = this._onDidRequestFreePort.event;
  _onDidRequestRefreshDimensions = this._register(
    new Emitter()
  );
  onDidRequestRefreshDimensions = this._onDidRequestRefreshDimensions.event;
  _onDidChangeFindResults = this._register(
    new Emitter()
  );
  onDidChangeFindResults = this._onDidChangeFindResults.event;
  _onDidChangeSelection = this._register(
    new Emitter()
  );
  onDidChangeSelection = this._onDidChangeSelection.event;
  _onDidChangeFocus = this._register(new Emitter());
  onDidChangeFocus = this._onDidChangeFocus.event;
  _onDidDispose = this._register(new Emitter());
  onDidDispose = this._onDidDispose.event;
  get markTracker() {
    return this._markNavigationAddon;
  }
  get shellIntegration() {
    return this._shellIntegrationAddon;
  }
  get textureAtlas() {
    const canvas = this._webglAddon?.textureAtlas;
    if (!canvas) {
      return void 0;
    }
    return createImageBitmap(canvas);
  }
  get isFocused() {
    if (!this.raw.element) {
      return false;
    }
    return dom.isAncestorOfActiveElement(this.raw.element);
  }
  *getBufferReverseIterator() {
    for (let i = this.raw.buffer.active.length; i >= 0; i--) {
      const { lineData, lineIndex } = getFullBufferLineAsString(
        i,
        this.raw.buffer.active
      );
      if (lineData) {
        i = lineIndex;
        yield lineData;
      }
    }
  }
  async getContentsAsHtml() {
    if (!this._serializeAddon) {
      const Addon = await this._getSerializeAddonConstructor();
      this._serializeAddon = new Addon();
      this.raw.loadAddon(this._serializeAddon);
    }
    return this._serializeAddon.serializeAsHTML();
  }
  async getSelectionAsHtml(command) {
    if (!this._serializeAddon) {
      const Addon = await this._getSerializeAddonConstructor();
      this._serializeAddon = new Addon();
      this.raw.loadAddon(this._serializeAddon);
    }
    if (command) {
      const length = command.getOutput()?.length;
      const row = command.marker?.line;
      if (!length || !row) {
        throw new Error(
          `No row ${row} or output length ${length} for command ${command}`
        );
      }
      this.raw.select(
        0,
        row + 1,
        length - Math.floor(length / this.raw.cols)
      );
    }
    const result = this._serializeAddon.serializeAsHTML({
      onlySelection: true
    });
    if (command) {
      this.raw.clearSelection();
    }
    return result;
  }
  attachToElement(container, partialOptions) {
    const options = {
      enableGpu: true,
      ...partialOptions
    };
    if (!this._attached) {
      this.raw.open(container);
    }
    if (options.enableGpu) {
      if (this._shouldLoadWebgl()) {
        this._enableWebglRenderer();
      }
    }
    if (!this.raw.element || !this.raw.textarea) {
      throw new Error("xterm elements not set after open");
    }
    const ad = this._attachedDisposables;
    ad.clear();
    ad.add(
      dom.addDisposableListener(
        this.raw.textarea,
        "focus",
        () => this._setFocused(true)
      )
    );
    ad.add(
      dom.addDisposableListener(
        this.raw.textarea,
        "blur",
        () => this._setFocused(false)
      )
    );
    ad.add(
      dom.addDisposableListener(
        this.raw.textarea,
        "focusout",
        () => this._setFocused(false)
      )
    );
    ad.add(
      dom.addDisposableListener(
        this.raw.element,
        dom.EventType.MOUSE_WHEEL,
        (e) => {
          const classifier = MouseWheelClassifier.INSTANCE;
          classifier.acceptStandardWheelEvent(
            new StandardWheelEvent(e)
          );
          const value = classifier.isPhysicalMouseWheel();
          if (value !== this._isPhysicalMouseWheel) {
            this._isPhysicalMouseWheel = value;
            this._updateSmoothScrolling();
          }
        },
        { passive: true }
      )
    );
    this._attached = { container, options };
    return this._attached?.container.querySelector(".xterm-screen");
  }
  _setFocused(isFocused) {
    this._onDidChangeFocus.fire(isFocused);
    this._anyTerminalFocusContextKey.set(isFocused);
    this._anyFocusedTerminalHasSelection.set(
      isFocused && this.raw.hasSelection()
    );
  }
  write(data, callback) {
    this.raw.write(data, callback);
  }
  resize(columns, rows) {
    this.raw.resize(columns, rows);
  }
  updateConfig() {
    const config = this._terminalConfigurationService.config;
    this.raw.options.altClickMovesCursor = config.altClickMovesCursor;
    this._setCursorBlink(config.cursorBlinking);
    this._setCursorStyle(config.cursorStyle);
    this._setCursorStyleInactive(config.cursorStyleInactive);
    this._setCursorWidth(config.cursorWidth);
    this.raw.options.scrollback = config.scrollback;
    this.raw.options.drawBoldTextInBrightColors = config.drawBoldTextInBrightColors;
    this.raw.options.minimumContrastRatio = config.minimumContrastRatio;
    this.raw.options.tabStopWidth = config.tabStopWidth;
    this.raw.options.fastScrollSensitivity = config.fastScrollSensitivity;
    this.raw.options.scrollSensitivity = config.mouseWheelScrollSensitivity;
    this.raw.options.macOptionIsMeta = config.macOptionIsMeta;
    const editorOptions = this._configurationService.getValue("editor");
    this.raw.options.altClickMovesCursor = config.altClickMovesCursor && editorOptions.multiCursorModifier === "alt";
    this.raw.options.macOptionClickForcesSelection = config.macOptionClickForcesSelection;
    this.raw.options.rightClickSelectsWord = config.rightClickBehavior === "selectWord";
    this.raw.options.wordSeparator = config.wordSeparators;
    this.raw.options.customGlyphs = config.customGlyphs;
    this.raw.options.ignoreBracketedPasteMode = config.ignoreBracketedPasteMode;
    this.raw.options.rescaleOverlappingGlyphs = config.rescaleOverlappingGlyphs;
    this.raw.options.overviewRuler = {
      width: 14,
      showTopBorder: true
    };
    this._updateSmoothScrolling();
    if (this._attached?.options.enableGpu) {
      if (this._shouldLoadWebgl()) {
        this._enableWebglRenderer();
      } else {
        this._disposeOfWebglRenderer();
      }
    }
  }
  _updateSmoothScrolling() {
    this.raw.options.smoothScrollDuration = this._terminalConfigurationService.config.smoothScrolling && this._isPhysicalMouseWheel ? 125 /* SmoothScrollDuration */ : 0;
  }
  _shouldLoadWebgl() {
    return this._terminalConfigurationService.config.gpuAcceleration === "auto" && XtermTerminal._suggestedRendererType === void 0 || this._terminalConfigurationService.config.gpuAcceleration === "on";
  }
  forceRedraw() {
    this.raw.clearTextureAtlas();
  }
  clearDecorations() {
    this._decorationAddon?.clearDecorations();
  }
  forceRefresh() {
    this._core.viewport?._innerRefresh();
  }
  async findNext(term, searchOptions) {
    this._updateFindColors(searchOptions);
    return (await this._getSearchAddon()).findNext(term, searchOptions);
  }
  async findPrevious(term, searchOptions) {
    this._updateFindColors(searchOptions);
    return (await this._getSearchAddon()).findPrevious(term, searchOptions);
  }
  _updateFindColors(searchOptions) {
    const theme = this._themeService.getColorTheme();
    const terminalBackground = theme.getColor(TERMINAL_BACKGROUND_COLOR) || theme.getColor(PANEL_BACKGROUND);
    const findMatchBackground = theme.getColor(
      TERMINAL_FIND_MATCH_BACKGROUND_COLOR
    );
    const findMatchBorder = theme.getColor(
      TERMINAL_FIND_MATCH_BORDER_COLOR
    );
    const findMatchOverviewRuler = theme.getColor(
      TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR
    );
    const findMatchHighlightBackground = theme.getColor(
      TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR
    );
    const findMatchHighlightBorder = theme.getColor(
      TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR
    );
    const findMatchHighlightOverviewRuler = theme.getColor(
      TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR
    );
    searchOptions.decorations = {
      activeMatchBackground: findMatchBackground?.toString(),
      activeMatchBorder: findMatchBorder?.toString() || "transparent",
      activeMatchColorOverviewRuler: findMatchOverviewRuler?.toString() || "transparent",
      // decoration bgs don't support the alpha channel so blend it with the regular bg
      matchBackground: terminalBackground ? findMatchHighlightBackground?.blend(terminalBackground).toString() : void 0,
      matchBorder: findMatchHighlightBorder?.toString() || "transparent",
      matchOverviewRuler: findMatchHighlightOverviewRuler?.toString() || "transparent"
    };
  }
  _searchAddonPromise;
  _getSearchAddon() {
    if (!this._searchAddonPromise) {
      this._searchAddonPromise = this._getSearchAddonConstructor().then(
        (AddonCtor) => {
          this._searchAddon = new AddonCtor({
            highlightLimit: XtermTerminalConstants.SearchHighlightLimit
          });
          this.raw.loadAddon(this._searchAddon);
          this._searchAddon.onDidChangeResults(
            (results) => {
              this._lastFindResult = results;
              this._onDidChangeFindResults.fire(results);
            }
          );
          return this._searchAddon;
        }
      );
    }
    return this._searchAddonPromise;
  }
  clearSearchDecorations() {
    this._searchAddon?.clearDecorations();
  }
  clearActiveSearchDecoration() {
    this._searchAddon?.clearActiveDecoration();
  }
  getFont() {
    return this._terminalConfigurationService.getFont(
      dom.getWindow(this.raw.element),
      this._core
    );
  }
  getLongestViewportWrappedLineLength() {
    let maxLineLength = 0;
    for (let i = this.raw.buffer.active.length - 1; i >= this.raw.buffer.active.viewportY; i--) {
      const lineInfo = this._getWrappedLineCount(
        i,
        this.raw.buffer.active
      );
      maxLineLength = Math.max(
        maxLineLength,
        lineInfo.lineCount * this.raw.cols - lineInfo.endSpaces || 0
      );
      i = lineInfo.currentIndex;
    }
    return maxLineLength;
  }
  _getWrappedLineCount(index, buffer) {
    let line = buffer.getLine(index);
    if (!line) {
      throw new Error("Could not get line");
    }
    let currentIndex = index;
    let endSpaces = 0;
    for (let i = Math.min(line.length, this.raw.cols) - 1; i >= 0; i--) {
      if (line?.getCell(i)?.getChars()) {
        break;
      } else {
        endSpaces++;
      }
    }
    while (line?.isWrapped && currentIndex > 0) {
      currentIndex--;
      line = buffer.getLine(currentIndex);
    }
    return { lineCount: index - currentIndex + 1, currentIndex, endSpaces };
  }
  scrollDownLine() {
    this.raw.scrollLines(1);
  }
  scrollDownPage() {
    this.raw.scrollPages(1);
  }
  scrollToBottom() {
    this.raw.scrollToBottom();
  }
  scrollUpLine() {
    this.raw.scrollLines(-1);
  }
  scrollUpPage() {
    this.raw.scrollPages(-1);
  }
  scrollToTop() {
    this.raw.scrollToTop();
  }
  scrollToLine(line, position = ScrollPosition.Top) {
    this.markTracker.scrollToLine(line, position);
  }
  clearBuffer() {
    this.raw.clear();
    this._capabilities.get(TerminalCapability.CommandDetection)?.handlePromptStart();
    this._capabilities.get(TerminalCapability.CommandDetection)?.handleCommandStart();
    this._accessibilitySignalService.playSignal(AccessibilitySignal.clear);
  }
  hasSelection() {
    return this.raw.hasSelection();
  }
  clearSelection() {
    this.raw.clearSelection();
  }
  selectMarkedRange(fromMarkerId, toMarkerId, scrollIntoView = false) {
    const detectionCapability = this.shellIntegration.capabilities.get(
      TerminalCapability.BufferMarkDetection
    );
    if (!detectionCapability) {
      return;
    }
    const start = detectionCapability.getMark(fromMarkerId);
    const end = detectionCapability.getMark(toMarkerId);
    if (start === void 0 || end === void 0) {
      return;
    }
    this.raw.selectLines(start.line, end.line);
    if (scrollIntoView) {
      this.raw.scrollToLine(start.line);
    }
  }
  selectAll() {
    this.raw.focus();
    this.raw.selectAll();
  }
  focus() {
    this.raw.focus();
  }
  async copySelection(asHtml, command) {
    if (this.hasSelection() || asHtml && command) {
      if (asHtml) {
        let listener2 = function(e) {
          if (!e.clipboardData.types.includes("text/plain")) {
            e.clipboardData.setData(
              "text/plain",
              command?.getOutput() ?? ""
            );
          }
          e.clipboardData.setData("text/html", textAsHtml);
          e.preventDefault();
        };
        var listener = listener2;
        const textAsHtml = await this.getSelectionAsHtml(command);
        const doc = dom.getDocument(this.raw.element);
        doc.addEventListener("copy", listener2);
        doc.execCommand("copy");
        doc.removeEventListener("copy", listener2);
      } else {
        await this._clipboardService.writeText(this.raw.getSelection());
      }
    } else {
      this._notificationService.warn(
        localize(
          "terminal.integrated.copySelection.noSelection",
          "The terminal has no selection to copy"
        )
      );
    }
  }
  _setCursorBlink(blink) {
    if (this.raw.options.cursorBlink !== blink) {
      this.raw.options.cursorBlink = blink;
      this.raw.refresh(0, this.raw.rows - 1);
    }
  }
  _setCursorStyle(style) {
    const mapped = vscodeToXtermCursorStyle(style);
    if (this.raw.options.cursorStyle !== mapped) {
      this.raw.options.cursorStyle = mapped;
    }
  }
  _setCursorStyleInactive(style) {
    const mapped = vscodeToXtermCursorStyle(style);
    if (this.raw.options.cursorInactiveStyle !== mapped) {
      this.raw.options.cursorInactiveStyle = mapped;
    }
  }
  _setCursorWidth(width) {
    if (this.raw.options.cursorWidth !== width) {
      this.raw.options.cursorWidth = width;
    }
  }
  async _enableWebglRenderer() {
    if (!this.raw.element || this._webglAddon) {
      return;
    }
    if (!XtermTerminal._checkedWebglCompatible) {
      XtermTerminal._checkedWebglCompatible = true;
      const checkCanvas = document.createElement("canvas");
      const checkGl = checkCanvas.getContext("webgl2");
      const debugInfo = checkGl?.getExtension(
        "WEBGL_debug_renderer_info"
      );
      if (checkGl && debugInfo) {
        const renderer = checkGl.getParameter(
          debugInfo.UNMASKED_RENDERER_WEBGL
        );
        if (renderer.startsWith(
          "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)"
        )) {
          this._disableWebglForThisSession();
          return;
        }
      }
    }
    const Addon = await this._getWebglAddonConstructor();
    this._webglAddon = new Addon();
    try {
      this.raw.loadAddon(this._webglAddon);
      this._logService.trace("Webgl was loaded");
      this._webglAddon.onContextLoss(() => {
        this._logService.info(
          `Webgl lost context, disposing of webgl renderer`
        );
        this._disposeOfWebglRenderer();
      });
      this._refreshImageAddon();
      this._onDidRequestRefreshDimensions.fire();
    } catch (e) {
      this._logService.warn(
        `Webgl could not be loaded. Falling back to the DOM renderer`,
        e
      );
      this._disableWebglForThisSession();
    }
  }
  _disableWebglForThisSession() {
    XtermTerminal._suggestedRendererType = "dom";
    this._disposeOfWebglRenderer();
  }
  async _refreshImageAddon() {
    if (this._terminalConfigurationService.config.enableImages && this._webglAddon) {
      if (!this._imageAddon) {
        const AddonCtor = await this._getImageAddonConstructor();
        this._imageAddon = new AddonCtor();
        this.raw.loadAddon(this._imageAddon);
      }
    } else {
      try {
        this._imageAddon?.dispose();
      } catch {
      }
      this._imageAddon = void 0;
    }
  }
  async _getClipboardAddonConstructor() {
    if (!ClipboardAddon) {
      ClipboardAddon = (await importAMDNodeModule("@xterm/addon-clipboard", "lib/addon-clipboard.js")).ClipboardAddon;
    }
    return ClipboardAddon;
  }
  async _getImageAddonConstructor() {
    if (!ImageAddon) {
      ImageAddon = (await importAMDNodeModule(
        "@xterm/addon-image",
        "lib/addon-image.js"
      )).ImageAddon;
    }
    return ImageAddon;
  }
  async _getSearchAddonConstructor() {
    if (!SearchAddon) {
      SearchAddon = (await importAMDNodeModule(
        "@xterm/addon-search",
        "lib/addon-search.js"
      )).SearchAddon;
    }
    return SearchAddon;
  }
  async _getUnicode11Constructor() {
    if (!Unicode11Addon) {
      Unicode11Addon = (await importAMDNodeModule("@xterm/addon-unicode11", "lib/addon-unicode11.js")).Unicode11Addon;
    }
    return Unicode11Addon;
  }
  async _getWebglAddonConstructor() {
    if (!WebglAddon) {
      WebglAddon = (await importAMDNodeModule(
        "@xterm/addon-webgl",
        "lib/addon-webgl.js"
      )).WebglAddon;
    }
    return WebglAddon;
  }
  async _getSerializeAddonConstructor() {
    if (!SerializeAddon) {
      SerializeAddon = (await importAMDNodeModule("@xterm/addon-serialize", "lib/addon-serialize.js")).SerializeAddon;
    }
    return SerializeAddon;
  }
  _disposeOfWebglRenderer() {
    try {
      this._webglAddon?.dispose();
    } catch {
    }
    this._webglAddon = void 0;
    this._refreshImageAddon();
  }
  getXtermTheme(theme) {
    if (!theme) {
      theme = this._themeService.getColorTheme();
    }
    const config = this._terminalConfigurationService.config;
    const hideOverviewRuler = ["never", "gutter"].includes(
      config.shellIntegration?.decorationsEnabled ?? ""
    );
    const foregroundColor = theme.getColor(TERMINAL_FOREGROUND_COLOR);
    const backgroundColor = this._xtermColorProvider.getBackgroundColor(theme);
    const cursorColor = theme.getColor(TERMINAL_CURSOR_FOREGROUND_COLOR) || foregroundColor;
    const cursorAccentColor = theme.getColor(TERMINAL_CURSOR_BACKGROUND_COLOR) || backgroundColor;
    const selectionBackgroundColor = theme.getColor(
      TERMINAL_SELECTION_BACKGROUND_COLOR
    );
    const selectionInactiveBackgroundColor = theme.getColor(
      TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR
    );
    const selectionForegroundColor = theme.getColor(TERMINAL_SELECTION_FOREGROUND_COLOR) || void 0;
    return {
      background: backgroundColor?.toString(),
      foreground: foregroundColor?.toString(),
      cursor: cursorColor?.toString(),
      cursorAccent: cursorAccentColor?.toString(),
      selectionBackground: selectionBackgroundColor?.toString(),
      selectionInactiveBackground: selectionInactiveBackgroundColor?.toString(),
      selectionForeground: selectionForegroundColor?.toString(),
      overviewRulerBorder: hideOverviewRuler ? "#0000" : theme.getColor(TERMINAL_OVERVIEW_RULER_BORDER_COLOR)?.toString(),
      scrollbarSliderActiveBackground: theme.getColor(scrollbarSliderActiveBackground)?.toString(),
      scrollbarSliderBackground: theme.getColor(scrollbarSliderBackground)?.toString(),
      scrollbarSliderHoverBackground: theme.getColor(scrollbarSliderHoverBackground)?.toString(),
      black: theme.getColor(ansiColorIdentifiers[0])?.toString(),
      red: theme.getColor(ansiColorIdentifiers[1])?.toString(),
      green: theme.getColor(ansiColorIdentifiers[2])?.toString(),
      yellow: theme.getColor(ansiColorIdentifiers[3])?.toString(),
      blue: theme.getColor(ansiColorIdentifiers[4])?.toString(),
      magenta: theme.getColor(ansiColorIdentifiers[5])?.toString(),
      cyan: theme.getColor(ansiColorIdentifiers[6])?.toString(),
      white: theme.getColor(ansiColorIdentifiers[7])?.toString(),
      brightBlack: theme.getColor(ansiColorIdentifiers[8])?.toString(),
      brightRed: theme.getColor(ansiColorIdentifiers[9])?.toString(),
      brightGreen: theme.getColor(ansiColorIdentifiers[10])?.toString(),
      brightYellow: theme.getColor(ansiColorIdentifiers[11])?.toString(),
      brightBlue: theme.getColor(ansiColorIdentifiers[12])?.toString(),
      brightMagenta: theme.getColor(ansiColorIdentifiers[13])?.toString(),
      brightCyan: theme.getColor(ansiColorIdentifiers[14])?.toString(),
      brightWhite: theme.getColor(ansiColorIdentifiers[15])?.toString()
    };
  }
  _updateTheme(theme) {
    this.raw.options.theme = this.getXtermTheme(theme);
  }
  refresh() {
    this._updateTheme();
    this._decorationAddon.refreshLayouts();
  }
  async _updateUnicodeVersion() {
    if (!this._unicode11Addon && this._terminalConfigurationService.config.unicodeVersion === "11") {
      const Addon = await this._getUnicode11Constructor();
      this._unicode11Addon = new Addon();
      this.raw.loadAddon(this._unicode11Addon);
    }
    if (this.raw.unicode.activeVersion !== this._terminalConfigurationService.config.unicodeVersion) {
      this.raw.unicode.activeVersion = this._terminalConfigurationService.config.unicodeVersion;
    }
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _writeText(data) {
    this.raw.write(data);
  }
  dispose() {
    this._anyTerminalFocusContextKey.reset();
    this._anyFocusedTerminalHasSelection.reset();
    this._onDidDispose.fire();
    super.dispose();
  }
};
__decorateClass([
  debounce(100)
], XtermTerminal.prototype, "_refreshImageAddon", 1);
XtermTerminal = __decorateClass([
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ITerminalLogService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IThemeService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, ITerminalConfigurationService),
  __decorateParam(14, IClipboardService),
  __decorateParam(15, IContextKeyService),
  __decorateParam(16, IAccessibilitySignalService),
  __decorateParam(17, ILayoutService)
], XtermTerminal);
function getXtermScaledDimensions(w, font, width, height) {
  if (!font.charWidth || !font.charHeight) {
    return null;
  }
  const scaledWidthAvailable = width * w.devicePixelRatio;
  const scaledCharWidth = font.charWidth * w.devicePixelRatio + font.letterSpacing;
  const cols = Math.max(
    Math.floor(scaledWidthAvailable / scaledCharWidth),
    1
  );
  const scaledHeightAvailable = height * w.devicePixelRatio;
  const scaledCharHeight = Math.ceil(font.charHeight * w.devicePixelRatio);
  const scaledLineHeight = Math.floor(scaledCharHeight * font.lineHeight);
  const rows = Math.max(
    Math.floor(scaledHeightAvailable / scaledLineHeight),
    1
  );
  return { rows, cols };
}
function vscodeToXtermLogLevel(logLevel) {
  switch (logLevel) {
    case LogLevel.Trace:
      return "trace";
    case LogLevel.Debug:
      return "debug";
    case LogLevel.Info:
      return "info";
    case LogLevel.Warning:
      return "warn";
    case LogLevel.Error:
      return "error";
    default:
      return "off";
  }
}
function vscodeToXtermCursorStyle(style) {
  if (style === "line") {
    return "bar";
  }
  return style;
}
export {
  XtermTerminal,
  getXtermScaledDimensions
};
