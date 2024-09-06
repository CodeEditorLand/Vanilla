import { ILogService } from "../../../platform/log/common/log.js";
import { ITimelineService, TimelineChangeEvent, TimelineProviderDescriptor } from "../../contrib/timeline/common/timeline.js";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadTimelineShape } from "../common/extHost.protocol.js";
export declare class MainThreadTimeline implements MainThreadTimelineShape {
    private readonly logService;
    private readonly _timelineService;
    private readonly _proxy;
    private readonly _providerEmitters;
    constructor(context: IExtHostContext, logService: ILogService, _timelineService: ITimelineService);
    $registerTimelineProvider(provider: TimelineProviderDescriptor): void;
    $unregisterTimelineProvider(id: string): void;
    $emitTimelineChangeEvent(e: TimelineChangeEvent): void;
    dispose(): void;
}
