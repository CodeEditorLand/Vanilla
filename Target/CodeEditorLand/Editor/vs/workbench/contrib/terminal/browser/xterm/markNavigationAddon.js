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
import { getWindow } from "../../../../../base/browser/dom.js";
import { coalesce } from "../../../../../base/common/arrays.js";
import { timeout } from "../../../../../base/common/async.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable,
  dispose
} from "../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import {
  TerminalCapability
} from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR } from "../../common/terminalColorRegistry.js";
import { TerminalStickyScrollSettingId } from "../../../terminalContrib/stickyScroll/common/terminalStickyScrollConfiguration.js";
var Boundary = /* @__PURE__ */ ((Boundary2) => {
  Boundary2[Boundary2["Top"] = 0] = "Top";
  Boundary2[Boundary2["Bottom"] = 1] = "Bottom";
  return Boundary2;
})(Boundary || {});
var ScrollPosition = /* @__PURE__ */ ((ScrollPosition2) => {
  ScrollPosition2[ScrollPosition2["Top"] = 0] = "Top";
  ScrollPosition2[ScrollPosition2["Middle"] = 1] = "Middle";
  return ScrollPosition2;
})(ScrollPosition || {});
let MarkNavigationAddon = class extends Disposable {
  constructor(_capabilities, _configurationService, _themeService) {
    super();
    this._capabilities = _capabilities;
    this._configurationService = _configurationService;
    this._themeService = _themeService;
  }
  _currentMarker = 1 /* Bottom */;
  _selectionStart = null;
  _isDisposable = false;
  _terminal;
  _navigationDecorations;
  _activeCommandGuide;
  _commandGuideDecorations = this._register(
    new MutableDisposable()
  );
  activate(terminal) {
    this._terminal = terminal;
    this._register(
      this._terminal.onData(() => {
        this._currentMarker = 1 /* Bottom */;
      })
    );
  }
  _getMarkers(skipEmptyCommands) {
    const commandCapability = this._capabilities.get(
      TerminalCapability.CommandDetection
    );
    const partialCommandCapability = this._capabilities.get(
      TerminalCapability.PartialCommandDetection
    );
    const markCapability = this._capabilities.get(
      TerminalCapability.BufferMarkDetection
    );
    let markers = [];
    if (commandCapability) {
      markers = coalesce(
        commandCapability.commands.filter(
          (e) => skipEmptyCommands ? e.exitCode !== void 0 : true
        ).map((e) => e.promptStartMarker ?? e.marker)
      );
      if (commandCapability.currentCommand?.promptStartMarker && commandCapability.currentCommand.commandExecutedMarker) {
        markers.push(
          commandCapability.currentCommand?.promptStartMarker
        );
      }
    } else if (partialCommandCapability) {
      markers.push(...partialCommandCapability.commands);
    }
    if (markCapability && !skipEmptyCommands) {
      let next = markCapability.markers().next()?.value;
      const arr = [];
      while (next) {
        arr.push(next);
        next = markCapability.markers().next()?.value;
      }
      markers = arr;
    }
    return markers;
  }
  _findCommand(marker) {
    const commandCapability = this._capabilities.get(
      TerminalCapability.CommandDetection
    );
    if (commandCapability) {
      const command = commandCapability.commands.find(
        (e) => e.marker?.line === marker.line || e.promptStartMarker?.line === marker.line
      );
      if (command) {
        return command;
      }
      if (commandCapability.currentCommand) {
        return commandCapability.currentCommand;
      }
    }
    return void 0;
  }
  clear() {
    this._currentMarker = 1 /* Bottom */;
    this._resetNavigationDecorations();
    this._selectionStart = null;
  }
  _resetNavigationDecorations() {
    if (this._navigationDecorations) {
      dispose(this._navigationDecorations);
    }
    this._navigationDecorations = [];
  }
  _isEmptyCommand(marker) {
    if (marker === 1 /* Bottom */) {
      return true;
    }
    if (marker === 0 /* Top */) {
      return !this._getMarkers(true).map((e) => e.line).includes(0);
    }
    return !this._getMarkers(true).includes(marker);
  }
  scrollToPreviousMark(scrollPosition = 1 /* Middle */, retainSelection = false, skipEmptyCommands = true) {
    if (!this._terminal) {
      return;
    }
    if (!retainSelection) {
      this._selectionStart = null;
    }
    let markerIndex;
    const currentLineY = typeof this._currentMarker === "object" ? this.getTargetScrollLine(
      this._currentMarker.line,
      scrollPosition
    ) : Math.min(
      getLine(this._terminal, this._currentMarker),
      this._terminal.buffer.active.baseY
    );
    const viewportY = this._terminal.buffer.active.viewportY;
    if (typeof this._currentMarker === "object" ? !this._isMarkerInViewport(this._terminal, this._currentMarker) : currentLineY !== viewportY) {
      const markersBelowViewport = this._getMarkers(
        skipEmptyCommands
      ).filter((e) => e.line >= viewportY).length;
      markerIndex = this._getMarkers(skipEmptyCommands).length - markersBelowViewport - 1;
    } else if (this._currentMarker === 1 /* Bottom */) {
      markerIndex = this._getMarkers(skipEmptyCommands).length - 1;
    } else if (this._currentMarker === 0 /* Top */) {
      markerIndex = -1;
    } else if (this._isDisposable) {
      markerIndex = this._findPreviousMarker(skipEmptyCommands);
      this._currentMarker.dispose();
      this._isDisposable = false;
    } else if (skipEmptyCommands && this._isEmptyCommand(this._currentMarker)) {
      markerIndex = this._findPreviousMarker(true);
    } else {
      markerIndex = this._getMarkers(skipEmptyCommands).indexOf(
        this._currentMarker
      ) - 1;
    }
    if (markerIndex < 0) {
      this._currentMarker = 0 /* Top */;
      this._terminal.scrollToTop();
      this._resetNavigationDecorations();
      return;
    }
    this._currentMarker = this._getMarkers(skipEmptyCommands)[markerIndex];
    this._scrollToCommand(this._currentMarker, scrollPosition);
  }
  scrollToNextMark(scrollPosition = 1 /* Middle */, retainSelection = false, skipEmptyCommands = true) {
    if (!this._terminal) {
      return;
    }
    if (!retainSelection) {
      this._selectionStart = null;
    }
    let markerIndex;
    const currentLineY = typeof this._currentMarker === "object" ? this.getTargetScrollLine(
      this._currentMarker.line,
      scrollPosition
    ) : Math.min(
      getLine(this._terminal, this._currentMarker),
      this._terminal.buffer.active.baseY
    );
    const viewportY = this._terminal.buffer.active.viewportY;
    if (typeof this._currentMarker === "object" ? !this._isMarkerInViewport(this._terminal, this._currentMarker) : currentLineY !== viewportY) {
      const markersAboveViewport = this._getMarkers(
        skipEmptyCommands
      ).filter((e) => e.line <= viewportY).length;
      markerIndex = markersAboveViewport;
    } else if (this._currentMarker === 1 /* Bottom */) {
      markerIndex = this._getMarkers(skipEmptyCommands).length;
    } else if (this._currentMarker === 0 /* Top */) {
      markerIndex = 0;
    } else if (this._isDisposable) {
      markerIndex = this._findNextMarker(skipEmptyCommands);
      this._currentMarker.dispose();
      this._isDisposable = false;
    } else if (skipEmptyCommands && this._isEmptyCommand(this._currentMarker)) {
      markerIndex = this._findNextMarker(true);
    } else {
      markerIndex = this._getMarkers(skipEmptyCommands).indexOf(
        this._currentMarker
      ) + 1;
    }
    if (markerIndex >= this._getMarkers(skipEmptyCommands).length) {
      this._currentMarker = 1 /* Bottom */;
      this._terminal.scrollToBottom();
      this._resetNavigationDecorations();
      return;
    }
    this._currentMarker = this._getMarkers(skipEmptyCommands)[markerIndex];
    this._scrollToCommand(this._currentMarker, scrollPosition);
  }
  _scrollToCommand(marker, position) {
    const command = this._findCommand(marker);
    if (command) {
      this.revealCommand(command, position);
    } else {
      this._scrollToMarker(marker, position);
    }
  }
  _scrollToMarker(start, position, end, options) {
    if (!this._terminal) {
      return;
    }
    if (!this._isMarkerInViewport(this._terminal, start) || options?.forceScroll) {
      const line = this.getTargetScrollLine(toLineIndex(start), position);
      this._terminal.scrollToLine(line);
    }
    if (!options?.hideDecoration) {
      if (options?.bufferRange) {
        this._highlightBufferRange(options.bufferRange);
      } else {
        this.registerTemporaryDecoration(start, end, true);
      }
    }
  }
  _createMarkerForOffset(marker, offset) {
    if (offset === 0 && isMarker(marker)) {
      return marker;
    } else {
      const offsetMarker = this._terminal?.registerMarker(
        -this._terminal.buffer.active.cursorY + toLineIndex(marker) - this._terminal.buffer.active.baseY + offset
      );
      if (offsetMarker) {
        return offsetMarker;
      } else {
        throw new Error(
          `Could not register marker with offset ${toLineIndex(marker)}, ${offset}`
        );
      }
    }
  }
  revealCommand(command, position = 1 /* Middle */) {
    const marker = "getOutput" in command ? command.marker : command.commandStartMarker;
    if (!this._terminal || !marker) {
      return;
    }
    const line = toLineIndex(marker);
    const promptRowCount = command.getPromptRowCount();
    const commandRowCount = command.getCommandRowCount();
    this._scrollToMarker(
      line - (promptRowCount - 1),
      position,
      line + (commandRowCount - 1)
    );
  }
  revealRange(range) {
    this._scrollToMarker(
      range.start.y - 1,
      1 /* Middle */,
      range.end.y - 1,
      {
        bufferRange: range,
        // Ensure scroll shows the line when sticky scroll is enabled
        forceScroll: !!this._configurationService.getValue(
          TerminalStickyScrollSettingId.Enabled
        )
      }
    );
  }
  showCommandGuide(command) {
    if (!this._terminal) {
      return;
    }
    if (!command) {
      this._commandGuideDecorations.clear();
      this._activeCommandGuide = void 0;
      return;
    }
    if (this._activeCommandGuide === command) {
      return;
    }
    if (command.marker) {
      this._activeCommandGuide = command;
      const store = this._commandGuideDecorations.value = new DisposableStore();
      if (!command.executedMarker || !command.endMarker) {
        return;
      }
      const startLine = command.marker.line - (command.getPromptRowCount() - 1);
      const decorationCount = toLineIndex(command.endMarker) - startLine;
      if (decorationCount > 200) {
        return;
      }
      for (let i = 0; i < decorationCount; i++) {
        const decoration = this._terminal.registerDecoration({
          marker: this._createMarkerForOffset(startLine, i)
        });
        if (decoration) {
          store.add(decoration);
          let renderedElement;
          store.add(
            decoration.onRender((element) => {
              if (!renderedElement) {
                renderedElement = element;
                element.classList.add("terminal-command-guide");
                if (i === 0) {
                  element.classList.add("top");
                }
                if (i === decorationCount - 1) {
                  element.classList.add("bottom");
                }
              }
              if (this._terminal?.element) {
                element.style.marginLeft = `-${getWindow(this._terminal.element).getComputedStyle(this._terminal.element).paddingLeft}`;
              }
            })
          );
        }
      }
    }
  }
  _scrollState;
  saveScrollState() {
    this._scrollState = {
      viewportY: this._terminal?.buffer.active.viewportY ?? 0
    };
  }
  restoreScrollState() {
    if (this._scrollState && this._terminal) {
      this._terminal.scrollToLine(this._scrollState.viewportY);
      this._scrollState = void 0;
    }
  }
  _highlightBufferRange(range) {
    if (!this._terminal) {
      return;
    }
    this._resetNavigationDecorations();
    const startLine = range.start.y;
    const decorationCount = range.end.y - range.start.y + 1;
    for (let i = 0; i < decorationCount; i++) {
      const decoration = this._terminal.registerDecoration({
        marker: this._createMarkerForOffset(startLine - 1, i),
        x: range.start.x - 1,
        width: range.end.x - 1 - (range.start.x - 1) + 1,
        overviewRulerOptions: void 0
      });
      if (decoration) {
        this._navigationDecorations?.push(decoration);
        let renderedElement;
        decoration.onRender((element) => {
          if (!renderedElement) {
            renderedElement = element;
            element.classList.add("terminal-range-highlight");
          }
        });
        decoration.onDispose(() => {
          this._navigationDecorations = this._navigationDecorations?.filter(
            (d) => d !== decoration
          );
        });
      }
    }
  }
  registerTemporaryDecoration(marker, endMarker, showOutline) {
    if (!this._terminal) {
      return;
    }
    this._resetNavigationDecorations();
    const color = this._themeService.getColorTheme().getColor(TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR);
    const startLine = toLineIndex(marker);
    const decorationCount = endMarker ? toLineIndex(endMarker) - startLine + 1 : 1;
    for (let i = 0; i < decorationCount; i++) {
      const decoration = this._terminal.registerDecoration({
        marker: this._createMarkerForOffset(marker, i),
        width: this._terminal.cols,
        overviewRulerOptions: i === 0 ? {
          color: color?.toString() || "#a0a0a0cc"
        } : void 0
      });
      if (decoration) {
        this._navigationDecorations?.push(decoration);
        let renderedElement;
        decoration.onRender((element) => {
          if (renderedElement) {
            element.classList.add("terminal-scroll-highlight");
          } else {
            renderedElement = element;
            element.classList.add("terminal-scroll-highlight");
            if (showOutline) {
              element.classList.add(
                "terminal-scroll-highlight-outline"
              );
            }
            if (i === 0) {
              element.classList.add("top");
            }
            if (i === decorationCount - 1) {
              element.classList.add("bottom");
            }
          }
          if (this._terminal?.element) {
            element.style.marginLeft = `-${getWindow(this._terminal.element).getComputedStyle(this._terminal.element).paddingLeft}`;
          }
        });
        decoration.onDispose(() => {
          this._navigationDecorations = this._navigationDecorations?.filter(
            (d) => d !== decoration
          );
        });
        if (showOutline) {
          timeout(350).then(() => {
            if (renderedElement) {
              renderedElement.classList.remove(
                "terminal-scroll-highlight-outline"
              );
            }
          });
        }
      }
    }
  }
  scrollToLine(line, position) {
    this._terminal?.scrollToLine(this.getTargetScrollLine(line, position));
  }
  getTargetScrollLine(line, position) {
    if (this._terminal && position === 1 /* Middle */) {
      return Math.max(line - Math.floor(this._terminal.rows / 4), 0);
    }
    return line;
  }
  _isMarkerInViewport(terminal, marker) {
    const viewportY = terminal.buffer.active.viewportY;
    const line = toLineIndex(marker);
    return line >= viewportY && line < viewportY + terminal.rows;
  }
  scrollToClosestMarker(startMarkerId, endMarkerId, highlight) {
    const detectionCapability = this._capabilities.get(
      TerminalCapability.BufferMarkDetection
    );
    if (!detectionCapability) {
      return;
    }
    const startMarker = detectionCapability.getMark(startMarkerId);
    if (!startMarker) {
      return;
    }
    const endMarker = endMarkerId ? detectionCapability.getMark(endMarkerId) : startMarker;
    this._scrollToMarker(startMarker, 0 /* Top */, endMarker, {
      hideDecoration: !highlight
    });
  }
  selectToPreviousMark() {
    if (!this._terminal) {
      return;
    }
    if (this._selectionStart === null) {
      this._selectionStart = this._currentMarker;
    }
    if (this._capabilities.has(TerminalCapability.CommandDetection)) {
      this.scrollToPreviousMark(1 /* Middle */, true, true);
    } else {
      this.scrollToPreviousMark(1 /* Middle */, true, false);
    }
    selectLines(this._terminal, this._currentMarker, this._selectionStart);
  }
  selectToNextMark() {
    if (!this._terminal) {
      return;
    }
    if (this._selectionStart === null) {
      this._selectionStart = this._currentMarker;
    }
    if (this._capabilities.has(TerminalCapability.CommandDetection)) {
      this.scrollToNextMark(1 /* Middle */, true, true);
    } else {
      this.scrollToNextMark(1 /* Middle */, true, false);
    }
    selectLines(this._terminal, this._currentMarker, this._selectionStart);
  }
  selectToPreviousLine() {
    if (!this._terminal) {
      return;
    }
    if (this._selectionStart === null) {
      this._selectionStart = this._currentMarker;
    }
    this.scrollToPreviousLine(this._terminal, 1 /* Middle */, true);
    selectLines(this._terminal, this._currentMarker, this._selectionStart);
  }
  selectToNextLine() {
    if (!this._terminal) {
      return;
    }
    if (this._selectionStart === null) {
      this._selectionStart = this._currentMarker;
    }
    this.scrollToNextLine(this._terminal, 1 /* Middle */, true);
    selectLines(this._terminal, this._currentMarker, this._selectionStart);
  }
  scrollToPreviousLine(xterm, scrollPosition = 1 /* Middle */, retainSelection = false) {
    if (!retainSelection) {
      this._selectionStart = null;
    }
    if (this._currentMarker === 0 /* Top */) {
      xterm.scrollToTop();
      return;
    }
    if (this._currentMarker === 1 /* Bottom */) {
      this._currentMarker = this._registerMarkerOrThrow(
        xterm,
        this._getOffset(xterm) - 1
      );
    } else {
      const offset = this._getOffset(xterm);
      if (this._isDisposable) {
        this._currentMarker.dispose();
      }
      this._currentMarker = this._registerMarkerOrThrow(
        xterm,
        offset - 1
      );
    }
    this._isDisposable = true;
    this._scrollToMarker(this._currentMarker, scrollPosition);
  }
  scrollToNextLine(xterm, scrollPosition = 1 /* Middle */, retainSelection = false) {
    if (!retainSelection) {
      this._selectionStart = null;
    }
    if (this._currentMarker === 1 /* Bottom */) {
      xterm.scrollToBottom();
      return;
    }
    if (this._currentMarker === 0 /* Top */) {
      this._currentMarker = this._registerMarkerOrThrow(
        xterm,
        this._getOffset(xterm) + 1
      );
    } else {
      const offset = this._getOffset(xterm);
      if (this._isDisposable) {
        this._currentMarker.dispose();
      }
      this._currentMarker = this._registerMarkerOrThrow(
        xterm,
        offset + 1
      );
    }
    this._isDisposable = true;
    this._scrollToMarker(this._currentMarker, scrollPosition);
  }
  _registerMarkerOrThrow(xterm, cursorYOffset) {
    const marker = xterm.registerMarker(cursorYOffset);
    if (!marker) {
      throw new Error(`Could not create marker for ${cursorYOffset}`);
    }
    return marker;
  }
  _getOffset(xterm) {
    if (this._currentMarker === 1 /* Bottom */) {
      return 0;
    } else if (this._currentMarker === 0 /* Top */) {
      return 0 - (xterm.buffer.active.baseY + xterm.buffer.active.cursorY);
    } else {
      let offset = getLine(xterm, this._currentMarker);
      offset -= xterm.buffer.active.baseY + xterm.buffer.active.cursorY;
      return offset;
    }
  }
  _findPreviousMarker(skipEmptyCommands = false) {
    if (this._currentMarker === 0 /* Top */) {
      return 0;
    } else if (this._currentMarker === 1 /* Bottom */) {
      return this._getMarkers(skipEmptyCommands).length - 1;
    }
    let i;
    for (i = this._getMarkers(skipEmptyCommands).length - 1; i >= 0; i--) {
      if (this._getMarkers(skipEmptyCommands)[i].line < this._currentMarker.line) {
        return i;
      }
    }
    return -1;
  }
  _findNextMarker(skipEmptyCommands = false) {
    if (this._currentMarker === 0 /* Top */) {
      return 0;
    } else if (this._currentMarker === 1 /* Bottom */) {
      return this._getMarkers(skipEmptyCommands).length - 1;
    }
    let i;
    for (i = 0; i < this._getMarkers(skipEmptyCommands).length; i++) {
      if (this._getMarkers(skipEmptyCommands)[i].line > this._currentMarker.line) {
        return i;
      }
    }
    return this._getMarkers(skipEmptyCommands).length;
  }
};
MarkNavigationAddon = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IThemeService)
], MarkNavigationAddon);
function getLine(xterm, marker) {
  if (marker === 1 /* Bottom */) {
    return xterm.buffer.active.baseY + xterm.rows - 1;
  }
  if (marker === 0 /* Top */) {
    return 0;
  }
  return marker.line;
}
function selectLines(xterm, start, end) {
  if (end === null) {
    end = 1 /* Bottom */;
  }
  let startLine = getLine(xterm, start);
  let endLine = getLine(xterm, end);
  if (startLine > endLine) {
    const temp = startLine;
    startLine = endLine;
    endLine = temp;
  }
  endLine -= 1;
  xterm.selectLines(startLine, endLine);
}
function isMarker(value) {
  return typeof value !== "number";
}
function toLineIndex(line) {
  return isMarker(line) ? line.line : line;
}
export {
  MarkNavigationAddon,
  ScrollPosition,
  getLine,
  selectLines
};
