var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Emitter } from "../../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { TreeProjection } from "../../../browser/explorerProjections/treeProjection.js";
import { TestId } from "../../../common/testId.js";
import { TestResultItemChange, TestResultItemChangeReason } from "../../../common/testResult.js";
import { TestDiffOpType, TestItemExpandState, TestResultItem, TestResultState } from "../../../common/testTypes.js";
import { TestTreeTestHarness } from "../testObjectTree.js";
import { TestTestItem } from "../../common/testStubs.js";
class TestHierarchicalByLocationProjection extends TreeProjection {
  static {
    __name(this, "TestHierarchicalByLocationProjection");
  }
}
suite("Workbench - Testing Explorer Hierarchal by Location Projection", () => {
  let harness;
  let onTestChanged;
  let resultsService;
  let ds;
  teardown(() => {
    ds.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    ds = new DisposableStore();
    onTestChanged = ds.add(new Emitter());
    resultsService = {
      results: [],
      onResultsChanged: /* @__PURE__ */ __name(() => void 0, "onResultsChanged"),
      onTestChanged: onTestChanged.event,
      getStateById: /* @__PURE__ */ __name(() => ({ state: { state: 0 }, computedState: 0 }), "getStateById")
    };
    harness = ds.add(new TestTreeTestHarness((l) => new TestHierarchicalByLocationProjection({}, l, resultsService)));
  });
  test("renders initial tree", async () => {
    harness.flush();
    assert.deepStrictEqual(harness.tree.getRendered(), [
      { e: "a" },
      { e: "b" }
    ]);
  });
  test("expands children", async () => {
    harness.flush();
    harness.tree.expand(harness.projection.getElementByTestId(new TestId(["ctrlId", "id-a"]).toString()));
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "aa" }, { e: "ab" }] },
      { e: "b" }
    ]);
  });
  test("updates render if second test provider appears", async () => {
    harness.flush();
    harness.pushDiff({
      op: TestDiffOpType.Add,
      item: { controllerId: "ctrl2", expand: TestItemExpandState.Expanded, item: new TestTestItem(new TestId(["ctrlId2"]), "c").toTestItem() }
    }, {
      op: TestDiffOpType.Add,
      item: { controllerId: "ctrl2", expand: TestItemExpandState.NotExpandable, item: new TestTestItem(new TestId(["ctrlId2", "id-c"]), "ca").toTestItem() }
    });
    assert.deepStrictEqual(harness.flush(), [
      { e: "c", children: [{ e: "ca" }] },
      { e: "root", children: [{ e: "a" }, { e: "b" }] }
    ]);
  });
  test("updates nodes if they add children", async () => {
    harness.flush();
    harness.tree.expand(harness.projection.getElementByTestId(new TestId(["ctrlId", "id-a"]).toString()));
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "aa" }, { e: "ab" }] },
      { e: "b" }
    ]);
    harness.c.root.children.get("id-a").children.add(new TestTestItem(new TestId(["ctrlId", "id-a", "id-ac"]), "ac"));
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "aa" }, { e: "ab" }, { e: "ac" }] },
      { e: "b" }
    ]);
  });
  test("updates nodes if they remove children", async () => {
    harness.flush();
    harness.tree.expand(harness.projection.getElementByTestId(new TestId(["ctrlId", "id-a"]).toString()));
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "aa" }, { e: "ab" }] },
      { e: "b" }
    ]);
    harness.c.root.children.get("id-a").children.delete("id-ab");
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "aa" }] },
      { e: "b" }
    ]);
  });
  test("applies state changes", async () => {
    harness.flush();
    const resultInState = /* @__PURE__ */ __name((state) => ({
      item: {
        extId: new TestId(["ctrlId", "id-a"]).toString(),
        busy: false,
        description: null,
        error: null,
        label: "a",
        range: null,
        sortText: null,
        tags: [],
        uri: void 0
      },
      tasks: [],
      ownComputedState: state,
      computedState: state,
      expand: 0,
      controllerId: "ctrl"
    }), "resultInState");
    resultsService.getStateById = () => [void 0, resultInState(TestResultState.Queued)];
    onTestChanged.fire({
      reason: TestResultItemChangeReason.OwnStateChange,
      result: null,
      previousState: TestResultState.Unset,
      item: resultInState(TestResultState.Queued),
      previousOwnDuration: void 0
    });
    harness.projection.applyTo(harness.tree);
    assert.deepStrictEqual(harness.tree.getRendered("state"), [
      { e: "a", data: String(TestResultState.Queued) },
      { e: "b", data: String(TestResultState.Unset) }
    ]);
    resultsService.getStateById = () => [void 0, resultInState(TestResultState.Failed)];
    onTestChanged.fire({
      reason: TestResultItemChangeReason.OwnStateChange,
      result: null,
      previousState: TestResultState.Queued,
      item: resultInState(TestResultState.Unset),
      previousOwnDuration: void 0
    });
    harness.projection.applyTo(harness.tree);
    assert.deepStrictEqual(harness.tree.getRendered("state"), [
      { e: "a", data: String(TestResultState.Failed) },
      { e: "b", data: String(TestResultState.Unset) }
    ]);
  });
  test("applies test changes (resort)", async () => {
    harness.flush();
    harness.tree.expand(harness.projection.getElementByTestId(new TestId(["ctrlId", "id-a"]).toString()));
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "aa" }, { e: "ab" }] },
      { e: "b" }
    ]);
    harness.pushDiff({
      op: TestDiffOpType.Update,
      item: { extId: new TestId(["ctrlId", "id-a", "id-aa"]).toString(), item: { sortText: "z" } }
    }, {
      op: TestDiffOpType.Update,
      item: { extId: new TestId(["ctrlId", "id-a", "id-ab"]).toString(), item: { sortText: "a" } }
    });
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "ab" }, { e: "aa" }] },
      { e: "b" }
    ]);
    harness.pushDiff({
      op: TestDiffOpType.Update,
      item: { extId: new TestId(["ctrlId", "id-a", "id-aa"]).toString(), item: { sortText: void 0, label: "z" } }
    }, {
      op: TestDiffOpType.Update,
      item: { extId: new TestId(["ctrlId", "id-a", "id-ab"]).toString(), item: { sortText: void 0, label: "a" } }
    });
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "a" }, { e: "z" }] },
      { e: "b" }
    ]);
    harness.pushDiff({
      op: TestDiffOpType.Update,
      item: { extId: new TestId(["ctrlId", "id-a", "id-aa"]).toString(), item: { label: "a2" } }
    }, {
      op: TestDiffOpType.Update,
      item: { extId: new TestId(["ctrlId", "id-a", "id-ab"]).toString(), item: { label: "z2" } }
    });
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "a2" }, { e: "z2" }] },
      { e: "b" }
    ]);
  });
  test("applies test changes (error)", async () => {
    harness.flush();
    assert.deepStrictEqual(harness.flush(), [
      { e: "a" },
      { e: "b" }
    ]);
    harness.pushDiff({
      op: TestDiffOpType.Update,
      item: { extId: new TestId(["ctrlId", "id-a"]).toString(), item: { error: "bad" } }
    });
    assert.deepStrictEqual(harness.flush(), [
      { e: "a" },
      { e: "b" }
    ]);
    harness.tree.expand(harness.projection.getElementByTestId(new TestId(["ctrlId", "id-a"]).toString()));
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "bad" }, { e: "aa" }, { e: "ab" }] },
      { e: "b" }
    ]);
    harness.pushDiff({
      op: TestDiffOpType.Update,
      item: { extId: new TestId(["ctrlId", "id-a"]).toString(), item: { error: "badder" } }
    });
    assert.deepStrictEqual(harness.flush(), [
      { e: "a", children: [{ e: "badder" }, { e: "aa" }, { e: "ab" }] },
      { e: "b" }
    ]);
  });
  test("fixes #204805", async () => {
    harness.flush();
    harness.pushDiff({
      op: TestDiffOpType.Remove,
      itemId: "ctrlId"
    }, {
      op: TestDiffOpType.Add,
      item: { controllerId: "ctrlId", expand: TestItemExpandState.NotExpandable, item: new TestTestItem(new TestId(["ctrlId"]), "ctrl").toTestItem() }
    }, {
      op: TestDiffOpType.Add,
      item: { controllerId: "ctrlId", expand: TestItemExpandState.NotExpandable, item: new TestTestItem(new TestId(["ctrlId", "a"]), "a").toTestItem() }
    });
    assert.deepStrictEqual(harness.flush(), [
      { e: "a" }
    ]);
    harness.pushDiff({
      op: TestDiffOpType.Add,
      item: { controllerId: "ctrlId", expand: TestItemExpandState.NotExpandable, item: new TestTestItem(new TestId(["ctrlId", "a", "b"]), "b").toTestItem() }
    });
    harness.flush();
    harness.tree.expandAll();
    assert.deepStrictEqual(harness.tree.getRendered(), [
      { e: "a", children: [{ e: "b" }] }
    ]);
    harness.pushDiff({
      op: TestDiffOpType.Add,
      item: { controllerId: "ctrlId", expand: TestItemExpandState.NotExpandable, item: new TestTestItem(new TestId(["ctrlId", "a", "b", "c"]), "c").toTestItem() }
    });
    harness.flush();
    harness.tree.expandAll();
    assert.deepStrictEqual(harness.tree.getRendered(), [
      { e: "a", children: [{ e: "b", children: [{ e: "c" }] }] }
    ]);
  });
  test("fixes #213316 (single root)", async () => {
    harness.flush();
    assert.deepStrictEqual(harness.tree.getRendered(), [
      { e: "a" },
      { e: "b" }
    ]);
    harness.pushDiff({
      op: TestDiffOpType.Remove,
      itemId: new TestId(["ctrlId", "id-a"]).toString()
    });
    harness.flush();
    assert.deepStrictEqual(harness.tree.getRendered(), [
      { e: "b" }
    ]);
  });
  test("fixes #213316 (multi root)", async () => {
    harness.pushDiff({
      op: TestDiffOpType.Add,
      item: { controllerId: "ctrl2", expand: TestItemExpandState.Expanded, item: new TestTestItem(new TestId(["ctrlId2"]), "c").toTestItem() }
    }, {
      op: TestDiffOpType.Add,
      item: { controllerId: "ctrl2", expand: TestItemExpandState.NotExpandable, item: new TestTestItem(new TestId(["ctrlId2", "id-c"]), "ca").toTestItem() }
    });
    harness.flush();
    assert.deepStrictEqual(harness.flush(), [
      { e: "c", children: [{ e: "ca" }] },
      { e: "root", children: [{ e: "a" }, { e: "b" }] }
    ]);
    harness.pushDiff({
      op: TestDiffOpType.Remove,
      itemId: new TestId(["ctrlId", "id-a"]).toString()
    });
    harness.flush();
    assert.deepStrictEqual(harness.tree.getRendered(), [
      { e: "c", children: [{ e: "ca" }] },
      { e: "root", children: [{ e: "b" }] }
    ]);
    harness.pushDiff({
      op: TestDiffOpType.Remove,
      itemId: new TestId(["ctrlId", "id-b"]).toString()
    });
    harness.flush();
    assert.deepStrictEqual(harness.tree.getRendered(), [
      { e: "ca" }
    ]);
  });
});
//# sourceMappingURL=treeProjection.test.js.map
