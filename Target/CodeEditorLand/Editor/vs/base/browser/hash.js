var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../common/buffer.js";
import { StringSHA1, toHexString } from "../common/hash.js";
async function sha1Hex(str) {
  if (globalThis?.crypto?.subtle) {
    const buffer = VSBuffer.fromString(str, {
      dontUseNodeBuffer: true
    }).buffer;
    const hash = await globalThis.crypto.subtle.digest(
      { name: "sha-1" },
      buffer
    );
    return toHexString(hash);
  } else {
    const computer = new StringSHA1();
    computer.update(str);
    return computer.digest();
  }
}
__name(sha1Hex, "sha1Hex");
export {
  sha1Hex
};
//# sourceMappingURL=hash.js.map
