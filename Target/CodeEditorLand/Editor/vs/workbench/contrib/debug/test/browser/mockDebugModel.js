var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import { DebugModel } from "../../common/debugModel.js";
import { MockDebugStorage } from "../common/mockDebug.js";
import { TestFileService } from "../../../../test/browser/workbenchTestServices.js";
import { TestStorageService } from "../../../../test/common/workbenchTestServices.js";
const fileService = new TestFileService();
const mockUriIdentityService = new UriIdentityService(fileService);
function createMockDebugModel(disposable) {
  const storage = disposable.add(new TestStorageService());
  const debugStorage = disposable.add(new MockDebugStorage(storage));
  return disposable.add(new DebugModel(debugStorage, { isDirty: /* @__PURE__ */ __name((e) => false, "isDirty") }, mockUriIdentityService, new NullLogService()));
}
__name(createMockDebugModel, "createMockDebugModel");
export {
  createMockDebugModel,
  mockUriIdentityService
};
//# sourceMappingURL=mockDebugModel.js.map
