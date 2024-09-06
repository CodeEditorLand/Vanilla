import { ILogService } from "vs/platform/log/common/log";
import { IStateService } from "vs/platform/state/node/state";
export declare function resolveMachineId(stateService: IStateService, logService: ILogService): Promise<string>;
export declare function resolveSqmId(stateService: IStateService, logService: ILogService): Promise<string>;
export declare function resolvedevDeviceId(stateService: IStateService, logService: ILogService): Promise<string>;
