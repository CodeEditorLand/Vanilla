import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  TestUriType,
  buildTestUri,
  parseTestUri
} from "../../common/testingUri.js";
suite("Workbench - Testing URIs", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("round trip", () => {
    const uris = [
      {
        type: TestUriType.ResultActualOutput,
        taskIndex: 1,
        messageIndex: 42,
        resultId: "r",
        testExtId: "t"
      },
      {
        type: TestUriType.ResultExpectedOutput,
        taskIndex: 1,
        messageIndex: 42,
        resultId: "r",
        testExtId: "t"
      },
      {
        type: TestUriType.ResultMessage,
        taskIndex: 1,
        messageIndex: 42,
        resultId: "r",
        testExtId: "t"
      }
    ];
    for (const uri of uris) {
      const serialized = buildTestUri(uri);
      assert.deepStrictEqual(uri, parseTestUri(serialized));
    }
  });
});
