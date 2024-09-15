var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as fs from "fs";
import { tmpdir } from "os";
import { getRandomTestPath } from "./testUtils.js";
import { Promises } from "../../node/pfs.js";
import { SnapshotContext, assertSnapshot } from "../common/snapshot.js";
import { URI } from "../../common/uri.js";
import * as path from "path";
import { assertThrowsAsync, ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
suite("snapshot", () => {
  let testDir;
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(function() {
    testDir = getRandomTestPath(tmpdir(), "vsctests", "snapshot");
    return fs.promises.mkdir(testDir, { recursive: true });
  });
  teardown(function() {
    return Promises.rm(testDir);
  });
  const makeContext = /* @__PURE__ */ __name((test2) => {
    return new class extends SnapshotContext {
      constructor() {
        super(test2);
        this.snapshotsDir = URI.file(testDir);
      }
    }();
  }, "makeContext");
  const snapshotFileTree = /* @__PURE__ */ __name(async () => {
    let str = "";
    const printDir = /* @__PURE__ */ __name(async (dir, indent) => {
      const children = await Promises.readdir(dir);
      for (const child of children) {
        const p = path.join(dir, child);
        if ((await fs.promises.stat(p)).isFile()) {
          const content = await fs.promises.readFile(p, "utf-8");
          str += `${" ".repeat(indent)}${child}:
`;
          for (const line of content.split("\n")) {
            str += `${" ".repeat(indent + 2)}${line}
`;
          }
        } else {
          str += `${" ".repeat(indent)}${child}/
`;
          await printDir(p, indent + 2);
        }
      }
    }, "printDir");
    await printDir(testDir, 0);
    await assertSnapshot(str);
  }, "snapshotFileTree");
  test("creates a snapshot", async () => {
    const ctx = makeContext({
      file: "foo/bar",
      fullTitle: /* @__PURE__ */ __name(() => "hello world!", "fullTitle")
    });
    await ctx.assert({ cool: true });
    await snapshotFileTree();
  });
  test("validates a snapshot", async () => {
    const ctx1 = makeContext({
      file: "foo/bar",
      fullTitle: /* @__PURE__ */ __name(() => "hello world!", "fullTitle")
    });
    await ctx1.assert({ cool: true });
    const ctx2 = makeContext({
      file: "foo/bar",
      fullTitle: /* @__PURE__ */ __name(() => "hello world!", "fullTitle")
    });
    await ctx2.assert({ cool: true });
    const ctx3 = makeContext({
      file: "foo/bar",
      fullTitle: /* @__PURE__ */ __name(() => "hello world!", "fullTitle")
    });
    await assertThrowsAsync(() => ctx3.assert({ cool: false }));
  });
  test("cleans up old snapshots", async () => {
    const ctx1 = makeContext({
      file: "foo/bar",
      fullTitle: /* @__PURE__ */ __name(() => "hello world!", "fullTitle")
    });
    await ctx1.assert({ cool: true });
    await ctx1.assert({ nifty: true });
    await ctx1.assert({ customName: 1 }, { name: "thirdTest", extension: "txt" });
    await ctx1.assert({ customName: 2 }, { name: "fourthTest" });
    await snapshotFileTree();
    const ctx2 = makeContext({
      file: "foo/bar",
      fullTitle: /* @__PURE__ */ __name(() => "hello world!", "fullTitle")
    });
    await ctx2.assert({ cool: true });
    await ctx2.assert({ customName: 1 }, { name: "thirdTest" });
    await ctx2.removeOldSnapshots();
    await snapshotFileTree();
  });
  test("formats object nicely", async () => {
    const circular = {};
    circular.a = circular;
    await assertSnapshot([
      1,
      true,
      void 0,
      null,
      123n,
      Symbol("heyo"),
      "hello",
      { hello: "world" },
      circular,
      /* @__PURE__ */ new Map([["hello", 1], ["goodbye", 2]]),
      /* @__PURE__ */ new Set([1, 2, 3]),
      /* @__PURE__ */ __name(function helloWorld() {
      }, "helloWorld"),
      /hello/g,
      new Array(10).fill("long string".repeat(10)),
      { [Symbol.for("debug.description")]() {
        return `Range [1 -> 5]`;
      } }
    ]);
  });
});
//# sourceMappingURL=snapshot.test.js.map
