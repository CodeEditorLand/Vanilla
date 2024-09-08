import { TestId } from "../../common/testId.js";
import { capabilityContextKeys } from "../../common/testProfileService.js";
import { TestingContextKeys } from "../../common/testingContextKeys.js";
const getTestItemContextOverlay = (test, capabilities) => {
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
};
export {
  getTestItemContextOverlay
};
