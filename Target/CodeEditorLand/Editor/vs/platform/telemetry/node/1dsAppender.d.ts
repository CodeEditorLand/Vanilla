import { IRequestService } from "vs/platform/request/common/request";
import { AbstractOneDataSystemAppender, IAppInsightsCore } from "vs/platform/telemetry/common/1dsAppender";
export declare class OneDataSystemAppender extends AbstractOneDataSystemAppender {
    constructor(requestService: IRequestService | undefined, isInternalTelemetry: boolean, eventPrefix: string, defaultData: {
        [key: string]: any;
    } | null, iKeyOrClientFactory: string | (() => IAppInsightsCore));
}
