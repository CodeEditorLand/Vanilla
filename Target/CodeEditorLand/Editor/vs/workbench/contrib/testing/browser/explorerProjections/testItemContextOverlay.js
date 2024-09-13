var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { TestId } from "../../common/testId.js";
import { capabilityContextKeys } from "../../common/testProfileService.js";
import { TestingContextKeys } from "../../common/testingContextKeys.js";
const getTestItemContextOverlay = /* @__PURE__ */ __name((test, capabilities) => {
  if (!test) {
    return [];
  }
  const testId = TestId.fromString(test.item.extId);
  return [
    [TestingContextKeys.testItemExtId.key, testId.localId],
    [TestingContextKeys.controllerId.key, test.controllerId],
    [TestingContextKeys.testItemHasUri.key, !!test.item.uri],
    ...capabilityContextKeys(capabilities)
  ];
}, "getTestItemContextOverlay");
export {
  getTestItemContextOverlay
};
//# sourceMappingURL=testItemContextOverlay.js.map
