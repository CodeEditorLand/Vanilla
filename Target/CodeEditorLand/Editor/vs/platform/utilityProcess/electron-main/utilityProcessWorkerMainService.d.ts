import { Disposable } from "vs/base/common/lifecycle";
import { ILifecycleMainService } from "vs/platform/lifecycle/electron-main/lifecycleMainService";
import { ILogService } from "vs/platform/log/common/log";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IOnDidTerminateUtilityrocessWorkerProcess, IUtilityProcessWorkerConfiguration, IUtilityProcessWorkerCreateConfiguration, IUtilityProcessWorkerService } from "vs/platform/utilityProcess/common/utilityProcessWorkerService";
import { IWindowsMainService } from "vs/platform/windows/electron-main/windows";
export declare const IUtilityProcessWorkerMainService: any;
export interface IUtilityProcessWorkerMainService extends IUtilityProcessWorkerService {
    readonly _serviceBrand: undefined;
}
export declare class UtilityProcessWorkerMainService extends Disposable implements IUtilityProcessWorkerMainService {
    private readonly logService;
    private readonly windowsMainService;
    private readonly telemetryService;
    private readonly lifecycleMainService;
    readonly _serviceBrand: undefined;
    private readonly workers;
    constructor(logService: ILogService, windowsMainService: IWindowsMainService, telemetryService: ITelemetryService, lifecycleMainService: ILifecycleMainService);
    createWorker(configuration: IUtilityProcessWorkerCreateConfiguration): Promise<IOnDidTerminateUtilityrocessWorkerProcess>;
    private hash;
    disposeWorker(configuration: IUtilityProcessWorkerConfiguration): Promise<void>;
}
