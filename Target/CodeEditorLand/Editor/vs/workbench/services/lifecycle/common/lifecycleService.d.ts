import { Disposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ILifecycleService, LifecyclePhase, ShutdownReason, StartupKind } from "vs/workbench/services/lifecycle/common/lifecycle";
export declare abstract class AbstractLifecycleService extends Disposable implements ILifecycleService {
    protected readonly logService: ILogService;
    protected readonly storageService: IStorageService;
    private static readonly LAST_SHUTDOWN_REASON_KEY;
    readonly _serviceBrand: undefined;
    protected readonly _onBeforeShutdown: any;
    readonly onBeforeShutdown: any;
    protected readonly _onWillShutdown: any;
    readonly onWillShutdown: any;
    protected readonly _onDidShutdown: any;
    readonly onDidShutdown: any;
    protected readonly _onBeforeShutdownError: any;
    readonly onBeforeShutdownError: any;
    protected readonly _onShutdownVeto: any;
    readonly onShutdownVeto: any;
    private _startupKind;
    get startupKind(): StartupKind;
    private _phase;
    get phase(): LifecyclePhase;
    private readonly phaseWhen;
    protected shutdownReason: ShutdownReason | undefined;
    constructor(logService: ILogService, storageService: IStorageService);
    private resolveStartupKind;
    protected doResolveStartupKind(): StartupKind | undefined;
    set phase(value: LifecyclePhase);
    when(phase: LifecyclePhase): Promise<void>;
    /**
     * Subclasses to implement the explicit shutdown method.
     */
    abstract shutdown(): Promise<void>;
}
