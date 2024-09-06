import { ILogService } from "vs/platform/log/common/log";
import { IStateReadService } from "vs/platform/state/node/state";
export declare function resolveMachineId(stateService: IStateReadService, logService: ILogService): Promise<string>;
export declare function resolveSqmId(stateService: IStateReadService, logService: ILogService): Promise<string>;
export declare function resolvedevDeviceId(stateService: IStateReadService, logService: ILogService): Promise<string>;
