import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { getWorkspaceIdentifier, getSingleFolderWorkspaceIdentifier } from "../../browser/workspaces.js";
suite("Workspaces", () => {
  test("workspace identifiers are stable", function() {
    assert.strictEqual(getWorkspaceIdentifier(URI.parse("vscode-remote:/hello/test")).id, "474434e4");
    assert.strictEqual(getSingleFolderWorkspaceIdentifier(URI.parse("vscode-remote:/hello/test"))?.id, "474434e4");
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=workspaces.test.js.map
