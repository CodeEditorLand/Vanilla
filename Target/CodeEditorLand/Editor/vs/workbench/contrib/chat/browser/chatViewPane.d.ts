import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILogService } from "vs/platform/log/common/log";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IViewPaneOptions, ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { IChatViewTitleActionContext } from "vs/workbench/contrib/chat/browser/actions/chatActions";
import { ChatWidget } from "vs/workbench/contrib/chat/browser/chatWidget";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IChatService } from "vs/workbench/contrib/chat/common/chatService";
export declare const CHAT_SIDEBAR_PANEL_ID = "workbench.panel.chatSidebar";
export declare class ChatViewPane extends ViewPane {
    private readonly storageService;
    private readonly chatService;
    private readonly chatAgentService;
    private readonly logService;
    private _widget;
    get widget(): ChatWidget;
    private readonly modelDisposables;
    private memento;
    private readonly viewState;
    private didProviderRegistrationFail;
    private didUnregisterProvider;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, storageService: IStorageService, chatService: IChatService, chatAgentService: IChatAgentService, logService: ILogService);
    getActionsContext(): IChatViewTitleActionContext;
    private updateModel;
    shouldShowWelcome(): boolean;
    private getSessionId;
    protected renderBody(parent: HTMLElement): void;
    acceptInput(query?: string): void;
    private clear;
    loadSession(sessionId: string): void;
    focusInput(): void;
    focus(): void;
    protected layoutBody(height: number, width: number): void;
    saveState(): void;
    private updateViewState;
}
