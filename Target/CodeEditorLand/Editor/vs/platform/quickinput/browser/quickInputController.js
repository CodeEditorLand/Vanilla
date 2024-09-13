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
import * as dom from "../../../base/browser/dom.js";
import { ActionBar } from "../../../base/browser/ui/actionbar/actionbar.js";
import { Button } from "../../../base/browser/ui/button/button.js";
import { CountBadge } from "../../../base/browser/ui/countBadge/countBadge.js";
import { ProgressBar } from "../../../base/browser/ui/progressbar/progressbar.js";
import { mainWindow } from "../../../base/browser/window.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { KeyCode } from "../../../base/common/keyCodes.js";
import {
  Disposable,
  dispose
} from "../../../base/common/lifecycle.js";
import Severity from "../../../base/common/severity.js";
import { isString } from "../../../base/common/types.js";
import { localize } from "../../../nls.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { ILayoutService } from "../../layout/browser/layoutService.js";
import {
  QuickInputHideReason,
  QuickPickFocus
} from "../common/quickInput.js";
import {
  EndOfQuickInputBoxContextKey,
  InQuickInputContextKey,
  InputBox,
  QuickInputTypeContextKey,
  QuickPick,
  QuickWidget,
  backButton
} from "./quickInput.js";
import { QuickInputBox } from "./quickInputBox.js";
import { QuickInputTree } from "./quickInputTree.js";
import "./quickInputActions.js";
const $ = dom.$;
let QuickInputController = class extends Disposable {
  constructor(options, layoutService, instantiationService, contextKeyService) {
    super();
    this.options = options;
    this.layoutService = layoutService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.idPrefix = options.idPrefix;
    this._container = options.container;
    this.styles = options.styles;
    this._register(Event.runAndSubscribe(dom.onDidRegisterWindow, ({ window, disposables }) => this.registerKeyModsListeners(window, disposables), { window: mainWindow, disposables: this._store }));
    this._register(dom.onWillUnregisterWindow((window) => {
      if (this.ui && dom.getWindow(this.ui.container) === window) {
        this.reparentUI(this.layoutService.mainContainer);
        this.layout(this.layoutService.mainContainerDimension, this.layoutService.mainContainerOffset.quickPickTop);
      }
    }));
  }
  static {
    __name(this, "QuickInputController");
  }
  static MAX_WIDTH = 600;
  // Max total width of quick input widget
  idPrefix;
  ui;
  dimension;
  titleBarOffset;
  enabled = true;
  onDidAcceptEmitter = this._register(new Emitter());
  onDidCustomEmitter = this._register(new Emitter());
  onDidTriggerButtonEmitter = this._register(
    new Emitter()
  );
  keyMods = { ctrlCmd: false, alt: false };
  controller = null;
  get currentQuickInput() {
    return this.controller ?? void 0;
  }
  _container;
  get container() {
    return this._container;
  }
  styles;
  onShowEmitter = this._register(new Emitter());
  onShow = this.onShowEmitter.event;
  onHideEmitter = this._register(new Emitter());
  onHide = this.onHideEmitter.event;
  previousFocusElement;
  inQuickInputContext = InQuickInputContextKey.bindTo(
    this.contextKeyService
  );
  quickInputTypeContext = QuickInputTypeContextKey.bindTo(
    this.contextKeyService
  );
  endOfQuickInputBoxContext = EndOfQuickInputBoxContextKey.bindTo(this.contextKeyService);
  registerKeyModsListeners(window, disposables) {
    const listener = /* @__PURE__ */ __name((e) => {
      this.keyMods.ctrlCmd = e.ctrlKey || e.metaKey;
      this.keyMods.alt = e.altKey;
    }, "listener");
    for (const event of [
      dom.EventType.KEY_DOWN,
      dom.EventType.KEY_UP,
      dom.EventType.MOUSE_DOWN
    ]) {
      disposables.add(
        dom.addDisposableListener(window, event, listener, true)
      );
    }
  }
  getUI(showInActiveContainer) {
    if (this.ui) {
      if (showInActiveContainer) {
        if (dom.getWindow(this._container) !== dom.getWindow(this.layoutService.activeContainer)) {
          this.reparentUI(this.layoutService.activeContainer);
          this.layout(
            this.layoutService.activeContainerDimension,
            this.layoutService.activeContainerOffset.quickPickTop
          );
        }
      }
      return this.ui;
    }
    const container = dom.append(
      this._container,
      $(".quick-input-widget.show-file-icons")
    );
    container.tabIndex = -1;
    container.style.display = "none";
    const styleSheet = dom.createStyleSheet(container);
    const titleBar = dom.append(container, $(".quick-input-titlebar"));
    const leftActionBar = this._register(
      new ActionBar(titleBar, {
        hoverDelegate: this.options.hoverDelegate
      })
    );
    leftActionBar.domNode.classList.add("quick-input-left-action-bar");
    const title = dom.append(titleBar, $(".quick-input-title"));
    const rightActionBar = this._register(
      new ActionBar(titleBar, {
        hoverDelegate: this.options.hoverDelegate
      })
    );
    rightActionBar.domNode.classList.add("quick-input-right-action-bar");
    const headerContainer = dom.append(container, $(".quick-input-header"));
    const checkAll = dom.append(headerContainer, $("input.quick-input-check-all"));
    checkAll.type = "checkbox";
    checkAll.setAttribute(
      "aria-label",
      localize("quickInput.checkAll", "Toggle all checkboxes")
    );
    this._register(
      dom.addStandardDisposableListener(
        checkAll,
        dom.EventType.CHANGE,
        (e) => {
          const checked = checkAll.checked;
          list.setAllVisibleChecked(checked);
        }
      )
    );
    this._register(
      dom.addDisposableListener(checkAll, dom.EventType.CLICK, (e) => {
        if (e.x || e.y) {
          inputBox.setFocus();
        }
      })
    );
    const description2 = dom.append(
      headerContainer,
      $(".quick-input-description")
    );
    const inputContainer = dom.append(
      headerContainer,
      $(".quick-input-and-message")
    );
    const filterContainer = dom.append(
      inputContainer,
      $(".quick-input-filter")
    );
    const inputBox = this._register(
      new QuickInputBox(
        filterContainer,
        this.styles.inputBox,
        this.styles.toggle
      )
    );
    inputBox.setAttribute("aria-describedby", `${this.idPrefix}message`);
    const visibleCountContainer = dom.append(
      filterContainer,
      $(".quick-input-visible-count")
    );
    visibleCountContainer.setAttribute("aria-live", "polite");
    visibleCountContainer.setAttribute("aria-atomic", "true");
    const visibleCount = new CountBadge(
      visibleCountContainer,
      {
        countFormat: localize(
          {
            key: "quickInput.visibleCount",
            comment: [
              "This tells the user how many items are shown in a list of items to select from. The items can be anything. Currently not visible, but read by screen readers."
            ]
          },
          "{0} Results"
        )
      },
      this.styles.countBadge
    );
    const countContainer = dom.append(
      filterContainer,
      $(".quick-input-count")
    );
    countContainer.setAttribute("aria-live", "polite");
    const count = new CountBadge(
      countContainer,
      {
        countFormat: localize(
          {
            key: "quickInput.countSelected",
            comment: [
              "This tells the user how many items are selected in a list of items to select from. The items can be anything."
            ]
          },
          "{0} Selected"
        )
      },
      this.styles.countBadge
    );
    const inlineActionBar = this._register(
      new ActionBar(headerContainer, {
        hoverDelegate: this.options.hoverDelegate
      })
    );
    inlineActionBar.domNode.classList.add("quick-input-inline-action-bar");
    const okContainer = dom.append(
      headerContainer,
      $(".quick-input-action")
    );
    const ok = this._register(new Button(okContainer, this.styles.button));
    ok.label = localize("ok", "OK");
    this._register(
      ok.onDidClick((e) => {
        this.onDidAcceptEmitter.fire();
      })
    );
    const customButtonContainer = dom.append(
      headerContainer,
      $(".quick-input-action")
    );
    const customButton = this._register(
      new Button(customButtonContainer, {
        ...this.styles.button,
        supportIcons: true
      })
    );
    customButton.label = localize("custom", "Custom");
    this._register(
      customButton.onDidClick((e) => {
        this.onDidCustomEmitter.fire();
      })
    );
    const message = dom.append(
      inputContainer,
      $(`#${this.idPrefix}message.quick-input-message`)
    );
    const progressBar = this._register(
      new ProgressBar(container, this.styles.progressBar)
    );
    progressBar.getContainer().classList.add("quick-input-progress");
    const widget = dom.append(container, $(".quick-input-html-widget"));
    widget.tabIndex = -1;
    const description1 = dom.append(
      container,
      $(".quick-input-description")
    );
    const listId = this.idPrefix + "list";
    const list = this._register(
      this.instantiationService.createInstance(
        QuickInputTree,
        container,
        this.options.hoverDelegate,
        this.options.linkOpenerDelegate,
        listId
      )
    );
    inputBox.setAttribute("aria-controls", listId);
    this._register(
      list.onDidChangeFocus(() => {
        inputBox.setAttribute(
          "aria-activedescendant",
          list.getActiveDescendant() ?? ""
        );
      })
    );
    this._register(
      list.onChangedAllVisibleChecked((checked) => {
        checkAll.checked = checked;
      })
    );
    this._register(
      list.onChangedVisibleCount((c) => {
        visibleCount.setCount(c);
      })
    );
    this._register(
      list.onChangedCheckedCount((c) => {
        count.setCount(c);
      })
    );
    this._register(
      list.onLeave(() => {
        setTimeout(() => {
          if (!this.controller) {
            return;
          }
          inputBox.setFocus();
          if (this.controller instanceof QuickPick && this.controller.canSelectMany) {
            list.clearFocus();
          }
        }, 0);
      })
    );
    const focusTracker = dom.trackFocus(container);
    this._register(focusTracker);
    this._register(
      dom.addDisposableListener(
        container,
        dom.EventType.FOCUS,
        (e) => {
          const ui = this.getUI();
          if (dom.isAncestor(
            e.relatedTarget,
            ui.inputContainer
          )) {
            const value = ui.inputBox.isSelectionAtEnd();
            if (this.endOfQuickInputBoxContext.get() !== value) {
              this.endOfQuickInputBoxContext.set(value);
            }
          }
          if (dom.isAncestor(
            e.relatedTarget,
            ui.container
          )) {
            return;
          }
          this.inQuickInputContext.set(true);
          this.previousFocusElement = dom.isHTMLElement(
            e.relatedTarget
          ) ? e.relatedTarget : void 0;
        },
        true
      )
    );
    this._register(
      focusTracker.onDidBlur(() => {
        if (!this.getUI().ignoreFocusOut && !this.options.ignoreFocusOut()) {
          this.hide(QuickInputHideReason.Blur);
        }
        this.inQuickInputContext.set(false);
        this.endOfQuickInputBoxContext.set(false);
        this.previousFocusElement = void 0;
      })
    );
    this._register(
      inputBox.onKeyDown((_) => {
        const value = this.getUI().inputBox.isSelectionAtEnd();
        if (this.endOfQuickInputBoxContext.get() !== value) {
          this.endOfQuickInputBoxContext.set(value);
        }
      })
    );
    this._register(
      dom.addDisposableListener(
        container,
        dom.EventType.FOCUS,
        (e) => {
          inputBox.setFocus();
        }
      )
    );
    this._register(
      dom.addStandardDisposableListener(
        container,
        dom.EventType.KEY_DOWN,
        (event) => {
          if (dom.isAncestor(event.target, widget)) {
            return;
          }
          switch (event.keyCode) {
            case KeyCode.Enter:
              dom.EventHelper.stop(event, true);
              if (this.enabled) {
                this.onDidAcceptEmitter.fire();
              }
              break;
            case KeyCode.Escape:
              dom.EventHelper.stop(event, true);
              this.hide(QuickInputHideReason.Gesture);
              break;
            case KeyCode.Tab:
              if (!event.altKey && !event.ctrlKey && !event.metaKey) {
                const selectors = [
                  ".quick-input-list .monaco-action-bar .always-visible",
                  ".quick-input-list-entry:hover .monaco-action-bar",
                  ".monaco-list-row.focused .monaco-action-bar"
                ];
                if (container.classList.contains(
                  "show-checkboxes"
                )) {
                  selectors.push("input");
                } else {
                  selectors.push("input[type=text]");
                }
                if (this.getUI().list.displayed) {
                  selectors.push(".monaco-list");
                }
                if (this.getUI().message) {
                  selectors.push(".quick-input-message a");
                }
                if (this.getUI().widget) {
                  if (dom.isAncestor(
                    event.target,
                    this.getUI().widget
                  )) {
                    break;
                  }
                  selectors.push(".quick-input-html-widget");
                }
                const stops = container.querySelectorAll(
                  selectors.join(", ")
                );
                if (event.shiftKey && event.target === stops[0]) {
                  dom.EventHelper.stop(event, true);
                  list.clearFocus();
                } else if (!event.shiftKey && dom.isAncestor(
                  event.target,
                  stops[stops.length - 1]
                )) {
                  dom.EventHelper.stop(event, true);
                  stops[0].focus();
                }
              }
              break;
            case KeyCode.Space:
              if (event.ctrlKey) {
                dom.EventHelper.stop(event, true);
                this.getUI().list.toggleHover();
              }
              break;
          }
        }
      )
    );
    this.ui = {
      container,
      styleSheet,
      leftActionBar,
      titleBar,
      title,
      description1,
      description2,
      widget,
      rightActionBar,
      inlineActionBar,
      checkAll,
      inputContainer,
      filterContainer,
      inputBox,
      visibleCountContainer,
      visibleCount,
      countContainer,
      count,
      okContainer,
      ok,
      message,
      customButtonContainer,
      customButton,
      list,
      progressBar,
      onDidAccept: this.onDidAcceptEmitter.event,
      onDidCustom: this.onDidCustomEmitter.event,
      onDidTriggerButton: this.onDidTriggerButtonEmitter.event,
      ignoreFocusOut: false,
      keyMods: this.keyMods,
      show: /* @__PURE__ */ __name((controller) => this.show(controller), "show"),
      hide: /* @__PURE__ */ __name(() => this.hide(), "hide"),
      setVisibilities: /* @__PURE__ */ __name((visibilities) => this.setVisibilities(visibilities), "setVisibilities"),
      setEnabled: /* @__PURE__ */ __name((enabled) => this.setEnabled(enabled), "setEnabled"),
      setContextKey: /* @__PURE__ */ __name((contextKey) => this.options.setContextKey(contextKey), "setContextKey"),
      linkOpenerDelegate: /* @__PURE__ */ __name((content) => this.options.linkOpenerDelegate(content), "linkOpenerDelegate")
    };
    this.updateStyles();
    return this.ui;
  }
  reparentUI(container) {
    if (this.ui) {
      this._container = container;
      dom.append(this._container, this.ui.container);
    }
  }
  pick(picks, options = {}, token = CancellationToken.None) {
    return new Promise((doResolve, reject) => {
      let resolve = /* @__PURE__ */ __name((result) => {
        resolve = doResolve;
        options.onKeyMods?.(input.keyMods);
        doResolve(result);
      }, "resolve");
      if (token.isCancellationRequested) {
        resolve(void 0);
        return;
      }
      const input = this.createQuickPick({ useSeparators: true });
      let activeItem;
      const disposables = [
        input,
        input.onDidAccept(() => {
          if (input.canSelectMany) {
            resolve(input.selectedItems.slice());
            input.hide();
          } else {
            const result = input.activeItems[0];
            if (result) {
              resolve(result);
              input.hide();
            }
          }
        }),
        input.onDidChangeActive((items) => {
          const focused = items[0];
          if (focused && options.onDidFocus) {
            options.onDidFocus(focused);
          }
        }),
        input.onDidChangeSelection((items) => {
          if (!input.canSelectMany) {
            const result = items[0];
            if (result) {
              resolve(result);
              input.hide();
            }
          }
        }),
        input.onDidTriggerItemButton(
          (event) => options.onDidTriggerItemButton && options.onDidTriggerItemButton({
            ...event,
            removeItem: /* @__PURE__ */ __name(() => {
              const index = input.items.indexOf(event.item);
              if (index !== -1) {
                const items = input.items.slice();
                const removed = items.splice(index, 1);
                const activeItems = input.activeItems.filter(
                  (activeItem2) => activeItem2 !== removed[0]
                );
                const keepScrollPositionBefore = input.keepScrollPosition;
                input.keepScrollPosition = true;
                input.items = items;
                if (activeItems) {
                  input.activeItems = activeItems;
                }
                input.keepScrollPosition = keepScrollPositionBefore;
              }
            }, "removeItem")
          })
        ),
        input.onDidTriggerSeparatorButton(
          (event) => options.onDidTriggerSeparatorButton?.(event)
        ),
        input.onDidChangeValue((value) => {
          if (activeItem && !value && (input.activeItems.length !== 1 || input.activeItems[0] !== activeItem)) {
            input.activeItems = [activeItem];
          }
        }),
        token.onCancellationRequested(() => {
          input.hide();
        }),
        input.onDidHide(() => {
          dispose(disposables);
          resolve(void 0);
        })
      ];
      input.title = options.title;
      if (options.value) {
        input.value = options.value;
      }
      input.canSelectMany = !!options.canPickMany;
      input.placeholder = options.placeHolder;
      input.ignoreFocusOut = !!options.ignoreFocusLost;
      input.matchOnDescription = !!options.matchOnDescription;
      input.matchOnDetail = !!options.matchOnDetail;
      input.matchOnLabel = options.matchOnLabel === void 0 || options.matchOnLabel;
      input.quickNavigate = options.quickNavigate;
      input.hideInput = !!options.hideInput;
      input.contextKey = options.contextKey;
      input.busy = true;
      Promise.all([picks, options.activeItem]).then(
        ([items, _activeItem]) => {
          activeItem = _activeItem;
          input.busy = false;
          input.items = items;
          if (input.canSelectMany) {
            input.selectedItems = items.filter(
              (item) => item.type !== "separator" && item.picked
            );
          }
          if (activeItem) {
            input.activeItems = [activeItem];
          }
        }
      );
      input.show();
      Promise.resolve(picks).then(void 0, (err) => {
        reject(err);
        input.hide();
      });
    });
  }
  setValidationOnInput(input, validationResult) {
    if (validationResult && isString(validationResult)) {
      input.severity = Severity.Error;
      input.validationMessage = validationResult;
    } else if (validationResult && !isString(validationResult)) {
      input.severity = validationResult.severity;
      input.validationMessage = validationResult.content;
    } else {
      input.severity = Severity.Ignore;
      input.validationMessage = void 0;
    }
  }
  input(options = {}, token = CancellationToken.None) {
    return new Promise((resolve) => {
      if (token.isCancellationRequested) {
        resolve(void 0);
        return;
      }
      const input = this.createInputBox();
      const validateInput = options.validateInput || (() => Promise.resolve(void 0));
      const onDidValueChange = Event.debounce(
        input.onDidChangeValue,
        (last, cur) => cur,
        100
      );
      let validationValue = options.value || "";
      let validation = Promise.resolve(validateInput(validationValue));
      const disposables = [
        input,
        onDidValueChange((value) => {
          if (value !== validationValue) {
            validation = Promise.resolve(validateInput(value));
            validationValue = value;
          }
          validation.then((result) => {
            if (value === validationValue) {
              this.setValidationOnInput(input, result);
            }
          });
        }),
        input.onDidAccept(() => {
          const value = input.value;
          if (value !== validationValue) {
            validation = Promise.resolve(validateInput(value));
            validationValue = value;
          }
          validation.then((result) => {
            if (!result || !isString(result) && result.severity !== Severity.Error) {
              resolve(value);
              input.hide();
            } else if (value === validationValue) {
              this.setValidationOnInput(input, result);
            }
          });
        }),
        token.onCancellationRequested(() => {
          input.hide();
        }),
        input.onDidHide(() => {
          dispose(disposables);
          resolve(void 0);
        })
      ];
      input.title = options.title;
      input.value = options.value || "";
      input.valueSelection = options.valueSelection;
      input.prompt = options.prompt;
      input.placeholder = options.placeHolder;
      input.password = !!options.password;
      input.ignoreFocusOut = !!options.ignoreFocusLost;
      input.show();
    });
  }
  backButton = backButton;
  createQuickPick(options = { useSeparators: false }) {
    const ui = this.getUI(true);
    return new QuickPick(ui);
  }
  createInputBox() {
    const ui = this.getUI(true);
    return new InputBox(ui);
  }
  createQuickWidget() {
    const ui = this.getUI(true);
    return new QuickWidget(ui);
  }
  show(controller) {
    const ui = this.getUI(true);
    this.onShowEmitter.fire();
    const oldController = this.controller;
    this.controller = controller;
    oldController?.didHide();
    this.setEnabled(true);
    ui.leftActionBar.clear();
    ui.title.textContent = "";
    ui.description1.textContent = "";
    ui.description2.textContent = "";
    dom.reset(ui.widget);
    ui.rightActionBar.clear();
    ui.inlineActionBar.clear();
    ui.checkAll.checked = false;
    ui.inputBox.placeholder = "";
    ui.inputBox.password = false;
    ui.inputBox.showDecoration(Severity.Ignore);
    ui.visibleCount.setCount(0);
    ui.count.setCount(0);
    dom.reset(ui.message);
    ui.progressBar.stop();
    ui.list.setElements([]);
    ui.list.matchOnDescription = false;
    ui.list.matchOnDetail = false;
    ui.list.matchOnLabel = true;
    ui.list.sortByLabel = true;
    ui.ignoreFocusOut = false;
    ui.inputBox.toggles = void 0;
    const backKeybindingLabel = this.options.backKeybindingLabel();
    backButton.tooltip = backKeybindingLabel ? localize(
      "quickInput.backWithKeybinding",
      "Back ({0})",
      backKeybindingLabel
    ) : localize("quickInput.back", "Back");
    ui.container.style.display = "";
    this.updateLayout();
    ui.inputBox.setFocus();
    this.quickInputTypeContext.set(controller.type);
  }
  isVisible() {
    return !!this.ui && this.ui.container.style.display !== "none";
  }
  setVisibilities(visibilities) {
    const ui = this.getUI();
    ui.title.style.display = visibilities.title ? "" : "none";
    ui.description1.style.display = visibilities.description && (visibilities.inputBox || visibilities.checkAll) ? "" : "none";
    ui.description2.style.display = visibilities.description && !(visibilities.inputBox || visibilities.checkAll) ? "" : "none";
    ui.checkAll.style.display = visibilities.checkAll ? "" : "none";
    ui.inputContainer.style.display = visibilities.inputBox ? "" : "none";
    ui.filterContainer.style.display = visibilities.inputBox ? "" : "none";
    ui.visibleCountContainer.style.display = visibilities.visibleCount ? "" : "none";
    ui.countContainer.style.display = visibilities.count ? "" : "none";
    ui.okContainer.style.display = visibilities.ok ? "" : "none";
    ui.customButtonContainer.style.display = visibilities.customButton ? "" : "none";
    ui.message.style.display = visibilities.message ? "" : "none";
    ui.progressBar.getContainer().style.display = visibilities.progressBar ? "" : "none";
    ui.list.displayed = !!visibilities.list;
    ui.container.classList.toggle(
      "show-checkboxes",
      !!visibilities.checkBox
    );
    ui.container.classList.toggle(
      "hidden-input",
      !visibilities.inputBox && !visibilities.description
    );
    this.updateLayout();
  }
  setEnabled(enabled) {
    if (enabled !== this.enabled) {
      this.enabled = enabled;
      for (const item of this.getUI().leftActionBar.viewItems) {
        item.action.enabled = enabled;
      }
      for (const item of this.getUI().rightActionBar.viewItems) {
        item.action.enabled = enabled;
      }
      this.getUI().checkAll.disabled = !enabled;
      this.getUI().inputBox.enabled = enabled;
      this.getUI().ok.enabled = enabled;
      this.getUI().list.enabled = enabled;
    }
  }
  hide(reason) {
    const controller = this.controller;
    if (!controller) {
      return;
    }
    controller.willHide(reason);
    const container = this.ui?.container;
    const focusChanged = container && !dom.isAncestorOfActiveElement(container);
    this.controller = null;
    this.onHideEmitter.fire();
    if (container) {
      container.style.display = "none";
    }
    if (!focusChanged) {
      let currentElement = this.previousFocusElement;
      while (currentElement && !currentElement.offsetParent) {
        currentElement = currentElement.parentElement ?? void 0;
      }
      if (currentElement?.offsetParent) {
        currentElement.focus();
        this.previousFocusElement = void 0;
      } else {
        this.options.returnFocus();
      }
    }
    controller.didHide(reason);
  }
  focus() {
    if (this.isVisible()) {
      const ui = this.getUI();
      if (ui.inputBox.enabled) {
        ui.inputBox.setFocus();
      } else {
        ui.list.domFocus();
      }
    }
  }
  toggle() {
    if (this.isVisible() && this.controller instanceof QuickPick && this.controller.canSelectMany) {
      this.getUI().list.toggleCheckbox();
    }
  }
  navigate(next, quickNavigate) {
    if (this.isVisible() && this.getUI().list.displayed) {
      this.getUI().list.focus(
        next ? QuickPickFocus.Next : QuickPickFocus.Previous
      );
      if (quickNavigate && this.controller instanceof QuickPick) {
        this.controller.quickNavigate = quickNavigate;
      }
    }
  }
  async accept(keyMods = { alt: false, ctrlCmd: false }) {
    this.keyMods.alt = keyMods.alt;
    this.keyMods.ctrlCmd = keyMods.ctrlCmd;
    this.onDidAcceptEmitter.fire();
  }
  async back() {
    this.onDidTriggerButtonEmitter.fire(this.backButton);
  }
  async cancel() {
    this.hide();
  }
  layout(dimension, titleBarOffset) {
    this.dimension = dimension;
    this.titleBarOffset = titleBarOffset;
    this.updateLayout();
  }
  updateLayout() {
    if (this.ui && this.isVisible()) {
      this.ui.container.style.top = `${this.titleBarOffset}px`;
      const style = this.ui.container.style;
      const width = Math.min(
        this.dimension.width * 0.62,
        QuickInputController.MAX_WIDTH
      );
      style.width = width + "px";
      style.marginLeft = "-" + width / 2 + "px";
      this.ui.inputBox.layout();
      this.ui.list.layout(this.dimension && this.dimension.height * 0.4);
    }
  }
  applyStyles(styles) {
    this.styles = styles;
    this.updateStyles();
  }
  updateStyles() {
    if (this.ui) {
      const {
        quickInputTitleBackground,
        quickInputBackground,
        quickInputForeground,
        widgetBorder,
        widgetShadow
      } = this.styles.widget;
      this.ui.titleBar.style.backgroundColor = quickInputTitleBackground ?? "";
      this.ui.container.style.backgroundColor = quickInputBackground ?? "";
      this.ui.container.style.color = quickInputForeground ?? "";
      this.ui.container.style.border = widgetBorder ? `1px solid ${widgetBorder}` : "";
      this.ui.container.style.boxShadow = widgetShadow ? `0 0 8px 2px ${widgetShadow}` : "";
      this.ui.list.style(this.styles.list);
      const content = [];
      if (this.styles.pickerGroup.pickerGroupBorder) {
        content.push(
          `.quick-input-list .quick-input-list-entry { border-top-color:  ${this.styles.pickerGroup.pickerGroupBorder}; }`
        );
      }
      if (this.styles.pickerGroup.pickerGroupForeground) {
        content.push(
          `.quick-input-list .quick-input-list-separator { color:  ${this.styles.pickerGroup.pickerGroupForeground}; }`
        );
      }
      if (this.styles.pickerGroup.pickerGroupForeground) {
        content.push(
          `.quick-input-list .quick-input-list-separator-as-item { color: var(--vscode-descriptionForeground); }`
        );
      }
      if (this.styles.keybindingLabel.keybindingLabelBackground || this.styles.keybindingLabel.keybindingLabelBorder || this.styles.keybindingLabel.keybindingLabelBottomBorder || this.styles.keybindingLabel.keybindingLabelShadow || this.styles.keybindingLabel.keybindingLabelForeground) {
        content.push(
          ".quick-input-list .monaco-keybinding > .monaco-keybinding-key {"
        );
        if (this.styles.keybindingLabel.keybindingLabelBackground) {
          content.push(
            `background-color: ${this.styles.keybindingLabel.keybindingLabelBackground};`
          );
        }
        if (this.styles.keybindingLabel.keybindingLabelBorder) {
          content.push(
            `border-color: ${this.styles.keybindingLabel.keybindingLabelBorder};`
          );
        }
        if (this.styles.keybindingLabel.keybindingLabelBottomBorder) {
          content.push(
            `border-bottom-color: ${this.styles.keybindingLabel.keybindingLabelBottomBorder};`
          );
        }
        if (this.styles.keybindingLabel.keybindingLabelShadow) {
          content.push(
            `box-shadow: inset 0 -1px 0 ${this.styles.keybindingLabel.keybindingLabelShadow};`
          );
        }
        if (this.styles.keybindingLabel.keybindingLabelForeground) {
          content.push(
            `color: ${this.styles.keybindingLabel.keybindingLabelForeground};`
          );
        }
        content.push("}");
      }
      const newStyles = content.join("\n");
      if (newStyles !== this.ui.styleSheet.textContent) {
        this.ui.styleSheet.textContent = newStyles;
      }
    }
  }
};
QuickInputController = __decorateClass([
  __decorateParam(1, ILayoutService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService)
], QuickInputController);
export {
  QuickInputController
};
//# sourceMappingURL=quickInputController.js.map
