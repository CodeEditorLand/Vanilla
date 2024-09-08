import { Codicon } from "../../../common/codicons.js";
import { Emitter } from "../../../common/event.js";
import { KeyCode } from "../../../common/keyCodes.js";
import { ThemeIcon } from "../../../common/themables.js";
import {
  BaseActionViewItem
} from "../actionbar/actionViewItems.js";
import { Widget } from "../widget.js";
import "./toggle.css";
import {
  $,
  EventType,
  addDisposableListener,
  isActiveElement
} from "../../dom.js";
import { getBaseLayerHoverDelegate } from "../hover/hoverDelegate2.js";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
const unthemedToggleStyles = {
  inputActiveOptionBorder: "#007ACC00",
  inputActiveOptionForeground: "#FFFFFF",
  inputActiveOptionBackground: "#0E639C50"
};
class ToggleActionViewItem extends BaseActionViewItem {
  toggle;
  constructor(context, action, options) {
    super(context, action, options);
    this.toggle = this._register(
      new Toggle({
        actionClassName: this._action.class,
        isChecked: !!this._action.checked,
        title: this.options.keybinding ? `${this._action.label} (${this.options.keybinding})` : this._action.label,
        notFocusable: true,
        inputActiveOptionBackground: options.toggleStyles?.inputActiveOptionBackground,
        inputActiveOptionBorder: options.toggleStyles?.inputActiveOptionBorder,
        inputActiveOptionForeground: options.toggleStyles?.inputActiveOptionForeground,
        hoverDelegate: options.hoverDelegate
      })
    );
    this._register(
      this.toggle.onChange(
        () => this._action.checked = !!this.toggle && this.toggle.checked
      )
    );
  }
  render(container) {
    this.element = container;
    this.element.appendChild(this.toggle.domNode);
  }
  updateEnabled() {
    if (this.toggle) {
      if (this.isEnabled()) {
        this.toggle.enable();
      } else {
        this.toggle.disable();
      }
    }
  }
  updateChecked() {
    this.toggle.checked = !!this._action.checked;
  }
  focus() {
    this.toggle.domNode.tabIndex = 0;
    this.toggle.focus();
  }
  blur() {
    this.toggle.domNode.tabIndex = -1;
    this.toggle.domNode.blur();
  }
  setFocusable(focusable) {
    this.toggle.domNode.tabIndex = focusable ? 0 : -1;
  }
}
class Toggle extends Widget {
  _onChange = this._register(new Emitter());
  onChange = this._onChange.event;
  _onKeyDown = this._register(new Emitter());
  onKeyDown = this._onKeyDown.event;
  _opts;
  _icon;
  domNode;
  _checked;
  _hover;
  constructor(opts) {
    super();
    this._opts = opts;
    this._checked = this._opts.isChecked;
    const classes = ["monaco-custom-toggle"];
    if (this._opts.icon) {
      this._icon = this._opts.icon;
      classes.push(...ThemeIcon.asClassNameArray(this._icon));
    }
    if (this._opts.actionClassName) {
      classes.push(...this._opts.actionClassName.split(" "));
    }
    if (this._checked) {
      classes.push("checked");
    }
    this.domNode = document.createElement("div");
    this._hover = this._register(
      getBaseLayerHoverDelegate().setupManagedHover(
        opts.hoverDelegate ?? getDefaultHoverDelegate("mouse"),
        this.domNode,
        this._opts.title
      )
    );
    this.domNode.classList.add(...classes);
    if (!this._opts.notFocusable) {
      this.domNode.tabIndex = 0;
    }
    this.domNode.setAttribute("role", "checkbox");
    this.domNode.setAttribute("aria-checked", String(this._checked));
    this.domNode.setAttribute("aria-label", this._opts.title);
    this.applyStyles();
    this.onclick(this.domNode, (ev) => {
      if (this.enabled) {
        this.checked = !this._checked;
        this._onChange.fire(false);
        ev.preventDefault();
      }
    });
    this._register(this.ignoreGesture(this.domNode));
    this.onkeydown(this.domNode, (keyboardEvent) => {
      if (keyboardEvent.keyCode === KeyCode.Space || keyboardEvent.keyCode === KeyCode.Enter) {
        this.checked = !this._checked;
        this._onChange.fire(true);
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        return;
      }
      this._onKeyDown.fire(keyboardEvent);
    });
  }
  get enabled() {
    return this.domNode.getAttribute("aria-disabled") !== "true";
  }
  focus() {
    this.domNode.focus();
  }
  get checked() {
    return this._checked;
  }
  set checked(newIsChecked) {
    this._checked = newIsChecked;
    this.domNode.setAttribute("aria-checked", String(this._checked));
    this.domNode.classList.toggle("checked", this._checked);
    this.applyStyles();
  }
  setIcon(icon) {
    if (this._icon) {
      this.domNode.classList.remove(
        ...ThemeIcon.asClassNameArray(this._icon)
      );
    }
    this._icon = icon;
    if (this._icon) {
      this.domNode.classList.add(
        ...ThemeIcon.asClassNameArray(this._icon)
      );
    }
  }
  width() {
    return 2 + 2 + 2 + 16;
  }
  applyStyles() {
    if (this.domNode) {
      this.domNode.style.borderColor = this._checked && this._opts.inputActiveOptionBorder || "";
      this.domNode.style.color = this._checked && this._opts.inputActiveOptionForeground || "inherit";
      this.domNode.style.backgroundColor = this._checked && this._opts.inputActiveOptionBackground || "";
    }
  }
  enable() {
    this.domNode.setAttribute("aria-disabled", String(false));
  }
  disable() {
    this.domNode.setAttribute("aria-disabled", String(true));
  }
  setTitle(newTitle) {
    this._hover.update(newTitle);
    this.domNode.setAttribute("aria-label", newTitle);
  }
  set visible(visible) {
    this.domNode.style.display = visible ? "" : "none";
  }
  get visible() {
    return this.domNode.style.display !== "none";
  }
}
class Checkbox extends Widget {
  constructor(title, isChecked, styles) {
    super();
    this.title = title;
    this.isChecked = isChecked;
    this.checkbox = this._register(
      new Toggle({
        title: this.title,
        isChecked: this.isChecked,
        icon: Codicon.check,
        actionClassName: Checkbox.CLASS_NAME,
        ...unthemedToggleStyles
      })
    );
    this.domNode = this.checkbox.domNode;
    this.styles = styles;
    this.applyStyles();
    this._register(
      this.checkbox.onChange((keyboard) => {
        this.applyStyles();
        this._onChange.fire(keyboard);
      })
    );
  }
  static CLASS_NAME = "monaco-checkbox";
  _onChange = this._register(new Emitter());
  onChange = this._onChange.event;
  checkbox;
  styles;
  domNode;
  get checked() {
    return this.checkbox.checked;
  }
  set checked(newIsChecked) {
    this.checkbox.checked = newIsChecked;
    this.applyStyles();
  }
  focus() {
    this.domNode.focus();
  }
  hasFocus() {
    return isActiveElement(this.domNode);
  }
  enable() {
    this.checkbox.enable();
  }
  disable() {
    this.checkbox.disable();
  }
  applyStyles() {
    this.domNode.style.color = this.styles.checkboxForeground || "";
    this.domNode.style.backgroundColor = this.styles.checkboxBackground || "";
    this.domNode.style.borderColor = this.styles.checkboxBorder || "";
  }
}
class CheckboxActionViewItem extends BaseActionViewItem {
  toggle;
  cssClass;
  constructor(context, action, options) {
    super(context, action, options);
    this.toggle = this._register(
      new Checkbox(
        this._action.label,
        !!this._action.checked,
        options.checkboxStyles
      )
    );
    this._register(this.toggle.onChange(() => this.onChange()));
  }
  render(container) {
    this.element = container;
    this.element.classList.add("checkbox-action-item");
    this.element.appendChild(this.toggle.domNode);
    if (this.options.label && this._action.label) {
      const label = this.element.appendChild(
        $("span.checkbox-label", void 0, this._action.label)
      );
      this._register(
        addDisposableListener(
          label,
          EventType.CLICK,
          (e) => {
            this.toggle.checked = !this.toggle.checked;
            e.stopPropagation();
            e.preventDefault();
            this.onChange();
          }
        )
      );
    }
    this.updateEnabled();
    this.updateClass();
    this.updateChecked();
  }
  onChange() {
    this._action.checked = !!this.toggle && this.toggle.checked;
    this.actionRunner.run(this._action, this._context);
  }
  updateEnabled() {
    if (this.isEnabled()) {
      this.toggle.enable();
    } else {
      this.toggle.disable();
    }
    if (this.action.enabled) {
      this.element?.classList.remove("disabled");
    } else {
      this.element?.classList.add("disabled");
    }
  }
  updateChecked() {
    this.toggle.checked = !!this._action.checked;
  }
  updateClass() {
    if (this.cssClass) {
      this.toggle.domNode.classList.remove(...this.cssClass.split(" "));
    }
    this.cssClass = this.getClass();
    if (this.cssClass) {
      this.toggle.domNode.classList.add(...this.cssClass.split(" "));
    }
  }
  focus() {
    this.toggle.domNode.tabIndex = 0;
    this.toggle.focus();
  }
  blur() {
    this.toggle.domNode.tabIndex = -1;
    this.toggle.domNode.blur();
  }
  setFocusable(focusable) {
    this.toggle.domNode.tabIndex = focusable ? 0 : -1;
  }
}
export {
  Checkbox,
  CheckboxActionViewItem,
  Toggle,
  ToggleActionViewItem,
  unthemedToggleStyles
};
