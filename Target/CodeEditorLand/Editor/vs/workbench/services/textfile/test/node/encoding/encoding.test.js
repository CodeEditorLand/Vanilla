var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as fs from "fs";
import * as encoding from "../../../common/encoding.js";
import * as streams from "../../../../../../base/common/stream.js";
import { newWriteableBufferStream, VSBuffer, VSBufferReadableStream, streamToBufferReadableStream } from "../../../../../../base/common/buffer.js";
import { splitLines } from "../../../../../../base/common/strings.js";
import { FileAccess } from "../../../../../../base/common/network.js";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
async function detectEncodingByBOM(file) {
  try {
    const { buffer, bytesRead } = await readExactlyByFile(file, 3);
    return encoding.detectEncodingByBOMFromBuffer(buffer, bytesRead);
  } catch (error) {
    return null;
  }
}
__name(detectEncodingByBOM, "detectEncodingByBOM");
function readExactlyByFile(file, totalBytes) {
  return new Promise((resolve, reject) => {
    fs.open(file, "r", null, (err, fd) => {
      if (err) {
        return reject(err);
      }
      function end(err2, resultBuffer, bytesRead) {
        fs.close(fd, (closeError) => {
          if (closeError) {
            return reject(closeError);
          }
          if (err2 && err2.code === "EISDIR") {
            return reject(err2);
          }
          return resolve({ buffer: resultBuffer ? VSBuffer.wrap(resultBuffer) : null, bytesRead });
        });
      }
      __name(end, "end");
      const buffer = Buffer.allocUnsafe(totalBytes);
      let offset = 0;
      function readChunk() {
        fs.read(fd, buffer, offset, totalBytes - offset, null, (err2, bytesRead) => {
          if (err2) {
            return end(err2, null, 0);
          }
          if (bytesRead === 0) {
            return end(null, buffer, offset);
          }
          offset += bytesRead;
          if (offset === totalBytes) {
            return end(null, buffer, offset);
          }
          return readChunk();
        });
      }
      __name(readChunk, "readChunk");
      readChunk();
    });
  });
}
__name(readExactlyByFile, "readExactlyByFile");
suite("Encoding", () => {
  test("detectBOM does not return error for non existing file", async () => {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/not-exist.css").fsPath;
    const detectedEncoding = await detectEncodingByBOM(file);
    assert.strictEqual(detectedEncoding, null);
  });
  test("detectBOM UTF-8", async () => {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf8.css").fsPath;
    const detectedEncoding = await detectEncodingByBOM(file);
    assert.strictEqual(detectedEncoding, "utf8bom");
  });
  test("detectBOM UTF-16 LE", async () => {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16le.css").fsPath;
    const detectedEncoding = await detectEncodingByBOM(file);
    assert.strictEqual(detectedEncoding, "utf16le");
  });
  test("detectBOM UTF-16 BE", async () => {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16be.css").fsPath;
    const detectedEncoding = await detectEncodingByBOM(file);
    assert.strictEqual(detectedEncoding, "utf16be");
  });
  test("detectBOM ANSI", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some_ansi.css").fsPath;
    const detectedEncoding = await detectEncodingByBOM(file);
    assert.strictEqual(detectedEncoding, null);
  });
  test("detectBOM ANSI (2)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/empty.txt").fsPath;
    const detectedEncoding = await detectEncodingByBOM(file);
    assert.strictEqual(detectedEncoding, null);
  });
  test("detectEncodingFromBuffer (JSON saved as PNG)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some.json.png").fsPath;
    const buffer = await readExactlyByFile(file, 512);
    const mimes = encoding.detectEncodingFromBuffer(buffer);
    assert.strictEqual(mimes.seemsBinary, false);
  });
  test("detectEncodingFromBuffer (PNG saved as TXT)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some.png.txt").fsPath;
    const buffer = await readExactlyByFile(file, 512);
    const mimes = encoding.detectEncodingFromBuffer(buffer);
    assert.strictEqual(mimes.seemsBinary, true);
  });
  test("detectEncodingFromBuffer (XML saved as PNG)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some.xml.png").fsPath;
    const buffer = await readExactlyByFile(file, 512);
    const mimes = encoding.detectEncodingFromBuffer(buffer);
    assert.strictEqual(mimes.seemsBinary, false);
  });
  test("detectEncodingFromBuffer (QWOFF saved as TXT)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some.qwoff.txt").fsPath;
    const buffer = await readExactlyByFile(file, 512);
    const mimes = encoding.detectEncodingFromBuffer(buffer);
    assert.strictEqual(mimes.seemsBinary, true);
  });
  test("detectEncodingFromBuffer (CSS saved as QWOFF)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some.css.qwoff").fsPath;
    const buffer = await readExactlyByFile(file, 512);
    const mimes = encoding.detectEncodingFromBuffer(buffer);
    assert.strictEqual(mimes.seemsBinary, false);
  });
  test("detectEncodingFromBuffer (PDF)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some.pdf").fsPath;
    const buffer = await readExactlyByFile(file, 512);
    const mimes = encoding.detectEncodingFromBuffer(buffer);
    assert.strictEqual(mimes.seemsBinary, true);
  });
  test("detectEncodingFromBuffer (guess UTF-16 LE from content without BOM)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/utf16_le_nobom.txt").fsPath;
    const buffer = await readExactlyByFile(file, 512);
    const mimes = encoding.detectEncodingFromBuffer(buffer);
    assert.strictEqual(mimes.encoding, encoding.UTF16le);
    assert.strictEqual(mimes.seemsBinary, false);
  });
  test("detectEncodingFromBuffer (guess UTF-16 BE from content without BOM)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/utf16_be_nobom.txt").fsPath;
    const buffer = await readExactlyByFile(file, 512);
    const mimes = encoding.detectEncodingFromBuffer(buffer);
    assert.strictEqual(mimes.encoding, encoding.UTF16be);
    assert.strictEqual(mimes.seemsBinary, false);
  });
  test("autoGuessEncoding (UTF8)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some_file.css").fsPath;
    const buffer = await readExactlyByFile(file, 512 * 8);
    const mimes = await encoding.detectEncodingFromBuffer(buffer, true);
    assert.strictEqual(mimes.encoding, "utf8");
  });
  test("autoGuessEncoding (ASCII)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some_ansi.css").fsPath;
    const buffer = await readExactlyByFile(file, 512 * 8);
    const mimes = await encoding.detectEncodingFromBuffer(buffer, true);
    assert.strictEqual(mimes.encoding, null);
  });
  test("autoGuessEncoding (ShiftJIS)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some.shiftjis.txt").fsPath;
    const buffer = await readExactlyByFile(file, 512 * 8);
    const mimes = await encoding.detectEncodingFromBuffer(buffer, true);
    assert.strictEqual(mimes.encoding, "shiftjis");
  });
  test("autoGuessEncoding (CP1252)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some.cp1252.txt").fsPath;
    const buffer = await readExactlyByFile(file, 512 * 8);
    const mimes = await encoding.detectEncodingFromBuffer(buffer, true);
    assert.strictEqual(mimes.encoding, "windows1252");
  });
  test("autoGuessEncoding (candidateGuessEncodings - ShiftJIS)", async function() {
    const file = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some.shiftjis.1.txt").fsPath;
    const buffer = await readExactlyByFile(file, 512 * 8);
    const mimes = await encoding.detectEncodingFromBuffer(buffer, true, ["utf8", "shiftjis", "eucjp"]);
    assert.strictEqual(mimes.encoding, "shiftjis");
  });
  async function readAndDecodeFromDisk(path, fileEncoding) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(importAMDNodeModule("@vscode/iconv-lite-umd", "lib/iconv-lite-umd.js").then((iconv) => iconv.decode(data, encoding.toNodeEncoding(fileEncoding))));
        }
      });
    });
  }
  __name(readAndDecodeFromDisk, "readAndDecodeFromDisk");
  function newTestReadableStream(buffers) {
    const stream = newWriteableBufferStream();
    buffers.map(VSBuffer.wrap).forEach((buffer) => {
      setTimeout(() => {
        stream.write(buffer);
      });
    });
    setTimeout(() => {
      stream.end();
    });
    return stream;
  }
  __name(newTestReadableStream, "newTestReadableStream");
  async function readAllAsString(stream) {
    return streams.consumeStream(stream, (strings) => strings.join(""));
  }
  __name(readAllAsString, "readAllAsString");
  test("toDecodeStream - some stream", async function() {
    const source = newTestReadableStream([
      Buffer.from([65, 66, 67]),
      Buffer.from([65, 66, 67]),
      Buffer.from([65, 66, 67])
    ]);
    const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, candidateGuessEncodings: [], overwriteEncoding: /* @__PURE__ */ __name(async (detected2) => detected2 || encoding.UTF8, "overwriteEncoding") });
    assert.ok(detected);
    assert.ok(stream);
    const content = await readAllAsString(stream);
    assert.strictEqual(content, "ABCABCABC");
  });
  test("toDecodeStream - some stream, expect too much data", async function() {
    const source = newTestReadableStream([
      Buffer.from([65, 66, 67]),
      Buffer.from([65, 66, 67]),
      Buffer.from([65, 66, 67])
    ]);
    const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 64, guessEncoding: false, candidateGuessEncodings: [], overwriteEncoding: /* @__PURE__ */ __name(async (detected2) => detected2 || encoding.UTF8, "overwriteEncoding") });
    assert.ok(detected);
    assert.ok(stream);
    const content = await readAllAsString(stream);
    assert.strictEqual(content, "ABCABCABC");
  });
  test("toDecodeStream - some stream, no data", async function() {
    const source = newWriteableBufferStream();
    source.end();
    const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 512, guessEncoding: false, candidateGuessEncodings: [], overwriteEncoding: /* @__PURE__ */ __name(async (detected2) => detected2 || encoding.UTF8, "overwriteEncoding") });
    assert.ok(detected);
    assert.ok(stream);
    const content = await readAllAsString(stream);
    assert.strictEqual(content, "");
  });
  test("toDecodeStream - encoding, utf16be", async function() {
    const path = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16be.css").fsPath;
    const source = streamToBufferReadableStream(fs.createReadStream(path));
    const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 64, guessEncoding: false, candidateGuessEncodings: [], overwriteEncoding: /* @__PURE__ */ __name(async (detected2) => detected2 || encoding.UTF8, "overwriteEncoding") });
    assert.strictEqual(detected.encoding, "utf16be");
    assert.strictEqual(detected.seemsBinary, false);
    const expected = await readAndDecodeFromDisk(path, detected.encoding);
    const actual = await readAllAsString(stream);
    assert.strictEqual(actual, expected);
  });
  test("toDecodeStream - empty file", async function() {
    const path = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/empty.txt").fsPath;
    const source = streamToBufferReadableStream(fs.createReadStream(path));
    const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, guessEncoding: false, candidateGuessEncodings: [], overwriteEncoding: /* @__PURE__ */ __name(async (detected2) => detected2 || encoding.UTF8, "overwriteEncoding") });
    const expected = await readAndDecodeFromDisk(path, detected.encoding);
    const actual = await readAllAsString(stream);
    assert.strictEqual(actual, expected);
  });
  test("toDecodeStream - decodes buffer entirely", async function() {
    const emojis = Buffer.from("\u{1F5A5}\uFE0F\u{1F4BB}\u{1F4BE}");
    const incompleteEmojis = emojis.slice(0, emojis.length - 1);
    const buffers = [];
    for (let i = 0; i < incompleteEmojis.length; i++) {
      buffers.push(incompleteEmojis.slice(i, i + 1));
    }
    const source = newTestReadableStream(buffers);
    const { stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, candidateGuessEncodings: [], overwriteEncoding: /* @__PURE__ */ __name(async (detected) => detected || encoding.UTF8, "overwriteEncoding") });
    const expected = new TextDecoder().decode(incompleteEmojis);
    const actual = await readAllAsString(stream);
    assert.strictEqual(actual, expected);
  });
  test("toDecodeStream - some stream (GBK issue #101856)", async function() {
    const path = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some_gbk.txt").fsPath;
    const source = streamToBufferReadableStream(fs.createReadStream(path));
    const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, candidateGuessEncodings: [], overwriteEncoding: /* @__PURE__ */ __name(async () => "gbk", "overwriteEncoding") });
    assert.ok(detected);
    assert.ok(stream);
    const content = await readAllAsString(stream);
    assert.strictEqual(content.length, 65537);
  });
  test("toDecodeStream - some stream (UTF-8 issue #102202)", async function() {
    const path = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/issue_102202.txt").fsPath;
    const source = streamToBufferReadableStream(fs.createReadStream(path));
    const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, candidateGuessEncodings: [], overwriteEncoding: /* @__PURE__ */ __name(async () => "utf-8", "overwriteEncoding") });
    assert.ok(detected);
    assert.ok(stream);
    const content = await readAllAsString(stream);
    const lines = splitLines(content);
    assert.strictEqual(lines[981].toString(), "\u554A\u554A\u554A\u554A\u554A\u554Aaaa\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\uFF0C\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u554A\u3002");
  });
  test("toDecodeStream - binary", async function() {
    const source = /* @__PURE__ */ __name(() => {
      return newTestReadableStream([
        Buffer.from([0, 0, 0]),
        Buffer.from("Hello World"),
        Buffer.from([0])
      ]);
    }, "source");
    let error = void 0;
    try {
      await encoding.toDecodeStream(source(), { acceptTextOnly: true, guessEncoding: false, candidateGuessEncodings: [], overwriteEncoding: /* @__PURE__ */ __name(async (detected2) => detected2 || encoding.UTF8, "overwriteEncoding") });
    } catch (e) {
      error = e;
    }
    assert.ok(error instanceof encoding.DecodeStreamError);
    assert.strictEqual(error.decodeStreamErrorKind, encoding.DecodeStreamErrorKind.STREAM_IS_BINARY);
    const { detected, stream } = await encoding.toDecodeStream(source(), { acceptTextOnly: false, guessEncoding: false, candidateGuessEncodings: [], overwriteEncoding: /* @__PURE__ */ __name(async (detected2) => detected2 || encoding.UTF8, "overwriteEncoding") });
    assert.ok(detected);
    assert.strictEqual(detected.seemsBinary, true);
    assert.ok(stream);
  });
  test("toEncodeReadable - encoding, utf16be", async function() {
    const path = FileAccess.asFileUri("vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16be.css").fsPath;
    const source = await readAndDecodeFromDisk(path, encoding.UTF16be);
    const iconv = await importAMDNodeModule("@vscode/iconv-lite-umd", "lib/iconv-lite-umd.js");
    const expected = VSBuffer.wrap(
      iconv.encode(source, encoding.toNodeEncoding(encoding.UTF16be))
    ).toString();
    const actual = streams.consumeReadable(
      await encoding.toEncodeReadable(streams.toReadable(source), encoding.UTF16be),
      VSBuffer.concat
    ).toString();
    assert.strictEqual(actual, expected);
  });
  test("toEncodeReadable - empty readable to utf8", async function() {
    const source = {
      read() {
        return null;
      }
    };
    const actual = streams.consumeReadable(
      await encoding.toEncodeReadable(source, encoding.UTF8),
      VSBuffer.concat
    ).toString();
    assert.strictEqual(actual, "");
  });
  [{
    utfEncoding: encoding.UTF8,
    relatedBom: encoding.UTF8_BOM
  }, {
    utfEncoding: encoding.UTF8_with_bom,
    relatedBom: encoding.UTF8_BOM
  }, {
    utfEncoding: encoding.UTF16be,
    relatedBom: encoding.UTF16be_BOM
  }, {
    utfEncoding: encoding.UTF16le,
    relatedBom: encoding.UTF16le_BOM
  }].forEach(({ utfEncoding, relatedBom }) => {
    test(`toEncodeReadable - empty readable to ${utfEncoding} with BOM`, async function() {
      const source = {
        read() {
          return null;
        }
      };
      const encodedReadable = encoding.toEncodeReadable(source, utfEncoding, { addBOM: true });
      const expected = VSBuffer.wrap(Buffer.from(relatedBom)).toString();
      const actual = streams.consumeReadable(await encodedReadable, VSBuffer.concat).toString();
      assert.strictEqual(actual, expected);
    });
  });
  test("encodingExists", async function() {
    for (const enc in encoding.SUPPORTED_ENCODINGS) {
      if (enc === encoding.UTF8_with_bom) {
        continue;
      }
      const iconv = await importAMDNodeModule("@vscode/iconv-lite-umd", "lib/iconv-lite-umd.js");
      assert.strictEqual(iconv.encodingExists(enc), true, enc);
    }
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
export {
  detectEncodingByBOM
};
//# sourceMappingURL=encoding.test.js.map
