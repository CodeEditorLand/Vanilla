import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { AdapterEndEvent, IDebugModel, IDebugSession } from "vs/workbench/contrib/debug/common/debug";
import { Debugger } from "vs/workbench/contrib/debug/common/debugger";
export declare class DebugTelemetry {
    private readonly model;
    private readonly telemetryService;
    constructor(model: IDebugModel, telemetryService: ITelemetryService);
    logDebugSessionStart(dbgr: Debugger, launchJsonExists: boolean): void;
    logDebugSessionStop(session: IDebugSession, adapterExitEvent: AdapterEndEvent): void;
}
