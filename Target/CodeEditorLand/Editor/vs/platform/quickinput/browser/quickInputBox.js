var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { FindInput } from "../../../base/browser/ui/findinput/findInput.js";
import { IInputBoxStyles, IRange, MessageType } from "../../../base/browser/ui/inputbox/inputBox.js";
import { IToggleStyles, Toggle } from "../../../base/browser/ui/toggle/toggle.js";
import { Disposable, IDisposable } from "../../../base/common/lifecycle.js";
import Severity from "../../../base/common/severity.js";
import "./media/quickInput.css";
const $ = dom.$;
class QuickInputBox extends Disposable {
  constructor(parent, inputBoxStyles, toggleStyles) {
    super();
    this.parent = parent;
    this.container = dom.append(this.parent, $(".quick-input-box"));
    this.findInput = this._register(new FindInput(this.container, void 0, { label: "", inputBoxStyles, toggleStyles }));
    const input = this.findInput.inputBox.inputElement;
    input.role = "combobox";
    input.ariaHasPopup = "menu";
    input.ariaAutoComplete = "list";
    input.ariaExpanded = "true";
  }
  static {
    __name(this, "QuickInputBox");
  }
  container;
  findInput;
  onKeyDown = /* @__PURE__ */ __name((handler) => {
    return dom.addStandardDisposableListener(this.findInput.inputBox.inputElement, dom.EventType.KEY_DOWN, handler);
  }, "onKeyDown");
  onMouseDown = /* @__PURE__ */ __name((handler) => {
    return dom.addStandardDisposableListener(this.findInput.inputBox.inputElement, dom.EventType.MOUSE_DOWN, handler);
  }, "onMouseDown");
  onDidChange = /* @__PURE__ */ __name((handler) => {
    return this.findInput.onDidChange(handler);
  }, "onDidChange");
  get value() {
    return this.findInput.getValue();
  }
  set value(value) {
    this.findInput.setValue(value);
  }
  select(range = null) {
    this.findInput.inputBox.select(range);
  }
  getSelection() {
    return this.findInput.inputBox.getSelection();
  }
  isSelectionAtEnd() {
    return this.findInput.inputBox.isSelectionAtEnd();
  }
  setPlaceholder(placeholder) {
    this.findInput.inputBox.setPlaceHolder(placeholder);
  }
  get placeholder() {
    return this.findInput.inputBox.inputElement.getAttribute("placeholder") || "";
  }
  set placeholder(placeholder) {
    this.findInput.inputBox.setPlaceHolder(placeholder);
  }
  get password() {
    return this.findInput.inputBox.inputElement.type === "password";
  }
  set password(password) {
    this.findInput.inputBox.inputElement.type = password ? "password" : "text";
  }
  set enabled(enabled) {
    this.findInput.inputBox.inputElement.toggleAttribute("readonly", !enabled);
  }
  set toggles(toggles) {
    this.findInput.setAdditionalToggles(toggles);
  }
  hasFocus() {
    return this.findInput.inputBox.hasFocus();
  }
  setAttribute(name, value) {
    this.findInput.inputBox.inputElement.setAttribute(name, value);
  }
  removeAttribute(name) {
    this.findInput.inputBox.inputElement.removeAttribute(name);
  }
  showDecoration(decoration) {
    if (decoration === Severity.Ignore) {
      this.findInput.clearMessage();
    } else {
      this.findInput.showMessage({ type: decoration === Severity.Info ? MessageType.INFO : decoration === Severity.Warning ? MessageType.WARNING : MessageType.ERROR, content: "" });
    }
  }
  stylesForType(decoration) {
    return this.findInput.inputBox.stylesForType(decoration === Severity.Info ? MessageType.INFO : decoration === Severity.Warning ? MessageType.WARNING : MessageType.ERROR);
  }
  setFocus() {
    this.findInput.focus();
  }
  layout() {
    this.findInput.inputBox.layout();
  }
}
export {
  QuickInputBox
};
//# sourceMappingURL=quickInputBox.js.map
