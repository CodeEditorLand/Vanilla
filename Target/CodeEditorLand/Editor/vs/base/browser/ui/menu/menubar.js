var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as browser from "../../browser.js";
import * as DOM from "../../dom.js";
import { StandardKeyboardEvent } from "../../keyboardEvent.js";
import { StandardMouseEvent } from "../../mouseEvent.js";
import { EventType, Gesture, GestureEvent } from "../../touch.js";
import { cleanMnemonic, HorizontalDirection, IMenuDirection, IMenuOptions, IMenuStyles, Menu, MENU_ESCAPED_MNEMONIC_REGEX, MENU_MNEMONIC_REGEX, VerticalDirection } from "./menu.js";
import { ActionRunner, IAction, IActionRunner, Separator, SubmenuAction } from "../../../common/actions.js";
import { asArray } from "../../../common/arrays.js";
import { RunOnceScheduler } from "../../../common/async.js";
import { Codicon } from "../../../common/codicons.js";
import { ThemeIcon } from "../../../common/themables.js";
import { Emitter, Event } from "../../../common/event.js";
import { KeyCode, KeyMod, ScanCode, ScanCodeUtils } from "../../../common/keyCodes.js";
import { ResolvedKeybinding } from "../../../common/keybindings.js";
import { Disposable, DisposableStore, dispose, IDisposable } from "../../../common/lifecycle.js";
import { isMacintosh } from "../../../common/platform.js";
import * as strings from "../../../common/strings.js";
import "./menubar.css";
import * as nls from "../../../../nls.js";
import { mainWindow } from "../../window.js";
const $ = DOM.$;
var MenubarState = /* @__PURE__ */ ((MenubarState2) => {
  MenubarState2[MenubarState2["HIDDEN"] = 0] = "HIDDEN";
  MenubarState2[MenubarState2["VISIBLE"] = 1] = "VISIBLE";
  MenubarState2[MenubarState2["FOCUSED"] = 2] = "FOCUSED";
  MenubarState2[MenubarState2["OPEN"] = 3] = "OPEN";
  return MenubarState2;
})(MenubarState || {});
class MenuBar extends Disposable {
  constructor(container, options, menuStyle) {
    super();
    this.container = container;
    this.options = options;
    this.menuStyle = menuStyle;
    this.container.setAttribute("role", "menubar");
    if (this.isCompact) {
      this.container.classList.add("compact");
    }
    this.menus = [];
    this.mnemonics = /* @__PURE__ */ new Map();
    this._focusState = 1 /* VISIBLE */;
    this._onVisibilityChange = this._register(new Emitter());
    this._onFocusStateChange = this._register(new Emitter());
    this.createOverflowMenu();
    this.menuUpdater = this._register(new RunOnceScheduler(() => this.update(), 200));
    this.actionRunner = this.options.actionRunner ?? this._register(new ActionRunner());
    this._register(this.actionRunner.onWillRun(() => {
      this.setUnfocusedState();
    }));
    this._register(DOM.ModifierKeyEmitter.getInstance().event(this.onModifierKeyToggled, this));
    this._register(DOM.addDisposableListener(this.container, DOM.EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      let eventHandled = true;
      const key = !!e.key ? e.key.toLocaleLowerCase() : "";
      const tabNav = isMacintosh && !this.isCompact;
      if (event.equals(KeyCode.LeftArrow) || tabNav && event.equals(KeyCode.Tab | KeyMod.Shift)) {
        this.focusPrevious();
      } else if (event.equals(KeyCode.RightArrow) || tabNav && event.equals(KeyCode.Tab)) {
        this.focusNext();
      } else if (event.equals(KeyCode.Escape) && this.isFocused && !this.isOpen) {
        this.setUnfocusedState();
      } else if (!this.isOpen && !event.ctrlKey && this.options.enableMnemonics && this.mnemonicsInUse && this.mnemonics.has(key)) {
        const menuIndex = this.mnemonics.get(key);
        this.onMenuTriggered(menuIndex, false);
      } else {
        eventHandled = false;
      }
      if (!this.isCompact && (event.equals(KeyCode.Tab | KeyMod.Shift) || event.equals(KeyCode.Tab))) {
        event.preventDefault();
      }
      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));
    const window = DOM.getWindow(this.container);
    this._register(DOM.addDisposableListener(window, DOM.EventType.MOUSE_DOWN, () => {
      if (this.isFocused) {
        this.setUnfocusedState();
      }
    }));
    this._register(DOM.addDisposableListener(this.container, DOM.EventType.FOCUS_IN, (e) => {
      const event = e;
      if (event.relatedTarget) {
        if (!this.container.contains(event.relatedTarget)) {
          this.focusToReturn = event.relatedTarget;
        }
      }
    }));
    this._register(DOM.addDisposableListener(this.container, DOM.EventType.FOCUS_OUT, (e) => {
      const event = e;
      if (!event.relatedTarget) {
        this.setUnfocusedState();
      } else if (event.relatedTarget && !this.container.contains(event.relatedTarget)) {
        this.focusToReturn = void 0;
        this.setUnfocusedState();
      }
    }));
    this._register(DOM.addDisposableListener(window, DOM.EventType.KEY_DOWN, (e) => {
      if (!this.options.enableMnemonics || !e.altKey || e.ctrlKey || e.defaultPrevented) {
        return;
      }
      const key = e.key.toLocaleLowerCase();
      if (!this.mnemonics.has(key)) {
        return;
      }
      this.mnemonicsInUse = true;
      this.updateMnemonicVisibility(true);
      const menuIndex = this.mnemonics.get(key);
      this.onMenuTriggered(menuIndex, false);
    }));
    this.setUnfocusedState();
  }
  static {
    __name(this, "MenuBar");
  }
  static OVERFLOW_INDEX = -1;
  menus;
  overflowMenu;
  focusedMenu;
  focusToReturn;
  menuUpdater;
  // Input-related
  _mnemonicsInUse = false;
  openedViaKeyboard = false;
  awaitingAltRelease = false;
  ignoreNextMouseUp = false;
  mnemonics;
  updatePending = false;
  _focusState;
  actionRunner;
  _onVisibilityChange;
  _onFocusStateChange;
  numMenusShown = 0;
  overflowLayoutScheduled = void 0;
  menuDisposables = this._register(new DisposableStore());
  push(arg) {
    const menus = asArray(arg);
    menus.forEach((menuBarMenu) => {
      const menuIndex = this.menus.length;
      const cleanMenuLabel = cleanMnemonic(menuBarMenu.label);
      const mnemonicMatches = MENU_MNEMONIC_REGEX.exec(menuBarMenu.label);
      if (mnemonicMatches) {
        const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
        this.registerMnemonic(this.menus.length, mnemonic);
      }
      if (this.isCompact) {
        this.menus.push(menuBarMenu);
      } else {
        const buttonElement = $("div.menubar-menu-button", { "role": "menuitem", "tabindex": -1, "aria-label": cleanMenuLabel, "aria-haspopup": true });
        const titleElement = $("div.menubar-menu-title", { "role": "none", "aria-hidden": true });
        buttonElement.appendChild(titleElement);
        this.container.insertBefore(buttonElement, this.overflowMenu.buttonElement);
        this.updateLabels(titleElement, buttonElement, menuBarMenu.label);
        this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.KEY_UP, (e) => {
          const event = new StandardKeyboardEvent(e);
          let eventHandled = true;
          if ((event.equals(KeyCode.DownArrow) || event.equals(KeyCode.Enter)) && !this.isOpen) {
            this.focusedMenu = { index: menuIndex };
            this.openedViaKeyboard = true;
            this.focusState = 3 /* OPEN */;
          } else {
            eventHandled = false;
          }
          if (eventHandled) {
            event.preventDefault();
            event.stopPropagation();
          }
        }));
        this._register(Gesture.addTarget(buttonElement));
        this._register(DOM.addDisposableListener(buttonElement, EventType.Tap, (e) => {
          if (this.isOpen && this.focusedMenu && this.focusedMenu.holder && DOM.isAncestor(e.initialTarget, this.focusedMenu.holder)) {
            return;
          }
          this.ignoreNextMouseUp = false;
          this.onMenuTriggered(menuIndex, true);
          e.preventDefault();
          e.stopPropagation();
        }));
        this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_DOWN, (e) => {
          const mouseEvent = new StandardMouseEvent(DOM.getWindow(buttonElement), e);
          if (!mouseEvent.leftButton) {
            e.preventDefault();
            return;
          }
          if (!this.isOpen) {
            this.ignoreNextMouseUp = true;
            this.onMenuTriggered(menuIndex, true);
          } else {
            this.ignoreNextMouseUp = false;
          }
          e.preventDefault();
          e.stopPropagation();
        }));
        this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_UP, (e) => {
          if (e.defaultPrevented) {
            return;
          }
          if (!this.ignoreNextMouseUp) {
            if (this.isFocused) {
              this.onMenuTriggered(menuIndex, true);
            }
          } else {
            this.ignoreNextMouseUp = false;
          }
        }));
        this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_ENTER, () => {
          if (this.isOpen && !this.isCurrentMenu(menuIndex)) {
            buttonElement.focus();
            this.cleanupCustomMenu();
            this.showCustomMenu(menuIndex, false);
          } else if (this.isFocused && !this.isOpen) {
            this.focusedMenu = { index: menuIndex };
            buttonElement.focus();
          }
        }));
        this.menus.push({
          label: menuBarMenu.label,
          actions: menuBarMenu.actions,
          buttonElement,
          titleElement
        });
      }
    });
  }
  createOverflowMenu() {
    const label = this.isCompact ? nls.localize("mAppMenu", "Application Menu") : nls.localize("mMore", "More");
    const buttonElement = $("div.menubar-menu-button", { "role": "menuitem", "tabindex": this.isCompact ? 0 : -1, "aria-label": label, "aria-haspopup": true });
    const titleElement = $("div.menubar-menu-title.toolbar-toggle-more" + ThemeIcon.asCSSSelector(Codicon.menuBarMore), { "role": "none", "aria-hidden": true });
    buttonElement.appendChild(titleElement);
    this.container.appendChild(buttonElement);
    buttonElement.style.visibility = "hidden";
    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.KEY_UP, (e) => {
      const event = new StandardKeyboardEvent(e);
      let eventHandled = true;
      const triggerKeys = [KeyCode.Enter];
      if (!this.isCompact) {
        triggerKeys.push(KeyCode.DownArrow);
      } else {
        triggerKeys.push(KeyCode.Space);
        if (this.options.compactMode?.horizontal === HorizontalDirection.Right) {
          triggerKeys.push(KeyCode.RightArrow);
        } else if (this.options.compactMode?.horizontal === HorizontalDirection.Left) {
          triggerKeys.push(KeyCode.LeftArrow);
        }
      }
      if (triggerKeys.some((k) => event.equals(k)) && !this.isOpen) {
        this.focusedMenu = { index: MenuBar.OVERFLOW_INDEX };
        this.openedViaKeyboard = true;
        this.focusState = 3 /* OPEN */;
      } else {
        eventHandled = false;
      }
      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));
    this._register(Gesture.addTarget(buttonElement));
    this._register(DOM.addDisposableListener(buttonElement, EventType.Tap, (e) => {
      if (this.isOpen && this.focusedMenu && this.focusedMenu.holder && DOM.isAncestor(e.initialTarget, this.focusedMenu.holder)) {
        return;
      }
      this.ignoreNextMouseUp = false;
      this.onMenuTriggered(MenuBar.OVERFLOW_INDEX, true);
      e.preventDefault();
      e.stopPropagation();
    }));
    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_DOWN, (e) => {
      const mouseEvent = new StandardMouseEvent(DOM.getWindow(buttonElement), e);
      if (!mouseEvent.leftButton) {
        e.preventDefault();
        return;
      }
      if (!this.isOpen) {
        this.ignoreNextMouseUp = true;
        this.onMenuTriggered(MenuBar.OVERFLOW_INDEX, true);
      } else {
        this.ignoreNextMouseUp = false;
      }
      e.preventDefault();
      e.stopPropagation();
    }));
    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_UP, (e) => {
      if (e.defaultPrevented) {
        return;
      }
      if (!this.ignoreNextMouseUp) {
        if (this.isFocused) {
          this.onMenuTriggered(MenuBar.OVERFLOW_INDEX, true);
        }
      } else {
        this.ignoreNextMouseUp = false;
      }
    }));
    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_ENTER, () => {
      if (this.isOpen && !this.isCurrentMenu(MenuBar.OVERFLOW_INDEX)) {
        this.overflowMenu.buttonElement.focus();
        this.cleanupCustomMenu();
        this.showCustomMenu(MenuBar.OVERFLOW_INDEX, false);
      } else if (this.isFocused && !this.isOpen) {
        this.focusedMenu = { index: MenuBar.OVERFLOW_INDEX };
        buttonElement.focus();
      }
    }));
    this.overflowMenu = {
      buttonElement,
      titleElement,
      label: "More",
      actions: []
    };
  }
  updateMenu(menu) {
    const menuToUpdate = this.menus.filter((menuBarMenu) => menuBarMenu.label === menu.label);
    if (menuToUpdate && menuToUpdate.length) {
      menuToUpdate[0].actions = menu.actions;
    }
  }
  dispose() {
    super.dispose();
    this.menus.forEach((menuBarMenu) => {
      menuBarMenu.titleElement?.remove();
      menuBarMenu.buttonElement?.remove();
    });
    this.overflowMenu.titleElement.remove();
    this.overflowMenu.buttonElement.remove();
    dispose(this.overflowLayoutScheduled);
    this.overflowLayoutScheduled = void 0;
  }
  blur() {
    this.setUnfocusedState();
  }
  getWidth() {
    if (!this.isCompact && this.menus) {
      const left = this.menus[0].buttonElement.getBoundingClientRect().left;
      const right = this.hasOverflow ? this.overflowMenu.buttonElement.getBoundingClientRect().right : this.menus[this.menus.length - 1].buttonElement.getBoundingClientRect().right;
      return right - left;
    }
    return 0;
  }
  getHeight() {
    return this.container.clientHeight;
  }
  toggleFocus() {
    if (!this.isFocused && this.options.visibility !== "hidden") {
      this.mnemonicsInUse = true;
      this.focusedMenu = { index: this.numMenusShown > 0 ? 0 : MenuBar.OVERFLOW_INDEX };
      this.focusState = 2 /* FOCUSED */;
    } else if (!this.isOpen) {
      this.setUnfocusedState();
    }
  }
  updateOverflowAction() {
    if (!this.menus || !this.menus.length) {
      return;
    }
    const overflowMenuOnlyClass = "overflow-menu-only";
    this.container.classList.toggle(overflowMenuOnlyClass, false);
    const sizeAvailable = this.container.offsetWidth;
    let currentSize = 0;
    let full = this.isCompact;
    const prevNumMenusShown = this.numMenusShown;
    this.numMenusShown = 0;
    const showableMenus = this.menus.filter((menu) => menu.buttonElement !== void 0 && menu.titleElement !== void 0);
    for (const menuBarMenu of showableMenus) {
      if (!full) {
        const size = menuBarMenu.buttonElement.offsetWidth;
        if (currentSize + size > sizeAvailable) {
          full = true;
        } else {
          currentSize += size;
          this.numMenusShown++;
          if (this.numMenusShown > prevNumMenusShown) {
            menuBarMenu.buttonElement.style.visibility = "visible";
          }
        }
      }
      if (full) {
        menuBarMenu.buttonElement.style.visibility = "hidden";
      }
    }
    if (this.numMenusShown - 1 <= showableMenus.length / 4) {
      for (const menuBarMenu of showableMenus) {
        menuBarMenu.buttonElement.style.visibility = "hidden";
      }
      full = true;
      this.numMenusShown = 0;
      currentSize = 0;
    }
    if (this.isCompact) {
      this.overflowMenu.actions = [];
      for (let idx = this.numMenusShown; idx < this.menus.length; idx++) {
        this.overflowMenu.actions.push(new SubmenuAction(`menubar.submenu.${this.menus[idx].label}`, this.menus[idx].label, this.menus[idx].actions || []));
      }
      const compactMenuActions = this.options.getCompactMenuActions?.();
      if (compactMenuActions && compactMenuActions.length) {
        this.overflowMenu.actions.push(new Separator());
        this.overflowMenu.actions.push(...compactMenuActions);
      }
      this.overflowMenu.buttonElement.style.visibility = "visible";
    } else if (full) {
      while (currentSize + this.overflowMenu.buttonElement.offsetWidth > sizeAvailable && this.numMenusShown > 0) {
        this.numMenusShown--;
        const size = showableMenus[this.numMenusShown].buttonElement.offsetWidth;
        showableMenus[this.numMenusShown].buttonElement.style.visibility = "hidden";
        currentSize -= size;
      }
      this.overflowMenu.actions = [];
      for (let idx = this.numMenusShown; idx < showableMenus.length; idx++) {
        this.overflowMenu.actions.push(new SubmenuAction(`menubar.submenu.${showableMenus[idx].label}`, showableMenus[idx].label, showableMenus[idx].actions || []));
      }
      if (this.overflowMenu.buttonElement.nextElementSibling !== showableMenus[this.numMenusShown].buttonElement) {
        this.overflowMenu.buttonElement.remove();
        this.container.insertBefore(this.overflowMenu.buttonElement, showableMenus[this.numMenusShown].buttonElement);
      }
      this.overflowMenu.buttonElement.style.visibility = "visible";
    } else {
      this.overflowMenu.buttonElement.remove();
      this.container.appendChild(this.overflowMenu.buttonElement);
      this.overflowMenu.buttonElement.style.visibility = "hidden";
    }
    this.container.classList.toggle(overflowMenuOnlyClass, this.numMenusShown === 0);
  }
  updateLabels(titleElement, buttonElement, label) {
    const cleanMenuLabel = cleanMnemonic(label);
    if (this.options.enableMnemonics) {
      const cleanLabel = strings.escape(label);
      MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;
      let escMatch = MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
      while (escMatch && escMatch[1]) {
        escMatch = MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
      }
      const replaceDoubleEscapes = /* @__PURE__ */ __name((str) => str.replace(/&amp;&amp;/g, "&amp;"), "replaceDoubleEscapes");
      if (escMatch) {
        titleElement.innerText = "";
        titleElement.append(
          strings.ltrim(replaceDoubleEscapes(cleanLabel.substr(0, escMatch.index)), " "),
          $("mnemonic", { "aria-hidden": "true" }, escMatch[3]),
          strings.rtrim(replaceDoubleEscapes(cleanLabel.substr(escMatch.index + escMatch[0].length)), " ")
        );
      } else {
        titleElement.innerText = replaceDoubleEscapes(cleanLabel).trim();
      }
    } else {
      titleElement.innerText = cleanMenuLabel.replace(/&&/g, "&");
    }
    const mnemonicMatches = MENU_MNEMONIC_REGEX.exec(label);
    if (mnemonicMatches) {
      const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
      if (this.options.enableMnemonics) {
        buttonElement.setAttribute("aria-keyshortcuts", "Alt+" + mnemonic.toLocaleLowerCase());
      } else {
        buttonElement.removeAttribute("aria-keyshortcuts");
      }
    }
  }
  update(options) {
    if (options) {
      this.options = options;
    }
    if (this.isFocused) {
      this.updatePending = true;
      return;
    }
    this.menus.forEach((menuBarMenu) => {
      if (!menuBarMenu.buttonElement || !menuBarMenu.titleElement) {
        return;
      }
      this.updateLabels(menuBarMenu.titleElement, menuBarMenu.buttonElement, menuBarMenu.label);
    });
    if (!this.overflowLayoutScheduled) {
      this.overflowLayoutScheduled = DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this.container), () => {
        this.updateOverflowAction();
        this.overflowLayoutScheduled = void 0;
      });
    }
    this.setUnfocusedState();
  }
  registerMnemonic(menuIndex, mnemonic) {
    this.mnemonics.set(mnemonic.toLocaleLowerCase(), menuIndex);
  }
  hideMenubar() {
    if (this.container.style.display !== "none") {
      this.container.style.display = "none";
      this._onVisibilityChange.fire(false);
    }
  }
  showMenubar() {
    if (this.container.style.display !== "flex") {
      this.container.style.display = "flex";
      this._onVisibilityChange.fire(true);
      this.updateOverflowAction();
    }
  }
  get focusState() {
    return this._focusState;
  }
  set focusState(value) {
    if (this._focusState >= 2 /* FOCUSED */ && value < 2 /* FOCUSED */) {
      if (this.updatePending) {
        this.menuUpdater.schedule();
        this.updatePending = false;
      }
    }
    if (value === this._focusState) {
      return;
    }
    const isVisible = this.isVisible;
    const isOpen = this.isOpen;
    const isFocused = this.isFocused;
    this._focusState = value;
    switch (value) {
      case 0 /* HIDDEN */:
        if (isVisible) {
          this.hideMenubar();
        }
        if (isOpen) {
          this.cleanupCustomMenu();
        }
        if (isFocused) {
          this.focusedMenu = void 0;
          if (this.focusToReturn) {
            this.focusToReturn.focus();
            this.focusToReturn = void 0;
          }
        }
        break;
      case 1 /* VISIBLE */:
        if (!isVisible) {
          this.showMenubar();
        }
        if (isOpen) {
          this.cleanupCustomMenu();
        }
        if (isFocused) {
          if (this.focusedMenu) {
            if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
              this.overflowMenu.buttonElement.blur();
            } else {
              this.menus[this.focusedMenu.index].buttonElement?.blur();
            }
          }
          this.focusedMenu = void 0;
          if (this.focusToReturn) {
            this.focusToReturn.focus();
            this.focusToReturn = void 0;
          }
        }
        break;
      case 2 /* FOCUSED */:
        if (!isVisible) {
          this.showMenubar();
        }
        if (isOpen) {
          this.cleanupCustomMenu();
        }
        if (this.focusedMenu) {
          if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
            this.overflowMenu.buttonElement.focus();
          } else {
            this.menus[this.focusedMenu.index].buttonElement?.focus();
          }
        }
        break;
      case 3 /* OPEN */:
        if (!isVisible) {
          this.showMenubar();
        }
        if (this.focusedMenu) {
          this.cleanupCustomMenu();
          this.showCustomMenu(this.focusedMenu.index, this.openedViaKeyboard);
        }
        break;
    }
    this._focusState = value;
    this._onFocusStateChange.fire(this.focusState >= 2 /* FOCUSED */);
  }
  get isVisible() {
    return this.focusState >= 1 /* VISIBLE */;
  }
  get isFocused() {
    return this.focusState >= 2 /* FOCUSED */;
  }
  get isOpen() {
    return this.focusState >= 3 /* OPEN */;
  }
  get hasOverflow() {
    return this.isCompact || this.numMenusShown < this.menus.length;
  }
  get isCompact() {
    return this.options.compactMode !== void 0;
  }
  setUnfocusedState() {
    if (this.options.visibility === "toggle" || this.options.visibility === "hidden") {
      this.focusState = 0 /* HIDDEN */;
    } else if (this.options.visibility === "classic" && browser.isFullscreen(mainWindow)) {
      this.focusState = 0 /* HIDDEN */;
    } else {
      this.focusState = 1 /* VISIBLE */;
    }
    this.ignoreNextMouseUp = false;
    this.mnemonicsInUse = false;
    this.updateMnemonicVisibility(false);
  }
  focusPrevious() {
    if (!this.focusedMenu || this.numMenusShown === 0) {
      return;
    }
    let newFocusedIndex = (this.focusedMenu.index - 1 + this.numMenusShown) % this.numMenusShown;
    if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
      newFocusedIndex = this.numMenusShown - 1;
    } else if (this.focusedMenu.index === 0 && this.hasOverflow) {
      newFocusedIndex = MenuBar.OVERFLOW_INDEX;
    }
    if (newFocusedIndex === this.focusedMenu.index) {
      return;
    }
    if (this.isOpen) {
      this.cleanupCustomMenu();
      this.showCustomMenu(newFocusedIndex);
    } else if (this.isFocused) {
      this.focusedMenu.index = newFocusedIndex;
      if (newFocusedIndex === MenuBar.OVERFLOW_INDEX) {
        this.overflowMenu.buttonElement.focus();
      } else {
        this.menus[newFocusedIndex].buttonElement?.focus();
      }
    }
  }
  focusNext() {
    if (!this.focusedMenu || this.numMenusShown === 0) {
      return;
    }
    let newFocusedIndex = (this.focusedMenu.index + 1) % this.numMenusShown;
    if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
      newFocusedIndex = 0;
    } else if (this.focusedMenu.index === this.numMenusShown - 1) {
      newFocusedIndex = MenuBar.OVERFLOW_INDEX;
    }
    if (newFocusedIndex === this.focusedMenu.index) {
      return;
    }
    if (this.isOpen) {
      this.cleanupCustomMenu();
      this.showCustomMenu(newFocusedIndex);
    } else if (this.isFocused) {
      this.focusedMenu.index = newFocusedIndex;
      if (newFocusedIndex === MenuBar.OVERFLOW_INDEX) {
        this.overflowMenu.buttonElement.focus();
      } else {
        this.menus[newFocusedIndex].buttonElement?.focus();
      }
    }
  }
  updateMnemonicVisibility(visible) {
    if (this.menus) {
      this.menus.forEach((menuBarMenu) => {
        if (menuBarMenu.titleElement && menuBarMenu.titleElement.children.length) {
          const child = menuBarMenu.titleElement.children.item(0);
          if (child) {
            child.style.textDecoration = this.options.alwaysOnMnemonics || visible ? "underline" : "";
          }
        }
      });
    }
  }
  get mnemonicsInUse() {
    return this._mnemonicsInUse;
  }
  set mnemonicsInUse(value) {
    this._mnemonicsInUse = value;
  }
  get shouldAltKeyFocus() {
    if (isMacintosh) {
      return false;
    }
    if (!this.options.disableAltFocus) {
      return true;
    }
    if (this.options.visibility === "toggle") {
      return true;
    }
    return false;
  }
  get onVisibilityChange() {
    return this._onVisibilityChange.event;
  }
  get onFocusStateChange() {
    return this._onFocusStateChange.event;
  }
  onMenuTriggered(menuIndex, clicked) {
    if (this.isOpen) {
      if (this.isCurrentMenu(menuIndex)) {
        this.setUnfocusedState();
      } else {
        this.cleanupCustomMenu();
        this.showCustomMenu(menuIndex, this.openedViaKeyboard);
      }
    } else {
      this.focusedMenu = { index: menuIndex };
      this.openedViaKeyboard = !clicked;
      this.focusState = 3 /* OPEN */;
    }
  }
  onModifierKeyToggled(modifierKeyStatus) {
    const allModifiersReleased = !modifierKeyStatus.altKey && !modifierKeyStatus.ctrlKey && !modifierKeyStatus.shiftKey && !modifierKeyStatus.metaKey;
    if (this.options.visibility === "hidden") {
      return;
    }
    if (modifierKeyStatus.event && this.shouldAltKeyFocus) {
      if (ScanCodeUtils.toEnum(modifierKeyStatus.event.code) === ScanCode.AltLeft) {
        modifierKeyStatus.event.preventDefault();
      }
    }
    if (this.isFocused && modifierKeyStatus.lastKeyPressed === "alt" && modifierKeyStatus.altKey) {
      this.setUnfocusedState();
      this.mnemonicsInUse = false;
      this.awaitingAltRelease = true;
    }
    if (allModifiersReleased && modifierKeyStatus.lastKeyPressed === "alt" && modifierKeyStatus.lastKeyReleased === "alt") {
      if (!this.awaitingAltRelease) {
        if (!this.isFocused && this.shouldAltKeyFocus) {
          this.mnemonicsInUse = true;
          this.focusedMenu = { index: this.numMenusShown > 0 ? 0 : MenuBar.OVERFLOW_INDEX };
          this.focusState = 2 /* FOCUSED */;
        } else if (!this.isOpen) {
          this.setUnfocusedState();
        }
      }
    }
    if (!modifierKeyStatus.altKey && modifierKeyStatus.lastKeyReleased === "alt") {
      this.awaitingAltRelease = false;
    }
    if (this.options.enableMnemonics && this.menus && !this.isOpen) {
      this.updateMnemonicVisibility(!this.awaitingAltRelease && modifierKeyStatus.altKey || this.mnemonicsInUse);
    }
  }
  isCurrentMenu(menuIndex) {
    if (!this.focusedMenu) {
      return false;
    }
    return this.focusedMenu.index === menuIndex;
  }
  cleanupCustomMenu() {
    if (this.focusedMenu) {
      if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
        this.overflowMenu.buttonElement.focus();
      } else {
        this.menus[this.focusedMenu.index].buttonElement?.focus();
      }
      if (this.focusedMenu.holder) {
        this.focusedMenu.holder.parentElement?.classList.remove("open");
        this.focusedMenu.holder.remove();
      }
      this.focusedMenu.widget?.dispose();
      this.focusedMenu = { index: this.focusedMenu.index };
    }
    this.menuDisposables.clear();
  }
  showCustomMenu(menuIndex, selectFirst = true) {
    const actualMenuIndex = menuIndex >= this.numMenusShown ? MenuBar.OVERFLOW_INDEX : menuIndex;
    const customMenu = actualMenuIndex === MenuBar.OVERFLOW_INDEX ? this.overflowMenu : this.menus[actualMenuIndex];
    if (!customMenu.actions || !customMenu.buttonElement || !customMenu.titleElement) {
      return;
    }
    const menuHolder = $("div.menubar-menu-items-holder", { "title": "" });
    customMenu.buttonElement.classList.add("open");
    const titleBoundingRect = customMenu.titleElement.getBoundingClientRect();
    const titleBoundingRectZoom = DOM.getDomNodeZoomLevel(customMenu.titleElement);
    if (this.options.compactMode?.horizontal === HorizontalDirection.Right) {
      menuHolder.style.left = `${titleBoundingRect.left + this.container.clientWidth}px`;
    } else if (this.options.compactMode?.horizontal === HorizontalDirection.Left) {
      const windowWidth = DOM.getWindow(this.container).innerWidth;
      menuHolder.style.right = `${windowWidth - titleBoundingRect.left}px`;
      menuHolder.style.left = "auto";
    } else {
      menuHolder.style.left = `${titleBoundingRect.left * titleBoundingRectZoom}px`;
    }
    if (this.options.compactMode?.vertical === VerticalDirection.Above) {
      menuHolder.style.top = `${titleBoundingRect.top - this.menus.length * 30 + this.container.clientHeight}px`;
    } else if (this.options.compactMode?.vertical === VerticalDirection.Below) {
      menuHolder.style.top = `${titleBoundingRect.top}px`;
    } else {
      menuHolder.style.top = `${titleBoundingRect.bottom * titleBoundingRectZoom}px`;
    }
    customMenu.buttonElement.appendChild(menuHolder);
    const menuOptions = {
      getKeyBinding: this.options.getKeybinding,
      actionRunner: this.actionRunner,
      enableMnemonics: this.options.alwaysOnMnemonics || this.mnemonicsInUse && this.options.enableMnemonics,
      ariaLabel: customMenu.buttonElement.getAttribute("aria-label") ?? void 0,
      expandDirection: this.isCompact ? this.options.compactMode : { horizontal: HorizontalDirection.Right, vertical: VerticalDirection.Below },
      useEventAsContext: true
    };
    const menuWidget = this.menuDisposables.add(new Menu(menuHolder, customMenu.actions, menuOptions, this.menuStyle));
    this.menuDisposables.add(menuWidget.onDidCancel(() => {
      this.focusState = 2 /* FOCUSED */;
    }));
    if (actualMenuIndex !== menuIndex) {
      menuWidget.trigger(menuIndex - this.numMenusShown);
    } else {
      menuWidget.focus(selectFirst);
    }
    this.focusedMenu = {
      index: actualMenuIndex,
      holder: menuHolder,
      widget: menuWidget
    };
  }
}
export {
  MenuBar
};
//# sourceMappingURL=menubar.js.map
