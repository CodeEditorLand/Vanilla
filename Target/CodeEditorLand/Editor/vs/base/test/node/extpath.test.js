import assert from "assert";
import * as fs from "fs";
import { tmpdir } from "os";
import {
  realcase,
  realcaseSync,
  realpath,
  realpathSync
} from "../../node/extpath.js";
import { Promises } from "../../node/pfs.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
import { flakySuite, getRandomTestPath } from "./testUtils.js";
flakySuite("Extpath", () => {
  let testDir;
  setup(() => {
    testDir = getRandomTestPath(tmpdir(), "vsctests", "extpath");
    return fs.promises.mkdir(testDir, { recursive: true });
  });
  teardown(() => {
    return Promises.rm(testDir);
  });
  test("realcaseSync", async () => {
    if (process.platform === "win32" || process.platform === "darwin") {
      const upper = testDir.toUpperCase();
      const real = realcaseSync(upper);
      if (real) {
        assert.notStrictEqual(real, upper);
        assert.strictEqual(real.toUpperCase(), upper);
        assert.strictEqual(real, testDir);
      }
    } else {
      let real = realcaseSync(testDir);
      assert.strictEqual(real, testDir);
      real = realcaseSync(testDir.toUpperCase());
      assert.strictEqual(real, testDir.toUpperCase());
    }
  });
  test("realcase", async () => {
    if (process.platform === "win32" || process.platform === "darwin") {
      const upper = testDir.toUpperCase();
      const real = await realcase(upper);
      if (real) {
        assert.notStrictEqual(real, upper);
        assert.strictEqual(real.toUpperCase(), upper);
        assert.strictEqual(real, testDir);
      }
    } else {
      let real = await realcase(testDir);
      assert.strictEqual(real, testDir);
      real = await realcase(testDir.toUpperCase());
      assert.strictEqual(real, testDir.toUpperCase());
    }
  });
  test("realpath", async () => {
    const realpathVal = await realpath(testDir);
    assert.ok(realpathVal);
  });
  test("realpathSync", () => {
    const realpath2 = realpathSync(testDir);
    assert.ok(realpath2);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
