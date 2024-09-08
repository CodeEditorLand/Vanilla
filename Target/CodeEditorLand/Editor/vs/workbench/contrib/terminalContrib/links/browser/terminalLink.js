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
import * as dom from "../../../../../base/browser/dom.js";
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { Emitter } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { isMacintosh } from "../../../../../base/common/platform.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { convertBufferRangeToViewport } from "./terminalLinkHelpers.js";
let TerminalLink = class extends DisposableStore {
  constructor(_xterm, range, text, uri, parsedLink, actions, _viewportY, _activateCallback, _tooltipCallback, _isHighConfidenceLink, label, _type, _configurationService) {
    super();
    this._xterm = _xterm;
    this.range = range;
    this.text = text;
    this.uri = uri;
    this.parsedLink = parsedLink;
    this.actions = actions;
    this._viewportY = _viewportY;
    this._activateCallback = _activateCallback;
    this._tooltipCallback = _tooltipCallback;
    this._isHighConfidenceLink = _isHighConfidenceLink;
    this.label = label;
    this._type = _type;
    this._configurationService = _configurationService;
    this.decorations = {
      pointerCursor: false,
      underline: this._isHighConfidenceLink
    };
  }
  decorations;
  asyncActivate;
  _tooltipScheduler;
  _hoverListeners;
  _onInvalidated = new Emitter();
  get onInvalidated() {
    return this._onInvalidated.event;
  }
  get type() {
    return this._type;
  }
  dispose() {
    super.dispose();
    this._hoverListeners?.dispose();
    this._hoverListeners = void 0;
    this._tooltipScheduler?.dispose();
    this._tooltipScheduler = void 0;
  }
  activate(event, text) {
    this.asyncActivate = this._activateCallback(event, text);
  }
  hover(event, text) {
    const w = dom.getWindow(event);
    const d = w.document;
    this._hoverListeners = new DisposableStore();
    this._hoverListeners.add(
      dom.addDisposableListener(d, "keydown", (e) => {
        if (!e.repeat && this._isModifierDown(e)) {
          this._enableDecorations();
        }
      })
    );
    this._hoverListeners.add(
      dom.addDisposableListener(d, "keyup", (e) => {
        if (!e.repeat && !this._isModifierDown(e)) {
          this._disableDecorations();
        }
      })
    );
    this._hoverListeners.add(
      this._xterm.onRender((e) => {
        const viewportRangeY = this.range.start.y - this._viewportY;
        if (viewportRangeY >= e.start && viewportRangeY <= e.end) {
          this._onInvalidated.fire();
        }
      })
    );
    if (this._isHighConfidenceLink) {
      this._tooltipScheduler = new RunOnceScheduler(() => {
        this._tooltipCallback(
          this,
          convertBufferRangeToViewport(this.range, this._viewportY),
          this._isHighConfidenceLink ? () => this._enableDecorations() : void 0,
          this._isHighConfidenceLink ? () => this._disableDecorations() : void 0
        );
        this._tooltipScheduler?.dispose();
        this._tooltipScheduler = void 0;
      }, this._configurationService.getValue("workbench.hover.delay"));
      this.add(this._tooltipScheduler);
      this._tooltipScheduler.schedule();
    }
    const origin = { x: event.pageX, y: event.pageY };
    this._hoverListeners.add(
      dom.addDisposableListener(d, dom.EventType.MOUSE_MOVE, (e) => {
        if (this._isModifierDown(e)) {
          this._enableDecorations();
        } else {
          this._disableDecorations();
        }
        if (Math.abs(e.pageX - origin.x) > w.devicePixelRatio * 2 || Math.abs(e.pageY - origin.y) > w.devicePixelRatio * 2) {
          origin.x = e.pageX;
          origin.y = e.pageY;
          this._tooltipScheduler?.schedule();
        }
      })
    );
  }
  leave() {
    this._hoverListeners?.dispose();
    this._hoverListeners = void 0;
    this._tooltipScheduler?.dispose();
    this._tooltipScheduler = void 0;
  }
  _enableDecorations() {
    if (!this.decorations.pointerCursor) {
      this.decorations.pointerCursor = true;
    }
    if (!this.decorations.underline) {
      this.decorations.underline = true;
    }
  }
  _disableDecorations() {
    if (this.decorations.pointerCursor) {
      this.decorations.pointerCursor = false;
    }
    if (this.decorations.underline !== this._isHighConfidenceLink) {
      this.decorations.underline = this._isHighConfidenceLink;
    }
  }
  _isModifierDown(event) {
    const multiCursorModifier = this._configurationService.getValue("editor.multiCursorModifier");
    if (multiCursorModifier === "ctrlCmd") {
      return !!event.altKey;
    }
    return isMacintosh ? event.metaKey : event.ctrlKey;
  }
};
TerminalLink = __decorateClass([
  __decorateParam(12, IConfigurationService)
], TerminalLink);
export {
  TerminalLink
};
