import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { ISharedProcessLifecycleService } from "vs/platform/lifecycle/node/sharedProcessLifecycleService";
import { ILoggerService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { ActiveTunnelMode, IRemoteTunnelService, TunnelMode, TunnelStatus } from "vs/platform/remoteTunnel/common/remoteTunnel";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
/**
 * This service runs on the shared service. It is running the `code-tunnel` command
 * to make the current machine available for remote access.
 */
export declare class RemoteTunnelService extends Disposable implements IRemoteTunnelService {
    private readonly telemetryService;
    private readonly productService;
    private readonly environmentService;
    private readonly configurationService;
    private readonly storageService;
    readonly _serviceBrand: undefined;
    private readonly _onDidTokenFailedEmitter;
    readonly onDidTokenFailed: any;
    private readonly _onDidChangeTunnelStatusEmitter;
    readonly onDidChangeTunnelStatus: any;
    private readonly _onDidChangeModeEmitter;
    readonly onDidChangeMode: any;
    private readonly _logger;
    /**
     * "Mode" in the terminal state we want to get to -- started, stopped, and
     * the attributes associated with each.
     *
     * At any given time, work may be ongoing to get `_tunnelStatus` into a
     * state that reflects the desired `mode`.
     */
    private _mode;
    private _tunnelProcess;
    private _tunnelStatus;
    private _startTunnelProcessDelayer;
    private _tunnelCommand;
    private _initialized;
    constructor(telemetryService: ITelemetryService, productService: IProductService, environmentService: INativeEnvironmentService, loggerService: ILoggerService, sharedProcessLifecycleService: ISharedProcessLifecycleService, configurationService: IConfigurationService, storageService: IStorageService);
    getTunnelStatus(): Promise<TunnelStatus>;
    private setTunnelStatus;
    private setMode;
    getMode(): Promise<TunnelMode>;
    initialize(mode: TunnelMode): Promise<TunnelStatus>;
    private readonly defaultOnOutput;
    private getTunnelCommandLocation;
    startTunnel(mode: ActiveTunnelMode): Promise<TunnelStatus>;
    stopTunnel(): Promise<void>;
    private updateTunnelProcess;
    private installTunnelService;
    private serverOrAttachTunnel;
    private runCodeTunnelCommand;
    getTunnelName(): Promise<string | undefined>;
    private _preventSleep;
    private _getTunnelName;
    private _restoreMode;
    private _storeMode;
}
