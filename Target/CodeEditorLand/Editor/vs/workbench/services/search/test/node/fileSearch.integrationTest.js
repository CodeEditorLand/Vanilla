import assert from "assert";
import { FileAccess } from "../../../../../base/common/network.js";
import * as path from "../../../../../base/common/path.js";
import { URI } from "../../../../../base/common/uri.js";
import { flakySuite } from "../../../../../base/test/node/testUtils.js";
import {
  QueryType,
  isProgressMessage
} from "../../common/search.js";
import { SearchService } from "../../node/rawSearchService.js";
const TEST_FIXTURES = path.normalize(
  FileAccess.asFileUri("vs/workbench/services/search/test/node/fixtures").fsPath
);
const TEST_FIXTURES2 = path.normalize(
  FileAccess.asFileUri("vs/workbench/services/search/test/node/fixtures2").fsPath
);
const EXAMPLES_FIXTURES = path.join(TEST_FIXTURES, "examples");
const MORE_FIXTURES = path.join(TEST_FIXTURES, "more");
const TEST_ROOT_FOLDER = { folder: URI.file(TEST_FIXTURES) };
const ROOT_FOLDER_QUERY = [TEST_ROOT_FOLDER];
const MULTIROOT_QUERIES = [
  { folder: URI.file(EXAMPLES_FIXTURES), folderName: "examples_folder" },
  { folder: URI.file(MORE_FIXTURES) }
];
const numThreads = void 0;
async function doSearchTest(query, expectedResultCount) {
  const svc = new SearchService();
  const results = [];
  await svc.doFileSearch(query, numThreads, (e) => {
    if (!isProgressMessage(e)) {
      if (Array.isArray(e)) {
        results.push(...e);
      } else {
        results.push(e);
      }
    }
  });
  assert.strictEqual(
    results.length,
    expectedResultCount,
    `rg ${results.length} !== ${expectedResultCount}`
  );
}
flakySuite("FileSearch-integration", () => {
  test("File - simple", () => {
    const config = {
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY
    };
    return doSearchTest(config, 14);
  });
  test("File - filepattern", () => {
    const config = {
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "anotherfile"
    };
    return doSearchTest(config, 1);
  });
  test("File - exclude", () => {
    const config = {
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "file",
      excludePattern: { "**/anotherfolder/**": true }
    };
    return doSearchTest(config, 2);
  });
  test("File - multiroot", () => {
    const config = {
      type: QueryType.File,
      folderQueries: MULTIROOT_QUERIES,
      filePattern: "file",
      excludePattern: { "**/anotherfolder/**": true }
    };
    return doSearchTest(config, 2);
  });
  test("File - multiroot with folder name", () => {
    const config = {
      type: QueryType.File,
      folderQueries: MULTIROOT_QUERIES,
      filePattern: "examples_folder anotherfile"
    };
    return doSearchTest(config, 1);
  });
  test("File - multiroot with folder name and sibling exclude", () => {
    const config = {
      type: QueryType.File,
      folderQueries: [
        { folder: URI.file(TEST_FIXTURES), folderName: "folder1" },
        { folder: URI.file(TEST_FIXTURES2) }
      ],
      filePattern: "folder1 site",
      excludePattern: { "*.css": { when: "$(basename).less" } }
    };
    return doSearchTest(config, 1);
  });
});
