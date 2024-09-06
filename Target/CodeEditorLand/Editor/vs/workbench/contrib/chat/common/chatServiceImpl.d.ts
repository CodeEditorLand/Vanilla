import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ChatAgentLocation, IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { ChatModel, IChatModel, IChatRequestModel, IChatRequestVariableData, IExportableChatData, ISerializableChatData } from "vs/workbench/contrib/chat/common/chatModel";
import { IParsedChatRequest } from "vs/workbench/contrib/chat/common/chatParserTypes";
import { IChatCompleteResponse, IChatDetail, IChatSendRequestData, IChatSendRequestOptions, IChatService, IChatTransferredSessionData, IChatUserActionEvent } from "vs/workbench/contrib/chat/common/chatService";
import { IChatSlashCommandService } from "vs/workbench/contrib/chat/common/chatSlashCommands";
import { IChatVariablesService } from "vs/workbench/contrib/chat/common/chatVariables";
import { IWorkbenchAssignmentService } from "vs/workbench/services/assignment/common/assignmentService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare class ChatService extends Disposable implements IChatService {
    private readonly storageService;
    private readonly logService;
    private readonly extensionService;
    private readonly instantiationService;
    private readonly telemetryService;
    private readonly workspaceContextService;
    private readonly chatSlashCommandService;
    private readonly chatVariablesService;
    private readonly chatAgentService;
    private readonly configurationService;
    _serviceBrand: undefined;
    private readonly _sessionModels;
    private readonly _pendingRequests;
    private _persistedSessions;
    /** Just for empty windows, need to enforce that a chat was deleted, even though other windows still have it */
    private _deletedChatIds;
    private _transferredSessionData;
    get transferredSessionData(): IChatTransferredSessionData | undefined;
    private readonly _onDidPerformUserAction;
    readonly onDidPerformUserAction: Event<IChatUserActionEvent>;
    private readonly _onDidDisposeSession;
    readonly onDidDisposeSession: any;
    private readonly _sessionFollowupCancelTokens;
    private readonly _chatServiceTelemetry;
    constructor(storageService: IStorageService, logService: ILogService, extensionService: IExtensionService, instantiationService: IInstantiationService, telemetryService: ITelemetryService, workspaceContextService: IWorkspaceContextService, chatSlashCommandService: IChatSlashCommandService, chatVariablesService: IChatVariablesService, chatAgentService: IChatAgentService, workbenchAssignmentService: IWorkbenchAssignmentService, contextKeyService: IContextKeyService, configurationService: IConfigurationService);
    isEnabled(location: ChatAgentLocation): boolean;
    private saveState;
    private syncEmptyWindowChats;
    notifyUserAction(action: IChatUserActionEvent): void;
    setChatSessionTitle(sessionId: string, title: string): void;
    private trace;
    private error;
    private deserializeChats;
    private getTransferredSessionData;
    /**
     * Returns an array of chat details for all persisted chat sessions that have at least one request.
     * The array is sorted by creation date in descending order.
     * Chat sessions that have already been loaded into the chat view are excluded from the result.
     * Imported chat sessions are also excluded from the result.
     */
    getHistory(): IChatDetail[];
    removeHistoryEntry(sessionId: string): void;
    clearAllHistoryEntries(): void;
    startSession(location: ChatAgentLocation, token: CancellationToken): ChatModel;
    private _startSession;
    private initializeSession;
    getSession(sessionId: string): IChatModel | undefined;
    getOrRestoreSession(sessionId: string): ChatModel | undefined;
    loadSessionFromContent(data: IExportableChatData | ISerializableChatData): IChatModel | undefined;
    resendRequest(request: IChatRequestModel, options?: IChatSendRequestOptions): Promise<void>;
    sendRequest(sessionId: string, request: string, options?: IChatSendRequestOptions): Promise<IChatSendRequestData | undefined>;
    private parseChatRequest;
    private refreshFollowupsCancellationToken;
    private _sendRequestAsync;
    private getHistoryEntriesFromModel;
    removeRequest(sessionId: string, requestId: string): Promise<void>;
    adoptRequest(sessionId: string, request: IChatRequestModel): Promise<void>;
    addCompleteRequest(sessionId: string, message: IParsedChatRequest | string, variableData: IChatRequestVariableData | undefined, attempt: number | undefined, response: IChatCompleteResponse): Promise<void>;
    cancelCurrentRequestForSession(sessionId: string): void;
    clearSession(sessionId: string): void;
    hasSessions(): boolean;
    transferChatSession(transferredSessionData: IChatTransferredSessionData, toWorkspace: URI): void;
}
