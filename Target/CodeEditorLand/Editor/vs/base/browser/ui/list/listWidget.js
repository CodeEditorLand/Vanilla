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
import { binarySearch, range } from "../../../common/arrays.js";
import { timeout } from "../../../common/async.js";
import { Color } from "../../../common/color.js";
import { memoize } from "../../../common/decorators.js";
import { Emitter, Event, EventBufferer } from "../../../common/event.js";
import { matchesFuzzy2, matchesPrefix } from "../../../common/filters.js";
import { KeyCode } from "../../../common/keyCodes.js";
import {
  DisposableStore,
  dispose
} from "../../../common/lifecycle.js";
import { clamp } from "../../../common/numbers.js";
import * as platform from "../../../common/platform.js";
import { isNumber } from "../../../common/types.js";
import {
  EventHelper,
  asCssValueWithDefault,
  createStyleSheet,
  getActiveElement,
  getWindow,
  isActiveElement,
  isEditableElement,
  isHTMLElement,
  isMouseEvent
} from "../../dom.js";
import { DomEmitter } from "../../event.js";
import {
  StandardKeyboardEvent
} from "../../keyboardEvent.js";
import { Gesture } from "../../touch.js";
import { alert } from "../aria/aria.js";
import { CombinedSpliceable } from "./splice.js";
import "./list.css";
import {
  autorun,
  constObservable
} from "../../../common/observable.js";
import { StandardMouseEvent } from "../../mouseEvent.js";
import {
  ListError
} from "./list.js";
import {
  ListView
} from "./listView.js";
class TraitRenderer {
  constructor(trait) {
    this.trait = trait;
  }
  static {
    __name(this, "TraitRenderer");
  }
  renderedElements = [];
  get templateId() {
    return `template:${this.trait.name}`;
  }
  renderTemplate(container) {
    return container;
  }
  renderElement(element, index, templateData) {
    const renderedElementIndex = this.renderedElements.findIndex(
      (el) => el.templateData === templateData
    );
    if (renderedElementIndex >= 0) {
      const rendered = this.renderedElements[renderedElementIndex];
      this.trait.unrender(templateData);
      rendered.index = index;
    } else {
      const rendered = { index, templateData };
      this.renderedElements.push(rendered);
    }
    this.trait.renderIndex(index, templateData);
  }
  splice(start, deleteCount, insertCount) {
    const rendered = [];
    for (const renderedElement of this.renderedElements) {
      if (renderedElement.index < start) {
        rendered.push(renderedElement);
      } else if (renderedElement.index >= start + deleteCount) {
        rendered.push({
          index: renderedElement.index + insertCount - deleteCount,
          templateData: renderedElement.templateData
        });
      }
    }
    this.renderedElements = rendered;
  }
  renderIndexes(indexes) {
    for (const { index, templateData } of this.renderedElements) {
      if (indexes.indexOf(index) > -1) {
        this.trait.renderIndex(index, templateData);
      }
    }
  }
  disposeTemplate(templateData) {
    const index = this.renderedElements.findIndex(
      (el) => el.templateData === templateData
    );
    if (index < 0) {
      return;
    }
    this.renderedElements.splice(index, 1);
  }
}
class Trait {
  constructor(_trait) {
    this._trait = _trait;
  }
  static {
    __name(this, "Trait");
  }
  indexes = [];
  sortedIndexes = [];
  _onChange = new Emitter();
  onChange = this._onChange.event;
  get name() {
    return this._trait;
  }
  get renderer() {
    return new TraitRenderer(this);
  }
  splice(start, deleteCount, elements) {
    const diff = elements.length - deleteCount;
    const end = start + deleteCount;
    const sortedIndexes = [];
    let i = 0;
    while (i < this.sortedIndexes.length && this.sortedIndexes[i] < start) {
      sortedIndexes.push(this.sortedIndexes[i++]);
    }
    for (let j = 0; j < elements.length; j++) {
      if (elements[j]) {
        sortedIndexes.push(j + start);
      }
    }
    while (i < this.sortedIndexes.length && this.sortedIndexes[i] >= end) {
      sortedIndexes.push(this.sortedIndexes[i++] + diff);
    }
    this.renderer.splice(start, deleteCount, elements.length);
    this._set(sortedIndexes, sortedIndexes);
  }
  renderIndex(index, container) {
    container.classList.toggle(this._trait, this.contains(index));
  }
  unrender(container) {
    container.classList.remove(this._trait);
  }
  /**
   * Sets the indexes which should have this trait.
   *
   * @param indexes Indexes which should have this trait.
   * @return The old indexes which had this trait.
   */
  set(indexes, browserEvent) {
    return this._set(indexes, [...indexes].sort(numericSort), browserEvent);
  }
  _set(indexes, sortedIndexes, browserEvent) {
    const result = this.indexes;
    const sortedResult = this.sortedIndexes;
    this.indexes = indexes;
    this.sortedIndexes = sortedIndexes;
    const toRender = disjunction(sortedResult, indexes);
    this.renderer.renderIndexes(toRender);
    this._onChange.fire({ indexes, browserEvent });
    return result;
  }
  get() {
    return this.indexes;
  }
  contains(index) {
    return binarySearch(this.sortedIndexes, index, numericSort) >= 0;
  }
  dispose() {
    dispose(this._onChange);
  }
}
__decorateClass([
  memoize
], Trait.prototype, "renderer", 1);
class SelectionTrait extends Trait {
  constructor(setAriaSelected) {
    super("selected");
    this.setAriaSelected = setAriaSelected;
  }
  static {
    __name(this, "SelectionTrait");
  }
  renderIndex(index, container) {
    super.renderIndex(index, container);
    if (this.setAriaSelected) {
      if (this.contains(index)) {
        container.setAttribute("aria-selected", "true");
      } else {
        container.setAttribute("aria-selected", "false");
      }
    }
  }
}
class TraitSpliceable {
  constructor(trait, view, identityProvider) {
    this.trait = trait;
    this.view = view;
    this.identityProvider = identityProvider;
  }
  static {
    __name(this, "TraitSpliceable");
  }
  splice(start, deleteCount, elements) {
    if (!this.identityProvider) {
      return this.trait.splice(
        start,
        deleteCount,
        new Array(elements.length).fill(false)
      );
    }
    const pastElementsWithTrait = this.trait.get().map(
      (i) => this.identityProvider.getId(this.view.element(i)).toString()
    );
    if (pastElementsWithTrait.length === 0) {
      return this.trait.splice(
        start,
        deleteCount,
        new Array(elements.length).fill(false)
      );
    }
    const pastElementsWithTraitSet = new Set(pastElementsWithTrait);
    const elementsWithTrait = elements.map(
      (e) => pastElementsWithTraitSet.has(
        this.identityProvider.getId(e).toString()
      )
    );
    this.trait.splice(start, deleteCount, elementsWithTrait);
  }
}
function isListElementDescendantOfClass(e, className) {
  if (e.classList.contains(className)) {
    return true;
  }
  if (e.classList.contains("monaco-list")) {
    return false;
  }
  if (!e.parentElement) {
    return false;
  }
  return isListElementDescendantOfClass(e.parentElement, className);
}
__name(isListElementDescendantOfClass, "isListElementDescendantOfClass");
function isMonacoEditor(e) {
  return isListElementDescendantOfClass(e, "monaco-editor");
}
__name(isMonacoEditor, "isMonacoEditor");
function isMonacoCustomToggle(e) {
  return isListElementDescendantOfClass(e, "monaco-custom-toggle");
}
__name(isMonacoCustomToggle, "isMonacoCustomToggle");
function isActionItem(e) {
  return isListElementDescendantOfClass(e, "action-item");
}
__name(isActionItem, "isActionItem");
function isMonacoTwistie(e) {
  return isListElementDescendantOfClass(e, "monaco-tl-twistie");
}
__name(isMonacoTwistie, "isMonacoTwistie");
function isStickyScrollElement(e) {
  return isListElementDescendantOfClass(e, "monaco-tree-sticky-row");
}
__name(isStickyScrollElement, "isStickyScrollElement");
function isStickyScrollContainer(e) {
  return e.classList.contains("monaco-tree-sticky-container");
}
__name(isStickyScrollContainer, "isStickyScrollContainer");
function isButton(e) {
  if (e.tagName === "A" && e.classList.contains("monaco-button") || e.tagName === "DIV" && e.classList.contains("monaco-button-dropdown")) {
    return true;
  }
  if (e.classList.contains("monaco-list")) {
    return false;
  }
  if (!e.parentElement) {
    return false;
  }
  return isButton(e.parentElement);
}
__name(isButton, "isButton");
class KeyboardController {
  constructor(list, view, options) {
    this.list = list;
    this.view = view;
    this.multipleSelectionSupport = options.multipleSelectionSupport;
    this.disposables.add(
      this.onKeyDown((e) => {
        switch (e.keyCode) {
          case KeyCode.Enter:
            return this.onEnter(e);
          case KeyCode.UpArrow:
            return this.onUpArrow(e);
          case KeyCode.DownArrow:
            return this.onDownArrow(e);
          case KeyCode.PageUp:
            return this.onPageUpArrow(e);
          case KeyCode.PageDown:
            return this.onPageDownArrow(e);
          case KeyCode.Escape:
            return this.onEscape(e);
          case KeyCode.KeyA:
            if (this.multipleSelectionSupport && (platform.isMacintosh ? e.metaKey : e.ctrlKey)) {
              this.onCtrlA(e);
            }
        }
      })
    );
  }
  static {
    __name(this, "KeyboardController");
  }
  disposables = new DisposableStore();
  multipleSelectionDisposables = new DisposableStore();
  multipleSelectionSupport;
  get onKeyDown() {
    return Event.chain(
      this.disposables.add(new DomEmitter(this.view.domNode, "keydown")).event,
      ($) => $.filter(
        (e) => !isEditableElement(e.target)
      ).map((e) => new StandardKeyboardEvent(e))
    );
  }
  updateOptions(optionsUpdate) {
    if (optionsUpdate.multipleSelectionSupport !== void 0) {
      this.multipleSelectionSupport = optionsUpdate.multipleSelectionSupport;
    }
  }
  onEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.setSelection(this.list.getFocus(), e.browserEvent);
  }
  onUpArrow(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.focusPrevious(1, false, e.browserEvent);
    const el = this.list.getFocus()[0];
    this.list.setAnchor(el);
    this.list.reveal(el);
    this.view.domNode.focus();
  }
  onDownArrow(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.focusNext(1, false, e.browserEvent);
    const el = this.list.getFocus()[0];
    this.list.setAnchor(el);
    this.list.reveal(el);
    this.view.domNode.focus();
  }
  onPageUpArrow(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.focusPreviousPage(e.browserEvent);
    const el = this.list.getFocus()[0];
    this.list.setAnchor(el);
    this.list.reveal(el);
    this.view.domNode.focus();
  }
  onPageDownArrow(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.focusNextPage(e.browserEvent);
    const el = this.list.getFocus()[0];
    this.list.setAnchor(el);
    this.list.reveal(el);
    this.view.domNode.focus();
  }
  onCtrlA(e) {
    e.preventDefault();
    e.stopPropagation();
    this.list.setSelection(range(this.list.length), e.browserEvent);
    this.list.setAnchor(void 0);
    this.view.domNode.focus();
  }
  onEscape(e) {
    if (this.list.getSelection().length) {
      e.preventDefault();
      e.stopPropagation();
      this.list.setSelection([], e.browserEvent);
      this.list.setAnchor(void 0);
      this.view.domNode.focus();
    }
  }
  dispose() {
    this.disposables.dispose();
    this.multipleSelectionDisposables.dispose();
  }
}
__decorateClass([
  memoize
], KeyboardController.prototype, "onKeyDown", 1);
var TypeNavigationMode = /* @__PURE__ */ ((TypeNavigationMode2) => {
  TypeNavigationMode2[TypeNavigationMode2["Automatic"] = 0] = "Automatic";
  TypeNavigationMode2[TypeNavigationMode2["Trigger"] = 1] = "Trigger";
  return TypeNavigationMode2;
})(TypeNavigationMode || {});
var TypeNavigationControllerState = /* @__PURE__ */ ((TypeNavigationControllerState2) => {
  TypeNavigationControllerState2[TypeNavigationControllerState2["Idle"] = 0] = "Idle";
  TypeNavigationControllerState2[TypeNavigationControllerState2["Typing"] = 1] = "Typing";
  return TypeNavigationControllerState2;
})(TypeNavigationControllerState || {});
const DefaultKeyboardNavigationDelegate = new class {
  mightProducePrintableCharacter(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return false;
    }
    return event.keyCode >= KeyCode.KeyA && event.keyCode <= KeyCode.KeyZ || event.keyCode >= KeyCode.Digit0 && event.keyCode <= KeyCode.Digit9 || event.keyCode >= KeyCode.Numpad0 && event.keyCode <= KeyCode.Numpad9 || event.keyCode >= KeyCode.Semicolon && event.keyCode <= KeyCode.Quote;
  }
}();
class TypeNavigationController {
  constructor(list, view, keyboardNavigationLabelProvider, keyboardNavigationEventFilter, delegate) {
    this.list = list;
    this.view = view;
    this.keyboardNavigationLabelProvider = keyboardNavigationLabelProvider;
    this.keyboardNavigationEventFilter = keyboardNavigationEventFilter;
    this.delegate = delegate;
    this.updateOptions(list.options);
  }
  static {
    __name(this, "TypeNavigationController");
  }
  enabled = false;
  state = 0 /* Idle */;
  mode = 0 /* Automatic */;
  triggered = false;
  previouslyFocused = -1;
  enabledDisposables = new DisposableStore();
  disposables = new DisposableStore();
  updateOptions(options) {
    if (options.typeNavigationEnabled ?? true) {
      this.enable();
    } else {
      this.disable();
    }
    this.mode = options.typeNavigationMode ?? 0 /* Automatic */;
  }
  trigger() {
    this.triggered = !this.triggered;
  }
  enable() {
    if (this.enabled) {
      return;
    }
    let typing = false;
    const onChar = Event.chain(
      this.enabledDisposables.add(
        new DomEmitter(this.view.domNode, "keydown")
      ).event,
      ($) => $.filter((e) => !isEditableElement(e.target)).filter(
        () => this.mode === 0 /* Automatic */ || this.triggered
      ).map((event) => new StandardKeyboardEvent(event)).filter(
        (e) => typing || this.keyboardNavigationEventFilter(e)
      ).filter(
        (e) => this.delegate.mightProducePrintableCharacter(e)
      ).forEach((e) => EventHelper.stop(e, true)).map((event) => event.browserEvent.key)
    );
    const onClear = Event.debounce(
      onChar,
      () => null,
      800,
      void 0,
      void 0,
      void 0,
      this.enabledDisposables
    );
    const onInput = Event.reduce(
      Event.any(onChar, onClear),
      (r, i) => i === null ? null : (r || "") + i,
      void 0,
      this.enabledDisposables
    );
    onInput(this.onInput, this, this.enabledDisposables);
    onClear(this.onClear, this, this.enabledDisposables);
    onChar(() => typing = true, void 0, this.enabledDisposables);
    onClear(() => typing = false, void 0, this.enabledDisposables);
    this.enabled = true;
    this.triggered = false;
  }
  disable() {
    if (!this.enabled) {
      return;
    }
    this.enabledDisposables.clear();
    this.enabled = false;
    this.triggered = false;
  }
  onClear() {
    const focus = this.list.getFocus();
    if (focus.length > 0 && focus[0] === this.previouslyFocused) {
      const ariaLabel = this.list.options.accessibilityProvider?.getAriaLabel(
        this.list.element(focus[0])
      );
      if (typeof ariaLabel === "string") {
        alert(ariaLabel);
      } else if (ariaLabel) {
        alert(ariaLabel.get());
      }
    }
    this.previouslyFocused = -1;
  }
  onInput(word) {
    if (!word) {
      this.state = 0 /* Idle */;
      this.triggered = false;
      return;
    }
    const focus = this.list.getFocus();
    const start = focus.length > 0 ? focus[0] : 0;
    const delta = this.state === 0 /* Idle */ ? 1 : 0;
    this.state = 1 /* Typing */;
    for (let i = 0; i < this.list.length; i++) {
      const index = (start + i + delta) % this.list.length;
      const label = this.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(
        this.view.element(index)
      );
      const labelStr = label && label.toString();
      if (this.list.options.typeNavigationEnabled) {
        if (typeof labelStr !== "undefined") {
          if (matchesPrefix(word, labelStr)) {
            this.previouslyFocused = start;
            this.list.setFocus([index]);
            this.list.reveal(index);
            return;
          }
          const fuzzy = matchesFuzzy2(word, labelStr);
          if (fuzzy) {
            const fuzzyScore = fuzzy[0].end - fuzzy[0].start;
            if (fuzzyScore > 1 && fuzzy.length === 1) {
              this.previouslyFocused = start;
              this.list.setFocus([index]);
              this.list.reveal(index);
              return;
            }
          }
        }
      } else if (typeof labelStr === "undefined" || matchesPrefix(word, labelStr)) {
        this.previouslyFocused = start;
        this.list.setFocus([index]);
        this.list.reveal(index);
        return;
      }
    }
  }
  dispose() {
    this.disable();
    this.enabledDisposables.dispose();
    this.disposables.dispose();
  }
}
class DOMFocusController {
  constructor(list, view) {
    this.list = list;
    this.view = view;
    const onKeyDown = Event.chain(
      this.disposables.add(new DomEmitter(view.domNode, "keydown")).event,
      ($) => $.filter(
        (e) => !isEditableElement(e.target)
      ).map((e) => new StandardKeyboardEvent(e))
    );
    const onTab = Event.chain(
      onKeyDown,
      ($) => $.filter(
        (e) => e.keyCode === KeyCode.Tab && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
      )
    );
    onTab(this.onTab, this, this.disposables);
  }
  static {
    __name(this, "DOMFocusController");
  }
  disposables = new DisposableStore();
  onTab(e) {
    if (e.target !== this.view.domNode) {
      return;
    }
    const focus = this.list.getFocus();
    if (focus.length === 0) {
      return;
    }
    const focusedDomElement = this.view.domElement(focus[0]);
    if (!focusedDomElement) {
      return;
    }
    const tabIndexElement = focusedDomElement.querySelector("[tabIndex]");
    if (!tabIndexElement || !isHTMLElement(tabIndexElement) || tabIndexElement.tabIndex === -1) {
      return;
    }
    const style = getWindow(tabIndexElement).getComputedStyle(tabIndexElement);
    if (style.visibility === "hidden" || style.display === "none") {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    tabIndexElement.focus();
  }
  dispose() {
    this.disposables.dispose();
  }
}
function isSelectionSingleChangeEvent(event) {
  return platform.isMacintosh ? event.browserEvent.metaKey : event.browserEvent.ctrlKey;
}
__name(isSelectionSingleChangeEvent, "isSelectionSingleChangeEvent");
function isSelectionRangeChangeEvent(event) {
  return event.browserEvent.shiftKey;
}
__name(isSelectionRangeChangeEvent, "isSelectionRangeChangeEvent");
function isMouseRightClick(event) {
  return isMouseEvent(event) && event.button === 2;
}
__name(isMouseRightClick, "isMouseRightClick");
const DefaultMultipleSelectionController = {
  isSelectionSingleChangeEvent,
  isSelectionRangeChangeEvent
};
class MouseController {
  constructor(list) {
    this.list = list;
    if (list.options.multipleSelectionSupport !== false) {
      this.multipleSelectionController = this.list.options.multipleSelectionController || DefaultMultipleSelectionController;
    }
    this.mouseSupport = typeof list.options.mouseSupport === "undefined" || !!list.options.mouseSupport;
    if (this.mouseSupport) {
      list.onMouseDown(this.onMouseDown, this, this.disposables);
      list.onContextMenu(this.onContextMenu, this, this.disposables);
      list.onMouseDblClick(this.onDoubleClick, this, this.disposables);
      list.onTouchStart(this.onMouseDown, this, this.disposables);
      this.disposables.add(Gesture.addTarget(list.getHTMLElement()));
    }
    Event.any(
      list.onMouseClick,
      list.onMouseMiddleClick,
      list.onTap
    )(this.onViewPointer, this, this.disposables);
  }
  static {
    __name(this, "MouseController");
  }
  multipleSelectionController;
  mouseSupport;
  disposables = new DisposableStore();
  _onPointer = new Emitter();
  onPointer = this._onPointer.event;
  updateOptions(optionsUpdate) {
    if (optionsUpdate.multipleSelectionSupport !== void 0) {
      this.multipleSelectionController = void 0;
      if (optionsUpdate.multipleSelectionSupport) {
        this.multipleSelectionController = this.list.options.multipleSelectionController || DefaultMultipleSelectionController;
      }
    }
  }
  isSelectionSingleChangeEvent(event) {
    if (!this.multipleSelectionController) {
      return false;
    }
    return this.multipleSelectionController.isSelectionSingleChangeEvent(
      event
    );
  }
  isSelectionRangeChangeEvent(event) {
    if (!this.multipleSelectionController) {
      return false;
    }
    return this.multipleSelectionController.isSelectionRangeChangeEvent(
      event
    );
  }
  isSelectionChangeEvent(event) {
    return this.isSelectionSingleChangeEvent(event) || this.isSelectionRangeChangeEvent(event);
  }
  onMouseDown(e) {
    if (isMonacoEditor(e.browserEvent.target)) {
      return;
    }
    if (getActiveElement() !== e.browserEvent.target) {
      this.list.domFocus();
    }
  }
  onContextMenu(e) {
    if (isEditableElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
      return;
    }
    const focus = typeof e.index === "undefined" ? [] : [e.index];
    this.list.setFocus(focus, e.browserEvent);
  }
  onViewPointer(e) {
    if (!this.mouseSupport) {
      return;
    }
    if (isEditableElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
      return;
    }
    if (e.browserEvent.isHandledByList) {
      return;
    }
    e.browserEvent.isHandledByList = true;
    const focus = e.index;
    if (typeof focus === "undefined") {
      this.list.setFocus([], e.browserEvent);
      this.list.setSelection([], e.browserEvent);
      this.list.setAnchor(void 0);
      return;
    }
    if (this.isSelectionChangeEvent(e)) {
      return this.changeSelection(e);
    }
    this.list.setFocus([focus], e.browserEvent);
    this.list.setAnchor(focus);
    if (!isMouseRightClick(e.browserEvent)) {
      this.list.setSelection([focus], e.browserEvent);
    }
    this._onPointer.fire(e);
  }
  onDoubleClick(e) {
    if (isEditableElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
      return;
    }
    if (this.isSelectionChangeEvent(e)) {
      return;
    }
    if (e.browserEvent.isHandledByList) {
      return;
    }
    e.browserEvent.isHandledByList = true;
    const focus = this.list.getFocus();
    this.list.setSelection(focus, e.browserEvent);
  }
  changeSelection(e) {
    const focus = e.index;
    let anchor = this.list.getAnchor();
    if (this.isSelectionRangeChangeEvent(e)) {
      if (typeof anchor === "undefined") {
        const currentFocus = this.list.getFocus()[0];
        anchor = currentFocus ?? focus;
        this.list.setAnchor(anchor);
      }
      const min = Math.min(anchor, focus);
      const max = Math.max(anchor, focus);
      const rangeSelection = range(min, max + 1);
      const selection = this.list.getSelection();
      const contiguousRange = getContiguousRangeContaining(
        disjunction(selection, [anchor]),
        anchor
      );
      if (contiguousRange.length === 0) {
        return;
      }
      const newSelection = disjunction(
        rangeSelection,
        relativeComplement(selection, contiguousRange)
      );
      this.list.setSelection(newSelection, e.browserEvent);
      this.list.setFocus([focus], e.browserEvent);
    } else if (this.isSelectionSingleChangeEvent(e)) {
      const selection = this.list.getSelection();
      const newSelection = selection.filter((i) => i !== focus);
      this.list.setFocus([focus]);
      this.list.setAnchor(focus);
      if (selection.length === newSelection.length) {
        this.list.setSelection(
          [...newSelection, focus],
          e.browserEvent
        );
      } else {
        this.list.setSelection(newSelection, e.browserEvent);
      }
    }
  }
  dispose() {
    this.disposables.dispose();
  }
}
class DefaultStyleController {
  constructor(styleElement, selectorSuffix) {
    this.styleElement = styleElement;
    this.selectorSuffix = selectorSuffix;
  }
  static {
    __name(this, "DefaultStyleController");
  }
  style(styles) {
    const suffix = this.selectorSuffix && `.${this.selectorSuffix}`;
    const content = [];
    if (styles.listBackground) {
      content.push(
        `.monaco-list${suffix} .monaco-list-rows { background: ${styles.listBackground}; }`
      );
    }
    if (styles.listFocusBackground) {
      content.push(
        `.monaco-list${suffix}:focus .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`
      );
      content.push(
        `.monaco-list${suffix}:focus .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`
      );
    }
    if (styles.listFocusForeground) {
      content.push(
        `.monaco-list${suffix}:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`
      );
    }
    if (styles.listActiveSelectionBackground) {
      content.push(
        `.monaco-list${suffix}:focus .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`
      );
      content.push(
        `.monaco-list${suffix}:focus .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`
      );
    }
    if (styles.listActiveSelectionForeground) {
      content.push(
        `.monaco-list${suffix}:focus .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`
      );
    }
    if (styles.listActiveSelectionIconForeground) {
      content.push(
        `.monaco-list${suffix}:focus .monaco-list-row.selected .codicon { color: ${styles.listActiveSelectionIconForeground}; }`
      );
    }
    if (styles.listFocusAndSelectionBackground) {
      content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
    }
    if (styles.listFocusAndSelectionForeground) {
      content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
    }
    if (styles.listInactiveFocusForeground) {
      content.push(
        `.monaco-list${suffix} .monaco-list-row.focused { color:  ${styles.listInactiveFocusForeground}; }`
      );
      content.push(
        `.monaco-list${suffix} .monaco-list-row.focused:hover { color:  ${styles.listInactiveFocusForeground}; }`
      );
    }
    if (styles.listInactiveSelectionIconForeground) {
      content.push(
        `.monaco-list${suffix} .monaco-list-row.focused .codicon { color:  ${styles.listInactiveSelectionIconForeground}; }`
      );
    }
    if (styles.listInactiveFocusBackground) {
      content.push(
        `.monaco-list${suffix} .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`
      );
      content.push(
        `.monaco-list${suffix} .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`
      );
    }
    if (styles.listInactiveSelectionBackground) {
      content.push(
        `.monaco-list${suffix} .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`
      );
      content.push(
        `.monaco-list${suffix} .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`
      );
    }
    if (styles.listInactiveSelectionForeground) {
      content.push(
        `.monaco-list${suffix} .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`
      );
    }
    if (styles.listHoverBackground) {
      content.push(
        `.monaco-list${suffix}:not(.drop-target):not(.dragging) .monaco-list-row:hover:not(.selected):not(.focused) { background-color: ${styles.listHoverBackground}; }`
      );
    }
    if (styles.listHoverForeground) {
      content.push(
        `.monaco-list${suffix}:not(.drop-target):not(.dragging) .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`
      );
    }
    const focusAndSelectionOutline = asCssValueWithDefault(
      styles.listFocusAndSelectionOutline,
      asCssValueWithDefault(
        styles.listSelectionOutline,
        styles.listFocusOutline ?? ""
      )
    );
    if (focusAndSelectionOutline) {
      content.push(
        `.monaco-list${suffix}:focus .monaco-list-row.focused.selected { outline: 1px solid ${focusAndSelectionOutline}; outline-offset: -1px;}`
      );
    }
    if (styles.listFocusOutline) {
      content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
				.monaco-workbench.context-menu-visible .monaco-list${suffix}.last-focused .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
    }
    const inactiveFocusAndSelectionOutline = asCssValueWithDefault(
      styles.listSelectionOutline,
      styles.listInactiveFocusOutline ?? ""
    );
    if (inactiveFocusAndSelectionOutline) {
      content.push(
        `.monaco-list${suffix} .monaco-list-row.focused.selected { outline: 1px dotted ${inactiveFocusAndSelectionOutline}; outline-offset: -1px; }`
      );
    }
    if (styles.listSelectionOutline) {
      content.push(
        `.monaco-list${suffix} .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`
      );
    }
    if (styles.listInactiveFocusOutline) {
      content.push(
        `.monaco-list${suffix} .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`
      );
    }
    if (styles.listHoverOutline) {
      content.push(
        `.monaco-list${suffix} .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`
      );
    }
    if (styles.listDropOverBackground) {
      content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} .monaco-list-rows.drop-target,
				.monaco-list${suffix} .monaco-list-row.drop-target { background-color: ${styles.listDropOverBackground} !important; color: inherit !important; }
			`);
    }
    if (styles.listDropBetweenBackground) {
      content.push(`
			.monaco-list${suffix} .monaco-list-rows.drop-target-before .monaco-list-row:first-child::before,
			.monaco-list${suffix} .monaco-list-row.drop-target-before::before {
				content: ""; position: absolute; top: 0px; left: 0px; width: 100%; height: 1px;
				background-color: ${styles.listDropBetweenBackground};
			}`);
      content.push(`
			.monaco-list${suffix} .monaco-list-rows.drop-target-after .monaco-list-row:last-child::after,
			.monaco-list${suffix} .monaco-list-row.drop-target-after::after {
				content: ""; position: absolute; bottom: 0px; left: 0px; width: 100%; height: 1px;
				background-color: ${styles.listDropBetweenBackground};
			}`);
    }
    if (styles.tableColumnsBorder) {
      content.push(`
				.monaco-table > .monaco-split-view2,
				.monaco-table > .monaco-split-view2 .monaco-sash.vertical::before,
				.monaco-workbench:not(.reduce-motion) .monaco-table:hover > .monaco-split-view2,
				.monaco-workbench:not(.reduce-motion) .monaco-table:hover > .monaco-split-view2 .monaco-sash.vertical::before {
					border-color: ${styles.tableColumnsBorder};
				}

				.monaco-workbench:not(.reduce-motion) .monaco-table > .monaco-split-view2,
				.monaco-workbench:not(.reduce-motion) .monaco-table > .monaco-split-view2 .monaco-sash.vertical::before {
					border-color: transparent;
				}
			`);
    }
    if (styles.tableOddRowsBackgroundColor) {
      content.push(`
				.monaco-table .monaco-list-row[data-parity=odd]:not(.focused):not(.selected):not(:hover) .monaco-table-tr,
				.monaco-table .monaco-list:not(:focus) .monaco-list-row[data-parity=odd].focused:not(.selected):not(:hover) .monaco-table-tr,
				.monaco-table .monaco-list:not(.focused) .monaco-list-row[data-parity=odd].focused:not(.selected):not(:hover) .monaco-table-tr {
					background-color: ${styles.tableOddRowsBackgroundColor};
				}
			`);
    }
    this.styleElement.textContent = content.join("\n");
  }
}
const unthemedListStyles = {
  listFocusBackground: "#7FB0D0",
  listActiveSelectionBackground: "#0E639C",
  listActiveSelectionForeground: "#FFFFFF",
  listActiveSelectionIconForeground: "#FFFFFF",
  listFocusAndSelectionOutline: "#90C2F9",
  listFocusAndSelectionBackground: "#094771",
  listFocusAndSelectionForeground: "#FFFFFF",
  listInactiveSelectionBackground: "#3F3F46",
  listInactiveSelectionIconForeground: "#FFFFFF",
  listHoverBackground: "#2A2D2E",
  listDropOverBackground: "#383B3D",
  listDropBetweenBackground: "#EEEEEE",
  treeIndentGuidesStroke: "#a9a9a9",
  treeInactiveIndentGuidesStroke: Color.fromHex("#a9a9a9").transparent(0.4).toString(),
  tableColumnsBorder: Color.fromHex("#cccccc").transparent(0.2).toString(),
  tableOddRowsBackgroundColor: Color.fromHex("#cccccc").transparent(0.04).toString(),
  listBackground: void 0,
  listFocusForeground: void 0,
  listInactiveSelectionForeground: void 0,
  listInactiveFocusForeground: void 0,
  listInactiveFocusBackground: void 0,
  listHoverForeground: void 0,
  listFocusOutline: void 0,
  listInactiveFocusOutline: void 0,
  listSelectionOutline: void 0,
  listHoverOutline: void 0,
  treeStickyScrollBackground: void 0,
  treeStickyScrollBorder: void 0,
  treeStickyScrollShadow: void 0
};
const DefaultOptions = {
  keyboardSupport: true,
  mouseSupport: true,
  multipleSelectionSupport: true,
  dnd: {
    getDragURI() {
      return null;
    },
    onDragStart() {
    },
    onDragOver() {
      return false;
    },
    drop() {
    },
    dispose() {
    }
  }
};
function getContiguousRangeContaining(range2, value) {
  const index = range2.indexOf(value);
  if (index === -1) {
    return [];
  }
  const result = [];
  let i = index - 1;
  while (i >= 0 && range2[i] === value - (index - i)) {
    result.push(range2[i--]);
  }
  result.reverse();
  i = index;
  while (i < range2.length && range2[i] === value + (i - index)) {
    result.push(range2[i++]);
  }
  return result;
}
__name(getContiguousRangeContaining, "getContiguousRangeContaining");
function disjunction(one, other) {
  const result = [];
  let i = 0, j = 0;
  while (i < one.length || j < other.length) {
    if (i >= one.length) {
      result.push(other[j++]);
    } else if (j >= other.length) {
      result.push(one[i++]);
    } else if (one[i] === other[j]) {
      result.push(one[i]);
      i++;
      j++;
      continue;
    } else if (one[i] < other[j]) {
      result.push(one[i++]);
    } else {
      result.push(other[j++]);
    }
  }
  return result;
}
__name(disjunction, "disjunction");
function relativeComplement(one, other) {
  const result = [];
  let i = 0, j = 0;
  while (i < one.length || j < other.length) {
    if (i >= one.length) {
      result.push(other[j++]);
    } else if (j >= other.length) {
      result.push(one[i++]);
    } else if (one[i] === other[j]) {
      i++;
      j++;
      continue;
    } else if (one[i] < other[j]) {
      result.push(one[i++]);
    } else {
      j++;
    }
  }
  return result;
}
__name(relativeComplement, "relativeComplement");
const numericSort = /* @__PURE__ */ __name((a, b) => a - b, "numericSort");
class PipelineRenderer {
  constructor(_templateId, renderers) {
    this._templateId = _templateId;
    this.renderers = renderers;
  }
  static {
    __name(this, "PipelineRenderer");
  }
  get templateId() {
    return this._templateId;
  }
  renderTemplate(container) {
    return this.renderers.map((r) => r.renderTemplate(container));
  }
  renderElement(element, index, templateData, height) {
    let i = 0;
    for (const renderer of this.renderers) {
      renderer.renderElement(element, index, templateData[i++], height);
    }
  }
  disposeElement(element, index, templateData, height) {
    let i = 0;
    for (const renderer of this.renderers) {
      renderer.disposeElement?.(element, index, templateData[i], height);
      i += 1;
    }
  }
  disposeTemplate(templateData) {
    let i = 0;
    for (const renderer of this.renderers) {
      renderer.disposeTemplate(templateData[i++]);
    }
  }
}
class AccessibiltyRenderer {
  constructor(accessibilityProvider) {
    this.accessibilityProvider = accessibilityProvider;
  }
  static {
    __name(this, "AccessibiltyRenderer");
  }
  templateId = "a18n";
  renderTemplate(container) {
    return { container, disposables: new DisposableStore() };
  }
  renderElement(element, index, data) {
    const ariaLabel = this.accessibilityProvider.getAriaLabel(element);
    const observable = ariaLabel && typeof ariaLabel !== "string" ? ariaLabel : constObservable(ariaLabel);
    data.disposables.add(
      autorun((reader) => {
        this.setAriaLabel(
          reader.readObservable(observable),
          data.container
        );
      })
    );
    const ariaLevel = this.accessibilityProvider.getAriaLevel && this.accessibilityProvider.getAriaLevel(element);
    if (typeof ariaLevel === "number") {
      data.container.setAttribute("aria-level", `${ariaLevel}`);
    } else {
      data.container.removeAttribute("aria-level");
    }
  }
  setAriaLabel(ariaLabel, element) {
    if (ariaLabel) {
      element.setAttribute("aria-label", ariaLabel);
    } else {
      element.removeAttribute("aria-label");
    }
  }
  disposeElement(element, index, templateData, height) {
    templateData.disposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
}
class ListViewDragAndDrop {
  constructor(list, dnd) {
    this.list = list;
    this.dnd = dnd;
  }
  static {
    __name(this, "ListViewDragAndDrop");
  }
  getDragElements(element) {
    const selection = this.list.getSelectedElements();
    const elements = selection.indexOf(element) > -1 ? selection : [element];
    return elements;
  }
  getDragURI(element) {
    return this.dnd.getDragURI(element);
  }
  getDragLabel(elements, originalEvent) {
    if (this.dnd.getDragLabel) {
      return this.dnd.getDragLabel(elements, originalEvent);
    }
    return void 0;
  }
  onDragStart(data, originalEvent) {
    this.dnd.onDragStart?.(data, originalEvent);
  }
  onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
    return this.dnd.onDragOver(
      data,
      targetElement,
      targetIndex,
      targetSector,
      originalEvent
    );
  }
  onDragLeave(data, targetElement, targetIndex, originalEvent) {
    this.dnd.onDragLeave?.(data, targetElement, targetIndex, originalEvent);
  }
  onDragEnd(originalEvent) {
    this.dnd.onDragEnd?.(originalEvent);
  }
  drop(data, targetElement, targetIndex, targetSector, originalEvent) {
    this.dnd.drop(
      data,
      targetElement,
      targetIndex,
      targetSector,
      originalEvent
    );
  }
  dispose() {
    this.dnd.dispose();
  }
}
class List {
  constructor(user, container, virtualDelegate, renderers, _options = DefaultOptions) {
    this.user = user;
    this._options = _options;
    const role = this._options.accessibilityProvider && this._options.accessibilityProvider.getWidgetRole ? this._options.accessibilityProvider?.getWidgetRole() : "list";
    this.selection = new SelectionTrait(role !== "listbox");
    const baseRenderers = [
      this.focus.renderer,
      this.selection.renderer
    ];
    this.accessibilityProvider = _options.accessibilityProvider;
    if (this.accessibilityProvider) {
      baseRenderers.push(
        new AccessibiltyRenderer(this.accessibilityProvider)
      );
      this.accessibilityProvider.onDidChangeActiveDescendant?.(
        this.onDidChangeActiveDescendant,
        this,
        this.disposables
      );
    }
    renderers = renderers.map(
      (r) => new PipelineRenderer(r.templateId, [...baseRenderers, r])
    );
    const viewOptions = {
      ..._options,
      dnd: _options.dnd && new ListViewDragAndDrop(this, _options.dnd)
    };
    this.view = this.createListView(
      container,
      virtualDelegate,
      renderers,
      viewOptions
    );
    this.view.domNode.setAttribute("role", role);
    if (_options.styleController) {
      this.styleController = _options.styleController(this.view.domId);
    } else {
      const styleElement = createStyleSheet(this.view.domNode);
      this.styleController = new DefaultStyleController(
        styleElement,
        this.view.domId
      );
    }
    this.spliceable = new CombinedSpliceable([
      new TraitSpliceable(
        this.focus,
        this.view,
        _options.identityProvider
      ),
      new TraitSpliceable(
        this.selection,
        this.view,
        _options.identityProvider
      ),
      new TraitSpliceable(
        this.anchor,
        this.view,
        _options.identityProvider
      ),
      this.view
    ]);
    this.disposables.add(this.focus);
    this.disposables.add(this.selection);
    this.disposables.add(this.anchor);
    this.disposables.add(this.view);
    this.disposables.add(this._onDidDispose);
    this.disposables.add(new DOMFocusController(this, this.view));
    if (typeof _options.keyboardSupport !== "boolean" || _options.keyboardSupport) {
      this.keyboardController = new KeyboardController(
        this,
        this.view,
        _options
      );
      this.disposables.add(this.keyboardController);
    }
    if (_options.keyboardNavigationLabelProvider) {
      const delegate = _options.keyboardNavigationDelegate || DefaultKeyboardNavigationDelegate;
      this.typeNavigationController = new TypeNavigationController(
        this,
        this.view,
        _options.keyboardNavigationLabelProvider,
        _options.keyboardNavigationEventFilter ?? (() => true),
        delegate
      );
      this.disposables.add(this.typeNavigationController);
    }
    this.mouseController = this.createMouseController(_options);
    this.disposables.add(this.mouseController);
    this.onDidChangeFocus(this._onFocusChange, this, this.disposables);
    this.onDidChangeSelection(
      this._onSelectionChange,
      this,
      this.disposables
    );
    if (this.accessibilityProvider) {
      this.ariaLabel = this.accessibilityProvider.getWidgetAriaLabel();
    }
    if (this._options.multipleSelectionSupport !== false) {
      this.view.domNode.setAttribute("aria-multiselectable", "true");
    }
  }
  static {
    __name(this, "List");
  }
  focus = new Trait("focused");
  selection;
  anchor = new Trait("anchor");
  eventBufferer = new EventBufferer();
  view;
  spliceable;
  styleController;
  typeNavigationController;
  accessibilityProvider;
  keyboardController;
  mouseController;
  _ariaLabel = "";
  disposables = new DisposableStore();
  get onDidChangeFocus() {
    return Event.map(
      this.eventBufferer.wrapEvent(this.focus.onChange),
      (e) => this.toListEvent(e),
      this.disposables
    );
  }
  get onDidChangeSelection() {
    return Event.map(
      this.eventBufferer.wrapEvent(this.selection.onChange),
      (e) => this.toListEvent(e),
      this.disposables
    );
  }
  get domId() {
    return this.view.domId;
  }
  get onDidScroll() {
    return this.view.onDidScroll;
  }
  get onMouseClick() {
    return this.view.onMouseClick;
  }
  get onMouseDblClick() {
    return this.view.onMouseDblClick;
  }
  get onMouseMiddleClick() {
    return this.view.onMouseMiddleClick;
  }
  get onPointer() {
    return this.mouseController.onPointer;
  }
  get onMouseUp() {
    return this.view.onMouseUp;
  }
  get onMouseDown() {
    return this.view.onMouseDown;
  }
  get onMouseOver() {
    return this.view.onMouseOver;
  }
  get onMouseMove() {
    return this.view.onMouseMove;
  }
  get onMouseOut() {
    return this.view.onMouseOut;
  }
  get onTouchStart() {
    return this.view.onTouchStart;
  }
  get onTap() {
    return this.view.onTap;
  }
  get onContextMenu() {
    let didJustPressContextMenuKey = false;
    const fromKeyDown = Event.chain(
      this.disposables.add(new DomEmitter(this.view.domNode, "keydown")).event,
      ($) => $.map((e) => new StandardKeyboardEvent(e)).filter(
        (e) => didJustPressContextMenuKey = e.keyCode === KeyCode.ContextMenu || e.shiftKey && e.keyCode === KeyCode.F10
      ).map((e) => EventHelper.stop(e, true)).filter(() => false)
    );
    const fromKeyUp = Event.chain(
      this.disposables.add(new DomEmitter(this.view.domNode, "keyup")).event,
      ($) => $.forEach(() => didJustPressContextMenuKey = false).map((e) => new StandardKeyboardEvent(e)).filter(
        (e) => e.keyCode === KeyCode.ContextMenu || e.shiftKey && e.keyCode === KeyCode.F10
      ).map((e) => EventHelper.stop(e, true)).map(({ browserEvent }) => {
        const focus = this.getFocus();
        const index = focus.length ? focus[0] : void 0;
        const element = typeof index !== "undefined" ? this.view.element(index) : void 0;
        const anchor = typeof index !== "undefined" ? this.view.domElement(index) : this.view.domNode;
        return { index, element, anchor, browserEvent };
      })
    );
    const fromMouse = Event.chain(
      this.view.onContextMenu,
      ($) => $.filter((_) => !didJustPressContextMenuKey).map(
        ({ element, index, browserEvent }) => ({
          element,
          index,
          anchor: new StandardMouseEvent(
            getWindow(this.view.domNode),
            browserEvent
          ),
          browserEvent
        })
      )
    );
    return Event.any(
      fromKeyDown,
      fromKeyUp,
      fromMouse
    );
  }
  get onKeyDown() {
    return this.disposables.add(
      new DomEmitter(this.view.domNode, "keydown")
    ).event;
  }
  get onKeyUp() {
    return this.disposables.add(new DomEmitter(this.view.domNode, "keyup")).event;
  }
  get onKeyPress() {
    return this.disposables.add(
      new DomEmitter(this.view.domNode, "keypress")
    ).event;
  }
  get onDidFocus() {
    return Event.signal(
      this.disposables.add(
        new DomEmitter(this.view.domNode, "focus", true)
      ).event
    );
  }
  get onDidBlur() {
    return Event.signal(
      this.disposables.add(
        new DomEmitter(this.view.domNode, "blur", true)
      ).event
    );
  }
  _onDidDispose = new Emitter();
  onDidDispose = this._onDidDispose.event;
  createListView(container, virtualDelegate, renderers, viewOptions) {
    return new ListView(container, virtualDelegate, renderers, viewOptions);
  }
  createMouseController(options) {
    return new MouseController(this);
  }
  updateOptions(optionsUpdate = {}) {
    this._options = { ...this._options, ...optionsUpdate };
    this.typeNavigationController?.updateOptions(this._options);
    if (this._options.multipleSelectionController !== void 0) {
      if (this._options.multipleSelectionSupport) {
        this.view.domNode.setAttribute("aria-multiselectable", "true");
      } else {
        this.view.domNode.removeAttribute("aria-multiselectable");
      }
    }
    this.mouseController.updateOptions(optionsUpdate);
    this.keyboardController?.updateOptions(optionsUpdate);
    this.view.updateOptions(optionsUpdate);
  }
  get options() {
    return this._options;
  }
  splice(start, deleteCount, elements = []) {
    if (start < 0 || start > this.view.length) {
      throw new ListError(this.user, `Invalid start index: ${start}`);
    }
    if (deleteCount < 0) {
      throw new ListError(
        this.user,
        `Invalid delete count: ${deleteCount}`
      );
    }
    if (deleteCount === 0 && elements.length === 0) {
      return;
    }
    this.eventBufferer.bufferEvents(
      () => this.spliceable.splice(start, deleteCount, elements)
    );
  }
  updateWidth(index) {
    this.view.updateWidth(index);
  }
  updateElementHeight(index, size) {
    this.view.updateElementHeight(index, size, null);
  }
  rerender() {
    this.view.rerender();
  }
  element(index) {
    return this.view.element(index);
  }
  indexOf(element) {
    return this.view.indexOf(element);
  }
  indexAt(position) {
    return this.view.indexAt(position);
  }
  get length() {
    return this.view.length;
  }
  get contentHeight() {
    return this.view.contentHeight;
  }
  get contentWidth() {
    return this.view.contentWidth;
  }
  get onDidChangeContentHeight() {
    return this.view.onDidChangeContentHeight;
  }
  get onDidChangeContentWidth() {
    return this.view.onDidChangeContentWidth;
  }
  get scrollTop() {
    return this.view.getScrollTop();
  }
  set scrollTop(scrollTop) {
    this.view.setScrollTop(scrollTop);
  }
  get scrollLeft() {
    return this.view.getScrollLeft();
  }
  set scrollLeft(scrollLeft) {
    this.view.setScrollLeft(scrollLeft);
  }
  get scrollHeight() {
    return this.view.scrollHeight;
  }
  get renderHeight() {
    return this.view.renderHeight;
  }
  get firstVisibleIndex() {
    return this.view.firstVisibleIndex;
  }
  get firstMostlyVisibleIndex() {
    return this.view.firstMostlyVisibleIndex;
  }
  get lastVisibleIndex() {
    return this.view.lastVisibleIndex;
  }
  get ariaLabel() {
    return this._ariaLabel;
  }
  set ariaLabel(value) {
    this._ariaLabel = value;
    this.view.domNode.setAttribute("aria-label", value);
  }
  domFocus() {
    this.view.domNode.focus({ preventScroll: true });
  }
  layout(height, width) {
    this.view.layout(height, width);
  }
  triggerTypeNavigation() {
    this.typeNavigationController?.trigger();
  }
  setSelection(indexes, browserEvent) {
    for (const index of indexes) {
      if (index < 0 || index >= this.length) {
        throw new ListError(this.user, `Invalid index ${index}`);
      }
    }
    this.selection.set(indexes, browserEvent);
  }
  getSelection() {
    return this.selection.get();
  }
  getSelectedElements() {
    return this.getSelection().map((i) => this.view.element(i));
  }
  setAnchor(index) {
    if (typeof index === "undefined") {
      this.anchor.set([]);
      return;
    }
    if (index < 0 || index >= this.length) {
      throw new ListError(this.user, `Invalid index ${index}`);
    }
    this.anchor.set([index]);
  }
  getAnchor() {
    return this.anchor.get().at(0);
  }
  getAnchorElement() {
    const anchor = this.getAnchor();
    return typeof anchor === "undefined" ? void 0 : this.element(anchor);
  }
  setFocus(indexes, browserEvent) {
    for (const index of indexes) {
      if (index < 0 || index >= this.length) {
        throw new ListError(this.user, `Invalid index ${index}`);
      }
    }
    this.focus.set(indexes, browserEvent);
  }
  focusNext(n = 1, loop = false, browserEvent, filter) {
    if (this.length === 0) {
      return;
    }
    const focus = this.focus.get();
    const index = this.findNextIndex(
      focus.length > 0 ? focus[0] + n : 0,
      loop,
      filter
    );
    if (index > -1) {
      this.setFocus([index], browserEvent);
    }
  }
  focusPrevious(n = 1, loop = false, browserEvent, filter) {
    if (this.length === 0) {
      return;
    }
    const focus = this.focus.get();
    const index = this.findPreviousIndex(
      focus.length > 0 ? focus[0] - n : 0,
      loop,
      filter
    );
    if (index > -1) {
      this.setFocus([index], browserEvent);
    }
  }
  async focusNextPage(browserEvent, filter) {
    let lastPageIndex = this.view.indexAt(
      this.view.getScrollTop() + this.view.renderHeight
    );
    lastPageIndex = lastPageIndex === 0 ? 0 : lastPageIndex - 1;
    const currentlyFocusedElementIndex = this.getFocus()[0];
    if (currentlyFocusedElementIndex !== lastPageIndex && (currentlyFocusedElementIndex === void 0 || lastPageIndex > currentlyFocusedElementIndex)) {
      const lastGoodPageIndex = this.findPreviousIndex(
        lastPageIndex,
        false,
        filter
      );
      if (lastGoodPageIndex > -1 && currentlyFocusedElementIndex !== lastGoodPageIndex) {
        this.setFocus([lastGoodPageIndex], browserEvent);
      } else {
        this.setFocus([lastPageIndex], browserEvent);
      }
    } else {
      const previousScrollTop = this.view.getScrollTop();
      let nextpageScrollTop = previousScrollTop + this.view.renderHeight;
      if (lastPageIndex > currentlyFocusedElementIndex) {
        nextpageScrollTop -= this.view.elementHeight(lastPageIndex);
      }
      this.view.setScrollTop(nextpageScrollTop);
      if (this.view.getScrollTop() !== previousScrollTop) {
        this.setFocus([]);
        await timeout(0);
        await this.focusNextPage(browserEvent, filter);
      }
    }
  }
  async focusPreviousPage(browserEvent, filter, getPaddingTop = () => 0) {
    let firstPageIndex;
    const paddingTop = getPaddingTop();
    const scrollTop = this.view.getScrollTop() + paddingTop;
    if (scrollTop === 0) {
      firstPageIndex = this.view.indexAt(scrollTop);
    } else {
      firstPageIndex = this.view.indexAfter(scrollTop - 1);
    }
    const currentlyFocusedElementIndex = this.getFocus()[0];
    if (currentlyFocusedElementIndex !== firstPageIndex && (currentlyFocusedElementIndex === void 0 || currentlyFocusedElementIndex >= firstPageIndex)) {
      const firstGoodPageIndex = this.findNextIndex(
        firstPageIndex,
        false,
        filter
      );
      if (firstGoodPageIndex > -1 && currentlyFocusedElementIndex !== firstGoodPageIndex) {
        this.setFocus([firstGoodPageIndex], browserEvent);
      } else {
        this.setFocus([firstPageIndex], browserEvent);
      }
    } else {
      const previousScrollTop = scrollTop;
      this.view.setScrollTop(
        scrollTop - this.view.renderHeight - paddingTop
      );
      if (this.view.getScrollTop() + getPaddingTop() !== previousScrollTop) {
        this.setFocus([]);
        await timeout(0);
        await this.focusPreviousPage(
          browserEvent,
          filter,
          getPaddingTop
        );
      }
    }
  }
  focusLast(browserEvent, filter) {
    if (this.length === 0) {
      return;
    }
    const index = this.findPreviousIndex(this.length - 1, false, filter);
    if (index > -1) {
      this.setFocus([index], browserEvent);
    }
  }
  focusFirst(browserEvent, filter) {
    this.focusNth(0, browserEvent, filter);
  }
  focusNth(n, browserEvent, filter) {
    if (this.length === 0) {
      return;
    }
    const index = this.findNextIndex(n, false, filter);
    if (index > -1) {
      this.setFocus([index], browserEvent);
    }
  }
  findNextIndex(index, loop = false, filter) {
    for (let i = 0; i < this.length; i++) {
      if (index >= this.length && !loop) {
        return -1;
      }
      index = index % this.length;
      if (!filter || filter(this.element(index))) {
        return index;
      }
      index++;
    }
    return -1;
  }
  findPreviousIndex(index, loop = false, filter) {
    for (let i = 0; i < this.length; i++) {
      if (index < 0 && !loop) {
        return -1;
      }
      index = (this.length + index % this.length) % this.length;
      if (!filter || filter(this.element(index))) {
        return index;
      }
      index--;
    }
    return -1;
  }
  getFocus() {
    return this.focus.get();
  }
  getFocusedElements() {
    return this.getFocus().map((i) => this.view.element(i));
  }
  reveal(index, relativeTop, paddingTop = 0) {
    if (index < 0 || index >= this.length) {
      throw new ListError(this.user, `Invalid index ${index}`);
    }
    const scrollTop = this.view.getScrollTop();
    const elementTop = this.view.elementTop(index);
    const elementHeight = this.view.elementHeight(index);
    if (isNumber(relativeTop)) {
      const m = elementHeight - this.view.renderHeight + paddingTop;
      this.view.setScrollTop(
        m * clamp(relativeTop, 0, 1) + elementTop - paddingTop
      );
    } else {
      const viewItemBottom = elementTop + elementHeight;
      const scrollBottom = scrollTop + this.view.renderHeight;
      if (elementTop < scrollTop + paddingTop && viewItemBottom >= scrollBottom) {
      } else if (elementTop < scrollTop + paddingTop || viewItemBottom >= scrollBottom && elementHeight >= this.view.renderHeight) {
        this.view.setScrollTop(elementTop - paddingTop);
      } else if (viewItemBottom >= scrollBottom) {
        this.view.setScrollTop(viewItemBottom - this.view.renderHeight);
      }
    }
  }
  /**
   * Returns the relative position of an element rendered in the list.
   * Returns `null` if the element isn't *entirely* in the visible viewport.
   */
  getRelativeTop(index, paddingTop = 0) {
    if (index < 0 || index >= this.length) {
      throw new ListError(this.user, `Invalid index ${index}`);
    }
    const scrollTop = this.view.getScrollTop();
    const elementTop = this.view.elementTop(index);
    const elementHeight = this.view.elementHeight(index);
    if (elementTop < scrollTop + paddingTop || elementTop + elementHeight > scrollTop + this.view.renderHeight) {
      return null;
    }
    const m = elementHeight - this.view.renderHeight + paddingTop;
    return Math.abs((scrollTop + paddingTop - elementTop) / m);
  }
  isDOMFocused() {
    return isActiveElement(this.view.domNode);
  }
  getHTMLElement() {
    return this.view.domNode;
  }
  getScrollableElement() {
    return this.view.scrollableElementDomNode;
  }
  getElementID(index) {
    return this.view.getElementDomId(index);
  }
  getElementTop(index) {
    return this.view.elementTop(index);
  }
  style(styles) {
    this.styleController.style(styles);
  }
  toListEvent({ indexes, browserEvent }) {
    return {
      indexes,
      elements: indexes.map((i) => this.view.element(i)),
      browserEvent
    };
  }
  _onFocusChange() {
    const focus = this.focus.get();
    this.view.domNode.classList.toggle("element-focused", focus.length > 0);
    this.onDidChangeActiveDescendant();
  }
  onDidChangeActiveDescendant() {
    const focus = this.focus.get();
    if (focus.length > 0) {
      let id;
      if (this.accessibilityProvider?.getActiveDescendantId) {
        id = this.accessibilityProvider.getActiveDescendantId(
          this.view.element(focus[0])
        );
      }
      this.view.domNode.setAttribute(
        "aria-activedescendant",
        id || this.view.getElementDomId(focus[0])
      );
    } else {
      this.view.domNode.removeAttribute("aria-activedescendant");
    }
  }
  _onSelectionChange() {
    const selection = this.selection.get();
    this.view.domNode.classList.toggle(
      "selection-none",
      selection.length === 0
    );
    this.view.domNode.classList.toggle(
      "selection-single",
      selection.length === 1
    );
    this.view.domNode.classList.toggle(
      "selection-multiple",
      selection.length > 1
    );
  }
  dispose() {
    this._onDidDispose.fire();
    this.disposables.dispose();
    this._onDidDispose.dispose();
  }
}
__decorateClass([
  memoize
], List.prototype, "onDidChangeFocus", 1);
__decorateClass([
  memoize
], List.prototype, "onDidChangeSelection", 1);
__decorateClass([
  memoize
], List.prototype, "onContextMenu", 1);
__decorateClass([
  memoize
], List.prototype, "onKeyDown", 1);
__decorateClass([
  memoize
], List.prototype, "onKeyUp", 1);
__decorateClass([
  memoize
], List.prototype, "onKeyPress", 1);
__decorateClass([
  memoize
], List.prototype, "onDidFocus", 1);
__decorateClass([
  memoize
], List.prototype, "onDidBlur", 1);
export {
  DefaultKeyboardNavigationDelegate,
  DefaultStyleController,
  List,
  MouseController,
  TypeNavigationMode,
  isActionItem,
  isButton,
  isMonacoCustomToggle,
  isMonacoEditor,
  isMonacoTwistie,
  isSelectionRangeChangeEvent,
  isSelectionSingleChangeEvent,
  isStickyScrollContainer,
  isStickyScrollElement,
  unthemedListStyles
};
//# sourceMappingURL=listWidget.js.map
