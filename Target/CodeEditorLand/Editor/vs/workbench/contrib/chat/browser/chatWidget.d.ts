import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import "vs/css!./media/chat";
import "vs/css!./media/chatAgentHover";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ChatTreeItem, IChatAccessibilityService, IChatCodeBlockInfo, IChatFileTreeInfo, IChatWidget, IChatWidgetService, IChatWidgetViewContext, IChatWidgetViewOptions } from "vs/workbench/contrib/chat/browser/chat";
import { ChatInputPart } from "vs/workbench/contrib/chat/browser/chatInputPart";
import { ChatAgentLocation, IChatAgentData, IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IChatModel, IChatRequestVariableEntry, IChatResponseModel } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatLocationData, IChatService } from "vs/workbench/contrib/chat/common/chatService";
import { IChatSlashCommandService } from "vs/workbench/contrib/chat/common/chatSlashCommands";
import { ChatViewModel, IChatResponseViewModel } from "vs/workbench/contrib/chat/common/chatViewModel";
export type IChatInputState = Record<string, any>;
export interface IChatViewState {
    inputValue?: string;
    inputState?: IChatInputState;
}
export interface IChatWidgetStyles {
    listForeground: string;
    listBackground: string;
    inputEditorBackground: string;
    resultEditorBackground: string;
}
export interface IChatWidgetContrib extends IDisposable {
    readonly id: string;
    /**
     * A piece of state which is related to the input editor of the chat widget
     */
    getInputState?(): any;
    /**
     * Called with the result of getInputState when navigating input history.
     */
    setInputState?(s: any): void;
}
export interface IChatWidgetLocationOptions {
    location: ChatAgentLocation;
    resolveData?(): IChatLocationData | undefined;
}
export declare function isQuickChat(widget: IChatWidget): boolean;
export declare class ChatWidget extends Disposable implements IChatWidget {
    private readonly viewOptions;
    private readonly styles;
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly chatService;
    private readonly chatAgentService;
    private readonly contextMenuService;
    private readonly chatAccessibilityService;
    private readonly logService;
    private readonly themeService;
    private readonly chatSlashCommandService;
    static readonly CONTRIBS: {
        new (...args: [IChatWidget, ...any]): IChatWidgetContrib;
    }[];
    private readonly _onDidSubmitAgent;
    readonly onDidSubmitAgent: any;
    private _onDidChangeAgent;
    readonly onDidChangeAgent: any;
    private _onDidFocus;
    readonly onDidFocus: any;
    private _onDidChangeViewModel;
    readonly onDidChangeViewModel: any;
    private _onDidScroll;
    readonly onDidScroll: any;
    private _onDidClear;
    readonly onDidClear: any;
    private _onDidAcceptInput;
    readonly onDidAcceptInput: any;
    private _onDidChangeContext;
    readonly onDidChangeContext: any;
    private _onDidHide;
    readonly onDidHide: any;
    private _onDidChangeParsedInput;
    readonly onDidChangeParsedInput: any;
    private readonly _onWillMaybeChangeHeight;
    readonly onWillMaybeChangeHeight: Event<void>;
    private _onDidChangeHeight;
    readonly onDidChangeHeight: any;
    private readonly _onDidChangeContentHeight;
    readonly onDidChangeContentHeight: Event<void>;
    private contribs;
    private tree;
    private renderer;
    private readonly _codeBlockModelCollection;
    private inputPart;
    private editorOptions;
    private listContainer;
    private container;
    private bodyDimension;
    private visibleChangeCount;
    private requestInProgress;
    private agentInInput;
    private _visible;
    get visible(): boolean;
    private previousTreeScrollHeight;
    private readonly viewModelDisposables;
    private _viewModel;
    private set viewModel(value);
    get viewModel(): ChatViewModel | undefined;
    private parsedChatRequest;
    get parsedInput(): any;
    get scopedContextKeyService(): IContextKeyService;
    private readonly _location;
    get location(): ChatAgentLocation;
    readonly viewContext: IChatWidgetViewContext;
    constructor(location: ChatAgentLocation | IChatWidgetLocationOptions, _viewContext: IChatWidgetViewContext | undefined, viewOptions: IChatWidgetViewOptions, styles: IChatWidgetStyles, codeEditorService: ICodeEditorService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, chatService: IChatService, chatAgentService: IChatAgentService, chatWidgetService: IChatWidgetService, contextMenuService: IContextMenuService, chatAccessibilityService: IChatAccessibilityService, logService: ILogService, themeService: IThemeService, chatSlashCommandService: IChatSlashCommandService);
    private _lastSelectedAgent;
    set lastSelectedAgent(agent: IChatAgentData | undefined);
    get lastSelectedAgent(): IChatAgentData | undefined;
    get supportsFileReferences(): boolean;
    get input(): ChatInputPart;
    get inputEditor(): ICodeEditor;
    get inputUri(): URI;
    get contentHeight(): number;
    render(parent: HTMLElement): void;
    getContrib<T extends IChatWidgetContrib>(id: string): T | undefined;
    focusInput(): void;
    hasInputFocus(): boolean;
    getSibling(item: ChatTreeItem, type: "next" | "previous"): ChatTreeItem | undefined;
    clear(): void;
    private onDidChangeItems;
    private renderFollowups;
    setVisible(visible: boolean): void;
    private createList;
    private onContextMenu;
    private onDidChangeTreeContentHeight;
    private createInput;
    private onDidStyleChange;
    setModel(model: IChatModel, viewState: IChatViewState): void;
    getFocus(): ChatTreeItem | undefined;
    reveal(item: ChatTreeItem, relativeTop?: number): void;
    focus(item: ChatTreeItem): void;
    refilter(): void;
    setInputPlaceholder(placeholder: string): void;
    resetInputPlaceholder(): void;
    setInput(value?: string): void;
    getInput(): string;
    logInputHistory(): void;
    acceptInput(query?: string): Promise<IChatResponseModel | undefined>;
    acceptInputWithPrefix(prefix: string): Promise<void>;
    private collectInputState;
    private _acceptInput;
    setContext(overwrite: boolean, ...contentReferences: IChatRequestVariableEntry[]): void;
    getCodeBlockInfosForResponse(response: IChatResponseViewModel): IChatCodeBlockInfo[];
    getCodeBlockInfoForEditor(uri: URI): IChatCodeBlockInfo | undefined;
    getFileTreeInfosForResponse(response: IChatResponseViewModel): IChatFileTreeInfo[];
    getLastFocusedFileTreeForResponse(response: IChatResponseViewModel): IChatFileTreeInfo | undefined;
    focusLastMessage(): void;
    layout(height: number, width: number): void;
    private _dynamicMessageLayoutData?;
    setDynamicChatTreeItemLayout(numOfChatTreeItems: number, maxHeight: number): void;
    updateDynamicChatTreeItemLayout(numOfChatTreeItems: number, maxHeight: number): void;
    get isDynamicChatTreeItemLayoutEnabled(): boolean;
    set isDynamicChatTreeItemLayoutEnabled(value: boolean);
    layoutDynamicChatTreeItemMode(): void;
    saveState(): void;
    getViewState(): IChatViewState;
}
export declare class ChatWidgetService implements IChatWidgetService {
    readonly _serviceBrand: undefined;
    private _widgets;
    private _lastFocusedWidget;
    get lastFocusedWidget(): ChatWidget | undefined;
    constructor();
    getWidgetByInputUri(uri: URI): ChatWidget | undefined;
    getWidgetBySessionId(sessionId: string): ChatWidget | undefined;
    private setLastFocusedWidget;
    register(newWidget: ChatWidget): IDisposable;
}
