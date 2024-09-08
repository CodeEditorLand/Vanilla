import type { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { type Event } from "../../../../base/common/event.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { type ITimelineService, type TimelineChangeEvent, type TimelineOptions, type TimelineProvider, type TimelineProvidersChangeEvent } from "./timeline.js";
export declare const TimelineHasProviderContext: RawContextKey<boolean>;
export declare class TimelineService implements ITimelineService {
    private readonly logService;
    protected viewsService: IViewsService;
    protected configurationService: IConfigurationService;
    protected contextKeyService: IContextKeyService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeProviders;
    readonly onDidChangeProviders: Event<TimelineProvidersChangeEvent>;
    private readonly _onDidChangeTimeline;
    readonly onDidChangeTimeline: Event<TimelineChangeEvent>;
    private readonly _onDidChangeUri;
    readonly onDidChangeUri: Event<URI>;
    private readonly hasProviderContext;
    private readonly providers;
    private readonly providerSubscriptions;
    constructor(logService: ILogService, viewsService: IViewsService, configurationService: IConfigurationService, contextKeyService: IContextKeyService);
    getSources(): {
        id: string;
        label: string;
    }[];
    getTimeline(id: string, uri: URI, options: TimelineOptions, tokenSource: CancellationTokenSource): {
        result: Promise<import("./timeline.js").Timeline | undefined>;
        options: TimelineOptions;
        source: string;
        tokenSource: CancellationTokenSource;
        uri: URI;
    } | undefined;
    registerTimelineProvider(provider: TimelineProvider): IDisposable;
    unregisterTimelineProvider(id: string): void;
    setUri(uri: URI): void;
    private updateHasProviderContext;
}
