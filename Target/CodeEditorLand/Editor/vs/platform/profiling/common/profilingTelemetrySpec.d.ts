import type { ILogService } from "../../log/common/log.js";
import type { ITelemetryService } from "../../telemetry/common/telemetry.js";
import type { BottomUpSample } from "./profilingModel.js";
export interface SampleData {
    perfBaseline: number;
    sample: BottomUpSample;
    source: string;
}
export declare function reportSample(data: SampleData, telemetryService: ITelemetryService, logService: ILogService, sendAsErrorTelemtry: boolean): void;
