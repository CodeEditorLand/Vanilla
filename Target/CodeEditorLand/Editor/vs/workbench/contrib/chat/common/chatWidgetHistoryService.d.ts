import { Event } from "vs/base/common/event";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ChatAgentLocation } from "vs/workbench/contrib/chat/common/chatAgents";
export interface IChatHistoryEntry {
    text: string;
    state?: any;
}
export declare const IChatWidgetHistoryService: any;
export interface IChatWidgetHistoryService {
    _serviceBrand: undefined;
    readonly onDidClearHistory: Event<void>;
    clearHistory(): void;
    getHistory(location: ChatAgentLocation): IChatHistoryEntry[];
    saveHistory(location: ChatAgentLocation, history: IChatHistoryEntry[]): void;
}
export declare class ChatWidgetHistoryService implements IChatWidgetHistoryService {
    _serviceBrand: undefined;
    private memento;
    private viewState;
    private readonly _onDidClearHistory;
    readonly onDidClearHistory: Event<void>;
    constructor(storageService: IStorageService);
    getHistory(location: ChatAgentLocation): IChatHistoryEntry[];
    private getKey;
    saveHistory(location: ChatAgentLocation, history: IChatHistoryEntry[]): void;
    clearHistory(): void;
}
