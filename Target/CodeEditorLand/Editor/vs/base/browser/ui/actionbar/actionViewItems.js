import {
  Action,
  ActionRunner,
  Separator
} from "../../../common/actions.js";
import { Disposable } from "../../../common/lifecycle.js";
import * as platform from "../../../common/platform.js";
import * as types from "../../../common/types.js";
import { isFirefox } from "../../browser.js";
import { DataTransfers } from "../../dnd.js";
import {
  EventHelper,
  EventType,
  addDisposableListener
} from "../../dom.js";
import { Gesture, EventType as TouchEventType } from "../../touch.js";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import {
  SelectBox
} from "../selectBox/selectBox.js";
import "./actionbar.css";
import * as nls from "../../../../nls.js";
import { getBaseLayerHoverDelegate } from "../hover/hoverDelegate2.js";
class BaseActionViewItem extends Disposable {
  constructor(context, action, options = {}) {
    super();
    this.options = options;
    this._context = context || this;
    this._action = action;
    if (action instanceof Action) {
      this._register(
        action.onDidChange((event) => {
          if (!this.element) {
            return;
          }
          this.handleActionChangeEvent(event);
        })
      );
    }
  }
  element;
  _context;
  _action;
  customHover;
  get action() {
    return this._action;
  }
  _actionRunner;
  handleActionChangeEvent(event) {
    if (event.enabled !== void 0) {
      this.updateEnabled();
    }
    if (event.checked !== void 0) {
      this.updateChecked();
    }
    if (event.class !== void 0) {
      this.updateClass();
    }
    if (event.label !== void 0) {
      this.updateLabel();
      this.updateTooltip();
    }
    if (event.tooltip !== void 0) {
      this.updateTooltip();
    }
  }
  get actionRunner() {
    if (!this._actionRunner) {
      this._actionRunner = this._register(new ActionRunner());
    }
    return this._actionRunner;
  }
  set actionRunner(actionRunner) {
    this._actionRunner = actionRunner;
  }
  isEnabled() {
    return this._action.enabled;
  }
  setActionContext(newContext) {
    this._context = newContext;
  }
  render(container) {
    const element = this.element = container;
    this._register(Gesture.addTarget(container));
    const enableDragging = this.options && this.options.draggable;
    if (enableDragging) {
      container.draggable = true;
      if (isFirefox) {
        this._register(
          addDisposableListener(
            container,
            EventType.DRAG_START,
            (e) => e.dataTransfer?.setData(
              DataTransfers.TEXT,
              this._action.label
            )
          )
        );
      }
    }
    this._register(
      addDisposableListener(
        element,
        TouchEventType.Tap,
        (e) => this.onClick(e, true)
      )
    );
    this._register(
      addDisposableListener(element, EventType.MOUSE_DOWN, (e) => {
        if (!enableDragging) {
          EventHelper.stop(e, true);
        }
        if (this._action.enabled && e.button === 0) {
          element.classList.add("active");
        }
      })
    );
    if (platform.isMacintosh) {
      this._register(
        addDisposableListener(element, EventType.CONTEXT_MENU, (e) => {
          if (e.button === 0 && e.ctrlKey === true) {
            this.onClick(e);
          }
        })
      );
    }
    this._register(
      addDisposableListener(element, EventType.CLICK, (e) => {
        EventHelper.stop(e, true);
        if (!(this.options && this.options.isMenu)) {
          this.onClick(e);
        }
      })
    );
    this._register(
      addDisposableListener(element, EventType.DBLCLICK, (e) => {
        EventHelper.stop(e, true);
      })
    );
    [EventType.MOUSE_UP, EventType.MOUSE_OUT].forEach((event) => {
      this._register(
        addDisposableListener(element, event, (e) => {
          EventHelper.stop(e);
          element.classList.remove("active");
        })
      );
    });
  }
  onClick(event, preserveFocus = false) {
    EventHelper.stop(event, true);
    const context = types.isUndefinedOrNull(this._context) ? this.options?.useEventAsContext ? event : { preserveFocus } : this._context;
    this.actionRunner.run(this._action, context);
  }
  // Only set the tabIndex on the element once it is about to get focused
  // That way this element wont be a tab stop when it is not needed #106441
  focus() {
    if (this.element) {
      this.element.tabIndex = 0;
      this.element.focus();
      this.element.classList.add("focused");
    }
  }
  isFocused() {
    return !!this.element?.classList.contains("focused");
  }
  blur() {
    if (this.element) {
      this.element.blur();
      this.element.tabIndex = -1;
      this.element.classList.remove("focused");
    }
  }
  setFocusable(focusable) {
    if (this.element) {
      this.element.tabIndex = focusable ? 0 : -1;
    }
  }
  get trapsArrowNavigation() {
    return false;
  }
  updateEnabled() {
  }
  updateLabel() {
  }
  getClass() {
    return this.action.class;
  }
  getTooltip() {
    return this.action.tooltip;
  }
  updateTooltip() {
    if (!this.element) {
      return;
    }
    const title = this.getTooltip() ?? "";
    this.updateAriaLabel();
    if (this.options.hoverDelegate?.showNativeHover) {
      this.element.title = title;
    } else if (!this.customHover && title !== "") {
      const hoverDelegate = this.options.hoverDelegate ?? getDefaultHoverDelegate("element");
      this.customHover = this._store.add(
        getBaseLayerHoverDelegate().setupManagedHover(
          hoverDelegate,
          this.element,
          title
        )
      );
    } else if (this.customHover) {
      this.customHover.update(title);
    }
  }
  updateAriaLabel() {
    if (this.element) {
      const title = this.getTooltip() ?? "";
      this.element.setAttribute("aria-label", title);
    }
  }
  updateClass() {
  }
  updateChecked() {
  }
  dispose() {
    if (this.element) {
      this.element.remove();
      this.element = void 0;
    }
    this._context = void 0;
    super.dispose();
  }
}
class ActionViewItem extends BaseActionViewItem {
  label;
  options;
  cssClass;
  constructor(context, action, options) {
    super(context, action, options);
    this.options = options;
    this.options.icon = options.icon !== void 0 ? options.icon : false;
    this.options.label = options.label !== void 0 ? options.label : true;
    this.cssClass = "";
  }
  render(container) {
    super.render(container);
    types.assertType(this.element);
    const label = document.createElement("a");
    label.classList.add("action-label");
    label.setAttribute("role", this.getDefaultAriaRole());
    this.label = label;
    this.element.appendChild(label);
    if (this.options.label && this.options.keybinding) {
      const kbLabel = document.createElement("span");
      kbLabel.classList.add("keybinding");
      kbLabel.textContent = this.options.keybinding;
      this.element.appendChild(kbLabel);
    }
    this.updateClass();
    this.updateLabel();
    this.updateTooltip();
    this.updateEnabled();
    this.updateChecked();
  }
  getDefaultAriaRole() {
    if (this._action.id === Separator.ID) {
      return "presentation";
    } else if (this.options.isMenu) {
      return "menuitem";
    } else if (this.options.isTabList) {
      return "tab";
    } else {
      return "button";
    }
  }
  // Only set the tabIndex on the element once it is about to get focused
  // That way this element wont be a tab stop when it is not needed #106441
  focus() {
    if (this.label) {
      this.label.tabIndex = 0;
      this.label.focus();
    }
  }
  isFocused() {
    return !!this.label && this.label?.tabIndex === 0;
  }
  blur() {
    if (this.label) {
      this.label.tabIndex = -1;
    }
  }
  setFocusable(focusable) {
    if (this.label) {
      this.label.tabIndex = focusable ? 0 : -1;
    }
  }
  updateLabel() {
    if (this.options.label && this.label) {
      this.label.textContent = this.action.label;
    }
  }
  getTooltip() {
    let title = null;
    if (this.action.tooltip) {
      title = this.action.tooltip;
    } else if (!this.options.label && this.action.label && this.options.icon) {
      title = this.action.label;
      if (this.options.keybinding) {
        title = nls.localize(
          {
            key: "titleLabel",
            comment: ["action title", "action keybinding"]
          },
          "{0} ({1})",
          title,
          this.options.keybinding
        );
      }
    }
    return title ?? void 0;
  }
  updateClass() {
    if (this.cssClass && this.label) {
      this.label.classList.remove(...this.cssClass.split(" "));
    }
    if (this.options.icon) {
      this.cssClass = this.getClass();
      if (this.label) {
        this.label.classList.add("codicon");
        if (this.cssClass) {
          this.label.classList.add(...this.cssClass.split(" "));
        }
      }
      this.updateEnabled();
    } else {
      this.label?.classList.remove("codicon");
    }
  }
  updateEnabled() {
    if (this.action.enabled) {
      if (this.label) {
        this.label.removeAttribute("aria-disabled");
        this.label.classList.remove("disabled");
      }
      this.element?.classList.remove("disabled");
    } else {
      if (this.label) {
        this.label.setAttribute("aria-disabled", "true");
        this.label.classList.add("disabled");
      }
      this.element?.classList.add("disabled");
    }
  }
  updateAriaLabel() {
    if (this.label) {
      const title = this.getTooltip() ?? "";
      this.label.setAttribute("aria-label", title);
    }
  }
  updateChecked() {
    if (this.label) {
      if (this.action.checked !== void 0) {
        this.label.classList.toggle("checked", this.action.checked);
        if (this.options.isTabList) {
          this.label.setAttribute(
            "aria-selected",
            this.action.checked ? "true" : "false"
          );
        } else {
          this.label.setAttribute(
            "aria-checked",
            this.action.checked ? "true" : "false"
          );
          this.label.setAttribute("role", "checkbox");
        }
      } else {
        this.label.classList.remove("checked");
        this.label.removeAttribute(
          this.options.isTabList ? "aria-selected" : "aria-checked"
        );
        this.label.setAttribute("role", this.getDefaultAriaRole());
      }
    }
  }
}
class SelectActionViewItem extends BaseActionViewItem {
  selectBox;
  constructor(ctx, action, options, selected, contextViewProvider, styles, selectBoxOptions) {
    super(ctx, action);
    this.selectBox = new SelectBox(
      options,
      selected,
      contextViewProvider,
      styles,
      selectBoxOptions
    );
    this.selectBox.setFocusable(false);
    this._register(this.selectBox);
    this.registerListeners();
  }
  setOptions(options, selected) {
    this.selectBox.setOptions(options, selected);
  }
  select(index) {
    this.selectBox.select(index);
  }
  registerListeners() {
    this._register(
      this.selectBox.onDidSelect(
        (e) => this.runAction(e.selected, e.index)
      )
    );
  }
  runAction(option, index) {
    this.actionRunner.run(
      this._action,
      this.getActionContext(option, index)
    );
  }
  getActionContext(option, index) {
    return option;
  }
  setFocusable(focusable) {
    this.selectBox.setFocusable(focusable);
  }
  focus() {
    this.selectBox?.focus();
  }
  blur() {
    this.selectBox?.blur();
  }
  render(container) {
    this.selectBox.render(container);
  }
}
export {
  ActionViewItem,
  BaseActionViewItem,
  SelectActionViewItem
};
