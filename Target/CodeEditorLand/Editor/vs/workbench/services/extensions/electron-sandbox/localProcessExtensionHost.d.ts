import { Event } from "vs/base/common/event";
import { IMessagePassingProtocol } from "vs/base/parts/ipc/common/ipc";
import { IExtensionHostDebugService } from "vs/platform/debug/common/extensionHostDebug";
import { IExtensionHostProcessOptions, IExtensionHostStarter } from "vs/platform/extensions/common/extensionHostStarter";
import { ILabelService } from "vs/platform/label/common/label";
import { ILoggerService, ILogService } from "vs/platform/log/common/log";
import { INativeHostService } from "vs/platform/native/common/native";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProductService } from "vs/platform/product/common/productService";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
import { IShellEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService";
import { LocalProcessRunningLocation } from "vs/workbench/services/extensions/common/extensionRunningLocation";
import { ExtensionHostExtensions, ExtensionHostStartup, IExtensionHost } from "vs/workbench/services/extensions/common/extensions";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
export interface ILocalProcessExtensionHostInitData {
    readonly extensions: ExtensionHostExtensions;
}
export interface ILocalProcessExtensionHostDataProvider {
    getInitData(): Promise<ILocalProcessExtensionHostInitData>;
}
export declare class ExtensionHostProcess {
    private readonly _extensionHostStarter;
    private readonly _id;
    get onStdout(): Event<string>;
    get onStderr(): Event<string>;
    get onMessage(): Event<any>;
    get onExit(): Event<{
        code: number;
        signal: string;
    }>;
    constructor(id: string, _extensionHostStarter: IExtensionHostStarter);
    start(opts: IExtensionHostProcessOptions): Promise<{
        pid: number | undefined;
    }>;
    enableInspectPort(): Promise<boolean>;
    kill(): Promise<void>;
}
export declare class NativeLocalProcessExtensionHost implements IExtensionHost {
    readonly runningLocation: LocalProcessRunningLocation;
    readonly startup: ExtensionHostStartup.EagerAutoStart | ExtensionHostStartup.EagerManualStart;
    private readonly _initDataProvider;
    private readonly _contextService;
    private readonly _notificationService;
    private readonly _nativeHostService;
    private readonly _lifecycleService;
    private readonly _environmentService;
    private readonly _userDataProfilesService;
    private readonly _telemetryService;
    private readonly _logService;
    private readonly _loggerService;
    private readonly _labelService;
    private readonly _extensionHostDebugService;
    private readonly _hostService;
    private readonly _productService;
    private readonly _shellEnvironmentService;
    private readonly _extensionHostStarter;
    pid: number | null;
    readonly remoteAuthority: null;
    extensions: ExtensionHostExtensions | null;
    private readonly _onExit;
    readonly onExit: Event<[number, string]>;
    private readonly _onDidSetInspectPort;
    private readonly _toDispose;
    private readonly _isExtensionDevHost;
    private readonly _isExtensionDevDebug;
    private readonly _isExtensionDevDebugBrk;
    private readonly _isExtensionDevTestFromCli;
    private _terminating;
    private _inspectListener;
    private _extensionHostProcess;
    private _messageProtocol;
    constructor(runningLocation: LocalProcessRunningLocation, startup: ExtensionHostStartup.EagerAutoStart | ExtensionHostStartup.EagerManualStart, _initDataProvider: ILocalProcessExtensionHostDataProvider, _contextService: IWorkspaceContextService, _notificationService: INotificationService, _nativeHostService: INativeHostService, _lifecycleService: ILifecycleService, _environmentService: INativeWorkbenchEnvironmentService, _userDataProfilesService: IUserDataProfilesService, _telemetryService: ITelemetryService, _logService: ILogService, _loggerService: ILoggerService, _labelService: ILabelService, _extensionHostDebugService: IExtensionHostDebugService, _hostService: IHostService, _productService: IProductService, _shellEnvironmentService: IShellEnvironmentService, _extensionHostStarter: IExtensionHostStarter);
    dispose(): void;
    start(): Promise<IMessagePassingProtocol>;
    private _start;
    /**
     * Find a free port if extension host debugging is enabled.
     */
    private _tryFindDebugPort;
    private _establishProtocol;
    private _performHandshake;
    private _createExtHostInitData;
    private _onExtHostProcessExit;
    private _handleProcessOutputStream;
    enableInspectPort(): Promise<boolean>;
    getInspectPort(): {
        port: number;
        host: string;
    } | undefined;
    private _onWillShutdown;
}
