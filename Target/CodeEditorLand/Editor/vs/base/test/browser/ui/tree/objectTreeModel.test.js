var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ObjectTreeModel } from "../../../../browser/ui/tree/objectTreeModel.js";
import { ITreeFilter, ITreeModel, ITreeNode, ObjectTreeElementCollapseState, TreeVisibility } from "../../../../browser/ui/tree/tree.js";
import { timeout } from "../../../../common/async.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../common/utils.js";
import { IDisposable } from "../../../../common/lifecycle.js";
function bindListToModel(list, model) {
  return model.onDidSpliceRenderedNodes(({ start, deleteCount, elements }) => {
    list.splice(start, deleteCount, ...elements);
  });
}
__name(bindListToModel, "bindListToModel");
function toArray(list) {
  return list.map((i) => i.element);
}
__name(toArray, "toArray");
suite("ObjectTreeModel", function() {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("ctor", () => {
    const list = [];
    const model = new ObjectTreeModel("test");
    const disposable = bindListToModel(list, model);
    assert(model);
    assert.strictEqual(list.length, 0);
    assert.strictEqual(model.size, 0);
    disposable.dispose();
  });
  test("flat", () => {
    const list = [];
    const model = new ObjectTreeModel("test");
    const disposable = bindListToModel(list, model);
    model.setChildren(null, [
      { element: 0 },
      { element: 1 },
      { element: 2 }
    ]);
    assert.deepStrictEqual(toArray(list), [0, 1, 2]);
    assert.strictEqual(model.size, 3);
    model.setChildren(null, [
      { element: 3 },
      { element: 4 },
      { element: 5 }
    ]);
    assert.deepStrictEqual(toArray(list), [3, 4, 5]);
    assert.strictEqual(model.size, 3);
    model.setChildren(null);
    assert.deepStrictEqual(toArray(list), []);
    assert.strictEqual(model.size, 0);
    disposable.dispose();
  });
  test("nested", () => {
    const list = [];
    const model = new ObjectTreeModel("test");
    const disposable = bindListToModel(list, model);
    model.setChildren(null, [
      {
        element: 0,
        children: [
          { element: 10 },
          { element: 11 },
          { element: 12 }
        ]
      },
      { element: 1 },
      { element: 2 }
    ]);
    assert.deepStrictEqual(toArray(list), [0, 10, 11, 12, 1, 2]);
    assert.strictEqual(model.size, 6);
    model.setChildren(12, [
      { element: 120 },
      { element: 121 }
    ]);
    assert.deepStrictEqual(toArray(list), [0, 10, 11, 12, 120, 121, 1, 2]);
    assert.strictEqual(model.size, 8);
    model.setChildren(0);
    assert.deepStrictEqual(toArray(list), [0, 1, 2]);
    assert.strictEqual(model.size, 3);
    model.setChildren(null);
    assert.deepStrictEqual(toArray(list), []);
    assert.strictEqual(model.size, 0);
    disposable.dispose();
  });
  test("setChildren on collapsed node", () => {
    const list = [];
    const model = new ObjectTreeModel("test");
    const disposable = bindListToModel(list, model);
    model.setChildren(null, [
      { element: 0, collapsed: true }
    ]);
    assert.deepStrictEqual(toArray(list), [0]);
    model.setChildren(0, [
      { element: 1 },
      { element: 2 }
    ]);
    assert.deepStrictEqual(toArray(list), [0]);
    model.setCollapsed(0, false);
    assert.deepStrictEqual(toArray(list), [0, 1, 2]);
    disposable.dispose();
  });
  test("setChildren on expanded, unrevealed node", () => {
    const list = [];
    const model = new ObjectTreeModel("test");
    const disposable = bindListToModel(list, model);
    model.setChildren(null, [
      {
        element: 1,
        collapsed: true,
        children: [
          { element: 11, collapsed: false }
        ]
      },
      { element: 2 }
    ]);
    assert.deepStrictEqual(toArray(list), [1, 2]);
    model.setChildren(11, [
      { element: 111 },
      { element: 112 }
    ]);
    assert.deepStrictEqual(toArray(list), [1, 2]);
    model.setCollapsed(1, false);
    assert.deepStrictEqual(toArray(list), [1, 11, 111, 112, 2]);
    disposable.dispose();
  });
  test("collapse state is preserved with strict identity", () => {
    const list = [];
    const model = new ObjectTreeModel("test", { collapseByDefault: true });
    const data = [{ element: "father", children: [{ element: "child" }] }];
    const disposable = bindListToModel(list, model);
    model.setChildren(null, data);
    assert.deepStrictEqual(toArray(list), ["father"]);
    model.setCollapsed("father", false);
    assert.deepStrictEqual(toArray(list), ["father", "child"]);
    model.setChildren(null, data);
    assert.deepStrictEqual(toArray(list), ["father", "child"]);
    const data2 = [{ element: "father", children: [{ element: "child" }] }, { element: "uncle" }];
    model.setChildren(null, data2);
    assert.deepStrictEqual(toArray(list), ["father", "child", "uncle"]);
    model.setChildren(null, [{ element: "uncle" }]);
    assert.deepStrictEqual(toArray(list), ["uncle"]);
    model.setChildren(null, data2);
    assert.deepStrictEqual(toArray(list), ["father", "uncle"]);
    model.setChildren(null, data);
    assert.deepStrictEqual(toArray(list), ["father"]);
    disposable.dispose();
  });
  test("collapse state can be optionally preserved with strict identity", () => {
    const list = [];
    const model = new ObjectTreeModel("test", { collapseByDefault: true });
    const data = [{ element: "father", collapsed: ObjectTreeElementCollapseState.PreserveOrExpanded, children: [{ element: "child" }] }];
    const disposable = bindListToModel(list, model);
    model.setChildren(null, data);
    assert.deepStrictEqual(toArray(list), ["father", "child"]);
    model.setCollapsed("father", true);
    assert.deepStrictEqual(toArray(list), ["father"]);
    model.setChildren(null, data);
    assert.deepStrictEqual(toArray(list), ["father"]);
    model.setCollapsed("father", false);
    assert.deepStrictEqual(toArray(list), ["father", "child"]);
    model.setChildren(null, data);
    assert.deepStrictEqual(toArray(list), ["father", "child"]);
    disposable.dispose();
  });
  test("sorter", () => {
    const compare = /* @__PURE__ */ __name((a, b) => a < b ? -1 : 1, "compare");
    const list = [];
    const model = new ObjectTreeModel("test", { sorter: { compare(a, b) {
      return compare(a, b);
    } } });
    const data = [
      { element: "cars", children: [{ element: "sedan" }, { element: "convertible" }, { element: "compact" }] },
      { element: "airplanes", children: [{ element: "passenger" }, { element: "jet" }] },
      { element: "bicycles", children: [{ element: "dutch" }, { element: "mountain" }, { element: "electric" }] }
    ];
    const disposable = bindListToModel(list, model);
    model.setChildren(null, data);
    assert.deepStrictEqual(toArray(list), ["airplanes", "jet", "passenger", "bicycles", "dutch", "electric", "mountain", "cars", "compact", "convertible", "sedan"]);
    disposable.dispose();
  });
  test("resort", () => {
    let compare = /* @__PURE__ */ __name(() => 0, "compare");
    const list = [];
    const model = new ObjectTreeModel("test", { sorter: { compare(a, b) {
      return compare(a, b);
    } } });
    const data = [
      { element: "cars", children: [{ element: "sedan" }, { element: "convertible" }, { element: "compact" }] },
      { element: "airplanes", children: [{ element: "passenger" }, { element: "jet" }] },
      { element: "bicycles", children: [{ element: "dutch" }, { element: "mountain" }, { element: "electric" }] }
    ];
    const disposable = bindListToModel(list, model);
    model.setChildren(null, data);
    assert.deepStrictEqual(toArray(list), ["cars", "sedan", "convertible", "compact", "airplanes", "passenger", "jet", "bicycles", "dutch", "mountain", "electric"]);
    compare = /* @__PURE__ */ __name((a, b) => a < b ? -1 : 1, "compare");
    model.resort(null, false);
    assert.deepStrictEqual(toArray(list), ["airplanes", "passenger", "jet", "bicycles", "dutch", "mountain", "electric", "cars", "sedan", "convertible", "compact"]);
    model.resort();
    assert.deepStrictEqual(toArray(list), ["airplanes", "jet", "passenger", "bicycles", "dutch", "electric", "mountain", "cars", "compact", "convertible", "sedan"]);
    compare = /* @__PURE__ */ __name((a, b) => a < b ? 1 : -1, "compare");
    model.resort("cars");
    assert.deepStrictEqual(toArray(list), ["airplanes", "jet", "passenger", "bicycles", "dutch", "electric", "mountain", "cars", "sedan", "convertible", "compact"]);
    model.resort();
    assert.deepStrictEqual(toArray(list), ["cars", "sedan", "convertible", "compact", "bicycles", "mountain", "electric", "dutch", "airplanes", "passenger", "jet"]);
    disposable.dispose();
  });
  test("expandTo", () => {
    const list = [];
    const model = new ObjectTreeModel("test", { collapseByDefault: true });
    const disposable = bindListToModel(list, model);
    model.setChildren(null, [
      {
        element: 0,
        children: [
          { element: 10, children: [{ element: 100, children: [{ element: 1e3 }] }] },
          { element: 11 },
          { element: 12 }
        ]
      },
      { element: 1 },
      { element: 2 }
    ]);
    assert.deepStrictEqual(toArray(list), [0, 1, 2]);
    model.expandTo(1e3);
    assert.deepStrictEqual(toArray(list), [0, 10, 100, 1e3, 11, 12, 1, 2]);
    disposable.dispose();
  });
  test("issue #95641", async () => {
    const list = [];
    let fn = /* @__PURE__ */ __name((_) => true, "fn");
    const filter = new class {
      filter(element, parentVisibility) {
        if (element === "file") {
          return TreeVisibility.Recurse;
        }
        return fn(element) ? TreeVisibility.Visible : parentVisibility;
      }
    }();
    const model = new ObjectTreeModel("test", { filter });
    const disposable = bindListToModel(list, model);
    model.setChildren(null, [{ element: "file", children: [{ element: "hello" }] }]);
    assert.deepStrictEqual(toArray(list), ["file", "hello"]);
    fn = /* @__PURE__ */ __name((el) => el === "world", "fn");
    model.refilter();
    assert.deepStrictEqual(toArray(list), []);
    model.setChildren("file", [{ element: "world" }]);
    await timeout(0);
    assert.deepStrictEqual(toArray(list), ["file", "world"]);
    model.setChildren("file", [{ element: "hello" }]);
    await timeout(0);
    assert.deepStrictEqual(toArray(list), []);
    model.setChildren("file", [{ element: "world" }]);
    await timeout(0);
    assert.deepStrictEqual(toArray(list), ["file", "world"]);
    disposable.dispose();
  });
});
//# sourceMappingURL=objectTreeModel.test.js.map
