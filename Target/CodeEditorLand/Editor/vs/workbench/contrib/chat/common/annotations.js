import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import {
  appendMarkdownString,
  canMergeMarkdownStrings
} from "./chatModel.js";
const contentRefUrl = "http://_vscodecontentref_";
function annotateSpecialMarkdownContent(response) {
  const result = [];
  for (const item of response) {
    const previousItem = result[result.length - 1];
    if (item.kind === "inlineReference") {
      const location = "uri" in item.inlineReference ? item.inlineReference : { uri: item.inlineReference };
      const printUri = URI.parse(contentRefUrl).with({
        fragment: JSON.stringify(location)
      });
      const markdownText = `[${item.name || basename(location.uri)}](${printUri.toString()})`;
      if (previousItem?.kind === "markdownContent") {
        const merged = appendMarkdownString(
          previousItem.content,
          new MarkdownString(markdownText)
        );
        result[result.length - 1] = {
          content: merged,
          kind: "markdownContent"
        };
      } else {
        result.push({
          content: new MarkdownString(markdownText),
          kind: "markdownContent"
        });
      }
    } else if (item.kind === "markdownContent" && previousItem?.kind === "markdownContent" && canMergeMarkdownStrings(previousItem.content, item.content)) {
      const merged = appendMarkdownString(
        previousItem.content,
        item.content
      );
      result[result.length - 1] = {
        content: merged,
        kind: "markdownContent"
      };
    } else if (item.kind === "markdownVuln") {
      const vulnText = encodeURIComponent(
        JSON.stringify(item.vulnerabilities)
      );
      const markdownText = `<vscode_annotation details='${vulnText}'>${item.content.value}</vscode_annotation>`;
      if (previousItem?.kind === "markdownContent") {
        const merged = appendMarkdownString(
          previousItem.content,
          new MarkdownString(markdownText)
        );
        result[result.length - 1] = {
          content: merged,
          kind: "markdownContent"
        };
      } else {
        result.push({
          content: new MarkdownString(markdownText),
          kind: "markdownContent"
        });
      }
    } else {
      result.push(item);
    }
  }
  return result;
}
function annotateVulnerabilitiesInText(response) {
  const result = [];
  for (const item of response) {
    const previousItem = result[result.length - 1];
    if (item.kind === "markdownContent") {
      if (previousItem?.kind === "markdownContent") {
        result[result.length - 1] = {
          content: new MarkdownString(
            previousItem.content.value + item.content.value,
            { isTrusted: previousItem.content.isTrusted }
          ),
          kind: "markdownContent"
        };
      } else {
        result.push(item);
      }
    } else if (item.kind === "markdownVuln") {
      const vulnText = encodeURIComponent(
        JSON.stringify(item.vulnerabilities)
      );
      const markdownText = `<vscode_annotation details='${vulnText}'>${item.content.value}</vscode_annotation>`;
      if (previousItem?.kind === "markdownContent") {
        result[result.length - 1] = {
          content: new MarkdownString(
            previousItem.content.value + markdownText,
            { isTrusted: previousItem.content.isTrusted }
          ),
          kind: "markdownContent"
        };
      } else {
        result.push({
          content: new MarkdownString(markdownText),
          kind: "markdownContent"
        });
      }
    }
  }
  return result;
}
function extractVulnerabilitiesFromText(text) {
  const vulnerabilities = [];
  let newText = text;
  let match;
  while ((match = /<vscode_annotation details='(.*?)'>(.*?)<\/vscode_annotation>/ms.exec(
    newText
  )) !== null) {
    const [full, details, content] = match;
    const start = match.index;
    const textBefore = newText.substring(0, start);
    const linesBefore = textBefore.split("\n").length - 1;
    const linesInside = content.split("\n").length - 1;
    const previousNewlineIdx = textBefore.lastIndexOf("\n");
    const startColumn = start - (previousNewlineIdx + 1) + 1;
    const endPreviousNewlineIdx = (textBefore + content).lastIndexOf("\n");
    const endColumn = start + content.length - (endPreviousNewlineIdx + 1) + 1;
    try {
      const vulnDetails = JSON.parse(
        decodeURIComponent(details)
      );
      vulnDetails.forEach(
        ({ title, description }) => vulnerabilities.push({
          title,
          description,
          range: {
            startLineNumber: linesBefore + 1,
            startColumn,
            endLineNumber: linesBefore + linesInside + 1,
            endColumn
          }
        })
      );
    } catch (err) {
    }
    newText = newText.substring(0, start) + content + newText.substring(start + full.length);
  }
  return { newText, vulnerabilities };
}
export {
  annotateSpecialMarkdownContent,
  annotateVulnerabilitiesInText,
  contentRefUrl,
  extractVulnerabilitiesFromText
};
