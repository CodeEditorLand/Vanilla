var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { assertSnapshot } from "../../../../../base/test/common/snapshot.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IChatMarkdownContent } from "../../common/chatService.js";
import { annotateSpecialMarkdownContent, extractVulnerabilitiesFromText } from "../../common/annotations.js";
function content(str) {
  return { kind: "markdownContent", content: new MarkdownString(str) };
}
__name(content, "content");
suite("Annotations", function() {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("extractVulnerabilitiesFromText", () => {
    test("single line", async () => {
      const before = "some code ";
      const vulnContent = "content with vuln";
      const after = " after";
      const annotatedResult = annotateSpecialMarkdownContent([content(before), { kind: "markdownVuln", content: new MarkdownString(vulnContent), vulnerabilities: [{ title: "title", description: "vuln" }] }, content(after)]);
      await assertSnapshot(annotatedResult);
      const markdown = annotatedResult[0];
      const result = extractVulnerabilitiesFromText(markdown.content.value);
      await assertSnapshot(result);
    });
    test("multiline", async () => {
      const before = "some code\nover\nmultiple lines ";
      const vulnContent = "content with vuln\nand\nnewlines";
      const after = "more code\nwith newline";
      const annotatedResult = annotateSpecialMarkdownContent([content(before), { kind: "markdownVuln", content: new MarkdownString(vulnContent), vulnerabilities: [{ title: "title", description: "vuln" }] }, content(after)]);
      await assertSnapshot(annotatedResult);
      const markdown = annotatedResult[0];
      const result = extractVulnerabilitiesFromText(markdown.content.value);
      await assertSnapshot(result);
    });
    test("multiple vulns", async () => {
      const before = "some code\nover\nmultiple lines ";
      const vulnContent = "content with vuln\nand\nnewlines";
      const after = "more code\nwith newline";
      const annotatedResult = annotateSpecialMarkdownContent([
        content(before),
        { kind: "markdownVuln", content: new MarkdownString(vulnContent), vulnerabilities: [{ title: "title", description: "vuln" }] },
        content(after),
        { kind: "markdownVuln", content: new MarkdownString(vulnContent), vulnerabilities: [{ title: "title", description: "vuln" }] }
      ]);
      await assertSnapshot(annotatedResult);
      const markdown = annotatedResult[0];
      const result = extractVulnerabilitiesFromText(markdown.content.value);
      await assertSnapshot(result);
    });
  });
});
//# sourceMappingURL=annotations.test.js.map
