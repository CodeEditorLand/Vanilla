import assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { QueryType } from "../../common/search.js";
import { NativeTextSearchManager } from "../../node/textSearchManager.js";
suite("NativeTextSearchManager", () => {
  test("fixes encoding", async () => {
    let correctEncoding = false;
    const provider = {
      provideTextSearchResults(query2, options, progress, token) {
        correctEncoding = options.folderOptions[0].encoding === "windows-1252";
        return null;
      }
    };
    const query = {
      type: QueryType.Text,
      contentPattern: {
        pattern: "a"
      },
      folderQueries: [
        {
          folder: URI.file("/some/folder"),
          fileEncoding: "windows1252"
        }
      ]
    };
    const m = new NativeTextSearchManager(query, provider);
    await m.search(() => {
    }, CancellationToken.None);
    assert.ok(correctEncoding);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
