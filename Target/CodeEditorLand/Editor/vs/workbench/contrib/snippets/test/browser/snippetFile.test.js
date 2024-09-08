import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { SnippetParser } from "../../../../../editor/contrib/snippet/browser/snippetParser.js";
import {
  Snippet,
  SnippetFile,
  SnippetSource
} from "../../browser/snippetsFile.js";
suite("Snippets", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  class TestSnippetFile extends SnippetFile {
    constructor(filepath, snippets) {
      super(
        SnippetSource.Extension,
        filepath,
        void 0,
        void 0,
        void 0,
        void 0
      );
      this.data.push(...snippets);
    }
  }
  test("SnippetFile#select", () => {
    let file = new TestSnippetFile(
      URI.file("somepath/foo.code-snippets"),
      []
    );
    let bucket = [];
    file.select("", bucket);
    assert.strictEqual(bucket.length, 0);
    file = new TestSnippetFile(URI.file("somepath/foo.code-snippets"), [
      new Snippet(
        false,
        ["foo"],
        "FooSnippet1",
        "foo",
        "",
        "snippet",
        "test",
        SnippetSource.User,
        generateUuid()
      ),
      new Snippet(
        false,
        ["foo"],
        "FooSnippet2",
        "foo",
        "",
        "snippet",
        "test",
        SnippetSource.User,
        generateUuid()
      ),
      new Snippet(
        false,
        ["bar"],
        "BarSnippet1",
        "foo",
        "",
        "snippet",
        "test",
        SnippetSource.User,
        generateUuid()
      ),
      new Snippet(
        false,
        ["bar.comment"],
        "BarSnippet2",
        "foo",
        "",
        "snippet",
        "test",
        SnippetSource.User,
        generateUuid()
      ),
      new Snippet(
        false,
        ["bar.strings"],
        "BarSnippet2",
        "foo",
        "",
        "snippet",
        "test",
        SnippetSource.User,
        generateUuid()
      ),
      new Snippet(
        false,
        ["bazz", "bazz"],
        "BazzSnippet1",
        "foo",
        "",
        "snippet",
        "test",
        SnippetSource.User,
        generateUuid()
      )
    ]);
    bucket = [];
    file.select("foo", bucket);
    assert.strictEqual(bucket.length, 2);
    bucket = [];
    file.select("fo", bucket);
    assert.strictEqual(bucket.length, 0);
    bucket = [];
    file.select("bar", bucket);
    assert.strictEqual(bucket.length, 1);
    bucket = [];
    file.select("bar.comment", bucket);
    assert.strictEqual(bucket.length, 2);
    bucket = [];
    file.select("bazz", bucket);
    assert.strictEqual(bucket.length, 1);
  });
  test("SnippetFile#select - any scope", () => {
    const file = new TestSnippetFile(
      URI.file("somepath/foo.code-snippets"),
      [
        new Snippet(
          false,
          [],
          "AnySnippet1",
          "foo",
          "",
          "snippet",
          "test",
          SnippetSource.User,
          generateUuid()
        ),
        new Snippet(
          false,
          ["foo"],
          "FooSnippet1",
          "foo",
          "",
          "snippet",
          "test",
          SnippetSource.User,
          generateUuid()
        )
      ]
    );
    const bucket = [];
    file.select("foo", bucket);
    assert.strictEqual(bucket.length, 2);
  });
  test("Snippet#needsClipboard", () => {
    function assertNeedsClipboard(body, expected) {
      const snippet = new Snippet(
        false,
        ["foo"],
        "FooSnippet1",
        "foo",
        "",
        body,
        "test",
        SnippetSource.User,
        generateUuid()
      );
      assert.strictEqual(snippet.needsClipboard, expected);
      assert.strictEqual(
        SnippetParser.guessNeedsClipboard(body),
        expected
      );
    }
    assertNeedsClipboard("foo$CLIPBOARD", true);
    assertNeedsClipboard("${CLIPBOARD}", true);
    assertNeedsClipboard("foo${CLIPBOARD}bar", true);
    assertNeedsClipboard("foo$clipboard", false);
    assertNeedsClipboard("foo${clipboard}", false);
    assertNeedsClipboard("baba", false);
  });
  test("Snippet#isTrivial", () => {
    function assertIsTrivial(body, expected) {
      const snippet = new Snippet(
        false,
        ["foo"],
        "FooSnippet1",
        "foo",
        "",
        body,
        "test",
        SnippetSource.User,
        generateUuid()
      );
      assert.strictEqual(snippet.isTrivial, expected);
    }
    assertIsTrivial("foo", true);
    assertIsTrivial("foo$0", true);
    assertIsTrivial("foo$0bar", false);
    assertIsTrivial("foo$1", false);
    assertIsTrivial("foo$1$0", false);
    assertIsTrivial("${1:foo}", false);
  });
});
