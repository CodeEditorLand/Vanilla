import { IExtHostWorkspaceProvider } from '../common/extHostWorkspace.js';
import { ExtHostConfigProvider } from '../common/extHostConfiguration.js';
import { MainThreadTelemetryShape } from '../common/extHost.protocol.js';
import { IExtensionHostInitData } from '../../services/extensions/common/extensionHostProtocol.js';
import { ExtHostExtensionService } from './extHostExtensionService.js';
import { ILogService } from '../../../platform/log/common/log.js';
export declare function connectProxyResolver(extHostWorkspace: IExtHostWorkspaceProvider, configProvider: ExtHostConfigProvider, extensionService: ExtHostExtensionService, extHostLogService: ILogService, mainThreadTelemetry: MainThreadTelemetryShape, initData: IExtensionHostInitData): Promise<void>;
