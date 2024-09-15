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
import { addDisposableListener, getWindow } from "../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import {
  ToggleMenuAction,
  ToolBar
} from "../../../base/browser/ui/toolbar/toolbar.js";
import {
  Separator,
  toAction
} from "../../../base/common/actions.js";
import { coalesceInPlace } from "../../../base/common/arrays.js";
import { intersection } from "../../../base/common/collections.js";
import { BugIndicatingError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { localize } from "../../../nls.js";
import { ICommandService } from "../../commands/common/commands.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IContextMenuService } from "../../contextview/browser/contextView.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import {
  IMenuService,
  MenuItemAction,
  SubmenuItemAction
} from "../common/actions.js";
import { createConfigureKeybindingAction } from "../common/menuService.js";
import { createAndFillInActionBarActions } from "./menuEntryActionViewItem.js";
var HiddenItemStrategy = /* @__PURE__ */ ((HiddenItemStrategy2) => {
  HiddenItemStrategy2[HiddenItemStrategy2["NoHide"] = -1] = "NoHide";
  HiddenItemStrategy2[HiddenItemStrategy2["Ignore"] = 0] = "Ignore";
  HiddenItemStrategy2[HiddenItemStrategy2["RenderInSecondaryGroup"] = 1] = "RenderInSecondaryGroup";
  return HiddenItemStrategy2;
})(HiddenItemStrategy || {});
let WorkbenchToolBar = class extends ToolBar {
  constructor(container, _options, _menuService, _contextKeyService, _contextMenuService, _keybindingService, _commandService, telemetryService) {
    super(container, _contextMenuService, {
      // defaults
      getKeyBinding: /* @__PURE__ */ __name((action) => _keybindingService.lookupKeybinding(action.id) ?? void 0, "getKeyBinding"),
      // options (override defaults)
      ..._options,
      // mandatory (overide options)
      allowContextMenu: true,
      skipTelemetry: typeof _options?.telemetrySource === "string"
    });
    this._options = _options;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this._contextMenuService = _contextMenuService;
    this._keybindingService = _keybindingService;
    this._commandService = _commandService;
    const telemetrySource = _options?.telemetrySource;
    if (telemetrySource) {
      this._store.add(
        this.actionBar.onDidRun(
          (e) => telemetryService.publicLog2("workbenchActionExecuted", {
            id: e.action.id,
            from: telemetrySource
          })
        )
      );
    }
  }
  static {
    __name(this, "WorkbenchToolBar");
  }
  _sessionDisposables = this._store.add(
    new DisposableStore()
  );
  setActions(_primary, _secondary = [], menuIds) {
    this._sessionDisposables.clear();
    const primary = _primary.slice();
    const secondary = _secondary.slice();
    const toggleActions = [];
    let toggleActionsCheckedCount = 0;
    const extraSecondary = [];
    let someAreHidden = false;
    if (this._options?.hiddenItemStrategy !== -1 /* NoHide */) {
      for (let i = 0; i < primary.length; i++) {
        const action = primary[i];
        if (!(action instanceof MenuItemAction) && !(action instanceof SubmenuItemAction)) {
          continue;
        }
        if (!action.hideActions) {
          continue;
        }
        toggleActions.push(action.hideActions.toggle);
        if (action.hideActions.toggle.checked) {
          toggleActionsCheckedCount++;
        }
        if (action.hideActions.isHidden) {
          someAreHidden = true;
          primary[i] = void 0;
          if (this._options?.hiddenItemStrategy !== 0 /* Ignore */) {
            extraSecondary[i] = action;
          }
        }
      }
    }
    if (this._options?.overflowBehavior !== void 0) {
      const exemptedIds = intersection(
        new Set(this._options.overflowBehavior.exempted),
        Iterable.map(primary, (a) => a?.id)
      );
      const maxItems = this._options.overflowBehavior.maxItems - exemptedIds.size;
      let count = 0;
      for (let i = 0; i < primary.length; i++) {
        const action = primary[i];
        if (!action) {
          continue;
        }
        count++;
        if (exemptedIds.has(action.id)) {
          continue;
        }
        if (count >= maxItems) {
          primary[i] = void 0;
          extraSecondary[i] = action;
        }
      }
    }
    coalesceInPlace(primary);
    coalesceInPlace(extraSecondary);
    super.setActions(primary, Separator.join(extraSecondary, secondary));
    if (toggleActions.length > 0 || primary.length > 0) {
      this._sessionDisposables.add(
        addDisposableListener(this.getElement(), "contextmenu", (e) => {
          const event = new StandardMouseEvent(
            getWindow(this.getElement()),
            e
          );
          const action = this.getItemAction(event.target);
          if (!action) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          const primaryActions = [];
          if (action instanceof MenuItemAction && action.menuKeybinding) {
            primaryActions.push(action.menuKeybinding);
          } else if (!(action instanceof SubmenuItemAction || action instanceof ToggleMenuAction)) {
            const supportsKeybindings = !!this._keybindingService.lookupKeybinding(
              action.id
            );
            primaryActions.push(
              createConfigureKeybindingAction(
                this._commandService,
                this._keybindingService,
                action.id,
                void 0,
                supportsKeybindings
              )
            );
          }
          if (toggleActions.length > 0) {
            let noHide = false;
            if (toggleActionsCheckedCount === 1 && this._options?.hiddenItemStrategy === 0 /* Ignore */) {
              noHide = true;
              for (let i = 0; i < toggleActions.length; i++) {
                if (toggleActions[i].checked) {
                  toggleActions[i] = toAction({
                    id: action.id,
                    label: action.label,
                    checked: true,
                    enabled: false,
                    run() {
                    }
                  });
                  break;
                }
              }
            }
            if (!noHide && (action instanceof MenuItemAction || action instanceof SubmenuItemAction)) {
              if (!action.hideActions) {
                return;
              }
              primaryActions.push(action.hideActions.hide);
            } else {
              primaryActions.push(
                toAction({
                  id: "label",
                  label: localize("hide", "Hide"),
                  enabled: false,
                  run() {
                  }
                })
              );
            }
          }
          const actions = Separator.join(
            primaryActions,
            toggleActions
          );
          if (this._options?.resetMenu && !menuIds) {
            menuIds = [this._options.resetMenu];
          }
          if (someAreHidden && menuIds) {
            actions.push(new Separator());
            actions.push(
              toAction({
                id: "resetThisMenu",
                label: localize("resetThisMenu", "Reset Menu"),
                run: /* @__PURE__ */ __name(() => this._menuService.resetHiddenStates(
                  menuIds
                ), "run")
              })
            );
          }
          if (actions.length === 0) {
            return;
          }
          this._contextMenuService.showContextMenu({
            getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
            getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
            // add context menu actions (iff appicable)
            menuId: this._options?.contextMenu,
            menuActionOptions: {
              renderShortTitle: true,
              ...this._options?.menuOptions
            },
            skipTelemetry: typeof this._options?.telemetrySource === "string",
            contextKeyService: this._contextKeyService
          });
        })
      );
    }
  }
};
WorkbenchToolBar = __decorateClass([
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, ITelemetryService)
], WorkbenchToolBar);
let MenuWorkbenchToolBar = class extends WorkbenchToolBar {
  static {
    __name(this, "MenuWorkbenchToolBar");
  }
  _onDidChangeMenuItems = this._store.add(
    new Emitter()
  );
  onDidChangeMenuItems = this._onDidChangeMenuItems.event;
  constructor(container, menuId, options, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService) {
    super(
      container,
      { resetMenu: menuId, ...options },
      menuService,
      contextKeyService,
      contextMenuService,
      keybindingService,
      commandService,
      telemetryService
    );
    const menu = this._store.add(
      menuService.createMenu(menuId, contextKeyService, {
        emitEventsForSubmenuChanges: true
      })
    );
    const updateToolbar = /* @__PURE__ */ __name(() => {
      const primary = [];
      const secondary = [];
      createAndFillInActionBarActions(
        menu,
        options?.menuOptions,
        { primary, secondary },
        options?.toolbarOptions?.primaryGroup,
        options?.toolbarOptions?.shouldInlineSubmenu,
        options?.toolbarOptions?.useSeparatorsInPrimaryActions
      );
      container.classList.toggle(
        "has-no-actions",
        primary.length === 0 && secondary.length === 0
      );
      super.setActions(primary, secondary);
    }, "updateToolbar");
    this._store.add(
      menu.onDidChange(() => {
        updateToolbar();
        this._onDidChangeMenuItems.fire(this);
      })
    );
    updateToolbar();
  }
  /**
   * @deprecated The WorkbenchToolBar does not support this method because it works with menus.
   */
  setActions() {
    throw new BugIndicatingError("This toolbar is populated from a menu.");
  }
};
MenuWorkbenchToolBar = __decorateClass([
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, ITelemetryService)
], MenuWorkbenchToolBar);
export {
  HiddenItemStrategy,
  MenuWorkbenchToolBar,
  WorkbenchToolBar
};
//# sourceMappingURL=toolbar.js.map
