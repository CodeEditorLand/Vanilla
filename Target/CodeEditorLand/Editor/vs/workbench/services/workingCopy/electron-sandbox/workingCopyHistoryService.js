import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IWorkingCopyHistoryService } from "../common/workingCopyHistory.js";
import { NativeWorkingCopyHistoryService } from "../common/workingCopyHistoryService.js";
registerSingleton(
  IWorkingCopyHistoryService,
  NativeWorkingCopyHistoryService,
  InstantiationType.Delayed
);
