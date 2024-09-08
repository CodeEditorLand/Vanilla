import { importAMDNodeModule } from "../../../../amdX.js";
import { isESM } from "../../../../base/common/amd.js";
import { coalesce } from "../../../../base/common/arrays.js";
import {
  VSBuffer
} from "../../../../base/common/buffer.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import {
  listenStream,
  newWriteableStream
} from "../../../../base/common/stream.js";
const UTF8 = "utf8";
const UTF8_with_bom = "utf8bom";
const UTF16be = "utf16be";
const UTF16le = "utf16le";
function isUTFEncoding(encoding) {
  return [UTF8, UTF8_with_bom, UTF16be, UTF16le].some(
    (utfEncoding) => utfEncoding === encoding
  );
}
const UTF16be_BOM = [254, 255];
const UTF16le_BOM = [255, 254];
const UTF8_BOM = [239, 187, 191];
const ZERO_BYTE_DETECTION_BUFFER_MAX_LEN = 512;
const NO_ENCODING_GUESS_MIN_BYTES = 512;
const AUTO_ENCODING_GUESS_MIN_BYTES = 512 * 8;
const AUTO_ENCODING_GUESS_MAX_BYTES = 512 * 128;
var DecodeStreamErrorKind = /* @__PURE__ */ ((DecodeStreamErrorKind2) => {
  DecodeStreamErrorKind2[DecodeStreamErrorKind2["STREAM_IS_BINARY"] = 1] = "STREAM_IS_BINARY";
  return DecodeStreamErrorKind2;
})(DecodeStreamErrorKind || {});
class DecodeStreamError extends Error {
  constructor(message, decodeStreamErrorKind) {
    super(message);
    this.decodeStreamErrorKind = decodeStreamErrorKind;
  }
}
class DecoderStream {
  constructor(iconvLiteDecoder) {
    this.iconvLiteDecoder = iconvLiteDecoder;
  }
  /**
   * This stream will only load iconv-lite lazily if the encoding
   * is not UTF-8. This ensures that for most common cases we do
   * not pay the price of loading the module from disk.
   *
   * We still need to be careful when converting UTF-8 to a string
   * though because we read the file in chunks of Buffer and thus
   * need to decode it via TextDecoder helper that is available
   * in browser and node.js environments.
   */
  static async create(encoding) {
    let decoder;
    if (encoding !== UTF8) {
      const iconv = await importAMDNodeModule("@vscode/iconv-lite-umd", "lib/iconv-lite-umd.js");
      decoder = iconv.getDecoder(toNodeEncoding(encoding));
    } else {
      const utf8TextDecoder = new TextDecoder();
      decoder = {
        write(buffer) {
          return utf8TextDecoder.decode(buffer, {
            // Signal to TextDecoder that potentially more data is coming
            // and that we are calling `decode` in the end to consume any
            // remainders
            stream: true
          });
        },
        end() {
          return utf8TextDecoder.decode();
        }
      };
    }
    return new DecoderStream(decoder);
  }
  write(buffer) {
    return this.iconvLiteDecoder.write(buffer);
  }
  end() {
    return this.iconvLiteDecoder.end();
  }
}
function toDecodeStream(source, options) {
  const minBytesRequiredForDetection = options.minBytesRequiredForDetection ?? options.guessEncoding ? AUTO_ENCODING_GUESS_MIN_BYTES : NO_ENCODING_GUESS_MIN_BYTES;
  return new Promise((resolve, reject) => {
    const target = newWriteableStream(
      (strings) => strings.join("")
    );
    const bufferedChunks = [];
    let bytesBuffered = 0;
    let decoder;
    const cts = new CancellationTokenSource();
    const createDecoder = async () => {
      try {
        const detected = await detectEncodingFromBuffer(
          {
            buffer: VSBuffer.concat(bufferedChunks),
            bytesRead: bytesBuffered
          },
          options.guessEncoding,
          options.candidateGuessEncodings
        );
        if (detected.seemsBinary && options.acceptTextOnly) {
          throw new DecodeStreamError(
            "Stream is binary but only text is accepted for decoding",
            1 /* STREAM_IS_BINARY */
          );
        }
        detected.encoding = await options.overwriteEncoding(
          detected.encoding
        );
        decoder = await DecoderStream.create(detected.encoding);
        const decoded = decoder.write(
          VSBuffer.concat(bufferedChunks).buffer
        );
        target.write(decoded);
        bufferedChunks.length = 0;
        bytesBuffered = 0;
        resolve({
          stream: target,
          detected
        });
      } catch (error) {
        cts.cancel();
        target.destroy();
        reject(error);
      }
    };
    listenStream(
      source,
      {
        onData: async (chunk) => {
          if (decoder) {
            target.write(decoder.write(chunk.buffer));
          } else {
            bufferedChunks.push(chunk);
            bytesBuffered += chunk.byteLength;
            if (bytesBuffered >= minBytesRequiredForDetection) {
              source.pause();
              await createDecoder();
              setTimeout(() => source.resume());
            }
          }
        },
        onError: (error) => target.error(error),
        // simply forward to target
        onEnd: async () => {
          if (!decoder) {
            await createDecoder();
          }
          target.end(decoder?.end());
        }
      },
      cts.token
    );
  });
}
async function toEncodeReadable(readable, encoding, options) {
  const iconv = await importAMDNodeModule("@vscode/iconv-lite-umd", "lib/iconv-lite-umd.js");
  const encoder = iconv.getEncoder(toNodeEncoding(encoding), options);
  let bytesWritten = false;
  let done = false;
  return {
    read() {
      if (done) {
        return null;
      }
      const chunk = readable.read();
      if (typeof chunk !== "string") {
        done = true;
        if (!bytesWritten && options?.addBOM) {
          switch (encoding) {
            case UTF8:
            case UTF8_with_bom:
              return VSBuffer.wrap(Uint8Array.from(UTF8_BOM));
            case UTF16be:
              return VSBuffer.wrap(Uint8Array.from(UTF16be_BOM));
            case UTF16le:
              return VSBuffer.wrap(Uint8Array.from(UTF16le_BOM));
          }
        }
        const leftovers = encoder.end();
        if (leftovers && leftovers.length > 0) {
          bytesWritten = true;
          return VSBuffer.wrap(leftovers);
        }
        return null;
      }
      bytesWritten = true;
      return VSBuffer.wrap(encoder.write(chunk));
    }
  };
}
async function encodingExists(encoding) {
  const iconv = await importAMDNodeModule("@vscode/iconv-lite-umd", "lib/iconv-lite-umd.js");
  return iconv.encodingExists(toNodeEncoding(encoding));
}
function toNodeEncoding(enc) {
  if (enc === UTF8_with_bom || enc === null) {
    return UTF8;
  }
  return enc;
}
function detectEncodingByBOMFromBuffer(buffer, bytesRead) {
  if (!buffer || bytesRead < UTF16be_BOM.length) {
    return null;
  }
  const b0 = buffer.readUInt8(0);
  const b1 = buffer.readUInt8(1);
  if (b0 === UTF16be_BOM[0] && b1 === UTF16be_BOM[1]) {
    return UTF16be;
  }
  if (b0 === UTF16le_BOM[0] && b1 === UTF16le_BOM[1]) {
    return UTF16le;
  }
  if (bytesRead < UTF8_BOM.length) {
    return null;
  }
  const b2 = buffer.readUInt8(2);
  if (b0 === UTF8_BOM[0] && b1 === UTF8_BOM[1] && b2 === UTF8_BOM[2]) {
    return UTF8_with_bom;
  }
  return null;
}
const IGNORE_ENCODINGS = ["ascii", "utf-16", "utf-32"];
async function guessEncodingByBuffer(buffer, candidateGuessEncodings) {
  const jschardet = await importAMDNodeModule(
    "jschardet",
    isESM ? "dist/jschardet.js" : "dist/jschardet.min.js"
  );
  const limitedBuffer = buffer.slice(0, AUTO_ENCODING_GUESS_MAX_BYTES);
  const binaryString = encodeLatin1(limitedBuffer.buffer);
  if (candidateGuessEncodings) {
    candidateGuessEncodings = coalesce(
      candidateGuessEncodings.map((e) => toJschardetEncoding(e))
    );
    if (candidateGuessEncodings.length === 0) {
      candidateGuessEncodings = void 0;
    }
  }
  const guessed = jschardet.detect(
    binaryString,
    candidateGuessEncodings ? { detectEncodings: candidateGuessEncodings } : void 0
  );
  if (!guessed || !guessed.encoding) {
    return null;
  }
  const enc = guessed.encoding.toLowerCase();
  if (IGNORE_ENCODINGS.indexOf(enc) >= 0) {
    return null;
  }
  return toIconvLiteEncoding(guessed.encoding);
}
const JSCHARDET_TO_ICONV_ENCODINGS = {
  ibm866: "cp866",
  big5: "cp950"
};
function normalizeEncoding(encodingName) {
  return encodingName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}
