import { equals } from "../../../../../base/common/arrays.js";
import { splitLines } from "../../../../../base/common/strings.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { SingleTextEdit, TextEdit } from "../../../../common/core/textEdit.js";
class GhostText {
  constructor(lineNumber, parts) {
    this.lineNumber = lineNumber;
    this.parts = parts;
  }
  equals(other) {
    return this.lineNumber === other.lineNumber && this.parts.length === other.parts.length && this.parts.every((part, index) => part.equals(other.parts[index]));
  }
  /**
   * Only used for testing/debugging.
   */
  render(documentText, debug = false) {
    return new TextEdit([
      ...this.parts.map(
        (p) => new SingleTextEdit(
          Range.fromPositions(
            new Position(this.lineNumber, p.column)
          ),
          debug ? `[${p.lines.join("\n")}]` : p.lines.join("\n")
        )
      )
    ]).applyToString(documentText);
  }
  renderForScreenReader(lineText) {
    if (this.parts.length === 0) {
      return "";
    }
    const lastPart = this.parts[this.parts.length - 1];
    const cappedLineText = lineText.substr(0, lastPart.column - 1);
    const text = new TextEdit([
      ...this.parts.map(
        (p) => new SingleTextEdit(
          Range.fromPositions(new Position(1, p.column)),
          p.lines.join("\n")
        )
      )
    ]).applyToString(cappedLineText);
    return text.substring(this.parts[0].column - 1);
  }
  isEmpty() {
    return this.parts.every((p) => p.lines.length === 0);
  }
  get lineCount() {
    return 1 + this.parts.reduce((r, p) => r + p.lines.length - 1, 0);
  }
}
class GhostTextPart {
  constructor(column, text, preview) {
    this.column = column;
    this.text = text;
    this.preview = preview;
  }
  lines = splitLines(this.text);
  equals(other) {
    return this.column === other.column && this.lines.length === other.lines.length && this.lines.every((line, index) => line === other.lines[index]);
  }
}
class GhostTextReplacement {
  constructor(lineNumber, columnRange, text, additionalReservedLineCount = 0) {
    this.lineNumber = lineNumber;
    this.columnRange = columnRange;
    this.text = text;
    this.additionalReservedLineCount = additionalReservedLineCount;
  }
  parts = [
    new GhostTextPart(
      this.columnRange.endColumnExclusive,
      this.text,
      false
    )
  ];
  newLines = splitLines(this.text);
  renderForScreenReader(_lineText) {
    return this.newLines.join("\n");
  }
  render(documentText, debug = false) {
    const replaceRange = this.columnRange.toRange(this.lineNumber);
    if (debug) {
      return new TextEdit([
        new SingleTextEdit(
          Range.fromPositions(replaceRange.getStartPosition()),
          "("
        ),
        new SingleTextEdit(
          Range.fromPositions(replaceRange.getEndPosition()),
          `)[${this.newLines.join("\n")}]`
        )
      ]).applyToString(documentText);
    } else {
      return new TextEdit([
        new SingleTextEdit(replaceRange, this.newLines.join("\n"))
      ]).applyToString(documentText);
    }
  }
  get lineCount() {
    return this.newLines.length;
  }
  isEmpty() {
    return this.parts.every((p) => p.lines.length === 0);
  }
  equals(other) {
    return this.lineNumber === other.lineNumber && this.columnRange.equals(other.columnRange) && this.newLines.length === other.newLines.length && this.newLines.every(
      (line, index) => line === other.newLines[index]
    ) && this.additionalReservedLineCount === other.additionalReservedLineCount;
  }
}
function ghostTextsOrReplacementsEqual(a, b) {
  return equals(a, b, ghostTextOrReplacementEquals);
}
function ghostTextOrReplacementEquals(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a instanceof GhostText && b instanceof GhostText) {
    return a.equals(b);
  }
  if (a instanceof GhostTextReplacement && b instanceof GhostTextReplacement) {
    return a.equals(b);
  }
  return false;
}
export {
  GhostText,
  GhostTextPart,
  GhostTextReplacement,
  ghostTextOrReplacementEquals,
  ghostTextsOrReplacementsEqual
};
