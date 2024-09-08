import type * as vscode from "vscode";
import type { CancellationToken } from "../../../base/common/cancellation.js";
import type { IMarkdownString } from "../../../base/common/htmlContent.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { type IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import type { ILogService } from "../../../platform/log/common/log.js";
import { ChatAgentLocation, type IChatAgentRequest, type IChatAgentResult } from "../../contrib/chat/common/chatAgents.js";
import { type IChatFollowup, type IChatUserActionEvent, type IChatVoteAction } from "../../contrib/chat/common/chatService.js";
import type { Dto } from "../../services/extensions/common/proxyIdentifier.js";
import { type ExtHostChatAgentsShape2, type IChatAgentCompletionItem, type IChatAgentHistoryEntryDto, type IMainContext } from "./extHost.protocol.js";
import type { ExtHostCommands } from "./extHostCommands.js";
import type { ExtHostDocuments } from "./extHostDocuments.js";
export declare class ExtHostChatAgents2 extends Disposable implements ExtHostChatAgentsShape2 {
    private readonly _logService;
    private readonly _commands;
    private readonly _documents;
    private static _idPool;
    private readonly _agents;
    private readonly _proxy;
    private static _participantDetectionProviderIdPool;
    private readonly _participantDetectionProviders;
    private readonly _sessionDisposables;
    private readonly _completionDisposables;
    constructor(mainContext: IMainContext, _logService: ILogService, _commands: ExtHostCommands, _documents: ExtHostDocuments);
    transferActiveChat(newWorkspace: vscode.Uri): void;
    createChatAgent(extension: IExtensionDescription, id: string, handler: vscode.ChatExtendedRequestHandler): vscode.ChatParticipant;
    createDynamicChatAgent(extension: IExtensionDescription, id: string, dynamicProps: vscode.DynamicChatParticipantProps, handler: vscode.ChatExtendedRequestHandler): vscode.ChatParticipant;
    registerChatParticipantDetectionProvider(provider: vscode.ChatParticipantDetectionProvider): vscode.Disposable;
    $detectChatParticipant(handle: number, requestDto: Dto<IChatAgentRequest>, context: {
        history: IChatAgentHistoryEntryDto[];
    }, options: {
        location: ChatAgentLocation;
        participants?: vscode.ChatParticipantMetadata[];
    }, token: CancellationToken): Promise<vscode.ChatParticipantDetectionResult | null | undefined>;
    private _createRequest;
    $invokeAgent(handle: number, requestDto: Dto<IChatAgentRequest>, context: {
        history: IChatAgentHistoryEntryDto[];
    }, token: CancellationToken): Promise<IChatAgentResult | undefined>;
    private prepareHistoryTurns;
    $releaseSession(sessionId: string): void;
    $provideFollowups(requestDto: Dto<IChatAgentRequest>, handle: number, result: IChatAgentResult, context: {
        history: IChatAgentHistoryEntryDto[];
    }, token: CancellationToken): Promise<IChatFollowup[]>;
    $acceptFeedback(handle: number, result: IChatAgentResult, voteAction: IChatVoteAction): void;
    $acceptAction(handle: number, result: IChatAgentResult, event: IChatUserActionEvent): void;
    $invokeCompletionProvider(handle: number, query: string, token: CancellationToken): Promise<IChatAgentCompletionItem[]>;
    $provideWelcomeMessage(handle: number, location: ChatAgentLocation, token: CancellationToken): Promise<(string | IMarkdownString)[] | undefined>;
    $provideChatTitle(handle: number, context: IChatAgentHistoryEntryDto[], token: CancellationToken): Promise<string | undefined>;
    $provideSampleQuestions(handle: number, location: ChatAgentLocation, token: CancellationToken): Promise<IChatFollowup[] | undefined>;
}