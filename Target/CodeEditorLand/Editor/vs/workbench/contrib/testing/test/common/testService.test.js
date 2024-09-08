import * as assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestId } from "../../common/testId.js";
import { simplifyTestsToExecute } from "../../common/testService.js";
import {
  getInitializedMainTestCollection,
  makeSimpleStubTree
} from "./testStubs.js";
suite("Workbench - Test Service", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("simplifyTestsToExecute", () => {
    const tree1 = {
      a: {
        b1: {
          c1: {
            d: void 0
          },
          c2: {
            d: void 0
          }
        },
        b2: void 0
      }
    };
    test("noop on single item", async () => {
      const c = await getInitializedMainTestCollection(
        makeSimpleStubTree(tree1)
      );
      const t = simplifyTestsToExecute(c, [
        c.getNodeById(new TestId(["ctrlId", "a", "b1"]).toString())
      ]);
      assert.deepStrictEqual(
        t.map((t2) => t2.item.extId.toString()),
        [new TestId(["ctrlId", "a", "b1"]).toString()]
      );
    });
    test("goes to common root 1", async () => {
      const c = await getInitializedMainTestCollection(
        makeSimpleStubTree(tree1)
      );
      const t = simplifyTestsToExecute(c, [
        c.getNodeById(
          new TestId(["ctrlId", "a", "b1", "c1", "d"]).toString()
        ),
        c.getNodeById(
          new TestId(["ctrlId", "a", "b1", "c2"]).toString()
        )
      ]);
      assert.deepStrictEqual(
        t.map((t2) => t2.item.extId.toString()),
        [new TestId(["ctrlId", "a", "b1"]).toString()]
      );
    });
    test("goes to common root 2", async () => {
      const c = await getInitializedMainTestCollection(
        makeSimpleStubTree(tree1)
      );
      const t = simplifyTestsToExecute(c, [
        c.getNodeById(
          new TestId(["ctrlId", "a", "b1", "c1"]).toString()
        ),
        c.getNodeById(new TestId(["ctrlId", "a", "b1"]).toString())
      ]);
      assert.deepStrictEqual(
        t.map((t2) => t2.item.extId.toString()),
        [new TestId(["ctrlId", "a", "b1"]).toString()]
      );
    });
    test("goes to common root 3", async () => {
      const c = await getInitializedMainTestCollection(
        makeSimpleStubTree(tree1)
      );
      const t = simplifyTestsToExecute(c, [
        c.getNodeById(
          new TestId(["ctrlId", "a", "b1", "c1", "d"]).toString()
        ),
        c.getNodeById(
          new TestId(["ctrlId", "a", "b1", "c2"]).toString()
        )
      ]);
      assert.deepStrictEqual(
        t.map((t2) => t2.item.extId.toString()),
        [new TestId(["ctrlId", "a", "b1"]).toString()]
      );
    });
    test("goes to common root 4", async () => {
      const c = await getInitializedMainTestCollection(
        makeSimpleStubTree(tree1)
      );
      const t = simplifyTestsToExecute(c, [
        c.getNodeById(new TestId(["ctrlId", "a", "b2"]).toString()),
        c.getNodeById(new TestId(["ctrlId", "a", "b1"]).toString())
      ]);
      assert.deepStrictEqual(
        t.map((t2) => t2.item.extId.toString()),
        [new TestId(["ctrlId"]).toString()]
      );
    });
    test("no-op divergent trees", async () => {
      const c = await getInitializedMainTestCollection(
        makeSimpleStubTree(tree1)
      );
      const t = simplifyTestsToExecute(c, [
        c.getNodeById(
          new TestId(["ctrlId", "a", "b1", "c2"]).toString()
        ),
        c.getNodeById(new TestId(["ctrlId", "a", "b2"]).toString())
      ]);
      assert.deepStrictEqual(
        t.map((t2) => t2.item.extId.toString()),
        [
          new TestId(["ctrlId", "a", "b1", "c2"]).toString(),
          new TestId(["ctrlId", "a", "b2"]).toString()
        ]
      );
    });
  });
});
