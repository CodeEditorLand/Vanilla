import assert from "assert";
import { Emitter } from "../../../../../../base/common/event.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { ListProjection } from "../../../browser/explorerProjections/listProjection.js";
import { TestId } from "../../../common/testId.js";
import {
  TestDiffOpType,
  TestItemExpandState
} from "../../../common/testTypes.js";
import { TestTestItem } from "../../common/testStubs.js";
import { TestTreeTestHarness } from "../testObjectTree.js";
suite("Workbench - Testing Explorer Hierarchal by Name Projection", () => {
  let harness;
  let onTestChanged;
  let resultsService;
  teardown(() => {
    harness.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    onTestChanged = new Emitter();
    resultsService = {
      onResultsChanged: () => void 0,
      onTestChanged: onTestChanged.event,
      getStateById: () => ({ state: { state: 0 }, computedState: 0 })
    };
    harness = new TestTreeTestHarness(
      (l) => new ListProjection({}, l, resultsService)
    );
  });
  test("renders initial tree", () => {
    harness.flush();
    assert.deepStrictEqual(harness.tree.getRendered(), [
      { e: "aa" },
      { e: "ab" },
      { e: "b" }
    ]);
  });
  test("updates render if second test provider appears", async () => {
    harness.flush();
    harness.pushDiff(
      {
        op: TestDiffOpType.Add,
        item: {
          controllerId: "ctrl2",
          expand: TestItemExpandState.Expanded,
          item: new TestTestItem(
            new TestId(["ctrl2"]),
            "root2"
          ).toTestItem()
        }
      },
      {
        op: TestDiffOpType.Add,
        item: {
          controllerId: "ctrl2",
          expand: TestItemExpandState.NotExpandable,
          item: new TestTestItem(
            new TestId(["ctrl2", "id-c"]),
            "c",
            void 0
          ).toTestItem()
        }
      }
    );
    assert.deepStrictEqual(harness.flush(), [
      { e: "root", children: [{ e: "aa" }, { e: "ab" }, { e: "b" }] },
      { e: "root2", children: [{ e: "c" }] }
    ]);
  });
  test("updates nodes if they add children", async () => {
    harness.flush();
    harness.c.root.children.get("id-a").children.add(
      new TestTestItem(new TestId(["ctrlId", "id-a", "id-ac"]), "ac")
    );
    assert.deepStrictEqual(harness.flush(), [
      { e: "aa" },
      { e: "ab" },
      { e: "ac" },
      { e: "b" }
    ]);
  });
  test("updates nodes if they remove children", async () => {
    harness.flush();
    harness.c.root.children.get("id-a").children.delete("id-ab");
    assert.deepStrictEqual(harness.flush(), [{ e: "aa" }, { e: "b" }]);
  });
  test("swaps when node is no longer leaf", async () => {
    harness.flush();
    harness.c.root.children.get("id-b").children.add(
      new TestTestItem(new TestId(["ctrlId", "id-b", "id-ba"]), "ba")
    );
    assert.deepStrictEqual(harness.flush(), [
      { e: "aa" },
      { e: "ab" },
      { e: "ba" }
    ]);
  });
});
