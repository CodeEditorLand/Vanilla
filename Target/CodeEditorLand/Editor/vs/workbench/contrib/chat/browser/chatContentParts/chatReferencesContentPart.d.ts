import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { WorkbenchList } from "vs/platform/list/browser/listService";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ChatTreeItem } from "vs/workbench/contrib/chat/browser/chat";
import { IDisposableReference } from "vs/workbench/contrib/chat/browser/chatContentParts/chatCollections";
import { IChatContentPart } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { IChatContentReference, IChatWarningMessage } from "vs/workbench/contrib/chat/common/chatService";
import { IChatRendererContent, IChatResponseViewModel } from "vs/workbench/contrib/chat/common/chatViewModel";
export interface IChatReferenceListItem extends IChatContentReference {
    title?: string;
}
export type IChatCollapsibleListItem = IChatReferenceListItem | IChatWarningMessage;
export declare class ChatCollapsibleListContentPart extends Disposable implements IChatContentPart {
    private readonly data;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: any;
    constructor(data: ReadonlyArray<IChatCollapsibleListItem>, labelOverride: string | undefined, element: IChatResponseViewModel, contentReferencesListPool: CollapsibleListPool, openerService: IOpenerService);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    private updateAriaLabel;
    addDisposable(disposable: IDisposable): void;
}
export declare class CollapsibleListPool extends Disposable {
    private _onDidChangeVisibility;
    private readonly instantiationService;
    private readonly themeService;
    private _pool;
    get inUse(): ReadonlySet<WorkbenchList<IChatCollapsibleListItem>>;
    constructor(_onDidChangeVisibility: Event<boolean>, instantiationService: IInstantiationService, themeService: IThemeService);
    private listFactory;
    get(): IDisposableReference<WorkbenchList<IChatCollapsibleListItem>>;
}
