var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../../base/common/uri.js";
import { MainThreadTestCollection } from "../../common/mainThreadTestCollection.js";
import { ITestItem, TestsDiff } from "../../common/testTypes.js";
import { TestId } from "../../common/testId.js";
import { createTestItemChildren, ITestItemApi, ITestItemLike, TestItemCollection, TestItemEventOp } from "../../common/testItemCollection.js";
class TestTestItem {
  constructor(_extId, label, uri) {
    this._extId = _extId;
    this.props = {
      extId: _extId.toString(),
      busy: false,
      description: null,
      error: null,
      label,
      range: null,
      sortText: null,
      tags: [],
      uri
    };
  }
  static {
    __name(this, "TestTestItem");
  }
  props;
  _canResolveChildren = false;
  get tags() {
    return this.props.tags.map((id) => ({ id }));
  }
  set tags(value) {
    this.api.listener?.({ op: TestItemEventOp.SetTags, new: value, old: this.props.tags.map((t) => ({ id: t })) });
    this.props.tags = value.map((tag) => tag.id);
  }
  get canResolveChildren() {
    return this._canResolveChildren;
  }
  set canResolveChildren(value) {
    this._canResolveChildren = value;
    this.api.listener?.({ op: TestItemEventOp.UpdateCanResolveChildren, state: value });
  }
  get parent() {
    return this.api.parent;
  }
  get id() {
    return this._extId.localId;
  }
  api = { controllerId: this._extId.controllerId };
  children = createTestItemChildren(this.api, (i) => i.api, TestTestItem);
  get(key) {
    return this.props[key];
  }
  set(key, value) {
    this.props[key] = value;
    this.api.listener?.({ op: TestItemEventOp.SetProp, update: { [key]: value } });
  }
  toTestItem() {
    const props = { ...this.props };
    props.extId = this._extId.toString();
    return props;
  }
}
class TestTestCollection extends TestItemCollection {
  static {
    __name(this, "TestTestCollection");
  }
  constructor(controllerId = "ctrlId") {
    const root = new TestTestItem(new TestId([controllerId]), "root");
    root._isRoot = true;
    super({
      controllerId,
      getApiFor: /* @__PURE__ */ __name((t) => t.api, "getApiFor"),
      toITestItem: /* @__PURE__ */ __name((t) => t.toTestItem(), "toITestItem"),
      getChildren: /* @__PURE__ */ __name((t) => t.children, "getChildren"),
      getDocumentVersion: /* @__PURE__ */ __name(() => void 0, "getDocumentVersion"),
      root
    });
  }
  get currentDiff() {
    return this.diff;
  }
  setDiff(diff) {
    this.diff = diff;
  }
}
const getInitializedMainTestCollection = /* @__PURE__ */ __name(async (singleUse = testStubs.nested()) => {
  const c = new MainThreadTestCollection({ asCanonicalUri: /* @__PURE__ */ __name((u) => u, "asCanonicalUri") }, async (t, l) => singleUse.expand(t, l));
  await singleUse.expand(singleUse.root.id, Infinity);
  c.apply(singleUse.collectDiff());
  singleUse.dispose();
  return c;
}, "getInitializedMainTestCollection");
const makeSimpleStubTree = /* @__PURE__ */ __name((ids) => {
  const collection = new TestTestCollection();
  const add = /* @__PURE__ */ __name((parent, children, path) => {
    for (const id of Object.keys(children)) {
      const item = new TestTestItem(new TestId([...path, id]), id);
      parent.children.add(item);
      if (children[id]) {
        add(item, children[id], [...path, id]);
      }
    }
  }, "add");
  add(collection.root, ids, ["ctrlId"]);
  return collection;
}, "makeSimpleStubTree");
const testStubs = {
  nested: /* @__PURE__ */ __name((idPrefix = "id-") => {
    const collection = new TestTestCollection();
    collection.resolveHandler = (item) => {
      if (item === void 0) {
        const a = new TestTestItem(new TestId(["ctrlId", "id-a"]), "a", URI.file("/"));
        a.canResolveChildren = true;
        const b = new TestTestItem(new TestId(["ctrlId", "id-b"]), "b", URI.file("/"));
        collection.root.children.add(a);
        collection.root.children.add(b);
      } else if (item.id === idPrefix + "a") {
        item.children.add(new TestTestItem(new TestId(["ctrlId", "id-a", "id-aa"]), "aa", URI.file("/")));
        item.children.add(new TestTestItem(new TestId(["ctrlId", "id-a", "id-ab"]), "ab", URI.file("/")));
      }
    };
    return collection;
  }, "nested")
};
export {
  TestTestCollection,
  TestTestItem,
  getInitializedMainTestCollection,
  makeSimpleStubTree,
  testStubs
};
//# sourceMappingURL=testStubs.js.map
