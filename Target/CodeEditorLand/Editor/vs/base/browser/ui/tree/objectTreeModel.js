var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IIdentityProvider } from "../list/list.js";
import { IIndexTreeModelOptions, IIndexTreeModelSpliceOptions, IndexTreeModel } from "./indexTreeModel.js";
import { ICollapseStateChangeEvent, IObjectTreeElement, ITreeElement, ITreeListSpliceData, ITreeModel, ITreeModelSpliceEvent, ITreeNode, ITreeSorter, ObjectTreeElementCollapseState, TreeError } from "./tree.js";
import { Event } from "../../../common/event.js";
import { Iterable } from "../../../common/iterator.js";
class ObjectTreeModel {
  constructor(user, options = {}) {
    this.user = user;
    this.model = new IndexTreeModel(user, null, options);
    this.onDidSpliceModel = this.model.onDidSpliceModel;
    this.onDidSpliceRenderedNodes = this.model.onDidSpliceRenderedNodes;
    this.onDidChangeCollapseState = this.model.onDidChangeCollapseState;
    this.onDidChangeRenderNodeCount = this.model.onDidChangeRenderNodeCount;
    if (options.sorter) {
      this.sorter = {
        compare(a, b) {
          return options.sorter.compare(a.element, b.element);
        }
      };
    }
    this.identityProvider = options.identityProvider;
  }
  static {
    __name(this, "ObjectTreeModel");
  }
  rootRef = null;
  model;
  nodes = /* @__PURE__ */ new Map();
  nodesByIdentity = /* @__PURE__ */ new Map();
  identityProvider;
  sorter;
  onDidSpliceModel;
  onDidSpliceRenderedNodes;
  onDidChangeCollapseState;
  onDidChangeRenderNodeCount;
  get size() {
    return this.nodes.size;
  }
  setChildren(element, children = Iterable.empty(), options = {}) {
    const location = this.getElementLocation(element);
    this._setChildren(location, this.preserveCollapseState(children), options);
  }
  _setChildren(location, children = Iterable.empty(), options) {
    const insertedElements = /* @__PURE__ */ new Set();
    const insertedElementIds = /* @__PURE__ */ new Set();
    const onDidCreateNode = /* @__PURE__ */ __name((node) => {
      if (node.element === null) {
        return;
      }
      const tnode = node;
      insertedElements.add(tnode.element);
      this.nodes.set(tnode.element, tnode);
      if (this.identityProvider) {
        const id = this.identityProvider.getId(tnode.element).toString();
        insertedElementIds.add(id);
        this.nodesByIdentity.set(id, tnode);
      }
      options.onDidCreateNode?.(tnode);
    }, "onDidCreateNode");
    const onDidDeleteNode = /* @__PURE__ */ __name((node) => {
      if (node.element === null) {
        return;
      }
      const tnode = node;
      if (!insertedElements.has(tnode.element)) {
        this.nodes.delete(tnode.element);
      }
      if (this.identityProvider) {
        const id = this.identityProvider.getId(tnode.element).toString();
        if (!insertedElementIds.has(id)) {
          this.nodesByIdentity.delete(id);
        }
      }
      options.onDidDeleteNode?.(tnode);
    }, "onDidDeleteNode");
    this.model.splice(
      [...location, 0],
      Number.MAX_VALUE,
      children,
      { ...options, onDidCreateNode, onDidDeleteNode }
    );
  }
  preserveCollapseState(elements = Iterable.empty()) {
    if (this.sorter) {
      elements = [...elements].sort(this.sorter.compare.bind(this.sorter));
    }
    return Iterable.map(elements, (treeElement) => {
      let node = this.nodes.get(treeElement.element);
      if (!node && this.identityProvider) {
        const id = this.identityProvider.getId(treeElement.element).toString();
        node = this.nodesByIdentity.get(id);
      }
      if (!node) {
        let collapsed2;
        if (typeof treeElement.collapsed === "undefined") {
          collapsed2 = void 0;
        } else if (treeElement.collapsed === ObjectTreeElementCollapseState.Collapsed || treeElement.collapsed === ObjectTreeElementCollapseState.PreserveOrCollapsed) {
          collapsed2 = true;
        } else if (treeElement.collapsed === ObjectTreeElementCollapseState.Expanded || treeElement.collapsed === ObjectTreeElementCollapseState.PreserveOrExpanded) {
          collapsed2 = false;
        } else {
          collapsed2 = Boolean(treeElement.collapsed);
        }
        return {
          ...treeElement,
          children: this.preserveCollapseState(treeElement.children),
          collapsed: collapsed2
        };
      }
      const collapsible = typeof treeElement.collapsible === "boolean" ? treeElement.collapsible : node.collapsible;
      let collapsed;
      if (typeof treeElement.collapsed === "undefined" || treeElement.collapsed === ObjectTreeElementCollapseState.PreserveOrCollapsed || treeElement.collapsed === ObjectTreeElementCollapseState.PreserveOrExpanded) {
        collapsed = node.collapsed;
      } else if (treeElement.collapsed === ObjectTreeElementCollapseState.Collapsed) {
        collapsed = true;
      } else if (treeElement.collapsed === ObjectTreeElementCollapseState.Expanded) {
        collapsed = false;
      } else {
        collapsed = Boolean(treeElement.collapsed);
      }
      return {
        ...treeElement,
        collapsible,
        collapsed,
        children: this.preserveCollapseState(treeElement.children)
      };
    });
  }
  rerender(element) {
    const location = this.getElementLocation(element);
    this.model.rerender(location);
  }
  resort(element = null, recursive = true) {
    if (!this.sorter) {
      return;
    }
    const location = this.getElementLocation(element);
    const node = this.model.getNode(location);
    this._setChildren(location, this.resortChildren(node, recursive), {});
  }
  resortChildren(node, recursive, first = true) {
    let childrenNodes = [...node.children];
    if (recursive || first) {
      childrenNodes = childrenNodes.sort(this.sorter.compare.bind(this.sorter));
    }
    return Iterable.map(childrenNodes, (node2) => ({
      element: node2.element,
      collapsible: node2.collapsible,
      collapsed: node2.collapsed,
      children: this.resortChildren(node2, recursive, false)
    }));
  }
  getFirstElementChild(ref = null) {
    const location = this.getElementLocation(ref);
    return this.model.getFirstElementChild(location);
  }
  getLastElementAncestor(ref = null) {
    const location = this.getElementLocation(ref);
    return this.model.getLastElementAncestor(location);
  }
  has(element) {
    return this.nodes.has(element);
  }
  getListIndex(element) {
    const location = this.getElementLocation(element);
    return this.model.getListIndex(location);
  }
  getListRenderCount(element) {
    const location = this.getElementLocation(element);
    return this.model.getListRenderCount(location);
  }
  isCollapsible(element) {
    const location = this.getElementLocation(element);
    return this.model.isCollapsible(location);
  }
  setCollapsible(element, collapsible) {
    const location = this.getElementLocation(element);
    return this.model.setCollapsible(location, collapsible);
  }
  isCollapsed(element) {
    const location = this.getElementLocation(element);
    return this.model.isCollapsed(location);
  }
  setCollapsed(element, collapsed, recursive) {
    const location = this.getElementLocation(element);
    return this.model.setCollapsed(location, collapsed, recursive);
  }
  expandTo(element) {
    const location = this.getElementLocation(element);
    this.model.expandTo(location);
  }
  refilter() {
    this.model.refilter();
  }
  getNode(element = null) {
    if (element === null) {
      return this.model.getNode(this.model.rootRef);
    }
    const node = this.nodes.get(element);
    if (!node) {
      throw new TreeError(this.user, `Tree element not found: ${element}`);
    }
    return node;
  }
  getNodeLocation(node) {
    return node.element;
  }
  getParentNodeLocation(element) {
    if (element === null) {
      throw new TreeError(this.user, `Invalid getParentNodeLocation call`);
    }
    const node = this.nodes.get(element);
    if (!node) {
      throw new TreeError(this.user, `Tree element not found: ${element}`);
    }
    const location = this.model.getNodeLocation(node);
    const parentLocation = this.model.getParentNodeLocation(location);
    const parent = this.model.getNode(parentLocation);
    return parent.element;
  }
  getElementLocation(element) {
    if (element === null) {
      return [];
    }
    const node = this.nodes.get(element);
    if (!node) {
      throw new TreeError(this.user, `Tree element not found: ${element}`);
    }
    return this.model.getNodeLocation(node);
  }
}
export {
  ObjectTreeModel
};
//# sourceMappingURL=objectTreeModel.js.map
