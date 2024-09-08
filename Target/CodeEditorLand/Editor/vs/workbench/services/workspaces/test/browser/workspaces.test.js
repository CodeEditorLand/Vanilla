import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  getSingleFolderWorkspaceIdentifier,
  getWorkspaceIdentifier
} from "../../browser/workspaces.js";
suite("Workspaces", () => {
  test("workspace identifiers are stable", () => {
    assert.strictEqual(
      getWorkspaceIdentifier(URI.parse("vscode-remote:/hello/test")).id,
      "474434e4"
    );
    assert.strictEqual(
      getSingleFolderWorkspaceIdentifier(
        URI.parse("vscode-remote:/hello/test")
      )?.id,
      "474434e4"
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
