import { SyncDescriptor } from "../../../platform/instantiation/common/descriptors.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IExtHostExtensionService } from "../common/extHostExtensionService.js";
import { ExtHostLogService } from "../common/extHostLogService.js";
import {
  ExtensionStoragePaths,
  IExtensionStoragePaths
} from "../common/extHostStoragePaths.js";
import { ExtHostExtensionService } from "./extHostExtensionService.js";
registerSingleton(
  ILogService,
  new SyncDescriptor(ExtHostLogService, [true], true)
);
registerSingleton(
  IExtHostExtensionService,
  ExtHostExtensionService,
  InstantiationType.Eager
);
registerSingleton(
  IExtensionStoragePaths,
  ExtensionStoragePaths,
  InstantiationType.Eager
);
//# sourceMappingURL=extHost.worker.services.js.map
