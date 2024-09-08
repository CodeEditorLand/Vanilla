import { type ILogService } from "../../../platform/log/common/log.js";
import type { IExtensionHostInitData } from "../../services/extensions/common/extensionHostProtocol.js";
import type { MainThreadTelemetryShape } from "../common/extHost.protocol.js";
import type { ExtHostConfigProvider } from "../common/extHostConfiguration.js";
import type { IExtHostWorkspaceProvider } from "../common/extHostWorkspace.js";
import type { ExtHostExtensionService } from "./extHostExtensionService.js";
export declare function connectProxyResolver(extHostWorkspace: IExtHostWorkspaceProvider, configProvider: ExtHostConfigProvider, extensionService: ExtHostExtensionService, extHostLogService: ILogService, mainThreadTelemetry: MainThreadTelemetryShape, initData: IExtensionHostInitData): Promise<void>;
