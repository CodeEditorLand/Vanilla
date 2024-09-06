import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IMessagePassingProtocol } from "vs/base/parts/ipc/common/ipc";
import { ILabelService } from "vs/platform/label/common/label";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { ILoggerService, ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { LocalWebWorkerRunningLocation } from "vs/workbench/services/extensions/common/extensionRunningLocation";
import { ExtensionHostExtensions, ExtensionHostStartup, IExtensionHost } from "vs/workbench/services/extensions/common/extensions";
export interface IWebWorkerExtensionHostInitData {
    readonly extensions: ExtensionHostExtensions;
}
export interface IWebWorkerExtensionHostDataProvider {
    getInitData(): Promise<IWebWorkerExtensionHostInitData>;
}
export declare class WebWorkerExtensionHost extends Disposable implements IExtensionHost {
    readonly runningLocation: LocalWebWorkerRunningLocation;
    readonly startup: ExtensionHostStartup;
    private readonly _initDataProvider;
    private readonly _telemetryService;
    private readonly _contextService;
    private readonly _labelService;
    private readonly _logService;
    private readonly _loggerService;
    private readonly _environmentService;
    private readonly _userDataProfilesService;
    private readonly _productService;
    private readonly _layoutService;
    private readonly _storageService;
    readonly pid: null;
    readonly remoteAuthority: null;
    extensions: ExtensionHostExtensions | null;
    private readonly _onDidExit;
    readonly onExit: Event<[number, string | null]>;
    private _isTerminating;
    private _protocolPromise;
    private _protocol;
    private readonly _extensionHostLogsLocation;
    constructor(runningLocation: LocalWebWorkerRunningLocation, startup: ExtensionHostStartup, _initDataProvider: IWebWorkerExtensionHostDataProvider, _telemetryService: ITelemetryService, _contextService: IWorkspaceContextService, _labelService: ILabelService, _logService: ILogService, _loggerService: ILoggerService, _environmentService: IBrowserWorkbenchEnvironmentService, _userDataProfilesService: IUserDataProfilesService, _productService: IProductService, _layoutService: ILayoutService, _storageService: IStorageService);
    private _getWebWorkerExtensionHostIframeSrc;
    start(): Promise<IMessagePassingProtocol>;
    private _startInsideIframe;
    private _performHandshake;
    dispose(): void;
    getInspectPort(): undefined;
    enableInspectPort(): Promise<boolean>;
    private _createExtHostInitData;
}
