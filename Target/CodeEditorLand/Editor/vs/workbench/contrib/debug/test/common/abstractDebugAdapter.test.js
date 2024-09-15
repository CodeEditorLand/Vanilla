var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { timeout } from "../../../../../base/common/async.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { MockDebugAdapter } from "./mockDebug.js";
suite("Debug - AbstractDebugAdapter", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("event ordering", () => {
    let adapter;
    let output;
    setup(() => {
      adapter = new MockDebugAdapter();
      output = [];
      adapter.onEvent((ev) => {
        output.push(ev.body.output);
        Promise.resolve().then(() => output.push("--end microtask--"));
      });
    });
    const evaluate = /* @__PURE__ */ __name(async (expression) => {
      await new Promise((resolve) => adapter.sendRequest("evaluate", { expression }, resolve));
      output.push(`=${expression}`);
      Promise.resolve().then(() => output.push("--end microtask--"));
    }, "evaluate");
    test("inserts task boundary before response", async () => {
      await evaluate("before.foo");
      await timeout(0);
      assert.deepStrictEqual(output, ["before.foo", "--end microtask--", "=before.foo", "--end microtask--"]);
    });
    test("inserts task boundary after response", async () => {
      await evaluate("after.foo");
      await timeout(0);
      assert.deepStrictEqual(output, ["=after.foo", "--end microtask--", "after.foo", "--end microtask--"]);
    });
    test("does not insert boundaries between events", async () => {
      adapter.sendEventBody("output", { output: "a" });
      adapter.sendEventBody("output", { output: "b" });
      adapter.sendEventBody("output", { output: "c" });
      await timeout(0);
      assert.deepStrictEqual(output, ["a", "b", "c", "--end microtask--", "--end microtask--", "--end microtask--"]);
    });
  });
});
//# sourceMappingURL=abstractDebugAdapter.test.js.map
