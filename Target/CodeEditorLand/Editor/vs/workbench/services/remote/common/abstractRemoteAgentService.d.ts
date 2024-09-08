import { Disposable } from "../../../../base/common/lifecycle.js";
import type { IDiagnosticInfo, IDiagnosticInfoOptions } from "../../../../platform/diagnostics/common/diagnostics.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import type { IRemoteAgentEnvironment } from "../../../../platform/remote/common/remoteAgentEnvironment.js";
import { IRemoteAuthorityResolverService } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { IRemoteSocketFactoryService } from "../../../../platform/remote/common/remoteSocketFactoryService.js";
import { ISignService } from "../../../../platform/sign/common/sign.js";
import type { ITelemetryData, TelemetryLevel } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import type { IExtensionHostExitInfo, IRemoteAgentConnection, IRemoteAgentService } from "./remoteAgentService.js";
export declare abstract class AbstractRemoteAgentService extends Disposable implements IRemoteAgentService {
    private readonly remoteSocketFactoryService;
    private readonly userDataProfileService;
    protected readonly _environmentService: IWorkbenchEnvironmentService;
    private readonly _remoteAuthorityResolverService;
    readonly _serviceBrand: undefined;
    private readonly _connection;
    private _environment;
    constructor(remoteSocketFactoryService: IRemoteSocketFactoryService, userDataProfileService: IUserDataProfileService, _environmentService: IWorkbenchEnvironmentService, productService: IProductService, _remoteAuthorityResolverService: IRemoteAuthorityResolverService, signService: ISignService, logService: ILogService);
    getConnection(): IRemoteAgentConnection | null;
    getEnvironment(): Promise<IRemoteAgentEnvironment | null>;
    getRawEnvironment(): Promise<IRemoteAgentEnvironment | null>;
    getExtensionHostExitInfo(reconnectionToken: string): Promise<IExtensionHostExitInfo | null>;
    getDiagnosticInfo(options: IDiagnosticInfoOptions): Promise<IDiagnosticInfo | undefined>;
    updateTelemetryLevel(telemetryLevel: TelemetryLevel): Promise<void>;
    logTelemetry(eventName: string, data: ITelemetryData): Promise<void>;
    flushTelemetry(): Promise<void>;
    getRoundTripTime(): Promise<number | undefined>;
    endConnection(): Promise<void>;
    private _withChannel;
    private _withTelemetryChannel;
}
