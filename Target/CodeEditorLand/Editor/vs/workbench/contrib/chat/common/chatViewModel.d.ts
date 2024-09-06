import { Event } from "vs/base/common/event";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { Disposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IChatAgentCommand, IChatAgentData, IChatAgentNameService, IChatAgentResult } from "vs/workbench/contrib/chat/common/chatAgents";
import { ChatModelInitState, IChatModel, IChatProgressRenderableResponseContent, IChatRequestModel, IChatRequestVariableEntry, IChatResponseModel, IChatTextEditGroup, IChatWelcomeMessageContent, IResponse } from "vs/workbench/contrib/chat/common/chatModel";
import { IParsedChatRequest } from "vs/workbench/contrib/chat/common/chatParserTypes";
import { ChatAgentVoteDirection, IChatCodeCitation, IChatContentReference, IChatFollowup, IChatProgressMessage, IChatResponseErrorDetails, IChatTask, IChatUsedContext } from "vs/workbench/contrib/chat/common/chatService";
import { CodeBlockModelCollection } from "./codeBlockModelCollection";
export declare function isRequestVM(item: unknown): item is IChatRequestViewModel;
export declare function isResponseVM(item: unknown): item is IChatResponseViewModel;
export declare function isWelcomeVM(item: unknown): item is IChatWelcomeMessageViewModel;
export type IChatViewModelChangeEvent = IChatAddRequestEvent | IChangePlaceholderEvent | IChatSessionInitEvent | null;
export interface IChatAddRequestEvent {
    kind: "addRequest";
}
export interface IChangePlaceholderEvent {
    kind: "changePlaceholder";
}
export interface IChatSessionInitEvent {
    kind: "initialize";
}
export interface IChatViewModel {
    readonly model: IChatModel;
    readonly initState: ChatModelInitState;
    readonly sessionId: string;
    readonly onDidDisposeModel: Event<void>;
    readonly onDidChange: Event<IChatViewModelChangeEvent>;
    readonly requestInProgress: boolean;
    readonly inputPlaceholder?: string;
    getItems(): (IChatRequestViewModel | IChatResponseViewModel | IChatWelcomeMessageViewModel)[];
    setInputPlaceholder(text: string): void;
    resetInputPlaceholder(): void;
}
export interface IChatRequestViewModel {
    readonly id: string;
    readonly sessionId: string;
    /** This ID updates every time the underlying data changes */
    readonly dataId: string;
    readonly username: string;
    readonly avatarIcon?: URI | ThemeIcon;
    readonly message: IParsedChatRequest | IChatFollowup;
    readonly messageText: string;
    readonly attempt: number;
    readonly variables: IChatRequestVariableEntry[];
    currentRenderedHeight: number | undefined;
    readonly contentReferences?: ReadonlyArray<IChatContentReference>;
    readonly confirmation?: string;
}
export interface IChatResponseMarkdownRenderData {
    renderedWordCount: number;
    lastRenderTime: number;
    isFullyRendered: boolean;
    originalMarkdown: IMarkdownString;
}
export interface IChatResponseMarkdownRenderData2 {
    renderedWordCount: number;
    lastRenderTime: number;
    isFullyRendered: boolean;
    originalMarkdown: IMarkdownString;
}
export interface IChatProgressMessageRenderData {
    progressMessage: IChatProgressMessage;
    /**
     * Indicates whether this is part of a group of progress messages that are at the end of the response.
     * (Not whether this particular item is the very last one in the response).
     * Need to re-render and add to partsToRender when this changes.
     */
    isAtEndOfResponse: boolean;
    /**
     * Whether this progress message the very last item in the response.
     * Need to re-render to update spinner vs check when this changes.
     */
    isLast: boolean;
}
export interface IChatTaskRenderData {
    task: IChatTask;
    isSettled: boolean;
    progressLength: number;
}
export interface IChatResponseRenderData {
    renderedParts: IChatRendererContent[];
    renderedWordCount: number;
    lastRenderTime: number;
}
/**
 * Content type for references used during rendering, not in the model
 */
export interface IChatReferences {
    references: ReadonlyArray<IChatContentReference>;
    kind: "references";
}
/**
 * Content type for citations used during rendering, not in the model
 */
export interface IChatCodeCitations {
    citations: ReadonlyArray<IChatCodeCitation>;
    kind: "codeCitations";
}
/**
 * Type for content parts rendered by IChatListRenderer
 */
