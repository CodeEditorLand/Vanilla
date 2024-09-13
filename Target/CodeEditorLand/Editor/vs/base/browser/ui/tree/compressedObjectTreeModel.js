var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../common/arrays.js";
import { Event } from "../../../common/event.js";
import { Iterable } from "../../../common/iterator.js";
import {
  ObjectTreeModel
} from "./objectTreeModel.js";
import {
  TreeError,
  WeakMapper
} from "./tree.js";
function noCompress(element) {
  const elements = [element.element];
  const incompressible = element.incompressible || false;
  return {
    element: { elements, incompressible },
    children: Iterable.map(Iterable.from(element.children), noCompress),
    collapsible: element.collapsible,
    collapsed: element.collapsed
  };
}
__name(noCompress, "noCompress");
function compress(element) {
  const elements = [element.element];
  const incompressible = element.incompressible || false;
  let childrenIterator;
  let children;
  while (true) {
    [children, childrenIterator] = Iterable.consume(
      Iterable.from(element.children),
      2
    );
    if (children.length !== 1) {
      break;
    }
    if (children[0].incompressible) {
      break;
    }
    element = children[0];
    elements.push(element.element);
  }
  return {
    element: { elements, incompressible },
    children: Iterable.map(
      Iterable.concat(children, childrenIterator),
      compress
    ),
    collapsible: element.collapsible,
    collapsed: element.collapsed
  };
}
__name(compress, "compress");
function _decompress(element, index = 0) {
  let children;
  if (index < element.element.elements.length - 1) {
    children = [_decompress(element, index + 1)];
  } else {
    children = Iterable.map(
      Iterable.from(element.children),
      (el) => _decompress(el, 0)
    );
  }
  if (index === 0 && element.element.incompressible) {
    return {
      element: element.element.elements[index],
      children,
      incompressible: true,
      collapsible: element.collapsible,
      collapsed: element.collapsed
    };
  }
  return {
    element: element.element.elements[index],
    children,
    collapsible: element.collapsible,
    collapsed: element.collapsed
  };
}
__name(_decompress, "_decompress");
function decompress(element) {
  return _decompress(element, 0);
}
__name(decompress, "decompress");
function splice(treeElement, element, children) {
  if (treeElement.element === element) {
    return { ...treeElement, children };
  }
  return {
    ...treeElement,
    children: Iterable.map(
      Iterable.from(treeElement.children),
      (e) => splice(e, element, children)
    )
  };
}
__name(splice, "splice");
const wrapIdentityProvider = /* @__PURE__ */ __name((base) => ({
  getId(node) {
    return node.elements.map((e) => base.getId(e).toString()).join("\0");
  }
}), "wrapIdentityProvider");
class CompressedObjectTreeModel {
  constructor(user, options = {}) {
    this.user = user;
    this.model = new ObjectTreeModel(user, options);
    this.enabled = typeof options.compressionEnabled === "undefined" ? true : options.compressionEnabled;
    this.identityProvider = options.identityProvider;
  }
  static {
    __name(this, "CompressedObjectTreeModel");
  }
  rootRef = null;
  get onDidSpliceRenderedNodes() {
    return this.model.onDidSpliceRenderedNodes;
  }
  get onDidSpliceModel() {
    return this.model.onDidSpliceModel;
  }
  get onDidChangeCollapseState() {
    return this.model.onDidChangeCollapseState;
  }
  get onDidChangeRenderNodeCount() {
    return this.model.onDidChangeRenderNodeCount;
  }
  model;
  nodes = /* @__PURE__ */ new Map();
  enabled;
  identityProvider;
  get size() {
    return this.nodes.size;
  }
  setChildren(element, children = Iterable.empty(), options) {
    const diffIdentityProvider = options.diffIdentityProvider && wrapIdentityProvider(options.diffIdentityProvider);
    if (element === null) {
      const compressedChildren = Iterable.map(
        children,
        this.enabled ? compress : noCompress
      );
      this._setChildren(null, compressedChildren, {
        diffIdentityProvider,
        diffDepth: Number.POSITIVE_INFINITY
      });
      return;
    }
    const compressedNode = this.nodes.get(element);
    if (!compressedNode) {
      throw new TreeError(this.user, "Unknown compressed tree node");
    }
    const node = this.model.getNode(compressedNode);
    const compressedParentNode = this.model.getParentNodeLocation(compressedNode);
    const parent = this.model.getNode(compressedParentNode);
    const decompressedElement = decompress(node);
    const splicedElement = splice(decompressedElement, element, children);
    const recompressedElement = (this.enabled ? compress : noCompress)(
      splicedElement
    );
    const elementComparator = options.diffIdentityProvider ? (a, b) => options.diffIdentityProvider.getId(a) === options.diffIdentityProvider.getId(b) : void 0;
    if (equals(
      recompressedElement.element.elements,
      node.element.elements,
      elementComparator
    )) {
      this._setChildren(
        compressedNode,
        recompressedElement.children || Iterable.empty(),
        { diffIdentityProvider, diffDepth: 1 }
      );
      return;
    }
    const parentChildren = parent.children.map(
      (child) => child === node ? recompressedElement : child
    );
    this._setChildren(parent.element, parentChildren, {
      diffIdentityProvider,
      diffDepth: node.depth - parent.depth
    });
  }
  isCompressionEnabled() {
    return this.enabled;
  }
  setCompressionEnabled(enabled) {
    if (enabled === this.enabled) {
      return;
    }
    this.enabled = enabled;
    const root = this.model.getNode();
    const rootChildren = root.children;
    const decompressedRootChildren = Iterable.map(rootChildren, decompress);
    const recompressedRootChildren = Iterable.map(
      decompressedRootChildren,
      enabled ? compress : noCompress
    );
    this._setChildren(null, recompressedRootChildren, {
      diffIdentityProvider: this.identityProvider,
      diffDepth: Number.POSITIVE_INFINITY
    });
  }
  _setChildren(node, children, options) {
    const insertedElements = /* @__PURE__ */ new Set();
    const onDidCreateNode = /* @__PURE__ */ __name((node2) => {
      for (const element of node2.element.elements) {
        insertedElements.add(element);
        this.nodes.set(element, node2.element);
      }
    }, "onDidCreateNode");
    const onDidDeleteNode = /* @__PURE__ */ __name((node2) => {
      for (const element of node2.element.elements) {
        if (!insertedElements.has(element)) {
          this.nodes.delete(element);
        }
      }
    }, "onDidDeleteNode");
    this.model.setChildren(node, children, {
      ...options,
      onDidCreateNode,
      onDidDeleteNode
    });
  }
  has(element) {
    return this.nodes.has(element);
  }
  getListIndex(location) {
    const node = this.getCompressedNode(location);
    return this.model.getListIndex(node);
  }
  getListRenderCount(location) {
    const node = this.getCompressedNode(location);
    return this.model.getListRenderCount(node);
  }
  getNode(location) {
    if (typeof location === "undefined") {
      return this.model.getNode();
    }
    const node = this.getCompressedNode(location);
    return this.model.getNode(node);
  }
  // TODO: review this
  getNodeLocation(node) {
    const compressedNode = this.model.getNodeLocation(node);
    if (compressedNode === null) {
      return null;
    }
    return compressedNode.elements[compressedNode.elements.length - 1];
  }
  // TODO: review this
  getParentNodeLocation(location) {
    const compressedNode = this.getCompressedNode(location);
    const parentNode = this.model.getParentNodeLocation(compressedNode);
    if (parentNode === null) {
      return null;
    }
    return parentNode.elements[parentNode.elements.length - 1];
  }
  getFirstElementChild(location) {
    const compressedNode = this.getCompressedNode(location);
    return this.model.getFirstElementChild(compressedNode);
  }
  getLastElementAncestor(location) {
    const compressedNode = typeof location === "undefined" ? void 0 : this.getCompressedNode(location);
    return this.model.getLastElementAncestor(compressedNode);
  }
  isCollapsible(location) {
    const compressedNode = this.getCompressedNode(location);
    return this.model.isCollapsible(compressedNode);
  }
  setCollapsible(location, collapsible) {
    const compressedNode = this.getCompressedNode(location);
    return this.model.setCollapsible(compressedNode, collapsible);
  }
  isCollapsed(location) {
    const compressedNode = this.getCompressedNode(location);
    return this.model.isCollapsed(compressedNode);
  }
  setCollapsed(location, collapsed, recursive) {
    const compressedNode = this.getCompressedNode(location);
    return this.model.setCollapsed(compressedNode, collapsed, recursive);
  }
  expandTo(location) {
    const compressedNode = this.getCompressedNode(location);
    this.model.expandTo(compressedNode);
  }
  rerender(location) {
    const compressedNode = this.getCompressedNode(location);
    this.model.rerender(compressedNode);
  }
  refilter() {
    this.model.refilter();
  }
  resort(location = null, recursive = true) {
    const compressedNode = this.getCompressedNode(location);
    this.model.resort(compressedNode, recursive);
  }
  getCompressedNode(element) {
    if (element === null) {
      return null;
    }
    const node = this.nodes.get(element);
    if (!node) {
      throw new TreeError(
        this.user,
        `Tree element not found: ${element}`
      );
    }
    return node;
  }
}
const DefaultElementMapper = /* @__PURE__ */ __name((elements) => elements[elements.length - 1], "DefaultElementMapper");
class CompressedTreeNodeWrapper {
  constructor(unwrapper, node) {
    this.unwrapper = unwrapper;
    this.node = node;
  }
  static {
    __name(this, "CompressedTreeNodeWrapper");
  }
  get element() {
    return this.node.element === null ? null : this.unwrapper(this.node.element);
  }
  get children() {
    return this.node.children.map(
      (node) => new CompressedTreeNodeWrapper(this.unwrapper, node)
    );
  }
  get depth() {
    return this.node.depth;
  }
  get visibleChildrenCount() {
    return this.node.visibleChildrenCount;
  }
  get visibleChildIndex() {
    return this.node.visibleChildIndex;
  }
  get collapsible() {
    return this.node.collapsible;
  }
  get collapsed() {
    return this.node.collapsed;
  }
  get visible() {
    return this.node.visible;
  }
  get filterData() {
    return this.node.filterData;
  }
}
function mapOptions(compressedNodeUnwrapper, options) {
  return {
    ...options,
    identityProvider: options.identityProvider && {
      getId(node) {
        return options.identityProvider.getId(
          compressedNodeUnwrapper(node)
        );
      }
    },
    sorter: options.sorter && {
      compare(node, otherNode) {
        return options.sorter.compare(
          node.elements[0],
          otherNode.elements[0]
        );
      }
    },
    filter: options.filter && {
      filter(node, parentVisibility) {
        return options.filter.filter(
          compressedNodeUnwrapper(node),
          parentVisibility
        );
      }
    }
  };
}
__name(mapOptions, "mapOptions");
class CompressibleObjectTreeModel {
  static {
    __name(this, "CompressibleObjectTreeModel");
  }
  rootRef = null;
  get onDidSpliceModel() {
    return Event.map(
      this.model.onDidSpliceModel,
      ({ insertedNodes, deletedNodes }) => ({
        insertedNodes: insertedNodes.map(
          (node) => this.nodeMapper.map(node)
        ),
        deletedNodes: deletedNodes.map(
          (node) => this.nodeMapper.map(node)
        )
      })
    );
  }
  get onDidSpliceRenderedNodes() {
    return Event.map(
      this.model.onDidSpliceRenderedNodes,
      ({ start, deleteCount, elements }) => ({
        start,
        deleteCount,
        elements: elements.map((node) => this.nodeMapper.map(node))
      })
    );
  }
  get onDidChangeCollapseState() {
    return Event.map(
      this.model.onDidChangeCollapseState,
      ({ node, deep }) => ({
        node: this.nodeMapper.map(node),
        deep
      })
    );
  }
  get onDidChangeRenderNodeCount() {
    return Event.map(
      this.model.onDidChangeRenderNodeCount,
      (node) => this.nodeMapper.map(node)
    );
  }
  elementMapper;
  nodeMapper;
  model;
  constructor(user, options = {}) {
    this.elementMapper = options.elementMapper || DefaultElementMapper;
    const compressedNodeUnwrapper = /* @__PURE__ */ __name((node) => this.elementMapper(node.elements), "compressedNodeUnwrapper");
    this.nodeMapper = new WeakMapper(
      (node) => new CompressedTreeNodeWrapper(compressedNodeUnwrapper, node)
    );
    this.model = new CompressedObjectTreeModel(
      user,
      mapOptions(compressedNodeUnwrapper, options)
    );
  }
  setChildren(element, children = Iterable.empty(), options = {}) {
    this.model.setChildren(element, children, options);
  }
  isCompressionEnabled() {
    return this.model.isCompressionEnabled();
  }
  setCompressionEnabled(enabled) {
    this.model.setCompressionEnabled(enabled);
  }
  has(location) {
    return this.model.has(location);
  }
  getListIndex(location) {
    return this.model.getListIndex(location);
  }
  getListRenderCount(location) {
    return this.model.getListRenderCount(location);
  }
  getNode(location) {
    return this.nodeMapper.map(this.model.getNode(location));
  }
  getNodeLocation(node) {
    return node.element;
  }
  getParentNodeLocation(location) {
    return this.model.getParentNodeLocation(location);
  }
  getFirstElementChild(location) {
    const result = this.model.getFirstElementChild(location);
    if (result === null || typeof result === "undefined") {
      return result;
    }
    return this.elementMapper(result.elements);
  }
  getLastElementAncestor(location) {
    const result = this.model.getLastElementAncestor(location);
    if (result === null || typeof result === "undefined") {
      return result;
    }
    return this.elementMapper(result.elements);
  }
  isCollapsible(location) {
    return this.model.isCollapsible(location);
  }
  setCollapsible(location, collapsed) {
    return this.model.setCollapsible(location, collapsed);
  }
  isCollapsed(location) {
    return this.model.isCollapsed(location);
  }
  setCollapsed(location, collapsed, recursive) {
    return this.model.setCollapsed(location, collapsed, recursive);
  }
  expandTo(location) {
    return this.model.expandTo(location);
  }
  rerender(location) {
    return this.model.rerender(location);
  }
  refilter() {
    return this.model.refilter();
  }
  resort(element = null, recursive = true) {
    return this.model.resort(element, recursive);
  }
  getCompressedTreeNode(location = null) {
    return this.model.getNode(location);
  }
}
export {
  CompressedObjectTreeModel,
  CompressibleObjectTreeModel,
  DefaultElementMapper,
  compress,
  decompress
};
//# sourceMappingURL=compressedObjectTreeModel.js.map
