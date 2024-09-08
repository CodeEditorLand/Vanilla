import assert from "assert";
import { LanguagesRegistry } from "../../../editor/common/services/languagesRegistry.js";
function assertCleanState() {
  assert.strictEqual(
    LanguagesRegistry.instanceCount,
    0,
    "Error: Test run should not leak in LanguagesRegistry."
  );
}
export {
  assertCleanState
};
