import assert from "assert";
import { isWindows } from "../../../../base/common/platform.js";
import { originalFSPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
suite("ExtHost API", () => {
  test("issue #51387: originalFSPath", () => {
    if (isWindows) {
      assert.strictEqual(
        originalFSPath(URI.file("C:\\test")).charAt(0),
        "C"
      );
      assert.strictEqual(
        originalFSPath(URI.file("c:\\test")).charAt(0),
        "c"
      );
      assert.strictEqual(
        originalFSPath(
          URI.revive(
            JSON.parse(JSON.stringify(URI.file("C:\\test")))
          )
        ).charAt(0),
        "C"
      );
      assert.strictEqual(
        originalFSPath(
          URI.revive(
            JSON.parse(JSON.stringify(URI.file("c:\\test")))
          )
        ).charAt(0),
        "c"
      );
    }
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
