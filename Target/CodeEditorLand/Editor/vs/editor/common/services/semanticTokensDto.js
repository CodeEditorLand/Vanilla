import { VSBuffer } from "../../../base/common/buffer.js";
import * as platform from "../../../base/common/platform.js";
var EncodedSemanticTokensType = /* @__PURE__ */ ((EncodedSemanticTokensType2) => {
  EncodedSemanticTokensType2[EncodedSemanticTokensType2["Full"] = 1] = "Full";
  EncodedSemanticTokensType2[EncodedSemanticTokensType2["Delta"] = 2] = "Delta";
  return EncodedSemanticTokensType2;
})(EncodedSemanticTokensType || {});
function reverseEndianness(arr) {
  for (let i = 0, len = arr.length; i < len; i += 4) {
    const b0 = arr[i + 0];
    const b1 = arr[i + 1];
    const b2 = arr[i + 2];
    const b3 = arr[i + 3];
    arr[i + 0] = b3;
    arr[i + 1] = b2;
    arr[i + 2] = b1;
    arr[i + 3] = b0;
  }
}
function toLittleEndianBuffer(arr) {
  const uint8Arr = new Uint8Array(arr.buffer, arr.byteOffset, arr.length * 4);
  if (!platform.isLittleEndian()) {
    reverseEndianness(uint8Arr);
  }
  return VSBuffer.wrap(uint8Arr);
}
function fromLittleEndianBuffer(buff) {
  const uint8Arr = buff.buffer;
  if (!platform.isLittleEndian()) {
    reverseEndianness(uint8Arr);
  }
  if (uint8Arr.byteOffset % 4 === 0) {
    return new Uint32Array(
      uint8Arr.buffer,
      uint8Arr.byteOffset,
      uint8Arr.length / 4
    );
  } else {
    const data = new Uint8Array(uint8Arr.byteLength);
    data.set(uint8Arr);
    return new Uint32Array(data.buffer, data.byteOffset, data.length / 4);
  }
}
function encodeSemanticTokensDto(semanticTokens) {
  const dest = new Uint32Array(encodeSemanticTokensDtoSize(semanticTokens));
  let offset = 0;
  dest[offset++] = semanticTokens.id;
  if (semanticTokens.type === "full") {
    dest[offset++] = 1 /* Full */;
    dest[offset++] = semanticTokens.data.length;
    dest.set(semanticTokens.data, offset);
    offset += semanticTokens.data.length;
  } else {
    dest[offset++] = 2 /* Delta */;
    dest[offset++] = semanticTokens.deltas.length;
    for (const delta of semanticTokens.deltas) {
      dest[offset++] = delta.start;
      dest[offset++] = delta.deleteCount;
      if (delta.data) {
        dest[offset++] = delta.data.length;
        dest.set(delta.data, offset);
        offset += delta.data.length;
      } else {
        dest[offset++] = 0;
      }
    }
  }
  return toLittleEndianBuffer(dest);
}
function encodeSemanticTokensDtoSize(semanticTokens) {
  let result = 0;
  result += 1 + // id
  1;
  if (semanticTokens.type === "full") {
    result += 1 + // data length
    semanticTokens.data.length;
  } else {
    result += 1;
    result += (1 + // start
    1 + // deleteCount
    1) * // data length
    semanticTokens.deltas.length;
    for (const delta of semanticTokens.deltas) {
      if (delta.data) {
        result += delta.data.length;
      }
    }
  }
  return result;
}
function decodeSemanticTokensDto(_buff) {
  const src = fromLittleEndianBuffer(_buff);
  let offset = 0;
  const id = src[offset++];
  const type = src[offset++];
  if (type === 1 /* Full */) {
    const length = src[offset++];
    const data = src.subarray(offset, offset + length);
    offset += length;
    return {
      id,
      type: "full",
      data
    };
  }
  const deltaCount = src[offset++];
  const deltas = [];
  for (let i = 0; i < deltaCount; i++) {
    const start = src[offset++];
    const deleteCount = src[offset++];
    const length = src[offset++];
    let data;
    if (length > 0) {
      data = src.subarray(offset, offset + length);
      offset += length;
    }
    deltas[i] = { start, deleteCount, data };
  }
  return {
    id,
    type: "delta",
    deltas
  };
}
export {
  decodeSemanticTokensDto,
  encodeSemanticTokensDto
};
