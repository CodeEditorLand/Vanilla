import { DeferredPromise } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { ISelection } from '../../../../editor/common/core/selection.js';
import { Command, Location, TextEdit } from '../../../../editor/common/languages.js';
import { FileType } from '../../../../platform/files/common/files.js';
import { ChatAgentLocation, IChatAgentCommand, IChatAgentData, IChatAgentResult } from './chatAgents.js';
import { ChatModel, IChatModel, IChatRequestModel, IChatRequestVariableData, IChatRequestVariableEntry, IChatResponseModel, IExportableChatData, ISerializableChatData } from './chatModel.js';
import { IParsedChatRequest } from './chatParserTypes.js';
import { IChatParserContext } from './chatRequestParser.js';
import { IChatRequestVariableValue } from './chatVariables.js';
export interface IChatRequest {
    message: string;
    variables: Record<string, IChatRequestVariableValue[]>;
}
export interface IChatResponseErrorDetails {
    message: string;
    responseIsIncomplete?: boolean;
    responseIsFiltered?: boolean;
    responseIsRedacted?: boolean;
}
export interface IChatResponseProgressFileTreeData {
    label: string;
    uri: URI;
    type?: FileType;
    children?: IChatResponseProgressFileTreeData[];
}
export type IDocumentContext = {
    uri: URI;
    version: number;
    ranges: IRange[];
};
export declare function isIDocumentContext(obj: unknown): obj is IDocumentContext;
export interface IChatUsedContext {
    documents: IDocumentContext[];
    kind: 'usedContext';
}
export declare function isIUsedContext(obj: unknown): obj is IChatUsedContext;
export interface IChatContentVariableReference {
    variableName: string;
    value?: URI | Location;
}
export declare enum ChatResponseReferencePartStatusKind {
    Complete = 1,
    Partial = 2,
    Omitted = 3
}
export interface IChatContentReference {
    reference: URI | Location | IChatContentVariableReference | string;
    iconPath?: ThemeIcon | {
        light: URI;
        dark?: URI;
    };
    options?: {
        status?: {
            description: string;
            kind: ChatResponseReferencePartStatusKind;
        };
    };
    kind: 'reference';
}
export interface IChatCodeCitation {
    value: URI;
    license: string;
    snippet: string;
    kind: 'codeCitation';
}
export interface IChatContentInlineReference {
    inlineReference: URI | Location;
    name?: string;
    kind: 'inlineReference';
}
export interface IChatAgentDetection {
    agentId: string;
    command?: IChatAgentCommand;
    kind: 'agentDetection';
}
export interface IChatMarkdownContent {
    content: IMarkdownString;
    kind: 'markdownContent';
}
export interface IChatTreeData {
    treeData: IChatResponseProgressFileTreeData;
    kind: 'treeData';
}
export interface IChatProgressMessage {
    content: IMarkdownString;
    kind: 'progressMessage';
}
export interface IChatTask extends IChatTaskDto {
    deferred: DeferredPromise<string | void>;
    progress: (IChatWarningMessage | IChatContentReference)[];
    onDidAddProgress: Event<IChatWarningMessage | IChatContentReference>;
    add(progress: IChatWarningMessage | IChatContentReference): void;
    complete: (result: string | void) => void;
    task: () => Promise<string | void>;
    isSettled: () => boolean;
}
export interface IChatTaskDto {
    content: IMarkdownString;
    kind: 'progressTask';
}
export interface IChatTaskResult {
    content: IMarkdownString | void;
    kind: 'progressTaskResult';
}
export interface IChatWarningMessage {
    content: IMarkdownString;
    kind: 'warning';
}
export interface IChatAgentVulnerabilityDetails {
    title: string;
    description: string;
}
export interface IChatAgentMarkdownContentWithVulnerability {
    content: IMarkdownString;
    vulnerabilities: IChatAgentVulnerabilityDetails[];
    kind: 'markdownVuln';
}
export interface IChatCommandButton {
    command: Command;
    kind: 'command';
}
export interface IChatMoveMessage {
    uri: URI;
    range: IRange;
    kind: 'move';
}
export interface IChatTextEdit {
    uri: URI;
    edits: TextEdit[];
    kind: 'textEdit';
}
export interface IChatConfirmation {
    title: string;
    message: string;
    data: any;
    buttons?: string[];
    isUsed?: boolean;
    kind: 'confirmation';
}
export type IChatProgress = IChatMarkdownContent | IChatAgentMarkdownContentWithVulnerability | IChatTreeData | IChatUsedContext | IChatContentReference | IChatContentInlineReference | IChatCodeCitation | IChatAgentDetection | IChatProgressMessage | IChatTask | IChatTaskResult | IChatCommandButton | IChatWarningMessage | IChatTextEdit | IChatMoveMessage | IChatConfirmation;
export interface IChatFollowup {
    kind: 'reply';
    message: string;
    agentId: string;
    subCommand?: string;
    title?: string;
    tooltip?: string;
}
export declare enum ChatAgentVoteDirection {
    Down = 0,
    Up = 1
}
export declare enum ChatAgentVoteDownReason {
    IncorrectCode = "incorrectCode",
    DidNotFollowInstructions = "didNotFollowInstructions",
    IncompleteCode = "incompleteCode",
    MissingContext = "missingContext",
    PoorlyWrittenOrFormatted = "poorlyWrittenOrFormatted",
    RefusedAValidRequest = "refusedAValidRequest",
    OffensiveOrUnsafe = "offensiveOrUnsafe",
    Other = "other",
    WillReportIssue = "willReportIssue"
}
export interface IChatVoteAction {
    kind: 'vote';
    direction: ChatAgentVoteDirection;
    reason: ChatAgentVoteDownReason | undefined;
}
export declare enum ChatCopyKind {
    Action = 1,
    Toolbar = 2
}
export interface IChatCopyAction {
    kind: 'copy';
    codeBlockIndex: number;
    copyKind: ChatCopyKind;
    copiedCharacters: number;
    totalCharacters: number;
    copiedText: string;
}
export interface IChatInsertAction {
    kind: 'insert';
    codeBlockIndex: number;
    totalCharacters: number;
    newFile?: boolean;
    userAction?: string;
    codeMapper?: string;
}
export interface IChatTerminalAction {
    kind: 'runInTerminal';
    codeBlockIndex: number;
    languageId?: string;
}
export interface IChatCommandAction {
    kind: 'command';
    commandButton: IChatCommandButton;
}
export interface IChatFollowupAction {
    kind: 'followUp';
    followup: IChatFollowup;
}
export interface IChatBugReportAction {
    kind: 'bug';
}
export interface IChatInlineChatCodeAction {
    kind: 'inlineChat';
    action: 'accepted' | 'discarded';
}
export type ChatUserAction = IChatVoteAction | IChatCopyAction | IChatInsertAction | IChatTerminalAction | IChatCommandAction | IChatFollowupAction | IChatBugReportAction | IChatInlineChatCodeAction;
export interface IChatUserActionEvent {
    action: ChatUserAction;
    agentId: string | undefined;
    command: string | undefined;
    sessionId: string;
    requestId: string;
    result: IChatAgentResult | undefined;
}
export interface IChatDynamicRequest {
    /**
     * The message that will be displayed in the UI
     */
    message: string;
    /**
     * Any extra metadata/context that will go to the provider.
     */
    metadata?: any;
}
export interface IChatCompleteResponse {
    message: string | ReadonlyArray<IChatProgress>;
    result?: IChatAgentResult;
    followups?: IChatFollowup[];
}
export interface IChatDetail {
    sessionId: string;
    title: string;
    lastMessageDate: number;
    isActive: boolean;
}
export interface IChatProviderInfo {
    id: string;
}
export interface IChatTransferredSessionData {
    sessionId: string;
    inputValue: string;
}
export interface IChatSendRequestResponseState {
    responseCreatedPromise: Promise<IChatResponseModel>;
    responseCompletePromise: Promise<void>;
}
export interface IChatSendRequestData extends IChatSendRequestResponseState {
    agent: IChatAgentData;
    slashCommand?: IChatAgentCommand;
}
export interface IChatEditorLocationData {
    type: ChatAgentLocation.Editor;
    document: URI;
    selection: ISelection;
    wholeRange: IRange;
}
export interface IChatNotebookLocationData {
    type: ChatAgentLocation.Notebook;
    sessionInputUri: URI;
}
export interface IChatTerminalLocationData {
    type: ChatAgentLocation.Terminal;
}
export type IChatLocationData = IChatEditorLocationData | IChatNotebookLocationData | IChatTerminalLocationData;
export interface IChatSendRequestOptions {
    location?: ChatAgentLocation;
    locationData?: IChatLocationData;
    parserContext?: IChatParserContext;
    attempt?: number;
    noCommandDetection?: boolean;
    acceptedConfirmationData?: any[];
    rejectedConfirmationData?: any[];
    attachedContext?: IChatRequestVariableEntry[];
    /** The target agent ID can be specified with this property instead of using @ in 'message' */
    agentId?: string;
    slashCommand?: string;
    /**
     * The label of the confirmation action that was selected.
     */
    confirmation?: string;
}
export declare const IChatService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatService>;
export interface IChatService {
    _serviceBrand: undefined;
    transferredSessionData: IChatTransferredSessionData | undefined;
    isEnabled(location: ChatAgentLocation): boolean;
    hasSessions(): boolean;
    startSession(location: ChatAgentLocation, token: CancellationToken): ChatModel | undefined;
    getSession(sessionId: string): IChatModel | undefined;
    getOrRestoreSession(sessionId: string): IChatModel | undefined;
    loadSessionFromContent(data: IExportableChatData | ISerializableChatData): IChatModel | undefined;
    /**
     * Returns whether the request was accepted.
     */
    sendRequest(sessionId: string, message: string, options?: IChatSendRequestOptions): Promise<IChatSendRequestData | undefined>;
    resendRequest(request: IChatRequestModel, options?: IChatSendRequestOptions): Promise<void>;
    adoptRequest(sessionId: string, request: IChatRequestModel): Promise<void>;
    removeRequest(sessionid: string, requestId: string): Promise<void>;
    cancelCurrentRequestForSession(sessionId: string): void;
    clearSession(sessionId: string): void;
    addCompleteRequest(sessionId: string, message: IParsedChatRequest | string, variableData: IChatRequestVariableData | undefined, attempt: number | undefined, response: IChatCompleteResponse): void;
    getHistory(): IChatDetail[];
    setChatSessionTitle(sessionId: string, title: string): void;
    clearAllHistoryEntries(): void;
    removeHistoryEntry(sessionId: string): void;
    onDidPerformUserAction: Event<IChatUserActionEvent>;
    notifyUserAction(event: IChatUserActionEvent): void;
    onDidDisposeSession: Event<{
        sessionId: string;
        reason: 'initializationFailed' | 'cleared';
    }>;
    transferChatSession(transferredSessionData: IChatTransferredSessionData, toWorkspace: URI): void;
}
export declare const KEYWORD_ACTIVIATION_SETTING_ID = "accessibility.voice.keywordActivation";
