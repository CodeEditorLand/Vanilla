import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare const enum ChatMessageRole {
    System = 0,
    User = 1,
    Assistant = 2
}
export interface IChatMessageTextPart {
    type: "text";
    value: string;
}
export interface IChatMessageToolResultPart {
    type: "tool_result";
    toolCallId: string;
    value: any;
    isError?: boolean;
}
export type IChatMessagePart = IChatMessageTextPart | IChatMessageToolResultPart | IChatResponseToolUsePart;
export interface IChatMessage {
    readonly name?: string | undefined;
    readonly role: ChatMessageRole;
    readonly content: IChatMessagePart[];
}
export interface IChatResponseTextPart {
    type: "text";
    value: string;
}
export interface IChatResponseToolUsePart {
    type: "tool_use";
    name: string;
    toolCallId: string;
    parameters: any;
}
export type IChatResponsePart = IChatResponseTextPart | IChatResponseToolUsePart;
export interface IChatResponseFragment {
    index: number;
    part: IChatResponsePart;
}
export interface ILanguageModelChatMetadata {
    readonly extension: ExtensionIdentifier;
    readonly name: string;
    readonly id: string;
    readonly vendor: string;
    readonly version: string;
    readonly family: string;
    readonly maxInputTokens: number;
    readonly maxOutputTokens: number;
    readonly targetExtensions?: string[];
    readonly auth?: {
        readonly providerLabel: string;
        readonly accountLabel?: string;
    };
}
export interface ILanguageModelChatResponse {
    stream: AsyncIterable<IChatResponseFragment>;
    result: Promise<any>;
}
export interface ILanguageModelChat {
    metadata: ILanguageModelChatMetadata;
    sendChatRequest(messages: IChatMessage[], from: ExtensionIdentifier, options: {
        [name: string]: any;
    }, token: CancellationToken): Promise<ILanguageModelChatResponse>;
    provideTokenCount(message: string | IChatMessage, token: CancellationToken): Promise<number>;
}
export interface ILanguageModelChatSelector {
    readonly name?: string;
    readonly identifier?: string;
    readonly vendor?: string;
    readonly version?: string;
    readonly family?: string;
    readonly tokens?: number;
    readonly extension?: ExtensionIdentifier;
}
export declare const ILanguageModelsService: any;
export interface ILanguageModelsChangeEvent {
    added?: {
        identifier: string;
        metadata: ILanguageModelChatMetadata;
    }[];
    removed?: string[];
}
export interface ILanguageModelsService {
    readonly _serviceBrand: undefined;
    onDidChangeLanguageModels: Event<ILanguageModelsChangeEvent>;
    getLanguageModelIds(): string[];
    lookupLanguageModel(identifier: string): ILanguageModelChatMetadata | undefined;
    selectLanguageModels(selector: ILanguageModelChatSelector): Promise<string[]>;
    registerLanguageModelChat(identifier: string, provider: ILanguageModelChat): IDisposable;
    sendChatRequest(identifier: string, from: ExtensionIdentifier, messages: IChatMessage[], options: {
        [name: string]: any;
    }, token: CancellationToken): Promise<ILanguageModelChatResponse>;
    computeTokenLength(identifier: string, message: string | IChatMessage, token: CancellationToken): Promise<number>;
}
export declare const languageModelExtensionPoint: any;
export declare class LanguageModelsService implements ILanguageModelsService {
    private readonly _extensionService;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private readonly _store;
    private readonly _providers;
    private readonly _vendors;
    private readonly _onDidChangeProviders;
    readonly onDidChangeLanguageModels: Event<ILanguageModelsChangeEvent>;
    constructor(_extensionService: IExtensionService, _logService: ILogService);
    dispose(): void;
    getLanguageModelIds(): string[];
    lookupLanguageModel(identifier: string): ILanguageModelChatMetadata | undefined;
    selectLanguageModels(selector: ILanguageModelChatSelector): Promise<string[]>;
    registerLanguageModelChat(identifier: string, provider: ILanguageModelChat): IDisposable;
    sendChatRequest(identifier: string, from: ExtensionIdentifier, messages: IChatMessage[], options: {
        [name: string]: any;
    }, token: CancellationToken): Promise<ILanguageModelChatResponse>;
    computeTokenLength(identifier: string, message: string | IChatMessage, token: CancellationToken): Promise<number>;
}
