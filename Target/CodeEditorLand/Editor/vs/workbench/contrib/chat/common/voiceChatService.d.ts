import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IChatModel } from "vs/workbench/contrib/chat/common/chatModel";
import { ISpeechService, ISpeechToTextEvent } from "vs/workbench/contrib/speech/common/speechService";
export declare const IVoiceChatService: any;
export interface IVoiceChatSessionOptions {
    readonly usesAgents?: boolean;
    readonly model?: IChatModel;
}
export interface IVoiceChatService {
    readonly _serviceBrand: undefined;
    /**
     * Similar to `ISpeechService.createSpeechToTextSession`, but with
     * support for agent prefixes and command prefixes. For example,
     * if the user says "at workspace slash fix this problem", the result
     * will be "@workspace /fix this problem".
     */
    createVoiceChatSession(token: CancellationToken, options: IVoiceChatSessionOptions): Promise<IVoiceChatSession>;
}
export interface IVoiceChatTextEvent extends ISpeechToTextEvent {
    /**
     * This property will be `true` when the text recognized
     * so far only consists of agent prefixes (`@workspace`)
     * and/or command prefixes (`@workspace /fix`).
     */
    readonly waitingForInput?: boolean;
}
export interface IVoiceChatSession {
    readonly onDidChange: Event<IVoiceChatTextEvent>;
}
export declare const VoiceChatInProgress: any;
export declare class VoiceChatService extends Disposable implements IVoiceChatService {
    private readonly speechService;
    private readonly chatAgentService;
    private readonly contextKeyService;
    readonly _serviceBrand: undefined;
    private static readonly AGENT_PREFIX;
    private static readonly COMMAND_PREFIX;
    private static readonly PHRASES_LOWER;
    private static readonly PHRASES_UPPER;
    private static readonly CHAT_AGENT_ALIAS;
    private readonly voiceChatInProgress;
    private activeVoiceChatSessions;
    constructor(speechService: ISpeechService, chatAgentService: IChatAgentService, contextKeyService: IContextKeyService);
    private createPhrases;
    private toText;
    createVoiceChatSession(token: CancellationToken, options: IVoiceChatSessionOptions): Promise<IVoiceChatSession>;
    private normalizeWord;
}
