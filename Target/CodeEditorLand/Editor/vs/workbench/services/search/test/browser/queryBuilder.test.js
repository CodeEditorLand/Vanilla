var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { IExpression } from "../../../../../base/common/glob.js";
import { join } from "../../../../../base/common/path.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { URI, URI as uri } from "../../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IWorkspaceContextService, toWorkspaceFolder } from "../../../../../platform/workspace/common/workspace.js";
import { toWorkspaceFolders } from "../../../../../platform/workspaces/common/workspaces.js";
import { ISearchPathsInfo, QueryBuilder } from "../../common/queryBuilder.js";
import { IPathService } from "../../../path/common/pathService.js";
import { IFileQuery, IFolderQuery, IPatternInfo, ITextQuery, QueryType } from "../../common/search.js";
import { TestPathService, TestEnvironmentService } from "../../../../test/browser/workbenchTestServices.js";
import { TestContextService } from "../../../../test/common/workbenchTestServices.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { Workspace } from "../../../../../platform/workspace/test/common/testWorkspace.js";
import { extUriBiasedIgnorePathCase } from "../../../../../base/common/resources.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
const DEFAULT_EDITOR_CONFIG = {};
const DEFAULT_USER_CONFIG = { useRipgrep: true, useIgnoreFiles: true, useGlobalIgnoreFiles: true, useParentIgnoreFiles: true };
const DEFAULT_QUERY_PROPS = {};
const DEFAULT_TEXT_QUERY_PROPS = { usePCRE2: false };
suite("QueryBuilder", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const PATTERN_INFO = { pattern: "a" };
  const ROOT_1 = fixPath("/foo/root1");
  const ROOT_1_URI = getUri(ROOT_1);
  const ROOT_1_NAMED_FOLDER = toWorkspaceFolder(ROOT_1_URI);
  const WS_CONFIG_PATH = getUri("/bar/test.code-workspace");
  let instantiationService;
  let queryBuilder;
  let mockConfigService;
  let mockContextService;
  let mockWorkspace;
  setup(() => {
    instantiationService = new TestInstantiationService();
    mockConfigService = new TestConfigurationService();
    mockConfigService.setUserConfiguration("search", DEFAULT_USER_CONFIG);
    mockConfigService.setUserConfiguration("editor", DEFAULT_EDITOR_CONFIG);
    instantiationService.stub(IConfigurationService, mockConfigService);
    mockContextService = new TestContextService();
    mockWorkspace = new Workspace("workspace", [toWorkspaceFolder(ROOT_1_URI)]);
    mockContextService.setWorkspace(mockWorkspace);
    instantiationService.stub(IWorkspaceContextService, mockContextService);
    instantiationService.stub(IEnvironmentService, TestEnvironmentService);
    instantiationService.stub(IPathService, new TestPathService());
    queryBuilder = instantiationService.createInstance(QueryBuilder);
  });
  teardown(() => {
    instantiationService.dispose();
  });
  test("simple text pattern", () => {
    assertEqualTextQueries(
      queryBuilder.text(PATTERN_INFO),
      {
        folderQueries: [],
        contentPattern: PATTERN_INFO,
        type: QueryType.Text
      }
    );
  });
  test("normalize literal newlines", () => {
    assertEqualTextQueries(
      queryBuilder.text({ pattern: "foo\nbar", isRegExp: true }),
      {
        folderQueries: [],
        contentPattern: {
          pattern: "foo\\nbar",
          isRegExp: true,
          isMultiline: true
        },
        type: QueryType.Text
      }
    );
    assertEqualTextQueries(
      queryBuilder.text({ pattern: "foo\nbar", isRegExp: false }),
      {
        folderQueries: [],
        contentPattern: {
          pattern: "foo\nbar",
          isRegExp: false,
          isMultiline: true
        },
        type: QueryType.Text
      }
    );
  });
  test("splits include pattern when expandPatterns enabled", () => {
    assertEqualQueries(
      queryBuilder.file(
        [ROOT_1_NAMED_FOLDER],
        { includePattern: "**/foo, **/bar", expandPatterns: true }
      ),
      {
        folderQueries: [{
          folder: ROOT_1_URI
        }],
        type: QueryType.File,
        includePattern: {
          "**/foo": true,
          "**/foo/**": true,
          "**/bar": true,
          "**/bar/**": true
        }
      }
    );
  });
  test("does not split include pattern when expandPatterns disabled", () => {
    assertEqualQueries(
      queryBuilder.file(
        [ROOT_1_NAMED_FOLDER],
        { includePattern: "**/foo, **/bar" }
      ),
      {
        folderQueries: [{
          folder: ROOT_1_URI
        }],
        type: QueryType.File,
        includePattern: {
          "**/foo, **/bar": true
        }
      }
    );
  });
  test("includePattern array", () => {
    assertEqualQueries(
      queryBuilder.file(
        [ROOT_1_NAMED_FOLDER],
        { includePattern: ["**/foo", "**/bar"] }
      ),
      {
        folderQueries: [{
          folder: ROOT_1_URI
        }],
        type: QueryType.File,
        includePattern: {
          "**/foo": true,
          "**/bar": true
        }
      }
    );
  });
  test("includePattern array with expandPatterns", () => {
    assertEqualQueries(
      queryBuilder.file(
        [ROOT_1_NAMED_FOLDER],
        { includePattern: ["**/foo", "**/bar"], expandPatterns: true }
      ),
      {
        folderQueries: [{
          folder: ROOT_1_URI
        }],
        type: QueryType.File,
        includePattern: {
          "**/foo": true,
          "**/foo/**": true,
          "**/bar": true,
          "**/bar/**": true
        }
      }
    );
  });
  test("folderResources", () => {
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI]
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{ folder: ROOT_1_URI }],
        type: QueryType.Text
      }
    );
  });
  test("simple exclude setting", () => {
    mockConfigService.setUserConfiguration("search", {
      ...DEFAULT_USER_CONFIG,
      exclude: {
        "bar/**": true,
        "foo/**": {
          "when": "$(basename).ts"
        }
      }
    });
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          expandPatterns: true
          // verify that this doesn't affect patterns from configuration
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI,
          excludePattern: [{
            pattern: {
              "bar/**": true,
              "foo/**": {
                "when": "$(basename).ts"
              }
            }
          }]
        }],
        type: QueryType.Text
      }
    );
  });
  test("simple include", () => {
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          includePattern: "bar",
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI
        }],
        includePattern: {
          "**/bar": true,
          "**/bar/**": true
        },
        type: QueryType.Text
      }
    );
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          includePattern: "bar"
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI
        }],
        includePattern: {
          "bar": true
        },
        type: QueryType.Text
      }
    );
  });
  test("simple include with ./ syntax", () => {
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          includePattern: "./bar",
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI,
          includePattern: {
            "bar": true,
            "bar/**": true
          }
        }],
        type: QueryType.Text
      }
    );
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          includePattern: ".\\bar",
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI,
          includePattern: {
            "bar": true,
            "bar/**": true
          }
        }],
        type: QueryType.Text
      }
    );
  });
  test("exclude setting and searchPath", () => {
    mockConfigService.setUserConfiguration("search", {
      ...DEFAULT_USER_CONFIG,
      exclude: {
        "foo/**/*.js": true,
        "bar/**": {
          "when": "$(basename).ts"
        }
      }
    });
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          includePattern: "./foo",
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI,
          includePattern: {
            "foo": true,
            "foo/**": true
          },
          excludePattern: [{
            pattern: {
              "foo/**/*.js": true,
              "bar/**": {
                "when": "$(basename).ts"
              }
            }
          }]
        }],
        type: QueryType.Text
      }
    );
  });
  test("multiroot exclude settings", () => {
    const ROOT_2 = fixPath("/project/root2");
    const ROOT_2_URI = getUri(ROOT_2);
    const ROOT_3 = fixPath("/project/root3");
    const ROOT_3_URI = getUri(ROOT_3);
    mockWorkspace.folders = toWorkspaceFolders([{ path: ROOT_1_URI.fsPath }, { path: ROOT_2_URI.fsPath }, { path: ROOT_3_URI.fsPath }], WS_CONFIG_PATH, extUriBiasedIgnorePathCase);
    mockWorkspace.configuration = uri.file(fixPath("/config"));
    mockConfigService.setUserConfiguration("search", {
      ...DEFAULT_USER_CONFIG,
      exclude: { "foo/**/*.js": true }
    }, ROOT_1_URI);
    mockConfigService.setUserConfiguration("search", {
      ...DEFAULT_USER_CONFIG,
      exclude: { "bar": true }
    }, ROOT_2_URI);
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI, ROOT_2_URI, ROOT_3_URI]
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [
          { folder: ROOT_1_URI, excludePattern: makeExcludePatternFromPatterns("foo/**/*.js") },
          { folder: ROOT_2_URI, excludePattern: makeExcludePatternFromPatterns("bar") },
          { folder: ROOT_3_URI }
        ],
        type: QueryType.Text
      }
    );
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI, ROOT_2_URI, ROOT_3_URI],
        {
          includePattern: "./root2/src",
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [
          {
            folder: ROOT_2_URI,
            includePattern: {
              "src": true,
              "src/**": true
            },
            excludePattern: [{
              pattern: { "bar": true }
            }]
          }
        ],
        type: QueryType.Text
      }
    );
  });
  test("simple exclude input pattern", () => {
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          excludePattern: [{ pattern: "foo" }],
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI
        }],
        type: QueryType.Text,
        excludePattern: patternsToIExpression(...globalGlob("foo"))
      }
    );
  });
  test("file pattern trimming", () => {
    const content = "content";
    assertEqualQueries(
      queryBuilder.file(
        [],
        { filePattern: ` ${content} ` }
      ),
      {
        folderQueries: [],
        filePattern: content,
        type: QueryType.File
      }
    );
  });
  test("exclude ./ syntax", () => {
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          excludePattern: [{ pattern: "./bar" }],
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI,
          excludePattern: makeExcludePatternFromPatterns("bar", "bar/**")
        }],
        type: QueryType.Text
      }
    );
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          excludePattern: [{ pattern: "./bar/**/*.ts" }],
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI,
          excludePattern: makeExcludePatternFromPatterns("bar/**/*.ts", "bar/**/*.ts/**")
        }],
        type: QueryType.Text
      }
    );
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          excludePattern: [{ pattern: ".\\bar\\**\\*.ts" }],
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI,
          excludePattern: makeExcludePatternFromPatterns("bar/**/*.ts", "bar/**/*.ts/**")
        }],
        type: QueryType.Text
      }
    );
  });
  test("extraFileResources", () => {
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        { extraFileResources: [getUri("/foo/bar.js")] }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI
        }],
        extraFileResources: [getUri("/foo/bar.js")],
        type: QueryType.Text
      }
    );
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          extraFileResources: [getUri("/foo/bar.js")],
          excludePattern: [{ pattern: "*.js" }],
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI
        }],
        excludePattern: patternsToIExpression(...globalGlob("*.js")),
        type: QueryType.Text
      }
    );
    assertEqualTextQueries(
      queryBuilder.text(
        PATTERN_INFO,
        [ROOT_1_URI],
        {
          extraFileResources: [getUri("/foo/bar.js")],
          includePattern: "*.txt",
          expandPatterns: true
        }
      ),
      {
        contentPattern: PATTERN_INFO,
        folderQueries: [{
          folder: ROOT_1_URI
        }],
        includePattern: patternsToIExpression(...globalGlob("*.txt")),
        type: QueryType.Text
      }
    );
  });
  suite("parseSearchPaths 1", () => {
    test("simple includes", () => {
      function testSimpleIncludes(includePattern, expectedPatterns) {
        const result = queryBuilder.parseSearchPaths(includePattern);
        assert.deepStrictEqual(
          { ...result.pattern },
          patternsToIExpression(...expectedPatterns),
          includePattern
        );
        assert.strictEqual(result.searchPaths, void 0);
      }
      __name(testSimpleIncludes, "testSimpleIncludes");
      [
        ["a", ["**/a/**", "**/a"]],
        ["a/b", ["**/a/b", "**/a/b/**"]],
        ["a/b,  c", ["**/a/b", "**/c", "**/a/b/**", "**/c/**"]],
        ["a,.txt", ["**/a", "**/a/**", "**/*.txt", "**/*.txt/**"]],
        ["a,,,b", ["**/a", "**/a/**", "**/b", "**/b/**"]],
        ["**/a,b/**", ["**/a", "**/a/**", "**/b/**"]]
      ].forEach(([includePattern, expectedPatterns]) => testSimpleIncludes(includePattern, expectedPatterns));
    });
    function testIncludes(includePattern, expectedResult) {
      let actual;
      try {
        actual = queryBuilder.parseSearchPaths(includePattern);
      } catch (_) {
        actual = { searchPaths: [] };
      }
      assertEqualSearchPathResults(
        actual,
        expectedResult,
        includePattern
      );
    }
    __name(testIncludes, "testIncludes");
    function testIncludesDataItem([includePattern, expectedResult]) {
      testIncludes(includePattern, expectedResult);
    }
    __name(testIncludesDataItem, "testIncludesDataItem");
    test("absolute includes", () => {
      const cases = [
        [
          fixPath("/foo/bar"),
          {
            searchPaths: [{ searchPath: getUri("/foo/bar") }]
          }
        ],
        [
          fixPath("/foo/bar") + ",a",
          {
            searchPaths: [{ searchPath: getUri("/foo/bar") }],
            pattern: patternsToIExpression(...globalGlob("a"))
          }
        ],
        [
          fixPath("/foo/bar") + "," + fixPath("/1/2"),
          {
            searchPaths: [{ searchPath: getUri("/foo/bar") }, { searchPath: getUri("/1/2") }]
          }
        ],
        [
          fixPath("/foo/bar") + "," + fixPath("/foo/../foo/bar/fooar/.."),
          {
            searchPaths: [{
              searchPath: getUri("/foo/bar")
            }]
          }
        ],
        [
          fixPath("/foo/bar/**/*.ts"),
          {
            searchPaths: [{
              searchPath: getUri("/foo/bar"),
              pattern: patternsToIExpression("**/*.ts", "**/*.ts/**")
            }]
          }
        ],
        [
          fixPath("/foo/bar/*a/b/c"),
          {
            searchPaths: [{
              searchPath: getUri("/foo/bar"),
              pattern: patternsToIExpression("*a/b/c", "*a/b/c/**")
            }]
          }
        ],
        [
          fixPath("/*a/b/c"),
          {
            searchPaths: [{
              searchPath: getUri("/"),
              pattern: patternsToIExpression("*a/b/c", "*a/b/c/**")
            }]
          }
        ],
        [
          fixPath("/foo/{b,c}ar"),
          {
            searchPaths: [{
              searchPath: getUri("/foo"),
              pattern: patternsToIExpression("{b,c}ar", "{b,c}ar/**")
            }]
          }
        ]
      ];
      cases.forEach(testIncludesDataItem);
    });
    test("relative includes w/single root folder", () => {
      const cases = [
        [
          "./a",
          {
            searchPaths: [{
              searchPath: ROOT_1_URI,
              pattern: patternsToIExpression("a", "a/**")
            }]
          }
        ],
        [
          "./a/",
          {
            searchPaths: [{
              searchPath: ROOT_1_URI,
              pattern: patternsToIExpression("a", "a/**")
            }]
          }
        ],
        [
          "./a/*b/c",
          {
            searchPaths: [{
              searchPath: ROOT_1_URI,
              pattern: patternsToIExpression("a/*b/c", "a/*b/c/**")
            }]
          }
        ],
        [
          "./a/*b/c, " + fixPath("/project/foo"),
          {
            searchPaths: [
              {
                searchPath: ROOT_1_URI,
                pattern: patternsToIExpression("a/*b/c", "a/*b/c/**")
              },
              {
                searchPath: getUri("/project/foo")
              }
            ]
          }
        ],
        [
          "./a/b/,./c/d",
          {
            searchPaths: [{
              searchPath: ROOT_1_URI,
              pattern: patternsToIExpression("a/b", "a/b/**", "c/d", "c/d/**")
            }]
          }
        ],
        [
          "../",
          {
            searchPaths: [{
              searchPath: getUri("/foo")
            }]
          }
        ],
        [
          "..",
          {
            searchPaths: [{
              searchPath: getUri("/foo")
            }]
          }
        ],
        [
          "..\\bar",
          {
            searchPaths: [{
              searchPath: getUri("/foo/bar")
            }]
          }
        ]
      ];
      cases.forEach(testIncludesDataItem);
    });
    test("relative includes w/two root folders", () => {
      const ROOT_2 = "/project/root2";
      mockWorkspace.folders = toWorkspaceFolders([{ path: ROOT_1_URI.fsPath }, { path: getUri(ROOT_2).fsPath }], WS_CONFIG_PATH, extUriBiasedIgnorePathCase);
      mockWorkspace.configuration = uri.file(fixPath("config"));
      const cases = [
        [
          "./root1",
          {
            searchPaths: [{
              searchPath: getUri(ROOT_1)
            }]
          }
        ],
        [
          "./root2",
          {
            searchPaths: [{
              searchPath: getUri(ROOT_2)
            }]
          }
        ],
        [
          "./root1/a/**/b, ./root2/**/*.txt",
          {
            searchPaths: [
              {
                searchPath: ROOT_1_URI,
                pattern: patternsToIExpression("a/**/b", "a/**/b/**")
              },
              {
                searchPath: getUri(ROOT_2),
                pattern: patternsToIExpression("**/*.txt", "**/*.txt/**")
              }
            ]
          }
        ]
      ];
      cases.forEach(testIncludesDataItem);
    });
    test("include ./foldername", () => {
      const ROOT_2 = "/project/root2";
      const ROOT_1_FOLDERNAME = "foldername";
      mockWorkspace.folders = toWorkspaceFolders([{ path: ROOT_1_URI.fsPath, name: ROOT_1_FOLDERNAME }, { path: getUri(ROOT_2).fsPath }], WS_CONFIG_PATH, extUriBiasedIgnorePathCase);
      mockWorkspace.configuration = uri.file(fixPath("config"));
      const cases = [
        [
          "./foldername",
          {
            searchPaths: [{
              searchPath: ROOT_1_URI
            }]
          }
        ],
        [
          "./foldername/foo",
          {
            searchPaths: [{
              searchPath: ROOT_1_URI,
              pattern: patternsToIExpression("foo", "foo/**")
            }]
          }
        ]
      ];
      cases.forEach(testIncludesDataItem);
    });
    test("folder with slash in the name", () => {
      const ROOT_2 = "/project/root2";
      const ROOT_2_URI = getUri(ROOT_2);
      const ROOT_1_FOLDERNAME = "folder/one";
      const ROOT_2_FOLDERNAME = "folder/two+";
      mockWorkspace.folders = toWorkspaceFolders([{ path: ROOT_1_URI.fsPath, name: ROOT_1_FOLDERNAME }, { path: ROOT_2_URI.fsPath, name: ROOT_2_FOLDERNAME }], WS_CONFIG_PATH, extUriBiasedIgnorePathCase);
      mockWorkspace.configuration = uri.file(fixPath("config"));
      const cases = [
        [
          "./folder/one",
          {
            searchPaths: [{
              searchPath: ROOT_1_URI
            }]
          }
        ],
        [
          "./folder/two+/foo/",
          {
            searchPaths: [{
              searchPath: ROOT_2_URI,
              pattern: patternsToIExpression("foo", "foo/**")
            }]
          }
        ],
        [
          "./folder/onesomethingelse",
          { searchPaths: [] }
        ],
        [
          "./folder/onesomethingelse/foo",
          { searchPaths: [] }
        ],
        [
          "./folder",
          { searchPaths: [] }
        ]
      ];
      cases.forEach(testIncludesDataItem);
    });
    test("relative includes w/multiple ambiguous root folders", () => {
      const ROOT_2 = "/project/rootB";
      const ROOT_3 = "/otherproject/rootB";
      mockWorkspace.folders = toWorkspaceFolders([{ path: ROOT_1_URI.fsPath }, { path: getUri(ROOT_2).fsPath }, { path: getUri(ROOT_3).fsPath }], WS_CONFIG_PATH, extUriBiasedIgnorePathCase);
      mockWorkspace.configuration = uri.file(fixPath("/config"));
      const cases = [
        [
          "",
          {
            searchPaths: void 0
          }
        ],
        [
          "./",
          {
            searchPaths: void 0
          }
        ],
        [
          "./root1",
          {
            searchPaths: [{
              searchPath: getUri(ROOT_1)
            }]
          }
        ],
        [
          "./root1,./",
          {
            searchPaths: [{
              searchPath: getUri(ROOT_1)
            }]
          }
        ],
        [
          "./rootB",
          {
            searchPaths: [
              {
                searchPath: getUri(ROOT_2)
              },
              {
                searchPath: getUri(ROOT_3)
              }
            ]
          }
        ],
        [
          "./rootB/a/**/b, ./rootB/b/**/*.txt",
          {
            searchPaths: [
              {
                searchPath: getUri(ROOT_2),
                pattern: patternsToIExpression("a/**/b", "a/**/b/**", "b/**/*.txt", "b/**/*.txt/**")
              },
              {
                searchPath: getUri(ROOT_3),
                pattern: patternsToIExpression("a/**/b", "a/**/b/**", "b/**/*.txt", "b/**/*.txt/**")
              }
            ]
          }
        ],
        [
          "./root1/**/foo/, bar/",
          {
            pattern: patternsToIExpression("**/bar", "**/bar/**"),
            searchPaths: [
              {
                searchPath: ROOT_1_URI,
                pattern: patternsToIExpression("**/foo", "**/foo/**")
              }
            ]
          }
        ]
      ];
      cases.forEach(testIncludesDataItem);
    });
  });
  suite("parseSearchPaths 2", () => {
    function testIncludes(includePattern, expectedResult) {
      assertEqualSearchPathResults(
        queryBuilder.parseSearchPaths(includePattern),
        expectedResult,
        includePattern
      );
    }
    __name(testIncludes, "testIncludes");
    function testIncludesDataItem([includePattern, expectedResult]) {
      testIncludes(includePattern, expectedResult);
    }
    __name(testIncludesDataItem, "testIncludesDataItem");
    (isWindows ? test.skip : test)("includes with tilde", () => {
      const userHome = URI.file("/");
      const cases = [
        [
          "~/foo/bar",
          {
            searchPaths: [{ searchPath: getUri(userHome.fsPath, "/foo/bar") }]
          }
        ],
        [
          "~/foo/bar, a",
          {
            searchPaths: [{ searchPath: getUri(userHome.fsPath, "/foo/bar") }],
            pattern: patternsToIExpression(...globalGlob("a"))
          }
        ],
        [
          fixPath("/foo/~/bar"),
          {
            searchPaths: [{ searchPath: getUri("/foo/~/bar") }]
          }
        ]
      ];
      cases.forEach(testIncludesDataItem);
    });
  });
  suite("smartCase", () => {
    test("no flags -> no change", () => {
      const query = queryBuilder.text(
        {
          pattern: "a"
        },
        []
      );
      assert(!query.contentPattern.isCaseSensitive);
    });
    test("maintains isCaseSensitive when smartCase not set", () => {
      const query = queryBuilder.text(
        {
          pattern: "a",
          isCaseSensitive: true
        },
        []
      );
      assert(query.contentPattern.isCaseSensitive);
    });
    test("maintains isCaseSensitive when smartCase set", () => {
      const query = queryBuilder.text(
        {
          pattern: "a",
          isCaseSensitive: true
        },
        [],
        {
          isSmartCase: true
        }
      );
      assert(query.contentPattern.isCaseSensitive);
    });
    test("smartCase determines not case sensitive", () => {
      const query = queryBuilder.text(
        {
          pattern: "abcd"
        },
        [],
        {
          isSmartCase: true
        }
      );
      assert(!query.contentPattern.isCaseSensitive);
    });
    test("smartCase determines case sensitive", () => {
      const query = queryBuilder.text(
        {
          pattern: "abCd"
        },
        [],
        {
          isSmartCase: true
        }
      );
      assert(query.contentPattern.isCaseSensitive);
    });
    test("smartCase determines not case sensitive (regex)", () => {
      const query = queryBuilder.text(
        {
          pattern: "ab\\Sd",
          isRegExp: true
        },
        [],
        {
          isSmartCase: true
        }
      );
      assert(!query.contentPattern.isCaseSensitive);
    });
    test("smartCase determines case sensitive (regex)", () => {
      const query = queryBuilder.text(
        {
          pattern: "ab[A-Z]d",
          isRegExp: true
        },
        [],
        {
          isSmartCase: true
        }
      );
      assert(query.contentPattern.isCaseSensitive);
    });
  });
  suite("file", () => {
    test("simple file query", () => {
      const cacheKey = "asdf";
      const query = queryBuilder.file(
        [ROOT_1_NAMED_FOLDER],
        {
          cacheKey,
          sortByScore: true
        }
      );
      assert.strictEqual(query.folderQueries.length, 1);
      assert.strictEqual(query.cacheKey, cacheKey);
      assert(query.sortByScore);
    });
  });
  suite("pattern processing", () => {
    test("text query with comma-separated includes with no workspace", () => {
      const query = queryBuilder.text(
        { pattern: `` },
        [],
        {
          includePattern: "*.js,*.ts",
          expandPatterns: true
        }
      );
      assert.deepEqual(query.includePattern, {
        "**/*.js/**": true,
        "**/*.js": true,
        "**/*.ts/**": true,
        "**/*.ts": true
      });
      assert.strictEqual(query.folderQueries.length, 0);
    });
    test("text query with comma-separated includes with workspace", () => {
      const query = queryBuilder.text(
        { pattern: `` },
        [ROOT_1_URI],
        {
          includePattern: "*.js,*.ts",
          expandPatterns: true
        }
      );
      assert.deepEqual(query.includePattern, {
        "**/*.js/**": true,
        "**/*.js": true,
        "**/*.ts/**": true,
        "**/*.ts": true
      });
      assert.strictEqual(query.folderQueries.length, 1);
    });
    test("text query with comma-separated excludes globally", () => {
      const query = queryBuilder.text(
        { pattern: `` },
        [],
        {
          excludePattern: [{ pattern: "*.js,*.ts" }],
          expandPatterns: true
        }
      );
      assert.deepEqual(query.excludePattern, {
        "**/*.js/**": true,
        "**/*.js": true,
        "**/*.ts/**": true,
        "**/*.ts": true
      });
      assert.strictEqual(query.folderQueries.length, 0);
    });
    test("text query with comma-separated excludes globally in a workspace", () => {
      const query = queryBuilder.text(
        { pattern: `` },
        [ROOT_1_NAMED_FOLDER.uri],
        {
          excludePattern: [{ pattern: "*.js,*.ts" }],
          expandPatterns: true
        }
      );
      assert.deepEqual(query.excludePattern, {
        "**/*.js/**": true,
        "**/*.js": true,
        "**/*.ts/**": true,
        "**/*.ts": true
      });
      assert.strictEqual(query.folderQueries.length, 1);
    });
    test.skip("text query with multiple comma-separated excludes", () => {
      const query = queryBuilder.text(
        { pattern: `` },
        [ROOT_1_NAMED_FOLDER.uri],
        {
          excludePattern: [{ pattern: "*.js,*.ts" }, { pattern: "foo/*,bar/*" }],
          expandPatterns: true
        }
      );
      assert.deepEqual(query.excludePattern, [
        {
          "**/*.js/**": true,
          "**/*.js": true,
          "**/*.ts/**": true,
          "**/*.ts": true
        },
        {
          "**/foo/*/**": true,
          "**/foo/*": true,
          "**/bar/*/**": true,
          "**/bar/*": true
        }
      ]);
      assert.strictEqual(query.folderQueries.length, 1);
    });
    test.skip("text query with base URI on exclud", () => {
      const query = queryBuilder.text(
        { pattern: `` },
        [ROOT_1_NAMED_FOLDER.uri],
        {
          excludePattern: [{ uri: ROOT_1_URI, pattern: "*.js,*.ts" }],
          expandPatterns: true
        }
      );
      assert.deepEqual(query.excludePattern, {
        uri: ROOT_1_URI,
        pattern: {
          "**/*.js/**": true,
          "**/*.js": true,
          "**/*.ts/**": true,
          "**/*.ts": true
        }
      });
      assert.strictEqual(query.folderQueries.length, 1);
    });
  });
});
function makeExcludePatternFromPatterns(...patterns) {
  const pattern = patternsToIExpression(...patterns);
  return pattern ? [{ pattern }] : void 0;
}
__name(makeExcludePatternFromPatterns, "makeExcludePatternFromPatterns");
function assertEqualTextQueries(actual, expected) {
  expected = {
    ...DEFAULT_TEXT_QUERY_PROPS,
    ...expected
  };
  return assertEqualQueries(actual, expected);
}
__name(assertEqualTextQueries, "assertEqualTextQueries");
function assertEqualQueries(actual, expected) {
  expected = {
    ...DEFAULT_QUERY_PROPS,
    ...expected
  };
  const folderQueryToCompareObject = /* @__PURE__ */ __name((fq) => {
    const excludePattern = fq.excludePattern?.map((e) => normalizeExpression(e.pattern));
    return {
      path: fq.folder.fsPath,
      excludePattern: excludePattern?.length ? excludePattern : void 0,
      includePattern: normalizeExpression(fq.includePattern),
      fileEncoding: fq.fileEncoding
    };
  }, "folderQueryToCompareObject");
  if (expected.folderQueries) {
    assert.deepStrictEqual(actual.folderQueries.map(folderQueryToCompareObject), expected.folderQueries.map(folderQueryToCompareObject));
    actual.folderQueries = [];
    expected.folderQueries = [];
  }
  if (expected.extraFileResources) {
    assert.deepStrictEqual(actual.extraFileResources.map((extraFile) => extraFile.fsPath), expected.extraFileResources.map((extraFile) => extraFile.fsPath));
    delete expected.extraFileResources;
    delete actual.extraFileResources;
  }
  delete actual.usingSearchPaths;
  actual.includePattern = normalizeExpression(actual.includePattern);
  actual.excludePattern = normalizeExpression(actual.excludePattern);
  cleanUndefinedQueryValues(actual);
  assert.deepStrictEqual(actual, expected);
}
__name(assertEqualQueries, "assertEqualQueries");
function assertEqualSearchPathResults(actual, expected, message) {
  cleanUndefinedQueryValues(actual);
  assert.deepStrictEqual({ ...actual.pattern }, { ...expected.pattern }, message);
  assert.strictEqual(actual.searchPaths && actual.searchPaths.length, expected.searchPaths && expected.searchPaths.length);
  if (actual.searchPaths) {
    actual.searchPaths.forEach((searchPath, i) => {
      const expectedSearchPath = expected.searchPaths[i];
      assert.deepStrictEqual(searchPath.pattern && { ...searchPath.pattern }, expectedSearchPath.pattern);
      assert.strictEqual(searchPath.searchPath.toString(), expectedSearchPath.searchPath.toString());
    });
  }
}
__name(assertEqualSearchPathResults, "assertEqualSearchPathResults");
function cleanUndefinedQueryValues(q) {
  for (const key in q) {
    if (q[key] === void 0) {
      delete q[key];
    } else if (typeof q[key] === "object") {
      cleanUndefinedQueryValues(q[key]);
    }
  }
  return q;
}
__name(cleanUndefinedQueryValues, "cleanUndefinedQueryValues");
function globalGlob(pattern) {
  return [
    `**/${pattern}/**`,
    `**/${pattern}`
  ];
}
__name(globalGlob, "globalGlob");
function patternsToIExpression(...patterns) {
  return patterns.length ? patterns.reduce((glob, cur) => {
    glob[cur] = true;
    return glob;
  }, {}) : void 0;
}
__name(patternsToIExpression, "patternsToIExpression");
function getUri(...slashPathParts) {
  return uri.file(fixPath(...slashPathParts));
}
__name(getUri, "getUri");
function fixPath(...slashPathParts) {
  if (isWindows && slashPathParts.length && !slashPathParts[0].match(/^c:/i)) {
    slashPathParts.unshift("c:");
  }
  return join(...slashPathParts);
}
__name(fixPath, "fixPath");
function normalizeExpression(expression) {
  if (!expression) {
    return expression;
  }
  const normalized = {};
  Object.keys(expression).forEach((key) => {
    normalized[key.replace(/\\/g, "/")] = expression[key];
  });
  return normalized;
}
__name(normalizeExpression, "normalizeExpression");
export {
  assertEqualQueries,
  assertEqualSearchPathResults,
  cleanUndefinedQueryValues,
  fixPath,
  getUri,
  globalGlob,
  normalizeExpression,
  patternsToIExpression
};
//# sourceMappingURL=queryBuilder.test.js.map
