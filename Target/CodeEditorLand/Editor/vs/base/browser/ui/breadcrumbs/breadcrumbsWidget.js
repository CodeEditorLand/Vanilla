var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { commonPrefixLength } from "../../../common/arrays.js";
import { Emitter } from "../../../common/event.js";
import {
  DisposableStore,
  dispose
} from "../../../common/lifecycle.js";
import { ScrollbarVisibility } from "../../../common/scrollable.js";
import { ThemeIcon } from "../../../common/themables.js";
import * as dom from "../../dom.js";
import { DomScrollableElement } from "../scrollbar/scrollableElement.js";
import "./breadcrumbsWidget.css";
class BreadcrumbsItem {
  static {
    __name(this, "BreadcrumbsItem");
  }
}
class BreadcrumbsWidget {
  static {
    __name(this, "BreadcrumbsWidget");
  }
  _disposables = new DisposableStore();
  _domNode;
  _scrollable;
  _onDidSelectItem = new Emitter();
  _onDidFocusItem = new Emitter();
  _onDidChangeFocus = new Emitter();
  onDidSelectItem = this._onDidSelectItem.event;
  onDidFocusItem = this._onDidFocusItem.event;
  onDidChangeFocus = this._onDidChangeFocus.event;
  _items = new Array();
  _nodes = new Array();
  _freeNodes = new Array();
  _separatorIcon;
  _enabled = true;
  _focusedItemIdx = -1;
  _selectedItemIdx = -1;
  _pendingDimLayout;
  _pendingLayout;
  _dimension;
  constructor(container, horizontalScrollbarSize, separatorIcon, styles) {
    this._domNode = document.createElement("div");
    this._domNode.className = "monaco-breadcrumbs";
    this._domNode.tabIndex = 0;
    this._domNode.setAttribute("role", "list");
    this._scrollable = new DomScrollableElement(this._domNode, {
      vertical: ScrollbarVisibility.Hidden,
      horizontal: ScrollbarVisibility.Auto,
      horizontalScrollbarSize,
      useShadows: false,
      scrollYToX: true
    });
    this._separatorIcon = separatorIcon;
    this._disposables.add(this._scrollable);
    this._disposables.add(
      dom.addStandardDisposableListener(
        this._domNode,
        "click",
        (e) => this._onClick(e)
      )
    );
    container.appendChild(this._scrollable.getDomNode());
    const styleElement = dom.createStyleSheet(this._domNode);
    this._style(styleElement, styles);
    const focusTracker = dom.trackFocus(this._domNode);
    this._disposables.add(focusTracker);
    this._disposables.add(
      focusTracker.onDidBlur((_) => this._onDidChangeFocus.fire(false))
    );
    this._disposables.add(
      focusTracker.onDidFocus((_) => this._onDidChangeFocus.fire(true))
    );
  }
  setHorizontalScrollbarSize(size) {
    this._scrollable.updateOptions({
      horizontalScrollbarSize: size
    });
  }
  dispose() {
    this._disposables.dispose();
    this._pendingLayout?.dispose();
    this._pendingDimLayout?.dispose();
    this._onDidSelectItem.dispose();
    this._onDidFocusItem.dispose();
    this._onDidChangeFocus.dispose();
    this._domNode.remove();
    this._nodes.length = 0;
    this._freeNodes.length = 0;
  }
  layout(dim) {
    if (dim && dom.Dimension.equals(dim, this._dimension)) {
      return;
    }
    if (dim) {
      this._pendingDimLayout?.dispose();
      this._pendingDimLayout = this._updateDimensions(dim);
    } else {
      this._pendingLayout?.dispose();
      this._pendingLayout = this._updateScrollbar();
    }
  }
  _updateDimensions(dim) {
    const disposables = new DisposableStore();
    disposables.add(
      dom.modify(dom.getWindow(this._domNode), () => {
        this._dimension = dim;
        this._domNode.style.width = `${dim.width}px`;
        this._domNode.style.height = `${dim.height}px`;
        disposables.add(this._updateScrollbar());
      })
    );
    return disposables;
  }
  _updateScrollbar() {
    return dom.measure(dom.getWindow(this._domNode), () => {
      dom.measure(dom.getWindow(this._domNode), () => {
        this._scrollable.setRevealOnScroll(false);
        this._scrollable.scanDomNode();
        this._scrollable.setRevealOnScroll(true);
      });
    });
  }
  _style(styleElement, style) {
    let content = "";
    if (style.breadcrumbsBackground) {
      content += `.monaco-breadcrumbs { background-color: ${style.breadcrumbsBackground}}`;
    }
    if (style.breadcrumbsForeground) {
      content += `.monaco-breadcrumbs .monaco-breadcrumb-item { color: ${style.breadcrumbsForeground}}
`;
    }
    if (style.breadcrumbsFocusForeground) {
      content += `.monaco-breadcrumbs .monaco-breadcrumb-item.focused { color: ${style.breadcrumbsFocusForeground}}
`;
    }
    if (style.breadcrumbsFocusAndSelectionForeground) {
      content += `.monaco-breadcrumbs .monaco-breadcrumb-item.focused.selected { color: ${style.breadcrumbsFocusAndSelectionForeground}}
`;
    }
    if (style.breadcrumbsHoverForeground) {
      content += `.monaco-breadcrumbs:not(.disabled	) .monaco-breadcrumb-item:hover:not(.focused):not(.selected) { color: ${style.breadcrumbsHoverForeground}}
`;
    }
    styleElement.innerText = content;
  }
  setEnabled(value) {
    this._enabled = value;
    this._domNode.classList.toggle("disabled", !this._enabled);
  }
  domFocus() {
    const idx = this._focusedItemIdx >= 0 ? this._focusedItemIdx : this._items.length - 1;
    if (idx >= 0 && idx < this._items.length) {
      this._focus(idx, void 0);
    } else {
      this._domNode.focus();
    }
  }
  isDOMFocused() {
    return dom.isAncestorOfActiveElement(this._domNode);
  }
  getFocused() {
    return this._items[this._focusedItemIdx];
  }
  setFocused(item, payload) {
    this._focus(this._items.indexOf(item), payload);
  }
  focusPrev(payload) {
    if (this._focusedItemIdx > 0) {
      this._focus(this._focusedItemIdx - 1, payload);
    }
  }
  focusNext(payload) {
    if (this._focusedItemIdx + 1 < this._nodes.length) {
      this._focus(this._focusedItemIdx + 1, payload);
    }
  }
  _focus(nth, payload) {
    this._focusedItemIdx = -1;
    for (let i = 0; i < this._nodes.length; i++) {
      const node = this._nodes[i];
      if (i !== nth) {
        node.classList.remove("focused");
      } else {
        this._focusedItemIdx = i;
        node.classList.add("focused");
        node.focus();
      }
    }
    this._reveal(this._focusedItemIdx, true);
    this._onDidFocusItem.fire({
      type: "focus",
      item: this._items[this._focusedItemIdx],
      node: this._nodes[this._focusedItemIdx],
      payload
    });
  }
  reveal(item) {
    const idx = this._items.indexOf(item);
    if (idx >= 0) {
      this._reveal(idx, false);
    }
  }
  revealLast() {
    this._reveal(this._items.length - 1, false);
  }
  _reveal(nth, minimal) {
    if (nth < 0 || nth >= this._nodes.length) {
      return;
    }
    const node = this._nodes[nth];
    if (!node) {
      return;
    }
    const { width } = this._scrollable.getScrollDimensions();
    const { scrollLeft } = this._scrollable.getScrollPosition();
    if (!minimal || node.offsetLeft > scrollLeft + width || node.offsetLeft < scrollLeft) {
      this._scrollable.setRevealOnScroll(false);
      this._scrollable.setScrollPosition({ scrollLeft: node.offsetLeft });
      this._scrollable.setRevealOnScroll(true);
    }
  }
  getSelection() {
    return this._items[this._selectedItemIdx];
  }
  setSelection(item, payload) {
    this._select(this._items.indexOf(item), payload);
  }
  _select(nth, payload) {
    this._selectedItemIdx = -1;
    for (let i = 0; i < this._nodes.length; i++) {
      const node = this._nodes[i];
      if (i !== nth) {
        node.classList.remove("selected");
      } else {
        this._selectedItemIdx = i;
        node.classList.add("selected");
      }
    }
    this._onDidSelectItem.fire({
      type: "select",
      item: this._items[this._selectedItemIdx],
      node: this._nodes[this._selectedItemIdx],
      payload
    });
  }
  getItems() {
    return this._items;
  }
  setItems(items) {
    let prefix;
    let removed = [];
    try {
      prefix = commonPrefixLength(
        this._items,
        items,
        (a, b) => a.equals(b)
      );
      removed = this._items.splice(
        prefix,
        this._items.length - prefix,
        ...items.slice(prefix)
      );
      this._render(prefix);
      dispose(removed);
      this._focus(-1, void 0);
    } catch (e) {
      const newError = new Error(
        `BreadcrumbsItem#setItems: newItems: ${items.length}, prefix: ${prefix}, removed: ${removed.length}`
      );
      newError.name = e.name;
      newError.stack = e.stack;
      throw newError;
    }
  }
  _render(start) {
    let didChange = false;
    for (; start < this._items.length && start < this._nodes.length; start++) {
      const item = this._items[start];
      const node = this._nodes[start];
      this._renderItem(item, node);
      didChange = true;
    }
    while (start < this._nodes.length) {
      const free = this._nodes.pop();
      if (free) {
        this._freeNodes.push(free);
        free.remove();
        didChange = true;
      }
    }
    for (; start < this._items.length; start++) {
      const item = this._items[start];
      const node = this._freeNodes.length > 0 ? this._freeNodes.pop() : document.createElement("div");
      if (node) {
        this._renderItem(item, node);
        this._domNode.appendChild(node);
        this._nodes.push(node);
        didChange = true;
      }
    }
    if (didChange) {
      this.layout(void 0);
    }
  }
  _renderItem(item, container) {
    dom.clearNode(container);
    container.className = "";
    try {
      item.render(container);
    } catch (err) {
      container.innerText = "<<RENDER ERROR>>";
      console.error(err);
    }
    container.tabIndex = -1;
    container.setAttribute("role", "listitem");
    container.classList.add("monaco-breadcrumb-item");
    const iconContainer = dom.$(
      ThemeIcon.asCSSSelector(this._separatorIcon)
    );
    container.appendChild(iconContainer);
  }
  _onClick(event) {
    if (!this._enabled) {
      return;
    }
    for (let el = event.target; el; el = el.parentElement) {
      const idx = this._nodes.indexOf(el);
      if (idx >= 0) {
        this._focus(idx, event);
        this._select(idx, event);
        break;
      }
    }
  }
}
export {
  BreadcrumbsItem,
  BreadcrumbsWidget
};
//# sourceMappingURL=breadcrumbsWidget.js.map
