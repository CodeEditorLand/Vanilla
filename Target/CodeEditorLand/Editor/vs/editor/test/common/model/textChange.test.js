import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  TextChange,
  compressConsecutiveTextChanges
} from "../../../common/core/textChange.js";
const GENERATE_TESTS = false;
suite("TextChangeCompressor", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function getResultingContent(initialContent, edits) {
    let content = initialContent;
    for (let i = edits.length - 1; i >= 0; i--) {
      content = content.substring(0, edits[i].offset) + edits[i].text + content.substring(edits[i].offset + edits[i].length);
    }
    return content;
  }
  function getTextChanges(initialContent, edits) {
    let content = initialContent;
    const changes = new Array(edits.length);
    let deltaOffset = 0;
    for (let i = 0; i < edits.length; i++) {
      const edit = edits[i];
      const position = edit.offset + deltaOffset;
      const length = edit.length;
      const text = edit.text;
      const oldText = content.substr(position, length);
      content = content.substr(0, position) + text + content.substr(position + length);
      changes[i] = new TextChange(edit.offset, oldText, position, text);
      deltaOffset += text.length - length;
    }
    return changes;
  }
  function assertCompression(initialText, edit1, edit2) {
    const tmpText = getResultingContent(initialText, edit1);
    const chg1 = getTextChanges(initialText, edit1);
    const finalText = getResultingContent(tmpText, edit2);
    const chg2 = getTextChanges(tmpText, edit2);
    const compressedTextChanges = compressConsecutiveTextChanges(
      chg1,
      chg2
    );
    const compressedDoTextEdits = compressedTextChanges.map((change) => {
      return {
        offset: change.oldPosition,
        length: change.oldLength,
        text: change.newText
      };
    });
    const actualDoResult = getResultingContent(
      initialText,
      compressedDoTextEdits
    );
    assert.strictEqual(actualDoResult, finalText);
    const compressedUndoTextEdits = compressedTextChanges.map((change) => {
      return {
        offset: change.newPosition,
        length: change.newLength,
        text: change.oldText
      };
    });
    const actualUndoResult = getResultingContent(
      finalText,
      compressedUndoTextEdits
    );
    assert.strictEqual(actualUndoResult, initialText);
  }
  test("simple 1", () => {
    assertCompression(
      "",
      [{ offset: 0, length: 0, text: "h" }],
      [{ offset: 1, length: 0, text: "e" }]
    );
  });
  test("simple 2", () => {
    assertCompression(
      "|",
      [{ offset: 0, length: 0, text: "h" }],
      [{ offset: 2, length: 0, text: "e" }]
    );
  });
  test("complex1", () => {
    assertCompression(
      "abcdefghij",
      [
        { offset: 0, length: 3, text: "qh" },
        { offset: 5, length: 0, text: "1" },
        { offset: 8, length: 2, text: "X" }
      ],
      [
        { offset: 1, length: 0, text: "Z" },
        { offset: 3, length: 3, text: "Y" }
      ]
    );
  });
  test("gen1", () => {
    assertCompression(
      "kxm",
      [{ offset: 0, length: 1, text: "tod_neu" }],
      [{ offset: 1, length: 2, text: "sag_e" }]
    );
  });
  test("gen2", () => {
    assertCompression(
      "kpb_r_v",
      [{ offset: 5, length: 2, text: "a_jvf_l" }],
      [{ offset: 10, length: 2, text: "w" }]
    );
  });
  test("gen3", () => {
    assertCompression(
      "slu_w",
      [{ offset: 4, length: 1, text: "_wfw" }],
      [{ offset: 3, length: 5, text: "" }]
    );
  });
  test("gen4", () => {
    assertCompression(
      "_e",
      [{ offset: 2, length: 0, text: "zo_b" }],
      [{ offset: 1, length: 3, text: "tra" }]
    );
  });
  test("gen5", () => {
    assertCompression(
      "ssn_",
      [{ offset: 0, length: 2, text: "tat_nwe" }],
      [{ offset: 2, length: 6, text: "jm" }]
    );
  });
  test("gen6", () => {
    assertCompression(
      "kl_nru",
      [{ offset: 4, length: 1, text: "" }],
      [{ offset: 1, length: 4, text: "__ut" }]
    );
  });
  const _a = "a".charCodeAt(0);
  const _z = "z".charCodeAt(0);
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function getRandomString(minLength, maxLength) {
    const length = getRandomInt(minLength, maxLength);
    let r = "";
    for (let i = 0; i < length; i++) {
      r += String.fromCharCode(getRandomInt(_a, _z));
    }
    return r;
  }
  function getRandomEOL() {
    switch (getRandomInt(1, 3)) {
      case 1:
        return "\r";
      case 2:
        return "\n";
      case 3:
        return "\r\n";
    }
    throw new Error(`not possible`);
  }
  function getRandomBuffer(small) {
    const lineCount = getRandomInt(1, small ? 3 : 10);
    const lines = [];
    for (let i = 0; i < lineCount; i++) {
      lines.push(getRandomString(0, small ? 3 : 10) + getRandomEOL());
    }
    return lines.join("");
  }
  function getRandomEdits(content, min = 1, max = 5) {
    const result = [];
    let cnt = getRandomInt(min, max);
    let maxOffset = content.length;
    while (cnt > 0 && maxOffset > 0) {
      const offset = getRandomInt(0, maxOffset);
      const length = getRandomInt(0, maxOffset - offset);
      const text = getRandomBuffer(true);
      result.push({
        offset,
        length,
        text
      });
      maxOffset = offset;
      cnt--;
    }
    result.reverse();
    return result;
  }
  class GeneratedTest {
    _content;
    _edits1;
    _edits2;
    constructor() {
      this._content = getRandomBuffer(false).replace(/\n/g, "_");
      this._edits1 = getRandomEdits(this._content, 1, 5).map((e) => {
        return {
          offset: e.offset,
          length: e.length,
          text: e.text.replace(/\n/g, "_")
        };
      });
      const tmp = getResultingContent(this._content, this._edits1);
      this._edits2 = getRandomEdits(tmp, 1, 5).map((e) => {
        return {
          offset: e.offset,
          length: e.length,
          text: e.text.replace(/\n/g, "_")
        };
      });
    }
    print() {
      console.log(
        `assertCompression(${JSON.stringify(this._content)}, ${JSON.stringify(this._edits1)}, ${JSON.stringify(this._edits2)});`
      );
    }
    assert() {
      assertCompression(this._content, this._edits1, this._edits2);
    }
  }
  if (GENERATE_TESTS) {
    let testNumber = 0;
    while (true) {
      testNumber++;
      console.log(
        `------RUNNING TextChangeCompressor TEST ${testNumber}`
      );
      const test2 = new GeneratedTest();
      try {
        test2.assert();
      } catch (err) {
        console.log(err);
        test2.print();
        break;
      }
    }
  }
});
suite("TextChange", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("issue #118041: unicode character undo bug", () => {
    const textChange = new TextChange(428, "\uFEFF", 428, "");
    const buff = new Uint8Array(textChange.writeSize());
    textChange.write(buff, 0);
    const actual = [];
    TextChange.read(buff, 0, actual);
    assert.deepStrictEqual(actual[0], textChange);
  });
});
