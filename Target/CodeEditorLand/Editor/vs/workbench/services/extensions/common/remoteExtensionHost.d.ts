import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IMessagePassingProtocol } from "vs/base/parts/ipc/common/ipc";
import { IExtensionHostDebugService } from "vs/platform/debug/common/extensionHostDebug";
import { ILabelService } from "vs/platform/label/common/label";
import { ILoggerService, ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IRemoteAuthorityResolverService, IRemoteConnectionData } from "vs/platform/remote/common/remoteAuthorityResolver";
import { IRemoteSocketFactoryService } from "vs/platform/remote/common/remoteSocketFactoryService";
import { ISignService } from "vs/platform/sign/common/sign";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { RemoteRunningLocation } from "vs/workbench/services/extensions/common/extensionRunningLocation";
import { ExtensionHostExtensions, IExtensionHost } from "vs/workbench/services/extensions/common/extensions";
export interface IRemoteExtensionHostInitData {
    readonly connectionData: IRemoteConnectionData | null;
    readonly pid: number;
    readonly appRoot: URI;
    readonly extensionHostLogsPath: URI;
    readonly globalStorageHome: URI;
    readonly workspaceStorageHome: URI;
    readonly extensions: ExtensionHostExtensions;
}
export interface IRemoteExtensionHostDataProvider {
    readonly remoteAuthority: string;
    getInitData(): Promise<IRemoteExtensionHostInitData>;
}
export declare class RemoteExtensionHost extends Disposable implements IExtensionHost {
    readonly runningLocation: RemoteRunningLocation;
    private readonly _initDataProvider;
    private readonly remoteSocketFactoryService;
    private readonly _contextService;
    private readonly _environmentService;
    private readonly _telemetryService;
    private readonly _logService;
    protected readonly _loggerService: ILoggerService;
    private readonly _labelService;
    private readonly remoteAuthorityResolverService;
    private readonly _extensionHostDebugService;
    private readonly _productService;
    private readonly _signService;
    readonly pid: null;
    readonly remoteAuthority: string;
    readonly startup: any;
    extensions: ExtensionHostExtensions | null;
    private _onExit;
    readonly onExit: Event<[number, string | null]>;
    private _protocol;
    private _hasLostConnection;
    private _terminating;
    private _hasDisconnected;
    private readonly _isExtensionDevHost;
    constructor(runningLocation: RemoteRunningLocation, _initDataProvider: IRemoteExtensionHostDataProvider, remoteSocketFactoryService: IRemoteSocketFactoryService, _contextService: IWorkspaceContextService, _environmentService: IWorkbenchEnvironmentService, _telemetryService: ITelemetryService, _logService: ILogService, _loggerService: ILoggerService, _labelService: ILabelService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, _extensionHostDebugService: IExtensionHostDebugService, _productService: IProductService, _signService: ISignService);
    start(): Promise<IMessagePassingProtocol>;
    private _onExtHostConnectionLost;
    private _createExtHostInitData;
    getInspectPort(): undefined;
    enableInspectPort(): Promise<boolean>;
    disconnect(): Promise<void>;
    dispose(): void;
}
