import assert from "assert";
import { FileAccess } from "../../../../../base/common/network.js";
import * as path from "../../../../../base/common/path.js";
import * as platform from "../../../../../base/common/platform.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { flakySuite } from "../../../../../base/test/node/testUtils.js";
import {
  QueryType
} from "../../common/search.js";
import {
  Engine as FileSearchEngine,
  FileWalker
} from "../../node/fileSearch.js";
const TEST_FIXTURES = path.normalize(
  FileAccess.asFileUri("vs/workbench/services/search/test/node/fixtures").fsPath
);
const EXAMPLES_FIXTURES = URI.file(path.join(TEST_FIXTURES, "examples"));
const MORE_FIXTURES = URI.file(path.join(TEST_FIXTURES, "more"));
const TEST_ROOT_FOLDER = { folder: URI.file(TEST_FIXTURES) };
const ROOT_FOLDER_QUERY = [TEST_ROOT_FOLDER];
const ROOT_FOLDER_QUERY_36438 = [
  {
    folder: URI.file(
      path.normalize(
        FileAccess.asFileUri(
          "vs/workbench/services/search/test/node/fixtures2/36438"
        ).fsPath
      )
    )
  }
];
const MULTIROOT_QUERIES = [
  { folder: EXAMPLES_FIXTURES },
  { folder: MORE_FIXTURES }
];
flakySuite("FileSearchEngine", () => {
  test("Files: *.js", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "*.js"
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 4);
        done();
      }
    );
  });
  test("Files: maxResults", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      maxResults: 1
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        done();
      }
    );
  });
  test("Files: maxResults without Ripgrep", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      maxResults: 1
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        done();
      }
    );
  });
  test("Files: exists", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      includePattern: { "**/file.txt": true },
      exists: true
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error, complete) => {
        assert.ok(!error);
        assert.strictEqual(count, 0);
        assert.ok(complete.limitHit);
        done();
      }
    );
  });
  test("Files: not exists", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      includePattern: { "**/nofile.txt": true },
      exists: true
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error, complete) => {
        assert.ok(!error);
        assert.strictEqual(count, 0);
        assert.ok(!complete.limitHit);
        done();
      }
    );
  });
  test("Files: exists without Ripgrep", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      includePattern: { "**/file.txt": true },
      exists: true
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error, complete) => {
        assert.ok(!error);
        assert.strictEqual(count, 0);
        assert.ok(complete.limitHit);
        done();
      }
    );
  });
  test("Files: not exists without Ripgrep", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      includePattern: { "**/nofile.txt": true },
      exists: true
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error, complete) => {
        assert.ok(!error);
        assert.strictEqual(count, 0);
        assert.ok(!complete.limitHit);
        done();
      }
    );
  });
  test("Files: examples/com*", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: path.join("examples", "com*")
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        done();
      }
    );
  });
  test("Files: examples (fuzzy)", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "xl"
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 7);
        done();
      }
    );
  });
  test("Files: multiroot", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: MULTIROOT_QUERIES,
      filePattern: "file"
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 3);
        done();
      }
    );
  });
  test("Files: multiroot with includePattern and maxResults", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: MULTIROOT_QUERIES,
      maxResults: 1,
      includePattern: {
        "*.txt": true,
        "*.js": true
      }
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error, complete) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        done();
      }
    );
  });
  test("Files: multiroot with includePattern and exists", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: MULTIROOT_QUERIES,
      exists: true,
      includePattern: {
        "*.txt": true,
        "*.js": true
      }
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error, complete) => {
        assert.ok(!error);
        assert.strictEqual(count, 0);
        assert.ok(complete.limitHit);
        done();
      }
    );
  });
  test("Files: NPE (CamelCase)", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "NullPE"
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        done();
      }
    );
  });
  test("Files: *.*", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "*.*"
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 14);
        done();
      }
    );
  });
  test("Files: *.as", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "*.as"
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 0);
        done();
      }
    );
  });
  test("Files: *.* without derived", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "site.*",
      excludePattern: { "**/*.css": { when: "$(basename).less" } }
    });
    let count = 0;
    let res;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
        res = result;
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        assert.strictEqual(
          path.basename(res.relativePath),
          "site.less"
        );
        done();
      }
    );
  });
  test("Files: *.* exclude folder without wildcard", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "*.*",
      excludePattern: { examples: true }
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 8);
        done();
      }
    );
  });
  test("Files: exclude folder without wildcard #36438", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY_36438,
      excludePattern: { modules: true }
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        done();
      }
    );
  });
  test("Files: include folder without wildcard #36438", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY_36438,
      includePattern: { "modules/**": true }
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        done();
      }
    );
  });
  test("Files: *.* exclude folder with leading wildcard", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "*.*",
      excludePattern: { "**/examples": true }
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 8);
        done();
      }
    );
  });
  test("Files: *.* exclude folder with trailing wildcard", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "*.*",
      excludePattern: { "examples/**": true }
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 8);
        done();
      }
    );
  });
  test("Files: *.* exclude with unicode", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "*.*",
      excludePattern: { "**/\xFCm laut\u6C49\u8BED": true }
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 13);
        done();
      }
    );
  });
  test("Files: *.* include with unicode", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "*.*",
      includePattern: { "**/\xFCm laut\u6C49\u8BED/*": true }
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        done();
      }
    );
  });
  test("Files: multiroot with exclude", (done) => {
    const folderQueries = [
      {
        folder: EXAMPLES_FIXTURES,
        excludePattern: [
          {
            pattern: { "**/anotherfile.txt": true }
          }
        ]
      },
      {
        folder: MORE_FIXTURES,
        excludePattern: [
          {
            pattern: {
              "**/file.txt": true
            }
          }
        ]
      }
    ];
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries,
      filePattern: "*"
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 5);
        done();
      }
    );
  });
  test("Files: Unicode and Spaces", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "\u6C49\u8BED"
    });
    let count = 0;
    let res;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
        res = result;
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        assert.strictEqual(path.basename(res.relativePath), "\u6C49\u8BED.txt");
        done();
      }
    );
  });
  test("Files: no results", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: "nofilematch"
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 0);
        done();
      }
    );
  });
  test("Files: relative path matched once", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      filePattern: path.normalize(path.join("examples", "company.js"))
    });
    let count = 0;
    let res;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
        res = result;
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        assert.strictEqual(
          path.basename(res.relativePath),
          "company.js"
        );
        done();
      }
    );
  });
  test("Files: Include pattern, single files", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: ROOT_FOLDER_QUERY,
      includePattern: {
        "site.css": true,
        "examples/company.js": true,
        "examples/subfolder/subfile.txt": true
      }
    });
    const res = [];
    engine.search(
      (result) => {
        res.push(result);
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        const basenames = res.map((r) => path.basename(r.relativePath));
        assert.ok(
          basenames.indexOf("site.css") !== -1,
          `site.css missing in ${JSON.stringify(basenames)}`
        );
        assert.ok(
          basenames.indexOf("company.js") !== -1,
          `company.js missing in ${JSON.stringify(basenames)}`
        );
        assert.ok(
          basenames.indexOf("subfile.txt") !== -1,
          `subfile.txt missing in ${JSON.stringify(basenames)}`
        );
        done();
      }
    );
  });
  test("Files: extraFiles only", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: [],
      extraFileResources: [
        URI.file(
          path.normalize(
            path.join(
              FileAccess.asFileUri(
                "vs/workbench/services/search/test/node/fixtures"
              ).fsPath,
              "site.css"
            )
          )
        ),
        URI.file(
          path.normalize(
            path.join(
              FileAccess.asFileUri(
                "vs/workbench/services/search/test/node/fixtures"
              ).fsPath,
              "examples",
              "company.js"
            )
          )
        ),
        URI.file(
          path.normalize(
            path.join(
              FileAccess.asFileUri(
                "vs/workbench/services/search/test/node/fixtures"
              ).fsPath,
              "index.html"
            )
          )
        )
      ],
      filePattern: "*.js"
    });
    let count = 0;
    let res;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
        res = result;
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        assert.strictEqual(
          path.basename(res.relativePath),
          "company.js"
        );
        done();
      }
    );
  });
  test("Files: extraFiles only (with include)", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: [],
      extraFileResources: [
        URI.file(
          path.normalize(
            path.join(
              FileAccess.asFileUri(
                "vs/workbench/services/search/test/node/fixtures"
              ).fsPath,
              "site.css"
            )
          )
        ),
        URI.file(
          path.normalize(
            path.join(
              FileAccess.asFileUri(
                "vs/workbench/services/search/test/node/fixtures"
              ).fsPath,
              "examples",
              "company.js"
            )
          )
        ),
        URI.file(
          path.normalize(
            path.join(
              FileAccess.asFileUri(
                "vs/workbench/services/search/test/node/fixtures"
              ).fsPath,
              "index.html"
            )
          )
        )
      ],
      filePattern: "*.*",
      includePattern: { "**/*.css": true }
    });
    let count = 0;
    let res;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
        res = result;
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        assert.strictEqual(path.basename(res.relativePath), "site.css");
        done();
      }
    );
  });
  test("Files: extraFiles only (with exclude)", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: [],
      extraFileResources: [
        URI.file(
          path.normalize(
            path.join(
              FileAccess.asFileUri(
                "vs/workbench/services/search/test/node/fixtures"
              ).fsPath,
              "site.css"
            )
          )
        ),
        URI.file(
          path.normalize(
            path.join(
              FileAccess.asFileUri(
                "vs/workbench/services/search/test/node/fixtures"
              ).fsPath,
              "examples",
              "company.js"
            )
          )
        ),
        URI.file(
          path.normalize(
            path.join(
              FileAccess.asFileUri(
                "vs/workbench/services/search/test/node/fixtures"
              ).fsPath,
              "index.html"
            )
          )
        )
      ],
      filePattern: "*.*",
      excludePattern: { "**/*.css": true }
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 2);
        done();
      }
    );
  });
  test("Files: no dupes in nested folders", (done) => {
    const engine = new FileSearchEngine({
      type: QueryType.File,
      folderQueries: [
        { folder: EXAMPLES_FIXTURES },
        { folder: joinPath(EXAMPLES_FIXTURES, "subfolder") }
      ],
      filePattern: "subfile.txt"
    });
    let count = 0;
    engine.search(
      (result) => {
        if (result) {
          count++;
        }
      },
      () => {
      },
      (error) => {
        assert.ok(!error);
        assert.strictEqual(count, 1);
        done();
      }
    );
  });
});
flakySuite("FileWalker", () => {
  (platform.isWindows ? test.skip : test)(
    "Find: exclude subfolder",
    (done) => {
      const file0 = "./more/file.txt";
      const file1 = "./examples/subfolder/subfile.txt";
      const walker = new FileWalker({
        type: QueryType.File,
        folderQueries: ROOT_FOLDER_QUERY,
        excludePattern: { "**/something": true }
      });
      const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
      walker.readStdout(cmd1, "utf8", (err1, stdout1) => {
        assert.strictEqual(err1, null);
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file0),
          -1,
          stdout1
        );
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file1),
          -1,
          stdout1
        );
        const walker2 = new FileWalker({
          type: QueryType.File,
          folderQueries: ROOT_FOLDER_QUERY,
          excludePattern: { "**/subfolder": true }
        });
        const cmd2 = walker2.spawnFindCmd(TEST_ROOT_FOLDER);
        walker2.readStdout(cmd2, "utf8", (err2, stdout2) => {
          assert.strictEqual(err2, null);
          assert.notStrictEqual(
            stdout1.split("\n").indexOf(file0),
            -1,
            stdout1
          );
          assert.strictEqual(
            stdout2.split("\n").indexOf(file1),
            -1,
            stdout2
          );
          done();
        });
      });
    }
  );
  (platform.isWindows ? test.skip : test)(
    "Find: folder excludes",
    (done) => {
      const folderQueries = [
        {
          folder: URI.file(TEST_FIXTURES),
          excludePattern: [
            {
              pattern: { "**/subfolder": true }
            }
          ]
        }
      ];
      const file0 = "./more/file.txt";
      const file1 = "./examples/subfolder/subfile.txt";
      const walker = new FileWalker({
        type: QueryType.File,
        folderQueries
      });
      const cmd1 = walker.spawnFindCmd(folderQueries[0]);
      walker.readStdout(cmd1, "utf8", (err1, stdout1) => {
        assert.strictEqual(err1, null);
        assert(outputContains(stdout1, file0), stdout1);
        assert(!outputContains(stdout1, file1), stdout1);
        done();
      });
    }
  );
  (platform.isWindows ? test.skip : test)(
    "Find: exclude multiple folders",
    (done) => {
      const file0 = "./index.html";
      const file1 = "./examples/small.js";
      const file2 = "./more/file.txt";
      const walker = new FileWalker({
        type: QueryType.File,
        folderQueries: ROOT_FOLDER_QUERY,
        excludePattern: { "**/something": true }
      });
      const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
      walker.readStdout(cmd1, "utf8", (err1, stdout1) => {
        assert.strictEqual(err1, null);
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file0),
          -1,
          stdout1
        );
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file1),
          -1,
          stdout1
        );
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file2),
          -1,
          stdout1
        );
        const walker2 = new FileWalker({
          type: QueryType.File,
          folderQueries: ROOT_FOLDER_QUERY,
          excludePattern: { "{**/examples,**/more}": true }
        });
        const cmd2 = walker2.spawnFindCmd(TEST_ROOT_FOLDER);
        walker2.readStdout(cmd2, "utf8", (err2, stdout2) => {
          assert.strictEqual(err2, null);
          assert.notStrictEqual(
            stdout1.split("\n").indexOf(file0),
            -1,
            stdout1
          );
          assert.strictEqual(
            stdout2.split("\n").indexOf(file1),
            -1,
            stdout2
          );
          assert.strictEqual(
            stdout2.split("\n").indexOf(file2),
            -1,
            stdout2
          );
          done();
        });
      });
    }
  );
  (platform.isWindows ? test.skip : test)(
    "Find: exclude folder path suffix",
    (done) => {
      const file0 = "./examples/company.js";
      const file1 = "./examples/subfolder/subfile.txt";
      const walker = new FileWalker({
        type: QueryType.File,
        folderQueries: ROOT_FOLDER_QUERY,
        excludePattern: { "**/examples/something": true }
      });
      const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
      walker.readStdout(cmd1, "utf8", (err1, stdout1) => {
        assert.strictEqual(err1, null);
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file0),
          -1,
          stdout1
        );
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file1),
          -1,
          stdout1
        );
        const walker2 = new FileWalker({
          type: QueryType.File,
          folderQueries: ROOT_FOLDER_QUERY,
          excludePattern: { "**/examples/subfolder": true }
        });
        const cmd2 = walker2.spawnFindCmd(TEST_ROOT_FOLDER);
        walker2.readStdout(cmd2, "utf8", (err2, stdout2) => {
          assert.strictEqual(err2, null);
          assert.notStrictEqual(
            stdout1.split("\n").indexOf(file0),
            -1,
            stdout1
          );
          assert.strictEqual(
            stdout2.split("\n").indexOf(file1),
            -1,
            stdout2
          );
          done();
        });
      });
    }
  );
  (platform.isWindows ? test.skip : test)(
    "Find: exclude subfolder path suffix",
    (done) => {
      const file0 = "./examples/subfolder/subfile.txt";
      const file1 = "./examples/subfolder/anotherfolder/anotherfile.txt";
      const walker = new FileWalker({
        type: QueryType.File,
        folderQueries: ROOT_FOLDER_QUERY,
        excludePattern: { "**/subfolder/something": true }
      });
      const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
      walker.readStdout(cmd1, "utf8", (err1, stdout1) => {
        assert.strictEqual(err1, null);
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file0),
          -1,
          stdout1
        );
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file1),
          -1,
          stdout1
        );
        const walker2 = new FileWalker({
          type: QueryType.File,
          folderQueries: ROOT_FOLDER_QUERY,
          excludePattern: { "**/subfolder/anotherfolder": true }
        });
        const cmd2 = walker2.spawnFindCmd(TEST_ROOT_FOLDER);
        walker2.readStdout(cmd2, "utf8", (err2, stdout2) => {
          assert.strictEqual(err2, null);
          assert.notStrictEqual(
            stdout1.split("\n").indexOf(file0),
            -1,
            stdout1
          );
          assert.strictEqual(
            stdout2.split("\n").indexOf(file1),
            -1,
            stdout2
          );
          done();
        });
      });
    }
  );
  (platform.isWindows ? test.skip : test)(
    "Find: exclude folder path",
    (done) => {
      const file0 = "./examples/company.js";
      const file1 = "./examples/subfolder/subfile.txt";
      const walker = new FileWalker({
        type: QueryType.File,
        folderQueries: ROOT_FOLDER_QUERY,
        excludePattern: { "examples/something": true }
      });
      const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
      walker.readStdout(cmd1, "utf8", (err1, stdout1) => {
        assert.strictEqual(err1, null);
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file0),
          -1,
          stdout1
        );
        assert.notStrictEqual(
          stdout1.split("\n").indexOf(file1),
          -1,
          stdout1
        );
        const walker2 = new FileWalker({
          type: QueryType.File,
          folderQueries: ROOT_FOLDER_QUERY,
          excludePattern: { "examples/subfolder": true }
        });
        const cmd2 = walker2.spawnFindCmd(TEST_ROOT_FOLDER);
        walker2.readStdout(cmd2, "utf8", (err2, stdout2) => {
          assert.strictEqual(err2, null);
          assert.notStrictEqual(
            stdout1.split("\n").indexOf(file0),
            -1,
            stdout1
          );
          assert.strictEqual(
            stdout2.split("\n").indexOf(file1),
            -1,
            stdout2
          );
          done();
        });
      });
    }
  );
  (platform.isWindows ? test.skip : test)(
    "Find: exclude combination of paths",
    (done) => {
      const filesIn = [
        "./examples/subfolder/subfile.txt",
        "./examples/company.js",
        "./index.html"
      ];
      const filesOut = [
        "./examples/subfolder/anotherfolder/anotherfile.txt",
        "./more/file.txt"
      ];
      const walker = new FileWalker({
        type: QueryType.File,
        folderQueries: ROOT_FOLDER_QUERY,
        excludePattern: {
          "**/subfolder/anotherfolder": true,
          "**/something/else": true,
          "**/more": true,
          "**/andmore": true
        }
      });
      const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
      walker.readStdout(cmd1, "utf8", (err1, stdout1) => {
        assert.strictEqual(err1, null);
        for (const fileIn of filesIn) {
          assert.notStrictEqual(
            stdout1.split("\n").indexOf(fileIn),
            -1,
            stdout1
          );
        }
        for (const fileOut of filesOut) {
          assert.strictEqual(
            stdout1.split("\n").indexOf(fileOut),
            -1,
            stdout1
          );
        }
        done();
      });
    }
  );
  function outputContains(stdout, ...files) {
    const lines = stdout.split("\n");
    return files.every((file) => lines.indexOf(file) >= 0);
  }
});
