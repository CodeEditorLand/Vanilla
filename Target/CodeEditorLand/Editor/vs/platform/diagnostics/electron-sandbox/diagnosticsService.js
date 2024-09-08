import { registerSharedProcessRemoteService } from "../../ipc/electron-sandbox/services.js";
import { IDiagnosticsService } from "../common/diagnostics.js";
registerSharedProcessRemoteService(IDiagnosticsService, "diagnostics");
