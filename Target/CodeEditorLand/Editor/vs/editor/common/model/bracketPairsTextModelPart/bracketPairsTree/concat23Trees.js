var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AstNodeKind, ListAstNode } from "./ast.js";
function concat23Trees(items) {
  if (items.length === 0) {
    return null;
  }
  if (items.length === 1) {
    return items[0];
  }
  let i = 0;
  function readNode() {
    if (i >= items.length) {
      return null;
    }
    const start = i;
    const height = items[start].listHeight;
    i++;
    while (i < items.length && items[i].listHeight === height) {
      i++;
    }
    if (i - start >= 2) {
      return concat23TreesOfSameHeight(
        start === 0 && i === items.length ? items : items.slice(start, i),
        false
      );
    } else {
      return items[start];
    }
  }
  __name(readNode, "readNode");
  let first = readNode();
  let second = readNode();
  if (!second) {
    return first;
  }
  for (let item = readNode(); item; item = readNode()) {
    if (heightDiff(first, second) <= heightDiff(second, item)) {
      first = concat(first, second);
      second = item;
    } else {
      second = concat(second, item);
    }
  }
  const result = concat(first, second);
  return result;
}
__name(concat23Trees, "concat23Trees");
function concat23TreesOfSameHeight(items, createImmutableLists = false) {
  if (items.length === 0) {
    return null;
  }
  if (items.length === 1) {
    return items[0];
  }
  let length = items.length;
  while (length > 3) {
    const newLength = length >> 1;
    for (let i = 0; i < newLength; i++) {
      const j = i << 1;
      items[i] = ListAstNode.create23(
        items[j],
        items[j + 1],
        j + 3 === length ? items[j + 2] : null,
        createImmutableLists
      );
    }
    length = newLength;
  }
  return ListAstNode.create23(
    items[0],
    items[1],
    length >= 3 ? items[2] : null,
    createImmutableLists
  );
}
__name(concat23TreesOfSameHeight, "concat23TreesOfSameHeight");
function heightDiff(node1, node2) {
  return Math.abs(node1.listHeight - node2.listHeight);
}
__name(heightDiff, "heightDiff");
function concat(node1, node2) {
  if (node1.listHeight === node2.listHeight) {
    return ListAstNode.create23(node1, node2, null, false);
  } else if (node1.listHeight > node2.listHeight) {
    return append(node1, node2);
  } else {
    return prepend(node2, node1);
  }
}
__name(concat, "concat");
function append(list, nodeToAppend) {
  list = list.toMutable();
  let curNode = list;
  const parents = [];
  let nodeToAppendOfCorrectHeight;
  while (true) {
    if (nodeToAppend.listHeight === curNode.listHeight) {
      nodeToAppendOfCorrectHeight = nodeToAppend;
      break;
    }
    if (curNode.kind !== AstNodeKind.List) {
      throw new Error("unexpected");
    }
    parents.push(curNode);
    curNode = curNode.makeLastElementMutable();
  }
  for (let i = parents.length - 1; i >= 0; i--) {
    const parent = parents[i];
    if (nodeToAppendOfCorrectHeight) {
      if (parent.childrenLength >= 3) {
        nodeToAppendOfCorrectHeight = ListAstNode.create23(
          parent.unappendChild(),
          nodeToAppendOfCorrectHeight,
          null,
          false
        );
      } else {
        parent.appendChildOfSameHeight(nodeToAppendOfCorrectHeight);
        nodeToAppendOfCorrectHeight = void 0;
      }
    } else {
      parent.handleChildrenChanged();
    }
  }
  if (nodeToAppendOfCorrectHeight) {
    return ListAstNode.create23(
      list,
      nodeToAppendOfCorrectHeight,
      null,
      false
    );
  } else {
    return list;
  }
}
__name(append, "append");
function prepend(list, nodeToAppend) {
  list = list.toMutable();
  let curNode = list;
  const parents = [];
  while (nodeToAppend.listHeight !== curNode.listHeight) {
    if (curNode.kind !== AstNodeKind.List) {
      throw new Error("unexpected");
    }
    parents.push(curNode);
    curNode = curNode.makeFirstElementMutable();
  }
  let nodeToPrependOfCorrectHeight = nodeToAppend;
  for (let i = parents.length - 1; i >= 0; i--) {
    const parent = parents[i];
    if (nodeToPrependOfCorrectHeight) {
      if (parent.childrenLength >= 3) {
        nodeToPrependOfCorrectHeight = ListAstNode.create23(
          nodeToPrependOfCorrectHeight,
          parent.unprependChild(),
          null,
          false
        );
      } else {
        parent.prependChildOfSameHeight(nodeToPrependOfCorrectHeight);
        nodeToPrependOfCorrectHeight = void 0;
      }
    } else {
      parent.handleChildrenChanged();
    }
  }
  if (nodeToPrependOfCorrectHeight) {
    return ListAstNode.create23(
      nodeToPrependOfCorrectHeight,
      list,
      null,
      false
    );
  } else {
    return list;
  }
}
__name(prepend, "prepend");
export {
  concat23Trees,
  concat23TreesOfSameHeight
};
//# sourceMappingURL=concat23Trees.js.map
