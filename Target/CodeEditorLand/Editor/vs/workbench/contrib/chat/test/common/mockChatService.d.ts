import type { CancellationToken } from "../../../../../base/common/cancellation.js";
import type { Event } from "../../../../../base/common/event.js";
import type { URI } from "../../../../../base/common/uri.js";
import type { ChatAgentLocation } from "../../common/chatAgents.js";
import type { ChatModel, IChatModel, IChatRequestModel, IChatRequestVariableData, ISerializableChatData } from "../../common/chatModel.js";
import type { IParsedChatRequest } from "../../common/chatParserTypes.js";
import type { IChatCompleteResponse, IChatDetail, IChatProviderInfo, IChatSendRequestData, IChatSendRequestOptions, IChatService, IChatTransferredSessionData, IChatUserActionEvent } from "../../common/chatService.js";
export declare class MockChatService implements IChatService {
    _serviceBrand: undefined;
    transferredSessionData: IChatTransferredSessionData | undefined;
    isEnabled(location: ChatAgentLocation): boolean;
    hasSessions(): boolean;
    getProviderInfos(): IChatProviderInfo[];
    startSession(location: ChatAgentLocation, token: CancellationToken): ChatModel | undefined;
    getSession(sessionId: string): IChatModel | undefined;
    getOrRestoreSession(sessionId: string): IChatModel | undefined;
    loadSessionFromContent(data: ISerializableChatData): IChatModel | undefined;
    /**
     * Returns whether the request was accepted.
     */
    sendRequest(sessionId: string, message: string): Promise<IChatSendRequestData | undefined>;
    resendRequest(request: IChatRequestModel, options?: IChatSendRequestOptions | undefined): Promise<void>;
    adoptRequest(sessionId: string, request: IChatRequestModel): Promise<void>;
    removeRequest(sessionid: string, requestId: string): Promise<void>;
    cancelCurrentRequestForSession(sessionId: string): void;
    clearSession(sessionId: string): void;
    addCompleteRequest(sessionId: string, message: IParsedChatRequest | string, variableData: IChatRequestVariableData | undefined, attempt: number | undefined, response: IChatCompleteResponse): void;
    getHistory(): IChatDetail[];
    clearAllHistoryEntries(): void;
    removeHistoryEntry(sessionId: string): void;
    onDidPerformUserAction: Event<IChatUserActionEvent>;
    notifyUserAction(event: IChatUserActionEvent): void;
    onDidDisposeSession: Event<{
        sessionId: string;
        reason: "initializationFailed" | "cleared";
    }>;
    transferChatSession(transferredSessionData: IChatTransferredSessionData, toWorkspace: URI): void;
    setChatSessionTitle(sessionId: string, title: string): void;
}
