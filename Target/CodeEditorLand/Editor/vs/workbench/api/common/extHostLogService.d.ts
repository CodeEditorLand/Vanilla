import { ILoggerService } from "vs/platform/log/common/log";
import { LogService } from "vs/platform/log/common/logService";
import { IExtHostInitDataService } from "vs/workbench/api/common/extHostInitDataService";
export declare class ExtHostLogService extends LogService {
    readonly _serviceBrand: undefined;
    constructor(isWorker: boolean, loggerService: ILoggerService, initData: IExtHostInitDataService);
}
