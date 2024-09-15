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
import {
  Separator,
  toAction
} from "../../../base/common/actions.js";
import { removeFastWithoutKeepingOrder } from "../../../base/common/arrays.js";
import { RunOnceScheduler } from "../../../base/common/async.js";
import {
  DebounceEmitter,
  Emitter
} from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { localize } from "../../../nls.js";
import { ICommandService } from "../../commands/common/commands.js";
import {
  IContextKeyService
} from "../../contextkey/common/contextkey.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../storage/common/storage.js";
import {
  MenuItemAction,
  MenuRegistry,
  SubmenuItemAction,
  isIMenuItem,
  isISubmenuItem
} from "./actions.js";
let MenuService = class {
  constructor(_commandService, _keybindingService, storageService) {
    this._commandService = _commandService;
    this._keybindingService = _keybindingService;
    this._hiddenStates = new PersistedMenuHideState(storageService);
  }
  static {
    __name(this, "MenuService");
  }
  _hiddenStates;
  createMenu(id, contextKeyService, options) {
    return new MenuImpl(
      id,
      this._hiddenStates,
      {
        emitEventsForSubmenuChanges: false,
        eventDebounceDelay: 50,
        ...options
      },
      this._commandService,
      this._keybindingService,
      contextKeyService
    );
  }
  getMenuActions(id, contextKeyService, options) {
    const menu = new MenuImpl(
      id,
      this._hiddenStates,
      {
        emitEventsForSubmenuChanges: false,
        eventDebounceDelay: 50,
        ...options
      },
      this._commandService,
      this._keybindingService,
      contextKeyService
    );
    const actions = menu.getActions(options);
    menu.dispose();
    return actions;
  }
  getMenuContexts(id) {
    const menuInfo = new MenuInfoSnapshot(id, false);
    return /* @__PURE__ */ new Set([
      ...menuInfo.structureContextKeys,
      ...menuInfo.preconditionContextKeys,
      ...menuInfo.toggledContextKeys
    ]);
  }
  resetHiddenStates(ids) {
    this._hiddenStates.reset(ids);
  }
};
MenuService = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IStorageService)
], MenuService);
let PersistedMenuHideState = class {
  constructor(_storageService) {
    this._storageService = _storageService;
    try {
      const raw = _storageService.get(
        PersistedMenuHideState._key,
        StorageScope.PROFILE,
        "{}"
      );
      this._data = JSON.parse(raw);
    } catch (err) {
      this._data = /* @__PURE__ */ Object.create(null);
    }
    this._disposables.add(
      _storageService.onDidChangeValue(
        StorageScope.PROFILE,
        PersistedMenuHideState._key,
        this._disposables
      )(() => {
        if (!this._ignoreChangeEvent) {
          try {
            const raw = _storageService.get(
              PersistedMenuHideState._key,
              StorageScope.PROFILE,
              "{}"
            );
            this._data = JSON.parse(raw);
          } catch (err) {
            console.log("FAILED to read storage after UPDATE", err);
          }
        }
        this._onDidChange.fire();
      })
    );
  }
  static {
    __name(this, "PersistedMenuHideState");
  }
  static _key = "menu.hiddenCommands";
  _disposables = new DisposableStore();
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _ignoreChangeEvent = false;
  _data;
  _hiddenByDefaultCache = /* @__PURE__ */ new Map();
  dispose() {
    this._onDidChange.dispose();
    this._disposables.dispose();
  }
  _isHiddenByDefault(menu, commandId) {
    return this._hiddenByDefaultCache.get(`${menu.id}/${commandId}`) ?? false;
  }
  setDefaultState(menu, commandId, hidden) {
    this._hiddenByDefaultCache.set(`${menu.id}/${commandId}`, hidden);
  }
  isHidden(menu, commandId) {
    const hiddenByDefault = this._isHiddenByDefault(menu, commandId);
    const state = this._data[menu.id]?.includes(commandId) ?? false;
    return hiddenByDefault ? !state : state;
  }
  updateHidden(menu, commandId, hidden) {
    const hiddenByDefault = this._isHiddenByDefault(menu, commandId);
    if (hiddenByDefault) {
      hidden = !hidden;
    }
    const entries = this._data[menu.id];
    if (hidden) {
      if (entries) {
        const idx = entries.indexOf(commandId);
        if (idx < 0) {
          entries.push(commandId);
        }
      } else {
        this._data[menu.id] = [commandId];
      }
    } else {
      if (entries) {
        const idx = entries.indexOf(commandId);
        if (idx >= 0) {
          removeFastWithoutKeepingOrder(entries, idx);
        }
        if (entries.length === 0) {
          delete this._data[menu.id];
        }
      }
    }
    this._persist();
  }
  reset(menus) {
    if (menus === void 0) {
      this._data = /* @__PURE__ */ Object.create(null);
      this._persist();
    } else {
      for (const { id } of menus) {
        if (this._data[id]) {
          delete this._data[id];
        }
      }
      this._persist();
    }
  }
  _persist() {
    try {
      this._ignoreChangeEvent = true;
      const raw = JSON.stringify(this._data);
      this._storageService.store(
        PersistedMenuHideState._key,
        raw,
        StorageScope.PROFILE,
        StorageTarget.USER
      );
    } finally {
      this._ignoreChangeEvent = false;
    }
  }
};
PersistedMenuHideState = __decorateClass([
  __decorateParam(0, IStorageService)
], PersistedMenuHideState);
class MenuInfoSnapshot {
  constructor(_id, _collectContextKeysForSubmenus) {
    this._id = _id;
    this._collectContextKeysForSubmenus = _collectContextKeysForSubmenus;
    this.refresh();
  }
  static {
    __name(this, "MenuInfoSnapshot");
  }
  _menuGroups = [];
  _allMenuIds = /* @__PURE__ */ new Set();
  _structureContextKeys = /* @__PURE__ */ new Set();
  _preconditionContextKeys = /* @__PURE__ */ new Set();
  _toggledContextKeys = /* @__PURE__ */ new Set();
  get allMenuIds() {
    return this._allMenuIds;
  }
  get structureContextKeys() {
    return this._structureContextKeys;
  }
  get preconditionContextKeys() {
    return this._preconditionContextKeys;
  }
  get toggledContextKeys() {
    return this._toggledContextKeys;
  }
  refresh() {
    this._menuGroups.length = 0;
    this._allMenuIds.clear();
    this._structureContextKeys.clear();
    this._preconditionContextKeys.clear();
    this._toggledContextKeys.clear();
    const menuItems = this._sort(MenuRegistry.getMenuItems(this._id));
    let group;
    for (const item of menuItems) {
      const groupName = item.group || "";
      if (!group || group[0] !== groupName) {
        group = [groupName, []];
        this._menuGroups.push(group);
      }
      group[1].push(item);
      this._collectContextKeysAndSubmenuIds(item);
    }
    this._allMenuIds.add(this._id);
  }
  _sort(menuItems) {
    return menuItems;
  }
  _collectContextKeysAndSubmenuIds(item) {
    MenuInfoSnapshot._fillInKbExprKeys(
      item.when,
      this._structureContextKeys
    );
    if (isIMenuItem(item)) {
      if (item.command.precondition) {
        MenuInfoSnapshot._fillInKbExprKeys(
          item.command.precondition,
          this._preconditionContextKeys
        );
      }
      if (item.command.toggled) {
        const toggledExpression = item.command.toggled.condition || item.command.toggled;
        MenuInfoSnapshot._fillInKbExprKeys(
          toggledExpression,
          this._toggledContextKeys
        );
      }
    } else if (this._collectContextKeysForSubmenus) {
      MenuRegistry.getMenuItems(item.submenu).forEach(
        this._collectContextKeysAndSubmenuIds,
        this
      );
      this._allMenuIds.add(item.submenu);
    }
  }
  static _fillInKbExprKeys(exp, set) {
    if (exp) {
      for (const key of exp.keys()) {
        set.add(key);
      }
    }
  }
}
let MenuInfo = class extends MenuInfoSnapshot {
  constructor(_id, _hiddenStates, _collectContextKeysForSubmenus, _commandService, _keybindingService, _contextKeyService) {
    super(_id, _collectContextKeysForSubmenus);
    this._hiddenStates = _hiddenStates;
    this._commandService = _commandService;
    this._keybindingService = _keybindingService;
    this._contextKeyService = _contextKeyService;
    this.refresh();
  }
  static {
    __name(this, "MenuInfo");
  }
  createActionGroups(options) {
    const result = [];
    for (const group of this._menuGroups) {
      const [id, items] = group;
      let activeActions;
      for (const item of items) {
        if (this._contextKeyService.contextMatchesRules(item.when)) {
          const isMenuItem = isIMenuItem(item);
          if (isMenuItem) {
            this._hiddenStates.setDefaultState(
              this._id,
              item.command.id,
              !!item.isHiddenByDefault
            );
          }
          const menuHide = createMenuHide(
            this._id,
            isMenuItem ? item.command : item,
            this._hiddenStates
          );
          if (isMenuItem) {
            const menuKeybinding = createConfigureKeybindingAction(
              this._commandService,
              this._keybindingService,
              item.command.id,
              item.when
            );
            (activeActions ??= []).push(
              new MenuItemAction(
                item.command,
                item.alt,
                options,
                menuHide,
                menuKeybinding,
                this._contextKeyService,
                this._commandService
              )
            );
          } else {
            const groups = new MenuInfo(
              item.submenu,
              this._hiddenStates,
              this._collectContextKeysForSubmenus,
              this._commandService,
              this._keybindingService,
              this._contextKeyService
            ).createActionGroups(options);
            const submenuActions = Separator.join(
              ...groups.map((g) => g[1])
            );
            if (submenuActions.length > 0) {
              (activeActions ??= []).push(
                new SubmenuItemAction(
                  item,
                  menuHide,
                  submenuActions
                )
              );
            }
          }
        }
      }
      if (activeActions && activeActions.length > 0) {
        result.push([id, activeActions]);
      }
    }
    return result;
  }
  _sort(menuItems) {
    return menuItems.sort(MenuInfo._compareMenuItems);
  }
  static _compareMenuItems(a, b) {
    const aGroup = a.group;
    const bGroup = b.group;
    if (aGroup !== bGroup) {
      if (!aGroup) {
        return 1;
      } else if (!bGroup) {
        return -1;
      }
      if (aGroup === "navigation") {
        return -1;
      } else if (bGroup === "navigation") {
        return 1;
      }
      const value = aGroup.localeCompare(bGroup);
      if (value !== 0) {
        return value;
      }
    }
    const aPrio = a.order || 0;
    const bPrio = b.order || 0;
    if (aPrio < bPrio) {
      return -1;
    } else if (aPrio > bPrio) {
      return 1;
    }
    return MenuInfo._compareTitles(
      isIMenuItem(a) ? a.command.title : a.title,
      isIMenuItem(b) ? b.command.title : b.title
    );
  }
  static _compareTitles(a, b) {
    const aStr = typeof a === "string" ? a : a.original;
    const bStr = typeof b === "string" ? b : b.original;
    return aStr.localeCompare(bStr);
  }
};
MenuInfo = __decorateClass([
  __decorateParam(3, ICommandService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService)
], MenuInfo);
let MenuImpl = class {
  static {
    __name(this, "MenuImpl");
  }
  _menuInfo;
  _disposables = new DisposableStore();
  _onDidChange;
  onDidChange;
  constructor(id, hiddenStates, options, commandService, keybindingService, contextKeyService) {
    this._menuInfo = new MenuInfo(
      id,
      hiddenStates,
      options.emitEventsForSubmenuChanges,
      commandService,
      keybindingService,
      contextKeyService
    );
    const rebuildMenuSoon = new RunOnceScheduler(() => {
      this._menuInfo.refresh();
      this._onDidChange.fire({
        menu: this,
        isStructuralChange: true,
        isEnablementChange: true,
        isToggleChange: true
      });
    }, options.eventDebounceDelay);
    this._disposables.add(rebuildMenuSoon);
    this._disposables.add(
      MenuRegistry.onDidChangeMenu((e) => {
        for (const id2 of this._menuInfo.allMenuIds) {
          if (e.has(id2)) {
            rebuildMenuSoon.schedule();
            break;
          }
        }
      })
    );
    const lazyListener = this._disposables.add(new DisposableStore());
    const merge = /* @__PURE__ */ __name((events) => {
      let isStructuralChange = false;
      let isEnablementChange = false;
      let isToggleChange = false;
      for (const item of events) {
        isStructuralChange = isStructuralChange || item.isStructuralChange;
        isEnablementChange = isEnablementChange || item.isEnablementChange;
        isToggleChange = isToggleChange || item.isToggleChange;
        if (isStructuralChange && isEnablementChange && isToggleChange) {
          break;
        }
      }
      return {
        menu: this,
        isStructuralChange,
        isEnablementChange,
        isToggleChange
      };
    }, "merge");
    const startLazyListener = /* @__PURE__ */ __name(() => {
      lazyListener.add(
        contextKeyService.onDidChangeContext((e) => {
          const isStructuralChange = e.affectsSome(
            this._menuInfo.structureContextKeys
          );
          const isEnablementChange = e.affectsSome(
            this._menuInfo.preconditionContextKeys
          );
          const isToggleChange = e.affectsSome(
            this._menuInfo.toggledContextKeys
          );
          if (isStructuralChange || isEnablementChange || isToggleChange) {
            this._onDidChange.fire({
              menu: this,
              isStructuralChange,
              isEnablementChange,
              isToggleChange
            });
          }
        })
      );
      lazyListener.add(
        hiddenStates.onDidChange((e) => {
          this._onDidChange.fire({
            menu: this,
            isStructuralChange: true,
            isEnablementChange: false,
            isToggleChange: false
          });
        })
      );
    }, "startLazyListener");
    this._onDidChange = new DebounceEmitter({
      // start/stop context key listener
      onWillAddFirstListener: startLazyListener,
      onDidRemoveLastListener: lazyListener.clear.bind(lazyListener),
      delay: options.eventDebounceDelay,
      merge
    });
    this.onDidChange = this._onDidChange.event;
  }
  getActions(options) {
    return this._menuInfo.createActionGroups(options);
  }
  dispose() {
    this._disposables.dispose();
    this._onDidChange.dispose();
  }
};
MenuImpl = __decorateClass([
  __decorateParam(3, ICommandService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService)
], MenuImpl);
function createMenuHide(menu, command, states) {
  const id = isISubmenuItem(command) ? command.submenu.id : command.id;
  const title = typeof command.title === "string" ? command.title : command.title.value;
  const hide = toAction({
    id: `hide/${menu.id}/${id}`,
    label: localize("hide.label", "Hide '{0}'", title),
    run() {
      states.updateHidden(menu, id, true);
    }
  });
  const toggle = toAction({
    id: `toggle/${menu.id}/${id}`,
    label: title,
    get checked() {
      return !states.isHidden(menu, id);
    },
    run() {
      states.updateHidden(menu, id, !!this.checked);
    }
  });
  return {
    hide,
    toggle,
    get isHidden() {
      return !toggle.checked;
    }
  };
}
__name(createMenuHide, "createMenuHide");
function createConfigureKeybindingAction(commandService, keybindingService, commandId, when = void 0, enabled = true) {
  return toAction({
    id: `configureKeybinding/${commandId}`,
    label: localize("configure keybinding", "Configure Keybinding"),
    enabled,
    run() {
      const hasKeybinding = !!keybindingService.lookupKeybinding(commandId);
      const whenValue = !hasKeybinding && when ? when.serialize() : void 0;
      commandService.executeCommand(
        "workbench.action.openGlobalKeybindings",
        `@command:${commandId}` + (whenValue ? ` +when:${whenValue}` : "")
      );
    }
  });
}
__name(createConfigureKeybindingAction, "createConfigureKeybindingAction");
export {
  MenuService,
  createConfigureKeybindingAction
};
//# sourceMappingURL=menuService.js.map
