import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { sep } from "../../../../../base/common/path.js";
import { isWindows } from "../../../../../base/common/platform.js";
import * as resources from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  StorageScope,
  StorageTarget
} from "../../../../../platform/storage/common/storage.js";
import { WorkspaceFolder } from "../../../../../platform/workspace/common/workspace.js";
import {
  TestWorkspace,
  Workspace
} from "../../../../../platform/workspace/test/common/testWorkspace.js";
import { Memento } from "../../../../common/memento.js";
import {
  TestEnvironmentService,
  TestLifecycleService,
  TestPathService,
  TestRemoteAgentService
} from "../../../../test/browser/workbenchTestServices.js";
import {
  TestContextService,
  TestStorageService
} from "../../../../test/common/workbenchTestServices.js";
import { LabelService } from "../../common/labelService.js";
suite("URI Label", () => {
  let labelService;
  let storageService;
  setup(() => {
    storageService = new TestStorageService();
    labelService = new LabelService(
      TestEnvironmentService,
      new TestContextService(),
      new TestPathService(URI.file("/foobar")),
      new TestRemoteAgentService(),
      storageService,
      new TestLifecycleService()
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("custom scheme", () => {
    labelService.registerFormatter({
      scheme: "vscode",
      formatting: {
        label: "LABEL/${path}/${authority}/END",
        separator: "/",
        tildify: true,
        normalizeDriveLetter: true
      }
    });
    const uri1 = URI.parse("vscode://microsoft.com/1/2/3/4/5");
    assert.strictEqual(
      labelService.getUriLabel(uri1, { relative: false }),
      "LABEL//1/2/3/4/5/microsoft.com/END"
    );
    assert.strictEqual(labelService.getUriBasenameLabel(uri1), "END");
  });
  test("file scheme", () => {
    labelService.registerFormatter({
      scheme: "file",
      formatting: {
        label: "${path}",
        separator: sep,
        tildify: !isWindows,
        normalizeDriveLetter: isWindows
      }
    });
    const uri1 = TestWorkspace.folders[0].uri.with({
      path: TestWorkspace.folders[0].uri.path.concat("/a/b/c/d")
    });
    assert.strictEqual(
      labelService.getUriLabel(uri1, { relative: true }),
      isWindows ? "a\\b\\c\\d" : "a/b/c/d"
    );
    assert.strictEqual(
      labelService.getUriLabel(uri1, { relative: false }),
      isWindows ? "C:\\testWorkspace\\a\\b\\c\\d" : "/testWorkspace/a/b/c/d"
    );
    assert.strictEqual(labelService.getUriBasenameLabel(uri1), "d");
    const uri2 = URI.file("c:\\1/2/3");
    assert.strictEqual(
      labelService.getUriLabel(uri2, { relative: false }),
      isWindows ? "C:\\1\\2\\3" : "/c:\\1/2/3"
    );
    assert.strictEqual(labelService.getUriBasenameLabel(uri2), "3");
  });
  test("separator", () => {
    labelService.registerFormatter({
      scheme: "vscode",
      formatting: {
        label: "LABEL\\${path}\\${authority}\\END",
        separator: "\\",
        tildify: true,
        normalizeDriveLetter: true
      }
    });
    const uri1 = URI.parse("vscode://microsoft.com/1/2/3/4/5");
    assert.strictEqual(
      labelService.getUriLabel(uri1, { relative: false }),
      "LABEL\\\\1\\2\\3\\4\\5\\microsoft.com\\END"
    );
    assert.strictEqual(labelService.getUriBasenameLabel(uri1), "END");
  });
  test("custom authority", () => {
    labelService.registerFormatter({
      scheme: "vscode",
      authority: "micro*",
      formatting: {
        label: "LABEL/${path}/${authority}/END",
        separator: "/"
      }
    });
    const uri1 = URI.parse("vscode://microsoft.com/1/2/3/4/5");
    assert.strictEqual(
      labelService.getUriLabel(uri1, { relative: false }),
      "LABEL//1/2/3/4/5/microsoft.com/END"
    );
    assert.strictEqual(labelService.getUriBasenameLabel(uri1), "END");
  });
  test("mulitple authority", () => {
    labelService.registerFormatter({
      scheme: "vscode",
      authority: "not_matching_but_long",
      formatting: {
        label: "first",
        separator: "/"
      }
    });
    labelService.registerFormatter({
      scheme: "vscode",
      authority: "microsof*",
      formatting: {
        label: "second",
        separator: "/"
      }
    });
    labelService.registerFormatter({
      scheme: "vscode",
      authority: "mi*",
      formatting: {
        label: "third",
        separator: "/"
      }
    });
    const uri1 = URI.parse("vscode://microsoft.com/1/2/3/4/5");
    assert.strictEqual(
      labelService.getUriLabel(uri1, { relative: false }),
      "second"
    );
    assert.strictEqual(labelService.getUriBasenameLabel(uri1), "second");
  });
  test("custom query", () => {
    labelService.registerFormatter({
      scheme: "vscode",
      formatting: {
        label: "LABEL${query.prefix}: ${query.path}/END",
        separator: "/",
        tildify: true,
        normalizeDriveLetter: true
      }
    });
    const uri1 = URI.parse(
      `vscode://microsoft.com/1/2/3/4/5?${encodeURIComponent(JSON.stringify({ prefix: "prefix", path: "path" }))}`
    );
    assert.strictEqual(
      labelService.getUriLabel(uri1, { relative: false }),
      "LABELprefix: path/END"
    );
  });
  test("custom query without value", () => {
    labelService.registerFormatter({
      scheme: "vscode",
      formatting: {
        label: "LABEL${query.prefix}: ${query.path}/END",
        separator: "/",
        tildify: true,
        normalizeDriveLetter: true
      }
    });
    const uri1 = URI.parse(
      `vscode://microsoft.com/1/2/3/4/5?${encodeURIComponent(JSON.stringify({ path: "path" }))}`
    );
    assert.strictEqual(
      labelService.getUriLabel(uri1, { relative: false }),
      "LABEL: path/END"
    );
  });
  test("custom query without query json", () => {
    labelService.registerFormatter({
      scheme: "vscode",
      formatting: {
        label: "LABEL${query.prefix}: ${query.path}/END",
        separator: "/",
        tildify: true,
        normalizeDriveLetter: true
      }
    });
    const uri1 = URI.parse("vscode://microsoft.com/1/2/3/4/5?path=foo");
    assert.strictEqual(
      labelService.getUriLabel(uri1, { relative: false }),
      "LABEL: /END"
    );
  });
  test("custom query without query", () => {
    labelService.registerFormatter({
      scheme: "vscode",
      formatting: {
        label: "LABEL${query.prefix}: ${query.path}/END",
        separator: "/",
        tildify: true,
        normalizeDriveLetter: true
      }
    });
    const uri1 = URI.parse("vscode://microsoft.com/1/2/3/4/5");
    assert.strictEqual(
      labelService.getUriLabel(uri1, { relative: false }),
      "LABEL: /END"
    );
  });
  test("label caching", () => {
    const m = new Memento(
      "cachedResourceLabelFormatters2",
      storageService
    ).getMemento(StorageScope.PROFILE, StorageTarget.MACHINE);
    const makeFormatter = (scheme) => ({
      formatting: { label: `\${path} (${scheme})`, separator: "/" },
      scheme
    });
    assert.deepStrictEqual(m, {});
    labelService.registerCachedFormatter(makeFormatter("a"));
    assert.deepStrictEqual(m, { formatters: [makeFormatter("a")] });
    labelService.registerCachedFormatter(makeFormatter("b"));
    assert.deepStrictEqual(m, {
      formatters: [makeFormatter("b"), makeFormatter("a")]
    });
    labelService.registerCachedFormatter(makeFormatter("a"));
    assert.deepStrictEqual(m, {
      formatters: [makeFormatter("a"), makeFormatter("b")]
    });
    labelService.registerCachedFormatter(makeFormatter("a"));
    assert.deepStrictEqual(m, {
      formatters: [makeFormatter("a"), makeFormatter("b")]
    });
    for (let i = 0; i < 100; i++) {
      labelService.registerCachedFormatter(makeFormatter(`i${i}`));
    }
    const expected = [];
    for (let i = 50; i < 100; i++) {
      expected.unshift(makeFormatter(`i${i}`));
    }
    assert.deepStrictEqual(m, { formatters: expected });
    delete m.formatters;
  });
});
suite("multi-root workspace", () => {
  let labelService;
  const disposables = new DisposableStore();
  setup(() => {
    const sources = URI.file("folder1/src");
    const tests = URI.file("folder1/test");
    const other = URI.file("folder2");
    labelService = disposables.add(
      new LabelService(
        TestEnvironmentService,
        new TestContextService(
          new Workspace("test-workspace", [
            new WorkspaceFolder({
              uri: sources,
              index: 0,
              name: "Sources"
            }),
            new WorkspaceFolder({
              uri: tests,
              index: 1,
              name: "Tests"
            }),
            new WorkspaceFolder({
              uri: other,
              index: 2,
              name: resources.basename(other)
            })
          ])
        ),
        new TestPathService(),
        new TestRemoteAgentService(),
        disposables.add(new TestStorageService()),
        disposables.add(new TestLifecycleService())
      )
    );
  });
  teardown(() => {
    disposables.clear();
  });
  test("labels of files in multiroot workspaces are the foldername followed by offset from the folder", () => {
    labelService.registerFormatter({
      scheme: "file",
      formatting: {
        label: "${authority}${path}",
        separator: "/",
        tildify: false,
        normalizeDriveLetter: false,
        authorityPrefix: "//",
        workspaceSuffix: ""
      }
    });
    const tests = {
      "folder1/src/file": "Sources \u2022 file",
      "folder1/src/folder/file": "Sources \u2022 folder/file",
      "folder1/src": "Sources",
      "folder1/other": "/folder1/other",
      "folder2/other": "folder2 \u2022 other"
    };
    Object.entries(tests).forEach(([path, label]) => {
      const generated = labelService.getUriLabel(URI.file(path), {
        relative: true
      });
      assert.strictEqual(generated, label);
    });
  });
  test("labels with context after path", () => {
    labelService.registerFormatter({
      scheme: "file",
      formatting: {
        label: "${path} (${scheme})",
        separator: "/"
      }
    });
    const tests = {
      "folder1/src/file": "Sources \u2022 file (file)",
      "folder1/src/folder/file": "Sources \u2022 folder/file (file)",
      "folder1/src": "Sources",
      "folder1/other": "/folder1/other (file)",
      "folder2/other": "folder2 \u2022 other (file)"
    };
    Object.entries(tests).forEach(([path, label]) => {
      const generated = labelService.getUriLabel(URI.file(path), {
        relative: true
      });
      assert.strictEqual(generated, label, path);
    });
  });
  test("stripPathStartingSeparator", () => {
    labelService.registerFormatter({
      scheme: "file",
      formatting: {
        label: "${path}",
        separator: "/",
        stripPathStartingSeparator: true
      }
    });
    const tests = {
      "folder1/src/file": "Sources \u2022 file",
      "other/blah": "other/blah"
    };
    Object.entries(tests).forEach(([path, label]) => {
      const generated = labelService.getUriLabel(URI.file(path), {
        relative: true
      });
      assert.strictEqual(generated, label, path);
    });
  });
  test("relative label without formatter", () => {
    const rootFolder = URI.parse("myscheme://myauthority/");
    labelService = disposables.add(
      new LabelService(
        TestEnvironmentService,
        new TestContextService(
          new Workspace("test-workspace", [
            new WorkspaceFolder({
              uri: rootFolder,
              index: 0,
              name: "FSProotFolder"
            })
          ])
        ),
        new TestPathService(void 0, rootFolder.scheme),
        new TestRemoteAgentService(),
        disposables.add(new TestStorageService()),
        disposables.add(new TestLifecycleService())
      )
    );
    const generated = labelService.getUriLabel(
      URI.parse("myscheme://myauthority/some/folder/test.txt"),
      { relative: true }
    );
    if (isWindows) {
      assert.strictEqual(generated, "some\\folder\\test.txt");
    } else {
      assert.strictEqual(generated, "some/folder/test.txt");
    }
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
suite("workspace at FSP root", () => {
  let labelService;
  setup(() => {
    const rootFolder = URI.parse("myscheme://myauthority/");
    labelService = new LabelService(
      TestEnvironmentService,
      new TestContextService(
        new Workspace("test-workspace", [
          new WorkspaceFolder({
            uri: rootFolder,
            index: 0,
            name: "FSProotFolder"
          })
        ])
      ),
      new TestPathService(),
      new TestRemoteAgentService(),
      new TestStorageService(),
      new TestLifecycleService()
    );
    labelService.registerFormatter({
      scheme: "myscheme",
      formatting: {
        label: "${scheme}://${authority}${path}",
        separator: "/",
        tildify: false,
        normalizeDriveLetter: false,
        workspaceSuffix: "",
        authorityPrefix: "",
        stripPathStartingSeparator: false
      }
    });
  });
  test("non-relative label", () => {
    const tests = {
      "myscheme://myauthority/myFile1.txt": "myscheme://myauthority/myFile1.txt",
      "myscheme://myauthority/folder/myFile2.txt": "myscheme://myauthority/folder/myFile2.txt"
    };
    Object.entries(tests).forEach(([uriString, label]) => {
      const generated = labelService.getUriLabel(URI.parse(uriString), {
        relative: false
      });
      assert.strictEqual(generated, label);
    });
  });
  test("relative label", () => {
    const tests = {
      "myscheme://myauthority/myFile1.txt": "myFile1.txt",
      "myscheme://myauthority/folder/myFile2.txt": "folder/myFile2.txt"
    };
    Object.entries(tests).forEach(([uriString, label]) => {
      const generated = labelService.getUriLabel(URI.parse(uriString), {
        relative: true
      });
      assert.strictEqual(generated, label);
    });
  });
  test("relative label with explicit path separator", () => {
    let generated = labelService.getUriLabel(
      URI.parse("myscheme://myauthority/some/folder/test.txt"),
      { relative: true, separator: "/" }
    );
    assert.strictEqual(generated, "some/folder/test.txt");
    generated = labelService.getUriLabel(
      URI.parse("myscheme://myauthority/some/folder/test.txt"),
      { relative: true, separator: "\\" }
    );
    assert.strictEqual(generated, "some\\folder\\test.txt");
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
