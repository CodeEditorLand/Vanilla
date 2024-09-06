import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEnvironmentMainService } from "vs/platform/environment/electron-main/environmentMainService";
import { ILifecycleMainService } from "vs/platform/lifecycle/electron-main/lifecycleMainService";
import { ILogService } from "vs/platform/log/common/log";
import { IReconnectConstants } from "vs/platform/terminal/common/terminal";
import { IPtyHostConnection, IPtyHostStarter } from "vs/platform/terminal/node/ptyHost";
export declare class ElectronPtyHostStarter extends Disposable implements IPtyHostStarter {
    private readonly _reconnectConstants;
    private readonly _configurationService;
    private readonly _environmentMainService;
    private readonly _lifecycleMainService;
    private readonly _logService;
    private utilityProcess;
    private readonly _onRequestConnection;
    readonly onRequestConnection: any;
    private readonly _onWillShutdown;
    readonly onWillShutdown: any;
    constructor(_reconnectConstants: IReconnectConstants, _configurationService: IConfigurationService, _environmentMainService: IEnvironmentMainService, _lifecycleMainService: ILifecycleMainService, _logService: ILogService);
    start(): IPtyHostConnection;
    private _createPtyHostConfiguration;
    private _onWindowConnection;
}
