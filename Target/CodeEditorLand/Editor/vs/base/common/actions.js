import * as nls from "../../nls.js";
import { Emitter } from "./event.js";
import { Disposable } from "./lifecycle.js";
class Action extends Disposable {
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _id;
  _label;
  _tooltip;
  _cssClass;
  _enabled = true;
  _checked;
  _actionCallback;
  constructor(id, label = "", cssClass = "", enabled = true, actionCallback) {
    super();
    this._id = id;
    this._label = label;
    this._cssClass = cssClass;
    this._enabled = enabled;
    this._actionCallback = actionCallback;
  }
  get id() {
    return this._id;
  }
  get label() {
    return this._label;
  }
  set label(value) {
    this._setLabel(value);
  }
  _setLabel(value) {
    if (this._label !== value) {
      this._label = value;
      this._onDidChange.fire({ label: value });
    }
  }
  get tooltip() {
    return this._tooltip || "";
  }
  set tooltip(value) {
    this._setTooltip(value);
  }
  _setTooltip(value) {
    if (this._tooltip !== value) {
      this._tooltip = value;
      this._onDidChange.fire({ tooltip: value });
    }
  }
  get class() {
    return this._cssClass;
  }
  set class(value) {
    this._setClass(value);
  }
  _setClass(value) {
    if (this._cssClass !== value) {
      this._cssClass = value;
      this._onDidChange.fire({ class: value });
    }
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(value) {
    this._setEnabled(value);
  }
  _setEnabled(value) {
    if (this._enabled !== value) {
      this._enabled = value;
      this._onDidChange.fire({ enabled: value });
    }
  }
  get checked() {
    return this._checked;
  }
  set checked(value) {
    this._setChecked(value);
  }
  _setChecked(value) {
    if (this._checked !== value) {
      this._checked = value;
      this._onDidChange.fire({ checked: value });
    }
  }
  async run(event, data) {
    if (this._actionCallback) {
      await this._actionCallback(event);
    }
  }
}
class ActionRunner extends Disposable {
  _onWillRun = this._register(new Emitter());
  onWillRun = this._onWillRun.event;
  _onDidRun = this._register(new Emitter());
  onDidRun = this._onDidRun.event;
  async run(action, context) {
    if (!action.enabled) {
      return;
    }
    this._onWillRun.fire({ action });
    let error;
    try {
      await this.runAction(action, context);
    } catch (e) {
      error = e;
    }
    this._onDidRun.fire({ action, error });
  }
  async runAction(action, context) {
    await action.run(context);
  }
}
class Separator {
  /**
   * Joins all non-empty lists of actions with separators.
   */
  static join(...actionLists) {
    let out = [];
    for (const list of actionLists) {
      if (!list.length) {
      } else if (out.length) {
        out = [...out, new Separator(), ...list];
      } else {
        out = list;
      }
    }
    return out;
  }
  static ID = "vs.actions.separator";
  id = Separator.ID;
  label = "";
  tooltip = "";
  class = "separator";
  enabled = false;
  checked = false;
  async run() {
  }
}
class SubmenuAction {
  id;
  label;
  class;
  tooltip = "";
  enabled = true;
  checked = void 0;
  _actions;
  get actions() {
    return this._actions;
  }
  constructor(id, label, actions, cssClass) {
    this.id = id;
    this.label = label;
    this.class = cssClass;
    this._actions = actions;
  }
  async run() {
  }
}
class EmptySubmenuAction extends Action {
  static ID = "vs.actions.empty";
  constructor() {
    super(
      EmptySubmenuAction.ID,
      nls.localize("submenu.empty", "(empty)"),
      void 0,
      false
    );
  }
}
function toAction(props) {
  return {
    id: props.id,
    label: props.label,
    tooltip: props.tooltip ?? props.label,
    class: props.class,
    enabled: props.enabled ?? true,
    checked: props.checked,
    run: async (...args) => props.run(...args)
  };
}
export {
  Action,
  ActionRunner,
  EmptySubmenuAction,
  Separator,
  SubmenuAction,
  toAction
};
