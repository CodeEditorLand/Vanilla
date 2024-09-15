var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { LanguagesRegistry } from "../../../editor/common/services/languagesRegistry.js";
function assertCleanState() {
  assert.strictEqual(LanguagesRegistry.instanceCount, 0, "Error: Test run should not leak in LanguagesRegistry.");
}
__name(assertCleanState, "assertCleanState");
export {
  assertCleanState
};
//# sourceMappingURL=utils.js.map
