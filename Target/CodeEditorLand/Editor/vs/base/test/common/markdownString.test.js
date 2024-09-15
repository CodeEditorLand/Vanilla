var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { MarkdownString } from "../../common/htmlContent.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("MarkdownString", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Escape leading whitespace", function() {
    const mds = new MarkdownString();
    mds.appendText("Hello\n    Not a code block");
    assert.strictEqual(mds.value, "Hello\n\n&nbsp;&nbsp;&nbsp;&nbsp;Not&nbsp;a&nbsp;code&nbsp;block");
  });
  test("MarkdownString.appendText doesn't escape quote #109040", function() {
    const mds = new MarkdownString();
    mds.appendText("> Text\n>More");
    assert.strictEqual(mds.value, "\\>&nbsp;Text\n\n\\>More");
  });
  test("appendText", () => {
    const mds = new MarkdownString();
    mds.appendText("# foo\n*bar*");
    assert.strictEqual(mds.value, "\\#&nbsp;foo\n\n\\*bar\\*");
  });
  test("appendLink", function() {
    function assertLink(target, label, title, expected) {
      const mds = new MarkdownString();
      mds.appendLink(target, label, title);
      assert.strictEqual(mds.value, expected);
    }
    __name(assertLink, "assertLink");
    assertLink(
      "https://example.com\\()![](file:///Users/jrieken/Code/_samples/devfest/foo/img.png)",
      "hello",
      void 0,
      "[hello](https://example.com\\(\\)![](file:///Users/jrieken/Code/_samples/devfest/foo/img.png\\))"
    );
    assertLink(
      "https://example.com",
      "hello",
      "title",
      '[hello](https://example.com "title")'
    );
    assertLink(
      "foo)",
      "hello]",
      void 0,
      "[hello\\]](foo\\))"
    );
    assertLink(
      "foo\\)",
      "hello]",
      void 0,
      "[hello\\]](foo\\))"
    );
    assertLink(
      "fo)o",
      "hell]o",
      void 0,
      "[hell\\]o](fo\\)o)"
    );
    assertLink(
      "foo)",
      "hello]",
      'title"',
      '[hello\\]](foo\\) "title\\"")'
    );
  });
  suite("appendCodeBlock", () => {
    function assertCodeBlock(lang, code, result) {
      const mds = new MarkdownString();
      mds.appendCodeblock(lang, code);
      assert.strictEqual(mds.value, result);
    }
    __name(assertCodeBlock, "assertCodeBlock");
    test("common cases", () => {
      assertCodeBlock("ts", "const a = 1;", `
${[
        "```ts",
        "const a = 1;",
        "```"
      ].join("\n")}
`);
      assertCodeBlock("ts", "const a = `1`;", `
${[
        "```ts",
        "const a = `1`;",
        "```"
      ].join("\n")}
`);
    });
    test("escape fence", () => {
      assertCodeBlock("md", "```\n```", `
${[
        "````md",
        "```\n```",
        "````"
      ].join("\n")}
`);
      assertCodeBlock("md", "\n\n```\n```", `
${[
        "````md",
        "\n\n```\n```",
        "````"
      ].join("\n")}
`);
      assertCodeBlock("md", "```\n```\n````\n````", `
${[
        "`````md",
        "```\n```\n````\n````",
        "`````"
      ].join("\n")}
`);
    });
  });
  suite("ThemeIcons", () => {
    suite("Support On", () => {
      test("appendText", () => {
        const mds = new MarkdownString(void 0, { supportThemeIcons: true });
        mds.appendText("$(zap) $(not a theme icon) $(add)");
        assert.strictEqual(mds.value, "\\\\$\\(zap\\)&nbsp;$\\(not&nbsp;a&nbsp;theme&nbsp;icon\\)&nbsp;\\\\$\\(add\\)");
      });
      test("appendMarkdown", () => {
        const mds = new MarkdownString(void 0, { supportThemeIcons: true });
        mds.appendMarkdown("$(zap) $(not a theme icon) $(add)");
        assert.strictEqual(mds.value, "$(zap) $(not a theme icon) $(add)");
      });
      test("appendMarkdown with escaped icon", () => {
        const mds = new MarkdownString(void 0, { supportThemeIcons: true });
        mds.appendMarkdown("\\$(zap) $(not a theme icon) $(add)");
        assert.strictEqual(mds.value, "\\$(zap) $(not a theme icon) $(add)");
      });
    });
    suite("Support Off", () => {
      test("appendText", () => {
        const mds = new MarkdownString(void 0, { supportThemeIcons: false });
        mds.appendText("$(zap) $(not a theme icon) $(add)");
        assert.strictEqual(mds.value, "$\\(zap\\)&nbsp;$\\(not&nbsp;a&nbsp;theme&nbsp;icon\\)&nbsp;$\\(add\\)");
      });
      test("appendMarkdown", () => {
        const mds = new MarkdownString(void 0, { supportThemeIcons: false });
        mds.appendMarkdown("$(zap) $(not a theme icon) $(add)");
        assert.strictEqual(mds.value, "$(zap) $(not a theme icon) $(add)");
      });
      test("appendMarkdown with escaped icon", () => {
        const mds = new MarkdownString(void 0, { supportThemeIcons: true });
        mds.appendMarkdown("\\$(zap) $(not a theme icon) $(add)");
        assert.strictEqual(mds.value, "\\$(zap) $(not a theme icon) $(add)");
      });
    });
  });
});
//# sourceMappingURL=markdownString.test.js.map
