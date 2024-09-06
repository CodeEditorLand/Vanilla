import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IProgress } from "vs/platform/progress/common/progress";
import { ChatAgentLocation } from "vs/workbench/contrib/chat/common/chatAgents";
import { IChatFollowup, IChatProgress, IChatResponseProgressFileTreeData } from "vs/workbench/contrib/chat/common/chatService";
import { IChatMessage } from "vs/workbench/contrib/chat/common/languageModels";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export interface IChatSlashData {
    command: string;
    detail: string;
    sortText?: string;
    /**
     * Whether the command should execute as soon
     * as it is entered. Defaults to `false`.
     */
    executeImmediately?: boolean;
    locations: ChatAgentLocation[];
}
export interface IChatSlashFragment {
    content: string | {
        treeData: IChatResponseProgressFileTreeData;
    };
}
export type IChatSlashCallback = {
    (prompt: string, progress: IProgress<IChatProgress>, history: IChatMessage[], location: ChatAgentLocation, token: CancellationToken): Promise<{
        followUp: IChatFollowup[];
    } | void>;
};
export declare const IChatSlashCommandService: any;
/**
 * This currently only exists to drive /clear and /help
 */
export interface IChatSlashCommandService {
    _serviceBrand: undefined;
    readonly onDidChangeCommands: Event<void>;
    registerSlashCommand(data: IChatSlashData, command: IChatSlashCallback): IDisposable;
    executeCommand(id: string, prompt: string, progress: IProgress<IChatProgress>, history: IChatMessage[], location: ChatAgentLocation, token: CancellationToken): Promise<{
        followUp: IChatFollowup[];
    } | void>;
    getCommands(location: ChatAgentLocation): Array<IChatSlashData>;
    hasCommand(id: string): boolean;
}
export declare class ChatSlashCommandService extends Disposable implements IChatSlashCommandService {
    private readonly _extensionService;
    _serviceBrand: undefined;
    private readonly _commands;
    private readonly _onDidChangeCommands;
    readonly onDidChangeCommands: Event<void>;
    constructor(_extensionService: IExtensionService);
    dispose(): void;
    registerSlashCommand(data: IChatSlashData, command: IChatSlashCallback): IDisposable;
    getCommands(location: ChatAgentLocation): Array<IChatSlashData>;
    hasCommand(id: string): boolean;
    executeCommand(id: string, prompt: string, progress: IProgress<IChatProgress>, history: IChatMessage[], location: ChatAgentLocation, token: CancellationToken): Promise<{
        followUp: IChatFollowup[];
    } | void>;
}
