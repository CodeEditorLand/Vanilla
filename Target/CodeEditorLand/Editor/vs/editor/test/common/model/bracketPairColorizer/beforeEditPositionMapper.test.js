import assert from "assert";
import { splitLines } from "../../../../../base/common/strings.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Range } from "../../../../common/core/range.js";
import {
  BeforeEditPositionMapper,
  TextEditInfo
} from "../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper.js";
import {
  lengthOfString,
  lengthToObj,
  lengthToPosition,
  toLength
} from "../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/length.js";
suite("Bracket Pair Colorizer - BeforeEditPositionMapper", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Single-Line 1", () => {
    assert.deepStrictEqual(
      compute(
        ["0123456789"],
        [new TextEdit(toLength(0, 4), toLength(0, 7), "xy")]
      ),
      [
        "0  1  2  3  x  y  7  8  9  ",
        // The line
        "0  0  0  0  0  0  0  0  0  0  ",
        // the old line numbers
        "0  1  2  3  4  5  7  8  9  10 ",
        // the old columns
        "0  0  0  0  0  0  \u221E  \u221E  \u221E  \u221E  ",
        // line count until next change
        "4  3  2  1  0  0  \u221E  \u221E  \u221E  \u221E  "
        // column count until next change
      ]
    );
  });
  test("Single-Line 2", () => {
    assert.deepStrictEqual(
      compute(
        ["0123456789"],
        [
          new TextEdit(toLength(0, 2), toLength(0, 4), "xxxx"),
          new TextEdit(toLength(0, 6), toLength(0, 6), "yy")
        ]
      ),
      [
        "0  1  x  x  x  x  4  5  y  y  6  7  8  9  ",
        "0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  ",
        "0  1  2  3  4  5  4  5  6  7  6  7  8  9  10 ",
        "0  0  0  0  0  0  0  0  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        "2  1  0  0  0  0  2  1  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  "
      ]
    );
  });
  test("Multi-Line Replace 1", () => {
    assert.deepStrictEqual(
      compute(
        ["\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089", "0123456789", "\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079"],
        [new TextEdit(toLength(0, 3), toLength(1, 3), "xy")]
      ),
      [
        "\u2080  \u2081  \u2082  x  y  3  4  5  6  7  8  9  ",
        "0  0  0  0  0  1  1  1  1  1  1  1  1  ",
        "0  1  2  3  4  3  4  5  6  7  8  9  10 ",
        "0  0  0  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        "3  2  1  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        // ------------------
        "\u2070  \xB9  \xB2  \xB3  \u2074  \u2075  \u2076  \u2077  \u2078  \u2079  ",
        "2  2  2  2  2  2  2  2  2  2  2  ",
        "0  1  2  3  4  5  6  7  8  9  10 ",
        "\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        "\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  "
      ]
    );
  });
  test("Multi-Line Replace 2", () => {
    assert.deepStrictEqual(
      compute(
        ["\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089", "012345678", "\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079"],
        [
          new TextEdit(toLength(0, 3), toLength(1, 0), "ab"),
          new TextEdit(toLength(1, 5), toLength(1, 7), "c")
        ]
      ),
      [
        "\u2080  \u2081  \u2082  a  b  0  1  2  3  4  c  7  8  ",
        "0  0  0  0  0  1  1  1  1  1  1  1  1  1  ",
        "0  1  2  3  4  0  1  2  3  4  5  7  8  9  ",
        "0  0  0  0  0  0  0  0  0  0  0  \u221E  \u221E  \u221E  ",
        "3  2  1  0  0  5  4  3  2  1  0  \u221E  \u221E  \u221E  ",
        // ------------------
        "\u2070  \xB9  \xB2  \xB3  \u2074  \u2075  \u2076  \u2077  \u2078  \u2079  ",
        "2  2  2  2  2  2  2  2  2  2  2  ",
        "0  1  2  3  4  5  6  7  8  9  10 ",
        "\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        "\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  "
      ]
    );
  });
  test("Multi-Line Replace 3", () => {
    assert.deepStrictEqual(
      compute(
        ["\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089", "012345678", "\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079"],
        [
          new TextEdit(toLength(0, 3), toLength(1, 0), "ab"),
          new TextEdit(toLength(1, 5), toLength(1, 7), "c"),
          new TextEdit(toLength(1, 8), toLength(2, 4), "d")
        ]
      ),
      [
        "\u2080  \u2081  \u2082  a  b  0  1  2  3  4  c  7  d  \u2074  \u2075  \u2076  \u2077  \u2078  \u2079  ",
        "0  0  0  0  0  1  1  1  1  1  1  1  1  2  2  2  2  2  2  2  ",
        "0  1  2  3  4  0  1  2  3  4  5  7  8  4  5  6  7  8  9  10 ",
        "0  0  0  0  0  0  0  0  0  0  0  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        "3  2  1  0  0  5  4  3  2  1  0  1  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  "
      ]
    );
  });
  test("Multi-Line Insert 1", () => {
    assert.deepStrictEqual(
      compute(
        ["012345678"],
        [new TextEdit(toLength(0, 3), toLength(0, 5), "a\nb")]
      ),
      [
        "0  1  2  a  ",
        "0  0  0  0  0  ",
        "0  1  2  3  4  ",
        "0  0  0  0  0  ",
        "3  2  1  0  0  ",
        // ------------------
        "b  5  6  7  8  ",
        "1  0  0  0  0  0  ",
        "0  5  6  7  8  9  ",
        "0  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        "0  \u221E  \u221E  \u221E  \u221E  \u221E  "
      ]
    );
  });
  test("Multi-Line Insert 2", () => {
    assert.deepStrictEqual(
      compute(
        ["012345678"],
        [
          new TextEdit(toLength(0, 3), toLength(0, 5), "a\nb"),
          new TextEdit(toLength(0, 7), toLength(0, 8), "x\ny")
        ]
      ),
      [
        "0  1  2  a  ",
        "0  0  0  0  0  ",
        "0  1  2  3  4  ",
        "0  0  0  0  0  ",
        "3  2  1  0  0  ",
        // ------------------
        "b  5  6  x  ",
        "1  0  0  0  0  ",
        "0  5  6  7  8  ",
        "0  0  0  0  0  ",
        "0  2  1  0  0  ",
        // ------------------
        "y  8  ",
        "1  0  0  ",
        "0  8  9  ",
        "0  \u221E  \u221E  ",
        "0  \u221E  \u221E  "
      ]
    );
  });
  test("Multi-Line Replace/Insert 1", () => {
    assert.deepStrictEqual(
      compute(
        ["\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089", "012345678", "\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079"],
        [new TextEdit(toLength(0, 3), toLength(1, 1), "aaa\nbbb")]
      ),
      [
        "\u2080  \u2081  \u2082  a  a  a  ",
        "0  0  0  0  0  0  0  ",
        "0  1  2  3  4  5  6  ",
        "0  0  0  0  0  0  0  ",
        "3  2  1  0  0  0  0  ",
        // ------------------
        "b  b  b  1  2  3  4  5  6  7  8  ",
        "1  1  1  1  1  1  1  1  1  1  1  1  ",
        "0  1  2  1  2  3  4  5  6  7  8  9  ",
        "0  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        "0  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        // ------------------
        "\u2070  \xB9  \xB2  \xB3  \u2074  \u2075  \u2076  \u2077  \u2078  \u2079  ",
        "2  2  2  2  2  2  2  2  2  2  2  ",
        "0  1  2  3  4  5  6  7  8  9  10 ",
        "\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        "\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  "
      ]
    );
  });
  test("Multi-Line Replace/Insert 2", () => {
    assert.deepStrictEqual(
      compute(
        ["\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089", "012345678", "\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079"],
        [
          new TextEdit(toLength(0, 3), toLength(1, 1), "aaa\nbbb"),
          new TextEdit(toLength(1, 5), toLength(1, 5), "x\ny"),
          new TextEdit(toLength(1, 7), toLength(2, 4), "k\nl")
        ]
      ),
      [
        "\u2080  \u2081  \u2082  a  a  a  ",
        "0  0  0  0  0  0  0  ",
        "0  1  2  3  4  5  6  ",
        "0  0  0  0  0  0  0  ",
        "3  2  1  0  0  0  0  ",
        // ------------------
        "b  b  b  1  2  3  4  x  ",
        "1  1  1  1  1  1  1  1  1  ",
        "0  1  2  1  2  3  4  5  6  ",
        "0  0  0  0  0  0  0  0  0  ",
        "0  0  0  4  3  2  1  0  0  ",
        // ------------------
        "y  5  6  k  ",
        "2  1  1  1  1  ",
        "0  5  6  7  8  ",
        "0  0  0  0  0  ",
        "0  2  1  0  0  ",
        // ------------------
        "l  \u2074  \u2075  \u2076  \u2077  \u2078  \u2079  ",
        "2  2  2  2  2  2  2  2  ",
        "0  4  5  6  7  8  9  10 ",
        "0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ",
        "0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  "
      ]
    );
  });
});
function compute(inputArr, edits) {
  const newLines = splitLines(
    applyLineColumnEdits(
      inputArr.join("\n"),
      edits.map((e) => ({
        text: e.newText,
        range: Range.fromPositions(
          lengthToPosition(e.startOffset),
          lengthToPosition(e.endOffset)
        )
      }))
    )
  );
  const mapper = new BeforeEditPositionMapper(edits);
  const result = new Array();
  let lineIdx = 0;
  for (const line of newLines) {
    let lineLine = "";
    let colLine = "";
    let lineStr = "";
    let colDist = "";
    let lineDist = "";
    for (let colIdx = 0; colIdx <= line.length; colIdx++) {
      const before = mapper.getOffsetBeforeChange(
        toLength(lineIdx, colIdx)
      );
      const beforeObj = lengthToObj(before);
      if (colIdx < line.length) {
        lineStr += rightPad(line[colIdx], 3);
      }
      lineLine += rightPad("" + beforeObj.lineCount, 3);
      colLine += rightPad("" + beforeObj.columnCount, 3);
      const distLen = mapper.getDistanceToNextChange(
        toLength(lineIdx, colIdx)
      );
      if (distLen === null) {
        lineDist += "\u221E  ";
        colDist += "\u221E  ";
      } else {
        const dist = lengthToObj(distLen);
        lineDist += rightPad("" + dist.lineCount, 3);
        colDist += rightPad("" + dist.columnCount, 3);
      }
    }
    result.push(lineStr);
    result.push(lineLine);
    result.push(colLine);
    result.push(lineDist);
    result.push(colDist);
    lineIdx++;
  }
  return result;
}
class TextEdit extends TextEditInfo {
  constructor(startOffset, endOffset, newText) {
    super(startOffset, endOffset, lengthOfString(newText));
    this.newText = newText;
  }
}
class PositionOffsetTransformer {
  lineStartOffsetByLineIdx;
  constructor(text) {
    this.lineStartOffsetByLineIdx = [];
    this.lineStartOffsetByLineIdx.push(0);
    for (let i = 0; i < text.length; i++) {
      if (text.charAt(i) === "\n") {
        this.lineStartOffsetByLineIdx.push(i + 1);
      }
    }
  }
  getOffset(position) {
    return this.lineStartOffsetByLineIdx[position.lineNumber - 1] + position.column - 1;
  }
}
function applyLineColumnEdits(text, edits) {
  const transformer = new PositionOffsetTransformer(text);
  const offsetEdits = edits.map((e) => {
    const range = Range.lift(e.range);
    return {
      startOffset: transformer.getOffset(range.getStartPosition()),
      endOffset: transformer.getOffset(range.getEndPosition()),
      text: e.text
    };
  });
  offsetEdits.sort((a, b) => b.startOffset - a.startOffset);
  for (const edit of offsetEdits) {
    text = text.substring(0, edit.startOffset) + edit.text + text.substring(edit.endOffset);
  }
  return text;
}
function rightPad(str, len) {
  while (str.length < len) {
    str += " ";
  }
  return str;
}
export {
  TextEdit
};
