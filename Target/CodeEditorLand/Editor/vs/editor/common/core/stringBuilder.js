var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as strings from "../../../base/common/strings.js";
import * as platform from "../../../base/common/platform.js";
import * as buffer from "../../../base/common/buffer.js";
let _utf16LE_TextDecoder;
function getUTF16LE_TextDecoder() {
  if (!_utf16LE_TextDecoder) {
    _utf16LE_TextDecoder = new TextDecoder("UTF-16LE");
  }
  return _utf16LE_TextDecoder;
}
__name(getUTF16LE_TextDecoder, "getUTF16LE_TextDecoder");
let _utf16BE_TextDecoder;
function getUTF16BE_TextDecoder() {
  if (!_utf16BE_TextDecoder) {
    _utf16BE_TextDecoder = new TextDecoder("UTF-16BE");
  }
  return _utf16BE_TextDecoder;
}
__name(getUTF16BE_TextDecoder, "getUTF16BE_TextDecoder");
let _platformTextDecoder;
function getPlatformTextDecoder() {
  if (!_platformTextDecoder) {
    _platformTextDecoder = platform.isLittleEndian() ? getUTF16LE_TextDecoder() : getUTF16BE_TextDecoder();
  }
  return _platformTextDecoder;
}
__name(getPlatformTextDecoder, "getPlatformTextDecoder");
function decodeUTF16LE(source, offset, len) {
  const view = new Uint16Array(source.buffer, offset, len);
  if (len > 0 && (view[0] === 65279 || view[0] === 65534)) {
    return compatDecodeUTF16LE(source, offset, len);
  }
  return getUTF16LE_TextDecoder().decode(view);
}
__name(decodeUTF16LE, "decodeUTF16LE");
function compatDecodeUTF16LE(source, offset, len) {
  const result = [];
  let resultLen = 0;
  for (let i = 0; i < len; i++) {
    const charCode = buffer.readUInt16LE(source, offset);
    offset += 2;
    result[resultLen++] = String.fromCharCode(charCode);
  }
  return result.join("");
}
__name(compatDecodeUTF16LE, "compatDecodeUTF16LE");
class StringBuilder {
  static {
    __name(this, "StringBuilder");
  }
  _capacity;
  _buffer;
  _completedStrings;
  _bufferLength;
  constructor(capacity) {
    this._capacity = capacity | 0;
    this._buffer = new Uint16Array(this._capacity);
    this._completedStrings = null;
    this._bufferLength = 0;
  }
  reset() {
    this._completedStrings = null;
    this._bufferLength = 0;
  }
  build() {
    if (this._completedStrings !== null) {
      this._flushBuffer();
      return this._completedStrings.join("");
    }
    return this._buildBuffer();
  }
  _buildBuffer() {
    if (this._bufferLength === 0) {
      return "";
    }
    const view = new Uint16Array(this._buffer.buffer, 0, this._bufferLength);
    return getPlatformTextDecoder().decode(view);
  }
  _flushBuffer() {
    const bufferString = this._buildBuffer();
    this._bufferLength = 0;
    if (this._completedStrings === null) {
      this._completedStrings = [bufferString];
    } else {
      this._completedStrings[this._completedStrings.length] = bufferString;
    }
  }
  /**
   * Append a char code (<2^16)
   */
  appendCharCode(charCode) {
    const remainingSpace = this._capacity - this._bufferLength;
    if (remainingSpace <= 1) {
      if (remainingSpace === 0 || strings.isHighSurrogate(charCode)) {
        this._flushBuffer();
      }
    }
    this._buffer[this._bufferLength++] = charCode;
  }
  /**
   * Append an ASCII char code (<2^8)
   */
  appendASCIICharCode(charCode) {
    if (this._bufferLength === this._capacity) {
      this._flushBuffer();
    }
    this._buffer[this._bufferLength++] = charCode;
  }
  appendString(str) {
    const strLen = str.length;
    if (this._bufferLength + strLen >= this._capacity) {
      this._flushBuffer();
      this._completedStrings[this._completedStrings.length] = str;
      return;
    }
    for (let i = 0; i < strLen; i++) {
      this._buffer[this._bufferLength++] = str.charCodeAt(i);
    }
  }
}
export {
  StringBuilder,
  decodeUTF16LE,
  getPlatformTextDecoder
};
//# sourceMappingURL=stringBuilder.js.map
