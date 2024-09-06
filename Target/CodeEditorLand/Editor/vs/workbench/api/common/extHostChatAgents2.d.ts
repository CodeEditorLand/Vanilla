import { CancellationToken } from "vs/base/common/cancellation";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { Disposable } from "vs/base/common/lifecycle";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { ExtHostChatAgentsShape2, IChatAgentCompletionItem, IChatAgentHistoryEntryDto, IMainContext } from "vs/workbench/api/common/extHost.protocol";
import { ExtHostCommands } from "vs/workbench/api/common/extHostCommands";
import { ExtHostDocuments } from "vs/workbench/api/common/extHostDocuments";
import { ChatAgentLocation, IChatAgentRequest, IChatAgentResult } from "vs/workbench/contrib/chat/common/chatAgents";
import { ChatAgentVoteDirection, IChatFollowup, IChatUserActionEvent } from "vs/workbench/contrib/chat/common/chatService";
import { Dto } from "vs/workbench/services/extensions/common/proxyIdentifier";
import type * as vscode from "vscode";
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
    $acceptFeedback(handle: number, result: IChatAgentResult, vote: ChatAgentVoteDirection, reportIssue?: boolean): void;
    $acceptAction(handle: number, result: IChatAgentResult, event: IChatUserActionEvent): void;
    $invokeCompletionProvider(handle: number, query: string, token: CancellationToken): Promise<IChatAgentCompletionItem[]>;
    $provideWelcomeMessage(handle: number, location: ChatAgentLocation, token: CancellationToken): Promise<(string | IMarkdownString)[] | undefined>;
    $provideChatTitle(handle: number, context: IChatAgentHistoryEntryDto[], token: CancellationToken): Promise<string | undefined>;
    $provideSampleQuestions(handle: number, location: ChatAgentLocation, token: CancellationToken): Promise<IChatFollowup[] | undefined>;
}
