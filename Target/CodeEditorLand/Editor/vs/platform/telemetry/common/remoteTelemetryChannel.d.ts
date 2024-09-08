import type { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import type { IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import type { IServerTelemetryService } from "./serverTelemetryService.js";
import type { ITelemetryAppender } from "./telemetryUtils.js";
export declare class ServerTelemetryChannel extends Disposable implements IServerChannel {
    private readonly telemetryService;
    private readonly telemetryAppender;
    constructor(telemetryService: IServerTelemetryService, telemetryAppender: ITelemetryAppender | null);
    call(_: any, command: string, arg?: any): Promise<any>;
    listen(_: any, event: string, arg: any): Event<any>;
    /**
     * Disposing the channel also disables the telemetryService as there is
     * no longer a way to control it
     */
    dispose(): void;
}