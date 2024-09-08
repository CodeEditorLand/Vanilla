import assert from "assert";
import {
  VSBuffer,
  decodeBase64,
  encodeBase64
} from "../../../../../base/common/buffer.js";
import { Emitter } from "../../../../../base/common/event.js";
import {
  mockObject
} from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { MemoryRangeType } from "../../common/debug.js";
import { MemoryRegion } from "../../common/debugModel.js";
suite("Debug - Memory", () => {
  const dapResponseCommon = {
    command: "someCommand",
    type: "response",
    seq: 1,
    request_seq: 1,
    success: true
  };
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("MemoryRegion", () => {
    let memory;
    let unreadable;
    let invalidateMemoryEmitter;
    let session;
    let region;
    setup(() => {
      const memoryBuf = new Uint8Array(1024);
      for (let i = 0; i < memoryBuf.length; i++) {
        memoryBuf[i] = i;
      }
      memory = VSBuffer.wrap(memoryBuf);
      invalidateMemoryEmitter = new Emitter();
      unreadable = 0;
      session = mockObject()({
        onDidInvalidateMemory: invalidateMemoryEmitter.event
      });
      session.readMemory.callsFake(
        (ref, fromOffset, count) => {
          const res = {
            ...dapResponseCommon,
            body: {
              address: "0",
              data: encodeBase64(
                memory.slice(
                  fromOffset,
                  fromOffset + Math.max(0, count - unreadable)
                )
              ),
              unreadableBytes: unreadable
            }
          };
          unreadable = 0;
          return Promise.resolve(res);
        }
      );
      session.writeMemory.callsFake(
        (ref, fromOffset, data) => {
          const decoded = decodeBase64(data);
          for (let i = 0; i < decoded.byteLength; i++) {
            memory.buffer[fromOffset + i] = decoded.buffer[i];
          }
          return {
            ...dapResponseCommon,
            body: {
              bytesWritten: decoded.byteLength,
              offset: fromOffset
            }
          };
        }
      );
      region = new MemoryRegion("ref", session);
    });
    teardown(() => {
      region.dispose();
    });
    test("reads a simple range", async () => {
      assert.deepStrictEqual(await region.read(10, 14), [
        {
          type: MemoryRangeType.Valid,
          offset: 10,
          length: 4,
          data: VSBuffer.wrap(new Uint8Array([10, 11, 12, 13]))
        }
      ]);
    });
    test("reads a non-contiguous range", async () => {
      unreadable = 3;
      assert.deepStrictEqual(await region.read(10, 14), [
        {
          type: MemoryRangeType.Valid,
          offset: 10,
          length: 1,
          data: VSBuffer.wrap(new Uint8Array([10]))
        },
        { type: MemoryRangeType.Unreadable, offset: 11, length: 3 }
      ]);
    });
  });
});
