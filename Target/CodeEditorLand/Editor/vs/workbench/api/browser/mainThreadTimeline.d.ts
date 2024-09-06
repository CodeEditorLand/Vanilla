import { ILogService } from "vs/platform/log/common/log";
import { MainThreadTimelineShape } from "vs/workbench/api/common/extHost.protocol";
import { ITimelineService, TimelineChangeEvent, TimelineProviderDescriptor } from "vs/workbench/contrib/timeline/common/timeline";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
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
