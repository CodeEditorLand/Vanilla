import assert from "assert";
import { writeUInt16LE } from "../../../../base/common/buffer.js";
import { CharCode } from "../../../../base/common/charCode.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { decodeUTF16LE, StringBuilder } from "../../../common/core/stringBuilder.js";
suite("decodeUTF16LE", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("issue #118041: unicode character undo bug 1", () => {
    const buff = new Uint8Array(2);
    writeUInt16LE(buff, "\uFEFF".charCodeAt(0), 0);
    const actual = decodeUTF16LE(buff, 0, 1);
    assert.deepStrictEqual(actual, "\uFEFF");
  });
  test("issue #118041: unicode character undo bug 2", () => {
    const buff = new Uint8Array(4);
    writeUInt16LE(buff, "a\uFEFF".charCodeAt(0), 0);
    writeUInt16LE(buff, "a\uFEFF".charCodeAt(1), 2);
    const actual = decodeUTF16LE(buff, 0, 2);
    assert.deepStrictEqual(actual, "a\uFEFF");
  });
  test("issue #118041: unicode character undo bug 3", () => {
    const buff = new Uint8Array(6);
    writeUInt16LE(buff, "a\uFEFFb".charCodeAt(0), 0);
    writeUInt16LE(buff, "a\uFEFFb".charCodeAt(1), 2);
    writeUInt16LE(buff, "a\uFEFFb".charCodeAt(2), 4);
    const actual = decodeUTF16LE(buff, 0, 3);
    assert.deepStrictEqual(actual, "a\uFEFFb");
  });
});
suite("StringBuilder", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("basic", () => {
    const sb = new StringBuilder(100);
    sb.appendASCIICharCode(CharCode.A);
    sb.appendASCIICharCode(CharCode.Space);
    sb.appendString("\u{1F60A}");
    assert.strictEqual(sb.build(), "A \u{1F60A}");
  });
});
//# sourceMappingURL=stringBuilder.test.js.map