function toIconvLiteEncoding(encodingName) {
  const normalizedEncodingName = normalizeEncoding(encodingName);
  const mapped = JSCHARDET_TO_ICONV_ENCODINGS[normalizedEncodingName];
  return mapped || normalizedEncodingName;
}
function toJschardetEncoding(encodingName) {
  const normalizedEncodingName = normalizeEncoding(encodingName);
  const mapped = GUESSABLE_ENCODINGS[normalizedEncodingName];
  return mapped.guessableName;
}
function encodeLatin1(buffer) {
  let result = "";
  for (let i = 0; i < buffer.length; i++) {
    result += String.fromCharCode(buffer[i]);
  }
  return result;
}
function toCanonicalName(enc) {
  switch (enc) {
    case "shiftjis":
      return "shift-jis";
    case "utf16le":
      return "utf-16le";
    case "utf16be":
      return "utf-16be";
    case "big5hkscs":
      return "big5-hkscs";
    case "eucjp":
      return "euc-jp";
    case "euckr":
      return "euc-kr";
    case "koi8r":
      return "koi8-r";
    case "koi8u":
      return "koi8-u";
    case "macroman":
      return "x-mac-roman";
    case "utf8bom":
      return "utf8";
    default: {
      const m = enc.match(/windows(\d+)/);
      if (m) {
        return "windows-" + m[1];
      }
      return enc;
    }
  }
}
function detectEncodingFromBuffer({ buffer, bytesRead }, autoGuessEncoding, candidateGuessEncodings) {
  let encoding = detectEncodingByBOMFromBuffer(buffer, bytesRead);
  let seemsBinary = false;
  if (encoding !== UTF16be && encoding !== UTF16le && buffer) {
    let couldBeUTF16LE = true;
    let couldBeUTF16BE = true;
    let containsZeroByte = false;
    for (let i = 0; i < bytesRead && i < ZERO_BYTE_DETECTION_BUFFER_MAX_LEN; i++) {
      const isEndian = i % 2 === 1;
      const isZeroByte = buffer.readUInt8(i) === 0;
      if (isZeroByte) {
        containsZeroByte = true;
      }
      if (couldBeUTF16LE && (isEndian && !isZeroByte || !isEndian && isZeroByte)) {
        couldBeUTF16LE = false;
      }
      if (couldBeUTF16BE && (isEndian && isZeroByte || !isEndian && !isZeroByte)) {
        couldBeUTF16BE = false;
      }
      if (isZeroByte && !couldBeUTF16LE && !couldBeUTF16BE) {
        break;
      }
    }
    if (containsZeroByte) {
      if (couldBeUTF16LE) {
        encoding = UTF16le;
      } else if (couldBeUTF16BE) {
        encoding = UTF16be;
      } else {
        seemsBinary = true;
      }
    }
  }
  if (autoGuessEncoding && !seemsBinary && !encoding && buffer) {
    return guessEncodingByBuffer(
      buffer.slice(0, bytesRead),
      candidateGuessEncodings
    ).then((guessedEncoding) => {
      return {
        seemsBinary: false,
        encoding: guessedEncoding
      };
    });
  }
  return { seemsBinary, encoding };
}
const SUPPORTED_ENCODINGS = {
  utf8: {
    labelLong: "UTF-8",
    labelShort: "UTF-8",
    order: 1,
    alias: "utf8bom",
    guessableName: "UTF-8"
  },
  utf8bom: {
    labelLong: "UTF-8 with BOM",
    labelShort: "UTF-8 with BOM",
    encodeOnly: true,
    order: 2,
    alias: "utf8"
  },
  utf16le: {
    labelLong: "UTF-16 LE",
    labelShort: "UTF-16 LE",
    order: 3,
    guessableName: "UTF-16LE"
  },
  utf16be: {
    labelLong: "UTF-16 BE",
    labelShort: "UTF-16 BE",
    order: 4,
    guessableName: "UTF-16BE"
  },
  windows1252: {
    labelLong: "Western (Windows 1252)",
    labelShort: "Windows 1252",
    order: 5,
    guessableName: "windows-1252"
  },
  iso88591: {
    labelLong: "Western (ISO 8859-1)",
    labelShort: "ISO 8859-1",
    order: 6
  },
  iso88593: {
    labelLong: "Western (ISO 8859-3)",
    labelShort: "ISO 8859-3",
    order: 7
  },
  iso885915: {
    labelLong: "Western (ISO 8859-15)",
    labelShort: "ISO 8859-15",
    order: 8
  },
  macroman: {
    labelLong: "Western (Mac Roman)",
    labelShort: "Mac Roman",
    order: 9
  },
  cp437: {
    labelLong: "DOS (CP 437)",
    labelShort: "CP437",
    order: 10
  },
  windows1256: {
    labelLong: "Arabic (Windows 1256)",
    labelShort: "Windows 1256",
    order: 11
  },
  iso88596: {
    labelLong: "Arabic (ISO 8859-6)",
    labelShort: "ISO 8859-6",
    order: 12
  },
  windows1257: {
    labelLong: "Baltic (Windows 1257)",
    labelShort: "Windows 1257",
    order: 13
  },
  iso88594: {
    labelLong: "Baltic (ISO 8859-4)",
    labelShort: "ISO 8859-4",
    order: 14
  },
  iso885914: {
    labelLong: "Celtic (ISO 8859-14)",
    labelShort: "ISO 8859-14",
    order: 15
  },
  windows1250: {
    labelLong: "Central European (Windows 1250)",
    labelShort: "Windows 1250",
    order: 16,
    guessableName: "windows-1250"
  },
  iso88592: {
    labelLong: "Central European (ISO 8859-2)",
    labelShort: "ISO 8859-2",
    order: 17,
    guessableName: "ISO-8859-2"
  },
  cp852: {
    labelLong: "Central European (CP 852)",
    labelShort: "CP 852",
    order: 18
  },
  windows1251: {
    labelLong: "Cyrillic (Windows 1251)",
    labelShort: "Windows 1251",
    order: 19,
    guessableName: "windows-1251"
  },
  cp866: {
    labelLong: "Cyrillic (CP 866)",
    labelShort: "CP 866",
    order: 20,
    guessableName: "IBM866"
  },
  iso88595: {
    labelLong: "Cyrillic (ISO 8859-5)",
    labelShort: "ISO 8859-5",
    order: 21,
    guessableName: "ISO-8859-5"
  },
  koi8r: {
    labelLong: "Cyrillic (KOI8-R)",
    labelShort: "KOI8-R",
    order: 22,
    guessableName: "KOI8-R"
  },
  koi8u: {
    labelLong: "Cyrillic (KOI8-U)",
    labelShort: "KOI8-U",
    order: 23
  },
  iso885913: {
    labelLong: "Estonian (ISO 8859-13)",
    labelShort: "ISO 8859-13",
    order: 24
  },
  windows1253: {
    labelLong: "Greek (Windows 1253)",
    labelShort: "Windows 1253",
    order: 25,
    guessableName: "windows-1253"
  },
  iso88597: {
    labelLong: "Greek (ISO 8859-7)",
    labelShort: "ISO 8859-7",
    order: 26,
    guessableName: "ISO-8859-7"
  },
  windows1255: {
    labelLong: "Hebrew (Windows 1255)",
    labelShort: "Windows 1255",
    order: 27,
    guessableName: "windows-1255"
  },
  iso88598: {
    labelLong: "Hebrew (ISO 8859-8)",
    labelShort: "ISO 8859-8",
    order: 28,
    guessableName: "ISO-8859-8"
  },
  iso885910: {
    labelLong: "Nordic (ISO 8859-10)",
    labelShort: "ISO 8859-10",
    order: 29
  },
  iso885916: {
    labelLong: "Romanian (ISO 8859-16)",
    labelShort: "ISO 8859-16",
    order: 30
  },
  windows1254: {
    labelLong: "Turkish (Windows 1254)",
    labelShort: "Windows 1254",
    order: 31
  },
  iso88599: {
    labelLong: "Turkish (ISO 8859-9)",
    labelShort: "ISO 8859-9",
    order: 32
  },
  windows1258: {
    labelLong: "Vietnamese (Windows 1258)",
    labelShort: "Windows 1258",
    order: 33
  },
  gbk: {
    labelLong: "Simplified Chinese (GBK)",
    labelShort: "GBK",
    order: 34
  },
  gb18030: {
    labelLong: "Simplified Chinese (GB18030)",
    labelShort: "GB18030",
    order: 35
  },
  cp950: {
    labelLong: "Traditional Chinese (Big5)",
    labelShort: "Big5",
    order: 36,
    guessableName: "Big5"
  },
  big5hkscs: {
    labelLong: "Traditional Chinese (Big5-HKSCS)",
    labelShort: "Big5-HKSCS",
    order: 37
  },
  shiftjis: {
    labelLong: "Japanese (Shift JIS)",
    labelShort: "Shift JIS",
    order: 38,
    guessableName: "SHIFT_JIS"
  },
  eucjp: {
    labelLong: "Japanese (EUC-JP)",
    labelShort: "EUC-JP",
    order: 39,
    guessableName: "EUC-JP"
  },
  euckr: {
    labelLong: "Korean (EUC-KR)",
    labelShort: "EUC-KR",
    order: 40,
    guessableName: "EUC-KR"
  },
  windows874: {
    labelLong: "Thai (Windows 874)",
    labelShort: "Windows 874",
    order: 41
  },
  iso885911: {
    labelLong: "Latin/Thai (ISO 8859-11)",
    labelShort: "ISO 8859-11",
    order: 42
  },
  koi8ru: {
    labelLong: "Cyrillic (KOI8-RU)",
    labelShort: "KOI8-RU",
    order: 43
  },
  koi8t: {
    labelLong: "Tajik (KOI8-T)",
    labelShort: "KOI8-T",
    order: 44
  },
  gb2312: {
    labelLong: "Simplified Chinese (GB 2312)",
    labelShort: "GB 2312",
    order: 45,
    guessableName: "GB2312"
  },
  cp865: {
    labelLong: "Nordic DOS (CP 865)",
    labelShort: "CP 865",
    order: 46
  },
  cp850: {
    labelLong: "Western European DOS (CP 850)",
    labelShort: "CP 850",
    order: 47
  }
};
const GUESSABLE_ENCODINGS = (() => {
  const guessableEncodings = {};
  for (const encoding in SUPPORTED_ENCODINGS) {
    if (SUPPORTED_ENCODINGS[encoding].guessableName) {
      guessableEncodings[encoding] = SUPPORTED_ENCODINGS[encoding];
    }
  }
  return guessableEncodings;
})();
export {
  DecodeStreamError,
  DecodeStreamErrorKind,
  GUESSABLE_ENCODINGS,
  SUPPORTED_ENCODINGS,
  UTF16be,
  UTF16be_BOM,
  UTF16le,
  UTF16le_BOM,
  UTF8,
  UTF8_BOM,
  UTF8_with_bom,
  detectEncodingByBOMFromBuffer,
  detectEncodingFromBuffer,
  encodingExists,
  isUTFEncoding,
  toCanonicalName,
  toDecodeStream,
  toEncodeReadable,
  toNodeEncoding
};
