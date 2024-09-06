import { IListVirtualDelegate } from "vs/base/browser/ui/list/list";
import { ITreeNode, ITreeRenderer } from "vs/base/browser/ui/tree/tree";
import { Event } from "vs/base/common/event";
import { FuzzyScore } from "vs/base/common/filters";
import { Disposable, DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { MenuWorkbenchToolBar } from "vs/platform/actions/browser/toolbar";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ChatTreeItem, IChatCodeBlockInfo, IChatFileTreeInfo, IChatListItemRendererOptions } from "vs/workbench/contrib/chat/browser/chat";
import { ChatAgentHover } from "vs/workbench/contrib/chat/browser/chatAgentHover";
import { IChatContentPart } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { ChatEditorOptions } from "vs/workbench/contrib/chat/browser/chatOptions";
import { CodeBlockPart } from "vs/workbench/contrib/chat/browser/codeBlockPart";
import { ChatAgentLocation } from "vs/workbench/contrib/chat/common/chatAgents";
import { IChatFollowup } from "vs/workbench/contrib/chat/common/chatService";
import { IChatResponseViewModel } from "vs/workbench/contrib/chat/common/chatViewModel";
import { CodeBlockModelCollection } from "../common/codeBlockModelCollection";
interface IChatListItemTemplate {
    currentElement?: ChatTreeItem;
    renderedParts?: IChatContentPart[];
    readonly rowContainer: HTMLElement;
    readonly titleToolbar?: MenuWorkbenchToolBar;
    readonly avatarContainer: HTMLElement;
    readonly username: HTMLElement;
    readonly detail: HTMLElement;
    readonly value: HTMLElement;
    readonly contextKeyService: IContextKeyService;
    readonly instantiationService: IInstantiationService;
    readonly templateDisposables: IDisposable;
    readonly elementDisposables: DisposableStore;
    readonly agentHover: ChatAgentHover;
}
interface IItemHeightChangeParams {
    element: ChatTreeItem;
    height: number;
}
export interface IChatRendererDelegate {
    getListLength(): number;
    readonly onDidScroll?: Event<void>;
}
export declare class ChatListItemRenderer extends Disposable implements ITreeRenderer<ChatTreeItem, FuzzyScore, IChatListItemTemplate> {
    private readonly location;
    private readonly rendererOptions;
    private readonly delegate;
    private readonly codeBlockModelCollection;
    private readonly instantiationService;
    private readonly logService;
    private readonly contextKeyService;
    private readonly themeService;
    private readonly commandService;
    private readonly hoverService;
    static readonly ID = "item";
    private readonly codeBlocksByResponseId;
    private readonly codeBlocksByEditorUri;
    private readonly fileTreesByResponseId;
    private readonly focusedFileTreesByResponseId;
    private readonly renderer;
    private readonly markdownDecorationsRenderer;
    protected readonly _onDidClickFollowup: any;
    readonly onDidClickFollowup: Event<IChatFollowup>;
    private readonly _onDidClickRerunWithAgentOrCommandDetection;
    readonly onDidClickRerunWithAgentOrCommandDetection: Event<IChatResponseViewModel>;
    protected readonly _onDidChangeItemHeight: any;
    readonly onDidChangeItemHeight: Event<IItemHeightChangeParams>;
    private readonly _editorPool;
    private readonly _diffEditorPool;
    private readonly _treePool;
    private readonly _contentReferencesListPool;
    private _currentLayoutWidth;
    private _isVisible;
    private _onDidChangeVisibility;
    constructor(editorOptions: ChatEditorOptions, location: ChatAgentLocation, rendererOptions: IChatListItemRendererOptions, delegate: IChatRendererDelegate, codeBlockModelCollection: CodeBlockModelCollection, overflowWidgetsDomNode: HTMLElement | undefined, instantiationService: IInstantiationService, configService: IConfigurationService, logService: ILogService, contextKeyService: IContextKeyService, themeService: IThemeService, commandService: ICommandService, hoverService: IHoverService);
    get templateId(): string;
    editorsInUse(): Iterable<CodeBlockPart>;
    private traceLayout;
    /**
     * Compute a rate to render at in words/s.
     */
    private getProgressiveRenderRate;
    getCodeBlockInfosForResponse(response: IChatResponseViewModel): IChatCodeBlockInfo[];
    getCodeBlockInfoForEditor(uri: URI): IChatCodeBlockInfo | undefined;
    getFileTreeInfosForResponse(response: IChatResponseViewModel): IChatFileTreeInfo[];
    getLastFocusedFileTreeForResponse(response: IChatResponseViewModel): IChatFileTreeInfo | undefined;
    setVisible(visible: boolean): void;
    layout(width: number): void;
    renderTemplate(container: HTMLElement): IChatListItemTemplate;
    renderElement(node: ITreeNode<ChatTreeItem, FuzzyScore>, index: number, templateData: IChatListItemTemplate): void;
    renderChatTreeItem(element: ChatTreeItem, index: number, templateData: IChatListItemTemplate): void;
    private renderDetail;
    private _renderDetail;
    private renderConfirmationAction;
    private renderAvatar;
    private getAgentIcon;
    private basicRenderElement;
    private updateItemHeight;
    private renderWelcomeMessage;
    /**
     *	@returns true if progressive rendering should be considered complete- the element's data is fully rendered or the view is not visible
     */
    private doNextProgressiveRender;
    private renderChatContentDiff;
    /**
     * Returns all content parts that should be rendered, and trimmed markdown content. We will diff this with the current rendered set.
     */
    private getNextProgressiveRenderContent;
    private getDataForProgressiveRender;
    private diff;
    private renderChatContentPart;
    private renderTreeData;
    private renderContentReferencesListData;
    private renderCodeCitationsListData;
    private renderProgressTask;
    private renderConfirmation;
    private renderAttachments;
    private renderTextEdit;
    private renderMarkdown;
    disposeElement(node: ITreeNode<ChatTreeItem, FuzzyScore>, index: number, templateData: IChatListItemTemplate): void;
    disposeTemplate(templateData: IChatListItemTemplate): void;
}
export declare class ChatListDelegate implements IListVirtualDelegate<ChatTreeItem> {
    private readonly defaultElementHeight;
    private readonly logService;
    constructor(defaultElementHeight: number, logService: ILogService);
    private _traceLayout;
    getHeight(element: ChatTreeItem): number;
    getTemplateId(element: ChatTreeItem): string;
    hasDynamicHeight(element: ChatTreeItem): boolean;
}
export {};
