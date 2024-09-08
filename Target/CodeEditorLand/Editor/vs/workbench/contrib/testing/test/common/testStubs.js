import { URI } from "../../../../../base/common/uri.js";
import { MainThreadTestCollection } from "../../common/mainThreadTestCollection.js";
import { TestId } from "../../common/testId.js";
import {
  TestItemCollection,
  TestItemEventOp,
  createTestItemChildren
} from "../../common/testItemCollection.js";
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
  props;
  _canResolveChildren = false;
  get tags() {
    return this.props.tags.map((id) => ({ id }));
  }
  set tags(value) {
    this.api.listener?.({
      op: TestItemEventOp.SetTags,
      new: value,
      old: this.props.tags.map((t) => ({ id: t }))
    });
    this.props.tags = value.map((tag) => tag.id);
  }
  get canResolveChildren() {
    return this._canResolveChildren;
  }
  set canResolveChildren(value) {
    this._canResolveChildren = value;
    this.api.listener?.({
      op: TestItemEventOp.UpdateCanResolveChildren,
      state: value
    });
  }
  get parent() {
    return this.api.parent;
  }
  get id() {
    return this._extId.localId;
  }
  api = {
    controllerId: this._extId.controllerId
  };
  children = createTestItemChildren(
    this.api,
    (i) => i.api,
    TestTestItem
  );
  get(key) {
    return this.props[key];
  }
  set(key, value) {
    this.props[key] = value;
    this.api.listener?.({
      op: TestItemEventOp.SetProp,
      update: { [key]: value }
    });
  }
  toTestItem() {
    const props = { ...this.props };
    props.extId = this._extId.toString();
    return props;
  }
}
class TestTestCollection extends TestItemCollection {
  constructor(controllerId = "ctrlId") {
    const root = new TestTestItem(new TestId([controllerId]), "root");
    root._isRoot = true;
    super({
      controllerId,
      getApiFor: (t) => t.api,
      toITestItem: (t) => t.toTestItem(),
      getChildren: (t) => t.children,
      getDocumentVersion: () => void 0,
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
const getInitializedMainTestCollection = async (singleUse = testStubs.nested()) => {
  const c = new MainThreadTestCollection(
    { asCanonicalUri: (u) => u },
    async (t, l) => singleUse.expand(t, l)
  );
  await singleUse.expand(singleUse.root.id, Number.POSITIVE_INFINITY);
  c.apply(singleUse.collectDiff());
  singleUse.dispose();
  return c;
};
const makeSimpleStubTree = (ids) => {
  const collection = new TestTestCollection();
  const add = (parent, children, path) => {
    for (const id of Object.keys(children)) {
      const item = new TestTestItem(new TestId([...path, id]), id);
      parent.children.add(item);
      if (children[id]) {
        add(item, children[id], [...path, id]);
      }
    }
  };
  add(collection.root, ids, ["ctrlId"]);
  return collection;
};
const testStubs = {
  nested: (idPrefix = "id-") => {
    const collection = new TestTestCollection();
    collection.resolveHandler = (item) => {
      if (item === void 0) {
        const a = new TestTestItem(
          new TestId(["ctrlId", "id-a"]),
          "a",
          URI.file("/")
        );
        a.canResolveChildren = true;
        const b = new TestTestItem(
          new TestId(["ctrlId", "id-b"]),
          "b",
          URI.file("/")
        );
        collection.root.children.add(a);
        collection.root.children.add(b);
      } else if (item.id === idPrefix + "a") {
        item.children.add(
          new TestTestItem(
            new TestId(["ctrlId", "id-a", "id-aa"]),
            "aa",
            URI.file("/")
          )
        );
        item.children.add(
          new TestTestItem(
            new TestId(["ctrlId", "id-a", "id-ab"]),
            "ab",
            URI.file("/")
          )
        );
      }
    };
    return collection;
  }
};
export {
  TestTestCollection,
  TestTestItem,
  getInitializedMainTestCollection,
  makeSimpleStubTree,
  testStubs
};
