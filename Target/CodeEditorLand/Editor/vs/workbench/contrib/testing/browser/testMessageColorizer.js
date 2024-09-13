var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { renderStringAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { GraphemeIterator, forAnsiStringParts, removeAnsiEscapeCodes } from "../../../../base/common/strings.js";
import "./media/testMessageColorizer.css";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
const colorAttrRe = /^\x1b\[([0-9]+)m$/;
var Classes = /* @__PURE__ */ ((Classes2) => {
  Classes2["Prefix"] = "tstm-ansidec-";
  Classes2["ForegroundPrefix"] = "tstm-ansidec-fg";
  Classes2["BackgroundPrefix"] = "tstm-ansidec-bg";
  Classes2["Bold"] = "tstm-ansidec-1";
  Classes2["Faint"] = "tstm-ansidec-2";
  Classes2["Italic"] = "tstm-ansidec-3";
  Classes2["Underline"] = "tstm-ansidec-4";
  return Classes2;
})(Classes || {});
const renderTestMessageAsText = /* @__PURE__ */ __name((tm) => typeof tm === "string" ? removeAnsiEscapeCodes(tm) : renderStringAsPlaintext(tm), "renderTestMessageAsText");
const colorizeTestMessageInEditor = /* @__PURE__ */ __name((message, editor) => {
  const decos = [];
  editor.changeDecorations((changeAccessor) => {
    let start = new Position(1, 1);
    let cls = [];
    for (const part of forAnsiStringParts(message)) {
      if (part.isCode) {
        const colorAttr = colorAttrRe.exec(part.str)?.[1];
        if (!colorAttr) {
          continue;
        }
        const n = Number(colorAttr);
        if (n === 0) {
          cls.length = 0;
        } else if (n === 22) {
          cls = cls.filter((c) => c !== "tstm-ansidec-1" /* Bold */ && c !== "tstm-ansidec-3" /* Italic */);
        } else if (n === 23) {
          cls = cls.filter((c) => c !== "tstm-ansidec-3" /* Italic */);
        } else if (n === 24) {
          cls = cls.filter((c) => c !== "tstm-ansidec-4" /* Underline */);
        } else if (n >= 30 && n <= 39 || n >= 90 && n <= 99) {
          cls = cls.filter((c) => !c.startsWith("tstm-ansidec-fg" /* ForegroundPrefix */));
          cls.push("tstm-ansidec-fg" /* ForegroundPrefix */ + colorAttr);
        } else if (n >= 40 && n <= 49 || n >= 100 && n <= 109) {
          cls = cls.filter((c) => !c.startsWith("tstm-ansidec-bg" /* BackgroundPrefix */));
          cls.push("tstm-ansidec-bg" /* BackgroundPrefix */ + colorAttr);
        } else {
          cls.push("tstm-ansidec-" /* Prefix */ + colorAttr);
        }
      } else {
        let line = start.lineNumber;
        let col = start.column;
        const graphemes = new GraphemeIterator(part.str);
        for (let i = 0; !graphemes.eol(); i += graphemes.nextGraphemeLength()) {
          if (part.str[i] === "\n") {
            line++;
            col = 1;
          } else {
            col++;
          }
        }
        const end = new Position(line, col);
        if (cls.length) {
          decos.push(changeAccessor.addDecoration(Range.fromPositions(start, end), {
            inlineClassName: cls.join(" "),
            description: "test-message-colorized"
          }));
        }
        start = end;
      }
    }
  });
  return toDisposable(() => editor.removeDecorations(decos));
}, "colorizeTestMessageInEditor");
export {
  colorizeTestMessageInEditor,
  renderTestMessageAsText
};
//# sourceMappingURL=testMessageColorizer.js.map
