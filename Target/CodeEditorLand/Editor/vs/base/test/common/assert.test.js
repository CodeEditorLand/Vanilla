import assert from "assert";
import { ok } from "../../common/assert.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Assert", () => {
  test("ok", () => {
    assert.throws(() => {
      ok(false);
    });
    assert.throws(() => {
      ok(null);
    });
    assert.throws(() => {
      ok();
    });
    assert.throws(
      () => {
        ok(null, "Foo Bar");
      },
      (e) => e.message.indexOf("Foo Bar") >= 0
    );
    ok(true);
    ok("foo");
    ok({});
    ok(5);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
