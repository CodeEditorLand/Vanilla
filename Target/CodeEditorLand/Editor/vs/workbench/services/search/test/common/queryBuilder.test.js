import assert from "assert";
import { isWindows } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { testWorkspace } from "../../../../../platform/workspace/test/common/testWorkspace.js";
import { TestContextService } from "../../../../test/common/workbenchTestServices.js";
import { resolveResourcesForSearchIncludes } from "../../common/queryBuilder.js";
suite("QueryBuilderCommon", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  let context;
  setup(() => {
    const workspace = testWorkspace(
      URI.file(isWindows ? "C:\\testWorkspace" : "/testWorkspace")
    );
    context = new TestContextService(workspace);
  });
  test("resolveResourcesForSearchIncludes passes through paths without special glob characters", () => {
    const actual = resolveResourcesForSearchIncludes(
      [
        URI.file(
          isWindows ? "C:\\testWorkspace\\pages\\blog" : "/testWorkspace/pages/blog"
        )
      ],
      context
    );
    assert.deepStrictEqual(actual, ["./pages/blog"]);
  });
  test("resolveResourcesForSearchIncludes escapes paths with special characters", () => {
    const actual = resolveResourcesForSearchIncludes(
      [
        URI.file(
          isWindows ? "C:\\testWorkspace\\pages\\blog\\[postId]" : "/testWorkspace/pages/blog/[postId]"
        )
      ],
      context
    );
    assert.deepStrictEqual(actual, ["./pages/blog/[[]postId[]]"]);
  });
});
