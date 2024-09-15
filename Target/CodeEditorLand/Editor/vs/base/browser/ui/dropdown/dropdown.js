var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IContextMenuProvider } from "../../contextmenu.js";
import { $, addDisposableListener, append, EventHelper, EventType, isMouseEvent } from "../../dom.js";
import { StandardKeyboardEvent } from "../../keyboardEvent.js";
import { EventType as GestureEventType, Gesture } from "../../touch.js";
import { AnchorAlignment } from "../contextview/contextview.js";
import { getBaseLayerHoverDelegate } from "../hover/hoverDelegate2.js";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import { IMenuOptions } from "../menu/menu.js";
import { ActionRunner, IAction } from "../../../common/actions.js";
import { Emitter } from "../../../common/event.js";
import { KeyCode } from "../../../common/keyCodes.js";
import { IDisposable } from "../../../common/lifecycle.js";
import "./dropdown.css";
class BaseDropdown extends ActionRunner {
  static {
    __name(this, "BaseDropdown");
  }
  _element;
  boxContainer;
  _label;
  contents;
  visible;
  _onDidChangeVisibility = this._register(new Emitter());
  onDidChangeVisibility = this._onDidChangeVisibility.event;
  hover;
  constructor(container, options) {
    super();
    this._element = append(container, $(".monaco-dropdown"));
    this._label = append(this._element, $(".dropdown-label"));
    let labelRenderer = options.labelRenderer;
    if (!labelRenderer) {
      labelRenderer = /* @__PURE__ */ __name((container2) => {
        container2.textContent = options.label || "";
        return null;
      }, "labelRenderer");
    }
    for (const event of [EventType.CLICK, EventType.MOUSE_DOWN, GestureEventType.Tap]) {
      this._register(addDisposableListener(this.element, event, (e) => EventHelper.stop(e, true)));
    }
    for (const event of [EventType.MOUSE_DOWN, GestureEventType.Tap]) {
      this._register(addDisposableListener(this._label, event, (e) => {
        if (isMouseEvent(e) && (e.detail > 1 || e.button !== 0)) {
          return;
        }
        if (this.visible) {
          this.hide();
        } else {
          this.show();
        }
      }));
    }
    this._register(addDisposableListener(this._label, EventType.KEY_UP, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
        EventHelper.stop(e, true);
        if (this.visible) {
          this.hide();
        } else {
          this.show();
        }
      }
    }));
    const cleanupFn = labelRenderer(this._label);
    if (cleanupFn) {
      this._register(cleanupFn);
    }
    this._register(Gesture.addTarget(this._label));
  }
  get element() {
    return this._element;
  }
  get label() {
    return this._label;
  }
  set tooltip(tooltip) {
    if (this._label) {
      if (!this.hover && tooltip !== "") {
        this.hover = this._register(getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("mouse"), this._label, tooltip));
      } else if (this.hover) {
        this.hover.update(tooltip);
      }
    }
  }
  show() {
    if (!this.visible) {
      this.visible = true;
      this._onDidChangeVisibility.fire(true);
    }
  }
  hide() {
    if (this.visible) {
      this.visible = false;
      this._onDidChangeVisibility.fire(false);
    }
  }
  isVisible() {
    return !!this.visible;
  }
  onEvent(_e, activeElement) {
    this.hide();
  }
  dispose() {
    super.dispose();
    this.hide();
    if (this.boxContainer) {
      this.boxContainer.remove();
      this.boxContainer = void 0;
    }
    if (this.contents) {
      this.contents.remove();
      this.contents = void 0;
    }
    if (this._label) {
      this._label.remove();
      this._label = void 0;
    }
  }
}
class DropdownMenu extends BaseDropdown {
  constructor(container, _options) {
    super(container, _options);
    this._options = _options;
    this.actions = _options.actions || [];
  }
  static {
    __name(this, "DropdownMenu");
  }
  _menuOptions;
  _actions = [];
  set menuOptions(options) {
    this._menuOptions = options;
  }
  get menuOptions() {
    return this._menuOptions;
  }
  get actions() {
    if (this._options.actionProvider) {
      return this._options.actionProvider.getActions();
    }
    return this._actions;
  }
  set actions(actions) {
    this._actions = actions;
  }
  show() {
    super.show();
    this.element.classList.add("active");
    this._options.contextMenuProvider.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => this.element, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => this.actions, "getActions"),
      getActionsContext: /* @__PURE__ */ __name(() => this.menuOptions ? this.menuOptions.context : null, "getActionsContext"),
      getActionViewItem: /* @__PURE__ */ __name((action, options) => this.menuOptions && this.menuOptions.actionViewItemProvider ? this.menuOptions.actionViewItemProvider(action, options) : void 0, "getActionViewItem"),
      getKeyBinding: /* @__PURE__ */ __name((action) => this.menuOptions && this.menuOptions.getKeyBinding ? this.menuOptions.getKeyBinding(action) : void 0, "getKeyBinding"),
      getMenuClassName: /* @__PURE__ */ __name(() => this._options.menuClassName || "", "getMenuClassName"),
      onHide: /* @__PURE__ */ __name(() => this.onHide(), "onHide"),
      actionRunner: this.menuOptions ? this.menuOptions.actionRunner : void 0,
      anchorAlignment: this.menuOptions ? this.menuOptions.anchorAlignment : AnchorAlignment.LEFT,
      domForShadowRoot: this._options.menuAsChild ? this.element : void 0,
      skipTelemetry: this._options.skipTelemetry
    });
  }
  hide() {
    super.hide();
  }
  onHide() {
    this.hide();
    this.element.classList.remove("active");
  }
}
export {
  DropdownMenu
};
//# sourceMappingURL=dropdown.js.map
