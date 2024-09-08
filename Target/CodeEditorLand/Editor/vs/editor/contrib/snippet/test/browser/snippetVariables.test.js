import assert from "assert";
import * as sinon from "sinon";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { sep } from "../../../../../base/common/path.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { extUriBiasedIgnorePathCase } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  toWorkspaceFolder
} from "../../../../../platform/workspace/common/workspace.js";
import { Workspace } from "../../../../../platform/workspace/test/common/testWorkspace.js";
import { toWorkspaceFolders } from "../../../../../platform/workspaces/common/workspaces.js";
import { Selection } from "../../../../common/core/selection.js";
import { createTextModel } from "../../../../test/common/testTextModel.js";
import {
  SnippetParser
} from "../../browser/snippetParser.js";
import {
  ClipboardBasedVariableResolver,
  CompositeSnippetVariableResolver,
  ModelBasedVariableResolver,
  SelectionBasedVariableResolver,
  TimeBasedVariableResolver,
  WorkspaceBasedVariableResolver
} from "../../browser/snippetVariables.js";
suite("Snippet Variables Resolver", () => {
  const labelService = new class extends mock() {
    getUriLabel(uri) {
      return uri.fsPath;
    }
  }();
  let model;
  let resolver;
  setup(() => {
    model = createTextModel(
      [
        "this is line one",
        "this is line two",
        "    this is line three"
      ].join("\n"),
      void 0,
      void 0,
      URI.parse("file:///foo/files/text.txt")
    );
    resolver = new CompositeSnippetVariableResolver([
      new ModelBasedVariableResolver(labelService, model),
      new SelectionBasedVariableResolver(
        model,
        new Selection(1, 1, 1, 1),
        0,
        void 0
      )
    ]);
  });
  teardown(() => {
    model.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  function assertVariableResolve(resolver2, varName, expected) {
    const snippet = new SnippetParser().parse(`$${varName}`);
    const variable = snippet.children[0];
    variable.resolve(resolver2);
    if (variable.children.length === 0) {
      assert.strictEqual(void 0, expected);
    } else {
      assert.strictEqual(variable.toString(), expected);
    }
  }
  test("editor variables, basics", () => {
    assertVariableResolve(resolver, "TM_FILENAME", "text.txt");
    assertVariableResolve(resolver, "something", void 0);
  });
  test("editor variables, file/dir", () => {
    const disposables = new DisposableStore();
    assertVariableResolve(resolver, "TM_FILENAME", "text.txt");
    if (!isWindows) {
      assertVariableResolve(resolver, "TM_DIRECTORY", "/foo/files");
      assertVariableResolve(
        resolver,
        "TM_FILEPATH",
        "/foo/files/text.txt"
      );
    }
    resolver = new ModelBasedVariableResolver(
      labelService,
      disposables.add(
        createTextModel(
          "",
          void 0,
          void 0,
          URI.parse("http://www.pb.o/abc/def/ghi")
        )
      )
    );
    assertVariableResolve(resolver, "TM_FILENAME", "ghi");
    if (!isWindows) {
      assertVariableResolve(resolver, "TM_DIRECTORY", "/abc/def");
      assertVariableResolve(resolver, "TM_FILEPATH", "/abc/def/ghi");
    }
    resolver = new ModelBasedVariableResolver(
      labelService,
      disposables.add(
        createTextModel(
          "",
          void 0,
          void 0,
          URI.parse("mem:fff.ts")
        )
      )
    );
    assertVariableResolve(resolver, "TM_DIRECTORY", "");
    assertVariableResolve(resolver, "TM_FILEPATH", "fff.ts");
    disposables.dispose();
  });
  test("Path delimiters in code snippet variables aren't specific to remote OS #76840", () => {
    const labelService2 = new class extends mock() {
      getUriLabel(uri) {
        return uri.fsPath.replace(/\/|\\/g, "|");
      }
    }();
    const model2 = createTextModel(
      [].join("\n"),
      void 0,
      void 0,
      URI.parse("foo:///foo/files/text.txt")
    );
    const resolver2 = new CompositeSnippetVariableResolver([
      new ModelBasedVariableResolver(labelService2, model2)
    ]);
    assertVariableResolve(resolver2, "TM_FILEPATH", "|foo|files|text.txt");
    model2.dispose();
  });
  test("editor variables, selection", () => {
    resolver = new SelectionBasedVariableResolver(
      model,
      new Selection(1, 2, 2, 3),
      0,
      void 0
    );
    assertVariableResolve(
      resolver,
      "TM_SELECTED_TEXT",
      "his is line one\nth"
    );
    assertVariableResolve(resolver, "TM_CURRENT_LINE", "this is line two");
    assertVariableResolve(resolver, "TM_LINE_INDEX", "1");
    assertVariableResolve(resolver, "TM_LINE_NUMBER", "2");
    assertVariableResolve(resolver, "CURSOR_INDEX", "0");
    assertVariableResolve(resolver, "CURSOR_NUMBER", "1");
    resolver = new SelectionBasedVariableResolver(
      model,
      new Selection(1, 2, 2, 3),
      4,
      void 0
    );
    assertVariableResolve(resolver, "CURSOR_INDEX", "4");
    assertVariableResolve(resolver, "CURSOR_NUMBER", "5");
    resolver = new SelectionBasedVariableResolver(
      model,
      new Selection(2, 3, 1, 2),
      0,
      void 0
    );
    assertVariableResolve(
      resolver,
      "TM_SELECTED_TEXT",
      "his is line one\nth"
    );
    assertVariableResolve(resolver, "TM_CURRENT_LINE", "this is line one");
    assertVariableResolve(resolver, "TM_LINE_INDEX", "0");
    assertVariableResolve(resolver, "TM_LINE_NUMBER", "1");
    resolver = new SelectionBasedVariableResolver(
      model,
      new Selection(1, 2, 1, 2),
      0,
      void 0
    );
    assertVariableResolve(resolver, "TM_SELECTED_TEXT", void 0);
    assertVariableResolve(resolver, "TM_CURRENT_WORD", "this");
    resolver = new SelectionBasedVariableResolver(
      model,
      new Selection(3, 1, 3, 1),
      0,
      void 0
    );
    assertVariableResolve(resolver, "TM_CURRENT_WORD", void 0);
  });
  test("TextmateSnippet, resolve variable", () => {
    const snippet = new SnippetParser().parse('"$TM_CURRENT_WORD"', true);
    assert.strictEqual(snippet.toString(), '""');
    snippet.resolveVariables(resolver);
    assert.strictEqual(snippet.toString(), '"this"');
  });
  test("TextmateSnippet, resolve variable with default", () => {
    const snippet = new SnippetParser().parse(
      '"${TM_CURRENT_WORD:foo}"',
      true
    );
    assert.strictEqual(snippet.toString(), '"foo"');
    snippet.resolveVariables(resolver);
    assert.strictEqual(snippet.toString(), '"this"');
  });
  test("More useful environment variables for snippets, #32737", () => {
    const disposables = new DisposableStore();
    assertVariableResolve(resolver, "TM_FILENAME_BASE", "text");
    resolver = new ModelBasedVariableResolver(
      labelService,
      disposables.add(
        createTextModel(
          "",
          void 0,
          void 0,
          URI.parse("http://www.pb.o/abc/def/ghi")
        )
      )
    );
    assertVariableResolve(resolver, "TM_FILENAME_BASE", "ghi");
    resolver = new ModelBasedVariableResolver(
      labelService,
      disposables.add(
        createTextModel(
          "",
          void 0,
          void 0,
          URI.parse("mem:.git")
        )
      )
    );
    assertVariableResolve(resolver, "TM_FILENAME_BASE", ".git");
    resolver = new ModelBasedVariableResolver(
      labelService,
      disposables.add(
        createTextModel(
          "",
          void 0,
          void 0,
          URI.parse("mem:foo.")
        )
      )
    );
    assertVariableResolve(resolver, "TM_FILENAME_BASE", "foo");
    disposables.dispose();
  });
  function assertVariableResolve2(input, expected, varValue) {
    const snippet = new SnippetParser().parse(input).resolveVariables({
      resolve(variable) {
        return varValue || variable.name;
      }
    });
    const actual = snippet.toString();
    assert.strictEqual(actual, expected);
  }
  test("Variable Snippet Transform", () => {
    const snippet = new SnippetParser().parse(
      "name=${TM_FILENAME/(.*)\\..+$/$1/}",
      true
    );
    snippet.resolveVariables(resolver);
    assert.strictEqual(snippet.toString(), "name=text");
    assertVariableResolve2("${ThisIsAVar/([A-Z]).*(Var)/$2/}", "Var");
    assertVariableResolve2(
      "${ThisIsAVar/([A-Z]).*(Var)/$2-${1:/downcase}/}",
      "Var-t"
    );
    assertVariableResolve2("${Foo/(.*)/${1:+Bar}/img}", "Bar");
    assertVariableResolve2(
      "export default class ${TM_FILENAME/(\\w+)\\.js/$1/g}",
      "export default class FooFile",
      "FooFile.js"
    );
    assertVariableResolve2(
      "${foobarfoobar/(foo)/${1:+FAR}/g}",
      "FARbarFARbar"
    );
    assertVariableResolve2(
      "${foobarfoobar/(foo)/${1:+FAR}/}",
      "FARbarfoobar"
    );
    assertVariableResolve2(
      "${foobarfoobar/(bazz)/${1:+FAR}/g}",
      "foobarfoobar"
    );
    assertVariableResolve2("${foobarfoobar/(foo)/${2:+FAR}/g}", "barbar");
  });
  test("Snippet transforms do not handle regex with alternatives or optional matches, #36089", () => {
    assertVariableResolve2(
      "${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}",
      "MyClass",
      "my-class.js"
    );
    assertVariableResolve2(
      "${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}",
      "Myclass",
      "myclass.js"
    );
    assertVariableResolve2(
      "${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}",
      "Myclass.foo",
      "myclass.foo"
    );
    assertVariableResolve2(
      "${TM_FILENAME/^(.)|(?:-(.))|(\\.js)/${1:/upcase}${2:/upcase}/g}",
      "ThisIsAFile",
      "this-is-a-file.js"
    );
    assertVariableResolve2(
      "${TM_FILENAME_BASE/([A-Z][a-z]+)([A-Z][a-z]+$)?/${1:/downcase}-${2:/downcase}/g}",
      "capital-case",
      "CapitalCase"
    );
    assertVariableResolve2(
      "${TM_FILENAME_BASE/([A-Z][a-z]+)([A-Z][a-z]+$)?/${1:/downcase}-${2:/downcase}/g}",
      "capital-case-more",
      "CapitalCaseMore"
    );
  });
  test("Add variable to insert value from clipboard to a snippet #40153", () => {
    assertVariableResolve(
      new ClipboardBasedVariableResolver(() => void 0, 1, 0, true),
      "CLIPBOARD",
      void 0
    );
    assertVariableResolve(
      new ClipboardBasedVariableResolver(() => null, 1, 0, true),
      "CLIPBOARD",
      void 0
    );
    assertVariableResolve(
      new ClipboardBasedVariableResolver(() => "", 1, 0, true),
      "CLIPBOARD",
      void 0
    );
    assertVariableResolve(
      new ClipboardBasedVariableResolver(() => "foo", 1, 0, true),
      "CLIPBOARD",
      "foo"
    );
    assertVariableResolve(
      new ClipboardBasedVariableResolver(() => "foo", 1, 0, true),
      "foo",
      void 0
    );
    assertVariableResolve(
      new ClipboardBasedVariableResolver(() => "foo", 1, 0, true),
      "cLIPBOARD",
      void 0
    );
  });
  test("Add variable to insert value from clipboard to a snippet #40153, 2", () => {
    assertVariableResolve(
      new ClipboardBasedVariableResolver(() => "line1", 1, 2, true),
      "CLIPBOARD",
      "line1"
    );
    assertVariableResolve(
      new ClipboardBasedVariableResolver(
        () => "line1\nline2\nline3",
        1,
        2,
        true
      ),
      "CLIPBOARD",
      "line1\nline2\nline3"
    );
    assertVariableResolve(
      new ClipboardBasedVariableResolver(
        () => "line1\nline2",
        1,
        2,
        true
      ),
      "CLIPBOARD",
      "line2"
    );
    resolver = new ClipboardBasedVariableResolver(
      () => "line1\nline2",
      0,
      2,
      true
    );
    assertVariableResolve(
      new ClipboardBasedVariableResolver(
        () => "line1\nline2",
        0,
        2,
        true
      ),
      "CLIPBOARD",
      "line1"
    );
    assertVariableResolve(
      new ClipboardBasedVariableResolver(
        () => "line1\nline2",
        0,
        2,
        false
      ),
      "CLIPBOARD",
      "line1\nline2"
    );
  });
  function assertVariableResolve3(resolver2, varName) {
    const snippet = new SnippetParser().parse(`$${varName}`);
    const variable = snippet.children[0];
    assert.strictEqual(
      variable.resolve(resolver2),
      true,
      `${varName} failed to resolve`
    );
  }
  test("Add time variables for snippets #41631, #43140", () => {
    const resolver2 = new TimeBasedVariableResolver();
    assertVariableResolve3(resolver2, "CURRENT_YEAR");
    assertVariableResolve3(resolver2, "CURRENT_YEAR_SHORT");
    assertVariableResolve3(resolver2, "CURRENT_MONTH");
    assertVariableResolve3(resolver2, "CURRENT_DATE");
    assertVariableResolve3(resolver2, "CURRENT_HOUR");
    assertVariableResolve3(resolver2, "CURRENT_MINUTE");
    assertVariableResolve3(resolver2, "CURRENT_SECOND");
    assertVariableResolve3(resolver2, "CURRENT_DAY_NAME");
    assertVariableResolve3(resolver2, "CURRENT_DAY_NAME_SHORT");
    assertVariableResolve3(resolver2, "CURRENT_MONTH_NAME");
    assertVariableResolve3(resolver2, "CURRENT_MONTH_NAME_SHORT");
    assertVariableResolve3(resolver2, "CURRENT_SECONDS_UNIX");
    assertVariableResolve3(resolver2, "CURRENT_TIMEZONE_OFFSET");
  });
  test("Time-based snippet variables resolve to the same values even as time progresses", async () => {
    const snippetText = `
			$CURRENT_YEAR
			$CURRENT_YEAR_SHORT
			$CURRENT_MONTH
			$CURRENT_DATE
			$CURRENT_HOUR
			$CURRENT_MINUTE
			$CURRENT_SECOND
			$CURRENT_DAY_NAME
			$CURRENT_DAY_NAME_SHORT
			$CURRENT_MONTH_NAME
			$CURRENT_MONTH_NAME_SHORT
			$CURRENT_SECONDS_UNIX
			$CURRENT_TIMEZONE_OFFSET
		`;
    const clock = sinon.useFakeTimers();
    try {
      const resolver2 = new TimeBasedVariableResolver();
      const firstResolve = new SnippetParser().parse(snippetText).resolveVariables(resolver2);
      clock.tick(365 * 24 * 3600 * 1e3 + 24 * 3600 * 1e3 + 3661 * 1e3);
      const secondResolve = new SnippetParser().parse(snippetText).resolveVariables(resolver2);
      assert.strictEqual(
        firstResolve.toString(),
        secondResolve.toString(),
        `Time-based snippet variables resolved differently`
      );
    } finally {
      clock.restore();
    }
  });
  test("creating snippet - format-condition doesn't work #53617", () => {
    const snippet = new SnippetParser().parse(
      "${TM_LINE_NUMBER/(10)/${1:?It is:It is not}/} line 10",
      true
    );
    snippet.resolveVariables({
      resolve() {
        return "10";
      }
    });
    assert.strictEqual(snippet.toString(), "It is line 10");
    snippet.resolveVariables({
      resolve() {
        return "11";
      }
    });
    assert.strictEqual(snippet.toString(), "It is not line 10");
  });
  test("Add workspace name and folder variables for snippets #68261", function() {
    let workspace;
    const workspaceService = new class {
      _throw = () => {
        throw new Error();
      };
      onDidChangeWorkbenchState = this._throw;
      onDidChangeWorkspaceName = this._throw;
      onWillChangeWorkspaceFolders = this._throw;
      onDidChangeWorkspaceFolders = this._throw;
      getCompleteWorkspace = this._throw;
      getWorkspace() {
        return workspace;
      }
      getWorkbenchState = this._throw;
      getWorkspaceFolder = this._throw;
      isCurrentWorkspace = this._throw;
      isInsideWorkspace = this._throw;
    }();
    const resolver2 = new WorkspaceBasedVariableResolver(workspaceService);
    workspace = new Workspace("");
    assertVariableResolve(resolver2, "WORKSPACE_NAME", void 0);
    assertVariableResolve(resolver2, "WORKSPACE_FOLDER", void 0);
    workspace = new Workspace("", [
      toWorkspaceFolder(URI.file("/folderName"))
    ]);
    assertVariableResolve(resolver2, "WORKSPACE_NAME", "folderName");
    if (!isWindows) {
      assertVariableResolve(resolver2, "WORKSPACE_FOLDER", "/folderName");
    }
    const workspaceConfigPath = URI.file("testWorkspace.code-workspace");
    workspace = new Workspace(
      "",
      toWorkspaceFolders(
        [{ path: "folderName" }],
        workspaceConfigPath,
        extUriBiasedIgnorePathCase
      ),
      workspaceConfigPath
    );
    assertVariableResolve(resolver2, "WORKSPACE_NAME", "testWorkspace");
    if (!isWindows) {
      assertVariableResolve(resolver2, "WORKSPACE_FOLDER", "/");
    }
  });
  test("Add RELATIVE_FILEPATH snippet variable #114208", () => {
    let resolver2;
    const workspaceLabelService = (rootPath) => {
      const labelService2 = new class extends mock() {
        getUriLabel(uri, options = {}) {
          const rootFsPath = URI.file(rootPath).fsPath + sep;
          const fsPath = uri.fsPath;
          if (options.relative && rootPath && fsPath.startsWith(rootFsPath)) {
            return fsPath.substring(rootFsPath.length);
          }
          return fsPath;
        }
      }();
      return labelService2;
    };
    const model2 = createTextModel(
      "",
      void 0,
      void 0,
      URI.parse("file:///foo/files/text.txt")
    );
    resolver2 = new ModelBasedVariableResolver(
      workspaceLabelService(""),
      model2
    );
    if (isWindows) {
      assertVariableResolve(
        resolver2,
        "RELATIVE_FILEPATH",
        "\\foo\\files\\text.txt"
      );
    } else {
      assertVariableResolve(
        resolver2,
        "RELATIVE_FILEPATH",
        "/foo/files/text.txt"
      );
    }
    resolver2 = new ModelBasedVariableResolver(
      workspaceLabelService("/foo"),
      model2
    );
    if (isWindows) {
      assertVariableResolve(
        resolver2,
        "RELATIVE_FILEPATH",
        "files\\text.txt"
      );
    } else {
      assertVariableResolve(
        resolver2,
        "RELATIVE_FILEPATH",
        "files/text.txt"
      );
    }
    model2.dispose();
  });
});
