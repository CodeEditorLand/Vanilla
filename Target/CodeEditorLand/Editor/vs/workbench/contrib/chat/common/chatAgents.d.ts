import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { IDisposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { Command, ProviderResult } from "vs/editor/common/languages";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IRequestService } from "vs/platform/request/common/request";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IChatProgressResponseContent, IChatRequestVariableData, ISerializableChatAgentData } from "vs/workbench/contrib/chat/common/chatModel";
import { IRawChatCommandContribution, RawChatParticipantLocation } from "vs/workbench/contrib/chat/common/chatParticipantContribTypes";
import { IChatFollowup, IChatLocationData, IChatProgress, IChatResponseErrorDetails, IChatTaskDto } from "vs/workbench/contrib/chat/common/chatService";
export interface IChatAgentHistoryEntry {
    request: IChatAgentRequest;
    response: ReadonlyArray<IChatProgressResponseContent | IChatTaskDto>;
    result: IChatAgentResult;
}
export declare enum ChatAgentLocation {
    Panel = "panel",
    Terminal = "terminal",
    Notebook = "notebook",
    Editor = "editor"
}
export declare namespace ChatAgentLocation {
    function fromRaw(value: RawChatParticipantLocation | string): ChatAgentLocation;
}
export interface IChatAgentData {
    id: string;
    name: string;
    fullName?: string;
    description?: string;
    when?: string;
    extensionId: ExtensionIdentifier;
    extensionPublisherId: string;
    /** This is the extension publisher id, or, in the case of a dynamically registered participant (remote agent), whatever publisher name we have for it */
    publisherDisplayName?: string;
    extensionDisplayName: string;
    /** The agent invoked when no agent is specified */
    isDefault?: boolean;
    /** This agent is not contributed in package.json, but is registered dynamically */
    isDynamic?: boolean;
    metadata: IChatAgentMetadata;
    slashCommands: IChatAgentCommand[];
    locations: ChatAgentLocation[];
    disambiguation: {
        categoryName: string;
        description: string;
        examples: string[];
    }[];
    supportsToolReferences?: boolean;
}
export interface IChatAgentImplementation {
    invoke(request: IChatAgentRequest, progress: (part: IChatProgress) => void, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatAgentResult>;
    provideFollowups?(request: IChatAgentRequest, result: IChatAgentResult, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatFollowup[]>;
    provideWelcomeMessage?(location: ChatAgentLocation, token: CancellationToken): ProviderResult<(string | IMarkdownString)[] | undefined>;
    provideChatTitle?: (history: IChatAgentHistoryEntry[], token: CancellationToken) => Promise<string | undefined>;
    provideSampleQuestions?(location: ChatAgentLocation, token: CancellationToken): ProviderResult<IChatFollowup[] | undefined>;
}
export interface IChatParticipantDetectionResult {
    participant: string;
    command?: string;
}
export interface IChatParticipantMetadata {
    participant: string;
    command?: string;
    disambiguation: {
        categoryName: string;
        description: string;
        examples: string[];
    }[];
}
export interface IChatParticipantDetectionProvider {
    provideParticipantDetection(request: IChatAgentRequest, history: IChatAgentHistoryEntry[], options: {
        location: ChatAgentLocation;
        participants: IChatParticipantMetadata[];
    }, token: CancellationToken): Promise<IChatParticipantDetectionResult | null | undefined>;
}
export type IChatAgent = IChatAgentData & IChatAgentImplementation;
export interface IChatAgentCommand extends IRawChatCommandContribution {
    followupPlaceholder?: string;
}
export interface IChatRequesterInformation {
    name: string;
    /**
     * A full URI for the icon of the requester.
     */
    icon?: URI;
}
export interface IChatAgentMetadata {
    helpTextPrefix?: string | IMarkdownString;
    helpTextVariablesPrefix?: string | IMarkdownString;
    helpTextPostfix?: string | IMarkdownString;
    isSecondary?: boolean;
    icon?: URI;
    iconDark?: URI;
    themeIcon?: ThemeIcon;
    sampleRequest?: string;
    supportIssueReporting?: boolean;
    followupPlaceholder?: string;
    isSticky?: boolean;
    requester?: IChatRequesterInformation;
    supportsSlowVariables?: boolean;
}
export interface IChatAgentRequest {
    sessionId: string;
    requestId: string;
    agentId: string;
    command?: string;
    message: string;
    attempt?: number;
    enableCommandDetection?: boolean;
    isParticipantDetected?: boolean;
    variables: IChatRequestVariableData;
    location: ChatAgentLocation;
    locationData?: IChatLocationData;
    acceptedConfirmationData?: any[];
    rejectedConfirmationData?: any[];
}
export interface IChatQuestion {
    readonly prompt: string;
    readonly participant?: string;
    readonly command?: string;
}
export interface IChatAgentResultTimings {
    firstProgress?: number;
    totalElapsed: number;
}
export interface IChatAgentResult {
    errorDetails?: IChatResponseErrorDetails;
    timings?: IChatAgentResultTimings;
    /** Extra properties that the agent can use to identify a result */
    readonly metadata?: {
        readonly [key: string]: any;
    };
    nextQuestion?: IChatQuestion;
}
export declare const IChatAgentService: any;
export interface IChatAgentCompletionItem {
    id: string;
    name?: string;
    fullName?: string;
    icon?: ThemeIcon;
    value: unknown;
    command?: Command;
}
export interface IChatAgentService {
    _serviceBrand: undefined;
    /**
     * undefined when an agent was removed IChatAgent
     */
    readonly onDidChangeAgents: Event<IChatAgent | undefined>;
    registerAgent(id: string, data: IChatAgentData): IDisposable;
    registerAgentImplementation(id: string, agent: IChatAgentImplementation): IDisposable;
    registerDynamicAgent(data: IChatAgentData, agentImpl: IChatAgentImplementation): IDisposable;
    registerAgentCompletionProvider(id: string, provider: (query: string, token: CancellationToken) => Promise<IChatAgentCompletionItem[]>): IDisposable;
    getAgentCompletionItems(id: string, query: string, token: CancellationToken): Promise<IChatAgentCompletionItem[]>;
    registerChatParticipantDetectionProvider(handle: number, provider: IChatParticipantDetectionProvider): IDisposable;
    detectAgentOrCommand(request: IChatAgentRequest, history: IChatAgentHistoryEntry[], options: {
        location: ChatAgentLocation;
    }, token: CancellationToken): Promise<{
        agent: IChatAgentData;
        command?: IChatAgentCommand;
    } | undefined>;
    hasChatParticipantDetectionProviders(): boolean;
    invokeAgent(agent: string, request: IChatAgentRequest, progress: (part: IChatProgress) => void, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatAgentResult>;
    getFollowups(id: string, request: IChatAgentRequest, result: IChatAgentResult, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatFollowup[]>;
    getChatTitle(id: string, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<string | undefined>;
    getAgent(id: string): IChatAgentData | undefined;
    getAgentByFullyQualifiedId(id: string): IChatAgentData | undefined;
    getAgents(): IChatAgentData[];
    getActivatedAgents(): Array<IChatAgent>;
    getAgentsByName(name: string): IChatAgentData[];
    agentHasDupeName(id: string): boolean;
    /**
     * Get the default agent (only if activated)
     */
    getDefaultAgent(location: ChatAgentLocation): IChatAgent | undefined;
    /**
     * Get the default agent data that has been contributed (may not be activated yet)
     */
    getContributedDefaultAgent(location: ChatAgentLocation): IChatAgentData | undefined;
    getSecondaryAgent(): IChatAgentData | undefined;
    updateAgent(id: string, updateMetadata: IChatAgentMetadata): void;
}
export declare class ChatAgentService implements IChatAgentService {
    private readonly contextKeyService;
    static readonly AGENT_LEADER = "@";
    _serviceBrand: undefined;
    private _agents;
    private readonly _onDidChangeAgents;
    readonly onDidChangeAgents: Event<IChatAgent | undefined>;
    private readonly _hasDefaultAgent;
    constructor(contextKeyService: IContextKeyService);
    registerAgent(id: string, data: IChatAgentData): IDisposable;
    registerAgentImplementation(id: string, agentImpl: IChatAgentImplementation): IDisposable;
    registerDynamicAgent(data: IChatAgentData, agentImpl: IChatAgentImplementation): IDisposable;
    private _agentCompletionProviders;
    registerAgentCompletionProvider(id: string, provider: (query: string, token: CancellationToken) => Promise<IChatAgentCompletionItem[]>): {
        dispose: () => void;
    };
    getAgentCompletionItems(id: string, query: string, token: CancellationToken): Promise<IChatAgentCompletionItem[]>;
    updateAgent(id: string, updateMetadata: IChatAgentMetadata): void;
    getDefaultAgent(location: ChatAgentLocation): IChatAgent | undefined;
    getContributedDefaultAgent(location: ChatAgentLocation): IChatAgentData | undefined;
    getSecondaryAgent(): IChatAgentData | undefined;
    getAgent(id: string): IChatAgentData | undefined;
    private _agentIsEnabled;
    getAgentByFullyQualifiedId(id: string): IChatAgentData | undefined;
    /**
     * Returns all agent datas that exist- static registered and dynamic ones.
     */
    getAgents(): IChatAgentData[];
    getActivatedAgents(): IChatAgent[];
    getAgentsByName(name: string): IChatAgentData[];
    agentHasDupeName(id: string): boolean;
    invokeAgent(id: string, request: IChatAgentRequest, progress: (part: IChatProgress) => void, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatAgentResult>;
    getFollowups(id: string, request: IChatAgentRequest, result: IChatAgentResult, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatFollowup[]>;
    getChatTitle(id: string, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<string | undefined>;
    private _chatParticipantDetectionProviders;
    registerChatParticipantDetectionProvider(handle: number, provider: IChatParticipantDetectionProvider): any;
    hasChatParticipantDetectionProviders(): boolean;
    detectAgentOrCommand(request: IChatAgentRequest, history: IChatAgentHistoryEntry[], options: {
        location: ChatAgentLocation;
    }, token: CancellationToken): Promise<{
        agent: IChatAgentData;
        command?: IChatAgentCommand;
    } | undefined>;
}
export declare class MergedChatAgent implements IChatAgent {
    private readonly data;
    private readonly impl;
    constructor(data: IChatAgentData, impl: IChatAgentImplementation);
    when?: string | undefined;
    publisherDisplayName?: string | undefined;
    isDynamic?: boolean | undefined;
    get id(): string;
    get name(): string;
    get fullName(): string;
    get description(): string;
    get extensionId(): ExtensionIdentifier;
    get extensionPublisherId(): string;
    get extensionPublisherDisplayName(): string | undefined;
    get extensionDisplayName(): string;
    get isDefault(): boolean | undefined;
    get metadata(): IChatAgentMetadata;
    get slashCommands(): IChatAgentCommand[];
    get locations(): ChatAgentLocation[];
    get disambiguation(): {
        categoryName: string;
        description: string;
        examples: string[];
    }[];
    invoke(request: IChatAgentRequest, progress: (part: IChatProgress) => void, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatAgentResult>;
    provideFollowups(request: IChatAgentRequest, result: IChatAgentResult, history: IChatAgentHistoryEntry[], token: CancellationToken): Promise<IChatFollowup[]>;
    provideWelcomeMessage(location: ChatAgentLocation, token: CancellationToken): ProviderResult<(string | IMarkdownString)[] | undefined>;
    provideSampleQuestions(location: ChatAgentLocation, token: CancellationToken): ProviderResult<IChatFollowup[] | undefined>;
    toJSON(): IChatAgentData;
}
export declare const IChatAgentNameService: any;
export interface IChatAgentNameService {
    _serviceBrand: undefined;
    getAgentNameRestriction(chatAgentData: IChatAgentData): boolean;
}
export declare class ChatAgentNameService implements IChatAgentNameService {
    private readonly requestService;
    private readonly logService;
    private readonly storageService;
    private static readonly StorageKey;
    _serviceBrand: undefined;
    private readonly url;
    private registry;
    private disposed;
    constructor(productService: IProductService, requestService: IRequestService, logService: ILogService, storageService: IStorageService);
    private refresh;
    private update;
    /**
     * Returns true if the agent is allowed to use this name
     */
    getAgentNameRestriction(chatAgentData: IChatAgentData): boolean;
    private checkAgentNameRestriction;
    dispose(): void;
}
export declare function getFullyQualifiedId(chatAgentData: IChatAgentData): string;
export declare function reviveSerializedAgent(raw: ISerializableChatAgentData): IChatAgentData;
