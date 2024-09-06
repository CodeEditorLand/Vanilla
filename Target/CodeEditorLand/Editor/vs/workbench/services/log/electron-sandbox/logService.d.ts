import { LoggerChannelClient } from "vs/platform/log/common/logIpc";
import { LogService } from "vs/platform/log/common/logService";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
export declare class NativeLogService extends LogService {
    constructor(loggerService: LoggerChannelClient, environmentService: INativeWorkbenchEnvironmentService);
}
