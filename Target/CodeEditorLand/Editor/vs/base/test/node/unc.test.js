import { strictEqual } from "assert";
import { getUNCHost } from "../../node/unc.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
suite("UNC", () => {
  test("getUNCHost", () => {
    strictEqual(getUNCHost(void 0), void 0);
    strictEqual(getUNCHost(null), void 0);
    strictEqual(getUNCHost("/"), void 0);
    strictEqual(getUNCHost("/foo"), void 0);
    strictEqual(getUNCHost("c:"), void 0);
    strictEqual(getUNCHost("c:\\"), void 0);
    strictEqual(getUNCHost("c:\\foo"), void 0);
    strictEqual(getUNCHost("c:\\foo\\\\server\\path"), void 0);
    strictEqual(getUNCHost("\\"), void 0);
    strictEqual(getUNCHost("\\\\"), void 0);
    strictEqual(getUNCHost("\\\\localhost"), void 0);
    strictEqual(getUNCHost("\\\\localhost\\"), "localhost");
    strictEqual(getUNCHost("\\\\localhost\\a"), "localhost");
    strictEqual(getUNCHost("\\\\."), void 0);
    strictEqual(getUNCHost("\\\\?"), void 0);
    strictEqual(getUNCHost("\\\\.\\localhost"), ".");
    strictEqual(getUNCHost("\\\\?\\localhost"), "?");
    strictEqual(getUNCHost("\\\\.\\UNC\\localhost"), ".");
    strictEqual(getUNCHost("\\\\?\\UNC\\localhost"), "?");
    strictEqual(getUNCHost("\\\\.\\UNC\\localhost\\"), "localhost");
    strictEqual(getUNCHost("\\\\?\\UNC\\localhost\\"), "localhost");
    strictEqual(getUNCHost("\\\\.\\UNC\\localhost\\a"), "localhost");
    strictEqual(getUNCHost("\\\\?\\UNC\\localhost\\a"), "localhost");
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=unc.test.js.map
