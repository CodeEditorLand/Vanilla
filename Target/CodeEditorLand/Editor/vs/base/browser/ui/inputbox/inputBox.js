import { Emitter, Event } from "../../../common/event.js";
import { HistoryNavigator } from "../../../common/history.js";
import { equals } from "../../../common/objects.js";
import { ScrollbarVisibility } from "../../../common/scrollable.js";
import * as dom from "../../dom.js";
import { DomEmitter } from "../../event.js";
import {
  renderFormattedText,
  renderText
} from "../../formattedTextRenderer.js";
import { ActionBar } from "../actionbar/actionbar.js";
import * as aria from "../aria/aria.js";
import {
  AnchorAlignment
} from "../contextview/contextview.js";
import { getBaseLayerHoverDelegate } from "../hover/hoverDelegate2.js";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import { ScrollableElement } from "../scrollbar/scrollableElement.js";
import { Widget } from "../widget.js";
import "./inputBox.css";
import * as nls from "../../../../nls.js";
const $ = dom.$;
var MessageType = /* @__PURE__ */ ((MessageType2) => {
  MessageType2[MessageType2["INFO"] = 1] = "INFO";
  MessageType2[MessageType2["WARNING"] = 2] = "WARNING";
  MessageType2[MessageType2["ERROR"] = 3] = "ERROR";
  return MessageType2;
})(MessageType || {});
const unthemedInboxStyles = {
  inputBackground: "#3C3C3C",
  inputForeground: "#CCCCCC",
  inputValidationInfoBorder: "#55AAFF",
  inputValidationInfoBackground: "#063B49",
  inputValidationWarningBorder: "#B89500",
  inputValidationWarningBackground: "#352A05",
  inputValidationErrorBorder: "#BE1100",
  inputValidationErrorBackground: "#5A1D1D",
  inputBorder: void 0,
  inputValidationErrorForeground: void 0,
  inputValidationInfoForeground: void 0,
  inputValidationWarningForeground: void 0
};
class InputBox extends Widget {
  contextViewProvider;
  element;
  input;
  actionbar;
  options;
  message;
  placeholder;
  tooltip;
  ariaLabel;
  validation;
  state = "idle";
  mirror;
  cachedHeight;
  cachedContentHeight;
  maxHeight = Number.POSITIVE_INFINITY;
  scrollableElement;
  hover;
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _onDidHeightChange = this._register(new Emitter());
  onDidHeightChange = this._onDidHeightChange.event;
  constructor(container, contextViewProvider, options) {
    super();
    this.contextViewProvider = contextViewProvider;
    this.options = options;
    this.message = null;
    this.placeholder = this.options.placeholder || "";
    this.tooltip = this.options.tooltip ?? (this.placeholder || "");
    this.ariaLabel = this.options.ariaLabel || "";
    if (this.options.validationOptions) {
      this.validation = this.options.validationOptions.validation;
    }
    this.element = dom.append(container, $(".monaco-inputbox.idle"));
    const tagName = this.options.flexibleHeight ? "textarea" : "input";
    const wrapper = dom.append(this.element, $(".ibwrapper"));
    this.input = dom.append(wrapper, $(tagName + ".input.empty"));
    this.input.setAttribute("autocorrect", "off");
    this.input.setAttribute("autocapitalize", "off");
    this.input.setAttribute("spellcheck", "false");
    this.onfocus(
      this.input,
      () => this.element.classList.add("synthetic-focus")
    );
    this.onblur(
      this.input,
      () => this.element.classList.remove("synthetic-focus")
    );
    if (this.options.flexibleHeight) {
      this.maxHeight = typeof this.options.flexibleMaxHeight === "number" ? this.options.flexibleMaxHeight : Number.POSITIVE_INFINITY;
      this.mirror = dom.append(wrapper, $("div.mirror"));
      this.mirror.innerText = "\xA0";
      this.scrollableElement = new ScrollableElement(this.element, {
        vertical: ScrollbarVisibility.Auto
      });
      if (this.options.flexibleWidth) {
        this.input.setAttribute("wrap", "off");
        this.mirror.style.whiteSpace = "pre";
        this.mirror.style.wordWrap = "initial";
      }
      dom.append(container, this.scrollableElement.getDomNode());
      this._register(this.scrollableElement);
      this._register(
        this.scrollableElement.onScroll(
          (e) => this.input.scrollTop = e.scrollTop
        )
      );
      const onSelectionChange = this._register(
        new DomEmitter(container.ownerDocument, "selectionchange")
      );
      const onAnchoredSelectionChange = Event.filter(
        onSelectionChange.event,
        () => {
          const selection = container.ownerDocument.getSelection();
          return selection?.anchorNode === wrapper;
        }
      );
      this._register(
        onAnchoredSelectionChange(this.updateScrollDimensions, this)
      );
      this._register(
        this.onDidHeightChange(this.updateScrollDimensions, this)
      );
    } else {
      this.input.type = this.options.type || "text";
      this.input.setAttribute("wrap", "off");
    }
    if (this.ariaLabel) {
      this.input.setAttribute("aria-label", this.ariaLabel);
    }
    if (this.placeholder && !this.options.showPlaceholderOnFocus) {
      this.setPlaceHolder(this.placeholder);
    }
    if (this.tooltip) {
      this.setTooltip(this.tooltip);
    }
    this.oninput(this.input, () => this.onValueChange());
    this.onblur(this.input, () => this.onBlur());
    this.onfocus(this.input, () => this.onFocus());
    this._register(this.ignoreGesture(this.input));
    setTimeout(() => this.updateMirror(), 0);
    if (this.options.actions) {
      this.actionbar = this._register(new ActionBar(this.element));
      this.actionbar.push(this.options.actions, {
        icon: true,
        label: false
      });
    }
    this.applyStyles();
  }
  onBlur() {
    this._hideMessage();
    if (this.options.showPlaceholderOnFocus) {
      this.input.setAttribute("placeholder", "");
    }
  }
  onFocus() {
    this._showMessage();
    if (this.options.showPlaceholderOnFocus) {
      this.input.setAttribute("placeholder", this.placeholder || "");
    }
  }
  setPlaceHolder(placeHolder) {
    this.placeholder = placeHolder;
    this.input.setAttribute("placeholder", placeHolder);
  }
  setTooltip(tooltip) {
    this.tooltip = tooltip;
    if (this.hover) {
      this.hover.update(tooltip);
    } else {
      this.hover = this._register(
        getBaseLayerHoverDelegate().setupManagedHover(
          getDefaultHoverDelegate("mouse"),
          this.input,
          tooltip
        )
      );
    }
  }
  setAriaLabel(label) {
    this.ariaLabel = label;
    if (label) {
      this.input.setAttribute("aria-label", this.ariaLabel);
    } else {
      this.input.removeAttribute("aria-label");
    }
  }
  getAriaLabel() {
    return this.ariaLabel;
  }
  get mirrorElement() {
    return this.mirror;
  }
  get inputElement() {
    return this.input;
  }
  get value() {
    return this.input.value;
  }
  set value(newValue) {
    if (this.input.value !== newValue) {
      this.input.value = newValue;
      this.onValueChange();
    }
  }
  get step() {
    return this.input.step;
  }
  set step(newValue) {
    this.input.step = newValue;
  }
  get height() {
    return typeof this.cachedHeight === "number" ? this.cachedHeight : dom.getTotalHeight(this.element);
  }
  focus() {
    this.input.focus();
  }
  blur() {
    this.input.blur();
  }
  hasFocus() {
    return dom.isActiveElement(this.input);
  }
  select(range = null) {
    this.input.select();
    if (range) {
      this.input.setSelectionRange(range.start, range.end);
      if (range.end === this.input.value.length) {
        this.input.scrollLeft = this.input.scrollWidth;
      }
    }
  }
  isSelectionAtEnd() {
    return this.input.selectionEnd === this.input.value.length && this.input.selectionStart === this.input.selectionEnd;
  }
  getSelection() {
    const selectionStart = this.input.selectionStart;
    if (selectionStart === null) {
      return null;
    }
    const selectionEnd = this.input.selectionEnd ?? selectionStart;
    return {
      start: selectionStart,
      end: selectionEnd
    };
  }
  enable() {
    this.input.removeAttribute("disabled");
  }
  disable() {
    this.blur();
    this.input.disabled = true;
    this._hideMessage();
  }
  setEnabled(enabled) {
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }
  get width() {
    return dom.getTotalWidth(this.input);
  }
  set width(width) {
    if (this.options.flexibleHeight && this.options.flexibleWidth) {
      let horizontalPadding = 0;
      if (this.mirror) {
        const paddingLeft = Number.parseFloat(this.mirror.style.paddingLeft || "") || 0;
        const paddingRight = Number.parseFloat(this.mirror.style.paddingRight || "") || 0;
        horizontalPadding = paddingLeft + paddingRight;
      }
      this.input.style.width = width - horizontalPadding + "px";
    } else {
      this.input.style.width = width + "px";
    }
    if (this.mirror) {
      this.mirror.style.width = width + "px";
    }
  }
  set paddingRight(paddingRight) {
    this.input.style.width = `calc(100% - ${paddingRight}px)`;
    if (this.mirror) {
      this.mirror.style.paddingRight = paddingRight + "px";
    }
  }
  updateScrollDimensions() {
    if (typeof this.cachedContentHeight !== "number" || typeof this.cachedHeight !== "number" || !this.scrollableElement) {
      return;
    }
    const scrollHeight = this.cachedContentHeight;
    const height = this.cachedHeight;
    const scrollTop = this.input.scrollTop;
    this.scrollableElement.setScrollDimensions({ scrollHeight, height });
    this.scrollableElement.setScrollPosition({ scrollTop });
  }
  showMessage(message, force) {
    if (this.state === "open" && equals(this.message, message)) {
      return;
    }
    this.message = message;
    this.element.classList.remove("idle");
    this.element.classList.remove("info");
    this.element.classList.remove("warning");
    this.element.classList.remove("error");
    this.element.classList.add(this.classForType(message.type));
    const styles = this.stylesForType(this.message.type);
    this.element.style.border = `1px solid ${dom.asCssValueWithDefault(styles.border, "transparent")}`;
    if (this.message.content && (this.hasFocus() || force)) {
      this._showMessage();
    }
  }
  hideMessage() {
    this.message = null;
    this.element.classList.remove("info");
    this.element.classList.remove("warning");
    this.element.classList.remove("error");
    this.element.classList.add("idle");
    this._hideMessage();
    this.applyStyles();
  }
  isInputValid() {
    return !!this.validation && !this.validation(this.value);
  }
  validate() {
    let errorMsg = null;
    if (this.validation) {
      errorMsg = this.validation(this.value);
      if (errorMsg) {
        this.inputElement.setAttribute("aria-invalid", "true");
        this.showMessage(errorMsg);
      } else if (this.inputElement.hasAttribute("aria-invalid")) {
        this.inputElement.removeAttribute("aria-invalid");
        this.hideMessage();
      }
    }
    return errorMsg?.type;
  }
  stylesForType(type) {
    const styles = this.options.inputBoxStyles;
    switch (type) {
      case 1 /* INFO */:
        return {
          border: styles.inputValidationInfoBorder,
          background: styles.inputValidationInfoBackground,
          foreground: styles.inputValidationInfoForeground
        };
      case 2 /* WARNING */:
        return {
          border: styles.inputValidationWarningBorder,
          background: styles.inputValidationWarningBackground,
          foreground: styles.inputValidationWarningForeground
        };
      default:
        return {
          border: styles.inputValidationErrorBorder,
          background: styles.inputValidationErrorBackground,
          foreground: styles.inputValidationErrorForeground
        };
    }
  }
  classForType(type) {
    switch (type) {
      case 1 /* INFO */:
        return "info";
      case 2 /* WARNING */:
        return "warning";
      default:
        return "error";
    }
  }
  _showMessage() {
    if (!this.contextViewProvider || !this.message) {
      return;
    }
    let div;
    const layout = () => div.style.width = dom.getTotalWidth(this.element) + "px";
    this.contextViewProvider.showContextView({
      getAnchor: () => this.element,
      anchorAlignment: AnchorAlignment.RIGHT,
      render: (container) => {
        if (!this.message) {
          return null;
        }
        div = dom.append(container, $(".monaco-inputbox-container"));
        layout();
        const renderOptions = {
          inline: true,
          className: "monaco-inputbox-message"
        };
        const spanElement = this.message.formatContent ? renderFormattedText(this.message.content, renderOptions) : renderText(this.message.content, renderOptions);
        spanElement.classList.add(this.classForType(this.message.type));
        const styles = this.stylesForType(this.message.type);
        spanElement.style.backgroundColor = styles.background ?? "";
        spanElement.style.color = styles.foreground ?? "";
        spanElement.style.border = styles.border ? `1px solid ${styles.border}` : "";
        dom.append(div, spanElement);
        return null;
      },
      onHide: () => {
        this.state = "closed";
      },
      layout
    });
    let alertText;
    if (this.message.type === 3 /* ERROR */) {
      alertText = nls.localize(
        "alertErrorMessage",
        "Error: {0}",
        this.message.content
      );
    } else if (this.message.type === 2 /* WARNING */) {
      alertText = nls.localize(
        "alertWarningMessage",
        "Warning: {0}",
        this.message.content
      );
    } else {
      alertText = nls.localize(
        "alertInfoMessage",
        "Info: {0}",
        this.message.content
      );
    }
    aria.alert(alertText);
    this.state = "open";
  }
  _hideMessage() {
    if (!this.contextViewProvider) {
      return;
    }
    if (this.state === "open") {
      this.contextViewProvider.hideContextView();
    }
    this.state = "idle";
  }
  onValueChange() {
    this._onDidChange.fire(this.value);
    this.validate();
    this.updateMirror();
    this.input.classList.toggle("empty", !this.value);
    if (this.state === "open" && this.contextViewProvider) {
      this.contextViewProvider.layout();
    }
  }
  updateMirror() {
    if (!this.mirror) {
      return;
    }
    const value = this.value;
    const lastCharCode = value.charCodeAt(value.length - 1);
    const suffix = lastCharCode === 10 ? " " : "";
    const mirrorTextContent = (value + suffix).replace(/\u000c/g, "");
    if (mirrorTextContent) {
      this.mirror.textContent = value + suffix;
    } else {
      this.mirror.innerText = "\xA0";
    }
    this.layout();
  }
  applyStyles() {
    const styles = this.options.inputBoxStyles;
    const background = styles.inputBackground ?? "";
    const foreground = styles.inputForeground ?? "";
    const border = styles.inputBorder ?? "";
    this.element.style.backgroundColor = background;
    this.element.style.color = foreground;
    this.input.style.backgroundColor = "inherit";
    this.input.style.color = foreground;
    this.element.style.border = `1px solid ${dom.asCssValueWithDefault(border, "transparent")}`;
  }
  layout() {
    if (!this.mirror) {
      return;
    }
    const previousHeight = this.cachedContentHeight;
    this.cachedContentHeight = dom.getTotalHeight(this.mirror);
    if (previousHeight !== this.cachedContentHeight) {
      this.cachedHeight = Math.min(
        this.cachedContentHeight,
        this.maxHeight
      );
      this.input.style.height = this.cachedHeight + "px";
      this._onDidHeightChange.fire(this.cachedContentHeight);
    }
  }
  insertAtCursor(text) {
    const inputElement = this.inputElement;
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;
    const content = inputElement.value;
    if (start !== null && end !== null) {
      this.value = content.substr(0, start) + text + content.substr(end);
      inputElement.setSelectionRange(start + 1, start + 1);
      this.layout();
    }
  }
  dispose() {
    this._hideMessage();
    this.message = null;
    this.actionbar?.dispose();
    super.dispose();
  }
}
class HistoryInputBox extends InputBox {
  history;
  observer;
  _onDidFocus = this._register(new Emitter());
  onDidFocus = this._onDidFocus.event;
  _onDidBlur = this._register(new Emitter());
  onDidBlur = this._onDidBlur.event;
  constructor(container, contextViewProvider, options) {
    const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS = nls.localize(
      {
        key: "history.inputbox.hint.suffix.noparens",
        comment: [
          'Text is the suffix of an input field placeholder coming after the action the input field performs, this will be used when the input field ends in a closing parenthesis ")", for example "Filter (e.g. text, !exclude)". The character inserted into the final string is \u21C5 to represent the up and down arrow keys.'
        ]
      },
      " or {0} for history",
      `\u21C5`
    );
    const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS = nls.localize(
      {
        key: "history.inputbox.hint.suffix.inparens",
        comment: [
          'Text is the suffix of an input field placeholder coming after the action the input field performs, this will be used when the input field does NOT end in a closing parenthesis (eg. "Find"). The character inserted into the final string is \u21C5 to represent the up and down arrow keys.'
        ]
      },
      " ({0} for history)",
      `\u21C5`
    );
    super(container, contextViewProvider, options);
    this.history = new HistoryNavigator(options.history, 100);
    const addSuffix = () => {
      if (options.showHistoryHint && options.showHistoryHint() && !this.placeholder.endsWith(
        NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS
      ) && !this.placeholder.endsWith(
        NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS
      ) && this.history.getHistory().length) {
        const suffix = this.placeholder.endsWith(")") ? NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS : NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS;
        const suffixedPlaceholder = this.placeholder + suffix;
        if (options.showPlaceholderOnFocus && !dom.isActiveElement(this.input)) {
          this.placeholder = suffixedPlaceholder;
        } else {
          this.setPlaceHolder(suffixedPlaceholder);
        }
      }
    };
    this.observer = new MutationObserver(
      (mutationList, observer) => {
        mutationList.forEach((mutation) => {
          if (!mutation.target.textContent) {
            addSuffix();
          }
        });
      }
    );
    this.observer.observe(this.input, { attributeFilter: ["class"] });
    this.onfocus(this.input, () => addSuffix());
    this.onblur(this.input, () => {
      const resetPlaceholder = (historyHint) => {
        if (this.placeholder.endsWith(historyHint)) {
          const revertedPlaceholder = this.placeholder.slice(
            0,
            this.placeholder.length - historyHint.length
          );
          if (options.showPlaceholderOnFocus) {
            this.placeholder = revertedPlaceholder;
          } else {
            this.setPlaceHolder(revertedPlaceholder);
          }
          return true;
        } else {
          return false;
        }
      };
      if (!resetPlaceholder(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS)) {
        resetPlaceholder(NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_NO_PARENS);
      }
    });
  }
  dispose() {
    super.dispose();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = void 0;
    }
  }
  addToHistory(always) {
    if (this.value && (always || this.value !== this.getCurrentValue())) {
      this.history.add(this.value);
    }
  }
  prependHistory(restoredHistory) {
    const newHistory = this.getHistory();
    this.clearHistory();
    restoredHistory.forEach((item) => {
      this.history.add(item);
    });
    newHistory.forEach((item) => {
      this.history.add(item);
    });
  }
  getHistory() {
    return this.history.getHistory();
  }
  isAtFirstInHistory() {
    return this.history.isFirst();
  }
  isAtLastInHistory() {
    return this.history.isLast();
  }
  isNowhereInHistory() {
    return this.history.isNowhere();
  }
  showNextValue() {
    if (!this.history.has(this.value)) {
      this.addToHistory();
    }
    let next = this.getNextValue();
    if (next) {
      next = next === this.value ? this.getNextValue() : next;
    }
    this.value = next ?? "";
    aria.status(
      this.value ? this.value : nls.localize("clearedInput", "Cleared Input")
    );
  }
  showPreviousValue() {
    if (!this.history.has(this.value)) {
      this.addToHistory();
    }
    let previous = this.getPreviousValue();
    if (previous) {
      previous = previous === this.value ? this.getPreviousValue() : previous;
    }
    if (previous) {
      this.value = previous;
      aria.status(this.value);
    }
  }
  clearHistory() {
    this.history.clear();
  }
  setPlaceHolder(placeHolder) {
    super.setPlaceHolder(placeHolder);
    this.setTooltip(placeHolder);
  }
  onBlur() {
    super.onBlur();
    this._onDidBlur.fire();
  }
  onFocus() {
    super.onFocus();
    this._onDidFocus.fire();
  }
  getCurrentValue() {
    let currentValue = this.history.current();
    if (!currentValue) {
      currentValue = this.history.last();
      this.history.next();
    }
    return currentValue;
  }
  getPreviousValue() {
    return this.history.previous() || this.history.first();
  }
  getNextValue() {
    return this.history.next();
  }
}
export {
  HistoryInputBox,
  InputBox,
  MessageType,
  unthemedInboxStyles
};
