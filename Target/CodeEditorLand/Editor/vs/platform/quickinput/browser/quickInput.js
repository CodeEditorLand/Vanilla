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
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import {
  Toggle
} from "../../../base/browser/ui/toggle/toggle.js";
import { equals } from "../../../base/common/arrays.js";
import { TimeoutTimer } from "../../../base/common/async.js";
import { Codicon } from "../../../base/common/codicons.js";
import {
  Emitter,
  EventBufferer
} from "../../../base/common/event.js";
import { KeyCode } from "../../../base/common/keyCodes.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { isIOS } from "../../../base/common/platform.js";
import Severity from "../../../base/common/severity.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import "./media/quickInput.css";
import { localize } from "../../../nls.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import {
  ContextKeyExpr,
  RawContextKey
} from "../../contextkey/common/contextkey.js";
import {
  IHoverService,
  WorkbenchHoverDelegate
} from "../../hover/browser/hover.js";
import {
  ItemActivation,
  NO_KEY_MODS,
  QuickInputButtonLocation,
  QuickInputHideReason,
  QuickInputType,
  QuickPickFocus
} from "../common/quickInput.js";
import {
  quickInputButtonToAction,
  renderQuickInputDescription
} from "./quickInputUtils.js";
const inQuickInputContextKeyValue = "inQuickInput";
const InQuickInputContextKey = new RawContextKey(
  inQuickInputContextKeyValue,
  false,
  localize(
    "inQuickInput",
    "Whether keyboard focus is inside the quick input control"
  )
);
const inQuickInputContext = ContextKeyExpr.has(
  inQuickInputContextKeyValue
);
const quickInputTypeContextKeyValue = "quickInputType";
const QuickInputTypeContextKey = new RawContextKey(
  quickInputTypeContextKeyValue,
  void 0,
  localize("quickInputType", "The type of the currently visible quick input")
);
const endOfQuickInputBoxContextKeyValue = "cursorAtEndOfQuickInputBox";
const EndOfQuickInputBoxContextKey = new RawContextKey(
  endOfQuickInputBoxContextKeyValue,
  false,
  localize(
    "cursorAtEndOfQuickInputBox",
    "Whether the cursor in the quick input is at the end of the input box"
  )
);
const endOfQuickInputBoxContext = ContextKeyExpr.has(
  endOfQuickInputBoxContextKeyValue
);
const backButton = {
  iconClass: ThemeIcon.asClassName(Codicon.quickInputBack),
  tooltip: localize("quickInput.back", "Back"),
  handle: -1
  // TODO
};
class QuickInput extends Disposable {
  constructor(ui) {
    super();
    this.ui = ui;
  }
  static {
    __name(this, "QuickInput");
  }
  static noPromptMessage = localize(
    "inputModeEntry",
    "Press 'Enter' to confirm your input or 'Escape' to cancel"
  );
  _title;
  _description;
  _widget;
  _widgetUpdated = false;
  _steps;
  _totalSteps;
  visible = false;
  _enabled = true;
  _contextKey;
  _busy = false;
  _ignoreFocusOut = false;
  _leftButtons = [];
  _rightButtons = [];
  _inlineButtons = [];
  buttonsUpdated = false;
  _toggles = [];
  togglesUpdated = false;
  noValidationMessage = QuickInput.noPromptMessage;
  _validationMessage;
  _lastValidationMessage;
  _severity = Severity.Ignore;
  _lastSeverity;
  onDidTriggerButtonEmitter = this._register(
    new Emitter()
  );
  onDidHideEmitter = this._register(
    new Emitter()
  );
  onWillHideEmitter = this._register(
    new Emitter()
  );
  onDisposeEmitter = this._register(new Emitter());
  visibleDisposables = this._register(
    new DisposableStore()
  );
  busyDelay;
  get title() {
    return this._title;
  }
  set title(title) {
    this._title = title;
    this.update();
  }
  get description() {
    return this._description;
  }
  set description(description) {
    this._description = description;
    this.update();
  }
  get widget() {
    return this._widget;
  }
  set widget(widget) {
    if (!dom.isHTMLElement(widget)) {
      return;
    }
    if (this._widget !== widget) {
      this._widget = widget;
      this._widgetUpdated = true;
      this.update();
    }
  }
  get step() {
    return this._steps;
  }
  set step(step) {
    this._steps = step;
    this.update();
  }
  get totalSteps() {
    return this._totalSteps;
  }
  set totalSteps(totalSteps) {
    this._totalSteps = totalSteps;
    this.update();
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(enabled) {
    this._enabled = enabled;
    this.update();
  }
  get contextKey() {
    return this._contextKey;
  }
  set contextKey(contextKey) {
    this._contextKey = contextKey;
    this.update();
  }
  get busy() {
    return this._busy;
  }
  set busy(busy) {
    this._busy = busy;
    this.update();
  }
  get ignoreFocusOut() {
    return this._ignoreFocusOut;
  }
  set ignoreFocusOut(ignoreFocusOut) {
    const shouldUpdate = this._ignoreFocusOut !== ignoreFocusOut && !isIOS;
    this._ignoreFocusOut = ignoreFocusOut && !isIOS;
    if (shouldUpdate) {
      this.update();
    }
  }
  get titleButtons() {
    return this._leftButtons.length ? [...this._leftButtons, this._rightButtons] : this._rightButtons;
  }
  get buttons() {
    return [
      ...this._leftButtons,
      ...this._rightButtons,
      ...this._inlineButtons
    ];
  }
  set buttons(buttons) {
    this._leftButtons = buttons.filter((b) => b === backButton);
    this._rightButtons = buttons.filter(
      (b) => b !== backButton && b.location !== QuickInputButtonLocation.Inline
    );
    this._inlineButtons = buttons.filter(
      (b) => b.location === QuickInputButtonLocation.Inline
    );
    this.buttonsUpdated = true;
    this.update();
  }
  get toggles() {
    return this._toggles;
  }
  set toggles(toggles) {
    this._toggles = toggles ?? [];
    this.togglesUpdated = true;
    this.update();
  }
  get validationMessage() {
    return this._validationMessage;
  }
  set validationMessage(validationMessage) {
    this._validationMessage = validationMessage;
    this.update();
  }
  get severity() {
    return this._severity;
  }
  set severity(severity) {
    this._severity = severity;
    this.update();
  }
  onDidTriggerButton = this.onDidTriggerButtonEmitter.event;
  show() {
    if (this.visible) {
      return;
    }
    this.visibleDisposables.add(
      this.ui.onDidTriggerButton((button) => {
        if (this.buttons.indexOf(button) !== -1) {
          this.onDidTriggerButtonEmitter.fire(button);
        }
      })
    );
    this.ui.show(this);
    this.visible = true;
    this._lastValidationMessage = void 0;
    this._lastSeverity = void 0;
    if (this.buttons.length) {
      this.buttonsUpdated = true;
    }
    if (this.toggles.length) {
      this.togglesUpdated = true;
    }
    this.update();
  }
  hide() {
    if (!this.visible) {
      return;
    }
    this.ui.hide();
  }
  didHide(reason = QuickInputHideReason.Other) {
    this.visible = false;
    this.visibleDisposables.clear();
    this.onDidHideEmitter.fire({ reason });
  }
  onDidHide = this.onDidHideEmitter.event;
  willHide(reason = QuickInputHideReason.Other) {
    this.onWillHideEmitter.fire({ reason });
  }
  onWillHide = this.onWillHideEmitter.event;
  update() {
    if (!this.visible) {
      return;
    }
    const title = this.getTitle();
    if (title && this.ui.title.textContent !== title) {
      this.ui.title.textContent = title;
    } else if (!title && this.ui.title.innerHTML !== "&nbsp;") {
      this.ui.title.innerText = "\xA0";
    }
    const description = this.getDescription();
    if (this.ui.description1.textContent !== description) {
      this.ui.description1.textContent = description;
    }
    if (this.ui.description2.textContent !== description) {
      this.ui.description2.textContent = description;
    }
    if (this._widgetUpdated) {
      this._widgetUpdated = false;
      if (this._widget) {
        dom.reset(this.ui.widget, this._widget);
      } else {
        dom.reset(this.ui.widget);
      }
    }
    if (this.busy && !this.busyDelay) {
      this.busyDelay = new TimeoutTimer();
      this.busyDelay.setIfNotSet(() => {
        if (this.visible) {
          this.ui.progressBar.infinite();
        }
      }, 800);
    }
    if (!this.busy && this.busyDelay) {
      this.ui.progressBar.stop();
      this.busyDelay.cancel();
      this.busyDelay = void 0;
    }
    if (this.buttonsUpdated) {
      this.buttonsUpdated = false;
      this.ui.leftActionBar.clear();
      const leftButtons = this._leftButtons.map(
        (button, index) => quickInputButtonToAction(
          button,
          `id-${index}`,
          async () => this.onDidTriggerButtonEmitter.fire(button)
        )
      );
      this.ui.leftActionBar.push(leftButtons, {
        icon: true,
        label: false
      });
      this.ui.rightActionBar.clear();
      const rightButtons = this._rightButtons.map(
        (button, index) => quickInputButtonToAction(
          button,
          `id-${index}`,
          async () => this.onDidTriggerButtonEmitter.fire(button)
        )
      );
      this.ui.rightActionBar.push(rightButtons, {
        icon: true,
        label: false
      });
      this.ui.inlineActionBar.clear();
      const inlineButtons = this._inlineButtons.map(
        (button, index) => quickInputButtonToAction(
          button,
          `id-${index}`,
          async () => this.onDidTriggerButtonEmitter.fire(button)
        )
      );
      this.ui.inlineActionBar.push(inlineButtons, {
        icon: true,
        label: false
      });
    }
    if (this.togglesUpdated) {
      this.togglesUpdated = false;
      const concreteToggles = this.toggles?.filter(
        (opts) => opts instanceof Toggle
      ) ?? [];
      this.ui.inputBox.toggles = concreteToggles;
    }
    this.ui.ignoreFocusOut = this.ignoreFocusOut;
    this.ui.setEnabled(this.enabled);
    this.ui.setContextKey(this.contextKey);
    const validationMessage = this.validationMessage || this.noValidationMessage;
    if (this._lastValidationMessage !== validationMessage) {
      this._lastValidationMessage = validationMessage;
      dom.reset(this.ui.message);
      renderQuickInputDescription(validationMessage, this.ui.message, {
        callback: /* @__PURE__ */ __name((content) => {
          this.ui.linkOpenerDelegate(content);
        }, "callback"),
        disposables: this.visibleDisposables
      });
    }
    if (this._lastSeverity !== this.severity) {
      this._lastSeverity = this.severity;
      this.showMessageDecoration(this.severity);
    }
  }
  getTitle() {
    if (this.title && this.step) {
      return `${this.title} (${this.getSteps()})`;
    }
    if (this.title) {
      return this.title;
    }
    if (this.step) {
      return this.getSteps();
    }
    return "";
  }
  getDescription() {
    return this.description || "";
  }
  getSteps() {
    if (this.step && this.totalSteps) {
      return localize(
        "quickInput.steps",
        "{0}/{1}",
        this.step,
        this.totalSteps
      );
    }
    if (this.step) {
      return String(this.step);
    }
    return "";
  }
  showMessageDecoration(severity) {
    this.ui.inputBox.showDecoration(severity);
    if (severity !== Severity.Ignore) {
      const styles = this.ui.inputBox.stylesForType(severity);
      this.ui.message.style.color = styles.foreground ? `${styles.foreground}` : "";
      this.ui.message.style.backgroundColor = styles.background ? `${styles.background}` : "";
      this.ui.message.style.border = styles.border ? `1px solid ${styles.border}` : "";
      this.ui.message.style.marginBottom = "-2px";
    } else {
      this.ui.message.style.color = "";
      this.ui.message.style.backgroundColor = "";
      this.ui.message.style.border = "";
      this.ui.message.style.marginBottom = "";
    }
  }
  onDispose = this.onDisposeEmitter.event;
  dispose() {
    this.hide();
    this.onDisposeEmitter.fire();
    super.dispose();
  }
}
class QuickPick extends QuickInput {
  static {
    __name(this, "QuickPick");
  }
  static DEFAULT_ARIA_LABEL = localize(
    "quickInputBox.ariaLabel",
    "Type to narrow down results."
  );
  _value = "";
  _ariaLabel;
  _placeholder;
  onDidChangeValueEmitter = this._register(
    new Emitter()
  );
  onWillAcceptEmitter = this._register(
    new Emitter()
  );
  onDidAcceptEmitter = this._register(
    new Emitter()
  );
  onDidCustomEmitter = this._register(new Emitter());
  _items = [];
  itemsUpdated = false;
  _canSelectMany = false;
  _canAcceptInBackground = false;
  _matchOnDescription = false;
  _matchOnDetail = false;
  _matchOnLabel = true;
  _matchOnLabelMode = "fuzzy";
  _sortByLabel = true;
  _keepScrollPosition = false;
  _itemActivation = ItemActivation.FIRST;
  _activeItems = [];
  activeItemsUpdated = false;
  activeItemsToConfirm = [];
  onDidChangeActiveEmitter = this._register(
    new Emitter()
  );
  _selectedItems = [];
  selectedItemsUpdated = false;
  selectedItemsToConfirm = [];
  onDidChangeSelectionEmitter = this._register(
    new Emitter()
  );
  onDidTriggerItemButtonEmitter = this._register(
    new Emitter()
  );
  onDidTriggerSeparatorButtonEmitter = this._register(
    new Emitter()
  );
  _valueSelection;
  valueSelectionUpdated = true;
  _ok = "default";
  _customButton = false;
  _customButtonLabel;
  _customButtonHover;
  _quickNavigate;
  _hideInput;
  _hideCountBadge;
  _hideCheckAll;
  _focusEventBufferer = new EventBufferer();
  type = QuickInputType.QuickPick;
  get quickNavigate() {
    return this._quickNavigate;
  }
  set quickNavigate(quickNavigate) {
    this._quickNavigate = quickNavigate;
    this.update();
  }
  get value() {
    return this._value;
  }
  set value(value) {
    this.doSetValue(value);
  }
  doSetValue(value, skipUpdate) {
    if (this._value !== value) {
      this._value = value;
      if (!skipUpdate) {
        this.update();
      }
      if (this.visible) {
        const didFilter = this.ui.list.filter(
          this.filterValue(this._value)
        );
        if (didFilter) {
          this.trySelectFirst();
        }
      }
      this.onDidChangeValueEmitter.fire(this._value);
    }
  }
  filterValue = /* @__PURE__ */ __name((value) => value, "filterValue");
  set ariaLabel(ariaLabel) {
    this._ariaLabel = ariaLabel;
    this.update();
  }
  get ariaLabel() {
    return this._ariaLabel;
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(placeholder) {
    this._placeholder = placeholder;
    this.update();
  }
  onDidChangeValue = this.onDidChangeValueEmitter.event;
  onWillAccept = this.onWillAcceptEmitter.event;
  onDidAccept = this.onDidAcceptEmitter.event;
  onDidCustom = this.onDidCustomEmitter.event;
  get items() {
    return this._items;
  }
  get scrollTop() {
    return this.ui.list.scrollTop;
  }
  set scrollTop(scrollTop) {
    this.ui.list.scrollTop = scrollTop;
  }
  set items(items) {
    this._items = items;
    this.itemsUpdated = true;
    this.update();
  }
  get canSelectMany() {
    return this._canSelectMany;
  }
  set canSelectMany(canSelectMany) {
    this._canSelectMany = canSelectMany;
    this.update();
  }
  get canAcceptInBackground() {
    return this._canAcceptInBackground;
  }
  set canAcceptInBackground(canAcceptInBackground) {
    this._canAcceptInBackground = canAcceptInBackground;
  }
  get matchOnDescription() {
    return this._matchOnDescription;
  }
  set matchOnDescription(matchOnDescription) {
    this._matchOnDescription = matchOnDescription;
    this.update();
  }
  get matchOnDetail() {
    return this._matchOnDetail;
  }
  set matchOnDetail(matchOnDetail) {
    this._matchOnDetail = matchOnDetail;
    this.update();
  }
  get matchOnLabel() {
    return this._matchOnLabel;
  }
  set matchOnLabel(matchOnLabel) {
    this._matchOnLabel = matchOnLabel;
    this.update();
  }
  get matchOnLabelMode() {
    return this._matchOnLabelMode;
  }
  set matchOnLabelMode(matchOnLabelMode) {
    this._matchOnLabelMode = matchOnLabelMode;
    this.update();
  }
  get sortByLabel() {
    return this._sortByLabel;
  }
  set sortByLabel(sortByLabel) {
    this._sortByLabel = sortByLabel;
    this.update();
  }
  get keepScrollPosition() {
    return this._keepScrollPosition;
  }
  set keepScrollPosition(keepScrollPosition) {
    this._keepScrollPosition = keepScrollPosition;
  }
  get itemActivation() {
    return this._itemActivation;
  }
  set itemActivation(itemActivation) {
    this._itemActivation = itemActivation;
  }
  get activeItems() {
    return this._activeItems;
  }
  set activeItems(activeItems) {
    this._activeItems = activeItems;
    this.activeItemsUpdated = true;
    this.update();
  }
  onDidChangeActive = this.onDidChangeActiveEmitter.event;
  get selectedItems() {
    return this._selectedItems;
  }
  set selectedItems(selectedItems) {
    this._selectedItems = selectedItems;
    this.selectedItemsUpdated = true;
    this.update();
  }
  get keyMods() {
    if (this._quickNavigate) {
      return NO_KEY_MODS;
    }
    return this.ui.keyMods;
  }
  get valueSelection() {
    const selection = this.ui.inputBox.getSelection();
    if (!selection) {
      return void 0;
    }
    return [selection.start, selection.end];
  }
  set valueSelection(valueSelection) {
    this._valueSelection = valueSelection;
    this.valueSelectionUpdated = true;
    this.update();
  }
  get customButton() {
    return this._customButton;
  }
  set customButton(showCustomButton) {
    this._customButton = showCustomButton;
    this.update();
  }
  get customLabel() {
    return this._customButtonLabel;
  }
  set customLabel(label) {
    this._customButtonLabel = label;
    this.update();
  }
  get customHover() {
    return this._customButtonHover;
  }
  set customHover(hover) {
    this._customButtonHover = hover;
    this.update();
  }
  get ok() {
    return this._ok;
  }
  set ok(showOkButton) {
    this._ok = showOkButton;
    this.update();
  }
  inputHasFocus() {
    return this.visible ? this.ui.inputBox.hasFocus() : false;
  }
  focusOnInput() {
    this.ui.inputBox.setFocus();
  }
  get hideInput() {
    return !!this._hideInput;
  }
  set hideInput(hideInput) {
    this._hideInput = hideInput;
    this.update();
  }
  get hideCountBadge() {
    return !!this._hideCountBadge;
  }
  set hideCountBadge(hideCountBadge) {
    this._hideCountBadge = hideCountBadge;
    this.update();
  }
  get hideCheckAll() {
    return !!this._hideCheckAll;
  }
  set hideCheckAll(hideCheckAll) {
    this._hideCheckAll = hideCheckAll;
    this.update();
  }
  onDidChangeSelection = this.onDidChangeSelectionEmitter.event;
  onDidTriggerItemButton = this.onDidTriggerItemButtonEmitter.event;
  onDidTriggerSeparatorButton = this.onDidTriggerSeparatorButtonEmitter.event;
  trySelectFirst() {
    if (!this.canSelectMany) {
      this.ui.list.focus(QuickPickFocus.First);
    }
  }
  show() {
    if (!this.visible) {
      this.visibleDisposables.add(
        this.ui.inputBox.onDidChange((value) => {
          this.doSetValue(
            value,
            true
          );
        })
      );
      this.visibleDisposables.add(
        this.ui.onDidAccept(() => {
          if (this.canSelectMany) {
            if (!this.ui.list.getCheckedElements().length) {
              this._selectedItems = [];
              this.onDidChangeSelectionEmitter.fire(
                this.selectedItems
              );
            }
          } else if (this.activeItems[0]) {
            this._selectedItems = [this.activeItems[0]];
            this.onDidChangeSelectionEmitter.fire(
              this.selectedItems
            );
          }
          this.handleAccept(false);
        })
      );
      this.visibleDisposables.add(
        this.ui.onDidCustom(() => {
          this.onDidCustomEmitter.fire();
        })
      );
      this.visibleDisposables.add(
        this._focusEventBufferer.wrapEvent(
          this.ui.list.onDidChangeFocus,
          // Only fire the last event
          (_, e) => e
        )((focusedItems) => {
          if (this.activeItemsUpdated) {
            return;
          }
          if (this.activeItemsToConfirm !== this._activeItems && equals(
            focusedItems,
            this._activeItems,
            (a, b) => a === b
          )) {
            return;
          }
          this._activeItems = focusedItems;
          this.onDidChangeActiveEmitter.fire(focusedItems);
        })
      );
      this.visibleDisposables.add(
        this.ui.list.onDidChangeSelection(
          ({ items: selectedItems, event }) => {
            if (this.canSelectMany) {
              if (selectedItems.length) {
                this.ui.list.setSelectedElements([]);
              }
              return;
            }
            if (this.selectedItemsToConfirm !== this._selectedItems && equals(
              selectedItems,
              this._selectedItems,
              (a, b) => a === b
            )) {
              return;
            }
            this._selectedItems = selectedItems;
            this.onDidChangeSelectionEmitter.fire(
              selectedItems
            );
            if (selectedItems.length) {
              this.handleAccept(
                dom.isMouseEvent(event) && event.button === 1
              );
            }
          }
        )
      );
      this.visibleDisposables.add(
        this.ui.list.onChangedCheckedElements((checkedItems) => {
          if (!this.canSelectMany || !this.visible) {
            return;
          }
          if (this.selectedItemsToConfirm !== this._selectedItems && equals(
            checkedItems,
            this._selectedItems,
            (a, b) => a === b
          )) {
            return;
          }
          this._selectedItems = checkedItems;
          this.onDidChangeSelectionEmitter.fire(checkedItems);
        })
      );
      this.visibleDisposables.add(
        this.ui.list.onButtonTriggered(
          (event) => this.onDidTriggerItemButtonEmitter.fire(
            event
          )
        )
      );
      this.visibleDisposables.add(
        this.ui.list.onSeparatorButtonTriggered(
          (event) => this.onDidTriggerSeparatorButtonEmitter.fire(event)
        )
      );
      this.visibleDisposables.add(this.registerQuickNavigation());
      this.valueSelectionUpdated = true;
    }
    super.show();
  }
  handleAccept(inBackground) {
    let veto = false;
    this.onWillAcceptEmitter.fire({ veto: /* @__PURE__ */ __name(() => veto = true, "veto") });
    if (!veto) {
      this.onDidAcceptEmitter.fire({ inBackground });
    }
  }
  registerQuickNavigation() {
    return dom.addDisposableListener(
      this.ui.container,
      dom.EventType.KEY_UP,
      (e) => {
        if (this.canSelectMany || !this._quickNavigate) {
          return;
        }
        const keyboardEvent = new StandardKeyboardEvent(e);
        const keyCode = keyboardEvent.keyCode;
        const quickNavKeys = this._quickNavigate.keybindings;
        const wasTriggerKeyPressed = quickNavKeys.some((k) => {
          const chords = k.getChords();
          if (chords.length > 1) {
            return false;
          }
          if (chords[0].shiftKey && keyCode === KeyCode.Shift) {
            if (keyboardEvent.ctrlKey || keyboardEvent.altKey || keyboardEvent.metaKey) {
              return false;
            }
            return true;
          }
          if (chords[0].altKey && keyCode === KeyCode.Alt) {
            return true;
          }
          if (chords[0].ctrlKey && keyCode === KeyCode.Ctrl) {
            return true;
          }
          if (chords[0].metaKey && keyCode === KeyCode.Meta) {
            return true;
          }
          return false;
        });
        if (wasTriggerKeyPressed) {
          if (this.activeItems[0]) {
            this._selectedItems = [this.activeItems[0]];
            this.onDidChangeSelectionEmitter.fire(
              this.selectedItems
            );
            this.handleAccept(false);
          }
          this._quickNavigate = void 0;
        }
      }
    );
  }
  update() {
    if (!this.visible) {
      return;
    }
    const scrollTopBefore = this.keepScrollPosition ? this.scrollTop : 0;
    const hasDescription = !!this.description;
    const visibilities = {
      title: !!this.title || !!this.step || !!this.titleButtons.length,
      description: hasDescription,
      checkAll: this.canSelectMany && !this._hideCheckAll,
      checkBox: this.canSelectMany,
      inputBox: !this._hideInput,
      progressBar: !this._hideInput || hasDescription,
      visibleCount: true,
      count: this.canSelectMany && !this._hideCountBadge,
      ok: this.ok === "default" ? this.canSelectMany : this.ok,
      list: true,
      message: !!this.validationMessage,
      customButton: this.customButton
    };
    this.ui.setVisibilities(visibilities);
    super.update();
    if (this.ui.inputBox.value !== this.value) {
      this.ui.inputBox.value = this.value;
    }
    if (this.valueSelectionUpdated) {
      this.valueSelectionUpdated = false;
      this.ui.inputBox.select(
        this._valueSelection && {
          start: this._valueSelection[0],
          end: this._valueSelection[1]
        }
      );
    }
    if (this.ui.inputBox.placeholder !== (this.placeholder || "")) {
      this.ui.inputBox.placeholder = this.placeholder || "";
    }
    let ariaLabel = this.ariaLabel;
    if (!ariaLabel && visibilities.inputBox) {
      ariaLabel = this.placeholder || QuickPick.DEFAULT_ARIA_LABEL;
      if (this.title) {
        ariaLabel += ` - ${this.title}`;
      }
    }
    if (this.ui.list.ariaLabel !== ariaLabel) {
      this.ui.list.ariaLabel = ariaLabel ?? null;
    }
    this.ui.list.matchOnDescription = this.matchOnDescription;
    this.ui.list.matchOnDetail = this.matchOnDetail;
    this.ui.list.matchOnLabel = this.matchOnLabel;
    this.ui.list.matchOnLabelMode = this.matchOnLabelMode;
    this.ui.list.sortByLabel = this.sortByLabel;
    if (this.itemsUpdated) {
      this.itemsUpdated = false;
      this._focusEventBufferer.bufferEvents(() => {
        this.ui.list.setElements(this.items);
        this.ui.list.shouldLoop = !this.canSelectMany;
        this.ui.list.filter(this.filterValue(this.ui.inputBox.value));
        switch (this._itemActivation) {
          case ItemActivation.NONE:
            this._itemActivation = ItemActivation.FIRST;
            break;
          case ItemActivation.SECOND:
            this.ui.list.focus(QuickPickFocus.Second);
            this._itemActivation = ItemActivation.FIRST;
            break;
          case ItemActivation.LAST:
            this.ui.list.focus(QuickPickFocus.Last);
            this._itemActivation = ItemActivation.FIRST;
            break;
          default:
            this.trySelectFirst();
            break;
        }
      });
    }
    if (this.ui.container.classList.contains("show-checkboxes") !== !!this.canSelectMany) {
      if (this.canSelectMany) {
        this.ui.list.clearFocus();
      } else {
        this.trySelectFirst();
      }
    }
    if (this.activeItemsUpdated) {
      this.activeItemsUpdated = false;
      this.activeItemsToConfirm = this._activeItems;
      this.ui.list.setFocusedElements(this.activeItems);
      if (this.activeItemsToConfirm === this._activeItems) {
        this.activeItemsToConfirm = null;
      }
    }
    if (this.selectedItemsUpdated) {
      this.selectedItemsUpdated = false;
      this.selectedItemsToConfirm = this._selectedItems;
      if (this.canSelectMany) {
        this.ui.list.setCheckedElements(this.selectedItems);
      } else {
        this.ui.list.setSelectedElements(this.selectedItems);
      }
      if (this.selectedItemsToConfirm === this._selectedItems) {
        this.selectedItemsToConfirm = null;
      }
    }
    this.ui.customButton.label = this.customLabel || "";
    this.ui.customButton.element.title = this.customHover || "";
    if (!visibilities.inputBox) {
      this.ui.list.domFocus();
      if (this.canSelectMany) {
        this.ui.list.focus(QuickPickFocus.First);
      }
    }
    if (this.keepScrollPosition) {
      this.scrollTop = scrollTopBefore;
    }
  }
  focus(focus) {
    this.ui.list.focus(focus);
    if (this.canSelectMany) {
      this.ui.list.domFocus();
    }
  }
  accept(inBackground) {
    if (inBackground && !this._canAcceptInBackground) {
      return;
    }
    if (this.activeItems[0]) {
      this._selectedItems = [this.activeItems[0]];
      this.onDidChangeSelectionEmitter.fire(this.selectedItems);
      this.handleAccept(inBackground ?? false);
    }
  }
}
class InputBox extends QuickInput {
  static {
    __name(this, "InputBox");
  }
  _value = "";
  _valueSelection;
  valueSelectionUpdated = true;
  _placeholder;
  _password = false;
  _prompt;
  onDidValueChangeEmitter = this._register(
    new Emitter()
  );
  onDidAcceptEmitter = this._register(new Emitter());
  type = QuickInputType.InputBox;
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value || "";
    this.update();
  }
  get valueSelection() {
    const selection = this.ui.inputBox.getSelection();
    if (!selection) {
      return void 0;
    }
    return [selection.start, selection.end];
  }
  set valueSelection(valueSelection) {
    this._valueSelection = valueSelection;
    this.valueSelectionUpdated = true;
    this.update();
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(placeholder) {
    this._placeholder = placeholder;
    this.update();
  }
  get password() {
    return this._password;
  }
  set password(password) {
    this._password = password;
    this.update();
  }
  get prompt() {
    return this._prompt;
  }
  set prompt(prompt) {
    this._prompt = prompt;
    this.noValidationMessage = prompt ? localize(
      "inputModeEntryDescription",
      "{0} (Press 'Enter' to confirm or 'Escape' to cancel)",
      prompt
    ) : QuickInput.noPromptMessage;
    this.update();
  }
  onDidChangeValue = this.onDidValueChangeEmitter.event;
  onDidAccept = this.onDidAcceptEmitter.event;
  show() {
    if (!this.visible) {
      this.visibleDisposables.add(
        this.ui.inputBox.onDidChange((value) => {
          if (value === this.value) {
            return;
          }
          this._value = value;
          this.onDidValueChangeEmitter.fire(value);
        })
      );
      this.visibleDisposables.add(
        this.ui.onDidAccept(() => this.onDidAcceptEmitter.fire())
      );
      this.valueSelectionUpdated = true;
    }
    super.show();
  }
  update() {
    if (!this.visible) {
      return;
    }
    this.ui.container.classList.remove("hidden-input");
    const visibilities = {
      title: !!this.title || !!this.step || !!this.titleButtons.length,
      description: !!this.description || !!this.step,
      inputBox: true,
      message: true,
      progressBar: true
    };
    this.ui.setVisibilities(visibilities);
    super.update();
    if (this.ui.inputBox.value !== this.value) {
      this.ui.inputBox.value = this.value;
    }
    if (this.valueSelectionUpdated) {
      this.valueSelectionUpdated = false;
      this.ui.inputBox.select(
        this._valueSelection && {
          start: this._valueSelection[0],
          end: this._valueSelection[1]
        }
      );
    }
    if (this.ui.inputBox.placeholder !== (this.placeholder || "")) {
      this.ui.inputBox.placeholder = this.placeholder || "";
    }
    if (this.ui.inputBox.password !== this.password) {
      this.ui.inputBox.password = this.password;
    }
  }
}
class QuickWidget extends QuickInput {
  static {
    __name(this, "QuickWidget");
  }
  type = QuickInputType.QuickWidget;
  update() {
    if (!this.visible) {
      return;
    }
    const visibilities = {
      title: !!this.title || !!this.step || !!this.titleButtons.length,
      description: !!this.description || !!this.step
    };
    this.ui.setVisibilities(visibilities);
    super.update();
  }
}
let QuickInputHoverDelegate = class extends WorkbenchHoverDelegate {
  static {
    __name(this, "QuickInputHoverDelegate");
  }
  constructor(configurationService, hoverService) {
    super(
      "element",
      false,
      (options) => this.getOverrideOptions(options),
      configurationService,
      hoverService
    );
  }
  getOverrideOptions(options) {
    const showHoverHint = (dom.isHTMLElement(options.content) ? options.content.textContent ?? "" : typeof options.content === "string" ? options.content : options.content.value).includes("\n");
    return {
      persistence: {
        hideOnKeyDown: false
      },
      appearance: {
        showHoverHint,
        skipFadeInAnimation: true
      }
    };
  }
};
QuickInputHoverDelegate = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IHoverService)
], QuickInputHoverDelegate);
export {
  EndOfQuickInputBoxContextKey,
  InQuickInputContextKey,
  InputBox,
  QuickInputHoverDelegate,
  QuickInputTypeContextKey,
  QuickPick,
  QuickWidget,
  backButton,
  endOfQuickInputBoxContext,
  endOfQuickInputBoxContextKeyValue,
  inQuickInputContext,
  inQuickInputContextKeyValue,
  quickInputTypeContextKeyValue
};
//# sourceMappingURL=quickInput.js.map
