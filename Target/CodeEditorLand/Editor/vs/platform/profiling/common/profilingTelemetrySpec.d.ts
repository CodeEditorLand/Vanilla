import { ILogService } from "../../log/common/log.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { BottomUpSample } from "./profilingModel.js";
export interface SampleData {
    perfBaseline: number;
    sample: BottomUpSample;
    source: string;
}
export declare function reportSample(data: SampleData, telemetryService: ITelemetryService, logService: ILogService, sendAsErrorTelemtry: boolean): void;
