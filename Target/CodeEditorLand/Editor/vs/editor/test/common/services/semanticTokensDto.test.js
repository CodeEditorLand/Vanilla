var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { IFullSemanticTokensDto, IDeltaSemanticTokensDto, encodeSemanticTokensDto, ISemanticTokensDto, decodeSemanticTokensDto } from "../../../common/services/semanticTokensDto.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
suite("SemanticTokensDto", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function toArr(arr) {
    const result = [];
    for (let i = 0, len = arr.length; i < len; i++) {
      result[i] = arr[i];
    }
    return result;
  }
  __name(toArr, "toArr");
  function assertEqualFull(actual, expected) {
    const convert = /* @__PURE__ */ __name((dto) => {
      return {
        id: dto.id,
        type: dto.type,
        data: toArr(dto.data)
      };
    }, "convert");
    assert.deepStrictEqual(convert(actual), convert(expected));
  }
  __name(assertEqualFull, "assertEqualFull");
  function assertEqualDelta(actual, expected) {
    const convertOne = /* @__PURE__ */ __name((delta) => {
      if (!delta.data) {
        return delta;
      }
      return {
        start: delta.start,
        deleteCount: delta.deleteCount,
        data: toArr(delta.data)
      };
    }, "convertOne");
    const convert = /* @__PURE__ */ __name((dto) => {
      return {
        id: dto.id,
        type: dto.type,
        deltas: dto.deltas.map(convertOne)
      };
    }, "convert");
    assert.deepStrictEqual(convert(actual), convert(expected));
  }
  __name(assertEqualDelta, "assertEqualDelta");
  function testRoundTrip(value) {
    const decoded = decodeSemanticTokensDto(encodeSemanticTokensDto(value));
    if (value.type === "full" && decoded.type === "full") {
      assertEqualFull(decoded, value);
    } else if (value.type === "delta" && decoded.type === "delta") {
      assertEqualDelta(decoded, value);
    } else {
      assert.fail("wrong type");
    }
  }
  __name(testRoundTrip, "testRoundTrip");
  test("full encoding", () => {
    testRoundTrip({
      id: 12,
      type: "full",
      data: new Uint32Array([(1 << 24) + (2 << 16) + (3 << 8) + 4])
    });
  });
  test("delta encoding", () => {
    testRoundTrip({
      id: 12,
      type: "delta",
      deltas: [{
        start: 0,
        deleteCount: 4,
        data: void 0
      }, {
        start: 15,
        deleteCount: 0,
        data: new Uint32Array([(1 << 24) + (2 << 16) + (3 << 8) + 4])
      }, {
        start: 27,
        deleteCount: 5,
        data: new Uint32Array([(1 << 24) + (2 << 16) + (3 << 8) + 4, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      }]
    });
  });
  test("partial array buffer", () => {
    const sharedArr = new Uint32Array([
      (1 << 24) + (2 << 16) + (3 << 8) + 4,
      1,
      2,
      3,
      4,
      5,
      (1 << 24) + (2 << 16) + (3 << 8) + 4
    ]);
    testRoundTrip({
      id: 12,
      type: "delta",
      deltas: [{
        start: 0,
        deleteCount: 4,
        data: sharedArr.subarray(0, 1)
      }, {
        start: 15,
        deleteCount: 0,
        data: sharedArr.subarray(1, sharedArr.length)
      }]
    });
  });
  test("issue #94521: unusual backing array buffer", () => {
    function wrapAndSliceUint8Arry(buff, prefixLength, suffixLength) {
      const wrapped = new Uint8Array(prefixLength + buff.byteLength + suffixLength);
      wrapped.set(buff, prefixLength);
      return wrapped.subarray(prefixLength, prefixLength + buff.byteLength);
    }
    __name(wrapAndSliceUint8Arry, "wrapAndSliceUint8Arry");
    function wrapAndSlice(buff, prefixLength, suffixLength) {
      return VSBuffer.wrap(wrapAndSliceUint8Arry(buff.buffer, prefixLength, suffixLength));
    }
    __name(wrapAndSlice, "wrapAndSlice");
    const dto = {
      id: 5,
      type: "full",
      data: new Uint32Array([1, 2, 3, 4, 5])
    };
    const encoded = encodeSemanticTokensDto(dto);
    assertEqualFull(decodeSemanticTokensDto(wrapAndSlice(encoded, 1, 1)), dto);
    assertEqualFull(decodeSemanticTokensDto(wrapAndSlice(encoded, 1, 4)), dto);
    assertEqualFull(decodeSemanticTokensDto(wrapAndSlice(encoded, 4, 1)), dto);
    assertEqualFull(decodeSemanticTokensDto(wrapAndSlice(encoded, 4, 4)), dto);
  });
});
//# sourceMappingURL=semanticTokensDto.test.js.map
