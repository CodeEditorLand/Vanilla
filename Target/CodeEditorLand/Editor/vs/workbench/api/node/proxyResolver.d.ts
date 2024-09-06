import { ILogService } from "vs/platform/log/common/log";
import { MainThreadTelemetryShape } from "vs/workbench/api/common/extHost.protocol";
import { ExtHostConfigProvider } from "vs/workbench/api/common/extHostConfiguration";
import { IExtHostWorkspaceProvider } from "vs/workbench/api/common/extHostWorkspace";
import { ExtHostExtensionService } from "vs/workbench/api/node/extHostExtensionService";
import { IExtensionHostInitData } from "vs/workbench/services/extensions/common/extensionHostProtocol";
export declare function connectProxyResolver(extHostWorkspace: IExtHostWorkspaceProvider, configProvider: ExtHostConfigProvider, extensionService: ExtHostExtensionService, extHostLogService: ILogService, mainThreadTelemetry: MainThreadTelemetryShape, initData: IExtensionHostInitData): Promise<void>;
