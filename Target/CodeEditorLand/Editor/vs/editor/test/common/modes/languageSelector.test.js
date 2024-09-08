import assert from "assert";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  score
} from "../../../common/languageSelector.js";
suite("LanguageSelector", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const model = {
    language: "farboo",
    uri: URI.parse("file:///testbed/file.fb")
  };
  test("score, invalid selector", () => {
    assert.strictEqual(
      score({}, model.uri, model.language, true, void 0, void 0),
      0
    );
    assert.strictEqual(
      score(
        void 0,
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      0
    );
    assert.strictEqual(
      score(null, model.uri, model.language, true, void 0, void 0),
      0
    );
    assert.strictEqual(
      score("", model.uri, model.language, true, void 0, void 0),
      0
    );
  });
  test("score, any language", () => {
    assert.strictEqual(
      score(
        { language: "*" },
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      5
    );
    assert.strictEqual(
      score("*", model.uri, model.language, true, void 0, void 0),
      5
    );
    assert.strictEqual(
      score(
        "*",
        URI.parse("foo:bar"),
        model.language,
        true,
        void 0,
        void 0
      ),
      5
    );
    assert.strictEqual(
      score(
        "farboo",
        URI.parse("foo:bar"),
        model.language,
        true,
        void 0,
        void 0
      ),
      10
    );
  });
  test("score, default schemes", () => {
    const uri = URI.parse("git:foo/file.txt");
    const language = "farboo";
    assert.strictEqual(
      score("*", uri, language, true, void 0, void 0),
      5
    );
    assert.strictEqual(
      score("farboo", uri, language, true, void 0, void 0),
      10
    );
    assert.strictEqual(
      score(
        { language: "farboo", scheme: "" },
        uri,
        language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        { language: "farboo", scheme: "git" },
        uri,
        language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        { language: "farboo", scheme: "*" },
        uri,
        language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        { language: "farboo" },
        uri,
        language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score({ language: "*" }, uri, language, true, void 0, void 0),
      5
    );
    assert.strictEqual(
      score({ scheme: "*" }, uri, language, true, void 0, void 0),
      5
    );
    assert.strictEqual(
      score({ scheme: "git" }, uri, language, true, void 0, void 0),
      10
    );
  });
  test("score, filter", () => {
    assert.strictEqual(
      score(
        "farboo",
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        { language: "farboo" },
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        { language: "farboo", scheme: "file" },
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        { language: "farboo", scheme: "http" },
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      0
    );
    assert.strictEqual(
      score(
        { pattern: "**/*.fb" },
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        { pattern: "**/*.fb", scheme: "file" },
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        { pattern: "**/*.fb" },
        URI.parse("foo:bar"),
        model.language,
        true,
        void 0,
        void 0
      ),
      0
    );
    assert.strictEqual(
      score(
        { pattern: "**/*.fb", scheme: "foo" },
        URI.parse("foo:bar"),
        model.language,
        true,
        void 0,
        void 0
      ),
      0
    );
    const doc = {
      uri: URI.parse("git:/my/file.js"),
      langId: "javascript"
    };
    assert.strictEqual(
      score(
        "javascript",
        doc.uri,
        doc.langId,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        { language: "javascript", scheme: "git" },
        doc.uri,
        doc.langId,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score("*", doc.uri, doc.langId, true, void 0, void 0),
      5
    );
    assert.strictEqual(
      score("fooLang", doc.uri, doc.langId, true, void 0, void 0),
      0
    );
    assert.strictEqual(
      score(
        ["fooLang", "*"],
        doc.uri,
        doc.langId,
        true,
        void 0,
        void 0
      ),
      5
    );
  });
  test("score, max(filters)", () => {
    const match = { language: "farboo", scheme: "file" };
    const fail = { language: "farboo", scheme: "http" };
    assert.strictEqual(
      score(match, model.uri, model.language, true, void 0, void 0),
      10
    );
    assert.strictEqual(
      score(fail, model.uri, model.language, true, void 0, void 0),
      0
    );
    assert.strictEqual(
      score(
        [match, fail],
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        [fail, fail],
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      0
    );
    assert.strictEqual(
      score(
        ["farboo", "*"],
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        ["*", "farboo"],
        model.uri,
        model.language,
        true,
        void 0,
        void 0
      ),
      10
    );
  });
  test("score hasAccessToAllModels", () => {
    const doc = {
      uri: URI.parse("file:/my/file.js"),
      langId: "javascript"
    };
    assert.strictEqual(
      score(
        "javascript",
        doc.uri,
        doc.langId,
        false,
        void 0,
        void 0
      ),
      0
    );
    assert.strictEqual(
      score(
        { language: "javascript", scheme: "file" },
        doc.uri,
        doc.langId,
        false,
        void 0,
        void 0
      ),
      0
    );
    assert.strictEqual(
      score("*", doc.uri, doc.langId, false, void 0, void 0),
      0
    );
    assert.strictEqual(
      score("fooLang", doc.uri, doc.langId, false, void 0, void 0),
      0
    );
    assert.strictEqual(
      score(
        ["fooLang", "*"],
        doc.uri,
        doc.langId,
        false,
        void 0,
        void 0
      ),
      0
    );
    assert.strictEqual(
      score(
        {
          language: "javascript",
          scheme: "file",
          hasAccessToAllModels: true
        },
        doc.uri,
        doc.langId,
        false,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        ["fooLang", "*", { language: "*", hasAccessToAllModels: true }],
        doc.uri,
        doc.langId,
        false,
        void 0,
        void 0
      ),
      5
    );
  });
  test("score, notebookType", () => {
    const obj = {
      uri: URI.parse("vscode-notebook-cell:///my/file.js#blabla"),
      langId: "javascript",
      notebookType: "fooBook",
      notebookUri: URI.parse("file:///my/file.js")
    };
    assert.strictEqual(
      score(
        "javascript",
        obj.uri,
        obj.langId,
        true,
        void 0,
        void 0
      ),
      10
    );
    assert.strictEqual(
      score(
        "javascript",
        obj.uri,
        obj.langId,
        true,
        obj.notebookUri,
        obj.notebookType
      ),
      10
    );
    assert.strictEqual(
      score(
        { notebookType: "fooBook" },
        obj.uri,
        obj.langId,
        true,
        obj.notebookUri,
        obj.notebookType
      ),
      10
    );
    assert.strictEqual(
      score(
        {
          notebookType: "fooBook",
          language: "javascript",
          scheme: "file"
        },
        obj.uri,
        obj.langId,
        true,
        obj.notebookUri,
        obj.notebookType
      ),
      10
    );
    assert.strictEqual(
      score(
        { notebookType: "fooBook", language: "*" },
        obj.uri,
        obj.langId,
        true,
        obj.notebookUri,
        obj.notebookType
      ),
      10
    );
    assert.strictEqual(
      score(
        { notebookType: "*", language: "*" },
        obj.uri,
        obj.langId,
        true,
        obj.notebookUri,
        obj.notebookType
      ),
      5
    );
    assert.strictEqual(
      score(
        { notebookType: "*", language: "javascript" },
        obj.uri,
        obj.langId,
        true,
        obj.notebookUri,
        obj.notebookType
      ),
      10
    );
  });
  test("Snippet choices lost #149363", () => {
    const selector = {
      scheme: "vscode-notebook-cell",
      pattern: "/some/path/file.py",
      language: "python"
    };
    const modelUri = URI.parse("vscode-notebook-cell:///some/path/file.py");
    const nbUri = URI.parse("file:///some/path/file.py");
    assert.strictEqual(
      score(selector, modelUri, "python", true, nbUri, "jupyter"),
      10
    );
    const selector2 = {
      ...selector,
      notebookType: "jupyter"
    };
    assert.strictEqual(
      score(selector2, modelUri, "python", true, nbUri, "jupyter"),
      0
    );
  });
  test("Document selector match - unexpected result value #60232", () => {
    const selector = {
      language: "json",
      scheme: "file",
      pattern: "**/*.interface.json"
    };
    const value = score(
      selector,
      URI.parse("file:///C:/Users/zlhe/Desktop/test.interface.json"),
      "json",
      true,
      void 0,
      void 0
    );
    assert.strictEqual(value, 10);
  });
  test("Document selector match - platform paths #99938", () => {
    const selector = {
      pattern: {
        base: "/home/user/Desktop",
        pattern: "*.json"
      }
    };
    const value = score(
      selector,
      URI.file("/home/user/Desktop/test.json"),
      "json",
      true,
      void 0,
      void 0
    );
    assert.strictEqual(value, 10);
  });
  test("NotebookType without notebook", () => {
    const obj = {
      uri: URI.parse("file:///my/file.bat"),
      langId: "bat"
    };
    let value = score(
      {
        language: "bat",
        notebookType: "xxx"
      },
      obj.uri,
      obj.langId,
      true,
      void 0,
      void 0
    );
    assert.strictEqual(value, 0);
    value = score(
      {
        language: "bat",
        notebookType: "*"
      },
      obj.uri,
      obj.langId,
      true,
      void 0,
      void 0
    );
    assert.strictEqual(value, 0);
  });
});
