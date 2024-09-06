import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { WorkbenchCompressibleAsyncDataTree } from "vs/platform/list/browser/listService";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ChatTreeItem } from "vs/workbench/contrib/chat/browser/chat";
import { IDisposableReference } from "vs/workbench/contrib/chat/browser/chatContentParts/chatCollections";
import { IChatContentPart } from "vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts";
import { IChatProgressRenderableResponseContent } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatResponseProgressFileTreeData } from "vs/workbench/contrib/chat/common/chatService";
export declare class ChatTreeContentPart extends Disposable implements IChatContentPart {
    private readonly openerService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: any;
    readonly onDidFocus: Event<void>;
    private tree;
    constructor(data: IChatResponseProgressFileTreeData, element: ChatTreeItem, treePool: TreePool, treeDataIndex: number, openerService: IOpenerService);
    domFocus(): void;
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
export declare class TreePool extends Disposable {
    private _onDidChangeVisibility;
    private readonly instantiationService;
    private readonly configService;
    private readonly themeService;
    private _pool;
    get inUse(): ReadonlySet<WorkbenchCompressibleAsyncDataTree<IChatResponseProgressFileTreeData, IChatResponseProgressFileTreeData, void>>;
    constructor(_onDidChangeVisibility: Event<boolean>, instantiationService: IInstantiationService, configService: IConfigurationService, themeService: IThemeService);
    private treeFactory;
    get(): IDisposableReference<WorkbenchCompressibleAsyncDataTree<IChatResponseProgressFileTreeData, IChatResponseProgressFileTreeData, void>>;
}
