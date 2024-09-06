import { Event } from "../../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../../base/common/lifecycle.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { WorkbenchList } from "../../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { IChatContentReference, IChatWarningMessage } from "../../common/chatService.js";
import { IChatRendererContent, IChatResponseViewModel } from "../../common/chatViewModel.js";
import { ChatTreeItem } from "../chat.js";
import { IDisposableReference } from "./chatCollections.js";
import { IChatContentPart } from "./chatContentParts.js";
export interface IChatReferenceListItem extends IChatContentReference {
    title?: string;
}
export type IChatCollapsibleListItem = IChatReferenceListItem | IChatWarningMessage;
export declare class ChatCollapsibleListContentPart extends Disposable implements IChatContentPart {
    private readonly data;
    private readonly contextMenuService;
    private readonly clipboardService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    constructor(data: ReadonlyArray<IChatCollapsibleListItem>, labelOverride: string | undefined, element: IChatResponseViewModel, contentReferencesListPool: CollapsibleListPool, openerService: IOpenerService, contextMenuService: IContextMenuService, clipboardService: IClipboardService);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    private updateAriaLabel;
    addDisposable(disposable: IDisposable): void;
}
export declare class CollapsibleListPool extends Disposable {
    private _onDidChangeVisibility;
    private readonly instantiationService;
    private readonly themeService;
    private readonly labelService;
    private _pool;
    get inUse(): ReadonlySet<WorkbenchList<IChatCollapsibleListItem>>;
    constructor(_onDidChangeVisibility: Event<boolean>, instantiationService: IInstantiationService, themeService: IThemeService, labelService: ILabelService);
    private listFactory;
    get(): IDisposableReference<WorkbenchList<IChatCollapsibleListItem>>;
}
