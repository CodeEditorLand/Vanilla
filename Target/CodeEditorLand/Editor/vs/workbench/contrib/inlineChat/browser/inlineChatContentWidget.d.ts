import "vs/css!./media/inlineChatContentWidget";
import { Event } from "vs/base/common/event";
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from "vs/editor/browser/editorBrowser";
import { IDimension } from "vs/editor/common/core/dimension";
import { IPosition } from "vs/editor/common/core/position";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { ChatWidget, IChatWidgetLocationOptions } from "vs/workbench/contrib/chat/browser/chatWidget";
import { Session } from "vs/workbench/contrib/inlineChat/browser/inlineChatSession";
export declare class InlineChatContentWidget implements IContentWidget {
    private readonly _editor;
    readonly suppressMouseDown = false;
    readonly allowEditorOverflow = true;
    private readonly _store;
    private readonly _domNode;
    private readonly _inputContainer;
    private readonly _toolbarContainer;
    private _position?;
    private readonly _onDidBlur;
    readonly onDidBlur: Event<void>;
    private _visible;
    private _focusNext;
    private readonly _defaultChatModel;
    private readonly _widget;
    constructor(location: IChatWidgetLocationOptions, _editor: ICodeEditor, instaService: IInstantiationService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, quickInputService: IQuickInputService);
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    beforeRender(): IDimension | null;
    afterRender(): void;
    get chatWidget(): ChatWidget;
    get isVisible(): boolean;
    get value(): string;
    show(position: IPosition, below: boolean): void;
    hide(): void;
    setSession(session: Session): void;
}