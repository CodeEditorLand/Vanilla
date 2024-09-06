import type { Terminal as RawXtermTerminal } from "@xterm/xterm";
import { Disposable } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IChatCodeBlockContextProviderService } from "vs/workbench/contrib/chat/browser/chat";
import { IChatResponseModel } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatService } from "vs/workbench/contrib/chat/common/chatService";
import { ITerminalContribution, ITerminalInstance, ITerminalService, IXtermTerminal } from "vs/workbench/contrib/terminal/browser/terminal";
import { TerminalWidgetManager } from "vs/workbench/contrib/terminal/browser/widgets/widgetManager";
import { ITerminalProcessManager } from "vs/workbench/contrib/terminal/common/terminal";
import { TerminalChatWidget } from "vs/workbench/contrib/terminalContrib/chat/browser/terminalChatWidget";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare class TerminalChatController extends Disposable implements ITerminalContribution {
    private readonly _instance;
    private readonly _terminalService;
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _chatService;
    private readonly _chatCodeBlockContextProviderService;
    private readonly _viewsService;
    private readonly _storageService;
    static readonly ID = "terminal.chat";
    static get(instance: ITerminalInstance): TerminalChatController | null;
    /**
     * Currently focused chat widget. This is used to track action context since 'active terminals'
     * are only tracked for non-detached terminal instanecs.
     */
    static activeChatWidget?: TerminalChatController;
    private static _storageKey;
    private static _promptHistory;
    /**
     * The chat widget for the controller, this is lazy as we don't want to instantiate it until
     * both it's required and xterm is ready.
     */
    private _chatWidget;
    /**
     * The chat widget for the controller, this will be undefined if xterm is not ready yet (ie. the
     * terminal is still initializing).
     */
    get chatWidget(): TerminalChatWidget | undefined;
    private readonly _requestActiveContextKey;
    private readonly _responseContainsCodeBlockContextKey;
    private readonly _responseContainsMulitpleCodeBlocksContextKey;
    private _messages;
    private _lastResponseContent;
    get lastResponseContent(): string | undefined;
    readonly onDidAcceptInput: any;
    get onDidHide(): any;
    private _terminalAgentName;
    private readonly _model;
    get scopedContextKeyService(): IContextKeyService;
    private _sessionCtor;
    private _historyOffset;
    private _historyCandidate;
    private _historyUpdate;
    private _currentRequestId;
    private _activeRequestCts?;
    constructor(_instance: ITerminalInstance, processManager: ITerminalProcessManager, widgetManager: TerminalWidgetManager, _terminalService: ITerminalService, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _chatService: IChatService, _chatCodeBlockContextProviderService: IChatCodeBlockContextProviderService, _viewsService: IViewsService, _storageService: IStorageService);
    xtermReady(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    private _createSession;
    private _forcedPlaceholder;
    private _updatePlaceholder;
    private _getPlaceholderText;
    setPlaceholder(text: string): void;
    resetPlaceholder(): void;
    clear(): void;
    acceptInput(): Promise<IChatResponseModel | undefined>;
    updateInput(text: string, selectAll?: boolean): void;
    getInput(): string;
    focus(): void;
    hasFocus(): boolean;
    populateHistory(up: boolean): void;
    cancel(): void;
    acceptCommand(shouldExecute: boolean): Promise<void>;
    reveal(): Promise<void>;
    viewInChat(): Promise<void>;
}
