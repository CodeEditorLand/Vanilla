import assert from "assert";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Snippet, SnippetSource } from "../../browser/snippetsFile.js";
suite("SnippetRewrite", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function assertRewrite(input, expected) {
    const actual = new Snippet(
      false,
      ["foo"],
      "foo",
      "foo",
      "foo",
      input,
      "foo",
      SnippetSource.User,
      generateUuid()
    );
    if (typeof expected === "boolean") {
      assert.strictEqual(actual.codeSnippet, input);
    } else {
      assert.strictEqual(actual.codeSnippet, expected);
    }
  }
  test("bogous variable rewrite", () => {
    assertRewrite("foo", false);
    assertRewrite("hello $1 world$0", false);
    assertRewrite("$foo and $foo", "${1:foo} and ${1:foo}");
    assertRewrite(
      "$1 and $SELECTION and $foo",
      "$1 and ${SELECTION} and ${2:foo}"
    );
    assertRewrite(
      [
        "for (var ${index} = 0; ${index} < ${array}.length; ${index}++) {",
        "	var ${element} = ${array}[${index}];",
        "	$0",
        "}"
      ].join("\n"),
      [
        "for (var ${1:index} = 0; ${1:index} < ${2:array}.length; ${1:index}++) {",
        "	var ${3:element} = ${2:array}[${1:index}];",
        "	$0",
        "\\}"
      ].join("\n")
    );
  });
  test("Snippet choices: unable to escape comma and pipe, #31521", () => {
    assertRewrite("console.log(${1|not\\, not, five, 5, 1   23|});", false);
  });
  test("lazy bogous variable rewrite", () => {
    const snippet = new Snippet(
      false,
      ["fooLang"],
      "foo",
      "prefix",
      "desc",
      "This is ${bogous} because it is a ${var}",
      "source",
      SnippetSource.Extension,
      generateUuid()
    );
    assert.strictEqual(
      snippet.body,
      "This is ${bogous} because it is a ${var}"
    );
    assert.strictEqual(
      snippet.codeSnippet,
      "This is ${1:bogous} because it is a ${2:var}"
    );
    assert.strictEqual(snippet.isBogous, true);
  });
});
