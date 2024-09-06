import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IChatUserActionEvent } from "vs/workbench/contrib/chat/common/chatService";
export declare class ChatServiceTelemetry {
    private readonly telemetryService;
    constructor(telemetryService: ITelemetryService);
    notifyUserAction(action: IChatUserActionEvent): void;
    retrievedFollowups(agentId: string, command: string | undefined, numFollowups: number): void;
}
