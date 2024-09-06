import { Dimension } from "vs/base/browser/dom";
import { Event } from "vs/base/common/event";
import { IMarkdownString } from "vs/base/common/htmlContent";
import "vs/css!./media/inlineChat";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ICodeEditorViewState } from "vs/editor/common/editorCommon";
import { IResolvedTextEditorModel, ITextModelService } from "vs/editor/common/services/resolverService";
import { IAccessibleViewService } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IWorkbenchButtonBarOptions } from "vs/platform/actions/browser/buttonbar";
import { MenuId } from "vs/platform/actions/common/actions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IChatWidgetViewOptions } from "vs/workbench/contrib/chat/browser/chat";
import { ChatWidget, IChatWidgetLocationOptions } from "vs/workbench/contrib/chat/browser/chatWidget";
import { IChatModel } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatService } from "vs/workbench/contrib/chat/common/chatService";
import { HunkInformation, Session } from "vs/workbench/contrib/inlineChat/browser/inlineChatSession";
export interface InlineChatWidgetViewState {
    editorViewState: ICodeEditorViewState;
    input: string;
    placeholder: string;
}
export interface IInlineChatWidgetConstructionOptions {
    /**
     * The menu that rendered as button bar, use for accept, discard etc
     */
    statusMenuId: MenuId | {
        menu: MenuId;
        options: IWorkbenchButtonBarOptions;
    };
    /**
     * The options for the chat widget
     */
    chatWidgetViewOptions?: IChatWidgetViewOptions;
}
export interface IInlineChatMessage {
    message: IMarkdownString;
    requestId: string;
}
export interface IInlineChatMessageAppender {
    appendContent(fragment: string): void;
    cancel(): void;
    complete(): void;
}
export declare class InlineChatWidget {
    protected readonly _instantiationService: IInstantiationService;
    private readonly _contextKeyService;
    private readonly _keybindingService;
    private readonly _accessibilityService;
    private readonly _configurationService;
    private readonly _accessibleViewService;
    protected readonly _textModelResolverService: ITextModelService;
    private readonly _chatService;
    private readonly _hoverService;
    protected readonly _elements: any;
    protected readonly _store: any;
    private readonly _defaultChatModel;
    private readonly _ctxInputEditorFocused;
    private readonly _ctxResponseFocused;
    private readonly _chatWidget;
    protected readonly _onDidChangeHeight: any;
    readonly onDidChangeHeight: Event<void>;
    private readonly _onDidChangeInput;
    readonly onDidChangeInput: Event<this>;
    private _isLayouting;
    readonly scopedContextKeyService: IContextKeyService;
    constructor(location: IChatWidgetLocationOptions, options: IInlineChatWidgetConstructionOptions, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _keybindingService: IKeybindingService, _accessibilityService: IAccessibilityService, _configurationService: IConfigurationService, _accessibleViewService: IAccessibleViewService, _textModelResolverService: ITextModelService, _chatService: IChatService, _hoverService: IHoverService);
    private _updateAriaLabel;
    dispose(): void;
    get domNode(): HTMLElement;
    get chatWidget(): ChatWidget;
    saveState(): void;
    layout(widgetDim: Dimension): void;
    protected _doLayout(dimension: Dimension): void;
    /**
     * The content height of this widget is the size that would require no scrolling
     */
    get contentHeight(): number;
    get minHeight(): number;
    protected _getExtraHeight(): number;
    get value(): string;
    set value(value: string);
    selectAll(includeSlashCommand?: boolean): void;
    set placeholder(value: string);
    toggleStatus(show: boolean): void;
    updateToolbar(show: boolean): void;
    getCodeBlockInfo(codeBlockIndex: number): Promise<IResolvedTextEditorModel | undefined>;
    get responseContent(): string | undefined;
    getChatModel(): IChatModel;
    setChatModel(chatModel: IChatModel): void;
    /**
     * @deprecated use `setChatModel` instead
     */
    updateChatMessage(message: IInlineChatMessage, isIncomplete: true): IInlineChatMessageAppender;
    updateChatMessage(message: IInlineChatMessage | undefined): void;
    updateChatMessage(message: IInlineChatMessage | undefined, isIncomplete?: boolean, isCodeBlockEditable?: boolean): IInlineChatMessageAppender | undefined;
    updateInfo(message: string): void;
    updateStatus(message: string, ops?: {
        classes?: string[];
        resetAfter?: number;
        keepMessage?: boolean;
        title?: string;
    }): void;
    reset(): void;
    focus(): void;
    hasFocus(): any;
}
export declare class EditorBasedInlineChatWidget extends InlineChatWidget {
    private readonly _parentEditor;
    private readonly _accessibleViewer;
    constructor(location: IChatWidgetLocationOptions, _parentEditor: ICodeEditor, options: IInlineChatWidgetConstructionOptions, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, accessibilityService: IAccessibilityService, configurationService: IConfigurationService, accessibleViewService: IAccessibleViewService, textModelResolverService: ITextModelService, chatService: IChatService, hoverService: IHoverService);
    get contentHeight(): number;
    protected _doLayout(dimension: Dimension): void;
    reset(): void;
    showAccessibleHunk(session: Session, hunkData: HunkInformation): void;
}
