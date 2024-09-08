import { NullLogService } from "../../../../../platform/log/common/log.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import { TestFileService } from "../../../../test/browser/workbenchTestServices.js";
import { TestStorageService } from "../../../../test/common/workbenchTestServices.js";
import { DebugModel } from "../../common/debugModel.js";
import { MockDebugStorage } from "../common/mockDebug.js";
const fileService = new TestFileService();
const mockUriIdentityService = new UriIdentityService(fileService);
function createMockDebugModel(disposable) {
  const storage = disposable.add(new TestStorageService());
  const debugStorage = disposable.add(new MockDebugStorage(storage));
  return disposable.add(
    new DebugModel(
      debugStorage,
      { isDirty: (e) => false },
      mockUriIdentityService,
      new NullLogService()
    )
  );
}
export {
  createMockDebugModel,
  mockUriIdentityService
};
