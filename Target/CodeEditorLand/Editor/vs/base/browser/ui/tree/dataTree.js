import { Iterable } from "../../../common/iterator.js";
import {
  AbstractTree
} from "./abstractTree.js";
import { ObjectTreeModel } from "./objectTreeModel.js";
import {
  TreeError
} from "./tree.js";
class DataTree extends AbstractTree {
  constructor(user, container, delegate, renderers, dataSource, options = {}) {
    super(
      user,
      container,
      delegate,
      renderers,
      options
    );
    this.user = user;
    this.dataSource = dataSource;
    this.identityProvider = options.identityProvider;
  }
  input;
  identityProvider;
  nodesByIdentity = /* @__PURE__ */ new Map();
  // Model
  getInput() {
    return this.input;
  }
  setInput(input, viewState) {
    if (viewState && !this.identityProvider) {
      throw new TreeError(
        this.user,
        "Can't restore tree view state without an identity provider"
      );
    }
    this.input = input;
    if (!input) {
      this.nodesByIdentity.clear();
      this.model.setChildren(null, Iterable.empty());
      return;
    }
    if (!viewState) {
      this._refresh(input);
      return;
    }
    const focus = [];
    const selection = [];
    const isCollapsed = (element) => {
      const id = this.identityProvider.getId(element).toString();
      return !viewState.expanded[id];
    };
    const onDidCreateNode = (node) => {
      const id = this.identityProvider.getId(node.element).toString();
      if (viewState.focus.has(id)) {
        focus.push(node.element);
      }
      if (viewState.selection.has(id)) {
        selection.push(node.element);
      }
    };
    this._refresh(input, isCollapsed, onDidCreateNode);
    this.setFocus(focus);
    this.setSelection(selection);
    if (viewState && typeof viewState.scrollTop === "number") {
      this.scrollTop = viewState.scrollTop;
    }
  }
  updateChildren(element = this.input) {
    if (typeof this.input === "undefined") {
      throw new TreeError(this.user, "Tree input not set");
    }
    let isCollapsed;
    if (this.identityProvider) {
      isCollapsed = (element2) => {
        const id = this.identityProvider.getId(element2).toString();
        const node = this.nodesByIdentity.get(id);
        if (!node) {
          return void 0;
        }
        return node.collapsed;
      };
    }
    this._refresh(element, isCollapsed);
  }
  resort(element = this.input, recursive = true) {
    this.model.resort(
      element === this.input ? null : element,
      recursive
    );
  }
  // View
  refresh(element) {
    if (element === void 0) {
      this.view.rerender();
      return;
    }
    this.model.rerender(element);
  }
  // Implementation
  _refresh(element, isCollapsed, onDidCreateNode) {
    let onDidDeleteNode;
    if (this.identityProvider) {
      const insertedElements = /* @__PURE__ */ new Set();
      const outerOnDidCreateNode = onDidCreateNode;
      onDidCreateNode = (node) => {
        const id = this.identityProvider.getId(
          node.element
        ).toString();
        insertedElements.add(id);
        this.nodesByIdentity.set(id, node);
        outerOnDidCreateNode?.(node);
      };
      onDidDeleteNode = (node) => {
        const id = this.identityProvider.getId(
          node.element
        ).toString();
        if (!insertedElements.has(id)) {
          this.nodesByIdentity.delete(id);
        }
      };
    }
    this.model.setChildren(
      element === this.input ? null : element,
      this.iterate(element, isCollapsed).elements,
      { onDidCreateNode, onDidDeleteNode }
    );
  }
  iterate(element, isCollapsed) {
    const children = [...this.dataSource.getChildren(element)];
    const elements = Iterable.map(children, (element2) => {
      const { elements: children2, size } = this.iterate(
        element2,
        isCollapsed
      );
      const collapsible = this.dataSource.hasChildren ? this.dataSource.hasChildren(element2) : void 0;
      const collapsed = size === 0 ? void 0 : isCollapsed && isCollapsed(element2);
      return { element: element2, children: children2, collapsible, collapsed };
    });
    return { elements, size: children.length };
  }
  createModel(user, options) {
    return new ObjectTreeModel(user, options);
  }
}
export {
  DataTree
};
