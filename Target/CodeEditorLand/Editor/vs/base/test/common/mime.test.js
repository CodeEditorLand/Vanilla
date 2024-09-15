import assert from "assert";
import { normalizeMimeType } from "../../common/mime.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Mime", () => {
  test("normalize", () => {
    assert.strictEqual(normalizeMimeType("invalid"), "invalid");
    assert.strictEqual(normalizeMimeType("invalid", true), void 0);
    assert.strictEqual(normalizeMimeType("Text/plain"), "text/plain");
    assert.strictEqual(normalizeMimeType("Text/pl\xE4in"), "text/pl\xE4in");
    assert.strictEqual(normalizeMimeType("Text/plain;UPPER"), "text/plain;UPPER");
    assert.strictEqual(normalizeMimeType("Text/plain;lower"), "text/plain;lower");
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=mime.test.js.map
