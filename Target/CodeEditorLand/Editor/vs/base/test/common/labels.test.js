import assert from "assert";
import * as labels from "../../common/labels.js";
import {
  OperatingSystem,
  isMacintosh,
  isWindows
} from "../../common/platform.js";
import { URI } from "../../common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Labels", () => {
  (isWindows ? test : test.skip)("shorten - windows", () => {
    assert.deepStrictEqual(labels.shorten(["a"]), ["a"]);
    assert.deepStrictEqual(labels.shorten(["a", "b"]), ["a", "b"]);
    assert.deepStrictEqual(labels.shorten(["a", "b", "c"]), [
      "a",
      "b",
      "c"
    ]);
    assert.deepStrictEqual(labels.shorten(["\\\\x\\a", "\\\\x\\a"]), [
      "\\\\x\\a",
      "\\\\x\\a"
    ]);
    assert.deepStrictEqual(labels.shorten(["C:\\a", "C:\\b"]), [
      "C:\\a",
      "C:\\b"
    ]);
    assert.deepStrictEqual(labels.shorten(["a\\b", "c\\d", "e\\f"]), [
      "\u2026\\b",
      "\u2026\\d",
      "\u2026\\f"
    ]);
    assert.deepStrictEqual(labels.shorten(["a", "a\\b"]), ["a", "\u2026\\b"]);
    assert.deepStrictEqual(labels.shorten(["a\\b", "a\\b\\c"]), [
      "\u2026\\b",
      "\u2026\\c"
    ]);
    assert.deepStrictEqual(labels.shorten(["a", "a\\b", "a\\b\\c"]), [
      "a",
      "\u2026\\b",
      "\u2026\\c"
    ]);
    assert.deepStrictEqual(labels.shorten(["x:\\a\\b", "x:\\a\\c"]), [
      "x:\\\u2026\\b",
      "x:\\\u2026\\c"
    ]);
    assert.deepStrictEqual(labels.shorten(["\\\\a\\b", "\\\\a\\c"]), [
      "\\\\a\\b",
      "\\\\a\\c"
    ]);
    assert.deepStrictEqual(labels.shorten(["a", "b\\a"]), ["a", "b\\\u2026"]);
    assert.deepStrictEqual(labels.shorten(["a\\b\\c", "d\\b\\c"]), [
      "a\\\u2026",
      "d\\\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["a\\b\\c\\d", "f\\b\\c\\d"]), [
      "a\\\u2026",
      "f\\\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["d\\e\\a\\b\\c", "d\\b\\c"]), [
      "\u2026\\a\\\u2026",
      "d\\b\\\u2026"
    ]);
    assert.deepStrictEqual(
      labels.shorten(["a\\b\\c\\d", "a\\f\\b\\c\\d"]),
      ["a\\b\\\u2026", "\u2026\\f\\\u2026"]
    );
    assert.deepStrictEqual(labels.shorten(["a\\b\\a", "b\\b\\a"]), [
      "a\\b\\\u2026",
      "b\\b\\\u2026"
    ]);
    assert.deepStrictEqual(
      labels.shorten(["d\\f\\a\\b\\c", "h\\d\\b\\c"]),
      ["\u2026\\a\\\u2026", "h\\\u2026"]
    );
    assert.deepStrictEqual(labels.shorten(["a\\b\\c", "x:\\0\\a\\b\\c"]), [
      "a\\b\\c",
      "x:\\0\\\u2026"
    ]);
    assert.deepStrictEqual(
      labels.shorten(["x:\\a\\b\\c", "x:\\0\\a\\b\\c"]),
      ["x:\\a\\\u2026", "x:\\0\\\u2026"]
    );
    assert.deepStrictEqual(labels.shorten(["x:\\a\\b", "y:\\a\\b"]), [
      "x:\\\u2026",
      "y:\\\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["x:\\a", "x:\\c"]), [
      "x:\\a",
      "x:\\c"
    ]);
    assert.deepStrictEqual(labels.shorten(["x:\\a\\b", "y:\\x\\a\\b"]), [
      "x:\\\u2026",
      "y:\\\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["\\\\x\\b", "\\\\y\\b"]), [
      "\\\\x\\\u2026",
      "\\\\y\\\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["\\\\x\\a", "\\\\x\\b"]), [
      "\\\\x\\a",
      "\\\\x\\b"
    ]);
    assert.deepStrictEqual(labels.shorten(["a\\b", "a\\c", "a\\e-b"]), [
      "\u2026\\b",
      "\u2026\\c",
      "\u2026\\e-b"
    ]);
    assert.deepStrictEqual(labels.shorten(["a\\b\\c", "d\\b\\e"]), [
      "\u2026\\c",
      "\u2026\\e"
    ]);
    assert.deepStrictEqual(labels.shorten(["a\\b\\c", "d\\b\\C"]), [
      "\u2026\\c",
      "\u2026\\C"
    ]);
    assert.deepStrictEqual(labels.shorten(["", null]), [".\\", null]);
    assert.deepStrictEqual(
      labels.shorten(["a", "a\\b", "a\\b\\c", "d\\b\\c", "d\\b"]),
      ["a", "a\\b", "a\\b\\c", "d\\b\\c", "d\\b"]
    );
    assert.deepStrictEqual(labels.shorten(["a", "a\\b", "b"]), [
      "a",
      "a\\b",
      "b"
    ]);
    assert.deepStrictEqual(labels.shorten(["", "a", "b", "b\\c", "a\\c"]), [
      ".\\",
      "a",
      "b",
      "b\\c",
      "a\\c"
    ]);
    assert.deepStrictEqual(
      labels.shorten([
        "src\\vs\\workbench\\parts\\execution\\electron-sandbox",
        "src\\vs\\workbench\\parts\\execution\\electron-sandbox\\something",
        "src\\vs\\workbench\\parts\\terminal\\electron-sandbox"
      ]),
      [
        "\u2026\\execution\\electron-sandbox",
        "\u2026\\something",
        "\u2026\\terminal\\\u2026"
      ]
    );
  });
  (isWindows ? test.skip : test)("shorten - not windows", () => {
    assert.deepStrictEqual(labels.shorten(["a"]), ["a"]);
    assert.deepStrictEqual(labels.shorten(["a", "b"]), ["a", "b"]);
    assert.deepStrictEqual(labels.shorten(["/a", "/b"]), ["/a", "/b"]);
    assert.deepStrictEqual(labels.shorten(["~/a/b/c", "~/a/b/c"]), [
      "~/a/b/c",
      "~/a/b/c"
    ]);
    assert.deepStrictEqual(labels.shorten(["a", "b", "c"]), [
      "a",
      "b",
      "c"
    ]);
    assert.deepStrictEqual(labels.shorten(["a/b", "c/d", "e/f"]), [
      "\u2026/b",
      "\u2026/d",
      "\u2026/f"
    ]);
    assert.deepStrictEqual(labels.shorten(["a", "a/b"]), ["a", "\u2026/b"]);
    assert.deepStrictEqual(labels.shorten(["a/b", "a/b/c"]), [
      "\u2026/b",
      "\u2026/c"
    ]);
    assert.deepStrictEqual(labels.shorten(["a", "a/b", "a/b/c"]), [
      "a",
      "\u2026/b",
      "\u2026/c"
    ]);
    assert.deepStrictEqual(labels.shorten(["/a/b", "/a/c"]), [
      "/a/b",
      "/a/c"
    ]);
    assert.deepStrictEqual(labels.shorten(["a", "b/a"]), ["a", "b/\u2026"]);
    assert.deepStrictEqual(labels.shorten(["a/b/c", "d/b/c"]), [
      "a/\u2026",
      "d/\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["a/b/c/d", "f/b/c/d"]), [
      "a/\u2026",
      "f/\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["d/e/a/b/c", "d/b/c"]), [
      "\u2026/a/\u2026",
      "d/b/\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["a/b/c/d", "a/f/b/c/d"]), [
      "a/b/\u2026",
      "\u2026/f/\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["a/b/a", "b/b/a"]), [
      "a/b/\u2026",
      "b/b/\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["d/f/a/b/c", "h/d/b/c"]), [
      "\u2026/a/\u2026",
      "h/\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["/x/b", "/y/b"]), [
      "/x/\u2026",
      "/y/\u2026"
    ]);
    assert.deepStrictEqual(labels.shorten(["a/b", "a/c", "a/e-b"]), [
      "\u2026/b",
      "\u2026/c",
      "\u2026/e-b"
    ]);
    assert.deepStrictEqual(labels.shorten(["a/b/c", "d/b/e"]), [
      "\u2026/c",
      "\u2026/e"
    ]);
    assert.deepStrictEqual(labels.shorten(["a/b/c", "d/b/C"]), [
      "\u2026/c",
      "\u2026/C"
    ]);
    assert.deepStrictEqual(labels.shorten(["", null]), ["./", null]);
    assert.deepStrictEqual(
      labels.shorten(["a", "a/b", "a/b/c", "d/b/c", "d/b"]),
      ["a", "a/b", "a/b/c", "d/b/c", "d/b"]
    );
    assert.deepStrictEqual(labels.shorten(["a", "a/b", "b"]), [
      "a",
      "a/b",
      "b"
    ]);
    assert.deepStrictEqual(labels.shorten(["", "a", "b", "b/c", "a/c"]), [
      "./",
      "a",
      "b",
      "b/c",
      "a/c"
    ]);
  });
  test("template", () => {
    assert.strictEqual(labels.template("Foo Bar"), "Foo Bar");
    assert.strictEqual(labels.template("Foo${}Bar"), "FooBar");
    assert.strictEqual(labels.template("$FooBar"), "");
    assert.strictEqual(labels.template("}FooBar"), "}FooBar");
    assert.strictEqual(
      labels.template("Foo ${one} Bar", { one: "value" }),
      "Foo value Bar"
    );
    assert.strictEqual(
      labels.template("Foo ${one} Bar ${two}", {
        one: "value",
        two: "other value"
      }),
      "Foo value Bar other value"
    );
    assert.strictEqual(labels.template("Foo${separator}Bar"), "FooBar");
    assert.strictEqual(
      labels.template("Foo${separator}Bar", {
        separator: { label: " - " }
      }),
      "Foo - Bar"
    );
    assert.strictEqual(
      labels.template("${separator}Foo${separator}Bar", {
        value: "something",
        separator: { label: " - " }
      }),
      "Foo - Bar"
    );
    assert.strictEqual(
      labels.template("${value} Foo${separator}Bar", {
        value: "something",
        separator: { label: " - " }
      }),
      "something Foo - Bar"
    );
    let t = "${activeEditorShort}${separator}${rootName}";
    assert.strictEqual(
      labels.template(t, {
        activeEditorShort: "",
        rootName: "",
        separator: { label: " - " }
      }),
      ""
    );
    assert.strictEqual(
      labels.template(t, {
        activeEditorShort: "",
        rootName: "root",
        separator: { label: " - " }
      }),
      "root"
    );
    assert.strictEqual(
      labels.template(t, {
        activeEditorShort: "markdown.txt",
        rootName: "root",
        separator: { label: " - " }
      }),
      "markdown.txt - root"
    );
    t = "${dirty}${activeEditorShort}${separator}${rootName}${separator}${appName}";
    assert.strictEqual(
      labels.template(t, {
        dirty: "",
        activeEditorShort: "",
        rootName: "",
        appName: "",
        separator: { label: " - " }
      }),
      ""
    );
    assert.strictEqual(
      labels.template(t, {
        dirty: "",
        activeEditorShort: "",
        rootName: "",
        appName: "Visual Studio Code",
        separator: { label: " - " }
      }),
      "Visual Studio Code"
    );
    assert.strictEqual(
      labels.template(t, {
        dirty: "",
        activeEditorShort: "Untitled-1",
        rootName: "",
        appName: "Visual Studio Code",
        separator: { label: " - " }
      }),
      "Untitled-1 - Visual Studio Code"
    );
    assert.strictEqual(
      labels.template(t, {
        dirty: "",
        activeEditorShort: "",
        rootName: "monaco",
        appName: "Visual Studio Code",
        separator: { label: " - " }
      }),
      "monaco - Visual Studio Code"
    );
    assert.strictEqual(
      labels.template(t, {
        dirty: "",
        activeEditorShort: "somefile.txt",
        rootName: "monaco",
        appName: "Visual Studio Code",
        separator: { label: " - " }
      }),
      "somefile.txt - monaco - Visual Studio Code"
    );
    assert.strictEqual(
      labels.template(t, {
        dirty: "* ",
        activeEditorShort: "somefile.txt",
        rootName: "monaco",
        appName: "Visual Studio Code",
        separator: { label: " - " }
      }),
      "* somefile.txt - monaco - Visual Studio Code"
    );
    t = "${dirty}${activeEditorShort}${separator}${rootNameShort}${separator}${appName}";
    assert.strictEqual(
      labels.template(t, {
        dirty: "",
        activeEditorShort: "",
        rootName: "monaco (Workspace)",
        rootNameShort: "monaco",
        appName: "Visual Studio Code",
        separator: { label: " - " }
      }),
      "monaco - Visual Studio Code"
    );
  });
  test("mnemonicButtonLabel", () => {
    assert.strictEqual(
      labels.mnemonicButtonLabel("Hello World"),
      "Hello World"
    );
    assert.strictEqual(labels.mnemonicButtonLabel(""), "");
    if (isWindows) {
      assert.strictEqual(
        labels.mnemonicButtonLabel("Hello & World"),
        "Hello && World"
      );
      assert.strictEqual(
        labels.mnemonicButtonLabel("Do &&not Save & Continue"),
        "Do &not Save && Continue"
      );
    } else if (isMacintosh) {
      assert.strictEqual(
        labels.mnemonicButtonLabel("Hello & World"),
        "Hello & World"
      );
      assert.strictEqual(
        labels.mnemonicButtonLabel("Do &&not Save & Continue"),
        "Do not Save & Continue"
      );
    } else {
      assert.strictEqual(
        labels.mnemonicButtonLabel("Hello & World"),
        "Hello & World"
      );
      assert.strictEqual(
        labels.mnemonicButtonLabel("Do &&not Save & Continue"),
        "Do _not Save & Continue"
      );
    }
  });
  test("getPathLabel", () => {
    const winFileUri = URI.file("c:/some/folder/file.txt");
    const nixFileUri = URI.file("/some/folder/file.txt");
    const nixBadFileUri = URI.revive({
      scheme: "vscode",
      authority: "file",
      path: "//some/folder/file.txt"
    });
    const uncFileUri = URI.file("c:/some/folder/file.txt").with({
      authority: "auth"
    });
    const remoteFileUri = URI.file("/some/folder/file.txt").with({
      scheme: "vscode-test",
      authority: "auth"
    });
    assert.strictEqual(
      labels.getPathLabel(winFileUri, { os: OperatingSystem.Windows }),
      "C:\\some\\folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(winFileUri, { os: OperatingSystem.Macintosh }),
      "c:/some/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(winFileUri, { os: OperatingSystem.Linux }),
      "c:/some/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, { os: OperatingSystem.Windows }),
      "\\some\\folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, { os: OperatingSystem.Macintosh }),
      "/some/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, { os: OperatingSystem.Linux }),
      "/some/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(uncFileUri, { os: OperatingSystem.Windows }),
      "\\\\auth\\c:\\some\\folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(uncFileUri, { os: OperatingSystem.Macintosh }),
      "/auth/c:/some/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(uncFileUri, { os: OperatingSystem.Linux }),
      "/auth/c:/some/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(remoteFileUri, { os: OperatingSystem.Windows }),
      "\\some\\folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(remoteFileUri, {
        os: OperatingSystem.Macintosh
      }),
      "/some/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(remoteFileUri, { os: OperatingSystem.Linux }),
      "/some/folder/file.txt"
    );
    const nixUserHome = URI.file("/some");
    const remoteUserHome = URI.file("/some").with({
      scheme: "vscode-test",
      authority: "auth"
    });
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, {
        os: OperatingSystem.Windows,
        tildify: { userHome: nixUserHome }
      }),
      "\\some\\folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, {
        os: OperatingSystem.Macintosh,
        tildify: { userHome: nixUserHome }
      }),
      "~/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixBadFileUri, {
        os: OperatingSystem.Macintosh,
        tildify: { userHome: nixUserHome }
      }),
      "/some/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, {
        os: OperatingSystem.Linux,
        tildify: { userHome: nixUserHome }
      }),
      "~/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, {
        os: OperatingSystem.Windows,
        tildify: { userHome: remoteUserHome }
      }),
      "\\some\\folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, {
        os: OperatingSystem.Macintosh,
        tildify: { userHome: remoteUserHome }
      }),
      "~/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, {
        os: OperatingSystem.Linux,
        tildify: { userHome: remoteUserHome }
      }),
      "~/folder/file.txt"
    );
    const nixUntitledUri = URI.file("/some/folder/file.txt").with({
      scheme: "untitled"
    });
    assert.strictEqual(
      labels.getPathLabel(nixUntitledUri, {
        os: OperatingSystem.Windows,
        tildify: { userHome: nixUserHome }
      }),
      "\\some\\folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixUntitledUri, {
        os: OperatingSystem.Macintosh,
        tildify: { userHome: nixUserHome }
      }),
      "~/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixUntitledUri, {
        os: OperatingSystem.Linux,
        tildify: { userHome: nixUserHome }
      }),
      "~/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixUntitledUri, {
        os: OperatingSystem.Windows,
        tildify: { userHome: remoteUserHome }
      }),
      "\\some\\folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixUntitledUri, {
        os: OperatingSystem.Macintosh,
        tildify: { userHome: remoteUserHome }
      }),
      "~/folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixUntitledUri, {
        os: OperatingSystem.Linux,
        tildify: { userHome: remoteUserHome }
      }),
      "~/folder/file.txt"
    );
    const winFolder = URI.file("c:/some");
    const winRelativePathProvider = {
      getWorkspace() {
        return { folders: [{ uri: winFolder }] };
      },
      getWorkspaceFolder(resource) {
        return { uri: winFolder };
      }
    };
    assert.strictEqual(
      labels.getPathLabel(winFileUri, {
        os: OperatingSystem.Windows,
        relative: winRelativePathProvider
      }),
      "folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(winFileUri, {
        os: OperatingSystem.Macintosh,
        relative: winRelativePathProvider
      }),
      "folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(winFileUri, {
        os: OperatingSystem.Linux,
        relative: winRelativePathProvider
      }),
      "folder/file.txt"
    );
    const nixFolder = URI.file("/some");
    const nixRelativePathProvider = {
      getWorkspace() {
        return { folders: [{ uri: nixFolder }] };
      },
      getWorkspaceFolder(resource) {
        return { uri: nixFolder };
      }
    };
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, {
        os: OperatingSystem.Windows,
        relative: nixRelativePathProvider
      }),
      "folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, {
        os: OperatingSystem.Macintosh,
        relative: nixRelativePathProvider
      }),
      "folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixFileUri, {
        os: OperatingSystem.Linux,
        relative: nixRelativePathProvider
      }),
      "folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixUntitledUri, {
        os: OperatingSystem.Windows,
        relative: nixRelativePathProvider
      }),
      "folder\\file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixUntitledUri, {
        os: OperatingSystem.Macintosh,
        relative: nixRelativePathProvider
      }),
      "folder/file.txt"
    );
    assert.strictEqual(
      labels.getPathLabel(nixUntitledUri, {
        os: OperatingSystem.Linux,
        relative: nixRelativePathProvider
      }),
      "folder/file.txt"
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
