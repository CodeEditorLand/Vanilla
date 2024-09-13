var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { $, append, clearNode, createStyleSheet, getContentHeight, getContentWidth } from "../../dom.js";
import { getBaseLayerHoverDelegate } from "../hover/hoverDelegate2.js";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import { IListRenderer, IListVirtualDelegate } from "../list/list.js";
import { IListOptions, IListOptionsUpdate, IListStyles, List, unthemedListStyles } from "../list/listWidget.js";
import { ISplitViewDescriptor, IView, Orientation, SplitView } from "../splitview/splitview.js";
import { ITableColumn, ITableContextMenuEvent, ITableEvent, ITableGestureEvent, ITableMouseEvent, ITableRenderer, ITableTouchEvent, ITableVirtualDelegate } from "./table.js";
import { Emitter, Event } from "../../../common/event.js";
import { Disposable, DisposableStore, IDisposable } from "../../../common/lifecycle.js";
import { ScrollbarVisibility, ScrollEvent } from "../../../common/scrollable.js";
import { ISpliceable } from "../../../common/sequence.js";
import "./table.css";
class TableListRenderer {
  constructor(columns, renderers, getColumnSize) {
    this.columns = columns;
    this.getColumnSize = getColumnSize;
    const rendererMap = new Map(renderers.map((r) => [r.templateId, r]));
    this.renderers = [];
    for (const column of columns) {
      const renderer = rendererMap.get(column.templateId);
      if (!renderer) {
        throw new Error(`Table cell renderer for template id ${column.templateId} not found.`);
      }
      this.renderers.push(renderer);
    }
  }
  static {
    __name(this, "TableListRenderer");
  }
  static TemplateId = "row";
  templateId = TableListRenderer.TemplateId;
  renderers;
  renderedTemplates = /* @__PURE__ */ new Set();
  renderTemplate(container) {
    const rowContainer = append(container, $(".monaco-table-tr"));
    const cellContainers = [];
    const cellTemplateData = [];
    for (let i = 0; i < this.columns.length; i++) {
      const renderer = this.renderers[i];
      const cellContainer = append(rowContainer, $(".monaco-table-td", { "data-col-index": i }));
      cellContainer.style.width = `${this.getColumnSize(i)}px`;
      cellContainers.push(cellContainer);
      cellTemplateData.push(renderer.renderTemplate(cellContainer));
    }
    const result = { container, cellContainers, cellTemplateData };
    this.renderedTemplates.add(result);
    return result;
  }
  renderElement(element, index, templateData, height) {
    for (let i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      const cell = column.project(element);
      const renderer = this.renderers[i];
      renderer.renderElement(cell, index, templateData.cellTemplateData[i], height);
    }
  }
  disposeElement(element, index, templateData, height) {
    for (let i = 0; i < this.columns.length; i++) {
      const renderer = this.renderers[i];
      if (renderer.disposeElement) {
        const column = this.columns[i];
        const cell = column.project(element);
        renderer.disposeElement(cell, index, templateData.cellTemplateData[i], height);
      }
    }
  }
  disposeTemplate(templateData) {
    for (let i = 0; i < this.columns.length; i++) {
      const renderer = this.renderers[i];
      renderer.disposeTemplate(templateData.cellTemplateData[i]);
    }
    clearNode(templateData.container);
    this.renderedTemplates.delete(templateData);
  }
  layoutColumn(index, size) {
    for (const { cellContainers } of this.renderedTemplates) {
      cellContainers[index].style.width = `${size}px`;
    }
  }
}
function asListVirtualDelegate(delegate) {
  return {
    getHeight(row) {
      return delegate.getHeight(row);
    },
    getTemplateId() {
      return TableListRenderer.TemplateId;
    }
  };
}
__name(asListVirtualDelegate, "asListVirtualDelegate");
class ColumnHeader extends Disposable {
  constructor(column, index) {
    super();
    this.column = column;
    this.index = index;
    this.element = $(".monaco-table-th", { "data-col-index": index }, column.label);
    if (column.tooltip) {
      this._register(getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, column.tooltip));
    }
  }
  static {
    __name(this, "ColumnHeader");
  }
  element;
  get minimumSize() {
    return this.column.minimumWidth ?? 120;
  }
  get maximumSize() {
    return this.column.maximumWidth ?? Number.POSITIVE_INFINITY;
  }
  get onDidChange() {
    return this.column.onDidChangeWidthConstraints ?? Event.None;
  }
  _onDidLayout = new Emitter();
  onDidLayout = this._onDidLayout.event;
  layout(size) {
    this._onDidLayout.fire([this.index, size]);
  }
}
class Table {
  constructor(user, container, virtualDelegate, columns, renderers, _options) {
    this.virtualDelegate = virtualDelegate;
    this.columns = columns;
    this.domNode = append(container, $(`.monaco-table.${this.domId}`));
    const headers = columns.map((c, i) => this.disposables.add(new ColumnHeader(c, i)));
    const descriptor = {
      size: headers.reduce((a, b) => a + b.column.weight, 0),
      views: headers.map((view) => ({ size: view.column.weight, view }))
    };
    this.splitview = this.disposables.add(new SplitView(this.domNode, {
      orientation: Orientation.HORIZONTAL,
      scrollbarVisibility: ScrollbarVisibility.Hidden,
      getSashOrthogonalSize: /* @__PURE__ */ __name(() => this.cachedHeight, "getSashOrthogonalSize"),
      descriptor
    }));
    this.splitview.el.style.height = `${virtualDelegate.headerRowHeight}px`;
    this.splitview.el.style.lineHeight = `${virtualDelegate.headerRowHeight}px`;
    const renderer = new TableListRenderer(columns, renderers, (i) => this.splitview.getViewSize(i));
    this.list = this.disposables.add(new List(user, this.domNode, asListVirtualDelegate(virtualDelegate), [renderer], _options));
    Event.any(...headers.map((h) => h.onDidLayout))(([index, size]) => renderer.layoutColumn(index, size), null, this.disposables);
    this.splitview.onDidSashReset((index) => {
      const totalWeight = columns.reduce((r, c) => r + c.weight, 0);
      const size = columns[index].weight / totalWeight * this.cachedWidth;
      this.splitview.resizeView(index, size);
    }, null, this.disposables);
    this.styleElement = createStyleSheet(this.domNode);
    this.style(unthemedListStyles);
  }
  static {
    __name(this, "Table");
  }
  static InstanceCount = 0;
  domId = `table_id_${++Table.InstanceCount}`;
  domNode;
  splitview;
  list;
  styleElement;
  disposables = new DisposableStore();
  cachedWidth = 0;
  cachedHeight = 0;
  get onDidChangeFocus() {
    return this.list.onDidChangeFocus;
  }
  get onDidChangeSelection() {
    return this.list.onDidChangeSelection;
  }
  get onDidScroll() {
    return this.list.onDidScroll;
  }
  get onMouseClick() {
    return this.list.onMouseClick;
  }
  get onMouseDblClick() {
    return this.list.onMouseDblClick;
  }
  get onMouseMiddleClick() {
    return this.list.onMouseMiddleClick;
  }
  get onPointer() {
    return this.list.onPointer;
  }
  get onMouseUp() {
    return this.list.onMouseUp;
  }
  get onMouseDown() {
    return this.list.onMouseDown;
  }
  get onMouseOver() {
    return this.list.onMouseOver;
  }
  get onMouseMove() {
    return this.list.onMouseMove;
  }
  get onMouseOut() {
    return this.list.onMouseOut;
  }
  get onTouchStart() {
    return this.list.onTouchStart;
  }
  get onTap() {
    return this.list.onTap;
  }
  get onContextMenu() {
    return this.list.onContextMenu;
  }
  get onDidFocus() {
    return this.list.onDidFocus;
  }
  get onDidBlur() {
    return this.list.onDidBlur;
  }
  get scrollTop() {
    return this.list.scrollTop;
  }
  set scrollTop(scrollTop) {
    this.list.scrollTop = scrollTop;
  }
  get scrollLeft() {
    return this.list.scrollLeft;
  }
  set scrollLeft(scrollLeft) {
    this.list.scrollLeft = scrollLeft;
  }
  get scrollHeight() {
    return this.list.scrollHeight;
  }
  get renderHeight() {
    return this.list.renderHeight;
  }
  get onDidDispose() {
    return this.list.onDidDispose;
  }
  getColumnLabels() {
    return this.columns.map((c) => c.label);
  }
  resizeColumn(index, percentage) {
    const size = Math.round(percentage / 100 * this.cachedWidth);
    this.splitview.resizeView(index, size);
  }
  updateOptions(options) {
    this.list.updateOptions(options);
  }
  splice(start, deleteCount, elements = []) {
    this.list.splice(start, deleteCount, elements);
  }
  rerender() {
    this.list.rerender();
  }
  row(index) {
    return this.list.element(index);
  }
  indexOf(element) {
    return this.list.indexOf(element);
  }
  get length() {
    return this.list.length;
  }
  getHTMLElement() {
    return this.domNode;
  }
  layout(height, width) {
    height = height ?? getContentHeight(this.domNode);
    width = width ?? getContentWidth(this.domNode);
    this.cachedWidth = width;
    this.cachedHeight = height;
    this.splitview.layout(width);
    const listHeight = height - this.virtualDelegate.headerRowHeight;
    this.list.getHTMLElement().style.height = `${listHeight}px`;
    this.list.layout(listHeight, width);
  }
  triggerTypeNavigation() {
    this.list.triggerTypeNavigation();
  }
  style(styles) {
    const content = [];
    content.push(`.monaco-table.${this.domId} > .monaco-split-view2 .monaco-sash.vertical::before {
			top: ${this.virtualDelegate.headerRowHeight + 1}px;
			height: calc(100% - ${this.virtualDelegate.headerRowHeight}px);
		}`);
    this.styleElement.textContent = content.join("\n");
    this.list.style(styles);
  }
  domFocus() {
    this.list.domFocus();
  }
  setAnchor(index) {
    this.list.setAnchor(index);
  }
  getAnchor() {
    return this.list.getAnchor();
  }
  getSelectedElements() {
    return this.list.getSelectedElements();
  }
  setSelection(indexes, browserEvent) {
    this.list.setSelection(indexes, browserEvent);
  }
  getSelection() {
    return this.list.getSelection();
  }
  setFocus(indexes, browserEvent) {
    this.list.setFocus(indexes, browserEvent);
  }
  focusNext(n = 1, loop = false, browserEvent) {
    this.list.focusNext(n, loop, browserEvent);
  }
  focusPrevious(n = 1, loop = false, browserEvent) {
    this.list.focusPrevious(n, loop, browserEvent);
  }
  focusNextPage(browserEvent) {
    return this.list.focusNextPage(browserEvent);
  }
  focusPreviousPage(browserEvent) {
    return this.list.focusPreviousPage(browserEvent);
  }
  focusFirst(browserEvent) {
    this.list.focusFirst(browserEvent);
  }
  focusLast(browserEvent) {
    this.list.focusLast(browserEvent);
  }
  getFocus() {
    return this.list.getFocus();
  }
  getFocusedElements() {
    return this.list.getFocusedElements();
  }
  getRelativeTop(index) {
    return this.list.getRelativeTop(index);
  }
  reveal(index, relativeTop) {
    this.list.reveal(index, relativeTop);
  }
  dispose() {
    this.disposables.dispose();
  }
}
export {
  Table
};
//# sourceMappingURL=tableWidget.js.map
