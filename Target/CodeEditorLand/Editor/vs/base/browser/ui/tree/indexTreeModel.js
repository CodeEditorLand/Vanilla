import { splice, tail2 } from "../../../common/arrays.js";
import { Delayer } from "../../../common/async.js";
import { LcsDiff } from "../../../common/diff/diff.js";
import { Emitter, EventBufferer } from "../../../common/event.js";
import { Iterable } from "../../../common/iterator.js";
import { MicrotaskDelay } from "../../../common/symbols.js";
import {
  TreeError,
  TreeVisibility
} from "./tree.js";
function isFilterResult(obj) {
  return typeof obj === "object" && "visibility" in obj && "data" in obj;
}
function getVisibleState(visibility) {
  switch (visibility) {
    case true:
      return TreeVisibility.Visible;
    case false:
      return TreeVisibility.Hidden;
    default:
      return visibility;
  }
}
function isCollapsibleStateUpdate(update) {
  return typeof update.collapsible === "boolean";
}
class IndexTreeModel {
  constructor(user, rootElement, options = {}) {
    this.user = user;
    this.collapseByDefault = typeof options.collapseByDefault === "undefined" ? false : options.collapseByDefault;
    this.allowNonCollapsibleParents = options.allowNonCollapsibleParents ?? false;
    this.filter = options.filter;
    this.autoExpandSingleChildren = typeof options.autoExpandSingleChildren === "undefined" ? false : options.autoExpandSingleChildren;
    this.root = {
      parent: void 0,
      element: rootElement,
      children: [],
      depth: 0,
      visibleChildrenCount: 0,
      visibleChildIndex: -1,
      collapsible: false,
      collapsed: false,
      renderNodeCount: 0,
      visibility: TreeVisibility.Visible,
      visible: true,
      filterData: void 0
    };
  }
  rootRef = [];
  root;
  eventBufferer = new EventBufferer();
  _onDidSpliceModel = new Emitter();
  onDidSpliceModel = this._onDidSpliceModel.event;
  _onDidSpliceRenderedNodes = new Emitter();
  onDidSpliceRenderedNodes = this._onDidSpliceRenderedNodes.event;
  _onDidChangeCollapseState = new Emitter();
  onDidChangeCollapseState = this.eventBufferer.wrapEvent(this._onDidChangeCollapseState.event);
  _onDidChangeRenderNodeCount = new Emitter();
  onDidChangeRenderNodeCount = this.eventBufferer.wrapEvent(this._onDidChangeRenderNodeCount.event);
  collapseByDefault;
  allowNonCollapsibleParents;
  filter;
  autoExpandSingleChildren;
  refilterDelayer = new Delayer(MicrotaskDelay);
  splice(location, deleteCount, toInsert = Iterable.empty(), options = {}) {
    if (location.length === 0) {
      throw new TreeError(this.user, "Invalid tree location");
    }
    if (options.diffIdentityProvider) {
      this.spliceSmart(
        options.diffIdentityProvider,
        location,
        deleteCount,
        toInsert,
        options
      );
    } else {
      this.spliceSimple(location, deleteCount, toInsert, options);
    }
  }
  spliceSmart(identity, location, deleteCount, toInsertIterable = Iterable.empty(), options, recurseLevels = options.diffDepth ?? 0) {
    const { parentNode } = this.getParentNodeWithListIndex(location);
    if (!parentNode.lastDiffIds) {
      return this.spliceSimple(
        location,
        deleteCount,
        toInsertIterable,
        options
      );
    }
    const toInsert = [...toInsertIterable];
    const index = location[location.length - 1];
    const diff = new LcsDiff(
      { getElements: () => parentNode.lastDiffIds },
      {
        getElements: () => [
          ...parentNode.children.slice(0, index),
          ...toInsert,
          ...parentNode.children.slice(index + deleteCount)
        ].map((e) => identity.getId(e.element).toString())
      }
    ).ComputeDiff(false);
    if (diff.quitEarly) {
      parentNode.lastDiffIds = void 0;
      return this.spliceSimple(location, deleteCount, toInsert, options);
    }
    const locationPrefix = location.slice(0, -1);
    const recurseSplice = (fromOriginal, fromModified, count) => {
      if (recurseLevels > 0) {
        for (let i = 0; i < count; i++) {
          fromOriginal--;
          fromModified--;
          this.spliceSmart(
            identity,
            [...locationPrefix, fromOriginal, 0],
            Number.MAX_SAFE_INTEGER,
            toInsert[fromModified].children,
            options,
            recurseLevels - 1
          );
        }
      }
    };
    let lastStartO = Math.min(
      parentNode.children.length,
      index + deleteCount
    );
    let lastStartM = toInsert.length;
    for (const change of diff.changes.sort(
      (a, b) => b.originalStart - a.originalStart
    )) {
      recurseSplice(
        lastStartO,
        lastStartM,
        lastStartO - (change.originalStart + change.originalLength)
      );
      lastStartO = change.originalStart;
      lastStartM = change.modifiedStart - index;
      this.spliceSimple(
        [...locationPrefix, lastStartO],
        change.originalLength,
        Iterable.slice(
          toInsert,
          lastStartM,
          lastStartM + change.modifiedLength
        ),
        options
      );
    }
    recurseSplice(lastStartO, lastStartM, lastStartO);
  }
  spliceSimple(location, deleteCount, toInsert = Iterable.empty(), {
    onDidCreateNode,
    onDidDeleteNode,
    diffIdentityProvider
  }) {
    const { parentNode, listIndex, revealed, visible } = this.getParentNodeWithListIndex(location);
    const treeListElementsToInsert = [];
    const nodesToInsertIterator = Iterable.map(
      toInsert,
      (el) => this.createTreeNode(
        el,
        parentNode,
        parentNode.visible ? TreeVisibility.Visible : TreeVisibility.Hidden,
        revealed,
        treeListElementsToInsert,
        onDidCreateNode
      )
    );
    const lastIndex = location[location.length - 1];
    let visibleChildStartIndex = 0;
    for (let i = lastIndex; i >= 0 && i < parentNode.children.length; i--) {
      const child = parentNode.children[i];
      if (child.visible) {
        visibleChildStartIndex = child.visibleChildIndex;
        break;
      }
    }
    const nodesToInsert = [];
    let insertedVisibleChildrenCount = 0;
    let renderNodeCount = 0;
    for (const child of nodesToInsertIterator) {
      nodesToInsert.push(child);
      renderNodeCount += child.renderNodeCount;
      if (child.visible) {
        child.visibleChildIndex = visibleChildStartIndex + insertedVisibleChildrenCount++;
      }
    }
    const deletedNodes = splice(
      parentNode.children,
      lastIndex,
      deleteCount,
      nodesToInsert
    );
    if (!diffIdentityProvider) {
      parentNode.lastDiffIds = void 0;
    } else if (parentNode.lastDiffIds) {
      splice(
        parentNode.lastDiffIds,
        lastIndex,
        deleteCount,
        nodesToInsert.map(
          (n) => diffIdentityProvider.getId(n.element).toString()
        )
      );
    } else {
      parentNode.lastDiffIds = parentNode.children.map(
        (n) => diffIdentityProvider.getId(n.element).toString()
      );
    }
    let deletedVisibleChildrenCount = 0;
    for (const child of deletedNodes) {
      if (child.visible) {
        deletedVisibleChildrenCount++;
      }
    }
    if (deletedVisibleChildrenCount !== 0) {
      for (let i = lastIndex + nodesToInsert.length; i < parentNode.children.length; i++) {
        const child = parentNode.children[i];
        if (child.visible) {
          child.visibleChildIndex -= deletedVisibleChildrenCount;
        }
      }
    }
    parentNode.visibleChildrenCount += insertedVisibleChildrenCount - deletedVisibleChildrenCount;
    if (revealed && visible) {
      const visibleDeleteCount = deletedNodes.reduce(
        (r, node2) => r + (node2.visible ? node2.renderNodeCount : 0),
        0
      );
      this._updateAncestorsRenderNodeCount(
        parentNode,
        renderNodeCount - visibleDeleteCount
      );
      this._onDidSpliceRenderedNodes.fire({
        start: listIndex,
        deleteCount: visibleDeleteCount,
        elements: treeListElementsToInsert
      });
    }
    if (deletedNodes.length > 0 && onDidDeleteNode) {
      const visit = (node2) => {
        onDidDeleteNode(node2);
        node2.children.forEach(visit);
      };
      deletedNodes.forEach(visit);
    }
    this._onDidSpliceModel.fire({
      insertedNodes: nodesToInsert,
      deletedNodes
    });
    let node = parentNode;
    while (node) {
      if (node.visibility === TreeVisibility.Recurse) {
        this.refilterDelayer.trigger(() => this.refilter());
        break;
      }
      node = node.parent;
    }
  }
  rerender(location) {
    if (location.length === 0) {
      throw new TreeError(this.user, "Invalid tree location");
    }
    const { node, listIndex, revealed } = this.getTreeNodeWithListIndex(location);
    if (node.visible && revealed) {
      this._onDidSpliceRenderedNodes.fire({
        start: listIndex,
        deleteCount: 1,
        elements: [node]
      });
    }
  }
  has(location) {
    return this.hasTreeNode(location);
  }
  getListIndex(location) {
    const { listIndex, visible, revealed } = this.getTreeNodeWithListIndex(location);
    return visible && revealed ? listIndex : -1;
  }
  getListRenderCount(location) {
    return this.getTreeNode(location).renderNodeCount;
  }
  isCollapsible(location) {
    return this.getTreeNode(location).collapsible;
  }
  setCollapsible(location, collapsible) {
    const node = this.getTreeNode(location);
    if (typeof collapsible === "undefined") {
      collapsible = !node.collapsible;
    }
    const update = { collapsible };
    return this.eventBufferer.bufferEvents(
      () => this._setCollapseState(location, update)
    );
  }
  isCollapsed(location) {
    return this.getTreeNode(location).collapsed;
  }
  setCollapsed(location, collapsed, recursive) {
    const node = this.getTreeNode(location);
    if (typeof collapsed === "undefined") {
      collapsed = !node.collapsed;
    }
    const update = {
      collapsed,
      recursive: recursive || false
    };
    return this.eventBufferer.bufferEvents(
      () => this._setCollapseState(location, update)
    );
  }
  _setCollapseState(location, update) {
    const { node, listIndex, revealed } = this.getTreeNodeWithListIndex(location);
    const result = this._setListNodeCollapseState(
      node,
      listIndex,
      revealed,
      update
    );
    if (node !== this.root && this.autoExpandSingleChildren && result && !isCollapsibleStateUpdate(update) && node.collapsible && !node.collapsed && !update.recursive) {
      let onlyVisibleChildIndex = -1;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.visible) {
          if (onlyVisibleChildIndex > -1) {
            onlyVisibleChildIndex = -1;
            break;
          } else {
            onlyVisibleChildIndex = i;
          }
        }
      }
      if (onlyVisibleChildIndex > -1) {
        this._setCollapseState(
          [...location, onlyVisibleChildIndex],
          update
        );
      }
    }
    return result;
  }
  _setListNodeCollapseState(node, listIndex, revealed, update) {
    const result = this._setNodeCollapseState(node, update, false);
    if (!revealed || !node.visible || !result) {
      return result;
    }
    const previousRenderNodeCount = node.renderNodeCount;
    const toInsert = this.updateNodeAfterCollapseChange(node);
    const deleteCount = previousRenderNodeCount - (listIndex === -1 ? 0 : 1);
    this._onDidSpliceRenderedNodes.fire({
      start: listIndex + 1,
      deleteCount,
      elements: toInsert.slice(1)
    });
    return result;
  }
  _setNodeCollapseState(node, update, deep) {
    let result;
    if (node === this.root) {
      result = false;
    } else {
      if (isCollapsibleStateUpdate(update)) {
        result = node.collapsible !== update.collapsible;
        node.collapsible = update.collapsible;
      } else if (node.collapsible) {
        result = node.collapsed !== update.collapsed;
        node.collapsed = update.collapsed;
      } else {
        result = false;
      }
      if (result) {
        this._onDidChangeCollapseState.fire({ node, deep });
      }
    }
    if (!isCollapsibleStateUpdate(update) && update.recursive) {
      for (const child of node.children) {
        result = this._setNodeCollapseState(child, update, true) || result;
      }
    }
    return result;
  }
  expandTo(location) {
    this.eventBufferer.bufferEvents(() => {
      let node = this.getTreeNode(location);
      while (node.parent) {
        node = node.parent;
        location = location.slice(0, location.length - 1);
        if (node.collapsed) {
          this._setCollapseState(location, {
            collapsed: false,
            recursive: false
          });
        }
      }
    });
  }
  refilter() {
    const previousRenderNodeCount = this.root.renderNodeCount;
    const toInsert = this.updateNodeAfterFilterChange(this.root);
    this._onDidSpliceRenderedNodes.fire({
      start: 0,
      deleteCount: previousRenderNodeCount,
      elements: toInsert
    });
    this.refilterDelayer.cancel();
  }
  createTreeNode(treeElement, parent, parentVisibility, revealed, treeListElements, onDidCreateNode) {
    const node = {
      parent,
      element: treeElement.element,
      children: [],
      depth: parent.depth + 1,
      visibleChildrenCount: 0,
      visibleChildIndex: -1,
      collapsible: typeof treeElement.collapsible === "boolean" ? treeElement.collapsible : typeof treeElement.collapsed !== "undefined",
      collapsed: typeof treeElement.collapsed === "undefined" ? this.collapseByDefault : treeElement.collapsed,
      renderNodeCount: 1,
      visibility: TreeVisibility.Visible,
      visible: true,
      filterData: void 0
    };
    const visibility = this._filterNode(node, parentVisibility);
    node.visibility = visibility;
    if (revealed) {
      treeListElements.push(node);
    }
    const childElements = treeElement.children || Iterable.empty();
    const childRevealed = revealed && visibility !== TreeVisibility.Hidden && !node.collapsed;
    let visibleChildrenCount = 0;
    let renderNodeCount = 1;
    for (const el of childElements) {
      const child = this.createTreeNode(
        el,
        node,
        visibility,
        childRevealed,
        treeListElements,
        onDidCreateNode
      );
      node.children.push(child);
      renderNodeCount += child.renderNodeCount;
      if (child.visible) {
        child.visibleChildIndex = visibleChildrenCount++;
      }
    }
    if (!this.allowNonCollapsibleParents) {
      node.collapsible = node.collapsible || node.children.length > 0;
    }
    node.visibleChildrenCount = visibleChildrenCount;
    node.visible = visibility === TreeVisibility.Recurse ? visibleChildrenCount > 0 : visibility === TreeVisibility.Visible;
    if (!node.visible) {
      node.renderNodeCount = 0;
      if (revealed) {
        treeListElements.pop();
      }
    } else if (!node.collapsed) {
      node.renderNodeCount = renderNodeCount;
    }
    onDidCreateNode?.(node);
    return node;
  }
  updateNodeAfterCollapseChange(node) {
    const previousRenderNodeCount = node.renderNodeCount;
    const result = [];
    this._updateNodeAfterCollapseChange(node, result);
    this._updateAncestorsRenderNodeCount(
      node.parent,
      result.length - previousRenderNodeCount
    );
    return result;
  }
  _updateNodeAfterCollapseChange(node, result) {
    if (node.visible === false) {
      return 0;
    }
    result.push(node);
    node.renderNodeCount = 1;
    if (!node.collapsed) {
      for (const child of node.children) {
        node.renderNodeCount += this._updateNodeAfterCollapseChange(
          child,
          result
        );
      }
    }
    this._onDidChangeRenderNodeCount.fire(node);
    return node.renderNodeCount;
  }
  updateNodeAfterFilterChange(node) {
    const previousRenderNodeCount = node.renderNodeCount;
    const result = [];
    this._updateNodeAfterFilterChange(
      node,
      node.visible ? TreeVisibility.Visible : TreeVisibility.Hidden,
      result
    );
    this._updateAncestorsRenderNodeCount(
      node.parent,
      result.length - previousRenderNodeCount
    );
    return result;
  }
  _updateNodeAfterFilterChange(node, parentVisibility, result, revealed = true) {
    let visibility;
    if (node !== this.root) {
      visibility = this._filterNode(node, parentVisibility);
      if (visibility === TreeVisibility.Hidden) {
        node.visible = false;
        node.renderNodeCount = 0;
        return false;
      }
      if (revealed) {
        result.push(node);
      }
    }
    const resultStartLength = result.length;
    node.renderNodeCount = node === this.root ? 0 : 1;
    let hasVisibleDescendants = false;
    if (!node.collapsed || visibility !== TreeVisibility.Hidden) {
      let visibleChildIndex = 0;
      for (const child of node.children) {
        hasVisibleDescendants = this._updateNodeAfterFilterChange(
          child,
          visibility,
          result,
          revealed && !node.collapsed
        ) || hasVisibleDescendants;
        if (child.visible) {
          child.visibleChildIndex = visibleChildIndex++;
        }
      }
      node.visibleChildrenCount = visibleChildIndex;
    } else {
      node.visibleChildrenCount = 0;
    }
    if (node !== this.root) {
      node.visible = visibility === TreeVisibility.Recurse ? hasVisibleDescendants : visibility === TreeVisibility.Visible;
      node.visibility = visibility;
    }
    if (!node.visible) {
      node.renderNodeCount = 0;
      if (revealed) {
        result.pop();
      }
    } else if (!node.collapsed) {
      node.renderNodeCount += result.length - resultStartLength;
    }
    this._onDidChangeRenderNodeCount.fire(node);
    return node.visible;
  }
  _updateAncestorsRenderNodeCount(node, diff) {
    if (diff === 0) {
      return;
    }
    while (node) {
      node.renderNodeCount += diff;
      this._onDidChangeRenderNodeCount.fire(node);
      node = node.parent;
    }
  }
  _filterNode(node, parentVisibility) {
    const result = this.filter ? this.filter.filter(node.element, parentVisibility) : TreeVisibility.Visible;
    if (typeof result === "boolean") {
      node.filterData = void 0;
      return result ? TreeVisibility.Visible : TreeVisibility.Hidden;
    } else if (isFilterResult(result)) {
      node.filterData = result.data;
      return getVisibleState(result.visibility);
    } else {
      node.filterData = void 0;
      return getVisibleState(result);
    }
  }
  // cheap
  hasTreeNode(location, node = this.root) {
    if (!location || location.length === 0) {
      return true;
    }
    const [index, ...rest] = location;
    if (index < 0 || index > node.children.length) {
      return false;
    }
    return this.hasTreeNode(rest, node.children[index]);
  }
  // cheap
  getTreeNode(location, node = this.root) {
    if (!location || location.length === 0) {
      return node;
    }
    const [index, ...rest] = location;
    if (index < 0 || index > node.children.length) {
      throw new TreeError(this.user, "Invalid tree location");
    }
    return this.getTreeNode(rest, node.children[index]);
  }
  // expensive
  getTreeNodeWithListIndex(location) {
    if (location.length === 0) {
      return {
        node: this.root,
        listIndex: -1,
        revealed: true,
        visible: false
      };
    }
    const { parentNode, listIndex, revealed, visible } = this.getParentNodeWithListIndex(location);
    const index = location[location.length - 1];
    if (index < 0 || index > parentNode.children.length) {
      throw new TreeError(this.user, "Invalid tree location");
    }
    const node = parentNode.children[index];
    return { node, listIndex, revealed, visible: visible && node.visible };
  }
  getParentNodeWithListIndex(location, node = this.root, listIndex = 0, revealed = true, visible = true) {
    const [index, ...rest] = location;
    if (index < 0 || index > node.children.length) {
      throw new TreeError(this.user, "Invalid tree location");
    }
    for (let i = 0; i < index; i++) {
      listIndex += node.children[i].renderNodeCount;
    }
    revealed = revealed && !node.collapsed;
    visible = visible && node.visible;
    if (rest.length === 0) {
      return { parentNode: node, listIndex, revealed, visible };
    }
    return this.getParentNodeWithListIndex(
      rest,
      node.children[index],
      listIndex + 1,
      revealed,
      visible
    );
  }
  getNode(location = []) {
    return this.getTreeNode(location);
  }
  // TODO@joao perf!
  getNodeLocation(node) {
    const location = [];
    let indexTreeNode = node;
    while (indexTreeNode.parent) {
      location.push(indexTreeNode.parent.children.indexOf(indexTreeNode));
      indexTreeNode = indexTreeNode.parent;
    }
    return location.reverse();
  }
  getParentNodeLocation(location) {
    if (location.length === 0) {
      return void 0;
    } else if (location.length === 1) {
      return [];
    } else {
      return tail2(location)[0];
    }
  }
  getFirstElementChild(location) {
    const node = this.getTreeNode(location);
    if (node.children.length === 0) {
      return void 0;
    }
    return node.children[0].element;
  }
  getLastElementAncestor(location = []) {
    const node = this.getTreeNode(location);
    if (node.children.length === 0) {
      return void 0;
    }
    return this._getLastElementAncestor(node);
  }
  _getLastElementAncestor(node) {
    if (node.children.length === 0) {
      return node.element;
    }
    return this._getLastElementAncestor(
      node.children[node.children.length - 1]
    );
  }
}
export {
  IndexTreeModel,
  getVisibleState,
  isFilterResult
};
