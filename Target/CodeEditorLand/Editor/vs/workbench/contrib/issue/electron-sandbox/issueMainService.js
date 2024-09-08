import { registerMainProcessRemoteService } from "../../../../platform/ipc/electron-sandbox/services.js";
import {
  IIssueMainService,
  IProcessMainService
} from "../../../../platform/issue/common/issue.js";
registerMainProcessRemoteService(IIssueMainService, "issue");
registerMainProcessRemoteService(IProcessMainService, "process");
