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
import "./media/keybindings.css";
import * as nls from "../../../../nls.js";
import { OS } from "../../../../base/common/platform.js";
import { Disposable, toDisposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { KeybindingLabel } from "../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { Widget } from "../../../../base/browser/ui/widget.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import * as dom from "../../../../base/browser/dom.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { IKeyboardEvent, StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { FastDomNode, createFastDomNode } from "../../../../base/browser/fastDomNode.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from "../../../../editor/browser/editorBrowser.js";
import { asCssVariable, editorWidgetBackground, editorWidgetForeground, widgetShadow } from "../../../../platform/theme/common/colorRegistry.js";
import { ScrollType } from "../../../../editor/common/editorCommon.js";
import { SearchWidget, SearchOptions } from "./preferencesWidgets.js";
import { Promises, timeout } from "../../../../base/common/async.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { defaultInputBoxStyles, defaultKeybindingLabelStyles } from "../../../../platform/theme/browser/defaultStyles.js";
let KeybindingsSearchWidget = class extends SearchWidget {
  static {
    __name(this, "KeybindingsSearchWidget");
  }
  _chords;
  _inputValue;
  recordDisposables = this._register(new DisposableStore());
  _onKeybinding = this._register(new Emitter());
  onKeybinding = this._onKeybinding.event;
  _onEnter = this._register(new Emitter());
  onEnter = this._onEnter.event;
  _onEscape = this._register(new Emitter());
  onEscape = this._onEscape.event;
  _onBlur = this._register(new Emitter());
  onBlur = this._onBlur.event;
  constructor(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService) {
    super(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService);
    this._register(toDisposable(() => this.stopRecordingKeys()));
    this._chords = null;
    this._inputValue = "";
  }
  clear() {
    this._chords = null;
    super.clear();
  }
  startRecordingKeys() {
    this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.KEY_DOWN, (e) => this._onKeyDown(new StandardKeyboardEvent(e))));
    this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.BLUR, () => this._onBlur.fire()));
    this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.INPUT, () => {
      this.setInputValue(this._inputValue);
    }));
  }
  stopRecordingKeys() {
    this._chords = null;
    this.recordDisposables.clear();
  }
  setInputValue(value) {
    this._inputValue = value;
    this.inputBox.value = this._inputValue;
  }
  _onKeyDown(keyboardEvent) {
    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    const options = this.options;
    if (!options.recordEnter && keyboardEvent.equals(KeyCode.Enter)) {
      this._onEnter.fire();
      return;
    }
    if (keyboardEvent.equals(KeyCode.Escape)) {
      this._onEscape.fire();
      return;
    }
    this.printKeybinding(keyboardEvent);
  }
  printKeybinding(keyboardEvent) {
    const keybinding = this.keybindingService.resolveKeyboardEvent(keyboardEvent);
    const info = `code: ${keyboardEvent.browserEvent.code}, keyCode: ${keyboardEvent.browserEvent.keyCode}, key: ${keyboardEvent.browserEvent.key} => UI: ${keybinding.getAriaLabel()}, user settings: ${keybinding.getUserSettingsLabel()}, dispatch: ${keybinding.getDispatchChords()[0]}`;
    const options = this.options;
    if (!this._chords) {
      this._chords = [];
    }
    const hasIncompleteChord = this._chords.length > 0 && this._chords[this._chords.length - 1].getDispatchChords()[0] === null;
    if (hasIncompleteChord) {
      this._chords[this._chords.length - 1] = keybinding;
    } else {
      if (this._chords.length === 2) {
        this._chords = [];
      }
      this._chords.push(keybinding);
    }
    const value = this._chords.map((keybinding2) => keybinding2.getUserSettingsLabel() || "").join(" ");
    this.setInputValue(options.quoteRecordedKeys ? `"${value}"` : value);
    this.inputBox.inputElement.title = info;
    this._onKeybinding.fire(this._chords);
  }
};
KeybindingsSearchWidget = __decorateClass([
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IKeybindingService)
], KeybindingsSearchWidget);
let DefineKeybindingWidget = class extends Widget {
  constructor(parent, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this._domNode = createFastDomNode(document.createElement("div"));
    this._domNode.setDisplay("none");
    this._domNode.setClassName("defineKeybindingWidget");
    this._domNode.setWidth(DefineKeybindingWidget.WIDTH);
    this._domNode.setHeight(DefineKeybindingWidget.HEIGHT);
    const message = nls.localize("defineKeybinding.initial", "Press desired key combination and then press ENTER.");
    dom.append(this._domNode.domNode, dom.$(".message", void 0, message));
    this._domNode.domNode.style.backgroundColor = asCssVariable(editorWidgetBackground);
    this._domNode.domNode.style.color = asCssVariable(editorWidgetForeground);
    this._domNode.domNode.style.boxShadow = `0 2px 8px ${asCssVariable(widgetShadow)}`;
    this._keybindingInputWidget = this._register(this.instantiationService.createInstance(KeybindingsSearchWidget, this._domNode.domNode, { ariaLabel: message, history: [], inputBoxStyles: defaultInputBoxStyles }));
    this._keybindingInputWidget.startRecordingKeys();
    this._register(this._keybindingInputWidget.onKeybinding((keybinding) => this.onKeybinding(keybinding)));
    this._register(this._keybindingInputWidget.onEnter(() => this.hide()));
    this._register(this._keybindingInputWidget.onEscape(() => this.clearOrHide()));
    this._register(this._keybindingInputWidget.onBlur(() => this.onCancel()));
    this._outputNode = dom.append(this._domNode.domNode, dom.$(".output"));
    this._showExistingKeybindingsNode = dom.append(this._domNode.domNode, dom.$(".existing"));
    if (parent) {
      dom.append(parent, this._domNode.domNode);
    }
  }
  static {
    __name(this, "DefineKeybindingWidget");
  }
  static WIDTH = 400;
  static HEIGHT = 110;
  _domNode;
  _keybindingInputWidget;
  _outputNode;
  _showExistingKeybindingsNode;
  _keybindingDisposables = this._register(new DisposableStore());
  _chords = null;
  _isVisible = false;
  _onHide = this._register(new Emitter());
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _onShowExistingKeybindings = this._register(new Emitter());
  onShowExistingKeybidings = this._onShowExistingKeybindings.event;
  get domNode() {
    return this._domNode.domNode;
  }
  define() {
    this._keybindingInputWidget.clear();
    return Promises.withAsyncBody(async (c) => {
      if (!this._isVisible) {
        this._isVisible = true;
        this._domNode.setDisplay("block");
        this._chords = null;
        this._keybindingInputWidget.setInputValue("");
        dom.clearNode(this._outputNode);
        dom.clearNode(this._showExistingKeybindingsNode);
        await timeout(0);
        this._keybindingInputWidget.focus();
      }
      const disposable = this._onHide.event(() => {
        c(this.getUserSettingsLabel());
        disposable.dispose();
      });
    });
  }
  layout(layout) {
    const top = Math.round((layout.height - DefineKeybindingWidget.HEIGHT) / 2);
    this._domNode.setTop(top);
    const left = Math.round((layout.width - DefineKeybindingWidget.WIDTH) / 2);
    this._domNode.setLeft(left);
  }
  printExisting(numberOfExisting) {
    if (numberOfExisting > 0) {
      const existingElement = dom.$("span.existingText");
      const text = numberOfExisting === 1 ? nls.localize("defineKeybinding.oneExists", "1 existing command has this keybinding", numberOfExisting) : nls.localize("defineKeybinding.existing", "{0} existing commands have this keybinding", numberOfExisting);
      dom.append(existingElement, document.createTextNode(text));
      aria.alert(text);
      this._showExistingKeybindingsNode.appendChild(existingElement);
      existingElement.onmousedown = (e) => {
        e.preventDefault();
      };
      existingElement.onmouseup = (e) => {
        e.preventDefault();
      };
      existingElement.onclick = () => {
        this._onShowExistingKeybindings.fire(this.getUserSettingsLabel());
      };
    }
  }
  onKeybinding(keybinding) {
    this._keybindingDisposables.clear();
    this._chords = keybinding;
    dom.clearNode(this._outputNode);
    dom.clearNode(this._showExistingKeybindingsNode);
    const firstLabel = this._keybindingDisposables.add(new KeybindingLabel(this._outputNode, OS, defaultKeybindingLabelStyles));
    firstLabel.set(this._chords?.[0] ?? void 0);
    if (this._chords) {
      for (let i = 1; i < this._chords.length; i++) {
        this._outputNode.appendChild(document.createTextNode(nls.localize("defineKeybinding.chordsTo", "chord to")));
        const chordLabel = this._keybindingDisposables.add(new KeybindingLabel(this._outputNode, OS, defaultKeybindingLabelStyles));
        chordLabel.set(this._chords[i]);
      }
    }
    const label = this.getUserSettingsLabel();
    if (label) {
      this._onDidChange.fire(label);
    }
  }
  getUserSettingsLabel() {
    let label = null;
    if (this._chords) {
      label = this._chords.map((keybinding) => keybinding.getUserSettingsLabel()).join(" ");
    }
    return label;
  }
  onCancel() {
    this._chords = null;
    this.hide();
  }
  clearOrHide() {
    if (this._chords === null) {
      this.hide();
    } else {
      this._chords = null;
      this._keybindingInputWidget.clear();
      dom.clearNode(this._outputNode);
      dom.clearNode(this._showExistingKeybindingsNode);
    }
  }
  hide() {
    this._domNode.setDisplay("none");
    this._isVisible = false;
    this._onHide.fire();
  }
};
DefineKeybindingWidget = __decorateClass([
  __decorateParam(1, IInstantiationService)
], DefineKeybindingWidget);
let DefineKeybindingOverlayWidget = class extends Disposable {
  constructor(_editor, instantiationService) {
    super();
    this._editor = _editor;
    this._widget = this._register(instantiationService.createInstance(DefineKeybindingWidget, null));
    this._editor.addOverlayWidget(this);
  }
  static {
    __name(this, "DefineKeybindingOverlayWidget");
  }
  static ID = "editor.contrib.defineKeybindingWidget";
  _widget;
  getId() {
    return DefineKeybindingOverlayWidget.ID;
  }
  getDomNode() {
    return this._widget.domNode;
  }
  getPosition() {
    return {
      preference: null
    };
  }
  dispose() {
    this._editor.removeOverlayWidget(this);
    super.dispose();
  }
  start() {
    if (this._editor.hasModel()) {
      this._editor.revealPositionInCenterIfOutsideViewport(this._editor.getPosition(), ScrollType.Smooth);
    }
    const layoutInfo = this._editor.getLayoutInfo();
    this._widget.layout(new dom.Dimension(layoutInfo.width, layoutInfo.height));
    return this._widget.define();
  }
};
DefineKeybindingOverlayWidget = __decorateClass([
  __decorateParam(1, IInstantiationService)
], DefineKeybindingOverlayWidget);
export {
  DefineKeybindingOverlayWidget,
  DefineKeybindingWidget,
  KeybindingsSearchWidget
};
//# sourceMappingURL=keybindingWidgets.js.map
