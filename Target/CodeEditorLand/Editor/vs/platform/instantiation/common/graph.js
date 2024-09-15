var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class Node {
  constructor(key, data) {
    this.key = key;
    this.data = data;
  }
  static {
    __name(this, "Node");
  }
  incoming = /* @__PURE__ */ new Map();
  outgoing = /* @__PURE__ */ new Map();
}
class Graph {
  constructor(_hashFn) {
    this._hashFn = _hashFn;
  }
  static {
    __name(this, "Graph");
  }
  _nodes = /* @__PURE__ */ new Map();
  roots() {
    const ret = [];
    for (const node of this._nodes.values()) {
      if (node.outgoing.size === 0) {
        ret.push(node);
      }
    }
    return ret;
  }
  insertEdge(from, to) {
    const fromNode = this.lookupOrInsertNode(from);
    const toNode = this.lookupOrInsertNode(to);
    fromNode.outgoing.set(toNode.key, toNode);
    toNode.incoming.set(fromNode.key, fromNode);
  }
  removeNode(data) {
    const key = this._hashFn(data);
    this._nodes.delete(key);
    for (const node of this._nodes.values()) {
      node.outgoing.delete(key);
      node.incoming.delete(key);
    }
  }
  lookupOrInsertNode(data) {
    const key = this._hashFn(data);
    let node = this._nodes.get(key);
    if (!node) {
      node = new Node(key, data);
      this._nodes.set(key, node);
    }
    return node;
  }
  lookup(data) {
    return this._nodes.get(this._hashFn(data));
  }
  isEmpty() {
    return this._nodes.size === 0;
  }
  toString() {
    const data = [];
    for (const [key, value] of this._nodes) {
      data.push(
        `${key}
	(-> incoming)[${[...value.incoming.keys()].join(", ")}]
	(outgoing ->)[${[...value.outgoing.keys()].join(",")}]
`
      );
    }
    return data.join("\n");
  }
  /**
   * This is brute force and slow and **only** be used
   * to trouble shoot.
   */
  findCycleSlow() {
    for (const [id, node] of this._nodes) {
      const seen = /* @__PURE__ */ new Set([id]);
      const res = this._findCycle(node, seen);
      if (res) {
        return res;
      }
    }
    return void 0;
  }
  _findCycle(node, seen) {
    for (const [id, outgoing] of node.outgoing) {
      if (seen.has(id)) {
        return [...seen, id].join(" -> ");
      }
      seen.add(id);
      const value = this._findCycle(outgoing, seen);
      if (value) {
        return value;
      }
      seen.delete(id);
    }
    return void 0;
  }
}
export {
  Graph,
  Node
};
//# sourceMappingURL=graph.js.map
