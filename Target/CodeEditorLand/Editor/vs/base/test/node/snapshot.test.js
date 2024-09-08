import * as fs from "fs";
import { tmpdir } from "os";
import * as path from "path";
import { URI } from "../../common/uri.js";
import { Promises } from "../../node/pfs.js";
import { SnapshotContext, assertSnapshot } from "../common/snapshot.js";
import {
  assertThrowsAsync,
  ensureNoDisposablesAreLeakedInTestSuite
} from "../common/utils.js";
import { getRandomTestPath } from "./testUtils.js";
suite("snapshot", () => {
  let testDir;
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    testDir = getRandomTestPath(tmpdir(), "vsctests", "snapshot");
    return fs.promises.mkdir(testDir, { recursive: true });
  });
  teardown(() => Promises.rm(testDir));
  const makeContext = (test2) => {
    return new class extends SnapshotContext {
      constructor() {
        super(test2);
        this.snapshotsDir = URI.file(testDir);
      }
    }();
  };
  const snapshotFileTree = async () => {
    let str = "";
    const printDir = async (dir, indent) => {
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
    };
    await printDir(testDir, 0);
    await assertSnapshot(str);
  };
  test("creates a snapshot", async () => {
    const ctx = makeContext({
      file: "foo/bar",
      fullTitle: () => "hello world!"
    });
    await ctx.assert({ cool: true });
    await snapshotFileTree();
  });
  test("validates a snapshot", async () => {
    const ctx1 = makeContext({
      file: "foo/bar",
      fullTitle: () => "hello world!"
    });
    await ctx1.assert({ cool: true });
    const ctx2 = makeContext({
      file: "foo/bar",
      fullTitle: () => "hello world!"
    });
    await ctx2.assert({ cool: true });
    const ctx3 = makeContext({
      file: "foo/bar",
      fullTitle: () => "hello world!"
    });
    await assertThrowsAsync(() => ctx3.assert({ cool: false }));
  });
  test("cleans up old snapshots", async () => {
    const ctx1 = makeContext({
      file: "foo/bar",
      fullTitle: () => "hello world!"
    });
    await ctx1.assert({ cool: true });
    await ctx1.assert({ nifty: true });
    await ctx1.assert(
      { customName: 1 },
      { name: "thirdTest", extension: "txt" }
    );
    await ctx1.assert({ customName: 2 }, { name: "fourthTest" });
    await snapshotFileTree();
    const ctx2 = makeContext({
      file: "foo/bar",
      fullTitle: () => "hello world!"
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
      /* @__PURE__ */ new Map([
        ["hello", 1],
        ["goodbye", 2]
      ]),
      /* @__PURE__ */ new Set([1, 2, 3]),
      function helloWorld() {
      },
      /hello/g,
      new Array(10).fill("long string".repeat(10)),
      {
        [Symbol.for("debug.description")]() {
          return `Range [1 -> 5]`;
        }
      }
    ]);
  });
});