export type IChatRendererContent = IChatProgressRenderableResponseContent | IChatReferences | IChatCodeCitations;
export interface IChatLiveUpdateData {
    firstWordTime: number;
    lastUpdateTime: number;
    impliedWordLoadRate: number;
    lastWordCount: number;
}
export interface IChatResponseViewModel {
    readonly model: IChatResponseModel;
    readonly id: string;
    readonly sessionId: string;
    /** This ID updates every time the underlying data changes */
    readonly dataId: string;
    /** The ID of the associated IChatRequestViewModel */
    readonly requestId: string;
    readonly username: string;
    readonly avatarIcon?: URI | ThemeIcon;
    readonly agent?: IChatAgentData;
    readonly slashCommand?: IChatAgentCommand;
    readonly agentOrSlashCommandDetected: boolean;
    readonly response: IResponse;
    readonly usedContext: IChatUsedContext | undefined;
    readonly contentReferences: ReadonlyArray<IChatContentReference>;
    readonly codeCitations: ReadonlyArray<IChatCodeCitation>;
    readonly progressMessages: ReadonlyArray<IChatProgressMessage>;
    readonly isComplete: boolean;
    readonly isCanceled: boolean;
    readonly isStale: boolean;
    readonly vote: ChatAgentVoteDirection | undefined;
    readonly replyFollowups?: IChatFollowup[];
    readonly errorDetails?: IChatResponseErrorDetails;
    readonly result?: IChatAgentResult;
    readonly contentUpdateTimings?: IChatLiveUpdateData;
    renderData?: IChatResponseRenderData;
    currentRenderedHeight: number | undefined;
    setVote(vote: ChatAgentVoteDirection): void;
    usedReferencesExpanded?: boolean;
    vulnerabilitiesListExpanded: boolean;
    setEditApplied(edit: IChatTextEditGroup, editCount: number): void;
}
export declare class ChatViewModel extends Disposable implements IChatViewModel {
    private readonly _model;
    readonly codeBlockModelCollection: CodeBlockModelCollection;
    private readonly instantiationService;
    private readonly _onDidDisposeModel;
    readonly onDidDisposeModel: any;
    private readonly _onDidChange;
    readonly onDidChange: any;
    private readonly _items;
    private _inputPlaceholder;
    get inputPlaceholder(): string | undefined;
    get model(): IChatModel;
    setInputPlaceholder(text: string): void;
    resetInputPlaceholder(): void;
    get sessionId(): any;
    get requestInProgress(): boolean;
    get initState(): any;
    constructor(_model: IChatModel, codeBlockModelCollection: CodeBlockModelCollection, instantiationService: IInstantiationService);
    private onAddResponse;
    getItems(): (IChatRequestViewModel | IChatResponseViewModel | IChatWelcomeMessageViewModel)[];
    dispose(): void;
    updateCodeBlockTextModels(model: IChatRequestViewModel | IChatResponseViewModel): void;
}
export declare class ChatRequestViewModel implements IChatRequestViewModel {
    private readonly _model;
    get id(): any;
    get dataId(): string;
    get sessionId(): any;
    get username(): any;
    get avatarIcon(): any;
    get message(): any;
    get messageText(): any;
    get attempt(): any;
    get variables(): any;
    get contentReferences(): any;
    get confirmation(): any;
    currentRenderedHeight: number | undefined;
    constructor(_model: IChatRequestModel);
}
export declare class ChatResponseViewModel extends Disposable implements IChatResponseViewModel {
    private readonly _model;
    private readonly logService;
    private readonly chatAgentNameService;
    private _modelChangeCount;
    private readonly _onDidChange;
    readonly onDidChange: any;
    get model(): IChatResponseModel;
    get id(): any;
    get dataId(): string;
    get sessionId(): any;
    get username(): any;
    get avatarIcon(): any;
    get agent(): any;
    get slashCommand(): any;
    get agentOrSlashCommandDetected(): any;
    get response(): IResponse;
    get usedContext(): IChatUsedContext | undefined;
    get contentReferences(): ReadonlyArray<IChatContentReference>;
    get codeCitations(): ReadonlyArray<IChatCodeCitation>;
    get progressMessages(): ReadonlyArray<IChatProgressMessage>;
    get isComplete(): any;
    get isCanceled(): any;
    get replyFollowups(): any;
    get result(): any;
    get errorDetails(): IChatResponseErrorDetails | undefined;
    get vote(): any;
    get requestId(): any;
    get isStale(): any;
    renderData: IChatResponseRenderData | undefined;
    currentRenderedHeight: number | undefined;
    private _usedReferencesExpanded;
    get usedReferencesExpanded(): boolean | undefined;
    set usedReferencesExpanded(v: boolean);
    private _vulnerabilitiesListExpanded;
    get vulnerabilitiesListExpanded(): boolean;
    set vulnerabilitiesListExpanded(v: boolean);
    private _contentUpdateTimings;
    get contentUpdateTimings(): IChatLiveUpdateData | undefined;
    constructor(_model: IChatResponseModel, logService: ILogService, chatAgentNameService: IChatAgentNameService);
    private trace;
    setVote(vote: ChatAgentVoteDirection): void;
    setEditApplied(edit: IChatTextEditGroup, editCount: number): void;
}
export interface IChatWelcomeMessageViewModel {
    readonly id: string;
    readonly username: string;
    readonly avatarIcon?: URI | ThemeIcon;
    readonly content: IChatWelcomeMessageContent[];
    readonly sampleQuestions: IChatFollowup[];
    currentRenderedHeight?: number;
}
